# VAN-85 Astra code review, round 2 (chunked)

Reviewed `feature/VAN-85` at `0a8e554` in 6 parallel read-only chunks against origin/master. Total: 2 major, 9 minor, 1 nit, no blockers. Verified by hand: Tabs form submission (Button renders a native `<button>` with no `type`, the old scroll controls were divs), codemod nested relative imports (the regex only matches `./` or `../`), and the ActionButton default `extraLarge` with a `{...rest}` type override.

# 1-button-core

No findings.

The chunk is coherent with VAN-85: shared sizing, truncation, inverted variants, Ado text colour, accessible naming, and public exports align with the stated requirements. Static inspection found no actionable cascade conflicts or regressions; browser rendering and Storybook tests were not run.

# 2-button-stories-specs

- **Minor — `src/core/Button/stories/ButtonTypeInverted.story.tsx:91`: Reduced-motion behavior fails the story’s assertion.** The play function unconditionally expects `animationName` to contain `adoShimmer`, but the stylesheet correctly sets `animation: none` under `prefers-reduced-motion: reduce`. Opening either inverted story with that preference produces a false failure. Branch the expectation on `matchMedia('(prefers-reduced-motion: reduce)')`.

- **Minor — `src/core/Button/stories/_Button.default.tsx:285`: Demo still treats `extraLarge` as muted-only.** The same restriction remains at lines 295 and 310. Consequently, primary/default/secondary/shimmer demos omit the now-supported 48px size from their normal, disabled, icon, and loading examples, contradicting the new Size Matrix. Remove all three muted-only guards.

- **Nit — `src/core/Button/stories/ButtonDefaultTextColor.story.tsx:149`: Transparent-default documentation describes an obsolete preview.** It says “not the shipped look” and presents the theme changes as pending, although `.storybook/theming.css` now supplies those values. The wrapper also overrides the real tokens, so its transparency assertion would still pass if the theme regressed. Describe the final behavior and remove the redundant overrides so the story exercises the regenerated theme.

The chunk is largely coherent with the final Button implementation; the remaining issues concern story coverage, preference-aware assertions, and stale documentation. This was a read-only static review; no builds or tests were run.

# 3-status-badge

- **Minor — [StatusBadge.module.scss:3](src/core/StatusBadge/StatusBadge.module.scss:3): Standalone reversed Ado icons lack their fill token.** The new custom properties exist only on StatusBadge roots, but `StatusBadgeIcon` is independently exported. Rendering `<StatusBadgeIcon status="ado" hasIconReverse />` outside a badge leaves `--status-badge-ado-background-color` undefined, invalidating its background and border colors. The standalone icon showcase now includes this case. Apply the shared color declarations to the icon root as well.

- **Minor — [status-badge-get-colors-based-on-status.ts:190](src/core/StatusBadge/status-badge-get-colors-based-on-status.ts:190): Reversed big Ado badges lose their glow.** Rendering `<StatusBadge status="ado" text="New" variant="big" iconVariant="reverse" />` makes the glow reference `--status-badge-ado-background-color-rgb`, because `StatusBadge.tsx` substitutes `bgColor` for `iconColor` before appending `-rgb`. That variable is never defined, so the entire shadow becomes invalid. Select the glow token explicitly—using `--ado-base-rgb` for Ado—instead of deriving it from the scoped fill token.

The compact styling, truncation, exports, and metadata are coherent with the final behavior. Two Ado reverse-mode combinations remain incomplete; verification was limited to source inspection and in-memory SCSS compilation.

# 4-tabs

- **Major — [Tabs.tsx:213](src/core/Tabs/Tabs.tsx:213): Overflow controls submit enclosing forms.** The replacement `Button` renders a native `<button>` without an HTML `type`; `type={ButtonTypes.muted}` only selects styling. Clicking either overflow control inside a `<form>` therefore triggers form submission, whereas the removed controls were divs. Add native button-type support to `Button` and explicitly use `type="button"` for these controls.

- **Minor — [Tabs.module.scss:113](src/core/Tabs/Tabs.module.scss:113): Floating overflow controls clip their focus outlines.** The floating inset is 2px, but the Button’s 2px outline plus 2px offset extends 4px beyond its edge. The rounded bar retains `overflow: hidden`, so keyboard-focusing an overflow control clips the ring at the bar edge. Reserve sufficient space around the controls, accounting for the rounded clipping boundary, or render them outside that clipping container.

- **Minor — [Tabs.module.scss:118](src/core/Tabs/Tabs.module.scss:118): Caret direction disagrees with scrolling when RTL comes from CSS.** For `<Tabs style={{ direction: 'rtl' }}>`, logical positioning and the hook’s computed-direction check use RTL, but `:dir(rtl)` does not match CSS-only direction. Consequently, the start control appears on the right and scrolls right while its caret points left. Derive the caret orientation from the same computed direction used by the hook, and cover CSS-driven RTL in the story.

The chunk consistently replaces the old scroll component and implements logical start/end jumps, with corresponding hook tests and stories. The remaining gaps concern integration with forms, clipped keyboard focus, and inconsistent RTL detection; this review was static, with no files modified or tests run.

# 5-callers-codemod

- **Major — `scripts/codemod-button-sizes.js:72`**: The codemod treats type-only `ButtonSizes` imports as runtime bindings. Given `import type { ButtonSizes } from '@vanguard/Button'` alongside a normal Button import, it generates `size={ButtonSizes.extraLarge}` without adding a value import, breaking compilation. Check both import-level and specifier-level `isTypeOnly`, and ensure generated enum references have a runtime import.

- **Minor — `scripts/codemod-button-sizes.js:35`**: Nested relative barrel imports are silently skipped. For example, `import { Button } from '../../Button'` produces zero changes and zero manual-review entries, leaving default primary buttons to shrink after upgrading. Extend the relative-path matcher to support multiple parent segments and add corresponding fixtures.

- **Minor — `src/core/ActionButton/ActionButton.tsx:25`**: The unconditional `extraLarge` default also enlarges muted ActionButtons. `<ActionButton type={ButtonTypes.muted}>` previously used muted `medium` (32px desktop), but now becomes 48px despite muted sizes being unchanged. Choose `medium` when `props.type` is muted, as `ActionBarMessage` already does, while preserving explicit size overrides.

The caller migration is largely coherent with the unified size set, and the showcase change correctly removes the deleted TabsCustomScroll entry. The remaining issues concern a wrapper’s muted default and codemod import handling; the two codemod failures were reproduced entirely in memory without filesystem writes.

# 6-docs-theme-coherence

- **Minor — Rollout instructions omit the required size migration.** [agentic-plans/VAN-85-button-default-rollout.md:23](agentic-plans/VAN-85-button-default-rollout.md:23) says upgrading changes nothing visually, but 2.6.0 changes every non-muted button’s sizing. Following this procedure alone leaves implicit-medium desktop buttons shrinking from 48px to 32px. Specify 2.6.0 and require the linked size migration alongside the upgrade, consistent with checklist W2.

The regenerated theme is coherent with the final implementation and settled design decisions; no theme defects found. The actionable rollout guide needs the correction above. My earlier concern about `iconRight` was incorrect: it remains supported as a deprecated prop.


# Resolution

All 12 findings were confirmed real before fixing; none was skipped. A separate verification pass (specs, Storybook play tests, browser inspection of the Tabs focus ring, codemod scratch fixtures) found each one resolved.

| Finding | Resolution | Commit |
|---|---|---|
| Major: Tabs overflow controls submit enclosing forms | New Button `htmlType` prop (default unchanged: no `type` attribute), Tabs passes `htmlType="button"`; form-submit specs for Button and Tabs | dcc7572, c978167 |
| Minor: floating overflow controls clip their focus outlines | Floating tray no longer clips; the scroller and a separate shadow layer clip at the same radius, so the ring is whole and the resting look is unchanged | c978167 |
| Minor: caret direction wrong when RTL comes from CSS | Caret and shadow side come from the scroll hook's computed `isRtl`; `:dir(rtl)` rules removed; CSS-only RTL stories and spec | c978167 |
| Major: codemod treats type-only `ButtonSizes` as a value | Type-only bindings skipped; the type-only specifier/import is turned into a value import when `ButtonSizes.x` is emitted; fixtures typecheck the output | b69cce8 |
| Minor: codemod skips nested relative barrels | Matcher accepts any number of `../`; fixtures for `../../Button`, `../../../Button/index`, `../../ButtonGroup` ignored | b69cce8 |
| Minor: muted ActionButton defaults to `extraLarge` | `medium` for muted, `extraLarge` otherwise, explicit size wins; new `_ActionButton.spec.tsx` | 66adc69 |
| Minor: standalone reversed Ado icon lacks its fill | Ado colour mixin shared with the StatusBadgeIcon root; `StatusBadgeAdoReverse` story checks the computed fill | 4c4bc96 |
| Minor: big reversed Ado badge loses its glow | Glow token chosen explicitly (`--ado-base-rgb` for Ado); specs for Ado and another status | 4c4bc96 |
| Minor: inverted story fails under reduced motion | Play test branches on `prefers-reduced-motion`; same fix in the shimmer and shimmer showcase stories, which failed the same way | ca813e4 |
| Minor: demo treats `extraLarge` as muted-only | All three guards removed | 9cc33da |
| Nit: transparent-default story describes an obsolete preview | Renamed to "Button Default Transparent", describes the shipped behaviour, no own token overrides | 9cc33da |
| Minor: rollout step 1 omits the size migration | Step 1 names 2.6.0 and requires W2 in the same PR | 084fa6d |

Known limits, not fixed: the Tabs carets follow a runtime direction flip only at the next measure (scroll, resize, tab or layout change), like the scroll maths; the codemod still lists brace-wrapped string literals (`size={'small'}`) for a manual check instead of rewriting them (pre-existing).
