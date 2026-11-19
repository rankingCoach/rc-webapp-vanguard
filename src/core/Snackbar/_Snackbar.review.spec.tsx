import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultLayerStack } from '../../primitives/core/layer-stack';
import { SnackbarMuiReference } from './_Snackbar.mui-reference';
import { Snackbar } from './Snackbar';

/**
 * Codex review, handoff 17: observable divergences of the own Snackbar from the frozen MUI implementation. Each case
 * runs the same timeline on both and compares what a consumer sees.
 */
type Impl = 'mui' | 'own';
const C = (impl: Impl) => (impl === 'mui' ? SnackbarMuiReference : Snackbar) as React.ElementType;

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('own Snackbar equals MUI (review cases)', () => {
  it('a stable callback ref with a cleanup: attached once, cleaned up once, across re-renders', () => {
    const go = (impl: Impl) => {
      const D = C(impl);
      const log: string[] = [];
      const ref = (node: HTMLElement | null) => {
        log.push(node ? `attach:${node.classList.contains('MuiSnackbar-root')}` : 'null');
        return () => {
          log.push('cleanup');
        };
      };
      const view = render(<D ref={ref} open message="One" />);
      view.rerender(<D ref={ref} open message="Two" />);
      view.rerender(<D ref={ref} open message="Three" />);
      view.unmount();
      return log;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('onClose supplied after opening still receives the auto-hide timeout', () => {
    const go = (impl: Impl) => {
      vi.useFakeTimers();
      const D = C(impl);
      const onClose = vi.fn();
      const view = render(<D open autoHideDuration={1000} message="Saved" />);
      act(() => {
        vi.advanceTimersByTime(500);
      });
      view.rerender(<D open autoHideDuration={1000} message="Saved" onClose={onClose} />);
      act(() => {
        vi.advanceTimersByTime(600);
      });
      const reasons = onClose.mock.calls.map((c) => c[1]);
      view.unmount();
      vi.useRealTimers();
      return reasons;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('a click inside a layer opened from the snackbar (e.g. a modal from its action) is a click-away', () => {
    const go = (impl: Impl) => {
      vi.useFakeTimers();
      const D = C(impl);
      const onClose = vi.fn();
      const view = render(
        <D open onClose={onClose} action={<button type="button">{'More'}</button>} message="Saved" />,
      );
      act(() => {
        vi.advanceTimersByTime(10);
      });
      const action = document.querySelector('.MuiSnackbarContent-action button') as HTMLElement;
      const modal = document.createElement('div');
      document.body.appendChild(modal);
      const layer = defaultLayerStack.push(() => modal, action);
      fireEvent.click(modal);
      defaultLayerStack.remove(layer);
      const reasons = onClose.mock.calls.map((c) => c[1]);
      view.unmount();
      vi.useRealTimers();
      return reasons;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('an explicit data-slot on the root is kept', () => {
    const go = (impl: Impl) => {
      const D = C(impl);
      const view = render(<D open data-slot="toast" message="Saved" />);
      const value = document.querySelector('.MuiSnackbar-root')?.getAttribute('data-slot');
      view.unmount();
      return value;
    };
    expect(go('own')).toEqual(go('mui'));
  });
});
