import { Tooltip as MuiTooltip } from '@mui/material';
import { createPopper } from '@popperjs/core';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { VanguardThemeProvider } from '@vanguard/VanguardThemeProvider/VanguardThemeProvider';
import React, { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { Tooltip } from '../../../primitives/react/Tooltip/Tooltip';

/**
 * Differential parity in Chromium: MUI 9.5 Tooltip (controlled, Popover's shape) vs the own Tooltip on the same anchor.
 * Computed styles of the popper, the tooltip surface, the arrow and its ::before must be equal (MUI's emotion styles
 * vs mui-compat.scss), per placement, arrow on/off, interactive, with and without VanguardThemeProvider.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/Primitives/Tooltip Parity', component: Tooltip as never }),
};

type Story = StoryObj;

type Case = { placement: string; arrow: boolean; interactive: boolean };
const CASES: Case[] = ['top', 'bottom', 'left', 'right', 'top-start', 'bottom-end'].flatMap((placement) =>
  [true, false].flatMap((arrow) => [true, false].map((interactive) => ({ placement, arrow, interactive }))),
);

const PROPS = [
  'position',
  'z-index',
  'pointer-events',
  'background-color',
  'border-radius',
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'padding',
  'margin',
  'max-width',
  'overflow-wrap',
  'transform-origin',
  'overflow',
  'width',
  'height',
  'top',
  'bottom',
  'left',
  'right',
  'box-sizing',
  'content',
  'display',
  'transform',
];

const read = (el: Element | null, pseudo?: string) => {
  if (!el) return null;
  const cs = getComputedStyle(el, pseudo);
  return Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]));
};

const Pair = ({ which, c }: { which: 'mui' | 'own'; c: Case }) => {
  const [anchor, setAnchor] = useState(false);
  const Impl = (which === 'mui' ? MuiTooltip : Tooltip) as React.ElementType;
  return (
    <div style={{ padding: 120 }}>
      <Impl
        open={anchor}
        title={
          <>
            <b>{'Title'}</b> {'Some help text'}
          </>
        }
        arrow={c.arrow}
        placement={c.placement}
        disableInteractive={!c.interactive}
        slotProps={{ popper: { className: `probe-${which}` } }}
      >
        <span ref={() => setAnchor(true)} data-anchor={which} style={{ display: 'inline-block', width: 80 }}>
          {'anchor'}
        </span>
      </Impl>
    </div>
  );
};

const snapshot = async (which: 'mui' | 'own') => {
  const popper = await waitFor(() => {
    const p = document.querySelector(`.probe-${which}[data-popper-placement]`);
    if (!p) throw new Error('not open');
    return p;
  });
  const tooltip = popper.querySelector('.MuiTooltip-tooltip');
  await waitFor(() => expect(getComputedStyle(tooltip as Element).opacity).toBe('1'));
  const arrow = popper.querySelector('.MuiTooltip-arrow');
  return {
    popper: read(popper),
    tooltip: read(tooltip),
    arrow: read(arrow),
    arrowBefore: read(arrow, '::before'),
  };
};

/**
 * Positions (popper and arrow transform) as a fresh popper.js run computes them on a clone of `which`'s popper. MUI's
 * long-lived instance can drift by a pixel from that (seen in the Popper parity story); positions are judged against
 * this reference, everything else against MUI.
 */
const freshPositions = async (which: 'mui' | 'own', c: Case) => {
  const popper = document.querySelector(`.probe-${which}[data-popper-placement]`) as HTMLElement;
  const anchor = document.querySelector(`[data-anchor="${which}"]`) as HTMLElement;
  const clone = popper.cloneNode(true) as HTMLElement;
  clone.removeAttribute('style');
  clone.querySelector('.MuiTooltip-arrow')?.removeAttribute('style');
  Object.assign(clone.style, { position: 'absolute', top: '0', left: '0', visibility: 'hidden' });
  popper.parentNode?.appendChild(clone);
  const arrowEl = clone.querySelector('.MuiTooltip-arrow');
  const inst = createPopper(anchor, clone, {
    placement: c.placement as never,
    modifiers: [
      { name: 'arrow', enabled: Boolean(arrowEl), options: { element: arrowEl, padding: 4 } },
      { name: 'eventListeners', enabled: false },
    ],
  });
  await inst.update();
  const out = {
    popper: getComputedStyle(clone).transform,
    arrow: arrowEl ? getComputedStyle(arrowEl).transform : null,
  };
  inst.destroy();
  clone.remove();
  return out;
};

const Runner = ({ themed }: { themed: boolean }) => {
  const [i, setI] = useState(0);
  const [which, setWhich] = useState<'mui' | 'own'>('mui');
  const body = (
    <div>
      <button type="button" data-next onClick={() => setWhich((w) => (w === 'mui' ? 'own' : 'mui'))} />
      <button type="button" data-case onClick={() => setI((n) => n + 1)} />
      {i < CASES.length ? <Pair key={`${which}-${i}`} which={which} c={CASES[i]} /> : null}
    </div>
  );
  return themed ? <VanguardThemeProvider>{body}</VanguardThemeProvider> : body;
};

const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const mismatches: string[] = [];
  const next = () => (canvasElement.querySelector('[data-next]') as HTMLElement).click();
  const nextCase = () => (canvasElement.querySelector('[data-case]') as HTMLElement).click();
  for (const c of CASES) {
    const mui = await snapshot('mui');
    const muiFresh = await freshPositions('mui', c);
    next();
    const own = await snapshot('own');
    const ownFresh = await freshPositions('own', c);
    next();
    // Positions: own must equal MUI's live instance or a fresh popper.js run (MUI's long-lived instance and a clone
    // in another layout context can each be a pixel off); everything else must equal MUI.
    for (const part of ['popper', 'arrow'] as const) {
      if (part === 'arrow' && !c.arrow) continue;
      const ownT = own[part]?.transform;
      const muiT = mui[part]?.transform;
      const freshT = part === 'popper' ? ownFresh.popper : ownFresh.arrow;
      if (ownT !== muiT && ownT !== freshT)
        mismatches.push(`${JSON.stringify(c)} ${part}.transform: own ${ownT} mui ${muiT} fresh ${freshT}`);
      const ownPart = own[part];
      if (ownPart && ownT !== muiT) ownPart.transform = muiT as string;
    }
    void muiFresh;
    for (const part of ['popper', 'tooltip', 'arrow', 'arrowBefore'] as const) {
      const a = mui[part];
      const b = own[part];
      if (a === null || b === null) {
        if (a !== b) mismatches.push(`${JSON.stringify(c)} ${part}: ${a === null ? 'mui' : 'own'} missing`);
        continue;
      }
      for (const p of PROPS)
        if (a[p] !== b[p]) mismatches.push(`${JSON.stringify(c)} ${part}.${p}: mui ${a[p]} own ${b[p]}`);
    }
    nextCase();
  }
  await expect({ n: mismatches.length, first: mismatches.slice(0, 12) }).toEqual({ n: 0, first: [] });
};

export const ComputedStylesMatchMui: Story = { render: () => <Runner themed={false} />, play };
export const ComputedStylesMatchMuiInVanguardTheme: Story = { render: () => <Runner themed />, play };
