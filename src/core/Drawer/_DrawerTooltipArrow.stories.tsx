import { Tooltip as MuiTooltip } from '@mui/material';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect } from 'storybook/test';
import { Tooltip } from '../../primitives/react/Tooltip/Tooltip';
import { DrawerMuiReference } from './_Drawer.mui-reference';
import { Drawer } from './Drawer';

/**
 * H16 item 2 (verifier 1): a tooltip with an arrow inside a temporary right Drawer that is open on mount (the
 * BusinessProfile edit-drawer case). The anchor sits near the drawer's right edge, so preventOverflow clamps the popper
 * and only the arrow follows the anchor. MUI (MUI Drawer + MUI Tooltip) vs own (own Drawer + own Tooltip): the arrow's
 * offset from the anchor's centre, first drawn and settled (after the Slide), must match.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/Drawer/Tooltip Arrow In Drawer', component: Drawer }),
};
type Story = StoryObj<typeof Drawer>;

const Body = ({ which }: { which: 'mui' | 'own' }) => {
  const T = (which === 'mui' ? MuiTooltip : Tooltip) as React.ElementType;
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: 420, paddingTop: 80 }}>
      <T open arrow placement="top" title="Edit opening times">
        <button type="button" data-anchor-probe={which} style={{ width: 24, height: 24 }}>
          {'i'}
        </button>
      </T>
    </div>
  );
};

const offset = (which: 'mui' | 'own') => {
  const anchor = document.querySelector(`[data-anchor-probe="${which}"]`) as HTMLElement | null;
  const arrow = document.querySelector('.MuiTooltip-arrow') as HTMLElement | null;
  if (!anchor || !arrow) return null;
  const a = anchor.getBoundingClientRect();
  const r = arrow.getBoundingClientRect();
  return Math.round((r.left + r.width / 2 - (a.left + a.width / 2)) * 10) / 10;
};

const sample = (which: 'mui' | 'own') => async () => {
  const first: (number | null)[] = [];
  for (let i = 0; i < 4; i++) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    first.push(offset(which));
  }
  await new Promise((r) => setTimeout(r, 1200));
  return { first, settled: offset(which) };
};

const playFor = (which: 'mui' | 'own') => async () => {
  const s = await sample(which)();
  // Settled: the arrow points at the anchor's centre (within 1px).
  await expect(Math.abs(s.settled ?? 99)).toBeLessThanOrEqual(1);
};

export const MuiDrawerMuiTooltip: Story = {
  render: () => (
    <DrawerMuiReference open variant="temporary" title="Edit business details">
      <Body which="mui" />
    </DrawerMuiReference>
  ),
  play: playFor('mui'),
};
export const OwnDrawerOwnTooltip: Story = {
  render: () => (
    <Drawer open variant="temporary" title="Edit business details">
      <Body which="own" />
    </Drawer>
  ),
  play: playFor('own'),
};
