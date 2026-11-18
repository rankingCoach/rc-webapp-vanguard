import { describe, expect, it } from 'vitest';
import { resolvePopperOptions } from './popper-options';

/**
 * The core takes one clipping boundary for flip and preventOverflow (altBoundary = !portal). popper.js lets each
 * modifier choose its own; when they differ (PopoverModal centerPopover portaled: flip altBoundary true), the own
 * Popper is not used (Codex review, PopoverModal).
 */
describe('resolvePopperOptions altBoundary', () => {
  const centerFlip = { name: 'flip', options: { altBoundary: true, rootBoundary: 'viewport', padding: 8 } };

  it('inline (disablePortal): flip altBoundary true equals the derived one, supported', () => {
    expect(resolvePopperOptions({ placement: 'top', modifiers: [centerFlip], disablePortal: true }).supported).toBe(
      true,
    );
  });

  it('portaled: flip altBoundary true differs from preventOverflow false, not supported', () => {
    const r = resolvePopperOptions({ placement: 'top', modifiers: [centerFlip], disablePortal: false });
    expect(r.supported).toBe(false);
    expect(r.unsupported).toContain('altBoundary(flip≠preventOverflow)');
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
