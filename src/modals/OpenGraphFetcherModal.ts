import { Modal, App, TFile } from 'obsidian';
import { OpenGraphService, OpenGraphServiceError } from '../services/openGraphService';
import { PluginSettings, OpenGraphData } from '../types/open-graph-service';
import { Plugin } from 'obsidian';

declare class OpenGraphPlugin extends Plugin {
  settings: PluginSettings;
}

interface ModalOptions {
  overwriteExisting: boolean;
  createNew: boolean;
  writeErrors: boolean;
  updateFetchDate: boolean;
  batchDelay: number;
}

export class OpenGraphFetcherModal extends Modal {
  private settings: PluginSettings;
  private service: OpenGraphService;
  private options: ModalOptions;
  private statusEl: HTMLElement | null = null;
  private progressBar: HTMLProgressElement | null = null;
  private batch: string[] = [];
  private currentBatchIndex: number = 0;
  private totalUrls: number = 0;
  private processing: boolean = false;
  private batchDelay: number = 1000;

  private async findFileForUrl(url: string): Promise<TFile | null> {
    try {
      const files = this.app.vault.getMarkdownFiles();
      for (const file of files) {
        const content = await this.app.vault.read(file);
        if (content.includes(url)) {
          return file;
        }
      }
      return null;
    } catch (error) {
      console.error('Error finding file:', error);
      return null;
    }
  }

  private async createFileForUrl(url: string): Promise<TFile> {
    try {
      const fileName = this.sanitizeUrlForFileName(url);
      const path = `open-graph/${fileName}.md`;
      return await this.app.vault.create(path, `---\nurl: ${url}\n---\n`);
    } catch (error) {
      console.error('Error creating file:', error);
      throw new OpenGraphServiceError(
        `Failed to create file for ${url}`,
        'FILE_CREATION_FAILURE'
      );
    }
  }

  private sanitizeUrlForFileName(url: string): string {
    return url.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  }

  private async readFileData(file: TFile): Promise<OpenGraphData | null> {
    try {
      const content = await this.app.vault.read(file);
      if (!content) {
        return null;
      }
      const frontmatter = this.extractFrontmatter(content);
      return frontmatter || null;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

  private extractFrontmatter(content: string): OpenGraphData | null {
    if (!content) {
      return null;
    }
    const match = content.match(/---\n(.*?)\n---/s);
    if (!match || !match[1]) return null;
    try {
      const frontmatter = JSON.parse(match[1]);
      // Ensure all required properties exist
      return {
        title: String(frontmatter.title) || '',
        description: String(frontmatter.description) || '',
        image: typeof frontmatter.image === 'string' ? frontmatter.image : null,
        url: String(frontmatter.url) || '',
        type: String(frontmatter.type) || 'website',
        site_name: String(frontmatter.site_name) || '',
        error: typeof frontmatter.error === 'string' ? frontmatter.error : undefined,
        date: typeof frontmatter.date === 'string' ? frontmatter.date : undefined
      } as OpenGraphData;
    } catch (error) {
      console.error('Error parsing frontmatter:', error);
      return null;
    }
  }

  private async writeFileData(file: TFile, data: OpenGraphData): Promise<void> {
    try {
      let content = await this.app.vault.read(file);
      const frontmatter = this.extractFrontmatter(content);
      
      const newFrontmatter = `---\n${JSON.stringify(data, null, 2)}\n---\n`;
      
      if (frontmatter) {
        content = content.replace(/---\n(.*?)\n---/s, newFrontmatter);
      } else {
        content = `${newFrontmatter}\n${content}`;
      }
      
      await this.app.vault.modify(file, content);
    } catch (error) {
      console.error('Error writing file:', error);
      throw new OpenGraphServiceError(
        `Failed to write file data`,
        'FILE_WRITE_FAILURE'
      );
    }
  }

  private async writeErrorToFile(url: string, error: OpenGraphServiceError): Promise<void> {
    try {
      const errorData: OpenGraphData = {
        title: 'Error',
        description: error.message,
        image: null,
        url: url,
        type: 'error',
        site_name: 'OpenGraph Fetcher Error',
        date: new Date().toISOString()
      };

      const errorFile = await this.createErrorFile(url);
      if (!errorFile) {
        throw new OpenGraphServiceError(
          `Failed to create error file for ${url}`,
          'ERROR_FILE_CREATION_FAILURE'
        );
      }
      await this.writeFileData(errorFile, errorData);
    } catch (writeError) {
      console.error('Failed to write error to file:', writeError);
      throw new OpenGraphServiceError(
        `Failed to write error file for ${url}`,
        'ERROR_FILE_FAILURE'
      );
    }
  }

  private async createErrorFile(url: string): Promise<TFile | null> {
    try {
      const fileName = this.sanitizeUrlForFileName(url);
      const path = `open-graph/errors/${fileName}.md`;
      return await this.app.vault.create(path, `---\nurl: ${url}\n---\n`);
    } catch (error) {
      console.error('Error creating error file:', error);
      return null;
    }
  }

  constructor(app: App, plugin: OpenGraphPlugin) {
    super(app);
    this.settings = plugin.settings;
    this.service = new OpenGraphService(this.settings);
    this.options = {
      overwriteExisting: false,
      createNew: true,
      writeErrors: true,
      updateFetchDate: true,
      batchDelay: this.settings.rateLimit || 1000
    } as ModalOptions;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    // Create UI elements
    contentEl.createEl('h2', { text: 'OpenGraph Fetcher' });

    // Create options container
    const optionsContainer = contentEl.createDiv({ cls: 'open-graph-options' });
    
    const createCheckboxOption = (labelText: string, optionKey: keyof ModalOptions) => {
      const label = optionsContainer.createEl('label');
      label.setText(labelText);
      const checkbox = label.createEl('input', { attr: { type: 'checkbox' } });
      checkbox.checked = this.options[optionKey] as boolean;
      checkbox.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.options = {
          ...this.options,
          [optionKey]: target.checked
        };
      };
    };

    createCheckboxOption('Overwrite Existing', 'overwriteExisting');
    createCheckboxOption('Create New Files', 'createNew');
    createCheckboxOption('Write Errors', 'writeErrors');
    createCheckboxOption('Update Fetch Date', 'updateFetchDate');

    // Create progress container
    const progressContainer = contentEl.createDiv({ cls: 'open-graph-progress' });
    this.progressBar = progressContainer.createEl('progress', { attr: { max: '100' } });
    if (this.progressBar instanceof HTMLProgressElement) {
      this.progressBar.value = 0;
    }

    // Create status container
    this.statusEl = contentEl.createDiv({ cls: 'open-graph-status' });
    this.statusEl.setText('Ready to fetch URLs');

    // Create buttons
    const buttonContainer = contentEl.createDiv({ cls: 'open-graph-buttons' });
    
    const fetchButton = buttonContainer.createEl('button');
    fetchButton.setText('Fetch URLs');
    fetchButton.onclick = () => {
      this.fetchMetadata();
    };
    
    const cancelButton = buttonContainer.createEl('button');
    cancelButton.setText('Cancel');
    cancelButton.onclick = () => {
      this.close();
    };

    // Set modal width
    const modalContainer = contentEl.closest('.modal-container') as HTMLElement;
    const modalContent = contentEl.closest('.modal-content') as HTMLElement;
    
    if (modalContainer && modalContent) {
      modalContainer.style.width = '80vw';
      modalContent.style.maxWidth = 'none';
    }
    
    contentEl.addClass('open-graph-fetcher-modal');
  }

  onClose(): void {
    this.clearEventListeners();
    this.processing = false;
    this.batch = [];
    this.currentBatchIndex = 0;
  }

  private async fetchMetadata(): Promise<void> {
    if (this.processing) return;

    this.processing = true;
    this.statusEl?.setText('Fetching URLs...');
    this.batch = await this.findUrlsInVault();
    this.totalUrls = this.batch.length;
    this.currentBatchIndex = 0;
    
    if (this.totalUrls === 0) {
      this.statusEl?.setText('No URLs found in vault');
      this.processing = false;
      return;
    }

    this.statusEl?.setText(`Found ${this.totalUrls} URLs to process`);
    await this.processBatch();
  }

  private async findUrlsInVault(): Promise<string[]> {
    const urls: string[] = [];
    // Implementation to find URLs in vault files
    // This should be implemented based on your specific requirements
    return urls;
  }

  private async processBatch(): Promise<void> {
    for (const url of this.batch) {
      if (!this.processing) break;

      try {
        const data = await this.service.fetchMetadata(url, this.settings);
        await this.processMetadata(url, data);
        this.currentBatchIndex++;
        this.updateProgress();
        await new Promise(resolve => setTimeout(resolve, this.batchDelay));
      } catch (error: unknown) {
        if (error instanceof OpenGraphServiceError) {
          if (this.options.writeErrors) {
            await this.writeErrorToFile(url, error);
          }
          this.statusEl?.setText(`Error processing ${url}: ${error.message}`);
        } else {
          console.error('Unexpected error:', error);
          this.statusEl?.setText('Unexpected error occurred');
        }
      }
    }

    this.processing = false;
    this.statusEl?.setText('Finished processing URLs');
  }

  private async processMetadata(url: string, data: OpenGraphData): Promise<void> {
    try {
      const file = await this.findFileForUrl(url);
      if (!file) {
        if (!this.options.createNew) {
          return;
        }
        const newFile = await this.createFileForUrl(url);
        if (!newFile) {
          throw new OpenGraphServiceError(
            `Failed to create file for ${url}`,
            'FILE_CREATION_FAILURE'
          );
        }
        await this.writeFileData(newFile, data);
        this.statusEl?.setText(`Successfully processed ${url}`);
      } else {
        const existingData = await this.readFileData(file);
        if (existingData && !this.options.overwriteExisting) {
          return;
        }
        await this.writeFileData(file, data);
        this.statusEl?.setText(`Successfully updated ${url}`);
      }
    } catch (error: unknown) {
      console.error('Error processing metadata:', error);
      if (error instanceof OpenGraphServiceError) {
        throw error;
      }
      throw new OpenGraphServiceError(
        `Failed to process metadata for ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'METADATA_PROCESSING_FAILURE'
      );
    }
  }

  private updateProgress(): void {
    if (!this.progressBar || !this.statusEl) return;

    const progress = Math.round((this.currentBatchIndex / this.totalUrls) * 100);
    this.progressBar.querySelector('.progress-fill')?.setAttribute('style', `width: ${progress}%`);
    this.statusEl.setText(`Processing ${this.currentBatchIndex}/${this.totalUrls} URLs (${progress}%)`);
  }



  private clearEventListeners(): void {
    // Clear any event listeners that need cleanup
  }
}