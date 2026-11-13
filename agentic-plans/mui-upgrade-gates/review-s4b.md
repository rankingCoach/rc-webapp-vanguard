# Fresh read-only S4b review — 2026-11-05

Review Summary: **No actionable findings established; ready for ONE full sequential final-candidate validation. This is not S4b acceptance.**

## Code Understanding

Reviewed the existing release/mui-upgrade worktree against `/tmp/mui-upgrade/s4b-before/accepted-inputs.tar.gz`. Inspected its flat repository-relative member layout and independently compared all 5187 snapshot hashes: only DatePicker.tsx, package.json and pnpm-lock.yaml differ. The manifest delta is exclusively pickers7.29.4→8.29.5; Material/System7.3.11 remain unchanged. This review does not attribute the cumulative S0–S4a Git diff to S4b.

Read verification-s4b.md in its entirety, including parsing all 136 embedded failure records, s4b-picker-audit.md, the plan, dates registry/registry guidance, S2 review and remediation disposition, and both accepted S4a reviews. Inspected current DatePicker and its new four-case context regression, relevant frozen callback/validation cases, retained process/results/integrity artifacts, public hook/model declarations and installed8.29.5 implementations. Consulted the [official v7→v8 migration guide](https://mui.com/x/migration/migration-pickers-v7/); installed8.29.5 source controls version-specific conclusions.

Only this report was written. No source/test/config/dependency edits, runners, tests, codemods, subagents, commits, pushes, PRs or posts were performed.

## Pattern Analysis

Applied `.claude/agents/fe-reviewer.md`, relevant fe-developer conventions and `/Users/a.kott/.claude/skills/codereview/references/rubric.md`. No applicable filesystem AGENTS.md was located; supplied global rules apply. The separately named codereview-fe-agent surface rubric remains unavailable in searched local locations, preserving the earlier rubric-completeness limitation. No arbitrary finding quota or application-only prohibition on library MUI wrappers is imposed.

The exported DatePickerProps body is unchanged. The existing custom field/layout/toolbar selections, mask/caret/controlled-restore logic and Vanguard Input assembly remain. The sole actual MUI picker explicitly sets enableAccessibleFieldDOMStructure=false. No S4b accessible-sections migration or new public props are introduced. Existing QA, formconfig and native-handler precedence remain at their accepted boundaries.

## Risk Analysis

### Public context and event paths

Installed `internals/hooks/useDesktopPicker/useDesktopPicker.js:56–64` no longer supplies the old value/format/action field props; `hooks/usePickerContext.d.ts` and `internals/components/PickerProvider.d.ts` publicly expose the replacement value, fieldFormat, open, disabled, triggerRef, variant and setValue. DatePicker now maps these into its existing field assembly. DatePickerFieldProps, DatePickerToolbarProps, DateViewRendererProps and PickersLayoutProps use the installed generic arities without changing Vanguard's public type.

Validation props are still supplied: DesktopDatePicker.js:54 and MobileDatePicker.js:52 explicitly merge extractValidationProps into the field slot. Consequently the retained min/max/disablePast error calculation has not silently lost its inputs. Moment/null/invalid handling, locale formatting, type=tel on desktop, read-only mobile field, disabled propagation and input-root anchor ref remain consistent with the prior wrapper. The wrapper exposes no general consumer slots/ref/onAccept passthrough; this change does not create one. Context is consumed beneath the actual PickerProvider, while nullable values are guarded before Moment methods.

Installed `useValueAndOpenStates.js:109–166` deduplicates equal invalid dates. The new field publication path directly invokes the existing wrapper-level numeric callback exactly once after each accepted text change, preserving invalid Moment→NaN and clear→undefined; it does not also call picker.setValue. The unchanged next===text guard avoids separator-only callbacks. Frozen full-date assertions check the entire eight-publication sequence, and the new regression checks exactly three repeated invalid publications under controlled NaN echoes. Calendar changes continue through MUI's ordinary callback path. Mobile keyboard uses setValue with changeImportance=set/source=field, preserving change without acceptance or closing; calendar selection and action-bar acceptance/close remain MUI-owned. No concrete extra-callback or close-sequencing regression was established.

The layout uses context value/variant in place of removed layout props and retains its styled PickersLayout and DatePickerToolbar. Installed PickerPopper.js:38/46 uses MuiPickerPopper. Adding the old MuiPickersPopper-root class through slotProps retains the v8 styled default and generated class; no CSS duplication or replacement component was introduced. This alias is a temporary internal compatibility shim, not a new public promise.

### Evidence integrity and limits

The complete initial unchanged spec evidence is249PASS/136FAIL, all136 initially failing at missing format/toLowerCase. False-only remains249/136. Context mapping clears135 original failures; the remaining original failure is repeated-invalid publication. New context and publication intended REDs are retained, including the documented new-test focus/typing harness correction. Final source389PASS and browser197PASS (96.813s) record raw/reported0, no timeout, mach_continuous_time and reaped inhibitor. The browser194PASS/3FAIL history and new class-regression3PASS/1FAIL remain visible; the third initial browser failure is subsequent Popover aria-hidden state, not independently proven as another picker source defect. Final targeted browser GREEN covers that sequence.

Dedicated types and contract compiler record0. Scoped lint fix/check records0 with a duplicate-string warning; recorded diff-check0 is not represented as an independently rerun check. New tests exercise real rendered behavior rather than mocked context values. All485 accepted current test hashes independently match the snapshot, and the new test hash matches final-integrity. Original492/490 allowlist-adjusted integrity is retained in out/s4b-final-integrity; the allowlist contains exactly the two approved MediaQueryList mock changes and ToggleButton. No S4b frozen change was found.

Strict preflight metadata accepts this core7/React19/Moment graph; install/tree/adapter records are raw/reported0 and adapter output confirms valid/invalid/de locale behavior. Root peer and other release limitations below remain separate. The accepted S4a packed probe is honest OLD GREEN:1PASS/4 unrelated SKIPPED,7.668s, accepted tarSHA94410ac82b6319080361f5a46138684b4887127987f0b559e678e25813b43d0c. The fresh strict npm11 target probe is CURRENT GREEN:1PASS/4 unrelated SKIPPED,10.064s. Neither supplies manufactured old RED. Retained5719 old/5711 new default-byte checks and exact pins support those targeted claims; the new tar retained S4a WordPress bytes and is not full fresh package proof.

The original pre-edit browser/type capture was missed: an accepted process deviation, not retroactively repaired chronology. Authorized isolated reconstruction has four generic-arity compiler errors (RED), but browser reconstruction has two failed suites/zero tests from setup import resolution (HARNESS FAILURE). It is neither original RED nor functional browser evidence, and no reconstruction retry is claimed. npm10 pack unexpectedly invoked prepare despite ignore-scripts; the owned group stop remains raw/reported-15. Later npm11 pack0 is a distinct documented attempt, not a hidden retry or success assigned to the stopped run.

All three C1 watched tests are explicitly notincluded in the targeted evidence, so no C1 timing conclusion is drawn. No timeout increase or threshold waiver is inferred. Full final gates are intentionally pending a clean fresh review and their absence is not an implementation finding.

The official guide confirms removal of the false-field option in v9; no current runtime warning was observed or invented. The user now authorizes the S5 DOM migration only after S4b acceptance; S5 has not started. Root peer baseline, undeclared MUI types, WordPress declarations, public runtime subpaths and browser-policy limitations remain explicit without waiver. Initial dependency RED authorizes scoped repair under the clarified rule; unrestorable non-bug-lock behavior/public types or payload changes, C1>2500ms and applicable new source/repeat timeout escalation rules still apply.

## Issues Found

BLOCKER: _None._

MAJOR: _None._

MINOR: _None._

TRIVIAL: _None._

## Final Verdict

**S4b is ready for ONE full sequential final validation by root, including selftests/resolution/count guards, static and extra types, source/scripts20/browser suites, project-scoped35-file coverage and canonical fresh four-consumer5/5/4/4 package proof.** This is implementation-review readiness only: S4b acceptance and subsequent S5 authorization remain contingent on the required final evidence and overseer disposition, with all carried conditions and limitations intact.
