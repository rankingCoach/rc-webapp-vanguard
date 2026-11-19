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

### Audit item 10: TextHighlighted props derived from Text's (watchdog APPROVED, type-only)
1. `Props` = `Pick<TextProps, 24 keys>` + `caseInsensitive`; `textWrap` stays written out because Text's is wider (`'pre-wrap' | 'pre'`), so a plain Pick would have widened TextHighlighted. `TextHighlightedProps extends Props` unchanged; no runtime change.
2. Type spec `_TextHighlighted.types.spec.ts` (checked by `tsc -p tsconfig.spec.json`): `Props` and `TextHighlightedProps` `toEqualTypeOf` the hand-written legacy shape. Sensitivity shown: a plain Pick including `textWrap` fails it (TS2344 on textWrap); final version passes. TextHighlighted spec 1/1 + stories 3/3, tsc 0, biome: only the pre-existing `noChildrenProp` in the old spec.
3. Left as logged (watchdog): ActionCardBody (returns children only), RcNavLink (raw prop spread). QuoteContainer pair: known divergence, left. Masked inputs: A's.

## Candidates for removal (user decides; waiting for verifier 2's reachability map)
1. `src/core/GoogleMaps/GoogleMapsMarker/Marker.tsx` (≈880 lines; 75% copy of AdvancedMarker.tsx): imported by no file in src (grep for `GoogleMapsMarker/Marker`, `./Marker`), not re-exported by `src/core/GoogleMaps/index.ts`, `src/index.ts` or `src/index-wordpress.ts`; the public `MarkerF` is `export { MarkerF } from '@react-google-maps/api'`. rc-webapp: 0 direct, 0 service.
2. Correction to the Codex audit row: `GoogleMapsMarker/AdvancedMarker.tsx` is NOT dead — `src/core/GoogleMaps/index.ts` exports `MarkerF as AdvancedMarkerF, Marker as AdvancedMarker` and its props type publicly. Keep.

### Audit item 4: CircularGauge / ProgressCircle — STOPPED, both kept (watchdog's stop rule)
Byte-identical SVG for ProgressCircle would need its own complete render branch inside CircularGauge, i.e. the duplication moved, not removed. Differences that all reach the markup: geometry (ProgressCircle clamps size 1..100, stroke = 10% of size, `normalizedRadius = radius - stroke/2`, diameter = size - stroke; CircularGauge `radius = (size - strokeWidth)/2` on the full size), `strokeDasharray` as the string "c c" vs a number, `strokeDashoffset` as inline style vs attribute, `viewBox` + `rotate(-90)` transform + `strokeLinecap="round"` only on CircularGauge, track stroke `var(--n200)` literal vs parsed variable, attribute order, different CSS-module classes, and ProgressCircle's built-in "NN %" Text block vs CircularGauge's children slot. Recorded as known divergence; time spent ≈15 min reading.

### Batch 4: ActionBar, gauges, Notification family, lists and small own components
Drafted by Codex (medium), read by me; renames by me: ListItems' nested row `list-items-item*` (the standalone ListItem keeps `list-item*`; two different components must not share a slot), Notification's local QuoteContainer `notification-quote*` (the public QuoteContainer gets `quote-container` later).
| Component | Attributes |
|---|---|
| AIOrb | `ai-orb` |
| ActionBar / ActionBarFooter / ActionBarMessage | `action-bar`; `action-bar-footer`; `action-bar-message`, `-info`, `-description` |
| ActionButton | nothing (renders Button, A's) |
| ArcGauge | `arc-gauge`, `-track`, `-fill`, `-mask`, `-text` |
| AvatarStack | `avatar-stack`, `-item`, `-avatar`, `-image` |
| BenchmarkGauge / Marker / Pin | `benchmark-gauge` + `data-orientation`, `-legend`, `-legend-item`, `-track-wrapper`, `-track`, `-ghost`, `-fill`; `benchmark-gauge-marker` + `data-orientation`, `-marker-content`; `benchmark-gauge-pin`, `-pin-default`, `-pin-highlighted-content` |
| DragAndDropFile | `drag-and-drop-file`, `-label`, `-input` |
| FadeCarouselAuto | `fade-carousel-auto`, `-scroll`, `-item` |
| MediaItemSelectInput | `media-item-select-input` |
| GallerySummary | `gallery-summary`, `-item`, `-image`, `-more` |
| ListItem | `list-item-container`, `list-item`, `-coming-soon`, `-content` |
| ListItems | `list-items`, `list-items-list`; row `list-items-item`, `-left`, `-middle`, `-title`, `-content`, `-last`, `-right` |
| Notification | `notification`, `-header`, `-header-title`, `-header-meta`, `-content`, `-actions`; ContentPlaceholder `content-placeholder`; NotificationAction `notification-action`; NotificationReview `notification-review`, `-text`, `-stars`, `-author`; NotificationSocialPost `notification-social-post`; local QuoteContainer `notification-quote`, `-content`, `-marks`; NotificationSource `notification-source` |
Evidence: red 15/16 (ActionButton "no own slot" passes by design), green 16/16; touched-folder specs 16 files / 24, stories 15 / 91; tsc 0; biome 19 = 19, 0 on new specs; attribute-only 50 = 50; collision check: no hit. Codex's wider scan found `[data-slot=avatar|switch|badge|card…]` selectors only in rc-webapp `nexus/` (a separate shadcn app that does not import Vanguard) and `editor-bridge/__fixture__/studio-*.html` (test fixtures) — neither can match Vanguard DOM; noted as a risk if nexus ever embeds Vanguard.

### Batch 5: ModalHeader / ModalBody / ModalFooter (watchdog Q2; A confirmed the files were free)
| Component | Attributes |
|---|---|
| ModalHeader | root `modal-header` + `data-type` (danger/warn/success/info/default); `modal-header-title`; `modal-header-icon`. Close Button (A's) untouched |
| ModalBody | `modal-body` + `data-mode` (`fill` or absent) |
| ModalFooter | ComponentContainer root `modal-footer` (consumer className); `modal-footer-buttons` + `data-position` (start/end/between/center; default end, matching the default class). Render group and Buttons untouched |
Evidence: red 3/3 → green 3/3; Modal/StandardModals/CustomModals specs 12 files / 243, stories 12 / 112; tsc 0; biome 1 = 1; attribute-only stream check OK (the line check now also reports reflow; the stream check compares the concatenated text per file); collision: `[data-mode="basic"|"advanced"]` in legacy html/{integrum,jump}/jira.css only, values never emitted.
3. Verifier 2's reachability map (rc-webapp `tmp/research/vanguard-ui-sdk-visual-baseline/v2/reachability-map.md`, Vanguard ef2ee15, 300 value exports: direct 230 / indirect 50 / WordPress-only 4 / unreachable 16): confirms TextHighlighted = WordPress-only. AdvancedMarker / AdvancedMarkerF are public exports but unreachable from rc-webapp and not in the WordPress closure; the local `Marker.tsx` is not even an export. All 16 unreachable rows are public exports, so removing any is a breaking change: user decides at the next major (list + evidence in the map). Batch order: the unreachable components I still slot (AIBudgetEnd, OnboardingWelcomeAnimation, RcNavLink, SvgImage, DragAndDropFile done) go last, per the user's "zero-usage still migrated, last".

### Batch 6: core leftovers + first src/common group
Drafted by Codex (medium), read by me; spec fixes by me (SvgImage's runtime `require(path)` needs a resolvable module in jsdom; SegmentBar spec forEach lint).
| Component | Attributes |
|---|---|
| ProgressCircle | `progress-circle`, `-svg`, `-track`, `-value`, `-label` |
| QuoteContainer (public) | `quote-container`, `-body`, `-marks` |
| RcNavLink | `<a>` `rc-nav-link` (before the raw props spread) |
| SegmentBar | `segment-bar`, `segment-bar-segment` (loading only changes inline styles: no state attr) |
| SocialMediaLink | `social-media-link` (both branches) |
| SvgImage | `<img>` `svg-image` |
| AssetPreloader | `asset-preloader` (its own hidden wrapper) |
| TextIcon / GeneratedWithAIPill | `text-icon` / `generated-with-ai-pill` |
| InfoText | `info-text-container`, `info-text` |
| PageSectionLoading | `page-section-loading-content`, `page-section-loading-image` + `data-size` (small/medium/large, default large); root is PageSection (already `page-section`) |
| DiscountBadge | `discount-badge`, `-border` |
| FeatureBox | `feature-box`, `-content`, `-title`, `-features`, `-media`, `-animation` |
| ErrorText | nothing (Text + AnimatedConditional only) |
Evidence: red 13/14 → green 14/14; touched-folder specs 16 files / 19 (incl. existing); collected stories 3 files / 19 (src/common stories are not collected; the new specs render each component); tsc 0; biome 6 = 6, 0 on new specs; attribute-only stream OK; collision: `[data-size=default|sm|lg]` + shadcn slots only in rc-webapp editor-bridge `__fixture__/lumen-*.html` / `studio-*.html` test fixtures; none in Vanguard-rendering code.

### Track 2 follow-up: example coverage (watchdog, lowest priority)
1. The generator resolves plain identifiers and `helper.key` lookups in story args through top-level consts of the story file and its relative imports (e.g. `testMessages.danger` from `stories/_Alert.default.ts`), unwrapping `as const`; `children` may be such a lookup too.
2. Examples with no attribute and no children (`<AIOrb />`) and JSX longer than 320 characters (chart series, big data) are skipped.
3. Pages with examples: 27 → 49 of 298. Spec 8/8 (the one red run was the determinism test while Codex was editing src between the spec's two generations; green once src was stable).

### Batch 7: remaining src/common components
Drafted by Codex (medium), read by me; spec fix by me (PageSectionRecommended renders LottieAnimationLoader → jsdom canvas error after the test; added the lottie-web mock used by `_error-logging.spec.tsx`).
| Component | Attributes |
|---|---|
| AIBudgetEnd | `ai-budget-end-first-paragraph`, `-second-paragraph` (root is Modal/ModalBody, which take no data-*) |
| AgeSlider / ExpandableItem / InvoiceAddress / OpeningTimes / SectionMissing / StatisticsBoard | root slot each (`age-slider`, `expandable-item`, `invoice-address`, `opening-times`, `section-missing`, `statistics-board`) |
| BusinessListItemWithConnections | `business-list-item-with-connections-container`, `business-list-item-with-connections`, `-details` |
| DashboardCard | `dashboard-card`, `-title`, `-info`, `-content` |
| EditableCard | `editable-card`, `-header`, `-actions`, `-content` |
| GooglePartnerBadge | `google-partner-badge`, `-link`, `-image` |
| HoverableCard | `hoverable-card` + `data-disabled`, `-header`, `-subtitles`, `-subtitles-separator`, `-content` |
| IncentiveBox | `incentive-box-container`, `incentive-box`, `-content` |
| ListingServiceConnectionStatus | `listing-service-connection-status-container`, `listing-service-connection-status`, `-account`, `-avatar`, `-details` |
| OnboardingWelcomeAnimation | `onboarding-welcome-animation` |
| OpportunityCard | `opportunity-card`, `-image`, `-content`, `-header`, `-subtitle` |
| PageContainer | `page-container` (before the props spread: caller wins) |
| PageSectionRecommended | `page-section-recommended` (styled inner root), `-image`, `-content`, `-title`, `-children` |
| RecommendationCard | `recommendation-card`, `-content`, `-badge`, `-image`, `-toggle` |
| UpsellingTrigger | `upselling-trigger-container`, `upselling-trigger`, `-content`, `-illustration` |
| Tutorial | nothing (root is Modal) |
Evidence: red 21/23 (2 "no own slot" passes) → green 24/24 (21 files); spec + SectionMissing story green; tsc 0; biome 10 = 10, 0 on new specs; attribute-only stream OK; collision: none.
Track 1 status: every (a) component in src/core and src/common now has its DOM contract or a recorded reason for none.

## Decided by the watchdog (after Track 1 completion)
1. (b) Enable never-run specs/stories, B's slotted folders first: `_` rename + setup/import-only fixes. A spec failing against current behaviour is NOT edited and the component NOT changed: it stays un-prefixed and is listed with the failing assertion and "stale test" vs "real bug?" (real-bug candidates to the watchdog). Stories enabled only if they render without errors; verifier 2 gets the new story ids per commit (same-build render check, no .472 baseline). One commit per folder group, small packs, targeted runs only (host load 80–125).
2. (a) `-container` slots on A's components: NO for now; they land with A's rebuild. A gets the collision tool + convention note once.
3. (c) runtime agent bridge: not started.
4. Next (d): leak-hygiene specs for B-slotted non-MUI components that register listeners/timers/rAF/observers/portals/body mutations: mount → unmount → nothing left. Inventory table to the watchdog before fixing anything non-trivial; real leaks fixed with a reproducing spec, minimal diff, listed for verifier 2's Tier P.
5. Handoffs combine small batches while verifier 2 is busy (one paired run base = last PASS vs tip).
Tools copied to `agentic-plans/uisdk-tools-b/` (collision-check.sh, attr-only-check.py).

### (b) Enable never-run tests: Table group
1. Specs enabled (renamed `_*.spec.tsx`), 10: TableBody, TableBodyRenderer, TableCell, TableFooter, FooterPagination, FooterShowLess, FooterShowMore, TableHeader, CtaWithIcon, TablePlaceholder. Setup-only edit in each: `import { describe, test } from 'vitest';` (they relied on globals; failed with `describe is not defined`). Assertions untouched. Table specs 14 files / 33 green.
2. NOT enabled, stale test: `Table/Table.spec.tsx` — imports `TableData` from `Table.mock.tsx`, which is entirely commented out (`TypeError: Cannot read properties of undefined (reading 'columns')`). Stale fixture, not a component bug.
3. Stories enabled, 9: TableBody, TableBodyRenderer, TableCell, TableFooter, FooterPagination, FooterShowLess, FooterShowMore, CtaWithIcon, TablePlaceholder. Setup-only: object-literal default export. Table stories 12 files / 27 green.
4. NOT enabled: `Table/Table.stories.tsx` (would collide with the existing `_Table.stories.tsx`, and uses the commented-out `TableData`), `TableHeader/TableHeader.stories.tsx` (uses `TableData`).

### (b) Enable never-run tests: B-slotted folders, second group
1. Specs enabled (18): ActionCardBody, ActionCardHeader, Avatar, StatusBadge (as `_StatusBadge.legacy.spec.tsx`, the `_StatusBadge.spec.tsx` name was taken), ClipboardText, FrostedGlass, ImgLoader, ImgWithLoader, SmallLoader, ProgressCircle, Rating, RatingDistribution, TogglerWithText, DragAndDropFile, Render, SocialMediaLink `utils`, ElementsBeforeAfter, TextWrapBalancer. Setup-only: `vitest` import (globals) and, where jest-dom matchers are used, `import '@testing-library/jest-dom/vitest'`. 18 files / 35 tests green.
2. Stories enabled (11): ActionCardActions, ActionCardBody, ActionCardHeader, ElementsBeforeAfter, ListItem, Notification, NotificationAction, ProgressCircle, Render, TogglerWithText, TextWrapBalancer. Setup-only: object-literal default export. 11 files / 12 green.
3. Kept off (assertion fails against current behaviour; not edited, component not changed):
   1. `LineAlert/LineAlert.spec.tsx`: `getByTestId('line-alert-icon-svg')` right after the icon span appears; StyledSVG injects the inline SVG and its testid asynchronously → stale/timing test (sync query), not a bug.
   2. `ListItem/ListItem.spec.tsx`: `expect(iconList.innerHTML).toBe('1')` but the number renders inside a Text `<span>` (also on 2e33fd7, before the Text slot) → stale test.
   3. `ListItems/ListItems.spec.tsx`, `ListItems/ListItem/ListItem.spec.tsx`: `TypeError: ListItemsMock is not a function` → stale mock.
   4. `ListItems/ListItems.stories.tsx`, `ListItems/ListItem/ListItem.stories.tsx`: fail to import (named import missing from the module) → stale.
   5. `FadeCarouselAuto/FadeCarouselAuto.stories.tsx`: its play query fails (TestingLibraryElementError on the scroll container) → stale/timing, needs a look by whoever owns the story.
   6. `GlobalStateComponent/GlobalStateComponent.stories.tsx`, `InfoBox/InfoBox.stories.tsx`: an `_`-prefixed story with the same name exists; renaming would collide.
No real-bug candidates in this group.

## (d) Leak hygiene of B-slotted non-MUI components (watchdog APPROVED: spec per row, red first, minimal fixes)
| # | component | finding | commit | spec (red → green) |
|---|---|---|---|---|
| 1 | ListItems | scroll listener added on every `items` change, never removed (stale `sticky` closures pile up) | c2d9e07 | `_ListItems.hygiene.spec.tsx`: 3 listeners after 2 updates → 1; 1 left after unmount → 0; updated+scroll innerHTML == fresh mount+scroll (also true on the old code in jsdom, so no visible-state change) |
| 2 | FadedCarousel (center mode) | rAF loop never cancelled on unmount / [mode, items] change | ca27407 | `_FadedCarousel.hygiene.spec.tsx`: 2 pending frames after an items change → 1; unmount → 0 |
| 3 | StarRating | 2 s hover re-enable timer outlives unmount; one more per click | 311dbca | `_StarRating.hygiene.spec.tsx`: timer left after unmount → 0; 3 clicks → 1 pending timer |
| 4–10 | ActionBar resize, AnimatedNumber timeout+rAF, FadeCarouselAuto interval, FadedCarousel scroll listener, Tabs observers/resize/rAF, Tabs setTimeout(0) ref reset, saveCsvFile link | already clean | 66c42e1 | spec-only, all green (FadedCarousel's count excludes React's own root listener on the RTL container) |

### Behaviour deltas for the user
1. StarRating (311dbca): after a rating change hover is disabled for 2 s. Before: each click armed its own timer, so hover came back 2 s after the FIRST of several quick clicks (and timers fired after unmount). After: 2 s after the LAST click; nothing fires after unmount. Accepted by the watchdog as a bug fix.

### (d) item 6: src/common stories (temporary glob, never committed; .storybook/main.ts restored and clean)
1. Every src/common story used `export default SbDecorator(...)`, which the Storybook indexer rejects; one such file breaks indexing for all. Setup-only fix committed for the 24 story files in B-slotted common folders (object-literal default export; 9 also needed `import { type XProps }`: the Props interface was imported as a value, which fails as browser ESM). A-owned common folders (ComingSoonCard, InfoIcon, ListPage, PaymentMethod, ReviewsTypesCheckboxGroup, SpendingForecastSection, Verification*) untouched.
2. Render with a temporary explicit list: 14 files render (sent to A as an explicit list to add next to SectionMissing in `.storybook/main.ts`): src/common/DashboardCard/_DashboardCard.stories.tsx src/common/EditableCard/_EditableCard.stories.tsx src/common/ErrorText/_ErrorText.stories.tsx src/common/ExpandableItem/_ExpandableItem.stories.tsx src/common/GooglePartnerBadge/_GooglePartnerBadge.stories.tsx src/common/InfoText/_InfoText.stories.tsx src/common/PageSectionLoading/_PageSectionLoading.stories.tsx src/common/RecommendationCard/_RecommendationCard.stories.tsx src/common/StatisticsBoard/StatisticsBoardItem/_StatisticsBoardItem.stories.tsx src/common/TextIcon/_TextIcon.stories.tsx src/common/Tutorial/TutorialStep/_TutorialStep.stories.tsx src/common/Tutorial/_Tutorial.stories.tsx src/common/_Palette.stories.tsx src/common/_Spacing.stories.tsx 
3. Kept off: `OpeningTimes/_OpeningTimes.stories.tsx` (story body commented out, references a missing mock); `OpeningTimes/OpeningTimesItem/_OpeningTimesItem.stories.tsx` (its play assertion fails → stale); 9 stories whose component stylesheet does not compile: DiscountBadge, FeatureBox, HoverableCard, IncentiveBox, InvoiceAddress, PageSectionRecommended, RecommendationBadge, StatisticsBoard, UpsellingTrigger.
4. REAL-BUG CANDIDATE (latent, to the watchdog): those 9 components' `*.module.scss` import `../../../styles/{spacings,media-mixins}` from `src/common/<X>/`, one directory too high (`sass`: "Can't find stylesheet to import"). They are exported from neither `src/index.ts` nor `src/index-wordpress.ts` and imported by nothing except StatisticsBoard→StatisticsBoardItem and PageSectionRecommended→RecommendationBadge, so no consumer is affected today; any import of them would break the build.
5. Process note: one retry run went out with an empty file list and ran the whole Storybook project (243 files) under high host load; 13 failures there were in A's areas (Popper styles, Select search, Drawer/Modal) plus the known-unstable Tabs RTL overflow stories — not investigated, load-related unless verifier 2 says otherwise.

## Decided by the watchdog (after (d))
1. Fix the 9 common SCSS import paths (one commit); proof: dist + dist-wordpress CSS sha256 identical before/after + each of the 9 renders in a spec/story; list them as dead-code candidates for the user.
2. The accidental whole-project Storybook run: failing ids to A as "seen once under load, unverified"; runner guard: empty file list = abort.
3. Common stories: explicit list (A applies).
4. Then (e): D10 efficiency MEASUREMENT only (no code change), table to watchdog + A.

### Agent docs coverage (watchdog item 4 of the (d) round)
The generator also reads the component folder's own `_*.stories.tsx` story objects (args) after `stories/*.story.tsx`. Pages with examples: 49 → 56 of 298 (most newly enabled stories are render functions, not args, so they add little). Spec 8/8.

### Item 1: common SCSS import paths fixed (watchdog decision)
1. 10 files under `src/common` imported `src/styles/*` one directory too high (`../../../styles/` at depth 3, `../../../../styles/` at depth 4): DiscountBadge, FeatureBox, HoverableCard, IncentiveBox, InvoiceAddress, PageSectionRecommended, RecommendationBadge, StatisticsBoard, UpsellingTrigger (the watchdog's 9) + ListingServiceConnectionStatus (same bug, B7 folder). Each import path corrected by one level; nothing else changed.
2. Proof: `dist/vanguard.css` sha256 f2c14688…f233 and `dist-wordpress/vanguard.css` 15c8329e…df1a — identical before (build of 3e83951; only stories/scripts changed since) and after (build of this tree). All 9 stories now render (temporary explicit Storybook list, reverted): 9/9; FeatureBox's story additionally needed an import-only fix (`../../../vanguard/…mock-anim.json` → `../../core/…`, the old path does not exist). ListingServiceConnectionStatus has no story; its spec renders it (jsdom does not compile CSS) and `sass --load-path=.` compiles its stylesheet.
3. Same bug in A's folders, reported to A: ListPage/ListPageHeader, PaymentMethod, SpendingForecastSection.
4. Runner guard added to my enable/run scripts: an empty file list aborts (exit 2) instead of running the whole project.

## Dead-code candidates for the user (no removal)
1. DiscountBadge, FeatureBox, HoverableCard, IncentiveBox, InvoiceAddress, PageSectionRecommended (+ RecommendationBadge), StatisticsBoard (+ StatisticsBoardItem), UpsellingTrigger, ListingServiceConnectionStatus: exported from neither `src/index.ts` nor `src/index-wordpress.ts`, imported by nothing outside their own pair, and their stylesheets could never compile until this fix. Kept and now buildable; user decides.
2. Earlier entry: local `GoogleMapsMarker/Marker.tsx` (see "Candidates for removal").

## (e) D10 efficiency measurement (no code change)
Tool: `agentic-plans/uisdk-tools-b/measure-exports.mjs` (run after `pnpm run build`; dist of 0c74d28's tree). Method: static `import`/`export … from` closure over the flat preserveModules `dist/*.js` from each public export of `dist/index.js` (299 exports); bytes = per-file gzip -9 summed (upper bound: real bundlers gzip whole chunks; ranking is the point); "unique" = files reached by exactly one export; heavy libraries detected by content signature (MUI by the emotion runtime marker, since own-core code carries Mui* alias strings); `import()` targets counted as lazy, not in the closure.
Cannot see: consumer tree-shaking inside a file (only file granularity), CSS (single vanguard.css), runtime-only `require`, what a WordPress host actually renders, and gzip of real chunks.

1. Root barrel: static closure of `dist/index.js` = 1748 files, 1.97 MB gzip (summed). A consumer that does not tree-shake pays all of it; with `sideEffects:false` + tree-shaking it pays per-export closures below.
2. Heavy libraries (own gzip; exports that pull them EAGERLY):
| library | files | gzip | eager from |
|---|---|---|---|
| video.js | 2 | 158 KB | videoPlayerService, VideoPlayer |
| apexcharts | 8 | 147 KB | LineChartBase, HSBChart, BarChart, DonutChart(+Directories, Statistics), AreaChart |
| xlsx / jszip / file-saver | 3 | 146 KB | ExportXLS, useExportXLS (xlsx); Gallery, GALLERY_PHOTO_SCOPE, DocumentUpload, DocumentDisplay (jszip) |
| lexical | 38 | 89 KB | RichTextEditor |
| lottie | 9 | 68 KB | LottieAnimationLoader/LottieBase/useLottie* (expected) + RichTextEditor and AIAssistant (via AIAssistantPanel → LottieAnimationLoader) |
| google-maps | 7 | 44 KB | GoogleMaps family (9 exports) |
| moment | 3 | 23 KB | 24 exports: pickers, LineChartBase, Gallery, GallerySummary, GalleryMediaItem, RelativeTime, … |
| cropperjs | 1 | 15 KB | Gallery, GALLERY_PHOTO_SCOPE (via ImageCropperTransformer → Cropper) |
| MUI/emotion runtime | 6 | 13 KB (+ MUI component files) | 94 exports |
3. Chains worth a decision (closure gzip):
   1. Text (6895 sites) 87 KB: html-react-parser entities 18 KB + react-spring core/shared 19 KB via `text-animate-words-style` (only needed with `animateWords`).
   2. Icon 56 KB: `use-dynamic-import` 8.7 KB gzip (107 KB raw: the import map of every icon/asset) + styled-components 9 KB via StyledSVG.
   3. Button 204 KB: MUI/emotion via `Grow` → `useTheme`.
   4. Table 485 KB: TableToolbar → Input → InputBase → Skeleton → emotion; TableToolbar → CheckBox → FormElement → valid-input → isValidPhoneNumber → libphonenumber metadata (19 KB gzip) — every Table pays for phone validation.
   5. Gallery 501 KB: cropperjs + jszip + moment eagerly.
   6. RichTextEditor 691 KB (157 KB unique): lexical + lottie via the AI panel.
4. Base64 assets > 4 KB inlined in JS: 11, 882 KB decoded (rocket.gif 497 KB, loading_cloud.gif 75 KB, error.gif 73 KB, an mp2t video 68 KB, thumbnail_loader.gif 46 KB, …). All are LAZY (reached only through `use-dynamic-import`'s `import()`), none in any export's static closure; cost = +33 % base64 overhead and no image cache/streaming decode when they do load.
5. WordPress bundle: 2.58 MB raw / 643 KB gzip single file; contains lottie and the MUI/emotion runtime; none of apexcharts, video.js, xlsx/jszip, lexical, moment, google-maps, imask, cropperjs; no base64 > 4 KB (asset cleanup). Of the 59 WordPress value exports, only LottieAnimationLoader pulls lottie. "Bundled but never rendered" cannot be measured without knowing what WordPress hosts render.

### (b) correction from verifier 2's render check of fc6c898/df8567a (40/42 render)
`TogglerWithText` stories reverted to un-collected (original file restored): `toggler-with-node` passes the vitest smoke run but shows the Storybook error overlay when served ("Objects are not valid as a React child (found: object with keys {br, b, em, link, span})", light + dark). Pre-existing story (never collected before); stays on the stale list. TogglerWithText keeps its specs.

## (f) D10 source-level changes (watchdog decisions)
1. xlsx/jszip on action: ec7b592 (+85e588b spec lint) `downloadZipFile` imports jszip on use (already async; covers Gallery and the Documents components through the helper, so no A file touched); b4ef33a ExportXLS / useExportXLS: handlers stay `() => void`, start an async export that imports xlsx + file-saver on use; file-saver's CommonJS namespace read both ways (`'saveAs' in ns ? ns : ns.default` — under plain ESM interop node exposes only `default`). Characterization specs (green on the old code, green after): zip names + contents + one download; workbook rows, file name, blob type. ExportXLS + Gallery stories green. Behaviour delta (tiny): the first export/zip waits for one dynamic chunk load before the download starts.
2. libphonenumber out of Table: STOPPED (watchdog's stop rule). Chain: Table → TableToolbar → CheckBox → use-resolved-form-config → FormElement → `valid-input.ts` → `isValidPhoneNumber`. The check is config-driven: `validInput` runs it for ANY field whose config sets `validatePhoneNumberForCountry`, whatever component renders it. A synchronous cut that keeps behaviour identical in every case does not exist: options are (a) a registry — PhoneNumber modules register the validator into valid-input on import (sync, identical whenever PhoneNumber is imported anywhere in the app; a plain Input with that config in an app that never imports PhoneNumber would stop validating) or (b) lazy/async validation (behaviour change). rc-webapp: 3 files set `validatePhoneNumberForCountry` and all 3 also render Vanguard `PhoneNumber` (CompleteGaCampaignModalCampaignConfirmation, CallAssets, BoostCTA), so (a) is identical for rc-webapp today. Decision for the watchdog.

### Measured, for the watchdog's decision (no code)
3. styled-components: ONE importer, `src/core/StyledSVG/StyledSVG.tsx` (a styled(InlineSvg) with per-instance width/height/fill/hover-fill/rect-fill). StyledSVG is used by 9 Vanguard components (Icon, Avatar, Star, IllustrationBlob, QuoteContainer ×2, AIAssistantPanel, PageSectionRecommended, UpsellingTrigger) and is a public export with 110 rc-webapp JSX sites. Replacement: one static SCSS rule keyed on custom properties set inline (`--svg-size`, `--svg-fill`, `--svg-hover-fill`, `--svg-rect-fill`, `--svg-fill-opacity`) → drops styled-components (9 KB gzip) + stylis + is-prop-valid from Icon's closure and the runtime dep. Estimate 0.5–1 day incl. parity specs. Deltas to manage: the hashed `sc-*` classes disappear (grep rc-webapp for `sc-`/StyledSVG class selectors first), styled-components injects at runtime so it currently wins equal-specificity ties (D13 again), and its `filter: (Npx)` rule is invalid CSS today (dropped by browsers, so no visual change).
4. Text `animateWords` → react-spring (19 KB gzip in Text's closure): rc-webapp uses it in 1 file (`SetupHandoverWrittenText.tsx`); Vanguard internally only in `OnboardingWelcomeAnimation` (unreachable) and the dev App; the WordPress entry exports `applyWordAnimation`. Proposal: render the animated path through a `React.lazy` boundary inside Text only when `animateWords` is set (the words start invisible and fade in, so the chunk load is hidden); keep `applyWordAnimation` as is (WordPress single bundle includes it anyway). Saves ~19 KB gzip for every Text consumer that never animates. Risk: first frame of animated Text renders the Suspense fallback (same-size, empty text) — needs a same-size fallback per the D10 condition.
5. package.json today: `"sideEffects": false`; dist is ES modules with `preserveModules: true` (root `src`), CSS extracted to one `vanguard.css` (`cssCodeSplit` off; JS files carry `/* empty css */` comments and import no CSS). So rc-webapp's Vite can tree-shake per file. But `sideEffects: false` also covers `./style.css` (= `dist/vanguard.css`), which consumers import for its side effect only; Vite keeps CSS imports regardless, webpack/Rollup without a CSS plugin may drop it. Correct declaration: `"sideEffects": ["*.css", "**/*.css"]` (JS stays side-effect-free; I found no module with intended top-level side effects, but did not audit singletons like OverlayStackingService exhaustively). A's file.
6. f1 proof (measure tool, build of the f tree vs 0c74d28's): ExportXLS / useExportXLS eager closure 318.8 → 205.1 KB gzip (`dist/index-ExportXLS.js` now has `import("./index-xlsx.js")` and `import("./index-FileSaver.min.js")`; it keeps the xlsx flag only because its own file contains the `saveAs(` signature); Gallery / GALLERY_PHOTO_SCOPE 500.7 → 466.8, DocumentUpload 378.6 → 344.7, DocumentDisplay 286.3 → 252.4 (jszip now `import("./index-jszip.min.js")` in download-helpers); Table unchanged (f2 stopped).

### Decided by the watchdog (track f round 2)
1. f2 registry (a): REJECTED — a config-driven validation that silently stops when PhoneNumber was never imported is a correctness risk (WordPress exports Input/Form/useFormConfig; other consumers unknown) for 19 KB. Options for the user: (a) registry, sync, identical when PhoneNumber is imported anywhere (true for all 3 rc-webapp uses), saves ~19 KB gzip in every Table/InputBase/Form consumer; (b) async validation (behaviour change). No code.
2. f4 animateWords lazy: APPROVED with conditions (identical sync DOM without animateWords; fallback = the animation's first frame; WordPress keeps applyWordAnimation eagerly; specs; measure proof).
3. f3 StyledSVG → static SCSS: APPROVED after f4 with conditions (API/element/attributes identical except `sc-*`; tie analysis per D15 with A; invalid `filter: (Npx)` stays without effect; computed-style differential; A removes the dependency).
4. f5 sideEffects: watchdog tells A to set `["*.css", "**/*.css"]`.
5. TogglerWithText stories: on the stale list (served-Storybook error "Objects are not valid as a React child (found: object with keys {br, b, em, link, span})").

### f4: Text animateWords lazy (watchdog APPROVED)
1. `text-animated-words-lazy.tsx`: `LazyAnimatedWords` = `Suspense` + `React.lazy(() => import('./text-animate-words-style'))`; fallback `AnimatedWordsFirstFrame` renders each word as `<span style="margin-right:4px;opacity:0;transform:translateY(20px)">` — byte-identical to react-spring's first frame (captured). Text uses it only when `animateWords` is set AND the content is a string (as applyWordAnimation did); otherwise unchanged and synchronous. `applyWordAnimation` and the WordPress export untouched; `text-animate-words-style.tsx` gains a default `AnimatedWords` component; Text.types imports the animation type with `import type`.
2. Spec `_Text.animateWords.lazy.spec.tsx` (red: module missing / plain Text loaded the animation module statically): plain Text renders today's DOM synchronously and never evaluates the animation module; fallback markup == captured first frame; animated Text ends in the captured final DOM. Text/TextHighlighted/Link specs 27, Text stories 63 green; tsc 0; biome: 1 pre-existing warning.
3. Proof: Text eager closure 86.9 → 61.9 KB gzip, no react-spring in it (`dist/index-text-animated-words-lazy.js` → `import("./index-text-animate-words-style.js")`); Link 144.6 → 119.7, Alert 87.8 → 62.8, Button 203.8 → 178.8. WordPress: still a single JS file; `applyWordAnimation` inlined (module namespace object), first-frame + react-spring strings present.
4. rc-webapp screen for verifier 2: `SetupHandoverWrittenText` — rc-webapp has no story for it (grep), so a Vanguard Text story with animateWords or the handover widget screen if one renders it.

### f3: StyledSVG from styled-components to static SCSS (watchdog APPROVED; A: rules in the D15 last block)
1. `StyledSVG.tsx`: same exported name and `RcSvgProps`; new `StyledSVGProps` = InlineSvg props & RcSvgProps (what `styled(InlineSvg)` accepted). Renders `<InlineSvg>` with all props passed through as before (so `testid`, `hovercolor`, `color`, `width`, `filter`… reach the `<svg>` as attributes exactly as before), `data-testid={testid}`, `className` = `vg-styled-svg` + one modifier class per SET prop (`--size`, `--fill`, `--fill-opacity`, `--rect-fill`, `--repeat`, `--hover-fill`) + the consumer className, and `style` = the per-instance custom properties + the consumer style. Only delta: the hashed `sc-*` classes are replaced by these classes and the custom properties appear in the inline style.
2. Why one class per prop: the old template emitted `width: undefinedpx` / `fill: ;` for unset props, which browsers drop at parse time (lower-priority rules and presentation attributes still apply); an always-present `var()` would compute to `unset` instead. With per-prop classes an unset prop leaves no declaration, as before.
3. `StyledSVG.compat.scss` (11 selectors, original specificities: root 0,1,0; `path`/`rect` 0,1,1; `:hover path` and `.hover path` 0,2,1), appended last via the ONE line `@use '../core/StyledSVG/StyledSVG.compat';` at the end of `src/styles/mui-compat.scss` (A's approval, option (a)). Built: 11 `vg-styled-svg` occurrences in both dist and dist-wordpress vanguard.css, inside the last block.
4. Tie analysis (before coding): no rc-webapp or Vanguard selector or test depends on `sc-*` classes; the 8 rc-webapp blocks that set `fill` on svg/path/rect are all higher specificity (`.x svg path` 0,1,2), `!important`, or target `<svg>`/own SVGs — none ties with StyledSVG today. The last-block position keeps "StyledSVG wins ties" for any tie not found.
5. The invalid `filter: (Npx)` is not reproduced: Chromium computed `filter: none` before and after (logged; it never applied).
6. Differential: `_StyledSVGStyles.stories.tsx` measures, in Chromium, computed styles of svg/path/rect (width, height, vertical-align, background-repeat, filter, opacity, margin-left, fill, fill-opacity) for 10 prop combinations incl. `.hover`, consumer `style`, unset width (svg = container width, 1200px); EXPECTED captured from the styled-components build (768ca96) — identical after. Consumers (Icon, Avatar, StarRating/Star, IllustrationBlob, QuoteContainer ×2, Notification, AIAssistant, PageSectionRecommended, UpsellingTrigger): specs 16 files / 92, stories 14 / 87 green; tsc 0.
7. Measure: StyledSVG eager closure 27.6 → 10.9 KB gzip; Icon 56.1 → 39.3; Avatar 122.3 → 106.0; Button 178.8 → 162.7; StatusBadge 147.7 → 131.4. No styled-components / stylis / is-prop-valid file left in dist; none in the WordPress bundle. No `styled-components` import left in src → A can drop the dependency.
8. `scripts/_mui-compat-order.spec.ts` "has no compat rule in the import-order part before it": TIMES OUT at 5 s on the default bundle (not an assertion failure): it recomputes `selectorsOf(before)` once per compat selector (quadratic) and the 11 new selectors push it over under load. The same check with the set computed once: 0 overlaps in both bundles. A's spec — reported to A, not edited.

### StarRating remount leak (verifier 2, B8: +56 DOM nodes / +5 listeners per remount, both builds; user: fix with reproducing spec)
1. jsdom: per mount +15 `document` mouseover/mouseout listeners — from react-from-dom's `DOMParser` documents (jsdom's nwsapi registers them on each parsed document); jsdom artefact, not the Chromium leak.
2. Chromium probe (temporary story, not committed) on the f3 tree: 20 × createRoot → render StarRating (readonly=false) → unmount; net listener registrations per cycle = only the React root container's own listeners (the probe creates one root per cycle) — no growth on document/window/elements. Not reproduced at the listener level after f3 (styled-components gone); may depend on the harness's forceRemount path. Asked verifier 2 to re-measure on pack-b10 and share the heap-snapshot retainer if it persists. No code change yet.

## (g) MUI-backed leaf components (watchdog decision; split agreed with A)
Order: Collapse → Fade → Button (only after two Tier A PASSes + A's OK; Tier A + Tier B, every variant/size/state) → ProgressBar → Accordion → List/ListShowMore → Chip → Breadcrumbs → Pagination → Slider → motion group (Skeleton, IconButton, AnimatedConditional(+Switch), SlideTransition, CardMotion). A keeps Autocomplete/SearchableSelect, Select variants, Modal/Drawer/Snackbar, pickers, Tooltip users, FocusTrap/PopoverModal, AppBar/Toolbar. src/primitives read-only for B; compat partials wired by one A-approved `@use` line each.
Merged A's tip e002abc (edf9c0d; mui-compat.scss conflict: both appended lines kept, A's Tooltip then my StyledSVG). Pre-existing tsc errors on A's side (not from merges): `_MenuOwnRouting.spec.tsx` (A fixing), Backdrop / input-adornment parity specs (reported).

### g1 Collapse (own-core)
1. `own-collapse.tsx` (component-local, on A's `Transition`; A may move it to primitives when Accordion/Drawer need it): MUI 9.5 Collapse for Vanguard's props only (`in`, `orientation`, `className`; collapsedSize 0px, timeout 300, appear false). Same DOM (root > wrapper > wrapperInner), same Mui* classes and state classes (`MuiCollapse-entered` / `-hidden`), same inline writes per step (min-size, size, transition-duration, and MUI's `transitionTimingFunction = undefined` write which browsers ignore). Root/parts carry `data-vg-core`; root `data-slot="collapse"`, `data-orientation`, `data-open`; parts `collapse-wrapper`, `collapse-content`. Emotion `css-*` hashes replaced by `_Collapse.compat.scss` (`.MuiCollapse-*:where([data-vg-core]…)`, 0,1,0) via the approved last `@use` line.
2. Evidence: jsdom differential vs live MUI Collapse 6/6 scenarios (classes minus css-*, attributes minus own markers, inline style at every step incl. interrupted close/open and horizontal); Chromium side-by-side differential vs live MUI (computed styles of root/wrapper/inner + root box; 6 settled states, both orientations) green; A's `_Collapse.mui.spec` + `_CollapseMuiContract` stories green unchanged; cleanup spec (unmount while entering/exiting → no timer) green; users InfoBox/Accordion/AIAssistant specs (8 files / 127) and InfoBox/Cropper stories (20) green; `_mui-compat-order` 6/6 after rebuild; Collapse eager closure 72.4 → 2.4 KB gzip.
3. WordPress: Collapse is not a WordPress export but InfoBox (exported) renders it → smoke-test patch sent to A (gate file).

### g2 Fade (component on A's Fade primitive)
1. `Fade` renders A's `primitives/react/Transitions/Fade` (no second implementation; watchdog condition). Props unchanged; Fade owns no DOM element (inline styles on the child), so no compat CSS and no marker.
2. Evidence: `_fade-component-parity.spec.tsx` — Vanguard Fade vs live MUI Fade with the same props, 6 timelines (appear default, appear false, out/in/out, timeout object, mountOnEnter+unmountOnExit, timeout 0): child outerHTML at every step + onEntered/onExited log identical; existing `_Fade.spec` + story green; tsc 0; biome clean. Not a WordPress export; no internal users (rc-webapp: BusinessProcessorCampaignsMap).

### g3 ProgressBar (determinate + indeterminate on own markup)
1. Router in `ProgressBar.tsx`: `determinate` (default) and `indeterminate` → `own-progress-bar.tsx`; `buffer` and `query` → `ProgressBarMui.tsx` (the former code, verbatim). Usage evidence: rc-webapp passes only determinate (default, ~23) and indeterminate (6); Vanguard internally only RatingStarsAndProgressBar (determinate); not a WordPress export.
2. Own markup = MUI 9.5 LinearProgress DOM: ComponentContainer > span.MuiLinearProgress-root.MuiLinearProgress-colorPrimary.MuiLinearProgress-{variant} + module root class + className, role=progressbar, MUI's aria-valuenow/min/max then Vanguard's rounded aria-valuenow; bar1 (`translateX(value-100%)`), bar2 for indeterminate. Markers: `data-vg-core`, root `data-slot="progress-bar"` + `data-variant`, bar1 `progress-bar-indicator`.
3. MUI's emotion rules (extracted from the injected CSS, not transcribed) → `_ProgressBar.compat.scss` at 0,1,0 (variant conditions inside `:where()`), keyframes as `vg-linear-progress-indeterminate1/2`; one approved `@use` line (last). Vanguard's `sx` values (filter when blurred, background, height, width, bar colour) are INLINE styles: A's `_ProgressBar.mui.spec` reads them through jsdom getComputedStyle, which does not resolve `var()`, and that spec must stay unchanged. DELTA: inline outranks consumer class rules for those properties; checked — no rc-webapp or Vanguard consumer sets them via className (AiFteLoading: margin-top; RatingStarsAndProgressBar: border-radius on descendant spans); no `.MuiLinearProgress` rule in rc-webapp.
4. Evidence: DOM parity vs the MUI path 10 cases (classes minus css-*, attributes minus markers, bar transform); Chromium differential vs live MUI, default theme + VanguardThemeProvider: root/bar computed styles, root box, indeterminate animation keyframes + timing — identical (keyframe NAME differs by design); A's `_ProgressBar.mui.spec` + `_ProgressBarV9Compatibility.spec` + contract stories green unchanged; Rating specs/stories green; `_mui-compat-order` 6/6; tsc 0.
5. Size: unchanged (70 KB gzip eager) because the MUI fallback for buffer/query is still a static import; making that path lazy would remove LinearProgress from the eager closure (later, if wanted).

### Paths still on MUI (for A's §23)
1. ProgressBar `variant="buffer"` and `variant="query"` → `ProgressBarMui.tsx` (MUI LinearProgress). Removed when a consumer needs them (port buffer's dashed track + query's rotation) or at the MUI-exit step.

### Licence headers (A's convention, e86a665)
1. Header added: own-collapse.tsx + _Collapse.compat.scss (Collapse/Collapse.js), own-progress-bar.tsx + _ProgressBar.compat.scss (LinearProgress/LinearProgress.js); compat partials carry `(emotion styles)`.
2. No header: Fade.tsx (renders A's Fade primitive, no ported code), StyledSVG.compat.scss (our own former styled-components rules). Parity specs/stories are tests, not ported code.
3. Every future leaf port gets the header in the same commit. Non-MUI sources (e.g. react-spring for the motion group) → package@version + licence to A for config/derived-notices.txt.

### g4 Accordion (own core: ButtonBase primitive + own Collapse timeout 'auto')
1. `Accordion.tsx` renders MUI 9.5 Accordion's DOM itself: Paper root div (MuiPaper-*/MuiAccordion-* classes, `--Paper-shadow` inline for elevation) > `div.MuiAccordion-heading` > summary = A's ButtonBase (native button, disableRipple, focusRipple false, focusVisibleClassName Mui-focusVisible, aria-expanded, id/aria-controls = accordionId) with content span + expandIconWrapper span; OwnCollapse(timeout 'auto') > region (role=region, aria-labelledby, id) > details. Props modelled = everything Vanguard ever forwarded to MUI (`expanded` via own state, `disableGutters`, `variant`); every other MUI prop in the public type stays ignored (bug-locks in A's `_Accordion.mui.spec` unchanged and green). Public type unchanged (MUI AccordionProps type-only import). No MUI fallback path.
2. own-collapse: `timeout?: number | 'auto'` (MUI getAutoHeightDuration; completion through Transition.getAutoTimeout). Red/green: 2 new 'auto' scenarios in `_collapse-parity.spec` failed on the old own-collapse, pass now (8/8).
3. Compat: `_Accordion.compat.scss` from the injected emotion rules (identical with/without VanguardThemeProvider), 0,1,0 base / ownerState variants inside `:where()` / real classes, pseudos and `+` outside (same specificity as emotion). Content gutters keyed by `.MuiAccordionSummary-gutters > ` (MUI 9.5 puts no contentGutters class on the content). One `@use` line (approval requested from A).
4. Markers: `data-vg-core` on every part; slots accordion, accordion-heading, accordion-summary, accordion-summary-content, accordion-icon, collapse(+-wrapper/-content), accordion-region, accordion-details; root `data-variant` (elevation|outlined) + `data-open`.
5. Evidence: `_accordion-parity.spec` 12 timelines vs `_AccordionMui.reference.tsx` (former implementation verbatim, test-only): whole subtree tags/classes(-css-*)/attrs(-markers)/inline styles at every step incl. Collapse writes with 'auto' (wrapper height mocked to 120 → 249 ms), click/Enter/Space/focus/controlled/variant toggles/ignored MUI props, onExpandedChange calls. Mutations: timeout 300 → 6 fail; gutters class dropped → 11 fail. Chromium `_AccordionParity.stories` (default + VanguardThemeProvider): sibling groups (first/last-of-type, expanded+expanded), 34 computed props of 8 parts + root ::before + boxes, initial / toggled / toggled back, keyboard focus-visible: identical. Synthetic-click focus-visible was order-dependent (the second side clicked inherits Chromium's programmatic-focus heuristic; swapping the order moves the diff to the MUI side) → blur after each click. `_Accordion.cleanup.spec` 3/3 (no timer after mid-transition unmount, no document/window listener left, DOM contract). A's `_Accordion.mui.spec` + contract stories + Collapse specs/stories green, `_mui-compat-order` 6/6, tsc lib 0.
6. Size: Accordion eager closure 133.8 → 48.3 KB gzip, no emotion runtime.
7. Consumers: rc-webapp 11 files; consumer CSS (WhatIsCard, AiVisibilitySearchesAndAnswersCard) targets `.MuiAccordion-root.Accordion-container .MuiAccordionSummary-root .MuiAccordionSummary-content` — kept. Collision: rc-webapp `[data-open="true"]` (ChronicleEntry.module) is on its own module class, not Accordion. WordPress export → smoke patch sent to A.
8. Biome: 2 kept patterns (fragment fallback `?? <></>`, effect deps) are verbatim from the former code; changing them would change behaviour.

### StarRating remount growth: classified NOT a leak (browser bookkeeping of in-flight animations)
Probe (watchdog brief; Chromium 1148 headless via Playwright, `--expose-gc`, no Storybook): esbuild bundle of the built `dist/index-StarRating.js` (+ dist/vanguard.css) in a bare page; remount = re-render with a new key (as forceRemount); metrics via CDP `Performance.getMetrics` after 2× `HeapProfiler.collectGarbage`; `document.getAnimations().length`. Control = plain `<div>` of 5 `<svg><path>` animated by the same `fillup .8s ease`. Scripts: scratchpad `starprobe/` (entry.tsx, run.mjs).

| run (React build) | cycles × wait | nodes base → mounted mid → end | after clear | after 10 s idle + GC | anims mounted / after clear | listeners |
|---|---|---|---|---|---|---|
| A StarRating, prod | 200 × 0 | 16 → 67 → 67 | 16 | 16 | 15 / 0 | 154 → 161 → 154 |
| B StarRating, prod | 60 × 1 s | 16 → 67 → 67 | 16 | 16 | 0 / 0 | 154 → 161 → 154 |
| C plain div, prod | 200 × 0 | 16 → 38 → 38 | 27 | 16 | 5 / 0 | 154 flat |
| D plain div, prod | 60 × 1 s | 16 → 27 → 27 | 16 | 16 | 0 / 0 | 154 flat |
| A StarRating, dev | 200 × 0 | 29 → 275 → 275 | 80 | 29 | 15 / 0 | 154 → 161 → 154 |
| B StarRating, dev | 40 × 1 s | 29 → 262 → 262 | 29 | 29 | 0 / 0 | 154 → 161 → 154 |
| C plain div, dev | 200 × 0 | 16 → 27 → 27 | 16 | 16 | 5 / 0 | 154 flat |

Answers:
1. Per cycle: no growth. The count is the same at cycle 100 and cycle 200, in prod and in dev, with or without a 1 s wait.
2. Idle: after 200 cycles plus 10 s idle and GC, nodes and listeners are back at baseline exactly.
3. `document.getAnimations()`: never grows. It holds only the live instance's 15 animations (5 stars × 3 paths) and drops to 0 on clear.
4. Transient retention: unmounting mid-animation leaves one instance's worth of detached nodes (+51 dev, +11 for the plain div). These are released once the animation timeline moves past them. The plain div with the same keyframes shows the same effect.

Conclusion: this is Blink holding detached elements that have in-flight CSS animations until the next animation tick. It is bounded at one instance and does not accumulate, so it is not a leak. No code change.

Verifier 2's per-remount +56 in Storybook is not reproduced outside Storybook, not even per cycle. The difference is the harness: Storybook dev instrumentation (actions/interactions, the DevTools hook) can keep the args and fibers of earlier renders. I've asked for a post-idle sample (10 s idle + forced GC) of the Storybook scenario.
