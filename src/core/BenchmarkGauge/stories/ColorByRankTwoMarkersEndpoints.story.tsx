import { expect } from 'storybook/test';

import { defaultProps, getMarkers, Story, twoMarkers } from './_BenchmarkGauge.default';

export const ColorByRankTwoMarkersEndpoints: Story = {
  name: 'Rank coloring — 2 markers map to palette endpoints (semantic distribution)',
  args: {
    ...defaultProps,
    markers: twoMarkers,
    colorByRank: true,
  },
  play: async ({ canvasElement }) => {
    await expect(getMarkers(canvasElement)).toHaveLength(2);
    const pins = Array.from(canvasElement.querySelectorAll('[style*="background"]'));
    const backgrounds = pins.map((el) => (el as HTMLElement).style.background);
    // rankIndex 0 → Math.round(0/1 * 2) = paletteIndex 0 → var(--e500)
    await expect(backgrounds.some((b) => b === 'var(--e500)')).toBe(true);
    // rankIndex 1 → Math.round(1/1 * 2) = paletteIndex 2 → var(--s400) (not var(--a2900))
    await expect(backgrounds.some((b) => b === 'var(--s400)')).toBe(true);
    // The middle color must not appear — proves semantic distribution
    await expect(backgrounds.some((b) => b === 'var(--a2900)')).toBe(false);
  },
};