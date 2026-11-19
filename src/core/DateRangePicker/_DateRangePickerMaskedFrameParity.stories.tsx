import type { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
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

type Implementation = 'reference' | 'candidate';

function referenceFields(canvas: HTMLElement, implementation: Implementation) {
  const left = canvas.querySelector<HTMLElement>(`[data-testid="${implementation}-left-reference-container"]`);
  const right = canvas.querySelector<HTMLElement>(`[data-testid="${implementation}-right-reference-container"]`);
  const input = left?.querySelector<HTMLInputElement>('[data-testid="datepicker-reference"]');
  if (!left || !right || !input) throw new Error(`Missing ${implementation} reference fields`);
  const read = (ms: number) => ({
    ms,
    left: left.getBoundingClientRect().width,
    right: right.getBoundingClientRect().width,
  });
  return { implementation, input, read, frames: [read(0)] };
}

async function sampleReferenceSlides(canvas: HTMLElement, order: [Implementation, Implementation]) {
  const pair = order.map((implementation) => referenceFields(canvas, implementation));
  const started = performance.now();
  // Open both in one React commit and read them on the same browser frames. Reverse the event order in the replay.
  flushSync(() => pair.forEach(({ input }) => input.click()));
  let elapsed = 0;
  let settled = false;
  do {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    elapsed = performance.now() - started;
    settled = pair
      .map(({ read, frames }) => {
        const sample = read(elapsed);
        frames.push(sample);
        return sample.left === 185 && sample.right === 52;
      })
      .every(Boolean);
  } while (elapsed < 2500 && (elapsed < 600 || !settled));

  const results = pair.map(({ implementation, frames }) => {
    const start = frames[0];
    const end = frames[frames.length - 1];
    expect([start.left, start.right]).toEqual([52, 185]);
    expect([end.left, end.right]).toEqual([185, 52]);
    expect(frames.some(({ left }) => left > 53 && left < 184)).toBe(true);
    return {
      implementation,
      samples: [0, 100, 300, 600].map((ms) => ({ requestedMs: ms, ...frames.find((frame) => frame.ms >= ms) })),
      firstMovementFrame: frames.findIndex(({ left }) => left > 53),
      halfwayFrame: frames.findIndex(({ left }) => left >= (185 + 52) / 2),
      settledFrame: frames.findIndex(({ left, right }) => left === 185 && right === 52),
    };
  });
  const [first, second] = results;
  const report = JSON.stringify(results);
  console.info('DateRangePicker reference-width samples', report);
  expect(
    Math.abs(first.firstMovementFrame - second.firstMovementFrame),
    `First movement ${report}`,
  ).toBeLessThanOrEqual(2);
  expect(Math.abs(first.halfwayFrame - second.halfwayFrame), `Halfway ${report}`).toBeLessThanOrEqual(2);
  expect(Math.abs(first.settledFrame - second.settledFrame), `Settled ${report}`).toBeLessThanOrEqual(2);
}

async function resetSlidePair(canvas: HTMLElement) {
  const previous = canvas.querySelector('[data-testid="picker-reference"]');
  const reset = canvas.querySelector<HTMLButtonElement>('[data-testid="reset-slide-pair"]');
  if (!reset) throw new Error('Missing slide fixture reset');
  reset.click();
  await waitFor(() => expect(canvas.querySelector('[data-testid="picker-reference"]')).not.toBe(previous));
}

function SlidePair() {
  const [id, setId] = useState(0);
  return (
    <>
      <button type="button" data-testid="reset-slide-pair" onClick={() => setId((previous) => previous + 1)}>
        {'Reset preview'}
      </button>
      <PickerPair key={id} disabled={false} />
    </>
  );
}

export const ReferenceSlideInBothOrders: Story = {
  render: () => <SlidePair />,
  play: async ({ canvasElement }) => {
    await sampleReferenceSlides(canvasElement, ['reference', 'candidate']);
    await resetSlidePair(canvasElement);
    await sampleReferenceSlides(canvasElement, ['candidate', 'reference']);
  },
};
