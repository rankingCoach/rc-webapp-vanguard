import * as fs from 'node:fs';

import { z } from 'zod';

import { ComponentExamples, ComponentIndex } from '../types.js';

const GetComponentExamplesInputSchema = z.object({
  componentName: z.string().describe('Name of the component'),
  storyName: z
    .string()
    .optional()
    .describe('Optional: specific story name to get, if not provided returns all stories'),
});

type GetComponentExamplesInput = z.infer<typeof GetComponentExamplesInputSchema>;

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

  const storyFile = component.storyFilePath;

  // Read the story file
  let storyContent: string | null = null;
  try {
    if (storyFile && fs.existsSync(storyFile)) {
      storyContent = fs.readFileSync(storyFile, 'utf-8');
    }
  } catch (error) {
    console.error(`Failed to read story file ${storyFile}:`, error);
  }

  // Filter stories if specific story requested
  const stories = input.storyName ? component.stories.filter((s) => s.name === input.storyName) : component.stories;

  // Extract code for each story
  const result: ComponentExamples = {
    componentName: input.componentName,
    stories: stories.map((story) => {
      let code: string | undefined;

      if (storyContent) {
        code = extractStoryCode(storyContent, story.name);
      }

      return {
        name: story.name,
        code,
      };
    }),
  };

  return result;
}

/**
 * Extract the export code for a specific story from the file content
 */
function extractStoryCode(fileContent: string, storyName: string): string | undefined {
  // Look for: export const StoryName: Story = { ... }
  // or: export const StoryName = { ... }
  // We need to find the opening { and match it with closing }

  const pattern = new RegExp(
    `export\\s+const\\s+${storyName}\\s*:?\\s*(?:Story)?\\s*=\\s*\\{([^}]*(?:\\{[^}]*\\}[^}]*)*)\\}`,
    's',
  );

  const match = fileContent.match(pattern);

  if (match) {
    return `export const ${storyName} = {${match[1]}}`;
  }

  // Fallback: try to find just the export statement
  const fallbackPattern = new RegExp(`export\\s+const\\s+${storyName}\\s*[^;]*;`, 's');

  const fallbackMatch = fileContent.match(fallbackPattern);
  if (fallbackMatch) {
    return fallbackMatch[0];
  }

  return undefined;
}

export { GetComponentExamplesInput, GetComponentExamplesInputSchema };
