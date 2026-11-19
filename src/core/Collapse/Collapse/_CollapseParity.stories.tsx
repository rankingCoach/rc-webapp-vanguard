import { Collapse as MuiCollapse } from '@mui/material';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { OwnCollapse } from './own-collapse';

/**
 * Track g differential in Chromium: live MUI 9.5 Collapse (as Vanguard calls it) vs the own Collapse, side by side,
 * same content. Settled states: computed styles of root / wrapper / wrapperInner and the root's rendered box.
 */
const PROPS = ['height', 'width', 'min-height', 'min-width', 'overflow', 'visibility', 'display', 'transition', 'position'];

const Pair = ({ open, orientation }: { open: boolean; orientation: 'vertical' | 'horizontal' }) => (
  <div style={{ display: 'flex', gap: 24 }}>
    {(['mui', 'own'] as const).map((impl) => {
      const Impl = impl === 'mui' ? MuiCollapse : OwnCollapse;
      return (
        <div key={impl} data-impl={impl} style={{ width: 300 }}>
          <Impl in={open} orientation={orientation} className={'consumer'}>
            <div style={{ width: 120, height: 80, background: 'tomato' }}>content</div>
          </Impl>
        </div>
      );
    })}
  </div>
);

const measure = (root: HTMLElement, impl: string) => {
  const r = root.querySelector(`[data-impl="${impl}"] .MuiCollapse-root`) as HTMLElement;
  const parts = [r, r.firstElementChild as HTMLElement, r.firstElementChild?.firstElementChild as HTMLElement];
  return {
    styles: parts.map((el) => {
      const cs = getComputedStyle(el);
      return Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]));
    }),
    box: (({ width, height }) => ({ width, height }))(r.getBoundingClientRect()),
  };
};

const Harness = () => {
  const [state, setState] = useState<{ open: boolean; orientation: 'vertical' | 'horizontal' }>({ open: false, orientation: 'vertical' });
  return (
    <div>
      <button type="button" data-testid="next" onClick={() => setState((s) => ({ ...s, open: !s.open }))}>
        toggle
      </button>
      <button type="button" data-testid="orient" onClick={() => setState((s) => ({ ...s, orientation: s.orientation === 'vertical' ? 'horizontal' : 'vertical' }))}>
        orientation
      </button>
      <Pair {...state} />
    </div>
  );
};

const settle = () => new Promise((r) => setTimeout(r, 450));

export const Differential: StoryObj = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const click = (id: string) => (canvasElement.querySelector(`[data-testid="${id}"]`) as HTMLElement).click();
    const check = async (label: string) => {
      await settle();
      await waitFor(() => expect({ label, ...measure(canvasElement, 'own') }).toEqual({ label, ...measure(canvasElement, 'mui') }));
    };
    await check('vertical closed');
    click('next');
    await check('vertical open');
    click('next');
    await check('vertical closed again');
    click('orient');
    await check('horizontal closed');
    click('next');
    await check('horizontal open');
    click('next');
    await check('horizontal closed again');
  },
};

export default { ...SbDecorator({ title: 'Vanguard/Collapse/ParityDifferential', component: OwnCollapse }) };
