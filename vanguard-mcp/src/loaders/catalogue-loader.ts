import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MCP_DIR = path.resolve(__dirname, '../..');
const CATALOGUE_PATH = path.join(MCP_DIR, 'data/catalogue.json');

export interface CatalogueItem {
  id: string;
  kind: 'component' | 'hook' | 'helper';
  name: string;
  summary?: string;
  keywords: string[];
  tags: string[];
  source: {
    path?: string;
    moduleSpec?: string;
  };
  detailsRef: string;
}

export interface Catalogue {
  version: string;
  generatedAt: string;
  stats: {
    totalComponents: number;
    totalHooks: number;
    totalHelpers: number;
    totalItems: number;
    itemsWithMetadata: number;
    coveragePercent: string;
  };
  items: CatalogueItem[];
}

/**
 * Load and cache the unified catalogue
 */
export class CatalogueLoader {
  private static cache: Catalogue | null = null;

  /**
   * Load the catalogue from data/catalogue.json
   */
  static loadCatalogue(): Catalogue | null {
    if (this.cache) {
      return this.cache;
    }

    try {
      if (!fs.existsSync(CATALOGUE_PATH)) {
        console.warn(`Catalogue not found at ${CATALOGUE_PATH}`);
        return null;
      }

      const content = fs.readFileSync(CATALOGUE_PATH, 'utf-8');
      this.cache = JSON.parse(content);
      return this.cache;
    } catch (err) {
      console.error(`Failed to load catalogue: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  /**
   * Clear the cache (useful for testing)
   */
  static clearCache(): void {
    this.cache = null;
  }

  /**
   * Search catalogue items by name
   */
  static searchByName(query: string, kind?: string): CatalogueItem[] {
    const catalogue = this.loadCatalogue();
    if (!catalogue) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return catalogue.items.filter((item) => {
      if (kind && item.kind !== kind) {
        return false;
      }
      return item.name.toLowerCase().includes(lowerQuery) || item.id.toLowerCase().includes(lowerQuery);
    });
  }

  /**
   * Search catalogue items by keywords
   */
  static searchByKeywords(keywords: string[]): CatalogueItem[] {
    const catalogue = this.loadCatalogue();
    if (!catalogue) {
      return [];
    }

    if (keywords.length === 0) {
      return [];
    }

    const lowerKeywords = keywords.map((k) => k.toLowerCase());
    return catalogue.items.filter((item) => {
      const itemKeywords = (item.keywords || []).map((k) => k.toLowerCase());
      return lowerKeywords.some((keyword) => itemKeywords.some((itemKeyword) => itemKeyword.includes(keyword)));
    });
  }

  /**
   * Get all items of a specific kind
   */
  static getByKind(kind: 'component' | 'hook' | 'helper'): CatalogueItem[] {
    const catalogue = this.loadCatalogue();
    if (!catalogue) {
      return [];
    }

    return catalogue.items.filter((item) => item.kind === kind);
  }

  /**
   * Get a single item by ID
   */
  static getById(id: string): CatalogueItem | null {
    const catalogue = this.loadCatalogue();
    if (!catalogue) {
      return null;
    }

    return catalogue.items.find((item) => item.id === id) || null;
  }

  /**
   * Get catalogue statistics
   */
  static getStats() {
    const catalogue = this.loadCatalogue();
    if (!catalogue) {
      return null;
    }

    return catalogue.stats;
  }
}
