import { StoryObj } from '@storybook/react';
import { baseStore } from '@stores/redux-base.store';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { DatePicker } from './DatePicker';

export default {
  ...SbDecorator({
    title: 'Vanguard/DatePicker/Keyboard layout',
    component: DatePicker,
    opts: { customStore: baseStore },
  }),
};
export const CompactKeyboardToggle: StoryObj<typeof DatePicker> = {
  beforeEach: () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => {
      const real = original.call(window, query);
      return query.includes('pointer: fine')
        ? { ...real, matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }
        : real;
    }) as typeof window.matchMedia;
    return () => {
      window.matchMedia = original;
    };
  },
  render: () => <DatePicker locale="en_US" value={new Date(2024, 2, 15).getTime()} />,
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    await userEvent.click(within(canvasElement).getByRole('group'));
    const dialog = within(await within(document.body).findByRole('dialog'));
    const pen = dialog.getByRole('button', { name: 'go to text input view' });
    // The legacy pen is a compact toolbar control, not a full-width row above the calendar.
    await expect(pen.getBoundingClientRect().width).toBeLessThan(64);
    const calendarHeader = dialog.getByText('March 2024');
    await expect(pen.getBoundingClientRect().bottom).toBeLessThanOrEqual(calendarHeader.getBoundingClientRect().top);
    await userEvent.click(pen);
    await expect(document.querySelector('[role="dialog"] input')).not.toBeNull();
    await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
  },
};

export const DesktopSeparatorEditing: StoryObj<typeof DatePicker> = {
  render: () => {
    const [value, setValue] = React.useState<number | null | undefined>(new Date(2024, 2, 15).getTime());
    return <DatePicker locale="en_US" value={value ?? undefined} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('group');
    const input = canvasElement.querySelector('input[aria-hidden="true"]')!;
    const [month, day, year] = within(field).getAllByRole('spinbutton');
    month.focus();
    await userEvent.keyboard('/{ArrowRight}');
    await expect(input).toHaveValue('03/15/2024');
    await expect(document.activeElement).toBe(day);
    await userEvent.keyboard('{ArrowLeft}');
    await expect(input).toHaveValue('03/15/2024');
    await expect(document.activeElement).toBe(month);
    await userEvent.keyboard('03');
    day.focus();
    await userEvent.keyboard('21');
    year.focus();
    await userEvent.keyboard('5202');
    await expect(input).toHaveValue('03/21/5202');
    await expect(document.activeElement).toBe(year);
  },
};
