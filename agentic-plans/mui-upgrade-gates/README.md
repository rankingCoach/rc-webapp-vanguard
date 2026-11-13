# MUI upgrade gates

Run from the repo root. Outputs go to `agentic-plans/mui-upgrade-gates/out/<label>/` (do not commit `out/`).

| script | checks | pass rule |
|---|---|---|
| `gates.sh <label>` | `tsc -p tsconfig.app.json`, `tsc -p tsconfig.lib.json`, `tsc-contract.sh`, `eslint src` | no error that is not in `baseline/` (master 95ee244: tsc app 1001, tsc lib 4, eslint 1319 errors); contract tests 0 errors |
| `suite.sh <label> [runs]` | `vitest --project spec`, then `--project scripts`, then `--project storybook`, sequentially, `runs` times (default 2) | every raw run fully green |
| `coverage.sh <label>` | combined spec/browser V8 coverage over `coverage-files.json` | each file >=95% lines and >=85% branches; only the documented unreachable PopoverModal handlers are excluded |
| `suite-selftest.sh` | bounds all three projects to one worker and retains raw failure exits | all assertions pass |
| `selftest.sh` | compiler-crash rejection and healthy tool execution | all assertions pass |
| `package.sh` | builds, packs and installs both bundle variants in isolated consumers | gated declarations and runtime smokes pass; baseline declaration defects measured separately |
| `tsc-contract.sh` | type-checks `_*.mui.spec.*`, `_*MuiContract.stories.tsx` with bundler resolution | 0 errors |

Rules:

1. Only one gate runner at a time. No other vitest/Chromium run in parallel: `suite.sh` logs how many such
   processes existed before it started, and the load average before and after each project.
2. A red raw run is red. `suite.sh` reruns failing files alone only to diagnose (deterministic vs load-only), and
   prints both results. It never turns a run green.
3. Baselines in `baseline/` were taken on master 95ee244 (MUI 5.16.14, pickers 5.0.16). Re-baseline only if
   master changes, never to absorb errors from this branch.

`coverage.sh` sets `VANGUARD_V8_COVERAGE=1`: this omits Storybook's Istanbul instrumentation and inherited legacy
TypeScript transform for that run. Vite handles TypeScript with source maps. Mixing those transforms with V8
previously reported uncovered statements inside erased interfaces. Detailed `coverage-final.json` is retained
alongside the summary for branch diagnosis. See `verification-s0-bounded.md` for focused red/green evidence.

The sole S0 source exception is in `PopoverModal.tsx`: `handleMouseEnter` (current80–84),
`handleMouseLeave` (89–93), and `handleClick` (98–102). These declarations have no references or JSX attachments.
Their three separate ignore regions exclude no reachable handlers/effects/rendering. Original regions77–81,
83–87,89–93 contained six uncovered executable lines78–79,84–85,90–91 and seven branch entries/14 slots.
Remove the relevant annotation and add behavioral tests if any handler becomes reachable. See
`verification-s0-exception.md` for original/adjusted coverage, exact map audit and reachable-code negative control.

Suspend-aware runner: `python3 agentic-plans/mui-upgrade-gates/bounded_runner.py
--timeout 1800 --result /tmp/result.json --log /tmp/command.log --inhibit-idle -- command arg ...`.
Use a single line. Commands are argument arrays, without shell evaluation. Darwin uses
`mach_continuous_time` with `mach_timebase_info`; Linux uses CLOCK_BOOTTIME. Unsupported
platforms fail closed. Both include suspend; no monotonic fallback is asserted to do so.
Deadline checks follow completion and reap; overdue completed children retain raw exit
but report 124. Active deadlines TERM the newly owned session/group, allow up to five
continuous seconds, then KILL only that group. Result JSON is atomically replaced after
fsync; resource snapshots are sampled every 15 seconds while active. Task-scoped Darwin
`caffeinate -i -w PID` records the owned PID and inhibitor PID, is reaped on completion,
and prevents idle sleep only. No global power setting is changed.

Regression: `python3 -m unittest discover -s agentic-plans/mui-upgrade-gates -p test_bounded_runner.py`.
Fresh serial validation: `python3 agentic-plans/mui-upgrade-gates/final-validation.py`.
This runs each normal suite project once directly, avoiding historical suite.sh's
legacy watchdog and isolated diagnostic reruns. It stops immediately on a failing gate.

`scripts-project-selftest.mjs` resolves installed Vitest projects and their actual test file lists, checks all three normal/watch commands, and verifies project-only component coverage. Included in the final selftest batch.

scripts specs moved to node project: not UI code, no UI setup; still mandatory in pnpm test/gates; excluded from component coverage gate by project, not by file filter.

Canonical package gate: `bash agentic-plans/mui-upgrade-gates/package.sh` (mandatory wrapper around the unchanged frozen fixture). Mandatory validator selftest: `python3 -m unittest discover -s agentic-plans/mui-upgrade-gates -p test_package_counts.py`. Expected runtime tests: default-declared 5, default-mui 5, wp-declared 4, wp-mui 4; aggregate 18. The default-only fifth test exercises the packed DatePicker. Missing, duplicate, malformed, failed, skipped or off-by-one summaries fail closed. Fixture nonzero exits are preserved. `runtime-counts.json` records each consumer and aggregate.

Sleep validity: bounded_runner records mach_continuous_time plus mach_absolute_time elapsed values on
Darwin and pmset Sleep/Wake/DarkWake lines in the run window. A continuous-minus-absolute gap greater
than5seconds or any Sleep event makes outcome/validity SLEEP-INVALID (reported exit125, raw child exit
preserved). Such a run is neither PASS nor RED evidence. Clamshell sleep is not prevented by the scoped
idle inhibitor; never change global power settings. Heavy runs require an awake host (display on and no
Sleep event for at least5minutes). Synthetic sleep-delta regression lives in test_bounded_runner.py.

## Master synchronization: TS7 / Biome

After the authorized f02d3f5 sync, `gates.sh` uses master's native TS7 CLI and Biome
JSON. `baseline/master-ts7/` contains clean-master diagnostics; historical TS5.9 /
ESLint baselines stay preserved. Error counts remain per file/rule, and compiler
crashes plus absent, malformed or incomplete lint output fail. The contract harness
removes TS7's obsolete `baseUrl`; include patterns and inherited paths are unchanged.
TypeScript-API import guards use master's `typescript5` alias. See
`s5b-master-sync-gates.md` for the complete invocation and revalidation inventory.

## Tiered test policy (after the post-sync full capture)

Use `tiered-tests.py`; all execution goes through bounded_runner, with continuous
and active clocks, sleep invalidation and one owned process group at a time. A
nonzero, timeout, sleep-invalid result, unexpected skip or C1 trigger stops the
run. There is no automatic retry. Historical RED artifacts are never overwritten.

1. **Inner loop:** compare SHA256 input manifests against the last component/stage
   GREEN, including uncommitted files. Do not use git --changed. Resolve and record
   the actual installed Vitest related graph, then run `vitest related <files>
   --run --project spec --project storybook`; include scripts only when scripts/
   changed. Run the static gate. Shared source/config/dependency changes force
   Tier 3. Deleted files also force Tier 3 because their former imports cannot be
   safely reconstructed from the current graph.
2. **After RED and a fix:** use the last JSON report's failing FILES, never nested
   describe/suite counts. Run only those files; after GREEN, finish Tier 2 for the
   component before promoting its manifest. This never relabels an earlier RED.
3. **Component done (Tier 2):** run every discovered spec/story in the component
   folder plus related tests for all its source files, including transitive
   dependents. Promote the recorded manifest only after runtime and static GREEN.
4. **Stage end (Tier 3):** one full attempt after fresh review. Selftests, static,
   scripts, isolated non-coverage C1 (only the three watched Autocomplete tests),
   full combined spec+storybook V8 coverage, then build/package and stage audits.
   Coverage is the full runtime pass/fail source; no separate full uninstrumented
   spec or Storybook pass. C1 must stay below 2500 ms. All 35 mapped files remain
   at 95% lines / 85% branches. Coverage scope stays by project, no file exclusions.
   Zero failed tests, zero uncaught exceptions and zero unexpected skips are required.

Shared triggers include test-utils/setup, .storybook, theming/styles, production
InputBase/internal wrappers, package/lock, pnpm hook, TS/Biome/Vitest/Vite config,
and gate implementation. Editing an internal test itself is a leaf test change.
Evidence/report-only edits do not select tests. Generated analysis JSON and build
info are recorded separately and are not input changes.

The package gate runs when src, package/lock or build config differs from the
last package-GREEN (or none exists). Otherwise the build still runs. Smoke counts
remain default-mui 5, default-declared 5, wp-declared 4, wp-mui 4: aggregate 18.
The stage audit command is mandatory: it must check the stage's exact build-warning
inventory, TS/WP diagnostics, bytes/pins and frozen proofs. Tier 3 alone does not
waive any of those checks. The runner exposes MUI_GATE_OUT and PACKAGE_FIXTURE_OUT.

Examples (run from repository root; use fresh evidence directories):

```sh
python3 agentic-plans/mui-upgrade-gates/tiered-tests.py inner --baseline /path/to/GREEN-manifest.json --out agentic-plans/mui-upgrade-gates/out/inner-new
python3 agentic-plans/mui-upgrade-gates/tiered-tests.py failed --baseline /path/to/GREEN-manifest.json --failed-report /path/to/last-tests.json --component src/core/Example --out agentic-plans/mui-upgrade-gates/out/fix-new
python3 agentic-plans/mui-upgrade-gates/tiered-tests.py component --baseline /path/to/GREEN-manifest.json --component src/core/Example --out agentic-plans/mui-upgrade-gates/out/component-new
python3 agentic-plans/mui-upgrade-gates/tiered-tests.py stage --baseline /path/to/GREEN-manifest.json --package-green /path/to/package-GREEN-manifest.json --audit-command /path/to/stage-audit-argv.json --out agentic-plans/mui-upgrade-gates/out/stage-new
```

A snapshot by itself is not GREEN proof. `snapshot --baseline <file>` records input
hashes only. Only component/stage success emits GREEN-manifest.json; a successful
inner/failed-only run explicitly requires Tier 2 next. Shared changes are escalated
to Tier 3, never silently treated as leaf changes.

Selection selftest uses installed Vitest resolution on a leaf, its own spec/story,
transitive dependent spec/story, and an unrelated test. Shared-module changes must
force Tier 3. It is part of selftest.sh. result-files-selftest.cjs independently
proves that nested failing describes in one file count as one failed file.

Expected saving at each stage end is about 200 + 347 = 547 seconds (roughly nine
minutes) of duplicate full uninstrumented passes, minus the small isolated C1 run.
This is an estimate from the prior sequence, not a timing promise. All stage
handoffs still require one full Tier-3 GREEN. The first post-sync full capture is
explicitly exempt from deduplication because the lock and toolchain changed.

### Lint exit criteria supersede the temporary sync allowance

The user's lint-zero directive supersedes the earlier 24-identity test-harness
allowance. Final `pnpm lint:err` must exit 0 for all src files, including master's
42 errors. No suppressions or team rule changes. Warnings introduced by the MUI
work must also be fixed; pre-existing warnings are outside this task. Lint-only
frozen-file refactors need whole-file assertion/title byte proofs and identical
passing fullNames before/after. Master's fixes are a separately documented change
set in ../lint-cleanup-changeset.md. The old exact-cap artifacts remain history,
not a final-release allowance.

Current static implementation enforces zero Biome errors and compares warning
identities by repository path, rule, message and occurrence cap against detached
master (848 warnings). Locations are normalized so equivalent hoists do not invent
new warning identities. Current846 removes two; it introduces none. Native
tsconfig.spec.json is now a permanent zero-error check alongside app/lib/contracts.
The old compare-biome.cjs/cap data remain historical tooling; gates.sh calls only
compare-clean-biome.cjs, so there is no live spec-error allowance.

S5b final evidence audit: `s5b-stage-audit.py` requires complete resolved file sets, 1777 spec +1292 Storybook cases and25 scripts, exact595/338 accepted build warning identities, clean TS diagnostics, retained WP baseline,35 thresholds and packed bytes/pins/type probes. `test_s5b_stage_audit.py` rejects missing/skipped evidence and source warnings. Package-count negative controls also run in Tier3.

User-directed warning filter supersedes the historical595/338 live build expectation: final visible MODULE_LEVEL_DIRECTIVE warnings must be0; all other identities equal clean master. Four exact mandatory scripts files now include scripts/_rollup-onwarn.spec.ts (9 cases); total34 Node tests. The original three files remain mandatory. Coverage scope is unchanged by project.


Packed consumers MUST be outside the worktree. The tiered runner always selects a
fresh `/tmp/mui-upgrade/<stage>-package` root, recorded in package-selection.json.
`package-isolation.py` walks every consumer ancestor through `/` and rejects any
ancestor node_modules/@mui or node_modules/react. A guard runs before build/pack;
a post-install createRequire probe requires MODULE_NOT_FOUND for material/system/
x-date-pickers in declared-only fixtures and own-node_modules resolution for all
three in MUI-present fixtures. The latter explicitly install the three exact repo
pins. No source aliases or ancestor dependency fallback are accepted. The guard
selftest proves an actual worktree fixture is rejected and tests clean/contaminated
ancestors plus absent/owned/missing MUI resolution.


Storybook builds share only aliases, CSS, esbuild/optimizeDeps and explicitly
required resolution/transform plugins. Library output settings, dts and asset-
analysis build plugins are excluded. Coverage is off in normal development and
static production builds. Set `VANGUARD_ISTANBUL_COVERAGE=1` for the two Istanbul
paths; `VANGUARD_V8_COVERAGE=1` always takes precedence and disables both.
The fifth mandatory Node file `scripts/_storybook-config.spec.ts` contributes
five cases (total42), protecting default isolation and explicit/V8 coverage modes.
