/**
 * Dev/test only (D15). The builds append src/styles/mui-compat.scss after every other Vanguard rule; under Vite's dev
 * server (Storybook, vitest) each stylesheet is a `<style data-vite-dev-id>` added when its module first loads, so the
 * compat sheet would land wherever it was first imported. This keeps it the last stylesheet in `<head>`.
 * Consumer fixtures that model route CSS go in the story body (after `<head>`), so they still come after it.
 */
const isCompatSheet = (node: Element) =>
  node.tagName === 'STYLE' && (node.getAttribute('data-vite-dev-id') ?? '').includes('styles/mui-compat.scss');

const isSheet = (node: Element) =>
  node.tagName === 'STYLE' || (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet');

export const moveMuiCompatLast = (doc: Document = document) => {
  const sheets = [...doc.head.children].filter(isSheet);
  const compat = sheets.filter(isCompatSheet);
  // Already a trailing run of compat sheets: nothing to do (also stops the observer from re-triggering itself).
  if (compat.length === 0 || sheets.slice(-compat.length).every(isCompatSheet)) return;
  for (const sheet of compat) doc.head.appendChild(sheet);
};

export const keepMuiCompatLast = (doc: Document = document) => {
  moveMuiCompatLast(doc);
  const observer = new MutationObserver(() => moveMuiCompatLast(doc));
  observer.observe(doc.head, { childList: true });
  return () => observer.disconnect();
};
