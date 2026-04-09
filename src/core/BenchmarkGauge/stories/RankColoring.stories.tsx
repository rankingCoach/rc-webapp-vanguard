import React from 'react';
import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, Story, twoMarkers, threeMarkers } from './_BenchmarkGauge.default';

// ─── Story 1: existing marker.color still works (regression) ─────────────────
// Proves that explicit per-marker color passes through unchanged when colorByRank
// is not set. No behavioral change for existing consumers.

export const StaticColorRegression: Story = {
  name: 'Rank coloring — static marker.color unchanged (regression)',
  args: {
    ...defaultProps,
    markers: [
      { id: 'a', value: 30, label: 'Alpha', color: '#D946EF' },
      { id: 'b', value: 70, label: 'Beta', color: '#0EA5E9' },
    ],
  },
  play: async ({ canvasElement }) => {
    // Both markers render — static color does not break positioning or rendering
    await expect(getMarkers(canvasElement)).toHaveLength(2);
    // Pins carry the explicit inline background style set by marker.color.
    // Browsers normalize hex colors to rgb() when reading back el.style.background.
    const pins = Array.from(canvasElement.querySelectorAll('[style*="background"]'));
    const hasPurple = pins.some((el) => (el as HTMLElement).style.background === 'rgb(217, 70, 239)');
    const hasBlue   = pins.some((el) => (el as HTMLElement).style.background === 'rgb(14, 165, 233)');
    await expect(hasPurple).toBe(true);
    await expect(hasBlue).toBe(true);
  },
};

// ─── Story 2: colorByRank with internal default palette, 3 markers ────────────
// Shows the default semantic palette (error → amber → success) applied by rank.

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

// ─── Story 3: colorByRank with custom rankColors, 4 markers ──────────────────
// Passes a custom 5-color palette; 4 markers distribute semantically across it.

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

// ─── Story 4: mixed precedence — some markers have explicit color ─────────────
// marker.color always wins. Other markers fall back to rank-based color.

export const ColorByRankMixedPrecedence: Story = {
  name: 'Rank coloring — mixed precedence (marker.color overrides rank color)',
  args: {
    ...defaultProps,
    colorByRank: true,
    markers: [
      { id: 'a', value: 25, label: 'Alpha', color: '#8B5CF6' }, // explicit — overrides rank
      { id: 'b', value: 75, label: 'Beta' },                     // no color → rank-based
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

// ─── Story 5: semantic distribution — 2-marker endpoint proof ─────────────────
// With the 3-color default palette [var(--e500), var(--a2900), var(--s400)],
// 2 markers must resolve to the first and last colors (skipping the middle).
// This proves semantic distribution rather than naive rankColors[rankIndex] lookup.

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
