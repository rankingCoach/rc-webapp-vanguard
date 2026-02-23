import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MCP_DIR = path.resolve(__dirname, '../..');
const ITEMS_DIR = path.join(MCP_DIR, 'data/items');

export interface DetailData {
  id: string;
  kind: string;
  name: string;
  summary?: string;
  keywords: string[];
  tags: string[];
  source: {
    path?: string;
    moduleSpec?: string;
  };
  props?: {
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      optional: boolean;
      description?: string;
      deprecated?: boolean;
    }>;
    raw?: string;
    dependentTypes?: Record<
      string,
      {
        kind: string;
        text: string;
      }
    >;
  };
  stories?: Array<{
    id: string;
    name: string;
    filePath: string;
    tags: string[];
  }>;
  category?: string;
  hasStorybook?: boolean;
  storyCount?: number;
  signature?: string;
  generatedAt: string;
}

/**
 * Load and cache detail files for items
 */
export class DetailLoader {
  private static cache = new Map<string, DetailData | null>();

  /**
   * Load a detail file by kind and ID
   * @param kind - Item kind (component, hook, helper)
   * @param id - Item ID (e.g., "button", "use-form-config")
   * @returns Detail data or null if not found
   */
  static loadDetail(kind: string, id: string): DetailData | null {
    const cacheKey = `${kind}__${id}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || null;
    }

    try {
      const filename = `${kind}__${id}.json`;
      const filePath = path.join(ITEMS_DIR, filename);

      if (!fs.existsSync(filePath)) {
        this.cache.set(cacheKey, null);
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content) as DetailData;

      this.cache.set(cacheKey, data);
      return data;
    } catch (err) {
      console.error(
        `Failed to load detail file for ${kind}__${id}: ${err instanceof Error ? err.message : String(err)}`,
      );
      this.cache.set(cacheKey, null);
      return null;
    }
  }

  /**
   * Clear a specific cache entry
   */
  static clearCacheEntry(kind: string, id: string): void {
    const cacheKey = `${kind}__${id}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cached detail data
   */
  static clearCache(): void {
    this.cache.clear();
  }
}
