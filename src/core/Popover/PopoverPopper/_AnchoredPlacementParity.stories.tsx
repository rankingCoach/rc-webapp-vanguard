import { createPopper, Modifier, Placement as PopperPlacement, VirtualElement } from '@popperjs/core';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect } from 'storybook/test';
import {
  AnchoredPlacementInput,
  anchoredPlacement,
  PLACEMENTS,
  Placement,
} from '../../../primitives/core/anchored-placement';
import { PopoverPopper } from './PopoverPopper';

/**
 * Differential parity (plan §27): the pure-core anchoredPlacement against the real popper.js 2.11 (the engine MUI
 * Popper/Tooltip run) on the same reference rect, floating size and viewport, across a scenario grid. Only the
 * popper-offsets data is compared (before computeStyles' DPR rounding), so equality is exact.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/Popover/Anchored Placement Parity', component: PopoverPopper }),
};

type Story = StoryObj<typeof PopoverPopper>;

type Scenario = Omit<AnchoredPlacementInput, 'boundary'> & { name: string };

const viewport = () => ({
  x: 0,
  y: 0,
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
});

const popperRun = async (s: Scenario) => {
  const floating = document.createElement('div');
  Object.assign(floating.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: `${s.floating.width}px`,
    height: `${s.floating.height}px`,
    margin: '0',
    padding: '0',
    border: '0',
    boxSizing: 'border-box',
  });
  document.body.appendChild(floating);
  let arrowEl: HTMLElement | null = null;
  if (s.arrow) {
    arrowEl = document.createElement('div');
    Object.assign(arrowEl.style, { position: 'absolute', width: `${s.arrow.width}px`, height: `${s.arrow.height}px` });
    floating.appendChild(arrowEl);
  }
  const r = s.reference;
  const reference: VirtualElement = {
    getBoundingClientRect: () =>
      ({
        x: r.x,
        y: r.y,
        top: r.y,
        left: r.x,
        width: r.width,
        height: r.height,
        right: r.x + r.width,
        bottom: r.y + r.height,
        toJSON: () => ({}),
      }) as DOMRect,
  };
  const modifiers: Partial<Modifier<string, object>>[] = [
    { name: 'computeStyles', options: { gpuAcceleration: false, adaptive: false, roundOffsets: false } },
    { name: 'offset', options: { offset: s.offset ?? [0, 0] } },
    s.flip === false ? { name: 'flip', enabled: false } : { name: 'flip', options: { ...(s.flip || {}) } },
    s.preventOverflow === false
      ? { name: 'preventOverflow', enabled: false }
      : { name: 'preventOverflow', options: { ...(s.preventOverflow || {}) } },
    s.arrow
      ? { name: 'arrow', options: { element: arrowEl, padding: s.arrow.padding ?? 0 } }
      : { name: 'arrow', enabled: false },
    { name: 'eventListeners', enabled: false },
  ];
  const instance = createPopper(reference, floating, {
    placement: (s.placement ?? 'bottom') as PopperPlacement,
    strategy: 'fixed',
    modifiers,
  });
  await instance.update();
  const offsets = instance.state.modifiersData.popperOffsets as { x: number; y: number };
  const arrowData = instance.state.modifiersData.arrow as { x?: number; y?: number; centerOffset: number } | undefined;
  const result = {
    x: offsets.x,
    y: offsets.y,
    placement: instance.state.placement,
    ...(s.arrow ? { arrow: arrowData } : {}),
  };
  instance.destroy();
  floating.remove();
  return result;
};

const scenarios = (): Scenario[] => {
  const { width: W, height: H } = viewport();
  const refs = {
    center: { x: W / 2 - 40, y: H / 2 - 15, width: 80, height: 30 },
    topLeft: { x: 4, y: 4, width: 60, height: 24 },
    bottomRight: { x: W - 70, y: H - 30, width: 60, height: 24 },
    rightEdge: { x: W - 30, y: H / 2, width: 24, height: 24 },
    bottomEdge: { x: W / 2, y: H - 20, width: 120, height: 16 },
    wideTop: { x: 10, y: 2, width: W - 20, height: 20 },
  };
  const sizes = {
    small: { width: 120, height: 60 },
    wide: { width: W * 0.8, height: 40 },
    tall: { width: 80, height: H * 0.7 },
  };
  const variants: Partial<Scenario>[] = [
    {},
    { offset: [0, 8] },
    { offset: [6, 14] },
    { preventOverflow: { altAxis: true } },
    { preventOverflow: { padding: 8, tether: false } },
    { flip: { flipVariations: false } },
    { flip: false },
    { preventOverflow: false },
    { arrow: { width: 10, height: 10, padding: 4 } },
    { arrow: { width: 14, height: 7 }, offset: [0, 14] },
  ];
  const list: Scenario[] = [];
  for (const [rn, reference] of Object.entries(refs))
    for (const [sn, floating] of Object.entries(sizes))
      for (const placement of [...PLACEMENTS, 'auto', 'auto-start'] as Placement[])
        for (const [vi, v] of variants.entries())
          list.push({ name: `${rn}/${sn}/${placement}/v${vi}`, reference, floating, placement, ...v });
  return list;
};

export const MatchesPopperJs: Story = {
  render: () => <div>{'anchoredPlacement vs popper.js (see play)'}</div>,
  play: async () => {
    const boundary = viewport();
    const mismatches: string[] = [];
    const all = scenarios();
    for (const s of all) {
      const expected = await popperRun(s);
      const actual = anchoredPlacement({ ...s, boundary });
      const near = (a?: number, b?: number) =>
        (a === undefined && b === undefined) || Math.abs((a ?? NaN) - (b ?? NaN)) < 1e-6;
      const arrowSame =
        !s.arrow ||
        (near(actual.arrow?.x, expected.arrow?.x) &&
          near(actual.arrow?.y, expected.arrow?.y) &&
          near(actual.arrow?.centerOffset, expected.arrow?.centerOffset));
      const same =
        actual.placement === expected.placement &&
        near(actual.x, expected.x) &&
        near(actual.y, expected.y) &&
        arrowSame;
      if (!same) mismatches.push(`${s.name}: popper ${JSON.stringify(expected)} core ${JSON.stringify(actual)}`);
    }
    await expect({ scenarios: all.length, mismatches: mismatches.slice(0, 12), count: mismatches.length }).toEqual({
      scenarios: all.length,
      mismatches: [],
      count: 0,
    });
  },
};

/**
 * DOM scenarios (watchdog MAJOR 1): real anchor and floating elements, clipping parents and containing blocks.
 * popper.js and computeAnchored (dom-geometry + core) must agree on the offset-parent position and placement.
 */
type Container = 'none' | 'scroll' | 'hidden' | 'transform' | 'scroll-in-transform';

const buildDom = (container: Container, portal: boolean, anchorPos: { x: number; y: number }) => {
  const host = document.createElement('div');
  Object.assign(host.style, { position: 'fixed', inset: '0', overflow: 'visible' });
  document.body.appendChild(host);
  let parent: HTMLElement = host;
  const box = (styles: Partial<CSSStyleDeclaration>) => {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'absolute',
      left: '200px',
      top: '150px',
      width: '420px',
      height: '300px',
      ...styles,
    });
    parent.appendChild(el);
    parent = el;
    return el;
  };
  let scroller: HTMLElement | undefined;
  if (container === 'scroll') scroller = box({ overflow: 'auto' });
  if (container === 'hidden') box({ overflow: 'hidden' });
  if (container === 'transform') box({ transform: 'translate(13px, 7px)' });
  if (container === 'scroll-in-transform') {
    box({ transform: 'translate(13px, 7px)' });
    scroller = box({ overflow: 'auto', left: '10px', top: '10px', width: '380px', height: '260px' });
  }
  const content = document.createElement('div');
  Object.assign(content.style, { position: 'relative', width: '1200px', height: '900px' });
  parent.appendChild(content);
  const anchor = document.createElement('button');
  Object.assign(anchor.style, {
    position: 'absolute',
    left: `${anchorPos.x}px`,
    top: `${anchorPos.y}px`,
    width: '90px',
    height: '28px',
    padding: '0',
    border: '0',
    margin: '0',
  });
  content.appendChild(anchor);
  if (scroller) {
    scroller.scrollLeft = 140;
    scroller.scrollTop = 90;
  }
  const floating = document.createElement('div');
  Object.assign(floating.style, {
    position: 'absolute',
    inset: '0 auto auto 0',
    margin: '0',
    width: '160px',
    height: '110px',
    boxSizing: 'border-box',
    border: '2px solid',
  });
  (portal ? document.body : content).appendChild(floating);
  return {
    anchor,
    floating,
    cleanup: () => {
      host.remove();
      floating.remove();
    },
  };
};

export const MatchesPopperJsInTheDom: Story = {
  render: () => <div>{'computeAnchored vs popper.js with clipping parents (see play)'}</div>,
  play: async () => {
    const { computeAnchored } = await import('../../../primitives/react/Popper/compute-anchored');
    const { resolvePopperOptions } = await import('../../../primitives/react/Popper/popper-options');
    const mismatches: string[] = [];
    let count = 0;
    const hideSeen = { referenceHidden: 0, escaped: 0 };
    const containers: Container[] = ['none', 'scroll', 'hidden', 'transform', 'scroll-in-transform'];
    const anchors = [
      { x: 260, y: 200 },
      { x: 150, y: 95 },
      { x: 470, y: 330 },
      { x: 140, y: 380 },
      { x: 640, y: 20 },
    ];
    for (const container of containers)
      for (const portal of [true, false])
        for (const strategy of ['absolute', 'fixed'] as const)
          for (const anchorPos of anchors)
            for (const placement of ['bottom', 'bottom-start', 'top-end', 'right', 'left-start', 'auto'] as Placement[])
              for (const mods of [
                [],
                [{ name: 'offset', options: { offset: [0, 8] } }],
                [{ name: 'preventOverflow', options: { altAxis: true, padding: 8 } }],
              ]) {
                count++;
                const dom = buildDom(container, portal, anchorPos);
                const resolved = resolvePopperOptions({
                  placement,
                  modifiers: mods,
                  popperOptions: { strategy },
                  disablePortal: !portal,
                });
                const instance = createPopper(dom.anchor, dom.floating, {
                  placement: placement as PopperPlacement,
                  strategy,
                  modifiers: [
                    { name: 'preventOverflow', options: { altBoundary: !portal } },
                    { name: 'flip', options: { altBoundary: !portal } },
                    { name: 'eventListeners', enabled: false },
                    ...mods,
                  ],
                });
                await instance.update();
                const expected = instance.state.modifiersData.popperOffsets as { x: number; y: number };
                const expectedPlacement = instance.state.placement;
                const expectedHide = instance.state.modifiersData.hide as {
                  isReferenceHidden: boolean;
                  hasPopperEscaped: boolean;
                };
                if (expectedHide.isReferenceHidden) hideSeen.referenceHidden++;
                if (expectedHide.hasPopperEscaped) hideSeen.escaped++;
                instance.destroy();
                dom.floating.removeAttribute('style');
                Object.assign(dom.floating.style, {
                  position: strategy,
                  inset: '0 auto auto 0',
                  margin: '0',
                  width: '160px',
                  height: '110px',
                  boxSizing: 'border-box',
                  border: '2px solid',
                });
                const actual = computeAnchored(dom.anchor, dom.floating, { ...resolved, altBoundary: !portal });
                const ok =
                  actual.hide?.isReferenceHidden === expectedHide.isReferenceHidden &&
                  actual.hide?.hasPopperEscaped === expectedHide.hasPopperEscaped &&
                  actual.placement === expectedPlacement &&
                  Math.abs(actual.offsetX - expected.x) < 1e-6 &&
                  Math.abs(actual.offsetY - expected.y) < 1e-6;
                if (!ok)
                  mismatches.push(
                    `${container}/${portal ? 'portal' : 'inline'}/${strategy}/${anchorPos.x},${anchorPos.y}/${placement}/${mods[0]?.name ?? '-'}: popper ${JSON.stringify({ ...expected, p: expectedPlacement })} own ${JSON.stringify({ x: actual.offsetX, y: actual.offsetY, p: actual.placement })} hide ${JSON.stringify(expectedHide)} vs ${JSON.stringify(actual.hide)}`,
                  );
                dom.cleanup();
              }
    await expect({ count, mismatches: mismatches.slice(0, 10), n: mismatches.length }).toEqual({
      count,
      mismatches: [],
      n: 0,
    });
    // The grid exercises both hide flags (popper.js's own verdicts), not only the all-visible case.
    await expect(hideSeen.referenceHidden > 0 && hideSeen.escaped > 0).toBe(true);
  },
};
