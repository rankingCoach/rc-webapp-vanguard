import { StoryObj } from '@storybook/react';
import { baseStore } from '@stores/redux-base.store';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { InputBase } from '@vanguard/_internal/InputBase/InputBase';
import React, { useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { MenuItem } from './MenuItem';

/**
 * Vanguard's public MenuItem as options of InputBase select mode on the own-core select (real browser): keyboard,
 * typeahead, disabled items, selected styling (Select.module.scss targets `.MuiMenuItem-root.Mui-selected`).
 */
export default {
  // InputBase reads the form binding through react-redux (D9 shim), so it needs the base store like other stories.
  ...SbDecorator({ title: 'Vanguard/MenuItem/In Own-Core Select', component: MenuItem, opts: { customStore: baseStore } }),
};

type Story = StoryObj<typeof MenuItem>;

const Field = () => {
  const [value, setValue] = useState('apple');
  return (
    <div style={{ width: 320 }}>
      <InputBase
        select
        label="Fruit"
        id="fruit-menuitem"
        value={value}
        valueAsDefaultValue={false}
        onChange={(e) => setValue(String(e.target.value))}
      >
        {[
          <MenuItem key="a" value="apple">
            {'Apple'}
          </MenuItem>,
          <MenuItem key="b" value="banana" disabled>
            {'Banana'}
          </MenuItem>,
          <MenuItem key="c" value="cherry">
            {'Cherry'}
          </MenuItem>,
        ]}
      </InputBase>
    </div>
  );
};

export const VanguardMenuItemOptions: Story = {
  render: () => <Field />,
  play: async ({ canvasElement }) => {
    const combo = within(canvasElement).getByRole('combobox');
    await userEvent.click(combo);
    const listbox = await screen.findByRole('listbox');
    const [apple, banana, cherry] = within(listbox).getAllByRole('option');
    await expect(apple).toHaveAttribute('aria-selected', 'true');
    await expect(apple.classList.contains('Mui-selected')).toBe(true);
    await expect(getComputedStyle(banana).pointerEvents).toBe('none');
    await waitFor(() => expect(apple).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await expect(cherry).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(combo).toHaveTextContent('Cherry');
    await userEvent.keyboard('a');
    await expect(combo).toHaveTextContent('Apple');
  },
};
