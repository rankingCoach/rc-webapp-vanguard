import { z } from 'zod';

import { CatalogueLoader } from '../loaders/catalogue-loader.js';
import { UseCaseSearchResult } from '../types.js';

const SearchByUseCaseInputSchema = z.object({
  useCase: z
    .string()
    .describe('Natural language use case description (e.g., "I need a date picker", "components for file upload")'),
  limit: z.number().optional().default(10).describe('Maximum number of results to return'),
});

type SearchByUseCaseInput = z.infer<typeof SearchByUseCaseInputSchema>;

interface ScoredResult {
  name: string;
  summary?: string;
  tags?: string[];
  matchReason: string;
  relevanceScore: number;
}

/**
 * Extract keywords from use case query
 * Extracts meaningful words (>2 chars) and common phrases
 */
function extractKeywords(useCase: string): string[] {
  const lowerCase = useCase.toLowerCase();

  // Common phrases to extract as single keywords
  const phrases = [
    'date picker',
    'date range',
    'time picker',
    'file upload',
    'file download',
    'drag and drop',
    'form validation',
    'form input',
    'text editor',
    'rich text',
    'social media',
    'user avatar',
    'action button',
    'toggle button',
    'search bar',
    'dropdown menu',
    'auto complete',
    'phone number',
    'credit card',
  ];

  const keywords: string[] = [];

  // Extract phrases first
  for (const phrase of phrases) {
    if (lowerCase.includes(phrase)) {
      keywords.push(phrase);
    }
  }

  // Extract individual words (filter out common stop words and short words)
  const stopWords = new Set([
    'i',
    'need',
    'want',
    'show',
    'me',
    'for',
    'to',
    'a',
    'an',
    'the',
    'is',
    'are',
    'be',
    'of',
    'in',
    'on',
    'at',
    'with',
    'that',
    'this',
    'can',
    'do',
    'how',
  ]);

  const words = lowerCase
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  keywords.push(...words);

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Score a component against keywords
 */
function scoreComponent(
  itemName: string,
  itemKeywords: string[],
  itemTags: string[],
  itemSummary: string,
  queryKeywords: string[],
): { score: number; matchReasons: string[] } {
  let score = 0;
  const matchReasons: string[] = [];

  // Check name match
  const lowerName = itemName.toLowerCase();
  const nameMatches = queryKeywords.filter((kw) => lowerName.includes(kw));
  if (nameMatches.length > 0) {
    score += 10 * nameMatches.length;
    matchReasons.push(`Name matches: ${nameMatches.join(', ')}`);
  }

  // Check keywords match (high weight)
  const lowerItemKeywords = itemKeywords.map((k) => k.toLowerCase());
  const keywordMatches = queryKeywords.filter((qk) => lowerItemKeywords.some((ik) => ik.includes(qk) || qk.includes(ik)));
  if (keywordMatches.length > 0) {
    score += 5 * keywordMatches.length;
    matchReasons.push(`Keywords match: ${keywordMatches.join(', ')}`);
  }

  // Check tags match (medium weight)
  const lowerItemTags = itemTags.map((t) => t.toLowerCase());
  const tagMatches = queryKeywords.filter((qk) => lowerItemTags.some((it) => it.includes(qk) || qk.includes(it)));
  if (tagMatches.length > 0) {
    score += 3 * tagMatches.length;
    matchReasons.push(`Tags match: ${tagMatches.join(', ')}`);
  }

  // Check summary match (lower weight)
  const lowerSummary = itemSummary.toLowerCase();
  const summaryMatches = queryKeywords.filter((qk) => lowerSummary.includes(qk));
  if (summaryMatches.length > 0) {
    score += 2 * summaryMatches.length;
    matchReasons.push(`Summary matches: ${summaryMatches.join(', ')}`);
  }

  return { score, matchReasons };
}

/**
 * Search components by use case with intent-based matching
 */
export function searchByUseCase(input: SearchByUseCaseInput): UseCaseSearchResult {
  const { useCase, limit = 10 } = input;

  const catalogue = CatalogueLoader.loadCatalogue();
  if (!catalogue) {
    return {
      results: [],
      suggestions: [],
    };
  }

  // Extract keywords from use case
  const queryKeywords = extractKeywords(useCase);

  if (queryKeywords.length === 0) {
    return {
      results: [],
      suggestions: ['Try being more specific, e.g., "date picker", "file upload", "form validation"'],
    };
  }

  const results: ScoredResult[] = [];

  // Score all components
  for (const item of catalogue.items) {
    if (item.kind !== 'component') continue;

    const { score, matchReasons } = scoreComponent(
      item.name,
      item.keywords || [],
      item.tags || [],
      item.summary || '',
      queryKeywords,
    );

    if (score > 0) {
      results.push({
        name: item.name,
        summary: item.summary,
        tags: item.tags,
        matchReason: matchReasons.join('; '),
        relevanceScore: Math.min(score / 10, 1), // Normalize to 0-1
      });
    }
  }

  // Sort by relevance score
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Get top results
  const topResults = results.slice(0, limit);

  // Generate suggestions from tags of top 3 matches
  const suggestions = generateSuggestions(topResults.slice(0, 3));

  return {
    results: topResults,
    suggestions,
  };
}

/**
 * Generate related search suggestions from top matches
 */
function generateSuggestions(topResults: ScoredResult[]): string[] {
  const allTags = new Set<string>();

  // Collect all unique tags from top results
  for (const result of topResults) {
    if (result.tags) {
      result.tags.forEach((tag) => allTags.add(tag));
    }
  }

  // Convert to array and take top 5
  const suggestions = Array.from(allTags)
    .slice(0, 5)
    .map((tag) => `Try searching for: "${tag}"`);

  return suggestions;
}

export { SearchByUseCaseInput, SearchByUseCaseInputSchema };
