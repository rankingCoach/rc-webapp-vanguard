import * as z from 'zod';

import { HookLoader } from '../loaders/hook-loader.js';

export const SearchHooksInputSchema = z.object({ query: z.string() });

export function searchHooks(query: string) {
  const results = HookLoader.find(query);
  return results.map((r) => ({ name: r.name, filePath: r.source?.path }));
}
