import { resolve, sep } from 'node:path';
import type { WarningHandlerWithDefault } from 'rollup';

/** Ignore harmless dependency client boundaries and MUI annotations; preserve all other diagnostics. */
export const withBundledUseClientFilter = (previous?: WarningHandlerWithDefault): WarningHandlerWithDefault =>
  (warning, warn) => {
    const modulePath = typeof warning.id === 'string' && !warning.id.includes('\0') ? resolve(warning.id) : '';
    const dependencyModule = modulePath.split(sep).includes('node_modules');
    const muiDependencyModule = modulePath.includes(`${sep}node_modules${sep}@mui${sep}`);
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE'
      && warning.message.includes('"use client"')
      && dependencyModule) return;
    if (warning.code === 'INVALID_ANNOTATION' && muiDependencyModule) return;
    if (previous) previous(warning, warn);
    else warn(warning);
  };
