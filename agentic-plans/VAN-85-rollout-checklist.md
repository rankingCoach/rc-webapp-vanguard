# VAN-85 rollout checklist

The single place to track VAN-85 from the Vanguard release through the webapp theme and code changes. Details are in
the linked docs; this list is the order and the status.

**Release:** Vanguard **2.5.0, a minor**. Nothing in VAN-85 is labelled breaking: there are no API removals, and every
new theme token has a fallback in Vanguard. The visible changes (button sizes; the transparent default button once the
theme changes) are covered by the codemod and the theme steps below, not by a major bump.

**Owners:** V = Vanguard (this repo), W = webapp team (theme generator + `html/react`), D = design.

---

## 0. Open decisions (block the step they name)

- [ ] D: the 6 `large` CTAs that drop from 60 to 48px on desktop (list: `VAN-85-button-sizes-webapp-migration.md` §3). Blocks W2.
- [ ] D: the transparent default button RFC ("RFC: Transparent default Button (VAN-85)"). Blocks T4 and W3.
- [ ] D: `meditrend` keeps or drops its own default-button fills (`VAN-85-button-default-rollout.md` step 3). Blocks T4 for that brand.
- [ ] D: the dark-scheme `--ado-text` value (suggested `#7fcde3`). Blocks T3 (dark only).
- [ ] D: the `--buttons-border-radius` threshold above which a theme keeps `round` corners (suggested 8px). Blocks T2.

## 1. Vanguard release (V)

- [x] All six VAN-85 steps merged into `feature/VAN-85`.
- [x] Code review passed. All 5 Astra findings (`VAN-85-astra-review.md`) fixed: a14e828, 6471789, 5fcf53b, d17033d, 10dc3ce.
- [ ] CHANGELOG for 2.5.0 calls out, under a "Visible changes" heading (not "BREAKING"):
  - every button type shares the muted size set; run `scripts/codemod-button-sizes.js` when bumping;
  - focus ring is a 2px outline with 2px offset, on `:focus-visible` only;
  - squircle corners in Chromium 139+ (`--button-corner-shape`).
- [ ] New, additive: `inverted` on primary/shimmer, `textColor="ado"` on default, `StatusBadge` `ado` status and `size="compact"`.
- [ ] Released from `master` with `npm run release` (standard-version picks a minor from the `feat` commits; check the dry run says 2.5.0).

## 2. Theme tokens (W, palette generator `html/theming/default-theme.scss`)

None of these block the Vanguard release; Vanguard falls back to the values in brackets. Order matters only where noted.

- [ ] **T1 focus outline colour.** `--button-{default,primary,secondary,shimmer}-focus-outline-color` (fallback: `--button-<type>-focus-box-shadow-color`). Then update the 3 app files that override the old ring token. → `VAN-85-button-focus-corner-theme-request.md` §1
- [ ] **T2 corner shape.** `--button-corner-shape` (fallback: `superellipse(1.3)`). Set it to `round` on large-radius reseller themes **before** those themes get Vanguard 2.5.0. → same doc §2
- [ ] **T3 Ado text.** `--ado-text` + `-rgb` (fallback: `--ado-base`). → `VAN-85-status-badge-theme-request.md`
- [ ] **T4 transparent default button.** Change two values of existing tokens; no new tokens. Must ship in the **same webapp PR** as W3, after the email and legacy readers are decoupled. → `VAN-85-button-default-theme-request.md`, `VAN-85-button-default-rollout.md` steps 2–4
- [ ] **T5 inverted primary/shimmer** `--button-{primary,shimmer}-inverted-*` (fallbacks equal the requested values, based on `--ado-base`). Optional. → `VAN-85-button-inverted-theme-request.md`
- [ ] Regenerate: `gulp vanguard-theme-build` and `gulp vanguard-styles-build`, then run the grep checks in the default-button rollout step 4.

## 3. Webapp code (W)

- [ ] **W1 bump Vanguard** to 2.5.0 in `html/react`.
- [ ] **W2 button sizes**, in the same PR as W1: run the codemod (822 buttons), then the 39 runtime cases and the CSS by hand. → `VAN-85-button-sizes-webapp-migration.md`
- [ ] **W3 transparent default**: swap the 5 usages that relied on the white fill, and the Needs-you row action to `textColor="ado"`. → `VAN-85-button-default-rollout.md` step 5
- [ ] **W4 New badge**: use `<StatusBadge status="ado" size="compact" />`. → `VAN-85-status-badge-investigation.md`
- [ ] **W5 recommended card**: use `inverted` primary/shimmer and remove local white-button overrides. → `VAN-85-button-inverted-investigation.md`
- [ ] **W6 truncation**: remove the local label-overflow workarounds listed in `VAN-85-button-truncation-investigation.md`.

## 4. QA (W, light and dark where supported)

- [ ] Button footprint unchanged after the codemod: spot-check modals, ActionBar footers, tables, cards on mobile and desktop.
- [ ] The 6 `large` CTAs at their approved size.
- [ ] Keyboard focus ring visible on every type and on dark surfaces; no ring on mouse click.
- [ ] Squircle corners in Chrome/Edge; plain radius in Firefox/Safari; `round` on large-radius reseller themes.
- [ ] Long labels truncate with an ellipsis in phone-width row actions.
- [ ] Diacritics and descenders (Î, Ș, g, y) are whole on large and extraLarge buttons (`VAN-85-button-label-clipping-investigation.md`).
- [ ] Default-button QA list in `VAN-85-button-default-rollout.md` step 6 (incl. emails and legacy PHP pages still white).
- [ ] New badge and recommended card in light and dark.

## Rollback

- Theme: revert T1–T5 values and regenerate. Vanguard falls back to its built-in values.
- Webapp: W3 and T4 roll back together (`VAN-85-button-default-rollout.md` "Rollback").
- Vanguard: pin the webapp back to 2.4.x; the codemod changes must be reverted with it.
