# Thread B log: data-slot batches (Track 1) and agent surface (Track 2)

Branch `feature/ui-sdk-b-data-slots` (worktree off A's `b423180`). Plan: `ui-sdk-architecture-investigation.md` (A's file, read only here).

## Naming convention (watchdog, 2026-11-18; applies library-wide, A and B)

1. The bare `data-slot="<component>"` goes on the element that carries the component's own styling and state: the element that receives the consumer's `className` and the state classes. State attributes (`data-disabled`, `data-selected`, `data-open`, `data-pressed`, `data-active`, `data-loading`, `data-invalid`; enums as values: `data-size`, `data-variant`, `data-orientation`, `data-type`) go on that same element.
2. When the ComponentContainer wrapper is a different element from that one, the wrapper gets `data-slot="<component>-container"`.
3. When the wrapper itself is the styled root (it receives the consumer className and there is no separate inner root), it gets the bare name and no `-container` slot exists.
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
