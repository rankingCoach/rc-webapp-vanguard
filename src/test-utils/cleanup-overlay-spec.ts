import { cleanup } from '@testing-library/react';
import { expect, vi } from 'vitest';

export const cleanupOverlaySpec = () => {
  try {
    // Unmount React before removing any nodes owned by its portals.
    cleanup();
    if (vi.isFakeTimers()) vi.runOnlyPendingTimers();
    const lockedBodyStyles = Array.from(document.body.style).filter((name) => /^(overflow|padding)(-|$)/.test(name));
    const hiddenSiblings = Array.from(document.body.children).filter((element) => element.getAttribute('aria-hidden') === 'true');
    const portals = document.body.querySelectorAll('.MuiModal-root, .MuiAutocomplete-popper, [role="tooltip"]');
    expect({ lockedBodyStyles, hiddenSiblings, portals: Array.from(portals) }).toEqual({
      lockedBodyStyles: [],
      hiddenSiblings: [],
      portals: [],
    });
  } finally {
    vi.useRealTimers();
    document.body.replaceChildren();
    document.body.removeAttribute('style');
  }
};
