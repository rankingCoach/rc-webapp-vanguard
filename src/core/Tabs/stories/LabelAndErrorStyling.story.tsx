import React from 'react';
import { expect, within } from 'storybook/test';

import { resolvedColor, resolvedVarColor, Story, VisualHarness } from './_TabsVisual.default';

/** ReactNode labels: stacked content and the default text colours (unselected 60% black, selected primary blue). */
export const ReactNodeLabel: Story = {
  render: () => (
    <VisualHarness
      width={600}
      tabs={[
        {
          value: 'first',
          label: (
            <>
              <span>Title A</span>
              <span>Subtitle A</span>
            </>
          ),
        },
        {
          value: 'second',
          label: (
            <>
              <span>Title B</span>
              <span>Subtitle B</span>
            </>
          ),
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [selected, unselected] = canvas.getAllByRole('tab');

    await expect(getComputedStyle(selected).flexDirection).toBe('column');
    const title = within(selected).getByText('Title A').getBoundingClientRect();
    const subtitle = within(selected).getByText('Subtitle A').getBoundingClientRect();
    await expect(subtitle.top).toBeGreaterThanOrEqual(title.bottom - 1);

    await expect(getComputedStyle(unselected).color).toBe(resolvedColor('rgba(0, 0, 0, 0.6)'));
    await expect(getComputedStyle(selected).fontFamily).toContain('Roboto');
    await expect(getComputedStyle(selected).color).toBe(resolvedColor('#1976d2'));
  },
};

const errorTabs = [
  { value: 'ok', label: 'Fine' },
  { value: 'broken', label: 'Broken', hasError: true },
];

/** Selected + hasError on the underline theme keeps the 2px CTA underline (theme wins over the error border). */
export const ErrorUnderline: Story = {
  render: () => <VisualHarness width={600} initialValue="broken" tabs={errorTabs} tabConfig={{ theme: 'underline' }} />,
  play: async ({ canvasElement }) => {
    const tab = within(canvasElement).getByRole('tab', { name: 'Broken' });
    const style = getComputedStyle(tab);
    const cta = resolvedVarColor('--fn-bg-cta');
    await expect(style.borderBottomWidth).toBe('2px');
    await expect(style.borderBottomColor).toBe(cta);
    await expect(style.borderTopWidth).toBe('1px');
    await expect(style.borderTopColor).toBe(cta);
  },
};

/** Selected + hasError on the highlight theme shows the 1px error border with an 8px radius. */
export const ErrorHighlight: Story = {
  render: () => <VisualHarness width={600} initialValue="broken" tabs={errorTabs} />,
  play: async ({ canvasElement }) => {
    const tab = within(canvasElement).getByRole('tab', { name: 'Broken' });
    const style = getComputedStyle(tab);
    await expect(style.borderTopWidth).toBe('1px');
    await expect(style.borderTopColor).toBe(resolvedVarColor('--e500'));
    await expect(style.borderTopLeftRadius).toBe('8px');
  },
};
