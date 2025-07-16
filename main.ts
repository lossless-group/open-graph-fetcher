import { Notice, Plugin, Editor } from 'obsidian';
import { OpenGraphFetcherModal } from './src/modals/OpenGraphFetcherModal';
import { OpenGraphSettingTab, DEFAULT_SETTINGS, type OpenGraphSettings } from './src/settings/settings';

export default class OpenGraphPlugin extends Plugin {
    settings!: OpenGraphSettings;

    async onload(): Promise<void> {
        await this.loadSettings();

        // Add ribbon icon
        const ribbonIconEl = this.addRibbonIcon(
            'external-link',
            'Fetcher OpenGraph Data',
            () => {
                new Notice('OpenGraph Fetcher is ready!');
            }
        );
        ribbonIconEl.addClass('open-graph-fetcher-ribbon-icon');

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new OpenGraphSettingTab(this.app, this));

        // Register commands
        this.registerCommands();
    }

    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
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
