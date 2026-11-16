/**
 * MUI contract (characterization) spec for Popover (MUI Tooltip + PopoverPopper).
 *
 * Locks CURRENT behaviour on MUI v5.16 so the MUI v6/v7/v9 bumps go red where MUI changed behaviour.
 * Do not edit these assertions to make a bump pass; see agentic-plans/mui-upgrade-plan.md "TDD contract".
 *
 * MUI class names are only queried where Vanguard production depends on them (kept on purpose, red = signal):
 * - `.MuiTooltip-popper` (PopoverPopper.scss:3), `.MuiTooltip-tooltip` (PopoverPopper.scss:8),
 *   `.MuiTooltip-arrow` (PopoverPopper.scss:15), `MuiTooltip-popper-dark` (Popover.tsx:136, PopoverPopper.scss:91),
 *   `vanguard-popover` (PopoverPopper.tsx:18, PopoverPopper.scss:2), `[data-popper-placement]` (PopoverPopper.scss:32).
 * Tags: `[bug-lock]` / `[v5-quirk]` = baseline characterization, not a promised contract.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { act, fireEvent, render, screen, waitFor } from '../../../test-utils/test-utils';
import { Popover } from './Popover';

const getTrigger = () => screen.getByRole('button', { name: 'trigger' });
const getWrapper = () => getTrigger().parentElement as HTMLElement;

const waitForTooltipGone = () => waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());

describe('Popover (MUI Tooltip) contract', () => {
  afterEach(() => {
    OverlayStackingService.__resetForTests();
    vi.restoreAllMocks();
  });

  describe('render without message', () => {
    test('returns children untouched (no span wrapper, no tooltip, no aria wiring)', () => {
      const { container } = render(
        <Popover message={''}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      expect(container.firstElementChild).toBe(getTrigger());
      expect(getTrigger()).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('closed state', () => {
    test('wraps children in a span (no aria-label, no aria-labelledby, nothing portaled)', () => {
      render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      const wrapper = getWrapper();
      expect(wrapper.tagName).toBe('SPAN');
      // title passed to MUI is a ReactNode (fragment of <Text>), never a string -> MUI sets no aria-label.
      expect(wrapper).not.toHaveAttribute('aria-label');
      expect(wrapper).not.toHaveAttribute('aria-labelledby');
      expect(wrapper).not.toHaveAttribute('aria-describedby');
      expect(wrapper).not.toHaveAttribute('title');
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    test('does not register a stacking slot while closed', () => {
      render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX);
    });
  });

  describe('open on hover / close on leave', () => {
    test('hover opens a tooltip portaled to body and wires aria-labelledby to the popper id', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());

      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip.parentElement).toBe(document.body);
      expect(container.contains(tooltip)).toBe(false);
      expect(tooltip.id).not.toBe('');
      expect(getWrapper()).toHaveAttribute('aria-labelledby', tooltip.id);
      expect(getWrapper()).not.toHaveAttribute('aria-describedby');
      expect(tooltip).toHaveTextContent('tooltip message');
    });

    test('leaving the anchor closes the tooltip and unmounts it from body after the transition', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      await screen.findByRole('tooltip');
      await user.unhover(getTrigger());

      expect(getWrapper()).not.toHaveAttribute('aria-labelledby');
      await waitForTooltipGone();
      expect(document.querySelector('.MuiTooltip-popper')).toBeNull();
    });

    test('opens immediately on mouseenter (no enterDelay) and closes immediately on mouseleave (no leaveDelay)', () => {
      vi.useFakeTimers();
      try {
        render(
          <Popover message={'tooltip message'}>
            <button>{'trigger'}</button>
          </Popover>,
        );

        fireEvent.mouseEnter(getWrapper());
        // no timers advanced: open state is set synchronously by Vanguard (controlled `open`)
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(getWrapper()).toHaveAttribute('aria-labelledby');

        fireEvent.mouseLeave(getWrapper());
        expect(getWrapper()).not.toHaveAttribute('aria-labelledby');
        // the Grow exit transition keeps the node mounted until it finishes
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        act(() => {
          vi.advanceTimersByTime(1000);
        });
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });

    // CURRENT BEHAVIOUR (suspected a11y bug): `open` is controlled by Vanguard and only mouseenter/leave
    // toggle it; MUI's focus listener calls onOpen which Vanguard does not pass, so keyboard focus never shows it.
    test('[bug-lock] keyboard focus on the trigger does NOT open the tooltip', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.tab();
      expect(getTrigger()).toHaveFocus();

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    // CURRENT BEHAVIOUR (suspected a11y bug): hover content must be dismissible (WCAG 1.4.13), Escape is ignored.
    test('[bug-lock] Escape does not close an open tooltip (no Escape handling while controlled)', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      await screen.findByRole('tooltip');
      await user.keyboard('{Escape}');

      expect(getWrapper()).toHaveAttribute('aria-labelledby');
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    // CURRENT BEHAVIOUR: touch-only users never see the tooltip (MUI's touch listener is bypassed by `open`).
    test('[v5-quirk] touch start alone does not open the tooltip (open is controlled by mouseenter only)', () => {
      // Baseline characterization: not a promised contract.
      vi.useFakeTimers();
      try {
        render(
          <Popover message={'tooltip message'}>
            <button>{'trigger'}</button>
          </Popover>,
        );
        fireEvent.touchStart(getWrapper());
        act(() => {
          vi.advanceTimersByTime(2000);
        });
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('content', () => {
    test('string message renders title (bold Text) and message (textHelp Text) with replacements', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'Hello %name%'} title={'Title %name%'} replacements={{ name: 'World' }}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const tooltip = await screen.findByRole('tooltip');

      const title = screen.getByText('Title World');
      const message = screen.getByText('Hello World');
      expect(tooltip).toContainElement(title);
      expect(title).toHaveStyle({ fontWeight: 'bold' });
      expect(message).toHaveClass('text-help');
      // title precedes message inside the MUI tooltip surface
      const surface = tooltip.querySelector('.MuiTooltip-tooltip') as HTMLElement;
      expect(surface.firstElementChild).toBe(title);
    });

    // CURRENT BEHAVIOUR: `title` accepts ReactNode in the type but only string titles render.
    test('[v5-quirk] non-string title is ignored when message is a string', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      render(
        <Popover message={'only message'} title={<b>{'node title'}</b>}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      await screen.findByRole('tooltip');

      expect(screen.queryByText('node title')).not.toBeInTheDocument();
      expect(screen.getByText('only message')).toBeInTheDocument();
    });

    // CURRENT BEHAVIOUR: `title` is silently dropped when `message` is a ReactNode.
    test('[v5-quirk] ReactNode message is rendered as-is and title is ignored', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      render(
        <Popover message={<a href={'#x'}>{'node message'}</a>} title={'ignored title'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const tooltip = await screen.findByRole('tooltip');

      expect(tooltip).toContainElement(screen.getByRole('link', { name: 'node message' }));
      expect(screen.queryByText('ignored title')).not.toBeInTheDocument();
    });
  });

  describe('popper/tooltip classes and styles (consumed by PopoverPopper.scss)', () => {
    test('dark theme (default): popper has vanguard-popover + MuiTooltip-popper + MuiTooltip-popper-dark, arrow inside the surface', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const popper = await screen.findByRole('tooltip');

      expect(popper).toHaveClass('vanguard-popover', 'MuiTooltip-popper', 'MuiTooltip-popper-dark');
      const surface = popper.querySelector('.MuiTooltip-tooltip') as HTMLElement;
      expect(surface).not.toBeNull();
      expect(surface.querySelector('.MuiTooltip-arrow')).not.toBeNull();
    });

    test('default theme: popper has no MuiTooltip-popper-dark class', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'} theme={'default'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const popper = await screen.findByRole('tooltip');

      expect(popper).toHaveClass('vanguard-popover', 'MuiTooltip-popper');
      expect(popper).not.toHaveClass('MuiTooltip-popper-dark');
    });

    test('arrow={false}: no arrow element', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'} arrow={false}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const popper = await screen.findByRole('tooltip');

      expect(popper.querySelector('.MuiTooltip-arrow')).toBeNull();
    });

    test('interactive: popper accepts pointer events (non-interactive: pointer-events none)', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'} interactive>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const popper = await screen.findByRole('tooltip');

      expect(getComputedStyle(popper).pointerEvents).toBe('auto');
    });

    test('non-interactive (default): popper has pointer-events none', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const popper = await screen.findByRole('tooltip');

      expect(getComputedStyle(popper).pointerEvents).toBe('none');
    });

    // CURRENT BEHAVIOUR (suspected bug): `interactive` is documented as "adds an onLeave delay so the user may
    // hover the Popover", but Vanguard's own onMouseLeave on the anchor closes the controlled tooltip immediately,
    // so moving the pointer from the anchor onto the tooltip closes it.
    test('[bug-lock] interactive: moving the pointer from the anchor onto the tooltip closes it', async () => {
      // Baseline characterization: not a promised contract.
      // pointerEventsCheck off: once closed, MUI sets `pointer-events: none` on the popper mid-move.
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      render(
        <Popover message={<a href={'#x'}>{'link in tooltip'}</a>} interactive>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      await screen.findByRole('tooltip');
      await user.hover(screen.getByRole('link', { name: 'link in tooltip' }));

      expect(getWrapper()).not.toHaveAttribute('aria-labelledby');
      await waitForTooltipGone();
    });

    test('maxWidth is applied inline to both the popper and the tooltip surface', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'} maxWidth={'200px'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const popper = await screen.findByRole('tooltip');

      expect(popper.style.maxWidth).toBe('200px');
      expect((popper.querySelector('.MuiTooltip-tooltip') as HTMLElement).style.maxWidth).toBe('200px');
    });

    test('className (TooltipClasses) is forwarded as MUI `classes` to popper, tooltip and arrow', async () => {
      const user = userEvent.setup();
      render(
        <Popover
          message={'tooltip message'}
          className={{ popper: 'my-popper', tooltip: 'my-tooltip', arrow: 'my-arrow' }}
        >
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const popper = await screen.findByRole('tooltip');

      expect(popper).toHaveClass('my-popper', 'vanguard-popover');
      expect(popper.querySelector('.MuiTooltip-tooltip')).toHaveClass('my-tooltip');
      expect(popper.querySelector('.MuiTooltip-arrow')).toHaveClass('my-arrow');
    });
  });

  describe('placement', () => {
    test.each(['top', 'bottom', 'left', 'right'] as const)('position=%s -> data-popper-placement', async (position) => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'} position={position}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const popper = await screen.findByRole('tooltip');

      await waitFor(() => expect(popper).toHaveAttribute('data-popper-placement', position));
    });

    test('default position is top', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const popper = await screen.findByRole('tooltip');

      await waitFor(() => expect(popper).toHaveAttribute('data-popper-placement', 'top'));
    });
  });

  describe('overlay stacking (OverlayStackingService)', () => {
    test('open registers a popover slot and applies its z-index to the popper; close releases it', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const popper = await screen.findByRole('tooltip');

      expect(popper.style.zIndex).toBe(String(OVERLAY_BASE_Z_INDEX + 1));
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);

      await user.unhover(getTrigger());
      expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX);
      expect(popper.style.zIndex).toBe(String(OVERLAY_BASE_Z_INDEX));
    });

    test('stacks above a modal that raised the stacking floor', async () => {
      const user = userEvent.setup();
      const modalZ = OverlayStackingService.register('host-modal', 'modal', 5000);
      render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      const popper = await screen.findByRole('tooltip');

      expect(Number(popper.style.zIndex)).toBeGreaterThan(modalZ);
    });

    test('unmount while open releases the slot and leaves no portal node in body', async () => {
      const user = userEvent.setup();
      const { unmount } = render(
        <Popover message={'tooltip message'}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());
      await screen.findByRole('tooltip');
      unmount();

      expect(document.querySelector('[role="tooltip"]')).toBeNull();
      expect(document.querySelector('.vanguard-popover')).toBeNull();
      expect(OverlayStackingService.register('after', 'modal')).toBe(OVERLAY_BASE_Z_INDEX + 1);
    });
  });

  describe('hideUnderBreakpoint', () => {
    test('does not open when window width is below the breakpoint', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'} hideUnderBreakpoint={window.innerWidth + 1}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX);
    });

    test('opens when window width is at/above the breakpoint', async () => {
      const user = userEvent.setup();
      render(
        <Popover message={'tooltip message'} hideUnderBreakpoint={window.innerWidth}>
          <button>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());

      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('wrapChildren={false}', () => {
    test('child is used directly (no span) and gets aria-labelledby while open', async () => {
      const user = userEvent.setup();
      render(
        <div data-testid={'host'}>
          <Popover message={'tooltip message'} wrapChildren={false}>
            <button>{'trigger'}</button>
          </Popover>
        </div>,
      );

      expect(getTrigger().parentElement).toBe(screen.getByTestId('host'));

      const trigger = getTrigger();
      await user.hover(trigger);
      const tooltip = await screen.findByRole('tooltip');
      expect(trigger).toHaveAttribute('aria-labelledby', tooltip.id);
      // aria-labelledby replaces the button's accessible name with the tooltip content while open
      expect(screen.getByRole('button', { name: 'tooltip message' })).toBe(trigger);
    });

    // CURRENT BEHAVIOUR (suspected bug): MUI spreads `children.props` after Tooltip's own props, so a child's
    // onMouseEnter replaces Vanguard's onMouseEnter (the only thing that opens the controlled tooltip).
    test("[bug-lock] a child's own onMouseEnter overrides Popover's opener -> tooltip never opens", async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      const childEnter = vi.fn();
      render(
        <Popover message={'tooltip message'} wrapChildren={false}>
          <button onMouseEnter={childEnter}>{'trigger'}</button>
        </Popover>,
      );

      await user.hover(getTrigger());

      expect(childEnter).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    test('child className is preserved on the cloned element', () => {
      render(
        <Popover message={'tooltip message'} wrapChildren={false}>
          <button className={'child-class'}>{'trigger'}</button>
        </Popover>,
      );

      expect(getTrigger()).toHaveClass('child-class');
    });
  });
});
