# S4a — Material/System 7.3.11, retained pickers 7.29.4

S3 accepted by overseer 2026-11-05. S4a authorized; not yet implemented or accepted.
S4b will independently migrate pickers to8.29.5 after S4a acceptance.

## Pre-bump official graph and guidance

Official npm registry metadata saved before installation under `/tmp/mui-upgrade/s4-preflight/*-metadata.json`.
Pickers7.29.4 peers accept material/system `^5.15.14 || ^6.0.0 || ^7.0.0`, React/DOM19, Moment^2.29.4,
EmotionReact^11.9.0/Styled^11.8.1; actual retained pinsReact/DOM19.2.0,Moment2.30.1,Emotion11.14.0/11.14.1.
Chosen latest patch within authorized minors: Material/System7.3.11; future pickers8.29.5.
Both graphs installed in independent temp dirs using npm11.6.2 `install --ignore-scripts --strict-peer-deps
--registry=https://registry.npmjs.org --no-audit --no-fund`, no force/legacy/waiver. Actual install exits0:
S4a8.125continuous seconds,S4b4.168seconds. Full `npm@11.6.2 ls --all --json` actual0 in both.
React createElement/react-is recognition and AdapterMoment German date-format/valid/invalid checks actual0
in both. Exact manifests under `/tmp/mui-upgrade/s4-preflight/{s4a,s4b}`; commands/status/tree/verifiedJSON
under `out/s4-preflight`. Worktree dependency pins unchanged during this verification.

Primary guidance read:
- https://mui.com/material-ui/migration/upgrade-to-v7/ — exports/one-level imports, v7 codemods,
  deprecated APIs, keep MUI X unchanged during core migration.
- https://mui.com/material-ui/migration/migrating-from-deprecated-apis/ — per-component slots/slotProps
  and codemods. Current latest docs include v9; inspect pinned7.3 code/codemods before applying.
- https://mui.com/x/migration/migration-pickers-v7/ — future S4b accessible-field change; no picker bump
  or DOM change in S4a.

## Carried conditions and validation order

C1: every S4 suite invocation records actual duration/status of frozen Autocomplete tests at652/682/731:
`clicking a chip delete icon removes it with reason "removeOption"`,
`ArrowLeft from the empty input moves focus to the last chip, then the previous one`,
`Enter splits comma separated free text into tags with reason "selectOption"`.
If omitted from a targeted run, record not included; if run, record per-test milliseconds. >2500ms or
repeat timeout triggers immediate overseer escalation and root-cause investigation before acceptance.
No timeout increases, retries or assertion rewrites. Prior targeted108pass/3timeout RED stays unexplained.

C2: root peer baseline, undeclared types, WordPress declarations, public runtime subpaths and browser policy
remain explicit release limitations; no broad waiver. C3: only approved3PopoverModal dead handlers excluded;
only approved3MediaQueryList mock changes in2files may differ from original490. New frozen edits need
separate AST/assertion proof plus overseer approval before changes. S4 accepted-input snapshot protects492
current files at `/tmp/mui-upgrade/s4-frozen-inputs.json`; old490 plus approval evidence preserved.

Iteration: targeted tests only, unchanged-characterization/type RED after bump before compatibility fixes,
new regression tests first for new findings; codemod diffs reviewed individually with frozen files protected.
Preserve public legacy props via compatibility mappings while migrating underlying calls to slots.
Add new one-level/private-import guard tests without editing the frozen original guard.
Fresh read-only review BEFORE one serial full final suite/coverage/static/package validation, then overseer.
No commits/pushes/PRs/ticket placeholders/posted CR. No intentional incompatibility approved.

## Implementation checkpoint — 2026-11-05 (INCOMPLETE; not review-ready)

Work stayed in the requested existing `release/mui-upgrade` worktree. No subagents, worktrees, commits, pushes, PRs, CR drafts/posts, full suites, coverage or final package gates. S3 accepted work preserved. No S4 acceptance or S4b.

Before bump: `/tmp/mui-upgrade/s4a-before/production.tar.gz`, `hashes.json`, `git.diff` capture current S3 bytes (including uncommitted accepted work). Frozen492 all matched. Only Material/System manifest pins changed6.5.0→7.3.11; pickers7.29.4 and every other manifest pin retained. Install command `pnpm install --ignore-scripts --config.legacy-peer-deps=false`, raw/reported0,16.356s, no timeout. Existing unrelated root peer warning remains; this is not a strict whole-root graph-health claim. No force, new waiver, peer suppression or .npmrc edit. Root preflight was reused, not repeated.

Official v7 and deprecated-API URLs above were read; installed7.3.11 TextField/Tooltip/Snackbar/Autocomplete implementations and Drawer public declarations inspected.

### Exact targeted evidence

Controllers copied to `out/s4a-handoff/`; exact argv in each process JSON and controller. All suite calls used default+JSON reporters, unique absolute output paths removed before run,1worker/no-file-parallelism. JSON assertions extracted after every run, including RED. No retries, timeouts/assertions increases or frozen edits. `bounded_runner.run` uses mach_continuous_time, inhibit=True,1800s, raw/reported exits, process-group IDs and resource samples.

| Run | raw/reported | Result |
|---|---|---|

| s4a-unchanged-target | 0/0 | 267 passed, 0 failed; 25.977s |

| s4a-importguard-red | 1/1 | 7 passed, 4 failed; 9.096s |

| s4a-importguard-green | 0/0 | 11 passed, 0 failed; 9.125s |

| s4a-slotcompat-red | 1/1 | 0 passed, 0 failed; 10.906s |

| s4a-compat-target1 | 1/1 | 294 passed, 2 failed; 35.120s |

| s4a-compat-target2 | 0/0 | 324 passed, 0 failed; 54.343s |


Unchanged post-bump characterization267/267 and contract type probe0 before production edits: honest unchanged GREEN, no invented regression. New import guard RED has four assertion failures (dynamic import, require, one-level esm and modern); GREEN11/11 after recursive AST scanning. It includes static/import-type/export/dynamic/require negative fixtures and audits src/config/.storybook/root config imports. Later broadened scanner package match to all @mui packages; targeted2 confirms GREEN. Config alias string values are not yet covered by negative fixtures.

New slot helper initial RED is missing-module resolution, not a behavioral assertion failure; then2tests GREEN. New native-select id/label and theme/function-slot/event tests: native select passed; second initially failed due missing jest-dom matcher registration. Added matcher import, no assertion rewrite; both GREEN. Do not claim that harness failure proves a production defect.

Target1 real unchanged frozen Popover RED: noninteractive pointer-events expected none, got auto after replacing legacy PopperComponent with slots.popper. Restored pointerEvents explicitly in popper slot style; target2 same assertion GREEN. Target2 total324PASS includes frozen Snackbar adapter/theme regressions. Contract compiler after edits raw/reported0,32.863s; new non-.mui test files are outside the existing contract include and still need dedicated compiler validation. Final prettier-only edits follow target2; no functional changes after that test run.

### C1 per-run actual measurements

| Run | chip delete | ArrowLeft | comma Enter |
|---|---|---|---|

| s4a-unchanged-target | passed 191.479ms | passed 226.325ms | passed 256.273ms |

| s4a-importguard-red | notincluded | notincluded | notincluded |

| s4a-importguard-green | notincluded | notincluded | notincluded |

| s4a-slotcompat-red | notincluded | notincluded | notincluded |

| s4a-compat-target1 | passed 122.953ms | passed 163.919ms | passed 252.310ms |

| s4a-compat-target2 | passed 455.909ms | passed 269.317ms | passed 562.248ms |


FullName/status/duration and failures retained in each c1-timings.json and original vitest.json. No missing expected report, >2500ms or repeat timeout observed. Historical S3 targeted108pass/3timeouts remains unexplained RED, never reclassified.

### Codemod hunk review and rejected outcomes

Pinned package @mui/codemod7.3.10 fetched from /tmp using npm exec with legacy-peer-deps=false. Initial invocation used nonexistent binary mui-codemod:127, retained. Correct executable is package codemod.js, version verified in cached manifest. Initial wrong relative bounded-runner path from /tmp exited2 before running any codemod; corrected absolute path.

Only `/tmp/mui-upgrade/s4a-codemod-copy/src` was mutated by official transforms. Exact commands/per-transform diffs/logs/resources under out/s4a-codemods. grid-props:four formatting-only hunks (string-helpers, button-row-size, ButtonTextWrap.story, ButtonMutedBlendEdgeCases.story), ALL rejected. input-label-size-normal-medium:zero changes. text-field-props:one InputBase hunk rejected because it overwrites consumer slotProps and label precedence. autocomplete-props:one renderTags→renderValue hunk rejected pending separate callback/index/SCSS proof. drawer-props:paper slot hunk manually reviewed/applied; nested Modal BackdropProps manually mapped to slotProps.backdrop. tooltip-props:one Popover hunk reviewed/applied, then pointer-events regression repaired via unchanged RED→GREEN. accordion/menu/popover/snackbar/modal/backdrop/input-base/input/outlined-input transforms proposed no hunks on these copies. Deprecated transforms still report207 JSON-asset parse errors despite shell exit0: these are NOT clean successful whole-source runs/no-op proofs. select-props does not exist in pinned package and exits1; no fallback latest used. No other codemod hunks accepted.

### Current diff and remaining implementation

Current S4a production changes: Drawer paper/backdrop slots; Popover Tooltip popper/tooltip slots with preserved noninteractive behavior; InputBase routes through new MuiTextField adapter, resolving MuiTextField defaults before legacy InputProps/inputProps/InputLabelProps/SelectProps/FormHelperTextProps→slotProps mapping. New helper preserves explicit object/function/undefined slot precedence and removes legacy keys without mutating original input. Existing consumer legacy prop API remains typed through TextFieldProps. New guards/tests listed in out/s4a-handoff/new-files.json. No frozen assertions/probes changed.

REMAINING: finish deprecated nested Menu/Paper props and wrapper public passthrough compatibility (including Snackbar TransitionComponent/TransitionProps and ClickAway/Content mappings without losing accepted callback composition/theme defaults); other relevant slots/components forwarding; reconsider Autocomplete renderTags with pinned implementation and contract proof; production-only explicit-path codemod runs excluding JSON parse errors; import/config alias negative fixtures; dedicated new-test type/lint checks; targeted affected consumer specs/stories, picker/Snackbar invariants. Current checkpoint is incomplete, not eligible for clean review or final gates. No full final candidate validation was run.

Workflow deviation: s4a-slotcompat-red overlapped the copy-only codemod controller. This violated requested serial-single-runner discipline; logs/process evidence preserved, not represented as serial. Subsequent compat-target1/2 and compiler commands were serial. No unrelated processes killed or global power settings changed.

Root existing unrelated peers, undeclared MUI types, WordPress declarations/move warning, public runtime subpaths and consumer browser-policy limitations remain unchanged. No broad release/peer/type health claim.

## Continuation checkpoint — INCOMPLETE, not review-ready

Added component-alias mapping to mapLegacySlots, retaining explicit slots including undefined and input immutability. Added config alias/replacement/paths negative fixtures; the guard now checks MUI string literals and skips parsing files without @mui/. The frozen original guard is untouched. Added snackbar-slot-compat.ts for ContentProps/ClickAwayListenerProps/TransitionProps mapping. Legacy enter/exited callbacks compose after effective explicit callbacks, with other events restored by the accepted LegacyTransition adapter. An empty TransitionProps sentinel on the underlying Snackbar prevents inner theme-default resolution from extracting already-composed callbacks twice; this is an explicit remaining deprecated implementation hit, not a completed removal claim. TransitionComponent still requires migration.

New tests first: component mapping and three alias fixtures failed meaningful assertions. That RED also contains a production-import audit 5000ms timeout; it remains RED, no timeout increase or assertion rewrite. Parsing avoidance addressed its broad unnecessary AST work; later runs passed. Snackbar mapping scaffold returned unchanged props and failed both intended assertions. A separate real-MUI themed-enter test then exposed duplicate callback execution (expected1, received2); empty legacy sentinel fixes that exact regression. All new tests are separate from protected inputs.

| Run | raw/reported | tests | continuous seconds |
|---|---|---|---|
| s4a-component-alias-red | 1/1 | 12 passed / 5 failed | 43.021248 |
| s4a-component-alias-green | 0/0 | 17 passed / 0 failed | 50.183285 |
| s4a-snackbar-map-red | 1/1 | 0 passed / 2 failed | 22.003411 |
| s4a-snackbar-map-green | 0/0 | 47 passed / 0 failed | 35.030890 |
| s4a-snackbar-theme-red | 1/1 | 0 passed / 1 failed | 16.531515 |
| s4a-snackbar-theme-green | 0/0 | 67 passed / 0 failed | 65.199552 |

C1: all six suite invocations omitted Autocomplete; every run records all three watched names as notincluded in its c1-timings.json. No watched-test duration is claimed. Original S3 timeout history remains unexplained RED. Exact commands, raw logs, JSON assertions and resource samples are retained under each run directory. All commands in this continuation were serial; bounded executions used mach_continuous_time,1800s,inhibit=True. No timeout/retry/threshold changes.

Dedicated new-test static validation includes the two prior non-.mui compatibility tests plus new helper/guard/Snackbar files. Initial types0; lint1 for import ordering and Function type. Fixed these diagnostics; final s4a-new-static-final types0 (5.742168s), lint0 (5.842864s), lint autofix0 (11.662326s), raw/reported0, no timeout. Warnings remain non-fatal. Controller/config inputs and final hashes retained in out/s4a-continuation. Import ordering was the only post-targeted GREEN source adjustment.

Frozen audit: 492 accepted inputs, 0 changed; snapshot not reset. Separate original490 and approved mock evidence remain untouched. No full suite/coverage/full static/package validation, final review, acceptance, S4b, dependency changes, codemods, delegates, commits, pushes, PRs or external posts in this continuation.

Remaining work is still the previous checkpoint list: Menu/list/paper/transition and nested InputBase Select mapping; TransitionComponent and explicit undefined/non-enter legacy event edge behavior in Snackbar; all other plan-listed passthroughs; renderTags/renderValue index/callback/SCSS proof; explicit production-path clean-copy codemods and hand review; exhaustive production/config/SCSS hit disposition; targeted affected picker/consumer stories. No clean review readiness or broad completion is claimed. Root peer baseline, undeclared types, WordPress declarations, public runtime subpaths and browser-policy limitations remain.

## Narrow Menu / nested Select / Autocomplete continuation — 2026-11-05

Scoped implementation and targeted proof completed; root Snackbar, exhaustive audit/codemods, review and final gates remain pending. No whole-stage review-readiness or acceptance claim. No dependency, picker implementation, frozen-input, Snackbar, commit/push/PR, delegate, checkout, coverage or full-gate changes. Core7.3.11/pickers7.29.4 retained.

Menu resolves MuiMenu themed defaults before mapping legacy MenuListProps/PaperProps/TransitionProps/BackdropProps and TransitionComponent. Object/function paper and root slots retain refs/events/owner state; overlay z-index remains enforced. Explicit slots retain helper precedence. Preserved characterized whole-style replacement and sizing's wholesale override of legacy PaperProps. SearchableSelect uses list slot props. InputBase internal paper sizing uses slots; MuiTextField maps nested Select MenuProps aliases after resolving select object/callback slots, without merging callback/style contracts. Existing consumer SelectProps whole-object replacement remains frozen.

Autocomplete uses renderValue/getItemProps, keeping wrapper, Chip/Text/classes/height, deletion, keyboard and callback reason masking. Installed7.3.11 Autocomplete.js:665–700 and useAutocomplete.js:255–256,673–674,1177–1208 inspected: getItemProps supplies data-item-index under renderValue, tabIndex and identical multiple delete handler; focus code switches its selector accordingly. Both item index and legacy data-tag-index are retained. SCSS uses vanguard-input-tags, MuiAutocomplete-inputRoot/input/endAdornment/clearIndicator/popupIndicator; none depend on index attribute. Multiple explicit consumer renderValue remains overridden by Vanguard; single explicit renderValue is retained. The previously overridden consumer slotProps stays ignored. Legacy componentsProps/ListboxProps/ChipProps and Paper/Popper component aliases map to effective slots, preserving explicit slots precedence; ListboxComponent uses listbox.component.

Audit exception for root disposition: renderTags={null!} is a deliberate deprecated-prop sentinel, preventing inner MuiAutocomplete theme-default resolution from resurrecting a legacy renderTags function ahead of renderValue. No legacy rendering callback is used. A new real-MUI test proves themed renderTags and multiple consumer renderValue stay overridden. This remaining sentinel is not claimed as a zero-deprecated-hit result.

TDD: function-slot regression failed because paper callback was never called, then passed after implementation. New Autocomplete preservation test passed before refactoring (honest GREEN). Later sizing regression exposed my initial migration changing legacy PaperProps precedence: expected240px, received123px; same assertion GREEN after correction. Other added nested precedence/theme tests are GREEN evidence, not invented pre-fix RED. Frozen tests/stories remained unchanged.

All suite calls serial, bounded_runner.run1800s mach_continuous_time inhibit=True, one worker/no file parallelism, fresh JSON+default reports; no suite/codemod overlap. Exact argv, raw logs, process/resources, assertion JSON and C1 fullName/status/duration remain in each run directory below. Helper reused unchanged from the handoff copy via /tmp; story controller changes only project selection.

| run | raw/reported | passed/failed | continuous seconds |
|---|---|---|---|
| s4a-menu-function-red | 1/1 | 0/1 | 4.000985 |
| s4a-menu-function-green | 0/0 | 242/0 | 11.620528 |
| s4a-autocomplete-refactor-baseline | 0/0 | 77/0 | 8.336830 |
| s4a-menu-auto-green | 0/0 | 350/0 | 20.992950 |
| s4a-menu-auto-final | 0/0 | 504/0 | 34.027606 |
| s4a-menu-auto-stories | 0/0 | 34/0 | 29.645113 |
| s4a-menu-size-red | 1/1 | 1/1 | 3.659701 |
| s4a-menu-size-green | 0/0 | 131/0 | 11.442337 |

C1 per suite, order: chip delete / ArrowLeft / comma Enter. Full names/status/duration are stored in each c1-timings.json and vitest.json.

- s4a-menu-function-red: notincluded / notincluded / notincluded
- s4a-menu-function-green: notincluded / notincluded / notincluded
- s4a-autocomplete-refactor-baseline: passed 105.942ms / passed 146.441ms / passed 125.389ms
- s4a-menu-auto-green: passed 97.978ms / passed 136.835ms / passed 120.182ms
- s4a-menu-auto-final: passed 98.825ms / passed 141.119ms / passed 118.491ms
- s4a-menu-auto-stories: notincluded / notincluded / notincluded
- s4a-menu-size-red: notincluded / notincluded / notincluded
- s4a-menu-size-green: passed 100.182ms / passed 133.996ms / passed 117.587ms

No watched duration exceeded2500ms, no repeat timeout; no escalation condition observed. Historical S3 unexplained RED timeouts remain unchanged. Targeted final504 specs include Menu/MenuItem/DropdownMenu/Select/SearchableSelect/InputBase/MuiTextField/Autocomplete/AutocompleteWithAnchor, PhoneNumberBase/VerificationPinInput and frozen DatePicker. Focused6 story files34PASS include chip SCSS and interaction contracts. Final post-sizing131PASS.

Dedicated static: initial types2 (Autocomplete inferred componentsProps type lacked listbox); fixed explicit slotProps typing. Final verified types raw/reported0,4.581538s; format0,0.362687s; changed-files lint1,2.365735s. New tests/helper adapters have no lint errors; remaining27 errors are existing Menu0/SearchableSelect1/InputBase21/Autocomplete5 baseline diagnostics. Saved S3 production archive lint comparison initially1 because diagnostic text embeds changed declaration line numbers; normalized only those diagnostic location references, second comparison0 with zero added errors. This is not a clean changed-files lint claim or waiver. Earlier static commands/results retained in s4a-menu-auto-static and s4a-menu-auto-static-final.

Final frozen audit492/492 identical,0 changed; snapshot not reset; original490 and two approved-mock proof preserved. Controllers, baseline lint text and integrity hashes retained under out/s4a-menu-auto-handoff. Root peer baseline, undeclared types, WordPress declarations, public runtime subpaths and browser policy remain explicit limitations. No full static/package/browser-policy release validation.

## Remaining Snackbar implementation and final implementation audit — 2026-11-05

Work in existing release/mui-upgrade only. Stable module-level LegacyTransition remains the transition slot; a React context carries the resolved public TransitionComponent, which is removed from forwarded MUI props. No per-render component factory or closure component. Explicit slots (including undefined) retain their original priority. New behavioral tests cover theme-default component with explicit undefined public component, local override, object/function/undefined slot props, non-enter callbacks, enter/exited once, state retention across rerenders, transition ref and exit/unmount.

Installed7.3.11 Snackbar/useSlot and exact accepted S3 source from production.tar.gz were inspected before fixing. New test initially assumed local TransitionProps.ref merged theme callback defaults: preserved S3 failed all3 assertions, establishing that assumption was wrong. Corrected only the new test setup to supply the callbacks in local TransitionProps (no accepted assertion changed); exact S3 copy then passed3/3. Same corrected tests against current S4a failed the intended undefined-slot onEntered assertion (2PASS/1FAIL). Minimal mapping fix retains original nullish-slot fallback for non-enter events. Green targeted Snackbar/Root run51PASS. Original RED history retained, including initial incorrect baseline assumption; no invented compatibility behavior.

Attempted removal of TransitionProps empty sentinel independently reproduced themed-enter duplication (0PASS/1FAIL). Restored it: outer callbacks are already composed, so inner theme legacy callback extraction must be suppressed. Context component mapping needs no TransitionComponent sentinel. Autocomplete renderTags null sentinel retained for preceding proven default suppression. See exhaustive disposition in `s4a-deprecated-audit.md` and exact line inventory/scanner in `out/s4a-final-implementation-audit`.

| run | raw/reported | passed/failed | continuous seconds |
|---|---|---|---|
| s4a-snackbar-s3-baseline | 1/1 | 0/3 | 4.527521 |
| s4a-snackbar-s3-baseline2 | 0/0 | 3/0 | 3.311118 |
| s4a-snackbar-undefined-red | 1/1 | 2/1 | 4.435722 |
| s4a-snackbar-undefined-green | 0/0 | 51/0 | 7.509391 |
| s4a-snackbar-sentinel-removal-red | 1/1 | 0/1 | 4.693067 |

All five suite invocations: chip delete / ArrowLeft / comma Enter each **notincluded**, recorded in each unique c1-timings.json, not measured or claimed as included. Historical S3 timing RED remains unexplained, not flake. No threshold, retry, timeout or accepted assertion changes. No C1 escalation trigger.

Codemod intermediate attempts are retained honestly: `s4a-clean-codemods` used explicit paths but still included story-support directories and a declaration parser error; `s4a-clean-codemods-final` excluded those directories but retained StyledSVG/global.d.ts, with1 parse error in deprecated transforms despite exit0. Neither is clean proof. Final executable-source run excludes .d.ts, JSON, specs/tests/stories and story-support directories. Pinned7.3.10 package/cache unchanged; no nonexistent select-props/latest fallback. All transforms mutate only temporary copies. Exact explicit path lists, commands, diffs, parser result counts, raw/reported exits and resources retained per run. No copy changes applied blindly.

Final clean codemod proof: `s4a-clean-codemods-verified`,1950 explicit executable production .ts/.tsx paths,22 pinned official transforms, all raw/reported0 and **zero parser errors**. Per-transform timing/status/disposition in review.json. grid-props2 unrelated formatting hunks rejected; Autocomplete duplicate renderValue/sentinel-removal hunk rejected; Snackbar slotProps overwrite/sentinel-removal hunk rejected. Other19 transforms clean no-op, including text-field, menu, drawer, popover, tooltip, popper, slider and relevant class transforms. No modifications copied back. Prior207 JSON parse errors and intermediate declaration parse errors remain preserved RED evidence.

Final dedicated static initially found unused destructured component (lint1) and excess-property ref typing in the new test (types2). Used copy/delete in mapper and a structurally typed transition-props variable in the test; runtime assertions unchanged. `s4a-snackbar-verified-static`: format0 (0.355420s), lint-fix0 (2.439788s), types0 (1.920267s), lint0 (1.501876s), raw/reported0; nonfatal warnings remain. Includes new guard/helper/Snackbar/new compatibility files outside old contract include. Prior Menu/Auto production baseline comparison remains the recorded no-added-errors evidence; no full-static or whole-root type claim.

s4a-snackbar-final-target: raw/reported0/0, 73PASS/0FAIL, 14.933226s continuous. C1 all three watched Autocomplete names notincluded, explicitly recorded in c1-timings.json.

s4a-snackbar-final-stories: raw/reported0/0, 4PASS/0FAIL, 16.731541s continuous. C1 all three watched Autocomplete names notincluded, explicitly recorded in c1-timings.json.

Frozen audit after all checks:492 protected inputs,0 changed; snapshot unchanged, old490/mock approval retained. git diff --check clean. No accepted test edits. Exact line inventory regenerated after final formatting. All bounded suite/static/codemod processes were serialized with1800s mach_continuous_time inhibit=True, process resources and raw/reported exits; read-only inventory/hash collection also occurred while copy-only transforms ran, never a second bounded runner. No suite/static/codemod overlap. No retry or increased timeout; no watched-test escalation trigger. Targeted final73 specs and focused SnackbarRoot story supplement preceding504 specs/34 stories; DatePicker invariants already included there and not rerun.

Implementation REVIEW READY for root fresh review. This is not S4a acceptance. Root must perform fresh review before its one full final-gates run. No full suite/full static/coverage/package gate, stage acceptance, S4b, dependency change, new checkout, delegate, commit, push, PR or posted/drafted CR in this continuation. Root peer baseline, undeclared types, WordPress declarations, public runtime subpaths and consumer browser policy remain explicit limitations, without a broad waiver.


## ONE final S4a validation — 2026-11-05 — RED, stopped

Fresh clean review-s4a.md read before validation. Existing release/mui-upgrade only. Evidence: `agentic-plans/mui-upgrade-gates/out/s4a-final-d50d1d63beed418887311cba09f1e1b5`. No retry, isolated/full rerun, source/test/config/dependency edit, acceptance or S4b.

- selftest: raw/reported 0/0, 1.309624s.
- suite-selftest: raw/reported 0/0, 0.570083s.
- coverage-selftest: raw/reported 0/0, 0.263267s.
- runner-selftest: raw/reported 0/0, 0.976134s.
- static: raw/reported 0/0, 50.214345s.
- extra-types: raw/reported 0/0, 2.021460s.

Static: app1001/lib4 errors, zero new; contract0; lint1318, zero worse pairs. Three runner integration tests PASS. Extra types used unchanged node_modules/.tsconfig.s4a-new-tests.json.

Full spec: raw/reported 1/1, 168.439076s; 1740PASS/1FAIL, 105 passed files/1 failed file. FIRST RED: frozen src/core/ToggleButton/_ToggleButton.mui.spec.tsx:269, non-native disabled click/Space contract expected onChange twice, actual once. No assertion edits. Later Storybook, combined coverage, fresh build/pack/four-consumer fixture NOT RUN. No coverage/package/pin/byte success claim.

C1 actual fullName/status/duration retained in spec-c1.json and fresh spec-vitest.json (default+JSON reporters, absolute unique path deleted before run, one worker/no file parallelism):
- `Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason "removeOption"`: passed, 135.694292ms.
- `Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one`: passed, 167.790375ms.
- `Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason "selectOption"`: passed, 141.971125ms.

All invoked gates used unchanged bounded_runner.run with1800s, mach_continuous_time, inhibit=True, raw/reported exits and durable resource snapshots; all inhibitors reaped, no timeout. Frozen independent before/after492 checks:0 changed. Stage input snapshot 5234 files: 1 changed. Root/worktree diff checks0. No expected generated analysis output drift (build not reached). Original490/two approved mock exceptions preserved. No C1 >2500ms/repeat timeout; historical S3 timeouts remain unexplained. Root peer baseline, undeclared types, WordPress declarations, public runtime subpaths and browser-policy limitations remain without broad waiver. Final verdict RED pending root then overseer; no S4a acceptance.

Read-only failure inspection: installed MUI ButtonBase.js:228 guards non-native Space activation with `!disabled`; the Vanguard ToggleButton forwards props directly. This accounts for the observed missing second callback. No fix or rerun performed. The single snapshot drift is root `.tsbuildinfo-app`, generated by the normal static compiler; preserved, not reset. All protected stage source/tooling/frozen inputs unchanged. Workflow limitation: initial discovery (`pwd`, git status, rg) and runner-signature bootstrap were executed outside bounded_runner before all subsequent command groups used it; therefore strict ALL-command bounded compliance is not claimed.

## Overseer-approved ToggleButton upstream fix disposition

Overseer explicitly approved one frozen-test edit after inspecting MUI7.3.11 ButtonBase handleKeyUp !disabled guard. No production fix: disabled non-native Space no longer activates; dispatched click stays active, Enter stays inactive. Changed ONLY the one test title, its preceding comment (citing installed version/guard), and final Space count2→1. Click/Enter assertions remain byte-identical. Full-file AST recursive proof shows exactly two literal changes, title and numeric assertion; surrounding AST identical. Before/after text, SHAs and proof: `out/s4a-approved-toggle/{before.tsx,change.json,ast-proof.json}`. Initial proof implementation used SyntaxKind reverse enum name for NumericLiteral (alias FirstLiteralToken), assertion failed; corrected to numeric SyntaxKind comparison, proof passed. No test/source changes arose from that tooling correction.

Checked-in `approved-frozen-changes.json` retains both original mock approvals and adds ToggleButton (three approved files total). Original snapshots and /tmp/s3 approvals not reset. Plan Intentional incompatibilities and release-notes draft carry the exact approved statement. Targeted18/18PASS raw/reported0,5.727438continuous seconds,no timeout,inhibitor reaped; C1 watched three notincluded explicitly recorded in out/s4a-approved-toggle-target. git diff --check0.

Standing overseer rule retained: future verified upstream bug-lock fixes toward correct/disabled-safe/accessibility behavior may receive the same narrow proof/incompatibility treatment; NON-bug-lock failure, worse bug-lock behavior, unproven cause or public API/type change must be escalated before edits. No new production edit/reviewer pass needed for this approved test-only change. Previous full-spec RED1740/1 stays history. Overseer authorizes ONE fresh complete sequential validation; no old final evidence substituted. Generated .tsbuildinfo-app is compiler output and excluded from input-change counts with drift recorded separately. S4b remains blocked pending S4a verdict.


## Newly authorized ONE complete S4a final validation — 2026-11-05 — RED, stopped

Read latest verification and clean review before gates; approved ToggleButton-only disposition retained. Evidence: `out/s4a-approved-final-49279364ecbc4a4589578ef0f72db354`. Serial controller `/tmp/mui-upgrade/s4a-approved-validation-controller.py` adapts the existing final-validation.py runner pattern after read-only inspection of prior final evidence. The prior final directory contained no saved controller source; its exact commands/results/C1 were inspected. No prior final evidence substituted. Initial read-only discovery, inventory/hash collection and report writing were outside bounded_runner; no ALL-command bounded claim.

| Gate | raw/reported | continuous seconds |
|---|---|---|
| selftest | 0/0 | 1.615412 |
| suite-selftest | 0/0 | 0.572345 |
| coverage-selftest | 0/0 | 0.364499 |
| runner-selftest | 0/0 | 1.002701 |
| static | 0/0 | 45.855241 |
| extra-types | 0/0 | 2.474123 |
| spec | 0/0 | 199.614461 |
| storybook | 1/1 | 341.662751 |

Every invoked gate used bounded_runner.run(timeout=1800, inhibit=True), mach_continuous_time, no timeout, inhibitor reaped. Durable per-gate `*-process.json.resources.json` files verified nonempty; sizes/SHAs in resource-evidence.json. No retry, extension, increased timeout, overlapping gate or assertion rewrite. Runner integration tests3/3PASS. Static app1001/lib4 diagnostics, zero new; contract0; lint1318, zero worse file/rule pairs. Extra types unchanged config passed.

Full spec1741PASS/0FAIL (106 files); full Storybook1288PASS/4FAIL,173 passed files/1 failed file. First failing gate Storybook raw/reported1/1. All four failures are `src/core/Popover/_PopoverMuiContract.stories.tsx`: Placement Top expected154>=161; Bottom271<=239; Left151.6875>=221; Right449.3125<=379. Full JSON assertion details/durations retained in storybook-failures.json and storybook-vitest.json. No cause or flake claim; no fix or rerun. Escalated to root thread7d12feb7-406f-4d7b-b4ae-fd8ae56e230c.

C1 full spec actual fullName/status/duration from fresh default+JSON report:
- `Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason "removeOption"`: passed, 143.735500ms.
- `Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one`: passed, 183.960833ms.
- `Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason "selectOption"`: passed, 202.301833ms.

Storybook C1: all three explicitly notincluded, retained even though RED. No watched duration>2500ms or repeat timeout; no timing escalation trigger. Historical S3 unexplained timeouts and previous final1740/1 RED remain unchanged. Coverage never started, so no combined-coverage C1 or35-file metrics claim.

Coverage and fresh build/pack/four strict consumers NOT RUN because first nonzero stopped later gates. `/tmp/mui-upgrade/s4a-approved-final-package` verified absent before launch and remains absent. No current packed bytes,8 installed bytes,18 runtime cases,required types,tar SHA or installed pins verified in this run; no package success claim. Intended pins remain core/system7.3.11,pickers7.29.4; not substituted for installed verification. Root peer baseline, undeclared types, WordPress declarations, public runtime subpaths and consumer browser policy remain explicit limitations without broad waiver.

Independent before/after frozen audit: original492 snapshot SHA f4bfe5829416664b619b69cc133fa0d5fa17500a49427e7b5af2eb3649104b13, exactly1 approved ToggleButton difference. Original490 snapshot SHA77c4cc307c5373b8eb8e55a8a9cb345fd9780741a87befa6cb45804974b6c8cf, exactly3 approved differences. Every changed file matched approval before/after SHAs and all three current after-SHAs; no snapshot reset. Plan/release-notes exact incompatibility entry inspected. Stage input snapshot5666 files: zero changed/added; excludes out/__pycache__/report and .tsbuildinfo-app. Compiler output and generated analysis JSON separate before/after:

```json
{
  "before": {
    "dynamic-import-analysis-simple.json": "b4eb459cfc86923267b1e544989ed8afe33558e2e7532bc87adaebece441f7b5",
    "dynamic-import-analysis.json": "daf3e7495f042d2d6d6d129f414bdf7b996af998eabe0aa00b6a082e6ac72f4d",
    ".tsbuildinfo-app": "409c1dcc823d1ad76b101e311e1629af38a1a1203df6f38bff55c820f32ce9db",
    "dist/vanguard-asset-analysis.json": "4a076edd2ba244a436618d14303dd2236903038d5a714bfff44d18af31e79564"
  },
  "after": {
    "dynamic-import-analysis-simple.json": "b4eb459cfc86923267b1e544989ed8afe33558e2e7532bc87adaebece441f7b5",
    "dynamic-import-analysis.json": "daf3e7495f042d2d6d6d129f414bdf7b996af998eabe0aa00b6a082e6ac72f4d",
    ".tsbuildinfo-app": "409c1dcc823d1ad76b101e311e1629af38a1a1203df6f38bff55c820f32ce9db",
    "dist/vanguard-asset-analysis.json": "4a076edd2ba244a436618d14303dd2236903038d5a714bfff44d18af31e79564"
  }
}
```

Build never ran; two generated analysis JSONs unchanged. No source/test/config/dependency edits, subagents, commits,pushes,PRs,CR,acceptance or S4b. Only evidence and this report written. Final verdict RED pending root investigation and overseer disposition.

Exact invoked commands (raw/reported/timing/resources above and results.json):

```text
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/selftest.sh
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/suite-selftest.sh
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/coverage-selftest.sh
/opt/homebrew/opt/python@3.14/bin/python3.14 -m unittest discover -s /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates -p test_bounded_runner.py
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/gates.sh s4a-approved-final-49279364ecbc4a4589578ef0f72db354
node node_modules/typescript/bin/tsc -p /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/.tsconfig.s4a-new-tests.json
node node_modules/vitest/vitest.mjs run --project spec --maxWorkers=1 --no-file-parallelism --reporter=default --reporter=json --outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-approved-final-49279364ecbc4a4589578ef0f72db354/spec-vitest.json
node node_modules/vitest/vitest.mjs run --project storybook --maxWorkers=1 --no-file-parallelism --reporter=default --reporter=json --outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-approved-final-49279364ecbc4a4589578ef0f72db354/storybook-vitest.json
```

## Authorized Popover styled-default repair — root

Overseer confirmed production regression and authorized repair, with NO frozen edits. Read-only comparison of all requested component/slot boundaries completed BEFORE any new suite: see `s4a-styled-slot-audit.md` with pinned6.5/7.3 source line references and per-boundary disposition. Only Tooltip lost its styled default; Autocomplete retains outer styled wrappers via as, transition aliases already selected equivalent slots, other mappings only move props without replacing styled defaults. No additional audit fix identified.

New non-frozen `_PopoverClosing.spec.tsx` written first: both public classes pass; closing interactive popper pointer-events expected none, received auto (intended assertion RED, raw/reported1). Root removed slots.popper and inline pointerEvents, passed vanguard-popover plus dark class via slotProps.popper.className, retained maxWidth/zIndex/placement and explicitly imported unchanged PopoverPopper.scss. PopoverPopper module unchanged, no arrow CSS duplication or untyped as/component.

Targeted same new test plus unchanged Popover/PopoverPopper specs GREEN41/41; frozen `_PopoverMuiContract.stories.tsx` GREEN10/10 including four geometry and pointer-events stories, raw/reported0,22.875986continuous seconds. All suites bounded1800/inhibitTrue/mach_continuous_time, unique JSON, one worker/serial. C1 each run all3watched names explicitly notincluded. Exact commands/status/resources/JSON under out/s4a-popover-closing-red, s4a-popover-closing-green, s4a-popover-geometry-green. Prior fullStorybook1288/4RED and earlier ToggleButtonRED remain history.

Dedicated formatter/types/lint raw/reported0 under out/s4a-popover-static; existing exhaustive-deps warning remains,0lint errors. Formatter changed only new test layout. git diff --check0. No further production changes, new frozen exceptions or altered public API. Scoped fresh read-only review next, then ONE authorized fresh full sequential final validation. S4a not accepted/S4b blocked; no commits/pushes.


## Authorized ONE fresh Popover final validation — 2026-11-05 — RED, stopped

Read latest verification, clean review-s4a.md, clean scoped review-s4a-popover.md, allowlist, README and tooling. Fresh evidence: `out/s4a-popover-final-5d439fbb278643c1b8949b2dd34a5c6e`; controller `out/s4a-popover-controller.py` adapted from prior controller, with fresh paths and `.tsconfig.s4a-popover.json` including new closing test. No old tar or final proof substitution.

| Gate | raw/reported | continuous seconds |
|---|---|---|
| selftest | 0/0 | 1.391203 |
| suite-selftest | 0/0 | 0.572311 |
| coverage-selftest | 0/0 | 0.379453 |
| runner-selftest | 0/0 | 1.034731 |
| static | 0/0 | 52.161980 |
| extra-types | 0/0 | 5.752593 |
| spec | 0/0 | 209.824343 |
| storybook | 0/0 | 364.593011 |
| coverage | 1/1 | 513.952199 |

All gates serial bounded_runner.run(timeout1800,inhibit=True), mach_continuous_time; no runner timeout; all inhibitors reaped. Nonempty resources verified with SHAs/counts in resource-evidence.json. All owned gate process groups absent after completion (process-cleanup.json); unrelated pre-existing Chromium retained. Read-only discovery/hash/report operations outside runner, not claimed as bounded gates.

Selftests green and runner integration3PASS. Full static app1001/lib4 errors,0new; contract0; lint1318,0worse pairs. Extra new non-MUI types0. Normal spec1742PASS/107files; normal Storybook1292PASS/174files. Combined coverage3032PASS/2FAIL,279passed/2failed files, raw/reported1/1: FIRST RED, no later gates. Both failures are test5000ms timeouts: `scripts/_codemod-button-sizes.spec.ts:91` import-level type-only ButtonSizes to value import (5701.519791ms), and `scripts/_mui-public-imports.spec.ts:7` production MUI public imports (5774.911584ms). JSON failure messages contain STACK_TRACE_ERROR; raw log preserves explicit timeout messages. No cause or flake claim; no connection asserted to historical S3 timeouts. Immediately escalated to overseer/root before any edits; no edits/retries/timeout increase/assertion rewrite.

C1 exact fullName/status/duration JSON for all suite invocations:

`spec-c1.json`:
```json
[
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "multiple + chips (renderTags)"
    ],
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason \"removeOption\"",
    "status": "passed",
    "title": "clicking a chip delete icon removes it with reason \"removeOption\"",
    "duration": 161.80779099999927,
    "failureMessages": [],
    "meta": {},
    "tags": []
  },
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "multiple + chips (renderTags)"
    ],
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one",
    "status": "passed",
    "title": "ArrowLeft from the empty input moves focus to the last chip, then the previous one",
    "duration": 187.40158399999927,
    "failureMessages": [],
    "meta": {},
    "tags": []
  },
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "splitCommaTag"
    ],
    "fullName": "Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason \"selectOption\"",
    "status": "passed",
    "title": "Enter splits comma separated free text into tags with reason \"selectOption\"",
    "duration": 164.84050000000025,
    "failureMessages": [],
    "meta": {},
    "tags": []
  }
]
```

`storybook-c1.json`:
```json
[
  {
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason \"removeOption\"",
    "status": "notincluded"
  },
  {
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one",
    "status": "notincluded"
  },
  {
    "fullName": "Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason \"selectOption\"",
    "status": "notincluded"
  }
]
```

`coverage-c1.json`:
```json
[
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "multiple + chips (renderTags)"
    ],
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason \"removeOption\"",
    "status": "passed",
    "title": "clicking a chip delete icon removes it with reason \"removeOption\"",
    "duration": 276.47020799999973,
    "failureMessages": [],
    "meta": {},
    "tags": []
  },
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "multiple + chips (renderTags)"
    ],
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one",
    "status": "passed",
    "title": "ArrowLeft from the empty input moves focus to the last chip, then the previous one",
    "duration": 381.7542089999997,
    "failureMessages": [],
    "meta": {},
    "tags": []
  },
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "splitCommaTag"
    ],
    "fullName": "Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason \"selectOption\"",
    "status": "passed",
    "title": "Enter splits comma separated free text into tags with reason \"selectOption\"",
    "duration": 288.9532500000005,
    "failureMessages": [],
    "meta": {},
    "tags": []
  }
]
```

Full spec and combined each matched all3watched tests. Story-only all3notincluded. All watched tests PASS, none>2500ms; no watched-test/repeat C1 timeout trigger. The two unrelated test timeouts still cause RED and escalation.

Read-only post-stop coverage evidence: all35exact files present in detailed mapped coverage and summary, each >=95lines/85branches (coverage-metrics.json). This does not turn raw RED green. Exact35includes, V8 env/provider,reportOnFailure,json/json-summary/text,perFile95/85 and default+JSON test reporters used. No exclusions added; only existing3approved unreachable PopoverModal handlers ignored.

Fresh normal build/pack/four npm11 strict consumers NOT RUN because coverage RED. `/tmp/mui-upgrade/s4a-popover-final-package` was absent before and remains absent. No current packed4/installed8 bytes, required types,18runtime cases per consumer, installed core/system7.3.11/pickers7.29.4 or tar SHA proof claimed. Prepared out-only package audit was never executed. Root peer baseline, undeclared types, WP declarations, public runtime subpaths and browser policy remain explicit limitations without broad waiver.

Frozen before/after audits identical:492snapshotSHA f4bfe5829416664b619b69cc133fa0d5fa17500a49427e7b5af2eb3649104b13 exactly1approvedToggle difference;490snapshotSHA77c4cc307c5373b8eb8e55a8a9cb345fd9780741a87befa6cb45804974b6c8cf exactly3allowlisted differences. All before/after approvalSHAs verified; snapshots not reset. Input snapshot5669files,0changed/0added; excludes out/__pycache__/report/generated .tsbuildinfo-app and build output. No build ran. Generated evidence separately:
```json
{
  "before": {
    "dynamic-import-analysis-simple.json": "b4eb459cfc86923267b1e544989ed8afe33558e2e7532bc87adaebece441f7b5",
    "dynamic-import-analysis.json": "daf3e7495f042d2d6d6d129f414bdf7b996af998eabe0aa00b6a082e6ac72f4d",
    ".tsbuildinfo-app": "409c1dcc823d1ad76b101e311e1629af38a1a1203df6f38bff55c820f32ce9db",
    "dist/vanguard-asset-analysis.json": "4a076edd2ba244a436618d14303dd2236903038d5a714bfff44d18af31e79564"
  },
  "after": {
    "dynamic-import-analysis-simple.json": "b4eb459cfc86923267b1e544989ed8afe33558e2e7532bc87adaebece441f7b5",
    "dynamic-import-analysis.json": "daf3e7495f042d2d6d6d129f414bdf7b996af998eabe0aa00b6a082e6ac72f4d",
    ".tsbuildinfo-app": "c1aaa9fe009356d5b2a34b43ca66b726999fa87cc5936a4a587f136f111fd1b9",
    "dist/vanguard-asset-analysis.json": "4a076edd2ba244a436618d14303dd2236903038d5a714bfff44d18af31e79564"
  }
}
```

Resource-audit limitation discovered after stop: pre-existing unrelated `node shot.mjs real CustomVisualization endless-loop 9000` PID84651 and headless Chromium85414 with renderer85417 were present already in first selftest resource snapshot; renderer about99.7%CPU there. Not created/terminated by this worker; do not claim clean machine/no other Chromium or infer failure cause. All worker gates were serial.

Exact invoked commands:
```text
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/selftest.sh
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/suite-selftest.sh
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/coverage-selftest.sh
/opt/homebrew/opt/python@3.14/bin/python3.14 -m unittest discover -s /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates -p test_bounded_runner.py
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/gates.sh s4a-popover-final-5d439fbb278643c1b8949b2dd34a5c6e
node node_modules/typescript/bin/tsc -p /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/.tsconfig.s4a-popover.json
node node_modules/vitest/vitest.mjs run --project spec --maxWorkers=1 --no-file-parallelism --reporter=default --reporter=json --outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-popover-final-5d439fbb278643c1b8949b2dd34a5c6e/spec-vitest.json
node node_modules/vitest/vitest.mjs run --project storybook --maxWorkers=1 --no-file-parallelism --reporter=default --reporter=json --outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-popover-final-5d439fbb278643c1b8949b2dd34a5c6e/storybook-vitest.json
env VANGUARD_V8_COVERAGE=1 node node_modules/vitest/vitest.mjs run --project spec --project storybook --maxWorkers=1 --no-file-parallelism --coverage --coverage.provider=v8 --coverage.include=src/core/AIAssistant/AIAssistentPanel/AIAssistantPanel.tsx --coverage.include=src/core/Accordion/Accordion.tsx --coverage.include=src/core/AppBar/AppBar.tsx --coverage.include=src/core/Autocomplete/Autocomplete.tsx --coverage.include=src/core/AutocompleteWithAnchor/AutocompleteWithAnchor.tsx --coverage.include=src/core/Button/Button.tsx --coverage.include=src/core/Collapse/Collapse/Collapse.tsx --coverage.include=src/core/DatePicker/DatePicker.tsx --coverage.include=src/core/DateRangeInput/DateRangeInput.tsx --coverage.include=src/core/DateRangePicker/DateRangePicker.tsx --coverage.include=src/core/DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/DateRangePickerBaseInputAdornment.tsx --coverage.include=src/core/Documents/DocumentDisplay/DocumentDisplay.tsx --coverage.include=src/core/Documents/DocumentUpload/DocumentUpload.tsx --coverage.include=src/core/Drawer/Drawer.tsx --coverage.include=src/core/DropdownMenu/DropdownMenu.tsx --coverage.include=src/core/FlagAdornment/FlagAdornment.tsx --coverage.include=src/core/FormControl/FormControl.tsx --coverage.include=src/core/Input/Input.tsx --coverage.include=src/core/List/ListShowMore/ListShowMore.tsx --coverage.include=src/core/Menu/Menu.tsx --coverage.include=src/core/MenuItem/MenuItem.tsx --coverage.include=src/core/Popover/Popover.tsx --coverage.include=src/core/Popover/PopoverPopper/PopoverPopper.tsx --coverage.include=src/core/PopoverModal/PopoverModal.tsx --coverage.include=src/core/ProgressBar/ProgressBar.tsx --coverage.include=src/core/SearchableSelect/SearchableSelect.tsx --coverage.include=src/core/Select/Select.tsx --coverage.include=src/core/Slider/Slider.tsx --coverage.include=src/core/Snackbar/Snackbar.tsx --coverage.include=src/core/SnackbarRoot/SnackbarRoot.tsx --coverage.include=src/core/ToggleButton/ToggleButton.tsx --coverage.include=src/core/ToggleButtonGroup/ToggleButtonGroup.tsx --coverage.include=src/core/Toolbar/Toolbar.tsx --coverage.include=src/core/_internal/InputBase/InputBase.tsx --coverage.include=src/helpers/hex-to-rgba.ts --coverage.reportOnFailure --coverage.reporter=json --coverage.reporter=json-summary --coverage.reporter=text --coverage.reportsDirectory=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-popover-final-5d439fbb278643c1b8949b2dd34a5c6e/coverage --coverage.thresholds.perFile --coverage.thresholds.lines=95 --coverage.thresholds.branches=85 --reporter=default --reporter=json --outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-popover-final-5d439fbb278643c1b8949b2dd34a5c6e/coverage-vitest.json
```

Previous1740/1Toggle and1288/4Popover RED history remains untouched. No source/test/config/dependency edits, subagents, new checkout, commits,pushes,PRs,CR,acceptance or S4b. Verdict RED; root/overseer disposition required.


## Authorized narrow gate-scope investigation — STOP before gate edit (2026-11-05)

Start load recorded at15:02 local:16.58/20.60/24.51,10cores. Existing data only; no diagnostic suite, benchmark, retry or timeout increase. Conclusion per overseer direction: **host contention + V8 coverage overhead on the typescript module; no behaviour defect**.

Correct available S3 baseline `out/s3-review-final/coverage-run.log`: total393.12s,setup149.80s,import24.63s,environment29.13s. S4 `out/s4a-popover-final-5d439fbb278643c1b8949b2dd34a5c6e/coverage.log`: total509.49s,setup199.80s,import41.63s,environment49.87s. Runner continuous durations differ from Vitest totals:406.519879s versus513.952199s. Existing resource samples parsed/selectively summarized in `out/s4a-scope-proof-stop/existing-evidence.json`; unrelated renderer near100% and Spotlight contention retained. No unrelated process killed or power setting changed.

Exact two normal/coverage assertions from existing JSON:
- spec: `codemod-button-sizes type-only ButtonSizes imports turns an import-level type-only ButtonSizes into a value import` — passed 1800.4739579999996ms.
- spec: `production MUI imports use public package entry points` — passed 1136.8774170000002ms.
- coverage: `codemod-button-sizes type-only ButtonSizes imports turns an import-level type-only ButtonSizes into a value import` — failed 5701.519791ms.
- coverage: `production MUI imports use public package entry points` — failed 5774.9115839999995ms.

Conditional static proof cannot be established for the complete execution graph. TypeScript AST extraction (imports/exports/import-equals/dynamic imports/require, including type-only conservatively) records all executable edges in `out/s4a-scope-proof-stop/import-proof.json`; reproducible command: `node agentic-plans/mui-upgrade-gates/out/s4a-scope-proof-stop/import-proof.cjs`. All three script roots themselves import only Node built-ins/typescript/vitest; spawned codemod imports fs/path/typescript. No local module import from those four modules. Fixture import strings are data; guards read/parse source without executing it; codemod temporary fixtures are parsed/rewritten/typechecked with noEmit, never imported.

However, `vitest.config.ts` mandates `src/test-utils/vitest.setup.tsx` for every spec. Its line7 runtime import of storeNonPersist loads `./get-storybook-decorator`; that module line5 imports `@vanguard/SnackbarRoot/SnackbarRoot.tsx`, resolving through the configured @vanguard alias to `src/core/SnackbarRoot/SnackbarRoot.tsx`. This is one of the35 mapped files and exists in both prior coverage-final.json and summary. Thus an empty intersection for script-owned imports does not prove an empty intersection for script invocations including setup. Cannot claim these invocations cannot execute mapped modules/increment counts. No claim that the SnackbarRoot render function runs in these tests; module evaluation and render execution differ. Package internals remain external boundaries, not a proof of zero. No nonliteral dynamic import in inspected modules. Aggregate JSON provides no per-test attribution; no numeric attribution fabricated. All35 mapped files are present in both prior reports.

STOP as explicitly required when proof cannot be established. No exclusion, gate/selftest/README/source/config/dependency/frozen edit, new validation run or package probe. Prior REDs remain RED. Previous after-hashes compared read-only for relevant paths with exact list in existing-evidence.json; no reuse validation gates launched. No acceptance/S4b/CR/PR/commit/push/subagent/checkout. Root7d12feb7-406f-4d7b-b4ae-fd8ae56e230c and overseer03a95c34-f4ce-4b25-b8f2-45ea90ab4330 handoff: resolve proof boundary before authorizing any gate-scope edit.


## Authorized Node project implementation and ONE fresh validation — RED STOP (2026-11-05)

scripts specs moved to node project: not UI code, no UI setup; still mandatory in pnpm test/gates; excluded from component coverage gate by project, not by file filter.

TDD: new scripts-project-selftest.mjs first ran against unchanged old config: raw/reported1/1, intended dedicated scripts project missing. Then minimal config/package/gate changes: raw/reported0/0. Full resolved configurations and actual globTestSpecifications file lists retained in resolution-red.log/resolution-green.log and fresh scripts-project-selftest.log. Not a config-text-only proof. Installed Vitest4.1.9 API types inspected. Both proof runs bounded1800, mach_continuous_time, inhibit=True. Exact Node file set: scripts/_codemod-button-sizes.spec.ts, scripts/_mui-public-imports.spec.ts, scripts/_mui-v7-public-imports.spec.ts. Node environment, empty setupFiles, no UI plugins; spec resolves zero scripts. spec retains configDefaults.exclude plus scripts/**. All three package commands and suite runner include spec/scripts/storybook. Coverage.sh unchanged, exact spec/storybook project set with no file exclusion. Selftest checks these boundaries and is in normal final selftest batch/README.

Active command audit: package test/test:w/test:w:c, suite.sh, coverage.sh, final-validation.py updated or preserved appropriately. .github/hooks search found no other active --project spec commands. Navigation-modal/ado-styling/mui-upgrade-plan snippets and verification/review/out controllers are historical, not rewritten. Isolated package-fixture Vitest consumer is a different project.

Fresh output: /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-node-final-6fdf3f4bf3024f75b875e04d361da310. PACKAGE_FIXTURE_OUT=/tmp/mui-upgrade/s4a-node-final-package was absent before run. No old results reused, retry, timeout increase, skip/baseline/force/legacy/source alias. All actual gate commands below used bounded_runner.run(timeout=1800,inhibit=True), serial; suite commands one worker/no file parallelism. Three runner integrations passed. Start resources retained in start-resources.txt; orphan84651/85414/85417 untouched. No host-cause inference.

| gate | raw/reported | continuous seconds |
|---|---|---|
| selftest | 0/0 | 1.5153633749578148 |
| suite-selftest | 0/0 | 0.5778551667463034 |
| coverage-selftest | 0/0 | 0.37241650000214577 |
| scripts-project-selftest | 0/0 | 0.8005089584039524 |
| runner-selftest | 0/0 | 1.0043843333842233 |
| static | 0/0 | 52.75981862505432 |
| extra-types | 0/0 | 6.369488000054844 |
| spec | 0/0 | 196.14166650001425 |
| scripts | 0/0 | 17.823289624997415 |
| storybook | 0/0 | 358.92965445818845 |
| coverage | 0/0 | 506.34347687498666 |
| package | -15/-15 | 423.71583474997897 |

Normal spec1722/104 files; scripts20/3 exact files; storybook1292/174 files:3034PASS. Scripts default5000ms, setup0/environment0. Fresh combined coverage3014PASS, all35 exact mapped files present and each95lines/85branches (coverage-metrics.json); only the existing3approved deadPopoverModal handlers excluded. Previous shared UI setup edge proof and all previous RED/host-contention evidence remain recorded; no reattribution of old coverage.

FIRST evidence gap: fresh default-declared smoke.log reports5 runtime tests, required18. Immediately stopped owned package process group10391 with TERM and notified root/overseer. Package raw/reported are signal termination, not a claimed package behavioral regression. No retries, fixture edits or later gates. Required four-consumer18runtime/current4+installed8 full audit NOT established. Partial packed hashes/bytes and available pins are recorded only as partial in package-partial-audit.json. Build log retains WordPress declaration mv diagnostic. Root peer baseline, undeclared types, WP declarations, public runtime subpaths and browser-policy limitations remain visible with no waiver.

Input integrity: frozen before/after identical (492 exactly1approved Toggle difference;490 exactly3allowlisted changes), snapshot hashes/approval bytes verified, no reset. Source/config/dependency hashes fixed after implementation. Only expected build outputs changed: dynamic-import-analysis-simple.json, dynamic-import-analysis.json, dist-wordpress/index.js; .tsbuildinfo-app separately generated in generated-before/after.json. dist-wordpress is a build directory captured by inherited snapshot logic, not source production drift. No src/frozen edits. Clean reviews remain applicable; no duplicate review requested.

Resource evidence: {"selftest": {"sha256": "33d481893146cae88f1abf47f93a8553899124fd42057fbad8f87740f01b32bd", "samples": 1}, "suite-selftest": {"sha256": "6112454ca1b71fa6e3c2d5b6e43a32cfca87701faeca1231bc903689c99c2801", "samples": 1}, "coverage-selftest": {"sha256": "0d73587fff16d8a96c2f6675fe548238faa49908cb9d23175849e9120d82d0fd", "samples": 1}, "scripts-project-selftest": {"sha256": "1584cdd5f8e7df4d5ba53dfd467c0fcc12add73654f65949b48bc7d237ac32c0", "samples": 1}, "runner-selftest": {"sha256": "e0ab9f934315ff7ac5b1ae2b82dac20f4e76ad97426ca0d26cacfca637c32ad3", "samples": 1}, "static": {"sha256": "e450ff2546d6f911c0d372487dddcbb661612ab83026444799c6d57c51db1c05", "samples": 4}, "extra-types": {"sha256": "a604df97c87a4258caf56d7990a15ca3620baa036049082c4bf6dae2a2c24fbb", "samples": 1}, "spec": {"sha256": "1652a55f93aa844f9f9b6df6fd7c13c5e72380c821a1a5de309527d1799f356d", "samples": 14}, "scripts": {"sha256": "7774e9f68a96dce934077e4fd0d07a3cb703db7ca8eac5fdedf1bb5d27c77d9a", "samples": 2}, "storybook": {"sha256": "a11eb5084c11500e50bd3ae2665b1bb41b66ae611eec88742dd1b079e51c4520", "samples": 24}, "coverage": {"sha256": "fc6256a3397a06e5fbe9f60e5fb6d52c5960b39c6ffaa06d20f36d93cb0f12d8", "samples": 34}, "package": {"sha256": "3d213018a72b234a26342fa1865a27ca5342f93dde55d815aef6045e56023126", "samples": 29}}. All completed runners mach_continuous_time, no outer timeout, inhibitors reaped. Owned package group absent after stop; unrelated processes retained. No commits/pushes/PRs/CR/acceptance/S4b/subagents/checkouts.

C1 exact entries per suite (scripts/storybook explicitly notincluded; spec/coverage each require all3):

spec:
```json
[
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "multiple + chips (renderTags)"
    ],
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason \"removeOption\"",
    "status": "passed",
    "title": "clicking a chip delete icon removes it with reason \"removeOption\"",
    "duration": 150.75304200000028,
    "failureMessages": [],
    "meta": {},
    "tags": []
  },
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "multiple + chips (renderTags)"
    ],
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one",
    "status": "passed",
    "title": "ArrowLeft from the empty input moves focus to the last chip, then the previous one",
    "duration": 182.72158300000046,
    "failureMessages": [],
    "meta": {},
    "tags": []
  },
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "splitCommaTag"
    ],
    "fullName": "Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason \"selectOption\"",
    "status": "passed",
    "title": "Enter splits comma separated free text into tags with reason \"selectOption\"",
    "duration": 171.91433400000005,
    "failureMessages": [],
    "meta": {},
    "tags": []
  }
]
```

scripts:
```json
[
  {
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason \"removeOption\"",
    "status": "notincluded"
  },
  {
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one",
    "status": "notincluded"
  },
  {
    "fullName": "Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason \"selectOption\"",
    "status": "notincluded"
  }
]
```

storybook:
```json
[
  {
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason \"removeOption\"",
    "status": "notincluded"
  },
  {
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one",
    "status": "notincluded"
  },
  {
    "fullName": "Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason \"selectOption\"",
    "status": "notincluded"
  }
]
```

coverage:
```json
[
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "multiple + chips (renderTags)"
    ],
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason \"removeOption\"",
    "status": "passed",
    "title": "clicking a chip delete icon removes it with reason \"removeOption\"",
    "duration": 273.98862499999996,
    "failureMessages": [],
    "meta": {},
    "tags": []
  },
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "multiple + chips (renderTags)"
    ],
    "fullName": "Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one",
    "status": "passed",
    "title": "ArrowLeft from the empty input moves focus to the last chip, then the previous one",
    "duration": 328.7212920000002,
    "failureMessages": [],
    "meta": {},
    "tags": []
  },
  {
    "ancestorTitles": [
      "Autocomplete MUI contract",
      "splitCommaTag"
    ],
    "fullName": "Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason \"selectOption\"",
    "status": "passed",
    "title": "Enter splits comma separated free text into tags with reason \"selectOption\"",
    "duration": 290.6394170000003,
    "failureMessages": [],
    "meta": {},
    "tags": []
  }
]
```

Actual bounded commands:
```text
["bash", "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/selftest.sh"]
["bash", "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/suite-selftest.sh"]
["bash", "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/coverage-selftest.sh"]
["node", "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/scripts-project-selftest.mjs"]
["/opt/homebrew/opt/python@3.14/bin/python3.14", "-m", "unittest", "discover", "-s", "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates", "-p", "test_bounded_runner.py"]
["bash", "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/gates.sh", "s4a-node-final-6fdf3f4bf3024f75b875e04d361da310"]
["node", "node_modules/typescript/bin/tsc", "-p", "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/.tsconfig.s4a-popover.json"]
["node", "node_modules/vitest/vitest.mjs", "run", "--project", "spec", "--maxWorkers=1", "--no-file-parallelism", "--reporter=default", "--reporter=json", "--outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-node-final-6fdf3f4bf3024f75b875e04d361da310/spec-vitest.json"]
["node", "node_modules/vitest/vitest.mjs", "run", "--project", "scripts", "--maxWorkers=1", "--no-file-parallelism", "--reporter=default", "--reporter=json", "--outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-node-final-6fdf3f4bf3024f75b875e04d361da310/scripts-vitest.json"]
["node", "node_modules/vitest/vitest.mjs", "run", "--project", "storybook", "--maxWorkers=1", "--no-file-parallelism", "--reporter=default", "--reporter=json", "--outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-node-final-6fdf3f4bf3024f75b875e04d361da310/storybook-vitest.json"]
["env", "VANGUARD_V8_COVERAGE=1", "node", "node_modules/vitest/vitest.mjs", "run", "--project", "spec", "--project", "storybook", "--maxWorkers=1", "--no-file-parallelism", "--coverage", "--coverage.provider=v8", "--coverage.include=src/core/AIAssistant/AIAssistentPanel/AIAssistantPanel.tsx", "--coverage.include=src/core/Accordion/Accordion.tsx", "--coverage.include=src/core/AppBar/AppBar.tsx", "--coverage.include=src/core/Autocomplete/Autocomplete.tsx", "--coverage.include=src/core/AutocompleteWithAnchor/AutocompleteWithAnchor.tsx", "--coverage.include=src/core/Button/Button.tsx", "--coverage.include=src/core/Collapse/Collapse/Collapse.tsx", "--coverage.include=src/core/DatePicker/DatePicker.tsx", "--coverage.include=src/core/DateRangeInput/DateRangeInput.tsx", "--coverage.include=src/core/DateRangePicker/DateRangePicker.tsx", "--coverage.include=src/core/DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/DateRangePickerBaseInputAdornment.tsx", "--coverage.include=src/core/Documents/DocumentDisplay/DocumentDisplay.tsx", "--coverage.include=src/core/Documents/DocumentUpload/DocumentUpload.tsx", "--coverage.include=src/core/Drawer/Drawer.tsx", "--coverage.include=src/core/DropdownMenu/DropdownMenu.tsx", "--coverage.include=src/core/FlagAdornment/FlagAdornment.tsx", "--coverage.include=src/core/FormControl/FormControl.tsx", "--coverage.include=src/core/Input/Input.tsx", "--coverage.include=src/core/List/ListShowMore/ListShowMore.tsx", "--coverage.include=src/core/Menu/Menu.tsx", "--coverage.include=src/core/MenuItem/MenuItem.tsx", "--coverage.include=src/core/Popover/Popover.tsx", "--coverage.include=src/core/Popover/PopoverPopper/PopoverPopper.tsx", "--coverage.include=src/core/PopoverModal/PopoverModal.tsx", "--coverage.include=src/core/ProgressBar/ProgressBar.tsx", "--coverage.include=src/core/SearchableSelect/SearchableSelect.tsx", "--coverage.include=src/core/Select/Select.tsx", "--coverage.include=src/core/Slider/Slider.tsx", "--coverage.include=src/core/Snackbar/Snackbar.tsx", "--coverage.include=src/core/SnackbarRoot/SnackbarRoot.tsx", "--coverage.include=src/core/ToggleButton/ToggleButton.tsx", "--coverage.include=src/core/ToggleButtonGroup/ToggleButtonGroup.tsx", "--coverage.include=src/core/Toolbar/Toolbar.tsx", "--coverage.include=src/core/_internal/InputBase/InputBase.tsx", "--coverage.include=src/helpers/hex-to-rgba.ts", "--coverage.reportOnFailure", "--coverage.reporter=json", "--coverage.reporter=json-summary", "--coverage.reporter=text", "--coverage.reportsDirectory=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-node-final-6fdf3f4bf3024f75b875e04d361da310/coverage", "--coverage.thresholds.perFile", "--coverage.thresholds.lines=95", "--coverage.thresholds.branches=85", "--reporter=default", "--reporter=json", "--outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4a-node-final-6fdf3f4bf3024f75b875e04d361da310/coverage-vitest.json"]
["env", "PACKAGE_FIXTURE_OUT=/tmp/mui-upgrade/s4a-node-final-package", "bash", "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/package-fixture/run.sh"]
```

Verdict RED STOP for required package runtime evidence missing; root/overseer disposition required.


## Authorized counts-only correction and one fresh package run (2026-11-05)

Scope: validator/gate/docs only; no source/config/dependency or frozen fixture edits, no snapshot resets. This is a handoff for ROOT final overseer, not S4a acceptance or S4b.

Correction of earlier worker verdict: the previous “required package runtime evidence missing” STOP was FALSE RED caused by a validator expectation error, not product RED. Default consumers correctly run five tests (the fifth is default-only packed DatePicker); WP consumers run four. Expected aggregate is 5 + 5 + 4 + 4 = 18, never 18 per consumer. Previous raw/reported -15 at 423.71583475 seconds was worker termination, timeout false; preserve it as aborted history, without a flake claim. Its actual package.log proves default-declared and default-mui each passed 5 before termination; wp-declared had started. All genuine earlier Toggle/Popover/script-coverage RED history remains intact.

Before any gate edits, independently compared 5,323 existing non-generated hashes to the last after-snapshot: no differences (`out/s4a-counts-final/independent-input-comparison.json`). Before the fresh run, complete candidate snapshot comparison also checked additions: only six authorized gate files changed/added (`gate-input-delta.json`). Product inputs unchanged; reuse prior GREEN infrastructure/static/types, UI spec 1722, scripts 20, Storybook 1292, and fresh mapped coverage 35 files meeting 95% lines/85% branches from `out/s4a-node-final-6fdf3f4bf3024f75b875e04d361da310`. No new normal suites or coverage runs were needed. Prior last-normal spec C1 and coverage C1 actual records are retained there unchanged; package consumers do not include Autocomplete C1: notincluded, no invented durations.

Validator TDD (not product bug): first ran `python3 -m unittest discover -s agentic-plans/mui-upgrade-gates -p test_package_counts.py` against an explicit permissive scaffold modeling the old lack of enforcement. RED: 32 assertion failures (ValueError not raised), unittest exit 1; not a MissingModule failure. Implemented count guard, same command GREEN: one unittest covering all 32 bad cases, exit 0. Raw logs: `out/s4a-counts-final/counts-red.log`, `counts-green.log`. These small selftests were invoked directly; the package run uses the bounded runner. Cases cover each consumer off by one in either direction, missing log, failed/skipped/malformed/duplicate summaries. Correct 5/5/4/4 yields aggregate 18. `package.sh` calls the byte-unchanged frozen run.sh with original arguments, preserves its nonzero exit, then validates actual smoke.log files and emits structured runtime-counts.json. Both canonical callers use the mandatory wrapper and count selftest; README documents both.

Reconciliation by name: previous spec 1742 = UI spec 1722 + scripts project 20, with no test dropped. Extracted all 20 passed fullNames and their three source paths directly from the previous scripts-vitest.json:

```json
[
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_codemod-button-sizes.spec.ts",
    "fullName": "codemod-button-sizes import forms recognises every supported Button import path",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_codemod-button-sizes.spec.ts",
    "fullName": "codemod-button-sizes import forms ignores other components whose module name contains Button",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_codemod-button-sizes.spec.ts",
    "fullName": "codemod-button-sizes type-only ButtonSizes imports turns an import-level type-only ButtonSizes into a value import",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_codemod-button-sizes.spec.ts",
    "fullName": "codemod-button-sizes type-only ButtonSizes imports drops the type modifier from a specifier-level type-only ButtonSizes",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_codemod-button-sizes.spec.ts",
    "fullName": "codemod-button-sizes type-only ButtonSizes imports keeps the local alias of a type-only ButtonSizes",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-public-imports.spec.ts",
    "fullName": "production MUI imports use public package entry points",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: import Button from '@mui/material/Button/Button'",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: import type { ButtonProps } from '@mui/material/Button/Button'",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: export { default } from '@mui/material/Button/Button'",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: const load = import('@mui/material/Button/Button')",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: const Button = require('@mui/material/Button/Button')",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: import Button from '@mui/material/esm/Button'",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: import Button from '@mui/material/modern/Button'",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: import Button from '@mui/material/esm'",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: import Button from '@mui/material/modern'",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: const config = { resolve: { alias: { button: '@mui/material/Button/Button' } } }",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: const config = { resolve: { alias: [{ find: 'button', replacement: '@mui/material/private' }] } }",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "rejects private MUI path: const config = { \"compilerOptions\": { \"paths\": { \"button\": [\"@mui/material/esm/Button\"] } } }",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "allows public MUI package and one-level entries",
    "status": "passed"
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/scripts/_mui-v7-public-imports.spec.ts",
    "fullName": "production and config MUI imports use public entries",
    "status": "passed"
  }
]
```

Fresh package invocation (exact argument array in `out/s4a-counts-final/command.json`): `env PACKAGE_FIXTURE_OUT=/tmp/mui-upgrade/s4a-counts-final-package bash agentic-plans/mui-upgrade-gates/package.sh`. Asserted output absent before invocation and PACKAGE_FIXTURE_TGZ unset; normal build/pack and all four isolated strict consumers, no skip-build/baseline/force/legacy/source aliases. One invocation only; no retry or deadline extension. bounded_runner.run timeout 1800, inhibit=True, serial, mach_continuous_time; start load, orphan PIDs 84651/85414/85417 and power assertions recorded in start-resources.txt. Those and unrelated processes/power settings left untouched. Final raw/reported/resource/audit results follow below when complete.

Limitations remain explicit: packed gated types and runtime checks do not waive broader root peer baseline defects, undeclared types, WordPress declaration defects, public runtime subpath coverage or browser policy limitations. No broad declaration/runtime waiver.

Final result: COUNTS GREEN, fresh fixture GREEN; supplemental package pin audit STOP (not ready for full GREEN handoff). All four consumers completed before validation, 5/5/4/4 aggregate18. No fixture retry. The supplemental auditor required top-level @mui/material in default-declared and stopped on its absence; this is an audit evidence/layout blocker, not a runtime product RED. No remediation or dependency edits attempted. React/Emotion manifests are available in every consumer with React/ReactDOM19.2.0, Emotion react11.14.0/styled11.14.1; top-level MUI material/system7.3.11 are available in the two explicit-MUI consumers. Required all-four MUI/pickers audit remains incomplete; no waiver. Full pin/path disposition is for ROOT.

Independent read-only partial audit verified all four packed current-build runtime/root declarations and all eight installed packed byte comparisons including WP; all four required gated type logs and default-MUI probe log are empty. `package-partial-audit.json` retains byte lengths/SHA256, tar SHA256 and available pins. Supplemental driver also shadowed its hash helper while executing the historical audit, so its finally hash capture errored; independently recaptured final hashes and frozen integrity without rerunning any gate. Frozen492 has exactly the one approved Toggle change, original490 exactly the three allowlisted changes, with approved before/after SHAs and unchanged snapshot hashes (`frozen-after.json`). Product inputs unchanged. Two analysis JSON build drifts are preserved in generated-before/after; final node canonical caller count correction is separately recorded as an authorized gate-only change. No normal C1 run added.

Actual bounded package process record:
```json
{
  "command": [
    "env",
    "PACKAGE_FIXTURE_OUT=/tmp/mui-upgrade/s4a-counts-final-package",
    "bash",
    "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/package.sh"
  ],
  "clock": "mach_continuous_time",
  "elapsed": 360.9131322083995,
  "wall_elapsed": 360.9192650318146,
  "raw_exit": 0,
  "reported_exit": 0,
  "timeout": false,
  "pid": 16193,
  "pgid": 16193,
  "inhibitor_pid": 16194,
  "inhibitor_reaped": true
}
```
Resource samples: `package-process.json.resources.json`; original start load/orphan/power observations: `start-resources.txt`. Task inhibitor reaped; no unrelated processes or power settings modified.

Tar SHA256: `94410ac82b6319080361f5a46138684b4887127987f0b559e678e25813b43d0c`.

Packed/installed byte audit:
```json
{
  "packed": {
    "dist/index.js": {
      "bytes": 22791,
      "sha256": "e2aaa75039d8d46f2ade9bd865ef081db84779f5a8f8475a42eaa9dd83147c51"
    },
    "dist/types/index.d.ts": {
      "bytes": 24831,
      "sha256": "61d4328b626b87e55a03037dd546f09bb34448eb7a3c2bdb008bf3912dc46ee4"
    },
    "dist-wordpress/index.js": {
      "bytes": 2555410,
      "sha256": "7a68296162bb5deb2def439b0b04a4eac333151eb95fa763e9f2c25a9a6f8f7e"
    },
    "dist-wordpress/types/index.d.ts": {
      "bytes": 6814,
      "sha256": "5ccd44b8606ffa334ff7cc77aa3d1076b07f90df156906265c470b3d030579b6"
    }
  },
  "installed": {
    "default-declared": {
      "index.js": {
        "bytes": 22791,
        "sha256": "e2aaa75039d8d46f2ade9bd865ef081db84779f5a8f8475a42eaa9dd83147c51"
      },
      "types/index.d.ts": {
        "bytes": 24831,
        "sha256": "61d4328b626b87e55a03037dd546f09bb34448eb7a3c2bdb008bf3912dc46ee4"
      }
    },
    "default-mui": {
      "index.js": {
        "bytes": 22791,
        "sha256": "e2aaa75039d8d46f2ade9bd865ef081db84779f5a8f8475a42eaa9dd83147c51"
      },
      "types/index.d.ts": {
        "bytes": 24831,
        "sha256": "61d4328b626b87e55a03037dd546f09bb34448eb7a3c2bdb008bf3912dc46ee4"
      }
    },
    "wp-declared": {
      "index.js": {
        "bytes": 2555410,
        "sha256": "7a68296162bb5deb2def439b0b04a4eac333151eb95fa763e9f2c25a9a6f8f7e"
      },
      "types/index.d.ts": {
        "bytes": 6814,
        "sha256": "5ccd44b8606ffa334ff7cc77aa3d1076b07f90df156906265c470b3d030579b6"
      }
    },
    "wp-mui": {
      "index.js": {
        "bytes": 2555410,
        "sha256": "7a68296162bb5deb2def439b0b04a4eac333151eb95fa763e9f2c25a9a6f8f7e"
      },
      "types/index.d.ts": {
        "bytes": 6814,
        "sha256": "5ccd44b8606ffa334ff7cc77aa3d1076b07f90df156906265c470b3d030579b6"
      }
    }
  },
  "types": {
    "default-declared": {
      "required_gated_empty": true
    },
    "default-mui": {
      "required_gated_empty": true,
      "mui_probes_empty": true
    },
    "wp-declared": {
      "required_gated_empty": true
    },
    "wp-mui": {
      "required_gated_empty": true
    }
  }
}
```

No acceptance, PR, commit, push or CR was performed. ROOT final overseer handoff is blocked on the supplemental MUI/pickers pin audit evidence; counts-only implementation and the single fresh package gate are complete.

## Root closure of supplemental pin-audit expectation — ready for overseer

Read-only root inspection closes the supplemental pin/layout blocker; no product/gate rerun, dependency or fixture changes. The supplemental auditor incorrectly required external MUI in declared-only consumers. This is the same fixture distinction explicitly documented in accepted S3: declared-only consumers intentionally have no external Material/System; MUI-present consumers install Material/System; pickers is bundled, not an external consumer dependency. Missing paths there are expected, not missing evidence or a new waiver.

Root independently verified actual source installed Material/System7.3.11,pickers7.29.4; packed manifest dev pins identical. Both default-mui and wp-mui have installed Material/System7.3.11. All four consumers have React/DOM19.2.0 and EmotionReact11.14.0/Styled11.14.1. External pickers absent in all four by design; Material/System absent only in declared-only consumers. Exact observed path/version matrix retained in out/s4a-counts-final/root-pin-audit.json. Strict installs, existing required MUI declaration probes,18runtime and bytes proof retain their narrower meaning; no universal peer/type/subpath health claim.

Fresh canonical package process actual raw/reported0,360.913132continuous seconds. Runtime counts5/5/4/4 aggregate18 match runtime-counts.json. Root rehashed tarSHA94410ac82b6319080361f5a46138684b4887127987f0b559e678e25813b43d0c. Four packed/current-build and eight installed/packed byte comparisons and required type logs remain verified in package-partial-audit.json (file name historical; observations valid). git diff --check0.

S4a evidence complete for overseer assessment: unchanged-candidate Node-project full validation infrastructure/static/extra types/spec1722+scripts20+storybook1292=3034PASS and fresh coverage3014PASS/all35thresholds; authorized count-gate selftest RED/GREEN and fresh whole package0. Previous validator false count stop and supplemental false path assumption retained explicitly, alongside genuine upstream ToggleButton change, Popover styled-default regression and script coverage timeouts. No earlier RED erased. No more review/run requested for this read-only evidence correction. S4a not accepted yet; S4b blocked pending overseer. No commits/pushes/PRs/posted CR.
