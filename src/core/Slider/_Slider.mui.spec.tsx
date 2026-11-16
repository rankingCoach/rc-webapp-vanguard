import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { Slider, SliderProps } from '@vanguard/Slider/Slider';
import React, { createRef, MutableRefObject, useState } from 'react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { act, fireEvent, render, screen } from '../../../test-utils/test-utils';

const LintParent453 = () => {
        const [value, setValue] = useState(10);
        return (
          <>
            <Slider
              value={value}
              min={0}
              max={100}
              externalControlled
              onChange={(_, v) => v !== undefined && setValue(v)}
            />
            <output>{value}</output>
          </>
        );
      };


/**
 * MUI contract for Slider (wraps MUI v5 `Slider`). MUI v5 drags with mouse/touch events; v9 switches to pointer
 * events. The jsdom drag helpers below dispatch a pointer-typed event and then the mouse event for each step, so the
 * value/thumb assertions do not depend on which family MUI listens to (v5 ignores the pointer events). Only the
 * `[v5-quirk]` tests lock the v5 event types. Real-browser drag/keyboard and the SCSS that targets `.MuiSlider-*` are
 * pinned in `_SliderMuiContract.stories.tsx`.
 */

const base: SliderProps = { value: 50, min: 0, max: 100 };

// MUI classes asserted here are the ones src/core/Slider/Slider.scss targets: `.MuiSlider-root` (:11), `.Mui-disabled`
// on the root (:22), `-rail` (:32), `-track` (:50), `-dragging` (:67), `-thumb` (:77), `.Mui-active` on the thumb (:100),
// `span.MuiSlider-markLabel` (:116, :121), `-valueLabel` (:170), `-valueLabelOpen` (:184). Others are not asserted.
const getRoot = (container: HTMLElement) => container.querySelector('.MuiSlider-root') as HTMLElement;

/** jsdom has no layout: give the slider root a 100px wide box so clientX maps 1:1 to the value (0..100) */
const stubLayout = (root: HTMLElement, width = 100) => {
  root.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width, height: 10, right: width, bottom: 10, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
};

/**
 * jsdom has no PointerEvent: send a MouseEvent typed as the pointer event (with pointerId/pointerType), which is what
 * a pointer-based MUI listener reads (clientX/clientY/button). MUI v5 has no pointer listeners and ignores it.
 */
const dispatchPointer = (type: string, target: EventTarget, x: number, init: MouseEventInit = {}) => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: 5, button: 0, ...init });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  act(() => {
    target.dispatchEvent(event);
  });
};
const press = (root: HTMLElement, x: number, button = 0) => {
  dispatchPointer('pointerdown', root, x, { button, buttons: button === 0 ? 1 : 2 });
  fireEvent.mouseDown(root, { clientX: x, clientY: 5, button });
};
const move = (x: number) => {
  dispatchPointer('pointermove', document, x, { buttons: 1 });
  fireEvent.mouseMove(document, { clientX: x, clientY: 5, buttons: 1 });
};
const release = (x: number) => {
  dispatchPointer('pointerup', document, x, { buttons: 0 });
  fireEvent.mouseUp(document, { clientX: x, clientY: 5 });
};
const drag = (root: HTMLElement, fromX: number, toX: number) => {
  press(root, fromX);
  move(toX);
  release(toX);
};

type OnChange = NonNullable<SliderProps['onChange']>;
type OnChangeCommitted = NonNullable<SliderProps['onChangeCommitted']>;

const callsOf = (fn: Mock<OnChange>) =>
  fn.mock.calls.map(([event, value, thumb]) => [event?.type ?? event, value, thumb] as unknown[]);
/** (value, activeThumb) only: the event family (mouse/touch vs pointer) is MUI-version specific */
const valuesOf = (fn: Mock<OnChange>) => fn.mock.calls.map(([, value, thumb]) => [value, thumb] as unknown[]);
const committedValues = (fn: Mock<OnChangeCommitted>) => fn.mock.calls.map(([, value]) => value as unknown);

describe('Slider (MUI Slider contract)', () => {
  let onChange: Mock<OnChange>;
  let onChangeCommitted: Mock<OnChangeCommitted>;

  beforeEach(() => {
    onChange = vi.fn<OnChange>();
    onChangeCommitted = vi.fn<OnChangeCommitted>();
  });

  describe('render', () => {
    it('renders a range input with role slider and aria-valuenow/min/max/orientation', () => {
      render(<Slider {...base} />);

      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.tagName).toBe('INPUT');
      expect(slider.type).toBe('range');
      expect(slider.getAttribute('aria-valuenow')).toBe('50');
      expect(slider.getAttribute('aria-valuemin')).toBe('0');
      expect(slider.getAttribute('aria-valuemax')).toBe('100');
      expect(slider.getAttribute('aria-orientation')).toBe('horizontal');
      expect(slider.hasAttribute('aria-valuetext')).toBe(false);
      expect(slider.getAttribute('step')).toBe('1');
    });

    it('positions track and thumb by percent of [min, max]', () => {
      const { container } = render(<Slider value={30} min={20} max={60} step={5} />);

      const root = getRoot(container);
      expect((root.querySelector('.MuiSlider-track') as HTMLElement).style.width).toBe('25%');
      expect((root.querySelector('.MuiSlider-thumb') as HTMLElement).style.left).toBe('25%');
      expect(root.querySelector('.MuiSlider-rail')).not.toBeNull();
      expect(screen.getByRole('slider').getAttribute('step')).toBe('5');
    });

    it('clamps an out-of-range value for display', () => {
      const { container } = render(<Slider value={150} min={0} max={100} />);

      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('100');
      expect((getRoot(container).querySelector('.MuiSlider-thumb') as HTMLElement).style.left).toBe('100%');
    });

    it.each([
      [{}, 'vng-slider-container vng-slider-default vng-slider-size-default'],
      [{ type: 'primary', size: 'small' }, 'vng-slider-container vng-slider-primary vng-slider-size-small'],
      [{ type: 'simple' }, 'vng-slider-container vng-slider-simple vng-slider-size-default'],
    ] as const)('container classes for %j (SCSS scopes .MuiSlider-* under them)', (props, expected) => {
      const { container } = render(<Slider {...base} {...props} />);

      expect((container.firstElementChild as HTMLElement).className).toBe(expected);
      expect(getRoot(container).parentElement).toBe(container.firstElementChild);
    });

    it('[bug-lock] forwards targetRef to the MUI root <span> (typed as HTMLInputElement)', () => {
      // Baseline characterization: not a promised contract.
      // CURRENT BEHAVIOUR (suspected bug): `targetRef` is typed MutableRefObject<HTMLInputElement> but MUI puts
      // the ref on the root <span>, not on the range input.
      const ref = createRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement | null>;
      const { container } = render(<Slider {...base} targetRef={ref} />);

      expect(ref.current).toBe(getRoot(container));
      expect(ref.current?.tagName).toBe('SPAN');
    });
  });

  describe('marks', () => {
    const marks = [
      { value: 0, label: '0' },
      { value: 50, label: '50' },
      { value: 100, label: '100' },
    ];

    it('renders one aria-hidden .MuiSlider-markLabel <span> per mark, positioned at the mark value', () => {
      const { container } = render(<Slider {...base} marks={marks} />);

      const labels = Array.from(getRoot(container).querySelectorAll<HTMLElement>('.MuiSlider-markLabel'));
      expect(labels.map((l) => l.tagName)).toEqual(['SPAN', 'SPAN', 'SPAN']);
      expect(labels.map((l) => l.textContent)).toEqual(['0', '50', '100']);
      expect(labels.map((l) => l.style.left)).toEqual(['0%', '50%', '100%']);
      labels.forEach((l) => { expect(l.getAttribute('aria-hidden')).toBe('true'); });
    });

    // Slider.scss:116 hides `span.MuiSlider-markLabel:first-of-type` and :121 styles `:first-of-type` / `:nth-child(1)`,
    // but MUI renders the rail as the first <span>, so these selectors match no label: all labels stay visible.
    it('[v5-quirk] no mark label is the first <span> child, so the SCSS :first-of-type / :nth-child(1) rules never match', () => {
      // Baseline characterization: not a promised contract.
      const { container } = render(<Slider {...base} marks={marks} />);

      const root = getRoot(container);
      expect(root.querySelectorAll('span.MuiSlider-markLabel:first-of-type')).toHaveLength(0);
      expect(root.querySelectorAll('.MuiSlider-markLabel:nth-child(1)')).toHaveLength(0);
    });
  });

  describe('valueLabelDisplay', () => {
    it('off (default) renders no value label', () => {
      const { container } = render(<Slider {...base} />);

      expect(getRoot(container).querySelector('.MuiSlider-valueLabel')).toBeNull();
    });

    it('on renders an open value label with the value', () => {
      const { container } = render(<Slider {...base} valueLabelDisplay="on" />);

      const label = getRoot(container).querySelector('.MuiSlider-valueLabel') as HTMLElement;
      expect(label.getAttribute('aria-hidden')).toBe('true');
      expect(label.textContent).toBe('50');
      expect(label.classList.contains('MuiSlider-valueLabelOpen')).toBe(true);
    });

    it('auto renders a closed value label that opens on focus and closes on blur', () => {
      const { container } = render(<Slider {...base} valueLabelDisplay="auto" />);

      const label = () => getRoot(container).querySelector('.MuiSlider-valueLabel') as HTMLElement;
      expect(label().classList.contains('MuiSlider-valueLabelOpen')).toBe(false);
      act(() => screen.getByRole('slider').focus());
      expect(label().classList.contains('MuiSlider-valueLabelOpen')).toBe(true);
      act(() => screen.getByRole('slider').blur());
      expect(label().classList.contains('MuiSlider-valueLabelOpen')).toBe(false);
    });

    it('auto opens the value label on thumb hover', () => {
      const { container } = render(<Slider {...base} valueLabelDisplay="auto" />);

      const thumb = getRoot(container).querySelector('.MuiSlider-thumb') as HTMLElement;
      fireEvent.mouseOver(thumb);
      expect(getRoot(container).querySelector('.MuiSlider-valueLabelOpen')).not.toBeNull();
      fireEvent.mouseLeave(thumb);
      expect(getRoot(container).querySelector('.MuiSlider-valueLabelOpen')).toBeNull();
    });
  });

  describe('onChange on mount and on prop changes', () => {
    // CURRENT BEHAVIOUR (suspected bug): the wrapper calls onChange on mount, first with (null, undefined,
    // undefined) from the formconfig effect, then with (null, value, value) - activeThumb receives the value.
    it('[bug-lock] calls onChange twice on mount with a null event', () => {
      // Baseline characterization: not a promised contract.
      render(<Slider {...base} onChange={onChange} />);

      expect(callsOf(onChange)).toEqual([
        [null, undefined, undefined],
        [null, 50, 50],
      ]);
    });

    it('moves the thumb when the value prop changes', () => {
      const { rerender } = render(<Slider {...base} />);

      rerender(<Slider {...base} value={20} />);

      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('20');
    });

    // CURRENT BEHAVIOUR (suspected bug): a value prop change is echoed back through onChange(null, value, value).
    it('[bug-lock] calls onChange(null, value, value) when the value prop changes', () => {
      // Baseline characterization: not a promised contract.
      const { rerender } = render(<Slider {...base} onChange={onChange} />);
      onChange.mockClear();

      rerender(<Slider {...base} value={20} onChange={onChange} />);

      expect(callsOf(onChange)).toEqual([[null, 20, 20]]);
    });
  });

  describe('drag', () => {
    it('press jumps, move follows, release commits; onChange gets (value, activeThumb)', () => {
      const { container } = render(<Slider {...base} onChange={onChange} onChangeCommitted={onChangeCommitted} />);
      const root = getRoot(container);
      stubLayout(root);
      onChange.mockClear();

      drag(root, 30, 70);

      expect(valuesOf(onChange)).toEqual([
        [30, 0],
        [70, 0],
      ]);
      expect(committedValues(onChangeCommitted)).toEqual([70]);
      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('70');
    });

    it("[v5-quirk] drag callbacks receive pointer event types (v9)", () => {
      // Baseline characterization: not a promised contract.
      const { container } = render(<Slider {...base} onChange={onChange} onChangeCommitted={onChangeCommitted} />);
      const root = getRoot(container);
      stubLayout(root);
      onChange.mockClear();

      drag(root, 30, 70);

      expect(callsOf(onChange).map(([type]) => type)).toEqual(['pointerdown', 'pointermove']);
      expect(onChangeCommitted.mock.calls.map(([e]) => e.type)).toEqual(['pointerup']);
    });

    it('passes a cloned event whose target is { value, name } (form-library integration)', () => {
      const { container } = render(<Slider {...base} onChange={onChange} />);
      const root = getRoot(container);
      stubLayout(root);
      onChange.mockClear();

      press(root, 40);

      const [event] = onChange.mock.calls[0];
      expect(event).toBeInstanceOf(MouseEvent);
      expect(event!.target).toEqual({ value: 40, name: undefined });
      release(40);
    });

    it('adds MuiSlider-dragging only after the pointer moves past the drag threshold, removes it on mouseup', () => {
      const { container } = render(<Slider {...base} />);
      const root = getRoot(container);
      stubLayout(root);

      press(root, 30);
      expect(root.classList.contains('MuiSlider-dragging')).toBe(false);
      move(31);
      move(32);
      move(33);
      expect(root.classList.contains('MuiSlider-dragging')).toBe(true);
      expect(root.querySelector('.MuiSlider-thumb')?.classList.contains('Mui-active')).toBe(true);
      release(33);
      expect(root.classList.contains('MuiSlider-dragging')).toBe(false);
    });

    it('rounds to step and clamps to [min, max]', () => {
      const { container } = render(<Slider value={50} min={0} max={100} step={10} onChange={onChange} />);
      const root = getRoot(container);
      stubLayout(root);
      onChange.mockClear();

      press(root, 33);
      move(250);
      release(250);

      expect(valuesOf(onChange)).toEqual([
        [30, 0],
        [100, 0],
      ]);
    });

    it('ignores non-left mouse buttons', () => {
      const { container } = render(<Slider {...base} onChange={onChange} />);
      const root = getRoot(container);
      stubLayout(root);
      onChange.mockClear();

      press(root, 30, 2);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('drag also works without onChange/onChangeCommitted', () => {
      const { container } = render(<Slider {...base} />);
      const root = getRoot(container);
      stubLayout(root);

      drag(root, 10, 20);

      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('20');
    });
  });

  describe('touch drag (MUI v5 touch listeners; v9 uses pointer events)', () => {
    it('[v5-quirk] touchstart/touchmove/touchend change and commit the value', () => {
      // Baseline characterization: not a promised contract.
      const { container } = render(<Slider {...base} onChange={onChange} onChangeCommitted={onChangeCommitted} />);
      const root = getRoot(container);
      stubLayout(root);
      onChange.mockClear();

      const touch = (x: number) => ({ changedTouches: [{ identifier: 1, clientX: x, clientY: 5 }] });
      fireEvent.touchStart(root, touch(25));
      fireEvent.touchMove(document, touch(60));
      fireEvent.touchEnd(document, touch(60));

      expect(callsOf(onChange)).toEqual([
        ['touchstart', 25, 0],
        ['touchmove', 60, 0],
      ]);
      expect(onChangeCommitted.mock.calls.map(([e, v]) => [e.type, v])).toEqual([['touchend', 60]]);
    });
  });

  describe('keyboard', () => {
    it.each([
      ['PageUp', {}, 60],
      ['PageDown', {}, 40],
      ['ArrowRight', { shiftKey: true }, 60],
      ['ArrowUp', { shiftKey: true }, 60],
      ['ArrowLeft', { shiftKey: true }, 40],
      ['ArrowDown', { shiftKey: true }, 40],
    ])('%s %j moves by shiftStep (10) and commits', (key, modifiers, expected) => {
      render(<Slider {...base} onChange={onChange} onChangeCommitted={onChangeCommitted} />);
      onChange.mockClear();

      fireEvent.keyDown(screen.getByRole('slider'), { key, ...modifiers });

      expect(callsOf(onChange)).toEqual([['keydown', expected, 0]]);
      expect(onChangeCommitted.mock.calls.map(([e, v]) => [e.type, v])).toEqual([['keydown', expected]]);
      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe(String(expected));
    });

    it('a native change on the range input (arrow keys in a browser) calls onChange with the new value', () => {
      render(<Slider {...base} onChange={onChange} onChangeCommitted={onChangeCommitted} />);
      onChange.mockClear();

      fireEvent.change(screen.getByRole('slider'), { target: { value: '51' } });

      expect(callsOf(onChange)).toEqual([['change', 51, 0]]);
      expect(onChangeCommitted).toHaveBeenCalledTimes(1);
    });

    it('PageUp at max does not call onChange (value unchanged) but still commits', () => {
      render(<Slider {...base} value={100} onChange={onChange} onChangeCommitted={onChangeCommitted} />);
      onChange.mockClear();

      fireEvent.keyDown(screen.getByRole('slider'), { key: 'PageUp' });

      expect(onChange).not.toHaveBeenCalled();
      expect(onChangeCommitted).toHaveBeenCalledTimes(1);
    });
  });

  describe('disabled', () => {
    it('disables the input and ignores drag', () => {
      const { container } = render(<Slider {...base} disabled onChange={onChange} />);
      const root = getRoot(container);
      stubLayout(root);
      onChange.mockClear();

      expect((screen.getByRole('slider') as HTMLInputElement).disabled).toBe(true);
      drag(root, 10, 90);
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('50');
    });

    it('marks the root with .Mui-disabled (Slider.scss:22 greys it out)', () => {
      const { container } = render(<Slider {...base} disabled />);

      expect(getRoot(container).classList.contains('Mui-disabled')).toBe(true);
    });
  });

  describe('controlled / uncontrolled', () => {
    it('default: keeps the dragged value internally even if the parent never updates value', () => {
      const { container } = render(<Slider {...base} onChange={onChange} />);
      const root = getRoot(container);
      stubLayout(root);

      drag(root, 80, 80);

      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('80');
    });

    it('externalControlled: onChange fires but the thumb stays until the parent changes value', () => {
      const { container, rerender } = render(<Slider {...base} externalControlled onChange={onChange} />);
      const root = getRoot(container);
      stubLayout(root);
      onChange.mockClear();

      drag(root, 80, 80);
      expect(valuesOf(onChange)[0]).toEqual([80, 0]);
      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('50');

      rerender(<Slider {...base} value={80} externalControlled onChange={onChange} />);
      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('80');
    });

    // MUI compares against its (stale) controlled value, so every move to the same spot is reported again.
    it('[v5-quirk] externalControlled: a move to the already reported position fires onChange again', () => {
      // Baseline characterization: not a promised contract.
      const { container } = render(<Slider {...base} externalControlled onChange={onChange} />);
      const root = getRoot(container);
      stubLayout(root);
      onChange.mockClear();

      drag(root, 80, 80);

      expect(valuesOf(onChange)).toEqual([
        [80, 0],
        [80, 0],
      ]);
    });

    it('a parent that mirrors onChange into value stays in sync', () => {
      const Parent = LintParent453;
      const { container } = render(<Parent />);
      const root = getRoot(container);
      stubLayout(root);

      drag(root, 45, 65);

      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('65');
      expect(container.querySelector('output')?.textContent).toBe('65');
    });
  });

  describe('range (array value)', () => {
    it('renders one slider per thumb and drags the closest thumb (activeThumb index)', () => {
      const { container } = render(
        <Slider value={[20, 80]} min={0} max={100} onChange={onChange} onChangeCommitted={onChangeCommitted} />,
      );
      const root = getRoot(container);
      stubLayout(root);
      onChange.mockClear();

      const sliders = screen.getAllByRole('slider');
      expect(sliders.map((s) => s.getAttribute('aria-valuenow'))).toEqual(['20', '80']);
      expect((root.querySelector('.MuiSlider-track') as HTMLElement).style.left).toBe('20%');
      expect((root.querySelector('.MuiSlider-track') as HTMLElement).style.width).toBe('60%');

      drag(root, 70, 90);

      expect(valuesOf(onChange)).toEqual([
        [[20, 70], 1],
        [[20, 90], 1],
      ]);
      expect(committedValues(onChangeCommitted)).toEqual([[20, 90]]);
    });

    it('swaps the active thumb when it is dragged past the other one', () => {
      const { container } = render(<Slider value={[40, 60]} min={0} max={100} onChange={onChange} />);
      const root = getRoot(container);
      stubLayout(root);
      onChange.mockClear();

      drag(root, 38, 75);

      expect(valuesOf(onChange)).toEqual([
        [[38, 60], 0],
        [[60, 75], 1],
      ]);
    });
  });

  describe('formconfig', () => {
    const makeFormConfig = (overrides: Partial<FormConfigElement> = {}): FormConfigElement => ({
      _inputRef: { current: null },
      setStateValue: vi.fn(),
      ...overrides,
    });

    it('marks fieldType "Slider" and pushes the value prop into setStateValue', () => {
      const formconfig = makeFormConfig();
      render(<Slider {...base} formconfig={formconfig} />);

      expect(formconfig.fieldType).toBe('Slider');
      expect(formconfig.setStateValue).toHaveBeenCalledWith(50);
    });

    it('replaces formconfig._inputRef with targetRef when both are given', () => {
      const targetRef = createRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement | null>;
      const formconfig = makeFormConfig();
      render(<Slider {...base} formconfig={formconfig} targetRef={targetRef} />);

      expect(formconfig._inputRef).toBe(targetRef);
    });

    // CURRENT BEHAVIOUR (suspected bug): without targetRef the wrapper only reassigns a local variable, so the
    // MUI ref is never attached to formconfig._inputRef.
    it('[bug-lock] leaves formconfig._inputRef unattached when targetRef is omitted', () => {
      // Baseline characterization: not a promised contract.
      const formconfig = makeFormConfig();
      render(<Slider {...base} formconfig={formconfig} />);

      expect(formconfig._inputRef?.current).toBeNull();
    });

    // CURRENT BEHAVIOUR (suspected bug): on mount the value-prop effect runs after the stateValue effect, so the
    // value prop overrides formconfig.stateValue; only a later stateValue change is displayed.
    it('[bug-lock] on mount the value prop overrides formconfig.stateValue; a later stateValue change is displayed', () => {
      // Baseline characterization: not a promised contract.
      const formconfig = makeFormConfig({ stateValue: 30 });
      const { rerender } = render(<Slider {...base} formconfig={formconfig} onChange={onChange} />);

      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('50');
      expect(callsOf(onChange)).toEqual([
        [null, 30, 30],
        [null, 50, 50],
      ]);

      onChange.mockClear();
      rerender(<Slider {...base} formconfig={{ ...formconfig, stateValue: 70 }} onChange={onChange} />);

      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('70');
      expect(callsOf(onChange)).toEqual([[null, 70, 70]]);
    });
  });
});
