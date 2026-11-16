/**
 * MUI contract (characterization) spec for Drawer (MUI Drawer -> Modal/Slide/Paper).
 *
 * Locks CURRENT behaviour on MUI v5.16 so the MUI v6/v7/v9 bumps go red where MUI changed behaviour.
 * Do not edit these assertions to make a bump pass; see agentic-plans/mui-upgrade-plan.md "TDD contract".
 *
 * No MUI class is asserted: Vanguard production code has no selector on Drawer's MUI classes.
 * The paper is located as the parent of Vanguard's own `styles.drawer` wrapper and the root as the paper's parent.
 * `.MuiBackdrop-root` is used as a LOCATOR only (the backdrop has no role/testid).
 * Tags: `[bug-lock]` / `[v5-quirk]` = baseline characterization, not a promised contract.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { AnchorTypes, Drawer, DrawerProps } from '@vanguard/Drawer/Drawer';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '../../../test-utils/test-utils';
import styles from './Drawer.module.scss';

// Paper = parent of Vanguard's own inner wrapper; root = parent of the paper (docked root or Modal root).
const getPaper = () => (document.querySelector(`.${styles.drawer}`)?.parentElement ?? null) as HTMLElement | null;
const getRoot = () => (getPaper()?.parentElement ?? null) as HTMLElement | null;
const getBackdrop = () => document.querySelector('.MuiBackdrop-root') as HTMLElement | null;

// Elements appended to <body> by a test; removed in afterEach even when the test fails.
const extraNodes: HTMLElement[] = [];
const appendToBody = <T extends HTMLElement>(el: T): T => {
  document.body.appendChild(el);
  extraNodes.push(el);
  return el;
};

const renderTemporary = (props: Partial<DrawerProps> = {}) =>
  render(
    <div data-testid={'host'}>
      <button>{'outside'}</button>
      <Drawer open variant={'temporary'} title={'Title'} {...props}>
        <button>{'inside'}</button>
      </Drawer>
    </div>,
  );

describe('Drawer (MUI Drawer) contract', () => {
  afterEach(() => {
    extraNodes.splice(0).forEach((el) => { el.remove(); });
    OverlayStackingService.__resetForTests();
    vi.restoreAllMocks();
  });

  describe('default variant = persistent (docked, no Modal)', () => {
    test('renders inline (not portaled), without role and without backdrop', () => {
      render(
        <div data-testid={'host'}>
          <Drawer open title={'Title'}>
            {'content'}
          </Drawer>
        </div>,
      );

      const root = getRoot() as HTMLElement;
      expect(screen.getByTestId('host')).toContainElement(root);
      expect(root).not.toHaveAttribute('role');
      expect(getBackdrop()).toBeNull();
    });

    test('closed persistent drawer stays mounted with the paper hidden (visibility: hidden)', async () => {
      const { rerender } = render(<Drawer open>{'content'}</Drawer>);

      rerender(<Drawer open={false}>{'content'}</Drawer>);

      await waitFor(() => expect((getPaper() as HTMLElement).style.visibility).toBe('hidden'));
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    test('initially closed persistent drawer is mounted but hidden', () => {
      render(<Drawer open={false}>{'content'}</Drawer>);

      expect(getPaper()).not.toBeNull();
      expect((getPaper() as HTMLElement).style.visibility).toBe('hidden');
    });

    test('Escape does not call onClose (no Modal)', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Drawer open onClose={onClose}>
          <button>{'inside'}</button>
        </Drawer>,
      );

      await user.click(screen.getByRole('button', { name: 'inside' }));
      await user.keyboard('{Escape}');

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('variant = temporary (Modal)', () => {
    test('portals to body: root has role="presentation" and contains a backdrop', () => {
      renderTemporary();

      const root = getRoot() as HTMLElement;
      expect(root.parentElement).toBe(document.body);
      expect(screen.getByTestId('host')).not.toContainElement(root);
      expect(root).toHaveAttribute('role', 'presentation');
      expect(root).toContainElement(getBackdrop());
    });

    // MUI v5 Backdrop sets aria-hidden itself; v9 drops it. Vanguard does not rely on it (no production hit).
    test('[v5-quirk] the backdrop element carries aria-hidden="true"', () => {
      // Baseline characterization: not a promised contract.
      renderTemporary();

      expect(getBackdrop()).toHaveAttribute('aria-hidden', 'true');
    });

    test('backdrop transition uses the 400ms transitionDuration', () => {
      renderTemporary();

      expect((getBackdrop() as HTMLElement).style.transition).toContain('400ms');
    });

    test('app siblings are aria-hidden while the modal drawer is open', () => {
      renderTemporary();

      expect(screen.getByTestId('host').parentElement).toHaveAttribute('aria-hidden', 'true');
    });

    test('hideBackdrop: no backdrop element is rendered', () => {
      renderTemporary({ hideBackdrop: true });

      expect(getRoot()).toHaveAttribute('role', 'presentation');
      expect(getBackdrop()).toBeNull();
    });

    test('Escape -> onClose({ isOk: false, data: { reason: "escapeKeyDown" } })', () => {
      const onClose = vi.fn();
      renderTemporary({ onClose });

      fireEvent.keyDown(getPaper() as HTMLElement, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledWith({ isOk: false, data: { reason: 'escapeKeyDown' } });
    });

    test('backdrop click -> onClose({ isOk: false, data: { reason: "backdropClick" } })', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderTemporary({ onClose });

      await user.click(getBackdrop() as HTMLElement);

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledWith({ isOk: false, data: { reason: 'backdropClick' } });
    });

    test('Escape without onClose does not throw', () => {
      renderTemporary();

      expect(() => fireEvent.keyDown(getPaper() as HTMLElement, { key: 'Escape' })).not.toThrow();
    });

    test('focus moves into the drawer (paper) on open', () => {
      renderTemporary();

      expect(getPaper()).toHaveFocus();
    });

    test('disableEnforceFocus: focus can leave the drawer and stays outside', async () => {
      renderTemporary();

      const outside = appendToBody(document.createElement('input'));
      outside.focus();
      // FocusTrap's enforce interval runs every 50ms; give it a chance to (not) pull focus back
      await new Promise((resolve) => setTimeout(resolve, 120));

      expect(outside).toHaveFocus();
    });

    test('focus returns to the previously focused element after close', async () => {
      const outside = appendToBody(document.createElement('button'));
      outside.focus();
      const { rerender } = render(
        <Drawer open variant={'temporary'}>
          {'content'}
        </Drawer>,
      );
      expect(getPaper()).toHaveFocus();

      rerender(
        <Drawer open={false} variant={'temporary'}>
          {'content'}
        </Drawer>,
      );

      await waitFor(() => expect(outside).toHaveFocus());
    });

    test('slide transition: opening applies a 400ms transform transition, closing unmounts after it', async () => {
      const { rerender } = render(
        <Drawer open={false} variant={'temporary'}>
          {'content'}
        </Drawer>,
      );
      // closed temporary drawer is not mounted (keepMounted false)
      expect(getRoot()).toBeNull();
      expect(screen.queryByText('content')).not.toBeInTheDocument();

      rerender(
        <Drawer open variant={'temporary'}>
          {'content'}
        </Drawer>,
      );
      const paper = getPaper() as HTMLElement;
      expect(paper.style.transition).toContain('400ms');
      expect(paper.style.transition).toContain('transform');

      rerender(
        <Drawer open={false} variant={'temporary'}>
          {'content'}
        </Drawer>,
      );
      // still mounted during the exit transition
      expect(getRoot()).not.toBeNull();
      await waitFor(() => expect(getRoot()).toBeNull(), { timeout: 2000 });
      expect(document.querySelector('[role="presentation"]')).toBeNull();
    });

    test('unmount while open leaves no portal nodes in body', () => {
      const { unmount } = renderTemporary();

      unmount();

      expect(getPaper()).toBeNull();
      expect(document.querySelector('[role="presentation"]')).toBeNull();
      expect(getBackdrop()).toBeNull();
    });
  });

  describe('z-index', () => {
    test('no zIndex: root z-index is the static 1099 from sx; Modal root has no inline z-index', () => {
      renderTemporary();

      const root = getRoot() as HTMLElement;
      expect(root.style.zIndex).toBe('');
      expect(getComputedStyle(root).zIndex).toBe('1099');
    });

    test('zIndex prop: applied inline on the Modal root (ModalProps.style) and via sx', () => {
      renderTemporary({ zIndex: 4242 });

      const root = getRoot() as HTMLElement;
      expect(root.style.zIndex).toBe('4242');
      expect(getComputedStyle(root).zIndex).toBe('4242');
    });

    test('persistent drawer with zIndex: sx z-index on the docked root, ModalProps ignored', () => {
      render(
        <Drawer open zIndex={777}>
          {'content'}
        </Drawer>,
      );

      const root = getRoot() as HTMLElement;
      expect(root.style.zIndex).toBe('');
      expect(getComputedStyle(root).zIndex).toBe('777');
    });

    test('Drawer itself does not register with OverlayStackingService (DrawerRoot does)', () => {
      renderTemporary();

      expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX);
    });
  });

  describe('anchor', () => {
    // Observable side of the anchor (jsdom has no layout; real geometry is in _DrawerMuiContract.stories.tsx).
    test.each([
      [AnchorTypes.left, { left: '0px' }],
      [AnchorTypes.right, { right: '0px' }],
      [AnchorTypes.top, { top: '0px', left: '0px', right: '0px' }],
      [AnchorTypes.bottom, { bottom: '0px', left: '0px', right: '0px' }],
    ])('anchor=%s -> fixed paper pinned to that viewport edge', (anchor, edges) => {
      renderTemporary({ anchor });

      const style = getComputedStyle(getPaper() as HTMLElement);
      expect(style.position).toBe('fixed');
      Object.entries(edges).forEach(([edge, value]) => { expect(style.getPropertyValue(edge)).toBe(value); });
    });

    test('anchor=right -> inner wrapper has styles.right', () => {
      renderTemporary({ anchor: AnchorTypes.right });

      const inner = (getPaper() as HTMLElement).firstElementChild as HTMLElement;
      expect(inner).toHaveClass(styles.drawer, styles.right);
      expect(inner).not.toHaveClass(styles.left);
    });

    // CURRENT BEHAVIOUR (suspected bug): every non-right anchor (incl. top/bottom) gets the `left` layout class.
    test.each([AnchorTypes.left, AnchorTypes.top, AnchorTypes.bottom])(
      '[bug-lock] anchor=%s -> inner wrapper has styles.left',
      (anchor) => {
        // Baseline characterization: not a promised contract.
        renderTemporary({ anchor });

        const inner = (getPaper() as HTMLElement).firstElementChild as HTMLElement;
        expect(inner).toHaveClass(styles.drawer, styles.left);
      },
    );
  });

  describe('variant = permanent', () => {
    test('renders inline and visible even with open={false}, no Modal', () => {
      render(
        <div data-testid={'host'}>
          <Drawer open={false} variant={'permanent'}>
            {'content'}
          </Drawer>
        </div>,
      );

      expect(screen.getByTestId('host')).toContainElement(getRoot());
      expect(getRoot()).not.toHaveAttribute('role');
      expect((getPaper() as HTMLElement).style.visibility).toBe('');
      expect(screen.getByText('content')).toBeInTheDocument();
    });
  });

  describe('header and content', () => {
    test('title + description render a drawer Header; content in drawerContent', () => {
      renderTemporary({ title: 'My title', description: 'My description' });

      expect(screen.getByRole('heading', { name: 'My title' })).toBeInTheDocument();
      expect(screen.getByText('My description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'inside' }).parentElement).toHaveClass(styles.drawerContent);
    });

    test('no title -> no header block', () => {
      renderTemporary({ title: undefined });

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(document.querySelector(`.${styles.header}`)).toBeNull();
    });

    test('isHeaderCompact -> compact class; isHeaderSticky -> sticky class', () => {
      renderTemporary({ isHeaderCompact: true, isHeaderSticky: true });

      expect(document.querySelector(`.${styles.header}`)).toHaveClass(styles.compact);
      expect(document.querySelector(`.${styles.headerContainer}`)).toHaveClass(styles.headerSticky);
    });

    test('not compact / not sticky -> no compact / sticky class', () => {
      renderTemporary();

      expect(document.querySelector(`.${styles.header}`)).not.toHaveClass(styles.compact);
      expect(document.querySelector(`.${styles.headerContainer}`)).not.toHaveClass(styles.headerSticky);
    });

    test('showCloseButton=false (default) -> no close button', () => {
      renderTemporary();

      expect(document.querySelector(`.${styles.closeButton}`)?.childElementCount).toBe(0);
    });

    // CURRENT BEHAVIOUR (suspected bug): the close button passes `onClose` directly as onClick, so onClose
    // receives the click event instead of a ModalResponse ({ isOk, data: { reason } }).
    test('[bug-lock] showCloseButton -> button calls onClose with the click event (not a ModalResponse)', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderTemporary({ showCloseButton: true, onClose });

      const closeButton = (document.querySelector(`.${styles.closeButton}`) as HTMLElement).querySelector(
        'button',
      ) as HTMLButtonElement;
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose.mock.calls[0][0]).not.toHaveProperty('isOk');
      expect(onClose.mock.calls[0][0]).toHaveProperty('type', 'click');
    });
  });

  describe('paper styling (PaperProps sx)', () => {
    test('paper background-image is none (dark-theme elevation overlay dropped)', () => {
      renderTemporary();

      expect(getComputedStyle(getPaper() as HTMLElement).backgroundImage).toBe('none');
    });
  });
});
