import { resolve } from 'node:path';
import type { OutputAsset, OutputBundle } from 'rollup';
import { compile } from 'sass';
import type { Plugin } from 'vite';

/** Marker before the appended compat CSS; the order guard (scripts/_mui-compat-order.spec.ts) looks for it. */
export const MUI_COMPAT_MARKER = '/*! vanguard:mui-compat (D15) must stay last */';
export const MUI_COMPAT_ENTRY = resolve(__dirname, '../src/styles/mui-compat.scss');

export const compileMuiCompat = (minify: boolean) =>
  compile(MUI_COMPAT_ENTRY, { style: minify ? 'compressed' : 'expanded' }).css;

/** Appends `css` after everything else in the bundle's single CSS asset; a no-op when there is none. */
export const appendMuiCompat = (bundle: OutputBundle, css: string, cssFileName = 'vanguard.css') => {
  const asset = Object.values(bundle).find(
    (item): item is OutputAsset => item.type === 'asset' && item.fileName === cssFileName,
  );
  if (!asset) return false;
  const source = typeof asset.source === 'string' ? asset.source : new TextDecoder().decode(asset.source);
  if (source.includes(MUI_COMPAT_MARKER)) throw new Error(`${cssFileName} already contains the mui-compat block`);
  asset.source = `${source.trimEnd()}\n${MUI_COMPAT_MARKER}\n${css}`;
  return true;
};

/**
 * D15: the CSS ported from MUI's runtime emotion output must come after every other Vanguard rule, as emotion's tag
 * did. Import order inside a multi-entry lib build is not a contract, so the block is compiled here and appended to
 * the finished vanguard.css instead of being imported by components.
 */
export const muiCompatLast = (): Plugin => {
  let minify = true;
  return {
    name: 'vanguard-mui-compat-last',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      minify = config.build.minify !== false;
    },
    generateBundle(_options, bundle) {
      appendMuiCompat(bundle, compileMuiCompat(minify));
    },
  };
};
