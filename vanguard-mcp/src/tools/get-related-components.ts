import { z } from 'zod';

import { CatalogueLoader } from '../loaders/catalogue-loader.js';
import { RelatedComponentsResult } from '../types.js';

const GetRelatedComponentsInputSchema = z.object({
  componentName: z.string().describe('Name of the reference component'),
  relationshipType: z
    .enum(['similar', 'same-tags', 'all'])
    .optional()
    .default('all')
    .describe('Type of relationship: similar (shared keywords), same-tags (shared tags only), all (combined)'),
  limit: z.number().optional().default(10).describe('Maximum number of related components to return'),
});

type GetRelatedComponentsInput = z.infer<typeof GetRelatedComponentsInputSchema>;

interface ScoredRelated {
  name: string;
  summary?: string;
  relationshipReason: string;
  similarityScore: number;
}

/**
 * Compute similarity score between two components based on shared metadata
 */
function computeSimilarity(
  refKeywords: string[],
  refTags: string[],
  targetKeywords: string[],
  targetTags: string[],
  relationshipType: string,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Tag matching
  if (relationshipType === 'same-tags' || relationshipType === 'similar' || relationshipType === 'all') {
    const refTagsLower = refTags.map((t) => t.toLowerCase());
    const targetTagsLower = targetTags.map((t) => t.toLowerCase());
    const sharedTags = refTagsLower.filter((t) => targetTagsLower.includes(t));

    if (sharedTags.length > 0) {
      score += 5 * sharedTags.length;
      reasons.push(`Shares ${sharedTags.length} tags: ${sharedTags.join(', ')}`);
    }
  }

  // Keyword matching
  if (relationshipType === 'similar' || relationshipType === 'all') {
    const refKeywordsLower = refKeywords.map((k) => k.toLowerCase());
    const targetKeywordsLower = targetKeywords.map((k) => k.toLowerCase());
    const sharedKeywords = refKeywordsLower.filter((k) => targetKeywordsLower.includes(k));

    if (sharedKeywords.length > 0) {
      score += 3 * sharedKeywords.length;
      reasons.push(`Shares ${sharedKeywords.length} keywords: ${sharedKeywords.join(', ')}`);
    }
  }

  return { score, reasons };
}

/**
 * Get related components based on metadata similarity
 */
export function getRelatedComponents(input: GetRelatedComponentsInput): RelatedComponentsResult | null {
  const { componentName, relationshipType = 'all', limit = 10 } = input;

  const catalogue = CatalogueLoader.loadCatalogue();
  if (!catalogue) {
    return null;
  }

  // Find the reference component
  const refItem = catalogue.items.find(
    (item) => item.name.toLowerCase() === componentName.toLowerCase() && item.kind === 'component',
  );

  if (!refItem) {
    return null;
  }

  const refKeywords = refItem.keywords || [];
  const refTags = refItem.tags || [];

  const results: ScoredRelated[] = [];

  // Score all other components
  for (const targetItem of catalogue.items) {
    if (targetItem.kind !== 'component' || targetItem.name === refItem.name) {
      continue;
    }

    const targetKeywords = targetItem.keywords || [];
    const targetTags = targetItem.tags || [];

    const { score, reasons } = computeSimilarity(refKeywords, refTags, targetKeywords, targetTags, relationshipType);

    if (score > 0) {
      results.push({
        name: targetItem.name,
        summary: targetItem.summary,
        relationshipReason: reasons.join('; '),
        similarityScore: Math.min(score / 10, 1), // Normalize to 0-1
      });
    }
  }

  // Sort by similarity score descending
  results.sort((a, b) => b.similarityScore - a.similarityScore);

  // Limit results
  const topResults = results.slice(0, limit);

  return {
    component: refItem.name,
    related: topResults,
  };
}

export { GetRelatedComponentsInput, GetRelatedComponentsInputSchema };
