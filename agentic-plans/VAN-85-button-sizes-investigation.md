# VAN-85 · Button point 1: harmonize sizes (investigation)

Ticket: [VAN-85](https://rankingcoach.atlassian.net/browse/VAN-85), Button point 1. Every type should use the **muted** size set, so the same `size` gives the same footprint whatever the `type`.

Baseline: `master` / v2.4.0. The webapp sweep ran on `rc-webapp` at `1e62365a352` (2026-10-19). That webapp pins `@rankingcoach/vanguard@2.3.0-release-tabs-and-buttons-redesign.313`, so it picks up nothing until it bumps the version.

**Decision (2026-10-19): option A.** Implemented on this branch:

- One size set for every type, and `extraLarge` allowed on every type.
- Vanguard's own callers bumped.
- `button-row-size` and the footers simplified.
- New "Size Matrix" story and a size spec added.
- `scripts/codemod-button-sizes.js` added.

The webapp steps are in `VAN-85-button-sizes-webapp-migration.md`.

## TL;DR

- **This is a visible change, shipped as a minor release (no major bump).** Every primary, secondary, default and shimmer button gets a new footprint at its current `size`. The biggest shift is desktop `medium`, the implicit default: it goes from 48px tall with 16px text to 32px tall with 12px text. The ticket says the same: flag it clearly in the CHANGELOG (released as a minor, not a major).
- **No theme change is needed.** The size values are literal SCSS spacings, not theme tokens. The only theme token involved, `--buttons-border-radius`, is already shared by every type and doesn't change. Nothing goes to the webapp team.
- **The webapp needs a coordinated change.** One mechanical step, `small → medium` and `medium → extraLarge` for every non-muted button, keeps today's heights. `large` has no equivalent and drops from 60/48 to 48/40 (only 6 usages). About 25 call sites pick their type or size at runtime and have to be checked by hand.
- **Recommendation: option A.** Ship the harmonized sizes in vanguard **2.6.0** (minor), bump vanguard's own callers in the same change, and send the webapp a codemod plus a manual list. Design can then shrink things on purpose afterwards, instead of the whole app shrinking at once.

## 1. Current sizes (measured from the SCSS)

`$x1` = 8px. Height = 2 × padding-y + 16px line (label). Values are mobile / desktop (`>mobile`).

| size | muted: height | muted: pad-x | muted: text | others: height | others: pad-x | others: text |
| --- | --- | --- | --- | --- | --- | --- |
| `small` | 32 / **24** | 12 / 8 | 12px | 40 / **32** | 16 / 16 | 16px |
| `medium` (default) | 40 / **32** | 16 / 12 | 12px | 40 / **48** | 16 / 24 | 16px |
| `large` | 40 / 40 | 16 / 16 | 14px | 48 / **60** | 24 / 32 | 16px / 20px |
| `extraLarge` | 40 / 48 | 16 / 20 | 16px | not allowed (TS `Exclude`) | | |

Gap between icon and label: muted `small` is 4px, everything else 8px. The icon glyph is 16px everywhere (`--label-height`), and muted never changes it.

**What changes for non-muted types if they adopt the muted set as-is:**

| size | height (mobile / desktop) | text (desktop) | pad-x (desktop) |
| --- | --- | --- | --- |
| `small` | 40 → 32 / 32 → 24 | 16 → 12px | 16 → 8px |
| `medium` | 40 / 48 → 32 | 16 → 12px | 24 → 12px |
| `large` | 48 → 40 / 60 → 40 | 20 → 14px | 32 → 16px |
| `extraLarge` | new: 40 / 48 | 16px | 20px |

**The one-step bump that keeps today's footprint** (this matches the "secondary → muted" table already in `Button.tsx` JSDoc and the `ActionBarFooter` mapping):

| today (non-muted) | after harmonizing | height | text (desktop) | pad-x (desktop) |
| --- | --- | --- | --- | --- |
| `small` | `medium` | same (40 / 32) | 16 → 12px | 16 → 12px |
| `medium` (default) | `extraLarge` | same (40 / 48) | same 16px | 24 → 20px |
| `large` | `extraLarge` | 48 → 40 / 60 → 48 (shorter) | 20 → 16px | 32 → 20px |

## 2. Is it breaking? Does it need theme tokens?

- **Visible change, not an API break; shipped as a minor.** About 830 non-muted buttons in the webapp, plus about 55 in vanguard itself, change footprint unless their call sites are bumped. The API is not breaking: `extraLarge` gets *added* to the non-muted props, and nothing is removed. A consumer that doesn't touch its code still compiles, but it renders smaller.
- **Theme: no request needed.**
  - Heights, paddings, font sizes and the gap are literal `$x*` spacings in `Button.module.scss`, not tokens.
  - `--buttons-border-radius` (from the theme) is already used by every type and doesn't depend on size. Shimmer keeps its `× 3`.
  - `--buttons-typeface` and `--medium` (weight) don't change.
  - So `theming/*.min.css` and `.storybook/theming.css` stay untouched.
- **Side effect in the library:** today's non-muted large desktop sets `--letter-spacing: 0.02em` and a 20px label. Both go away (letter-spacing stays 0.04em everywhere).

## 3. Webapp sweep (`rc-webapp/html/react`)

Method: a TypeScript AST scan of every `.tsx` file. It finds every JSX `<Button>` whose binding is imported from `vanguard` and reads its `type` and `size` attributes. Script and raw rows: `van85-button-sweep.js` / `van85-button-usages.json` in the shared side-session notes folder. **1,033 usages in 505 files.**

### 3.1 Literal type × size (implicit defaults counted)

| type | small | medium (incl. implicit) | large | extraLarge | total |
| --- | --- | --- | --- | --- | --- |
| secondary | 134 | 230 (216 implicit) | – | – | 364 |
| primary (incl. implicit type) | 53 | 235 (220 implicit size) | 6 | – | 294 |
| default | 67 | 78 | – | – | 145 |
| shimmer | 1 | 22 | – | – | 23 |
| **non-muted subtotal** | **255** | **565** | **6** | – | **826** |
| muted (unchanged) | 66 | 81 | 8 | 12 | 167 |

The remaining ~40 usages pick their type or size at runtime (§3.3).

### 3.2 Proposed mapping for the webapp

1. **Mechanical (codemod), non-muted literal types only:**
   - `size={ButtonSizes.small}` → `ButtonSizes.medium`
   - no `size` / `ButtonSizes.medium` → `ButtonSizes.extraLarge`
   - `ButtonSizes.large` → `ButtonSizes.extraLarge`
   - That's about 820 edits. The height stays the same. Text shrinks only on today's `small`: 16 → 12px on desktop, which is how muted `medium` looks today.
2. **`large` (6 call sites):** FeatureBox:149, MobileAppInviteSheet:118/128, CardBasedBenefits:516, UpsellingCard:210, SpaceshipUpsellCard:95. These are upsell and invite CTAs that drop from 60 to 48px on desktop. Design approved the drop on 2026-10-21. There is no 60px size left.
3. **Muted buttons:** untouched.

### 3.3 Manual review: type or size picked at runtime

These won't be caught safely by a codemod, because one `size` serves both a muted and a non-muted type.

- **Toggles that mix `primary` and `muted` at `small`:** AgentControlPanel:199/218/229, DashboardMeasurements:35, WidgetSetControls:28. Today the selected (primary) chip is 32px and the others (muted) are 24px on desktop, so the row jumps in height when the selection changes. After harmonizing, all of them are 24px with no jump, and that's a fix. **Keep `small`; don't bump.**
- **Send/submit buttons that swap between shimmer and muted:** ConversationMessageInput:418 and MediaPromptInput:85. Today `shimmer small` (32) was paired with `muted medium` (32). After harmonizing, the shimmer `small` is 24, so change the shimmer branch to `ButtonSizes.medium` (or drop the ternary).
- **Ternaries between two non-muted types:** for example PartnerApiTesterLoginForm ×4, AgentSchedulesList:744, AiVisibilityCustomQueries:110, StatusInfo:149, WebsiteThemeManagerPanel:181, WebsiteBuildProgressCard:127, YourWebsiteCard:407. Apply the same bump as §3.2.
- **`cta.type ?? primary` in landing sections:** CarouselSection, FeatureSection, FinalCTA, StatsSection, BusinessListItemWithConnections. Check the CTA types configured; bump if non-muted.
- **A `size` prop forwarded through a wrapper:** SectionMissing:66, WebsiteTemplateExportButton:35, WebsiteLookReviewInvitation:70–100 (mixes primary, default and muted on one `size`), WebsiteReleaseStateLine:94–132 (`compact ? small : undefined`), AiVisibilityUpsellTriggerSmall:50, AgentControlButton, AgentAdminSettingsButton, ProjectActionsMenu, MediaItemActions.
- **Spread props:** ConversationWidgetButton:8 (wraps 15 call sites), AIExtensionsTrigger:135, PublishingBoardCTA:21, HoverableCard:143.

### 3.4 CSS overrides and fixed-height layouts

Paths are under `src/components/`. Outside styles can only reach a vanguard Button through `button`, `.material-ripple`, `[class*=]`, `.rc-text`, or the `className` prop, which lands on the inner `<button>`. No spec, TS constant or snapshot in the webapp checks button heights. Chromatic is set up, so every story with a Button will show a diff.

The **Option A** column says what happens if the call sites get the §3.2 bump. **Option B** is what happens without it.

| where | what it does | A (bumped) | B (not bumped) |
| --- | --- | --- | --- |
| `admin/ResellerOverviewDashboard/ResellerOverviewDashboard.scss:9` `.h-40` | `height: 40px !important` on a small search button | stays 40 | stays 40 (fights the 24/32 size) |
| `admin/agent/Conversations/AgentConversationsList.module.scss:101` `.filterBar .filterButton` | height and min-height of 40px, matching the filter controls | ok | ok (deliberate) |
| `upsellings/.../SpaceshipUpsellCard.module.scss:70/80` `.card .cta.cta` | `--padding-y: 10px` plus a 1rem label, aiming for 40px on a `large` button | **check**: depends on the `.size-*` specificity and the 2 × padding-y + label formula | same |
| `seo/.../OptimiserSetupHeader.module.scss:26` `.headerClose` | 40 × 40 on a default small icon button | ok | ok |
| `_common/BundleBadge/BundleBadge.module.scss:85` `.bundleBtn` | its own `padding: 12px 16px` and 14px text | ok | ok |
| `ai-extensions/AIExtensionsTrigger/AIExtensionsTrigger.module.scss:6/20` | `--padding-y: 12px` forced on every size; fixed floating button | ok | taller than the size implies |
| `ai-conversations/widgets/common/LogoGalleryConversationWidget/...module.scss:42` | `height: auto; min-height: $x4`, assuming "medium = 32" | ok | mobile mismatch |
| `presence/GBP/GoogleBusinessProfileCreateNotInPlanNotice/...module.scss:37` | `height: auto` plus label `white-space: normal` under 480px | **check**: the CSS refactor must keep `height` on `.button` and nowrap on `.rc-text` | same |
| `ai-visibility/common/PaginationPageButtons.module.scss:10` `.pageButton` | `min-width: $x4` on muted small | unchanged (muted) | unchanged |
| `presence/ListingsAndPublishing/.../BusinessDirectoriesCard.module.scss:13`, `seo/VayuListingsAndPublishing/.../VayuListingsAndPublishingDirectories.module.scss:32`, `reputation/.../ReputationReviewSourcesListItem.module.scss:20` | 32 × 32 / 32px-tall wrappers around a small button | ok | off-centre at 24px |
| `ado/.../AdoTutorialMessage.module.scss:25` `.continue-row` | `min-height: $x6` (48) for a medium button | ok | 16px empty space |
| `engagement/.../ImagesLibraryModalHeader.tsx:105`, `engagement/EngagementChat/.../EngagementChatMessagesListInput.tsx:12`, `_common/EntityListPage/EntityListToolbar/EntityListToolbar.tsx:110` | Input or Select next to a Button, aligned by height | ok | heights no longer match |
| `_common/EntityListPage/EntityListTable/EntityListTable.module.scss:289` | sticky column sized for a 32px icon button | ok | uneven spacing |
| `presence/Competitors/AddCompetitorDrawer.module.scss:11/14` | `calc(100dvh - …)` that assumes a 40/48 close-button row | ok | gap |
| `agent/.../AgentCustomerProgressStepper.module.scss:155` | `margin-right: $x8` assuming a `$x4` close button (AgentTopBar small/medium) | ok | slight drift |
| `_common/StatisticsBoard/.../StatisticBoardItemPlaceholder.tsx:16` | 48px skeleton for a medium CTA | ok | layout jump |
| `settings/MediaLibrary/MediaPromptInput.module.scss:15/41`, `ConversationMessageInput.module.scss:138` (`max-height: $x5`) | fields sized around the submit buttons | ok, if the shimmer branch is set to `medium` (§3.3) | ok, shrinks only |
| `styles/_material-ripple.scss:10` | `.material-ripple > span { padding: 15px 25px }` | not imported anywhere, so it doesn't apply; it could be deleted | same |

Low risk (width or colour only): `ads/.../GoogleAdsAdGroupDetailContent.module.scss:30`, `main/.../EngagementOverview.module.scss:57`, `ai-extensions/.../Markdown.module.scss:145`, `admin/PartnerApiTester.module.scss:489` (native buttons). The other `className`s passed to Buttons set only margins or colours.

**Summary:** with option A, only two places need a real look: SpaceshipUpsellCard, because it depends on internals, and the GBP notice, which overrides height. With option B, about 15 layouts break.

## 4. Inside vanguard

- **Callers in vanguard** (about 55 non-muted, not counting stories). For example `default small` ×18 (RteLinkEditor, CommentItem, DateRange*, InfoBox, ActionCardHeader, EditableCard, HoverableCard), primary/default medium in ExportXLS, SectionMissing and AIAssistantPanel, and `FeatureBox` large. They get the same bump in the same PR, so the library's own components keep their look.
- **`button-row-size.ts`:** today it returns `muted → extraLarge` and others → `medium`. After harmonizing, every type returns `extraLarge`. The function and its `RowButtonTypeAndSize` type collapse to `{ type, size: ButtonSizes.extraLarge }`. Keep the helper so `ModalFooter` and `ActionBarFooter` still have a single source.
- **`ActionBarFooter`:** this remaps `secondary small → muted medium` and defaults muted to the row size. Once the sizes line up, the remap becomes "every button uses the row size unless the consumer sets one". Today the non-muted footer buttons rely on the implicit `medium` = 48px, so they need the row size too, otherwise they shrink to 32px.
- **`FooterButtonHeights` stories (Modal and ActionBar):** they assert 48 / 40px for every combo. They stay valid as regression tests once the footers use `extraLarge` for all types. Update the JSDoc wording.
- **Docs:** the "secondary → muted" table in `ButtonTypes.secondary` JSDoc and the `ButtonSecondaryToMuted` story become simpler, because the sizes now line up 1:1. Replace them with a "migrating from pre-2.6 sizes" note and story (the one-step bump in §1).
- **CSS refactor:** move the `.size-*` blocks out of `&.button-muted` to the `.button` level and drop the old `MODIFIERS - Sizes`. Give every type an explicit `height: calc(2 * var(--padding-y) + var(--label-height))`. Muted currently uses `height: unset` and has no border. Non-muted types keep `box-sizing: border-box` with their 1px border inside, so they don't grow 2px. Merge the two `textWrap` paths, the muted line-height one and the non-muted min-height one, into one.
- **Specs:** `Button.spec.tsx` and `_ButtonMuted.spec.tsx`. Add a spec that checks every type gets the same size class and padding per size, plus a story that shows a type × size matrix with height play-assertions on both breakpoints.

## 5. Options

| | What | Pros | Cons |
| --- | --- | --- | --- |
| **A (recommended)** | Harmonize per the ticket, release **2.6.0** (minor), bump vanguard's own callers, and give the webapp a codemod (§3.2) plus the manual list (§3.3/§3.4). | Matches the ticket. The webapp keeps today's look when it bumps (except 6 `large` CTAs). Design can shrink things afterwards. | About 830 one-line edits in the webapp, which have to land together with the version bump. |
| B | Harmonize and release 2.6.0, but the webapp doesn't bump sizes. | No webapp code churn. | The whole app shrinks at once: desktop default buttons drop from 48 to 32px with 12px text, and fixed-height layouts break. Needs a full visual QA pass. |
| C | Change the default `size` from `medium` to `extraLarge` for all types. | Implicit-default usages (~440) keep their look with no edits. | Silently changes the 38 implicit muted buttons from 32 to 48px. The default no longer means "medium". Explicit `small`/`medium` usages still need bumping, so it's breaking anyway. Not recommended. |

