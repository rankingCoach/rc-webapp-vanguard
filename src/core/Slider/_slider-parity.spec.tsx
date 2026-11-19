import { act, fireEvent, render } from '@testing-library/react';
import React, { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { SliderMui } from './_SliderMui.reference';
import { Slider, SliderProps } from './Slider';

/**
 * Differential parity (track g): the former MUI 9.5 Slider path (verbatim, _SliderMui.reference.tsx) vs the own
 * Slider (use-own-slider.ts). Whole subtree (tags, classes as a set without emotion `css-*`, attributes without
 * own-core markers, inline styles, text) over value/range × marks × step × valueLabelDisplay × disabled × type/size,
 * in both themes; and interaction timelines — pointer press/move/release (incl. drag threshold, range swap, non-left
 * button), touch, native input change (keyboard), Page/Home/End keys, focus/blur/hover value labels, controlled prop
 * changes, externalControlled — comparing DOM, active element and every onChange/onChangeCommitted call.
 */
type Impl = 'mui' | 'own';
const OWN_ONLY = new Set(['data-vg-core', 'data-slot', 'data-disabled', 'data-dragging']);
type Node = { tag: string; classes: string[]; attrs: string[]; style: string | null; text?: string; children: Node[] };
const describeTree = (el: Element): Node => ({
  tag: el.tagName,
  classes: [
    ...new Set(
      (el.getAttribute('class') ?? '')
        .split(/\s+/)
        .filter((c) => c && !/^css-/.test(c) && c !== 'vg-typography-vanguard'),
    ),
  ],
  attrs: el
    .getAttributeNames()
    .filter((n) => n !== 'class' && n !== 'style' && !OWN_ONLY.has(n))
    .sort()
    .map((n) => `${n}=${el.getAttribute(n)}`),
  style: el.getAttribute('style'),
  ...(el.children.length === 0 && el.textContent ? { text: el.textContent } : {}),
  children: [...el.children].map(describeTree),
});
const C = (impl: Impl) => (impl === 'mui' ? SliderMui : Slider);
const MARKS = [
  { value: 0, label: 'zero' },
  { value: 40, label: 'forty' },
  { value: 100, label: 'max' },
];

/** Test host: holds the value like a parent; `mirror` feeds onChange back into value; `box.set` changes the prop. */
const Host = (props: {
  impl: Impl;
  p: SliderProps;
  mirror: boolean;
  calls: string[];
  box: { set: (v: number | number[]) => void };
}) => {
  const { impl, p, mirror, calls, box } = props;
  const Comp = C(impl);
  const [value, setValue] = useState(p.value);
  box.set = setValue;
  return (
    <Comp
      {...p}
      value={value}
      onChange={(e, v, t) => {
        calls.push(
          `change:${e === null ? 'null' : e.type}:${JSON.stringify((e as { target?: { value?: unknown } } | null)?.target?.value ?? null)}:${JSON.stringify(v)}:${t}`,
        );
        if (mirror) setValue(v);
      }}
      onChangeCommitted={(e, v) => calls.push(`commit:${(e as Event).type}:${JSON.stringify(v)}`)}
    />
  );
};

const matrix: { name: string; p: SliderProps }[] = [];
for (const value of [0, 30, 100, 130, -5, [20, 60], [60, 20], [50, 50]] as (number | number[])[])
  for (const marks of [undefined, MARKS])
    for (const valueLabelDisplay of [undefined, 'on', 'auto', 'off'] as const)
      for (const disabled of [undefined, true])
        matrix.push({
          name: `${JSON.stringify(value)}/${marks ? 'marks' : ''}/${valueLabelDisplay}/${disabled}`,
          p: { value, min: 0, max: 100, marks, valueLabelDisplay, disabled },
        });
for (const type of ['default', 'simple', 'primary'] as const)
  for (const size of ['default', 'small'] as const)
    matrix.push({ name: `${type}/${size}`, p: { value: 3, min: 1, max: 9, step: 2, type, size } });
matrix.push({ name: 'fractional step', p: { value: 0.3, min: 0, max: 1, step: 0.1 } });

describe('Slider parity: MUI 9.5 path vs own', () => {
  let restore: () => void;
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom has no layout: the slider root is 200px wide at x=100.
    const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.classList.contains('MuiSlider-root')
        ? ({
            x: 100,
            y: 10,
            left: 100,
            top: 10,
            width: 200,
            height: 30,
            right: 300,
            bottom: 40,
            toJSON: () => ({}),
          } as DOMRect)
        : ({ x: 0, y: 0, left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0, toJSON: () => ({}) } as DOMRect);
    });
    restore = () => spy.mockRestore();
  });
  afterEach(() => {
    restore();
    vi.useRealTimers();
  });

  for (const theme of ['default', 'vanguard'] as const)
    it(`DOM over ${matrix.length} combinations (${theme} theme)`, () => {
      const wrap = (x: React.ReactElement) =>
        theme === 'vanguard' ? <VanguardThemeProvider>{x}</VanguardThemeProvider> : x;
      const diffs: string[] = [];
      for (const { name, p } of matrix) {
        const Own = C('own');
        const Mui = C('mui');
        const a = render(wrap(<div data-host="">{<Own {...p} />}</div>));
        const b = render(wrap(<div data-host="">{<Mui {...p} />}</div>));
        const own = JSON.stringify(describeTree(a.container.querySelector('[data-host]') as Element));
        const mui = JSON.stringify(describeTree(b.container.querySelector('[data-host]') as Element));
        if (own !== mui) diffs.push(`${name}\n own=${own}\n mui=${mui}`);
        a.unmount();
        b.unmount();
      }
      expect(diffs.slice(0, 2)).toEqual([]);
      expect(diffs.length).toBe(0);
    }, 60000);

  type Step =
    | { down: number; button?: number; id?: number }
    | { move: number; buttons?: number; id?: number }
    | { up: number; id?: number }
    | { touchStart: number }
    | { touchMove: number }
    | { touchEnd: number }
    | { input: number; index?: number }
    | { key: string; index?: number; shift?: boolean }
    | { focus: number }
    | { blur: number }
    | { hover: number }
    | { leave: number }
    | { prop: number | number[] }
    | { frame: true };
  const activeOf = () => {
    const el = document.activeElement;
    return el?.tagName === 'INPUT' ? `input#${el.getAttribute('data-index')}` : (el?.tagName ?? null);
  };
  // jsdom has no PointerEvent: fireEvent.pointer* would carry no button/clientX (MUI's button !== 0 guard returns early).
  // Dispatch MouseEvents with the pointer types, as A's _Slider.mui.spec does; a pointerId only where a step sets one
  // (MUI ignores events whose pointerId differs from the pointer that started the drag).
  const pointer = (type: string, target: EventTarget, clientX: number, init: MouseEventInit, id?: number) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY: 20, ...init });
    if (id !== undefined) Object.defineProperty(event, 'pointerId', { value: id });
    act(() => {
      target.dispatchEvent(event);
    });
  };
  const run = (impl: Impl, p: SliderProps, steps: Step[], mirror = false) => {
    const calls: string[] = [];
    const box: { set: (v: number | number[]) => void } = { set: () => {} };
    const view = render(
      <div data-host="">
        <Host impl={impl} p={p} mirror={mirror} calls={calls} box={box} />
      </div>,
    );
    const host = view.container.querySelector('[data-host]') as Element;
    const root = () => host.querySelector('.MuiSlider-root') as HTMLElement;
    const input = (i = 0) => host.querySelectorAll('input[type="range"]')[i] as HTMLInputElement;
    const thumb = (i: number) => host.querySelectorAll('.MuiSlider-thumb')[i] as HTMLElement;
    const x = (v: number) => 100 + v * 2;
    const trace: unknown[] = [{ mount: [...calls], dom: describeTree(host) }];
    for (const step of steps) {
      if ('down' in step)
        pointer('pointerdown', root(), x(step.down), { button: step.button ?? 0, buttons: 1 }, step.id);
      else if ('move' in step) pointer('pointermove', document, x(step.move), { buttons: step.buttons ?? 1 }, step.id);
      else if ('up' in step) pointer('pointerup', document, x(step.up), { buttons: 0 }, step.id);
      else if ('touchStart' in step)
        fireEvent.touchStart(root(), { changedTouches: [{ identifier: 3, clientX: x(step.touchStart), clientY: 20 }] });
      else if ('touchMove' in step)
        fireEvent.touchMove(document, { changedTouches: [{ identifier: 3, clientX: x(step.touchMove), clientY: 20 }] });
      else if ('touchEnd' in step)
        fireEvent.touchEnd(document, { changedTouches: [{ identifier: 3, clientX: x(step.touchEnd), clientY: 20 }] });
      else if ('input' in step) fireEvent.change(input(step.index), { target: { value: String(step.input) } });
      else if ('key' in step) fireEvent.keyDown(input(step.index), { key: step.key, shiftKey: !!step.shift });
      else if ('focus' in step) act(() => input(step.focus).focus());
      else if ('blur' in step) act(() => input(step.blur).blur());
      else if ('hover' in step) fireEvent.mouseOver(thumb(step.hover));
      else if ('leave' in step) fireEvent.mouseLeave(thumb(step.leave));
      else if ('prop' in step) act(() => box.set(step.prop));
      else
        act(() => {
          vi.advanceTimersByTime(50);
        });
      trace.push({ step, calls: [...calls], active: activeOf(), dom: describeTree(host) });
    }
    view.unmount();
    return trace;
  };

  const scenarios: Record<string, { p: SliderProps; steps: Step[]; mirror?: boolean }> = {
    'press, drag past threshold, release': {
      p: { value: 30, min: 0, max: 100 },
      steps: [{ down: 50 }, { frame: true }, { move: 55 }, { move: 60 }, { move: 70 }, { move: 70 }, { up: 70 }],
    },
    'mirrored parent, step 10 + clamp': {
      p: { value: 30, min: 0, max: 100, step: 10 },
      mirror: true,
      steps: [{ down: 44 }, { move: 98 }, { move: 130 }, { move: -20 }, { up: -20 }],
    },
    'non-left button and stray pointer ignored; buttons=0 move ends the drag': {
      p: { value: 30, min: 0, max: 100 },
      steps: [{ down: 50, button: 2 }, { down: 50 }, { move: 80, id: 9 }, { move: 60, buttons: 0 }, { move: 90 }],
    },
    'range: closest thumb, swap past the other, hover/active z-index': {
      p: { value: [20, 60], min: 0, max: 100, valueLabelDisplay: 'auto' },
      mirror: true,
      steps: [
        { hover: 1 },
        { down: 25 },
        { move: 40 },
        { move: 80 },
        { up: 80 },
        { leave: 1 },
        { down: 55 },
        { up: 55 },
      ],
    },
    'touch start/move/end': {
      p: { value: 30, min: 0, max: 100 },
      steps: [{ touchStart: 40 }, { touchMove: 45 }, { touchMove: 50 }, { touchMove: 55 }, { touchEnd: 55 }],
    },
    'keyboard: native change, Page/Home/End, shift arrow, focus/blur value label': {
      p: { value: 30, min: 0, max: 100, valueLabelDisplay: 'auto' },
      mirror: true,
      steps: [
        { focus: 0 },
        { input: 31 },
        { key: 'PageUp' },
        { key: 'ArrowLeft', shift: true },
        { key: 'End' },
        { key: 'PageUp' },
        { key: 'Home' },
        { key: 'ArrowDown' },
        { key: 'Tab' },
        { blur: 0 },
      ],
    },
    'range keyboard swap': {
      p: { value: [40, 50], min: 0, max: 100 },
      mirror: true,
      steps: [{ focus: 1 }, { input: 30, index: 1 }, { key: 'ArrowUp', index: 0 }],
    },
    'marks without step (null) via keyboard': {
      p: { value: 40, min: 0, max: 100, marks: MARKS, step: null as unknown as number },
      mirror: true,
      steps: [
        { focus: 0 },
        { key: 'ArrowRight' },
        { key: 'ArrowLeft' },
        { key: 'ArrowLeft' },
        { down: 60 },
        { up: 60 },
      ],
    },
    'controlled prop changes and externalControlled': {
      p: { value: 10, min: 0, max: 100, externalControlled: true },
      steps: [{ prop: 70 }, { down: 20 }, { up: 20 }, { prop: [10, 90] }, { prop: 5 }],
    },
    'disabled: drag ignored, prop toggling': {
      p: { value: 30, min: 0, max: 100, disabled: true },
      steps: [{ down: 80 }, { up: 80 }, { focus: 0 }],
    },
  };
  for (const [name, { p, steps, mirror }] of Object.entries(scenarios))
    it(`timeline: ${name}`, () => {
      const own = run('own', p, steps, mirror);
      // Guard: scenarios that press the pointer really reach the slider (no vacuous equality).
      if (steps.some((st) => 'down' in st) && !p.disabled)
        expect(JSON.stringify((own.at(-1) as { calls: string[] }).calls)).toMatch(
          /change:pointerdown|commit:pointerup/,
        );
      expect(own).toEqual(run('mui', p, steps, mirror));
    });
});
