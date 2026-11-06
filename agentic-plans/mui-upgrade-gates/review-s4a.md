# Fresh read-only S4a review — 2026-11-05

Review Summary: **No actionable findings established; ready for ONE sequential final-candidate validation. This is not S4a acceptance.**

## Code Understanding

Reviewed the Material/System7.3.11 + retained pickers7.29.4 split in the existing release/mui-upgrade worktree. Compared changed production files against the accepted S3 bytes in `/tmp/mui-upgrade/s4a-before/production.tar.gz`, using hashes.json to identify stage changes rather than treating the entire Git diff as S4a. Reviewed the new slot helper, MuiTextField adapter, Snackbar mapper, compatibility tests and new import guard, alongside installed MUI TextField/Autocomplete/Snackbar/useSlot/resolveProps implementations. Read verification-s4a.md in full, deprecated disposition, plan/registries and accepted S3 review plus remediation recheck.

Only this report was written. No source/test/config/dependency edits, runners, tests, codemods, delegates, commits, pushes, PRs or external posts were performed. No final gates or S4b work was started.

## Pattern Analysis

Applied local `.claude/agents/fe-reviewer.md`, relevant fe-developer conventions and the available `/Users/a.kott/.claude/skills/codereview/references/rubric.md`. No filesystem AGENTS.md was found in the reviewed worktree; the supplied global user rules apply. The separately named codereview-fe-agent surface rubric remains unavailable in searched local locations, so rubric completeness retains that limitation. Vanguard library scope permits MUI wrappers; no arbitrary finding quota or unrelated application refactor is imposed.

Public legacy prop types intentionally remain compatible. The helper copies rather than mutates input, removes mapped aliases and preserves explicit slot property presence, including undefined/null, instead of truthiness-based legacy fallback. Underlying MUI still performs slot resolution and ref/event composition. Existing ignored props, whole-object replacements, selectors and wrapper quirks are the comparison baseline.

## Risk Analysis

### Compatibility paths

InputBase retains its existing assembly and precedence of consumer props, adornments, native input handlers and refs. MuiTextField resolves MuiTextField defaults before alias mapping; explicit slots override mapped legacy keys. Nested Select MenuProps aliases map after object/callback select resolution, retaining whole-slot priority. Native Select id/label, themed legacy props and explicit callback htmlInput behavior have focused tests. No new broad merge semantics were introduced.

Menu maps list/paper/transition/backdrop and transition component aliases after theme resolution. Paper/root callbacks receive owner state; resolved refs/events remain in the object passed to MUI. Enforced root z-index survives caller styling. With Vanguard sizing, the code deliberately selects original explicit paper slot props rather than the legacy mapped PaperProps, preserving wholesale legacy suppression; explicit paper.style still replaces the size style. Drawer and Tooltip/Popover changes preserve their fixed wrapper boundaries; explicit noninteractive pointerEvents addresses the retained frozen regression.

Autocomplete renderValue/getItemProps retains Vanguard Chip/Text/wrapper/classes/height, deletion and keyboard behavior, with both data-item-index and data-tag-index. The SCSS contract does not depend on changing the legacy attribute. Multiple custom rendering stays wrapper-owned; consumer slotProps remains ignored as before. Legacy component/prop aliases map with explicit selection precedence; fixed popper stacking retains the prior override boundary.

Snackbar retains a stable module-level LegacyTransition, with context carrying the resolved legacy component. Explicit transition slots, including undefined, keep their existing selection priority. Mapping preserves explicit object/function slot priority, legacy enter/exited composition, nullish-slot fallback for other legacy events, transition refs and MUI internal exited state/unmount behavior. The adapter restores only extracted non-enter/exited event functions, without overwriting effective timeout/style/in. Retained tests cover component overrides, state across rerenders, refs, callback counts and exit/unmount.

Both remaining underlying deprecated sentinels are narrowly justified: TransitionProps={} prevents inner theme resolution from extracting already-composed enter/exited callbacks again; its removal has a retained intended callback-duplication RED. renderTags=null! blocks inner themed legacy rendering from superseding wrapper renderValue; the real-MUI theme regression asserts that suppression. Neither is presented as zero deprecated usage or permission for a general waiver. No unavoidable public API break was established.

### Evidence integrity and limits

The verification history distinguishes unchanged post-bump267 GREEN from new intended regression RED/GREEN, missing-module/matcher harness failures and honest pre-refactor GREEN. It preserves the wrong new Snackbar theme assumption, then S3 baseline3 GREEN after correcting only that new test setup, followed by intended S4a undefined-slot RED and GREEN. This does not claim rewritten accepted assertions or fabricated pre-fix failures.

Inspected retained final Snackbar process evidence (73PASS, raw/reported0, no timeout, mach_continuous_time) and latest watched-test timing records (100.182/133.996/117.587ms). The reported504-spec/34-story and73-spec/4-story runs are targeted evidence, not a full final-suite claim. Recorded included C1 measurements stay below2500ms; omitted tests are explicitly notincluded. Historical S3 108pass/3timeout RED remains unexplained, never reclassified as flake. No C1 escalation trigger is established by the reviewed evidence.

Inspected clean-copy codemod review.json:22 pinned transforms report raw/reported0 and zero parse errors; formatting, duplicate renderValue and destructive Snackbar slot/sentinel hunks are rejected. The1950 executable-path scope excludes declarations/assets/tests/story support; prior207 JSON and intermediate declaration parser errors remain historical failures, not clean proof. The original suite/copy-codemod overlap remains a recorded workflow violation; later serialization does not erase it.

Static evidence is dedicated new-file clean checks plus baseline-relative production diagnostics, not whole-root static health. The new guard covers one-level imports and config alias negative fixtures while preserving the old guard. Root independently checked all492 frozen hashes unchanged; this review relies on that stated independent check and retained original490 plus approved two-file mock proof, rather than claiming a fresh exhaustive frozen audit. Only the three approved dead PopoverModal handlers remain coverage exceptions.

No additional evidence-integrity blocker was established. Root peer baseline, undeclared MUI types, WordPress declarations, public runtime package subpaths and consumer browser policy remain explicit release limitations without a broad waiver. The full final suite, coverage, static and package checks have intentionally not run yet; their absence is not an implementation finding at this pre-gate review point.

## Issues Found

BLOCKER: _None._

MAJOR: _None._

MINOR: _None._

TRIVIAL: _None._

## Final Verdict

**S4a implementation review is clean and ready for ONE sequential final-candidate validation by root, with the carried conditions and limitations intact.** This verdict does not accept S4a, authorize S4b, or establish release readiness; stage acceptance remains with the overseer after final-gate evidence, and any unavoidable public API break, peer waiver, C1 duration above2500ms/repeat timeout or forced picker-v8 visible change requires immediate escalation.
