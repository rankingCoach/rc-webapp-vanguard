/**
 * MUI upgrade contract (S0): TimePicker = Select (MUI Select + Menu) with generated hour options.
 * `.MuiSelect-icon` is hidden by TimePicker.scss (asserted in the browser contract story).
 */
import userEvent from '@testing-library/user-event';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { render, screen, waitFor, within } from '../../../test-utils/test-utils';
import { TimePicker } from './TimePicker';

const openMenu = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox'));
  return { user, listbox: await screen.findByRole('listbox', {}, { timeout: 5000 }) };
};

afterEach(() => OverlayStackingService.__resetForTests());

// 48-97 MenuItems per open menu: generous timeout for coverage-instrumented runs
describe('TimePicker', { timeout: 20000 }, () => {
  test('renders a required combobox labelled without the Optional hint, testId on the container', () => {
    const { container } = render(<TimePicker id="tp" label="Start" hourListType="half" testId="tp-tid" />);
    const combo = screen.getByRole('combobox', { name: /Start/ });
    const label = document.getElementById('tp-label') as HTMLElement;
    expect(label.textContent).not.toContain('Optional');
    expect(label.querySelector('.MuiInputLabel-asterisk')).not.toBeNull();
    expect((container.querySelector('input') as HTMLInputElement).required).toBe(true);
    const outer = screen.getByTestId('tp-tid');
    expect(outer.classList.contains('TimePicker-container')).toBe(true);
    expect(outer.contains(combo)).toBe(true);
  });

  test('containerClassName is added to the container', () => {
    render(<TimePicker label="T" hourListType="half" testId="tp" containerClassName="extra" />);
    expect(screen.getByTestId('tp').className).toBe('TimePicker-container extra');
  });

  test.each([
    ['half', 48, '00:30'],
    ['quarter', 97, '23:59'],
  ] as const)('hourListType=%s lists %i options', async (hourListType, count, sample) => {
    render(<TimePicker label="T" hourListType={hourListType} />);
    const { listbox } = await openMenu();
    const items = within(listbox).getAllByRole('option');
    expect(items).toHaveLength(count);
    expect(items.some((i) => i.textContent === sample)).toBe(true);
  });

  test('showAmPm lists 12h labels and formats the value', () => {
    render(<TimePicker label="T" hourListType="half" showAmPm value="13:30" />);
    expect(screen.getByRole('combobox').textContent).toBe('01:30 PM');
  });

  test('value shows in the combobox and updates when the prop changes (controlled)', () => {
    const { rerender } = render(<TimePicker label="T" hourListType="half" value="03:00" />);
    expect(screen.getByRole('combobox').textContent).toBe('03:00');
    rerender(<TimePicker label="T" hourListType="half" value="04:30" />);
    expect(screen.getByRole('combobox').textContent).toBe('04:30');
  });

  test('falls back to formconfig.getValue() for the initial value', () => {
    const formconfig = { _inputRef: { current: null }, getValue: () => '05:00' };
    render(<TimePicker label="T" hourListType="half" formconfig={formconfig} />);
    expect(screen.getByRole('combobox').textContent).toBe('05:00');
  });

  test('min / max disable options outside the range', async () => {
    render(<TimePicker label="T" hourListType="half" min="08:00" max="09:00" />);
    const { listbox } = await openMenu();
    const byText = (t: string) => within(listbox).getByRole('option', { name: t });
    expect(byText('07:30').getAttribute('aria-disabled')).toBe('true');
    expect(byText('08:00').getAttribute('aria-disabled')).toBeNull();
    expect(byText('09:00').getAttribute('aria-disabled')).toBeNull();
    expect(byText('09:30').getAttribute('aria-disabled')).toBe('true');
  });

  test('choosing an option calls onChange(event, option) and closes the menu', async () => {
    const onChange = vi.fn();
    render(<TimePicker label="T" hourListType="half" onChange={onChange} />);
    const { user, listbox } = await openMenu();
    await user.click(within(listbox).getByRole('option', { name: '10:30' }));
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(onChange.mock.calls[0][1]).toEqual({ key: 21, value: '10:30', title: '10:30', disabled: false });
  });

  test('freeSolo shows a value that is not in the list', () => {
    render(<TimePicker label="T" hourListType="half" value="10:10" freeSolo />);
    expect(screen.getByRole('combobox').textContent).toBe('10:10');
  });

  test('without freeSolo an off-list value renders empty', () => {
    render(<TimePicker label="T" hourListType="half" value="10:10" />);
    expect(screen.getByRole('combobox').textContent).toBe('​');
  });

  test('the open menu holds an OverlayStackingService slot', async () => {
    render(<TimePicker label="T" hourListType="half" />);
    const { listbox } = await openMenu();
    expect(Number(getComputedStyle(listbox.closest('.MuiMenu-root') as HTMLElement).zIndex)).toBe(
      OVERLAY_BASE_Z_INDEX + 1,
    );
  });

  test('[bug-lock] changing hourListType after mount does not regenerate options', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): the options effect depends on [min, max, showAmPm] only.
    const { rerender } = render(<TimePicker label="T" hourListType="half" />);
    rerender(<TimePicker label="T" hourListType="quarter" />);
    const { listbox } = await openMenu();
    expect(within(listbox).getAllByRole('option')).toHaveLength(48);
  });
});
