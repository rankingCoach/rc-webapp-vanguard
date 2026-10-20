# VAN-85 point 4: transparent `default` button and its Ado text colour (investigation)

Status: plan approved on 2026-10-20; the Vanguard part (`textColor`) is implemented, the webapp part waits for the rollout.
- Plan: as amended on 2026-10-19 (sections 2, 5 and 6).
- Theme request: `VAN-85-button-default-theme-request.md`.
- Rollout steps (after the Vanguard release): `VAN-85-button-default-rollout.md`.
- RFC for colleagues: the Claude Doc "RFC: Transparent default Button (VAN-85)".
- Scope: light scheme only; dark mode is not supported yet.

## 1. Where the white comes from

The white comes from the theme. Nothing in Vanguard sets it locally.

- `buttonProps(default)` (`src/core/Button/_button-props.scss`) paints `background-color: var(--button-default-background-color)`.
- In the generator, `html/theming/default-theme.scss:389` (webapp) sets `--button-default-background-color: --fn-bg`.
  - This builds to `white` in `theming/direct-channel/direct-channel.min.css`.
  - In `.storybook/theming.css` it builds to `light-dark(white, #090d17)`.
- The hover token `--button-default-hover-background-color` is `--fn-bg-var` (`#f6f9fc`). That is an opaque near-white, which would look like a hole on any non-white surface once the rest state is transparent.
- `--button-default-border-color` is not defined in any theme. The border declaration is therefore invalid at computed time, so the button has no border. This is unchanged by the proposal.

### The token has two more readers

| Reader | What it does |
|---|---|
| `$email` map, `default-theme.scss:283-285` | `--email-button-default-bg` and `--email-button-default-border` alias `--button-default-background-color`. |
| Legacy compiled `html/vanguard/styles/vanguard.css` | Its `.btn.btn-default` rule reads the same tokens. It is loaded for the PHP views (`application/config/content/vanguard/clients.php`), and `btn-default` appears in **42** files under `application/views/…`. |

So `--button-default-background-color: transparent` would also change emails and the legacy PHP pages.
**Amended plan:**
- Keep the token and change its value.
- Decouple the two readers first:
  - emails re-alias to `--fn-bg`;
  - the legacy `.btn-default` pins its own fills, or is accepted as a ghost after a check.

The theme request covers both.

## 2. The Ado text colour: a typed `textColor` prop, not an accent theme

- `--ado-text` does not exist in Vanguard or in the webapp theme. It exists only in the design mock
  (`tmp/ado hub/src/styles/tokens.css:84,94`: `oklch(from var(--ado-base) min(l, 0.5) c h)`).
- The webapp theme has `--ado-base` (`default-theme.scss:174`, `#006a85`).

**Amended decision:** no accent tokens. The default type gets a `textColor` prop that takes a closed enum
(`ButtonTextColors`), starting with `ado`.
- A Sass map in the Button styles turns each key into a rest colour and derives its hover colour (`ado` → `--ado-base`,
  hover `color-mix(in oklch, <colour>, black 25%)`).
- Later products add an enum value and a map entry, with no new theme tokens.
- The prop acts only on `type={ButtonTypes.default}`; other types ignore it. A type-level restriction (a separate
  default-props variant) was tried and dropped: it broke wrappers that spread `ButtonProps` and then set `type`
  (ActionButton, HoverableCard, ActionBarFooter), and the webapp has the same pattern.
- The deprecated `color` / `hoverColor` props are not extended.

## 3. Webapp sweep (`rc-webapp/html/react/src`)

The sweep covered 165 non-story usages of `ButtonTypes.default` in 108 files, plus the Vanguard components that render
a default button internally. The default type is never implied: `Button`'s own default is `primary`. It is set
explicitly, or through `InfoBox` `negative`, `ModalFooter` `negative`, `ModalHeader` close, `EditableCard`, and similar.

**Background that matters:**
- `PageSection` is white by default. `FlatPageSection` is transparent.
- With nothing underneath, the button sits on the page body:
  - in Ado mode, the body is `--fn-bg-var` grey;
  - in the legacy shell, it is a pastel gradient.

### 3.1 Risky: needs a different type or a local fill when the change lands

| file:line | surface | impact | suggested |
|---|---|---|---|
| `_common/LandingPage/Hero/Hero.tsx:29` | `gradientPrimaryMesh` (dark mesh). Default is picked when `cta.type` is unset: ads, reputation and social `FeatureGatedLandingPages` configs | Main CTA becomes blue text on a dark mesh: illegible | `muted` + `inverted`, or a local white fill |
| `ai-extensions/AIExtensionsLandingPage/AIExtensionsLandingPage.tsx:222` | `.transformCard` AI gradient, on-dark text | CTA disappears into the gradient | `muted` + `inverted`, or a local white fill |
| `ai-extensions/AIExtensionsLandingPage/AIExtensionsLandingPage.tsx:143` | White fade over the AI gradient | Depends on viewport height | `secondary`, or a local fill |
| `_common/UpsellingTrigger/UpsellingTrigger.tsx:27` | `--i100` gradient banner | Loses its white chip | `secondary` |
| `ga/_common/KeywordsTable/KeywordsTableItem/EditMode/EditMode.tsx:150` | Row `--i100`, with forced-white inputs | Cancel button looks tinted next to white inputs | `muted` (or accept) |
| `_widgets/LocationSummaryPageHeader/…Cover/LocationSummaryPageHeaderCover.tsx:175`<br>`…Logo/LocationSummaryPageHeaderLogo.tsx:170, 222` | Over the cover photo and logo image | A local `.btn-edit-cover` / `.btn-add-logo { background: var(--fn-bg) }` keeps the rest state white. **Hover must be checked**: the new translucent hover may lose to or beat that rule | keep + verify; alternative `muted` + `inverted` + `blurred` |
| `upsellings/LandingPage/models/PackageBasedModel/LandingPageNav/LandingPageNav.tsx:45` | Coloured nav. Already `bg-transparent` with on-CTA text | Rest state unchanged; the slate hover will show on the coloured bar | keep + check hover |

Unaffected because a className forces a fill:
- `StatisticsBoardItem.tsx:242`
- `BoostOverviewDetails.tsx:135`
- Vanguard `ActionButton`

### 3.2 Minor: grey, page body, or a tinted-hover card

About 25 usages fall here. Ghost on grey is the intended look, so all of them can keep `default`.

- **Grey, or tinted on hover:**
  - `GASetup/AdVersions/AdVersions.tsx:35` (on `--fn-bg-var`)
  - `AiVisibilityCustomQueries.tsx:97, 111, 125` (FlatPageSection)
  - `GoogleAdsPortfolioBiddingStrategiesPage.tsx:146` (breadcrumb)
  - `HoverableCard.tsx:149` and `EditableCard` pencils (the card tints 15% on hover; the button now blends with it)
  - `OptimiserSetupHeader.tsx:44` (sticky blurred header over content)
- **Surface undetermined (no fill in their module chain; page body):**
  - GA setup steps: `AdHeadlines`, `AdDescriptions` and the single `AdHeadline` / `AdDescription`
  - Google Ads forms: `GoogleAdsCampaignForm`, `GoogleAdsCampaignSettingsEditor`, `GoogleAdsCalloutsPanel`, `GoogleAdsPmaxSettingsEditor`
  - `BuildStatusPanel`, `EngagementPostsList:257`, `ReviewWidgetCarouselControls`, the PrintMaterials card, `OptimiserKeywordsSelect`, `VayuListingsAndPublishingDirectories`, `BoostQuestion`
  - admin top bars
- **Near-white bars:** the upselling-links nav bar and footer (`rgba(--fn-bg, .8)`). Negligible.

### 3.3 Safe: white surfaces (about 120 usages)

The surfaces are modals, drawers, `SurfaceCard`, `PageSection`, ActionBar and `--fn-bg` footers. That covers:
- the location edit forms (19);
- account settings (7) and assistant settings (8);
- ai-visibility drawers (5), the WebsiteBuilder cards (14) and the other presence pieces (6);
- the comment and review cards (11), reputation (4), ai-conversations footers (2), GA and Ads modals (7);
- engagement, seo and vision bits (7), admin (about 20), and `AffiliateNav`.

`ChronicleEntry.tsx:187` already wants a ghost look (see the comment in its module), so it improves.

### 3.4 Vanguard-internal default buttons

| Component | Webapp usages | Risk |
|---|---|---|
| InfoBox | 108 | Low. Border only, no tinted fill. |
| ModalHeader close, ModalFooter negative | 136 | Safe. Headers have no fill. |
| ActionCard | 22 | Minor. The `transparent` variant is used twice. |
| DateRangePicker | 16 | Safe. Popovers are white. |
| EditableCard | 43 | Minor, as above. |
| Cropper, RteLinkEditor, AIAssistantPanel, TextEditDrawer, MultiSelectDrawer | | Safe. They render in modals, drawers or popovers. |

## 4. The Needs-you row action

The row action is **not a Vanguard Button** today. It is a native `<button className={styles.action}>` at
`html/react/src/components/ado/AdoDashboard/tasks/NeedsSection/NeedsTaskRow/NeedsTaskRow.tsx:39-52`:
- `Text` in `--fn-fg-cta`, followed by `IconNames.caretLeft`;
- styled as a hand-made ghost in `NeedsTaskRow.module.scss:4-18`: transparent, `:hover` `--fn-bg-var`, 4px radius;
- it sits on a white `TaskCard`.

The mock is `<Button tone="ghost" accent icon={<LucideChevronRight/>} iconPosition="right">`
(`tmp/ado hub/src/components/AfterDashboard/Trays.tsx:137`).

Once this lands, the webapp can replace the native button with
`<Button type={ButtonTypes.default} textColor={ButtonTextColors.ado} size={ButtonSizes.small} iconRight={IconNames.caretLeft}>`.
That is a webapp follow-up, not part of the Vanguard change.

## 5. Breaking?

- **API:** non-breaking. `textColor` is a new optional prop on the default type.
- **Visual:** a breaking change for the default type wherever the surface is not white. Seven usages need a webapp change
  together with the theme value change (3.1). About 25 change subtly (3.2).
- **Dependency:** the transparent look depends on the theme value change and on decoupling the email and legacy readers.
  The generator lives in the webapp, so both land in one webapp PR. `textColor` has no theme dependency.

## 6. Plan (option A, amended)

1. Design sign-off: the hover fill, the derived `ado` hover colour, `--ado-base` against the mock's capped
   `--ado-text`, and the replacements for the risky usages.
2. Vanguard: add `ButtonTextColors` and `textColor` (map plus stories). The default background keeps reading
   `--button-default-background-color`, so there is no change there.
3. Webapp, one PR:
   1. re-alias the email tokens;
   2. pin or accept the legacy `.btn-default` look;
   3. change the two `--button-default-*` values;
   4. fix the 3.1 usages;
   5. bump Vanguard and move the Needs-you row to `Button` with `textColor`.
4. Visual QA: landing pages, the location header, the Ado dashboard, one email, and a few legacy PHP views.
