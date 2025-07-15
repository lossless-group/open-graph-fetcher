import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

declare module 'obsidian' {
  interface App {
    commands: any;
    workspace: {
      activeEditor?: {
        editor: Editor;
      };
      getActiveViewOfType<T extends typeof MarkdownView>(type: T): InstanceType<T> | null;
    };
  }
  
  interface Editor {
    getSelection(): string;
    replaceSelection(text: string): void;
    getCursor(): { line: number, ch: number };
    setCursor(line: number, ch: number): void;
    lastLine(): number;
  }

  interface MarkdownView {
    file: TFile;
    editor: Editor;
  }

  interface PluginManifest {
    dir: string;
  }

  interface Plugin {
    app: App;
    addRibbonIcon(icon: string, tooltip: string, callback: () => void): HTMLElement;
    addCommand(command: {
      id: string;
      name: string;
      editorCallback: (editor: Editor) => void;
    }): void;
    addSettingTab(tab: PluginSettingTab): void;
    loadData(): Promise<any>;
    saveData(data: any): Promise<void>;
  }

  interface Command {
    id: string;
    name: string;
    callback: () => void;
  }

  interface PluginSettingTab {
    containerEl: HTMLElement;
    display(): void;
  }

  interface PluginManifest {
    dir: string;
  }

  interface TFile {
    name: string;
    path: string;
  }

  interface Setting {
    constructor(containerEl: HTMLElement);
    setName(name: string): this;
    setDesc(desc: string): this;
    setPlaceholder(placeholder: string): this;
    setValue(value: any): this;
    onChange(callback: (value: any) => void): this;
    addText(callback: (text: Setting) => void): this;
    addSlider(callback: (slider: Setting) => void): this;
    setLimits(min: number, max: number, step: number): this;
  }

  interface Notice {
    constructor(message: string, duration?: number);
  }

  interface HTMLElement extends globalThis.HTMLElement {
    empty(): void;
    createEl(tag: string, props?: { text?: string }): HTMLElement;
  }
}
