/**
 * MUI `sx={{ zIndex }}` on the own core: emotion turns it into a class whose rule is injected at runtime (after
 * vanguard.css, specificity 0,1,0). `zIndexClass(n)` returns `vg-z-<n>` and injects `.vg-z-<n>{z-index:n}` once into a
 * single <style data-vg-z> created when the module loads (emotion's position), so the value is a class rule (consumer CSS, computed style and jsdom
 * behave as with emotion) and not an inline style. No document (SSR): the class only.
 */
const injected = new Set<number>();
let sheet: HTMLStyleElement | null = null;

const createSheet = () => {
  sheet = document.createElement('style');
  sheet.setAttribute('data-vg-z', '');
  document.head.appendChild(sheet);
  injected.clear();
};

// Emotion inserts its <style> when MUI first renders (app start), so route CSS loaded later wins equal-specificity
// ties against sx rules. Create the sheet when this module loads (with the Vanguard bundle), not at first use.
if (typeof document !== 'undefined' && document.head) createSheet();

export const zIndexClass = (zIndex: number | undefined): string => {
  if (zIndex === undefined || !Number.isFinite(zIndex)) return '';
  const value = Math.trunc(zIndex);
  const cls = `vg-z-${value < 0 ? `n${-value}` : value}`;
  if (typeof document === 'undefined' || injected.has(value)) return cls;
  if (!sheet || !sheet.isConnected) createSheet();
  sheet?.appendChild(document.createTextNode(`.${cls}{z-index:${value}}`));
  injected.add(value);
  return cls;
};
