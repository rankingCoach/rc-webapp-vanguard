# S1 implementation and pending validation — 2026-11-04

S0 accepted by overseer as v5 characterization/gate baseline. All S0 histories and M5 limitations remain in their
reports. S1 is not accepted yet; no commit/push, version bump, slot API change, or MUI core/picker upgrade.

## Scope

- Emotion React11.0.0→11.14.0,Styled11.0.0→11.14.1, consistently in peerDependencies/devDependencies/lockfile.
  Public npm metadata verified these stable versions before changes.
- Removed lab5.0.0-alpha.77/styles5.3.0 after repo-wide hidden/config/source audit found no use beyond metadata.
- Six private imports in five source files now use public v5 entry points: AppBar,Toolbar,Autocomplete,
  TooltipClasses,Collapse,Fade. Existing public prop aliases and runtime exports remain intact.
- Added scripts/_mui-public-imports.spec.ts guard for production imports/re-exports into implementation files.
- Core/system remain5.16.14,pickers5.0.16. No legacy prop migrations in this stage.

## TDD evidence

1. Import guard first RED: expected empty violations, found all six current private imports. Command
   `pnpm vitest run --project spec scripts/_mui-public-imports.spec.ts --maxWorkers=1`, exit1.
   Raw `/tmp/mui-upgrade/s1-import-red.log`. After public-path replacements same command GREEN1/1, exit0,
   raw `/tmp/mui-upgrade/s1-import-green.log`.
2. Strict baseline peer reproduction used the genuine S0 packed tarball plus declared Emotion11.0.0 and
   Material5.16.14. Fresh consumer cwd `/tmp/mui-upgrade/s1-peer-red-strict`, command
   `npx --yes --registry=https://registry.npmjs.org npm@11.6.2 install --registry=https://registry.npmjs.org --ignore-scripts --strict-peer-deps --no-audit --no-fund`.
   RED exit1: ERESOLVE peerOptional EmotionReact^11.5.0, actual11.0.0. Raw `install.log` in that directory.
   Initial attempt with `--prefix` from the repository inherited its pre-existing legacy-peer-deps=true config
   and exited0; that result is invalid as strict evidence and retained separately in `s1-peer-red/install.log`.
   The corrected cwd-based strict failure above is the regression evidence.
3. GREEN strict consumer graph/type evidence is pending the normal packed-package fixture on newly built S1
   output. Baseline-v5 mode is forbidden for S1 acceptance.

`pnpm install --ignore-scripts` exit0 updated lockfile/local dependencies. Raw `/tmp/mui-upgrade/s1-install.log`.
`pnpm peers check` exit1 still reports existing development graph conflicts, including pickers5/React19,
ReactDOM19 and unrelated legacy packages. Raw `/tmp/mui-upgrade/s1-project-peers.log`. The old lockfile already
contains these React/picker/legacy versions. Do not call the entire development graph strict-peer-valid.
The mandatory isolated published-package consumers are checked separately with strict resolution and no
legacy-peer flags or inherited repository config. Pickers compatibility is addressed by the planned S2 bridge.

Remaining: sequential static, normal suites, mapped coverage, fresh builds/normal packed fixture (all four
strict consumers incl MUI-present probes), then fresh read-only reviewer and overseer verdict. No S0 waiver
carries into the S1 package gate, and no declared type diagnostics baseline is expanded.

## Serial S1 validation — 2026-11-04

Validation only in the existing release/mui-upgrade worktree. No production/test/dependency/gate changes, commits, pushes, delegation or external messages. No acceptance or next-stage decision.

- `bash agentic-plans/mui-upgrade-gates/selftest.sh`: exit **0**, 1.63 seconds; no timeout.
- `bash agentic-plans/mui-upgrade-gates/coverage-selftest.sh`: exit **0**, 0.29 seconds; no timeout.
- `bash agentic-plans/mui-upgrade-gates/gates.sh s1`: exit **0**, 44.50 seconds; no timeout.
- `bash agentic-plans/mui-upgrade-gates/suite.sh s1 1`: exit **1**, 156.31 seconds; no timeout.
- `bash agentic-plans/mui-upgrade-gates/coverage.sh s1`: exit **1**, 409.12 seconds; no timeout.
- `bash agentic-plans/mui-upgrade-gates/package-fixture/run.sh`: exit **0**, 1799.35 seconds; no timeout.

Exact commands, cwd, owned PID/PGID, timestamps and exit codes: `out/s1/*-process.json`.
Raw transcripts: `out/s1/{selftest,coverage-selftest,gates,suite,coverage,package}-run.log`, plus
`suite-spec-run1.log`, `suite-storybook-run1.log`, `summary.txt`; resources before/after each command:
`out/s1/*-resources-{before,after}.txt`. Controller retained at `/tmp/mui-upgrade/s1-validation/run.py`.
Each runner used its own session/process group with a 1800-second bound; no timeout or kill occurred.
Package completed in 1799.35 seconds, very close to that bound. Suite's existing per-project bounds stayed intact.

Static: app1001/lib4/lint1319 existing diagnostics, zero new; contract zero. Both self-tests passed.
Normal suite: spec94/95 files,1693/1694 tests; Storybook173/173 files,1290/1290 tests.
Raw spec failure: DropdownMenu contract > render and structure > items render as <li role="menuitem">
with module class, Text title, optional icon and selected state; `_DropdownMenu.mui.spec.tsx:116`,
`findByTestId` failed for the optional icon. Runner's diagnostic-only isolated file rerun passed22/22.
This does not erase the raw failure. Suite processes4 before/4 after. No full-suite retry.

Coverage: exit1,267 passed files/1 failed,2967 passed tests. OverlayStackingShowcase story failed importing
Storybook addon setup-file.js: “Vitest failed to find the runner.” Exact raw cause retained in coverage log.
All35 mapped files are present in coverage-summary.json and meet95% lines/85% branches; aggregate99.34%
lines/96.69% branches. Threshold success does not make the failed coverage run green. No gate/probe changes.

Normal package fixture (no baseline-v5, skip-build or reused TGZ): fresh both-bundle build, actual npm pack,
all four isolated npm11.6.2 strict installs passed; four runtime checks each (16 total); every required type gate
passed, including default/MUI healthy declarations. All four installed Emotion React11.14.0/Styled11.14.1.
Fresh tarball and consumer logs: `/tmp/mui-upgrade/s1-validation/package`.
`installed-audit.json` records tarball SHA256, exact installed pins and byte matches of installed runtime/root
 declarations to this tarball (WordPress lifecycle correctly moves dist-wordpress to dist).
Broader measured declaration diagnostics remain in each consumer's types-*-skip-*.log; this is not a universal
full-declaration or development-graph peer-validity claim. Original strict peer RED remains unchanged above.

Remaining findings for root review/overseer: raw normal-spec failure and coverage setup failure prevent a fully
green S1 gate. No acceptance bump. No production or test fix attempted in this validation-only role.

## Root diagnosis and test-runner fixes

The first raw normal suite and coverage runs remain RED. No production assertion was edited to make them pass.

- Coverage setup failure has a concrete preceding Vite diagnostic: newly discovered `react/jsx-dev-runtime`
  caused optimization and a page reload; Vitest warned the unexpected reload can invalidate the test runner.
  Added that runtime to the Storybook project's explicit `optimizeDeps.include` in `vitest.config.ts`.
- Normal suite previously launched unconstrained workers despite coverage being serialized. `suite-selftest.sh`
  initially RED (`UNBOUNDED SUITE`), then GREEN after both normal projects and isolated diagnostics received
  `--maxWorkers=1 --no-file-parallelism`. It verifies both bounded launches and retention of raw exit7/gate1.
- Focused unchanged DropdownMenu spec under bounded execution:22/22PASS,exit0. This is evidence for the next
  bounded full run, not reinterpretation of its original optional-icon timeout as green.
- Focused instrumented OverlayStackingShowcase with the new prebundle config:17/17PASS,exit0, no unexpected
  reload/new-dependency warning. Command uses VANGUARD_V8_COVERAGE=1,storybook project,single worker,no file
  parallelism,V8 and PopoverModal source include. Logs `/tmp/mui-upgrade/s1-prebundle-target.log`.

Only test-runner configuration/tooling changed here. Fresh S1 build/pack/strictconsumer results remain applicable;
no repeat build/package fixture is needed unless production/dependency files change. Updated static, normal
full suites and mapped full coverage are still required, then a fresh S1 reviewer and overseer verdict.


## Fresh serial runner-fixed S1 validation — 2026-11-04

Validation-only run in the existing `release/mui-upgrade` worktree. No source/test/dependency edits,
commits, pushes, subagents, external messages, rebuild, repack, or package-fixture rerun.
Requested `staticgates.sh` does not exist; the README's actual static entry point `gates.sh` was used.
All commands ran serially from the worktree root, in this order:

| Exact command | Result | Elapsed |
| --- | --- | --- |
| `bash agentic-plans/mui-upgrade-gates/selftest.sh` | exit0 | 1.21s |
| `bash agentic-plans/mui-upgrade-gates/coverage-selftest.sh` | exit0 | 0.30s |
| `bash agentic-plans/mui-upgrade-gates/suite-selftest.sh` | exit0 | 0.45s |
| `bash agentic-plans/mui-upgrade-gates/gates.sh s1-runner-fixed` | exit0 | 28.05s |
| `bash agentic-plans/mui-upgrade-gates/suite.sh s1-runner-fixed 1` | both raw projects exit0; SUITE GATE PASS | 12:01:15–12:08:40 |
| `bash agentic-plans/mui-upgrade-gates/coverage.sh s1-runner-fixed` | exit0 | 379.39s |

Static: app1001/lib4/lint1319 existing diagnostics, zero new; contract0. Self-tests all PASS, including
bounded launches and raw exit7 rejection. Normal suite: spec95/95 files,1694/1694 tests; Storybook173/173
files,1290/1290 tests. Combined **268 files/2984 tests PASS**, as expected with the public-import guard.
No normal suite retry or isolated diagnostic was needed. Original raw RED runs in `out/s1` remain RED.

Coverage: **268 files/2984 tests PASS**; all **35/35 mapped files** meet **95% lines/85% branches**.
Aggregate99.34% lines,96.69% branches. Exact per-file results: `out/s1-runner-fixed/mapped-coverage-audit.json`;
raw and detailed V8 reports: `out/s1-runner-fixed/coverage/`. The three approved unreachable PopoverModal
handler regions remain the only documented source exception; no exclusions, thresholds or baselines changed.
Inspected normal and coverage logs contain no unexpected reload, newly optimized/new dependency, or
missing-runner message. Existing esbuild comparison and public-asset path warnings remain in raw logs.

Evidence directory: `out/s1-runner-fixed/`: `*-run.log`, `suite-{spec,storybook}-run1.log`, `summary.txt`,
`*-process*.json`, and `*-resources-{before,after}.txt`. Controllers:
`/tmp/mui-upgrade/s1-validation/{runner-fixed,resume-fixed}.py`. Each command received its own process group
and <=1800s outer watchdog; suite also retains1200s per-project bounds. No timeout or kill occurred.
Four pre-existing Chromium processes were left untouched; suite reports4 before/4 after.

Capture limitation: a user/tool interruption killed the original Python controller while the suite continued.
Its original shell PID/PGID54275 and Storybook PGID54787 were retained, the remaining outer deadline restored,
and coverage started only after that original suite finished. Both project raw exit0 values and final PASS
are captured in `summary.txt`; the orphaned suite shell's OS exit could not be reaped by the replacement
controller and is explicitly recorded as null in `suite-process-interruption.json`, not invented as exit0.
No duplicate suite run was launched. Suite resource-before capture predates interruption; resource-after
capture was recovered after completion.

Integrity comparison:5129 source/test/config/dependency files unchanged during validation; manifest
`/tmp/mui-upgrade/s1-validation/runner-fixed-input-hashes.json`, result `out/s1-runner-fixed/input-integrity.json`.
Unchanged package GREEN evidence remains `/tmp/mui-upgrade/s1-validation/package/`, prior transcript
`out/s1/package-run.log`, and `out/s1/package-process.json`: all4 strict isolated consumers,16 runtime checks,
required type gates including MUI-present, EmotionReact11.14.0/Styled11.14.1 and packed-byte matches.
Retained TGZ SHA256 rechecked against `installed-audit.json`:
`308d5e24707f2b5cf2c377148169f8fea7654674350088746b52e84ae9994701` (matches).
No build/dependency/source change required repeating that fixture.

S1 is **not accepted** by this validation report. Fresh reviewer and overseer review remain required;
no MUI bump or next-stage action was taken.
