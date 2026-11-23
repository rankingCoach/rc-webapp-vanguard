import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { userEvent } from 'vitest/browser';

import { DatePicker as FrozenDatePicker } from './_DatePicker.mui-reference';
import { DatePicker } from './DatePicker';

/**
 * Open/close/focus transitions of the own DatePicker against the frozen .472 wrapper (MUI X 9.17), real Playwright
 * input in Chromium. Each story runs one transition on the frozen picker, then on the own picker, and compares where
 * the popup and the focus end up (V2 behaviour pins on production builds; `_DatePicker.mui-reference` is the .472
 * wrapper). Mobile stories force `(pointer: fine)` to false for both pickers.
 */
const meta = { title: 'Vanguard/DatePicker/Behaviour Parity' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const initial = new Date(2024, 2, 15, 13, 42, 56, 789).valueOf();
const desktopPopup = '.MuiPickersPopper-root';
const mobilePopup = '.MuiDialog-root';
let showImpl: ((impl: 'frozen' | 'own' | null) => void) | null = null;
// V2's lane story: plain DatePicker, locale "en", value 15.01.2026 (UTC).
let fixture = { value: initial, locale: 'en_US' };

const Host = () => {
  const [impl, setImpl] = useState<'frozen' | 'own' | null>(null);
  showImpl = setImpl;
  const Impl = impl === 'frozen' ? FrozenDatePicker : DatePicker;
  return (
    <div style={{ padding: 24 }}>
      {/* Own row with a gap: the field's shrunk label overlaps whatever sits directly above the field. */}
      <div style={{ marginBottom: 24 }}>
        <button type="button" data-testid="outside">
          outside
        </button>
        <input data-testid="outside-input" aria-label="outside input" />
        <div data-testid="outside-plain" style={{ display: 'inline-block', width: 80, height: 24 }}>
          plain
        </div>
      </div>
      {impl ? (
        <Impl key={impl} value={fixture.value} locale={fixture.locale} label="Date" onChange={() => undefined} />
      ) : null}
    </div>
  );
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const coarsePointer = () => {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => {
    if (!query.includes('pointer: fine')) return original.call(window, query);
    const noop = () => undefined;
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false,
    } as MediaQueryList;
  }) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
};

type Step =
  | 'clickSectionWhileOpen'
  | 'escapeFromCalendar'
  | 'escapeFromSection'
  | 'pickDayByClick'
  | 'pickDayByEnter'
  | 'pickDayBySpace'
  | 'openYearView'
  | 'tabCycle'
  | 'shiftTabCycle'
  | 'escapeThenReopen'
  | 'mobileOk'
  | 'mobileCancel'
  | 'mobileBackdrop'
  | 'mobileEscape'
  | 'escapeInYearView'
  | 'keyboardYearChoice'
  | 'keyboardYearChoiceNatural'
  | 'openFromDayThenEscape'
  | 'clickAwayButton'
  | 'clickAwayInput'
  | 'clickAwayPlain'
  | 'twoClicksDay0'
  | 'twoClicksDay120';

// `openFrom`: the section clicked to open the picker; without it the field group is clicked (its centre).
const observe = async (canvas: HTMLElement, impl: 'frozen' | 'own', step: Step, openFrom?: 'Day' | 'Month') => {
  const mobile = step.startsWith('mobile');
  const restore = mobile ? coarsePointer() : () => undefined;
  try {
    showImpl?.(impl);
    const popupSelector = mobile ? mobilePopup : desktopPopup;
    const popup = () => document.querySelector<HTMLElement>(popupSelector);
    const field = await waitFor(() => {
      const group = canvas.querySelector<HTMLElement>('[role="group"]');
      if (!group) throw new Error('field not mounted');
      return group;
    });
    const where = () => {
      const active = document.activeElement as HTMLElement | null;
      if (!active || active === document.body) return 'BODY';
      if (field.contains(active)) return `field:${active.getAttribute('aria-label')}`;
      if (popup()?.contains(active)) return `popup:${active.getAttribute('aria-label') ?? active.textContent?.trim()}`;
      return active.getAttribute('data-testid') ?? active.tagName.toLowerCase();
    };
    const section = (name: string) => field.querySelector<HTMLElement>(`[role="spinbutton"][aria-label="${name}"]`)!;
    const button = (text: string) =>
      [...(popup()?.querySelectorAll<HTMLElement>('button') ?? [])].find((b) => b.textContent?.trim() === text);

    const outsideInput = canvas.querySelector<HTMLInputElement>('[data-testid="outside-input"]')!;
    outsideInput.value = 'abc';
    if (step === 'twoClicksDay0' || step === 'twoClicksDay120') {
      // Two real clicks on the Day section of the closed picker: .472 opens on the first and closes on the second at
      // every gap (0 = separate clicks, 60/120/200 ms probed). Playwright's atomic `dblClick` is not asserted: on .472 it
      // completes within one frame, before the popup mounts, so the popup stays open (.472 tooling/timing artifact).
      await userEvent.click(section('Day'));
      if (step === 'twoClicksDay120') await wait(120);
      await userEvent.click(section('Day'));
    } else {
      // Open as V2 does (a click on the field group), or from a section for the opener-dependent cells.
      const from = step === 'openFromDayThenEscape' ? 'Day' : openFrom;
      await userEvent.click(from ? section(from) : field);
      await waitFor(() => expect(popup()).not.toBeNull());
    }
    await wait(400);
    const trace: string[] = [];
    switch (step) {
      case 'clickSectionWhileOpen':
        await userEvent.click(section('Day'));
        break;
      case 'escapeFromCalendar':
        await userEvent.keyboard('{Escape}');
        break;
      case 'escapeFromSection':
        section('Day').focus();
        await userEvent.keyboard('{Escape}');
        break;
      case 'pickDayByClick': {
        const day = [...(popup()?.querySelectorAll<HTMLElement>('[role="gridcell"]') ?? [])].find(
          (cell) => cell.textContent === '20',
        );
        if (day) await userEvent.click(day);
        break;
      }
      case 'pickDayByEnter':
        await userEvent.keyboard('{ArrowRight}{Enter}');
        break;
      case 'pickDayBySpace':
        await userEvent.keyboard('{ArrowRight}[Space]');
        break;
      case 'openYearView': {
        const toggle = popup()?.querySelector<HTMLElement>('[aria-label*="switch to year view" i]');
        if (toggle) await userEvent.click(toggle);
        break;
      }
      case 'tabCycle':
      case 'shiftTabCycle':
        for (let i = 0; i < 6; i++) {
          await userEvent.keyboard(step === 'tabCycle' ? '{Tab}' : '{Shift>}{Tab}{/Shift}');
          trace.push(where());
        }
        break;
      case 'escapeThenReopen':
        await userEvent.keyboard('{Escape}');
        await userEvent.click(field);
        break;
      case 'mobileOk':
        if (button('OK')) await userEvent.click(button('OK')!);
        break;
      case 'mobileCancel':
        if (button('Cancel')) await userEvent.click(button('Cancel')!);
        break;
      case 'mobileBackdrop': {
        const backdrop = document.querySelector<HTMLElement>(`${mobilePopup} .MuiBackdrop-root`);
        if (backdrop)
          await userEvent.click(backdrop, {
            position: { x: 5, y: 5 },
            force: true,
          } as never);
        break;
      }
      case 'mobileEscape':
        await userEvent.keyboard('{Escape}');
        break;
      case 'openFromDayThenEscape':
        await userEvent.keyboard('{Escape}');
        break;
      case 'clickAwayButton':
        await userEvent.click(canvas.querySelector<HTMLElement>('[data-testid="outside"]')!);
        break;
      case 'clickAwayInput':
        // V2: the clicked input keeps focus and receives the typed text.
        await userEvent.click(outsideInput);
        await userEvent.keyboard('x');
        trace.push(`value:${outsideInput.value}`);
        break;
      case 'clickAwayPlain':
        // A click-away on a non-interactive element: MUI X returns focus to the opener section.
        await userEvent.click(canvas.querySelector<HTMLElement>('[data-testid="outside-plain"]')!);
        break;
      case 'twoClicksDay0':
      case 'twoClicksDay120':
        break;
      case 'keyboardYearChoiceNatural': {
        // Keys pressed where focus lands after opening the year view (no manual focus), as V2 does.
        const toggle = popup()?.querySelector<HTMLElement>('[aria-label*="switch to year view" i]');
        if (toggle) await userEvent.click(toggle);
        await wait(300);
        await userEvent.keyboard('{ArrowRight}{Enter}');
        break;
      }
      case 'escapeInYearView':
      case 'keyboardYearChoice': {
        const toggle = popup()?.querySelector<HTMLElement>('[aria-label*="switch to year view" i]');
        if (toggle) await userEvent.click(toggle);
        await wait(300);
        // The selected year takes focus on .472; put it there on both before the keys, as a keyboard user would be.
        popup()
          ?.querySelector<HTMLElement>('.MuiYearCalendar-button.Mui-selected, .MuiYearCalendar-root [tabindex="0"]')
          ?.focus();
        await userEvent.keyboard(step === 'escapeInYearView' ? '{Escape}' : '{ArrowRight}{Enter}');
        break;
      }
    }
    await wait(600);
    const result = {
      open: popup() !== null,
      focus: where(),
      ...(trace.length ? { trace: trace.join(' > ') } : {}),
    };
    showImpl?.(null);
    await waitFor(() => expect(popup()).toBeNull());
    // Leave nothing focused for the next run (an outside input would keep focus across implementations).
    (document.activeElement as HTMLElement | null)?.blur();
    return result;
  } finally {
    restore();
  }
};

const parity = (step: Step, v2Lane = false, openFrom?: 'Day' | 'Month'): Story => ({
  render: () => <Host />,
  play: async ({ canvasElement }) => {
    fixture = v2Lane ? { value: Date.UTC(2026, 0, 15), locale: 'en' } : { value: initial, locale: 'en_US' };
    const frozen = await observe(canvasElement, 'frozen', step, openFrom);
    const own = await observe(canvasElement, 'own', step, openFrom);
    await expect({ step, own }).toEqual({ step, own: frozen });
  },
});

export const ClickSectionWhileOpen = parity('clickSectionWhileOpen');
export const EscapeFromCalendar = parity('escapeFromCalendar');
export const EscapeFromSection = parity('escapeFromSection');
export const PickDayByClick = parity('pickDayByClick');
export const PickDayByEnter = parity('pickDayByEnter');
export const PickDayBySpace = parity('pickDayBySpace');
export const OpenYearView = parity('openYearView');
export const TabCycle = parity('tabCycle');
export const ShiftTabCycle = parity('shiftTabCycle');
export const EscapeThenReopen = parity('escapeThenReopen');
export const MobileOk = parity('mobileOk');
export const MobileCancel = parity('mobileCancel');
export const MobileBackdrop = parity('mobileBackdrop');
export const MobileEscape = parity('mobileEscape');
export const EscapeInYearView = parity('escapeInYearView');
export const KeyboardYearChoice = parity('keyboardYearChoice');
// V2 lane fixture (value 15.01.2026, locale "en").
export const LaneEscapeFromCalendar = parity('escapeFromCalendar', true);
export const LaneEscapeInYearView = parity('escapeInYearView', true);
export const LanePickDayByClick = parity('pickDayByClick', true);
export const LaneKeyboardYearChoice = parity('keyboardYearChoice', true);
export const KeyboardYearChoiceNatural = parity('keyboardYearChoiceNatural');
export const OpenFromDayThenEscape = parity('openFromDayThenEscape');
export const LaneKeyboardYearChoiceNatural = parity('keyboardYearChoiceNatural', true);
export const LaneOpenFromDayThenEscape = parity('openFromDayThenEscape', true);
// V2 final2 table: the picker opened from the Month section (the opener is not the first section).
export const LaneClickAwayButton = parity('clickAwayButton', true);
export const LaneClickAwayInput = parity('clickAwayInput', true);
export const LaneMonthClickAwayButton = parity('clickAwayButton', true, 'Month');
export const LaneMonthClickAwayInput = parity('clickAwayInput', true, 'Month');
export const LaneMonthPickDayByClick = parity('pickDayByClick', true, 'Month');
export const LaneMonthPickDayByEnter = parity('pickDayByEnter', true, 'Month');
export const LaneMonthPickDayBySpace = parity('pickDayBySpace', true, 'Month');
export const LaneMonthEscapeFromSection = parity('escapeFromSection', true, 'Month');
export const LaneMonthMobileOk = parity('mobileOk', true, 'Month');
export const LaneMonthMobileCancel = parity('mobileCancel', true, 'Month');
export const LaneMonthMobileBackdrop = parity('mobileBackdrop', true, 'Month');
export const LaneMonthMobileEscape = parity('mobileEscape', true, 'Month');
export const LaneMonthClickAwayPlain = parity('clickAwayPlain', true, 'Month');
export const LaneTwoClicksDay0 = parity('twoClicksDay0', true);
export const LaneTwoClicksDay120 = parity('twoClicksDay120', true);
