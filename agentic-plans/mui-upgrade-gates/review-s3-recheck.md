# S3 remediation recheck — 2026-11-05

## Code Understanding

Fresh read-only recheck in `release/mui-upgrade`, limited to the two MAJOR findings in [review-s3.md](review-s3.md), their AppBar/Autocomplete/Snackbar remediation diff, the six new `_SnackbarCompatibility.mui.spec.tsx` cases, and final evidence in [verification-s3.md](verification-s3.md). Read installed Material/System 6 resolution and transition implementations directly. Only this report was written; no source/test/config/dependency edits, tests/runners, delegation, commits/pushes, external messages or stage acceptance.

## Pattern Analysis

Applied `.claude/agents/fe-reviewer.md`, relevant `fe-developer.md` conventions and the available `/Users/a.kott/.claude/skills/codereview/references/rubric.md`. The separately named `codereview-fe-agent` surface rubric remains unavailable in searched repository/local skill locations, as the original review records. Vanguard library scope and existing wrapper conventions remain the baseline; no unrelated full-review scope was repeated.

## Risk Analysis

### Prior MAJOR 1 — theme defaults: CLOSED

[AppBar.tsx:16](../../../src/core/AppBar/AppBar.tsx#L16) and [Snackbar.tsx:35](../../../src/core/Snackbar/Snackbar.tsx#L35) resolve public `useThemeProps` before injecting compatibility props. Traced installed `@mui/material/styles/useThemeProps.js` → System `useThemeProps/getThemeProps` → utils `resolveProps`: undefined scalar props receive theme defaults; defined local values win; slots merge with local selection last. AppBar therefore includes themed sx before creating its ordered sx array, while explicit object/array/function sx keeps consumer precedence. Snackbar's intercepted onClose captures the resolved callback, and its injected transition fallback precedes resolved theme/local slots, preserving themed selection and explicit selection precedence.

[Autocomplete.tsx:109](../../../src/core/Autocomplete/Autocomplete.tsx#L109) reads only the resolved onInputChange callback from `rest`; it does not spread resolved theme defaults over Vanguard's own autoSelect/freeSolo/multiple/render behavior. The callback wrapper preserves local-over-theme resolution and maps only the new selectOption/removeOption/blur reasons to legacy reset. The four new theme cases exercise themed sx, callback delivery and transition selection, plus explicit overrides. Independent installed-source tracing and retained test evidence support closure of the original finding.

### Prior MAJOR 2 — legacy transition overwrite: CLOSED

[Snackbar.tsx:16](../../../src/core/Snackbar/Snackbar.tsx#L16) no longer spreads legacy non-event TransitionProps over MUI's transition props. Installed `Snackbar.js` constructs effective external transition slot props with explicit slotProps last; `useSlot.js` resolves object/function props against ownerState; `mergeSlotProps` merges style/non-events and extracts /^on[A-Z]/ function handlers. Snackbar composes onEnter/onExited itself, including legacy enter/exited handling and internal exited-state updates.

The adapter restores only the other extracted event functions from effective explicit object/function transition props or legacy fallback. Its matcher agrees with installed `extractEventHandlers`; it leaves MUI's timeout/style/in/ref and composed enter/exited untouched. Explicit transition components selected through slots bypass the fallback adapter, preserving MUI's selection path. The two new mixed legacy/explicit cases assert timeout0 rather than1000, explicit style, explicit onEntered instead of legacy onEntered, onExited and actual unmount after close. These assertions and source tracing independently close the original overwrite finding; no new actionable regression was established in the repair paths.

### Evidence and limitations

Inspected retained raw logs/process records: test-first remediation has six intended assertion failures, raw/reported1, followed by all six new cases passing. The five-file targeted run remains **RED:108 passed/3 existing Autocomplete tests timed out at5000ms**, raw/reported1; its cause is unproven and it is not classified as a flake. Later full validation does not relabel that outcome.

Final `out/s3-review-final/results.json` records every selftest, static, normal spec/browser, coverage and fresh package command raw/reported0, no timeout, using mach_continuous_time within1800 seconds. Raw normal logs show1709 spec +1292 browser =3001 tests; mapped coverage shows3001 tests and all35 mapped thresholds95%lines/85%branches PASS. Static evidence is baseline-relative (app1001/lib4/lint1318 existing diagnostics, no new/worse pairs; contract0), not clean-all-types.

Fresh normal package evidence records all4strict consumers,18runtime checks, required gated types,4packed/current-build and8installed/packed byte matches and exact pins PASS; package completed in367.295683continuous seconds. Inspected complete installed audit and independently rehashed the final tarball: `a6b4d9b6e00e366bd9150dacca0f4ae88c3074ab06b5cd166d5695039ec10b16`. Evidence resides in `out/s3-review-final` and `/tmp/mui-upgrade/s3-review-final-package`. Pinned fixture probes establish their stated narrower contracts only.

Recorded final before/after integrity covers5203inputs with only the two generated analysis JSON changes and no additions. Root's independent current-input check reports all5203after hashes still current; this recheck did not duplicate that full hash audit. Frozen audit records490files, exactly2approved modernMediaQuery mock updates in S2-added files per `/tmp/mui-upgrade/s3-approved-platform-mock-updates.json`, remaining488unchanged; original462untouched. No frozen assertion/probe edits or snapshot reset. Recorded final diff-check exit0 was inspected.

Original review remains intact. Earlier whole-package raw-15/reported124 timeout remains RED, alongside the targeted timeout RED and all original assertion/transport/codemod/sleep-invalid history described in verification-s3.md. Root peer baseline, undeclared types, WordPress declarations, public runtime subpaths and consumer browser-support policy remain release limitations; no broad peer compatibility or universal declaration-health claim follows from the final fixtures.

## Issues Found

BLOCKER: _None._

MAJOR: _None outstanding in this scoped recheck; both original findings closed._

MINOR: _None._

TRIVIAL: _None._

## Final Verdict

The reviewed remediation is ready for overseer assessment, with both prior MAJOR findings closed and no new actionable findings in scope. This is review readiness only: S3 acceptance and any release decision remain with the overseer, with historical REDs and release limitations retained; no CR was posted and no ticket/PR placeholders were invented.
