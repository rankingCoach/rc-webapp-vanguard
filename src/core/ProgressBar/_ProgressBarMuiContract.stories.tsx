import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { ProgressBar } from './ProgressBar';

/**
 * MUI contract (real browser) for ProgressBar over MUI v5 `LinearProgress`.
 * Vanguard colours the bar through the sx selector `& .MuiLinearProgress-bar` and rounds the root through
 * `ProgressBar.module.scss`; these stories pin the painted result so a renamed/re-structured bar goes red.
 */
export default {
  ...SbDecorator({
    title: 'Vanguard/ProgressBar/MUI Contract',
    component: ProgressBar,
  }),
};

type Story = StoryObj<typeof ProgressBar>;

/** Resolves a CSS colour (incl. custom properties) to the browser's computed rgb() string */
const resolveColor = (cssColor: string, host: HTMLElement): string => {
  const probe = document.createElement('span');
  probe.style.backgroundColor = cssColor;
  host.appendChild(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
};

// Bounded wait for MUI transitions to settle under a loaded full-suite run
const SETTLE = { timeout: 5000 };

// `.MuiLinearProgress-bar` is the class Vanguard's sx override targets (src/core/ProgressBar/ProgressBar.tsx:39)
const getBars = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('.MuiLinearProgress-bar'));

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 400, padding: 16 }} data-testid="frame">
    {children}
  </div>
);

export const DeterminateBarGeometryAndColours: Story = {
  render: () => (
    <Frame>
      <ProgressBar progressValue={30} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole('progressbar');
    const [bar] = getBars(root);

    // Track: Vanguard default height 12px, --n200 background, module scss radius 88px
    const rootStyle = getComputedStyle(root);
    await expect(rootStyle.height).toBe('12px');
    await expect(rootStyle.backgroundColor).toBe(resolveColor('var(--n200)', canvasElement));
    await expect(rootStyle.borderTopLeftRadius).toBe('88px');
    await expect(rootStyle.overflow).toBe('hidden');

    // Bar: sx override paints it with --i500 (beats MUI's primary colour). Guard: the token must resolve.
    await expect(resolveColor('var(--i500)', canvasElement)).not.toBe('rgba(0, 0, 0, 0)');
    await expect(getComputedStyle(bar).backgroundColor).not.toBe('rgb(25, 118, 210)');
    await expect(getComputedStyle(bar).backgroundColor).toBe(resolveColor('var(--i500)', canvasElement));

    // Bar is translated so 30% of the track is visible (MUI transition is .4s linear -> wait for it)
    await waitFor(
      () => {
        const rootRect = root.getBoundingClientRect();
        const barRect = bar.getBoundingClientRect();
        expect(Math.round(barRect.right - rootRect.left)).toBe(Math.round(rootRect.width * 0.3));
      },
      SETTLE,
    );
  },
};

export const CustomColoursAndSize: Story = {
  render: () => (
    <Frame>
      <ProgressBar progressValue={50} color="#ff0000" bgColor="--n500" height="20px" width="200px" />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const root = within(canvasElement).getByRole('progressbar');
    const [bar] = getBars(root);

    const rootStyle = getComputedStyle(root);
    await expect(rootStyle.height).toBe('20px');
    await expect(rootStyle.width).toBe('200px');
    await expect(rootStyle.backgroundColor).toBe(resolveColor('var(--n500)', canvasElement));
    await expect(getComputedStyle(bar).backgroundColor).toBe('rgb(255, 0, 0)');
  },
};

export const BlurredOverridesColourAndHeight: Story = {
  render: () => (
    <Frame>
      <ProgressBar progressValue={20} isBlurred color="#ff0000" height="30px" />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const root = within(canvasElement).getByRole('progressbar');
    const [bar] = getBars(root);

    const rootStyle = getComputedStyle(root);
    await expect(rootStyle.height).toBe('5px');
    await expect(rootStyle.filter).toBe('blur(15px)');
    await expect(getComputedStyle(bar).backgroundColor).toBe(resolveColor('var(--n500)', canvasElement));
    await waitFor(
      () => expect(Math.round(bar.getBoundingClientRect().width)).toBe(Math.round(root.getBoundingClientRect().width)),
      SETTLE,
    );
  },
};

export const IndeterminateBarsAnimate: Story = {
  render: () => (
    <Frame>
      <ProgressBar variant="indeterminate" />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const root = within(canvasElement).getByRole('progressbar');
    const bars = getBars(root);

    await expect(bars).toHaveLength(2);
    // Both bars take the Vanguard colour and run a MUI keyframe animation
    for (const bar of bars) {
      await expect(getComputedStyle(bar).backgroundColor).toBe(resolveColor('var(--i500)', canvasElement));
      await expect(getComputedStyle(bar).animationName).not.toBe('none');
    }
  },
};
