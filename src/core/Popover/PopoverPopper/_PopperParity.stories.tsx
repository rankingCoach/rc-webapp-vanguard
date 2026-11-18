import { Popper as MuiPopper } from '@mui/material';
import { createPopper } from '@popperjs/core';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React, { useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import type { Placement } from '../../../primitives/core/anchored-placement';
import { OwnPopper } from '../../../primitives/react/Popper/Popper';
import { PopoverPopper } from './PopoverPopper';

/**
 * Differential parity: MUI 9.5 Popper vs the own Popper with the same props, in Chromium. The floating elements'
 * final inline style (position/inset/transform) and `data-popper-placement`, and the arrow's inline style, must be
 * identical. Covers the prop shapes Vanguard passes (plan §28.3): body portal, `strategy: fixed` with computeStyles
 * adaptive:false (Popover fixedPosition), disablePortal + flip/preventOverflow options (PopoverModal), arrow + offset
 * (DropdownMenu / Tooltip).
 */
export default {
  ...SbDecorator({ title: 'Vanguard/Popover/Popper Parity', component: PopoverPopper }),
};

type Story = StoryObj<typeof PopoverPopper>;

type Case = {
  name: string;
  placement: Placement;
  anchor: { left: number; top: number };
  props?: Record<string, unknown>;
  arrow?: boolean;
  disablePortal?: boolean;
};

const CASES: Case[] = [
  { name: 'portal-bottom', placement: 'bottom', anchor: { left: 300, top: 120 } },
  { name: 'portal-top-flip', placement: 'top', anchor: { left: 40, top: 6 } },
  { name: 'portal-right-end', placement: 'right-end', anchor: { left: 900, top: 300 } },
  { name: 'portal-auto', placement: 'auto', anchor: { left: 600, top: 500 } },
  {
    name: 'fixed-adaptive-off',
    placement: 'top',
    anchor: { left: 200, top: 260 },
    props: {
      popperOptions: { strategy: 'fixed', modifiers: [{ name: 'computeStyles', options: { adaptive: false } }] },
    },
  },
  {
    name: 'arrow-offset',
    placement: 'bottom-start',
    anchor: { left: 120, top: 200 },
    arrow: true,
    props: { modifiers: [{ name: 'offset', options: { offset: [0, 20] } }] },
  },
  {
    name: 'inline-center-modal',
    placement: 'bottom',
    anchor: { left: 500, top: 420 },
    disablePortal: true,
    props: {
      modifiers: [
        { name: 'flip', options: { altBoundary: true, rootBoundary: 'viewport', padding: 8 } },
        { name: 'preventOverflow', options: { altAxis: true, tether: true } },
        { name: 'offset', options: { offset: [0, 8] } },
      ],
    },
  },
];

const Pair = ({ c, which }: { c: Case; which: 'mui' | 'own' }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [arrow, setArrow] = useState<HTMLElement | null>(null);
  const Comp = (which === 'mui' ? MuiPopper : OwnPopper) as React.ElementType;
  const arrowMod = c.arrow ? [{ name: 'arrow', enabled: true, options: { element: arrow } }] : [];
  const props = c.props ?? {};
  const modifiers = [...arrowMod, ...((props.modifiers as unknown[]) ?? [])];
  return (
    <div data-pair={`${which}-${c.name}`} style={{ position: 'relative' }}>
      <button
        ref={setAnchor}
        type="button"
        style={{
          position: 'fixed',
          left: c.anchor.left,
          top: c.anchor.top + (which === 'own' ? 0 : 0),
          width: 80,
          height: 26,
        }}
      >
        {c.name}
      </button>
      {anchor ? (
        <Comp
          open
          anchorEl={anchor}
          placement={c.placement}
          disablePortal={c.disablePortal}
          {...props}
          modifiers={modifiers}
          data-testid={`${which}-${c.name}`}
        >
          <div style={{ width: 180, height: 90, background: '#eee', position: 'relative' }}>
            {c.arrow ? (
              <span ref={setArrow} data-arrow style={{ position: 'absolute', width: 12, height: 12 }} />
            ) : null}
            {'floating'}
          </div>
        </Comp>
      ) : null}
    </div>
  );
};

// Inline declarations as a sorted set: their order in the attribute has no effect on rendering.
const declarations = (style: string | null | undefined) =>
  (style ?? '')
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .sort();
const snapshot = (el: HTMLElement) => ({
  style: declarations(el.getAttribute('style')),
  placement: el.getAttribute('data-popper-placement'),
  arrow: declarations(el.querySelector<HTMLElement>('[data-arrow]')?.getAttribute('style')),
});

/**
 * The styles a fresh popper.js instance computes for this case right now (the algorithm reference), run on a clean
 * clone of the floating element in the same parent, so the live component cannot interfere.
 */
const freshTransform = async (which: 'mui' | 'own', k: Case) => {
  const el = document.querySelector<HTMLElement>(`[data-testid="${which}-${k.name}"]`) as HTMLElement;
  const anchor = document.querySelector<HTMLElement>(`[data-pair="${which}-${k.name}"] > button`) as HTMLElement;
  const clone = el.cloneNode(true) as HTMLElement;
  clone.removeAttribute('style');
  clone.removeAttribute('data-popper-placement');
  Object.assign(clone.style, { position: 'fixed', top: '0', left: '0', visibility: 'hidden' });
  el.parentNode?.appendChild(clone);
  const props = k.props ?? {};
  const options = (props.popperOptions as Record<string, unknown> | undefined) ?? {};
  const inst = createPopper(anchor, clone, {
    placement: k.placement as never,
    ...options,
    modifiers: [
      { name: 'preventOverflow', options: { altBoundary: Boolean(k.disablePortal) } },
      { name: 'flip', options: { altBoundary: Boolean(k.disablePortal) } },
      ...(k.arrow ? [{ name: 'arrow', enabled: true, options: { element: clone.querySelector('[data-arrow]') } }] : []),
      ...((props.modifiers as never[]) ?? []),
      ...((options.modifiers as never[]) ?? []),
      { name: 'eventListeners', enabled: false },
    ],
  });
  await inst.update();
  const transform = clone.style.transform;
  inst.destroy();
  clone.remove();
  return transform;
};

const Grid = ({ which }: { which: 'mui' | 'own' }) => (
  <>
    {CASES.map((c) => (
      <Pair key={c.name} c={c} which={which} />
    ))}
  </>
);

/** One implementation at a time, so both see the same viewport and anchors. */
const Runner = () => {
  const [which, setWhich] = useState<'mui' | 'own'>('mui');
  return (
    <div>
      <button type="button" data-switch onClick={() => setWhich((w) => (w === 'mui' ? 'own' : 'mui'))}>
        {which}
      </button>
      <Grid key={which} which={which} />
    </div>
  );
};

export const StylesMatchMuiPopper: Story = {
  render: () => <Runner />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const read = async (which: 'mui' | 'own') => {
      const out: Record<string, ReturnType<typeof snapshot>> = {};
      // Both implementations reposition on window resize (popper's eventListeners); fire one after layout settles so
      // a position computed before the last layout shift is not compared (MUI computes once on create).
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      window.dispatchEvent(new Event('resize'));
      for (const k of CASES) {
        const el = await waitFor(() => {
          const node = document.querySelector<HTMLElement>(`[data-testid="${which}-${k.name}"]`);
          if (!node?.getAttribute('data-popper-placement')) throw new Error('not placed yet');
          return node;
        });
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        out[k.name] = snapshot(el);
      }
      return out;
    };
    const mui = await read('mui');
    // Where MUI's long-lived popper instance disagrees with a fresh popper.js run on the same elements, the MUI
    // column is not a reproducible reference for the transform (measured: inline-center-modal, 433 vs 432).
    const muiDrift: string[] = [];
    for (const k of CASES) {
      const fresh = await freshTransform('mui', k);
      if (!mui[k.name].style.includes(`transform: ${fresh}`)) muiDrift.push(k.name);
    }
    c.getByRole('button', { name: 'mui' }).click();
    const own = await read('own');
    for (const k of CASES) {
      // 1. The own Popper equals the popper.js algorithm on its own elements.
      await expect({ case: k.name, transform: own[k.name].style.find((d) => d.startsWith('transform')) }).toEqual({
        case: k.name,
        transform: `transform: ${await freshTransform('own', k)}`,
      });
    }
    // 2. Everything else (and the transform where MUI is self-consistent) equals MUI.
    const strip = (o: typeof own) =>
      Object.fromEntries(
        Object.entries(o).map(([k, v]) => [
          k,
          muiDrift.includes(k) ? { ...v, style: v.style.filter((d) => !d.startsWith('transform')) } : v,
        ]),
      );
    await expect(strip(own)).toEqual(strip(mui));
    // MUI's instance drift is timing-dependent (seen only in this case, run alone); any other drifting case fails.
    await expect(muiDrift.filter((name) => name !== 'inline-center-modal')).toEqual([]);
  },
};

/** Grows from empty to a 16×16 box after `delay` ms through its own state (like Icon's lazy SVG import). */
const LateIcon = ({ delay }: { delay: number }) => {
  const [loaded, setLoaded] = useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setLoaded(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return loaded ? <span style={{ display: 'inline-block', width: 16, height: 16 }} /> : <span />;
};

const LateAnchor = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <div style={{ padding: 40 }}>
      <span ref={setAnchor} data-late-anchor style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <LateIcon delay={150} />
        {'trigger'}
      </span>
      {anchor ? (
        <OwnPopper
          open
          anchorEl={anchor}
          placement="bottom"
          modifiers={[{ name: 'offset', options: { offset: [0, 20] } }]}
          data-testid="late"
        >
          <div style={{ width: 120, height: 60, background: '#eee' }}>{'floating'}</div>
        </OwnPopper>
      ) : null}
    </div>
  );
};

/**
 * Verifier handoff 10 (DropdownMenu `default`, 4px): the anchor's content loads after the popper opened (lazy Icon) and
 * re-renders only itself. The own Popper must end where a fresh popper.js run puts it; MUI reached the settled spot.
 */
export const FollowsAnchorResizeAfterOpen: Story = {
  render: () => <LateAnchor />,
  play: async () => {
    const el = await waitFor(() => {
      const node = document.querySelector<HTMLElement>('[data-testid="late"]');
      if (!node?.getAttribute('data-popper-placement')) throw new Error('not placed yet');
      return node;
    });
    const anchor = document.querySelector<HTMLElement>('[data-late-anchor]') as HTMLElement;
    await waitFor(() => expect(anchor.querySelector('span[style*="width: 16px"]')).not.toBeNull());
    await new Promise((r) => setTimeout(r, 100));
    const clone = el.cloneNode(true) as HTMLElement;
    clone.removeAttribute('style');
    Object.assign(clone.style, { position: 'absolute', top: '0', left: '0', visibility: 'hidden' });
    el.parentNode?.appendChild(clone);
    const inst = createPopper(anchor, clone, {
      placement: 'bottom',
      modifiers: [
        { name: 'offset', options: { offset: [0, 20] } },
        { name: 'eventListeners', enabled: false },
      ],
    });
    await inst.update();
    const fresh = clone.style.transform;
    inst.destroy();
    clone.remove();
    await expect(el.style.transform).toBe(fresh);
  },
};
