# Fresh S2 review — 2026-11-04

## Code Understanding

Reviewed the current DatePicker.tsx in full against git HEAD's v5 implementation, the plan, dates registry, S0 exception, accepted S1 review, gates/package READMEs, and verification-s2.md's complete history through the controlled-final append. Scope is the new S2 picker bridge; S0/S1 are accepted baselines. Read the new four-case compatibility spec, keyboard geometry story, relevant frozen characterizations, gate runners, package runner and public type/runtime probes. Compared the prior installed v5 useMaskedInput, maskedDateFormatter and useRifm implementations to the new field.

The bridge keeps Material/System 5.16.14, Emotion React 11.14.0/Styled 11.14.1, React 19.2.0 and Moment 2.30.1 while moving pickers 5.0.16 to 7.29.4. Production compatibility is confined to DatePicker: Moment boundary, stable custom field, public calendar renderer/root hook, anchor/placement, idempotent stacking, year role, and mobile toolbar/layout. Picker slots do not introduce unsupported core-v5 TextField slotProps.

## Pattern Analysis

Read .claude/agents/fe-reviewer.md and fe-developer.md. Located and applied /Users/a.kott/.claude/skills/codereview/references/rubric.md; the separately referenced surface rubric codereview-fe-agent remains unavailable in the searched repository and local skill locations. Applied the available evidence-based severity rules with component-library adaptations: MUI is expected, baseline quirks remain frozen, and no fixed finding count applies. Existing QA/form precedence and application-only conventions are not treated as authorization to expand this migration's public API.

## Risk Analysis

The consumed emission marker addresses the recorded external 22→20 restore and post-typing locale failures. Calendar rendering remains native v7; the historical root class is additive. Ref wiring reaches the input root for the Popper anchor, and cleanup unregisters the stacking slot. Numeric units, null/NaN payload behavior, range normalization, mobile accept/Cancel/Escape behavior and known static mobile z-index limitations were assessed against the accepted characterizations rather than treated as new defects.

Final authoritative evidence is out/s2-controlled-final, not earlier candidate GREEN. Inspected durable process JSONs: three selftests, static, normal suite, coverage and fresh package each record actual exit 0 with no timeout. Recorded normal/coverage runs pass all 270 files/2989 tests; coverage meets 95% lines/85% branches for all 35 wrappers (DatePicker 100%/96.73%). Static records app1001/lib4, contract0 and lint1318 with zero worse baseline pairs. The normal fresh package records four strict consumers and 18 runtime checks, including the strengthened default DatePicker restore/locale probe; WordPress intentionally omits DatePicker. Package audit pins agree with the intended graph. Integrity artifacts retain 462 unchanged frozen specs/stories and identify only the two generated analysis JSON changes among the final inputs. Recorded intended RED→GREEN and previous-tarball RED remain visible; interrupted and failed attempts are not counted as success.

These checks leave a concrete editing path uncovered. Line/branch coverage and end-of-input typing tests do not establish equivalence of the replacement mask for deletion inside a date.

## Issues Found

BLOCKER: _None._

### MAJOR

- **Deleting a separator corrupts a valid date and emits NaN.** [src/core/DatePicker/DatePicker.tsx:104](../../../src/core/DatePicker/DatePicker.tsx#L104) unconditionally accepts the raw browser string whenever its length decreases, bypassing the mask constructed immediately above. With `locale="en_US"` and `03/15/2024`, focus the field, place the caret immediately after the first slash (selectionStart=selectionEnd=3), and press Backspace: the browser supplies `0315/2024`, this branch retains it, strict parsing fails, and the public callback receives NaN; a controlled NaN echo preserves the malformed text. The v5 useMaskedInput fed every edit through maskedDateFormatter/useRifm: the same raw string formats back to `03/15/2024`, produces no value change and restores the caret. Restore mask-aware deletion and selection/caret handling while preserving the frozen final-digit deletion and clear semantics; add regression coverage for Backspace/Delete at separators and subsequent mid-string editing, with intended RED and GREEN evidence. No existing test exercises separator deletion (the frozen deletion case uses End+Backspace).

MINOR: _None._

TRIVIAL: _None._

This finding is established by tracing the browser deletion result through both implementations; no new runtime reproduction was executed, in accordance with the read-only restriction.

## Final Verdict

**S2 is not ready for overseer acceptance: fix the separator-deletion regression and supply focused red/green evidence plus the required final-candidate checks.** The current recorded gates are green, but do not cover this new failure path; accepted S0/S1 root-peer, undeclared-type, WordPress-declaration and runtime-subpath limitations remain unchanged, with no universal graph/type claim.

Review performed no source/test/probe edits, test runners, commits, pushes, subagents or external posts. Only this permitted report was written; no S3 work or CR placeholder was created.

## Root disposition of the MAJOR — 2026-11-04

Original reviewer verdict above is retained; this section records root remediation, not a new reviewer verdict.
Reproduced the exact v5 packed-runtime mask/caret behavior; four new compatibility cases first failed on the
reviewed S2 implementation, then passed after mask-aware deletion and post-render selection restoration.
No frozen assertion changed. Targeted135source tests and2real-browser stories pass. The installed probe was
RED against the previous S2 tarball, then GREEN in a fresh normal strict4consumer/18runtime validation.
Full mapped2994tests/35thresholds pass; unchanged-source normal project evidence1702source+1292browser pass.
Original incomplete normal wrapper remains RED with unknown browser-transport cause; no exit is invented.
See verification-s2.md for exact raw paths, original failures, final source hashes, fresh package bytes and
caret/locale/control regressions. Root considers this specific finding addressed and submits S2 for the
final overseer verdict. S2 acceptance/S3 start is not asserted by this disposition.
