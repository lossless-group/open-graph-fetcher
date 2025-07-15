import { Notice, Plugin, Editor } from 'obsidian';
import { OpenGraphPluginSettingsTab } from './src/settings/settings-tab';

interface OpenGraphPluginSettings {
    apiKey: string;
    baseUrl: string;
    retries: number;
    backoffDelay: number;
    rateLimit: number;
    cacheDuration: number;
}

const DEFAULT_SETTINGS: OpenGraphPluginSettings = {
    apiKey: '',
    baseUrl: 'https://api.opengraph.io',
    retries: 3,
    backoffDelay: 1000,
    rateLimit: 60,
    cacheDuration: 86400 // 24 hours
};

export default class OpenGraphPlugin extends Plugin {
    settings: OpenGraphPluginSettings = DEFAULT_SETTINGS;

    async loadSettings(): Promise<void> {
        const savedSettings = await this.loadData() as unknown as OpenGraphPluginSettings;
        if (savedSettings) {
            this.settings = { ...DEFAULT_SETTINGS, ...savedSettings };
        }
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    async onload(): Promise<void> {
        await this.loadSettings();

        // Add ribbon icon
        const ribbonIconEl = this.addRibbonIcon(
            'external-link',
            'Fetch OpenGraph Data',
            () => {
                new Notice('OpenGraph Fetcher is ready!');
            }
        );
        ribbonIconEl.addClass('open-graph-fetcher-ribbon-icon');

        // Add settings tab
        this.addSettingTab(new OpenGraphPluginSettingsTab(this.app, this));

        // Register commands
        this.registerCommands();
    }

    private registerCommands(): void {
        // Command to fetch OpenGraph data
        this.addCommand({
            id: 'fetch-opengraph-data',
            name: 'Fetch OpenGraph Data',
            editorCallback: (_editor: Editor) => {
                // TODO: Implement actual functionality
                new Notice('Fetching OpenGraph data...');
            }
        });
    }

    async onunload(): Promise<void> {
        // Clean up any resources if needed
    }
}
