import React from 'react';
import { expect, within } from 'storybook/test';

import { heightOf, makeTabs, sampleLabels, Story, VisualHarness } from './_TabsVisual.default';

const checkTabs = async (canvasElement: HTMLElement, expectedHeight: number) => {
  const canvas = within(canvasElement);
  const tabs = canvas.getAllByRole('tab');
  tabs.forEach((tab) => {
    const style = getComputedStyle(tab);
    expect(style.paddingTop).toBe('0px');
    expect(style.paddingRight).toBe('0px');
    expect(style.paddingBottom).toBe('0px');
    expect(style.paddingLeft).toBe('0px');
    expect(style.borderBottomWidth).toBe('2px');
    expect(heightOf(tab)).toBeCloseTo(expectedHeight, 0);
  });
  sampleLabels.forEach((label) => {
    const labelStyle = getComputedStyle(canvas.getByText(label));
    expect(labelStyle.paddingTop).toBe('8px');
    expect(labelStyle.paddingBottom).toBe('8px');
    expect(labelStyle.paddingLeft).toBe('16px');
    expect(labelStyle.paddingRight).toBe('16px');
    expect(labelStyle.borderRadius).toBe('8px');
  });
};

export const ConfigUnderline: Story = {
  render: () => (
    <div>
      <div data-testid="default-height">
        <VisualHarness tabs={makeTabs(sampleLabels)} tabConfig={{ theme: 'underline' }} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await checkTabs(canvasElement, 48);
  },
};

export const ConfigUnderlineSmall: Story = {
  render: () => (
    <VisualHarness tabs={makeTabs(sampleLabels)} tabConfig={{ theme: 'underline', tabHeight: 'small' }} />
  ),
  play: async ({ canvasElement }) => {
    await checkTabs(canvasElement, 36);
  },
};
