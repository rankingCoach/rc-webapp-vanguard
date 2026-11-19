import type { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { DateRangePickerMuiReference } from './_DateRangePicker.mui-reference';
import { DateRangePicker } from './DateRangePicker';

export default {
  ...SbDecorator({ title: 'Vanguard/DateRangePicker/Masked Frame Parity', component: DateRangePicker }),
};

type Story = StoryObj<typeof DateRangePicker>;
const ADORNMENT_STYLE = [
  'display',
  'align-items',
  'height',
  'max-height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'white-space',
  'color',
  'font-size',
  'line-height',
];
const EMOTION_ADORNMENT_CLASS = /^css-[a-z0-9]+-MuiInputAdornment-root$/;
const round = (pixels: number) => Math.round(pixels * 100) / 100;

function readPairMember(pane: Element) {
  const input = pane.querySelector<HTMLInputElement>('[data-testid="datepicker-reference"]');
  const frame = input?.closest('.MuiOutlinedInput-root');
  const adornment = frame?.querySelector('.MuiInputAdornment-positionEnd');
  const icon = adornment?.querySelector('[data-slot="icon"] svg, svg');
  const outline = frame?.querySelector('fieldset');
  if (!input || !frame || !adornment || !icon || !outline) throw new Error('Masked frame or calendar icon is missing');
  const iconBox = (icon.closest('[data-slot="icon"]') ?? icon).getBoundingClientRect();
  const adornmentBox = adornment.getBoundingClientRect();
  const computed = getComputedStyle(adornment);
  const inputStyle = getComputedStyle(input);
  const outlineStyle = getComputedStyle(outline);
  return {
    input,
    classes: [...adornment.classList],
    appearance: {
      box: Object.fromEntries(ADORNMENT_STYLE.map((key) => [key, computed.getPropertyValue(key)])),
      boundHeight: round(adornmentBox.height),
      iconRect: [iconBox.left - adornmentBox.left, iconBox.top - adornmentBox.top, iconBox.width, iconBox.height].map(
        round,
      ),
      textStart: round(
        input.getBoundingClientRect().left -
          frame.getBoundingClientRect().left +
          Number.parseFloat(inputStyle.borderLeftWidth) +
          Number.parseFloat(inputStyle.paddingLeft),
      ),
      outline: [outlineStyle.borderColor, outlineStyle.borderWidth],
      focused: frame.classList.contains('Mui-focused'),
      disabled: input.disabled,
    },
  };
}

function PickerPair({ disabled }: { disabled: boolean }) {
  return (
    <div style={{ width: 700 }}>
      <div data-testid="picker-reference">
        <DateRangePickerMuiReference testId="reference" disabled={disabled} />
      </div>
      <div data-testid="picker-candidate">
        <DateRangePicker testId="candidate" disabled={disabled} />
      </div>
    </div>
  );
}

const state = (canvas: HTMLElement, implementation: 'reference' | 'candidate') => {
  const pane = canvas.querySelector(`[data-testid="picker-${implementation}"]`);
  if (!pane) throw new Error(`Missing ${implementation} picker`);
  return readPairMember(pane);
};

async function checkRestingFrame(canvas: HTMLElement, disabled: boolean) {
  const before = await waitFor(() => state(canvas, 'reference'));
  expect(before.classes).toEqual(
    expect.arrayContaining(['MuiInputAdornment-outlined', 'MuiInputAdornment-sizeMedium']),
  );
  expect(before.classes.filter((token) => EMOTION_ADORNMENT_CLASS.test(token))).toHaveLength(1);
  expect(before.appearance.box.display).toBe('flex');
  expect(before.appearance.boundHeight).toBe(38);
  expect(before.appearance.disabled).toBe(disabled);
  await waitFor(() => {
    const candidate = state(canvas, 'candidate');
    expect(candidate.classes.filter((token) => token.startsWith('css-'))).toHaveLength(0);
    expect(candidate.classes).toEqual(before.classes.filter((token) => !EMOTION_ADORNMENT_CLASS.test(token)));
    expect(candidate.appearance).toEqual(before.appearance);
  });
}

export const CalendarEndAdornment: Story = {
  render: () => <PickerPair disabled={false} />,
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    await checkRestingFrame(canvasElement, false);
    const states: ReturnType<typeof readPairMember>['appearance'][][] = [];
    for (const implementation of ['reference', 'candidate'] as const) {
      const { input } = state(canvasElement, implementation);
      await userEvent.hover(input);
      const hover = state(canvasElement, implementation).appearance;
      input.focus();
      const focused = await waitFor(() => {
        const { appearance } = state(canvasElement, implementation);
        expect(appearance.focused).toBe(true);
        return appearance;
      });
      input.blur();
      await userEvent.unhover(input);
      states.push([hover, focused]);
    }
    expect(states[1]).toEqual(states[0]);
  },
};

export const DisabledCalendarEndAdornment: Story = {
  render: () => <PickerPair disabled />,
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    await checkRestingFrame(canvasElement, true);
  },
};
