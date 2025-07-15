import { Notice, Plugin, Editor } from 'obsidian';
import { OpenGraphFetcherModal } from './src/modals/OpenGraphFetcherModal';
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

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new OpenGraphPluginSettingsTab(this.app, this));

        // Register commands
        this.registerCommands();
    }

    async loadSettings(): Promise<void> {
        const data = await this.loadData();
        if (data) {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
        } else {
            this.settings = DEFAULT_SETTINGS;
        }
    }

    async saveSettings(): Promise<void> {
        try {
            await this.saveData(this.settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
            new Notice('Failed to save settings');
        }
    }

    private registerCommands(): void {
        // Command to fetch OpenGraph data
        this.addCommand({
            id: 'fetch-opengraph-data',
            name: 'Fetch OpenGraph Data',
            editorCallback: (_editor: Editor) => {
                new OpenGraphFetcherModal(this.app, this).open();
            }
        });
    }

    async onunload(): Promise<void> {
        // Clean up any resources if needed
    }
}
