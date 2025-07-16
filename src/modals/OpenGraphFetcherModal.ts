import { Modal, App } from 'obsidian';
import { OpenGraphService, OpenGraphServiceError } from '../services/openGraphService';
import { PluginSettings, OpenGraphData } from '../types/open-graph-service';
import { extractFrontmatter, formatFrontmatter } from '../utils/yamlFrontmatter';
import '../styles/open-graph-fetcher.css';

interface ModalOptions {
  overwriteExisting: boolean;
  createNewProperties: boolean;
  writeErrors: boolean;
  updateFetchDate: boolean;
  batchDelay: number;
}

interface OpenGraphPlugin {
  settings: PluginSettings;
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

















  constructor(app: App, plugin: OpenGraphPlugin) {
    super(app);
    this.settings = plugin.settings;
    this.service = new OpenGraphService(this.settings);
    this.options = {
      overwriteExisting: false,
      createNewProperties: true,
      writeErrors: true,
      updateFetchDate: true,
      batchDelay: this.settings.rateLimit || 1000
    } as ModalOptions;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('opengraph-fetcher-modal');
    
    // Create header
    const header = contentEl.createDiv('opengraph-header');
    header.createEl('h2', { text: 'OpenGraph Fetcher', cls: 'opengraph-title' });

    // Create options section with table layout
    const optionsContainer = contentEl.createDiv('opengraph-options-container');
    const optionsTable = optionsContainer.createEl('table', { cls: 'opengraph-options-table' });
    
    const createCheckboxOption = (labelText: string, optionKey: keyof ModalOptions) => {
      const row = optionsTable.createEl('tr', { cls: 'opengraph-option-row' });
      const checkboxCell = row.createEl('td', { cls: 'opengraph-checkbox-cell' });
      const labelCell = row.createEl('td', { cls: 'opengraph-label-cell' });
      
      const checkbox = checkboxCell.createEl('input', { 
        type: 'checkbox',
        cls: 'opengraph-checkbox'
      });
      checkbox.checked = this.options[optionKey] as boolean;
      checkbox.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        (this.options[optionKey] as boolean) = target.checked;
      };
      
      const label = labelCell.createEl('label', { 
        text: labelText,
        cls: 'opengraph-option-label'
      });
      label.setAttribute('for', optionKey);
      checkbox.id = optionKey;
    };

    createCheckboxOption('Overwrite Existing', 'overwriteExisting');
    createCheckboxOption('Create new YAML properties if none exists?', 'createNewProperties');
    createCheckboxOption('Write Errors', 'writeErrors');
    createCheckboxOption('Update Fetch Date', 'updateFetchDate');

    // Batch delay slider
    const delayContainer = contentEl.createDiv('opengraph-delay-container');
    delayContainer.createEl('label', { 
      text: 'Batch Delay (ms):',
      cls: 'opengraph-delay-label'
    });
    const delaySlider = delayContainer.createEl('input', { 
      type: 'range',
      cls: 'opengraph-delay-slider'
    });
    delaySlider.min = '100';
    delaySlider.max = '5000';
    delaySlider.value = this.options.batchDelay.toString();
    const delayValue = delayContainer.createEl('span', { 
      text: this.options.batchDelay.toString(),
      cls: 'opengraph-delay-value'
    });
    delaySlider.oninput = () => {
      this.options.batchDelay = parseInt(delaySlider.value);
      delayValue.textContent = delaySlider.value;
    };

    // Status and progress
    this.statusEl = contentEl.createDiv('opengraph-status');
    this.statusEl.setText('Ready to fetch metadata');
    
    this.progressBar = contentEl.createEl('progress') as HTMLProgressElement;
    this.progressBar.addClass('opengraph-progress');
    this.progressBar.max = 100;
    this.progressBar.value = 0;

    // Buttons with Obsidian styling
    const buttonContainer = contentEl.createDiv('opengraph-button-container');
    const fetchButton = buttonContainer.createEl('button', { 
      text: 'Fetch URLs',
      cls: 'mod-cta opengraph-fetch-btn'
    });
    fetchButton.onclick = () => {
      this.fetchMetadata();
    };
    
    const cancelButton = buttonContainer.createEl('button', { 
      text: 'Cancel',
      cls: 'mod-cta-outline opengraph-cancel-btn'
    });
    cancelButton.onclick = () => {
      this.close();
    };
    
    // CSS styles are imported at the top of the file
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
    this.statusEl?.setText('Extracting URL from current file...');
    
    // Get the currently active file
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      this.statusEl?.setText('No active file found');
      this.processing = false;
      return;
    }

    // Extract URL from current file's frontmatter
    const url = await this.service.extractUrlFromCurrentFile(this.app, activeFile);
    if (!url) {
      this.statusEl?.setText('No URL found in current file\'s frontmatter');
      this.processing = false;
      return;
    }

    this.batch = [url];
    this.totalUrls = 1;
    this.currentBatchIndex = 0;
    
    this.statusEl?.setText(`Processing URL: ${url}`);
    await this.processBatch();
  }



  private updateProgress(): void {
    if (!this.progressBar || !this.statusEl) return;

    const progress = Math.round((this.currentBatchIndex / this.totalUrls) * 100);
    if (this.progressBar instanceof HTMLProgressElement) {
      this.progressBar.value = progress;
    }
    this.statusEl?.setText(`Processing ${this.currentBatchIndex}/${this.totalUrls} URLs (${progress}%)`);
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
          this.statusEl?.setText(`Error processing ${url}: ${error.message}`);
        } else {
          console.error('Unexpected error:', error);
          this.statusEl?.setText('Unexpected error occurred');
        }
      }
    }
  }

  private clearEventListeners(): void {
    // Clear any event listeners that need cleanup
    // In this case, we don't have any specific event listeners to clear
    // This method is required by the parent Modal class
  }

  private async processMetadata(url: string, data: OpenGraphData): Promise<void> {
    try {
      // Get the currently active file
      const file = this.app.workspace.getActiveFile();
      if (!file) {
        throw new OpenGraphServiceError('No active file found', 'NO_ACTIVE_FILE');
      }

      // Read file content
      const content = await this.app.vault.read(file);

      // Extract existing frontmatter
      const existingFrontmatter = extractFrontmatter(content);
      const frontmatterObject: Record<string, any> = existingFrontmatter || {};

      // Update with new OpenGraph data
      if (this.options.createNewProperties || !frontmatterObject.url) {
        frontmatterObject.url = url;
        frontmatterObject.title = data.title || '';
        frontmatterObject.description = data.description || '';
        frontmatterObject.image = data.image || null;
        if (this.options.updateFetchDate) {
          frontmatterObject.fetchDate = new Date().toISOString();
        }
      }

      // Format and update frontmatter
      const newFrontmatter = formatFrontmatter(frontmatterObject);
      
      // Get current content
      const currentContent = await this.app.vault.read(file);
      
      // Replace or add frontmatter
      const newContent = currentContent.replace(/---\n(.*?)\n---/s, `---\n${newFrontmatter}\n---`);
      
      // If no frontmatter was found, add it at the start
      const finalContent = newContent.startsWith('---') ? newContent : `---\n${newFrontmatter}\n---\n${newContent}`;
      
      await this.app.vault.modify(file, finalContent);
      
      this.statusEl?.setText(`Successfully updated ${url}`);
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


}