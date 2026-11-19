import type { Meta, StoryObj } from '@storybook/react';
import moment from 'moment';
import React from 'react';
import { expect, waitFor, within } from 'storybook/test';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { DateCalendarReference } from './_DateCalendar.mui-reference';
import { DateCalendar } from './DateCalendar';

type Options = {
  reduceAnimations: boolean;
  ownFirst?: boolean;
  withProvider?: boolean;
};

const Stage = ({ reduceAnimations, ownFirst, withProvider }: Options) => {
  const options = {
    locale: 'en',
    value: moment('2024-03-15'),
    minDate: moment('2024-03-10'),
    maxDate: moment('2024-12-31'),
    reduceAnimations,
  };
  const frames = (
    <div style={{ display: 'flex', gap: 24, width: 'max-content' }}>
      {(ownFirst ? ['own', 'mui'] : ['mui', 'own']).map((name) => (
        <div key={name} data-testid={name}>
          {name === 'own' ? <DateCalendar {...options} /> : <DateCalendarReference {...options} />}
        </div>
      ))}
    </div>
  );
  return withProvider ? <VanguardThemeProvider>{frames}</VanguardThemeProvider> : frames;
};

const meta = {
  title: 'Vanguard/DatePicker/DateCalendar Computed Parity',
  component: Stage,
} satisfies Meta<typeof Stage>;
export default meta;
type Story = StoryObj<typeof meta>;

const selectors = {
  calendar: '.MuiDateCalendar-root',
  header: '.MuiPickersCalendarHeader-root',
  heading: '.MuiPickersCalendarHeader-label',
  arrow: '.MuiPickersArrowSwitcher-nextIconButton',
  grid: '.MuiDayCalendar-root',
  weekdays: '.MuiDayCalendar-header',
  weekday: '.MuiDayCalendar-weekDayLabel',
  month: '.MuiDayCalendar-monthContainer',
  slide: '.MuiDayCalendar-slideTransition',
  selected: '.MuiPickerDay-root.Mui-selected',
  disabled: 'button.MuiPickerDay-root.Mui-disabled',
  day: 'button.MuiPickerDay-root:not(.Mui-selected):not(.Mui-disabled)',
} as const;

const properties = [
  'display',
  'position',
  'overflow-x',
  'align-items',
  'justify-content',
  'box-sizing',
  'width',
  'height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-size',
  'font-family',
  'font-weight',
  'line-height',
  'letter-spacing',
  'color',
  'background-color',
  'border-top-width',
  'border-top-left-radius',
  'outline-width',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
];

const get = (host: Element, selector: string) => {
  const element = host.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Missing calendar element ${selector}`);
  return element;
};

const style = (element: Element) =>
  Object.fromEntries(properties.map((key) => [key, getComputedStyle(element).getPropertyValue(key)]));
const layout = (element: Element, stage: Element) => {
  const rect = element.getBoundingClientRect();
  const origin = stage.getBoundingClientRect();
  return [rect.x - origin.x, rect.y - origin.y, rect.width, rect.height].map((value) => Math.round(value * 64) / 64);
};
const hosts = (canvas: HTMLElement) => {
  const stage = within(canvas);
  return { own: stage.getByTestId('own'), mui: stage.getByTestId('mui') };
};

const parity: NonNullable<Story['play']> = async ({ canvasElement }) => {
  await document.fonts.ready;
  const pair = hosts(canvasElement);
  const snapshot = (host: HTMLElement) =>
    Object.fromEntries(
      Object.entries(selectors).map(([name, selector]) => {
        const element = get(host, selector);
        return [name, { styles: style(element), rect: layout(element, host) }];
      }),
    );
  await expect(snapshot(pair.own), 'calendar state styles and layout').toEqual(snapshot(pair.mui));

  const focusedStyles = [];
  for (const host of [pair.mui, pair.own]) {
    const day = get(host, selectors.day);
    day.focus();
    await expect(document.activeElement).toBe(day);
    await Promise.all(day.getAnimations().map((animation) => animation.finished));
    focusedStyles.push(style(day));
    day.blur();
  }
  await expect(focusedStyles[1]).toEqual(focusedStyles[0]);
};

const motion: NonNullable<Story['play']> = async ({ canvasElement, args }) => {
  await document.fonts.ready;
  const pair = hosts(canvasElement);
  const directions = [
    { button: 'Next month', entering: 'left', title: 'April 2024' },
    { button: 'Previous month', entering: 'right', title: 'March 2024' },
  ];
  const prefix = 'MuiPickersSlideTransition-';

  for (const direction of directions) {
    for (const host of args.ownFirst ? [pair.own, pair.mui] : [pair.mui, pair.own]) {
      within(host).getByRole('button', { name: direction.button }).click();
      if (args.reduceAnimations) {
        await waitFor(() => expect(within(host).getByRole('grid', { name: direction.title })).toBeVisible());
        await expect(host.querySelectorAll(selectors.month)).toHaveLength(1);
        await expect(host.querySelector(`[class*="${prefix}slideEnter"], [class*="${prefix}slideExit"]`)).toBeNull();
      } else {
        await waitFor(() => {
          const entering = get(host, `.${prefix}slideEnter-${direction.entering}`);
          const exiting = get(host, `.${prefix}slideExitActiveLeft-${direction.entering}`);
          expect(entering.classList.contains(`${prefix}slideEnterActive`)).toBe(true);
          expect(host.querySelectorAll(selectors.month)).toHaveLength(2);
          for (const element of [entering, exiting]) {
            const computed = getComputedStyle(element);
            expect(computed.transitionProperty).toBe('transform');
            expect(computed.transitionDuration).toBe('0.375s');
            expect(computed.transitionTimingFunction).toBe('cubic-bezier(0.35, 0.8, 0.4, 1)');
            expect(computed.transitionDelay).toBe('0s');
          }
        });
        await waitFor(() => expect(host.querySelectorAll(selectors.month)).toHaveLength(1), { timeout: 2000 });
        await expect(within(host).getByRole('grid', { name: direction.title })).toBeVisible();
      }
    }
    await expect(layout(get(pair.own, selectors.grid), pair.own)).toEqual(
      layout(get(pair.mui, selectors.grid), pair.mui),
    );
  }
};

export const SettledDefault: Story = {
  args: { reduceAnimations: true },
  play: parity,
};
export const SettledVanguardTheme: Story = {
  args: { reduceAnimations: true, withProvider: true, ownFirst: true },
  play: parity,
};
export const SlideReferenceFirst: Story = {
  args: { reduceAnimations: false },
  play: motion,
};
export const SlideOwnFirst: Story = {
  args: { reduceAnimations: false, ownFirst: true },
  play: motion,
};
export const ReducedMotion: Story = {
  args: { reduceAnimations: true },
  play: motion,
};
