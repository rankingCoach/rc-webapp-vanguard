import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { DrawerService } from '../DrawerService';
import { DrawerRoot } from './DrawerRoot';

/**
 * Tier P (V2, Chromium): a drawer portal removed while a CSS transition still runs on one of its nodes stays
 * reachable as a Blink "pending activity" (CSSTransition → KeyframeEffect → node), one whole portal per cycle.
 * Escape path: the backdrop's fade; unmount-while-closing path: the own paper's slide. In-page state (playState,
 * transitioncancel) looks normal either way, so this measures reachability: after N cycles and a forced GC, at most
 * a bounded number of portals (React's last committed tree) may stay reachable, never one per cycle.
 * The reachability check needs Chromium with `--js-flags=--expose-gc` (verification harness). Without `window.gc`
 * (the ordinary storybook project) the story still drives both close paths and asserts each portal is removed.
 */
const meta = {
  title: 'Vanguard/Drawer/Transition Release',
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const CYCLES = 20;
// The storybook project's 15 s test timeout fits 10 Escape cycles (≈0.75 s each): two stories cover 20.
const ESCAPE_CYCLES = 10;
const Content = () => (
  <div data-testid="release-content">
    <h2>Track competitors</h2>
    <input aria-label="competitor" />
    <p>You can track up to 5 competitors.</p>
  </div>
);

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const openPortal = async () => {
  let root: HTMLElement | null = null;
  await waitFor(() => {
    root = document.querySelector<HTMLElement>('[data-testid="release-content"]')?.closest('.MuiModal-root') ?? null;
    if (!root) throw new Error('drawer portal not open');
  });
  // Let the enter transition finish so the close starts from the open state.
  await wait(600);
  return new WeakRef(root as unknown as HTMLElement);
};
const detached = async (ref: WeakRef<HTMLElement>) => {
  for (let i = 0; i < 240 && ref.deref()?.isConnected; i++) await frame();
  await expect(ref.deref()?.isConnected ?? false, 'portal removed').toBe(false);
};
/** Portals still reachable after a forced GC, or 0 when GC is not exposed (ordinary storybook runs). */
const reachableAfterGc = async (refs: WeakRef<HTMLElement>[]) => {
  const gc = (window as unknown as { gc?: () => void }).gc;
  if (typeof gc !== 'function') return 0;
  for (let i = 0; i < 5; i++) {
    gc();
    await wait(50);
  }
  return refs.filter((ref) => ref.deref() !== undefined).length;
};

const escapeCycles: Story['play'] = async () => {
  const refs: WeakRef<HTMLElement>[] = [];
  for (let n = 0; n < ESCAPE_CYCLES; n++) {
    DrawerService.open(<Content />, { title: 'Release' });
    const ref = await openPortal();
    refs.push(ref);
    const input = document.querySelector<HTMLInputElement>('[aria-label="competitor"]');
    input?.focus();
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
    await detached(ref);
  }
  await expect(await reachableAfterGc(refs)).toBeLessThanOrEqual(2);
};

export const EscapeClose: Story = { render: () => <DrawerRoot />, play: escapeCycles };
export const EscapeCloseRepeat: Story = { render: () => <DrawerRoot />, play: escapeCycles };

let unmountRoot: (() => void) | null = null;
const UnmountHost = ({ generation }: { generation: number }) => {
  const [mounted, setMounted] = useState(true);
  unmountRoot = () => setMounted(false);
  return <div>{mounted ? <DrawerRoot key={generation} /> : null}</div>;
};
const Remounting = () => {
  const [generation, setGeneration] = useState(0);
  return (
    <div>
      <button type="button" onClick={() => setGeneration((g) => g + 1)}>
        remount
      </button>
      <UnmountHost key={generation} generation={generation} />
    </div>
  );
};

export const UnmountWhileClosing: Story = {
  render: () => <Remounting />,
  play: async ({ canvasElement }) => {
    const refs: WeakRef<HTMLElement>[] = [];
    for (let n = 0; n < CYCLES; n++) {
      const id = DrawerService.open(<Content />, { title: 'Release' });
      const ref = await openPortal();
      refs.push(ref);
      // Like a page/story cleanup: close through the service, then the root unmounts while the paper slides out.
      DrawerService.close(id);
      await frame();
      await frame();
      unmountRoot?.();
      await detached(ref);
      canvasElement.querySelector<HTMLButtonElement>('button')?.click();
      await frame();
    }
    await expect(await reachableAfterGc(refs)).toBeLessThanOrEqual(2);
  },
};
