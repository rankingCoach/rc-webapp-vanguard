import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ComponentIndex } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MCP_DIR = path.resolve(__dirname, '../..');
const ROOT_DIR = path.resolve(MCP_DIR, '..');

interface ComponentIndexEntry {
  id: string;
  name: string;
  displayName: string;
  componentPath: string;
  storyCount: number;
  hasProps: boolean;
  tags: string[];
}

interface ComponentIndexFile {
  version: string;
  generatedAt: string;
  totalComponents: number;
  components: ComponentIndexEntry[];
}

interface VanguardIndexFile {
  version: string;
  generatedAt: string;
  stats: any;
  components: Array<{
    id: string;
    name: string;
    componentPath?: string;
    storyCount: number;
    hasStorybook: boolean;
    category?: string;
    tags?: string[];
  }>;
  hooks?: any[];
  helpers?: any[];
}

/**
 * Loads and parses the components.index.json or vanguard.index.json file to build a component index
 */
export class StorybookLoader {
  private static readonly COMPONENTS_INDEX_PATH = path.join(MCP_DIR, 'data', 'components.index.json');
  private static readonly VANGUARD_INDEX_PATH = path.join(MCP_DIR, 'data', 'vanguard.index.json');

  /**
   * Load vanguard.index.json (preferred) or components.index.json (legacy) and build component index
   */
  static loadStorybook(): ComponentIndex {
    const componentIndex: ComponentIndex = {};

    try {
      if (fs.existsSync(this.VANGUARD_INDEX_PATH)) {
        const content = fs.readFileSync(this.VANGUARD_INDEX_PATH, 'utf-8');
        const idx = JSON.parse(content) as VanguardIndexFile;

        for (const component of idx.components) {
          componentIndex[component.name] = {
            name: component.name,
            stories: [],
            storyFilePath: component.componentPath ? this.getStoryFilePath(component.componentPath) : undefined,
            componentFilePath: component.componentPath
              ? path.join(ROOT_DIR, component.componentPath)
              : undefined,
          };
        }

        return componentIndex;
      }

      // Fallback to legacy components.index.json
      const content = fs.readFileSync(this.COMPONENTS_INDEX_PATH, 'utf-8');
      const indexFile = JSON.parse(content) as ComponentIndexFile;

      for (const component of indexFile.components) {
        componentIndex[component.name] = {
          name: component.name,
          stories: [],
          storyFilePath: this.getStoryFilePath(component.componentPath),
          componentFilePath: path.join(ROOT_DIR, component.componentPath),
        };
      }

      return componentIndex;
    } catch (error) {
      console.error('Failed to load components or vanguard index:', error);
      return {};
    }
  }

  /**
   * Derive story file path from component path
   * Examples: "src/core/Button/Button.tsx" -> "/path/src/core/Button/_Button.stories.tsx"
   */
  private static getStoryFilePath(componentPath: string): string {
    const dir = path.dirname(componentPath);
    const filename = path.basename(componentPath, path.extname(componentPath));
    const storyFile = `_${filename}.stories.tsx`;
    return path.join(ROOT_DIR, dir, storyFile);
  }

  /**
   * Get all component names sorted alphabetically
   */
  static getComponentNames(componentIndex: ComponentIndex): string[] {
    return Object.keys(componentIndex).sort();
  }

  /**
   * Search components by name (case-insensitive, partial match)
   */
  static searchComponents(componentIndex: ComponentIndex, query: string): string[] {
    const lowerQuery = query.toLowerCase();
    return Object.keys(componentIndex)
      .filter((name) => name.toLowerCase().includes(lowerQuery))
      .sort();
  }
}
