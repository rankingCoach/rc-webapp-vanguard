import { act, cleanup, render, screen } from '@test-utils/test-utils';
import { ErrorModal } from '@vanguard/StandardModals/ErrorModal/ErrorModal';
import axios from 'axios';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { setVanguardErrorLogger } from './error-logger';
import { generateErrorBoundaryData } from './generate-error-boundary-data';
import { ErrorBoundary } from './RcErrorBoundry';

// jsdom has no canvas, which lottie-web needs at import (the package entries below pull it in)
vi.mock('lottie-web', () => ({ default: { loadAnimation: () => ({ destroy: () => {} }) } }));
vi.mock('lottie-web/build/player/lottie_light', () => ({ default: { loadAnimation: () => ({ destroy: () => {} }) } }));

/** Every way Vanguard could reach the network on its own: its bundled axios, and fetch. */
const watchNetwork = () => {
  const request = vi.spyOn(axios, 'request').mockImplementation(() => new Promise(() => {}));
  const fetchSpy = vi.fn(() => new Promise<Response>(() => {}));
  vi.stubGlobal('fetch', fetchSpy);
  return {
    request,
    calls: () => request.mock.calls.length + fetchSpy.mock.calls.length,
    urls: () => request.mock.calls.map(([opts]) => String((opts as { url?: string }).url)),
  };
};

const flush = () => act(async () => {});

describe('Vanguard error logging: the consumer’s logger, the built-in request deprecated (VAN-64)', () => {
  let network: ReturnType<typeof watchNetwork>;
  beforeEach(() => {
    network = watchNetwork();
  });
  afterEach(() => {
    setVanguardErrorLogger(null);
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('generateErrorBoundaryData', () => {
    test('with a logger it makes no request of its own', async () => {
      setVanguardErrorLogger(() => {});
      generateErrorBoundaryData('error_modal_logs', new Error('boom'), undefined, undefined, 'SRC');
      await flush();
      expect(network.calls()).toBe(0);
    });

    test('hands the log to the registered logger once, at the call, with the entry it used to PUT', () => {
      const logger = vi.fn();
      setVanguardErrorLogger(logger);
      const error = new Error('boom');
      const info = { componentStack: 'stack' };
      generateErrorBoundaryData('error_boundary_logs', error, info, undefined, 'SRC');
      expect(logger).toHaveBeenCalledTimes(1);
      expect(logger).toHaveBeenCalledWith(
        'error_boundary_logs',
        expect.objectContaining({
          info,
          error: 'Error',
          message: 'boom',
          href: window.location.href,
          host: window.location.host,
          pathname: window.location.pathname,
          source: 'SRC',
        }),
      );
    });

    test('still returns an Observable that emits once and completes; subscribing does not log again', async () => {
      const logger = vi.fn(() => ({ status: 200 }));
      setVanguardErrorLogger(logger);
      const next = vi.fn();
      const complete = vi.fn();
      const error = vi.fn();
      generateErrorBoundaryData('t', new Error('e')).subscribe({ next, complete, error });
      await flush();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({ status: 200 });
      expect(complete).toHaveBeenCalledTimes(1);
      expect(error).not.toHaveBeenCalled();
      expect(logger).toHaveBeenCalledTimes(1);
    });

    test('a logger that throws or rejects never surfaces: the Observable still emits and completes', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      for (const logger of [
        () => {
          throw new Error('logger down');
        },
        () => Promise.reject(new Error('logger down')),
      ]) {
        setVanguardErrorLogger(logger);
        const next = vi.fn();
        const error = vi.fn();
        expect(() => generateErrorBoundaryData('t', new Error('e')).subscribe({ next, error })).not.toThrow();
        await flush();
        expect(next).toHaveBeenCalledTimes(1);
        expect(error).not.toHaveBeenCalled();
      }
      expect(consoleError).toHaveBeenCalled();
    });

    test('without a logger it still PUTs the log itself (deprecated), as before', async () => {
      generateErrorBoundaryData('error_modal_logs', new Error('boom'), undefined, undefined, 'SRC');
      generateErrorBoundaryData('error_modal_logs', new Error('boom'), undefined, undefined, 'SRC');
      await flush();
      expect(network.request).toHaveBeenCalledTimes(2);
      expect(network.urls()[0]).toContain('/rest_api/v1/log');
      expect(network.urls()[0]).toContain('type=error_modal_logs');
    });

    test('without a logger its Observable is the request’s, as before: the response on success, an error on failure', async () => {
      network.request.mockImplementationOnce(() => Promise.resolve({ data: { status: 201 } }) as never);
      const next = vi.fn();
      generateErrorBoundaryData('t').subscribe({ next });
      await flush();
      expect(next).toHaveBeenCalledWith({ status: 201 });

      network.request.mockImplementationOnce(() => Promise.reject(new Error('500')) as never);
      const error = vi.fn();
      generateErrorBoundaryData('t').subscribe({ error });
      await flush();
      expect(error).toHaveBeenCalledTimes(1);
    });
  });

  describe('setVanguardErrorLogger', () => {
    test('null resets the registration (back to the deprecated built-in request)', () => {
      const logger = vi.fn();
      setVanguardErrorLogger(logger);
      setVanguardErrorLogger(null);
      generateErrorBoundaryData('t');
      expect(logger).not.toHaveBeenCalled();
    });

    test('returns a teardown that puts the previous logger back', () => {
      const first = vi.fn();
      const second = vi.fn();
      setVanguardErrorLogger(first);
      const restore = setVanguardErrorLogger(second);
      generateErrorBoundaryData('t');
      restore();
      generateErrorBoundaryData('t');
      expect(second).toHaveBeenCalledTimes(1);
      expect(first).toHaveBeenCalledTimes(1);
    });

    /** Which of the loggers gets the next log (index, or -1 for none) */
    const activeOf = (loggers: ReturnType<typeof vi.fn>[]) => {
      loggers.forEach((l) => l.mockClear());
      generateErrorBoundaryData('t');
      return loggers.findIndex((l) => l.mock.calls.length > 0);
    };

    test('disposed out of order: disposing an older one leaves the newer active, and never comes back', () => {
      const a = vi.fn();
      const b = vi.fn();
      const disposeA = setVanguardErrorLogger(a);
      const disposeB = setVanguardErrorLogger(b);
      disposeA();
      expect(activeOf([a, b])).toBe(1);
      disposeB();
      // A was disposed: nothing to fall back to
      expect(activeOf([a, b])).toBe(-1);
    });

    test('disposing twice is a no-op: a stale teardown never overwrites a newer registration', () => {
      const a = vi.fn();
      const b = vi.fn();
      const c = vi.fn();
      setVanguardErrorLogger(a);
      const disposeB = setVanguardErrorLogger(b);
      disposeB();
      expect(activeOf([a, b, c])).toBe(0);
      setVanguardErrorLogger(c);
      disposeB();
      disposeB();
      expect(activeOf([a, b, c])).toBe(2);
    });

    test('nested registrations restore in order', () => {
      const a = vi.fn();
      const b = vi.fn();
      const c = vi.fn();
      const disposeA = setVanguardErrorLogger(a);
      const disposeB = setVanguardErrorLogger(b);
      const disposeC = setVanguardErrorLogger(c);
      expect(activeOf([a, b, c])).toBe(2);
      disposeC();
      expect(activeOf([a, b, c])).toBe(1);
      disposeB();
      expect(activeOf([a, b, c])).toBe(0);
      disposeA();
      expect(activeOf([a, b, c])).toBe(-1);
    });

    test('null resets everything: no stale teardown brings an older registration back', () => {
      const a = vi.fn();
      const b = vi.fn();
      const c = vi.fn();
      setVanguardErrorLogger(a);
      const disposeB = setVanguardErrorLogger(b);
      const disposeReset = setVanguardErrorLogger(null);
      expect(activeOf([a, b, c])).toBe(-1);
      disposeB();
      disposeReset();
      expect(activeOf([a, b, c])).toBe(-1);
      const disposeC = setVanguardErrorLogger(c);
      disposeB();
      disposeReset();
      expect(activeOf([a, b, c])).toBe(2);
      disposeC();
      expect(activeOf([a, b, c])).toBe(-1);
    });
  });

  describe('ErrorModal', () => {
    test('logs through the consumer’s logger on show, with no request of its own', async () => {
      const logger = vi.fn();
      setVanguardErrorLogger(logger);
      const err = { reason: 'x' };
      render(<ErrorModal close={() => {}} source={'AI_ASSISTANT'} err={err} />);
      await flush();
      expect(network.calls()).toBe(0);
      expect(logger).toHaveBeenCalledTimes(1);
      expect(logger).toHaveBeenCalledWith(
        'error_modal_logs',
        expect.objectContaining({ info: err, source: 'AI_ASSISTANT' }),
      );
    });

    test('without a logger it still logs through the built-in (deprecated) request on show, as before', async () => {
      render(<ErrorModal close={() => {}} source={'AI_ASSISTANT'} />);
      await flush();
      expect(network.urls().some((url) => url.includes('/rest_api/v1/log'))).toBe(true);
    });

    test('still renders when the logger throws', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      setVanguardErrorLogger(() => {
        throw new Error('logger down');
      });
      render(<ErrorModal close={() => {}} source={'X'} />);
      await flush();
      expect(screen.getByText('Oh snap! Something went wrong!')).toBeTruthy();
    });
  });

  describe('ErrorBoundary', () => {
    test('its fallback renders, and makes no request, when the logger throws', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(console, 'log').mockImplementation(() => {});
      setVanguardErrorLogger(() => {
        throw new Error('logger down');
      });
      const Boom = () => {
        throw new Error('render failed');
      };
      const onError = vi.fn();
      render(
        <ErrorBoundary onError={onError} isModal>
          <Boom />
        </ErrorBoundary>,
      );
      await flush();
      expect(onError).toHaveBeenCalled();
      expect(screen.getByText('Oh snap! Something went wrong!')).toBeTruthy();
      expect(network.calls()).toBe(0);
    });
  });
});

describe('the logger registration is public (VAN-64)', () => {
  test.each([
    ['the RcErrorBoundry barrel', () => import('./index')],
    ['the package root', () => import('../../index')],
    ['the WordPress entry (its ModalService can open an ErrorModal)', () => import('../../index-wordpress')],
  ])(
    '%s exports setVanguardErrorLogger',
    async (_name, load) => {
      const mod: Record<string, unknown> = await load();
      expect(mod.setVanguardErrorLogger).toBe(setVanguardErrorLogger);
      // Loading the whole package is slow under a full parallel run
    },
    30_000,
  );
});
