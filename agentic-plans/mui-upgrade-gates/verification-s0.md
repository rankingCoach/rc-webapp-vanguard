# S0 remaining verification — 2026-11-03

S0 **NOT ACCEPTED**. No MUI bump. Only gate tooling and this report changed by this worker; no production/test edits, commits, pushes, subagents or channel messages. All commands ran in the existing release/mui-upgrade worktree. Baseline suite/package fixture were not rerun.

## Commands and exits (serial)

1. `bash agentic-plans/mui-upgrade-gates/gates.sh s0-verified`: **1**. Initial raw transcript `out/s0-verified/static-initial-run.log`; app compiler diagnostics incorrectly classified as infrastructure failure because TypeScript legitimately returned 1.
2. Isolated diagnostic: `./node_modules/.bin/tsc -p tsconfig.app.json --noEmit`: **1**, same baseline diagnostics (`tsc-app-direct.raw.txt`, `tsc-app-direct-exit.txt`). Local TypeScript `_tsc.js:128845` identifies exit 1 as DiagnosticsPresent_OutputsSkipped.
3. Extended `selftest.sh`: **RED 1 → GREEN 0** (`selftest-red.log`, `selftest-green.log`). Baseline diagnostic exit 1 now accepted; compiler/contract crash 137 remains rejected; healthy tools accepted. Gate now accepts diagnostic exits 1/2 only with TS diagnostics; no baseline changed.
4. Corrected `bash agentic-plans/mui-upgrade-gates/gates.sh s0-verified`: **1** (`static-run.log`, `static-exit.txt`). App **1001 errors / 0 new**, lib **4 / 0 new**, contract **0**. Lint **1320 vs 1319**, one new error: `src/core/DatePicker/_DatePicker.mui.spec.tsx:908:66–68`, `require-await`, "Async arrow function has no 'await' expression." Left for parent because this worker may not edit tests.
5. `bash agentic-plans/mui-upgrade-gates/coverage.sh s0-verified`: **1** (`coverage-run.log`, `coverage-exit.txt`). Duration **1213.35s**. Exact summary: **9 failed | 82 passed (262) files; 12 failed | 1733 passed (1856) tests; 6 errors**. Incomplete execution, not a completed suite.
6. Gate-only `coverage-selftest.sh`: **RED 1 → GREEN 0** (`coverage-selftest-red.log`, `coverage-selftest-green.log`). Stub runner verifies all 35 includes, thresholds 95% lines/85% branches, bounded workers, report-on-failure and propagation of nonzero exit 7. Added `--maxWorkers=1 --no-file-parallelism --coverage.reportOnFailure` to coverage runner. **Full coverage was not rerun**: the original red run remains red, per instruction against retrying suites to hide failure. Updated runner needs a fresh authorized execution.

## Resources

No competing Vitest/headless suite observed at start; unrelated IDE Chromium helpers left untouched. No processes killed. Resource snapshots retained in `resources-before.txt`, `resources-coverage-before.txt`, `resources-after.txt`. Static start load **9.94 / 16.79 / 18.40**, free memory **51%**. Coverage start **5.24 / 10.22 / 14.70**, free memory **50%**; after **131.96 / 43.27 / 26.44**, free memory **49%**. Timestamps show a wall-clock adjustment during the session; Vitest duration is reported independently. High load and worker failures support resource contention as a hypothesis, not proof that assertions are flakes.

## Coverage limitations and remaining work

**No coverage directory or JSON summary was emitted. All 35 per-file percentages and uncovered line/branch ranges are UNKNOWN.** Default report-on-failure behavior prevented a report; worker failures also made execution incomplete. No threshold was lowered and no exception/skip added. The explicit 35-file list remains unchanged. A bounded fresh coverage run is required before per-file gate acceptance. Existing old aggregate baseline 84.55% lines / 68.76% branches is historical only and cannot substitute for this run.

Fresh uninstrumented baseline already passed **1693 specs + 1290 browser tests** (`out/s0-resumed`). Historical plan already mentions instrumentation flakes in Button muted/focus, Tabs RTL and codemod; this does not establish the exact current failures as pre-existing. All other instrumented failures below are unclassified, with no isolated assertion retries performed.

Known package baseline-v5 result remains limited PASS: default/WordPress runtime 4/4 each and gated types 0. MUI-present strict Emotion 11.0 vs MUI 5.16.14 ^11.5 peer conflict remains an S0 defect requiring S1 Emotion bump. Button.size any mutation proof previously red/restored green. See package-fixture README for retained evidence.

## Exact raw failures

Source locations below are as reported by Vitest (browser source-map locations may point to nearby lines). Full assertion DOM output remains in `out/s0-verified/coverage-run.log`.

### FAIL  |storybook (chromium)| src/core/Button/_Button.stories.tsx > Button Muted States

AssertionError: 
expected '1' to be '0' // Object.is equality

 ❯ src/core/Button/stories/ButtonMutedStates.story.tsx:128:94

### FAIL  |storybook (chromium)| src/core/Tabs/_TabsVisual.stories.tsx > Overflow Scroll Floating

AssertionError: 
expected 800 to be less than or equal to 1

 ❯ src/core/Tabs/stories/OverflowScroll.story.tsx:91:70

### FAIL  |storybook (chromium)| src/core/Tabs/_TabsVisual.stories.tsx > Overflow Scroll Rtl

AssertionError: 
expected 905 to be less than or equal to 1

 ❯ src/core/Tabs/stories/OverflowScroll.story.tsx:85:102

### FAIL  |spec| scripts/_codemod-button-sizes.spec.ts > codemod-button-sizes type-only ButtonSizes imports > turns an import-level type-only ButtonSizes into a value import

Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".

 ❯ scripts/_codemod-button-sizes.spec.ts:91:3

### FAIL  |spec| src/core/Autocomplete/_Autocomplete.mui.spec.tsx > Autocomplete MUI contract > object options: optionKey / getOptionLabel / isOptionEqualToValue > [bug-lock] numeric options render empty labels and a selected 0 is never marked selected

Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".

 ❯ src/core/Autocomplete/_Autocomplete.mui.spec.tsx:861:5

### FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: minDate / maxDate / disablePast > minDate/maxDate = 0 means "no limit"

Error: Test timed out in 20000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".

 ❯ src/core/DatePicker/_DatePicker.mui.spec.tsx:631:4

### FAIL  |spec| src/core/DateRangePicker/_DateRangePicker.mui.spec.tsx > DateRangePicker contract: date view > [bug-lock] typing into the IMask field loses the typed start day, keeps the typed end day

Error: Test timed out in 20000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".

 ❯ src/core/DateRangePicker/_DateRangePicker.mui.spec.tsx:476:3

### FAIL  |spec| src/core/DateRangePicker/_DateRangePicker.spec.tsx > DateRangePicker component tests > datepicker with click on start & end date

Error: Timed out in waitFor.

 ❯ src/core/DateRangePicker/_DateRangePicker.spec.tsx:34:11
 ❯ src/core/DateRangePicker/_DateRangePicker.spec.tsx:137:5

### FAIL  |spec| src/core/Menu/_Menu.mui.spec.tsx > Menu (MUI Menu) contract > focus > autoFocus={false}: no menu item receives focus on open

Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".

 ❯ src/core/Menu/_Menu.mui.spec.tsx:464:5

### FAIL  |spec| src/core/TimePicker/_TimePicker.mui.spec.tsx > TimePicker > the open menu holds an OverlayStackingService slot

Error: Test timed out in 20000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".

 ❯ src/core/TimePicker/_TimePicker.mui.spec.tsx:98:3

### FAIL  |spec| src/core/DropdownMenu/_DropdownMenu.mui.spec.tsx > DropdownMenu (MUI Popper + MenuList) contract > close triggers (toggleIsOpen) > Escape calls toggleIsOpen and the menu unmounts after the Fade

AssertionError: expected <div …(5)><div …(1)>…(2)</div></div> to be null

 ❯ src/core/DropdownMenu/_DropdownMenu.mui.spec.tsx:61:84

### FAIL  |spec| src/core/List/ListShowMore/_ListShowMore.mui.spec.tsx > ListShowMore MUI contract: expand / collapse > "Show less" hides the overflow items again; they stay mounted

Error: expect(element).not.toBeVisible()
Received element is visible:
  <span />

 ❯ src/core/List/ListShowMore/_ListShowMore.mui.spec.tsx:78:64

## Unhandled infrastructure errors

```text
Error: [vitest-pool]: Failed to start forks worker for test files /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/AutocompleteWithAnchor/_AutocompleteWithAnchor.mui.spec.tsx.
Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
Error: [vitest-pool]: Failed to start forks worker for test files /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/SegmentBar/_SegmentBar.spec.tsx.
Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
Error: [vitest-pool]: Failed to start forks worker for test files /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/AnimatedNumber/_AnimatedNumber.spec.tsx.
Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
Error: [vitest-pool]: Failed to start forks worker for test files /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/OverlayStacking/_OverlayStackingService.spec.ts.
Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
Error: [vitest-pool]: Failed to start forks worker for test files /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/helpers/_hex-to-rgba.spec.ts.
Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
Error: Failed to run the test /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx.
Caused by: Error: [vitest] Browser connection was closed while running tests. Was the page closed unexpectedly?
Caused by: Error: [birpc] rpc is closed, cannot call "createTesters"
```

## Parent follow-up after failed run

- Removed unnecessary `async` from `pickMobileDay` helper (it still returns the user-event promise).
- `selftest.sh` and `coverage-selftest.sh`: PASS.
- `gates.sh s0-bounded`: PASS, app1001/lib4 errors unchanged, contract0, lint1319 with 0 worse pairs.
  Transcript `/tmp/mui-upgrade/static-bounded.log`, full diagnostic artifacts `out/s0-bounded/`.
- Fresh bounded coverage run authorized because runner worker limits/reporting changed after the failed unbounded
  run. It must retain all raw failures and classify them; it is not a green reinterpretation of the earlier red run.
