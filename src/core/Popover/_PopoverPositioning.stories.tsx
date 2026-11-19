import type { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Popover } from './Popover';

type Story = StoryObj<typeof Popover>;

/** Info icon tooltip for admin tables: fixed positioning (quirks-mode safe), no width gate, keyboard reachable. */
export const FixedInfoIcon: Story = {
  render: () => (
    <div style={{ padding: 80 }}>
      <Popover
        message={'Share of active users that used ADO at least once in the period.'}
        position={'top'}
        maxWidth={'280px'}
        fixedPosition
        openOnFocus
        wrapChildren={false}
      >
        <span tabIndex={0} data-testid={'info-trigger'} style={{ display: 'inline-flex' }}>
          <Icon hasCircle type={IconSize.small}>
            {IconNames.info}
          </Icon>
        </span>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByTestId('info-trigger');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const tooltip = await within(document.body).findByRole('tooltip');
    await expect(getComputedStyle(tooltip).position).toBe('fixed');
    const tooltipBox = tooltip.getBoundingClientRect();
    const triggerBox = trigger.getBoundingClientRect();
    // Above the trigger and inside the viewport.
    await expect(tooltipBox.top).toBeLessThan(triggerBox.top);
    await expect(tooltipBox.top).toBeGreaterThanOrEqual(0);
    await userEvent.tab();
    await waitFor(() => expect(within(document.body).queryByRole('tooltip')).toBeNull());
  },
};

export const DescribeChildChip: Story = {
  render: () => (
    <div style={{ padding: 80 }}>
      <Popover message={'1001, 1002, 1003'} describeChild openOnFocus fixedPosition wrapChildren={false}>
        <span tabIndex={0} data-testid={'chip'} aria-label={'Custom export for Account IDs 1001, 1002, 1003'}>
          3 Accounts
        </span>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByTestId('chip');
    await userEvent.hover(chip);
    const tooltip = await within(document.body).findByRole('tooltip');
    await expect(chip).toHaveAttribute('aria-describedby', tooltip.id);
  },
};

export default {
  ...SbDecorator({
    title: 'Vanguard/Popover/Positioning',
    component: Popover,
  }),
};
