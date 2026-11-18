# Thread B log: data-slot batches (Track 1) and agent surface (Track 2)

Branch `feature/ui-sdk-b-data-slots` (worktree off A's `b423180`). Plan: `ui-sdk-architecture-investigation.md` (A's file, read only here).

## Naming convention (watchdog, 2026-11-18; applies library-wide, A and B)

1. The bare `data-slot="<component>"` goes on the element that carries the component's own styling and state: the element that receives the consumer's `className` and the state classes. State attributes (`data-disabled`, `data-selected`, `data-open`, `data-pressed`, `data-active`, `data-loading`, `data-invalid`; enums as values: `data-size`, `data-variant`, `data-orientation`, `data-type`) go on that same element.
2. When the ComponentContainer wrapper is a different element from that one, the wrapper gets `data-slot="<component>-container"`.
3. When the wrapper itself is the styled root (it receives the consumer className and there is no separate inner root), it gets the bare name and no `-container` slot exists.
3a. Tie-break (watchdog): when the consumer `className` and the state classes land on different elements, the element with the state classes gets the bare slot (Link: the anchor).
4. Parts: `<component>-<part>` (kebab-case: `alert-icon`, `data-table-row`).
5. Booleans are present-empty (`''`) or absent, never `"false"`. Caller-supplied `data-slot` wins over the component's own.
6. ComponentContainer emits no default slot: an unslotted wrapper stays unslotted.
7. Attributes only: no DOM structure, class, CSS, prop (except the approved ComponentContainer data-* pass-through) or behaviour change.

## Decisions received (watchdog)
1. Classification (a/b/c lists) accepted. Non-DOM components get nothing.
2. Q4: ComponentContainer gets an optional typed data-* pass-through (`'data-slot'?: string` + `` [key: `data-${string}`] ``), nothing else forwarded.
3. Q3: no default `component-container` slot.
4. Q1: Text.tsx only, `data-slot="text"` + `data-type`; own commit and own handoff (tierB-inputs.json run).
5. Q2: ModalHeader/ModalBody/ModalFooter are B's, own batch, tell A first.
6. Codex CLI allowed for drafting and read-only review; output is B's responsibility.

## Batches

### Rules learned in batch 1
1. Never put `data-slot` on an element that carries a `Mui*` class: A's `src/primitives/react/TextField/TextField.scss` uses `.Mui*-root:where([data-slot])` as the own-core marker, so a slot there would switch MUI-rendered elements onto own-core CSS.
2. ComponentContainer pass-through excludes `data-testid` in any casing (`FadedCarousel` passes `data-testId`, rc-webapp passes `data-testid` in 3 places; both were dropped before and must stay dropped) and maps booleans to `''`/absent.
3. "Caller-supplied data-slot wins" applies where caller props reach the DOM (ComponentContainer, GlobalStateComponent, FrostedGlass, PageContainer); components without a rest-props path cannot receive one, so nothing to override.

### Batch 1: ComponentContainer + most-used own components
| Component | Attributes |
|---|---|
| ComponentContainer | optional `data-*` pass-through (no default slot) |
| Alert | `.Alert-container` `alert-container`; `.rc-alert` `alert` + `data-type` |
| Loader | `loader-container`; `.loading` `loader` |
| Switch | `switch-container`; label (consumer className) `switch` + `data-size`, `data-checked`, `data-disabled`, `data-readonly`, `data-loading`; `switch-input`; `switch-loader` |
| Link | `<a>` `link` + `data-disabled` (consumer className goes to the inner Text; the anchor carries `.link`/`.disabled`) |
| DataTable | `data-table-container`; `<table>` `data-table` + `data-size`; `data-table-head/body/foot`; `<tr>` `data-table-row` + `data-selected`; cells `data-table-cell` |
| StatusBadge | root `status-badge` + `data-variant` (small/big/glass), `data-size` (small), `data-status` (small/big); `status-badge-value` |
| Icon | `<span>` `icon` + `data-icon` (name), `data-size` |
| InfoBox | root (consumer className) `info-box` + `data-type`; `info-box-content`; `info-box-body` |
| GlobalStateComponent | `global-state` + `data-hoverable`, `data-blurred`, `data-shimmering`; `global-state-blur`; `global-state-shimmer` |
| PageSection | root `page-section` + `data-background`; `page-section-header`; `page-section-content` |
| Avatar | root `avatar` + `data-size` (image/icon/name variants); `avatar-notification` |
| Render | nothing (utility wrapper, no own styling) |

Evidence: new specs 12 files, red 17/18 before implementation (the passing one asserts the null render), green 24/24 after; existing specs of the touched folders 15 files / 59 tests green; stories of the touched folders 20 files / 149 tests green; `tsc -p tsconfig.spec.json` 0, `tsc -p tsconfig.lib.json` 0; biome lint on touched files: 2 pre-existing infos (InfoBox `noUselessSwitchCase`, untouched lines). Codex (gpt-6.1-sol, high) review: 5 findings, 2 fixed (testid casing, boolean mapping), 3 answered above (Link slot placement, caller-wins scope, `[data-slot]` marker rule).

### Text (own commit, watchdog Q1)
1. Text.tsx only: `data-slot="text"` + `data-type` (the `type` prop value, default `text`) on the heading (`h1`–`h4`), display (`h1`) and paragraph (`span`) elements, placed before `{...rest}` so a caller-supplied `data-slot`/`data-type` wins. text-animate-words-style.tsx untouched.
2. Callers checked: no `<Text>`/`<Link>` in rc-webapp or Vanguard passes `data-slot`/`data-type`; no stylesheet in either repo selects `[data-type`; Text elements carry no `Mui*` class.
3. Evidence: new spec red 5/6 (the caller-wins case passes trivially before), green 6/6; full spec project 184 files / 2066 tests green (also covers batch 1, since Text and Icon render everywhere); Text stories 9 files / 62 tests green; tsc spec + lib 0; biome: 8 pre-existing diagnostics in untouched Text.tsx lines, 0 on the new spec.

## Track 2 design: agent-readable docs shipped in the package (PROPOSED, for the watchdog)

1. What ships (new, read-only files in the tarball, imported by nothing):
   1. `docs/llms.txt`: index. Package one-liner; import rules (root `@rankingcoach/vanguard` + `style.css`, the WordPress bundle, D12 deep paths that must keep working); the DOM contract (data-slot naming convention, state attribute vocabulary, `[data-slot=...]` selectors are the stable styling/testing hook, `Mui*` classes are legacy aliases); the form path (`useFormStore`, Form `action`, `field`); then one line per export: `- [Name](components/<id>.md): summary` grouped by exports-meta tag.
   2. `docs/components/<id>.md` per root value export (203 exports-meta entries: components, hooks, helpers): summary, keywords, `import { X } from '@rankingcoach/vanguard'`, "in WordPress bundle: yes/no", props table (name, type, required, default, JSDoc), data-slot parts and state attributes, related items (exports-meta recommendations), 1–3 story examples (source of the story's render/args), the `*.description.md` text where one exists.
   3. `skills/vanguard/SKILL.md`: hand-written skill (frontmatter name/description; when to use; imports; theming tokens `--fn-*`; data-slot contract; forms: legacy `formconfig` vs new `useFormStore` + `<Form action>` + `field`, pending via `useFormStatus`; WordPress notes; "read docs/llms.txt next"). Not generated, reviewed like code; a spec checks every component name it mentions exists in `src/index.ts`.
2. Generated from (all already in the repo, no Storybook build needed):
   1. `src/exports-meta/*.json` (summary, keywords, tags, recommendations).
   2. `src/index.ts` and `src/index-wordpress.ts` export lists (WordPress availability).
   3. Props: the TS-5 compiler API path of `scripts/generate-exports-props.js` (`typescript5` alias, already a devDependency), refactored into an importable module so its CLI behaviour is unchanged.
   4. Examples: `*.stories.tsx` source read directly (the vanguard-mcp story extractor logic, minus its `storybook-static/index.json` dependency).
   5. data-slot parts: string literals `data-slot={'...'}` / `data-slot="..."` in each component's own source files plus the state attributes next to them, so the docs follow the code with no manual list.
   6. `vanguard-mcp` keeps working unchanged; later it can read the same generated Markdown.
3. Where and how it ships:
   1. Generator `scripts/generate-agent-docs.mjs` (mine). Output committed to the repo under `docs/` (reviewable diffs) — no build step, no `prepare` change.
   2. Needs ONE config change, for A/watchdog: add `"docs"` and `"skills"` to `package.json` `files`. No `exports` change (files are read by path from `node_modules/@rankingcoach/vanguard/docs/llms.txt`, nothing imports them), no entry point change, no runtime change, both bundles byte-identical.
   3. Version match: shipped inside the tarball, so it is always the installed version. No version string is written into the files (the branch prerelease `npm version` would make a committed stamp stale); llms.txt points to `../package.json` for the version.
4. Added size (estimate, measured before ship): ~200 Markdown files × 2–6 KB ≈ 0.6–1.0 MB unpacked, ≈ 120–200 KB in the gzipped tarball (dist alone is ~14 MB unpacked). If above 1.5 MB unpacked, props tables collapse to the top-level props and examples to one per component.
5. Staying in sync:
   1. `scripts/_agent-docs.spec.ts` (scripts project, node): regenerates into a temp dir and diffs against the committed `docs/`; fails with the list of stale files and the command to run. Same pattern as the vendored-types determinism spec.
   2. Same spec: every value export of `src/index.ts` has a `docs/components/*.md`; every link in llms.txt resolves; generation is deterministic (two runs byte-identical, sorted keys, no timestamps); no file under `src/` imports from `docs/` or `skills/`.
   3. SKILL.md check as in 1.3.
6. WordPress: one docs set for both bundles; each component page states WordPress availability (from `src/index-wordpress.ts`); llms.txt and SKILL.md have a short WordPress section (single bundle `dist-wordpress/index.js`, which exports exist there, `react-redux` still needed for the legacy form path).
7. Out of scope here: runtime agent bridge (`createAgent`, WebMCP), subpath exports, per-component `llms.txt` split.

### Track 2: watchdog verdict APPROVED with conditions
1. Location free of collisions; asset cleanup and D12 guards ignore it. 2. llms.txt: stylesheet order (D15), `Mui*` = alias / `data-*` = contract, form path (useFormStore, Form `action`, `field`/`index`, useFormStatus), legacy formconfig marked legacy but supported. 3. MUI-internal components say "internals pending rebuild" (plan §23); slots only from source literals, spec asserts each named slot exists in that component's source; "no slots yet" otherwise. 4. Examples: no absolute local paths, e-mails, internal hostnames; each ≤ ~40 lines. 5. Props from the exports-props compiler path; vendored MUI types print name + short type. 6. Measure size; over 1.5 MB trim examples first. 7. A applies the `files` diff on merge; B sends the exact diff, never edits package.json. 8. Later work, NOT started: runtime agent bridge (snapshot/act/query, WebMCP). 9. Track 1 first; Track 2 in gaps; Track 2 handoff to the watchdog (diff-spec output, size, llms.txt, SKILL.md, 3 sample pages: trivial / own-core / still-MUI).

## Track 3: duplication / antipatterns (user via watchdog)

### 3A Text + TextHighlighted (facts; nothing to implement)
1. `TextHighlighted` has been a thin `@deprecated` wrapper since 33feb08 (also on base 9d3b75b): `({ caseInsensitive, ...props }) => <Text {...props} highlightCaseInsensitive={caseInsensitive} />`. Text owns `highlightWords`, `highlightColor`, `highlightMode`, `highlightCaseInsensitive`.
2. Usage: rc-webapp direct imports zero (component-usage.md counts direct imports only; grep 0 for the name, no service/factory path renders it), but exported from the WordPress entry, so in use. rc-webapp migration list: empty; WordPress consumers would need `Text` + `highlightWords` (+ `highlightCaseInsensitive` for `caseInsensitive`).
3. Decided by the watchdog: "force consumers to update" is not done in this run; the wrapper stays (API identical).
4. Leftovers commit: deleted the empty, unimported `TextHighlighted.module.scss` (2 newlines); renamed `TextHighlighted.spec.tsx` → `_TextHighlighted.spec.tsx` so it runs. Setup-only edit after the rename: added `import { describe, test } from 'vitest';` (failed with `describe is not defined`). Assertions unchanged; 1/1 green. Pre-existing biome warning `noChildrenProp` in that spec, untouched.

## Decisions for the user
1. TextHighlighted: IN USE via the WordPress entry (`src/index-wordpress.ts:23-24`; user: every WordPress export is curated and in use). Stays as the deprecated thin wrapper; removal only after the WordPress consumers migrate to `Text` + `highlightWords`.

## Usage rule (user via watchdog)
Usage = direct rc-webapp JSX OR service call sites (ModalService/DrawerService/snackbarService/actionBarService/videoPlayerService) OR internal Vanguard importers OR export from `src/index-wordpress.ts`. The verifier's first "zero usage" list counted direct imports only and is wrong (ConfirmModal: 21+ files via `ModalService.openConfirmModal`); nothing is treated as unused until the reachability map arrives. Zero-usage components still get migrated, last in order.

## One branch (user via watchdog)
Everything lands on A's `feature/ui-sdk-architecture-investigation`. A merges this branch after every verifier PASS; B sends A "ready to merge: <SHA range>" per pass and merges A's branch into this one regularly (never rebase).

### Never-run test files (watchdog item 4; reported, not enabled)
Rules: vitest `spec` runs `**/_*.spec.{ts,tsx}`; `scripts` runs `scripts/**/_*.spec.ts`; Storybook collects `src/core/**/_*.stories.*` plus only `src/common/SectionMissing/_SectionMissing.stories.tsx`.
1. Specs without the underscore, never run: 75 files:
   - src/core/AIAssistant/AIAssistentPanel/AIAssistantPanel.spec.tsx
   - src/core/ActionCard/ActionCardBody/ActionCardBody.spec.tsx
   - src/core/ActionCard/ActionCardHeader/ActionCardHeader.spec.tsx
   - src/core/AnimatedConditional/AnimatedConditional.spec.tsx
   - src/core/AutocompleteWithAnchor/AutocompleteWithAnchor.spec.tsx
   - src/core/Avatar/Avatar.spec.tsx
   - src/core/Button/Button.spec.tsx
   - src/core/Charts/AreaChart/AreaChart.spec.tsx
   - src/core/Charts/BarChart/BarChart.spec.tsx
   - src/core/Charts/BigLegend/BigLegend.spec.tsx
   - src/core/Charts/BigLegend/BigLegendItem/BigLegendItem.spec.tsx
   - src/core/Charts/ChartTabs/ChartTabs.spec.tsx
   - src/core/Charts/DonutChart/DonutChart.spec.tsx
   - src/core/Charts/HSBChart/HSBChart.spec.tsx
   - src/core/Charts/LineChart/LineChart.spec.tsx
   - src/core/ClipboardText/ClipboardText.spec.tsx
   - src/core/CreditCard/CreditCard.spec.tsx
   - src/core/DateRangePicker/DateRangePicker.formatter.spec.ts
   - src/core/DateRangePicker/DateRangePickerBase/DateRangePickerBase.spec.tsx
   - src/core/DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/DateRangePickerBaseInputAdornment.spec.tsx
   - src/core/DateTimePicker/DateTimePicker.spec.tsx
   - src/core/DragAndDropFile/DragAndDropFile.spec.tsx
   - src/core/DropdownMenu/DropdownMenu.spec.tsx
   - src/core/ExportXLS/ExportXLS.spec.tsx
   - src/core/FadedCarousel/ElementsBeforeAfter/ElementsBeforeAfter.spec.tsx
   - src/core/FlagAdornment/FlagAdornment.spec.tsx
   - src/core/FrostedGlass/FrostedGlass.spec.tsx
   - src/core/GoogleMaps/GoogleMapsMarker/GoogleMapsMarker.spec.tsx
   - src/core/ImgLoader/ImgLoader.spec.tsx
   - src/core/ImgWithLoader/ImgWithLoader.spec.tsx
   - src/core/LineAlert/LineAlert.spec.tsx
   - src/core/List/List.spec.tsx
   - src/core/List/ListShowMore/ListShowMore.spec.tsx
   - src/core/ListItem/ListItem.spec.tsx
   - src/core/ListItems/ListItem/ListItem.spec.tsx
   - src/core/ListItems/ListItems.spec.tsx
   - src/core/LottieAnimationLoader/LottieAnimationLoader.spec.tsx
   - src/core/LottieAnimationLoader/LottieBase/LottieBase.spec.tsx
   - src/core/Modal/FullScreenModalContainer/FullScreenModalContainer.spec.tsx
   - src/core/Modal/ModalStepper/ModalStepper.spec.tsx
   - src/core/Modal/ModalStepper/ModalStepperSteps/ModalStepperStep/ModalStepperStep.spec.tsx
   - src/core/Modal/ModalStepper/ModalStepperSteps/ModalStepperSteps.spec.tsx
   - src/core/PhoneNumber/PhoneNumber.spec.tsx
   - src/core/PhoneNumber/PhoneNumberBase/PhoneNumberBase.spec.tsx
   - src/core/PhoneNumber/PhoneNumberIMask/PhoneNumberIMask.spec.tsx
   - src/core/PhoneNumber/PhoneNumberPrefix/PhoneNumberPrefix.spec.tsx
   - src/core/ProgressBar/ProgressBar.spec.tsx
   - src/core/ProgressCircle/ProgressCircle.spec.tsx
   - src/core/Rating/Rating.spec.tsx
   - src/core/Rating/RatingDistribution/RatingDistribution.spec.tsx
   - src/core/Render/Render.spec.tsx
   - src/core/SmallLoader/SmallLoader.spec.tsx
   - src/core/SocialMediaLink/utils.spec.ts
   - src/core/StatusBadge/StatusBadge.spec.tsx
   - src/core/Table/Table.spec.tsx
   - src/core/Table/TableBody/TableBody.spec.tsx
   - src/core/Table/TableBody/TableBodyRenderer/TableBodyRenderer.spec.tsx
   - src/core/Table/TableCell/TableCell.spec.tsx
   - src/core/Table/TableFooter/FooterPagination/FooterPagination.spec.tsx
   - src/core/Table/TableFooter/FooterShowLess/FooterShowLess.spec.tsx
   - src/core/Table/TableFooter/FooterShowMore/FooterShowMore.spec.tsx
   - src/core/Table/TableFooter/TableFooter.spec.tsx
   - src/core/Table/TableHeader/TableHeader.spec.tsx
   - src/core/Table/common/CtaWithIcon/CtaWithIcon.spec.tsx
   - src/core/Table/common/TablePlaceholder/TablePlaceholder.spec.tsx
   - src/core/Text/TextWrapBalancer/TextWrapBalancer.spec.tsx
   - src/core/TogglerWithText/TogglerWithText.spec.tsx
   - src/core/VideoPlayer/VideoPlayer.spec.tsx
   - src/custom-hooks/__tests__/use-facebook-sdk.spec.ts
   - src/helpers/__tests__/array-of-length.spec.ts
   - src/helpers/__tests__/format-utils.spec.ts
   - src/helpers/__tests__/get-path-id.spec.ts
   - src/helpers/__tests__/random-number-between.spec.ts
   - src/helpers/__tests__/round-number.spec.ts
   - src/services/odata.service.spec.ts
2. Stories without the underscore, never collected: 61 files (some are imported by an underscored story; the file itself is not collected):
   - src/common/ListPage/ListPage.stories.tsx
   - src/common/ListPage/ListPageRadioGroup/ListPageRadioGroup.stories.tsx
   - src/common/ListPage/ListPageSwitchGroup/ListPageSwitchGroup.stories.tsx
   - src/core/AIAssistant/AIAssistent.stories.tsx
   - src/core/ActionCard/ActionCardActions/ActionCardActions.stories.tsx
   - src/core/ActionCard/ActionCardBody/ActionCardBody.stories.tsx
   - src/core/ActionCard/ActionCardHeader/ActionCardHeader.stories.tsx
   - src/core/Charts/DonutChart/Custom/DonutChartDirectories/DonutChartDirectories.stories.tsx
   - src/core/Charts/DonutChart/Custom/DonutChartStatistics/DonutChartStatistics.stories.tsx
   - src/core/Charts/DonutChart/DonutChart.stories.tsx
   - src/core/Charts/LineChart/LineChart.stories.tsx
   - src/core/CheckBox/CheckBoxIcon/CheckBoxIcon.stories.tsx
   - src/core/DateRangePicker/DateRangePickerBase/DateRangePickerBase.stories.tsx
   - src/core/DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/DateRangePickerBaseInputAdornment.stories.tsx
   - src/core/Drawer/DrawerRoot/DrawerRoot.stories.tsx
   - src/core/FadeCarouselAuto/FadeCarouselAuto.stories.tsx
   - src/core/FadedCarousel/ElementsBeforeAfter/ElementsBeforeAfter.stories.tsx
   - src/core/Form/FormElement/FormElement.stories.tsx
   - src/core/GlobalStateComponent/GlobalStateComponent.stories.tsx
   - src/core/GoogleMaps/GoogleMapsMarker/GoogleMapsMarker.stories.tsx
   - src/core/InfoBox/InfoBox.stories.tsx
   - src/core/Input/stories/validation/stories/Input.validation.blur.stories.tsx
   - src/core/List/ListShowMore/ListShowMore.stories.tsx
   - src/core/ListItem/ListItem.stories.tsx
   - src/core/ListItems/ListItem/ListItem.stories.tsx
   - src/core/ListItems/ListItems.stories.tsx
   - src/core/LottieAnimationLoader/LottieAnimationLoader.stories.tsx
   - src/core/LottieAnimationLoader/LottieBase/LottieBase.stories.tsx
   - src/core/Modal/FullScreenModalContainer/FullScreenModalContainer.stories.tsx
   - src/core/Modal/ModalStepper/ModalStepper.stories.tsx
   - src/core/Modal/ModalStepper/ModalStepperSteps/ModalStepperStep/ModalStepperStep.stories.tsx
   - src/core/Modal/ModalStepper/ModalStepperSteps/ModalStepperSteps.stories.tsx
   - src/core/Modal/Modalheader/ModalHeader.stories.tsx
   - src/core/Notification/Notification.stories.tsx
   - src/core/NotificationAction/NotificationAction.stories.tsx
   - src/core/PhoneNumber/PhoneNumberBase/PhoneNumberBase.stories.tsx
   - src/core/PhoneNumber/PhoneNumberIMask/PhoneNumberIMask.stories.tsx
   - src/core/PhoneNumber/PhoneNumberPrefix/PhoneNumberPrefix.stories.tsx
   - src/core/Popover/Popover.stories.tsx
   - src/core/PopoverModal/PopoverModal.stories.tsx
   - src/core/ProgressCircle/ProgressCircle.stories.tsx
   - src/core/RadioButtonGroup/RadioButtonGroup.stories.tsx
   - src/core/Rating/Rating.stories.tsx
   - src/core/Rating/RatingDistribution/RatingDistribution.stories.tsx
   - src/core/Render/Render.stories.tsx
   - src/core/SmallLoader/SmallLoader.stories.tsx
   - src/core/SnackbarRoot/Snackbar.stories.tsx
   - src/core/Table/Table.stories.tsx
   - src/core/Table/TableBody/TableBody.stories.tsx
   - src/core/Table/TableBody/TableBodyRenderer/TableBodyRenderer.stories.tsx
   - src/core/Table/TableCell/TableCell.stories.tsx
   - src/core/Table/TableFooter/FooterPagination/FooterPagination.stories.tsx
   - src/core/Table/TableFooter/FooterShowLess/FooterShowLess.stories.tsx
   - src/core/Table/TableFooter/FooterShowMore/FooterShowMore.stories.tsx
   - src/core/Table/TableFooter/TableFooter.stories.tsx
   - src/core/Table/TableHeader/TableHeader.stories.tsx
   - src/core/Table/common/CtaWithIcon/CtaWithIcon.stories.tsx
   - src/core/Table/common/TablePlaceholder/TablePlaceholder.stories.tsx
   - src/core/Text/TextWrapBalancer/TextWrapBalancer.stories.tsx
   - src/core/TogglerWithText/TogglerWithText.stories.tsx
   - src/core/VideoPlayer/VideoPlayer.stories.tsx
3. Underscored src/common stories not in the Storybook glob (commented out since VAN-82), never collected: 44 files (all `src/common/**/_*.stories.tsx` except SectionMissing).
4. Consequence for Track 1: src/common components have no running stories; their batches rely on the new specs plus a render of every story module's default export in the spec (no Storybook run possible without changing .storybook/main.ts, A's config).

### Batch 2: Tabs, Table, TagList, Rating, StarRating, ActionCard and small own components
Drafted by Codex (gpt-6.1-sol, medium) from a written contract + batch 1 as pattern; every line read, 4 renames and 1 fix by me, reviewed by Codex (high).
| Component | Attributes |
|---|---|
| Tabs | ComponentContainer wrapper `tabs` + `data-variant` (EXCEPTION: the bar div that takes `className` stays attribute-free because `stories/DomHygiene.story.tsx` pins its attributes to `['class']`); `tabs-scroller`; `tabs-list` (role=tablist) |
| Tab | `<button>` `tab` + `data-selected`, `data-variant` (theme), `data-size` (tabHeight); own attrs before the caller spread |
| TabPanel | `tab-panel` |
| Table | `table-container` (ComponentContainer), `<table>` `table` |
| TableHeader | `<thead>` `table-header`, `<tr>` `table-row`, `<th>` `table-header-cell`, sort `<button>` `table-sort-button` |
| TableBodyRenderer / TableBody | `<tbody>` `table-body`, rows `table-row`; blurred `<tbody>` `table-body-blurred` + `table-blurred-message-row/-cell`, `table-blurred-message` |
| TableCell | `<td>` `table-cell`, inner `table-cell-inner`; prefix/postfix `table-cell-content` + `data-type` |
| TableToolbar | `table-toolbar`, `table-toolbar-title`, `table-toolbar-controls` |
| TableFooter | `<tfoot>` `table-footer`, `<tr>` `table-footer-row`, `<td>` `table-footer-cell`, `table-footer-controls`, `table-footer-more-controls`, `table-footer-pagination` |
| FooterShowLess / FooterShowMore | `footer-show-less-container` / `footer-show-more-container` |
| CtaWithIcon | `cta-with-icon` + `data-disabled` |
| TablePlaceholder / TableRowPlaceholder | `table-placeholder` / `table-row-placeholder` + `-content` |
| TagList | `tag-list` + `data-variant` |
| Tag | `tag-container`; styled div `tag` + `data-variant`, `data-type`; `tag-content`; `tag-delete` |
| Rating | `rating-container` (consumer className); `rating` (state class `ratingAlignTop`); `rating-value` |
| RatingDistribution | `rating-distribution`, `-title`, `-content`, `-bars` |
| RatingStarsAndProgressBar | `rating-stars-and-progress-bar`, `-stars`, `-progress` (wrapper div of MUI ProgressBar; ProgressBar itself untouched) |
| StarRating | `star-rating` + `data-readonly` |
| Star | `star`, `star-result`, `star-hover`, `star-background` |
| ActionCard | `action-card`, `action-card-content`; ActionCardHeader `action-card-header`, `-menu`; ActionCardActions `action-card-actions`; ActionCardAction `action-card-action` + `data-disabled`, `data-loading`, `action-card-action-loader` |
| AiGlow / AnimatedNumber / Divider / FrostedGlass | `ai-glow` / `animated-number` / `divider` (before rest spread) / `frosted-glass` (before props spread, so PageSection's `page-section` wins) |
| SmallLoader | `small-loader` (ComponentContainer, no separate root), `small-loader-image` |
| TrendDelta | `trend-delta`, `trend-delta-value` |
| RelativeTime, TrendIndicator, ActionCardInfo, ActionCardBody, FooterPagination | nothing: they render only Text/Icon/fragments, which slot themselves |

Evidence: new specs 13 files; red 22/24 with the implementation removed (the 2 passes assert "no own slot" for RelativeTime by design); green 24/24 after; specs of touched folders 21 files / 71 tests; stories of touched folders 20 files / 169 tests (1 failure on the first try — Tabs DomHygiene, fixed by the exception above, then Tabs stories 5 files / 81 green); tsc spec + lib 0; biome lint on the 31 changed files 39 before = 39 after (same rules/files), 0 on new specs; mechanical attribute-only check (every removed line equals an added line minus data-* attributes): 59 = 59 OK.

### Track 2 build (commit below)
1. `scripts/generate-agent-docs.mjs` → `docs/llms.txt` + `docs/components/<Name>.md`: 298 pages (every value export of src/index.ts; 33 marked "Internals pending rebuild" because their folder imports `@mui/*`). Hand-written `skills/vanguard/SKILL.md`.
2. `scripts/generate-exports-props.js`: `main({ write, quiet, names })` returns the records; default CLI writes the same files as before, plus two additive fields per prop (`description` from JSDoc, `source` file). Found while building: its line-based `src/index.ts` parser misses every multi-line `export { ... }` block (DataTable, ...), so the generator passes its own export list (`names`); the CLI default is unchanged.
3. Sizes: docs + skills = 300 files, 419,073 bytes raw (du 1.28 MB on-disk blocks), 98,968 bytes gzipped. Under the 1.5 MB limit; no trimming.
4. `scripts/_agent-docs.spec.ts` (scripts project): up to date vs a fresh regeneration (lists stale files + the command), deterministic (two runs identical), llms.txt links = pages, key exports have pages, every slot a page names exists in the component source, no local paths / e-mails / internal hostnames, examples ≤ 40 lines, nothing in src imports docs/skills, SKILL.md frontmatter + every export it names exists. Red check: one hand edit in docs/components/Switch.md → "stale files ... ['components/Switch.md']"; green 9/9.
5. Guards checked: no existing `docs/`, `skills/`, `.npmignore`; asset-cleanup scripts and the dist guards (`_package-exports`, `_dts-package-imports`, `_mui-compat-order`) only walk dist/dist-wordpress; `_package-exports` does not pin the `files` list. Biome does not cover `scripts/` (0 files checked).
6. Consequence: docs/ must be regenerated in the same commit whenever slots, props, exports or exports-meta change, or the scripts spec fails (also on A's side after a merge).
7. Needed config change, for A at merge (not applied by B): package.json `files` += `"docs"`, `"skills"`.
8. Later work, not started: runtime agent bridge (snapshot/act/query, WebMCP).

### Track 2 review round (watchdog) and follow-up commit
1. DECIDED (watchdog): docs are build output, gitignored (`/docs/`), generated during the library build; SKILL.md stays committed. Spec generates into temp dirs (determinism, links, slot truth via the generator's source manifest, content rules, SKILL.md); the stale-committed check is gone. Wiring (package.json build step, `files`, tarball check) is A's.
2. Examples now come from story `args`, not story source: `import { X } from '@rankingcoach/vanguard'` + JSX; stories with `render`, spreads or non-literal args are skipped; `on*`/`testId`/`data-*` args dropped; ≤3 distinct per component. 27 pages get examples (most stories use helper constants or custom renders, so they are skipped rather than pasting test code). Spec forbids relative imports, `storybook`, `play:`, `expect(` and `src/` in pages; on the previous output that rule finds 187 violating examples in 100 pages.
3. `Source: src/...` line dropped. MUI note per component: plan §23 overrides for Input, Textarea, Select, ToggleButton(Group), PopoverPopper, MenuItem; folder `@mui` import for the rest.
4. SKILL.md: save button is Vanguard `Button htmlType="submit"` (+ `isLoading`), with the useFormStatus child pattern; line added: string labels are already rendered through Text and translated.
5. generate-exports-props.js CLI (`node scripts/generate-exports-props.js`): base 13dfd71 vs now, 267 = 267 files, 0 differences beyond the two additive prop fields.

### Batch 3: Gallery, Header, TreeView, gauges, loaders and small own components
Drafted by Codex (medium), read line by line; fixes by me: CircularGauge bare slot moved to the styled ComponentContainer (`circular-gauge` + `data-loading`; arc = `circular-gauge-value`), dropped a non-ComponentContainer `gallery-media-item-action-container` slot, spec key fix.
| Component | Attributes |
|---|---|
| Label | nothing (renders only Text) |
| ImgLoader | `img-loader-container`, `img-loader`, `img-loader-image` |
| ImgWithLoader | `img-with-loader` (before rest spread), `-placeholder`, `-media-type`, `-image` |
| Gallery | `gallery-container` (wrapper div `.gallery-container`), `gallery` (consumer className), `gallery-item` |
| GalleryMediaItem | `gallery-media-item-container`, `gallery-media-item`, `-options` + `data-selected`, `-action` + `data-disabled`, `-video-metadata` |
| PhotoPlaceholder | `photo-placeholder` + `data-variant` (format), `photo-placeholder-icons` |
| GalleryFeedbackModal / ErrorImagesList | `gallery-feedback-modal-body`, `-success`; `error-images-list`, `-summary`, `-error` |
| IllustrationBlob / BlobAnimation | `illustration-blob`, `-layer`, `-image`, `-decoration`, `-icon`; `blob-animation` |
| CircularGauge | `circular-gauge` + `data-loading`, `-ring`, `-track`, `-value`, `-center` |
| FadedCarousel / ElementsBeforeAfter | `faded-carousel-container`, `faded-carousel`, `-item`, `-fade-before`, `-fade-after`; `elements-before-after` |
| TogglerWithText | `toggler-with-text` + `data-variant`, `-slider`, `-left`/`-right` + `data-active` |
| TreeView / TreeItem | `tree-view`; `tree-item` + `data-selected`, `data-disabled`, `-content`, `-icon`, `-label`, `-group` |
| LineAlert / Header | `line-alert` + `data-type`; `header` + `data-type` |
| LinkConditional | `link-conditional` |
| ListLoader | `list-loader`, `-animation`, `-avatar`, `-line` |
| ClipboardText | `clipboard-text`, `-copy`, `-content` |

Evidence: red 20/21 with the implementation removed (Label's "no own slot" passes by design), green 21/21; specs of touched folders 16 files / 32 tests; stories 15 files / 70 tests; tsc spec + lib 0; biome 27 = 27 on changed files, 0 on new specs; attribute-only 44 = 44; collision check (new standing step, `collision-check.sh`: attribute selectors and DOM queries on every added name in Vanguard src and rc-webapp html/**): no hit except A's Mui-scoped `[data-slot]` (now `data-vg-core` on A's branch).

### Standing batch checklist (from the watchdog, after verifier-2 deltas)
1. Red specs first, green after. 2. Attribute-only mechanical check. 3. Collision check: every existing selector or DOM query in Vanguard and rc-webapp matching an added attribute name, listed in the handoff. 4. No added/removed/reordered element (structural selectors). 5. No `"false"`/`"undefined"` attribute strings. 6. Existing specs + stories of the touched folders, tsc, biome before = after. 7. Codex review prompt includes items 3–5.

### 3B duplication audit (Codex gpt-6.1-sol high, read-only; top claims re-verified by B)
Method: 5-token-shingle Jaccard over 311 JSX TSX + 265 SCSS files (comments/imports stripped), then code reading. Usage = direct JSX | service calls | internal importers | WordPress export. Verified by B: NotificationAction copies byte-identical (TSX body after imports + SCSS); standalone `src/core/NotificationAction/` exported from neither entry; Accept/Confirm diff; WordPress column (EditModal, Popover, Link, InfoBox, TextHighlighted, TextWrapBalancer = yes).

| family | similarity evidence (score + what is shared) | what differs | rc-webapp usage of each, JSX/service | real duplication or only looks similar | proposed umbrella: owner, wrappers, additive props | risk | effort |
|---|---|---|---|---|---|---|---|
| **NotificationAction / Notification / NotificationSource** | Action copies: **100% TSX, 100% SCSS**. Identical props, `renderIcon`, click guard and markup: `core/NotificationAction/NotificationAction.tsx:9`; nested equivalent `core/Notification/NotificationAction/NotificationAction.tsx:9`. | Action copies differ only in import paths. Notification is the containing view; Source is its label. | Both actions **0/0**; Notification **1/0**; Source **1/0**. | **Exact action duplication.** Notification already composes nested Action and Source at `Notification.tsx:48,92`. | Keep nested Action as owner—it is the root-exported implementation (`core/Notification/index.ts:5`). Deprecate standalone Action as a thin wrapper; one SCSS source. No new props. | Low | S |
| **Google Maps Marker / AdvancedMarker adapters** | **75.42%** across **887/900 lines**. Copied event maps, listener effects, class lifecycle and child-anchor cloning: `core/GoogleMaps/GoogleMapsMarker/Marker.tsx:27,801`; `AdvancedMarker.tsx:29,810`. | Legacy setters versus AdvancedMarker property assignments; constructor guards; advanced clustering and several updater bodies are disabled. | Local Marker/MarkerF and public AdvancedMarker/AdvancedMarkerF: **0/0 each**. | **Substantial implementation duplication.** Different SDK objects prevent direct aliasing. Public `MarkerF` actually comes from the external package, not the copied local file: `core/GoogleMaps/index.ts:11`. | Extract one internal marker lifecycle/event engine, parameterized by legacy/advanced constructor and updater adapters. Keep class/function APIs and refs; deprecated wrappers delegate. Preserve existing disabled operations and lifecycle timing. | High: imperative SDK behavior, clustering, refs | L |
| **AcceptModal / ConfirmModal** — Modal foundation **A’s** | **74.50% TSX; 77.78% SCSS**. Identical prop alias, header, message branch, positive callback and 672px shell: `core/StandardModals/AcceptModal/AcceptModal.tsx:15`; `ConfirmModal/ConfirmModal.tsx:15`. | Confirm adds negative action/custom callback; Accept centers its positive button. Different container/modal classes and footer selectors. | Accept **0/5**; Confirm **0/67**. | **Real duplication.** Service usage is material despite zero direct JSX. | Confirm owns one decision-dialog renderer. Add action mode and internal legacy class/footer profile; Accept becomes deprecated wrapper. Retain both prop aliases and service methods. | Medium: close results, CSS selectors, footer layout | M |
| **EditModal / BigAssEditModal; other custom/standard modals** — Modal foundation **A’s** | Edit pair **37.93%**; identical `positiveFn` and `negativeFn`: `core/CustomModals/EditModal/EditModal.tsx:88`; `BigAssEditModal/BigAssEditModal.tsx:62`. Test/ImplementDetails **45.91%** shell duplication. | Edit has request-error handling, title replacements, configurable width/button; BigAss is fullscreen, uses local loading and a different response payload/effect. Error logs errors; Loading has animation modes; DateRange and PhotoCarousel contain actual workflows. | Edit **21/0**; BigAss **3/0**; Error **22/63**; Success **5/0**; Loading **5/40**; DateRange **0/0**; PhotoCarousel **0/7**; Test and ImplementDetails **0/0**. | **Edit flow is copied and diverged.** Remaining modal shell repetition mostly already composes Modal/Header/Body/Footer. | Edit owns shared edit controller/renderer. Add fullscreen, description, body class and explicit legacy loading/close-result profiles; deprecated BigAss wrapper. Do not fold logging, gallery or date workflows into a universal modal. | High: observable async differences | M–L |
| **ListPageCheckboxGroup / SwitchGroup / RadioGroup** | Checkbox/Switch **53.95% TSX; 90.53% SCSS**. Their declaration blocks are identical after removing differing imports. Copied Redux dispatch and label/count markup: `common/ListPage/ListPageCheckboxGroup/ListPageCheckboxGroup.tsx:25,33,85`; Switch equivalent `:21,25,64`. | Checkbox supports option hidden/checked/disabled rules; Switch computes disabled differently. Radio stores a scalar and initializes selection. | **0/0 each**. | **Real Checkbox/Switch duplication.** Radio shares a contract, not the full implementation. | Checkbox owns a shared boolean-filter controller/option renderer. Add control adapter, label slot and explicit disabled-policy profile; keep deprecated Checkbox/Switch wrappers. Share Radio’s contract separately. Retain original module classes. | Medium: filter semantics already diverged | M |
| **PhoneNumberIMask / VerificationPinInputIMask; phone input wrappers** — Input foundation **A’s** | Mask pair **48.16%**: same `forwardRef`, IMask wiring and synthetic change event, `core/PhoneNumber/PhoneNumberIMask/PhoneNumberIMask.tsx:13`; `common/VerificationPinInput/VerificationPinInputIMask/VerificationPinInputIMask.tsx:16`. Prefix/Base **33.52%** and 80% prop-name overlap. | Placeholder `#`/`N`, lazy mode, capitalization, classes; Prefix calculates country code while Base installs a mask. | All four **0/0**. | **Real mask-adapter duplication.** Prefix/Base already compose InputBase. | Phone mask owns a generic internal IMask adapter with placeholder character, lazy, capitalization and class options. Deprecated wrappers map existing names. Share phone prop types; retain Prefix/Base behavior. | Medium: refs and input events | M |
| **Table / DataTable / footer controls** | Table/DataTable only **1.43%**. Actual duplication: Pagination/ShowMore **36.83% TSX, 81.25% SCSS**; ShowLess/ShowMore **34.39%**. See `core/Table/TableFooter/FooterPagination/FooterPagination.tsx:35,46`; ShowMore `:23,27`. | Table owns data, sorting, paging and toolbar; DataTable is semantic composition. Footer controls differ in callbacks, wrappers, slots and disabled selectors. | Table **29/0**; DataTable **15/0**; footer controls **0/0 each**. | **Table/DataTable are distinct.** Footer state/button/style fragments are copied. | Keep both tables. FooterShowMore owns shared footer-action rendering; parameterize action, icon, label, wrapper/slot and original classes. Deprecated footer wrappers preserve signatures. Shared SCSS mixins must retain descendant versus compound selector differences. | Medium: selectors, callbacks, hooks | M |
| **CircularGauge / ProgressCircle / ArcGauge / BenchmarkGauge** | Circular/Progress **7.77%**, but both implement circumference/dash-offset rings: `core/CircularGauge/CircularGauge.tsx:46`; `core/ProgressCircle/ProgressCircle.tsx:19`. Other gauge pair scores **2.50–5.57%**. | Progress clamps size, uses a smaller effective diameter/radius, string dash arrays, style-based offset and percentage text. Circular supports max/track/loading/children. Arc is masked semicircle/conic gradient; Benchmark is a linear marker track. | Circular **4/0**; Progress **1/0**; Arc **2/0**; Benchmark **2/0**. | **Partial ring duplication; other gauges are distinct.** | Circular owns an internal ring renderer with explicit legacy geometry/SVG-attribute/class profile; deprecated Progress wrapper keeps its percentage layout. Keep Arc and Benchmark independent. | Medium: geometry and serialized SVG differences | M |
| **BarChart / HSBChart** | **23.60% TSX; 46.90% SCSS**. `getCategories` is identical: `core/Charts/BarChart/BarChart.tsx:92`; `HSBChart/HSBChart.tsx:77`. Repeated Apex options and tooltip styling. | Vertical/distributed versus horizontal/stacked; different tooltip, legend, fonts and percentage formatting. | Bar **7/0**; HSB **4/0**. | **Real helpers/options duplication; distinct chart configurations.** | Shared internal bar-chart engine owns common options and translation helper. Public components remain deprecated profile wrappers; add orientation, stack and tooltip/legend profile inputs internally. Preserve option ordering and original selectors. | High: chart-generated DOM and tooltip HTML | L |
| **Toolbar / FormControl; DropdownMenu / Popover** — **A’s** | Toolbar/FormControl **100%** after own-name normalization: `core/Toolbar/Toolbar.tsx:11`; `core/FormControl/FormControl.tsx:10`. Menu/Popover SCSS **30.54%**, principally arrow placement. | Different MUI components and prop contracts. Menu/tooltip shadows, padding, offsets and selector ancestry differ. | Toolbar **1/0**; FormControl **0/0**; DropdownMenu **6/0**; Popover **67/0**. | Toolbar/FormControl are **boilerplate similarity**, not interchangeable implementations. Popper arrow declarations are partially copied. | Keep distinct MUI adapters. Optionally share a shell helper and arrow SCSS mixin under original selectors; no component merge. | Medium: MUI defaults and CSS specificity | S–M |
| **Loader / SmallLoader / ListLoader; ImgLoader / ImgWithLoader** | Loader pairs **2.51–5.90%**; image pair **4.41%**. See `core/Loader/Loader.tsx:19`, `SmallLoader/SmallLoader.tsx:22`, `ListLoader/ListLoader.tsx:54`, `ImgLoader/ImgLoader.tsx:16`, `ImgWithLoader/ImgWithLoader.tsx:32`. | CSS spinner; dot GIF; list-shaped placeholder; large GIF/message; image load state plus Skeleton/media overlay. | Loader **75/0**; Small **9/0**; List **3/0**; ImgLoader **6/0**; ImgWithLoader **6/0**. | **Distinct renderers.** ImgWithLoader already composes Skeleton (**A’s**). | Keep implementations. A shared loading facade would only dispatch to different renderers and would not remove meaningful duplication. | High visual risk for little gain | — |
| **FadedCarousel / FadeCarouselAuto** | **3.26%**: refs/effects/item wrappers. `core/FadedCarousel/FadedCarousel.tsx:83`; `core/FadeCarouselAuto/FadeCarouselAuto.tsx:35`. | Manual arrows/centering/edge overlays versus timed scrolling, hover pause and duplicated items for looping. | **4/0; 2/0**. | **Distinct behavior and DOM.** | Keep both; no umbrella justified under byte-identical-output constraint. | High if forced | — |
| **ListItem / ListItems / nested ListItem** | Standalone/nested rows **1.94%**; standalone/container **2.08%**. `core/ListItem/ListItem.tsx:47`; `core/ListItems/ListItem/ListItem.tsx:66`; `ListItems.tsx:83`. | Numbered/icon content row versus sticky, clickable multi-slot `<li>`. | Standalone **0/0**; nested **0/0**; ListItems **1/0**. | **Names collide; implementations differ.** ListItems already composes its nested row. | Keep both rows and current composition. No consolidation. | High if forced | — |
| **Rating / StarRating** | **4.01%**. Rating explicitly renders StarRating: `core/Rating/Rating.tsx:77`. | Rating adds numeric label/layout/clamping; StarRating owns interaction and star iteration. | **11/0; 13/0**. | **Already composed.** | Keep StarRating as owner. Resolve the misleading inherited prop surface separately; blindly forwarding more props changes existing behavior. | Medium API risk | S |
| **Link / LinkConditional / RcNavLink** | **3.58–4.83%**. LinkConditional directly composes Link: `core/LinkConditional/LinkConditional.tsx:22`. | Styled text/icon anchor versus conditional delete UI versus location-token substitution and raw prop spreading, `core/RcNavLink/RcNavLink.tsx:18`. | **64/0; 3/0; 0/0**. | **Already composed / distinct adapter.** | Keep Link owner and LinkConditional composition. Do not route RcNavLink through Link: it adds Text/classes and changes DOM attributes. | Medium | — |
| **Alert / LineAlert / InfoBox / common InfoText** | Highest **13.54%** Alert/LineAlert; others **4.08–8.94%**. `core/Alert/Alert.tsx:16`; `LineAlert/LineAlert.tsx:23`; `InfoBox/InfoBox.tsx:83`; `common/InfoText/InfoText.tsx:20`. | Different severity colors/icons, `warn`/`warning`, typography, dismissal/actions and wrappers. | Alert **367/0**; Line **3/291**; InfoBox **135/0**; InfoText **0/0**. | **Related semantics, little copied rendering.** | Keep renderers. Share severity types/data only where values actually agree; preserve legacy mappings. InfoBox’s Collapse/Button dependencies are **A’s**. | Medium–high visual/service exposure | S for types; no full merge |
| **TextHighlighted / Text; fragment/preset wrappers** | TextHighlighted/Text props have **75% field-name overlap**; it already delegates: `core/TextHighlighted/TextHighlighted.tsx:40`. TextWrapBalancer/ActionCardBody **35.14%**, mostly fragment return. | Highlighted renames one prop; Balancer conditionally uses a library; ActionCardBody only returns children. | See four-column usage below. | **Existing deprecated composition; copied types and trivial wrappers.** | Keep Text owner and existing deprecated Highlighted wrapper. Derive compatible props from Text with `Pick`/`Omit`; keep legacy accepted types. Retain ActionCardBody as a deprecated compatibility wrapper. | Low–medium type compatibility | S |
| **TextEditDrawer / MultiSelectDrawer; ActionBar templates** — Drawer foundation **A’s** | Drawer styles **68.33%**, TSX **20.21%**; identical title/actions declarations: `core/CustomDrawers/TextEditDrawer/TextEditDrawer.module.scss:22`; MultiSelect equivalent `:22`. ActionBar template styles **50.51%**. | Scalar validation/restoration versus async multi-selection. ActionBar message/footer have different gaps and content. | Text drawer **0/2**; MultiSelect **0/0**; ActionBarFooter **0/2**; Message **0/1**. | **Copied shells/styles; distinct workflows.** | Shared internal drawer chrome owns title/body/actions slots; deprecated wrappers retain workflow controllers and original module classes. ActionBar needs only a layout mixin. | Medium | M |
| **Notification QuoteContainers** | **25.68%**, same asset hook/content/SVG purpose: `core/QuoteContainer/QuoteContainer.tsx:20`; `core/Notification/QuoteContainer/QuoteContainer.tsx:17`. | Different wrappers/layout/classes; modern guards loading/error; legacy renders both `<SvgIcon/>` and StyledSVG. | Public **1/0**; notification-local **0/0**. | **Diverged copy**, not safe aliasing. | Public QuoteContainer may own a profile-based renderer with legacy structure/asset rendering retained; deprecated local wrapper. Low return relative to compatibility complexity. | High | M |

| family | similarity evidence (score + what is shared) | what differs | rc-webapp usage of each, JSX/service | real duplication or only looks similar | proposed umbrella: owner, wrappers, additive props | risk | effort |
|---|---|---|---|---|---|---|---|
| **NotificationAction / Notification / NotificationSource** | Action copies: **100% TSX, 100% SCSS**. Identical props, `renderIcon`, click guard and markup: `core/NotificationAction/NotificationAction.tsx:9`; nested equivalent `core/Notification/NotificationAction/NotificationAction.tsx:9`. | Action copies differ only in import paths. Notification is the containing view; Source is its label. | Both actions **0/0**; Notification **1/0**; Source **1/0**. | **Exact action duplication.** Notification already composes nested Action and Source at `Notification.tsx:48,92`. | Keep nested Action as owner—it is the root-exported implementation (`core/Notification/index.ts:5`). Deprecate standalone Action as a thin wrapper; one SCSS source. No new props. | Low | S |
| **Google Maps Marker / AdvancedMarker adapters** | **75.42%** across **887/900 lines**. Copied event maps, listener effects, class lifecycle and child-anchor cloning: `core/GoogleMaps/GoogleMapsMarker/Marker.tsx:27,801`; `AdvancedMarker.tsx:29,810`. | Legacy setters versus AdvancedMarker property assignments; constructor guards; advanced clustering and several updater bodies are disabled. | Local Marker/MarkerF and public AdvancedMarker/AdvancedMarkerF: **0/0 each**. | **Substantial implementation duplication.** Different SDK objects prevent direct aliasing. Public `MarkerF` actually comes from the external package, not the copied local file: `core/GoogleMaps/index.ts:11`. | Extract one internal marker lifecycle/event engine, parameterized by legacy/advanced constructor and updater adapters. Keep class/function APIs and refs; deprecated wrappers delegate. Preserve existing disabled operations and lifecycle timing. | High: imperative SDK behavior, clustering, refs | L |
| **AcceptModal / ConfirmModal** — Modal foundation **A’s** | **74.50% TSX; 77.78% SCSS**. Identical prop alias, header, message branch, positive callback and 672px shell: `core/StandardModals/AcceptModal/AcceptModal.tsx:15`; `ConfirmModal/ConfirmModal.tsx:15`. | Confirm adds negative action/custom callback; Accept centers its positive button. Different container/modal classes and footer selectors. | Accept **0/5**; Confirm **0/67**. | **Real duplication.** Service usage is material despite zero direct JSX. | Confirm owns one decision-dialog renderer. Add action mode and internal legacy class/footer profile; Accept becomes deprecated wrapper. Retain both prop aliases and service methods. | Medium: close results, CSS selectors, footer layout | M |
| **EditModal / BigAssEditModal; other custom/standard modals** — Modal foundation **A’s** | Edit pair **37.93%**; identical `positiveFn` and `negativeFn`: `core/CustomModals/EditModal/EditModal.tsx:88`; `BigAssEditModal/BigAssEditModal.tsx:62`. Test/ImplementDetails **45.91%** shell duplication. | Edit has request-error handling, title replacements, configurable width/button; BigAss is fullscreen, uses local loading and a different response payload/effect. Error logs errors; Loading has animation modes; DateRange and PhotoCarousel contain actual workflows. | Edit **21/0**; BigAss **3/0**; Error **22/63**; Success **5/0**; Loading **5/40**; DateRange **0/0**; PhotoCarousel **0/7**; Test and ImplementDetails **0/0**. | **Edit flow is copied and diverged.** Remaining modal shell repetition mostly already composes Modal/Header/Body/Footer. | Edit owns shared edit controller/renderer. Add fullscreen, description, body class and explicit legacy loading/close-result profiles; deprecated BigAss wrapper. Do not fold logging, gallery or date workflows into a universal modal. | High: observable async differences | M–L |
| **ListPageCheckboxGroup / SwitchGroup / RadioGroup** | Checkbox/Switch **53.95% TSX; 90.53% SCSS**. Their declaration blocks are identical after removing differing imports. Copied Redux dispatch and label/count markup: `common/ListPage/ListPageCheckboxGroup/ListPageCheckboxGroup.tsx:25,33,85`; Switch equivalent `:21,25,64`. | Checkbox supports option hidden/checked/disabled rules; Switch computes disabled differently. Radio stores a scalar and initializes selection. | **0/0 each**. | **Real Checkbox/Switch duplication.** Radio shares a contract, not the full implementation. | Checkbox owns a shared boolean-filter controller/option renderer. Add control adapter, label slot and explicit disabled-policy profile; keep deprecated Checkbox/Switch wrappers. Share Radio’s contract separately. Retain original module classes. | Medium: filter semantics already diverged | M |
| **PhoneNumberIMask / VerificationPinInputIMask; phone input wrappers** — Input foundation **A’s** | Mask pair **48.16%**: same `forwardRef`, IMask wiring and synthetic change event, `core/PhoneNumber/PhoneNumberIMask/PhoneNumberIMask.tsx:13`; `common/VerificationPinInput/VerificationPinInputIMask/VerificationPinInputIMask.tsx:16`. Prefix/Base **33.52%** and 80% prop-name overlap. | Placeholder `#`/`N`, lazy mode, capitalization, classes; Prefix calculates country code while Base installs a mask. | All four **0/0**. | **Real mask-adapter duplication.** Prefix/Base already compose InputBase. | Phone mask owns a generic internal IMask adapter with placeholder character, lazy, capitalization and class options. Deprecated wrappers map existing names. Share phone prop types; retain Prefix/Base behavior. | Medium: refs and input events | M |
| **Table / DataTable / footer controls** | Table/DataTable only **1.43%**. Actual duplication: Pagination/ShowMore **36.83% TSX, 81.25% SCSS**; ShowLess/ShowMore **34.39%**. See `core/Table/TableFooter/FooterPagination/FooterPagination.tsx:35,46`; ShowMore `:23,27`. | Table owns data, sorting, paging and toolbar; DataTable is semantic composition. Footer controls differ in callbacks, wrappers, slots and disabled selectors. | Table **29/0**; DataTable **15/0**; footer controls **0/0 each**. | **Table/DataTable are distinct.** Footer state/button/style fragments are copied. | Keep both tables. FooterShowMore owns shared footer-action rendering; parameterize action, icon, label, wrapper/slot and original classes. Deprecated footer wrappers preserve signatures. Shared SCSS mixins must retain descendant versus compound selector differences. | Medium: selectors, callbacks, hooks | M |
| **CircularGauge / ProgressCircle / ArcGauge / BenchmarkGauge** | Circular/Progress **7.77%**, but both implement circumference/dash-offset rings: `core/CircularGauge/CircularGauge.tsx:46`; `core/ProgressCircle/ProgressCircle.tsx:19`. Other gauge pair scores **2.50–5.57%**. | Progress clamps size, uses a smaller effective diameter/radius, string dash arrays, style-based offset and percentage text. Circular supports max/track/loading/children. Arc is masked semicircle/conic gradient; Benchmark is a linear marker track. | Circular **4/0**; Progress **1/0**; Arc **2/0**; Benchmark **2/0**. | **Partial ring duplication; other gauges are distinct.** | Circular owns an internal ring renderer with explicit legacy geometry/SVG-attribute/class profile; deprecated Progress wrapper keeps its percentage layout. Keep Arc and Benchmark independent. | Medium: geometry and serialized SVG differences | M |
| **BarChart / HSBChart** | **23.60% TSX; 46.90% SCSS**. `getCategories` is identical: `core/Charts/BarChart/BarChart.tsx:92`; `HSBChart/HSBChart.tsx:77`. Repeated Apex options and tooltip styling. | Vertical/distributed versus horizontal/stacked; different tooltip, legend, fonts and percentage formatting. | Bar **7/0**; HSB **4/0**. | **Real helpers/options duplication; distinct chart configurations.** | Shared internal bar-chart engine owns common options and translation helper. Public components remain deprecated profile wrappers; add orientation, stack and tooltip/legend profile inputs internally. Preserve option ordering and original selectors. | High: chart-generated DOM and tooltip HTML | L |
| **Toolbar / FormControl; DropdownMenu / Popover** — **A’s** | Toolbar/FormControl **100%** after own-name normalization: `core/Toolbar/Toolbar.tsx:11`; `core/FormControl/FormControl.tsx:10`. Menu/Popover SCSS **30.54%**, principally arrow placement. | Different MUI components and prop contracts. Menu/tooltip shadows, padding, offsets and selector ancestry differ. | Toolbar **1/0**; FormControl **0/0**; DropdownMenu **6/0**; Popover **67/0**. | Toolbar/FormControl are **boilerplate similarity**, not interchangeable implementations. Popper arrow declarations are partially copied. | Keep distinct MUI adapters. Optionally share a shell helper and arrow SCSS mixin under original selectors; no component merge. | Medium: MUI defaults and CSS specificity | S–M |
| **Loader / SmallLoader / ListLoader; ImgLoader / ImgWithLoader** | Loader pairs **2.51–5.90%**; image pair **4.41%**. See `core/Loader/Loader.tsx:19`, `SmallLoader/SmallLoader.tsx:22`, `ListLoader/ListLoader.tsx:54`, `ImgLoader/ImgLoader.tsx:16`, `ImgWithLoader/ImgWithLoader.tsx:32`. | CSS spinner; dot GIF; list-shaped placeholder; large GIF/message; image load state plus Skeleton/media overlay. | Loader **75/0**; Small **9/0**; List **3/0**; ImgLoader **6/0**; ImgWithLoader **6/0**. | **Distinct renderers.** ImgWithLoader already composes Skeleton (**A’s**). | Keep implementations. A shared loading facade would only dispatch to different renderers and would not remove meaningful duplication. | High visual risk for little gain | — |
| **FadedCarousel / FadeCarouselAuto** | **3.26%**: refs/effects/item wrappers. `core/FadedCarousel/FadedCarousel.tsx:83`; `core/FadeCarouselAuto/FadeCarouselAuto.tsx:35`. | Manual arrows/centering/edge overlays versus timed scrolling, hover pause and duplicated items for looping. | **4/0; 2/0**. | **Distinct behavior and DOM.** | Keep both; no umbrella justified under byte-identical-output constraint. | High if forced | — |
| **ListItem / ListItems / nested ListItem** | Standalone/nested rows **1.94%**; standalone/container **2.08%**. `core/ListItem/ListItem.tsx:47`; `core/ListItems/ListItem/ListItem.tsx:66`; `ListItems.tsx:83`. | Numbered/icon content row versus sticky, clickable multi-slot `<li>`. | Standalone **0/0**; nested **0/0**; ListItems **1/0**. | **Names collide; implementations differ.** ListItems already composes its nested row. | Keep both rows and current composition. No consolidation. | High if forced | — |
| **Rating / StarRating** | **4.01%**. Rating explicitly renders StarRating: `core/Rating/Rating.tsx:77`. | Rating adds numeric label/layout/clamping; StarRating owns interaction and star iteration. | **11/0; 13/0**. | **Already composed.** | Keep StarRating as owner. Resolve the misleading inherited prop surface separately; blindly forwarding more props changes existing behavior. | Medium API risk | S |
| **Link / LinkConditional / RcNavLink** | **3.58–4.83%**. LinkConditional directly composes Link: `core/LinkConditional/LinkConditional.tsx:22`. | Styled text/icon anchor versus conditional delete UI versus location-token substitution and raw prop spreading, `core/RcNavLink/RcNavLink.tsx:18`. | **64/0; 3/0; 0/0**. | **Already composed / distinct adapter.** | Keep Link owner and LinkConditional composition. Do not route RcNavLink through Link: it adds Text/classes and changes DOM attributes. | Medium | — |
| **Alert / LineAlert / InfoBox / common InfoText** | Highest **13.54%** Alert/LineAlert; others **4.08–8.94%**. `core/Alert/Alert.tsx:16`; `LineAlert/LineAlert.tsx:23`; `InfoBox/InfoBox.tsx:83`; `common/InfoText/InfoText.tsx:20`. | Different severity colors/icons, `warn`/`warning`, typography, dismissal/actions and wrappers. | Alert **367/0**; Line **3/291**; InfoBox **135/0**; InfoText **0/0**. | **Related semantics, little copied rendering.** | Keep renderers. Share severity types/data only where values actually agree; preserve legacy mappings. InfoBox’s Collapse/Button dependencies are **A’s**. | Medium–high visual/service exposure | S for types; no full merge |
| **TextHighlighted / Text; fragment/preset wrappers** | TextHighlighted/Text props have **75% field-name overlap**; it already delegates: `core/TextHighlighted/TextHighlighted.tsx:40`. TextWrapBalancer/ActionCardBody **35.14%**, mostly fragment return. | Highlighted renames one prop; Balancer conditionally uses a library; ActionCardBody only returns children. | See four-column usage below. | **Existing deprecated composition; copied types and trivial wrappers.** | Keep Text owner and existing deprecated Highlighted wrapper. Derive compatible props from Text with `Pick`/`Omit`; keep legacy accepted types. Retain ActionCardBody as a deprecated compatibility wrapper. | Low–medium type compatibility | S |
| **TextEditDrawer / MultiSelectDrawer; ActionBar templates** — Drawer foundation **A’s** | Drawer styles **68.33%**, TSX **20.21%**; identical title/actions declarations: `core/CustomDrawers/TextEditDrawer/TextEditDrawer.module.scss:22`; MultiSelect equivalent `:22`. ActionBar template styles **50.51%**. | Scalar validation/restoration versus async multi-selection. ActionBar message/footer have different gaps and content. | Text drawer **0/2**; MultiSelect **0/0**; ActionBarFooter **0/2**; Message **0/1**. | **Copied shells/styles; distinct workflows.** | Shared internal drawer chrome owns title/body/actions slots; deprecated wrappers retain workflow controllers and original module classes. ActionBar needs only a layout mixin. | Medium | M |
| **Notification QuoteContainers** | **25.68%**, same asset hook/content/SVG purpose: `core/QuoteContainer/QuoteContainer.tsx:20`; `core/Notification/QuoteContainer/QuoteContainer.tsx:17`. | Different wrappers/layout/classes; modern guards loading/error; legacy renders both `<SvgIcon/>` and StyledSVG. | Public **1/0**; notification-local **0/0**. | **Diverged copy**, not safe aliasing. | Public QuoteContainer may own a profile-based renderer with legacy structure/asset rendering retained; deprecated local wrapper. Low return relative to compatibility complexity. | High | M |


Usage ledger (direct JSX / service / internal / WordPress):

| component/export | rc-webapp direct JSX sites | rc-webapp service call sites rendering it | internal Vanguard importers | WordPress export |
|---|---:|---:|---:|---|
| NotificationAction — standalone | 0 | 0 | 0 | no |
| NotificationAction — nested/root export | 0 | 0 | 1 | no |
| Notification | 1 | 0 | 0 | no |
| NotificationSource | 1 | 0 | 1 | no |
| QuoteContainer — public | 1 | 0 | 0 | no |
| QuoteContainer — notification-local | 0 | 0 | 1 | no |
| Marker — local legacy class | 0 | 0 | 0 | no |
| MarkerF — local legacy function | 0 | 0 | 0 | no |
| AdvancedMarker | 0 | 0 | 0 | no |
| AdvancedMarkerF | 0 | 0 | 0 | no |
| MarkerF — external package re-export | 0 | 0 | 0 | no |
| AcceptModal | 0 | 5 | 1 | no |
| ConfirmModal | 0 | 67 | 1 | no |
| EditModal | 21 | 0 | 1 | yes |
| BigAssEditModal | 3 | 0 | 0 | no |
| ErrorModal | 22 | 63 | 2 | no |
| SuccessModal | 5 | 0 | 0 | no |
| LoadingModal | 5 | 40 | 1 | no |
| DateRangeModal | 0 | 0 | 1 | no |
| PhotoCarouselModal | 0 | 7 | 1 | no |
| TestModal | 0 | 0 | 0 | no |
| ImplementDetailsModal | 0 | 0 | 1 | no |
| ListPageCheckboxGroup | 0 | 0 | 1 | no |
| ListPageSwitchGroup | 0 | 0 | 1 | no |
| ListPageRadioGroup | 0 | 0 | 1 | no |
| PhoneNumberIMask | 0 | 0 | 1 | no |
| VerificationPinInputIMask | 0 | 0 | 1 | no |
| PhoneNumberPrefix | 0 | 0 | 1 | no |
| PhoneNumberBase | 0 | 0 | 1 | no |
| Table | 29 | 0 | 0 | no |
| TableHeader | 10 | 0 | 1 | no |
| TableCell | 1 | 0 | 1 | no |
| TableFooter | 0 | 0 | 1 | no |
| FooterPagination | 0 | 0 | 1 | no |
| FooterShowMore | 0 | 0 | 1 | no |
| FooterShowLess | 0 | 0 | 1 | no |
| DataTable | 15 | 0 | 0 | no |
| DataTableHead | 13 | 0 | 0 | no |
| DataTableBody | 16 | 0 | 0 | no |
| DataTableFoot | 0 | 0 | 0 | no |
| DataTableRow | 39 | 0 | 0 | no |
| DataTableCell | 145 | 0 | 0 | no |
| CircularGauge | 4 | 0 | 0 | no |
| ProgressCircle | 1 | 0 | 0 | no |
| ArcGauge | 2 | 0 | 0 | no |
| BenchmarkGauge | 2 | 0 | 0 | no |
| BarChart | 7 | 0 | 0 | no |
| HSBChart | 4 | 0 | 0 | no |
| Toolbar — **A’s** | 1 | 0 | 0 | no |
| FormControl — **A’s** | 0 | 0 | 0 | no |
| DropdownMenu — **A’s** | 6 | 0 | 2 | no |
| Popover — **A’s** | 67 | 0 | 9 | yes |
| PopoverPopper — **A’s** | 0 | 0 | 1 | no |
| Loader | 75 | 0 | 0 | no |
| SmallLoader | 9 | 0 | 0 | no |
| ListLoader | 3 | 0 | 1 | no |
| ImgLoader | 6 | 0 | 0 | no |
| ImgWithLoader | 6 | 0 | 0 | no |
| FadedCarousel | 4 | 0 | 0 | no |
| FadeCarouselAuto | 2 | 0 | 0 | no |
| ListItem — standalone | 0 | 0 | 2 | no |
| ListItem — nested | 0 | 0 | 1 | no |
| ListItems | 1 | 0 | 0 | no |
| Rating | 11 | 0 | 0 | no |
| StarRating | 13 | 0 | 3 | no |
| Link | 64 | 0 | 5 | yes |
| LinkConditional | 3 | 0 | 0 | no |
| RcNavLink | 0 | 0 | 0 | no |
| Alert | 367 | 0 | 0 | no |
| LineAlert | 3 | 291 | 1 | no |
| InfoBox | 135 | 0 | 1 | yes |
| InfoText | 0 | 0 | 0 | no |
| TextHighlighted | 0 | 0 | 1 | yes |
| Text | 6895 | 478 known template paths¹ | 126 | yes |
| TextWrapBalancer | 0 | 0 | 1 | yes |
| ActionCardBody | 6 | 0 | 0 | no |
| Label | 6 | 0 | 2 | no |
| PageContainer | 0 | 0 | 0 | no |
| TextEditDrawer | 0 | 2 | 1 | no |
| MultiSelectDrawer | 0 | 0 | 1 | no |
| ActionBarFooter | 0 | 2 | 1 | no |
| ActionBarMessage | 0 | 1 | 1 | no |
| ListPageHeader — current nested implementation | 0 | 0 | 1 | no |
| ListPageHeaderWithActions | 0 | 0 | 1 | no |
| RcTransparentShowcase | 0 | 0 | 0 | no |
| CssUpdatesShowcase | 0 | 0 | 0 | no |

| component/export | rc-webapp direct JSX sites | rc-webapp service call sites rendering it | internal Vanguard importers | WordPress export |
|---|---:|---:|---:|---|
| NotificationAction — standalone | 0 | 0 | 0 | no |
| NotificationAction — nested/root export | 0 | 0 | 1 | no |
| Notification | 1 | 0 | 0 | no |
| NotificationSource | 1 | 0 | 1 | no |
| QuoteContainer — public | 1 | 0 | 0 | no |
| QuoteContainer — notification-local | 0 | 0 | 1 | no |
| Marker — local legacy class | 0 | 0 | 0 | no |
| MarkerF — local legacy function | 0 | 0 | 0 | no |
| AdvancedMarker | 0 | 0 | 0 | no |
| AdvancedMarkerF | 0 | 0 | 0 | no |
| MarkerF — external package re-export | 0 | 0 | 0 | no |
| AcceptModal | 0 | 5 | 1 | no |
| ConfirmModal | 0 | 67 | 1 | no |
| EditModal | 21 | 0 | 1 | yes |
| BigAssEditModal | 3 | 0 | 0 | no |
| ErrorModal | 22 | 63 | 2 | no |
| SuccessModal | 5 | 0 | 0 | no |
| LoadingModal | 5 | 40 | 1 | no |
| DateRangeModal | 0 | 0 | 1 | no |
| PhotoCarouselModal | 0 | 7 | 1 | no |
| TestModal | 0 | 0 | 0 | no |
| ImplementDetailsModal | 0 | 0 | 1 | no |
| ListPageCheckboxGroup | 0 | 0 | 1 | no |
| ListPageSwitchGroup | 0 | 0 | 1 | no |
| ListPageRadioGroup | 0 | 0 | 1 | no |
| PhoneNumberIMask | 0 | 0 | 1 | no |
| VerificationPinInputIMask | 0 | 0 | 1 | no |
| PhoneNumberPrefix | 0 | 0 | 1 | no |
| PhoneNumberBase | 0 | 0 | 1 | no |
| Table | 29 | 0 | 0 | no |
| TableHeader | 10 | 0 | 1 | no |
| TableCell | 1 | 0 | 1 | no |
| TableFooter | 0 | 0 | 1 | no |
| FooterPagination | 0 | 0 | 1 | no |
| FooterShowMore | 0 | 0 | 1 | no |
| FooterShowLess | 0 | 0 | 1 | no |
| DataTable | 15 | 0 | 0 | no |
| DataTableHead | 13 | 0 | 0 | no |
| DataTableBody | 16 | 0 | 0 | no |
| DataTableFoot | 0 | 0 | 0 | no |
| DataTableRow | 39 | 0 | 0 | no |
| DataTableCell | 145 | 0 | 0 | no |
| CircularGauge | 4 | 0 | 0 | no |
| ProgressCircle | 1 | 0 | 0 | no |
| ArcGauge | 2 | 0 | 0 | no |
| BenchmarkGauge | 2 | 0 | 0 | no |
| BarChart | 7 | 0 | 0 | no |
| HSBChart | 4 | 0 | 0 | no |
| Toolbar — **A’s** | 1 | 0 | 0 | no |
| FormControl — **A’s** | 0 | 0 | 0 | no |
| DropdownMenu — **A’s** | 6 | 0 | 2 | no |
| Popover — **A’s** | 67 | 0 | 9 | yes |
| PopoverPopper — **A’s** | 0 | 0 | 1 | no |
| Loader | 75 | 0 | 0 | no |
| SmallLoader | 9 | 0 | 0 | no |
| ListLoader | 3 | 0 | 1 | no |
| ImgLoader | 6 | 0 | 0 | no |
| ImgWithLoader | 6 | 0 | 0 | no |
| FadedCarousel | 4 | 0 | 0 | no |
| FadeCarouselAuto | 2 | 0 | 0 | no |
| ListItem — standalone | 0 | 0 | 2 | no |
| ListItem — nested | 0 | 0 | 1 | no |
| ListItems | 1 | 0 | 0 | no |
| Rating | 11 | 0 | 0 | no |
| StarRating | 13 | 0 | 3 | no |
| Link | 64 | 0 | 5 | yes |
| LinkConditional | 3 | 0 | 0 | no |
| RcNavLink | 0 | 0 | 0 | no |
| Alert | 367 | 0 | 0 | no |
| LineAlert | 3 | 291 | 1 | no |
| InfoBox | 135 | 0 | 1 | yes |
| InfoText | 0 | 0 | 0 | no |
| TextHighlighted | 0 | 0 | 1 | yes |
| Text | 6895 | 478 known template paths¹ | 126 | yes |
| TextWrapBalancer | 0 | 0 | 1 | yes |
| ActionCardBody | 6 | 0 | 0 | no |
| Label | 6 | 0 | 2 | no |
| PageContainer | 0 | 0 | 0 | no |
| TextEditDrawer | 0 | 2 | 1 | no |
| MultiSelectDrawer | 0 | 0 | 1 | no |
| ActionBarFooter | 0 | 2 | 1 | no |
| ActionBarMessage | 0 | 1 | 1 | no |
| ListPageHeader — current nested implementation | 0 | 0 | 1 | no |
| ListPageHeaderWithActions | 0 | 0 | 1 | no |
| RcTransparentShowcase | 0 | 0 | 0 | no |
| CssUpdatesShowcase | 0 | 0 | 0 | no |


### Story renames so verifier 2 can check slotted components (watchdog)
1. `Rating.stories.tsx`, `RatingDistribution.stories.tsx`, `SmallLoader.stories.tsx` → `_*.stories.tsx` (never collected before; also added to the never-run list above).
2. Setup-only edits after the rename, listed: (a) all three: `export default SbDecorator({...})` → `export default { ...SbDecorator({...}) }` (the Storybook indexer rejects a call expression as default export; this is the shape every collected story uses); (b) RatingDistribution: the meta `argTypes.*.defaultValue` values (ignored since Storybook 7, so `ratingDistributionData` was undefined and the render threw) repeated as meta `args` with the same values. No story body, render or assertion changed. Result: 3/3 stories green.

### Audit item 1: NotificationAction standalone copy → re-export (watchdog APPROVED)
1. `src/core/NotificationAction/NotificationAction.tsx` now re-exports `NotificationAction` + `NotificationActionProps` from `src/core/Notification/NotificationAction/` (the root export). Same names importable from the old path; no public export added or removed.
2. Spec `_NotificationAction.reexport.spec.tsx`: identity (red before: two different functions; green after) + markup equality over 4 prop combinations (label, width, iconLeft, iconRight).
3. `NotificationAction.scss` in the old folder is now imported by nobody; kept because `_showcase/CssUpdatesShowcase/data.ts:580` lists its path. Its `NotificationAction.stories.tsx` has no underscore, so it was never collected (on the never-run list); it imports from the old path and so now renders the single implementation.

### Audit item 3: Table footer controls on one renderer (watchdog APPROVED)
1. New internal `TableFooter/FooterAction/FooterAction.tsx` (not exported): CtaWithIcon + Text label, colour by `disabled`. FooterPagination (Back/Next), FooterShowMore and FooterShowLess render it; their hooks, callbacks, containers, slots and module classes are unchanged; every file and export stays.
2. SCSS: `FooterAction/_footer-action.scss` mixin emits the shared `.spacer` + `.link-color` rules; FooterPagination/FooterShowMore modules `@include` it and keep their own `.disabled` rule (descendant vs compound selector preserved). Compiled CSS (sass, both modules) byte-identical before/after; class names unchanged (same files, same class names).
3. Characterization spec `_TableFooterControls.characterization.spec.tsx`: 3 controls × 5 pagination states × hidden → 30 markup snapshots captured from the pre-refactor code (8f3b328) into `__fixtures__/footer-controls.json` (stable across 2 re-runs, icons awaited); identical after the refactor.
4. Table specs 23/23, stories 18/18, tsc 0, biome same diagnostics before/after.

### Audit item 7: BarChart / HSBChart shared helper (watchdog APPROVED, helper only; A informed)
1. `src/helpers/charts/translate-labels.ts` `translateLabels(labels)` replaces three identical copies (BarChart `getCategories` + `getCustomLegendItems`, HSBChart `getCategories`); the local names stay as aliases so the options code is untouched. BarChart's now-unused `translationService` import removed.
2. Options builder NOT extracted: diffing the two option objects shows ~25 differing values (orientation, column width, radius, fonts Roboto vs theme typeface, legend position/size/markers, grid colour/position, axis visibility, formatters); a shared builder would be only parameters. Recorded as not worth it.
3. Spec `_translate-labels.spec.ts` (red: module missing → green 3/3): order, call keys, new array, input untouched, empty. Chart stories 7/7, tsc 0, biome same before/after.
