import { PluginSettingTab } from 'obsidian';

export interface PluginSettings {
  apiKey: string;
  baseUrl: string;
  apiUrl: string;
  retries: number;
  backoffDelay: number;
  rateLimit: number;
  cacheDuration: number;
  // Field name mappings
  titleFieldName: string;
  descriptionFieldName: string;
  imageFieldName: string;
  fetchDateFieldName: string;
}

export interface OpenGraphData {
  title: string;
  description: string;
  image: string | null;
  url: string;
  type: string;
  site_name: string;
  error?: string;
  date?: string;
  fetchDate?: string;
}

export interface OpenGraphPluginSettingsTab extends PluginSettingTab {
  plugin: OpenGraphPlugin;
}
