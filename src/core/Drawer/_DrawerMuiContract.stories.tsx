import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React, { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { AnchorTypes, Drawer, DrawerProps } from './Drawer';
import styles from './Drawer.module.scss';

/**
 * MUI contract (real browser) for Drawer over MUI v5 `Drawer` (Modal + Slide + Paper).
 *
 * Pins paper geometry per anchor, the PaperProps sx surface, backdrop paint, slide transition settle,
 * focus move/return and `disableEnforceFocus` (ModalProps). No MUI class is asserted (no production selector on
 * Drawer's MUI classes): the paper is the parent of Vanguard's `styles.drawer` wrapper, the root is the paper's
 * parent, `.MuiBackdrop-root` is a locator only. The temporary drawer portals to <body>, so queries use `document`.
 */
export default {
  ...SbDecorator({
    title: 'Vanguard/Drawer/MUI Contract',
    component: Drawer,
  }),
};

type Story = StoryObj<typeof Drawer>;

const onCloseSpy = fn();

/** Resolves a CSS colour (incl. custom properties) to the browser's computed rgb() string */
const resolveColor = (cssColor: string): string => {
  const probe = document.createElement('span');
  probe.style.backgroundColor = cssColor;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
};

const Harness = (props: Partial<DrawerProps>) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button data-testid={'opener'} onClick={() => setOpen(true)}>
        {'Open drawer'}
      </button>
      <Drawer
        variant={'temporary'}
        title={'Contract drawer'}
        open={open}
        onClose={(response) => {
          onCloseSpy(response);
          setOpen(false);
        }}
        {...props}
      >
        <div style={{ width: 320, height: 200 }}>
          <input data-testid={'drawer-input'} aria-label={'drawer input'} />
        </div>
      </Drawer>
    </div>
  );
};

// Settle waits (Slide/Fade 400ms transitions, focus restore, unmount) get headroom for loaded full-suite runs.
const SETTLE = { timeout: 5000 };

const getPaper = () => document.querySelector(`.${styles.drawer}`)?.parentElement as HTMLElement;
const getRoot = () => (getPaper()?.parentElement ?? null) as HTMLElement | null;
const getBackdrop = () => document.querySelector('.MuiBackdrop-root') as HTMLElement | null;

const openDrawer = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByTestId('opener'));
  await waitFor(() => expect(getRoot()).not.toBeNull(), SETTLE);
  // Slide enter (400ms) settled: transform cleared
  await waitFor(() => expect(getComputedStyle(getPaper()).transform).toBe('none'), SETTLE);
  return { root: getRoot() as HTMLElement, paper: getPaper() };
};

const waitClosed = () => waitFor(() => expect(getPaper()).toBeFalsy(), SETTLE);

const anchorGeometry =
  (anchor: AnchorTypes) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const { paper } = await openDrawer(canvasElement);
    const r = paper.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;

    await expect(getComputedStyle(paper).position).toBe('fixed');
    if (anchor === AnchorTypes.right) {
      await expect(Math.round(r.right)).toBe(vw);
      await expect(Math.round(r.top)).toBe(0);
      await expect(Math.round(r.height)).toBe(vh);
    }
    if (anchor === AnchorTypes.left) {
      await expect(Math.round(r.left)).toBe(0);
      await expect(Math.round(r.height)).toBe(vh);
    }
    if (anchor === AnchorTypes.top) {
      await expect(Math.round(r.top)).toBe(0);
      await expect(Math.round(r.left)).toBe(0);
      await expect(Math.round(r.width)).toBe(vw);
    }
    if (anchor === AnchorTypes.bottom) {
      await expect(Math.round(r.bottom)).toBe(vh);
      await expect(Math.round(r.width)).toBe(vw);
    }

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  };

export const AnchorRightGeometry: Story = {
  render: () => <Harness anchor={AnchorTypes.right} />,
  play: anchorGeometry(AnchorTypes.right),
};

export const AnchorLeftGeometry: Story = {
  render: () => <Harness anchor={AnchorTypes.left} />,
  play: anchorGeometry(AnchorTypes.left),
};

export const AnchorTopGeometry: Story = {
  render: () => <Harness anchor={AnchorTypes.top} />,
  play: anchorGeometry(AnchorTypes.top),
};

export const AnchorBottomGeometry: Story = {
  render: () => <Harness anchor={AnchorTypes.bottom} />,
  play: anchorGeometry(AnchorTypes.bottom),
};

export const PaperSurfaceAndBackdropPaint: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const { root, paper } = await openDrawer(canvasElement);
    const paperStyle = getComputedStyle(paper);

    // PaperProps sx: dark-aware surface, MUI elevation overlay removed
    await expect(resolveColor('var(--fn-bg-surface)')).not.toBe('rgba(0, 0, 0, 0)');
    await expect(paperStyle.backgroundColor).toBe(resolveColor('var(--fn-bg-surface)'));
    await expect(paperStyle.backgroundImage).toBe('none');
    // temporary drawer paper is elevated: it paints a drop shadow
    await expect(paperStyle.boxShadow).not.toBe('none');
    // root stacking from sx fallback
    await expect(getComputedStyle(root).zIndex).toBe('1099');
    await expect(getComputedStyle(root).position).toBe('fixed');

    const backdrop = getBackdrop() as HTMLElement;
    await expect(root).toContainElement(backdrop);
    await expect(getComputedStyle(backdrop).backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
    await waitFor(() => expect(getComputedStyle(backdrop).opacity).toBe('1'), SETTLE);
    const b = backdrop.getBoundingClientRect();
    await expect(Math.round(b.height)).toBe(window.innerHeight);

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};

export const HideBackdropRendersNoBackdrop: Story = {
  render: () => <Harness hideBackdrop />,
  play: async ({ canvasElement }) => {
    const { root } = await openDrawer(canvasElement);

    await expect(root).toHaveAttribute('role', 'presentation');
    await expect(getBackdrop()).toBeNull();

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};

export const BackdropClickCloses: Story = {
  render: () => <Harness anchor={AnchorTypes.right} />,
  play: async ({ canvasElement }) => {
    onCloseSpy.mockClear();
    const { paper } = await openDrawer(canvasElement);
    const backdrop = getBackdrop() as HTMLElement;
    const p = paper.getBoundingClientRect();

    // click the backdrop on the far side of the viewport from the right-anchored paper
    await userEvent.pointer({ keys: '[MouseLeft]', target: backdrop, coords: { x: 5, y: Math.round(p.height / 2) } });
    await waitClosed();
    await expect(onCloseSpy).toHaveBeenCalledWith({ isOk: false, data: { reason: 'backdropClick' } });
  },
};

export const FocusMovesInAndReturns: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    onCloseSpy.mockClear();
    const opener = within(canvasElement).getByTestId('opener');
    const { paper } = await openDrawer(canvasElement);

    // focus moves into the drawer surface on open
    await expect(paper).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitClosed();
    await expect(onCloseSpy).toHaveBeenCalledWith({ isOk: false, data: { reason: 'escapeKeyDown' } });
    await waitFor(() => expect(opener).toHaveFocus(), SETTLE);
  },
};

export const FocusCanLeaveDrawer: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    await openDrawer(canvasElement);
    // an input on a "higher overlay" outside the drawer's DOM (ModalProps.disableEnforceFocus)
    const outside = document.createElement('input');
    outside.setAttribute('data-testid', 'outside-input');
    document.body.appendChild(outside);

    try {
      outside.focus();
      await userEvent.keyboard('abc');
      // focus stayed outside and the input received the typing
      await expect(outside).toHaveFocus();
      await expect(outside.value).toBe('abc');
    } finally {
      outside.remove();
    }

    // focus can move back into the drawer content afterwards
    const drawerInput = within(getPaper()).getByTestId('drawer-input');
    drawerInput.focus();
    await expect(drawerInput).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};

export const PersistentDockedNoModal: Story = {
  render: () => (
    <Drawer open variant={'persistent'} title={'Persistent'}>
      <div style={{ width: 240 }}>{'docked content'}</div>
    </Drawer>
  ),
  play: async () => {
    const root = getRoot() as HTMLElement;
    const paper = getPaper();

    await expect(root).not.toHaveAttribute('role');
    await expect(getBackdrop()).toBeNull();
    // docked (persistent) paper is flat: no drop shadow
    await expect(getComputedStyle(paper).boxShadow).toBe('none');
    // docked paper is still fixed to the right edge
    await expect(getComputedStyle(paper).position).toBe('fixed');
    await waitFor(
      () => expect(Math.round(paper.getBoundingClientRect().right)).toBe(document.documentElement.clientWidth),
      SETTLE,
    );
    // docked paper has a 1px divider border on the inner edge
    await expect(getComputedStyle(paper).borderLeftWidth).toBe('1px');
  },
};
