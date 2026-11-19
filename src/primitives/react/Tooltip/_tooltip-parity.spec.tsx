import { Tooltip as MuiTooltip } from '@mui/material';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from './Tooltip';

/**
 * Differential parity, jsdom: MUI 9.5 Tooltip in controlled mode (the only way Vanguard uses it: Popover) vs the own
 * Tooltip. Same props → same DOM (trigger attributes, portaled popper / tooltip / arrow classes and inline styles),
 * same body style during touch, same callbacks reaching the trigger.
 */
type Impl = typeof MuiTooltip | typeof Tooltip;

const normalize = (html: string) =>
  html
    .replace(/(id|aria-labelledby|aria-describedby)="[^"]*"/g, '$1="ID"')
    .replace(/ data-mui-internal-clone-element="true"/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="[^"]*"/g, '')
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ class=""/g, '');

const flush = () =>
  act(async () => {
    await Promise.resolve();
    vi.advanceTimersByTime(0);
  });

const snapshot = () => ({
  body: normalize(document.body.innerHTML),
  userSelect: (document.body.style as unknown as { WebkitUserSelect?: string }).WebkitUserSelect,
});

const Title = () => (
  <>
    <b>{'Title'}</b>
    <i>{'message'}</i>
  </>
);

type Case = { name: string; props: Record<string, unknown>; child?: 'span' | 'button' };

const CASES: Case[] = [
  { name: 'closed, node title', props: { open: false, title: <Title />, arrow: true, placement: 'top' } },
  { name: 'open, node title, arrow, top', props: { open: true, title: <Title />, arrow: true, placement: 'top' } },
  { name: 'open, no arrow, bottom', props: { open: true, title: <Title />, arrow: false, placement: 'bottom' } },
  { name: 'open, right-start', props: { open: true, title: <Title />, arrow: true, placement: 'right-start' } },
  { name: 'open, string title', props: { open: true, title: 'Plain', arrow: true, placement: 'top' } },
  { name: 'closed, string title', props: { open: false, title: 'Plain', placement: 'top' } },
  {
    name: 'open, describeChild',
    props: { open: true, title: <Title />, describeChild: true, arrow: true, placement: 'left' },
  },
  {
    name: 'open, interactive',
    props: { open: true, title: <Title />, disableInteractive: false, arrow: true, placement: 'top' },
  },
  {
    name: 'open, non-interactive',
    props: { open: true, title: <Title />, disableInteractive: true, arrow: true, placement: 'top' },
  },
  {
    name: 'open, classes',
    props: {
      open: true,
      title: <Title />,
      arrow: true,
      placement: 'top',
      classes: { popper: 'p-x', tooltip: 't-x', arrow: 'a-x' },
    },
  },
  {
    name: 'open, Popover slotProps (max width, z-index, class, placement, fixed)',
    props: {
      open: true,
      title: <Title />,
      arrow: true,
      placement: 'top',
      disableInteractive: true,
      slotProps: {
        tooltip: { style: { maxWidth: 240 } },
        popper: {
          style: { maxWidth: 240, zIndex: 1500 },
          className: 'vanguard-popover MuiTooltip-popper-dark',
          placement: 'top',
          popperOptions: { strategy: 'fixed', modifiers: [{ name: 'computeStyles', options: { adaptive: false } }] },
        },
      },
    },
  },
  { name: 'open, empty title stays closed', props: { open: true, title: '', placement: 'top' } },
];

const mount = (Impl: Impl, c: Case, extra: Record<string, unknown> = {}) =>
  render(
    <Impl {...(c.props as object)} {...extra}>
      {c.child === 'button' ? <button type="button">{'trigger'}</button> : <span>{'trigger'}</span>}
    </Impl>,
  );

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  (document.body.style as unknown as { WebkitUserSelect?: string }).WebkitUserSelect = undefined;
});

describe('own Tooltip equals MUI Tooltip (controlled)', () => {
  it.each(CASES)('$name: DOM', async (c) => {
    const go = async (Impl: Impl) => {
      const view = mount(Impl, c);
      await flush();
      act(() => {
        vi.advanceTimersByTime(300);
      });
      const snap = snapshot();
      view.unmount();
      view.container.remove();
      return snap;
    };
    expect(await go(Tooltip)).toEqual(await go(MuiTooltip));
  });

  it('open → closed: exit transition then unmount, same DOM at each step', async () => {
    const go = async (Impl: Impl) => {
      const c = CASES[1];
      const steps: ReturnType<typeof snapshot>[] = [];
      const view = mount(Impl, c);
      await flush();
      act(() => {
        vi.advanceTimersByTime(300);
      });
      view.rerender(
        <Impl {...(c.props as object)} open={false}>
          <span>{'trigger'}</span>
        </Impl>,
      );
      steps.push(snapshot());
      act(() => {
        vi.advanceTimersByTime(100);
      });
      steps.push(snapshot());
      act(() => {
        vi.advanceTimersByTime(300);
      });
      steps.push(snapshot());
      view.unmount();
      view.container.remove();
      return steps;
    };
    expect(await go(Tooltip)).toEqual(await go(MuiTooltip));
  });

  it('trigger handlers passed as props reach the trigger (Popover onMouseEnter / onMouseLeave / onFocus / onBlur)', async () => {
    const go = async (Impl: Impl) => {
      const log: string[] = [];
      const on = (n: string) => () => log.push(n);
      const view = mount(Impl, CASES[0], {
        onMouseEnter: on('enter'),
        onMouseLeave: on('leave'),
        onFocus: on('focus'),
        onBlur: on('blur'),
      });
      const trigger = view.getByText('trigger');
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseOver(trigger);
      fireEvent.mouseLeave(trigger);
      fireEvent.focus(trigger);
      fireEvent.blur(trigger);
      fireEvent.keyDown(document, { key: 'Escape' });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      view.unmount();
      view.container.remove();
      return log;
    };
    expect(await go(Tooltip)).toEqual(await go(MuiTooltip));
  });

  it('touch: body user-select during the long-press window, the touch class on an open tooltip', async () => {
    const go = async (Impl: Impl) => {
      // Each run starts from a body without the vendor property (the previous run's leftovers would be restored).
      (document.body.style as unknown as { WebkitUserSelect?: string }).WebkitUserSelect = undefined;
      const trace: ReturnType<typeof snapshot>[] = [];
      const view = mount(Impl, CASES[1]);
      await flush();
      const trigger = view.getByText('trigger');
      fireEvent.touchStart(trigger);
      trace.push(snapshot());
      act(() => {
        vi.advanceTimersByTime(800);
      });
      trace.push(snapshot());
      fireEvent.touchStart(trigger);
      fireEvent.touchEnd(trigger);
      trace.push(snapshot());
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      trace.push(snapshot());
      view.unmount();
      view.container.remove();
      trace.push(snapshot());
      return trace;
    };
    expect(await go(Tooltip)).toEqual(await go(MuiTooltip));
  });

  // Codex review (Popover handoff): MUI behaviours reachable through Popover or a direct controlled Tooltip.
  it('child callback ref: attached once, React 19 cleanup called once on unmount', async () => {
    const go = async (Impl: Impl) => {
      const calls: string[] = [];
      const ref = (node: HTMLElement | null) => {
        calls.push(node ? 'attach' : 'null');
        return () => calls.push('cleanup');
      };
      const tree = (open: boolean) => (
        <Impl open={open} title={<Title />}>
          <span ref={ref}>{'trigger'}</span>
        </Impl>
      );
      const view = render(tree(false));
      await flush();
      view.rerender(tree(true));
      await flush();
      view.rerender(tree(false));
      act(() => {
        vi.advanceTimersByTime(300);
      });
      view.unmount();
      view.container.remove();
      return calls;
    };
    expect(await go(Tooltip)).toEqual(await go(MuiTooltip));
  });

  it('touch then a synthetic mouseover: the touch flag still resets (class on the next render)', async () => {
    const go = async (Impl: Impl) => {
      const c = CASES[1];
      const view = mount(Impl, c);
      await flush();
      const trigger = view.getByText('trigger');
      fireEvent.touchStart(trigger);
      fireEvent.touchEnd(trigger);
      fireEvent.mouseOver(trigger);
      act(() => {
        vi.advanceTimersByTime(1800);
      });
      view.rerender(
        <Impl {...(c.props as object)} title={<b>{'again'}</b>}>
          <span>{'trigger'}</span>
        </Impl>,
      );
      const snap = snapshot();
      view.unmount();
      view.container.remove();
      return snap;
    };
    expect(await go(Tooltip)).toEqual(await go(MuiTooltip));
  });

  it('Escape while open resets the touch flag', async () => {
    const go = async (Impl: Impl) => {
      const c = CASES[1];
      const view = mount(Impl, c);
      await flush();
      fireEvent.touchStart(view.getByText('trigger'));
      fireEvent.keyDown(document, { key: 'Escape' });
      act(() => {
        vi.advanceTimersByTime(800);
      });
      view.rerender(
        <Impl {...(c.props as object)} title={<b>{'again'}</b>}>
          <span>{'trigger'}</span>
        </Impl>,
      );
      const snap = snapshot();
      view.unmount();
      view.container.remove();
      return snap;
    };
    expect(await go(Tooltip)).toEqual(await go(MuiTooltip));
  });

  it('a long press removes a native title from the trigger', async () => {
    const go = async (Impl: Impl) => {
      const view = render(
        <Impl open={false} title="Tip" describeChild>
          <span title="native">{'trigger'}</span>
        </Impl>,
      );
      await flush();
      fireEvent.touchStart(view.getByText('trigger'));
      act(() => {
        vi.advanceTimersByTime(750);
      });
      const title = view.getByText('trigger').getAttribute('title');
      view.unmount();
      view.container.remove();
      return title;
    };
    expect(await go(Tooltip)).toEqual(await go(MuiTooltip));
  });

  it('className on the Tooltip merges onto the trigger', async () => {
    const go = async (Impl: Impl) => {
      const view = render(
        <Impl open={false} title="Tip" className="consumer-trigger">
          <span className="own">{'trigger'}</span>
        </Impl>,
      );
      const cls = view.getByText('trigger').className;
      view.unmount();
      view.container.remove();
      return cls;
    };
    expect(await go(Tooltip)).toEqual(await go(MuiTooltip));
  });
});
