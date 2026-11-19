import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Select } from '@vanguard/Select/Select';
import React, { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { PopoverModal } from './PopoverModal';

/**
 * Layering (watchdog MINOR, plan §27): a Select opened inside a dimmed PopoverModal. Picking an option or pressing on
 * the Select's own backdrop closes only the Select; a press on the PopoverModal's dim backdrop closes the
 * PopoverModal once. Same behaviour on MUI (9d3b75b) and on the own core.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/PopoverModal/Layers', component: PopoverModal }),
};

type Story = StoryObj<typeof PopoverModal>;

const onClose = fn();
const OPTIONS = [
  { key: 'a', value: 'apple', title: 'Apple' },
  { key: 'b', value: 'banana', title: 'Banana' },
];

const Harness = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState('apple');
  return (
    <div style={{ padding: 200 }}>
      <button type="button" ref={setAnchor} data-testid="anchor">
        {'anchor'}
      </button>
      {anchor ? (
        <PopoverModal
          isOpen
          anchorEl={anchor}
          placement="bottom"
          dimRestOfPage
          renderInPortal
          onClose={onClose}
          content={
            <div style={{ background: '#fff', padding: 16, width: 260 }} data-testid="card">
              <Select
                options={OPTIONS}
                value={value}
                translateOptions={false}
                onChange={(
                  _e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                  selected?: { value?: unknown },
                ) => setValue(String(selected?.value))}
              />
            </div>
          }
        />
      ) : null}
    </div>
  );
};

const listbox = () => document.querySelector('[role="listbox"]');

export const SelectInsideClosesOnlyItself: Story = {
  render: () => <Harness />,
  play: async () => {
    onClose.mockClear();
    const card = await waitFor(() => {
      const el = document.querySelector('[data-testid="card"]') as HTMLElement | null;
      if (!el) throw new Error('card not open');
      return el;
    });
    // 1. Option click: Select closes with the new value, PopoverModal stays.
    await userEvent.click(within(card).getByRole('combobox'));
    await waitFor(() => expect(listbox()).not.toBeNull());
    await userEvent.click(within(listbox() as HTMLElement).getByRole('option', { name: 'Banana' }));
    await waitFor(() => expect(listbox()).toBeNull());
    await expect(within(card).getByRole('combobox').textContent).toBe('Banana');
    await expect(onClose).not.toHaveBeenCalled();
    // 2. Press on the Select's own (invisible) backdrop: only the Select closes.
    await userEvent.click(within(card).getByRole('combobox'));
    await waitFor(() => expect(listbox()).not.toBeNull());
    const selectBackdrop = (listbox() as HTMLElement)
      .closest('.MuiModal-root')
      ?.querySelector('.MuiBackdrop-root') as HTMLElement;
    await userEvent.click(selectBackdrop);
    await waitFor(() => expect(listbox()).toBeNull());
    await expect(onClose).not.toHaveBeenCalled();
    await expect(document.querySelector('[data-testid="card"]')).not.toBeNull();
    // 3. Press on the PopoverModal's dim backdrop: it closes once.
    await userEvent.click(document.querySelector('[data-testid="popover-modal-backdrop"]') as HTMLElement);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  },
};
