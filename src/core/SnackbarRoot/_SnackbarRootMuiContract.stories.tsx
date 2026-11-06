import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Button } from '@vanguard/Button/Button';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SnackbarRoot } from './SnackbarRoot';
import { snackbarService } from './SnackBarService';

/**
 * MUI contract (real browser) for SnackbarRoot (MUI v5 `Snackbar` + `Slide direction="left"` passed through
 * `TransitionComponent`, removed in v9). SbDecorator already mounts a SnackbarRoot, so these stories drive it
 * through `snackbarService` and find the toast by its unique message.
 */
export default {
  ...SbDecorator({
    title: 'Vanguard/SnackbarRoot/MUI Contract',
    component: SnackbarRoot,
  }),
};

type Story = StoryObj<typeof SnackbarRoot>;

// Bounded waits for transitions to settle under a loaded full-suite run
const SETTLE_MS = 5000;
const SETTLE = { timeout: SETTLE_MS };
// autoHideDuration (3000, SnackbarRoot.tsx:44) + Slide exit (MUI leavingScreen 195ms) + 5000ms load margin
const AUTO_HIDE_SETTLE = { timeout: 3000 + 195 + SETTLE_MS, interval: 100 };

// The MUI Snackbar root is located through Vanguard's own wrapper (`ComponentContainer className="Snackbar-container"`
// in Snackbar.tsx), not through MUI's `.MuiSnackbar-root` class, which no Vanguard production code depends on.
const findToastRoot = (text: string) =>
  Array.from(document.querySelectorAll<HTMLElement>('.Snackbar-container > *')).find((el) => el.textContent?.includes(text));

/** translateX of a computed transform (matrix(a, b, c, d, tx, ty) or none) */
const translateX = (transform: string) => {
  if (transform === 'none') return 0;
  const parts = transform.match(/matrix\(([^)]+)\)/)?.[1].split(',').map(Number);
  return parts ? parts[4] : NaN;
};

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export const SlidesInFromTheRightAtTopRight: Story = {
  render: () => <div style={{ height: 200 }} />,
  play: async () => {
    const message = `slide-${Date.now()}`;
    snackbarService.openSuccessSnackbar(message);

    // Sample the Slide transform frame by frame until it settles
    const samples: number[] = [];
    let slid: HTMLElement | undefined;
    await waitFor(() => {
      slid = findToastRoot(message)?.firstElementChild as HTMLElement | undefined;
      expect(slid).toBeTruthy();
    }, SETTLE);
    // Time-bounded (not frame-count-bounded) so a slow, loaded run still reaches the settled frame
    const sampleUntil = performance.now() + SETTLE_MS;
    while (performance.now() < sampleUntil) {
      samples.push(translateX(getComputedStyle(slid!).transform));
      if (samples.length > 1 && samples[samples.length - 1] === 0) break;
      await nextFrame();
    }

    // Started off-screen to the right (positive translateX) and ended in place
    await expect(Math.max(...samples)).toBeGreaterThan(0);
    await expect(samples[samples.length - 1]).toBe(0);
    await expect(getComputedStyle(slid!).transform).toBe('none');

    // MUI anchorOrigin top/right (>= sm): fixed, 24px from top and right, z-index 1400
    const root = findToastRoot(message)!;
    const style = getComputedStyle(root);
    await expect(style.position).toBe('fixed');
    await expect(style.zIndex).toBe('1400');
    await expect(style.top).toBe('24px');
    await expect(style.right).toBe('24px');
    const rect = root.getBoundingClientRect();
    await expect(Math.round(rect.top)).toBe(24);
    await expect(Math.round(window.innerWidth - rect.right)).toBe(24);
  },
};

export const EscapeDismissesAndSlidesOutToTheRight: Story = {
  render: () => <div style={{ height: 200 }} />,
  play: async () => {
    const message = `escape-${Date.now()}`;
    snackbarService.openSuccessSnackbar(message);
    await waitFor(() => expect(findToastRoot(message)).toBeTruthy(), SETTLE);
    const slid = findToastRoot(message)!.firstElementChild as HTMLElement;
    await waitFor(() => expect(getComputedStyle(slid).transform).toBe('none'), SETTLE);

    await userEvent.keyboard('{Escape}');

    // Exits to the right, then MUI unmounts the root
    await waitFor(() => expect(translateX(getComputedStyle(slid).transform)).toBeGreaterThan(0), SETTLE);
    await waitFor(() => expect(findToastRoot(message)).toBeUndefined(), SETTLE);
  },
};

export const ClickAwayDismisses: Story = {
  name: '[bug-lock] a click anywhere else dismisses the toast',
  render: () => <Button htmlType="button">{'Elsewhere'}</Button>,
  play: async ({ canvasElement }) => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): SnackbarRoot's onClose ignores MUI's reason, so 'clickaway' closes the toast.
    const message = `clickaway-${Date.now()}`;
    snackbarService.openSuccessSnackbar(message);
    await waitFor(() => expect(findToastRoot(message)).toBeTruthy(), SETTLE);
    const slid = findToastRoot(message)!.firstElementChild as HTMLElement;
    await waitFor(() => expect(getComputedStyle(slid).transform).toBe('none'), SETTLE);

    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Elsewhere' }));

    await waitFor(() => expect(findToastRoot(message)).toBeUndefined(), SETTLE);
  },
};

export const AutoHidesAfterThreeSeconds: Story = {
  render: () => <div style={{ height: 200 }} />,
  play: async () => {
    const message = `autohide-${Date.now()}`;
    const openedAt = performance.now();
    snackbarService.openWarningSnackbar(message);
    await waitFor(() => expect(findToastRoot(message)).toBeTruthy(), SETTLE);

    await waitFor(() => expect(findToastRoot(message)).toBeUndefined(), AUTO_HIDE_SETTLE);
    // 3000ms autoHideDuration (+ exit transition); never earlier
    await expect(performance.now() - openedAt).toBeGreaterThanOrEqual(3000);
  },
};
