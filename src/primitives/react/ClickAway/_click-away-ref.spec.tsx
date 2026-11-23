import { ClickAwayListener } from '@mui/material';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultLayerStack } from '../../core/layer-stack';
import { ClickAway } from './ClickAway';

/**
 * Codex review, handoff 17: the child's ref goes through one stable callback (MUI useForkRef) that keeps a React 19
 * ref cleanup; `ignoreHigherLayers={false}` restores MUI's plain behaviour for events inside a higher layer.
 */
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('ClickAway refs and layers', () => {
  it('a stable child callback ref with a cleanup: attached once, cleaned up once across re-renders (as MUI)', () => {
    const go = (impl: 'mui' | 'own') => {
      const L = (impl === 'mui' ? ClickAwayListener : ClickAway) as React.ElementType;
      const log: string[] = [];
      const ref = (node: HTMLElement | null) => {
        log.push(node ? 'attach' : 'null');
        return () => {
          log.push('cleanup');
        };
      };
      const tree = (label: string) => (
        <L onClickAway={() => undefined}>
          <div ref={ref}>{label}</div>
        </L>
      );
      const view = render(tree('one'));
      view.rerender(tree('two'));
      view.rerender(tree('three'));
      view.unmount();
      return log;
    };
    expect(go('own')).toEqual(go('mui'));
  });

  it('clears an object ref before attaching its replacement callback and calls that callback with null on unmount', () => {
    const objectRef = React.createRef<HTMLDivElement>();
    const callbackRef = vi.fn<(node: HTMLDivElement | null) => void>(() => {
      expect(objectRef.current).toBeNull();
    });
    const tree = (ref: React.Ref<HTMLDivElement>) => (
      <ClickAway onClickAway={() => undefined}>
        <div ref={ref}>{'child'}</div>
      </ClickAway>
    );
    const view = render(tree(objectRef));
    const child = view.getByText('child');
    expect(objectRef.current).toBe(child);

    view.rerender(tree(callbackRef));
    expect(view.getByText('child')).toBe(child);
    expect(callbackRef.mock.calls).toEqual([[child]]);

    view.unmount();
    expect(callbackRef.mock.calls).toEqual([[child], [null]]);
  });

  it('ignoreHigherLayers={false}: a click inside a layer opened from inside is a click-away (MUI)', () => {
    vi.useFakeTimers();
    const seen: Record<string, number> = { mui: 0, own: 0, ownDefault: 0 };
    const run = (key: string, el: (onAway: () => void) => React.ReactElement) => {
      const view = render(el(() => seen[key]++));
      act(() => {
        vi.advanceTimersByTime(10);
      });
      const origin = document.querySelector('[data-origin]') as HTMLElement;
      const modal = document.createElement('div');
      document.body.appendChild(modal);
      const layer = defaultLayerStack.push(() => modal, origin);
      fireEvent.click(modal);
      defaultLayerStack.remove(layer);
      view.unmount();
      modal.remove();
    };
    const child = (
      <div>
        {
          <button type="button" data-origin="">
            {'x'}
          </button>
        }
      </div>
    );
    run('mui', (f) => <ClickAwayListener onClickAway={f}>{child}</ClickAwayListener>);
    run('own', (f) => (
      <ClickAway onClickAway={f} ignoreHigherLayers={false}>
        {child}
      </ClickAway>
    ));
    run('ownDefault', (f) => <ClickAway onClickAway={f}>{child}</ClickAway>);
    expect(seen).toEqual({ mui: 1, own: 1, ownDefault: 0 });
  });
});
