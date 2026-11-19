import { describe, expect, it } from 'vitest';

/**
 * Emotion inserts its <style> when MUI first renders (app start), so consumer route CSS loaded later wins equal
 * specificity ties against `sx` rules. The own sx class sheet must sit where emotion's would: created when the module
 * loads, not appended at first use (Codex review, handoff 15).
 */
describe('zIndexClass sheet position', () => {
  it('a stylesheet added after module load still comes after the sx sheet', async () => {
    const { zIndexClass } = await import('./z-index-class');
    const route = document.createElement('style');
    route.textContent = '.probe-popper { z-index: 9000; }';
    document.head.appendChild(route);
    const el = document.createElement('div');
    el.className = `probe-popper ${zIndexClass(1101)}`;
    document.body.appendChild(el);
    expect(document.querySelector('style[data-vg-z]')?.textContent).toContain('.vg-z-1101{z-index:1101}');
    const sheets = Array.from(document.head.querySelectorAll('style'));
    const vgSheet = sheets.findIndex((s) => s.hasAttribute('data-vg-z'));
    expect(vgSheet).toBeGreaterThanOrEqual(0);
    expect(vgSheet).toBeLessThan(sheets.indexOf(route));
    // In a browser the later, equal-specificity route rule then wins (9000), as against emotion; jsdom's cascade does
    // not resolve this cross-sheet tie reliably, so the position is what is asserted here.
    el.remove();
    route.remove();
  });
});
