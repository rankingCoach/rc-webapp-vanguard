import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { GlobalTestWrapper } from './vitest.setup';

export interface StressRecord {
  name: string;
  variantCount: number;
  cycles: number;
  totalRenders: number;
  totalMs: number;
  maxRenderMs: number;
  avgRenderMs: number;
  bytes: number;
  rendered: boolean;
  error?: string;
}

const RESULTS: StressRecord[] = [];

export const pushStress = (r: StressRecord) => {
  RESULTS.push(r);
};

export const getStressResults = () => RESULTS;

const DEFAULT_CYCLES = Number(process.env.STRESS_CYCLES ?? 30);

export const measureStress = async (
  name: string,
  Component: React.ComponentType<unknown>,
  variants: Array<Record<string, unknown>>,
  bytes: number,
  cycles: number = DEFAULT_CYCLES,
): Promise<StressRecord> => {
  if (variants.length === 0) {
    // Caller should never reach this — spec always supplies at least an empty
    // fallback variant — but keep the guard so the harness is well-defined.
    variants = [{}];
  }

  const container = document.createElement('div');
  document.body.appendChild(container);

  const wrap = (props: Record<string, unknown>, key: number) =>
    React.createElement(
      GlobalTestWrapper,
      null,
      React.createElement(Component, { ...props, __stressKey: key }),
    );

  let root: Root | null = null;
  try {
    root = createRoot(container);
    // Initial mount with first variant — not counted in stress total.
    await act(async () => {
      root!.render(wrap(variants[0], 0));
    });

    let total = 0;
    let max = 0;
    let renders = 0;
    for (let c = 0; c < cycles; c++) {
      for (let v = 0; v < variants.length; v++) {
        const props = variants[v];
        const t0 = performance.now();
        await act(async () => {
          root!.render(wrap(props, renders));
        });
        const dt = performance.now() - t0;
        total += dt;
        if (dt > max) max = dt;
        renders++;
      }
    }

    await act(async () => {
      root!.unmount();
    });
    root = null;

    const rec: StressRecord = {
      name,
      variantCount: variants.length,
      cycles,
      totalRenders: renders,
      totalMs: total,
      maxRenderMs: max,
      avgRenderMs: renders > 0 ? total / renders : 0,
      bytes,
      rendered: true,
    };
    pushStress(rec);
    return rec;
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
    const rec: StressRecord = {
      name,
      variantCount: variants.length,
      cycles,
      totalRenders: 0,
      totalMs: Number.POSITIVE_INFINITY,
      maxRenderMs: Number.POSITIVE_INFINITY,
      avgRenderMs: Number.POSITIVE_INFINITY,
      bytes,
      rendered: false,
      error: (e as Error)?.message?.slice(0, 200) ?? 'unknown',
    };
    pushStress(rec);
    return rec;
  } finally {
    container.remove();
  }
};

export const writeStressResults = (outPath: string) => {
  fs.writeFileSync(outPath, JSON.stringify(RESULTS, null, 2), 'utf8');
};
