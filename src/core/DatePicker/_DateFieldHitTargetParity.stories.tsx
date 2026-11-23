import type { Meta, StoryObj } from '@storybook/react';
import moment from 'moment';
import React, { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { userEvent } from 'vitest/browser';

import { DateFieldReference } from './_DateField.mui-reference';
import { DateField } from './DateField';

/**
 * Pointer hit targets of the date field against MUI X 9.17 (the field .472's DatePicker rendered), real Playwright
 * clicks in Chromium: a click on a separator (`sectionAfter`, e.g. the field centre) focuses the section it belongs to,
 * a click on the field padding focuses the first section (V2 opener re-check). Each story clicks the same target on
 * the reference field, then on the own field, and compares which section ends up focused.
 */
const meta = { title: 'Vanguard/DatePicker/Field Hit Target Parity' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const value = moment('2026-01-15', 'YYYY-MM-DD').locale('en');
let showImpl: ((impl: 'reference' | 'own' | null) => void) | null = null;
const Host = () => {
  const [impl, setImpl] = useState<'reference' | 'own' | null>(null);
  showImpl = setImpl;
  return (
    <div style={{ padding: 24, width: 360 }}>
      <span
        data-pointer-park-end=""
        style={{ position: 'fixed', right: 0, bottom: 0, width: 4, height: 4, zIndex: 2147483647 }}
      />
      {impl === 'reference' ? (
        <DateFieldReference locale="en" format="DD.MM.YYYY" label="Date" value={value} />
      ) : impl === 'own' ? (
        <DateField locale="en" format="DD.MM.YYYY" label="Date" value={value} />
      ) : null}
    </div>
  );
};

type Target = 'separator0' | 'separator1' | 'paddingLeft' | 'paddingRight';
const observe = async (canvas: HTMLElement, impl: 'reference' | 'own', target: Target) => {
  showImpl?.(impl);
  const root = await waitFor(() => {
    const element = canvas.querySelector<HTMLElement>('.MuiPickersInputBase-root');
    if (!element) throw new Error('field not mounted');
    return element;
  });
  const separators = [...root.querySelectorAll<HTMLElement>('.MuiPickersInputBase-sectionAfter')].filter((span) =>
    span.textContent?.trim(),
  );
  if (target === 'separator0' || target === 'separator1') {
    const span = separators[target === 'separator0' ? 0 : 1];
    if (span) await userEvent.click(span);
  } else {
    const box = root.getBoundingClientRect();
    await userEvent.click(root, {
      position: { x: target === 'paddingLeft' ? 4 : box.width - 4, y: box.height / 2 },
    } as never);
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
  const active = document.activeElement;
  const result = {
    focused: root.contains(active) ? (active?.getAttribute('aria-label') ?? active?.className) : 'outside',
    separators: separators.map((span) => span.textContent),
  };
  showImpl?.(null);
  await waitFor(() => expect(canvas.querySelector('.MuiPickersInputBase-root')).toBeNull());
  return result;
};

const parity = (target: Target): Story => ({
  render: () => <Host />,
  play: async ({ canvasElement }) => {
    const reference = await observe(canvasElement, 'reference', target);
    const own = await observe(canvasElement, 'own', target);
    // Leave the real pointer on a corner no story renders in, so the next story's rest-state reads see no :hover
    // (the top-left is where most parity panes sit).
    await userEvent.hover(canvasElement.querySelector<HTMLElement>('[data-pointer-park-end]')!);
    await expect({ target, own }).toEqual({ target, own: reference });
  },
});

export const ClickFirstSeparator = parity('separator0');
export const ClickSecondSeparator = parity('separator1');
export const ClickPaddingLeft = parity('paddingLeft');
export const ClickPaddingRight = parity('paddingRight');
