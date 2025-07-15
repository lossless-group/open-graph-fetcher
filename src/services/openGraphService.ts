import { Notice } from 'obsidian';
import { PluginSettings, OpenGraphData } from '../types/open-graph-service';

export class OpenGraphServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'OpenGraphServiceError';
  }
}

export class OpenGraphService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly cache: Map<string, OpenGraphData>;
  private readonly cacheDuration: number;

  constructor(settings: PluginSettings) {
    this.apiKey = settings.apiKey;
    this.baseUrl = settings.baseUrl;
    this.cache = new Map();
    this.cacheDuration = settings.cacheDuration;
  }

  private async fetchWithRetry(
    url: string,
    maxRetries: number,
    backoffDelay: number
  ): Promise<OpenGraphData> {
    let currentDelay = backoffDelay;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/v1/parse`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error: unknown) {
        if (attempt === maxRetries - 1) break;

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= 2;
      }
    }

    throw new OpenGraphServiceError(
      `Failed to fetch OpenGraph data after ${maxRetries} attempts`,
      'FETCH_FAILURE'
    );
  }

  private isCacheValid(url: string): boolean {
    const cached = this.cache.get(url);
    if (!cached) return false;

    const now = Date.now();
    const cachedTime = Date.parse(cached.date ?? now.toString());
    return now - cachedTime < this.cacheDuration * 1000;
  }

  async fetchMetadata(url: string, settings: PluginSettings): Promise<OpenGraphData> {
    // Check cache first
    if (this.isCacheValid(url)) {
      return this.cache.get(url)!;
    }

    try {
      const data = await this.fetchWithRetry(
        url,
        settings.retries,
        settings.backoffDelay
      );

      // Add timestamp for cache validation
      data.date = new Date().toISOString();
      
      this.cache.set(url, data);
      return data;
    } catch (error) {
      console.error('OpenGraph fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      new Notice(`Failed to fetch OpenGraph data: ${errorMessage}`);
      throw error;
    }
  }

  async fetchScreenshot(url: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/screenshot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Screenshot fetch failed: ${response.status}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error: unknown) {
      console.error('Screenshot fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new OpenGraphServiceError(
        `Failed to fetch screenshot for ${url}: ${errorMessage}`,
        'SCREENSHOT_FAILURE'
      );
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidateCacheEntry(url: string): void {
    this.cache.delete(url);
  }
}
