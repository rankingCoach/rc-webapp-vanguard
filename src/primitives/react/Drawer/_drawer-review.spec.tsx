import MuiDrawer from '@mui/material/Drawer';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Drawer as OwnDrawer } from './Drawer';

/**
 * Codex review, handoff 16: observable divergences of the own Drawer (+ ModalHost) from MUI 9.5 Drawer. Each case
 * runs the same timeline on MUI's Drawer and on the own one and compares what a consumer sees.
 */
type Impl = 'mui' | 'own';
const C = (impl: Impl) => (impl === 'mui' ? MuiDrawer : OwnDrawer) as React.ElementType;

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
});

const bodyState = () => ({
  modalRoots: document.querySelectorAll('.MuiModal-root').length,
  overflow: document.body.style.overflow,
  hiddenSiblings: Array.from(document.body.children).filter((c) => c.getAttribute('aria-hidden') === 'true').length,
});

describe('own Drawer equals MUI (review cases)', () => {
  it('variant switched from permanent (open) to temporary (closed) leaves no modal, lock or aria-hidden', () => {
    const go = (impl: Impl) => {
      const D = C(impl);
      const view = render(
        <D variant="permanent" open>
          {'x'}
        </D>,
      );
      view.rerender(
        <D variant="temporary" open={false}>
          {'x'}
        </D>,
      );
      const state = bodyState();
      view.unmount();
      return state;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('closing the lower of two temporary drawers keeps the upper one on top (aria, Escape)', () => {
    vi.useFakeTimers();
    const go = (impl: Impl) => {
      const D = C(impl);
      const closeB = vi.fn();
      const tree = (aOpen: boolean) => (
        <>
          <D
            open={aOpen}
            transitionDuration={400}
            PaperProps={{ 'data-testid': 'a' }}
            slotProps={{ paper: { 'data-testid': 'a' } }}
          >
            {'a'}
          </D>
          <D
            open
            transitionDuration={400}
            onClose={closeB}
            slotProps={{ paper: { 'data-testid': 'b' } }}
            PaperProps={{ 'data-testid': 'b' }}
          >
            {'b'}
          </D>
        </>
      );
      const view = render(tree(true));
      act(() => {
        vi.advanceTimersByTime(500);
      });
      view.rerender(tree(false));
      act(() => {
        vi.advanceTimersByTime(100);
      });
      const bRoot = (document.querySelector('[data-testid="b"]') as HTMLElement).parentElement as HTMLElement;
      const bHidden = bRoot.getAttribute('aria-hidden');
      fireEvent.keyDown(bRoot, { key: 'Escape' });
      const calls = closeB.mock.calls.map((c) => c[1]);
      act(() => {
        vi.advanceTimersByTime(500);
      });
      view.unmount();
      return { bHidden, calls };
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('server render of an open temporary drawer does not throw and renders nothing', () => {
    const go = (impl: Impl) => {
      const D = C(impl);
      const original = globalThis.document;
      // react-dom/server under jsdom: hide the document like a server.
      vi.stubGlobal('document', undefined);
      try {
        return renderToString(
          <D variant="temporary" open>
            {'x'}
          </D>,
        );
      } catch (e) {
        return `threw: ${(e as Error).message}`;
      } finally {
        vi.stubGlobal('document', original);
      }
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('Escape: IME composition (which 229) ignored, preventDefault from a child does not suppress, root onKeyDown composed', () => {
    const go = (impl: Impl) => {
      const D = C(impl);
      const onClose = vi.fn();
      const onKeyDown = vi.fn();
      const view = render(
        <D open onClose={onClose} onKeyDown={onKeyDown}>
          <input data-testid="field" onKeyDown={(e: React.KeyboardEvent) => e.preventDefault()} />
        </D>,
      );
      const field = document.querySelector('[data-testid="field"]') as HTMLElement;
      fireEvent.keyDown(field, { key: 'Escape', which: 229, keyCode: 229 });
      const afterIme = onClose.mock.calls.length;
      fireEvent.keyDown(field, { key: 'Escape' });
      const result = { afterIme, total: onClose.mock.calls.length, listener: onKeyDown.mock.calls.length };
      view.unmount();
      return result;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('Tab wrap from the end sentinel skips tabindex=-1 elements', () => {
    const go = (impl: Impl) => {
      const D = C(impl);
      const view = render(
        <D open>
          <button type="button" tabIndex={-1}>
            {'skip'}
          </button>
          <button type="button">{'first'}</button>
        </D>,
      );
      const sentinels = document.querySelectorAll<HTMLElement>('[data-testid="sentinelEnd"]');
      act(() => {
        (document.querySelector('[data-testid="sentinelStart"]')?.nextElementSibling as HTMLElement)?.focus();
      });
      act(() => {
        sentinels[sentinels.length - 1].focus();
      });
      const text = document.activeElement?.textContent;
      view.unmount();
      return text;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('React 19 callback ref on a temporary drawer: root attached once, cleanup on unmount', () => {
    const go = (impl: Impl) => {
      const D = C(impl);
      const log: string[] = [];
      const ref = (node: HTMLElement | null) => {
        log.push(node ? `attach:${node.classList.contains('MuiDrawer-root')}` : 'null');
        return () => {
          log.push('cleanup');
        };
      };
      const view = render(
        <D ref={ref} open>
          {'x'}
        </D>,
      );
      view.unmount();
      return log;
    };
    // MUI's two-phase Portal attaches the root twice (its mount node is set in an effect, then the ref changes);
    // the contract both keep is attach(root) / cleanup pairs, with a final cleanup and never a null call.
    const mui = go('mui');
    expect(mui.length % 2).toBe(0);
    for (let i = 0; i < mui.length; i += 2) expect(mui.slice(i, i + 2)).toEqual(['attach:true', 'cleanup']);
    expect(go('own')).toEqual(['attach:true', 'cleanup']);
  });
});
