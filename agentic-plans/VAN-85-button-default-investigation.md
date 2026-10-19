# VAN-85 point 4: transparent `default` button and its `accent` option (investigation)

Status: investigation only. No component code has been changed yet. The theme request is in
`VAN-85-button-default-theme-request.md`.

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

So `--button-default-background-color: transparent` would also change emails and the legacy PHP pages. That is why the
theme request asks for **new** tokens instead of changing this one (see the request, section 1).

## 2. `--ado-text`

- `--ado-text` does not exist in Vanguard or in the webapp theme.
- It exists only in the design mock: `rc-webapp/tmp/ado hub/src/styles/tokens.css:84,94`. There it is `oklch(from var(--ado-base) min(l, 0.5) c h)`, which gives `#006a85`.
- The webapp theme does have `--ado-base` (`default-theme.scss:174`, `#006a85`) and the derived `--ado-*` colours.
- In the mock, the accent is `.ghost.accent { --fg: var(--ado-text) }`. Its hover only adds the ghost fill, and the text colour stays the same.

**Decision (recommended): a role token set that aliases the palette.** The theme would provide:
- `--ado-text` in the palette;
- `--button-default-accent-text-color` and `--button-default-accent-hover-text-color`, both aliasing `--ado-text`.

Vanguard would read `var(--button-default-accent-text-color, var(--ado-text, var(--ado-base, #006a85)))`.

Why this instead of reading `--ado-text` directly:
- It follows the existing pattern, where button tokens alias the palette.
- A white-label brand can retune the button without touching Ado's palette.
- The fallbacks mean nothing waits on the theme release. With the default base, the fallback is already exact, because `--ado-base` has `l` = 0.4868, which is below 0.5.

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
`<Button type={ButtonTypes.default} accent size={ButtonSizes.small} iconRight={IconNames.caretLeft}>`.
That is a webapp follow-up, not part of the Vanguard change.

## 5. Breaking?

- **API:** non-breaking. `accent` is a new optional prop.
- **Visual:** a breaking change for the default type wherever the surface is not white. Seven usages need a webapp change
  before or together with the Vanguard bump (3.1). About 25 change subtly (3.2).
- **Theme:** no hard dependency if Vanguard uses fallbacks. Without the theme update, the hover and accent use the
  fallback values, which are exact for the default brand. White-label brands get their own colours once the theme
  ships.

## 6. Options

| | What | Pros | Cons |
|---|---|---|---|
| **A (recommended)** | Vanguard makes the default rest fill `transparent` itself. Hover reads the new `--button-default-ghost-hover-background-color` (fallback `rgba(185,197,216,.12)`). `accent` reads `--button-default-accent-text-color` (fallback chain to `--ado-text` / `--ado-base`). Request the new tokens (theme request). Ship as a minor release with a "visual change" note, and fix the 3.1 usages in the webapp alongside the bump. | No dependency on the theme release. Emails and the 42 legacy PHP views are untouched. Fully additive tokens. | Stops reading the existing token for the rest state. That token stays in the theme only for the email and legacy readers. |
| B | Flip `--button-default-background-color` to `transparent` (and the hover token) in the theme. Vanguard changes only for `accent`. | No component change for (a). | Needs the theme release. Hits emails (unless they are re-aliased) and the legacy `.btn-default` pages. The opaque hover token must change too, and that also reaches the legacy pages. |
| C | Keep `default` as it is and add an opt-in `ghost` (transparent) flag next to `accent`. | Zero visual change for consumers. | Does not do (a) as the ticket asks. The white default lives on. |

**Recommendation: A.** Also fix the seven 3.1 usages in the webapp, and convert the Needs-you row, in the same webapp
PR that bumps Vanguard.
