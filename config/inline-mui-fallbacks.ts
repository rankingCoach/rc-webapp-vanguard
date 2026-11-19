import type { Plugin } from 'vite';

/**
 * WordPress build only (watchdog decision B.5, plan §36.2): the WordPress plugin consumes `dist-wordpress/index.js`
 * plus icon/loading chunks (scripts/cleanup-wordpress-assets.js removes every other chunk), so the lazy MUI fallback
 * routes must stay inline there. Rewrites `lazyFallback(() => import('./XFallback') …)` into a static namespace
 * import passed to lazyFallback, which then renders synchronously — the WordPress bundle behaves as before the split.
 */
const LAZY_RE = /lazyFallback\(\s*\(\)\s*=>\s*import\((['"])([^'"]*Fallback)\1\)/g;

export const inlineMuiFallbacks = (): Plugin => ({
  name: 'vanguard-inline-mui-fallbacks',
  enforce: 'pre',
  transform(code, id) {
    if (!/[\\/]src[\\/]core[\\/].*\.tsx?$/.test(id) || !code.includes('lazyFallback(')) return null;
    let n = 0;
    const imports: string[] = [];
    const out = code.replace(LAZY_RE, (_m, _q, spec: string) => {
      const name = `__vgInlineFallback${n++}`;
      imports.push(`import * as ${name} from '${spec}';`);
      return `lazyFallback(${name}`;
    });
    if (n === 0) return null;
    return { code: `${imports.join('\n')}\n${out}`, map: null };
  },
});
