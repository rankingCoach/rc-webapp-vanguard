# Fresh read-only S3 review — 2026-11-05

## Code Understanding

Reviewed Material/System 5.16.14→6.5.0 compatibility in Accordion, Autocomplete, AppBar and Snackbar, dependency/lock changes, the new AppBar sx test and suspend-aware validation tooling. S1 import changes and accepted S2 DatePicker implementation are baseline. Read verification-s3.md's entire history through the consumer continuation, plan, component registries, S0 exception evidence and S1/S2 reviews/dispositions. No implementation, test, probe, config or dependency changes; no runners, subagents, commits, pushes or external posts. Only this report was written.

## Pattern Analysis

Read .claude/agents/fe-reviewer.md and fe-developer.md and applied /Users/a.kott/.claude/skills/codereview/references/rubric.md. The separate codereview-fe-agent surface rubric remains missing from searched local/repository locations; this limits rubric completeness. Adapted application conventions to Vanguard's library surface: MUI is expected, no fixed finding quota applies, and accepted baseline quirks are not new defects. Generic any/private ownerState coupling alone is not classified as MAJOR.

Accordion's public heading div preserves the no-heading characterization; existing callbacks, duplicate ids, ignored props/ref and SCSS quirks remain baseline. Autocomplete maps the three new input reasons without changing onChange payloads; manual split paths remain unchanged. AppBar's explicit sx arrays/functions have correct later-entry precedence. Snackbar's stable adapter preserves the composed enter/exited handlers and restores legacy remaining transition callbacks, but composition/default paths below remain uncovered.

## Risk Analysis

The initial unchanged post-bump 11/2994 RED and targeted production repair evidence remain distinct. Approved platform enrichment concerns three MediaQueryList objects in exactly two S2-added files, not production browser shims or assertion rewrites. Inspected the allowlist/full-AST audit and final frozen record: 488/490 unchanged plus exactly two approved hashes; original 462 unchanged; 52 expect nodes recorded unchanged. No snapshot reset is implied.

Independently hashed the current 5201 recorded inputs: zero differences against continuation input-hashes-after.json. continuous-final1 before/after are identical; final2 changes exactly the two generated analysis JSON files; continuation before/after are identical and its before snapshot exactly equals final2 after. This supports combining unchanged-candidate evidence without reruns.

Recorded normal source1703/browser1292 PASS, static app1001/lib4/contract0/lint1318 with no new diagnostics, and fresh mapped2995 PASS/all35 thresholds are valid stage evidence. Inspected coverage raw/reported0 at450.234061 seconds and continuation raw/reported0 at885.564841 seconds, using mach_continuous_time. Earlier Tabs assertion RED, transport RED, codemod timeout and sleep-invalid functional passes remain historical outcomes with unproven causes, not reclassified flakes.

Package evidence is combined: normal build/pack completed in the original invocation, which remains raw-15/reported124; exact-artifact continuation passed all four consumers (5+5+4+4 runtime checks), required types and eight runtime/root declaration byte comparisons. Retained preflight/installed audits agree on SHA256 3c12bf24d36d2348bd593d61a000eb27ccce2092d11854ce938bdc4cf3dbe1b1 and four build-entry hashes. The installed audit is under out/s3-consumer-continuation, not the package temp directory. No whole-package exit0 or universal declaration/peer health is inferred. Root peer exit1, undeclared types, WordPress declarations, public runtime subpaths and consumer browser-policy decisions remain unresolved baseline/release limitations.

Runner inspection confirms suspend-inclusive clock binding, post-reap deadline checks, separate raw/reported exits, owned-session signals, atomic result records and scoped caffeinate lifecycle. Recorded real-child injected-deadline RED→GREEN and integration selftests support the intended repair; no fresh executions were requested or performed. This does not establish every exceptional OS/process failure path as handled.

## Issues Found

BLOCKER: _None._

### MAJOR

- **Compatibility props suppress previously honored theme defaults.** [src/core/AppBar/AppBar.tsx:18](../../../src/core/AppBar/AppBar.tsx#L18), [src/core/Autocomplete/Autocomplete.tsx:462](../../../src/core/Autocomplete/Autocomplete.tsx#L462), [src/core/Snackbar/Snackbar.tsx:29](../../../src/core/Snackbar/Snackbar.tsx#L29). With ThemeProvider components.MuiAppBar.defaultProps.sx={display:'none'} and no local sx, the former spread-only wrapper honored that setting; the new defined [undefined] sx prevents MUI resolveProps from applying it and the bar becomes visible. Likewise MuiAutocomplete.defaultProps.onInputChange and MuiSnackbar.defaultProps.onClose are replaced by wrappers that invoke only raw local props, so theme callbacks never execute; a theme-provided Snackbar transition slot is also replaced by the injected adapter. Resolve the applicable MUI theme defaults before applying compatibility behavior, preserving explicit consumer precedence, and add regression tests with intended RED→GREEN for themed styles/callbacks/transition selection. This is established by tracing installed @mui/utils/resolveProps and MUI useDefaultProps, not a new runtime reproduction.

- **Legacy transition props override explicit transition slot props.** [src/core/Snackbar/Snackbar.tsx:18](../../../src/core/Snackbar/Snackbar.tsx#L18). Supply TransitionProps={{timeout:1000}} together with slotProps={{transition:{timeout:0}}}: MUI correctly resolves the explicit timeout0, but LegacyTransition spreads ownerState.TransitionProps last and changes the actual transition back to1000. The same overwrite affects style/in and other overlapping non-event props; explicit slots.transition bypasses this adapter, but explicit slotProps.transition does not. Resolve object/function slot props with the intended priority, restore only the appropriate callbacks stripped by event extraction, and retain MUI's internal enter/exited composition. Add mixed legacy/slot-prop regression coverage before implementation; the existing legacy-only tests do not exercise this case.

MINOR: _None._

TRIVIAL: _None._

## Final Verdict

**S3 is not ready for acceptance: address the theme-default and transition-slot precedence regressions with focused test-first evidence and required final-candidate validation.** The current combined artifact/gate evidence is credible within its documented limits, but does not cover these concrete public configuration paths; fresh overseer assessment remains required.
