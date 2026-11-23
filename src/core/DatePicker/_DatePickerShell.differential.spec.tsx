import '@testing-library/jest-dom/vitest';
import type {} from '@mui/x-date-pickers/themeAugmentation';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@test-utils/test-utils';
import React, { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalHost } from '../../primitives/react/Modal/ModalHost';
import { OverlayStackingService } from '../OverlayStacking/OverlayStackingService';
import { DatePicker as FrozenDatePicker } from './_DatePicker.mui-reference';
import { DatePicker, type DatePickerProps } from './DatePicker';
import { dateSection, editDateSection, pasteDate, serializedDateInput } from './date-picker-sections.test-helper';

const fine = '.MuiPickersPopper-root';
const coarse = '.MuiDialog-root';
const fieldSelector = '.MuiPickersInputBase-root';
const initial = new Date(2024, 2, 15, 13, 42, 56, 789).valueOf();
const picked = new Date(2024, 2, 20, 13, 42, 56, 789).valueOf();
const keyboardEdit = new Date(2024, 1, 29, 13, 42, 56, 789).valueOf();
const serialize = (host: ParentNode) => serializedDateInput(host).value.replace(/[\u200e\u200f\u2066-\u2069]/g, '');

const pointer = (startsFine: boolean) => {
  const callbacks = new Set<(event: MediaQueryListEvent) => void>();
  let fineMatches = startsFine;
  vi.stubGlobal('matchMedia', (query: string) => {
    const watched = query.replace(/^@media\s*/, '') === '(pointer: fine)';
    const add = (callback: (event: MediaQueryListEvent) => void) => {
      if (watched) callbacks.add(callback);
    };
    const remove = (callback: (event: MediaQueryListEvent) => void) => {
      if (watched) callbacks.delete(callback);
    };
    return {
      media: query,
      get matches() {
        return watched && fineMatches;
      },
      addEventListener: (_event: string, callback: (event: MediaQueryListEvent) => void) => add(callback),
      removeEventListener: (_event: string, callback: (event: MediaQueryListEvent) => void) => remove(callback),
      addListener: add,
      removeListener: remove,
    };
  });
  return {
    change(next: boolean) {
      fineMatches = next;
      act(() => {
        callbacks.forEach((callback) => {
          callback({ matches: next } as MediaQueryListEvent);
        });
      });
    },
    count: () => callbacks.size,
  };
};

// Mechanism: a test that times out inside settle() leaves its async act() scope open, so every later render in this
// file nests into that scope and never flushes (one timeout failed 41 of 42). Do not lower this back to the default.
// Measured: slowest test 1.5–2.6 s warm, above 5 s cold or under load (the package gate runs 3 workers).
vi.setConfig({ testTimeout: 15000 });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('renders the own DateField through the public DatePicker export', () => {
  pointer(true);
  const view = render(<DatePicker value={initial} locale="en_US" label="Date" />);
  try {
    const group = view.getByRole('group');
    expect(group).toHaveClass('MuiPickersInputBase-root');
    expect(group.closest('[data-vg-core][data-slot="date-field"]')).not.toBeNull();
    view.rerender(<FrozenDatePicker value={initial} locale="en_US" label="Date" />);
    expect(view.getByRole('group').closest('[data-vg-core][data-slot="date-field"]')).toBeNull();
  } finally {
    view.unmount();
  }
});

const settle = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(650);
  });

const overlay = (desktop: boolean): HTMLElement => {
  const popup = document.querySelector<HTMLElement>(desktop ? fine : coarse);
  if (!popup) throw new Error(`Missing ${desktop ? 'desktop' : 'mobile'} overlay`);
  expect(popup.parentElement).toBe(document.body);
  expect(document.querySelector(desktop ? coarse : fine)).toBeNull();
  return popup;
};

const open = (host: HTMLElement) => {
  const group = host.querySelector<HTMLElement>(fieldSelector)!;
  const opener = group.querySelector<HTMLElement>('[role="spinbutton"]')!;
  act(() => opener.focus());
  fireEvent.click(group);
  return opener;
};

const observeSwitch = async (Impl: React.ComponentType<DatePickerProps>, startsFine: boolean) => {
  const media = pointer(startsFine);
  const register = vi.spyOn(OverlayStackingService, 'register');
  const view = render(<Impl value={initial} locale="en_US" label="Date" />);
  try {
    open(view.container);
    const trace = [];
    for (const mode of [startsFine, !startsFine, startsFine]) {
      media.change(mode);
      await settle();
      const popup = overlay(mode);
      const input = serializedDateInput(view.container);
      trace.push({
        placement: popup.getAttribute('data-popper-placement') ? 'anchored' : 'dialog',
        readOnly: input.readOnly,
        choiceLabel: view.container.querySelector(fieldSelector)?.getAttribute('aria-label'),
        focusInOverlay: popup.contains(document.activeElement),
        overlayZ: getComputedStyle(popup).zIndex,
        claimZ: OverlayStackingService.getTopmostZIndex('popover'),
      });
    }
    fireEvent.keyDown(document.activeElement!, { key: 'Escape', code: 'Escape' });
    await settle();
    expect(document.querySelector(`${fine}, ${coarse}`)).toBeNull();
    const claims = register.mock.calls.filter(([, kind]) => kind === 'popover');
    expect(claims).toHaveLength(1);
    expect(OverlayStackingService.getOrder(claims[0][0])).toBe(0);
    return trace;
  } finally {
    view.unmount();
    register.mockRestore();
    expect(media.count()).toBe(0);
  }
};

it.each([true, false])(
  'preserves the open overlay and one claim when pointer mode changes (fine=%s)',
  async (startsFine) => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const reference = await observeSwitch(FrozenDatePicker, startsFine);
    expect(await observeSwitch(DatePicker, startsFine)).toEqual(reference);
  },
);

const observeInterruptedMobileExit = async (Impl: React.ComponentType<DatePickerProps>) => {
  const media = pointer(false);
  const bodyStyle = document.body.getAttribute('style') ?? '';
  const view = render(<Impl value={initial} locale="en_US" label="Date" />);
  try {
    open(view.container);
    await settle();
    const popup = overlay(false);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape', code: 'Escape' });
    expect(popup.isConnected).toBe(true);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    media.change(true);
    media.change(false);
    await settle();
    return {
      portalPresent: Boolean(document.querySelector(`${fine}, ${coarse}`)),
      bodyRestored: (document.body.getAttribute('style') ?? '') === bodyStyle,
      claimZ: OverlayStackingService.getTopmostZIndex('popover'),
    };
  } finally {
    view.unmount();
  }
};

it('does not resurrect a closing mobile overlay after a fine/coarse round trip', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const reference = await observeInterruptedMobileExit(FrozenDatePicker);
  expect(reference).toEqual({ portalPresent: false, bodyRestored: true, claimZ: 1100 });
  expect(await observeInterruptedMobileExit(DatePicker)).toEqual(reference);
});

const observeParent = async (Impl: React.ComponentType<DatePickerProps>, desktop: boolean, removeOnExit: boolean) => {
  const media = pointer(desktop);
  const parentId = 's3-paired-parent';
  const onClose = vi.fn();
  const focusAnchor = <button type="button">Parent control</button>;
  const props = { value: initial, locale: 'en_US', label: 'Date' };
  const tree = (show: boolean) => (
    <ModalHost open data-testid="s3-paired-parent" style={{ zIndex: 1501 }} onClose={onClose}>
      <div role="dialog" aria-label="Parent" tabIndex={-1}>
        {focusAnchor}
        {show && <Impl {...props} />}
      </div>
    </ModalHost>
  );
  const sibling = document.createElement('div');
  sibling.setAttribute('aria-hidden', 'false');
  document.body.append(sibling);
  OverlayStackingService.register(parentId, 'modal', 1500);
  const view = render(tree(false));
  const parent = view.getByTestId('s3-paired-parent');
  const body = () => ({
    style: document.body.getAttribute('style'),
    parentAria: parent.getAttribute('aria-hidden'),
    siblingAria: sibling.getAttribute('aria-hidden'),
    parentClaim: OverlayStackingService.getOrder(parentId),
  });
  try {
    const before = body();
    view.rerender(tree(true));
    const opener = open(parent);
    await settle();
    const popup = overlay(desktop);
    const day = within(popup).getByRole('gridcell', { name: '15' });
    act(() => day.focus());
    expect(popup.contains(document.activeElement)).toBe(true);
    const focusRing = parent.querySelector(fieldSelector)?.classList.contains('Mui-focused');
    const zIndex = getComputedStyle(popup).zIndex;
    fireEvent.keyDown(day, { key: 'Escape', code: 'Escape' });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    const presentAtClose = popup.isConnected;
    if (removeOnExit) view.rerender(tree(false));
    await settle();
    expect(popup.isConnected).toBe(false);
    expect(parent.isConnected).toBe(true);
    expect(body()).toEqual(before);
    expect(onClose).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    if (removeOnExit) expect(media.count()).toBe(0);
    else expect(document.activeElement).toBe(opener);
    return { focusRing, zIndex, presentAtClose, focusRestored: document.activeElement === opener };
  } finally {
    view.unmount();
    OverlayStackingService.unregister(parentId);
    sibling.remove();
  }
};

it.each([
  [true, false],
  [true, true],
  [false, false],
  [false, true],
])('preserves nested parent lifecycle (desktop=%s, unmount on exit=%s)', async (desktop, unmount) => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const reference = await observeParent(FrozenDatePicker, desktop, unmount);
  expect(await observeParent(DatePicker, desktop, unmount)).toEqual(reference);
});

type Action = 'day' | 'OK' | 'Cancel' | 'Escape' | 'keyboard';
const observePublication = async (
  Impl: React.ComponentType<DatePickerProps>,
  action: Action,
  closeOnCLickAway?: boolean,
) => {
  const desktop = action === 'day';
  pointer(desktop);
  const changes: { value: number | null | undefined; overlay: boolean; z: number }[] = [];
  const Fixture = () => {
    const [value, setValue] = useState<number | undefined>(initial);
    return (
      <Impl
        value={value}
        locale="en_US"
        label="Date"
        closeOnCLickAway={closeOnCLickAway}
        onChange={(next) => {
          changes.push({
            value: next,
            overlay: Boolean(document.querySelector(desktop ? fine : coarse)),
            z: OverlayStackingService.getTopmostZIndex('popover'),
          });
          setValue(next ?? undefined);
        }}
      />
    );
  };
  const view = render(<Fixture />);
  try {
    open(view.container);
    await settle();
    const popup = overlay(desktop);
    const content = within(popup);
    const press = (button: HTMLElement) => {
      if (closeOnCLickAway) {
        fireEvent.mouseDown(button);
        expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(1101);
      }
      fireEvent.click(button);
    };
    if (action === 'keyboard') {
      press(content.getByRole('button', { name: 'go to text input view' }));
      pasteDate(serializedDateInput(popup), '02/31/2024');
      expect(changes).toEqual([]);
      pasteDate(serializedDateInput(popup), '02/29/2024');
      expect(changes.map(({ value }) => value)).toEqual([keyboardEdit]);
      press(content.getByRole('button', { name: 'go to calendar view' }));
      press(content.getByRole('button', { name: 'OK' }));
    } else {
      fireEvent.click(content.getByRole('gridcell', { name: '20' }));
      expect(changes.map(({ value }) => value)).toEqual([picked]);
      if (action === 'Escape') fireEvent.keyDown(document.activeElement!, { key: 'Escape', code: 'Escape' });
      else if (action !== 'day') fireEvent.click(content.getByRole('button', { name: action }));
    }
    await settle();
    expect(popup.isConnected).toBe(false);
    expect(changes.every(({ overlay, z }) => overlay && z === 1101)).toBe(true);
    return {
      changes,
      value: serialize(view.container),
      afterClaim: OverlayStackingService.getTopmostZIndex('popover'),
    };
  } finally {
    view.unmount();
  }
};

it.each(['day', 'OK', 'Cancel', 'Escape', 'keyboard'] as const)(
  'matches the frozen %s publication trace',
  async (action) => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const reference = await observePublication(FrozenDatePicker, action);
    expect(await observePublication(DatePicker, action)).toEqual(reference);
  },
);

const replacement = new Date(2024, 2, 25, 9, 17, 22, 345).valueOf();

it('keeps mobile keyboard actions open until click with consumer click-away enabled', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const reference = await observePublication(FrozenDatePicker, 'keyboard');
  expect(await observePublication(DatePicker, 'keyboard', true)).toEqual(reference);
});

const observeControlledCancel = async (Impl: React.ComponentType<DatePickerProps>, closeOnCLickAway?: boolean) => {
  pointer(false);
  const changes: Array<{ value: number | null | undefined; dialogOpen: boolean; claim: number }> = [];
  const Fixture = () => {
    const [value, setValue] = useState<number | undefined>(initial);
    return (
      <>
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          data-testid="replace-date"
          onClick={() => setValue(replacement)}
        />
        <Impl
          value={value}
          locale="en_US"
          label="Date"
          closeOnCLickAway={closeOnCLickAway}
          onChange={(next) => {
            changes.push({
              value: next,
              dialogOpen: Boolean(document.querySelector(coarse)),
              claim: OverlayStackingService.getTopmostZIndex('popover'),
            });
            setValue(next ?? undefined);
          }}
        />
      </>
    );
  };
  const view = render(<Fixture />);
  try {
    open(view.container);
    await settle();
    const popup = overlay(false);
    const calendar = within(popup);
    const selectedDay = () => calendar.getByRole('gridcell', { selected: true }).textContent;
    fireEvent.click(calendar.getByRole('gridcell', { name: '20' }));
    const selectedAfterPick = selectedDay();
    const fieldAfterPick = serialize(view.container);
    fireEvent.click(view.getByTestId('replace-date'));
    expect(popup).toBeInTheDocument();
    const selectedAfterReplacement = selectedDay();
    const fieldAfterReplacement = serialize(view.container);
    const cancel = calendar.getByRole('button', { name: 'Cancel' });
    if (closeOnCLickAway) {
      fireEvent.mouseDown(cancel);
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(1101);
    }
    fireEvent.click(cancel);
    await settle();
    expect(popup).not.toBeInTheDocument();
    return {
      selectedAfterPick,
      fieldAfterPick,
      selectedAfterReplacement,
      fieldAfterReplacement,
      fieldAfterCancel: serialize(view.container),
      changes,
    };
  } finally {
    view.unmount();
  }
};

it('matches the frozen Cancel after the parent replaces an accepted day in an open mobile picker', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const reference = await observeControlledCancel(FrozenDatePicker);
  expect(reference).toEqual({
    selectedAfterPick: '20',
    fieldAfterPick: '03/20/2024',
    selectedAfterReplacement: '25',
    fieldAfterReplacement: '03/25/2024',
    fieldAfterCancel: '03/15/2024',
    changes: [
      { value: picked, dialogOpen: true, claim: 1101 },
      { value: initial, dialogOpen: true, claim: 1101 },
    ],
  });
  expect(await observeControlledCancel(DatePicker)).toEqual(reference);
});

it('keeps the controlled mobile Cancel rollback and publication order with consumer click-away enabled', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const reference = await observeControlledCancel(FrozenDatePicker);
  expect(await observeControlledCancel(DatePicker, true)).toEqual(reference);
});

it.each([
  ['outside button', true],
  ['foreign dialog', true],
  ['backdrop', true],
  ['backdrop', false],
] as const)('preserves mobile outside dismissal for %s (click-away enabled=%s)', async (target, closeOnCLickAway) => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  pointer(false);
  const onChange = vi.fn();
  const view = render(
    <>
      <button type="button">Outside</button>
      <div role="dialog" className="MuiDialog-paper" data-testid="foreign-dialog" />
      <DatePicker value={initial} locale="en_US" closeOnCLickAway={closeOnCLickAway} onChange={onChange} />
    </>,
  );
  try {
    const opener = open(view.container);
    await settle();
    const popup = overlay(false);
    const outside = {
      'outside button': view.getByText('Outside'),
      'foreign dialog': view.getByTestId('foreign-dialog'),
      backdrop: popup.querySelector<HTMLElement>('[data-slot="modal-backdrop"]')!,
    }[target];
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(1101);
    if (closeOnCLickAway) fireEvent.mouseDown(outside);
    else fireEvent.click(outside);
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(1100);
    expect(popup.isConnected).toBe(true);
    await settle();
    expect(popup).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
    expect(onChange).not.toHaveBeenCalled();
  } finally {
    view.unmount();
  }
});

type FieldEdit = { section: number; text: string } | { deleteSection: number } | 'parent rerender' | 'external NaN';

const typedDate: FieldEdit[] = [
  { section: 0, text: '0' },
  { section: 0, text: '3' },
  { section: 1, text: '2' },
  { section: 1, text: '0' },
  { section: 2, text: '2' },
  { section: 2, text: '0' },
  { section: 2, text: '2' },
  { section: 2, text: '4' },
];

const observeFieldEditing = (
  Impl: React.ComponentType<DatePickerProps>,
  edits: FieldEdit[],
  initialValue: number | undefined,
  echo: boolean,
) => {
  pointer(true);
  const changes: (number | 'NaN' | 'undefined' | 'null')[] = [];
  const Fixture = ({ revision, external }: { revision: number; external?: number }) => {
    const [value, setValue] = useState(initialValue);
    return (
      <div data-revision={revision}>
        <Impl
          value={external ?? value}
          locale="en_US"
          label="Date"
          onChange={(next) => {
            changes.push(next === undefined ? 'undefined' : next === null ? 'null' : Number.isNaN(next) ? 'NaN' : next);
            if (echo) setValue(next ?? undefined);
          }}
        />
      </div>
    );
  };
  const view = render(<Fixture revision={0} />);
  try {
    return edits.map((edit, index) => {
      const input = serializedDateInput(view.container);
      const since = changes.length;
      if (typeof edit === 'string') {
        view.rerender(<Fixture revision={index + 1} external={edit === 'external NaN' ? NaN : undefined} />);
      } else if ('deleteSection' in edit) {
        const section = dateSection(input, edit.deleteSection);
        fireEvent.focus(section);
        fireEvent.keyDown(section, { key: 'Delete' });
      } else {
        editDateSection(input, edit.section, edit.text);
      }
      return { edit, callbacks: changes.slice(since), field: serialize(view.container) };
    });
  } finally {
    view.unmount();
  }
};

const february = new Date(2024, 1, 15).valueOf();
const pickerEdits: Array<{ name: string; edits: FieldEdit[]; value?: number; echo: boolean }> = [
  { name: 'typing with parent echo', edits: typedDate, echo: true },
  { name: 'typing without a parent echo', edits: typedDate, echo: false },
  {
    name: 'symbol rejected after a partial entry',
    edits: [
      { section: 0, text: '3' },
      { section: 0, text: '!' },
    ],
    echo: false,
  },
  { name: 'accepted deletion', edits: [{ deleteSection: 2 }], value: picked, echo: true },
  { name: 'rejected deletion', edits: [{ deleteSection: 2 }, 'parent rerender'], value: picked, echo: false },
  {
    name: 'rejected February 31',
    edits: [{ section: 1, text: '31' }, 'parent rerender'],
    value: february,
    echo: false,
  },
];

it.each(pickerEdits)('matches the frozen edit trace for $name', ({ edits, value, echo }) => {
  const reference = observeFieldEditing(FrozenDatePicker, edits, value, echo);
  expect(observeFieldEditing(DatePicker, edits, value, echo)).toEqual(reference);
});

it('matches a delayed external NaN after an ignored partial section edit', () => {
  const edits: FieldEdit[] = [{ section: 0, text: '3' }, 'parent rerender', 'external NaN'];
  const reference = observeFieldEditing(FrozenDatePicker, edits, undefined, false);
  expect(reference).toEqual([
    { edit: edits[0], callbacks: ['NaN'], field: '03/DD/YYYY' },
    { edit: edits[1], callbacks: [], field: '03/DD/YYYY' },
    { edit: edits[2], callbacks: [], field: '03/DD/YYYY' },
  ]);
  expect(observeFieldEditing(DatePicker, edits, undefined, false)).toEqual(reference);
});

const observeDesktopFocus = async (Impl: React.ComponentType<DatePickerProps>, opener: 'field' | 'Day') => {
  pointer(true);
  const user = userEvent.setup();
  const onChange = vi.fn();
  const view = render(
    <>
      <button type="button">Before</button>
      <Impl value={initial} locale="en_US" label="Date" onChange={onChange} />
      <button type="button">After</button>
    </>,
  );
  try {
    const field = view.getByRole('group');
    const after = view.getByRole('button', { name: 'After' });
    const witness = (popup?: HTMLElement) => {
      const active = document.activeElement;
      return {
        editor: field.contains(active) ? active?.getAttribute('aria-label') : null,
        inCalendar: popup?.contains(active) ?? false,
        body: active === document.body,
        after: active === after,
        ring: field.classList.contains('Mui-focused'),
      };
    };
    const before = witness();
    await user.click(opener === 'field' ? field : within(field).getByRole('spinbutton', { name: opener }));
    const popup = await waitFor(() => overlay(true));
    await waitFor(() => expect(popup.contains(document.activeElement)).toBe(true));
    const opened = witness(popup);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    const closed = witness();
    await user.tab();
    expect(onChange).not.toHaveBeenCalled();
    return { before, opened, closed, tabbedOut: witness() };
  } finally {
    view.unmount();
  }
};

it.each(['field', 'Day'] as const)('matches frozen Escape and Tab focus after opening from %s', async (opener) => {
  const reference = await observeDesktopFocus(FrozenDatePicker, opener);
  expect(reference.opened).toMatchObject({ inCalendar: true, ring: true });
  expect(reference.closed).toMatchObject({ editor: opener === 'field' ? 'Month' : opener, ring: true });
  expect(reference.tabbedOut).toMatchObject({ after: true, ring: false });
  expect(await observeDesktopFocus(DatePicker, opener)).toEqual(reference);
});

const observeYearSelection = async (Impl: React.ComponentType<DatePickerProps>) => {
  pointer(true);
  const user = userEvent.setup();
  const changes: { value: number | null | undefined; yearVisible: boolean; claim: number }[] = [];
  const Fixture = () => {
    const [value, setValue] = useState<number | undefined>(initial);
    return (
      <Impl
        value={value}
        locale="en_US"
        label="Date"
        closeOnCLickAway
        onChange={(next) => {
          changes.push({
            value: next,
            yearVisible: Boolean(document.querySelector('.MuiPickersPopper-root .MuiYearCalendar-root')),
            claim: OverlayStackingService.getTopmostZIndex('popover'),
          });
          setValue(next ?? undefined);
        }}
      />
    );
  };
  const view = render(<Fixture />);
  try {
    await user.click(view.getByRole('group'));
    const popup = await waitFor(() => overlay(true));
    const contents = within(popup);
    await user.click(contents.getByRole('button', { name: /switch to year view/i }));
    // Find the element without its role so the red route still exercises publication and containment.
    const year = await contents.findByText('2026', { selector: 'button' });
    const role = year.getAttribute('role');
    const checked = year.getAttribute('aria-checked');
    await user.pointer({ keys: '[MouseLeft>]', target: year });
    const pressed = {
      open: popup.isConnected,
      yearVisible: popup.contains(year),
      claim: OverlayStackingService.getTopmostZIndex('popover'),
      changes: changes.length,
    };
    await user.pointer({ keys: '[/MouseLeft]', target: year });
    await waitFor(() => {
      expect(popup.querySelector('.MuiYearCalendar-root')).toBeNull();
      expect(contents.getByText('March 2026')).toBeInTheDocument();
    });
    return {
      role,
      checked,
      pressed,
      changes,
      after: {
        open: popup.isConnected,
        claim: OverlayStackingService.getTopmostZIndex('popover'),
        day: contents.getByRole('gridcell', { selected: true }).textContent,
        field: serialize(view.container),
      },
    };
  } finally {
    view.unmount();
  }
};

it('matches the frozen year control, press containment and publication', async () => {
  const reference = await observeYearSelection(FrozenDatePicker);
  expect(reference).toEqual({
    role: 'button',
    checked: 'false',
    pressed: { open: true, yearVisible: true, claim: 1101, changes: 0 },
    changes: [{ value: new Date(2026, 2, 15, 13, 42, 56, 789).valueOf(), yearVisible: true, claim: 1101 }],
    after: { open: true, claim: 1101, day: '15', field: '03/15/2026' },
  });
  expect(await observeYearSelection(DatePicker)).toEqual(reference);
});

const observeYearKeyboard = async (Impl: React.ComponentType<DatePickerProps>) => {
  pointer(true);
  const user = userEvent.setup();
  const changes: DatePickerProps['value'][] = [];
  const Fixture = () => {
    const [value, setValue] = useState<DatePickerProps['value']>(initial);
    return (
      <Impl
        value={value}
        locale="en_US"
        label="Date"
        onChange={(next) => {
          changes.push(next);
          setValue(next ?? undefined);
        }}
      />
    );
  };
  const view = render(<Fixture />);
  try {
    await user.click(view.getByRole('group'));
    const popup = await waitFor(() => overlay(true));
    const contents = within(popup);
    await user.click(contents.getByRole('button', { name: /switch to year view/i }));
    const selected = await contents.findByRole('button', { name: '2024' });
    const adjacent = contents.getByRole('button', { name: '2025' });
    const years = selected.closest('.MuiYearCalendar-root')!;
    expect(adjacent).toBeEnabled();
    const yearFocus = () => {
      const active = document.activeElement;
      return {
        activeYear: years.contains(active) ? active?.textContent : null,
        tabIndices: [selected.tabIndex, adjacent.tabIndex],
        tabStops: [...years.querySelectorAll('button[tabindex="0"]')].map((button) => button.textContent),
        publications: changes.length,
      };
    };

    act(() => selected.focus());
    const before = yearFocus();
    await user.keyboard('{ArrowRight}');
    const moved = yearFocus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(years).not.toBeInTheDocument());

    return {
      before,
      moved,
      changes,
      after: {
        open: popup.isConnected,
        month: contents.getByText(/^March 20(?:24|25)$/).textContent,
        day: contents.getByRole('gridcell', { selected: true }).textContent,
        field: serialize(view.container),
      },
    };
  } finally {
    view.unmount();
  }
};

it('matches frozen year keyboard focus, tab stop and Enter publication', async () => {
  const reference = await observeYearKeyboard(FrozenDatePicker);
  const candidate = await observeYearKeyboard(DatePicker);
  expect(reference).toEqual({
    before: { activeYear: '2024', tabIndices: [0, -1], tabStops: ['2024'], publications: 0 },
    moved: { activeYear: '2025', tabIndices: [-1, 0], tabStops: ['2025'], publications: 0 },
    changes: [new Date(2025, 2, 15, 13, 42, 56, 789).valueOf()],
    after: { open: true, month: 'March 2025', day: '15', field: '03/15/2025' },
  });
  expect(candidate).toEqual(reference);
});

type MobileEnterMode = 'no provider' | 'disabled' | 'readOnly' | 'consumer handler' | 'consumer prevents default';

const observeMobileEnter = (Impl: React.ComponentType<DatePickerProps>, mode: MobileEnterMode) => {
  pointer(false);
  const observe = (phase: string, event: React.KeyboardEvent<HTMLElement>) => ({
    phase,
    key: event.key,
    target: (event.target as Element).getAttribute('aria-label'),
    onSectionList: event.currentTarget.classList.contains('MuiPickersInputBase-sectionsContainer'),
    prevented: event.defaultPrevented,
    claim: OverlayStackingService.getTopmostZIndex('popover'),
    dialogs: document.querySelectorAll(coarse).length,
  });
  const keys: ReturnType<typeof observe>[] = [];
  const onChange = vi.fn();
  const fixture = (
    <div
      onKeyDownCapture={(event) => keys.push(observe('capture', event))}
      onKeyDown={(event) => keys.push(observe('bubble', event))}
    >
      <Impl value={initial} locale="en_US" label="Date" onChange={onChange} />
    </div>
  );
  const pickerDefault = mode === 'disabled' || mode === 'readOnly';
  const consumerDefault = mode === 'consumer handler' || mode === 'consumer prevents default';
  const theme = createTheme({
    components: {
      ...(pickerDefault && { MuiDatePicker: { defaultProps: { [mode]: true } } }),
      ...(consumerDefault && {
        MuiDateField: {
          defaultProps: {
            onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
              keys.push(observe('consumer', event));
              if (mode === 'consumer prevents default') event.preventDefault();
            },
          },
        },
      }),
    },
  });
  const view = render(mode === 'no provider' ? fixture : <ThemeProvider theme={theme}>{fixture}</ThemeProvider>);
  try {
    const field = view.getByRole('group');
    const month = within(field).getByRole('spinbutton', { name: 'Month' });
    const input = serializedDateInput(view.container);
    fireEvent.keyDown(consumerDefault ? month : field, { key: 'Enter', code: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    return {
      keys,
      disabled: input.disabled,
      readOnly: input.readOnly,
      dialogs: document.querySelectorAll(coarse).length,
      claim: OverlayStackingService.getTopmostZIndex('popover'),
    };
  } finally {
    view.unmount();
  }
};

const mobileEnterModes: MobileEnterMode[] = [
  'no provider',
  'disabled',
  'readOnly',
  'consumer handler',
  'consumer prevents default',
];

it.each(mobileEnterModes)('matches frozen mobile Enter with %s', (mode) => {
  const reference = observeMobileEnter(FrozenDatePicker, mode);
  const blocked = mode === 'disabled' || mode === 'readOnly';
  const consumer = mode === 'consumer handler' || mode === 'consumer prevents default';
  expect(reference).toMatchObject({ dialogs: blocked ? 0 : 1, disabled: mode === 'disabled', readOnly: true });
  expect(reference.keys.map(({ phase }) => phase)).toEqual(
    consumer ? ['capture', 'consumer', 'bubble'] : ['capture', 'bubble'],
  );
  if (consumer) expect(reference.keys[1]).toMatchObject({ target: 'Month', onSectionList: true });
  expect(reference.keys.at(-1)?.prevented).toBe(mode === 'consumer prevents default');
  expect(observeMobileEnter(DatePicker, mode)).toEqual(reference);
});

type DesktopKeyMode = 'consumer handler' | 'consumer prevents default' | 'picker readOnly';

const observeDesktopKey = (Impl: React.ComponentType<DatePickerProps>, mode: DesktopKeyMode) => {
  pointer(true);
  const trace: { phase: string; prevented?: boolean; sectionList?: boolean; value?: number | null }[] = [];
  let consumerEvent: React.KeyboardEvent<HTMLElement> | undefined;
  const theme = createTheme({
    components: {
      ...(mode === 'picker readOnly' && { MuiDatePicker: { defaultProps: { readOnly: true } } }),
      MuiDateField: {
        defaultProps: {
          onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
            consumerEvent = event;
            trace.push({
              phase: 'consumer',
              prevented: event.defaultPrevented,
              sectionList: event.currentTarget.classList.contains('MuiPickersInputBase-sectionsContainer'),
            });
            if (mode === 'consumer prevents default') event.preventDefault();
          },
        },
      },
    },
  });
  const Fixture = () => {
    const [value, setValue] = useState<number | undefined>(initial);
    return (
      <ThemeProvider theme={theme}>
        <div
          onKeyDownCapture={(event) => trace.push({ phase: 'capture', prevented: event.defaultPrevented })}
          onKeyDown={(event) => trace.push({ phase: 'bubble', prevented: event.defaultPrevented })}
        >
          <Impl
            value={value}
            locale="en_US"
            onChange={(next) => {
              trace.push({
                phase: 'change',
                prevented: consumerEvent?.defaultPrevented,
                sectionList: consumerEvent?.currentTarget?.classList.contains('MuiPickersInputBase-sectionsContainer'),
                value: next,
              });
              setValue(next ?? undefined);
            }}
          />
        </div>
      </ThemeProvider>
    );
  };
  const view = render(<Fixture />);
  try {
    const field = view.getByRole('group');
    const day = within(field).getByRole('spinbutton', { name: 'Day' });
    act(() => day.focus());
    fireEvent.keyDown(day, { key: 'ArrowUp', code: 'ArrowUp' });
    const input = serializedDateInput(view.container);
    fireEvent.click(field);
    return {
      trace,
      field: serialize(view.container),
      editorReadOnly: input.readOnly,
      popup: Boolean(document.querySelector(fine)),
    };
  } finally {
    view.unmount();
  }
};

it.each(['consumer handler', 'consumer prevents default', 'picker readOnly'] satisfies DesktopKeyMode[])(
  'matches frozen desktop ArrowUp with %s',
  (mode) => {
    const reference = observeDesktopKey(FrozenDatePicker, mode);
    expect(reference).toMatchObject({ field: '03/16/2024', editorReadOnly: false, popup: mode !== 'picker readOnly' });
    expect(reference.trace.map(({ phase }) => phase)).toEqual(['capture', 'consumer', 'change', 'bubble']);
    expect(reference.trace[1]).toMatchObject({ prevented: false, sectionList: true });
    expect(reference.trace.at(-1)?.prevented).toBe(true);
    expect(observeDesktopKey(DatePicker, mode)).toEqual(reference);
  },
);

// Some existing JS consumers pass null despite the narrower public TypeScript value prop.
const runtimeNull = null as unknown as number;
const emptyValues = [
  { name: 'runtime null', stamp: runtimeNull, invalid: 'false' },
  { name: 'undefined', stamp: undefined, invalid: 'false' },
  { name: 'NaN', stamp: NaN, invalid: 'true' },
] as const;

const observeFieldValue = (Impl: React.ComponentType<DatePickerProps>, stamp: DatePickerProps['value']) => {
  const onChange = vi.fn();
  const element = (value: DatePickerProps['value']) => (
    <Impl locale="en_US" label="Date" value={value} onChange={onChange} />
  );
  const view = render(element(stamp));
  const read = () => ({
    serialized: serialize(view.container),
    invalid: serializedDateInput(view.container).getAttribute('aria-invalid'),
    groupInvalid: view.getByRole('group').getAttribute('aria-invalid'),
  });
  try {
    const initialEmpty = read();
    view.rerender(element(initial));
    expect(serialize(view.container)).toBe('03/15/2024');
    view.rerender(element(stamp));
    const replacedFromDate = read();
    view.rerender(element(Number.isNaN(stamp) ? runtimeNull : NaN));
    view.rerender(element(stamp));
    expect(onChange).not.toHaveBeenCalled();
    return { initialEmpty, replacedFromDate, replacedFromOtherEmpty: read() };
  } finally {
    view.unmount();
  }
};

it.each(emptyValues)('matches the frozen $name field on mount and controlled replacement', ({ stamp, invalid }) => {
  pointer(true);
  const reference = observeFieldValue(FrozenDatePicker, stamp);
  for (const read of Object.values(reference)) {
    expect(read).toMatchObject({ serialized: '', invalid });
  }
  expect(observeFieldValue(DatePicker, stamp)).toEqual(reference);
});
