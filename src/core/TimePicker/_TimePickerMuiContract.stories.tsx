/**
 * MUI upgrade contract (S0), real browser: TimePicker.scss hides MUI's `.MuiSelect-icon` and positions its
 * own clock icon over the field.
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { TimePicker } from './TimePicker';

/** Settle wait for transitions/poppers/async assets: 1s is not enough under a loaded full-suite run. */
const SETTLE = { timeout: 5000 };

export default {
  ...SbDecorator({
    title: 'Vanguard/TimePicker/MUI Contract',
    component: TimePicker,
    opts: { withRedux: true, maxWidth: '200px' },
  }),
};

type Story = StoryObj<typeof TimePicker>;

export const MuiSelectIconHidden: Story = {
  args: { id: 'mc-tp', label: 'Start', hourListType: 'half', value: '09:00', testId: 'mc-tp' },
  play: async ({ canvasElement }) => {
    const container = within(canvasElement).getByTestId('mc-tp');
    // `.TimePicker-container .MuiSelect-icon { display: none }`
    const muiIcon = container.querySelector('.MuiSelect-icon') as HTMLElement;
    await expect(muiIcon).not.toBeNull();
    await expect(getComputedStyle(muiIcon).display).toBe('none');
    // `.TimePicker-icon { position: absolute; right: 12px; top: 16px }`
    // vanguard Icon renders only after its SVG asset resolved
    await waitFor(() => expect(container.querySelector('.TimePicker-icon')).not.toBeNull(), SETTLE);
    const clock = container.querySelector('.TimePicker-icon') as HTMLElement;
    await expect(getComputedStyle(clock).position).toBe('absolute');
    await expect(getComputedStyle(clock).right).toBe('12px');
    await expect(getComputedStyle(clock).top).toBe('16px');
    // the clock icon overlaps the field's right side
    const combo = within(canvasElement).getByRole('combobox');
    const field = (combo.closest('.MuiOutlinedInput-root') as HTMLElement).getBoundingClientRect();
    const icon = clock.getBoundingClientRect();
    await expect(icon.right).toBeLessThanOrEqual(field.right);
    await expect(icon.left).toBeGreaterThan(field.left + field.width / 2);
    await expect(combo.textContent).toBe('09:00');
  },
};

export const MenuOpensAndSelects: Story = {
  args: { id: 'mc-tp2', label: 'Start', hourListType: 'half', value: '09:00' },
  play: async ({ canvasElement }) => {
    const combo = within(canvasElement).getByRole('combobox');
    await userEvent.click(combo);
    const listbox = await within(document.body).findByRole('listbox', {}, SETTLE);
    const selected = within(listbox).getByRole('option', { name: '09:00' });
    await expect(selected.getAttribute('aria-selected')).toBe('true');
    // MUI Menu scrolls the selected option into view inside the capped (252px) paper
    const paper = listbox.closest('.MuiPaper-root') as HTMLElement;
    await expect(getComputedStyle(paper).maxHeight).toBe('252px');
    // re-measure on every poll: the paper/scroll position settles after the popover transition
    await waitFor(() => {
      const p = paper.getBoundingClientRect();
      const s = selected.getBoundingClientRect();
      expect(s.top >= p.top - 1 && s.bottom <= p.bottom + 1).toBe(true);
    }, SETTLE);
    await userEvent.click(within(listbox).getByRole('option', { name: '10:30' }));
    await waitFor(() => expect(within(document.body).queryByRole('listbox')).toBeNull(), SETTLE);
    await expect(combo.textContent).toBe('10:30');
  },
};
