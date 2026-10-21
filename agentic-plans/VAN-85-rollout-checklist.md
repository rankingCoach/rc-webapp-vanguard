# VAN-85 rollout checklist

The single place to track VAN-85 from the Vanguard release through the webapp theme and code changes. Details are in
the linked docs; this list is the order and the status.

**Release:** Vanguard **2.6.0, a minor**. Nothing in VAN-85 is labelled breaking: there are no API removals, and every
new theme token has a fallback in Vanguard. The visible changes (button sizes; the transparent default button once the
theme changes) are covered by the codemod and the theme steps below, not by a major bump.

**Owners:** V = Vanguard (this repo), W = webapp team (theme generator + `html/react`), D = design.

---

## 0. Design decisions (all settled on 2026-10-21)

- [x] D1: the 6 `large` CTAs that drop from 60 to 48px on desktop (list: `VAN-85-button-sizes-webapp-migration.md` §3). **Approved: the drop is fine.** W2 is unblocked.
- [x] D2: the transparent default button RFC ("RFC: Transparent default Button (VAN-85)"). **Approved.** T4 and W3 are unblocked.
- [x] D3: `meditrend` keeps or drops its own default-button fills. **Moved out of T4 into its own webapp step, W7.** It no longer blocks T4.
- [x] D4: the `--ado-text` value. **Use one value for light and dark.** Dark mode doesn't exist in the webapp yet, so there's no separate dark value.
- [x] D5: the `--buttons-border-radius` threshold above which a theme keeps `round` corners. **Approved: 8px.** T2 is unblocked.

## 1. Vanguard release (V)

- [x] All six VAN-85 steps merged into `feature/VAN-85`.
- [x] Code review passed. All 5 Astra findings (`VAN-85-astra-review.md`) fixed: 0aefcc4, 9893b51, e2ba2e8, aa6dec1, a6d01e8.
- [ ] CHANGELOG for 2.6.0 calls out, under a "Visible changes" heading (not "BREAKING"):
  - every button type shares the muted size set; run `scripts/codemod-button-sizes.js` when bumping;
  - focus ring is a 2px outline with 2px offset, on `:focus-visible` only;
  - squircle corners in Chromium 139+ (`--button-corner-shape`).
- [ ] New, additive: `inverted` on primary/shimmer, `textColor="ado"` on default, `StatusBadge` `ado` status and `size="compact"`.
- [ ] Released from `master` with `npm run release` (standard-version picks a minor from the `feat` commits; check the dry run says 2.6.0).

## 2. Theme tokens (W, palette generator `html/theming/default-theme.scss`)

None of these block the Vanguard release; Vanguard falls back to the values in brackets. Order matters only where noted.

**Default theme: landed on 2026-10-21** (`adc0d6c`, `.storybook/theming.css`). Every token Vanguard reads is present
and matches the requests. The brand-level and webapp-side items below each T stay open.

- [x] **T1 focus outline colour (default theme).** `--button-{default,primary,secondary,shimmer}-focus-outline-color: #0062ff` + `-rgb`, one value. → `VAN-85-button-focus-corner-theme-request.md` §1
  - [ ] Update the 3 app files that override the old ring token (DeleteAccountModal, BulkDeleteAccountsModal, mobile-app-invite tokens).
  - [ ] Brand and reseller themes: confirm the generated value (same `#0062ff` or the brand's primary).
- [x] **T2 corner shape (default theme).** `--button-corner-shape: superellipse(1.3)`, with no `-rgb` and no utility classes. → same doc §2
  - [ ] Set `round` on every reseller theme whose `--buttons-border-radius` is above **8px** (D5), **before** those themes get Vanguard 2.6.0.
- [x] **T3 Ado text (default theme).** `--ado-text: #006a85` + `-rgb` + utility classes, one value with no dark override (D4). → `VAN-85-status-badge-theme-request.md`
  - [ ] Other brands and white labels: derive `--ado-text` from their own `--ado-base` (≥ 4.5:1 on a 12% fill).
- [x] **T4 transparent default button (default theme).** `--button-default-background-color: rgba(0, 0, 0, 0)`, hover `rgba(185, 197, 216, 0.12)`. Email buttons stay white (`--email-button-default-bg: white`). Still ships in the **same webapp PR** as W3. → `VAN-85-button-default-theme-request.md`, `VAN-85-button-default-rollout.md` steps 2–4
  - [ ] Legacy `.btn.btn-default` pinned to white (rollout step 2b, `html/vanguard/src/styles/components/_buttons.scss`); not visible in the library theme, so check it in the webapp.
  - [ ] Brand overrides: `pylot-barmenia` hover becomes `rc_rgba(--p300, 0.12)`; `meditrend` is W7.
- [x] **T5 inverted primary/shimmer (default theme).** `--button-{primary,shimmer}-inverted-*`, emitted as resolved literals (`#006a85`), which the request allows. → `VAN-85-button-inverted-theme-request.md`
  - [ ] Brand and white-label themes: emit each theme's own resolved `--ado-base`, not the default `#006a85`.
- [ ] Regenerate for every brand: `gulp vanguard-theme-build` and `gulp vanguard-styles-build`, then run the grep checks in the default-button rollout step 4 (pylot-barmenia, meditrend after W7, direct-channel email partial).

## 3. Webapp code (W)

- [ ] **W1 bump Vanguard** to 2.6.0 in `html/react`.
- [ ] **W2 button sizes**, in the same PR as W1: run the codemod (822 buttons), then the 39 runtime cases and the CSS by hand. → `VAN-85-button-sizes-webapp-migration.md`
- [ ] **W3 transparent default**: swap the 5 usages that relied on the white fill, and the Needs-you row action to `textColor="ado"`. → `VAN-85-button-default-rollout.md` step 5
- [ ] **W4 New badge**: use `<StatusBadge status="ado" size="compact" />`. → `VAN-85-status-badge-investigation.md`
- [ ] **W5 recommended card**: use `inverted` primary/shimmer and remove local white-button overrides. → `VAN-85-button-inverted-investigation.md`
- [ ] **W6 truncation**: remove the local label-overflow workarounds listed in `VAN-85-button-truncation-investigation.md`.
- [ ] **W7 meditrend default button** (D3), after T4: `meditrend/meditrend.scss:30,32` overrides the default-button rest fill (`--n200`) and hover (`--brand-color`), both opaque, so this brand keeps a filled default button after T4. Align it with the transparent default by dropping both overrides (the proposed default), or keep them on purpose, then regenerate and check the brand's `min.css`. → `VAN-85-button-default-rollout.md` step 3

## 4. QA (W, light scheme; the webapp has no dark mode yet)

- [ ] Button footprint unchanged after the codemod: spot-check modals, ActionBar footers, tables, cards on mobile and desktop.
- [ ] The 6 `large` CTAs at 48px on desktop (approved, D1).
- [ ] Keyboard focus ring visible on every type, including on dark or coloured surfaces such as the recommended card; no ring on mouse click.
- [ ] Squircle corners in Chrome/Edge; plain radius in Firefox/Safari; `round` on large-radius reseller themes.
- [ ] Long labels truncate with an ellipsis in phone-width row actions.
- [ ] Diacritics and descenders (Î, Ș, g, y) are whole on large and extraLarge buttons (`VAN-85-button-label-clipping-investigation.md`).
- [ ] Default-button QA list in `VAN-85-button-default-rollout.md` step 6 (incl. emails and legacy PHP pages still white).
- [ ] New badge and recommended card.
- [ ] meditrend brand after W7: the default button looks as decided.

## Rollback

- Theme: revert T1–T5 values and regenerate. Vanguard falls back to its built-in values.
- Webapp: W3 and T4 roll back together (`VAN-85-button-default-rollout.md` "Rollback").
- Vanguard: pin the webapp back to 2.5.x; the codemod changes must be reverted with it.
