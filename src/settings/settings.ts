import { Plugin } from 'obsidian';

export interface OpenGraphPluginSettings {
    apiKey: string;
    baseUrl: string;
    retries: number;
    backoffDelay: number;
    rateLimit: number;
    cacheDuration: number;
}

export interface DefaultSettings extends OpenGraphPluginSettings {
    apiKey: string;
}

export class OpenGraphSettings {
    private readonly plugin: Plugin;
    private settings: OpenGraphPluginSettings;
    private defaults: DefaultSettings;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.defaults = {
            apiKey: '',
            baseUrl: 'https://api.opengraph.io',
            retries: 3,
            backoffDelay: 1000,
            rateLimit: 60,
            cacheDuration: 86400 // 24 hours
        };
        
        // Initialize settings with defaults
        this.settings = Object.assign({}, this.defaults);
    }

    async loadSettings(): Promise<void> {
        try {
            const savedSettings = this.plugin.loadData();
            // Ensure all required fields are present
            this.settings = Object.assign({}, this.defaults, savedSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = Object.assign({}, this.defaults);
        }
    }

    saveSettings(): void {
        try {
            this.plugin.saveData(this.settings);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    getSettings(): OpenGraphPluginSettings {
        return { ...this.settings };
    }

    updateSetting<K extends keyof OpenGraphPluginSettings>(key: K, value: OpenGraphPluginSettings[K]): void {
        if (key in this.settings) {
            this.settings[key] = value;
            this.saveSettings();
        }
    }
}
