import React from 'react';
import { expect, within } from 'storybook/test';

import { makeTabs, resolvedVarColor, sampleLabels, Story, VisualHarness } from './_TabsVisual.default';

const checkLabels = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  sampleLabels.forEach((label, index) => {
    const style = getComputedStyle(canvas.getByText(label));
    if (index === 0) {
      expect(style.fontWeight).toBe('700');
      expect(style.color).toBe(resolvedVarColor('--fn-fg-cta'));
    } else {
      expect(style.fontWeight).toBe('400');
      expect(style.color).toBe(resolvedVarColor('--fn-fg'));
    }
  });
};

export const SelectedLabelHighlight: Story = {
  render: () => <VisualHarness tabs={makeTabs(sampleLabels)} tabConfig={{ theme: 'highlight' }} />,
  play: async ({ canvasElement }) => checkLabels(canvasElement),
};

export const SelectedLabelUnderline: Story = {
  render: () => <VisualHarness tabs={makeTabs(sampleLabels)} tabConfig={{ theme: 'underline' }} />,
  play: async ({ canvasElement }) => checkLabels(canvasElement),
};
