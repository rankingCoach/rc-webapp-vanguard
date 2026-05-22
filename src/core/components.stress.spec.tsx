/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, afterEach, describe, expect, it } from 'vitest';

import { COMPONENT_PROPS } from '@test-utils/component-props';
import { folderBytes } from '@test-utils/perf-harness';
import { getStressResults, measureStress, type StressRecord } from '@test-utils/stress-harness';

const indexModules = import.meta.glob('/src/core/*/index.{ts,tsx}');
const storyModules = import.meta.glob('/src/core/*/_*.stories.{ts,tsx}');

type Entry = {
  name: string;
  folder: string;
  indexLoader: () => Promise<any>;
  storyLoaders: Array<() => Promise<any>>;
};

const byName: Record<string, Entry> = {};
for (const [filePath, loader] of Object.entries(indexModules)) {
  const m = filePath.match(/\/src\/core\/([^/]+)\/index\.tsx?$/);
  if (!m) continue;
  const name = m[1];
  if (name.startsWith('_')) continue;
  byName[name] = {
    name,
    folder: path.resolve(process.cwd(), 'src/core', name),
    indexLoader: loader as () => Promise<any>,
    storyLoaders: [],
  };
}
for (const [filePath, loader] of Object.entries(storyModules)) {
  const m = filePath.match(/\/src\/core\/([^/]+)\/_[^/]+\.stories\.tsx?$/);
  if (!m) continue;
  const name = m[1];
  if (!byName[name]) continue;
  byName[name].storyLoaders.push(loader as () => Promise<any>);
}

const entries = Object.values(byName).sort((a, b) => a.name.localeCompare(b.name));

const SKIP = new Set<string>(
  (process.env.STRESS_SKIP ?? 'Charts,Cropper,Gallery,LottieAnimationLoader,Map,Maps,QrCode,RichTextEditor,SvgImage')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

const isLikelyComponent = (v: unknown): boolean => {
  if (typeof v === 'function') return true;
  if (v && typeof v === 'object') {
    const o = v as { $$typeof?: symbol; render?: unknown };
    return !!o.$$typeof || typeof o.render === 'function';
  }
  return false;
};

const pickComponentFromIndex = (mod: Record<string, any>, name: string): React.ComponentType<unknown> | null => {
  if (mod[name] && isLikelyComponent(mod[name])) return mod[name];
  if (mod.default && isLikelyComponent(mod.default)) return mod.default;
  for (const k of Object.keys(mod)) {
    if (/^[A-Z]/.test(k) && isLikelyComponent(mod[k])) return mod[k];
  }
  return null;
};

const extractVariants = async (
  storyLoaders: Array<() => Promise<any>>,
): Promise<{ Component: React.ComponentType<unknown> | null; variants: Array<Record<string, unknown>> }> => {
  let Component: React.ComponentType<unknown> | null = null;
  const variants: Array<Record<string, unknown>> = [];
  for (const load of storyLoaders) {
    let mod: any;
    try {
      mod = await load();
    } catch {
      continue;
    }
    const meta = mod.default;
    if (meta && isLikelyComponent(meta.component) && !Component) {
      Component = meta.component;
    }
    for (const [key, exp] of Object.entries(mod)) {
      if (key === 'default') continue;
      if (!exp || typeof exp !== 'object') continue;
      const s = exp as { args?: Record<string, unknown>; component?: React.ComponentType<unknown> };
      if (s.component && isLikelyComponent(s.component) && !Component) Component = s.component;
      if (s.args && typeof s.args === 'object') variants.push({ ...s.args });
    }
  }
  return { Component, variants };
};

describe('component stress benchmark', () => {
  it('discovers components and stories', () => {
    expect(entries.length).toBeGreaterThan(0);
    const withStories = entries.filter((e) => e.storyLoaders.length > 0).length;
    // eslint-disable-next-line no-console
    console.log(`[stress] ${entries.length} components, ${withStories} with stories`);
  });

  for (const entry of entries) {
    it(`stress ${entry.name}`, async () => {
      const bytes = folderBytes(entry.folder);
      let record: StressRecord;
      if (SKIP.has(entry.name)) {
        record = {
          name: entry.name,
          variantCount: 0,
          cycles: 0,
          totalRenders: 0,
          totalMs: Infinity,
          maxRenderMs: Infinity,
          avgRenderMs: Infinity,
          bytes,
          rendered: false,
          error: 'skipped (leaks in jsdom — set STRESS_SKIP env to override)',
        };
        getStressResults().push(record);
        expect(record.name).toBe(entry.name);
        return;
      }
      try {
        const { Component: fromStories, variants } = await extractVariants(entry.storyLoaders);
        let Component = fromStories;
        if (!Component) {
          const idx = await entry.indexLoader();
          Component = pickComponentFromIndex(idx, entry.name);
        }
        // Fallback: if no story args found, use the manual prop stub (single
        // variant). Better than skipping the component entirely.
        if (variants.length === 0) {
          variants.push(COMPONENT_PROPS[entry.name] ?? {});
        }
        if (!Component) {
          record = {
            name: entry.name,
            variantCount: variants.length,
            cycles: 0,
            totalRenders: 0,
            totalMs: Infinity,
            maxRenderMs: Infinity,
            avgRenderMs: Infinity,
            bytes,
            rendered: false,
            error: 'no component export found',
          };
          getStressResults().push(record);
        } else {
          record = await measureStress(entry.name, Component, variants, bytes);
        }
      } catch (e) {
        record = {
          name: entry.name,
          variantCount: 0,
          cycles: 0,
          totalRenders: 0,
          totalMs: Infinity,
          maxRenderMs: Infinity,
          avgRenderMs: Infinity,
          bytes,
          rendered: false,
          error: (e as Error)?.message?.slice(0, 200) ?? 'failed',
        };
        getStressResults().push(record);
      }
      expect(record.name).toBe(entry.name);
    });
  }

  afterEach(() => {
    const results = getStressResults();
    if (results.length === 0) return;
    fs.writeFileSync(path.join(process.cwd(), '.stress-results.json'), JSON.stringify(results, null, 2), 'utf8');
    if (typeof (globalThis as any).gc === 'function') (globalThis as any).gc();
  });

  afterAll(() => {
    const results = getStressResults();
    if (results.length === 0) return;
    fs.writeFileSync(path.join(process.cwd(), '.stress-results.json'), JSON.stringify(results, null, 2), 'utf8');
    // eslint-disable-next-line no-console
    console.log(`[stress] wrote .stress-results.json with ${results.length} components`);
  });
});
