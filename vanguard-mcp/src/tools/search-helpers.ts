import * as z from 'zod';

import { HelperLoader } from '../loaders/helper-loader.js';

export const SearchHelpersInputSchema = z.object({ query: z.string() });

export function searchHelpers(query: string) {
  const results = HelperLoader.find(query);
  return results.map((r) => ({ name: r.name, filePath: r.source?.path }));
}
