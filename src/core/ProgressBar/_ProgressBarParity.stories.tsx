import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { StoryObj } from '@storybook/react';
import React from 'react';
import { expect, waitFor } from 'storybook/test';

import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { ProgressBar, ProgressBarProps } from './ProgressBar';
import { ProgressBarMui } from './ProgressBarMui';

/**
 * Track g differential in Chromium: ProgressBar's own markup vs the former MUI LinearProgress path, side by side, with
 * and without VanguardThemeProvider. Computed styles of root and bars, the root box, and the indeterminate animations
 * (timing + keyframes; the keyframes' name differs by design: emotion hash vs vg-linear-progress-*).
 */
const CASES: Record<string, ProgressBarProps> = {
  empty: {},
  v30: { progressValue: 30 },
  v100: { progressValue: 100 },
  frac: { progressValue: 33.3, className: 'mine' },
  indeterminate: { variant: 'indeterminate' },
  blurred: { progressValue: 30, isBlurred: true },
  custom: { progressValue: 60, color: '--s500', bgColor: '--n100', height: '8px', width: '50%' },
};
const ROOT = ['position', 'overflow', 'display', 'height', 'width', 'z-index', 'background-color', 'filter', 'border-radius', 'transform'];
const BAR = ['width', 'position', 'left', 'bottom', 'top', 'transition', 'transform-origin', 'background-color', 'transform', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', '--LinearProgressBar2-barColor'];

const pick = (el: Element | null, props: string[], skip: string[] = []) => {
  if (!el) return null;
  const cs = getComputedStyle(el);
  return Object.fromEntries(props.filter((p) => !skip.includes(p)).map((p) => [p, cs.getPropertyValue(p)]));
};
const anims = (el: Element | null) =>
  el
    ? el.getAnimations().map((a) => ({
        keyframes: (a.effect as KeyframeEffect).getKeyframes().map(({ offset, left, right }) => ({ offset, left, right })),
        timing: (({ duration, delay, iterations, easing }) => ({ duration, delay, iterations, easing }))((a.effect as KeyframeEffect).getTiming()),
      }))
    : [];

const measure = (host: Element) => {
  const root = host.querySelector('.MuiLinearProgress-root');
  const indeterminate = root?.classList.contains('MuiLinearProgress-indeterminate');
  // Animating bars: left/right/transform move every frame — compared through their keyframes instead.
  const skip = indeterminate ? ['left', 'transform'] : [];
  return {
    root: pick(root, ROOT),
    box: root ? (({ width, height }) => ({ width, height }))(root.getBoundingClientRect()) : null,
    bar1: pick(host.querySelector('.MuiLinearProgress-bar1'), BAR, skip),
    bar2: pick(host.querySelector('.MuiLinearProgress-bar2'), BAR, skip),
    anim1: anims(host.querySelector('.MuiLinearProgress-bar1')),
    anim2: anims(host.querySelector('.MuiLinearProgress-bar2')),
  };
};

const Grid = () => (
  <div style={{ width: 400 }}>
    {Object.entries(CASES).map(([name, props]) => (
      <div key={name}>
        <div data-case={name} data-impl="mui">
          <ProgressBarMui {...props} />
        </div>
        <div data-case={name} data-impl="own">
          <ProgressBar {...props} />
        </div>
      </div>
    ))}
  </div>
);

const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await new Promise((r) => setTimeout(r, 600));
  for (const name of Object.keys(CASES)) {
    const get = (impl: string) => canvasElement.querySelector(`[data-case="${name}"][data-impl="${impl}"]`) as Element;
    await waitFor(() => expect({ name, ...measure(get('own')) }).toEqual({ name, ...measure(get('mui')) }));
  }
};

export const DefaultTheme: StoryObj = { render: () => <Grid />, play };
export const VanguardTheme: StoryObj = {
  render: () => (
    <VanguardThemeProvider>
      <Grid />
    </VanguardThemeProvider>
  ),
  play,
};

export default { ...SbDecorator({ title: 'Vanguard/ProgressBar/ParityDifferential', component: ProgressBar }) };
