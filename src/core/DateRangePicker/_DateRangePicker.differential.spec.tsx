import { setTimeout as sleep } from 'node:timers/promises';
import { cleanupOverlaySpec } from '@test-utils/cleanup-overlay-spec';
import { act, render, screen } from '@test-utils/test-utils';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { DateRangePickerMuiReference } from './_DateRangePicker.mui-reference';
import { DateRangePicker } from './DateRangePicker';

/**
 * Differential parity, jsdom: DateRangePicker's dropdown on the own Popper + Fade vs the frozen MUI implementation.
 * Same interactions (open the calendar from the date input, switch to the preset list, pick a preset, close by an
 * outside click) → same document (popper element, inline position/transition styles, dropdown content, body state).
 */
type Impl = 'mui' | 'own';

const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ ?\bvg-z-n?\d+/g, '')
    .replace(/ class=""/g, '')
    .replace(/<legend class="vg-notched-legend">/g, '<legend>')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="[^"]*"/g, '')
    .replace(/ (id|for|aria-labelledby|aria-controls|aria-describedby)="[^"]*"/g, ' $1="ID"')
    // The reference inputs' width is measured text (canvas stub noise in jsdom), not popper state.
    .replace(/width: \d+\.\d+px/g, 'width: <measured>px');

const canonical = (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  for (const el of Array.from(host.querySelectorAll('*'))) {
    const attrs = Array.from(el.attributes).map((a) => [a.name, a.value] as const);
    for (const [name] of attrs) el.removeAttribute(name);
    for (const [name, value] of attrs.sort(([x], [y]) => x.localeCompare(y))) {
      let v = value;
      if (name === 'class') v = value.split(/\s+/).filter(Boolean).sort().join(' ');
      if (name === 'style')
        v = value
          .split(';')
          .map((d) => d.trim())
          .filter(Boolean)
          .sort()
          .join('; ');
      el.setAttribute(name, v);
    }
  }
  return host.innerHTML;
};

const snapshot = () =>
  `<body style="${document.body.getAttribute('style') ?? ''}">${canonical(normalize(document.body.innerHTML))}`;

// These snapshots include both the popup transition styles and the date-range view transition.
const settle = (signal: AbortSignal) =>
  act(async () => {
    await sleep(600, undefined, { signal });
  });

afterEach(cleanupOverlaySpec);

const go = async (impl: Impl, signal: AbortSignal) => {
  signal.throwIfAborted();
  const C = impl === 'mui' ? DateRangePickerMuiReference : DateRangePicker;
  const user = userEvent.setup();
  const view = render(
    <div>
      <button type="button">{'outside'}</button>
      <C testId="drp" />
    </div>,
  );
  await settle(signal);
  const calendarInput = screen.getByTestId('datepicker-reference');
  const legend = calendarInput.closest('.MuiOutlinedInput-root')?.querySelector('legend');
  expect(legend).not.toBeNull();
  expect(legend?.classList.contains('vg-notched-legend')).toBe(impl === 'own');
  const trace = [snapshot()];
  await user.click(screen.getByTestId('datepicker-reference'));
  await settle(signal);
  trace.push(snapshot());
  await user.click(screen.getByTestId('rangeselector-reference-input'));
  await settle(signal);
  trace.push(snapshot());
  const preset = screen.queryByRole('button', { name: 'Last 30 days' });
  if (preset) await user.click(preset);
  await settle(signal);
  trace.push(snapshot());
  await user.click(screen.getByRole('button', { name: 'outside' }));
  await waitFor(() => expect(document.querySelector('.date-range-picker-dropdown')).toBeNull(), { timeout: 2500 });
  signal.throwIfAborted();
  trace.push(snapshot());
  view.unmount();
  view.container.remove();
  return trace;
};

describe('DateRangePicker own core equals MUI', () => {
  it('open calendar, presets, pick, close', { timeout: 45_000 }, async ({ signal }) => {
    const mui = await go('mui', signal);
    // the timeline really opens the dropdown (calendar, then presets) and closes it again
    expect(mui[1]).toContain('date-range-picker-dropdown');
    expect(mui[2]).toContain('date-range-picker-dropdown-predefined');
    expect(mui[4]).not.toContain('date-range-picker-dropdown');
    expect(await go('own', signal)).toEqual(mui);
  });
});
