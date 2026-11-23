import type { Meta, StoryObj } from '@storybook/react';
import moment from 'moment';
import React, { useState } from 'react';
import { expect, fireEvent, waitFor, within } from 'storybook/test';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { DateFieldReference } from './_DateField.mui-reference';
import { DateField } from './DateField';

type Options = {
  empty?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  withProvider?: boolean;
  ownFirst?: boolean;
  only?: 'own' | 'mui';
};

const Field = ({ route, empty, disabled, readOnly }: Options & { route: 'own' | 'mui' }) => {
  const [value, setValue] = useState(() => (empty ? null : moment('2024-03-15T13:42:56.789').locale('ro')));
  const Component = route === 'own' ? DateField : DateFieldReference;
  return (
    <Component
      locale="ro"
      format="DD.MM.YYYY"
      label="Start date"
      required
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onChange={setValue}
    />
  );
};

const Stage = (options: Options) => {
  const order = options.only
    ? [options.only]
    : options.ownFirst
      ? (['own', 'mui'] as const)
      : (['mui', 'own'] as const);
  const pair = (
    <div style={{ display: 'flex', gap: 24, padding: 16 }}>
      {order.map((route) => (
        <div key={route} data-testid={route} style={{ width: 280 }}>
          <Field {...options} route={route} />
        </div>
      ))}
    </div>
  );
  return options.withProvider ? <VanguardThemeProvider>{pair}</VanguardThemeProvider> : pair;
};

const meta = { title: 'Vanguard/DatePicker/DateField Computed Parity', component: Stage } satisfies Meta<typeof Stage>;
export default meta;
type Story = StoryObj<typeof meta>;

const selectors = {
  frame: '.MuiPickersTextField-root',
  label: '.MuiInputLabel-root',
  group: '.MuiPickersInputBase-root',
  sections: '.MuiPickersInputBase-sectionsContainer',
  firstSection: '[role="spinbutton"]',
  outline: '.MuiPickersOutlinedInput-notchedOutline',
  legend: 'legend',
  hidden: 'input[aria-hidden="true"]',
};
const properties = [
  'display',
  'visibility',
  'align-items',
  'justify-content',
  'position',
  'box-sizing',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'color',
  'opacity',
  'cursor',
  'pointer-events',
  'white-space',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-top-color',
  'border-top-left-radius',
  'outline-width',
  'transform',
  'transform-origin',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
];

const get = (host: HTMLElement, selector: string) => {
  const item = host.querySelector<HTMLElement>(selector);
  if (!item) throw new Error(`Date field node absent: ${selector}`);
  return item;
};

const styleSnapshot = (host: HTMLElement) => {
  const origin = host.getBoundingClientRect();
  return Object.fromEntries(
    Object.entries(selectors).map(([name, selector]) => {
      const node = get(host, selector);
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return [
        name,
        {
          rect: [rect.x - origin.x, rect.y - origin.y, rect.width, rect.height],
          styles: Object.fromEntries(properties.map((property) => [property, style.getPropertyValue(property)])),
        },
      ];
    }),
  );
};
const hosts = (canvas: HTMLElement) => {
  const stage = within(canvas);
  return { mui: stage.getByTestId('mui'), own: stage.getByTestId('own') };
};
const settleStyles = (host: HTMLElement) => {
  host.getBoundingClientRect();
  return Promise.allSettled(host.getAnimations({ subtree: true }).map((animation) => animation.finished));
};
const parity: NonNullable<Story['play']> = async ({ canvasElement, args }) => {
  await document.fonts.ready;
  const pair = hosts(canvasElement);
  await expect(styleSnapshot(pair.own)).toEqual(styleSnapshot(pair.mui));
  if (args.disabled || args.readOnly) return;
  const { page } = await import('vitest/browser');
  const focused = [];
  for (const route of args.ownFirst ? (['own', 'mui'] as const) : (['mui', 'own'] as const)) {
    const host = pair[route];
    const target = get(host, selectors.firstSection);
    await page.getByTestId(route).getByRole('spinbutton', { name: 'Day' }).click();
    await expect(document.activeElement).toBe(target);
    await settleStyles(host);
    focused.push(styleSnapshot(host));
  }
  await expect(focused[1]).toEqual(focused[0]);
};

const plain = (text: string) => text.replace(/[\u200e\u200f\u2066-\u2069]/g, '');

const editOne = async (host: HTMLElement, route: 'mui' | 'own') => {
  // Vitest's Playwright provider dispatches trusted Chromium input.
  const { page, userEvent: chromium } = await import('vitest/browser');
  const query = within(host);
  const field = page.getByTestId(route);
  const day = () => query.getByRole('spinbutton', { name: 'Day' });
  const month = () => query.getByRole('spinbutton', { name: 'Month' });
  const serialized = get(host, selectors.hidden) as HTMLInputElement;
  const trusted: Record<string, boolean> = {};
  const record = (event: Event) => {
    if (event.type !== 'keydown' || (event as KeyboardEvent).key === 'ArrowRight')
      trusted[event.type] = event.isTrusted;
  };
  host.addEventListener('pointerdown', record);
  host.addEventListener('keydown', record);
  try {
    await field.getByRole('spinbutton', { name: 'Day' }).click();
    await waitFor(() => {
      expect(document.activeElement, `${route} active day after pointerdown`).toBe(day());
      expect(window.getSelection()?.toString(), `${route} initial day range`).toBe('15');
    });

    await chromium.keyboard('{ArrowRight}{ArrowUp}');
    await waitFor(() => {
      expect(document.activeElement, `${route} active month after keyboard move`).toBe(month());
      expect(plain(serialized.value)).toBe('15.04.2024');
    });
    expect(trusted).toEqual({ pointerdown: true, keydown: true });

    const trace = [window.getSelection()?.toString()];
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', '29.02.2024');
    fireEvent.paste(month(), { clipboardData });
    trace.push(serialized.value);
    await field.getByRole('spinbutton', { name: 'Day' }).click();
    await chromium.keyboard('{Backspace}');
    trace.push(serialized.value);
    trace.push(window.getSelection()?.toString());
    return trace;
  } finally {
    host.removeEventListener('pointerdown', record);
    host.removeEventListener('keydown', record);
  }
};

const edit: NonNullable<Story['play']> = async ({ canvasElement, args }) => {
  await document.fonts.ready;
  const pair = hosts(canvasElement);
  const order = args.ownFirst ? (['own', 'mui'] as const) : (['mui', 'own'] as const);
  const traces = [];
  for (const route of order) traces.push(await editOne(pair[route], route));
  await expect(traces[1]).toEqual(traces[0]);
};

const trustedSelection =
  (route: 'mui' | 'own'): NonNullable<Story['play']> =>
  async ({ canvasElement }) => {
    await document.fonts.ready;
    await editOne(within(canvasElement).getByTestId(route), route);
  };

export const SettledDefault: Story = { args: {}, play: parity };
export const EmptyFocus: Story = { args: { empty: true, ownFirst: true }, play: parity };
export const DisabledVanguard: Story = { args: { disabled: true, withProvider: true }, play: parity };
export const KeyboardReferenceFirst: Story = { args: {}, play: edit };
export const KeyboardOwnFirst: Story = { args: { ownFirst: true }, play: edit };
export const TrustedSelectionReference: Story = { args: { only: 'mui' }, play: trustedSelection('mui') };
export const TrustedSelectionOwn: Story = { args: { only: 'own' }, play: trustedSelection('own') };
