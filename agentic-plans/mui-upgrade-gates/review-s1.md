# Fresh S1 read-only review — 2026-11-04

## Code Understanding

Reviewed the S1 production diff, dependency/lock changes, public-import guard, runner fixes and recorded evidence in the existing `release/mui-upgrade` worktree. Read `verification-s1.md` in full, including original failures and the final runner-fixed append, the upgrade plan and accepted S0 exception document. S0 characterization tests, Storybook V8 configuration and three unreachable PopoverModal handler exclusions are accepted baseline, not new S1 findings.

The five production files change six import paths only. Installed MUI 5.16.14 component barrels re-export the same AppBar/Toolbar/Autocomplete types and TooltipClasses; Collapse/Fade public runtime entry points re-export the same implementations. Props, generic aliases, refs, callbacks, rendered QA ids, JSX and styles are unchanged. No core/system/picker version or slot API migration occurred.

## Pattern Analysis

Read `.claude/agents/fe-reviewer.md` and `fe-developer.md`. Searched the worktree reviewer configuration and user Claude/Codex skill locations for the referenced `codereview-fe-agent`; its surface rubric remains unavailable. Found and read `/Users/a.kott/.claude/skills/codereview/references/rubric.md`, which explicitly references that separate missing rubric. Applied its evidence-based severity definitions and the local reviewer instructions, adapted to Vanguard as the component library: MUI is expected here. No arbitrary finding quota or application-only prohibition on MUI was applied.

Emotion peer/dev pins agree at React 11.14.0 and Styled 11.14.1. Lock changes consist of their peer snapshots/transitives and pruning lab/styles-only dependencies, plus incidental registry deprecation metadata; retained material/system 5.16.14 and pickers 5.0.16 are unchanged. A hidden/config/source search found no remaining lab/styles use outside metadata/history/build output.

The new AST guard covers static production imports and re-exports throughout `src`, excluding specs/stories. It detects all six original private paths and permits the replacement public component paths. It is a focused static import guard, not a claim to police dynamic imports or every MUI package's export policy; no current S1 bypass was found.

## Risk Analysis

- TDD evidence retains the import guard's six-violation RED and unchanged GREEN. The strict peer RED is a genuine isolated-cwd ERESOLVE for Emotion 11.0.0 versus MUI's ^11.5.0 requirement. The initial prefix invocation inherited legacy-peer configuration and is correctly excluded as proof.
- `suite.sh` bounds both projects and diagnostics with one worker/no file parallelism. Each raw project failure sets the persistent failure flag before diagnostic reruns; their outcome cannot erase it. The selftest records unbounded-run RED followed by GREEN and raw exit 7 producing gate failure. Static and coverage selftests also pass, including compiler/lint crash rejection.
- Inspected final static logs: app 1001/lib 4/lint 1319 existing errors, zero new; contract zero. Final normal summary records spec 95 files/1694 tests and Storybook 173 files/1290 tests, both raw exit 0 and final PASS. The outer shell OS exit is **null**, not asserted to be zero: interruption prevented reaping it. Captured project outcomes plus independent full coverage success sufficiently substantiate the gate; no rerun is required solely for this capture limitation.
- Full mapped coverage exits 0 with 268 files/2984 tests passing. All 35 audit entries meet 95% lines/85% branches. Only the approved three unreachable PopoverModal declarations remain excluded. Final logs show no unexpected optimization/reload or missing-runner diagnostic. Original DropdownMenu and coverage failures remain recorded as RED, with focused GREEN evidence and final full GREEN after the bounded runner/prebundle changes.
- Normal package process records exit 0 after fresh build/pack, without baseline mode or reused tarball. All four isolated npm 11 strict consumers and 16 runtime checks pass; required declaration checks include the default MUI-present healthy-type probe. Installed audit records exact Emotion pins and matching packed runtime/root declaration bytes for default and WordPress consumers. This resolves S1's package requirement without claiming universal declaration health. Root React 19/pickers 5 and other legacy peer conflicts, broader measured declaration errors and S0 history remain explicit limitations.
- Validation integrity records 5129 inputs with no changes. Subsequent changes were runner configuration only; nothing identified invalidates the prior package proof or requires another build.

## Issues Found

BLOCKER: _None._

MAJOR: _None._

MINOR: _None._

No actionable S1 findings; no source/test changes or additional executions requested. This review ran no test runners, modified no source/tests, made no commits/pushes and sent no external posts.

## Final Verdict

**S1 is acceptable for overseer acceptance within the agreed stage scope and accepted S0 baseline.** No remaining S1 changes are required before that handoff; this verdict does not accept later migration stages or broaden the documented peer/type exceptions.
