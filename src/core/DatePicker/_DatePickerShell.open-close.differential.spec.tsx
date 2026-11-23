import '@testing-library/jest-dom/vitest';

import { act, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import { DatePicker as FrozenDatePicker } from './_DatePicker.mui-reference';
import { DatePicker, type DatePickerProps } from './DatePicker';

/**
 * Desktop open/close transitions against the frozen MUI X 9.17 DatePicker (V2 behaviour verdict, production builds):
 * (a) a click on a date section while the popup is open, (b) Escape from the calendar after opening from a section,
 * (c) Escape from a date section while the popup is open.
 */
const initial = new Date(2024, 2, 15, 13, 42, 56, 789).valueOf();
const popupSelector = '.MuiPickersPopper-root';

const finePointer = () =>
  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    matches: query.replace(/^@media\s*/, '') === '(pointer: fine)',
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
  }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

type Step = 'clickSectionWhileOpen' | 'escapeFromCalendar' | 'escapeFromSection';

const observe = async (Impl: React.ComponentType<DatePickerProps>, step: Step) => {
  finePointer();
  const user = userEvent.setup();
  const view = render(<Impl value={initial} locale="en_US" label="Date" onChange={() => undefined} />);
  try {
    const field = view.getByRole('group');
    const section = (name: string) => within(field).getByRole('spinbutton', { name });
    const witness = () => ({
      open: document.querySelector(popupSelector) !== null,
      editor: field.contains(document.activeElement) ? document.activeElement?.getAttribute('aria-label') : null,
      inCalendar: document.querySelector(popupSelector)?.contains(document.activeElement) ?? false,
    });
    await user.click(section('Day'));
    await waitFor(() => expect(document.querySelector(popupSelector)).not.toBeNull());
    if (step === 'clickSectionWhileOpen') {
      await user.click(section('Day'));
    } else if (step === 'escapeFromCalendar') {
      await waitFor(() => expect(witness().inCalendar).toBe(true));
      await user.keyboard('{Escape}');
    } else {
      act(() => section('Day').focus());
      await user.keyboard('{Escape}');
    }
    // Let a closing popup finish its exit before reading the settled state.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return witness();
  } finally {
    view.unmount();
  }
};

it.each(['clickSectionWhileOpen', 'escapeFromCalendar', 'escapeFromSection'] as const)(
  'matches the frozen desktop transition: %s',
  async (step) => {
    const reference = await observe(FrozenDatePicker, step);
    const candidate = await observe(DatePicker, step);
    if (step === 'escapeFromSection') {
      // jsdom only: the frozen picker leaves focus on the pressed section here, while in Chromium it moves to the
      // first section. The focus target is asserted in _DatePickerOpenCloseParity.stories.tsx (real browser).
      expect({ open: candidate.open, inCalendar: candidate.inCalendar }).toEqual({
        open: reference.open,
        inCalendar: reference.inCalendar,
      });
      return;
    }
    expect(candidate).toEqual(reference);
  },
  15000,
);
