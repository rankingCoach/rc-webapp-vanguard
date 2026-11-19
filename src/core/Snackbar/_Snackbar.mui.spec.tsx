import { Slide, SlideProps } from '@mui/material';
import { Snackbar } from '@vanguard/Snackbar/Snackbar';
import React, { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, fireEvent, render, screen } from '../../../test-utils/test-utils';

const LintSlideLeft270 = (props: SlideProps) => <Slide {...props} direction="left" />;


/**
 * MUI contract for Snackbar (thin wrapper over MUI v5 `Snackbar`, props spread through).
 * v9 removes `TransitionComponent` / `TransitionProps` / `ContentProps` / `ClickAwayListenerProps`
 * (-> `slots` / `slotProps`); the tests that pass them are expected to go red at v9.
 * Real-browser position/slide is pinned in `src/core/SnackbarRoot/_SnackbarRootMuiContract.stories.tsx`.
 */

// The MUI Snackbar root is located through Vanguard's own wrapper (`ComponentContainer className="Snackbar-container"`
// in Snackbar.tsx), not through MUI's `.MuiSnackbar-root` class, which no Vanguard production code depends on.
const getRoot = () => document.querySelector('.Snackbar-container > *') as HTMLElement | null;

/** MUI's ClickAwayListener arms itself one macrotask after mount */
const armClickAway = () => act(() => vi.advanceTimersByTime(1));

describe('Snackbar (MUI Snackbar contract)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('render', () => {
    it('renders nothing from MUI while closed, only the Vanguard container', () => {
      const { container } = render(<Snackbar open={false} message="Hello" />);

      expect(getRoot()).toBeNull();
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).toBe('Snackbar-container');
      expect(wrapper.children).toHaveLength(0);
    });

    it('renders inline (no portal) inside the Vanguard container when open', () => {
      const { container } = render(<Snackbar open message="Hello" />);

      const root = getRoot();
      expect(root).not.toBeNull();
      expect(root!.parentElement).toBe(container.firstElementChild);
    });

    it('message renders a role=alert content with the message text and the action', () => {
      render(<Snackbar open message="Saved" action={<button>{'Undo'}</button>} />);

      const alert = screen.getByRole('alert');
      expect(alert.textContent).toBe('SavedUndo');
      expect(alert.contains(screen.getByRole('button', { name: 'Undo' }))).toBe(true);
      expect(alert.parentElement).toBe(getRoot());
    });

    it('children replace SnackbarContent (no role=alert added by MUI)', () => {
      render(
        <Snackbar open>
          <div data-testid="custom">{'Custom'}</div>
        </Snackbar>,
      );

      expect(screen.getByTestId('custom').parentElement).toBe(getRoot());
      expect(screen.queryByRole('alert')).toBeNull();
    });

    // jsdom evaluates MUI's base (xs) rules: fixed, 8px from the anchored edge, justified to the anchored side.
    // The >= sm 24px geometry is pinned in the real browser (_SnackbarRootMuiContract.stories.tsx).
    it.each([
      [undefined, { top: '', bottom: '8px', justifyContent: 'flex-start' }],
      [
        { vertical: 'top', horizontal: 'right' },
        { top: '8px', bottom: '', justifyContent: 'flex-end' },
      ],
      [
        { vertical: 'top', horizontal: 'center' },
        { top: '8px', bottom: '', justifyContent: 'center' },
      ],
      [
        { vertical: 'bottom', horizontal: 'right' },
        { top: '', bottom: '8px', justifyContent: 'flex-end' },
      ],
    ] as const)('anchorOrigin %j positions the fixed root at %j (default bottom/left)', (anchorOrigin, expected) => {
      render(<Snackbar open message="Hi" anchorOrigin={anchorOrigin} />);

      const style = getComputedStyle(getRoot()!);
      expect(style.position).toBe('fixed');
      expect({ top: style.top, bottom: style.bottom, justifyContent: style.justifyContent }).toEqual(expected);
    });

    it('forwards className, data-* props and ref to the MUI root', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Snackbar open message="Hi" className="consumer" data-testid="snack" ref={ref} />);

      const root = screen.getByTestId('snack');
      expect(root).toBe(getRoot());
      expect(root.classList.contains('consumer')).toBe(true);
      expect(ref.current).toBe(root);
    });

    it('ContentProps reach the SnackbarContent (removed in v9 -> slotProps.content)', () => {
      render(<Snackbar open message="Hi" ContentProps={{ className: 'content-x', 'aria-describedby': 'msg' }} />);

      const alert = screen.getByRole('alert');
      expect(alert.classList.contains('content-x')).toBe(true);
      expect(alert.getAttribute('aria-describedby')).toBe('msg');
    });
  });

  describe('onClose reasons', () => {
    it("autoHideDuration: calls onClose(null, 'timeout') after the duration", () => {
      const onClose = vi.fn();
      render(<Snackbar open message="Hi" autoHideDuration={3000} onClose={onClose} />);

      act(() => vi.advanceTimersByTime(2999));
      expect(onClose).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(1));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose.mock.calls[0]).toEqual([null, 'timeout']);
    });

    it('autoHideDuration: no timeout without autoHideDuration', () => {
      const onClose = vi.fn();
      render(<Snackbar open message="Hi" onClose={onClose} />);

      act(() => vi.advanceTimersByTime(60_000));

      expect(onClose).not.toHaveBeenCalled();
    });

    it('autoHideDuration: hovering the snackbar pauses the timer, leaving resumes it (resumeHideDuration)', () => {
      const onClose = vi.fn();
      render(<Snackbar open message="Hi" autoHideDuration={3000} resumeHideDuration={500} onClose={onClose} />);

      act(() => vi.advanceTimersByTime(2000));
      fireEvent.mouseEnter(getRoot()!);
      act(() => vi.advanceTimersByTime(5000));
      expect(onClose).not.toHaveBeenCalled();

      fireEvent.mouseLeave(getRoot()!);
      act(() => vi.advanceTimersByTime(499));
      expect(onClose).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(1));
      expect(onClose.mock.calls[0]).toEqual([null, 'timeout']);
    });

    it('autoHideDuration: window blur pauses the timer, focus resumes it', () => {
      const onClose = vi.fn();
      render(<Snackbar open message="Hi" autoHideDuration={1000} onClose={onClose} />);

      act(() => {
        window.dispatchEvent(new Event('blur'));
      });
      act(() => vi.advanceTimersByTime(5000));
      expect(onClose).not.toHaveBeenCalled();

      act(() => {
        window.dispatchEvent(new Event('focus'));
      });
      act(() => vi.advanceTimersByTime(1000));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("Escape on the document calls onClose(event, 'escapeKeyDown')", () => {
      const onClose = vi.fn();
      render(<Snackbar open message="Hi" onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose.mock.calls[0][0].type).toBe('keydown');
      expect(onClose.mock.calls[0][1]).toBe('escapeKeyDown');
    });

    it("a click outside calls onClose(event, 'clickaway') once the listener is armed", () => {
      const onClose = vi.fn();
      render(
        <>
          <button>{'outside'}</button>
          <Snackbar open message="Hi" onClose={onClose} />
        </>,
      );
      armClickAway();

      fireEvent.click(screen.getByText('outside'));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose.mock.calls[0][0].type).toBe('click');
      expect(onClose.mock.calls[0][1]).toBe('clickaway');
    });

    it('a click inside the snackbar is not a clickaway', () => {
      const onClose = vi.fn();
      render(<Snackbar open message="Hi" onClose={onClose} />);
      armClickAway();

      fireEvent.click(screen.getByRole('alert'));

      expect(onClose).not.toHaveBeenCalled();
    });

    it('ClickAwayListenerProps.mouseEvent changes the clickaway trigger (removed in v9 -> slotProps.clickAwayListener)', () => {
      const onClose = vi.fn();
      render(
        <>
          <button>{'outside'}</button>
          <Snackbar open message="Hi" onClose={onClose} ClickAwayListenerProps={{ mouseEvent: 'onMouseDown' }} />
        </>,
      );
      armClickAway();

      fireEvent.click(screen.getByText('outside'));
      expect(onClose).not.toHaveBeenCalled();

      fireEvent.mouseDown(screen.getByText('outside'));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose.mock.calls[0][1]).toBe('clickaway');
    });

    it('[v5-quirk] ClickAwayListenerProps.onClickAway replaces the built-in handler, so onClose gets no clickaway', () => {
      // Baseline characterization: not a promised contract.
      const onClose = vi.fn();
      const onClickAway = vi.fn();
      render(
        <>
          <button>{'outside'}</button>
          <Snackbar open message="Hi" onClose={onClose} ClickAwayListenerProps={{ onClickAway }} />
        </>,
      );
      armClickAway();

      fireEvent.click(screen.getByText('outside'));

      expect(onClickAway).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('a closed snackbar ignores Escape', () => {
      const onClose = vi.fn();
      render(<Snackbar open={false} message="Hi" onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('transition', () => {
    it('default transition (Grow) settles untransformed, scales away on close and unmounts after exiting', () => {
      const { rerender } = render(<Snackbar open={false} message="Hi" />);

      rerender(<Snackbar open message="Hi" />);
      expect(getRoot()).not.toBeNull();
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByRole('alert').style.transform).toBe('none');
      expect(screen.getByRole('alert').style.opacity).toBe('1');

      rerender(<Snackbar open={false} message="Hi" />);
      // still mounted while exiting, shrinking
      expect(getRoot()).not.toBeNull();
      expect(screen.getByRole('alert').style.transform).toMatch(/^scale\(/);
      act(() => vi.advanceTimersByTime(1000));
      expect(getRoot()).toBeNull();
    });

    it('TransitionComponent + TransitionProps drive a custom Slide (removed in v9 -> slots/slotProps.transition)', () => {
      const SlideLeft = LintSlideLeft270;
      const onEntered = vi.fn();
      const onExited = vi.fn();
      const { rerender } = render(
        <Snackbar
          open={false}
          message="Hi"
          TransitionComponent={SlideLeft}
          TransitionProps={{ onEntered, onExited }}
        />,
      );

      rerender(
        <Snackbar open message="Hi" TransitionComponent={SlideLeft} TransitionProps={{ onEntered, onExited }} />,
      );
      const content = screen.getByRole('alert');
      // Slide is entering: MUI sets transform none and a transform transition
      expect(content.style.transform).toBe('none');
      expect(content.style.transition).toContain('transform');
      act(() => vi.advanceTimersByTime(1000));
      expect(onEntered).toHaveBeenCalledTimes(1);

      rerender(
        <Snackbar
          open={false}
          message="Hi"
          TransitionComponent={SlideLeft}
          TransitionProps={{ onEntered, onExited }}
        />,
      );
      // Leaving: Slide writes a translateX() offset (the px value is NaN in jsdom, real value in the story)
      expect(screen.getByRole('alert').style.transform.startsWith('translateX(')).toBe(true);
      act(() => vi.advanceTimersByTime(1000));
      expect(onExited).toHaveBeenCalledTimes(1);
      expect(getRoot()).toBeNull();
    });
  });
});
