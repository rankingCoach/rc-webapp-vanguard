import { ClickAwayListener } from '@mui/material';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { createPortal } from 'react-dom';
import { describe, expect, it, vi } from 'vitest';
import { ClickAway } from './ClickAway';

/**
 * Differential parity: MUI 9.5 ClickAwayListener vs the own ClickAway on the same event sequences (jsdom).
 * Each scenario counts onClickAway calls; both implementations must agree.
 */
type Impl = typeof ClickAwayListener | typeof ClickAway;
type Opts = {
  disableReactTree?: boolean;
  mouseEvent?: 'onClick' | 'onMouseDown' | false;
  touchEvent?: 'onTouchEnd' | false;
};

const Harness = ({ Impl, onAway, opts }: { Impl: Impl; onAway: () => void; opts: Opts }) => (
  <div>
    <button type="button" data-testid="outside">
      {'outside'}
    </button>
    <Impl onClickAway={onAway} {...(opts as object)}>
      <div data-testid="inside">
        <span data-testid="inner">{'inner'}</span>
        {createPortal(<span data-testid="portal">{'portal'}</span>, document.body)}
      </div>
    </Impl>
  </div>
);

const scenarios: { name: string; opts?: Opts; run: (q: (id: string) => HTMLElement) => void }[] = [
  { name: 'click outside', run: (q) => fireEvent.click(q('outside')) },
  { name: 'click inside', run: (q) => fireEvent.click(q('inner')) },
  { name: 'click on a portal child (React tree)', run: (q) => fireEvent.click(q('portal')) },
  {
    name: 'portal child with disableReactTree',
    opts: { disableReactTree: true },
    run: (q) => fireEvent.click(q('portal')),
  },
  {
    name: 'mousedown outside with mouseEvent onMouseDown',
    opts: { mouseEvent: 'onMouseDown' },
    run: (q) => fireEvent.mouseDown(q('outside')),
  },
  {
    name: 'click outside with mouseEvent false',
    opts: { mouseEvent: false },
    run: (q) => fireEvent.click(q('outside')),
  },
  { name: 'touch tap outside', run: (q) => fireEvent.touchEnd(q('outside')) },
  {
    name: 'touch scroll then touchend outside',
    run: (q) => {
      fireEvent.touchMove(document);
      fireEvent.touchEnd(q('outside'));
    },
  },
  { name: 'click on the root scrollbar', run: () => fireEvent.click(document.body, { clientX: 99999, clientY: 1 }) },
];

const count = async (Impl: Impl, s: (typeof scenarios)[number], activate: boolean) => {
  const onAway = vi.fn();
  const view = render(<Harness Impl={Impl} onAway={onAway} opts={s.opts ?? {}} />);
  if (activate) await act(async () => new Promise((r) => setTimeout(r, 1)));
  s.run((id) => view.getAllByTestId(id)[0]);
  const calls = onAway.mock.calls.length;
  view.unmount();
  return calls;
};

describe('ClickAway parity with MUI ClickAwayListener', () => {
  // MUI's counts, pinned so the comparison cannot pass as 0 = 0.
  const expected: Record<string, number> = {
    'click outside': 1,
    'click inside': 0,
    'click on a portal child (React tree)': 0,
    'portal child with disableReactTree': 1,
    'mousedown outside with mouseEvent onMouseDown': 1,
    'click outside with mouseEvent false': 0,
    'touch tap outside': 1,
    'touch scroll then touchend outside': 0,
    'click on the root scrollbar': 0,
  };
  it.each(scenarios)('$name', async (s) => {
    const mui = await count(ClickAwayListener, s, true);
    expect(mui).toBe(expected[s.name]);
    expect(await count(ClickAway, s, true)).toBe(mui);
  });

  it.each(scenarios)('$name, before activation (the opening event)', async (s) => {
    expect(await count(ClickAway, s, false)).toBe(await count(ClickAwayListener, s, false));
  });
});

describe('ClickAway layer rule (not in MUI)', () => {
  it('a click inside a layer opened from inside the host is not a click away', async () => {
    const onAway = vi.fn();
    const { defaultLayerStack } = await import('../../core/layer-stack');
    const view = render(<Harness Impl={ClickAway} onAway={onAway} opts={{}} />);
    await act(async () => new Promise((r) => setTimeout(r, 1)));
    const layer = document.createElement('div');
    document.body.appendChild(layer);
    const token = defaultLayerStack.push(() => layer, view.getAllByTestId('inner')[0]);
    fireEvent.click(layer);
    expect(onAway).not.toHaveBeenCalled();
    defaultLayerStack.remove(token);
    fireEvent.click(layer);
    expect(onAway).toHaveBeenCalledTimes(1);
    layer.remove();
    view.unmount();
  });
});

describe('two independent hosts (review finding: layer rule too broad)', () => {
  it('a click inside the newer host is a click away for the older one, like MUI', async () => {
    const go = async (Impl: Impl) => {
      const older = vi.fn();
      const newer = vi.fn();
      const view = render(
        <div>
          <Impl onClickAway={older}>
            <div data-testid="older">{'older'}</div>
          </Impl>
        </div>,
      );
      await act(async () => new Promise((r) => setTimeout(r, 1)));
      view.rerender(
        <div>
          <Impl onClickAway={older}>
            <div data-testid="older">{'older'}</div>
          </Impl>
          <Impl onClickAway={newer}>
            <div data-testid="newer">{'newer'}</div>
          </Impl>
        </div>,
      );
      await act(async () => new Promise((r) => setTimeout(r, 1)));
      fireEvent.click(view.getByTestId('newer'));
      view.unmount();
      return { older: older.mock.calls.length, newer: newer.mock.calls.length };
    };
    const mui = await go(ClickAwayListener);
    expect(mui).toEqual({ older: 1, newer: 0 });
    expect(await go(ClickAway)).toEqual(mui);
  });
});

describe('ClickAway layer rule: origin outside the host', () => {
  it('a layer opened from outside the host does not shield it', async () => {
    const onAway = vi.fn();
    const { defaultLayerStack } = await import('../../core/layer-stack');
    const view = render(<Harness Impl={ClickAway} onAway={onAway} opts={{}} />);
    await act(async () => new Promise((r) => setTimeout(r, 1)));
    const layer = document.createElement('div');
    document.body.appendChild(layer);
    const token = defaultLayerStack.push(() => layer, view.getAllByTestId('outside')[0]);
    fireEvent.click(layer);
    expect(onAway).toHaveBeenCalledTimes(1);
    defaultLayerStack.remove(token);
    layer.remove();
    view.unmount();
  });
});
