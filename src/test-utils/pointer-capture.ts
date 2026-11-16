/** Minimal capture bookkeeping for jsdom; native browser implementations stay untouched. */
export const installPointerCapture = (prototype: object = Element.prototype) => {
  const captured = new WeakMap<object, Set<number>>();
  const methods = {
    hasPointerCapture(this: object, pointerId: number) {
      return captured.get(this)?.has(pointerId) ?? false;
    },
    setPointerCapture(this: object, pointerId: number) {
      let pointers = captured.get(this);
      if (!pointers) {
        pointers = new Set<number>();
        captured.set(this, pointers);
      }
      pointers.add(pointerId);
    },
    releasePointerCapture(this: object, pointerId: number) {
      captured.get(this)?.delete(pointerId);
    },
  };
  for (const [name, method] of Object.entries(methods)) {
    if (typeof Reflect.get(prototype, name) !== 'function') {
      Object.defineProperty(prototype, name, { configurable: true, writable: true, value: method });
    }
  }
};
