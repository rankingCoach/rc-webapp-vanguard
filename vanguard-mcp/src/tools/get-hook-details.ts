import * as z from 'zod';

import { HookLoader } from '../loaders/hook-loader.js';

export const GetHookDetailsInputSchema = z.object({ name: z.string() });

export function getHookDetails(name: string) {
  const details = HookLoader.getByName(name);
  return details || null;
}
