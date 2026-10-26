# VAN-85 · Button point 2 — truncate long labels with an ellipsis

Jira: https://rankingcoach.atlassian.net/browse/VAN-85

## Why the ellipsis never shows today

DOM: `span.button-container` (no styles) › `button.button` (`inline-flex`, `overflow: hidden`) › `div.button-inner-container` (`flex`) › `[icon] .button-text [icon]`.

Three links in the chain stop the label from shrinking:

1. **`.button-inner-container`** is a flex item of the button with `min-width: auto`, which resolves to its min-content width, which is the full nowrap label. It never shrinks; the button's `overflow: hidden` just **clips** it (that's the "cut off" look on phones).
2. **`.button-text`** is `display: inline-flex`. `text-overflow` does not apply to flex containers (the label is an anonymous flex item), so even when it's narrower than its content it clips without an ellipsis.
3. **The button and the wrapper span** have no `max-width`, so they size to the full label and overflow whatever contains them: a block parent, a flex row or a grid cell.

## Measured (Storybook, Chromium, 220px container, label "Very Long Button Text That Should Not Wrap", 377px wide)

| Layout | Today | A: inner chain + `button { max-width:100% }` | **A+: A + `span { max-width:100% }`** | B: A+ + `span { min-width:0 }` |
|---|---|---|---|---|
| block parent | 377 (overflows) | 220 … | 220 … | 220 … |
| flex row, button alone | 377 (overflows) | 377 (overflows) | **220 …** | 220 … |
| flex row, text (`flex: none/grow`) + long button | 377 + text 42 | unchanged | **220 … + text 42 (row overflows 50px instead of 199px)** | 147 … + text 65, fits |
| flex row, text `flex:1` + long button | 377 + text 42 | unchanged | 220 … + text 42 | 170 … + text 42, fits |
| grid `1fr` | 377 | 377 | 377 (cyclic % ignored in track sizing) | 220 … |
| flex row, wrapping text (no flex basis) + **short** button | 73 | 73 | **73 (unchanged)** | **32, label gone (regression)** |

"…" = ellipsis shown. Short-label buttons render pixel-identical with A/A+ (label offset, height and width checked; `display: block` vs `inline-flex` on `.button-text` makes no difference).

## 1. Is it breaking? Does it need the webapp's theme?

- **No theme dependency.** Pure layout; no token is added or changed.
- **A+ is non-breaking.** `max-width: 100%` only changes a button that is already wider than its whole container, which today overflows or gets clipped. `min-width: 0` stays inside the button (inner container), so it can't shrink the button in a layout where it fits today. A tiny `flex-shrink` on the wrapper was also tried; it doesn't help, because a fractional shrink factor means the button never takes up the leftover overflow.
- **B (wrapper `min-width: 0` by default) is breaking.** In any flex row where the button sits next to text that has no `flex-basis: 0` (plain `flex: none` / `flex-grow: 1`), flex-shrink is shared out by basis size, so the button shrinks along with the text. In the test above a "Short" button collapsed to 32px with the label fully hidden. It would need an audit of every row in the webapp.

## Options

1. **A+ by default (recommended, non-breaking):** inner chain `min-width: 0`, icons `flex-shrink: 0`, `.button-text { display: block }`, `max-width: 100%` on the button and the wrapper span. Fixes buttons that are alone in their row or column, sit in a block parent, or use `w100`. When a button shares a flex row with text, it truncates only once it's wider than the whole row.
2. **Opt-in prop for full shrink in shared rows** (follow-up if needed): e.g. `shrink` / `textWrap="truncate"`, which adds `min-width: 0` to the wrapper so the button gives up width alongside its siblings. The webapp turns it on per row action. Until then, the webapp can get the same result by wrapping the button in a `min-width: 0` flex item.
3. **B by default:** not recommended (see the regression above).

## 2. Webapp sweep (`rc-webapp/html/react`)

Swept `src/` against the installed `@rankingcoach/vanguard` 2.3.0 build. There are about 1,030 `<Button>` usages: 82 icon-only, 45 `w100`, about 360 sitting directly in a flex row, 78 of those sharing the row with text. Nothing in the webapp relies on a Button being wider than its container on purpose.

Note: in the installed build the wrapper span has no class, because `.button-container` had no rule. A+ adds that rule, so the span now gets a hashed class. `className` still lands on the inner `<button>`, so webapp overrides can't reach the wrapper.

### Row actions cut off on phones

| Where | Layout | Fixed by A+? |
|---|---|---|
| `ai-conversations/widgets/ai/SuggestedActions/SuggestedActions.tsx:60`: AI-written muted chips | direct items of a wrapping flex row | **Yes.** Most visible case (labels come from AI, so they can be any length) |
| `settings/.../Chronicle/ChronicleEntry/ChronicleEntry.tsx:186-218` | wrapping flex row | **Yes** |
| `settings/.../Automations/ScheduleCard/ScheduleCard.tsx:332` "Fix in chat" ("Needs your attention") | wrapping flex row, 64px left padding on phones | **Yes** |
| `ScheduleCard.tsx:352` "Retry now" | inside `span.retryNowWrapper { display: inline-flex }` in a Popover | **No.** The webapp wrapper needs `min-width: 0; max-width: 100%` |
| `ai-conversations/widgets/.../OpeningHoursEditorConversationWidget.tsx:227` | Text + Button in a wrapping, space-between footer | **Yes** |
| `ai-conversations/widgets/_shared/CardFooter.module.scss` (25 usages via CtaButton / ConversationWidgetButton) | flex, wraps below 900px container width | **Yes** once wrapped. Above 900px a button truncates only when wider than the whole footer |
| `ado/AdoDashboard/tasks/NeedsSection/NeedsTaskRow/NeedsTaskRow.tsx:39` ("Needs you" tray) | **native `<button>`**, not vanguard (AW-312 swapped it out), already truncating locally | n/a. Can go back to vanguard Button (see below) |
| `ado/.../NeedsSection/NeedsFocusedCard/NeedsFocusedCard.tsx:51,62` | vanguard Buttons with `textWrap="wrap"` in a wrapping row | n/a. Wrapping looks deliberate; keep it |
| `ai-conversations/widgets/presence/listing-services/.../ChannelConnectionRow.tsx:86,98` | column is a grid track `minmax(112px, max-content)` sized by the full label | **No.** The webapp track needs `minmax(112px, 1fr)` or similar |
| `presence/WebsiteBuilder/_common/WebsiteActivityRow/WebsiteActivityRow.tsx:111-150` | `.actionsColumn { flex-shrink: 0 }` | Only once the label is wider than the column. The webapp could drop the `flex-shrink: 0` |

### Webapp workarounds to revisit after the library release

1. `NeedsTaskRow.module.scss:5-31`: the local ellipsis CSS on the native button. Could move back to a vanguard `Button` (TaskCard `.action` already has `min-width: 0; max-width: 40%`, which A+ respects). Optional, because it's a custom ghost style with a caret.
2. `GoogleAdsAdGroupDetailContent.module.scss:30`: `.content button { max-width: 100% }` is now redundant. **Remove.**
3. `ChannelConnectionRow.module.scss:57-59`: `.actions > * { white-space: nowrap }`. Redundant once the track is fixed.
4. `LogoGalleryConversationWidget.module.scss:42-51` and `GoogleBusinessProfileCreateNotInPlanNotice.module.scss:37-44`: `!important` overrides that force the label to wrap. Replace with `textWrap="wrap"` (or drop them if an ellipsis is acceptable).
5. Labels shortened or hidden on narrow screens: `GoogleAdsNavigationLayout.tsx:133-139` and `SpaceshipModelNav.tsx:43-54`. These are product decisions and can stay.
6. `src/styles/_button-props.scss`: a dead mixin targeting old button classes, imported nowhere. Can be deleted.

### Why the wrapper does not get `min-width: 0` by default (B)

The sweep found non-wrapping rows where a Button sits next to text with an auto flex-basis. With B, these would start truncating, or squash icon-only buttons:
- `AiVisibilityPendingAccordionItem.tsx:22`
- `AIAdvisorCategoryCard.tsx:95`
- `FineTuningServicesItem.tsx:94`
- `AiVisibilityCustomQueryDraftRow.tsx:135`
- `AiMemoriesDrawer.tsx:352` ("Undo")
- `BusinessListItemWithConnections.tsx:58`
- `EngagementOverview.tsx:140,166`
- `NoBusinessSuggestions.tsx:64,86`
- `ConnectAccountTrigger.tsx:55`

If shared rows need full shrinking later, make it opt-in (option 2).

## Known limitation: `textWrap="wrap"` with a long unbreakable word in a shared row

With `textWrap="wrap"` long labels wrap; they never truncate. A+ improves one case: the label is now a block, so `overflow-wrap: break-word` takes effect and a single long word (e.g. a URL) breaks to fit when the button is alone in its row. Before, it overflowed (258px in a 220px container).

**Still overflowing:** a long unbreakable word in a button that shares a flex row with text. The wrapper can't shrink below that word's width, so the row overflows. Measured in a 220px row: overflow of 40px next to "Row title", 61px next to a long title.

Options measured, all rejected as a default:

| Option | Long URL next to text | Short "Edit" next to long text (fits today) |
|---|---|---|
| Wrapper `min-width: 0` | fits, URL breaks | **regresses:** 48px, label clipped, row still overflows 17px |
| Label `overflow-wrap: anywhere` | fits, URL breaks | **regresses:** wraps to "Ed / it" |
| Wrapper `min-width: calc-size(min-content, min(size, 50%))` | fits, URL breaks | unchanged |

`calc-size()` is the only one that's safe as a default, but it's Chromium-only (Chrome/Edge 129+; not Firefox or Safari, including iOS Safari as of 26.5). It would do nothing on iPhones, which is where this matters. The webapp hasn't hit this case yet. When it does, a consumer can wrap that Button in an element with `min-width: 0`; if that becomes common, an opt-in Button prop can do the same. **Decision (VAN-85): leave as is.**

## Outcome

Implemented A+ in `fix(button): truncate long labels with an ellipsis (VAN-85)`:
- Story `Button/Button Truncate`: a 343px phone frame with a block parent, a row action with an icon, a muted row action, and a short label next to wrapping text.
- The story's play test fails on master (the button is 503px in a 343px frame) and passes with the fix.
- All 49 Button stories and the 10 Button specs pass, including `ButtonTextWrapShortLabelUnchanged`.
