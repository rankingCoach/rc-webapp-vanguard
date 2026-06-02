import { expect } from 'storybook/test';

import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

export const ColorByRankMixedPrecedence: Story = {
  name: 'Rank coloring — mixed precedence (marker.color overrides rank color)',
  args: {
    ...defaultProps,
    colorByRank: true,
    markers: [
      { id: 'a', value: 25, label: 'Alpha', color: '#8B5CF6' }, // explicit — overrides rank
      { id: 'b', value: 75, label: 'Beta' }, // no color → rank-based
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(getMarkers(canvasElement)).toHaveLength(2);
    const pins = Array.from(canvasElement.querySelectorAll('[style*="background"]'));
    const backgrounds = pins.map((el) => (el as HTMLElement).style.background);
    // Alpha has explicit color — must appear, regardless of its rank.
    // Browser normalizes hex to rgb() when reading back el.style.background.
    await expect(backgrounds.some((b) => b === 'rgb(139, 92, 246)')).toBe(true);
    // Beta (rankIndex=1, highest of 2) → default palette last stop = var(--s400)
    await expect(backgrounds.some((b) => b === 'var(--s400)')).toBe(true);
  },
};