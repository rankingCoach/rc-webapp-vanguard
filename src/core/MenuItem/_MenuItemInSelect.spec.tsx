import { InputBase } from '@vanguard/_internal/InputBase/InputBase';
import { MenuItem } from '@vanguard/MenuItem/MenuItem';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor, within } from '../../../test-utils/test-utils';

/**
 * Vanguard's public MenuItem as an option of the public InputBase in select mode (the only consumer path that puts
 * children into a select; `Select` itself takes `options`). It must keep working on the own-core select: selection,
 * keyboard navigation, closed typeahead, disabled items and the selected styling class.
 */
const Field = (props: { onChange?: (e: { target: { value: unknown } }) => void; value?: string }) => (
  <InputBase select label="Fruit" id="fruit" value={props.value} valueAsDefaultValue={false} onChange={props.onChange as never}>
    {[
      <MenuItem key="a" value="apple">
        {'Apple'}
      </MenuItem>,
      <MenuItem key="b" value="banana" disabled>
        {'Banana'}
      </MenuItem>,
      <MenuItem key="c" value="cherry" testId="opt-cherry">
        {'Cherry'}
      </MenuItem>,
    ]}
  </InputBase>
);

describe('Vanguard MenuItem inside the own-core select', () => {
  it('renders as options, marks the selected one and disabled ones, selects on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field value="cherry" onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    const listbox = await screen.findByRole('listbox');
    const [apple, banana, cherry] = within(listbox).getAllByRole('option');
    expect(cherry.getAttribute('aria-selected')).toBe('true');
    expect(cherry.classList.contains('Mui-selected')).toBe(true);
    expect(cherry.getAttribute('data-testid')).toBe('opt-cherry');
    expect(banana.getAttribute('aria-disabled')).toBe('true');
    expect(banana.classList.contains('Mui-disabled')).toBe(true);
    await user.click(apple);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(onChange.mock.calls[0][0].target.value).toBe('apple');
  });

  it('keyboard: ArrowDown skips the disabled item; Enter selects', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field value="apple" onChange={onChange} />);
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}');
    const items = within(await screen.findByRole('listbox')).getAllByRole('option');
    await waitFor(() => expect(document.activeElement).toBe(items[0]));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[2]);
    await user.keyboard('{Enter}');
    expect(onChange.mock.calls[0][0].target.value).toBe('cherry');
  });

  it('closed typeahead selects by the MenuItem text without opening', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field value="apple" onChange={onChange} />);
    screen.getByRole('combobox').focus();
    await user.keyboard('c');
    expect(onChange.mock.calls[0][0].target.value).toBe('cherry');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
