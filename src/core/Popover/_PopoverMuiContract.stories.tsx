import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { OVERLAY_BASE_Z_INDEX } from '@vanguard/OverlayStacking/OverlayStackingService';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Popover, PopoverPosition, PopoverProps } from './Popover';

/**
 * MUI contract (real browser) for Popover over MUI v5 `Tooltip` + PopoverPopper.
 *
 * Pins popper placement relative to the anchor, arrow geometry and the computed styles of
 * PopoverPopper.scss on `.MuiTooltip-popper/-tooltip/-arrow` (these MUI classes are what the SCSS targets),
 * so a renamed/restructured Tooltip DOM in MUI v6/v7/v9 goes red here.
 * Tooltips portal to <body>, so queries go through `document.body`.
 * Production dependencies of the MUI classes used: PopoverPopper.scss:3/8/15 (`.MuiTooltip-popper/-tooltip/-arrow`),
 * Popover.tsx:136 + PopoverPopper.scss:91 (`MuiTooltip-popper-dark`), PopoverPopper.tsx:18 (`vanguard-popover`).
 */
export default {
  ...SbDecorator({
    title: 'Vanguard/Popover/MUI Contract',
    component: Popover,
  }),
};

type Story = StoryObj<typeof Popover>;

const body = () => within(document.body);

// Settle waits (Grow transition, popper positioning, unmount) get headroom for loaded full-suite runs.
const SETTLE = { timeout: 5000 };

/** Resolves a CSS colour (incl. custom properties) to the browser's computed rgb() string */
const resolveColor = (cssColor: string): string => {
  const probe = document.createElement('span');
  probe.style.backgroundColor = cssColor;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
};

const Stage = (props: Omit<PopoverProps, 'children'>) => (
  <div
    style={{ width: 600, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    data-testid={'stage'}
  >
    <Popover {...props}>
      <button data-testid={'anchor'} style={{ width: 120, height: 40 }}>
        {'anchor'}
      </button>
    </Popover>
  </div>
);

const openTooltip = async (canvasElement: HTMLElement) => {
  const anchor = within(canvasElement).getByTestId('anchor');
  // popper.js measures once on open; a late web-font swap would resize the surface after positioning
  await document.fonts.ready;
  await userEvent.hover(anchor);
  const popper = await body().findByRole('tooltip', {}, SETTLE);
  const surface = popper.querySelector('.MuiTooltip-tooltip') as HTMLElement;
  // wait for the Grow enter transition to settle so rects are final
  await waitFor(() => expect(getComputedStyle(surface).opacity).toBe('1'), SETTLE);
  await waitFor(() => expect(getComputedStyle(surface).transform).toBe('none'), SETTLE);
  await waitFor(() => expect(popper).toHaveAttribute('data-popper-placement'), SETTLE);
  return { anchor, popper, surface, arrow: surface.querySelector('.MuiTooltip-arrow') as HTMLElement | null };
};

const closeTooltip = async (anchor: HTMLElement) => {
  await userEvent.unhover(anchor);
  await waitFor(() => expect(body().queryByRole('tooltip')).toBeNull(), SETTLE);
};

const center = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

const placementCheck =
  (position: PopoverPosition) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const { anchor, popper, surface, arrow } = await openTooltip(canvasElement);
    const a = anchor.getBoundingClientRect();
    const s = surface.getBoundingClientRect();
    const ar = (arrow as HTMLElement).getBoundingClientRect();
    const arrowStyle = getComputedStyle(arrow as HTMLElement);
    const surfaceStyle = getComputedStyle(surface);

    await expect(popper).toHaveAttribute('data-popper-placement', position);

    // 18px gap between anchor and tooltip surface comes from the SCSS margin (!important beats MUI's 14px)
    if (position === 'top') {
      await expect(Math.round(a.top - s.bottom)).toBe(18);
      await expect(surfaceStyle.marginBottom).toBe('18px');
      await expect(arrowStyle.borderTopWidth).toBe('12px');
      await expect(arrowStyle.borderBottomWidth).toBe('0px');
      await expect(arrowStyle.marginBottom).toBe('-11px');
      // arrow hangs below the surface, pointing at the anchor
      await expect(ar.top).toBeGreaterThanOrEqual(s.bottom - 1);
      await expect(Math.abs(center(ar).x - center(a).x)).toBeLessThanOrEqual(2);
    }
    if (position === 'bottom') {
      await expect(Math.round(s.top - a.bottom)).toBe(18);
      await expect(surfaceStyle.marginTop).toBe('18px');
      await expect(arrowStyle.borderTopWidth).toBe('0px');
      await expect(arrowStyle.borderBottomWidth).toBe('12px');
      await expect(arrowStyle.marginTop).toBe('-11px');
      await expect(ar.bottom).toBeLessThanOrEqual(s.top + 1);
      await expect(Math.abs(center(ar).x - center(a).x)).toBeLessThanOrEqual(2);
    }
    if (position === 'left') {
      await expect(Math.round(a.left - s.right)).toBe(18);
      await expect(surfaceStyle.marginRight).toBe('18px');
      await expect(arrowStyle.borderLeftWidth).toBe('12px');
      await expect(arrowStyle.borderRightWidth).toBe('0px');
      await expect(arrowStyle.marginRight).toBe('-11px');
      await expect(ar.left).toBeGreaterThanOrEqual(s.right - 1);
      await expect(Math.abs(center(ar).y - center(a).y)).toBeLessThanOrEqual(2);
    }
    if (position === 'right') {
      await expect(Math.round(s.left - a.right)).toBe(18);
      await expect(surfaceStyle.marginLeft).toBe('18px');
      await expect(arrowStyle.borderLeftWidth).toBe('0px');
      await expect(arrowStyle.borderRightWidth).toBe('12px');
      await expect(arrowStyle.marginLeft).toBe('-11px');
      await expect(ar.right).toBeLessThanOrEqual(s.left + 1);
      await expect(Math.abs(center(ar).y - center(a).y)).toBeLessThanOrEqual(2);
    }

    // shared arrow geometry: width/height 0 + MUI's border-box -> the triangle is exactly the 12px borders
    // (24x12 on top/bottom, 12x24 on left/right); MUI's ::before triangle is hidden
    await expect(arrowStyle.boxSizing).toBe('border-box');
    const vertical = position === 'top' || position === 'bottom';
    await expect(Math.round(ar.width)).toBe(vertical ? 24 : 12);
    await expect(Math.round(ar.height)).toBe(vertical ? 12 : 24);
    await expect(arrowStyle.borderTopStyle).toBe('solid');
    await expect(getComputedStyle(arrow as HTMLElement, '::before').display).toBe('none');
    // surface is centred on the anchor along the cross axis
    if (position === 'top' || position === 'bottom') {
      await expect(Math.abs(center(s).x - center(a).x)).toBeLessThanOrEqual(1);
    } else {
      await expect(Math.abs(center(s).y - center(a).y)).toBeLessThanOrEqual(1);
    }

    await closeTooltip(anchor);
  };

export const PlacementTop: Story = {
  render: () => <Stage message={'Tooltip message'} position={'top'} />,
  play: placementCheck('top'),
};

export const PlacementBottom: Story = {
  render: () => <Stage message={'Tooltip message'} position={'bottom'} />,
  play: placementCheck('bottom'),
};

export const PlacementLeft: Story = {
  render: () => <Stage message={'Tooltip message'} position={'left'} />,
  play: placementCheck('left'),
};

export const PlacementRight: Story = {
  render: () => <Stage message={'Tooltip message'} position={'right'} />,
  play: placementCheck('right'),
};

export const DarkThemeSurfaceStyles: Story = {
  render: () => <Stage message={'Dark tooltip'} title={'Title'} />,
  play: async ({ canvasElement }) => {
    const { anchor, popper, surface, arrow } = await openTooltip(canvasElement);
    const s = getComputedStyle(surface);

    await expect(popper).toHaveClass('MuiTooltip-popper-dark');
    await expect(resolveColor('var(--fn-bg-dark)')).not.toBe('rgba(0, 0, 0, 0)');
    await expect(s.backgroundColor).toBe(resolveColor('var(--fn-bg-dark)'));
    await expect(s.color).toBe(resolveColor('var(--fn-fg-on-dark)'));
    await expect(getComputedStyle(within(surface).getByText('Dark tooltip')).color).toBe(
      resolveColor('var(--fn-fg-on-dark)'),
    );
    await expect(s.paddingTop).toBe('8px');
    await expect(s.paddingRight).toBe('16px');
    await expect(s.paddingBottom).toBe('8px');
    await expect(s.paddingLeft).toBe('16px');
    await expect(s.borderTopLeftRadius).toBe('4px');
    await expect(s.textAlign).toBe('center');
    await expect(s.boxShadow).toContain('8px');
    // arrow is painted with the dark surface colour (top placement -> top border coloured)
    await expect(getComputedStyle(arrow as HTMLElement).borderTopColor).toBe(resolveColor('var(--fn-bg-dark)'));

    await closeTooltip(anchor);
  },
};

export const DefaultThemeSurfaceStyles: Story = {
  render: () => <Stage message={'Light tooltip'} theme={'default'} position={'bottom'} />,
  play: async ({ canvasElement }) => {
    const { anchor, popper, surface, arrow } = await openTooltip(canvasElement);
    const s = getComputedStyle(surface);

    await expect(popper).not.toHaveClass('MuiTooltip-popper-dark');
    await expect(s.backgroundColor).toBe(resolveColor('var(--fn-bg-surface)'));
    await expect(s.paddingTop).toBe('8px');
    await expect(s.paddingLeft).toBe('16px');
    await expect(s.borderTopLeftRadius).toBe('4px');
    // bottom placement -> bottom border painted with surface colour, top border transparent
    await expect(getComputedStyle(arrow as HTMLElement).borderBottomColor).toBe(resolveColor('var(--fn-bg-surface)'));
    await expect(getComputedStyle(arrow as HTMLElement).borderTopColor).toBe('rgba(0, 0, 0, 0)');

    await closeTooltip(anchor);
  },
};

export const NoArrow: Story = {
  render: () => <Stage message={'No arrow'} arrow={false} />,
  play: async ({ canvasElement }) => {
    const { anchor, surface, arrow } = await openTooltip(canvasElement);
    const a = anchor.getBoundingClientRect();
    const s = surface.getBoundingClientRect();

    await expect(arrow).toBeNull();
    // SCSS margin still applies without arrow
    await expect(Math.round(a.top - s.bottom)).toBe(18);

    await closeTooltip(anchor);
  },
};

export const NonInteractivePointerEventsAndZIndex: Story = {
  render: () => <Stage message={'Not interactive'} />,
  play: async ({ canvasElement }) => {
    const { anchor, popper } = await openTooltip(canvasElement);

    // MUI: non-interactive tooltip popper never blocks the pointer
    await expect(getComputedStyle(popper).pointerEvents).toBe('none');
    await expect(Number(getComputedStyle(popper).zIndex)).toBe(OVERLAY_BASE_Z_INDEX + 1);
    await expect(popper.parentElement).toBe(document.body);

    await closeTooltip(anchor);
    // closed -> slot released and node gone
    await expect(document.querySelector('.vanguard-popover')).toBeNull();
  },
};

export const InteractivePointerEvents: Story = {
  render: () => <Stage message={'Interactive'} interactive />,
  play: async ({ canvasElement }) => {
    const { anchor, popper } = await openTooltip(canvasElement);

    await expect(getComputedStyle(popper).pointerEvents).toBe('auto');

    await closeTooltip(anchor);
  },
};

export const MaxWidthWrapsText: Story = {
  render: () => (
    <Stage
      maxWidth={'120px'}
      message={'A long tooltip message that must wrap onto several lines because of maxWidth'}
    />
  ),
  play: async ({ canvasElement }) => {
    const { anchor, surface } = await openTooltip(canvasElement);
    const s = surface.getBoundingClientRect();

    await expect(s.width).toBeLessThanOrEqual(120);
    await expect(s.height).toBeGreaterThan(40);

    await closeTooltip(anchor);
  },
};
