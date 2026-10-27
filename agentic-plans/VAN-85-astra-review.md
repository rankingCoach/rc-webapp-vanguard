Found **2 major and 3 minor issues**. No blockers.

1. **Major — New public types are missing from package entry points.**  
   [src/index.ts:33](/Users/alex/Documents/rc-webapp-vanguard/src/index.ts:33), [src/index-wordpress.ts:36](/Users/alex/Documents/rc-webapp-vanguard/src/index-wordpress.ts:36)  
   `ButtonTextColors` is exported from the component barrel but neither package entry point. `StatusBadgeSize` is likewise missing from both root export lists.  
   **Failure:** consumers using `import { ButtonTextColors } from '@rankingcoach/vanguard'` cannot compile the documented Ado button usage. Storybook imports directly from the component, masking this.  
   **Fix:** re-export `ButtonTextColors` and `StatusBadgeSize` through both entry points; verify imports through the public package surface.

2. **Major — Three internal ListPage buttons missed the size migration.**  
   [ListPageActions.tsx:246](/Users/alex/Documents/rc-webapp-vanguard/src/common/ListPage/ListPageHeaderWithActions/ListPageActions/ListPageActions.tsx:246), [ListPageHeader.tsx:60](/Users/alex/Documents/rc-webapp-vanguard/src/common/ListPage/ListPageHeaderWithActions/ListPageHeader/ListPageHeader.tsx:60), [ListPageEmpty.tsx:39](/Users/alex/Documents/rc-webapp-vanguard/src/common/ListPage/ListPageEmpty/ListPageEmpty.tsx:39)  
   These primary buttons still omit `size`, so desktop height drops from 48px to 32px and text from 16px to 12px.  
   **Failure:** “Apply filters” becomes 32px tall beside the unchanged 48px muted “Clear filters” action. Header and empty-state CTAs also shrink unexpectedly.  
   **Fix:** explicitly set `ButtonSizes.extraLarge` on all three.

3. **Minor — The codemod silently skips supported barrel imports.**  
   [scripts/codemod-button-sizes.js:30](/Users/alex/Documents/rc-webapp-vanguard/scripts/codemod-button-sizes.js:30)  
   `BUTTON_MODULE` recognizes `@vanguard/Button/Button` but not `@vanguard/Button`, which the missed ListPage callers use. Skipped imports never enter the manual-review report.  
   **Failure:** running the codemod against `src/common/ListPage` reports **0 changes and 0 manual checks**, despite the three unmigrated buttons above.  
   **Fix:** recognize the supported Button barrel paths and add representative import-form fixtures.

4. **Minor — Inverted buttons lose keyboard focus indication while pressed.**  
   [src/core/Button/_button-props.scss:123](/Users/alex/Documents/rc-webapp-vanguard/src/core/Button/_button-props.scss:123)  
   The inverted reset applies `outline: none` through `:active:not(:disabled):not(.disabled)`. Its specificity exceeds the later `:focus-visible` selector, so source order cannot restore the ring.  
   **Failure:** Tab to an inverted primary/shimmer button and hold Space: its white focus ring disappears during activation. Other button types retain their ring.  
   **Fix:** remove `outline` from the combined state reset and suppress it only for focus that is not visible. Extend the focus story to cover simultaneous `:active` and `:focus-visible`.

5. **Minor — Compact badges retain wrapping inside a fixed 18px height.**  
   [src/core/StatusBadge/StatusBadge.module.scss:34](/Users/alex/Documents/rc-webapp-vanguard/src/core/StatusBadge/StatusBadge.module.scss:34)  
   Compact fixes the outer height at 18px, but `StatusBadge.tsx` still gives its label `textWrap="wrap"`. Two caption lines require 32px before padding.  
   **Failure:** a multiword translated status in a constrained column wraps outside its pill and can overlap adjacent content.  
   **Fix:** make compact labels single-line with truncation, or explicitly support multiline badges with a growing height. Add a narrow-container example.

The merged result is mostly coherent: token names and fallbacks match the theme requests, the shared size rules replace the old type-specific rules, and runtime prop gating matches the documented compatibility decisions. The export omissions and missed callers should be fixed before release.

Verification was read-only: reviewed the requested diff/history, compiled both SCSS modules in memory, and ran the codemod dry run. Browser/Storybook tests were not run. No files were modified.