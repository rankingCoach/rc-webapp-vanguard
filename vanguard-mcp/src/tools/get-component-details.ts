import { z } from 'zod';

import { DetailLoader, normalizeComponentId } from '../loaders/detail-loader.js';
import { ComponentDetails, ComponentIndex, DependentType } from '../types.js';
import { getRelatedComponents } from './get-related-components.js';

const GetComponentDetailsInputSchema = z.object({
  componentName: z.string().describe('Name of the component'),
  includeRelated: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to include related components (default: true)'),
});

type GetComponentDetailsInput = z.infer<typeof GetComponentDetailsInputSchema>;

/**
 * Get detailed information about a component including props, stories, metadata, and related components
 */
export function getComponentDetails(
  componentIndex: ComponentIndex,
  input: GetComponentDetailsInput,
): ComponentDetails | null {
  const component = componentIndex[input.componentName];

  if (!component) {
    return null;
  }

  const componentId = normalizeComponentId(input.componentName);
  const detail = DetailLoader.loadDetail('component', componentId);

  if (detail) {
    const result: ComponentDetails = {
      name: detail.name,
      storyCount: detail.storyCount || 0,
      stories: detail.stories?.map((s) => ({ name: s.name, id: s.id })) || [],
      propsInterface: detail.props?.raw,
      props: detail.props?.fields,
      componentPath: detail.source.path,
      dependentTypes: detail.props?.dependentTypes as Record<string, DependentType> | undefined,
      metadata: {
        summary: detail.summary,
        keywords: detail.keywords,
        tags: detail.tags,
        category: detail.category,
      },
    };

    if (input.includeRelated) {
      const related = getRelatedComponents({ componentName: input.componentName, relationshipType: 'all', limit: 5 });
      result.relatedComponents = related?.related ?? [];
    }

    return result;
  }

  // Fallback: no detail file, use index data only
  const result: ComponentDetails = {
    name: component.name,
    storyCount: component.stories.length,
    stories: component.stories.map((story) => ({
      name: story.name,
      id: story.id,
    })),
    componentPath: component.componentFilePath,
  };

  if (input.includeRelated) {
    const related = getRelatedComponents({ componentName: input.componentName, relationshipType: 'all', limit: 5 });
    result.relatedComponents = related?.related ?? [];
  }

  return result;
}

export { GetComponentDetailsInput, GetComponentDetailsInputSchema };
