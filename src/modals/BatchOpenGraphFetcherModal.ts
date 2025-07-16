import { Modal, App, TFile } from 'obsidian';
import { OpenGraphService, OpenGraphServiceError } from '../services/openGraphService';
import { DirectoryScanner, FileInfo } from '../services/directoryScanner';
import { PluginSettings } from '../types/open-graph-service';
import { BatchOptions, BatchProgress, ProcessingResult } from '../types/batch-processing';
import { extractFrontmatter, formatFrontmatter } from '../utils/yamlFrontmatter';

// Type helper for DOM elements
type ObsidianHTMLElement = HTMLElement & {
  createEl: <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options?: Partial<HTMLElementTagNameMap[K]>,
    callback?: (el: HTMLElementTagNameMap[K]) => void
  ) => HTMLElementTagNameMap[K];
  setText: (text: string) => void;
  addClass: (cls: string) => void;
  toggleClass: (cls: string, condition: boolean) => void;
  find: (selector: string) => HTMLElement | null;
  findAll: (selector: string) => HTMLElement[];
  empty: () => void;
  closest: (selector: string) => HTMLElement | null;
};

interface OpenGraphPlugin {
  settings: PluginSettings;
}

export class BatchOpenGraphFetcherModal extends Modal {
  private settings: PluginSettings;
  private service: OpenGraphService;
  private scanner: DirectoryScanner;
  private targetDirectory: string = '';
  private eligibleFiles: FileInfo[] = [];
  private selectedFiles: Set<string> = new Set();
  private options: BatchOptions;
  private progress: BatchProgress;
  
  // UI Elements
  private directoryEl: HTMLElement | null = null;
  private fileListEl: HTMLElement | null = null;
  private progressEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private progressBar: HTMLProgressElement | null = null;
  private processButton: HTMLButtonElement | null = null;
  private cancelButton: HTMLButtonElement | null = null;

  constructor(app: App, plugin: OpenGraphPlugin) {
    super(app);
    this.settings = plugin.settings;
    this.service = new OpenGraphService(this.settings);
    this.scanner = new DirectoryScanner(this.app.vault, this.app);
    
    this.options = {
      overwriteExisting: false,
      createNewProperties: true,
      writeErrors: true,
      updateFetchDate: true,
      skipExistingData: true,
      batchDelay: 1000
    };

    this.progress = {
      currentFileIndex: 0,
      totalFiles: 0,
      successCount: 0,
      errorCount: 0,
      currentFileName: '',
      isProcessing: false,
      isPaused: false
    };
  }

  async onOpen(): Promise<void> {
    const contentEl = this.contentEl as unknown as ObsidianHTMLElement;
    contentEl.empty();
    contentEl.addClass('batch-opengraph-fetcher-modal');
    this.containerEl.addClass('batch-opengraph-fetcher-modal');
    
    await this.createHeader(contentEl);
    await this.createDirectorySection(contentEl);
    await this.createFileListSection(contentEl);
    this.createOptionsSection(contentEl);
    this.createProgressSection(contentEl);
    this.createButtonSection(contentEl);
    
    // Initial directory scan
    if (this.targetDirectory) {
      await this.scanCurrentDirectory();
    }
  }

  onClose(): void {
    this.progress.isProcessing = false;
  }

  private async createHeader(contentEl: ObsidianHTMLElement): Promise<void> {
    const header = contentEl.createDiv('batch-opengraph-header');
    header.createEl('h2', { 
      text: 'Batch OpenGraph Fetcher', 
      cls: 'batch-opengraph-title' 
    });
    header.createEl('p', { 
      text: 'Process multiple files with missing OpenGraph data in the target directory.',
      cls: 'batch-opengraph-description'
    });
  }

  private async createDirectorySection(contentEl: ObsidianHTMLElement): Promise<void> {
    const section = contentEl.createDiv('batch-directory-section');
    section.createEl('h3', { text: 'Target Directory' });
    
    this.directoryEl = section.createDiv('batch-directory-info');
    
    const refreshButton = section.createEl('button', { 
      text: 'Refresh Directory Scan',
      cls: 'batch-refresh-button'
    });
    refreshButton.onclick = () => this.scanCurrentDirectory();
  }

  private async createFileListSection(contentEl: ObsidianHTMLElement): Promise<void> {
    const section = contentEl.createDiv('batch-file-list-section');
    const header = section.createDiv('batch-file-list-header');
    header.createEl('h3', { text: 'Eligible Files' });
    
    const controls = header.createDiv('batch-file-controls');
    const selectAllBtn = controls.createEl('button', { 
      text: 'Select All',
      cls: 'batch-select-button'
    });
    const deselectAllBtn = controls.createEl('button', { 
      text: 'Deselect All',
      cls: 'batch-select-button'
    });
    
    selectAllBtn.onclick = () => this.selectAllFiles();
    deselectAllBtn.onclick = () => this.deselectAllFiles();
    
    this.fileListEl = section.createDiv('batch-file-list');
  }

  private createOptionsSection(contentEl: ObsidianHTMLElement): void {
    const section = contentEl.createDiv('batch-options-section');
    section.createEl('h3', { text: 'Processing Options' });
    
    const optionsGrid = section.createDiv('batch-options-grid');
    
    // Create checkbox options
    const createCheckbox = (key: keyof BatchOptions, label: string, description: string) => {
      const container = optionsGrid.createDiv('batch-option-item');
      const checkbox = container.createEl('input', { type: 'checkbox' });
      checkbox.checked = this.options[key] as boolean;
      checkbox.onchange = () => {
        (this.options[key] as boolean) = checkbox.checked;
      };
      
      const labelEl = container.createEl('label');
      labelEl.appendChild(checkbox);
      labelEl.createSpan({ text: label, cls: 'batch-option-label' });
      container.createDiv({ text: description, cls: 'batch-option-description' });
    };

    createCheckbox('overwriteExisting', 'Overwrite Existing Data', 'Replace existing OpenGraph fields');
    createCheckbox('createNewProperties', 'Create New Properties', 'Add OpenGraph fields if missing');
    createCheckbox('writeErrors', 'Write Errors to YAML', 'Include error information in frontmatter');
    createCheckbox('updateFetchDate', 'Update Fetch Date', 'Record when data was fetched');
    createCheckbox('skipExistingData', 'Skip Files with Data', 'Only process files missing OpenGraph data');

    // Batch delay slider
    const delayContainer = section.createDiv('batch-delay-container');
    delayContainer.createEl('label', { text: 'Batch Delay (ms):' });
    const delaySlider = delayContainer.createEl('input', { type: 'range' });
    delaySlider.min = '100';
    delaySlider.max = '5000';
    delaySlider.value = this.options.batchDelay.toString();
    const delayValue = delayContainer.createEl('span', { text: this.options.batchDelay.toString() });
    
    delaySlider.oninput = () => {
      this.options.batchDelay = parseInt(delaySlider.value);
      delayValue.textContent = delaySlider.value;
    };
  }

  private createProgressSection(contentEl: ObsidianHTMLElement): void {
    const section = contentEl.createDiv('batch-progress-section');
    section.createEl('h3', { text: 'Progress' });
    
    this.progressBar = section.createEl('progress', { cls: 'batch-progress-bar' });
    this.progressBar.max = 100;
    this.progressBar.value = 0;
    
    this.progressEl = section.createDiv('batch-progress-info');
    this.statusEl = section.createDiv('batch-status-info');
    
    this.updateProgressDisplay();
  }

  private createButtonSection(contentEl: ObsidianHTMLElement): void {
    const section = contentEl.createDiv('batch-button-section');
    
    this.processButton = section.createEl('button', { 
      text: 'Process Selected Files',
      cls: 'batch-process-button'
    });
    this.processButton.onclick = () => this.startBatchProcessing();
    
    this.cancelButton = section.createEl('button', { 
      text: 'Cancel',
      cls: 'batch-cancel-button'
    });
    this.cancelButton.onclick = () => this.cancelProcessing();
    this.cancelButton.disabled = true;
  }

  private async scanCurrentDirectory(): Promise<void> {
    try {
      this.targetDirectory = await this.scanner.getCurrentWorkingDirectory();
      this.eligibleFiles = await this.scanner.scanForEligibleFiles(this.targetDirectory, this.settings);
      
      this.updateDirectoryDisplay();
      this.updateFileListDisplay();
      this.updateProgressDisplay();
    } catch (error) {
      console.error('Error scanning directory:', error);
      this.statusEl?.setText('Error scanning directory');
    }
  }

  private updateDirectoryDisplay(): void {
    if (!this.directoryEl) return;
    
    this.directoryEl.empty();
    this.directoryEl.createEl('p', { 
      text: `Current Directory: ${this.targetDirectory || 'Root'}` 
    });
    this.directoryEl.createEl('p', { 
      text: `Found ${this.eligibleFiles.length} eligible files` 
    });
  }

  private updateFileListDisplay(): void {
    if (!this.fileListEl) return;
    
    this.fileListEl.empty();
    
    if (this.eligibleFiles.length === 0) {
      this.fileListEl.createEl('p', { 
        text: 'No files found with URLs missing OpenGraph data.',
        cls: 'batch-no-files'
      });
      return;
    }

    for (const file of this.eligibleFiles) {
      const fileItem = this.fileListEl.createDiv('batch-file-item');
      
      const checkbox = fileItem.createEl('input', { type: 'checkbox' });
      checkbox.checked = this.selectedFiles.has(file.path);
      checkbox.onchange = () => {
        if (checkbox.checked) {
          this.selectedFiles.add(file.path);
        } else {
          this.selectedFiles.delete(file.path);
        }
        this.updateProgressDisplay();
      };
      
      const fileInfo = fileItem.createDiv('batch-file-info');
      fileInfo.createEl('strong', { text: file.name });
      fileInfo.createEl('div', { text: file.path, cls: 'batch-file-path' });
      fileInfo.createEl('div', { text: `URL: ${file.url}`, cls: 'batch-file-url' });
      
      if (file.missingFields.length > 0) {
        fileInfo.createEl('div', { 
          text: `Missing: ${file.missingFields.join(', ')}`,
          cls: 'batch-missing-fields'
        });
      }
      
      const statusIcon = fileItem.createDiv('batch-file-status');
      if (file.hasOpenGraphData) {
        statusIcon.setText('✓');
        statusIcon.addClass('batch-status-complete');
      } else {
        statusIcon.setText('⏳');
        statusIcon.addClass('batch-status-pending');
      }
    }
  }

  private selectAllFiles(): void {
    this.selectedFiles.clear();
    for (const file of this.eligibleFiles) {
      this.selectedFiles.add(file.path);
    }
    this.updateFileListDisplay();
    this.updateProgressDisplay();
  }

  private deselectAllFiles(): void {
    this.selectedFiles.clear();
    this.updateFileListDisplay();
    this.updateProgressDisplay();
  }

  private updateProgressDisplay(): void {
    if (!this.progressEl || !this.statusEl) return;
    
    const selectedCount = this.selectedFiles.size;
    this.progressEl.setText(`Selected: ${selectedCount} files`);
    
    if (this.progress.isProcessing) {
      const percentage = this.progress.totalFiles > 0 
        ? Math.round((this.progress.currentFileIndex / this.progress.totalFiles) * 100)
        : 0;
      
      if (this.progressBar) {
        this.progressBar.value = percentage;
      }
      
      this.statusEl.setText(
        `Processing: ${this.progress.currentFileName} ` +
        `(${this.progress.currentFileIndex}/${this.progress.totalFiles}) - ` +
        `Success: ${this.progress.successCount}, Errors: ${this.progress.errorCount}`
      );
    } else {
      if (this.progressBar) {
        this.progressBar.value = 0;
      }
      this.statusEl.setText('Ready to process selected files');
    }
  }

  private async startBatchProcessing(): Promise<void> {
    if (this.selectedFiles.size === 0) {
      this.statusEl?.setText('No files selected for processing');
      return;
    }

    this.progress.isProcessing = true;
    this.progress.currentFileIndex = 0;
    this.progress.totalFiles = this.selectedFiles.size;
    this.progress.successCount = 0;
    this.progress.errorCount = 0;
    
    this.processButton!.disabled = true;
    this.cancelButton!.disabled = false;
    
    const selectedFilePaths = Array.from(this.selectedFiles);
    
    for (let i = 0; i < selectedFilePaths.length && this.progress.isProcessing; i++) {
      const filePath = selectedFilePaths[i];
      const fileInfo = this.eligibleFiles.find(f => f.path === filePath);
      
      if (!fileInfo) continue;
      
      this.progress.currentFileIndex = i + 1;
      this.progress.currentFileName = fileInfo.name;
      this.updateProgressDisplay();
      
      const result = await this.processFile(fileInfo);
      
      if (result.success) {
        this.progress.successCount++;
      } else {
        this.progress.errorCount++;
      }
      
      // Update file status in UI
      this.updateFileStatus(filePath, result.success);
      
      // Delay between files
      if (i < selectedFilePaths.length - 1 && this.progress.isProcessing) {
        await new Promise(resolve => setTimeout(resolve, this.options.batchDelay));
      }
    }
    
    this.finishProcessing();
  }

  private async processFile(fileInfo: FileInfo): Promise<ProcessingResult> {
    try {
      const data = await this.service.fetchMetadata(fileInfo.url, this.settings);
      await this.updateFileMetadata(fileInfo.path, fileInfo.url, data);
      
      return {
        success: true,
        filePath: fileInfo.path
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof OpenGraphServiceError 
        ? error.message 
        : 'Unknown error occurred';
      
      return {
        success: false,
        error: errorMessage,
        filePath: fileInfo.path
      };
    }
  }

  private async updateFileMetadata(filePath: string, _url: string, data: any): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!file || !(file instanceof TFile)) return; // Ensure it's a file, not a folder
    
    const content = await this.app.vault.read(file as any);
    const frontmatter = extractFrontmatter(content);
    
    if (!frontmatter) return;
    
    // Save the original tags if they exist
    const originalTags = frontmatter.tags;
    
    // Update frontmatter with OpenGraph data using configurable field names
    if (data.title && (this.options.overwriteExisting || !frontmatter[this.settings.titleFieldName])) {
      frontmatter[this.settings.titleFieldName] = data.title;
    }
    
    if (data.description && (this.options.overwriteExisting || !frontmatter[this.settings.descriptionFieldName])) {
      frontmatter[this.settings.descriptionFieldName] = data.description;
    }
    
    if (data.image && (this.options.overwriteExisting || !frontmatter[this.settings.imageFieldName])) {
      frontmatter[this.settings.imageFieldName] = data.image;
    }
    
    if (this.options.updateFetchDate) {
      frontmatter[this.settings.fetchDateFieldName] = new Date().toISOString();
    }
    
    // Restore the original tags if they existed
    if (originalTags !== undefined) {
      frontmatter.tags = originalTags;
    }
    
    // Get the original content to preserve formatting
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      // Replace only the frontmatter part while preserving the rest of the content
      const updatedFrontmatter = formatFrontmatter(frontmatter);
      const updatedContent = content.replace(frontmatterRegex, `---\n${updatedFrontmatter}\n---`);
      await this.app.vault.modify(file as any, updatedContent);
    } else {
      // Fallback to the original behavior if no frontmatter is found
      const updatedContent = formatFrontmatter(frontmatter);
      await this.app.vault.modify(file as any, updatedContent);
    }
  }

  private updateFileStatus(filePath: string | undefined, success: boolean): void {
    if (!filePath) return;
    
    // Find and update the file status icon in the UI
    const fileItems = this.fileListEl?.querySelectorAll('.batch-file-item');
    if (!fileItems) return;
    
    // Convert NodeList to Array for iteration
    Array.from(fileItems).forEach((item: Element) => {
      const pathEl = item.querySelector('.batch-file-path');
      if (pathEl?.textContent === filePath) {
        const statusEl = item.querySelector('.batch-file-status');
        if (statusEl) {
          statusEl.textContent = success ? '✓' : '⚠';
          statusEl.className = `batch-file-status ${success ? 'batch-status-complete' : 'batch-status-error'}`;
        }
      }
    });
  }

  private cancelProcessing(): void {
    this.progress.isProcessing = false;
    this.finishProcessing();
  }

  private finishProcessing(): void {
    this.progress.isProcessing = false;
    this.processButton!.disabled = false;
    this.cancelButton!.disabled = true;
    
    this.statusEl?.setText(
      `Processing complete - Success: ${this.progress.successCount}, ` +
      `Errors: ${this.progress.errorCount}`
    );
    
    this.updateProgressDisplay();
  }
}
