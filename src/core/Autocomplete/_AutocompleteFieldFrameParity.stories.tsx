import { TextField as MuiReference } from '@mui/material';
import type { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { OwnAutocomplete } from '../../primitives/react/Autocomplete/Autocomplete';
import { MuiTextField } from '../_internal/InputBase/MuiTextField';

export default {
  ...SbDecorator({ title: 'Vanguard/Autocomplete/TextField Frame Parity', component: OwnAutocomplete }),
};

const options = ['Selected apple', 'Selected pear', 'Selected plum'];
const sizes = [undefined, 'small', 'medium'] as const;
const width = [320, 224, 416];
type FieldState = 'chips' | 'autofill' | 'disabled' | 'error';

function Field({
  reference,
  index,
  id,
  state = 'chips',
}: {
  reference: boolean;
  index: number;
  id: string;
  state?: FieldState;
}) {
  return (
    <div data-field={id} style={{ width: width[index] }}>
      <OwnAutocomplete
        id={id}
        openOnFocus
        options={options}
        multiple
        disabled={state === 'disabled'}
        defaultValue={state === 'chips' ? options.slice(0, 2) : []}
        size={sizes[index]}
        renderInput={({ slotProps, ...props }) =>
          reference ? (
            <MuiReference {...props} slotProps={slotProps} label="Fruit" error={state === 'error'} />
          ) : (
            <MuiTextField
              {...props}
              InputProps={slotProps.input}
              InputLabelProps={slotProps.inputLabel}
              inputProps={slotProps.htmlInput}
              label="Fruit"
              error={state === 'error'}
            />
          )
        }
      />
    </div>
  );
}

function readField(field: Element) {
  const input = field.querySelector<HTMLInputElement>('input[role="combobox"]');
  const root = field.querySelector('.MuiAutocomplete-inputRoot');
  const label = field.querySelector('label');
  const outline = field.querySelector('fieldset');
  const legend = outline?.querySelector('legend');
  if (!input || !root || !label || !outline || !legend)
    throw new Error('Expected a complete outlined Autocomplete field');
  const rootBox = root.getBoundingClientRect();
  const popper = document.getElementById(input.getAttribute('aria-controls') ?? '')?.closest('.MuiAutocomplete-popper');
  const popupBox = popper?.getBoundingClientRect();
  const round = (n: number) => Math.round(n * 10) / 10;
  const outlineStyle = getComputedStyle(outline);
  return {
    input,
    styles: {
      box: [round(rootBox.width), round(rootBox.height)],
      labelShrink: label.getAttribute('data-shrink'),
      notchWidth: round(legend.getBoundingClientRect().width),
      borderColor: outlineStyle.borderColor,
      borderWidth: outlineStyle.borderWidth,
      disabled: input.disabled,
      invalid: input.getAttribute('aria-invalid'),
      popup: popupBox && {
        x: round(popupBox.left - rootBox.left),
        y: round(popupBox.top - rootBox.bottom),
        width: round(popupBox.width),
      },
    },
  };
}

// A real-pointer story elsewhere (vitest/browser page/userEvent) can leave the Playwright mouse over a pane, which
// gives it a real :hover. Park the pointer on a fixed, topmost element outside every pane before rest-state reads.
const PointerPark = () => (
  <div
    data-pointer-park=""
    aria-hidden
    style={{ position: 'fixed', top: 0, left: 0, width: 4, height: 4, zIndex: 2147483647 }}
  />
);
const parkPointer = async (canvas: HTMLElement) => {
  const park = canvas.querySelector<HTMLElement>('[data-pointer-park]');
  if (!park) throw new Error('Missing pointer park');
  // Outside the Vitest browser runner (plain Storybook) there is no carried-over real pointer to reset.
  const browser = await import('vitest/browser').catch(() => undefined);
  await browser?.userEvent.hover(park);
};

function Pairs({ state }: { state: FieldState }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <PointerPark />
      {sizes.map((size, index) => (
        <React.Fragment key={size ?? 'default'}>
          <Field reference id={`ref-${index}`} index={index} state={state} />
          <Field reference={false} id={`own-${index}`} index={index} state={state} />
        </React.Fragment>
      ))}
    </div>
  );
}

function panes(canvas: HTMLElement, index: number) {
  const reference = canvas.querySelector(`[data-field="ref-${index}"]`);
  const candidate = canvas.querySelector(`[data-field="own-${index}"]`);
  if (!reference || !candidate) throw new Error('Missing reference or candidate field');
  return [reference, candidate] as const;
}

export const LabelNotchAndPopup: StoryObj<typeof OwnAutocomplete> = {
  render: () => <Pairs state="chips" />,
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    for (const [index] of sizes.entries()) {
      await parkPointer(canvasElement);
      const pair = panes(canvasElement, index);
      const resting = pair.map((pane) => readField(pane).styles);
      expect(resting[0].labelShrink).toBe('true');
      expect(resting[0].notchWidth).toBeGreaterThan(0);
      expect(resting[1]).toEqual(resting[0]);
      const focused = [];
      for (const pane of pair) {
        const { input } = readField(pane);
        await userEvent.click(input);
        focused.push(
          await waitFor(() => {
            const { styles } = readField(pane);
            expect(styles.popup).toBeDefined();
            expect(styles.popup?.width).toBe(styles.box[0]);
            return styles;
          }),
        );
        await userEvent.keyboard('{Escape}');
        input.blur();
        await parkPointer(canvasElement);
      }
      expect(focused[1]).toEqual(focused[0]);
    }
  },
};

export const AutofillLabelAndNotch: StoryObj<typeof OwnAutocomplete> = {
  render: () => <Pairs state="autofill" />,
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    for (const [index] of sizes.entries()) {
      await parkPointer(canvasElement);
      const [reference, candidate] = panes(canvasElement, index);
      expect(readField(reference).styles.labelShrink).toBe('false');
      expect(readField(candidate).styles).toEqual(readField(reference).styles);
      for (const [animationName, shrink] of [
        ['mui-auto-fill', 'true'],
        ['mui-auto-fill-cancel', 'false'],
      ]) {
        for (const pane of [reference, candidate]) {
          // Exercise MUI's browser-autofill signal without supplying credentials or depending on Chromium autofill.
          readField(pane).input.dispatchEvent(new AnimationEvent('animationstart', { animationName, bubbles: true }));
        }
        // Explicit ceiling: the frozen reference rarely takes over 1 s to apply the autofill shrink (pre-existing; 0/20
        // vs 0/20 runs, medians 136.5/137 ms on rc1 and H24). Same wait and the same assertions for both panes.
        await waitFor(
          () => {
            const before = readField(reference).styles;
            expect(before.labelShrink).toBe(shrink);
            expect(readField(candidate).styles).toEqual(before);
          },
          { timeout: 3000 },
        );
      }
    }
  },
};

async function checkRestingState(canvas: HTMLElement, state: 'disabled' | 'error') {
  await parkPointer(canvas);
  for (const [index] of sizes.entries()) {
    const [reference, candidate] = panes(canvas, index);
    const before = readField(reference).styles;
    expect(before.disabled).toBe(state === 'disabled');
    expect(before.invalid).toBe(String(state === 'error'));
    expect(readField(candidate).styles).toEqual(before);
  }
}

export const DisabledField: StoryObj<typeof OwnAutocomplete> = {
  render: () => <Pairs state="disabled" />,
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    await checkRestingState(canvasElement, 'disabled');
  },
};

export const ErrorField: StoryObj<typeof OwnAutocomplete> = {
  render: () => <Pairs state="error" />,
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    await checkRestingState(canvasElement, 'error');
  },
};
