import { expect } from 'storybook/test';

import { getMarkers, Story } from './_BenchmarkGauge.default';

export const ColorByRankCustomPalette: Story = {
  name: 'Rank coloring — colorByRank with custom palette (4 markers)',
  args: {
    min: 0,
    max: 100,
    colorByRank: true,
    rankColors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
    markers: [
      { id: 'a', value: 10, label: 'A' },
      { id: 'b', value: 35, label: 'B' },
      { id: 'c', value: 65, label: 'C' },
      { id: 'd', value: 90, label: 'D' },
    ],
  },
  play: async ({ canvasElement }) => {
    // 4 markers render; rank 0 maps to first palette color, rank 3 to last (index 4).
    await expect(getMarkers(canvasElement)).toHaveLength(4);
    const pins = Array.from(canvasElement.querySelectorAll('[style*="background"]'));
    const backgrounds = pins.map((el) => (el as HTMLElement).style.background);
    // Lowest (rankIndex=0) → '#ef4444'; highest (rankIndex=3) → '#3b82f6'
    // Browsers normalize hex to rgb() when reading back el.style.background.
    await expect(backgrounds.some((b) => b === 'rgb(239, 68, 68)')).toBe(true);
    await expect(backgrounds.some((b) => b === 'rgb(59, 130, 246)')).toBe(true);
  },
};