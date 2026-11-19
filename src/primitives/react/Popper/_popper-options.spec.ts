import { describe, expect, it } from 'vitest';
import { resolvePopperOptions } from './popper-options';

/**
 * Both modifiers inherit altBoundary = !portal unless overridden. The centered planner overrides just flip.
 */
describe('resolvePopperOptions altBoundary', () => {
  const centerFlip = { name: 'flip', options: { altBoundary: true, rootBoundary: 'viewport', padding: 8 } };

  it('inline (disablePortal): flip altBoundary true equals the derived one, supported', () => {
    expect(resolvePopperOptions({ placement: 'top', modifiers: [centerFlip], disablePortal: true }).supported).toBe(
      true,
    );
  });

  it('portaled: flip uses the anchor boundary while preventOverflow keeps the floating boundary', () => {
    const r = resolvePopperOptions({ placement: 'top', modifiers: [centerFlip], disablePortal: false });
    expect(r).toMatchObject({
      supported: true,
      unsupported: [],
      flipAltBoundary: true,
      preventOverflowAltBoundary: false,
    });
  });

  it('portaled, both set to the same value: supported', () => {
    const r = resolvePopperOptions({
      placement: 'top',
      modifiers: [centerFlip, { name: 'preventOverflow', options: { altBoundary: true } }],
      disablePortal: false,
    });
    expect(r.supported).toBe(true);
  });
});
