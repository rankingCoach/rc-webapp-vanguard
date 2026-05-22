import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { GlobalTestWrapper } from './vitest.setup';

export interface PerfRecord {
  name: string;
  mountMs: number;
  rerenderMs: number;
  rerenderCount: number;
  bytes: number;
  rendered: boolean;
  error?: string;
}

const RESULTS: PerfRecord[] = [];

export const pushResult = (r: PerfRecord) => {
  RESULTS.push(r);
};

export const getResults = () => RESULTS;

const repeat = <T>(n: number, fn: () => T): T => {
  let last: T = undefined as unknown as T;
  for (let i = 0; i < n; i++) last = fn();
  return last;
};

const RERENDER_ITERATIONS = 20;
const MOUNT_ITERATIONS = 3;

export const measureComponent = async (
  name: string,
  Component: React.ComponentType<unknown>,
  bytes: number,
  props: Record<string, unknown> = {},
): Promise<PerfRecord> => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const wrap = (extraProps: Record<string, unknown>) =>
    React.createElement(
      GlobalTestWrapper,
      null,
      React.createElement(Component, { ...props, ...extraProps }),
    );

  let root: Root | null = null;
  try {
    // Mount benchmark: mount/unmount MOUNT_ITERATIONS times, take avg.
    const mountStart = performance.now();
    await act(async () => {
      repeat(MOUNT_ITERATIONS, () => {
        const r = createRoot(container);
        r.render(wrap({}));
        r.unmount();
      });
    });
    const mountMs = (performance.now() - mountStart) / MOUNT_ITERATIONS;

    // Re-render benchmark: mount once, force RERENDER_ITERATIONS re-renders.
    root = createRoot(container);
    await act(async () => {
      root!.render(wrap({ __perfKey: 0 }));
    });
    const rerenderStart = performance.now();
    await act(async () => {
      for (let i = 1; i <= RERENDER_ITERATIONS; i++) {
        root!.render(wrap({ __perfKey: i }));
      }
    });
    const rerenderMs = performance.now() - rerenderStart;

    await act(async () => {
      root!.unmount();
    });
    root = null;

    const record: PerfRecord = {
      name,
      mountMs,
      rerenderMs,
      rerenderCount: RERENDER_ITERATIONS,
      bytes,
      rendered: true,
    };
    pushResult(record);
    return record;
  } catch (e) {
    if (root) {
      try {
        await act(async () => {
          root!.unmount();
        });
      } catch {
        /* swallow */
      }
    }
    const record: PerfRecord = {
      name,
      mountMs: Number.POSITIVE_INFINITY,
      rerenderMs: Number.POSITIVE_INFINITY,
      rerenderCount: 0,
      bytes,
      rendered: false,
      error: (e as Error)?.message?.slice(0, 200) ?? 'unknown error',
    };
    pushResult(record);
    return record;
  } finally {
    container.remove();
  }
};

export const folderBytes = (dir: string): number => {
  let total = 0;
  const walk = (d: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === 'stories' || e.name === '__tests__') continue;
        walk(p);
      } else if (e.isFile()) {
        if (/\.(spec|stories|story|test)\.(ts|tsx)$/.test(e.name)) continue;
        if (/^_/.test(e.name)) continue;
        if (/\.(ts|tsx|js|jsx|scss|css)$/.test(e.name)) {
          try {
            total += fs.statSync(p).size;
          } catch {
            /* skip */
          }
        }
      }
    }
  };
  walk(dir);
  return total;
};

const rank = (values: number[]): number[] => {
  // Returns normalized score 0..1 where 1 = best (lowest value).
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return values.map(() => 0);
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const span = max - min || 1;
  return values.map((v) => (Number.isFinite(v) ? 1 - (v - min) / span : 0));
};

export const buildRanking = (records: PerfRecord[]) => {
  const mountScores = rank(records.map((r) => r.mountMs));
  const rerenderScores = rank(records.map((r) => r.rerenderMs));
  const bytesScores = rank(records.map((r) => r.bytes));

  return records
    .map((r, i) => {
      const composite =
        r.rendered ? 0.4 * mountScores[i] + 0.4 * rerenderScores[i] + 0.2 * bytesScores[i] : 0;
      // Map composite (0..1) to 1..10. Failed renders pin to 1.
      const rating = r.rendered ? Math.max(1, Math.min(10, Math.round(1 + composite * 9))) : 1;
      return { ...r, composite, rating };
    })
    .sort((a, b) => b.composite - a.composite);
};

export const writeReport = (
  records: ReturnType<typeof buildRanking>,
  outPath: string,
) => {
  const total = records.length;
  const rendered = records.filter((r) => r.rendered).length;
  const lines: string[] = [];
  lines.push('# Component Performance Ranking');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(
    `Components measured: **${total}** — rendered successfully: **${rendered}**, failed: **${total - rendered}**`,
  );
  lines.push('');
  lines.push('## Scoring');
  lines.push('');
  lines.push(
    '- **mount ms** — avg ms to mount + unmount a fresh component (lower better)',
  );
  lines.push(
    `- **rerender ms** — total ms to force ${RERENDER_ITERATIONS} prop-driven re-renders (lower better)`,
  );
  lines.push('- **bytes** — source file size in folder, excluding stories/specs (lower better)');
  lines.push(
    '- **composite** — `0.4·mount + 0.4·rerender + 0.2·bytes`, normalized across the cohort',
  );
  lines.push(
    '- **rating** — 1..10. 1 = unusable / failed to render. 10 = best-optimized component in the history of mankind.',
  );
  lines.push('');
  lines.push('## Ranking');
  lines.push('');
  lines.push('| # | Component | Rating | Composite | Mount (ms) | Rerender (ms) | Bytes | Notes |');
  lines.push('|---|-----------|-------:|----------:|-----------:|--------------:|------:|-------|');
  records.forEach((r, i) => {
    const mount = r.rendered ? r.mountMs.toFixed(2) : '—';
    const re = r.rendered ? r.rerenderMs.toFixed(2) : '—';
    const composite = r.rendered ? (r.composite * 100).toFixed(1) : '—';
    const notes = r.rendered ? '' : `did not render: ${r.error ?? 'unknown'}`;
    lines.push(
      `| ${i + 1} | ${r.name} | ${r.rating} | ${composite} | ${mount} | ${re} | ${r.bytes} | ${notes} |`,
    );
  });
  lines.push('');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
};
