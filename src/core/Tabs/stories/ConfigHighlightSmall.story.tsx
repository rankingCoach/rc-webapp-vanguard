import React from 'react';
import { expect, within } from 'storybook/test';

import { barRootOf, heightOf, makeTabs, sampleLabels, Story, VisualHarness } from './_TabsVisual.default';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

export const ConfigHighlightSmall: Story = {
  render: () => (
    <VisualHarness
      className="highlight-bar"
      tabs={makeTabs(sampleLabels)}
      tabConfig={{ theme: 'highlight', tabHeight: 'small' }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');

    tabs.forEach((tab, index) => {
      const style = getComputedStyle(tab);
      expect(style.borderRadius).toBe('8px');
      expect(heightOf(tab)).toBeCloseTo(36, 0);
      if (index === 0) {
        expect(style.backgroundColor).not.toBe(TRANSPARENT);
      } else {
        expect(style.backgroundColor).toBe(TRANSPARENT);
      }
    });

    await expect(barRootOf(canvas.getByRole('tablist')).classList.contains('highlight-bar')).toBe(true);
  },
};

// C16: no tabConfig at all defaults to the highlight theme.
export const ConfigDefaultIsHighlight: Story = {
  render: () => <VisualHarness tabs={makeTabs(sampleLabels)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');

    tabs.forEach((tab, index) => {
      const style = getComputedStyle(tab);
      expect(style.borderRadius).toBe('8px');
      expect(style.borderBottomWidth).toBe('0px');
      expect(style.paddingTop).toBe('14px');
      expect(style.paddingLeft).toBe('16px');
      expect(style.flexGrow).toBe('1');
      if (index === 0) {
        expect(style.backgroundColor).not.toBe(TRANSPARENT);
      } else {
        expect(style.backgroundColor).toBe(TRANSPARENT);
      }
    });
  },
};
