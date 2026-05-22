/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, afterEach, describe, expect, it } from 'vitest';

import {
  buildRanking,
  folderBytes,
  getResults,
  measureComponent,
  writeReport,
  type PerfRecord,
} from '@test-utils/perf-harness';

// Eager-load all component index files. Vite resolves these at config time.
const indexModules = import.meta.glob('/src/core/*/index.{ts,tsx}');

const componentEntries: Array<{ name: string; folder: string; loader: () => Promise<any> }> = [];
for (const [filePath, loader] of Object.entries(indexModules)) {
  // filePath like '/src/core/Button/index.ts'
  const m = filePath.match(/\/src\/core\/([^/]+)\/index\.tsx?$/);
  if (!m) continue;
  const name = m[1];
  // Skip internal helper folders (e.g. _internal) — not real components.
  if (name.startsWith('_')) continue;
  const folder = path.resolve(process.cwd(), 'src/core', name);
  componentEntries.push({ name, folder, loader: loader as () => Promise<any> });
}

// Minimal prop stubs for components that crash with empty props. Keep these
// shallow — goal is to render, not to exercise feature-rich states.
const noop = () => {};
const PROPS: Record<string, Record<string, unknown>> = {
  Autocomplete: { options: [], value: '', onChange: noop },
  BenchmarkGauge: { min: 0, max: 100, markers: [] },
  CustomDrawers: { options: [], value: [], title: '', onSave: noop, onClose: noop },
  Documents: { items: [], documents: [], files: [] },
  FadeCarouselAuto: { items: [], children: () => null, renderItem: () => null },
  FadedCarousel: { items: [], children: [] },
  List: { listElements: [], type: 'none' },
  RadioButtonGroup: { value: '', options: [], name: 'perf', setRadioValueFn: noop },
  RelativeTime: { children: new Date() },
  SearchableSelect: { options: [], value: '', onChange: noop },
  SlideTransition: { children: [null, null] },
  Table: { data: { columns: [{ alias: 'a', text: '' }], rows: [] } },
  Tabs: { tabs: [], value: 0, onChange: noop },
  TogglerWithText: {
    left: { component: null },
    right: { component: null },
    togglerState: 'left',
  },
  VideoPlayer: { opts: { src: '' } },
};
componentEntries.sort((a, b) => a.name.localeCompare(b.name));

// Components known to leak in jsdom (third-party libs touching SVG / canvas
// APIs that jsdom does not implement). They are still counted, but skipped at
// render time to keep the run from OOM'ing.
const SKIP_RENDER = new Set<string>(
  (process.env.PERF_SKIP ?? 'Charts,Cropper,Gallery,LottieAnimationLoader,Map,Maps,QrCode,RichTextEditor')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

const isLikelyComponent = (v: unknown): v is React.ComponentType<unknown> => {
  if (typeof v === 'function') return true;
  if (v && typeof v === 'object') {
    const obj = v as { $$typeof?: symbol; render?: unknown; type?: unknown };
    return !!obj.$$typeof || typeof obj.render === 'function' || typeof obj.type === 'function';
  }
  return false;
};

const pickComponent = (mod: Record<string, any>, name: string): React.ComponentType<unknown> | null => {
  if (mod[name] && isLikelyComponent(mod[name])) return mod[name];
  if (mod.default && isLikelyComponent(mod.default)) return mod.default;
  for (const key of Object.keys(mod)) {
    if (/^[A-Z]/.test(key) && isLikelyComponent(mod[key])) return mod[key];
  }
  return null;
};

describe('component perf benchmark', () => {
  it('discovers components', () => {
    expect(componentEntries.length).toBeGreaterThan(0);
    // eslint-disable-next-line no-console
    console.log(`[perf] discovered ${componentEntries.length} component folders`);
  });

  for (const entry of componentEntries) {
    it(`measure ${entry.name}`, async () => {
      const bytes = folderBytes(entry.folder);
      let record: PerfRecord;
      if (SKIP_RENDER.has(entry.name)) {
        record = {
          name: entry.name,
          mountMs: Infinity,
          rerenderMs: Infinity,
          rerenderCount: 0,
          bytes,
          rendered: false,
          error: 'skipped (leaks in jsdom — set PERF_SKIP env to override)',
        };
        getResults().push(record);
        expect(record.name).toBe(entry.name);
        return;
      }
      try {
        const mod = await entry.loader();
        const Component = pickComponent(mod, entry.name);
        if (!Component) {
          record = {
            name: entry.name,
            mountMs: Infinity,
            rerenderMs: Infinity,
            rerenderCount: 0,
            bytes,
            rendered: false,
            error: 'no component export found',
          };
          // Push manually since we bypassed measureComponent.
          getResults().push(record);
        } else {
          record = await measureComponent(entry.name, Component, bytes, PROPS[entry.name] ?? {});
        }
      } catch (e) {
        record = {
          name: entry.name,
          mountMs: Infinity,
          rerenderMs: Infinity,
          rerenderCount: 0,
          bytes,
          rendered: false,
          error: (e as Error)?.message?.slice(0, 200) ?? 'import failed',
        };
        getResults().push(record);
      }
      // Always pass — we record perf, not correctness.
      expect(record.name).toBe(entry.name);
    });
  }

  // Persist progressively so a crash mid-suite still yields a partial report.
  afterEach(() => {
    const results = getResults();
    if (results.length === 0) return;
    fs.writeFileSync(
      path.join(process.cwd(), '.perf-results.json'),
      JSON.stringify(results, null, 2),
      'utf8',
    );
    if (typeof (globalThis as any).gc === 'function') (globalThis as any).gc();
  });

  afterAll(() => {
    const results = getResults();
    if (results.length === 0) return;
    const ranked = buildRanking(results);
    const outDir = process.cwd();
    fs.writeFileSync(
      path.join(outDir, '.perf-results.json'),
      JSON.stringify(ranked, null, 2),
      'utf8',
    );
    writeReport(ranked, path.join(outDir, 'PERF_RANKING.md'));
    // eslint-disable-next-line no-console
    console.log(`[perf] wrote PERF_RANKING.md with ${ranked.length} components`);
  });
});
