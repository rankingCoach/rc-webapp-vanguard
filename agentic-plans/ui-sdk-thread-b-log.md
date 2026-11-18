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
2. rc-webapp usage: zero (component-usage.md zero-usage section; grep 0). Migration list: empty.
3. Decided by the watchdog: "force consumers to update" is not done in this run; the wrapper stays (API identical).
4. Leftovers commit: deleted the empty, unimported `TextHighlighted.module.scss` (2 newlines); renamed `TextHighlighted.spec.tsx` → `_TextHighlighted.spec.tsx` so it runs. Setup-only edit after the rename: added `import { describe, test } from 'vitest';` (failed with `describe is not defined`). Assertions unchanged; 1/1 green. Pre-existing biome warning `noChildrenProp` in that spec, untouched.

## Decisions for the user
1. TextHighlighted: remove at the next major. Zero rc-webapp usage, already deprecated. The WordPress entry DOES export it (`src/index-wordpress.ts:23-24`), so check WordPress consumers first.
