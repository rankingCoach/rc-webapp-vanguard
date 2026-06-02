import { z } from 'zod';

import { CatalogueLoader } from '../loaders/catalogue-loader.js';
import { DetailLoader } from '../loaders/detail-loader.js';
import { StorybookLoader } from '../loaders/storybook-loader.js';
import { ComponentIndex, SearchResult } from '../types.js';

const SearchComponentsInputSchema = z.object({
  query: z.string().describe('Search query to find components (case-insensitive)'),
  searchMode: z
    .enum(['name', 'keyword', 'semantic', 'all'])
    .optional()
    .default('all')
    .describe(
      'Search mode: name (component name), keyword (metadata keywords), semantic (all text fields), all (combined)',
    ),
  tags: z.array(z.string()).optional().describe('Filter by tags (e.g., ["forms", "input"])'),
  category: z.string().optional().describe('Filter by category (e.g., "core", "common")'),
  limit: z.number().optional().default(20).describe('Maximum number of results to return'),
});

type SearchComponentsInput = z.infer<typeof SearchComponentsInputSchema>;

interface ScoredResult extends SearchResult {
  relevanceScore: number;
  matchReason: string;
}

/**
 * Search for components with multiple modes and filtering
 */
export function searchComponents(componentIndex: ComponentIndex, input: SearchComponentsInput): SearchResult[] {
  const { query, searchMode = 'all', tags, category, limit = 20 } = input;
  const lowerQuery = query.toLowerCase();

  const catalogue = CatalogueLoader.loadCatalogue();
  if (!catalogue) {
    // Fallback to basic storybook search
    return fallbackSearch(componentIndex, query, limit);
  }

  const results: ScoredResult[] = [];

  // Get all component items
  const components = catalogue.items.filter((item) => item.kind === 'component');

  for (const item of components) {
    let score = 0;
    const matchReasons: string[] = [];

    // Name matching (highest score)
    if (searchMode === 'name' || searchMode === 'all') {
      const nameMatch = item.name.toLowerCase().includes(lowerQuery);
      if (nameMatch) {
        score += 10;
        matchReasons.push('Matched name');
      }
    }

    // Keyword matching (high score)
    if (searchMode === 'keyword' || searchMode === 'semantic' || searchMode === 'all') {
      const keywords = item.keywords || [];
      const matchedKeywords = keywords.filter((k) => k.toLowerCase().includes(lowerQuery));
      if (matchedKeywords.length > 0) {
        score += 5 * matchedKeywords.length;
        matchReasons.push(`Matched keywords: ${matchedKeywords.join(', ')}`);
      }
    }

    // Tag matching (medium score)
    if (searchMode === 'semantic' || searchMode === 'all') {
      const itemTags = item.tags || [];
      const matchedTags = itemTags.filter((t) => t.toLowerCase().includes(lowerQuery));
      if (matchedTags.length > 0) {
        score += 3 * matchedTags.length;
        matchReasons.push(`Matched tags: ${matchedTags.join(', ')}`);
      }
    }

    // Summary matching (lower score)
    if (searchMode === 'semantic' || searchMode === 'all') {
      const summary = item.summary || '';
      if (summary.toLowerCase().includes(lowerQuery)) {
        score += 2;
        matchReasons.push('Matched summary');
      }
    }

    // Load detail file for category and description
    if (searchMode === 'semantic' || searchMode === 'all' || category) {
      const detail = DetailLoader.loadDetail('component', item.id);
      if (detail) {
        // Category filtering
        if (category && detail.category && detail.category.toLowerCase() !== category.toLowerCase()) {
          continue; // Skip if category doesn't match
        }

        // Description matching (lowest score)
        if (searchMode === 'semantic' || searchMode === 'all') {
          const description = detail.summary || '';
          if (description.toLowerCase().includes(lowerQuery) && !matchReasons.includes('Matched summary')) {
            score += 1;
            matchReasons.push('Matched description');
          }
        }
      } else if (category) {
        continue; // Skip if we need category but no detail file exists
      }
    }

    // Tag filtering
    if (tags && tags.length > 0) {
      const itemTags = (item.tags || []).map((t) => t.toLowerCase());
      const hasAllTags = tags.every((filterTag) =>
        itemTags.some((itemTag) => itemTag.includes(filterTag.toLowerCase())),
      );
      if (!hasAllTags) {
        continue; // Skip if doesn't have all required tags
      }
    }

    // Only include if we have a match
    if (score > 0) {
      const storyCount = componentIndex[item.name]?.stories.length || 0;
      const detail = DetailLoader.loadDetail('component', item.id);

      results.push({
        name: item.name,
        kind: 'component',
        storyCount,
        componentPath: item.source.path,
        summary: item.summary,
        keywords: item.keywords,
        tags: item.tags,
        category: detail?.category,
        matchReason: matchReasons.join('; '),
        relevanceScore: Math.min(score / 10, 1), // Normalize to 0-1
      });
    }
  }

  // Sort by relevance score descending
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Limit results
  return results.slice(0, limit);
}

/**
 * Fallback search using basic storybook loader (when catalogue not available)
 */
function fallbackSearch(componentIndex: ComponentIndex, query: string, limit: number): SearchResult[] {
  const results = StorybookLoader.searchComponents(componentIndex, query);

  return results.slice(0, limit).map((name) => ({
    name,
    kind: 'component' as const,
    storyCount: componentIndex[name].stories.length,
    componentPath: componentIndex[name].componentFilePath,
  }));
}

export { SearchComponentsInput, SearchComponentsInputSchema };
