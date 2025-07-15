import { PluginSettingTab, Setting, Plugin, App, HTMLElement } from 'obsidian';
import { OpenGraphSettings } from './settings';

export class OpenGraphPluginSettingsTab extends PluginSettingTab {
    settings: OpenGraphSettings;

    constructor(app: App, plugin: Plugin, settings: OpenGraphSettings) {
        super(app, plugin);
        this.settings = settings;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        containerEl.createEl('h2', { text: 'OpenGraph Fetcher Settings' });

        new Setting(containerEl)
            .setName('OpenGraph API Key')
            .setDesc('Your OpenGraph.io API key')
            .addText((text: Setting) => {
                text
                    .setPlaceholder('Enter your API key')
                    .setValue(this.settings.getSettings().apiKey)
                    .onChange((value: string) => {
                        this.settings.updateSetting('apiKey', value);
                    });
            });

        new Setting(containerEl)
            .setName('Base URL')
            .setDesc('Base URL for OpenGraph.io API')
            .addText((text: Setting) => {
                text
                    .setPlaceholder('Enter API base URL')
                    .setValue(this.settings.getSettings().baseUrl)
                    .onChange((value: string) => {
                        this.settings.updateSetting('baseUrl', value);
                    });
            });

        new Setting(containerEl)
            .setName('Retries')
            .setDesc('Number of retry attempts for failed requests')
            .addSlider((slider: Setting) => {
                slider
                    .setLimits(0, 10, 1)
                    .setValue(this.settings.getSettings().retries)
                    .onChange((value: number) => {
                        this.settings.updateSetting('retries', value);
                    });
            });

        new Setting(containerEl)
            .setName('Backoff Delay')
            .setDesc('Delay between retry attempts (in milliseconds)')
            .addSlider((slider: Setting) => {
                slider
                    .setLimits(0, 5000, 100)
                    .setValue(this.settings.getSettings().backoffDelay)
                    .onChange((value: number) => {
                        this.settings.updateSetting('backoffDelay', value);
                    });
            });

        new Setting(containerEl)
            .setName('Rate Limit')
            .setDesc('Maximum requests per minute')
            .addSlider((slider: Setting) => {
                slider
                    .setLimits(0, 100, 1)
                    .setValue(this.settings.getSettings().rateLimit)
                    .onChange((value: number) => {
                        this.settings.updateSetting('rateLimit', value);
                    });
            });

        new Setting(containerEl)
            .setName('Cache Duration')
            .setDesc('Cache duration in seconds (0 to disable)')
            .addSlider((slider: Setting) => {
                slider
                    .setLimits(0, 604800, 3600)
                    .setValue(this.settings.getSettings().cacheDuration)
                    .onChange((value: number) => {
                        this.settings.updateSetting('cacheDuration', value);
                    });
            });
    }
}
