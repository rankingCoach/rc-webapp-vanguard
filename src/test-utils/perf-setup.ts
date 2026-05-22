// Perf-specific setup: jsdom polyfills + React act env flag.
// Loaded BEFORE the generic spec setup.
/* eslint-disable @typescript-eslint/no-explicit-any */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Swallow async errors so a misbehaving component (apexcharts, etc.) doesn't
// crash the whole perf worker after its test already completed.
process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof (globalThis as any).IntersectionObserver === 'undefined') {
  (globalThis as any).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = (() => {}) as unknown as typeof window.scrollTo;
}

// Stub canvas 2d context — jsdom returns null otherwise, which breaks anything
// touching fillStyle / drawImage (Lottie, rich text editor, AI assistant).
if (typeof HTMLCanvasElement !== 'undefined') {
  const ctxStub = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === 'canvas') return null;
        if (prop === 'measureText') return () => ({ width: 0 });
        if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
        if (prop === 'createImageData') return () => ({ data: new Uint8ClampedArray(4) });
        if (prop === 'getContextAttributes') return () => ({});
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient' || prop === 'createPattern')
          return () => ({ addColorStop: () => {} });
        return () => {};
      },
      set() {
        return true;
      },
    },
  );
  HTMLCanvasElement.prototype.getContext = function () {
    return ctxStub as unknown as CanvasRenderingContext2D;
  } as unknown as HTMLCanvasElement['getContext'];
  HTMLCanvasElement.prototype.toDataURL = () => '';
  HTMLCanvasElement.prototype.toBlob = ((cb: BlobCallback) => cb(null)) as HTMLCanvasElement['toBlob'];
}

// Silence noisy console output during perf run.
const origError = console.error;
const origWarn = console.warn;
const NOISE = /act\(|ResizeObserver|IntersectionObserver|not wrapped in act/i;
console.error = (...args: unknown[]) => {
  const first = typeof args[0] === 'string' ? args[0] : '';
  if (NOISE.test(first)) return;
  origError(...(args as []));
};
console.warn = (...args: unknown[]) => {
  const first = typeof args[0] === 'string' ? args[0] : '';
  if (NOISE.test(first)) return;
  origWarn(...(args as []));
};
