import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React, { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { PopoverModal, PopoverModalProps } from './PopoverModal';

/**
 * MUI contract (real browser) for PopoverModal over MUI v5 `Popper` + `Backdrop` + `Portal`.
 *
 * Pins popper placement relative to the anchor (incl. the `centerPopover` popper.js modifiers), the dim
 * Backdrop paint/geometry and backdrop-mousedown close. No MUI class is used: the popper is the element carrying
 * popper.js's `data-popper-placement` around the content, the backdrop has a Vanguard data-testid.
 */
export default {
  ...SbDecorator({
    title: 'Vanguard/PopoverModal/MUI Contract',
    component: PopoverModal,
  }),
};

type Story = StoryObj<typeof PopoverModal>;

const onCloseSpy = fn();

const Harness = (props: Partial<PopoverModalProps>) => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return (
    <div style={{ padding: 220, display: 'flex', justifyContent: 'center' }}>
      <button
        ref={anchorRef}
        data-testid={'anchor'}
        style={{ width: 160, height: 60 }}
        onClick={() => setAnchorEl(anchorRef.current)}
      >
        {'anchor'}
      </button>
      <PopoverModal
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        content={<div style={{ width: 200, height: 100, background: 'white' }}>{'popover content'}</div>}
        onClose={() => {
          onCloseSpy();
          setAnchorEl(null);
        }}
        {...props}
      />
    </div>
  );
};

// Settle waits (popper positioning, backdrop fade, unmount) get headroom for loaded full-suite runs.
const SETTLE = { timeout: 5000 };

const getContent = () => within(document.body).queryByText('popover content');
const getPopper = () => (getContent()?.closest('[data-popper-placement]') ?? null) as HTMLElement | null;
const getBackdrop = () => document.querySelector('[data-testid="popover-modal-backdrop"]') as HTMLElement | null;

const openPopover = async (canvasElement: HTMLElement) => {
  const anchor = within(canvasElement).getByTestId('anchor');
  await userEvent.click(anchor);
  await waitFor(() => expect(getPopper()).not.toBeNull(), SETTLE);
  const popper = getPopper() as HTMLElement;
  const content = getContent() as HTMLElement;
  return { anchor, popper, content };
};

const center = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

export const PlacementTopAboveAnchor: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const { anchor, popper, content } = await openPopover(canvasElement);
    const a = anchor.getBoundingClientRect();
    const c = content.getBoundingClientRect();

    await expect(popper).toHaveAttribute('data-popper-placement', 'top');
    await expect(Math.abs(c.bottom - a.top)).toBeLessThanOrEqual(1);
    await expect(Math.abs(center(c).x - center(a).x)).toBeLessThanOrEqual(1);
    // inline (disablePortal) by default
    await expect(canvasElement.contains(popper)).toBe(true);
  },
};

export const PlacementBottomBelowAnchor: Story = {
  render: () => <Harness placement={'bottom'} renderInPortal />,
  play: async ({ canvasElement }) => {
    const { anchor, popper, content } = await openPopover(canvasElement);
    const a = anchor.getBoundingClientRect();
    const c = content.getBoundingClientRect();

    await expect(popper).toHaveAttribute('data-popper-placement', 'bottom');
    await expect(Math.abs(c.top - a.bottom)).toBeLessThanOrEqual(1);
    await expect(popper.parentElement).toBe(document.body);
  },
};

export const CenterPopoverOverlapsAnchorCentre: Story = {
  render: () => <Harness centerPopover />,
  play: async ({ canvasElement }) => {
    const { anchor, popper, content } = await openPopover(canvasElement);

    // offset modifier pulls the popper back by (anchorH/2 + contentH/2) -> centred on the anchor
    await waitFor(() => {
      const a = anchor.getBoundingClientRect();
      const c = content.getBoundingClientRect();
      expect(Math.abs(center(c).y - center(a).y)).toBeLessThanOrEqual(1);
      expect(Math.abs(center(c).x - center(a).x)).toBeLessThanOrEqual(1);
    }, SETTLE);
    // computeStyles gpuAcceleration:false -> top/left positioning, no transform
    await expect(popper.style.transform).toBe('');
  },
};

export const DimBackdropPaintAndMouseDownClose: Story = {
  render: () => <Harness dimRestOfPage renderInPortal />,
  play: async ({ canvasElement }) => {
    onCloseSpy.mockClear();
    const { popper } = await openPopover(canvasElement);
    const backdrop = getBackdrop() as HTMLElement;

    await expect(backdrop.parentElement).toBe(document.body);
    const bs = getComputedStyle(backdrop);
    await expect(bs.position).toBe('fixed');
    await expect(bs.backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
    await waitFor(() => expect(getComputedStyle(backdrop).opacity).toBe('1'), SETTLE);
    const b = backdrop.getBoundingClientRect();
    await expect(Math.round(b.width)).toBe(document.documentElement.clientWidth);
    await expect(Math.round(b.height)).toBe(window.innerHeight);
    await expect(Number(getComputedStyle(popper).zIndex)).toBeGreaterThan(Number(bs.zIndex));

    // the dim backdrop is what receives a pointer outside the card
    await expect(document.elementFromPoint(5, 5)).toBe(backdrop);
    await userEvent.pointer({ keys: '[MouseLeft>]', target: backdrop, coords: { x: 5, y: 5 } });
    await expect(onCloseSpy).toHaveBeenCalledTimes(1);
    await userEvent.pointer({ keys: '[/MouseLeft]' });
    await waitFor(() => expect(getPopper()).toBeNull(), SETTLE);
    await waitFor(() => expect(getBackdrop()).toBeNull(), SETTLE);
  },
};

export const NoBackdropOutsideClickKeepsOpen: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    onCloseSpy.mockClear();
    await openPopover(canvasElement);

    await userEvent.pointer({ keys: '[MouseLeft]', target: canvasElement, coords: { x: 2, y: 2 } });

    await expect(onCloseSpy).not.toHaveBeenCalled();
    await expect(getPopper()).not.toBeNull();
  },
};
