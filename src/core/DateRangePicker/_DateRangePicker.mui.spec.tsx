/**
 * MUI upgrade contract tests for <DateRangePicker>.
 *
 * DateRangePicker does NOT use @mui/x-date-pickers. Its MUI surface is @mui/material only:
 * 1. <Popper transition> (role="tooltip", portal to body, inline z-index from OverlayStackingService) + <Fade>.
 * 2. Two Vanguard <Input>s (MUI TextField) with `textFieldProps.InputProps.inputComponent` (IMask) and
 *    `textFieldProps.inputProps` (readOnly, data-testid) — both legacy TextField props deprecated in core v6+.
 * 3. <DateRangePickerBaseInputAdornment> (MUI InputAdornment) as end adornment.
 * The calendar / preset list inside the popper is react-date-range (not MUI).
 * Title tags: `[bug-lock]` / `[v5-quirk]` = baseline characterization, not a promised contract (registry:
 * /tmp/mui-upgrade/registry-dates.md). Untagged = contract.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import moment from 'moment';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { act, render, screen, waitFor, within } from '../../../test-utils/test-utils';
import { createDatePickerRange } from './date-range-picker-utils/date-range-picker-utils';
import { DateRangePicker, DateRangePickerProps } from './DateRangePicker';

// Each test opens the MUI calendar popper and drives real transitions (~1s isolated). In a full parallel
// spec run that exceeds the 5s default, so this file gets a longer per-test timeout.
vi.setConfig({ testTimeout: 20_000 });

const TEST_ID = 'drp';
const DEFAULT_PRESETS = [
  'Last 14 days',
  'Last 30 days',
  'Last 6 months',
  'Last 12 months',
  'Last 18 months',
  'Full timeline',
];

const day = (d?: Date) => (d ? moment(d).format('YYYY-MM-DD') : undefined);
const daysAgo = (n: number) => moment().subtract(n, 'day').format('YYYY-MM-DD');

const getLeftContainer = () => screen.getByTestId(`${TEST_ID}-left-reference-container`);
const getRightContainer = () => screen.getByTestId(`${TEST_ID}-right-reference-container`);
const getLeftInput = () => screen.getByTestId('datepicker-reference') as HTMLInputElement;
const getRightInput = () => screen.getByTestId('rangeselector-reference-input') as HTMLInputElement;
const queryPopper = () => screen.queryByRole('tooltip');
const getPopper = () => screen.getByRole('tooltip');
// Vanguard class names on the dropdown (DateRangePicker.tsx), not MUI ones
const isPresetDropdown = () => !!getPopper().querySelector('.date-range-picker-dropdown-predefined');

const renderPicker = (props: Partial<DateRangePickerProps> = {}) =>
  render(
    <div>
      <button type={'button'}>{'outside'}</button>
      <DateRangePicker testId={TEST_ID} {...props} />
    </div>,
  );

const waitForPopperClosed = () => waitFor(() => expect(queryPopper()).toBeNull());
const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

/** react-date-range day buttons of the shown month (passive = other month) */
const clickCalendarDay = async (dayNumber: number) => {
  const button = Array.from(getPopper().querySelectorAll('button.rdrDay:not(.rdrDayPassive)')).find(
    (b) => b.textContent === String(dayNumber),
  ) as HTMLElement;
  expect(button).toBeDefined();
  await userEvent.click(button.querySelector('.rdr-day-number-rc-btn') as HTMLElement);
};

afterEach(() => {
  OverlayStackingService.__resetForTests();
  vi.restoreAllMocks();
});

describe('DateRangePicker contract: initial render', () => {
  test('two read-only inputs: collapsed date input (mask placeholder) and the default preset label', () => {
    renderPicker();

    expect(getLeftInput()).toHaveAttribute('readonly');
    expect(getRightInput()).toHaveAttribute('readonly');
    expect(getLeftInput()).toHaveValue('__ ___ - __ ___');
    expect(getRightInput()).toHaveValue('Last 14 days');
    expect(getLeftContainer()).toHaveClass('input-closed');
    expect(getRightContainer()).not.toHaveClass('input-closed');
    expect(queryPopper()).toBeNull();
  });

  test('each input has a calendar icon end adornment placed after the input', async () => {
    renderPicker();

    for (const input of [getLeftInput(), getRightInput()]) {
      const root = input.parentElement as HTMLElement;
      await waitFor(() => expect(root.querySelector('svg')).not.toBeNull());
      const icon = root.querySelector('svg') as SVGElement;
      expect(input.compareDocumentPosition(icon) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  test('emits onChange(AUTOMATIC) once on mount with the default preset range', async () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    await flush();

    expect(onChange).toHaveBeenCalledTimes(1);
    const [dates, source] = onChange.mock.calls[0];
    expect(source).toBe('AUTOMATIC');
    expect(dates.startDate).toBeInstanceOf(Date);
    expect(dates.endDate).toBeInstanceOf(Date);
    // createDatePickerRange shifts the start by +1 day: "Last 14 days" = today-13 .. today
    expect(day(dates.startDate)).toBe(daysAgo(13));
    expect(day(dates.endDate)).toBe(daysAgo(0));
  });

  test('[bug-lock] startDate/endDate that match no preset: nothing reflects them until the date view is opened', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): rightAbsoluteData is initialised from the props, so the
    // "no preset matched -> switch to date view and format the range" branch never runs. The preset input keeps
    // showing the default label and no AUTOMATIC onChange is emitted for the passed range.
    const onChange = vi.fn();
    renderPicker({ onChange, startDate: new Date(2024, 1, 1), endDate: new Date(2024, 1, 10) });
    await flush();

    expect(getLeftInput()).toHaveValue('__ ___ - __ ___');
    expect(getLeftContainer()).toHaveClass('input-closed');
    expect(getRightInput()).toHaveValue('Last 14 days');
    expect(onChange).not.toHaveBeenCalled();

    // opening the date view shows the passed range
    await userEvent.click(getLeftInput());
    await waitFor(() => expect(getLeftInput()).toHaveValue('01 Feb - 10 Feb'));
  });

  test('custom ranges: the isDefault range is the initial preset label', () => {
    const ranges = [
      createDatePickerRange({
        id: 'a',
        label: 'Range A',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
      }),
      createDatePickerRange({
        id: 'b',
        label: 'Range B',
        startDate: new Date(2024, 1, 1),
        endDate: new Date(2024, 1, 29),
        isDefault: true,
      }),
    ];
    renderPicker({ ranges });

    expect(getRightInput()).toHaveValue('Range B');
  });

  test('custom ranges without isDefault: the first range is the initial preset label', () => {
    const onChange = vi.fn();
    const ranges = [
      createDatePickerRange({
        id: 'a',
        label: 'Range A',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
      }),
      createDatePickerRange({
        id: 'b',
        label: 'Range B',
        startDate: new Date(2024, 1, 1),
        endDate: new Date(2024, 1, 29),
      }),
    ];
    renderPicker({ ranges, onChange });

    expect(getRightInput()).toHaveValue('Range A');
    expect(onChange).toHaveBeenCalledWith(
      { startDate: new Date(2024, 0, 2), endDate: new Date(2024, 0, 31) },
      'AUTOMATIC',
    );
  });

  test('[bug-lock] startDate/endDate matching a custom range: initial preset label is still the default range', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): the startDate/endDate effect sets the matching label, then the
    // default-range effect runs afterwards and overwrites it with the isDefault/first label.
    const ranges = [
      createDatePickerRange({
        id: 'a',
        label: 'Range A',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
        isDefault: true,
      }),
      createDatePickerRange({
        id: 'b',
        label: 'Range B',
        startDate: new Date(2024, 1, 1),
        endDate: new Date(2024, 1, 29),
      }),
    ];
    renderPicker({ ranges, startDate: new Date(2024, 1, 1), endDate: new Date(2024, 1, 29) });
    await flush();

    expect(getRightInput()).toHaveValue('Range A');
  });
});

describe('DateRangePicker contract: popper (MUI Popper + Fade)', () => {
  test('focusing the preset input opens the preset list in a body portal with role="tooltip"', async () => {
    const { container } = renderPicker();

    await userEvent.click(getRightInput());

    const popper = await screen.findByRole('tooltip');
    expect(container.contains(popper)).toBe(false);
    expect(document.body.contains(popper)).toBe(true);
    expect(isPresetDropdown()).toBe(true);
    DEFAULT_PRESETS.forEach((label) => { expect(within(popper).getByRole('button', { name: label })).toBeInTheDocument(); });
  });

  test('registers a popover slot and applies it as inline z-index; releases it on close', async () => {
    renderPicker();

    await userEvent.click(getRightInput());
    const popper = await screen.findByRole('tooltip');

    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);
    expect(popper.style.zIndex).toBe(String(OVERLAY_BASE_Z_INDEX + 1));

    await userEvent.click(screen.getByText('outside'));
    await waitForPopperClosed();
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
  });

  test('stacks above a modal that raised the stacking floor', async () => {
    const hostModalZIndex = OverlayStackingService.register('host-modal', 'modal', 2147483004);
    renderPicker();

    await userEvent.click(getRightInput());
    const popper = await screen.findByRole('tooltip');

    expect(Number(popper.style.zIndex)).toBeGreaterThan(hostModalZIndex);
  });

  test('releases the stacking slot when unmounted while open', async () => {
    const { unmount } = renderPicker();
    await userEvent.click(getRightInput());
    await screen.findByRole('tooltip');

    unmount();

    expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX);
  });

  test('clicking outside after focusing an input closes the popper (Fade exit)', async () => {
    renderPicker();
    await userEvent.click(getRightInput());
    await screen.findByRole('tooltip');

    await userEvent.click(screen.getByText('outside'));

    await waitForPopperClosed();
  });

  test('[bug-lock] clicking the preset container (not the input) opens the popper, which then ignores outside clicks', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): toggleClick sets isRightFocused without focusing the input, so no blur
    // ever clears it and the popper stays open after an outside click.
    renderPicker();

    await userEvent.click(getRightContainer());
    await screen.findByRole('tooltip');
    await userEvent.click(screen.getByText('outside'));
    await flush();

    expect(queryPopper()).not.toBeNull();
  });
});

describe('DateRangePicker contract: presets', () => {
  test('[bug-lock] first open emits onChange(MANUAL) with the unchanged range', async () => {
    // Baseline characterization: not a promised contract.
    const onChange = vi.fn();
    renderPicker({ onChange });
    await flush();
    onChange.mockClear();

    await userEvent.click(getRightInput());
    await screen.findByRole('tooltip');
    await flush();
    // CURRENT BEHAVIOUR (suspected bug): the preset list mounting re-emits the current range as MANUAL
    expect(onChange.mock.calls.map(([d, s]) => [day(d.startDate), day(d.endDate), s])).toEqual([
      [daysAgo(13), daysAgo(0), 'MANUAL'],
    ]);
  });

  test('picking a preset emits onChange(MANUAL) with its range and shows its label', async () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    await userEvent.click(getRightInput());
    await screen.findByRole('tooltip');
    await flush();
    onChange.mockClear();

    await userEvent.click(within(getPopper()).getByRole('button', { name: 'Last 30 days' }));

    expect(getRightInput()).toHaveValue('Last 30 days');
    expect(onChange).toHaveBeenCalledTimes(1);
    const [dates, source] = onChange.mock.calls[0];
    expect(source).toBe('MANUAL');
    expect(day(dates.startDate)).toBe(daysAgo(29));
    expect(day(dates.endDate)).toBe(daysAgo(0));
  });

  test('[bug-lock] clicking a preset button outside its label text selects it but keeps the popper open', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): only the label <div> inside the react-date-range button closes the
    // popper (onSelectionComplete); a click on the button padding selects the range and leaves it open.
    renderPicker();
    await userEvent.click(getRightInput());
    await screen.findByRole('tooltip');

    await userEvent.click(within(getPopper()).getByRole('button', { name: 'Last 6 months' }));
    await flush();

    expect(queryPopper()).not.toBeNull();
    expect(getRightInput()).toHaveValue('Last 6 months');
  });

  test('clicking a preset label text selects it and closes the popper', async () => {
    renderPicker();
    await userEvent.click(getRightInput());
    await screen.findByRole('tooltip');

    await userEvent.click(within(getPopper()).getByText('Last 6 months'));

    await waitForPopperClosed();
    expect(getRightInput()).toHaveValue('Last 6 months');
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
  });

  test('[bug-lock] onDateRangeSelected fires on open with the unchanged range', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): mounting the preset list re-emits the unchanged range through
    // onDateRangeSelected although the user picked nothing yet.
    const onDateRangeSelected = vi.fn();
    renderPicker({ onDateRangeSelected });

    await userEvent.click(getRightInput());
    await screen.findByRole('tooltip');
    await flush();

    expect(onDateRangeSelected.mock.calls.map(([s, e]) => [day(s), day(e)])).toEqual([[daysAgo(13), daysAgo(0)]]);
  });

  test('onDateRangeSelected: picking a preset emits its range and closes the popper', async () => {
    const onDateRangeSelected = vi.fn();
    renderPicker({ onDateRangeSelected });
    await userEvent.click(getRightInput());
    await screen.findByRole('tooltip');
    await flush();

    await userEvent.click(within(getPopper()).getByRole('button', { name: 'Last 30 days' }));

    expect(onDateRangeSelected.mock.calls.at(-1)?.map(day)).toEqual([daysAgo(29), daysAgo(0)]);
    await waitForPopperClosed();
  });

  test('onDateRangeSelected: "Full timeline" emits (undefined, undefined) and closes', async () => {
    const onDateRangeSelected = vi.fn();
    renderPicker({ onDateRangeSelected });
    await userEvent.click(getRightInput());
    await screen.findByRole('tooltip');
    await flush();

    await userEvent.click(within(getPopper()).getByRole('button', { name: 'Full timeline' }));

    expect(onDateRangeSelected).toHaveBeenLastCalledWith(undefined, undefined);
    await waitForPopperClosed();
  });

  test('"Full timeline" emits undefined start/end', async () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    await userEvent.click(getRightInput());
    await screen.findByRole('tooltip');
    await flush();
    onChange.mockClear();

    await userEvent.click(within(getPopper()).getByRole('button', { name: 'Full timeline' }));

    expect(onChange).toHaveBeenLastCalledWith({ startDate: undefined, endDate: undefined }, 'MANUAL');
  });

  test('custom ranges are listed instead of the defaults', async () => {
    const ranges = [
      createDatePickerRange({
        id: 'a',
        label: 'Range A',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
      }),
      createDatePickerRange({
        id: 'b',
        label: 'Range B',
        startDate: new Date(2024, 1, 1),
        endDate: new Date(2024, 1, 29),
      }),
    ];
    renderPicker({ ranges });

    await userEvent.click(getRightInput());
    const popper = await screen.findByRole('tooltip');

    expect(within(popper).getByRole('button', { name: 'Range A' })).toBeInTheDocument();
    expect(within(popper).getByRole('button', { name: 'Range B' })).toBeInTheDocument();
    expect(within(popper).queryByRole('button', { name: 'Last 14 days' })).toBeNull();
  });

  test('minDate removes presets starting before it', async () => {
    renderPicker({ minDate: moment().subtract(2, 'day').toDate() });

    await userEvent.click(getRightInput());
    const popper = await screen.findByRole('tooltip');

    expect(within(popper).getByRole('button', { name: 'Full timeline' })).toBeInTheDocument();
    expect(within(popper).queryByRole('button', { name: 'Last 14 days' })).toBeNull();
    expect(getRightInput()).toHaveValue('Full timeline');
  });
});

describe('DateRangePicker contract: date view', () => {
  test('clicking the date input switches to the date view (onStateChange) and shows the calendar', async () => {
    const onStateChange = vi.fn();
    renderPicker({ onStateChange });

    await userEvent.click(getLeftInput());

    expect(onStateChange).toHaveBeenCalledWith('static-range-picker');
    await waitFor(() => expect(getLeftInput()).not.toHaveAttribute('readonly'));
    expect(getLeftContainer()).not.toHaveClass('input-closed');
    expect(getRightContainer()).toHaveClass('input-closed');
    const popper = await screen.findByRole('tooltip');
    expect(isPresetDropdown()).toBe(false);
    expect(popper.querySelectorAll('button.rdrDay').length).toBeGreaterThan(27);
    // the date input shows the range of the current preset ("Last 14 days")
    const shown = `${moment().subtract(13, 'day').format('DD MMM')} - ${moment().format('DD MMM')}`;
    expect(getLeftInput()).toHaveValue(shown);
  });

  test('clicking the preset input from the date view switches back (onStateChange)', async () => {
    const onStateChange = vi.fn();
    renderPicker({ onStateChange });
    await userEvent.click(getLeftInput());
    await waitFor(() => expect(getRightContainer()).toHaveClass('input-closed'));

    await userEvent.click(getRightInput());

    expect(onStateChange.mock.calls).toEqual([['static-range-picker'], ['date-range-picker']]);
    await waitFor(() => expect(getLeftContainer()).toHaveClass('input-closed'));
  });

  test('the date input is an IMask field ("d m - d m"): clearing shows the mask placeholder', async () => {
    // textFieldProps.InputProps.inputComponent = DateRangePickerIMaskInput (DateRangePicker.tsx:576, legacy prop)
    renderPicker({ state: 'static-range-picker', startDate: new Date(2024, 1, 1), endDate: new Date(2024, 1, 10) });
    await userEvent.click(getLeftInput());
    await screen.findByRole('tooltip');
    expect(getLeftInput()).toHaveValue('01 Feb - 10 Feb');

    await userEvent.keyboard('{Control>}a{/Control}{Backspace}');

    expect(getLeftInput()).toHaveValue('__ ___ - __ ___');
  });

  test('[bug-lock] typing into the IMask field loses the typed start day, keeps the typed end day', async () => {
    // Baseline characterization: not a promised contract.
    renderPicker({ state: 'static-range-picker', startDate: new Date(2024, 1, 1), endDate: new Date(2024, 1, 10) });
    await userEvent.click(getLeftInput());
    await screen.findByRole('tooltip');
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}');

    await userEvent.keyboard('05Feb20Feb');
    await flush();

    // CURRENT BEHAVIOUR: with the IMask overwrite/eager settings the typed start day does not land, the end does
    expect(getLeftInput()).toHaveValue('01 Feb - 20 Feb');
    const edges = Array.from(getPopper().querySelectorAll('.rdrStartEdge, .rdrEndEdge')).map(
      (edge) => edge.closest('button')?.textContent,
    );
    expect(edges).toEqual(['1', '20']);
  });

  test('ranges without dates + later startDate/endDate props: switches to the date view with the passed range', async () => {
    const onChange = vi.fn();
    const ranges = [createDatePickerRange({ id: 'all', label: 'Everything' })];
    const { rerender } = render(<DateRangePicker testId={TEST_ID} ranges={ranges} onChange={onChange} />);
    await flush();
    expect(getRightInput()).toHaveValue('Everything');
    onChange.mockClear();

    rerender(
      <DateRangePicker
        testId={TEST_ID}
        ranges={ranges}
        onChange={onChange}
        startDate={new Date(2024, 1, 1)}
        endDate={new Date(2024, 1, 10)}
      />,
    );
    await flush();

    expect(onChange).toHaveBeenCalledWith(
      { startDate: new Date(2024, 1, 1), endDate: new Date(2024, 1, 10) },
      'AUTOMATIC',
    );
    expect(getLeftInput()).toHaveValue('01 Feb - 10 Feb');
    expect(getRightContainer()).toHaveClass('input-closed');
  });

  test('state="static-range-picker" starts in the date view', () => {
    renderPicker({ state: 'static-range-picker' });

    expect(getRightContainer()).toHaveClass('input-closed');
    expect(getLeftInput()).not.toHaveAttribute('readonly');
  });

  test('clicking two days in the date view emits onDateRangeSelected(start, end) and closes the popper', async () => {
    const onDateRangeSelected = vi.fn();
    const onChange = vi.fn();
    renderPicker({
      onDateRangeSelected,
      onChange,
      state: 'static-range-picker',
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 1, 10),
    });
    await userEvent.click(getLeftInput());
    await screen.findByRole('tooltip');
    onChange.mockClear();

    await clickCalendarDay(12);
    expect(onDateRangeSelected).not.toHaveBeenCalled();
    await clickCalendarDay(20);

    expect(onDateRangeSelected).toHaveBeenCalledTimes(1);
    const [start, end] = onDateRangeSelected.mock.calls[0];
    expect(day(start)).toBe('2024-02-12');
    expect(day(end)).toBe('2024-02-20');
    expect(onChange).toHaveBeenLastCalledWith({ startDate: expect.any(Date), endDate: expect.any(Date) }, 'MANUAL');
    expect(day(onChange.mock.calls.at(-1)?.[0].endDate)).toBe('2024-02-20');
    expect(getLeftInput()).toHaveValue('12 Feb - 20 Feb');
    await waitForPopperClosed();
  });

  test('[v5-quirk] without onDateRangeSelected two day clicks update the input and keep the popper open', async () => {
    // Baseline characterization: not a promised contract.
    renderPicker({ state: 'static-range-picker', startDate: new Date(2024, 1, 1), endDate: new Date(2024, 1, 10) });
    await userEvent.click(getLeftInput());
    await screen.findByRole('tooltip');

    await clickCalendarDay(12);
    await clickCalendarDay(20);
    await flush();

    expect(getLeftInput()).toHaveValue('12 Feb - 20 Feb');
    expect(queryPopper()).not.toBeNull();
  });
});

describe('DateRangePicker contract: adornment', () => {
  const getIcon = async (container: HTMLElement) => {
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull());
    return container.querySelector('svg') as SVGElement;
  };

  test('clicking the preset calendar icon focuses the preset input and opens the preset list', async () => {
    renderPicker();

    await userEvent.click(await getIcon(getRightContainer()));

    expect(getRightInput()).toHaveFocus();
    await screen.findByRole('tooltip');
    expect(isPresetDropdown()).toBe(true);
  });

  test('clicking the collapsed date calendar icon switches to the date view and focuses the date input', async () => {
    const onStateChange = vi.fn();
    renderPicker({ onStateChange });

    await userEvent.click(await getIcon(getLeftContainer()));

    expect(onStateChange).toHaveBeenCalledWith('static-range-picker');
    await waitFor(() => expect(getLeftInput()).toHaveFocus());
    await screen.findByRole('tooltip');
  });
});

describe('DateRangePicker contract: disabled', () => {
  test('inputs are disabled, wrapper gets the disabled class and cursor not-allowed', () => {
    renderPicker({ disabled: true });

    expect(getLeftInput()).toBeDisabled();
    expect(getRightInput()).toBeDisabled();
    const references = screen.getByTestId(`${TEST_ID}-references`);
    expect(references).toHaveClass('date-range-picker-disabled');
    expect(references.style.cursor).toBe('not-allowed');
  });

  test('clicks on containers, inputs and icons open nothing and do not switch the view', async () => {
    const onStateChange = vi.fn();
    renderPicker({ disabled: true, onStateChange });
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    await user.click(getRightContainer());
    await user.click(getLeftContainer());
    await user.click(getLeftInput());
    for (const container of [getLeftContainer(), getRightContainer()]) {
      await waitFor(() => expect(container.querySelector('svg')).not.toBeNull());
      await user.click(container.querySelector('svg') as SVGElement);
    }
    await flush();

    expect(queryPopper()).toBeNull();
    expect(onStateChange).not.toHaveBeenCalled();
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
  });
});
