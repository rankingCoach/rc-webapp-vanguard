import React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Tabs } from '../Tabs';
import { Story } from './_Tabs.default';

const onChange = fn();

/** `selectionFollowsFocus`: keyboard focus (tabbing in, arrows) selects; a click fires onChange once. */
export const SelectionFollowsFocus: Story = {
  render: () => (
    <div>
      <button type="button">Before</button>
      <Tabs
        selectionFollowsFocus
        onChange={onChange}
        tabs={[
          { label: 'Alpha', value: 'alpha' },
          { label: 'Beta', value: 'beta' },
          { label: 'Gamma', value: 'gamma' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onChange.mockClear();

    await userEvent.click(canvas.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    const alpha = canvas.getByRole('tab', { name: 'Alpha' });
    await expect(alpha).toHaveFocus();
    await expect(alpha).toHaveAttribute('aria-selected', 'true');
    await expect(onChange).toHaveBeenCalledTimes(1);
    await expect(onChange).toHaveBeenLastCalledWith(expect.anything(), 'alpha');

    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    await expect(onChange).toHaveBeenCalledTimes(2);

    await userEvent.click(canvas.getByRole('tab', { name: 'Gamma' }));
    await expect(canvas.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true');
    await expect(onChange).toHaveBeenCalledTimes(3);
    await expect(onChange).toHaveBeenLastCalledWith(expect.anything(), 'gamma');
  },
};
