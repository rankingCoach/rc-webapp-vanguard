import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { ToggleButton } from '@vanguard/ToggleButton/ToggleButton';
import React from 'react';
import { expect, within } from 'storybook/test';
import { ToggleButtonGroup } from './ToggleButtonGroup';

/**
 * Own-core parity (verifier Tier A delta 1): in the segmented variant a disabled middle/last item keeps MUI's
 * `1px solid transparent` left border (MUI's group rule out-ranked the segmented `border: 0` by injection order).
 */
export default {
  ...SbDecorator({ title: 'Vanguard/ToggleButtonGroup/Own Core Parity', component: ToggleButtonGroup }),
};

type Story = StoryObj<typeof ToggleButtonGroup>;

export const SegmentedDisabledItemKeepsTransparentLeftBorder: Story = {
  render: () => (
    <ToggleButtonGroup variant="segmented" value="a" exclusive aria-label="seg">
      <ToggleButton value="a">{'A'}</ToggleButton>
      <ToggleButton value="b" disabled>
        {'B'}
      </ToggleButton>
      <ToggleButton value="c" disabled>
        {'C'}
      </ToggleButton>
    </ToggleButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const [first, middle, last] = within(canvasElement).getAllByRole('button');
    await expect(getComputedStyle(first).borderLeftWidth).toBe('0px');
    for (const el of [middle, last]) {
      const s = getComputedStyle(el);
      await expect(s.borderLeftWidth).toBe('1px');
      await expect(s.borderLeftStyle).toBe('solid');
      await expect(s.borderLeftColor).toBe('rgba(0, 0, 0, 0)');
    }
  },
};
