// open-graph-fetcher/src/settings/settings.ts
import { App, PluginSettingTab, Setting } from 'obsidian';
import OpenGraphPlugin from '../../main';

export interface OpenGraphSettings {
    apiKey: string;
    baseUrl: string;
    apiUrl: string;
    retries: number;
    backoffDelay: number;
    rateLimit: number;
    cacheDuration: number;
}

export const DEFAULT_SETTINGS: OpenGraphSettings = {
    apiKey: '',
    baseUrl: 'https://api.opengraph.io',
    apiUrl: 'https://opengraph.io/api/1.1/site',
    retries: 3,
    backoffDelay: 1000,
    rateLimit: 60,
    cacheDuration: 86400 // 24 hours
};

export class OpenGraphSettingTab extends PluginSettingTab {
    plugin: OpenGraphPlugin;

    constructor(app: App, plugin: OpenGraphPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'OpenGraph Fetcher Settings' });

        // API Key setting
        new Setting(containerEl)
            .setName('OpenGraph.io API Key')
            .setDesc('Enter your OpenGraph.io API key. Get your key from https://www.opengraph.io/')
            .addText(text => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        // Base URL setting
        new Setting(containerEl)
            .setName('Base URL')
            .setDesc('OpenGraph.io API base URL')
            .addText(text => text
                .setPlaceholder('https://api.opengraph.io')
                .setValue(this.plugin.settings.baseUrl)
                .onChange(async (value) => {
                    this.plugin.settings.baseUrl = value;
                    await this.plugin.saveSettings();
                }));

        // API URL setting
        new Setting(containerEl)
            .setName('API URL')
            .setDesc('OpenGraph.io API endpoint URL')
            .addText(text => text
                .setPlaceholder('https://opengraph.io/api/1.1/site')
                .setValue(this.plugin.settings.apiUrl)
                .onChange(async (value) => {
                    this.plugin.settings.apiUrl = value;
                    await this.plugin.saveSettings();
                }));

        // Retries setting
        new Setting(containerEl)
            .setName('Retries')
            .setDesc('Number of retry attempts for failed requests')
            .addSlider(slider => slider
                .setLimits(1, 10, 1)
                .setValue(this.plugin.settings.retries)
                .onChange(async (value: number) => {
                    this.plugin.settings.retries = value;
                    await this.plugin.saveSettings();
                }));

        // Rate limit setting
        new Setting(containerEl)
            .setName('Rate Limit')
            .setDesc('Maximum requests per minute')
            .addSlider(slider => slider
                .setLimits(10, 120, 10)
                .setValue(this.plugin.settings.rateLimit)
                .onChange(async (value: number) => {
                    this.plugin.settings.rateLimit = value;
                    await this.plugin.saveSettings();
                }));

        // Status message
        const statusEl = containerEl.createEl('div', { 
            text: this.plugin.settings.apiKey 
                ? '✅ API key configured'
                : '⚠️ No API key configured - some features may be limited'
        });
        statusEl.addClass('setting-item-description');
    }
}
