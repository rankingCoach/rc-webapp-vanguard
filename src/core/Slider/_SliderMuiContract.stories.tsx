import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React, { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Slider, SliderProps } from './Slider';

/**
 * MUI contract (real browser) for Slider over MUI v5. Pins:
 * 1. drag + keyboard in a real browser (MUI v9 moves drag to pointer events; this must keep working),
 * 2. the computed result of Slider.scss, which targets `.MuiSlider-root/-rail/-track/-thumb/-dragging/
 *    -markLabel/-valueLabel/-valueLabelOpen` (renamed or re-nested classes go red here).
 */
export default {
  ...SbDecorator({
    title: 'Vanguard/Slider/MUI Contract',
    component: Slider,
  }),
};

type Story = StoryObj<typeof Slider>;

const resolveColor = (cssColor: string, host: HTMLElement): string => {
  const probe = document.createElement('span');
  probe.style.backgroundColor = cssColor;
  host.appendChild(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
};

// Bounded wait for MUI transitions / state to settle under a loaded full-suite run
const SETTLE = { timeout: 5000 };

// `.MuiSlider-root/-rail/-track/-thumb/-dragging/-markLabel/-valueLabel/-valueLabelOpen` and `.Mui-disabled` are the
// classes src/core/Slider/Slider.scss targets (:11, :32, :50, :77, :67, :116/:121, :170, :184, :22).
const getRoot = (canvasElement: HTMLElement) => canvasElement.querySelector('.MuiSlider-root') as HTMLElement;
const part = (root: HTMLElement, name: string) => root.querySelector(`.MuiSlider-${name}`) as HTMLElement;

const onChangeSpy = fn();
const onCommitSpy = fn();

const Harness = (props: Partial<SliderProps>) => {
  const [value, setValue] = useState<number | number[]>(props.value ?? 50);
  return (
    <div style={{ width: 400, padding: '48px 24px' }}>
      <Slider
        min={0}
        max={100}
        {...props}
        value={value}
        externalControlled
        onChange={(event, v, thumb) => {
          onChangeSpy(event?.type ?? null, v, thumb);
          if (event) setValue(v);
        }}
        onChangeCommitted={(event, v) => onCommitSpy(event.type, v)}
      />
      <output data-testid="value">{JSON.stringify(value)}</output>
    </div>
  );
};

/** Viewport x for a value (0..100) on the root's box */
const xFor = (root: HTMLElement, value: number) => {
  const rect = root.getBoundingClientRect();
  return { x: rect.left + (rect.width * value) / 100, y: rect.top + rect.height / 2 };
};

export const DefaultScssGeometry: Story = {
  render: () => <Harness value={50} />,
  play: async ({ canvasElement }) => {
    const root = getRoot(canvasElement);
    await expect(getComputedStyle(root).height).toBe('32px');
    await expect(getComputedStyle(root).cursor).toBe('pointer');
    await expect(getComputedStyle(part(root, 'rail')).height).toBe('8px');
    await expect(getComputedStyle(part(root, 'rail')).opacity).toBe('1');
    await expect(getComputedStyle(part(root, 'track')).height).toBe('8px');
    await expect(getComputedStyle(part(root, 'track')).borderTopLeftRadius).toBe('4px');
    const thumb = getComputedStyle(part(root, 'thumb'));
    await expect(thumb.width).toBe('32px');
    await expect(thumb.height).toBe('32px');
    await expect(thumb.borderTopLeftRadius).toBe('50%');
    await expect(thumb.backgroundImage).toContain('data:image/svg+xml');
    await expect(thumb.backgroundColor).toBe(resolveColor('var(--fn-bg-cta)', canvasElement));
    await expect(getComputedStyle(part(root, 'track')).backgroundColor).toBe(
      resolveColor('var(--fn-bg-cta)', canvasElement),
    );
    await expect(getComputedStyle(part(root, 'rail')).backgroundColor).toBe(
      resolveColor('var(--fn-bg-var)', canvasElement),
    );
    // Guard: the tokens resolve to a real colour in Storybook
    await expect(resolveColor('var(--fn-bg-cta)', canvasElement)).not.toBe('rgba(0, 0, 0, 0)');
  },
};

export const SmallSizeScss: Story = {
  render: () => <Harness value={50} size="small" />,
  play: async ({ canvasElement }) => {
    const root = getRoot(canvasElement);
    await expect(getComputedStyle(root).height).toBe('24px');
    await expect(getComputedStyle(part(root, 'rail')).height).toBe('4px');
    await expect(getComputedStyle(part(root, 'track')).height).toBe('4px');
    await expect(getComputedStyle(part(root, 'thumb')).width).toBe('24px');
    await expect(getComputedStyle(part(root, 'thumb')).height).toBe('24px');
  },
};

export const SimpleAndPrimaryThemesScss: Story = {
  render: () => (
    <>
      <div data-testid="simple">
        <Harness value={50} type="simple" />
      </div>
      <div data-testid="primary">
        <Harness value={50} type="primary" />
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const simple = getRoot(canvas.getByTestId('simple'));
    const primary = getRoot(canvas.getByTestId('primary'));

    await expect(getComputedStyle(part(simple, 'thumb')).borderTopWidth).toBe('2px');
    await expect(getComputedStyle(part(simple, 'thumb')).backgroundColor).toBe(
      resolveColor('var(--fn-bg-surface)', canvasElement),
    );
    await expect(getComputedStyle(part(simple, 'track')).backgroundColor).toBe(
      resolveColor('var(--fn-bg-var)', canvasElement),
    );
    await expect(getComputedStyle(part(primary, 'track')).zIndex).toBe('3');
    await expect(getComputedStyle(part(primary, 'rail')).zIndex).toBe('1');
    await expect(getComputedStyle(part(primary, 'thumb')).filter).toContain('drop-shadow');
  },
};

export const MarkLabelsScss: Story = {
  render: () => (
    <Harness
      value={50}
      marks={[
        { value: 0, label: 'Zero' },
        { value: 50, label: 'Half' },
        { value: 100, label: 'Full' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const root = getRoot(canvasElement);
    const labels = Array.from(root.querySelectorAll<HTMLElement>('.MuiSlider-markLabel'));
    await expect(labels.map((l) => l.textContent)).toEqual(['Zero', 'Half', 'Full']);
    // Slider.scss:121: labels sit 30px above the rail in a 12px font
    for (const label of labels) {
      await expect(getComputedStyle(label).top).toBe('-30px');
      await expect(getComputedStyle(label).fontSize).toBe('12px');
    }
  },
};

export const FirstMarkLabelIsNotHidden: Story = {
  name: '[v5-quirk] the first mark label is not hidden by span.MuiSlider-markLabel:first-of-type',
  render: MarkLabelsScss.render,
  play: async ({ canvasElement }) => {
    // Baseline characterization: not a promised contract.
    // Slider.scss:116 hides `span.MuiSlider-markLabel:first-of-type`, but the rail is the first <span>, so no label
    // matches and all labels are shown (flex).
    const labels = Array.from(getRoot(canvasElement).querySelectorAll<HTMLElement>('.MuiSlider-markLabel'));
    for (const label of labels) {
      await expect(getComputedStyle(label).display).toBe('flex');
    }
  },
};

export const ValueLabelOpacityScss: Story = {
  render: () => (
    <>
      <div data-testid="on">
        <Harness value={40} valueLabelDisplay="on" />
      </div>
      <div data-testid="auto">
        <Harness value={60} valueLabelDisplay="auto" />
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const onLabel = part(getRoot(canvas.getByTestId('on')), 'valueLabel');
    await waitFor(() => expect(getComputedStyle(onLabel).opacity).toBe('1'), SETTLE);
    await expect(onLabel).toHaveTextContent('40');
    await expect(onLabel).toHaveClass('MuiSlider-valueLabelOpen');

    const autoRoot = getRoot(canvas.getByTestId('auto'));
    const autoLabel = part(autoRoot, 'valueLabel');
    await expect(getComputedStyle(autoLabel).opacity).toBe('0');
    await userEvent.hover(part(autoRoot, 'thumb'));
    await waitFor(() => expect(getComputedStyle(autoLabel).opacity).toBe('1'), SETTLE);
    await expect(autoLabel).toHaveClass('MuiSlider-valueLabelOpen');
    await userEvent.unhover(part(autoRoot, 'thumb'));
    await waitFor(() => expect(getComputedStyle(autoLabel).opacity).toBe('0'), SETTLE);
  },
};

export const DragInRealBrowser: Story = {
  render: () => <Harness value={20} />,
  play: async ({ canvasElement }) => {
    onChangeSpy.mockClear();
    onCommitSpy.mockClear();
    const canvas = within(canvasElement);
    const root = getRoot(canvasElement);
    const slider = canvas.getByRole('slider');

    // Mount-time onChange(null, ...) calls are a wrapper quirk (see the spec); only count real events
    const start = xFor(root, 20);
    const end = xFor(root, 75);
    // MUI only flags an intentional drag after more than 2 moves
    const moves = [35, 50, 65, 75].map((v) => {
      const p = xFor(root, v);
      return { target: root, coords: { clientX: p.x, clientY: p.y } };
    });
    // One user-event instance so the held button survives across the two pointer() calls
    const user = userEvent.setup();
    await user.pointer([
      { keys: '[MouseLeft>]', target: root, coords: { clientX: start.x, clientY: start.y } },
      ...moves,
    ]);
    // While the button is held after moving, the SCSS repaints the track (via `.MuiSlider-dragging`, Slider.scss:67)
    await waitFor(
      () =>
        expect(getComputedStyle(part(root, 'track')).backgroundColor).toBe(
          resolveColor('var(--fn-bg-cta-hov)', canvasElement),
        ),
      SETTLE,
    );
    // (hover alone paints the same colour, so also pin the SCSS hook MUI sets while dragging)
    await waitFor(() => expect(root).toHaveClass('MuiSlider-dragging'), SETTLE);
    await user.pointer({ keys: '[/MouseLeft]', target: root, coords: { clientX: end.x, clientY: end.y } });

    await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '75'), SETTLE);
    await expect(canvas.getByTestId('value')).toHaveTextContent('75');
    const realCalls = onChangeSpy.mock.calls.filter(([type]) => type !== null);
    await expect(realCalls.at(-1)).toEqual([expect.any(String), 75, 0]);
    await expect(onCommitSpy).toHaveBeenCalledTimes(1);
    await expect(onCommitSpy.mock.calls[0][1]).toBe(75);
    // Class hook last, so a rename cannot hide the outcomes above
    await waitFor(() => expect(root).not.toHaveClass('MuiSlider-dragging'), SETTLE);
  },
};

export const ClickJumpsToPosition: Story = {
  render: () => <Harness value={10} />,
  play: async ({ canvasElement }) => {
    const root = getRoot(canvasElement);
    const target = xFor(root, 90);
    await userEvent.pointer([
      { keys: '[MouseLeft]', target: root, coords: { clientX: target.x, clientY: target.y } },
    ]);
    await waitFor(() => expect(within(canvasElement).getByRole('slider')).toHaveAttribute('aria-valuenow', '90'), SETTLE);
  },
};

export const KeyboardInRealBrowser: Story = {
  render: () => <Harness value={50} />,
  play: async ({ canvasElement }) => {
    onChangeSpy.mockClear();
    const slider = within(canvasElement).getByRole('slider');
    slider.focus();
    await expect(slider).toHaveFocus();
    // Keyboard focus is focus-visible -> MUI marks the thumb
    await userEvent.keyboard('{PageUp}');
    await expect(slider).toHaveAttribute('aria-valuenow', '60');
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    await expect(slider).toHaveAttribute('aria-valuenow', '50');
    await userEvent.keyboard('{PageDown}{PageDown}');
    await expect(slider).toHaveAttribute('aria-valuenow', '30');
    const realCalls = onChangeSpy.mock.calls.filter(([type]) => type !== null);
    await expect(realCalls).toEqual([
      ['keydown', 60, 0],
      ['keydown', 50, 0],
      ['keydown', 40, 0],
      ['keydown', 30, 0],
    ]);
  },
};

export const DisabledScss: Story = {
  render: () => <Harness value={50} disabled />,
  play: async ({ canvasElement }) => {
    const root = getRoot(canvasElement);
    await expect(getComputedStyle(root).opacity).toBe('0.5');
    await expect(getComputedStyle(root).pointerEvents).toBe('none');
    await expect(within(canvasElement).getByRole('slider')).toBeDisabled();
    await expect(root).toHaveClass('Mui-disabled');
  },
};
