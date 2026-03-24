import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { DetailLoader, normalizeComponentId } from '../loaders/detail-loader.js';
import { ComponentExamples, ComponentIndex } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MCP_DIR = path.resolve(__dirname, '../..');
const ROOT_DIR = path.resolve(MCP_DIR, '..');

const GetComponentExamplesInputSchema = z.object({
  componentName: z.string().describe('Name of the component'),
  storyName: z
    .string()
    .optional()
    .describe('Optional: specific story name to get, if not provided returns all stories'),
});

type GetComponentExamplesInput = z.infer<typeof GetComponentExamplesInputSchema>;

/**
 * Convert a display story name to a PascalCase export name
 * "Button Type Primary" -> "ButtonTypePrimary"
 */
function storyNameToExportName(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Get usage examples from component stories
 */
export function getComponentExamples(
  componentIndex: ComponentIndex,
  input: GetComponentExamplesInput,
): ComponentExamples | null {
  const component = componentIndex[input.componentName];

  if (!component) {
    return null;
  }

  const componentId = normalizeComponentId(input.componentName);
  const detail = DetailLoader.loadDetail('component', componentId);
  const detailStories = detail?.stories ?? [];

  // Filter stories if specific story requested
  const stories = input.storyName
    ? detailStories.filter((s) => s.name === input.storyName)
    : detailStories;

  // Extract code for each story
  const result: ComponentExamples = {
    componentName: input.componentName,
    stories: stories.map((story) => {
      const exportName = storyNameToExportName(story.name);
      const code = readStoryCode(story.filePath, exportName);

      return {
        name: story.name,
        code,
      };
    }),
  };

  return result;
}

/**
 * Read story code from the story file, checking individual story files first,
 * then falling back to the barrel stories file.
 */
function readStoryCode(storyFilePath: string, exportName: string): string | undefined {
  const absBarrelPath = path.join(ROOT_DIR, storyFilePath.replace(/^\.\//, ''));
  const barrelDir = path.dirname(absBarrelPath);

  // Try individual story file first: stories/<ExportName>.story.tsx
  const individualFile = path.join(barrelDir, 'stories', `${exportName}.story.tsx`);
  if (fs.existsSync(individualFile)) {
    try {
      return fs.readFileSync(individualFile, 'utf-8');
    } catch (error) {
      console.error(`Failed to read story file ${individualFile}:`, error);
    }
  }

  // Fallback: extract from the barrel file
  if (fs.existsSync(absBarrelPath)) {
    try {
      const content = fs.readFileSync(absBarrelPath, 'utf-8');
      return extractStoryCode(content, exportName);
    } catch (error) {
      console.error(`Failed to read barrel story file ${absBarrelPath}:`, error);
    }
  }

  return undefined;
}

/**
 * Extract the export code for a specific story from the file content
 */
function extractStoryCode(fileContent: string, exportName: string): string | undefined {
  // Find the position of: export const ExportName
  const startPattern = new RegExp(`export\\s+const\\s+${exportName}\\b`);
  const startMatch = startPattern.exec(fileContent);

  if (!startMatch) {
    return undefined;
  }

  // Find the opening { after the = sign
  const afterExport = fileContent.slice(startMatch.index);
  const eqIdx = afterExport.indexOf('=');
  if (eqIdx === -1) return undefined;

  const afterEq = afterExport.slice(eqIdx + 1).trimStart();

  if (!afterEq.startsWith('{')) {
    // Not an object literal (e.g. spread or function) — return up to semicolon
    const fallbackPattern = new RegExp(`export\\s+const\\s+${exportName}\\s*[^;]*;`, 's');
    const fallbackMatch = fileContent.match(fallbackPattern);
    return fallbackMatch ? fallbackMatch[0] : undefined;
  }

  // Walk the string counting braces to find the matching closing }
  let depth = 0;
  let i = afterEq.indexOf('{');
  const start = i;
  while (i < afterEq.length) {
    if (afterEq[i] === '{') depth++;
    else if (afterEq[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }

  const body = afterEq.slice(start, i + 1);
  return `export const ${exportName} = ${body}`;
}

export { GetComponentExamplesInput, GetComponentExamplesInputSchema };
