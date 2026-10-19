# VAN-85 (Minor): Button focus ring and corner shape: investigation

**Scope:** the two "Minor" Button points of [VAN-85](https://rankingcoach.atlassian.net/browse/VAN-85):
(1) focus as a 2px outline with a 2px offset on every type, (2) `corner-shape: superellipse(1.3)`.
**Baseline:** `master` / v2.4.0 (`src/core/Button/Button.module.scss`, `src/core/Button/_button-props.scss`).
**Verdict:** non-breaking (no API change), self-contained (no theme change needed to ship). One optional theme
request for a better ring colour: [VAN-85-button-focus-theme-request.md](VAN-85-button-focus-theme-request.md).

---

## 1. Current state

| Type | Selector | Ring | Other focus changes |
|---|---|---|---|
| default, primary, secondary, shimmer | `:focus` (`focusState` mixin) | `box-shadow: 0 0 0 2px var(--button-<type>-focus-box-shadow-color)`, no offset | background → hover bg, text → hover text, border reset |
| muted (all four combos) | `:focus-visible` | `outline: 2px solid var(--muted-ring); outline-offset: 2px` | none |

`focusState` is also reused for `:active` (pressed look = hover colours, ring removed).

Ring token values today (webapp `html/theming/default-theme.scss`):
`--button-{default,primary,secondary,shimmer}-focus-box-shadow-color: --fn-bg-hov-p-gl` → `--p200`
(`#b8d9ff` light / `#000335` dark). Muted rings use `--button-muted*-focus-outline-color`, which the webapp theme
**does not define yet**, so production muted buttons run on the `#0062ff` / white literal fallbacks.

## 2. Decisions

### 2.1 Ring colour per type

| Option | Today's colour | Consumer overrides keep working | Contrast | Theme dependency |
|---|---|---|---|---|
| A. reuse `--button-<type>-focus-box-shadow-color` | same | yes | weak: `#b8d9ff` on white ≈ 1.4:1 once the offset puts it on the page background | none |
| B. reuse the muted `#0062ff` ring for all | changes | no | good | none (literal) |
| **C. new `--button-<type>-focus-outline-color`, falling back to A** | same until the theme sets it | yes until the theme sets it | weak now, good once themed | optional |

**Recommendation / implemented: C.**
`outline-color: var(--button-<type>-focus-outline-color, var(--button-<type>-focus-box-shadow-color))`.
It ships today with exactly the current ring colour (and honours the three app files that override
`--button-*-focus-box-shadow-color`), and the webapp team can raise contrast later by adding one token per type,
matching the muted naming (`…-focus-outline-color`). See the theme request.

### 2.2 `:focus` → `:focus-visible`

- **Mouse / touch:** Chrome & Firefox focus the button on mousedown, but `Button.tsx` `handleOnClick` calls
  `blur()` on every click, so the old `:focus` look only showed while the mouse was held down (Safari never focuses
  buttons on click). After the change a press shows no ring at all (verified with a real click in Chromium 152:
  focused, `:focus-visible` false, no outline, no box-shadow). Intended a11y behaviour, matches muted.
- **Side note (not changed here):** that same `blur()` also runs for keyboard activation (Enter / Space), so a
  keyboard user loses focus after activating a button. Worth a separate a11y ticket.
- **Keyboard:** ring only, no background / text change (same as muted). The pressed (`:active`) colours are kept.
- **Programmatic `.focus()`:** browsers apply `:focus-visible` when the previous interaction was keyboard or none
  (e.g. focus on mount in a modal), so focus-trapped dialogs still show the ring.
- The sweep found no consumer depending on the click-focus look (no tests, no snapshots, no `:focus` rules on Vanguard
  buttons). Only Chromatic screenshots of stories that end focused will change (§3.4).

### 2.3 `corner-shape`

**Browser support** (MDN browser-compat-data 8.1.6, 2026-10-15): Chrome / Edge / Chrome Android **139+**; Firefox
and Safari **preview only**; Safari iOS **no**. Experimental, not Baseline.

**Degradation:** unsupported browsers drop the unknown declaration and keep the plain `border-radius` (exactly
today's look). `corner-shape` has no effect when the radius is 0. Where supported, outline, box-shadow, background,
border and `overflow` clipping follow the shape, so the new ring hugs the squircle. A single declaration needs no
`@supports` wrapper: nothing else has to switch together with it.

**Which buttons:**
- default, primary, secondary, shimmer, muted (square-ish shape): **yes**.
- `shape-round` (`rounded` prop, 24px radius, a pill/circle at every height ≤ 48px): **no.** `superellipse(1.3)`
  is squarer than `round`, so it would turn pills into "stadium-squircles" and round icon-only buttons into
  squircles; about 107 webapp usages. Kept `round` explicitly so a later theme radius change cannot reintroduce it.
- Icon-only (`button-label-hidden`) with the normal radius: **yes** (it is a small rounded square, not a circle).
- Muted layers (`::before`, `::after`, `.button-hover-layer`) use `border-radius: inherit`; `corner-shape` is not
  inherited, so they get `corner-shape: inherit` too, otherwise the fill would keep round corners inside a squircle.

## 3. Webapp sweep (`rc-webapp/html/react`)

The app consumes the npm package `@rankingcoach/vanguard` via the `vanguard` alias (`vite.config.ts:173`); class
names are hashed (`button-primary_6G`), so nothing targets Vanguard classes directly.

### 3.1 Focus overrides

- No selectors targeting Vanguard button classes, no global `button:focus` / `*:focus` / `:focus-visible` resets,
  no `:focus` rules on any of the 74 `<Button className>` usages.
- `--button-primary-focus-box-shadow-color` overridden with a 35% colour-mix:
  `partner/ResellerAccounts/DeleteAccountModal.module.scss:15`, `BulkDeleteAccountsModal.module.scss:41`.
  Kept working by option C, but a 35% ring set 2px off the button reads faint → **webapp follow-up**: set the new
  `--button-primary-focus-outline-color` there (e.g. `var(--e500)`).
- `ai-conversations/widgets/mobile/MobileAppInviteConversationWidget/_mobile-app-invite-tokens.scss:62,66` overrides
  `--button-primary-focus-box-shadow-color` and `--button-muted-inverted-focus-box-shadow-color`. Kept working by C
  until the theme defines `--button-primary-focus-outline-color`; **when that lands, add the matching outline
  override there.** (The muted-inverted override is already dead: muted reads `…-focus-outline-color`.)
- `src/styles/_button-props.scss:84` in the app is a dead copy of the old mixin (not imported). No clash.

### 3.2 Border-radius overrides

| File | Override | Effect of `superellipse(1.3)` |
|---|---|---|
| `upsellings/.../SpaceshipUpsellCard.module.scss:65` | `--border-radius: 9999px` (pill, not via `rounded`) | slightly squarer pill ends in Chromium; add `corner-shape: round` there if unwanted |
| `.../_mobile-app-invite-tokens.scss:68` | `--buttons-border-radius: 16px` | squircle, intended |
| `_widgets/LocationSummaryPageHeader/.../LocationSummaryPageHeaderLogo.module.scss:58` | `border-radius: 4px 0 4px 0` | only the two 4px corners change, negligible |
| `seo/Optimiser/.../OptimiserSetupHeader.module.scss:29` | `.headerClose { border-radius: 50% }` (40×40) | circle → squircle **if** this override wins the cascade (it may already lose to Vanguard's CSS); add `corner-shape: round` there or switch to `rounded` |

No `clip-path` / `mask` on buttons. One existing app precedent: `ado/.../WidgetFrame.module.scss:20` uses
`@supports (corner-shape: squircle)`.

### 3.3 Clipping of the ring (needs 4px outside the border box instead of 2px)

- **Clipped:** `_common/StatisticsBoard/StatisticsBoardItem/StatisticsBoardItem.module.scss:80` (`.ctaContainer`
  `overflow: hidden` around a full-width Button) and `LocationSummaryPageHeaderLogo.module.scss:29` (`.image`
  `overflow: hidden`, button flush bottom-right). The current box-shadow ring is already clipped there too, so not a
  regression, but worth a webapp fix (padding or `overflow: clip` + `overflow-clip-margin: 4px`).
- **Borderline:** `EntityListToolbar.module.scss:102,106` `.filtersInner` (2px top padding) loses the top of the ring.
- Checked and fine (≥ 8px padding): CanvasPane, EditableCard, Login card, ConnectGBPListingModal,
  AiVisibilityUpsellTrigger, BusinessMatchConfirm, ChannelConnectionsWidget.

### 3.4 Tests / visual baselines

No `.snap` files or style assertions on focus. Chromatic diffs expected in stories that end focused:
`_GoogleAdsPortfolioStrategyCreateModal`, `_GoogleAdsPortfolioStrategyEditModal`, `_WebsiteScreenshotCard`,
`_GoogleAdsLocationAssociationsPanelView`, `_CompetitorSelectionConversationWidget`, `_ReviewWidgetReviewForm`.

## 4. Versioning

No prop/API change; visual-only (ring position, ring only on keyboard focus, squarer corners in Chromium) →
`feat`, minor. VAN-85's size harmonisation is the breaking part of the release; mention these two in the same
CHANGELOG entry.
