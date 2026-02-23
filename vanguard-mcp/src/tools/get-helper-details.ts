import * as z from 'zod';
import { HelperLoader } from '../loaders/helper-loader.js';

export const GetHelperDetailsInputSchema = z.object({ name: z.string() });

export function getHelperDetails(name: string) {
  const details = HelperLoader.getByName(name);
  return details || null;
}
