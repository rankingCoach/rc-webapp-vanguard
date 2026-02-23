import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { DependentType, PropsField, StoryInfo } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generated component props data from pre-built JSON files
 */
export interface GeneratedPropsData {
  componentId: string;
  componentName: string;
  displayName: string;
  componentPath: string;
  props: PropsField[];
  propsRaw?: string;
  dependentTypes?: Record<string, DependentType>;
  stories: StoryInfo[];
  storyCount: number;
  generatedAt: string;
  tags?: string[];
}

/**
 * Loader for pre-generated component props from data/props/*.json files
 */
export class PropsLoader {
  private static cache = new Map<string, GeneratedPropsData | null>();
  private static dataDir: string;

  static {
    // Resolve path to data directory relative to this loader
    // From: src/loaders/props-loader.ts
    // To: data/props/
    this.dataDir = path.resolve(__dirname, '../../data/props');
  }

  /**
   * Load component props from pre-generated JSON file
   * @param componentId - Normalized component ID (e.g., "icon", "ai-orb")
   * @returns Generated props data or null if not found
   */
  static loadComponentProps(componentId: string): GeneratedPropsData | null {
    // Check cache first
    if (this.cache.has(componentId)) {
      return this.cache.get(componentId) ?? null;
    }

    // Try to load from JSON file
    const jsonPath = path.join(this.dataDir, `${componentId}.json`);

    try {
      if (!fs.existsSync(jsonPath)) {
        this.cache.set(componentId, null);
        return null;
      }

      const content = fs.readFileSync(jsonPath, 'utf-8');
      const data = JSON.parse(content) as GeneratedPropsData;
      this.cache.set(componentId, data);
      return data;
    } catch (error) {
      console.warn(`Failed to load props for ${componentId}:`, error);
      this.cache.set(componentId, null);
      return null;
    }
  }

  /**
   * Clear the cache (useful for testing)
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Normalize component name to component ID
 * Icon → icon, AIOrb → ai-orb, CheckBox → check-box
 */
export function normalizeComponentId(name: string): string {
  return name
    .replace(/([A-Z])/g, (_, p1, offset) => (offset > 0 ? '-' + p1.toLowerCase() : p1.toLowerCase()))
    .toLowerCase();
}
