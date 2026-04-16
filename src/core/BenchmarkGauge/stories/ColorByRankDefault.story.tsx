import { expect } from 'storybook/test';

import { defaultProps, getMarkers, Story, threeMarkers } from './_BenchmarkGauge.default';

export const ColorByRankDefault: Story = {
  name: 'Rank coloring — colorByRank with default palette (3 markers)',
  args: {
    ...defaultProps,
    markers: threeMarkers,
    colorByRank: true,
  },
  play: async ({ canvasElement }) => {
    // All three markers render with rank-based colors applied
    await expect(getMarkers(canvasElement)).toHaveLength(3);
    // Low marker (value=20, rankIndex=0) → var(--e500) = red
    // Mid marker (value=50, rankIndex=1) → var(--a2900) = amber
    // High marker (value=80, rankIndex=2) → var(--s400) = green
    const pins = Array.from(canvasElement.querySelectorAll('[style*="background"]'));
    const backgrounds = pins.map((el) => (el as HTMLElement).style.background);
    await expect(backgrounds.some((b) => b === 'var(--e500)')).toBe(true);
    await expect(backgrounds.some((b) => b === 'var(--a2900)')).toBe(true);
    await expect(backgrounds.some((b) => b === 'var(--s400)')).toBe(true);
  },
};