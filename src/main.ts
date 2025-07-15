import { Notice, Plugin, Editor } from 'obsidian';
import { OpenGraphSettings } from './settings/settings';
import { OpenGraphPluginSettingsTab } from './settings-tab';

export default class OpenGraphPlugin extends Plugin {
    settings: OpenGraphSettings;

    async onload(): Promise<void> {
        // Register commands
        this.registerCommands();
        
        // Add ribbon icon
        const ribbonIconEl = this.addRibbonIcon(
            'magic', // You can change this to any Lucide icon name
            'Fetch OpenGraph Data', // Tooltip text
            () => {
                // TODO: Implement fetchOpenGraphData
                const activeEditor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
                if (activeEditor) {
                    // TODO: Implement actual functionality
                    new Notice('Fetching OpenGraph data...');
                } else {
                    new Notice('Please open a note to fetch OpenGraph data');
                }
            }
        );
        
        // Add settings tab
        this.addSettingTab(new OpenGraphPluginSettingsTab(this.app, this, this.settings));
    }

    private registerCommands(): void {
        // Command to fetch OpenGraph data
        this.addCommand({
            id: 'fetch-opengraph-data',
            name: 'Fetch OpenGraph Data',
            editorCallback: (editor: Editor) => {
                // TODO: Implement actual functionality
                new Notice('Fetching OpenGraph data...');
            }
        });
    }

    onunload(): void {
        // Clean up resources if needed
    }
}
