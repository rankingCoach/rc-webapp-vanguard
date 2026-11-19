/**
 * Consumer test setup. Only what a plain jsdom consumer needs; nothing vanguard-internal.
 * vitest runs without globals, so RTL's auto-cleanup is not registered: do it here.
 */
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());

// jsdom has no canvas implementation. Lottie's module initialization probes a 1px canvas even when no
// animation is rendered; provide only that browser primitive. Vanguard and MUI remain the real packed code.
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: () => ({ fillStyle: '', fillRect: () => undefined }),
});
// jsdom does not lay out elements or implement ResizeObserver. These smoke checks exercise render/events,
// while browser contract stories cover geometry and actual observation-driven sizing.
class FixtureResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: FixtureResizeObserver });
