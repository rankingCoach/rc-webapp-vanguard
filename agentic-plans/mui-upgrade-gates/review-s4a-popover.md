# Scoped Popover repair review — 2026-11-05

Review Summary: **No actionable findings established. Ready for ONE fresh complete sequential final validation by root; not S4a acceptance or S4b authorization.**

## Code Understanding

Read the prior clean `review-s4a.md`, final RED sections and root Popover append in `verification-s4a.md`, and `s4a-styled-slot-audit.md`. Scope is the Popover repair and related styled-slot preservation audit, not a repeat of the full S4a review. Inspected current production/test code, retained targeted JSON/process/static evidence, and actual installed Material6.5.0 (`/tmp/mui-upgrade/s3-bridge-peers/node_modules/@mui/material`) and Material7.3.11 implementations.

Confirmed the root cause: 6.5 Tooltip.js:650–676 selects styled TooltipPopper as its default and renders it with `as: PopperComponentProp`. Substituting `slots.popper` instead replaces that styled component: 7.3 utils/useSlot.js selects `slots[name] || initialElementType`. Tooltip.js:51–150 owns pointer-event variants and directional arrow edge anchors. Losing this wrapper explains both arrow geometry regression and incorrect pointer interception; supplying an inline pointer-events value cannot reproduce open/closing behavior.

Current `src/core/Popover/Popover.tsx:127–157` removes the replacement slot and inline pointerEvents. It keeps default TooltipPopper, supplies `vanguard-popover` and the dark class through `slotProps.popper.className`, retains placement, maxWidth and overlay z-index, and imports the unchanged SCSS directly at line1. No duplicated arrow CSS, untyped `as`/`component`, or public API change is introduced. `PopoverPopper` and its SCSS have no Git diff; AutocompleteWithAnchor.tsx:68 still uses that module.

## Pattern Analysis

Applied `.claude/agents/fe-reviewer.md`, relevant minimum-diff conventions from fe-developer, and `/Users/a.kott/.claude/skills/codereview/references/rubric.md`. The separately named `codereview-fe-agent` surface rubric was not found in searched local locations; this remains a rubric-completeness limitation. No new design-token, translation or selector contract issue was introduced by this narrow repair. Existing SCSS and existing public-prop omissions are outside this repair.

Checked audit boundaries against both installed sources (line references below are component/component.js, 6.5 → 7.3):

- Autocomplete Paper/Popper: defaults556/562 →612/618; outer AutocompletePopper/AutocompletePaper render `as` selected slots707/710 →789/792. Both styled outer wrappers survive; no Tooltip-equivalent loss.
- Transition selections: Accordion209→214 (Collapse), Popover299→307 (Grow), Drawer287→311 (Slide), Backdrop97→105 (Fade), Snackbar224→233 (Grow). Legacy component aliases already selected the same transition boundary; Menu forwards into Popover. Tooltip transition remains default Grow after this repair. No omitted styled transition wrapper requiring a production fix was established.
- Menu paper/list166/173→170/177, Popover root/paper332/356→340/364, Modal root/backdrop172/184→175/187, Drawer root/paper246/268→263/286: compared defaults, component forwarding and wrapper migrations. Props-only conversions retain defaults; explicit consumer replacement slots retain their prior boundary.
- TextField input/label/native/helper/select183–204→189–210 and Input root/input158–159→165–166 retain their component selections. InputBase styled input renders `as: InputComponent`502→543. Select retains its variant Input clone and nested Menu path. No new styled-component replacement was found here.

The audit covers the required boundaries with source evidence. No actual actionable miss or additional production fix was established; editorial expansion of its N/A entries is not a gate blocker.

## Risk Analysis

Inspected retained closing RED JSON:0PASS/1FAIL, expected none but received auto on exit, raw/reported1/1. GREEN runs show41PASS/0FAIL for new closing plus unchanged Popover/PopoverPopper specs, and10PASS/0FAIL for frozen Popover stories, including all four placements, both themes, pointer states, arrow and maxWidth. Read the new test: it asserts classes, open auto, mounted closing none, then unmount. These are observable behavior assertions. Test-first chronology is recorded by root; this review confirms the retained intended RED/GREEN evidence without claiming an independent historical checkout replay.

All three retained process records use mach_continuous_time, no timeout, inhibitor reaped and one-worker serial arguments. Dedicated types/lint records exit0; lint log contains only the existing exhaustive-deps warning. Formatter record is0. Root records diff-check0. No tests, gates, runners or new verification commands were executed in this review.

Each targeted C1 file explicitly records all three watched Autocomplete tests as notincluded. Earlier included timings remain below2500ms; no new threshold or repeat-timeout trigger is established. Historical full Storybook1288PASS/4FAIL and ToggleButton RED remain preserved; targeted GREEN is not full-suite proof. The allowlist still contains exactly the two prior mock approvals plus approved ToggleButton change. No frozen edit is authorized here; this review relies on root's recorded independent frozen hash checks rather than claiming a new exhaustive hash audit.

Root peer baseline, undeclared MUI types, WordPress declarations, public runtime subpaths and consumer browser-policy limitations remain explicit, without broad waiver. Fresh full-suite, coverage and package proof remains pending by design and is not a missing-gate finding at this review point. Root must keep gates bounded and sequential, and escalate any new non-bug-lock failure before edits under the standing instruction.

## Issues Found

BLOCKER: _None._

MAJOR: _None._

MINOR: _None._

TRIVIAL: _None._

## Final Verdict

**The scoped Popover repair and styled-slot audit are clean and ready for ONE fresh complete sequential final validation by root.** This verdict does not accept S4a, authorize S4b or declare release readiness; only this report was written, with no source/test/config/dependency edits, test execution, subagents, commits, pushes or posts.
