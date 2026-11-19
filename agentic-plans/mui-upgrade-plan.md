# MUI upgrade to latest: plan

Branch: `release/mui-upgrade` (from `origin/master` 95ee244, upstream unset on purpose).
Worktree: `.claude/worktrees/mui-upgrade`. Ticket: none yet (local work not blocked).
Oversight: Vanguard overseer thread 03a95c34. Review: fresh `fe-reviewer` agent per stage, read-only.

## Target graph

| package | now | target |
|---|---|---|
| `@mui/material`, `@mui/system` | 5.16.14 | 9.5.0 |
| `@mui/x-date-pickers` | 5.0.16 | 9.17.0 |
| `@emotion/react` / `@emotion/styled` | 11.0.0 | 11.14.0 / 11.14.1 |
| `@mui/lab`, `@mui/styles` | 5.0.0-alpha.77 / 5.3.0 | removed (no imports in `src`) |

MUI is a devDependency and is bundled into `dist` / `dist-wordpress` (not in rollup `external`), so the
MUI runtime ships inside the package. Emitted `.d.ts` files still reference `@mui/*` types.

## Staging (every stage is a peer-valid, green, releasable graph; no `--force`/legacy-peer-deps)

Peer ranges (npm, verified 2026-11-03):

1. pickers 5.0.16: material `^5.4.1`, react `^17.0.2||^18` (already off with React 19 today).
2. pickers 7.29.4 / 8.29.5: material+system `^5.15.14||^6||^7`, react `..||^19`.
3. pickers 9.17.0: material+system `^7.3.0||^9.0.0`, react `..||^19`.

| stage | graph | content |
|---|---|---|
| S0 | material 5.16, pickers 5 | characterization tests (all green on v5), type fixtures, built-package checks, coverage gate |
| S1 | same | emotion 11.14, drop lab/styles, deep imports -> public paths, slot API only where 5.16 types have it (Tooltip, Slider, Modal, Backdrop, part of Autocomplete) |
| S2 | material 5.16, pickers 7.29 | pickers rewrite (`renderInput` -> slots), picker tests first |
| S3 | material 6.5, pickers 7.29 | core v6 + `v6.0.0/preset-safe` codemod |
| S4 | material 7.3, pickers 8.29 | core v7 + codemod; pickers v8 |
| S5 | material 9.5, pickers 9.17 | core v9 + pickers v9; browser-baseline report |

Each stage is a local checkpoint first. Whether stages ship as separate PRs or as one PR is the user's call.
S1 can move to the slot API only where MUI 5.16 already has `slots`/`slotProps` in its types: Tooltip, Slider,
Modal, Backdrop, and Autocomplete (partially). TextField, Drawer, Menu (its own props), Snackbar and Accordion have
NO `slotProps` in 5.16, and 5.16 prints no runtime deprecation warnings (only JSDoc `@deprecated`). So the biggest
bucket, the TextField legacy keys, can only migrate at S3 (core v6) or later.

## TDD contract

1. S0: tests describe current v5 behaviour and pass on v5 (baseline, recorded).
2. Bump stage: the same tests run unchanged and must FAIL where MUI changed behaviour (red evidence recorded:
   command + failing test names + reason).
3. Compatibility fix: same tests PASS (green evidence). The test is never edited to pass, except where an
   intentional incompatibility is approved and listed under "Intentional incompatibilities".
4. Tests exercise real MUI (no `vi.mock('@mui/...')`).

## Coverage scope

### Tier A: direct MUI wrappers (33 files), one behaviour spec each

Per component, where applicable:

1. Render: role, accessible name, aria-* state.
2. Public props forwarded: `className`, `testId`/`data-testid`, QA ids, `disabled`, `size`, `variant`, MUI passthrough props in the public type.
3. Callbacks: called with the right argument shape (`event`, `value`, `reason`).
4. Controlled and uncontrolled value.
5. `ref` forwarding (React 19 ref-as-prop).
6. Keyboard and focus: open/close, Escape, Tab, arrows, focus return.
7. Portal, transition and cleanup: mounts in `body`, unmounts on close, `OverlayStackingService` register/unregister, no leaks after unmount.
8. Date-specific: locale pattern, moment/null/invalid values, `minDate`/`maxDate`/`disablePast`, readOnly/disabled, `onChange`, typed text entry, close-on-click-away.

Files: AIAssistantPanel, Accordion, AppBar, Autocomplete, AutocompleteWithAnchor, Button, Collapse,
DatePicker, DateRangeInput, DateRangePicker, DateRangePickerBaseInputAdornment, DocumentDisplay,
DocumentUpload, Drawer, DropdownMenu, FlagAdornment, FormControl, Input, ListShowMore, Menu, MenuItem,
Popover, PopoverPopper, PopoverModal, ProgressBar, SearchableSelect, Select, Slider, Snackbar,
SnackbarRoot, ToggleButton, ToggleButtonGroup, Toolbar, `_internal/InputBase`, `helpers/hex-to-rgba`.

### Tier B: indirect consumers that pass MUI props through vanguard wrappers

1. `textFieldProps` (public vanguard prop typed as MUI `TextFieldProps`, forwarded to MUI `TextField` in
   `_internal/InputBase`): VerificationPinInput and PhoneNumberBase pass `InputProps`/`inputProps` through it.
   Consumers of the package can do the same, so this is public API. Each legacy key needs a test.
2. Composites over MUI wrappers: PhoneNumberPrefix, Textarea (InputBase), TimePicker (Select),
   DateTimePicker (DatePicker + Select). Each gets a behaviour spec for its MUI-facing surface.

(`InputLabelProps` / `ModalProps` in Modal, Textarea and PhoneNumber are vanguard's own types, not MUI's.
StyledSVG uses styled-components, not MUI.)

Everything else (83 core folders reach MUI transitively): existing 150 story files (1162 render-smoke
tests) plus specs.

### Tier C: public types and built package

1. Type fixtures (`expectTypeOf` + consumer-style `.tsx` compiled with `tsc --noEmit`) against the
   exported props of every Tier A component, run against source AND emitted `dist/types` / `dist-wordpress/types`.
2. Built-package smoke: render key components from `dist/index.js` and `dist-wordpress` in jsdom.

### Gate

1. Tier A wrapper files: >= 95% lines, >= 85% branches (v8 coverage, spec+storybook projects), with any
   exceptions justified per line.
2. `pnpm test`, `pnpm lint`, `tsc` (app + lib configs), `pnpm build`, type fixtures, built-package smoke.

## Baseline (v5, 2026-11-03)

1. `pnpm vitest run --project spec`: 596/597. One failure, `_Tabs.spec.tsx` "carets and shadows follow a
   CSS-only direction (rtl)", is a load-timing flake (passes 21/21 isolated, twice). Pre-existing.
2. `pnpm vitest run --project storybook`: 1162/1162.
3. Coverage over the wrapper files: 84.55% lines / 68.76% branches. Weakest: AIAssistantPanel 31%,
   DateRangeInput 41%, DropdownMenu 53%, Slider 71%, ListShowMore 73%, AutocompleteWithAnchor 76%.
4. Non-underscore `*.spec.tsx` files (e.g. `DropdownMenu.spec.tsx`, `Button.spec.tsx`) are not matched by
   the vitest `spec` include (`**/_*.spec.*`) and contain only commented-out placeholders. They give no coverage.
5. `tsc -p tsconfig.app.json`: 1001 errors; `tsc -p tsconfig.lib.json`: 4 errors (ButtonTruncate story);
   `eslint src`: 1319 errors. All pre-existing on master. Gate = no NEW errors vs this baseline
   (`/tmp/mui-upgrade/scripts/gates.sh`, which diffs normalised tsc lines and eslint file|rule counts).
6. `pnpm build`: exit 0. The WordPress step prints `mv: dist-wordpress/types/src/index-wordpress.d.ts: No such
   file` (pre-existing), but `dist-wordpress/types/index.d.ts` exists.
7. Emitted `dist/types` reference `@mui/*` in 15 files, including deep paths (`AppBar/AppBar`,
   `Toolbar/Toolbar`, `Drawer`, `Autocomplete/Autocomplete`, `Tooltip/tooltipClasses`). MUI is not a
   dependency or peer of the package, so a consumer without `@mui/material` gets unresolved types, and a
   consumer with its own MUI resolves them against THEIR version. Report this in Tier C.
8. Under coverage instrumentation, 4-5 timing-sensitive tests flake (Button focus/muted stories, Modal
   multiple popovers, Tabs RTL, codemod spec). Pre-existing, not MUI-related.

## Deprecated-prop usage to migrate (non-test code)

`InputLabelProps` 19, `InputProps` 17, `inputProps` 11, `ModalProps` 6, `SelectProps` 5,
`TransitionProps` 4, `PopperProps` 4, `renderTags` 3, `PaperProps` 3, `renderInput` 2, `SlideProps` 2,
`inputFormat`, `componentsProps`, `TransitionComponent`, `PopperComponent`, `MenuListProps`,
`BackdropProps` 1 each.
Deep imports: `AppBar/AppBar`, `Toolbar/Toolbar`, `Collapse/Collapse`, `Fade/Fade`,
`Tooltip/tooltipClasses`, `Autocomplete/Autocomplete`.

## Open items for the user (no decision taken)

1. Ship as staged PRs or one release PR.
2. MUI v9 browser baseline vs. consumer support policy (report in S5).
3. VAN ticket for the CR draft.

## Intentional incompatibilities

S5a (user-authorized candidate, final acceptance pending): DatePicker/DateTimePicker use the accessible
sections editor instead of a single type=tel input. Out-of-range digits are rejected; separators do not
shift digits. Year typing may publish valid intermediate years0002/0020/0202/2024 after four initial
NaNs. Complete-date Delete now publishes public undefined instead of NaN. Escape returns real focus
to the field; its ring clears after blur. The public onChange signature is unchanged. DateRangeInput
and DateRangePicker retain their independent native input paths. Migration details and QA locations:
`mui-v9-consumer-migration.md`. Vanguard major version recommended; no version bump made.


ToggleButton: a disabled non-native element (component≠button) no longer toggles on Space keyup (MUI v7 ButtonBase fix). Click is still dispatched (baseline kept).


### Known build warnings — accepted S5a picker graph

Picker9 produces584 Rollup use-client warning occurrences (337 identities), versus S4b577
(330 identities). Exact +11/-4 inventory, all584 resolved node_modules sources and zero src sources:
`out/s5a-review-warning-reconciliation/warning-inventory.json`. Added once each: PickerDay,
internals/useField, picker-local @mui/utils useControlled/useEnhancedEffect/useEventCallback/
useForkRef/useId/useLazyRef/useOnMount/useSlotProps/useTimeout. Removed once each: PickerDay2,
PickersDay,useFieldV6TextField,useFieldV7TextField. Overseer accepts this expected dependency graph
effect; no build-config/onwarn filter. Eight declaration TS2322 blocks and WP mv error remain
byte-identical to S0/S4b. The final clean-graph build must match the584 identities/counts exactly;
any further delta needs reconciliation. S5b will use the same procedure.


## Resumed S0 validation (2026-11-03)

- Work remains on `release/mui-upgrade`; no dependency bump, commit or push.
- `bash agentic-plans/mui-upgrade-gates/suite.sh s0-resumed 1`: PASS, spec 94 files/1693 tests,
  Storybook 173 files/1290 tests. Pre-existing browser processes 4 before/4 after. Raw logs retained under
  `mui-upgrade-gates/out/s0-resumed/`; this fresh run did not reproduce the old Tabs failure.
- First static run: app 1001/lib 4 errors (0 new), contract 0; lint 1350 vs baseline 1319.
  The 31 new errors were formatting and unnecessary async callbacks in new tests; corrected before the suite.
  Static verification after these corrections remains required.
- Fresh read-only reviewer: S0 not accepted. M2/M3/M4 sampled successfully, but three MAJOR gate gaps:
  compiler execution errors silently passing, MUI-present declaration checks only measured, and no repeatable
  per-file coverage enforcement. The referenced shared review rubric was unavailable; reviewer used the local
  `fe-reviewer.md` with component-library adaptations.
- Compiler-crash regression: new `selftest.sh` failed against the original gate (exit 137 accepted), then passed
  after preserving compiler exit status and requiring contract exit 0. Healthy-tool control also passes.
- Added `coverage.sh` + explicit `coverage-files.json`: 95% lines/85% branches per Tier A file, no exceptions.
  Execution/result still pending. Package fixture worker is completing mandatory MUI-present type checks and
  mutation proof. Do not start S1 until these remaining checks and reviewer re-check finish.

## S0 acceptance and S1 start (2026-11-04)

Overseer FINAL S0 VERDICT accepted the v5 baseline, including exact three unreachable PopoverModal declarations,
raw/adjusted mapped coverage, targeted32/32 and prior full267files/2983tests, reachable-code negative control,
compiler/lint crash red/green proofs. No repeat full S0 run requested. M5's exact existing Emotion peer defect
remains visible; no S1 waiver granted. See verification-s0-exception.md.

S1 scope per final instruction: Emotion alignment, audited unused lab/styles removal, safe public MUI imports
only. No slot API migration in this stage. Implementation and first RED/GREEN evidence are recorded in
verification-s1.md; full stage gates/normal packed-package fixture and fresh review/oversight remain pending.

## S1 acceptance and S2 start (2026-11-04)

FINAL S1 VERDICT accepted aligned Emotion, audited lab/styles removal, six public imports, strict packed-consumer
RED→GREEN, full2984normal+coverage evidence and fresh review. The outer normal shell exit remains explicitly
unknown while both raw project exits0/PASS plus independent coverageexit0 suffice; no repeat requested.

S2 picker7.29.4 bridge peers/React19/Moment verified via public metadata and isolated strict install before bump.
Package/lock now updated; production picker code remains v5 at handoff. See verification-s2.md; capture unchanged
characterization/type RED first, then repair production and retain all public behavior before review/acceptance.

## S2 acceptance and S3 start (2026-11-04)

FINAL S2 accepted by overseer after fresh review's mask/caret MAJOR was repaired with exact v5 reproduction,
intendedRED→GREEN and actualbrowser checks, oldtarballRED→freshstrict4consumer18runtimeGREEN. Accepted normal
project evidence totals2994 plus independent fullcoverage; original wrapper browser transport RED staysvisible.
No repeat S2 requested. All public contracts and frozen assertions remain protected.

S3 exact Material/System6.5.0 onpickers7.29.4 verified via metadata/isolatedstrictfullMUIgraph before install.
Root peer audit captured existing unrelated mismatches. Core packages/lock now bumped; production unchanged
at handoff. See verification-s3.md for snapshot, sources, browser-impact note and required initial RED capture.

## S3 acceptance and split S4 start (2026-11-05)

Overseer FINAL S3 VERDICT accepted Material/System6.5.0 +pickers7.29.4, all final3001tests,
coverage/static/strict package evidence and closure of both MAJOR findings. The targeted Autocomplete
5000ms timeouts at frozen lines652/682/731 remain unexplained RED history, never classified as flakes.
S4 condition C1: record each watched test duration in every suite run; >2500ms or any repeat timeout
requires immediate overseer escalation and root-cause investigation before acceptance. No timeout increases,
retries or assertion rewrites. C2: retain root peer, undeclared types, WordPress declaration, public runtime
subpath and browser-policy limitations. C3: only original3PopoverModal dead handlers excluded; only
approved3MediaQueryList method enrichments in2files may differ from original490 frozen inputs.
Any new frozen edit requires independent AST/assertion proof and overseer approval first.

Npm metadata reverified: pickers7.29.4 accepts core/system ^7.0.0; stage therefore splits into S4a
Material/System7.3.11 +pickers7.29.4, then S4b pickers8.29.5 with its own TDD/review/acceptance.
Both exact isolated strict graphs checked before worktree bump; metadata and install/tree/adapter evidence
under /tmp/mui-upgrade/s4-preflight and mui-upgrade-gates/out/s4-preflight. Full final-candidate gates run
once only after a clean fresh review; iteration uses targeted tests. Core codemods reviewed individually,
legacy public props remain supported via slot compatibility mapping, no intentional incompatibilities approved.
New /tmp/mui-upgrade/s4-frozen-inputs.json protects492accepted source tests/stories/probes including S3
regressions; old490/approved-mock proof remains retained separately. No commits/pushes/PRs/posted CRs.

## S4a accepted; S4b authorized (2026-11-05)

Overseer accepted Material/System7.3.11 +pickers7.29.4, clean full/scoped reviews, dedicated Node scripts
project and reconciliation1722+20+1292=3034, coverage3014/all35thresholds and fresh5/5/4/4 strict package.
OriginalREDs and validator expectation errors remain history, never flakes. S4b targets latest8.x8.29.5,
reverified official metadata; retain core7.3.11. Preserve legacy field DOM explicitly false; no accessible
sections migration authorized. No new incompatibility/frozen change authorized. C1/standingbuglock rule/
nonbuglock+newsrc timeout escalation/3approvedfrozenfiles/project-onlycoverage/release limits remain.
S4b initial post-bump unchanged picker characterization suite must be recorded before production edits.

S5 split precheck: pickers8.29.5 peers accept core/system ^5.15.14||^6||^7, NOT9. A core9-first S5a
with pickers8 is therefore invalid; no peer waiver authorized. Keep S5 graph/order undecided pending
pickers9 bridge verification. Browser floor draft in mui-v9-browser-baseline.md; no user policy assumed.

## Latest-v9 user decision relayed by overseer — pending S4b acceptance

User accepts the visible DatePicker accessible-sections DOM change for latest v9. This supersedes the
previous pending-decision/standalone impact brief. Finish S4b and obtain acceptance first; no S5 bump yet.
Then S5a: pickers9.17.0 on core7.3.11 (verify strict graph first); S5b: core9.5.0 after S5a acceptance.

### Breaking changes / migration (S5a authorized scope)

Remove legacy false-DOM option and obsolete legacy shims for picker9. Preserve public props/types,
Moment/null/invalid payloads, validation/min/max/readOnly/disabled/locale/controlled restore, full-date
keyboard entry and clear. QA ids must each have one stable documented equivalent location.
Single input/type=tel/raw input.value reads/caret indices/separator-mask mechanics may necessarily change.
Each frozen DOM-only rewrite requires installedv9 source cause/file:line, behavioural replacement through
sections or hidden input, whole-file AST proof and approval-list entry. Frozen behavioural assertions
remain unchanged; inability to restore them requires escalation. Capture unchanged spec/browser/types
initial RED before repair; old S4b packed DOM probe RED and fresh v9 probe GREEN with fixture DOM proof.
Vanguard major version recommended; no version bump authorized. Consumer migration note and exact QA-id
map will be written against the implemented v9 structure, not guessed in advance.

S5b includes manually reviewed v9 codemods and browser-baseline report; consumer browser support policy
remains a user decision relayed through overseer. Neither this decision nor current draft sets that policy.
Both stages retain targeted iteration, styled-slot audit, fresh review then one sequential full validation,
5/5/4/4 runtime counts, C1, standing bug-lock rule, project-scoped coverage and explicit release limitations.
No commits, pushes, PRs or posted CR. Orphan processes remain untouched.

## S4b accepted; S5a starts (2026-11-05)

Overseer FINAL S4b VERDICT accepted core/system7.3.11 +pickers8.29.5, all13finalgates, source1726 /
scripts20 / browser1292, coverage3018, strict package5/5/4/4 and SHA3f7d7c0b…2eed. Accepted deviations
remain visible: missed initialbrowser/typecapture with partialposthoc reconstruction, npm10pack-15, and
honest old/new packedprobeGREEN. No deviation will be relabelled flake.

S5a now authorized picker9.17.0 on retainedcore7.3.11. Pre-bump strictmetadata/install/tree/adapter checks
are separate from worktree install. Capture unchanged source AND browser AND type REDs before any edit.
Accessible sections field DOM is user-approved; narrow frozen DOM-only rewrite exception requires each
installedv9sourcecause/file:line, behavioural replacement, whole-fileASTproof and allowlistentry. Behavioural
assertions and publicprops/types/payloads remain protected; inability to restoreGREEN requires escalation.
S5b core9.5 stays blocked until S5a acceptance. No Vanguard version bump; major version recommended.

### S5a public payload clarification

The exported Vanguard DatePicker `onChange` remains `(value: number | null | undefined) => void`;
Moment is an internal MUI boundary, not a public callback type migration. Preserve actual
numeric/NaN/undefined publication and callback sequence. Accessible DOM authorization does
not authorize payload changes. Vanguard major version recommended; no version bump.


### S5a authorized editor intentional incompatibilities (2026-11-05)

The genuine v9 section editor rejects out-of-range month/day typing such as
13/45/2024. Invalid-date validation must be exercised with accepted in-range
sections (first candidate: February 31), retaining invalid payload/validation checks.
Separators navigate sections or do nothing; they do not shift date digits through
a raw mask. Entry uses sections or the real hidden serialized input, for example:

```tsx
const section = screen.getAllByRole('spinbutton')[0];
fireEvent.focus(section);
fireEvent.paste(section, { clipboardData: { getData: () => '03/21/5202' } });
// Atomic accepted value entry through the real v9 serialization API:
fireEvent.change(container.querySelector('input[aria-hidden="true"]')!, {
  target: { value: '03/21/5202' },
});
```

Read serialized values from `input[aria-hidden="true"]`; edit the actual
contentEditable spinbuttons. Optional labels include the suffix in their accessible
names, e.g. `Date Optional`. Helper QA id `vanguard-input-error-text` remains on
Vanguard Text. The styled DateField/PickersTextField/SectionList path is retained.
No additional QA id relocation is implemented or claimed. Full callback-count and
frozen-action equivalence remains pending; examples are API guidance, not a claim
that every old test has been migrated. Vanguard major version recommended.
No version bump is authorized.

### Intentional repository test-discovery change (S5a)

Proof copies under out/ must never be discovered. Normal spec and Storybook exclude out/** and
agentic-plans/** while retaining default exclusions and spec's scripts/** exclusion. Coverage uses
the same artifact-directory exclusion with default exclusions; no coverage-only invocation filter
or narrowed test include. Legitimate config/_regex.spec.ts remains. Before/after resolved file lists
in out/s5a-discovery-fix prove exactly six proof suites removed,113real spec files,174Storybook files
and3script files otherwise byte-identical as sorted path lists. Historical artifacts and .gitignore
are unchanged. discovery-selftest.mjs guards actual resolved project files, not config text alone.

### S5a final validation GREEN; overseer acceptance pending (2026-11-06)

Picker9.17.0 on Material/System7.3.11: all14finalgates raw/reported0, sleep-VALID, no timeouts.
Spec1755 +scripts20 +Storybook1292 =3067normal tests; coverage3047(spec+Storybook) and all35mapped
files95/85. Strict package5/5/4/4=18, required type probes0, byte/pin checks and exact584directive
warning/8TS2322/1WP-move baseline audit pass. Evidence index:
`mui-upgrade-gates/out/s5a-final-82356349d6214b4a98aee7110144bb13/handoff.md`.
All earlier RED/INFRA/sleep-invalid history remains. S5a is NOT accepted until overseer verdict;
S5b is blocked. Consumer migration remains a draft; major version recommended, no version bump.
Root peer/type/WP/runtime-subpath/browser-policy limitations remain explicit, not release waivers.

### S5b approved resolver dedupe (2026-11-06)

Approved resolver dedupe: styled-components peer react-is19.2.6→19.3.1 (core9.5requires^19.3).
Its peer>=16.8.0 accepts the single version; no directreact-isdependency or persistent override.
Evidence out/s5b-preflight/styled-react-is-constraint-stop.json and lock-diff-audit.json; explicit
superseding approval in lock-diff-audit-approved.json. Preserve current lock as-is. Final clean
lock-exact graph checks single19.3.1forstyled-components+@mui and unchanged16/17/18otherbranches.

### S5b codemod disposition: rejected duplicate JSX attribute

Codemod output rejected: duplicate JSX attribute. The deprecations/all proposal renamed Autocomplete's renderTags={null!} sentinel to renderValue={null!} beside its existing renderValue. Nothing was applied. system-props is a reviewed no-op: all eight printer-only proposals were rejected. Overseer authorized a fresh complete deprecations/all dry run with identical derived argv plus only an ignore pattern for src/core/Autocomplete/Autocomplete.tsx; its argv is saved in out/s5b-codemods/deprecations-excluded-derived-argv.json. The separately authorized removal of the obsolete renderTags sentinel will be labelled MANUAL compatibility repair and tested against existing Autocomplete contracts and legacy-slot regressions. Standalone MenuItem and master-sync timing remain pending user direction.

### Current stage status and pending policy (S5b)

S5a was accepted by overseer on2026-11-06; earlier acceptance-pending paragraphs above are historical.
S5b core/system9.5.0 is in progress on the accepted S5a candidate, with unchanged pickers9.17.0 and
Vanguard2.9.1, inherited from the completed master sync. Standalone MenuItem is an approved breaking change; no fallback is implemented.
Browser policy options are in mui-v9-browser-baseline.md; current-base toolchain and post-sync gate
impact are in mui-upgrade-gates/s5b-master-sync-gates.md. Only consumer browser-support policy remains a user decision.

### S5b codemod and optimizer closure; master sync priority

Official v9 codemods: no applicable output. All13 deprecations proposals and8 system printer-only proposals rejected with per-hunk reasons; manual repairs labelled separately. Public runtime MUI entrypoint policy: new subpath module entries require explicit optimizeDeps.include coverage or a package-root import; existing runtime entrypoints are snapshotted from accepted S5a source, erased type-only imports are excluded. Guard RED→GREEN; original assertion unchanged; scripts now25tests across the same3files. Root mergeSlotProps re-export identity checked in ESM/CJS; targeted browser12PASS after approved import cleanup, no cache/config change.

ToggleButtonGroup retains the existing per-button native Tab contract through explicit default tabIndex0; disabled buttons remain excluded and explicit consumer indices win. Upstream v9's roving default is a later product accessibility decision.

User chose standalone MenuItem breaking change/MUI parity (no fallback/private context). Implementation and C/D flips deferred while synchronizing to master f02d3f5, including TS7/Biome. No version bump or commits authorized.

### Authorized master sync before remaining S5b work

Fast-forwarded release/mui-upgrade from 95ee244 to f02d3f5 (master 2.9.1), without
creating a commit. Reapplied the upgrade patch; only package.json and pnpm-lock.yaml
needed reconciliation. Kept master's TS7/Biome/pnpm settings and version 2.9.1.
The 12 package field deltas, resolver-only lock audit and complete backups are at
`/tmp/mui-upgrade/pre-sync-20261106T122630Z/`. Lock audit: 17 added / 37 removed
package identities, all approved MUI/Emotion/retired lab/styles closure; non-MUI
new identities have exact accepted candidate versions and explicit picker dependency
paths. The approved styled-components react-is dedupe is retained. Hook bytes and
lock pnpmfile checksum match master.

Master-owned changes to `_DatePicker.spec.tsx` and `_ModalServiceStandard.spec.tsx`
are recorded separately with exact master blob hashes. Other 484 pre-sync source
spec/story files are unchanged. Root out/ and the historical untracked evidence
remain in place.

Toolchain-only gate adjustments: native TS7 CLI, Biome JSON parsing, removal of the
obsolete contract baseUrl option, and master's typescript5 alias for JS API scanners.
No assertion or coverage threshold is relaxed. Clean detached master baseline:
app/lib/tracked specs 0 TS errors, corrected contract harness 0; Biome 42 errors;
build 0 TS errors, retained WP move error and 720 use-client warnings (360 identities).
See `mui-upgrade-gates/s5b-master-sync-gates.md`. Post-sync captures and strict static rechecks are complete; the remaining S5b final Tier3 is pending.

### User-directed lint-zero cleanup and smarter final gates

The temporary exact24 characterization lint allowance is superseded and closed.
User requested zero errors including master's42. All66 errors are fixed without
rule/config changes or suppressions. Current static gates: app/lib/contracts/spec
0 errors; Biome0 errors,846 baseline warnings and0 introduced identities. The
17 introduced warning occurrences and3 lifting-induced warnings are fixed.
Master's42 changes are isolated by file/hunk in `lint-cleanup-changeset.md`, with
a separate lint-only patch from the synchronized pre-lint candidate.

Authorized frozen hygiene changes preserve every expect node and decoded title
byte, and all test fullNames/statuses. The two literal-title spellings change only
source encoding. Five legacy-theme fixtures use typed local defaults passed
unchanged to createTheme; object/data bytes, JSON and function identities are
proved. No any/unknown double casts or MUI type augmentation. Permanent native
tsconfig.spec check passes0. The related preservation run is808 PASS /4 unchanged
known S5b quirk FAIL; those remaining contracts are pending the separate approved
C/D updates, not waived final results. Slider uncaught exceptions remain pending
the test-environment pointer-capture repair.

Smarter tiers are documented in `mui-upgrade-gates/README.md`: manifest diffs, real
Vitest related graph, failing files only then component completion, and one full
Tier3 coverage runtime pass with isolated C1. Scripts/static/selftests remain
mandatory; strict package5/5/4/4 runs whenever source/dependencies/build config
changed. Every final stage still needs full Tier3 GREEN,0 uncaught exceptions,
complete counts and0 unexpected skips. Shared InputBase/helper edits queue Tier3;
no extra final attempt has been started while known S5b work remains.

### Intentional incompatibility: core9 MenuItem context

User selected breaking-change documentation, not a fallback. Public Vanguard
MenuItem now requires Vanguard Menu (or Vanguard's internal menu builders).
External consumer MUI Menu/MenuList cannot provide the bundled context, even at
the same version. The consumer migration draft uses Vanguard Menu / Menu items,
with impact checks for Vanguard, both rc-webapp checkouts and WordPress. No new
MenuList export/private import/fallback. A public inline MenuList remains a team
follow-up only. Internal stories share the source MUI graph and use public
MenuList. Their9 names/args are unchanged. Two authorized standalone assertions
now pin the required-context error and supported li role/click path. Whole-file
AST/byte proof lives in out/s5b-menuitem-option-a/ast-proof.json. Existing source
MenuItem production implementation is unchanged. New Menu+Render consumer-pattern
characterization passes without production repair (honest GREEN, no invented RED).


### Intentional incompatibilities: approved core9 baseline fixes

The following upstream fixes replace baseline quirks, not promised contracts.
Exact old/new assertions, installed source lines, official tagged migration-guide
excerpts and whole-file AST proof: `mui-upgrade-gates/out/s5b-v9-quirk-flips/`.

| Cases | Visible change |
|---|---|
| spec-1 | Autocomplete right-click no longer opens the listbox. |
| spec-8 / storybook-1 | Menu tabindex follows the focused item (roving tabindex). |
| spec-9/10/14/15/21/22 | Keyboard activation dispatches a click MouseEvent that bubbles to ancestors. |
| spec-13/19/23 | Disabled MenuItem, Select options and non-native ToggleButtons ignore dispatched clicks. |
| spec-16 | Plain Backdrop no longer adds aria-hidden by default; explicit Modal behavior is unchanged. |
| spec-20 | Slider drag callbacks receive pointerdown/pointermove/pointerup. |

Consumer examples and ancestor-handler guidance are in `mui-v9-consumer-migration.md`.
The jsdom-only pointer-capture shim is test infrastructure, not a browser polyfill.


### Known build warnings: accepted core9 graph

Exact S5b inventory:595 use-client occurrences/338 identities, all literal directives
under node_modules,0 src sources, no filtering. Versus accepted S5a584/337:
+512/−501 warning occurrences (including .js→.mjs identity changes). Versus clean
post-sync master720/360: exact added/removed identity inventories are retained in
`mui-upgrade-gates/out/s5b-build-reconciliation/reconciliation.json`. Both comparisons
are explicit; clean master is the current base. Overseer accepts the dependency-only
delta. Final build must reproduce exactly595/338 and the complete identity map.
Native TS7 clears the old declaration TS2322 baseline: current declaration errors0,
matching clean master. The existing WP declaration move error remains byte-identical;
the existing Autocomplete esbuild warning identities also match clean master.

Final Tier3 includes package count and evidence-audit negative-control selftests in
addition to the established selftests. The stage audit enforces resolved file sets,
1777 spec +1292 story cases,25 scripts,0 skipped/failed/uncaught,35 thresholds,
approved frozen hashes, exact warnings and installed packed bytes/pins/type probes.


### Intentional repo change: silence harmless bundled-dependency use-client directives

User supersedes the earlier no-filter condition for this class only. A shared
Rollup helper drops a warning only when code=MODULE_LEVEL_DIRECTIVE, its message
contains the exact quoted "use client", and its non-virtual module ID resolves
inside a node_modules path segment. Source directives, different directives/codes
and missing IDs are forwarded unchanged. Existing onwarn handlers are composed,
including the pre-existing use-dynamic-import handling. Applied to library and
WordPress configs, and the equivalent app onwarn path for its shared MUI graph.
No warning counters are printed. The previous595/338 reconciliation is historical;
final build requires0 visible directives, other warning identities equal clean
master,0 TS declaration diagnostics and the unchanged WP move error.

Nine node tests prove the filter and forwarding/composition: intended6PASS/3FAIL
RED before implementation, then9PASS GREEN. A fourth mandatory scripts-project
file was added; all original3 remain, now34 tests. Project resolution guards and
final completeness audit enumerate the exact4 files.


### Intentional repo change: hide harmless MUI annotation noise; isolate package gates

User additionally authorizes suppressing INVALID_ANNOTATION only for module IDs
inside node_modules/@mui. Source/other-package annotations still warn. The real
allocation annotation remains; the Tabs warning only concerns its explanatory
comment. TDD11PASS/1FAIL→12PASS. Earlier directive-only reconciliation missed this
non-directive warning; the final audit parses complete Rollup/Vite/esbuild/plugin
blocks by kind,module,normalized full message, rejecting unparseable warnings.

A later evidence audit rejected package consumers under the worktree: undeclared
MUI resolved from ancestor node_modules. Those runtime/type results remain history,
not valid isolation proof. Package roots now always use fresh /tmp directories.
Preflight rejects worktree consumers and ancestor MUI/React; post-install probes
prove declared-only MUI absent and MUI-present packages owned. Guard TDD proves
inside-worktree rejection and5 selftest cases pass. All source runtime/coverage
results remain accepted; only authorized gate infrastructure and fixtures change.
