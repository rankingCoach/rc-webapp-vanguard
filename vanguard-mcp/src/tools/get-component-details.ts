import { z } from 'zod';

import { normalizeComponentId, PropsLoader } from '../loaders/props-loader.js';
import { DetailLoader } from '../loaders/detail-loader.js';
import { CatalogueLoader } from '../loaders/catalogue-loader.js';
import { ComponentParser } from '../parsers/component-parser.js';
import { ComponentDetails, ComponentIndex, DependentType } from '../types.js';

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
 * Compute related components inline (similar to get-related-components but lighter)
 */
function computeRelatedComponents(
  componentName: string,
  limit: number = 5,
): Array<{ name: string; summary?: string; relationshipReason: string; similarityScore: number }> {
  const catalogue = CatalogueLoader.loadCatalogue();
  if (!catalogue) {
    return [];
  }

  // Find the reference component
  const refItem = catalogue.items.find(
    (item) => item.name.toLowerCase() === componentName.toLowerCase() && item.kind === 'component',
  );

  if (!refItem) {
    return [];
  }

  // Load detail for reference component
  const refId = normalizeComponentId(componentName);
  const refDetail = DetailLoader.loadDetail('component', refId);

  const refKeywords = (refItem.keywords || []).map((k) => k.toLowerCase());
  const refTags = (refItem.tags || []).map((t) => t.toLowerCase());
  const refCategory = refDetail?.category;

  const results: Array<{ name: string; summary?: string; relationshipReason: string; similarityScore: number }> = [];

  // Score other components
  for (const targetItem of catalogue.items) {
    if (targetItem.kind !== 'component' || targetItem.name === refItem.name) {
      continue;
    }

    const targetKeywords = (targetItem.keywords || []).map((k) => k.toLowerCase());
    const targetTags = (targetItem.tags || []).map((t) => t.toLowerCase());

    let score = 0;
    const reasons: string[] = [];

    // Check category match
    const targetId = normalizeComponentId(targetItem.name);
    const targetDetail = DetailLoader.loadDetail('component', targetId);
    if (refCategory && targetDetail?.category && refCategory.toLowerCase() === targetDetail.category.toLowerCase()) {
      score += 10;
      reasons.push(`Same category: ${refCategory}`);
    }

    // Check tag overlap
    const sharedTags = refTags.filter((t) => targetTags.includes(t));
    if (sharedTags.length > 0) {
      score += 5 * sharedTags.length;
      reasons.push(`Shares ${sharedTags.length} tags`);
    }

    // Check keyword overlap
    const sharedKeywords = refKeywords.filter((k) => targetKeywords.includes(k));
    if (sharedKeywords.length > 0) {
      score += 3 * sharedKeywords.length;
      reasons.push(`Shares ${sharedKeywords.length} keywords`);
    }

    if (score > 0) {
      results.push({
        name: targetItem.name,
        summary: targetItem.summary,
        relationshipReason: reasons.join('; '),
        similarityScore: Math.min(score / 20, 1),
      });
    }
  }

  // Sort and limit
  results.sort((a, b) => b.similarityScore - a.similarityScore);
  return results.slice(0, limit);
}

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

  // Try to load from detail files first (enriched data)
  const componentId = normalizeComponentId(input.componentName);
  const detail = DetailLoader.loadDetail('component', componentId);

  if (detail) {
    const result: ComponentDetails = {
      name: detail.name,
      storyCount: detail.storyCount || 0,
      stories: detail.stories?.map((s) => ({ name: s.name, id: s.id })) || [],
      propsInterface: detail.props?.raw,
      componentPath: detail.source.path,
      dependentTypes: detail.props?.dependentTypes as Record<string, DependentType> | undefined,
      metadata: {
        summary: detail.summary,
        keywords: detail.keywords,
        tags: detail.tags,
        category: detail.category,
      },
    };

    // Add related components if requested
    if (input.includeRelated) {
      result.relatedComponents = computeRelatedComponents(input.componentName, 5);
    }

    return result;
  }

  // Fallback to props loader
  const propsData = PropsLoader.loadComponentProps(componentId);

  let propsInterface: string | undefined;
  let dependentTypes: Record<string, DependentType> | undefined;

  if (propsData) {
    propsInterface = propsData.propsRaw;
    dependentTypes = propsData.dependentTypes;
  } else if (component.componentFilePath) {
    // Fallback to dynamic parsing
    propsInterface = ComponentParser.getComponentProps(component.componentFilePath, input.componentName) || undefined;
  }

  const result: ComponentDetails = {
    name: component.name,
    storyCount: component.stories.length,
    stories: component.stories.map((story) => ({
      name: story.name,
      id: story.id,
    })),
    propsInterface,
    componentPath: component.componentFilePath,
    dependentTypes,
  };

  // Add related components if requested
  if (input.includeRelated) {
    result.relatedComponents = computeRelatedComponents(input.componentName, 5);
  }

  return result;
}

export { GetComponentDetailsInput, GetComponentDetailsInputSchema };
