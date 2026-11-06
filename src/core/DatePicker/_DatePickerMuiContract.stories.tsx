import { StoryObj } from '@storybook/react';
import { baseStore } from '@stores/redux-base.store';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DatePicker, DatePickerProps } from './DatePicker';
import styles from './DatePicker.module.scss';

/**
 * MUI contract (real browser) for DatePicker over @mui/x-date-pickers v5 DesktopDatePicker.
 *
 * Pins what jsdom cannot measure: calendar placement `bottom-end` relative to the field, the computed styles of
 * DatePicker.module.scss `.paper` on the picker paper (PaperProps.className today, slotProps.desktopPaper in v6+),
 * the Vanguard icon position, the stacking z-index, and click-away (closeOnCLickAway) with real pointer events.
 * The calendar portals to <body>, so queries go through `document.body`.
 * Story names tagged `[v5-quirk]` / `[bug-lock]` are baseline characterization, not a promised contract.
 *
 * Mobile: the vitest Playwright instance is a desktop Chromium (`pointer: fine`) and its context options live in
 * vitest.config.ts (no per-story `hasTouch`/`isMobile`), so a real coarse pointer cannot be emulated per story.
 * The Mobile* stories therefore stub `window.matchMedia('(pointer: fine)')` to not match in `beforeEach` (same
 * branch switch as the jsdom spec), and check the real-browser layout of the MUI mobile dialog.
 */
export default {
  ...SbDecorator({
    title: 'Vanguard/DatePicker/MUI Contract',
    component: DatePicker,
    opts: {
      customStore: baseStore,
    },
  }),
};

type Story = StoryObj<typeof DatePicker>;

const MARCH_15_2024 = new Date(2024, 2, 15).getTime();
const body = () => within(document.body);
const stripBidi = (value: string) => value.replace(/[⁦-⁩‎‏]/g, '');
/** settle waits (transitions, popper placement) get a generous timeout: 1s is not enough under a loaded run */
const SETTLE = { timeout: 5000 };

const Stage = (props: Partial<DatePickerProps>) => {
  const [value, setValue] = useState<number | null | undefined>(props.value);
  return (
    <div style={{ padding: '40px 40px 420px 300px' }}>
      <button type={'button'} data-testid={'outside'} style={{ marginBottom: 24 }}>
        {'outside'}
      </button>
      <div data-testid={'field'} style={{ width: 256 }}>
        <DatePicker locale={'en_US'} label={'Pick a date'} {...props} value={value ?? undefined} onChange={setValue} />
      </div>
    </div>
  );
};

const getInput = (canvasElement: HTMLElement) => canvasElement.querySelector('input') as HTMLInputElement;

const openCalendar = async (canvasElement: HTMLElement) => {
  await document.fonts.ready;
  await userEvent.click(within(canvasElement).getByRole('group'));
  const popper = await body().findByRole('dialog', {}, SETTLE);
  const paper = popper.querySelector(`.${styles.paper}`) as HTMLElement;
  await expect(paper).not.toBeNull();
  // wait for the Grow enter transition so the rects are final
  await waitFor(() => expect(getComputedStyle(paper).opacity).toBe('1'), SETTLE);
  await waitFor(() => expect(getComputedStyle(paper).transform).toBe('none'), SETTLE);
  return { popper, paper };
};

const expectClosed = () => waitFor(() => expect(body().queryByRole('dialog')).toBeNull(), SETTLE);

const cleanup = async () => {
  await userEvent.keyboard('{Escape}');
  await expectClosed();
  OverlayStackingService.__resetForTests();
};

export const CalendarPlacementBottomEnd: Story = {
  render: () => <Stage value={MARCH_15_2024} />,
  play: async ({ canvasElement }) => {
    const { popper, paper } = await openCalendar(canvasElement);
    const field = (getInput(canvasElement).closest('.MuiPickersTextField-root') as HTMLElement).getBoundingClientRect();
    const p = paper.getBoundingClientRect();

    await expect(popper).toHaveAttribute('data-popper-placement', 'bottom-end');
    // below the field, right edges aligned (bottom-end), so the paper grows to the left of the 256px field
    await expect(p.top).toBeGreaterThanOrEqual(field.top + 40);
    await expect(Math.abs(p.right - field.right)).toBeLessThanOrEqual(2);
    await expect(p.width).toBeGreaterThan(field.width);
    await expect(p.left).toBeLessThan(field.left);
    await cleanup();
  },
};

export const PaperStyles: Story = {
  render: () => <Stage value={MARCH_15_2024} />,
  play: async ({ canvasElement }) => {
    const { paper } = await openCalendar(canvasElement);
    const style = getComputedStyle(paper);

    // DatePicker.module.scss .paper overrides MUI elevation8 with three Vanguard shadows (!important)
    await expect(style.borderRadius).toBe('4px');
    const shadows = style.boxShadow;
    await expect(shadows).toContain('0px 8px 24px 0px');
    await expect(shadows).toContain('0px 4px 8px 0px');
    await expect(shadows).toContain('0px 2px 2px 0px');
    // exactly three layers (MUI elevation8 alone would be "0px 5px 5px -3px, 0px 8px 10px 1px, 0px 3px 14px 2px")
    await expect(shadows.match(/-?\d+px -?\d+px -?\d+px -?\d+px/g)).toHaveLength(3);
    await expect(shadows).not.toContain('0px 5px 5px -3px');
    await cleanup();
  },
};

export const IconAndInputLayout: Story = {
  render: () => <Stage value={MARCH_15_2024} />,
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByTestId('field').getBoundingClientRect();
    await waitFor(() => expect(canvasElement.querySelector('svg[role="figure"]')).not.toBeNull(), SETTLE);
    const icon = (canvasElement.querySelector('svg[role="figure"]') as SVGElement).getBoundingClientRect();
    const input = getInput(canvasElement);

    // .icon: absolute, right 12px / top 16px inside the field
    await expect(Math.round(field.right - icon.right)).toBe(12);
    await expect(Math.round(icon.top - field.top)).toBe(16);
    await expect(stripBidi(input.value)).toBe('03/15/2024');
    await expect(getComputedStyle(within(canvasElement).getByRole('group')).cursor).toBe('pointer');
  },
};

export const StackingZIndex: Story = {
  render: () => <Stage value={MARCH_15_2024} />,
  play: async ({ canvasElement }) => {
    OverlayStackingService.__resetForTests();
    const { popper } = await openCalendar(canvasElement);

    await expect(Number(getComputedStyle(popper).zIndex)).toBe(OVERLAY_BASE_Z_INDEX + 1);
    await cleanup();
    await expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
  },
};

export const ClickAwayEnabled: Story = {
  render: () => <Stage value={MARCH_15_2024} closeOnCLickAway={true} />,
  play: async ({ canvasElement }) => {
    await openCalendar(canvasElement);
    const calendar = body().getByRole('dialog');

    // weekday headers, arrows and the header label are allow-listed regions: clicking them keeps the calendar open
    await userEvent.click(within(calendar).getAllByRole('columnheader')[0]);
    await userEvent.click(body().getByRole('button', { name: 'Next month' }));
    await waitFor(() => expect(within(calendar).getByText('April 2024')).toBeInTheDocument(), SETTLE);
    // clicking the header label switches to the year view (v5), still open
    await userEvent.click(within(calendar).getByText('April 2024'));
    await expect(await within(calendar).findByRole('button', { name: '2024' }, SETTLE)).toBeInTheDocument();
    await expect(body().queryByRole('dialog')).not.toBeNull();

    await userEvent.click(within(canvasElement).getByTestId('outside'));
    await expectClosed();
    OverlayStackingService.__resetForTests();
  },
};

export const ClickAwayDisabledStillClosesOnClick: Story = {
  name: '[v5-quirk] Click away disabled still closes on click',
  render: () => <Stage value={MARCH_15_2024} />,
  play: async ({ canvasElement }) => {
    await openCalendar(canvasElement);

    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR: without closeOnCLickAway MUI's own popper click-away still closes on a full click
    await userEvent.click(within(canvasElement).getByTestId('outside'));
    await expectClosed();
    OverlayStackingService.__resetForTests();
  },
};

export const PickDayClosesAndShowsValue: Story = {
  render: () => <Stage value={MARCH_15_2024} closeOnCLickAway={true} />,
  play: async ({ canvasElement }) => {
    await openCalendar(canvasElement);

    await userEvent.click(within(body().getByRole('dialog')).getByRole('gridcell', { name: '20' }));

    await expectClosed();
    await expect(stripBidi(getInput(canvasElement).value)).toBe('03/20/2024');
    OverlayStackingService.__resetForTests();
  },
};

/** Make `(pointer: fine)` not match, so the responsive MUI v5 DatePicker renders MobileDatePicker. */
const coarsePointer = () => {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => {
    const real = original.call(window, query);
    if (!query.includes('pointer: fine')) return real;
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  }) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
    OverlayStackingService.__resetForTests();
  };
};

const openMobileDialog = async (canvasElement: HTMLElement) => {
  await document.fonts.ready;
  await userEvent.click(within(canvasElement).getByRole('group'));
  const dialog = await body().findByRole('dialog', {}, SETTLE);
  // The fade is on an ancestor; wait for observable visibility before measuring the dialog.
  await waitFor(() => expect(dialog).toBeVisible(), SETTLE);
  return dialog;
};

export const MobileDialogLayout: Story = {
  beforeEach: coarsePointer,
  render: () => <Stage value={MARCH_15_2024} />,
  play: async ({ canvasElement }) => {
    await expect(getInput(canvasElement)).toHaveAttribute('readonly');
    const dialog = await openMobileDialog(canvasElement);
    const d = dialog.getBoundingClientRect();

    // a modal dialog centred in the viewport, not a popper under the field
    await expect(Math.abs(d.left + d.width / 2 - window.innerWidth / 2)).toBeLessThanOrEqual(2);
    await expect(Math.abs(d.top + d.height / 2 - window.innerHeight / 2)).toBeLessThanOrEqual(2);
    const ok = within(dialog).getByRole('button', { name: 'OK' });
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    await expect(ok).toBeVisible();
    await expect(cancel).toBeVisible();
    // action bar at the bottom of the dialog, OK right of Cancel
    await expect(ok.getBoundingClientRect().left).toBeGreaterThan(cancel.getBoundingClientRect().left);
    await expect(d.bottom - ok.getBoundingClientRect().bottom).toBeLessThan(24);

    await userEvent.click(cancel);
    await expectClosed();
  },
};

export const MobilePickThenOk: Story = {
  beforeEach: coarsePointer,
  render: () => <Stage value={MARCH_15_2024} />,
  play: async ({ canvasElement }) => {
    const dialog = await openMobileDialog(canvasElement);

    await userEvent.click(within(dialog).getByRole('gridcell', { name: '20' }));
    // picking a day does not close on mobile: the dialog waits for OK
    await expect(body().queryByRole('dialog')).not.toBeNull();
    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }));

    await expectClosed();
    await expect(stripBidi(getInput(canvasElement).value)).toBe('03/20/2024');
  },
};

export const MobilePickThenCancel: Story = {
  beforeEach: coarsePointer,
  render: () => <Stage value={MARCH_15_2024} />,
  play: async ({ canvasElement }) => {
    const dialog = await openMobileDialog(canvasElement);

    await userEvent.click(within(dialog).getByRole('gridcell', { name: '20' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await expectClosed();
    await expect(stripBidi(getInput(canvasElement).value)).toBe('03/15/2024');
  },
};

export const MobileDialogZIndex: Story = {
  name: '[bug-lock] Mobile dialog z index',
  beforeEach: coarsePointer,
  render: () => <Stage value={MARCH_15_2024} />,
  play: async ({ canvasElement }) => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): the stacking slot is registered but only applied to the desktop popper;
    // the mobile dialog keeps MUI's static modal z-index.
    const dialog = await openMobileDialog(canvasElement);
    let root: HTMLElement = dialog;
    while (root.parentElement && root.parentElement !== document.body) root = root.parentElement;

    await expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);
    await expect(getComputedStyle(root).zIndex).toBe('1300');

    await userEvent.keyboard('{Escape}');
    await expectClosed();
  },
};
