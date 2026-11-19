import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IconNames } from '../Icon/IconNames';
import { ButtonMui } from './_ButtonMui.reference';
import { Button, ButtonProps, ButtonSizes, ButtonTextColors, ButtonTypes } from './Button';

/**
 * Differential parity (track g, Tier A + B): the former Button (MUI Grow for the hover icon swap, verbatim in
 * _ButtonMui.reference.tsx) vs the own Button (A's Grow primitive). Whole subtree — tags, classes, attributes, inline
 * styles (incl. Grow's opacity/transform/transition writes), text — over every type × size × icon configuration ×
 * loading × disabled × shape × label, the muted-only and text-colour props, and hover timelines step by step.
 */
type Impl = 'mui' | 'own';
type Node = { tag: string; classes: string[]; attrs: string[]; style: string | null; text?: string; children: Node[] };
const describeTree = (el: Element): Node => ({
  tag: el.tagName,
  classes: (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
  attrs: el
    .getAttributeNames()
    .filter((n) => n !== 'class' && n !== 'style')
    .sort()
    .map((n) => `${n}=${el.getAttribute(n)}`),
  style: el.getAttribute('style'),
  ...(el.children.length === 0 && el.textContent ? { text: el.textContent } : {}),
  children: [...el.children].map(describeTree),
});
const element = (impl: Impl, p: ButtonProps) => (impl === 'mui' ? <ButtonMui {...p} /> : <Button {...p} />);

const types = [
  undefined,
  ButtonTypes.default,
  ButtonTypes.secondary,
  ButtonTypes.primary,
  ButtonTypes.shimmer,
  ButtonTypes.muted,
];
const sizes = [undefined, ButtonSizes.small, ButtonSizes.medium, ButtonSizes.large, ButtonSizes.extraLarge];
const icons: Record<string, Partial<ButtonProps>> = {
  none: {},
  left: { icon: IconNames.add, iconPosition: 'left' },
  right: { icon: IconNames.add, iconPosition: 'right' },
  leftGrow: { icon: IconNames.add, iconPosition: 'left', iconLargeOnHover: true },
  rightGrow: { icon: IconNames.add, iconPosition: 'right', iconLargeOnHover: true },
  growLargeIcon: { icon: IconNames.add, iconLargeOnHover: true, iconSize: 'large' as ButtonProps['iconSize'] },
  circle: { icon: IconNames.add, iconHasCircle: true, iconColor: 'red', iconFillColor: 'blue' },
};
const states: Record<string, Partial<ButtonProps>> = {
  rest: {},
  loading: { isLoading: true },
  disabled: { disabled: true },
  rounded: { rounded: true },
  w100: { w100: true } as Partial<ButtonProps>,
  wrap: { textWrap: 'wrap', uppercase: true },
};

const matrix: { name: string; props: ButtonProps }[] = [];
for (const type of types)
  for (const size of sizes)
    for (const [iconName, icon] of Object.entries(icons))
      for (const [stateName, state] of Object.entries(states))
        for (const label of ['Label', undefined])
          matrix.push({
            name: `${type}/${size}/${iconName}/${stateName}/${label ?? 'icon-only'}`,
            props: {
              type,
              size,
              ...icon,
              ...state,
              children: label,
              ariaLabel: label ? undefined : 'Aria',
            } as ButtonProps,
          });
for (const extra of [
  { blurred: true },
  { onDark: true },
  { pressed: true },
  { inverted: true },
  { blurred: true, inverted: true, onDark: true, pressed: false },
])
  matrix.push({
    name: `muted ${JSON.stringify(extra)}`,
    props: {
      type: ButtonTypes.muted,
      children: 'Muted',
      icon: IconNames.add,
      iconLargeOnHover: true,
      ...extra,
    } as ButtonProps,
  });
for (const textColor of [ButtonTextColors.ado, ButtonTextColors.neutral])
  matrix.push({ name: `textColor ${textColor}`, props: { textColor, children: 'Txt' } as ButtonProps });
matrix.push(
  { name: 'inverted primary', props: { type: ButtonTypes.primary, inverted: true, children: 'Inv' } },
  {
    name: 'testId + className + htmlType',
    props: {
      testId: 'tid',
      className: 'mine',
      htmlType: 'submit',
      children: 'X',
      icon: IconNames.add,
      iconLargeOnHover: true,
    },
  },
  {
    name: 'deprecated iconLeft/iconRight',
    props: { iconLeft: IconNames.add, iconRight: IconNames.add, children: 'X' } as ButtonProps,
  },
);

describe('Button parity: MUI Grow path vs own', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it(`DOM over ${matrix.length} prop combinations`, () => {
    const diffs: string[] = [];
    for (const { name, props } of matrix) {
      const a = render(<div data-host="">{element('own', props)}</div>);
      const b = render(<div data-host="">{element('mui', props)}</div>);
      const own = JSON.stringify(describeTree(a.container.firstElementChild as Element));
      const mui = JSON.stringify(describeTree(b.container.firstElementChild as Element));
      if (own !== mui) diffs.push(`${name}\n own=${own}\n mui=${mui}`);
      a.unmount();
      b.unmount();
    }
    expect(diffs.slice(0, 3)).toEqual([]);
    expect(diffs.length).toBe(0);
  }, 60000);

  // Hover timelines on the Grow paths: enter, mid-transition, settled, leave, re-enter mid-exit; click + mousedown.
  const timeline = (impl: Impl, props: ButtonProps) => {
    const onClick = vi.fn();
    const onMouseDown = vi.fn();
    const view = render(<div data-host="">{element(impl, { ...props, onClick, onMouseDown })}</div>);
    const button = view.container.querySelector('button') as HTMLElement;
    const trace: unknown[] = [];
    const snap = (step: string) => trace.push({ step, dom: describeTree(view.container.firstElementChild as Element) });
    const advance = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms);
      });
    snap('rest');
    fireEvent.mouseEnter(button);
    fireEvent.mouseOver(button);
    snap('enter');
    advance(100);
    snap('enter+100');
    advance(400);
    snap('enter+500');
    fireEvent.mouseLeave(button);
    fireEvent.mouseOut(button);
    snap('leave');
    advance(80);
    snap('leave+80');
    fireEvent.mouseEnter(button);
    fireEvent.mouseOver(button);
    snap('re-enter mid-exit');
    advance(600);
    snap('settled');
    fireEvent.mouseDown(button);
    fireEvent.click(button);
    snap('click');
    trace.push({ clicks: onClick.mock.calls.length, downs: onMouseDown.mock.calls.length });
    view.unmount();
    return trace;
  };
  for (const [name, props] of Object.entries({
    'left grow': { children: 'L', icon: IconNames.add, iconPosition: 'left', iconLargeOnHover: true },
    'right grow': { children: 'R', icon: IconNames.add, iconPosition: 'right', iconLargeOnHover: true },
    'icon-only grow small': { ariaLabel: 'a', icon: IconNames.add, iconLargeOnHover: true, size: ButtonSizes.small },
    'muted grow': { type: ButtonTypes.muted, children: 'M', icon: IconNames.add, iconLargeOnHover: true },
    'no grow (plain icon)': { children: 'P', icon: IconNames.add },
  } as Record<string, ButtonProps>))
    it(`hover timeline: ${name}`, () => {
      expect(timeline('own', props)).toEqual(timeline('mui', props));
    });
});
