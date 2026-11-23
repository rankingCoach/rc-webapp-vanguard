import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render } from '../../../test-utils/test-utils';
import { SnackbarMuiReference } from './_Snackbar.mui-reference';
import { Snackbar } from './Snackbar';

// Record<never, never> expresses the frozen empty object type without the banned literal.
type PreviousSnackbarRootProps = Record<never, never>;
type FrozenSnackbarRootProps = React.ComponentProps<
  typeof import('../SnackbarRoot/_SnackbarRoot.mui-reference').SnackbarRootMuiReference
>;
type AssertDomain<T extends true> = T;
type SnackbarRootPropsDomain = [
  AssertDomain<[PreviousSnackbarRootProps] extends [FrozenSnackbarRootProps] ? true : false>,
  AssertDomain<[FrozenSnackbarRootProps] extends [PreviousSnackbarRootProps] ? true : false>,
];

/**
 * Differential parity, jsdom: Vanguard Snackbar / SnackbarRoot on the own core vs the frozen MUI 9.5 implementation.
 * Same props and timeline (open → enter transition → auto-hide timer, hover / focus / window-blur pause and resume,
 * Escape, click-away, exit) → same document and onClose calls. Canonical form: emotion classes, own-core markers and
 * attribute / style / class order normalised; values and structure must match.
 */
type Impl = 'mui' | 'own';

const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ ?\bvg-z-n?\d+/g, '')
    .replace(/ class=""/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="[^"]*"/g, '')
    .replace(/ data-(open|anchor-vertical|anchor-horizontal)="[^"]*"/g, '')
    .replace(/ data-(open|disabled|selected|focus-visible|highlighted|checked|pressed|focused|filled)=""/g, '')
    .replace(/ vg-typography-vanguard/g, '')
    .replace(/ (id|aria-labelledby|aria-controls|aria-describedby)="[^"]*"/g, ' $1="ID"');

const canonical = (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  for (const el of Array.from(host.querySelectorAll('*'))) {
    const attrs = Array.from(el.attributes).map((a) => [a.name, a.value] as const);
    for (const [name] of attrs) el.removeAttribute(name);
    for (const [name, value] of attrs.sort(([x], [y]) => x.localeCompare(y))) {
      let v = value;
      if (name === 'class') v = value.split(/\s+/).filter(Boolean).sort().join(' ');
      if (name === 'style')
        v = value
          .split(';')
          .map((d) => d.trim())
          .filter(Boolean)
          .sort()
          .join('; ');
      el.setAttribute(name, v);
    }
  }
  return host.innerHTML;
};

// Body state belongs to every overlay differential (H16): the body's own inline style (scroll lock, scrollbar gap)
// next to its children (sibling aria-hidden is in the markup).
const snapshot = () =>
  `<body style="${document.body.getAttribute('style') ?? ''}">${canonical(normalize(document.body.innerHTML))}`;

type Step =
  | ['open']
  | ['close']
  | ['advance', number]
  | ['escape']
  | ['clickaway']
  | ['enter']
  | ['leave']
  | ['focus']
  | ['blur']
  | ['windowBlur']
  | ['windowFocus'];

const runSteps = (steps: Step[], rerender: (open: boolean) => void, log: string[]) => {
  const trace: { html: string; log: string[] }[] = [{ html: snapshot(), log: log.splice(0) }];
  for (const step of steps) {
    const root = document.querySelector('.MuiSnackbar-root') as HTMLElement | null;
    if (step[0] === 'open' || step[0] === 'close') rerender(step[0] === 'open');
    if (step[0] === 'advance')
      act(() => {
        vi.advanceTimersByTime(step[1]);
      });
    if (step[0] === 'escape') fireEvent.keyDown(document, { key: 'Escape' });
    if (step[0] === 'clickaway') {
      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);
      fireEvent.click(document.body);
    }
    if (step[0] === 'enter' && root) fireEvent.mouseEnter(root);
    if (step[0] === 'leave' && root) fireEvent.mouseLeave(root);
    if (step[0] === 'focus' && root) fireEvent.focus(root);
    if (step[0] === 'blur' && root) fireEvent.blur(root);
    if (step[0] === 'windowBlur') act(() => void window.dispatchEvent(new Event('blur')));
    if (step[0] === 'windowFocus') act(() => void window.dispatchEvent(new Event('focus')));
    trace.push({ html: snapshot(), log: log.splice(0) });
  }
  return trace;
};

const goSnackbar = (impl: Impl, props: Record<string, unknown>, steps: Step[], children = true) => {
  vi.useFakeTimers();
  const log: string[] = [];
  const C = (impl === 'mui' ? SnackbarMuiReference : Snackbar) as React.ElementType;
  const tree = (open: boolean) => (
    <C open={open} onClose={(_e: unknown, reason: string) => log.push(`close:${reason}`)} {...props}>
      {children ? <div className="content">{'Saved'}</div> : undefined}
    </C>
  );
  const view = render(tree(false));
  const trace = runSteps(steps, (open) => view.rerender(tree(open)), log);
  view.unmount();
  view.container.remove();
  return trace;
};

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

const OPEN_TIMER: Step[] = [['open'], ['advance', 300], ['advance', 2800], ['close'], ['advance', 300]];

describe('Snackbar own core equals MUI', () => {
  const cases: [string, Record<string, unknown>, Step[], boolean?][] = [
    ['default Grow, auto-hide timeout', { autoHideDuration: 3000 }, OPEN_TIMER],
    ['no autoHideDuration: never times out', {}, [['open'], ['advance', 10000], ['close'], ['advance', 300]]],
    [
      'hover pauses, leave resumes at half',
      { autoHideDuration: 3000 },
      [['open'], ['advance', 1000], ['enter'], ['advance', 5000], ['leave'], ['advance', 1400], ['advance', 200]],
    ],
    [
      'focus pauses, blur resumes with resumeHideDuration',
      { autoHideDuration: 3000, resumeHideDuration: 500 },
      [['open'], ['focus'], ['advance', 5000], ['blur'], ['advance', 400], ['advance', 200]],
    ],
    [
      'window blur pauses, window focus resumes',
      { autoHideDuration: 3000 },
      [['open'], ['advance', 500], ['windowBlur'], ['advance', 5000], ['windowFocus'], ['advance', 1600]],
    ],
    [
      'disableWindowBlurListener',
      { autoHideDuration: 3000, disableWindowBlurListener: true },
      [['open'], ['advance', 500], ['windowBlur'], ['advance', 2600]],
    ],
    ['Escape closes with escapeKeyDown', {}, [['open'], ['advance', 300], ['escape']]],
    ['click-away closes with clickaway', {}, [['open'], ['advance', 300], ['clickaway']]],
    [
      'anchorOrigin top right',
      { anchorOrigin: { vertical: 'top', horizontal: 'right' }, autoHideDuration: 3000 },
      OPEN_TIMER,
    ],
    [
      'anchorOrigin bottom center',
      { anchorOrigin: { vertical: 'bottom', horizontal: 'center' } },
      [['open'], ['advance', 300]],
    ],
    [
      'message + action (SnackbarContent)',
      { message: 'Hello', action: <button type="button">{'Undo'}</button> },
      [['open'], ['advance', 300], ['close'], ['advance', 300]],
      false,
    ],
    [
      'className and transitionDuration',
      { className: 'extra', transitionDuration: 100 },
      [['open'], ['advance', 50], ['advance', 100], ['close'], ['advance', 50], ['advance', 100]],
    ],
  ];
  for (const [name, props, steps, children] of cases) {
    it(name, () => {
      expect(goSnackbar('own', props, steps, children ?? true)).toEqual(
        goSnackbar('mui', props, steps, children ?? true),
      );
    });
  }
});

describe('SnackbarRoot (snackbarService) own core equals MUI', () => {
  type Service = typeof import('../SnackbarRoot/SnackBarService')['snackbarService'];
  // pub-sub is a module singleton of ReplaySubjects (a new subscriber replays past events): fresh modules per run.
  const goRoot = async (impl: Impl, script: (step: (fn?: () => void) => void, service: Service) => void) => {
    vi.resetModules();
    vi.useFakeTimers();
    const { snackbarService } = await import('../SnackbarRoot/SnackBarService');
    const R =
      impl === 'mui'
        ? (await import('../SnackbarRoot/_SnackbarRoot.mui-reference')).SnackbarRootMuiReference
        : (await import('../SnackbarRoot/SnackbarRoot')).SnackbarRoot;
    const view = render(<R />);
    const trace: string[] = [];
    const step = (fn?: () => void) => {
      act(() => {
        fn?.();
      });
      trace.push(snapshot());
    };
    script(step, snackbarService);
    view.unmount();
    view.container.remove();
    return trace;
  };

  it('service open → slide in → auto-hide (3000) → onClose → exit', async () => {
    const calls: Record<Impl, number> = { mui: 0, own: 0 };
    const script = (impl: Impl) => (step: (fn?: () => void) => void, service: Service) => {
      step(() => service.openSuccessSnackbar('Copied to clipboard', () => calls[impl]++));
      step(() => vi.advanceTimersByTime(0));
      step(() => vi.advanceTimersByTime(300));
      step(() => vi.advanceTimersByTime(2800));
      step(() => vi.advanceTimersByTime(300));
      step();
    };
    const mui = await goRoot('mui', script('mui'));
    const own = await goRoot('own', script('own'));
    expect(own).toEqual(mui);
    expect(calls.own).toBe(calls.mui);
  });

  it('a second snackbar while one is open replaces it (close, reopen)', async () => {
    const script = (step: (fn?: () => void) => void, service: Service) => {
      step(() => service.openSuccessSnackbar('First'));
      step(() => vi.advanceTimersByTime(500));
      step(() => service.openErrorSnackbar('Second'));
      step(() => vi.advanceTimersByTime(0));
      step(() => vi.advanceTimersByTime(300));
      step(() => vi.advanceTimersByTime(3500));
    };
    expect(await goRoot('own', script)).toEqual(await goRoot('mui', script));
  });

  it('service close event closes the open snackbar', async () => {
    const script = (step: (fn?: () => void) => void, service: Service) => {
      step(() => service.openWarningSnackbar('Careful'));
      step(() => vi.advanceTimersByTime(300));
      step(() => service.closeEv('x'));
      step(() => vi.advanceTimersByTime(300));
    };
    expect(await goRoot('own', script)).toEqual(await goRoot('mui', script));
  });
});
