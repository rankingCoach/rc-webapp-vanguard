import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { render, screen, within } from '../../../test-utils/test-utils';
import { Autocomplete, AutocompleteProps } from './Autocomplete';

type Account = { id: number; name: string };
const ACCOUNTS: Account[] = [
  { id: 1, name: 'Alpha GmbH' },
  { id: 2, name: 'Beta Ltd' },
  { id: 3, name: 'Gamma Inc' },
];
const label = (account: Account) => account.name;
const sameId = (option: Account, value: Account) => option.id === value.id;

const getInput = () => screen.getByRole('combobox') as HTMLInputElement;
const chipLabels = () =>
  Array.from(document.querySelectorAll('.vanguard-input-tags .MuiChip-root')).map((chip) => chip.textContent);

const ControlledMulti = (props: Partial<AutocompleteProps> & { onValue?: (value: Account[]) => void }) => {
  const { onValue, ...rest } = props;
  const [value, setValue] = useState<Account[]>([ACCOUNTS[0]]);
  return (
    <Autocomplete
      testId={'ac'}
      controlled
      multiple
      options={ACCOUNTS}
      value={value}
      getOptionLabel={label}
      isOptionEqualToValue={sameId}
      onChange={(_event, next) => {
        setValue(next as Account[]);
        onValue?.(next as Account[]);
      }}
      {...rest}
    />
  );
};

describe('Autocomplete: controlled value + MUI-style option callbacks', () => {
  afterEach(() => OverlayStackingService.__resetForTests());

  test('controlled single value shows getOptionLabel(value) and follows prop changes', () => {
    const { rerender } = render(
      <Autocomplete
        testId={'ac'}
        controlled
        options={ACCOUNTS}
        value={ACCOUNTS[1]}
        getOptionLabel={label}
        isOptionEqualToValue={sameId}
      />,
    );
    expect(getInput().value).toBe('Beta Ltd');
    rerender(
      <Autocomplete
        testId={'ac'}
        controlled
        options={ACCOUNTS}
        value={{ id: 3, name: 'Gamma Inc' }}
        getOptionLabel={label}
        isOptionEqualToValue={sameId}
      />,
    );
    expect(getInput().value).toBe('Gamma Inc');
  });

  test('controlled value={null} stays empty after a selection the parent ignores', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Autocomplete
        testId={'ac'}
        controlled
        options={ACCOUNTS}
        value={null}
        getOptionLabel={label}
        onChange={onChange}
        blurOnSelect
        clearOnBlur
      />,
    );
    await user.click(getInput());
    await user.click(screen.getByRole('option', { name: 'Alpha GmbH' }));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ACCOUNTS[0], 'selectOption', { option: ACCOUNTS[0] });
    expect(getInput().value).toBe('');
  });

  test('controlled multiple renders chips from value with getOptionLabel and chipSize, isOptionEqualToValue marks selection', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<ControlledMulti chipSize={'small'} onValue={onValue} />);
    expect(chipLabels()).toEqual(['Alpha GmbH']);
    expect(document.querySelector('.vanguard-input-tags .MuiChip-root')).toHaveClass('MuiChip-sizeSmall');

    await user.click(getInput());
    expect(screen.getByRole('option', { name: 'Alpha GmbH' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('option', { name: 'Gamma Inc' }));
    expect(onValue).toHaveBeenLastCalledWith([ACCOUNTS[0], ACCOUNTS[2]]);
    expect(chipLabels()).toEqual(['Alpha GmbH', 'Gamma Inc']);
  });

  test('chips are deletable and disabled with the Autocomplete', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    const { unmount } = render(<ControlledMulti onValue={onValue} />);
    await user.click(within(screen.getByTestId('ac-chip-0')).getByTestId('CancelIcon'));
    expect(onValue).toHaveBeenLastCalledWith([]);
    unmount();
    render(<ControlledMulti disabled />);
    expect(screen.getByTestId('ac-chip-0')).toHaveClass('Mui-disabled');
  });

  test('custom renderOption receives MUI option props and state.selected', async () => {
    const user = userEvent.setup();
    render(
      <ControlledMulti
        disableCloseOnSelect
        renderOption={(optionProps, option: Account, { selected }) => (
          <li {...optionProps} key={option.id}>
            <span data-testid={`row-${option.id}`}>{`${option.name}${selected ? ' ✓' : ''}`}</span>
          </li>
        )}
      />,
    );
    await user.click(getInput());
    expect(screen.getByTestId('row-1')).toHaveTextContent('Alpha GmbH ✓');
    expect(screen.getByTestId('row-2')).toHaveTextContent('Beta Ltd');
    await user.click(screen.getByTestId('row-2'));
    // disableCloseOnSelect keeps the listbox open
    expect(screen.getByTestId('row-2')).toHaveTextContent('Beta Ltd ✓');
  });

  test('showOptionCheckbox prefixes default rows with a checkbox icon', async () => {
    const user = userEvent.setup();
    render(<ControlledMulti showOptionCheckbox />);
    await user.click(getInput());
    const rows = screen.getAllByRole('option');
    expect(rows).toHaveLength(3);
    for (const row of rows) expect(row.querySelector('.vanguard-autocomplete-option-checkbox')).not.toBeNull();
  });

  test('loading shows loadingText; inputAriaLabel names the input', async () => {
    const user = userEvent.setup();
    render(
      <Autocomplete
        testId={'ac'}
        options={[]}
        loading
        loadingText={'Loading API accounts…'}
        inputAriaLabel={'API account'}
        openOnFocus
      />,
    );
    expect(screen.getByRole('combobox', { name: 'API account' })).toBeInTheDocument();
    await user.click(getInput());
    expect(await screen.findByText('Loading API accounts…')).toBeInTheDocument();
  });

  test('custom filterOptions with getOptionLabel (NewExportForm pattern)', async () => {
    const user = userEvent.setup();
    render(
      <ControlledMulti
        filterOptions={(options: Account[], state) =>
          options.filter((option) => option.name.toLowerCase().includes(state.inputValue.trim().toLowerCase()))
        }
      />,
    );
    await user.type(getInput(), 'ta');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Beta Ltd']);
  });
});
