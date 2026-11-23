import { createPopper } from '@popperjs/core';
import { describe, expect, it } from 'vitest';
import type { Placement } from '../../core/anchored-placement';
import { computeAnchored } from './compute-anchored';
import { type PopperModifierLike, resolvePopperOptions } from './popper-options';

const rect = (x: number, y: number, width: number, height: number) => new DOMRect(x, y, width, height);

const layout = ({ portal, clips }: { portal: boolean; clips: boolean }) => {
  const scroller = document.createElement('div');
  const anchor = document.createElement('button');
  const floating = document.createElement('div');
  const viewport = document.documentElement;
  const dimensions = ['clientWidth', 'clientHeight'] as const;
  const previous = dimensions.map((key) => Object.getOwnPropertyDescriptor(viewport, key));
  const resize = (width: number, height: number) => {
    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: width },
      clientHeight: { configurable: true, value: height },
    });
  };

  // jsdom has no layout. Supply DOM geometry in client coordinates and offset-parent coordinates, with
  // the same positioning and clipping ancestors on both sides. Scrolling changes the anchor's client rect.
  resize(660, 460);
  scroller.style.cssText = `position: relative; overflow: ${clips ? 'auto' : 'visible'}; transform: none; perspective: none`;
  anchor.style.position = 'relative';
  floating.style.position = 'absolute';
  scroller.getBoundingClientRect = () => rect(100, 64, 276, 242);
  anchor.getBoundingClientRect = () => rect(322 - scroller.scrollLeft, 250 - scroller.scrollTop, 62, 48);
  floating.getBoundingClientRect = () => rect(0, 0, 252.5625, 48);
  Object.defineProperties(scroller, {
    clientWidth: { value: 276 },
    clientHeight: { value: 242 },
    offsetWidth: { value: 276 },
    offsetHeight: { value: 242 },
  });
  Object.defineProperties(floating, {
    offsetParent: { value: portal ? document.body : scroller },
    offsetWidth: { value: 253 },
    offsetHeight: { value: 48 },
  });
  document.body.appendChild(scroller);
  scroller.appendChild(anchor);
  (portal ? document.body : scroller).appendChild(floating);

  return {
    anchor,
    floating,
    scroller,
    resize,
    cleanup: () => {
      floating.remove();
      scroller.remove();
      dimensions.forEach((key, i) => {
        const descriptor = previous[i];
        if (descriptor) Object.defineProperty(viewport, key, descriptor);
        else Reflect.deleteProperty(viewport, key);
      });
    },
  };
};

type Branches = { flip: boolean; overflow: boolean };

// EngagementPlannerCalendar.tsx:298 sets centerPopover and renderInPortal, and leaves placement at `top`.
// PopoverModal supplies flip altBoundary/padding and an offset measured from the anchor and card heights.
// MUI BasePopper seeds both modifiers with altBoundary = disablePortal, so the portaled overflow inherits false.
// Popper.js defaults the boundary to clippingParents, the root boundary to viewport, and strategy to absolute.
const centeredModifiers = ({ flip, overflow }: Branches, distance: number) => [
  { name: 'flip', options: { boundary: 'clippingParents', rootBoundary: 'viewport', altBoundary: flip, padding: 8 } },
  {
    name: 'preventOverflow',
    options: {
      boundary: 'clippingParents',
      rootBoundary: 'viewport',
      altBoundary: overflow,
      altAxis: true,
      tether: true,
    },
  },
  { name: 'offset', options: { offset: [0, distance] } },
  { name: 'computeStyles', options: { gpuAcceleration: false } },
] satisfies PopperModifierLike[];

const trial = ({
  placement,
  portal,
  clips,
  branches,
}: {
  placement: Placement;
  portal: boolean;
  clips: boolean;
  branches: Branches;
}) => {
  const { anchor, floating, scroller, resize, cleanup } = layout({ portal, clips });
  const distance = -(anchor.getBoundingClientRect().height + floating.getBoundingClientRect().height) / 2;
  const modifiers = centeredModifiers(branches, distance);
  const strategy = 'absolute';
  const instance = createPopper(anchor, floating, {
    placement,
    strategy,
    modifiers: [...modifiers, { name: 'eventListeners', enabled: false }, { name: 'applyStyles', enabled: false }],
  });
  const options = resolvePopperOptions({ placement, modifiers, disablePortal: !portal, popperOptions: { strategy } });
  try {
    const result = [];
    for (const frame of [
      { scrollLeft: 0, scrollTop: 0, width: 660, height: 460 },
      { scrollLeft: 43, scrollTop: 29, width: 660, height: 460 },
      { scrollLeft: 43, scrollTop: 29, width: 410, height: 280 },
    ]) {
      Object.assign(scroller, { scrollLeft: frame.scrollLeft, scrollTop: frame.scrollTop });
      resize(frame.width, frame.height);
      instance.forceUpdate();
      const actual = computeAnchored(anchor, floating, options);
      const reference = instance.state.modifiersData;
      result.push({
        actual: { x: actual.offsetX, y: actual.offsetY, placement: actual.placement, ...actual.hide },
        expected: {
          ...reference.popperOffsets,
          placement: instance.state.placement,
          isReferenceHidden: reference.hide.isReferenceHidden,
          hasPopperEscaped: reference.hide.hasPopperEscaped,
        },
      });
    }
    return { supported: options.supported, result };
  } finally {
    instance.destroy();
    cleanup();
  }
};

describe('own Popper independent flip and overflow clipping', () => {
  it('matches the planner create-event card with an anchor boundary for flip and a floating boundary for overflow', () => {
    const { result, supported } = trial({
      placement: 'top',
      portal: true,
      clips: true,
      branches: { flip: true, overflow: false },
    });
    // The independent clipping choices must match before and after scroll and viewport resize.
    expect(result.map(({ actual }) => actual)).toEqual(result.map(({ expected }) => expected));
    expect(supported).toBe(true);
  });

  it.each(['top', 'bottom-start', 'left', 'right-end', 'auto'] as const)(
    'matches placement %s in each boundary and portal combination',
    (placement) => {
      const failures = [];
      for (const portal of [false, true]) {
        for (const clips of [false, true]) {
          for (const flip of [false, true]) {
            for (const overflow of [false, true]) {
              const { result, supported } = trial({ placement, portal, clips, branches: { flip, overflow } });
              for (const { actual, expected } of result) {
                if (!supported || Object.keys(expected).some((key) => actual[key] !== expected[key])) {
                  failures.push({ portal, clips, flip, overflow, supported, expected, actual });
                }
              }
            }
          }
        }
      }
      expect(failures).toEqual([]);
    },
  );
});
