# S5a verification — initial unchanged capture phase (2026-11-05)

Status: **INCOMPLETE; not ready for ROOT review, final gates, stage acceptance or S5b.**
This is the coherent pre-edit capture phase only. No production/test/fixture rewrite has started.
No frozen behavior is declared unrestorable; no behavioral exception is requested or inferred.

## Authorized graph and accepted snapshot

Existing release/mui-upgrade worktree only. Manifest change is exclusively
@mui/x-date-pickers8.29.5→9.17.0. Material/System7.3.11, React/DOM19.2.0,
Emotion11.14.0/11.14.1, Moment2.30.1 and Vanguard2.8.0 remain pinned unchanged.
Accepted source/config/dependency/test/fixture bytes were snapshotted BEFORE the bump:
`/tmp/mui-upgrade/s5a-before/accepted-inputs.tar.gz` (flat repository-relative members),
`accepted-inputs.json`:5335 files, SHA256 per file. Generated bundles, node_modules,
Git metadata and gate outputs are excluded; package fixture inputs are included.
S4b accepted tar verified SHA256
`3f7d7c0b17f70f1a84a0e5d5c86f6d849d64cc52d3c689bc820f4e15dfa62eed`.
Original492/490 manifests and the existing three-file allowlist remain unchanged and
are also copied into s5a-before. `out/s5a-initial/original-frozen-integrity.json`
records492:one approved difference;490:three approved differences;ZERO unapproved.
No baseline was reset or allowlist expanded.

Read plan, registry guidance/dates, S2 review and remediation/final disposition,
S4b verification/review/picker audit, current DatePicker and gate/package READMEs.
No filesystem AGENTS.md was found by the initial applicable-path/worktree search;
supplied global instructions apply.
Official guide read before bump/work:
https://mui.com/x/migration/migration-pickers-v8/ . Installed9.17.0 is authoritative.
Root's supplied strict npm11 preflight remains at `/tmp/mui-upgrade/s5a-preflight`
and `out/s5a-preflight`; it is separate from this worktree install.

## Installation history (no failed attempt relabelled)

First pnpm install --ignore-scripts waited on an unreachable registry connection
without output; stopped ONLY owned process group57885. Raw/reported-15/-15,
109.333s, no timeout, inhibitor reaped. No unrelated/orphan process touched.
Second explicit public-registry install:
`env npm_config_registry=https://registry.npmjs.org/ npm_config_legacy_peer_deps=false pnpm install --ignore-scripts --registry=https://registry.npmjs.org/`:
raw/reported0/0,10.915s. No force/legacy flags/waiver; lifecycle scripts intentionally
suppressed to avoid an incidental full build before review. Existing .npmrc was not edited.
Worktree pnpm warns about pre-existing broader root peers; this is NOT a strict full-root
peer claim. Root's strict isolated intended graph remains the peer-valid proof.
`install-public.log` and process/resource JSON preserve output and exits.
`lock-delta.patch` retains exact accepted→installed lock delta. Normal resolution introduces
v9 transitive utils/types/x-internals/base-ui dependencies and also resolves react-is19.3.1
for styled-components (previous19.2.6) plus use-sync-external-store1.7.0 alongside1.6.0.
These transitive resolutions require scope reconciliation before a review-ready candidate;
no unrelated direct package pin was changed. No post-capture lock repair or reinstall occurred.

## Initial unchanged captures — all THREE, sequential, once

Controller: `/tmp/mui-upgrade/s5a-initial-capture.py` (copy in output directory).
All tests/compiler use explicit Node20.19.5; Vitest one worker, no file parallelism.
Each command uses bounded_runner.run(timeout1800,inhibit=True), mach_continuous_time,
owned group, periodic resources, raw/reported exits and reaped task inhibitor.
The intentional initial-capture exception continued to types after source/browser.
No capture retry. No production/test edit before or during any of the three.

| Capture | raw/reported | continuous seconds |
|---|---|---|
| spec | 0/0 | 42.073 |
| storybook | 0/0 | 117.249 |
| types | 2/2 | 6.351 |

Source:16files/389tests PASS. Browser:18files/212tests PASS.
These are honest GREEN initial observations, NOT manufactured REDs and NOT evidence of
successful accessible-field migration: the accepted custom field bypasses the v9 editor.
Source exact failing-set JSON: `out/s5a-initial/spec-exact-red-set.json` = [].
Browser exact failing-set JSON: `out/s5a-initial/storybook-exact-red-set.json` = [].
Full file/fullName/status/duration/assertion messages remain in spec-vitest.json and
storybook-vitest.json. Raw types errors are preserved verbatim in types.log:

```
src/core/DatePicker/_DatePicker.spec.tsx(9,13): error TS2741: Property 'locale' is missing in type '{}' but required in type 'DatePickerProps'.
src/core/DatePicker/DatePicker.tsx(336,13): error TS2322: Type '{ enableAccessibleFieldDOMStructure: boolean; format: string; yearsPerRow: 3; viewRenderers: { day: (props: DateViewRendererProps<DateView>) => Element; month: (props: DateViewRendererProps<...>) => Element; year: (props: DateViewRendererProps<...>) => Element; }; ... 9 more ...; onChange: (newValue: Moment) => void...' is not assignable to type 'IntrinsicAttributes & DatePickerProps & RefAttributes<HTMLDivElement>'.
  Property 'enableAccessibleFieldDOMStructure' does not exist on type 'IntrinsicAttributes & DatePickerProps & RefAttributes<HTMLDivElement>'.
```

The missing-locale error is in an existing ordinary DatePicker spec included by the
expanded capture config; it is not attributed to v9. The removed-prop error is the
specific initial v9 compiler RED. No compiler rerun/narrowing hides either error.
C1 all three watched Autocomplete tests NOT INCLUDED; each suite has explicit
*-c1-timings.json records. No duration conclusion is inferred. No test timeout recorded.
Pre/post capture integrity confirms only package.json and pnpm-lock.yaml changed
among all5335 accepted files; production, tests, config, fixture and allowlist bytes match.

## Installed-source migration map and preliminary styled audit (not implementation)

- Removed false-DOM prop: DatePicker.tsx336 still supplies it; initial compiler RED above.
- Required real field/textField path: installed DateField/DateField.js40–53 calls
  useDateField and PickerFieldUI; internals/components/PickerFieldUI.js113 selects
  the real PickersTextField default. PickersTextField/PickersInputBase/PickersInputBase.js
  390–425 renders PickersSectionList and the aria-hidden value input. Current custom
  PickerInput still renders Vanguard Input and is NOT migrated.
- Removed legacy TextField props: PickerFieldUI.js55–58 drops/warns for InputProps,
  inputProps, InputLabelProps, FormHelperTextProps. Compatibility mapping to slotProps
  is required wherever actual picker field consumers expose the legacy public type;
  do not replace that public contract or cast it away.
- Partial/null publication: internals/hooks/useField/useFieldState.js282–308 can update
  sections without publishing. usePicker/hooks/useValueAndOpenStates.js129–131 deduplicates
  equal values. Frozen per-edit NaN/clear/payload expectations remain protected;
  production compatibility must be proven with new nonfrozen RED→GREEN regressions.
- Guide changes still to audit: PickerDay name/single ButtonBase structure/classes,
  fieldRef naming, TextField slot types, adapter context removal, locale/callback signatures.
- Existing field/layout/toolbar/view/popper defaults/classes/ref/event composition have
  NOT been replaced. Current legacy Popper alias remains as accepted, with no new promise.
  Full before/after styled audit is pending implementation; no CSS duplication/as hack added.
- DateRangeInput and DateRangePicker inspected: they currently use Vanguard InputBase/Input,
  DateRange/react-date-range and IMask composition rather than an imported MUI range field.
  Actual field-user inventory and precise section migration scope remain to resolve;
  do not blanket-migrate unrelated ordinary text fields.

## Frozen rewrite and consumer documentation status

ZERO frozen rewrites, removed assertions, skipped cases, xfails or helper edits.
ZERO new allowlist entries. Original file bytes are reproducible from the accepted tar.
No whole-file AST change proof is claimed because no frozen file changed.
No QA id was moved or legacy shim removed yet. Exact QA-id map, hidden-input/section
read examples and full-date/clear consumer tests must be documented against the actual
implementation, not guessed. **Vanguard major version recommended**; no version bump.
Browser baseline policy remains a future S5b user decision.

## Remaining work before ROOT fresh read-only review

Implement real v9 PickersTextField/PickersSectionList for authorized actual picker field
users, remove false-DOM option and obsolete raw-input mask/caret shims, retain public
props/types/behavior and record every removal. Add nonfrozen mapping regressions first,
confirm intended RED then GREEN. Classify EACH necessary legacy-DOM test/probe rewrite
with installed source file:line, same-behavior replacement, whole-file AST proof and
before/after SHA allowlist entry. Keep behavior expectations unchanged; escalate to root
and overseer before any behavior/public-type/payload change if production cannot restore it.
Finish styled audit, plan/incompatibility/consumer notes and exact QA map. Reconcile lock
scope. Run targeted source/browser/types/lint GREEN (scripts20 remain mandatory in normal
validation); capture C1 if included and halt/escalate on required timeout/threshold triggers.
Then targeted package probe old accepted S4b DOM RED/new tar GREEN, preserving all behavior
assertions and canonical default5/default5/WP4/WP4 aggregate18. No version-only RED.
No build/pack/runtime probe was run in this phase; there is no old/new packed claim.
Only after clean ROOT review: ONE fresh full sequential final validation, all35 component
coverage thresholds95/85 by spec+storybook project only, only3deadPopoverModal exclusions,
and fresh both-bundle canonical package gate. S5b remains unauthorized here.

Root peer baseline, undeclared MUI types, WordPress declaration gaps, public runtime
subpaths and browser-policy limits remain visible without waiver. No full final gates,
review/acceptance, subagents, new checkout, commits, pushes, PR, CR draft or post.

## Continuation: lock scope and real-editor regression (2026-11-05)

Still INCOMPLETE: no production migration or frozen DOM adaptation performed in this continuation.
Read the complete verification, plan/user authorization, current wrapper, installed preliminary
map, S2 review/remediation, S4b picker implementation audit and protected context/compatibility tests.
No initial capture rerun, baseline reset, frozen edit or allowlist expansion.

Added `_DatePickerAccessibleSections.spec.tsx`, a new nonfrozen migration regression requiring
the actual accessible group, three spinbuttons and hidden serialized value. Intended RED:
`out/s5a-sections-red/process.json`, raw/reported1/1, 4.564s continuous, no timeout;
one failed test (95.024ms) because the current raw custom field exposes no accessible group.
This is a new structural migration requirement, not a claim that the previously captured suites
were RED. Node v20.19.5, executable /Users/a.kott/.nvm/versions/node/v20.19.5/bin/node,
darwin arm64. One worker/no file parallelism; bounded runner1800/inhibit=True, resources,
raw log and JSON retained; task inhibitor reaped. C1 lines652/682/731 all NOT INCLUDED,
explicit records in c1-timings.json. No test timeout or C1 threshold trigger.

Lock reconciliation restored only styled-components and its Babel plugin peer identity from
react-is19.3.1 to accepted19.2.6. No direct pin change. Installed picker-local
@mui/utils9.5.0/package.json requires react-is ^19.3.0, so its19.3.1 remains necessary.
Installed @base-ui/utils0.5.0/package.json requires use-sync-external-store ^1.7.0;
accepted1.6.0 cannot satisfy it. Both1.6.0 (existing consumers) and1.7.0 (new Base UI)
are therefore retained without waiver. Exact hashes and accepted-to-reconciled patch are in
out/s5a-lock-scope. Frozen offline install verification produced no output and was stopped
by TERM to ONLY owned group62757 after53.273s; raw/reported-15/-15, no timeout, inhibitor
reaped. It is NOT successful install evidence; current installed styled-components resolution
has not been verified against the repaired lock. No unrelated/orphan process touched.

Sequencing deviation: the new isolated test started while the silent install command still
ran. No two test files/workers ran concurrently, but this violates the requested sequential
command discipline. Both outcomes are preserved; neither is relabelled successful validation.

Remaining: real DateField/PickersTextField path and public prop/ref/event/formconfig mapping;
repeated-invalid compatibility through public section events; removal of raw mask/caret shims;
actual QA map and consumer migration document; styled audit; per-edit frozen whole-file AST
proof/allowlist; targeted source/browser/static GREEN; lock install verification; old/new packed
DOM probe. No production behavior is declared unrestorable, no behavioral exception requested.
The new regression remains intentionally RED until implementation. No targeted GREEN,
types/lint/style completion, package probe, ROOT review readiness or S5a acceptance is claimed.
No S5b, full gates, version bump, commit, push, PR or CR.

## Root lock verification after stalled continuation

A separate authorized frozen offline install verification completed raw/reported0 in3.487828continuous seconds, no timeout, scoped inhibitor reaped: `pnpm install --offline --frozen-lockfile --ignore-scripts --registry=https://registry.npmjs.org/`. Evidence out/s5a-root-lock-verification/process.json/install.log. Previous stopped install remains unverified history; it is not relabelled a success. No concurrent test/static runner was active. Root proceeds to focused production implementation with the accessible-editor regression still RED; no frozen edits or completed migration claim.

## Focused production editor milestone — 2026-11-05

Production implementation now exists in DatePicker.tsx: PickerInput renders the installed
public DateField, which executes useDateField → PickerFieldUI → default styled
PickersTextField → PickersSectionList. Removed the raw Vanguard Input field, eight-digit
separator mask, manual caret/selection logic, raw text echo state and false accessible-DOM
flag. Mobile keyboard layout also uses DateField; its valid-only publication guard is
retained. Public DatePickerProps remains byte-for-byte unchanged, including numeric
milliseconds onChange (number|null|undefined), numeric min/max normalization and locale
format. Existing layout, toolbar, calendar renderer and popper aliases remain. Core and
dependencies were not changed in this milestone.

Source audit: installed DateField/DateField.js40–53 owns field hooks/UI;
internals/hooks/useField/useFieldInternalPropsWithDefaults.js43–65 supplies picker value,
format, disabled/readOnly and shared section/ref state. useFieldSectionContentProps.js69–99
handles real contentEditable input, 106–135 handles full-date/section paste;
useFieldRootProps.js65–70 selects all and109–120 clears with Delete.
useFieldState.js282–308 suppresses incomplete/null publications, and
usePicker/hooks/useValueAndOpenStates.js129–131 deduplicates equal values. Compatibility
publication in DatePicker.tsx57–95 uses public FieldRef.getSections plus onInput after
section editing, and explicit field onChange, preserving repeated partial NaN without
replacing section parsing. No private CSS copy, raw editor or untyped replacement added.
Required comes from formconfig.validation; helper/error Text retains its QA hook and
styled Text; the characterized unbound formconfig._inputRef remains unbound. Default
styled PickersTextField is retained. Existing Vanguard Input-specific cursor selectors
no longer apply; full styled equivalence is NOT claimed.

New nonfrozen _DatePickerV9Behavior.spec.tsx covers formconfig required/helper/unbound ref,
full-date paste → milliseconds, controlled valid value → select-all/Delete → undefined,
external restore/locale format, three partial numeric edits → three NaNs, mobile real
sections/current value and valid-only publication. No frozen test changed, including
_DatePickerAccessibleSections.spec.tsx (unchanged and now GREEN).

Evidence (all under /tmp/mui-upgrade; each directory has process.json, run.log, tests.json):
- Existing structural intended RED was already captured before this turn; not rerun.
- s5a-field-green: structural1 PASS, raw/reported0,5.393650s.
- s5a-behavior-red-events: helper missing and partial NaN publication intended RED;
  full-date paste already passed but the initial Delete simulation was incomplete.
  Earlier s5a-behavior-red / -red-desktop used click which opens the picker and loses
  editor focus; retained as diagnostic failures, not production-regression evidence.
- Intermediate s5a-behavior-green/-controlled and s5a-production-final/-sections/
  -fresh-sections retain diagnostic failures for simulated clear. Installed source and
  observed DOM prove select-all transfers contentEditable to the section-list root;
  Delete now targets that actual editable root. No production change or frozen
  assertion weakening was used to fix this new test's event target.
- s5a-production-green:15 PASS (5 new/structural +10 existing PURE value-parser tests),
  raw/reported0,5.580838s.
- s5a-mobile-invalid-red: new mobile invalid-paste regression fails because DateField
  publishes invalid Moment; production valid-only guard restored, matching the old
  CompatibilityLayout guard (before its replacement). No behavioral exception.
- s5a-production-final-green:15 PASS, raw/reported0,5.564232s. This is final test evidence.
- Dedicated changed-production/new-test types: tsconfig.s5a-production.json,
  s5a-production-types-final.log empty, exit0. Initial Node-resolution attempt failed
  solely resolving @storybook/react-vite through test-utils; dedicated Bundler resolution
  succeeded. No project config modified.
- Scoped ESLint: s5a-production-lint-final.log empty, exit0 (autofix imports/format only).

Every test command was SERIAL through bounded_runner.run(timeout1800,inhibit=True),
mach_continuous_time, one worker, no file parallelism, default+JSON reporters. No timeout,
retry of an unchanged command, timeout increase, unrelated process/power change or full
suite. C1 Auto lines652/682/731 NOT INCLUDED in any run. No initial389/212 rerun.

QA proposal from actual observed DOM: keep vanguard-input-error-text on helper Text;
locate editor by labelled role=group, read/edit the three role=spinbutton elements;
read serialization via input[aria-hidden=true]. Select-all makes the section-list root
contentEditable and removes individual spinbutton roles until selection changes. Mobile
keyboard field is inside role=dialog. No new QA id location is asserted as approved.

Limits / next root work: full min/max/disablePast, overlay/layout/cancel behavior, controlled
NaN echo and rejected-key dedup require additional focused proofs; these are not waived
by the15 PASS. Public field events currently supplement incomplete edits, and broad
rejected-input equivalence is not claimed. Styled visual audit, frozen DOM adaptations,
AST proofs/allowlist, browser/package probes and final gates remain root's later phase.
No behavior has been declared unrestorable and no frozen behavior test edited. The
styled-components nested react-is19.3.1 resolution mismatch remains PENDING despite
root's successful frozen offline install; no installation/reconciliation performed here.
No full S5a acceptance/review-ready claim, S5b, version bump, commit, push, PR or CR draft.

## Focused source continuation — rejected-input dedup and protected behavior escalation

Source phase **INCOMPLETE**. No frozen edits or DOM approval entries were made. All accepted
spec/story bytes and approved-frozen-changes.json still match accepted-inputs.json;
`/tmp/mui-upgrade/s5a-focused-frozen-red/protected-integrity.json` records the checked inventory.
Original approval history and accepted archives remain untouched. Thus no changed frozen
AST nodes/hash chain or caller-intent table is claimed or required for this continuation.

First post-real-editor frozen run is distinct from the initial dependency-bump GREEN:
`/tmp/mui-upgrade/s5a-focused-frozen-red/{process.json,run.log,tests.json,exact-red-set.json}`:
6 files,196 tests,158 PASS/38 FAIL,raw/reported1,26.793652continuous seconds,no timeout.
Targets: DatePicker.mui,DatePickerCompatibility.mui,DatePickerV8Context,DateTimePicker.mui,
DateRangeInput.mui,DateRangePicker.mui. Both range specs pass without query replacements.
No initial389/212 capture rerun. Failures are retained, not relabelled migration success.

DOM classification is preliminary, not permission to rewrite behavior: hidden serialized
input value reads already work; hidden-input clear/focus and caret/type/placeholder checks
need explicit section mappings; aria-invalid belongs on the accessible editor; label Optional,
extra open-picker button and autofill are production mapping regressions. Payload sequences,
impossible-date text, partial text and legacy insertion results remain protected. No blanket
textbox/query conversion was performed. Calendar/overlay/mobile tests that passed in this
run remain evidence for their tested paths only.

New nonfrozen `_DatePickerRejectedInput.spec.tsx` FIRST demonstrates an unintended second
NaN callback after an accepted partial numeric edit followed by rejected `!`; section text
correctly reverts but old supplement publishes again. Intended RED at
`/tmp/mui-upgrade/s5a-rejected-input-red`:raw/reported1,3.549859s; expected[true],actual[true,true].
Minimal production fix snapshots public fieldRef.getSections() on input capture and only
supplements an unpublished accepted section update. It also resets publication state per
input event. No raw editor, private import or callback/type change introduced.
Installed source: useField.js255 returns state.sections; useFieldState.js239–308 creates
new section arrays for accepted updates; useFieldCharacterEditing.js null-response path
returns without updateSectionValue for rejected text; useFieldSectionContentProps.js69–100
reverts the DOM. New test and prior15 PASS at `/tmp/mui-upgrade/s5a-rejected-input-green`:
raw/reported0,6.755879s. This does not prove all negative input or controlled NaN paths.
Scoped Bundler types and ESLint both exit0 at `/tmp/mui-upgrade/s5a-focused-static`,
3.822488s/1.749848s; external config `/tmp/mui-upgrade/tsconfig.s5a-focused.json`.

Protected behavior escalation sent to ROOT7d12feb7-406f-4d7b-b4ae-fd8ae56e230c and
overseer03a95c34-f4ce-4b25-b8f2-45ea90ab4330 before any expectation edit. Initial steer
attempts returned thread_not_sendable; queue deliveries succeeded. Observed frozen
impossible-date entry produces MM/DD/2024 versus13/45/2024; separator insertion produces
02/15/2024 versus03/21/5202. Installed useFieldCharacterEditing.js maximum-bound rejection
and null-response return plus useFieldSectionContentProps.js69–100 DOM revert explain why
these require a production compatibility strategy beyond query changes. No assertion that
restoration is impossible, upstream-bug waiver, or permission to adopt new payloads is made.
ROOT/overseer must resolve that strategy while preserving the genuine DateField requirement.

All test/static commands serial via bounded_runner.run1800,inhibit=True,mach_continuous_time,
Node20.19.5,one worker/no file parallelism,default+freshJSON reports; no timeout or increase.
C1 Auto652/682/731 NOT INCLUDED. No install/dependency/lock changes, full gates, browser,
package, version, S5b, commits, pushes, PRs, external CR posts or new agents/checkouts.
All38 frozen failures still require resolution and DOM-only whole-file AST proofs before
source-milestone completion; browser/package/docs/full review remain later ROOT work.

## Overseer-directed pre-edit assertion classification (2026-11-05)

No production or frozen edits preceded this inventory. All four failing frozen files were compared byte-for-byte with accepted-inputs.tar.gz. The original 38-result JSON remains unchanged. Rows below are planning classifications, not an independent review or permission to alter BEHAVIOUR nodes. For passing assertions the source column identifies the editor path under test, not an assertion that they failed. DOM-only action targeting does not downgrade the protected behavior assertions in the same test.

### F1: DatePicker contract: rendering renders a single text input with autocomplete disabled and the calendar closed

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:111. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:110 / test/ArrowFunction:2/Block:1/ExpressionStatement:2/CallExpression:0 | `expect(container.querySelectorAll('input')).toHaveLength(1)` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:111 / test/ArrowFunction:2/Block:1/ExpressionStatement:3/CallExpression:0 | `expect(input).toHaveAttribute('autocomplete', 'off')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435 (htmlInputProps forwarding) | missing autocomplete → production slotProps.htmlInput autoComplete off; unchanged assertion |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:112 / test/ArrowFunction:2/Block:1/ExpressionStatement:4/CallExpression:0 | `expect(queryCalendar()).toBeNull()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F2: DatePicker contract: rendering [v5-quirk] input is rendered as type="tel" (numeric keyboard on mobile)

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:120. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:120 / test/ArrowFunction:2/Block:1/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('type', 'tel')` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F3: DatePicker contract: rendering renders the Vanguard calendar icon next to the input (not the MUI open-picker button)

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:129. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:127 / test/ArrowFunction:2/Block:2/ExpressionStatement:1/AwaitExpression:0/CallExpression:0/ArrowFunction:1/CallExpression:1 | `expect(container.querySelectorAll('svg[role="figure"]')).toHaveLength(1)` | BEHAVIOUR | @mui/x-date-pickers/internals/components/PickerFieldUI.js:113 (real default text field/adornments) | default open-picker button → production public hideTrigger mapping; unchanged icon/button assertions |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:129 / test/ArrowFunction:2/Block:2/ExpressionStatement:2/CallExpression:0 | `expect(screen.queryByRole('button', { name: /choose date/i })).toBeNull()` | BEHAVIOUR | @mui/x-date-pickers/internals/components/PickerFieldUI.js:113 (real default text field/adornments) | default open-picker button → production public hideTrigger mapping; unchanged icon/button assertions |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:130 / test/ArrowFunction:2/Block:2/ExpressionStatement:3/CallExpression:0 | `expect(screen.queryAllByRole('button')).toHaveLength(0)` | BEHAVIOUR | @mui/x-date-pickers/internals/components/PickerFieldUI.js:113 (real default text field/adornments) | default open-picker button → production public hideTrigger mapping; unchanged icon/button assertions |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F4: DatePicker contract: rendering label is rendered with the "Optional" suffix when not required

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:149. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:148 / test/ArrowFunction:2/Block:1/ExpressionStatement:2/CallExpression:0 | `expect(label).not.toBeNull()` | BEHAVIOUR | @mui/x-date-pickers/DateField/DateField.js:40–53 (DateField forwards label without Vanguard Optional decoration) | plain label → production restores Optional suffix; unchanged assertions |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:149 / test/ArrowFunction:2/Block:1/ExpressionStatement:3/CallExpression:0 | `expect(label?.textContent).toBe('Start dateOptional')` | BEHAVIOUR | @mui/x-date-pickers/DateField/DateField.js:40–53 (DateField forwards label without Vanguard Optional decoration) | plain label → production restores Optional suffix; unchanged assertions |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F5: DatePicker contract: locale format pattern [v5-quirk] en_US empty field placeholder is the lower-case pattern mm/dd/yyyy

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F6: DatePicker contract: locale format pattern [v5-quirk] en_GB empty field placeholder is the lower-case pattern dd/mm/yyyy

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F7: DatePicker contract: locale format pattern [v5-quirk] de_DE empty field placeholder is the lower-case pattern dd.mm.yyyy

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F8: DatePicker contract: locale format pattern [v5-quirk] nl_NL empty field placeholder is the lower-case pattern dd-mm-yyyy

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F9: DatePicker contract: locale format pattern [v5-quirk] pl_PL empty field placeholder is the lower-case pattern yyyy-mm-dd

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F10: DatePicker contract: locale format pattern [v5-quirk] ja_JP empty field placeholder is the lower-case pattern yyyy/mm/dd

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F11: DatePicker contract: value undefined value renders an empty, valid input

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:256. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:255 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(readInputValue(container)).toBe('')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:256 / test/ArrowFunction:2/Block:3/ExpressionStatement:2/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('aria-invalid', 'false')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435 (hidden input lacks validation attribute; accessible editor owns it) | hidden input read → production maps actual validation state onto hidden input too; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F12: DatePicker contract: value null value renders an empty, valid input

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:256. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:255 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(readInputValue(container)).toBe('')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:256 / test/ArrowFunction:2/Block:3/ExpressionStatement:2/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('aria-invalid', 'false')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435 (hidden input lacks validation attribute; accessible editor owns it) | hidden input read → production maps actual validation state onto hidden input too; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F13: DatePicker contract: value invalid value (NaN) renders an empty input flagged aria-invalid

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:263. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:262 / test/ArrowFunction:2/Block:1/ExpressionStatement:1/CallExpression:0 | `expect(readInputValue(container)).toBe('')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:263 / test/ArrowFunction:2/Block:1/ExpressionStatement:2/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('aria-invalid', 'true')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435 (hidden input lacks validation attribute; accessible editor owns it) | hidden input read → production maps actual validation state onto hidden input too; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F14: DatePicker contract: onChange payload typing a full date emits the ms timestamp of local midnight as the last payload

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:337. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:335 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(spy.mock.calls.at(-1)?.[0]).toBe(MARCH_20_2024)` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:336 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(readInputValue(container)).toBe('03/20/2024')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:337 / test/ArrowFunction:2/Block:2/ExpressionStatement:6/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('aria-invalid', 'false')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435 (hidden input lacks validation attribute; accessible editor owns it) | hidden input read → production maps actual validation state onto hidden input too; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:339 / test/ArrowFunction:2/Block:2/ExpressionStatement:7/CallExpression:0 | `expect(queryCalendar()).toBeNull()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F15: DatePicker contract: onChange payload [v5-quirk] typing a full date: NaN for every incomplete keystroke, 8 calls for 10 keys

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:354. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:354 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(payloads).toEqual(['NaN', 'NaN', 'NaN', 'NaN', 'NaN', 'NaN', 'NaN', 'number'])` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F16: DatePicker contract: onChange payload [v5-quirk] typing a partial date emits NaN (invalid moment) and keeps the partial text

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:383. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:381 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(spy).toHaveBeenCalled()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:382 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0/ArrowFunction:1/CallExpression:2 | `expect(describePayload(value)).toBe('NaN')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:383 / test/ArrowFunction:2/Block:2/ExpressionStatement:6/CallExpression:0 | `expect(readInputValue(container)).toBe('03/20/')` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167,225–239 | raw partial mask → read section serialization including empty-year placeholder |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F17: DatePicker contract: onChange payload typing an impossible date keeps the text and marks the input aria-invalid

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:393. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:393 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(readInputValue(container)).toBe('13/45/2024')` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167,225–239 | 13/45/2024 raw typing → explicit 02/31/2024 sections (in-range invalid date); serialize actual sections |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:394 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('aria-invalid', 'true')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435 (hidden input lacks validation attribute; accessible editor owns it) | hidden input read → production maps actual validation state onto hidden input too; assertion bytes unchanged |

Action classification: **LEGACY-EDITOR ACTION** — out-of-range 13/45/2024 → explicit month02/day31/year2024; source numeric boundaries use currentDate:null at useFieldCharacterEditing.js:143–146, so verify day31 acceptance before choosing fallback.

### F18: DatePicker contract: onChange payload [v5-quirk] typing an impossible date emits NaN on every keystroke

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:406. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:405 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(spy).toHaveBeenCalled()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:406 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0/ArrowFunction:1/CallExpression:2 | `expect(describePayload(value)).toBe('NaN')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |

Action classification: **LEGACY-EDITOR ACTION** — out-of-range 13/45/2024 → explicit month02/day31/year2024; source numeric boundaries use currentDate:null at useFieldCharacterEditing.js:143–146, so verify day31 acceptance before choosing fallback.

### F19: DatePicker contract: onChange payload [v5-quirk] deleting one character of a complete date emits NaN

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:417. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:417 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(spy.mock.calls.map(([value]) => describePayload(value))).toEqual(['NaN'])` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:418 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(readInputValue(container)).toBe('03/20/202')` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167,225–239 | raw End/Backspace → clear year section for one invalid publication; read incomplete sections |

Action classification: **LEGACY-EDITOR ACTION** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F20: DatePicker contract: onChange payload clearing the input emits undefined (null?.valueOf()), not null

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:425. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:427 / test/ArrowFunction:2/Block:2/ExpressionStatement:3/CallExpression:0 | `expect(spy.mock.calls.map(([value]) => describePayload(value))).toEqual(['undefined'])` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:428 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(readInputValue(container)).toBe('')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F21: DatePicker contract: open / close click anywhere on the field wrapper (not only the <input>) opens the calendar

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:463. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:463 / test/ArrowFunction:2/Block:2/ExpressionStatement:2/AwaitExpression:0/CallExpression:0/ArrowFunction:1/CallExpression:1 | `expect(queryCalendar()).not.toBeNull()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F22: DatePicker contract: minDate / maxDate / disablePast [v5-quirk] typing a date after maxDate still emits it, and flags the input aria-invalid

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:665. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:664 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(spy.mock.calls.at(-1)?.[0]).toBe(MARCH_20_2024)` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:665 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('aria-invalid', 'true')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435 (hidden input lacks validation attribute; accessible editor owns it) | hidden input read → production maps actual validation state onto hidden input too; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F23: DatePicker contract: minDate / maxDate / disablePast [v5-quirk] typing a date before minDate still emits it, and flags the input aria-invalid

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:677. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:676 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(spy.mock.calls.at(-1)?.[0]).toBe(MARCH_20_2024)` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:677 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('aria-invalid', 'true')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435 (hidden input lacks validation attribute; accessible editor owns it) | hidden input read → production maps actual validation state onto hidden input too; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F24: DatePicker contract: minDate / maxDate / disablePast a past value with disablePast is shown but flagged aria-invalid

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:701. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:700 / test/ArrowFunction:2/Block:1/ExpressionStatement:3/CallExpression:0 | `expect(readInputValue(container)).toBe('03/01/2024')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:701 / test/ArrowFunction:2/Block:1/ExpressionStatement:4/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('aria-invalid', 'true')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435 (hidden input lacks validation attribute; accessible editor owns it) | hidden input read → production maps actual validation state onto hidden input too; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F25: DatePicker contract: formconfig [bug-lock] formconfig error is NOT reflected as aria-invalid (MUI validation state wins)

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:731. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:731 / test/ArrowFunction:2/Block:1/ExpressionStatement:2/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('aria-invalid', 'false')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435 (hidden input lacks validation attribute; accessible editor owns it) | hidden input read → production maps actual validation state onto hidden input too; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F26: DatePicker contract: mobile variant (pointer not fine) [v5-quirk] the field is a read-only text input labelled "Choose date, selected date is ..."

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:948. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:947 / test/ArrowFunction:2/Block:1/ExpressionStatement:2/CallExpression:0 | `expect(input).toHaveAttribute('readonly')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:948 / test/ArrowFunction:2/Block:1/ExpressionStatement:3/CallExpression:0 | `expect(input).toHaveAttribute('type', 'text')` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:949 / test/ArrowFunction:2/Block:1/ExpressionStatement:4/CallExpression:0 | `expect(input).toHaveAccessibleName('Choose date, selected date is Mar 15, 2024')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:950 / test/ArrowFunction:2/Block:1/ExpressionStatement:5/CallExpression:0 | `expect(readInputValue(container)).toBe('03/15/2024')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F27: DatePicker contract: mobile variant (pointer not fine) [v5-quirk] keyboard view (pen button) lets the user type a date; only the complete date is emitted

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:1045. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:1044 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(typed).not.toBeNull()` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:1050 / test/ArrowFunction:2/Block:2/ExpressionStatement:9/CallExpression:0 | `expect(spy.mock.calls).toEqual([[ms(2024, 3, 27)]])` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:1051 / test/ArrowFunction:2/Block:2/ExpressionStatement:10/CallExpression:0 | `expect(readInputValue(container)).toBe('03/27/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F28: mobile keyboard respects the locale format when toggled back from calendar

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:33. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:32 / test/ArrowFunction:2/Block:2/ExpressionStatement:7/CallExpression:0 | `expect(input).toHaveValue('15.03.2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:35 / test/ArrowFunction:2/Block:2/ExpressionStatement:10/CallExpression:0 | `expect(onChange.mock.calls).toEqual([[moment('2024-03-27').valueOf()]])` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:37 / test/ArrowFunction:2/Block:2/ExpressionStatement:12/CallExpression:0 | `expect(dialog.queryByRole('grid')).not.toBeNull()` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F29: an externally restored previously typed date refreshes the field

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:73. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:76 / test/ArrowFunction:2/Block:2/ExpressionStatement:6/CallExpression:0 | `expect(input).toHaveValue('03/20/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:78 / test/ArrowFunction:2/Block:2/ExpressionStatement:8/CallExpression:0 | `expect(input).toHaveValue('03/22/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:80 / test/ArrowFunction:2/Block:2/ExpressionStatement:10/CallExpression:0 | `expect(input).toHaveValue('03/20/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F30: a locale change reformats a date after controlled typing

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:96. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:99 / test/ArrowFunction:2/Block:2/ExpressionStatement:6/CallExpression:0 | `expect(input).toHaveValue('03/20/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:101 / test/ArrowFunction:2/Block:2/ExpressionStatement:8/CallExpression:0 | `expect(input).toHaveValue('20.03.2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F31: '{Backspace}' at a separator preserves the date, payload and caret

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:135. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:135 / test/ArrowFunction:2/Block:3/ExpressionStatement:4/CallExpression:0 | `expect(input).toHaveValue('03/15/2024')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:136 / test/ArrowFunction:2/Block:3/ExpressionStatement:5/CallExpression:0 | `expect(input.selectionStart).toBe(caret)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:137 / test/ArrowFunction:2/Block:3/ExpressionStatement:6/CallExpression:0 | `expect(input.selectionEnd).toBe(caret)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:138 / test/ArrowFunction:2/Block:3/ExpressionStatement:7/CallExpression:0 | `expect(onChange).not.toHaveBeenCalled()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |

Action classification: **LEGACY-EDITOR ACTION** — raw separator caret deletion → navigation/noop at section boundary, zero callback remains protected.

### F32: '{Delete}' at a separator preserves the date, payload and caret

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:135. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:135 / test/ArrowFunction:2/Block:3/ExpressionStatement:4/CallExpression:0 | `expect(input).toHaveValue('03/15/2024')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:136 / test/ArrowFunction:2/Block:3/ExpressionStatement:5/CallExpression:0 | `expect(input.selectionStart).toBe(caret)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:137 / test/ArrowFunction:2/Block:3/ExpressionStatement:6/CallExpression:0 | `expect(input.selectionEnd).toBe(caret)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:138 / test/ArrowFunction:2/Block:3/ExpressionStatement:7/CallExpression:0 | `expect(onChange).not.toHaveBeenCalled()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |

Action classification: **LEGACY-EDITOR ACTION** — raw separator caret deletion → navigation/noop at section boundary, zero callback remains protected.

### F33: [v5-quirk] digit insertion after '{Backspace}' keeps the legacy mask and caret

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:151. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:151 / test/ArrowFunction:2/Block:3/ExpressionStatement:5/CallExpression:0 | `expect(input).toHaveValue('03/21/5202')` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:152 / test/ArrowFunction:2/Block:3/ExpressionStatement:6/CallExpression:0 | `expect(input.selectionStart).toBe(4)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:153 / test/ArrowFunction:2/Block:3/ExpressionStatement:7/CallExpression:0 | `expect(input.selectionEnd).toBe(4)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:154 / test/ArrowFunction:2/Block:3/ExpressionStatement:8/CallExpression:0 | `expect(onChange.mock.calls).toEqual([[moment('5202-03-21').valueOf()]])` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |

Action classification: **LEGACY-EDITOR ACTION** — separator insertion shift → explicit month03/day21/year5202 in one accepted change, same one callback.

### F34: [v5-quirk] digit insertion after '{Delete}' keeps the legacy mask and caret

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:151. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:151 / test/ArrowFunction:2/Block:3/ExpressionStatement:5/CallExpression:0 | `expect(input).toHaveValue('03/21/5202')` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:152 / test/ArrowFunction:2/Block:3/ExpressionStatement:6/CallExpression:0 | `expect(input.selectionStart).toBe(4)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:153 / test/ArrowFunction:2/Block:3/ExpressionStatement:7/CallExpression:0 | `expect(input.selectionEnd).toBe(4)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:154 / test/ArrowFunction:2/Block:3/ExpressionStatement:8/CallExpression:0 | `expect(onChange.mock.calls).toEqual([[moment('5202-03-21').valueOf()]])` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |

Action classification: **LEGACY-EDITOR ACTION** — separator insertion shift → explicit month03/day21/year5202 in one accepted change, same one callback.

### F35: custom field obtains format and controlled value from picker context

Reported first failure: src/core/DatePicker/_DatePickerV8Context.spec.tsx:23. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerV8Context.spec.tsx:22 / test/ArrowFunction:2/Block:2/ExpressionStatement:3/CallExpression:0 | `expect(input).toHaveValue('15.03.2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerV8Context.spec.tsx:26 / test/ArrowFunction:2/Block:2/ExpressionStatement:7/CallExpression:0 | `expect(change).toHaveBeenLastCalledWith(moment('2024-03-20').valueOf())` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerV8Context.spec.tsx:28 / test/ArrowFunction:2/Block:2/ExpressionStatement:9/CallExpression:0 | `expect(input).toHaveValue('03/22/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F36: mobile layout obtains selected value and change action from picker context

Reported first failure: src/core/DatePicker/_DatePickerV8Context.spec.tsx:46. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerV8Context.spec.tsx:45 / test/ArrowFunction:2/Block:2/ExpressionStatement:7/CallExpression:0 | `expect(input).toHaveValue('15.03.2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerV8Context.spec.tsx:48 / test/ArrowFunction:2/Block:2/ExpressionStatement:10/CallExpression:0 | `expect(change).toHaveBeenLastCalledWith(moment('2024-03-27').valueOf())` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F37: DateTimePicker contract: onChange payload [bug-lock] typing a partial date or clearing it does not emit (falsy/NaN DatePicker payloads are ignored)

Reported first failure: src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx:195. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx:199 / test/ArrowFunction:2/Block:2/ExpressionStatement:6/CallExpression:0 | `expect(onChange).not.toHaveBeenCalled()` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F38: DateTimePicker contract: onChange payload typing a full date emits it as unix seconds (midnight)

Reported first failure: src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx:210. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx:210 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(callsOf(onChange)).toEqual([[unixSeconds(2024, 3, 20), '09:00', '2024-03-20 09:00']])` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

Shared semantic callers: getInput/readInputValue/openCalendar/expectCalendarClosed in _DatePicker.mui.spec.tsx are used by passing as well as failing cases; preserve these helpers for this first production-only repair. renderControlledMask is shared by both separator test.each groups (four concrete cases). describePayload and DateTime callsOf transform protected payloads and must remain unchanged. Any later helper change requires a full-file caller/assertion inventory before mutation. No frozen assertion/action/query changes have occurred. F15 and F38 remain production compatibility work if section-equivalent actions cannot retain their exact counts; no arbitrary callback invocation is authorized.

Later new (nonfrozen) regression failures classified BEFORE next edit: s5a-mapping-regressions has three failures, all exact-name role=group queries expecting Date after Optional restoration. DOM-only query adaptation Date → DateOptional in new AccessibleSections/V9Behavior tests; no payload/assertion expected values change. Installed DateField.js40–53 and PickersTextField label propagation expose the restored suffix in the accessible name.
[('/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePickerAccessibleSections.spec.tsx', 'uses the real accessible section editor with a hidden serialized value'), ('/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePickerV9Behavior.spec.tsx', 'full date paste publishes milliseconds, select all delete clears to undefined, external restore and locale reformat'), ('/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePickerV9Behavior.spec.tsx', 'mobile keyboard uses real editable sections with the current date')]

Name-query correction before edit: s5a-mapping-regressions-final retains the same three nonfrozen DOM-only failures: computed accessible names insert a space at the Optional span boundary (Date Optional and Pick a date Optional). Use these exact observed names; no behavior assertion changes.

## Post-mapping frozen failures, classified before further edits

The following is a new preserved RED run, not a baseline reset. No frozen file has changed. Original F identifiers are retained.

### F2: DatePicker contract: rendering [v5-quirk] input is rendered as type="tel" (numeric keyboard on mobile)

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:120. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:120 / test/ArrowFunction:2/Block:1/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('type', 'tel')` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F5: DatePicker contract: locale format pattern [v5-quirk] en_US empty field placeholder is the lower-case pattern mm/dd/yyyy

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F6: DatePicker contract: locale format pattern [v5-quirk] en_GB empty field placeholder is the lower-case pattern dd/mm/yyyy

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F7: DatePicker contract: locale format pattern [v5-quirk] de_DE empty field placeholder is the lower-case pattern dd.mm.yyyy

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F8: DatePicker contract: locale format pattern [v5-quirk] nl_NL empty field placeholder is the lower-case pattern dd-mm-yyyy

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F9: DatePicker contract: locale format pattern [v5-quirk] pl_PL empty field placeholder is the lower-case pattern yyyy-mm-dd

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F10: DatePicker contract: locale format pattern [v5-quirk] ja_JP empty field placeholder is the lower-case pattern yyyy/mm/dd

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:211. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:211 / test/ArrowFunction:2/Block:3/ExpressionStatement:1/CallExpression:0 | `expect(getInput(container).placeholder).toBe(placeholder)` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F15: DatePicker contract: onChange payload [v5-quirk] typing a full date: NaN for every incomplete keystroke, 8 calls for 10 keys

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:354. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:354 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(payloads).toEqual(['NaN', 'NaN', 'NaN', 'NaN', 'NaN', 'NaN', 'NaN', 'number'])` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F16: DatePicker contract: onChange payload [v5-quirk] typing a partial date emits NaN (invalid moment) and keeps the partial text

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:383. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:381 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(spy).toHaveBeenCalled()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:382 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0/ArrowFunction:1/CallExpression:2 | `expect(describePayload(value)).toBe('NaN')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:383 / test/ArrowFunction:2/Block:2/ExpressionStatement:6/CallExpression:0 | `expect(readInputValue(container)).toBe('03/20/')` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167,225–239 | raw partial mask → read section serialization including empty-year placeholder |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F17: DatePicker contract: onChange payload typing an impossible date keeps the text and marks the input aria-invalid

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:393. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:393 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(readInputValue(container)).toBe('13/45/2024')` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167,225–239 | 13/45/2024 raw typing → explicit 02/31/2024 sections (in-range invalid date); serialize actual sections |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:394 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(getInput(container)).toHaveAttribute('aria-invalid', 'true')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435 (hidden input lacks validation attribute; accessible editor owns it) | hidden input read → production maps actual validation state onto hidden input too; assertion bytes unchanged |

Action classification: **LEGACY-EDITOR ACTION** — out-of-range 13/45/2024 → explicit month02/day31/year2024; source numeric boundaries use currentDate:null at useFieldCharacterEditing.js:143–146, so verify day31 acceptance before choosing fallback.

### F18: DatePicker contract: onChange payload [v5-quirk] typing an impossible date emits NaN on every keystroke

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:406. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:405 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(spy).toHaveBeenCalled()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:406 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0/ArrowFunction:1/CallExpression:2 | `expect(describePayload(value)).toBe('NaN')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |

Action classification: **LEGACY-EDITOR ACTION** — out-of-range 13/45/2024 → explicit month02/day31/year2024; source numeric boundaries use currentDate:null at useFieldCharacterEditing.js:143–146, so verify day31 acceptance before choosing fallback.

### F19: DatePicker contract: onChange payload [v5-quirk] deleting one character of a complete date emits NaN

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:417. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:417 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(spy.mock.calls.map(([value]) => describePayload(value))).toEqual(['NaN'])` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:418 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(readInputValue(container)).toBe('03/20/202')` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167,225–239 | raw End/Backspace → clear year section for one invalid publication; read incomplete sections |

Action classification: **LEGACY-EDITOR ACTION** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F20: DatePicker contract: onChange payload clearing the input emits undefined (null?.valueOf()), not null

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:425. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:427 / test/ArrowFunction:2/Block:2/ExpressionStatement:3/CallExpression:0 | `expect(spy.mock.calls.map(([value]) => describePayload(value))).toEqual(['undefined'])` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:428 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(readInputValue(container)).toBe('')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F21: DatePicker contract: open / close click anywhere on the field wrapper (not only the <input>) opens the calendar

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:463. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:463 / test/ArrowFunction:2/Block:2/ExpressionStatement:2/AwaitExpression:0/CallExpression:0/ArrowFunction:1/CallExpression:1 | `expect(queryCalendar()).not.toBeNull()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldState.js:267–308 (section publication/controlled state) | existing interaction → closest real section interaction; assertion bytes unchanged |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F39: DatePicker contract: open / close field is shown as focused while the calendar is open and not focused once it closes

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:494. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:486 / test/ArrowFunction:2/Block:2/ExpressionStatement:2/CallExpression:0 | `expect(isFieldFocused()).toBe(false)` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:430–433 (hidden-input focus redirects to section root); internals/components/PickerFieldUI.js:104–108 (trigger focus path) | Escape closes calendar and restores field focus → retain exact focus assertions; production explicit focused=isOpen mapping needs nonfrozen regression before repair |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:489 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(container.contains(document.activeElement)).toBe(false)` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:430–433 (hidden-input focus redirects to section root); internals/components/PickerFieldUI.js:104–108 (trigger focus path) | Escape closes calendar and restores field focus → retain exact focus assertions; production explicit focused=isOpen mapping needs nonfrozen regression before repair |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:490 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(isFieldFocused()).toBe(true)` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:430–433 (hidden-input focus redirects to section root); internals/components/PickerFieldUI.js:104–108 (trigger focus path) | Escape closes calendar and restores field focus → retain exact focus assertions; production explicit focused=isOpen mapping needs nonfrozen regression before repair |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:494 / test/ArrowFunction:2/Block:2/ExpressionStatement:8/CallExpression:0 | `expect(isFieldFocused()).toBe(false)` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:430–433 (hidden-input focus redirects to section root); internals/components/PickerFieldUI.js:104–108 (trigger focus path) | Escape closes calendar and restores field focus → retain exact focus assertions; production explicit focused=isOpen mapping needs nonfrozen regression before repair |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F26: DatePicker contract: mobile variant (pointer not fine) [v5-quirk] the field is a read-only text input labelled "Choose date, selected date is ..."

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:948. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:947 / test/ArrowFunction:2/Block:1/ExpressionStatement:2/CallExpression:0 | `expect(input).toHaveAttribute('readonly')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:430–433 (hidden-input focus redirects to section root); internals/components/PickerFieldUI.js:104–108 (trigger focus path) | Escape closes calendar and restores field focus → retain exact focus assertions; production explicit focused=isOpen mapping needs nonfrozen regression before repair |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:948 / test/ArrowFunction:2/Block:1/ExpressionStatement:3/CallExpression:0 | `expect(input).toHaveAttribute('type', 'text')` | DOM-only | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:390–435 (sections and hidden serialization input) | raw input/caret/placeholder → section DOM, numeric inputMode, active section and section placeholders |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:949 / test/ArrowFunction:2/Block:1/ExpressionStatement:4/CallExpression:0 | `expect(input).toHaveAccessibleName('Choose date, selected date is Mar 15, 2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:430–433 (hidden-input focus redirects to section root); internals/components/PickerFieldUI.js:104–108 (trigger focus path) | Escape closes calendar and restores field focus → retain exact focus assertions; production explicit focused=isOpen mapping needs nonfrozen regression before repair |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:950 / test/ArrowFunction:2/Block:1/ExpressionStatement:5/CallExpression:0 | `expect(readInputValue(container)).toBe('03/15/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:430–433 (hidden-input focus redirects to section root); internals/components/PickerFieldUI.js:104–108 (trigger focus path) | Escape closes calendar and restores field focus → retain exact focus assertions; production explicit focused=isOpen mapping needs nonfrozen regression before repair |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F27: DatePicker contract: mobile variant (pointer not fine) [v5-quirk] keyboard view (pen button) lets the user type a date; only the complete date is emitted

Reported first failure: src/core/DatePicker/_DatePicker.mui.spec.tsx:1045. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePicker.mui.spec.tsx:1044 / test/ArrowFunction:2/Block:2/ExpressionStatement:4/CallExpression:0 | `expect(typed).not.toBeNull()` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:1050 / test/ArrowFunction:2/Block:2/ExpressionStatement:9/CallExpression:0 | `expect(spy.mock.calls).toEqual([[ms(2024, 3, 27)]])` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePicker.mui.spec.tsx:1051 / test/ArrowFunction:2/Block:2/ExpressionStatement:10/CallExpression:0 | `expect(readInputValue(container)).toBe('03/27/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F28: mobile keyboard respects the locale format when toggled back from calendar

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:33. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:32 / test/ArrowFunction:2/Block:2/ExpressionStatement:7/CallExpression:0 | `expect(input).toHaveValue('15.03.2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:35 / test/ArrowFunction:2/Block:2/ExpressionStatement:10/CallExpression:0 | `expect(onChange.mock.calls).toEqual([[moment('2024-03-27').valueOf()]])` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:37 / test/ArrowFunction:2/Block:2/ExpressionStatement:12/CallExpression:0 | `expect(dialog.queryByRole('grid')).not.toBeNull()` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F29: an externally restored previously typed date refreshes the field

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:73. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:76 / test/ArrowFunction:2/Block:2/ExpressionStatement:6/CallExpression:0 | `expect(input).toHaveValue('03/20/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:78 / test/ArrowFunction:2/Block:2/ExpressionStatement:8/CallExpression:0 | `expect(input).toHaveValue('03/22/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:80 / test/ArrowFunction:2/Block:2/ExpressionStatement:10/CallExpression:0 | `expect(input).toHaveValue('03/20/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F30: a locale change reformats a date after controlled typing

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:96. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:99 / test/ArrowFunction:2/Block:2/ExpressionStatement:6/CallExpression:0 | `expect(input).toHaveValue('03/20/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:101 / test/ArrowFunction:2/Block:2/ExpressionStatement:8/CallExpression:0 | `expect(input).toHaveValue('20.03.2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F31: '{Backspace}' at a separator preserves the date, payload and caret

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:135. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:135 / test/ArrowFunction:2/Block:3/ExpressionStatement:4/CallExpression:0 | `expect(input).toHaveValue('03/15/2024')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:136 / test/ArrowFunction:2/Block:3/ExpressionStatement:5/CallExpression:0 | `expect(input.selectionStart).toBe(caret)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:137 / test/ArrowFunction:2/Block:3/ExpressionStatement:6/CallExpression:0 | `expect(input.selectionEnd).toBe(caret)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:138 / test/ArrowFunction:2/Block:3/ExpressionStatement:7/CallExpression:0 | `expect(onChange).not.toHaveBeenCalled()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |

Action classification: **LEGACY-EDITOR ACTION** — raw separator caret deletion → navigation/noop at section boundary, zero callback remains protected.

### F32: '{Delete}' at a separator preserves the date, payload and caret

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:135. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:135 / test/ArrowFunction:2/Block:3/ExpressionStatement:4/CallExpression:0 | `expect(input).toHaveValue('03/15/2024')` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:136 / test/ArrowFunction:2/Block:3/ExpressionStatement:5/CallExpression:0 | `expect(input.selectionStart).toBe(caret)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:137 / test/ArrowFunction:2/Block:3/ExpressionStatement:6/CallExpression:0 | `expect(input.selectionEnd).toBe(caret)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:138 / test/ArrowFunction:2/Block:3/ExpressionStatement:7/CallExpression:0 | `expect(onChange).not.toHaveBeenCalled()` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldRootProps.js:65–120 (section selection/delete, no separator caret editor) | caret separator delete → section separator navigation/noop, preserving original date and zero callback intent; raw carets → active section |

Action classification: **LEGACY-EDITOR ACTION** — raw separator caret deletion → navigation/noop at section boundary, zero callback remains protected.

### F33: [v5-quirk] digit insertion after '{Backspace}' keeps the legacy mask and caret

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:151. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:151 / test/ArrowFunction:2/Block:3/ExpressionStatement:5/CallExpression:0 | `expect(input).toHaveValue('03/21/5202')` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:152 / test/ArrowFunction:2/Block:3/ExpressionStatement:6/CallExpression:0 | `expect(input.selectionStart).toBe(4)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:153 / test/ArrowFunction:2/Block:3/ExpressionStatement:7/CallExpression:0 | `expect(input.selectionEnd).toBe(4)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:154 / test/ArrowFunction:2/Block:3/ExpressionStatement:8/CallExpression:0 | `expect(onChange.mock.calls).toEqual([[moment('5202-03-21').valueOf()]])` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |

Action classification: **LEGACY-EDITOR ACTION** — separator insertion shift → explicit month03/day21/year5202 in one accepted change, same one callback.

### F34: [v5-quirk] digit insertion after '{Delete}' keeps the legacy mask and caret

Reported first failure: src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:151. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:151 / test/ArrowFunction:2/Block:3/ExpressionStatement:5/CallExpression:0 | `expect(input).toHaveValue('03/21/5202')` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:152 / test/ArrowFunction:2/Block:3/ExpressionStatement:6/CallExpression:0 | `expect(input.selectionStart).toBe(4)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:153 / test/ArrowFunction:2/Block:3/ExpressionStatement:7/CallExpression:0 | `expect(input.selectionEnd).toBe(4)` | DOM-only | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx:154 / test/ArrowFunction:2/Block:3/ExpressionStatement:8/CallExpression:0 | `expect(onChange.mock.calls).toEqual([[moment('5202-03-21').valueOf()]])` | BEHAVIOUR | @mui/x-date-pickers/internals/hooks/useField/useFieldCharacterEditing.js:135–167; useFieldSectionContentProps.js:106–135 | separator delete + digit-shift → atomic accepted full-date change 03/21/5202 through hidden input (or section paste), no spy clearing; retain single exact year5202 callback |

Action classification: **LEGACY-EDITOR ACTION** — separator insertion shift → explicit month03/day21/year5202 in one accepted change, same one callback.

### F35: custom field obtains format and controlled value from picker context

Reported first failure: src/core/DatePicker/_DatePickerV8Context.spec.tsx:23. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerV8Context.spec.tsx:22 / test/ArrowFunction:2/Block:2/ExpressionStatement:3/CallExpression:0 | `expect(input).toHaveValue('15.03.2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerV8Context.spec.tsx:26 / test/ArrowFunction:2/Block:2/ExpressionStatement:7/CallExpression:0 | `expect(change).toHaveBeenLastCalledWith(moment('2024-03-20').valueOf())` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerV8Context.spec.tsx:28 / test/ArrowFunction:2/Block:2/ExpressionStatement:9/CallExpression:0 | `expect(input).toHaveValue('03/22/2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F36: mobile layout obtains selected value and change action from picker context

Reported first failure: src/core/DatePicker/_DatePickerV8Context.spec.tsx:46. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DatePicker/_DatePickerV8Context.spec.tsx:45 / test/ArrowFunction:2/Block:2/ExpressionStatement:7/CallExpression:0 | `expect(input).toHaveValue('15.03.2024')` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |
| src/core/DatePicker/_DatePickerV8Context.spec.tsx:48 / test/ArrowFunction:2/Block:2/ExpressionStatement:10/CallExpression:0 | `expect(change).toHaveBeenLastCalledWith(moment('2024-03-27').valueOf())` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F37: DateTimePicker contract: onChange payload [bug-lock] typing a partial date or clearing it does not emit (falsy/NaN DatePicker payloads are ignored)

Reported first failure: src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx:195. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx:199 / test/ArrowFunction:2/Block:2/ExpressionStatement:6/CallExpression:0 | `expect(onChange).not.toHaveBeenCalled()` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

### F38: DateTimePicker contract: onChange payload typing a full date emits it as unix seconds (midnight)

Reported first failure: src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx:210. Inventory includes all direct/nested assertions in this test callback; parameter instances retain separate rows.

| Original file:line / AST path | Exact assertion | Category | Installed v9 cause | Old action → planned action |
|---|---|---|---|---|
| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx:210 / test/ArrowFunction:2/Block:2/ExpressionStatement:5/CallExpression:0 | `expect(callsOf(onChange)).toEqual([[unixSeconds(2024, 3, 20), '09:00', '2024-03-20 09:00']])` | BEHAVIOUR | @mui/x-date-pickers/PickersTextField/PickersInputBase/PickersInputBase.js:419–435; internals/hooks/useField/useFieldSectionContentProps.js:106–135 | clear/type hidden input → editable select-all/Delete then sections, or full-value hidden-input change; preserve callbacks/counts/locale/restoration byte-identically |

Action classification: **DOM-only** — hidden raw input focus/clear/type or wrapper query → real section editor targeting for the same test intent; callback assertions cannot be edited.

## Current implementation handoff — incomplete source milestone

Production repairs in this continuation: translated Optional suffix; nested public
slotProps.textField.slotProps.htmlInput autoComplete=off; disableOpenPicker=true;
DateField onError maps actual picker validation to the genuine hidden serialization
input aria-invalid. Real styled DateField/PickersTextField/SectionList remain default.
Rejected-input dedup is retained. Public DatePickerProps and value units unchanged.

TDD evidence: s5a-field-mapping-red-each captures all three mapping regressions RED
(raw/reported1,3.545593s), s5a-field-mapping-green-nested captures3 PASS
(0,3.740893s). Initial red and wrong-slot intermediate failure retained.
Validation new regression first RED s5a-validation-mapping-red (1,3.562904s), then
s5a-validation-mapping-green20 PASS including prior16 and new4 (0,7.532146s).
Intermediate name-query failures remain in s5a-mapping-regressions/-final; observed
names corrected only in new nonfrozen tests. s5a-mapping-regressions-observed-names
19 PASS (0,7.545987s) predates the added validation regression.
Dedicated Bundler types and changed/new-test lint: s5a-validation-static,
raw/reported0 both,3.476528s/1.432348s (lint autofix formatting/imports only).

Focused frozen source: s5a-frozen-after-mapping,168 PASS/28 FAIL,6 files/196 tests,
raw/reported1,26.281258s. Both range files remain GREEN. This is NOT source GREEN.
New focus behavior failure F39 is inventoried above before any further edit; no
repair is claimed. Existing payload/count failures F15/F18/F19/F38 remain unresolved,
not waived and not proved impossible. DOM/action conversions and whole-file AST
proofs remain outstanding. No behavioral exception or independent-review pass claimed.

All commands bounded_runner.run1800/inhibit=True, Node20.19.5, one worker,
no file parallelism, default+JSON fresh reports, mach_continuous_time/resources,
raw/reported statuses and inhibitors reaped. C1 Auto652/682/731 NOT INCLUDED.
No timeouts or duration triggers. No browser/full/type initial captures rerun.
No frozen edit, approval-chain expansion, dependency/config/install/lock operation,
version bump, S5b, package/full gates, agents/checkouts, commit/push/PR/CR occurred.
Original492/490/S4b485 inventories and existing three approvals remain untouched.
Styled react-is installed19.3.1 vs lock19.2.6 remains PENDING. Broader peer/type/WP/
runtime-subpath/browser-policy limits remain visible. No hard behavior blocker is
asserted: implementation remains unfinished and ROOT review is not yet requested.

## Authorized two-spec DOM adaptation (2026-11-05)

Completed Compatibility and V8Context only, with transparent date-picker-sections.test-helper
and new nonfrozen V9Separator spec. No production change was needed. F33/F34 line151
classification corrected BEFORE edits to DOM-only;152/153 remain DOM-only;154 exact
5202 callback remains BEHAVIOUR and byte-identical. Original accepted archive5335 and
490/492 snapshots retained. Before copies in out/s5a-two-spec-dom/before were verified
byte-identical against the corresponding accepted-inputs.tar.gz entries. Approval JSON
extends the old Compatibility S3 mock approval through prior_approval, retaining its hashes.

Installed v9 causes: PickersInputBase.js390–435 places serialization in aria-hidden input;
useFieldSectionContentProps.js68–100 consumes section input events,106–130 handles full
formatted paste,136–140 selects sections. useFieldRootHandleKeyDown.js65–120 implements
section navigation/deletion rather than raw separator caret positions.

Old → new actions (exact AST paths and old/new source in ast-allowlist.json):
- Mobile raw-input click → real field group click; dialog input query → dialog-scoped hidden serialization input.
- Clear/focus/03202024 → full formatted 03/20/2024 paste into actual focused section.
- Locale 20032024 → 20.03.2024 paste; mobile clear/type27.03.2024 → one formatted section paste.
- Partial raw032 → three real section input events032, retaining exact three NaN callbacks.
- Backspace at separator/start3 → day section ArrowLeft; Delete/start2 → month ArrowRight.
  Each preserves03/15/2024 and zero callbacks, with selected section03/15 respectively.
- Both insertion parameters: separator navigation then ONE full formatted03/21/5202 paste;
  no spy clear/refill/rebased calls. Exact [[moment('5202-03-21').valueOf()]] retained.
  Raw caret4 expectations now assert selected month03 and the three-section editor.

Proof: `node out/s5a-two-spec-dom/audit.cjs` reproduces whole-file AST comparison against
explicit path+before+after allowlist; all unmatched nodes outside it fail. ast-proof.json
includes every assertion node.getText and test scope. per-case-assertions.json expands
Backspace/Delete independently. Compatibility17 assertion templates:12 behavior unchanged,
4 caret DOM replacements,1 query-only serialized-input replacement (same exact value).
V8Context7/7 behavior assertions byte-identical. Count, payload, locale, restoration,
validation/ref expectations were not changed. Existing titles retained as historical labels.

TDD: known DOM RED already captured in s5a-frozen-after-mapping168/28; not recaptured.
First changed candidate12/12 GREEN, raw/reported0,8.310069s. New separator regression
pins existing v9 no-digit-shift/navigation behavior for both parameters,2/2 GREEN; no new
production bug/fix and no fabricated RED. Final scoped run14/14 GREEN, raw/reported0,
6.777723s; JSON/default reports in out/s5a-two-spec-dom. Scoped Bundler types0/0,
3.616692s. Scoped lint0/0,2.252644s,3 duplicate-literal warnings. Earlier lint found
four require-await errors after synchronous action replacement; removed redundant async
modifiers, then reran functionally changed candidate. Earlier intermediate14/14 also passed
(6.864623s); final report replaces that intermediate report. No unchanged test retry.
All validation used bounded_runner.run1800/inhibit=True, mach_continuous_time, Node20.19.5,
one worker/no file parallelism; inhibitors reaped, no timeout. C1 Auto652/682/731 NOT INCLUDED.

Intentional migration: v9 separators are presentation spans. Navigate from day to month
with ArrowLeft or month to day with ArrowRight; separator navigation preserves digits and
publishes nothing. To replace a full date, paste its locale-formatted value into a section.
Legacy raw separator deletion/digit-shifting and numerical caret positions are not v9 actions.

Remaining ROOT work: main DatePicker spec, DateTime/browser buckets, package/full gates,
independent classification/diff review. Frozen168/28 is the retained pre-adaptation baseline,
not a new full-suite result. This scoped phase is GREEN; S5a overall is incomplete.
No installs, lock reconciliation, version bump, S5b, commits/pushes/PRs/CR messages,
subagents/checkouts, orphan-process or power-setting changes. Styled react-is discrepancy
remains PENDING. No review-ready claim or behavioral exception.

## Main-spec candidate classifications before further edits (2026-11-05)

Candidate1 114/13 and candidate2 120/7 are retained in out/s5a-main-dom.
F5–F10 placeholder read: DOM-only; serialization is empty when no sections are set,
PickersInputBase.js390–435. Old raw placeholder → visible group section text, retaining
locale pattern expectation. F37 clear then partial: LEGACY-EDITOR ACTION; select-all
leaves root editable and spinbutton roles absent (useFieldRootProps.js65–100).
Old clear/type → select-all/Delete/ArrowLeft to select first section, then real inputs.
F15 exact seven NaN/one number remains BEHAVIOUR; numeric year sections publish valid
years before four digits (useFieldCharacterEditing.js135–167, useFieldState.js267–308).
F16/F17 first month disappears after controlled NaN echo; current candidate's DOM
expectations remain intended month03/month02; no weakening to MM. F17 aria-invalid
remains protected. F19 NaN payload remains BEHAVIOUR; Delete with all sections selected
clears value (useFieldRootProps.js109–120), requiring explicit year selection.
F39 close focus remains BEHAVIOUR and unchanged. F26 readonly and accessible name
remain BEHAVIOUR; type=text is DOM-only. No hidden-input readonly assertion is accepted
as evidence for the real mobile editor. These unresolved paths require production
regressions or escalation; no behavior change authorized by their classification.

F37 candidate3 now reaches protected zero-callback assertion but gets two valid changes:
controlled DateTime ignores the clear and retains its complete date, so editing month
publishes complete dates. BEHAVIOUR assertion remains byte-identical. Before next edit:
LEGACY-EDITOR ACTION clear+raw partial typing → genuine hidden-input onChange for partial
formatted value; PickersInputBase.js419–435 forwards onChange on the serialization input.
This API is explicitly authorized; ordinary time Select input remains untouched.

## OS-confirmed sleep invalidity and runner repair — root

The ~925second mobile Cancel result in worktree `out/s5a-main-dom/process.json` is **sleep-invalid**,
not a product RED or flake, and provides no Cancel correctness evidence. Overseer verified read-only
pmset OS lines:20:36:28 "Entering Sleep state due to 'Clamshell Sleep' … Using AC"; subsequent maintenance
sleep windows21:11:59–21:27:29(930s),21:29:38–21:45:05(927s),and adjacent969s interval. The924.751540s
case and935s resource-sampler gap match that clamshell maintenance cycle. PreventSystemSleep0; scoped
idle inhibitor cannot prevent lid sleep. Original raw1/reported1 elapsed940.257752/wall940.250577 remains
unaltered historical process metadata, now explicitly invalid as evidence.

Root added gate-only sleep validity: active mach_absolute_time (CLOCK_MONOTONIC off Darwin) next to
suspend-inclusive deadline clock, run-window pmset events, sleep delta and distinct outcome/validity.
Delta>5s or any recorded Sleep event reports125/SLEEP-INVALID, preserving actual raw exit and deadline
status. Synthetic completed real child raw0 with injected continuous6s/absolute0 first falsely passed
(oldrunner0): intended selftest RED; afterrepair reported125/SLEEP-INVALID:GREEN. Lightweight1test0.022s,
logs /tmp/mui-upgrade/s5a-sleep-selftest-{red,green}. Existing over-budget synthetic-suspend test expectation
updated to the new invalidity classification; regular deadline behavior remains124 when awake. No heavy
suite/coverage/package or Cancel retry was run for this tooling work. Global powersettings/orphans untouched.

Worker instructed to stop heavy runs while clamshell/maintenance sleep persists, continue pure authorized
source edits only. Once display on/noSleep5+minutes is confirmed, only Cancel plus scopedDatePicker/
DateTime set once is authorized before resuming the wider workflow; a genuine awake hang escalates without
timeout increase. Source/tooling readiness and complete runner checks remain pending awake-host evidence.

## Narrow overseer changes and host-sleep hold — main source candidate

**UNTESTED AFTER PRODUCTION EDITS. Not GREEN, review-ready, stage acceptance or S5b.**
No new heavy run will start until host awake >=5 minutes without a Sleep event and display ON.
The last main run is **SLEEP-INVALID**, not a product RED/flake: overseer supplied OS events
clamshell Sleep20:36:28; maintenance Sleep21:29:38→21:45:05(927s), adjacent930/969s
intervals matching924.751540s mobile Cancel duration and935s sampler gap. Raw bounded
status1/1,940.257752continuous seconds remains in candidate4 artifacts; these provide
NO evidence for Cancel pass/fail. sleep-validity.json records that classification.
No retry/timeout raise/power change, polling/scheduling, runner edit or orphan intervention.
ROOT owns the runner sleep-validity repair. The short regression run already completed
before the hold was observed (no owned run remained); its host validity is not independently
certified here. Final awake RED/GREEN validation is still required.

Pure source changes now implement stable MUI value identity when an incoming NaN echoes
our last invalid emission. Genuine external numeric/null changes create a new controlled
value and resync. Installed useControlledValue.js53 memoizes by incoming identity;
useFieldState.js320–338 rebuilds sections when value!==lastExternalValue; date-utils.js78–83
considers two invalid dates equal for value comparisons, while null and invalid differ.
Previously rebuilding moment(NaN) reset edited sections; incoming invalid echo now retains
the prior external Moment/null reference. No raw editor/mask or public type change.
New _DatePickerMainMigration.spec.tsx first captured intended echo and impossible-date
REDs, then production was edited; GREEN is deliberately pending host readiness.
Mobile genuine group name restored with public textField.slotProps.input aria-label and
mobile Enter routed to opening. Its new regression first failed finding that named group;
post-fix validation pending. Readonly checks target actual spinbuttons, and new regression
asserts contenteditable=false, rejected typing and opening; no hidden-input laundering.

Narrow authorized assertion changes (all original lines refer to accepted S5a bytes):

| File/line | Category and installed cause | Old → candidate |
|---|---|---|
| DatePicker.mui:354 F15 | explicit overseer-approved quirk change; useFieldCharacterEditing.js135–167/useFieldState.js267–308 | seven NaN + number → four NaN + four numbers, years0002/0020/0202/2024 pinned by new regression before frozen edit |
| DatePicker.mui:417 F19 | explicit approved quirk change; useFieldRootProps.js109–120 | [NaN] → [undefined]; existing public callback allows undefined; old raw deletion → v9 Delete clearing unselected field |
| DatePicker.mui:418 F19 | DOM serialization | 03/20/202 → empty after the approved clear action |
| DatePicker.mui:494 F39 | approved actual focus-return policy; PickersInputBase.js430–433 | post-Escape no ring → genuine group contains activeElement and ring, then outside click removes ring; new regression proved actual focus return before frozen edit |
| DatePicker.mui:947 F26 | DOM semantic readonly mapping; useFieldSectionContentProps.js156,165–166 | readonly attribute on raw input → actual spinbuttons aria-readonly; same readonly intent, typing rejection added in nonfrozen regression |
| DatePicker.mui:948 F26 | DOM-only | type=text → actual role=group; accessible-name expectation byte-identical |

F16 partial03/20/YYYY and F17 impossible02/31/2024/aria-invalid=true remain unchanged
from the intended section adaptations. No F16 payload flip was used. Invalid payload
assertions, locale expectations, callback counts outside F15/F19, restore and refs remain.
DateTime45/45 assertion templates byte-identical. DatePicker156/165 original templates
byte-identical; nine explicitly mapped DOM/narrow approved replacements plus two focus
assertions added. Exact source before/after, scope, original/new AST paths, SHA and
installed causes: out/s5a-main-dom/{ast-allowlist.json,ast-proof.json,per-assertion-classification.json}.
audit.cjs compares the whole file against that explicit allowlist and fails outside it;
accepted before copies reverified against original5335 archive. Approved frozen JSON adds
main-file entries retaining all earlier S3/S4/two-spec approvals. No accepted baseline reset.
The completed two compatibility specs/proofs were not edited or rerun.

Pre-production candidate1 raw1/1 17.642340s; candidate2 raw1/1 15.039988s;
candidate3 raw1/1 15.113449s. Earlier main scope120 PASS/7 FAIL retained honestly.
Pre-production Bundler types0/0 4.145520s and lint0/0 1.946384s (19 warnings).
Those static results do not validate the later production/new-regression edits.
New regression intended-red run raw1/1 4.689518s:2 intended echo failures,3 passes;
mobile-red run raw1/1 4.238319s: same2 echo failures plus intended named-mobile-group
failure; intermediate year, undefined clear and actual focus return3 PASS.
Each used Node20.19.5, bounded_runner.run1800/inhibit=True, mach_continuous_time,
one worker/no parallel files, fresh default+JSON and reaped inhibitors. No timeout flag;
C1 Auto652/682/731 NOT INCLUDED throughout. Sleep validity caveat above takes precedence.

Next awake work: new/changed regression and helper, mobile Cancel and both main files once,
scoped Bundler types/lint with new regression included; only changed-candidate iterations
if genuine failures, with classification first. Broader browser/range/package/docs/style/
independent review/full gates remain ROOT work. Range/public props unchanged. Existing
ordinary missing-locale type error untouched. Styled react-is discrepancy still PENDING.
No installs/dependency/version work, S5b/full gates, agents/checkouts, commit/push/PR/CR.

Additional pure helper fix under sleep hold: dateSection now handles the genuine
select-all state by ArrowLeft on the actual editable list root, then re-queries the
restored spinbuttons. It never treats an ordinary time/select input as a date editor.
A new nonfrozen helper navigation regression is written; it has NOT run. This final
helper edit is also unvalidated pending wake. Existing compatibility proof files remain
untouched; their next relevant regression run belongs to the changed-helper validation.

## Root read-only handoff / sleep hold continuation

Received pure-source milestone: latest echo/mobile/helper edits intentionally untested, no heavy run
active. Read source/proof handoff without launching suites. Read-only display readiness query
`pmset -g powerstate IODisplayWrangler` returned an internal failure; ioreg exposed no usable power
state. Display-on condition therefore remains unconfirmed; heavy hold retained, not inferred awake
from successful tool execution. No power setting changed.

Draft consumer migration note added at agentic-plans/mui-v9-consumer-migration.md from actual current
helper/source observations. It distinguishes genuine sections vs hidden serialization, unsupported
wrapper onAccept/onBlur from upstream MUI APIs, exact public undefined clear vs partial NaN, intermediate
years and approved focus behaviour. It explicitly remains a candidate draft pending validation/review.
Final QA inventory and all source proofs still need independent review; no GREEN claim from documentation.

Read-only host check2026-11-06T01:44:31+02:00 confirms hold remains: IOPMrootDomain
AppleClamshellState=Yes; pmset last entries01:28:10 Maintenance Sleep935s,
01:43:45 DarkWake Maintenance45s,01:44:30 Entering Sleep state due to Maintenance Sleep.
No5minute awake/display-on evidence. No heavy test/static/coverage/package run started.


## Authorized awake scoped validation — 2026-11-06 10:12 EET

STOPPED ON SLEEP-VALID RED; no acceptance. Fresh artifacts: `out/s5a-awake-scoped-d59304d8-e30e-474d-87cf-ff801c50f459`. Controller `/tmp/mui-upgrade/awake-scoped.py` imported actual checked-gate bounded_runner.run, timeout1800, inhibit=True, SERIAL one worker/no file parallelism. No retries.

Readiness before start: 2026-11-06T10:12:31+02:00; 10:12  up 2 days,  1:17, 1 user, load averages: 6.57 7.46 6.93. AppleClamshellState=No. Full OS pmset log, power settings, process contention in readiness.json. Protected processes untouched.

Contention snapshot: `84651     1   0.0  23200 node shot.mjs real CustomVisualization endless-loop  9000`.

Contention snapshot: `85414 84651   0.0  28272 /Users/a.kott/Library/Caches/ms-playwright/chromium_headless_shell-1148/chrome-mac/headless_shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=ImprovedCookieControls,LazyFrameLoading,GlobalMediaControls,DestroyProfileOnBrowserClose,MediaRouter,DialMediaRouteProvider,AcceptCHFrame,AutoExpandDetailsElement,CertificateTransparencyComponentUpdater,AvoidUnnecessaryBeforeUnloadCheckSync,Translate,HttpsUpgrades,PaintHolding,ThirdPartyStoragePartitioning,LensOverlay,PlzDedicatedWorker --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --enable-automation --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --enable-use-zoom-for-dsf=false --use-angle --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/var/folders/x2/6gqsgk2x4jn20frp7j89pybh0000gn/T/playwright_chromiumdev_profile-Cfz147 --remote-debugging-pipe --no-startup-window`.

Contention snapshot: `85417 85414  99.0  19808 /Users/a.kott/Library/Caches/ms-playwright/chromium_headless_shell-1148/chrome-mac/headless_shell --type=renderer --headless=old --no-sandbox --disable-back-forward-cache --disable-background-timer-throttling --disable-breakpad --enable-automation --force-color-profile=srgb --remote-debugging-pipe --allow-pre-commit-input --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --disable-databases --lang=en-US --num-raster-threads=4 --enable-zero-copy --enable-gpu-memory-buffer-compositor-resources --enable-main-frame-before-activation --renderer-client-id=4 --time-ticks-at-unix-epoch=-1793259410962199 --launch-time-ticks=25575651828 --shared-files --field-trial-handle=1718379636,r,776843522629781331,9952218337547958738,262144 --disable-features=AcceptCHFrame,AutoExpandDetailsElement,AvoidUnnecessaryBeforeUnloadCheckSync,CertificateTransparencyComponentUpdater,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,ImprovedCookieControls,LazyFrameLoading,LensOverlay,MediaRouter,PaintHolding,PlzDedicatedWorker,ThirdPartyStoragePartitioning,Translate --variations-seed-version`.

Last OS sleep/wake events:
```text
2026-11-06 10:09:22 +0200 Assertions          	PID 525(Google Chrome) Released NoDisplaySleepAssertion "Blink Wake Lock" 00:03:56  id:0x0x500009d4d [System: PrevIdle PrevDisp DeclUser IntPrevDisp kDisp]          
2026-11-06 10:09:22 +0200 Assertions          	PID 525(Google Chrome) Released NoDisplaySleepAssertion "Video Wake Lock" 00:03:53  id:0x0x500009d50 [System: PrevIdle PrevDisp DeclUser IntPrevDisp kDisp]          
2026-11-06 10:09:22 +0200 Assertions          	PID 525(Google Chrome) Released NoDisplaySleepAssertion "Video Wake Lock" 00:03:53  id:0x0x500009d4f [System: PrevIdle DeclUser IntPrevDisp kDisp]          
2026-11-06 10:11:11 +0200 Assertions          	PID 525(Google Chrome) Created NoDisplaySleepAssertion "Blink Wake Lock" 00:00:00  id:0x0x500009de5 [System: PrevIdle PrevDisp DeclUser IntPrevDisp kDisp]          
2026-11-06 10:11:14 +0200 Assertions          	PID 525(Google Chrome) Created NoDisplaySleepAssertion "Video Wake Lock" 00:00:00  id:0x0x500009de7 [System: PrevIdle PrevDisp DeclUser IntPrevDisp kDisp]          
```

Exact command:
```sh
/Users/a.kott/.nvm/versions/node/v20.19.5/bin/node node_modules/vitest/vitest.mjs run --project spec src/core/DatePicker/_DatePicker.mui.spec.tsx -t 'Cancel closes and restores the previous value \(emitted again\)' --maxWorkers=1 --no-file-parallelism --reporter=default --reporter=json --outputFile=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/out/s5a-awake-scoped-d59304d8-e30e-474d-87cf-ff801c50f459/cancel-tests.json
```
cancel: raw/reported 0/0, VALID, continuous 5.101242292s / absolute 5.101263542s / wall 5.101296186s, delta -0.000021250s. pmset available, events=[]; timeout=false; inhibitor reaped. Tests 1 passed/0 failed/106 pending, total inventory 107. JSON/default logs and resource samples preserved.
Exactly ONE executed case (106 filtered/skipped); duration 627.6144999999999ms.

Exact command:
```sh
/Users/a.kott/.nvm/versions/node/v20.19.5/bin/node node_modules/vitest/vitest.mjs run --project spec src/core/DatePicker/_DatePicker.mui.spec.tsx src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx --maxWorkers=1 --no-file-parallelism --reporter=default --reporter=json --outputFile=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/out/s5a-awake-scoped-d59304d8-e30e-474d-87cf-ff801c50f459/main-tests.json
```
main: raw/reported 1/1, VALID, continuous 14.096149375s / absolute 14.096178083s / wall 14.096262932s, delta -0.000028708s. pmset available, events=[]; timeout=false; inhibitor reaped. Tests 125 passed/2 failed/0 pending, total inventory 127. JSON/default logs and resource samples preserved.

RED: DatePicker contract: onChange payload typing an impossible date keeps the text and marks the input aria-invalid; 20.035665999999992ms; AssertionError: expected '02/31/YYYY' to be '02/31/2024' // Object.is equality

RED: DatePicker contract: onChange payload [v5-quirk] deleting one character of a complete date emits NaN; 15.03066600000011ms; AssertionError: expected 'MM/20/2024' to be '' // Object.is equality

Step3 regressions and step4 types/lint NOT RUN: protected impossible-date expectation RED triggered required escalation/stop. Derived eight regression files recorded in regression-scope.json against accepted5335 manifest; no changed-helper validation claim. Auto652/682/731 NOT INCLUDED in either suite. No new timeout or Cancel hang.

Both main and completed-compatibility whole-file AST audits passed against existing explicit allowlists; output copies only in fresh directory. Hash proof: ZERO candidate drift (source/tests/helper/config/approval/tracked and untracked files excluding outputs and this authorized appended handoff); ZERO historical artifact drift including sleep-invalid out/s5a-main-dom and completed compatibility artifacts. No baseline reset; manifest count5335 verified, legitimate approved differences retained. Wider original approval-chain audit was not completed before stop; no blanket proof claim.

Escalation addressed to overseer canonical03a95c34-f4ce-4b25-b8f2-45ea90ab4330 (alias f94fe967) and ROOT7d12feb7-406f-4d7b-b4ae-fd8ae56e230c. Root owns classification/repair. No source/test/config/dependency edits, installs, orphan/power changes, subagents/checkouts, commits/pushes/PRs, full gates or S5b. S5 remains incomplete.

## Root two-revert diagnosis and controlled-contract escalation

Authorized isolated-copy bisect kept current candidate unchanged. First two attempts failed before test
loading because scripts/vite-plugin-asset-analyzer.js and vanguard-config.js were absent from the copy;
these are harness failures with no behavioral evidence. Added missing support to the scratch copy only,
then ran each variant once (out/s5a-two-reverts-fixed-harness). Both VALID, no Sleep or timeout:
revert-invalid-echo:2FAIL (impossible MM/31/2024, clear MM/20/2024);
revert-helper-recovery:2FAIL (impossible02/31/YYYY, clear MM/20/2024). Neither revert alone is GREEN.
Candidate source/helper before/after hashes identical during this diagnostic; all original artifacts retained.

Root source diagnosis: useFieldState.js282–288 publishes complete invalid sections,319–338 applies the
pending section on external value identity change. Retaining old null on a genuine invalid publication
prevents the final year applying. clearActiveSection preserves untouched sections; public clearValue when
already null (180–188) resets all sections without another callback.
Root production repair distinguished actual field publications from supplemental partial NaN notifications,
passed actual published Moment into MUI and used deferred public FieldRef.clearValue after a null echo.
Two original failing tests then2PASS, raw/reported0, VALID4.195631s, no Sleep/timeout (out/s5a-echo-clear-fix).

Required broader scoped run (out/s5a-root-scoped-after-fix): CancelPASS, main126PASS/1FAIL, all VALID;
regressions/types/lint not reached after first main RED. The new failure is the fully-controlled baseline
at DatePicker.mui.spec:296: without parent value updates expected03/15/2024, actual03/20/2024. Root's new
synchronization adopts valid edits before parent acknowledgement. This is a product compatibility bug,
not an upstream quirk flip. Escalated immediately; no frozen/assertion edits or further source edits after
that RED, no retries. Proposed narrower invalid-only acknowledged-echo synchronization requires overseer
direction under the explicit controlled-restore escalation rule. All current candidate and historical
artifacts remain preserved. No full gates, commits/pushes, installs, power/orphan changes or S5b.

## Root parent-ack synchronization remediation

Overseer authorized a parent-ack strategy following the real controlled-contract RED at :296.
No frozen behavior assertion was changed. Added four non-frozen controlled synchronization tests first:
rejected full invalid date, rejected clear, acknowledged NaN followed by external valid restore, and
valid edit acknowledged by parent. `out/s5a-parent-ack-red` records 2FAIL/2PASS before the repair.
The rejection test was subsequently strengthened to begin with February15 and edit day31, checking
an actual NaN publication before restoration. Preserved old-candidate RED/new-candidate GREEN in
`out/s5a-parent-ack-strengthened`; this changes a new regression only.

Production now retains pending real field publications until the controlled public prop is observed.
An acknowledged invalid full publication adopts its exact Moment reference to complete the pending
section; supplemental partial NaN retains the previous reference. Valid edits obey the public value,
rejected invalid/clear edits restore it, and unrelated value changes discard pending state. Public
FieldRef.clearValue executes only after a null/undefined clear acknowledgement. No NaN identity
comparison is required; numeric acknowledgements use Number.isNaN and public prop changes Object.is.
Installed useFieldState.js282–288/319–338 provides the pending-section/value-sync cause.

`out/s5a-parent-ack-green`: the three frozen cases :296/:405/:431 plus four new regressions 7PASS,
sleep-VALID. `out/s5a-parent-ack-scoped`: CancelPASS, main127PASS, regressions33PASS/2FAIL. Both
remaining failures were scoped mobile/new-test issues: Enter was swallowed before the bubbling
handler; a newly authored test still queried the old label instead of the genuine mobile accessible
name. Changed production Enter handling to capture, preserving MUI's genuine field. Updated only the
new regression's query. `out/s5a-mobile-enter-fix` retained 10PASS/1FAIL because an overly broad string
replacement also changed an unrelated new desktop query; corrected that query to Date Optional.
This is a test-edit mistake, not product behavior evidence for that query. No frozen edits for these fixes.

`out/s5a-mobile-capture-scoped`: Cancel1PASS, main127PASS, regressions35PASS, typesPASS. All raw/reported
exits0 and sleep-VALID, no Sleep or timeout. C1 all three notincluded. Lint exited1 on formatting and
an unused newly added section-helper import. Removed that import, formatted the approved mobile DOM
assertion and new tests; behavior assertion templates remain156/165 DatePicker and45/45 DateTime
byte-identical, with the same explicit approved9 replacements and2 focus assertions.
Separate whole-file proof `out/s5a-main-dom-static` preserves prior proofs and original before files;
its explicit AST allowlist records only the authorized DOM/action changes plus this static cleanup.
Updated approved SHA entries retain their previous approval metadata; no baseline reset.
Final static cleanup results are in types/lint-process.json in that directory.

Earlier genuine REDs, sleep-invalid artifact, and diagnostic harness failures remain in history.
No broad retry, full gates, installs, commits/pushes, orphan/power changes or S5b. Browser/type
characterization, packed DOM old-RED/new-GREEN, independent classification review and final gates
remain pending. The unrelated renderer85417 contention remains the user's decision.

## Browser characterization and explicit migration classification

`out/s5a-browser-current`: 192PASS/20FAIL, 17 unhandled errors, raw/reported1/1,
sleep-VALID. Exact original failure JSON and classification were saved before any story edits.
Vite explicitly logged new DateField optimization and browser reload; the seventeen OverlayStacking
render failures originate in preview.tsx75 React dispatcher null, not an evaluated assertion.
Added the newly introduced public DateField import to optimizeDeps.include. No source/behavior
assertion in the overlay stories was edited. All twenty original rows are retained below.

| ID | Original file:line / failing test | Category | Installed-source or harness cause |
|---|---|---|---|
| B01 | `src/core/DatePicker/_DatePickerKeyboardLayoutMuiContract.stories.tsx:44` — Desktop Separator Editing | LEGACY-EDITOR ACTION plus DOM-only caret expectations | PickersInputBase.js390–435 creates sections root and separate serialization input; useFieldRootProps handles section keys instead of raw mask |
| B02 | `src/core/DatePicker/_DatePickerMuiContract.stories.tsx:79` — Calendar Placement Bottom End | DOM-only query/action; protected geometry/cursor assertion unchanged | PickersInputBase.js390–435 creates sections root and separate serialization input; useFieldRootProps handles section keys instead of raw mask |
| B03 | `src/core/DatePicker/_DatePickerMuiContract.stories.tsx:115` — Icon And Input Layout | DOM-only query/action; protected geometry/cursor assertion unchanged | PickersInputBase.js390–435 creates sections root and separate serialization input; useFieldRootProps handles section keys instead of raw mask |
| B04 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:26` — Modal Over Drawer | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B05 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:27` — Modal Over Drawer With Highlight Input | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B06 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:28` — Drawer Over Fullscreen Modal | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B07 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:29` — Fullscreen Modal Drawer Modal | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B08 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:30` — Fullscreen Modal Drawer Modal Popover | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B09 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:31` — Drawer Modal Select | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B10 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:32` — Drawer Modal Date Picker | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B11 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:33` — Drawer Modal Popover | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B12 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:34` — Drawer Modal Menu | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B13 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:35` — Drawer Modal Autocomplete | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B14 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:36` — Drawer Modal Anchored Autocomplete | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B15 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:37` — Drawer Modal Searchable Select | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B16 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:38` — Drawer Modal Date Range Picker | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B17 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:39` — Fullscreen Modal Fullscreen Modal Date Picker | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B18 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:40` — Fullscreen Modal Popover Modal | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B19 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:41` — Fullscreen Modal Popover Modal Toast | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |
| B20 | `src/core/OverlayStacking/_OverlayStackingShowcase.stories.tsx:42` — Plain Page Popover Modal | HARNESS (no assertion edit) | Vite optimized DateField mid-run and reloaded; React dispatcher null at preview.tsx75 |

DOM/action repair: field opening targets the actual group; geometry locates default styled
MuiPickersTextField-root instead of removed Vanguard Input shell. Cursor assertion targets the
real group and stays pointer; the actual public input slot restores that Vanguard cursor style.
Keyboard story uses focused sections, slash plus ArrowRight/ArrowLeft for navigation, and explicit
month03/day21/year5202 editing for the same final date. Three raw caret-index assertions are now
actual section-focus assertions. Browser slash alone does nothing, which is an authorized editor
change; no expectation claims it shifts digits. UserEvent.click on a section opens the calendar,
so the editing story uses actual focus(), matching the old test's focus action rather than opening it.

`out/s5a-browser-dom-query-red`: 11PASS/2FAIL (new focus action opened calendar; cursor style).
`out/s5a-browser-dom-green`: 12PASS/1FAIL (slash alone left focus in month); retained as test-action
characterization. `out/s5a-browser-navigation-green`:13PASS. Final broader targeted candidate
`out/s5a-browser-final-targeted`:18files/212PASS, raw/reported0, sleep-VALID, no timeout/unhandled
error. All C1 watched tests notincluded. The final run followed actual code/config/action changes;
no unchanged retry or flake claim. Source regression is the original browser cursor RED.

Whole-file AST proof/explicit allowlist in `out/s5a-browser-dom`:39 assertions in main story,38
byte-identical and1 query-only cursor assertion;9 keyboard assertions,6 byte-identical plus3 caret
DOM replacements. Geometry/value/validation behavior remains unchanged. Approved SHA entries
retain the keyboard story's prior S3 platform-mock approval chain.

## Additional overseer keyboard/pending-state review requirements

New `_DatePickerKeyboardSync.spec.tsx` initially2PASS/3FAIL (`out/s5a-keyboard-sync-red`). Actual
picker disabled/readOnly theme state was not checked by capture handler; production now checks
public picker context disabled/readOnly before Enter or click opening. It does not preventDefault
or stopPropagation. openRef prevents duplicate open registrations/requests. Parent key propagation,
desktop inertness, disabled/readOnly, invalid-ack followed by locale/external restore and remount
are covered. The initial new locale test overreached by expecting an invalid Moment to retain raw
sections across a format rebuild; corrected its intent to the specified no-pending-leak external
restore in the new locale. No frozen assertion was changed.

The consumer-handler test first configured an inaccessible theme DatePicker field default, then
DateField default but dispatched on the group outside MUI's sections-list key handler. Both new-test
REDs retained in keyboard-sync-green/keyboard-final. Final action dispatches on the genuine section
so MUI's consumer DateField onKeyDown chain actually runs. The wrapper has no public onKeyDown or
slotProps prop; review must state that API boundary explicitly, not invent an exposed handler API.
`out/s5a-keyboard-section-final`:10PASS including4controlled and6keyboard tests; dedicated types,
contract compiler and scoped lint raw0, sleep-VALID. Story files are eslint-ignored (two warnings),
not claimed individually linted. Consumer handler receipt and parent bubbling are proven.
Reviewer must explicitly assess no preventDefault/stopPropagation, duplicate-opening guard,
consumer-handler chain, desktop/disabled/readOnly inertness, and locale/unmount pending state.

Packed DOM fixture has a separate whole-file proof `out/s5a-packed-dom`:13 behavior assertions
byte-identical,2 caret DOM replacements,2 genuine DOM assertions added; no runtime cases added
or removed, preserving per-consumer5/5/4/4. Targeted packed runtime work is in progress; final strict
four-consumer gate remains mandatory. No review-ready or acceptance claim yet.

## Targeted packed sections probe

Proof in `out/s5a-packed-dom` preserves13 behavior assertion bytes, replaces2 raw caret queries and
adds2 genuine sections DOM checks;5/5/4/4 final runtime inventory unchanged. First controller attempt
failed before any command (unsupported env keyword); second attempted old consumer failed at setup
resolution with0tests because its node_modules symlink crossed the temporary root. These are harness
failures, retained in out/s5a-packed-probe and -v2, not intended old-package RED evidence.

Corrected harness clones accepted isolated dependencies into task-owned consumers (no source aliases,
no dependency install), runs from their real directory. `out/s5a-packed-probe-v3`: old S4b tarball
probe1FAIL as intended (no accessible group), sleep-VALID19.434970s. Fresh build raw0 VALID231.451690s;
npm11.6.2 pack --ignore-scripts raw0 VALID5.527055s. Fresh tarball SHA
758295864feb5b7f65b412d204f5021bd46c798127678c3921d41fd080e5ba99. New packed consumer probe1PASS,
4unrelated filtered, raw0 VALID16.492160s. All5737 installed default-dist files match tarball bytes.
This is targeted runtime proof with reused accepted dependencies, not fresh strict-consumer evidence;
ONE normal final package gate still must build/pack and install four strict consumers5/5/4/4.
All C1 tests notincluded. Build retains existing declaration and WordPress move diagnostics; fresh
review must normalize/compare exact messages/counts to accepted S0/S4b evidence before any baseline claim.

Overseer requires clean lock-exact reinstall before final validation to resolve installed react-is drift.
Read-only check: repository tracks only pnpm-lock.yaml; package-lock.json/npm-shrinkwrap.json do not
exist. npm ci cannot satisfy lock-exact installation here. Reported this mismatch before any install,
awaiting corrected pnpm command direction. No lock conversion/rewrite, no install performed in this
continuation. Final validation cannot use the currently discrepant installed tree.

## Host contention boundary — overseer cleanup (2026-11-06)

Overseer reported that, with the user's authorization, it killed task-unrelated orphan PIDs84651
(shot.mjs),85414 and85417 (headless Chromium renderer formerly near100%CPU) at approximately
10:5x EET and verified their absence. Root did not terminate these or any other unrelated process.
Timings before and after this cleanup are NOT directly comparable, including the C1 Autocomplete
measurements. Historical timings/resource artifacts remain unchanged. Subsequent runs must record
their own resource conditions and still enforce the unchanged2500ms C1 limit.

Root read-only observation at 2026-11-06T10:54:22.880767+02:00: ps exit1; output:
```text
PID  PPID  %CPU COMMAND
```
No validation-plan, candidate source, test, dependency or power-setting change. Fresh read-only
review remains pending; lock-exact pnpm install follows the review, then scoped recheck and ONE
full sequential validation. No other process was killed or altered.

## Fresh reviewer finding and warning reconciliation escalation

Fresh review-s5a.md establishes no additional actionable source/assertion-classification issue, but
one MAJOR under the exact-build-diagnostic requirement:584 directive warning occurrences versus
accepted S4b577, with11 added and4 removed normalized module identities. Its complete inventory
retains paths/messages/counts, not a filter. Eight TS2322 declaration blocks match S4b AND S0 exactly
(joined normalized SHAae7ec40e7f78635a87e7e3da6a835f3a492abb11fd5f89dc3a0dac23ae7094fe);
the one WordPress declaration mv error also matches all three inputs exactly.

Root read-only verification confirms every one of the eleven newly warned installed modules begins
with literal use-client directive: PickerDay, useField, and nine picker-local @mui/utils modules.
Proof out/s5a-review-warning-reconciliation/introduced-directives.json. Four absent old warning
identities are PickerDay2, PickersDay, useFieldV6TextField and useFieldV7TextField. This is an explicit
bundled-module warning delta accompanying the dependency/editor migration, not a claim of diagnostic
equality or a blanket baseline waiver. No warning filter or production/build-config edit made.
Sent exact delta and reviewer report for overseer disposition. Final validation and lock-exact install
remain pending this reconciliation; no runner/install started after the review.

## Overseer warning disposition and pre-final install authorization

Overseer accepted the recorded +11/-4 directive warning delta as expected picker8-to9 dependency
effect; the MAJOR is reconciled, not filtered. All584 warning source occurrences resolve inside
this worktree node_modules, none under src. Exact337-identity inventory and source realpaths saved
in out/s5a-review-warning-reconciliation/warning-inventory.json and referenced beside Intentional
incompatibilities in the plan. Full clean-graph final build must reproduce exactly that inventory.
Declaration errors and WP move error equality remains separately proved in review-s5a.md.
Corrected lock-exact pnpm11.5.1 install is authorized, with one worktree-node_modules-only clean
fallback if a successful frozen install leaves drift. No lock rewrite or other install operation.

## Lock-exact install closure before scoped clean-graph validation

Verified pnpm11.5.1. Before install recorded package.json SHA8551cc4609aefb0ff1347e8811ffd16b28398778658cb947aa50f6c426469fef and pnpm-lock.yaml
SHAf28c28a1be57643299eec8f8a761c7930cc3b80aee39438626710954e66a44c6, plus HEAD lock diff181insertions/413deletions. Initial authorized
pnpm install --frozen-lockfile raw/reported0/0, sleep-VALID0.871707s, left nested19.3.1.
Used the separately authorized fallback exactly once: bounded deletion of this worktree's concrete
node_modules only, then the SAME frozen install, raw/reported0/0, sleep-VALID216.956881s.
The command's normal prepare lifecycle built both bundles; no separate install/build retry.
Package/lock SHA values unchanged after BOTH installs. No lock rewrite, update/add, global-store
cleanup, main-checkout install or power/process change.

Post-install audit initially assumed the old nested react-is path still existed; that path is absent
in the clean hoisted layout. Corrected read-only resolution via Node createRequire from the actual
styled-components package, not a third install. It resolves /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-is/package.json version19.2.6.
`pnpm ls react-is --depth Infinity` raw0, sleep-VALID, records styled-components5.3.10→react-is19.2.6.
All evidence out/s5a-lock-exact-install/, including both process logs/resources, hashes and realpath.
Prepare directive warnings exactly584 with zero added/removed identities against accepted inventory.
Frozen490 and492 independent checks each show7approved differences with exact SHA/approval chains.

Fresh scoped clean-graph rerun is now in progress. No reuse of drifted-install GREEN for final claims.
Fresh reviewer source/classification checks were clean; its warning MAJOR was explicitly reconciled
by overseer. Final validation remains one serial run after clean scoped GREEN; S5a not accepted.

## Clean graph scoped GREEN; single final validation starts

out/s5a-clean-graph-scoped has7 sequential gates raw/reported0, sleep-VALID, no timeout:
Cancel1, main127, migration regressions41, dedicated types, contract compiler, scoped lint,
and targeted browser18files/212. C1 all three explicitly notincluded. No source/assertion repair
was needed after the lock-exact install. Installed graph now matches the intended react-is split;
package/lock hashes are unchanged. These measurements follow the overseer's orphan cleanup and
must not be compared directly with older timings.

Fresh review-s5a.md's source/classification checks found no additional issue; its sole warning MAJOR
was explicitly reconciled by overseer with exact584/337-identity inventory, all node_modules.
The single full serial run uses checked-in s5a-final-validation.py: infrastructure selftests,
static/extra types, spec, scripts, Storybook,35mapped95/85coverage by project, fresh normal package
with5/5/4/4 runtime cases, bytes/pins, exact build-error and584-warning inventory audit, frozen and
candidate input SHA checks. npm11.6.2 is explicitly scoped for package packing to avoid the historical
npm10 ignore-scripts issue. No full final results or S5a acceptance claimed yet.

## Single final attempt stopped at infrastructure selftest; narrow mock fix

Final attempt out/s5a-final-f51b03161e5a490e9109b74cfbef2004 passed selftest, suite-selftest,
coverage-selftest and scripts-project-selftest. runner-selftest then blocked in its completed-child
Popen mock. The mock globally patched subprocess.Popen and called wait() on EVERY subprocess,
including sleep_events' pmset -g log with stdout=PIPE, before communicate() could drain the pipe.
Read-only owned-process evidence: unittest leader24740/PGID24740 plus its pmset child24747 in
runner-selftest-owned-stop.json. Root intentionally sent SIGTERM only to that task-owned group.
No unrelated process or power setting was touched. This is an infrastructure deadlock, not component
RED, timeout, sleep noise or a flake. Raw/reported-15/-15, VALID,
continuous148.310336s, no timeout/Sleep, scoped inhibitor reaped. Original logs/resources kept.

Later gates (package-count selftest/static/types/spec/scripts/Storybook/coverage/package) NOT RUN.
Frozen checks retained exact approvals, candidate input audit0changed/0added. C1 tests notincluded.
This run supplies no final component validation and is not silently retried.

Narrow test-only repair: both completed-child mocks now wait only when start_new_session=True,
i.e. the runner's owned primary test child. Diagnostic pipe children are communicated normally.
No production bounded_runner behavior, source, frozen spec, install, timeout or threshold changed.
Existing deadlock is the RED; out/s5a-runner-mock-fix verbose4/4tests GREEN raw/reported0/0,
sleep-VALID7.231608s. This covers owned-group timeout, completed suspend invalidation,
healthy/nonzero exits and synthetic below-deadline sleep delta. No new broad run started.
Sent concrete fix/evidence to overseer for disposition of a fresh final attempt from the start.

## Authorized fresh final attempt — mock integrity proof first

Overseer authorized one fresh attempt from the start, with any stop requiring escalation and no retry.
Before starting: out/s5a-runner-mock-fix/mock-only.diff shows only two selftest Popen mock bodies
changed; original bytes were reconstructed and verified against the stopped final attempt's input
SHA manifest. mock-only-proof.json proves bounded_runner.py production bytes exactly unchanged
(deadlines, mach clocks, sleep detection,125 and process groups) and all17selftest assertion nodes
byte-identical, none removed or weakened. Standalone negative completed-child controls retain raw0
but report125 SLEEP-INVALID for BOTH synthetic delta6s and separately an injected Sleep event with
delta0; artifacts negative-sleep-{delta,event}.json. All four unit tests already GREEN.

The next final run starts fresh with all infrastructure gates and all component/package gates.
No timing comparisons across the orphan cleanup, no commit/push/power change or S5b.

## Final attempt65e224 STOP and authorized discovery correction

The prior fresh attempt passed six infrastructure gates, static and extra types; spec raw/reported1/1
sleep-VALID,1755/1755real testsPASS, with6artifact suites failing before0tests on relative imports.
Exact artifact-suite-failures.json retained. C1 all3PASS140.748041/174.466416/147.570500ms post-cleanup;
0input drift, frozen approvals valid. Later gates were NOT RUN. No retry was made under that authority.
Correction to shorthand in the initial escalation:113real suites =112under src plus legitimate
config/_regex.spec.ts; the real config test must remain. Root's before proof copies caused the six
extra suites to be collected by broad **/_*.spec discovery; no component assertion failed.

Overseer authorized exact artifact-directory exclusions and one LAST fresh final attempt. New
resolved-file selftest initially needed browser instance-name normalization; incomplete probes retained
as before-files/before-resolved-files with0storybook group, not claimed as the required complete proof.
Complete before-complete-files.json resolves119spec/174storybook/3scripts and intentionally REDs on
six artifacts. After the authorized config edit, after-files.json resolves113/174/3 and the selftest
GREENs, raw0,sleep-VALID. path-list-equivalence.json proves byte-identical sorted kept path lists,
removing ONLY the six artifact suites. Config-only diff reconstructs the exact prior input SHA.
No source/frozen/assertion/lock/proof artifact deletion/move/rename or .gitignore edit.

Spec excludes retain configDefaults.exclude and scripts/**, adding out/** and agentic-plans/**.
Storybook and global coverage retain their defaults and exclude those same artifact directories;
no coverage-only command filter and no narrowed include. Normal config test retained. Plan records
this as an intentional repository change. New discovery selftest joins all other selftests in the
final controller. Next run starts all gates in a fresh output directory; any stop must be escalated,
with no further retry, timeout change, commit/push/power change or S5b.

## S5a FINAL ROOT HANDOFF — GREEN, acceptance requested

Final candidate: @mui/material/@mui/system7.3.11, @mui/x-date-pickers9.17.0; Vanguard2.8.0 unchanged.
Fresh last-authorized attempt out/s5a-final-82356349d6214b4a98aee7110144bb13 completed ALL14 gates
raw/reported0, sleep-VALID, no timeout, every inhibitor reaped; owned-group-cleanup.json has no
remaining stage processes. git diff --check0. No commits/pushes/PRs/posted CR/power changes/S5b.

| Gate | Raw/reported | Validity | Continuous seconds |
|---|---|---|---|
| selftest | 0 / 0 | VALID | 1.291 |
| suite-selftest | 0 / 0 | VALID | 0.568 |
| coverage-selftest | 0 / 0 | VALID | 0.263 |
| scripts-project-selftest | 0 / 0 | VALID | 0.677 |
| discovery-selftest | 0 / 0 | VALID | 5.750 |
| runner-selftest | 0 / 0 | VALID | 7.530 |
| package-count-selftest | 0 / 0 | VALID | 0.159 |
| static | 0 / 0 | VALID | 48.427 |
| extra-types | 0 / 0 | VALID | 5.748 |
| spec | 0 / 0 | VALID | 201.483 |
| scripts | 0 / 0 | VALID | 21.345 |
| storybook | 0 / 0 | VALID | 347.151 |
| coverage | 0 / 0 | VALID | 482.653 |
| package | 0 / 0 | VALID | 482.962 |

Normal:113spec files/1755PASS +3script files/20PASS +174storybook files/1292PASS =3067tests,
no pending. Coverage:287files/3047PASS (spec+Storybook only by project),35/35mapped files meet95/85;
DatePicker100%lines/97.95%branches. Only3accepted PopoverModal
unreachable handlers excluded. Discovery fix retains112src+1config spec files and all3scripts/
174storybook files; exactly6proof copies removed by authorized normal/global artifact exclusions.

C1 (chipdelete/ArrowLeft/splitComma): normal150.123292/170.562083/157.561417ms;
coverage163.698250/188.535500/275.491084ms. AllPASS<2500.
All final timings post-orphan cleanup, not directly comparable with older timings. Start load averages
7.19/9.08/10.70. No Sleep events/invalidity. No timeout increase or frozen assertion hiding.

Fresh normal packed gate: default-declared5/default-mui5/wp-declared4/wp-mui4 =18runtimePASS;
all strict npm11.6.2 installs, required declaration probes,4build/packed +8installed/packed entry/
rootdeclaration byte comparisons and pin/layout checks PASS. MUI7.3.11 external only in two MUI
consumers; declared-only has none by design; picker bundled in all. Tarball/tmp/mui-upgrade/s5a-final-82356349d6214b4a98aee7110144bb13-package/pack/rankingcoach-vanguard-2.8.0.tgz SHA256
ac04fad11998fc789eb2550ed4e273dd9a17488550fa44f1c333b9094cdb3729. Old S4b DOM probe RED retained; fresh final default consumers GREEN on the
same DOM fixture, now built from lock-exact clean graph. No source aliases.

Build diagnostic audit: EXACT584use-client occurrences/337identities, no extra/missing identities;
all sources resolve under node_modules, zero under src.8normalized TS2322 blocks +1WP mv error
match accepted S4b; independent review establishes same S0 baseline. These errors remain limitations,
not resolved by gated type probes. No build onwarn filter or broad waiver.

Input hashes:5346candidate inputs0changed/0added during full run. Frozen490/492 snapshots each
7approved differences with current SHA/ancestry checks; all8approval entries match. Only the two
expected generated dynamic-import JSONs changed; .tsbuildinfo-app unchanged. After completion,
report-only plan/migration status updates recorded separately in post-run-report-edits.json; no
production/test/config/dependency change and no report-only rerun.

Fresh review-s5a.md found no additional source/AST/classification issue; its directive warning MAJOR
was explicitly closed by overseer disposition and exact final audit. Supplemental authorized tooling
fixes are proved: mock-only.diff+17assertion bytes+unchanged production runner hash+two negative125
controls; discovery119→113spec/174unchangedstorybook/3unchangedscripts before/after path proof.

Full evidence index is handoff.md inside this final output directory. Classification tables, AST
allowlists and approved chain remain in the report/proof directories; no original artifact deleted,
moved, renamed, reset or relabelled. Main DatePicker156/165unchanged +9approved replacements +2focus
assertions; DateTime45/45 unchanged; consumer fixture13/15behavior unchanged +2DOM assertions.
Intentional incompatibilities and exact known-warning note in plan; consumer migration DRAFT now
reflects final GREEN and awaits acceptance. Vanguard major recommended, no version bump.

Historical stops remain:925sclamshell sleep-invalid, early install/targeted source/action/harness REDs,
initial full runner mock deadlock (ownedSIGTERM), next full6artifact discovery failures (1755realPASS).
Neither is called a flake or hidden; only the explicitly authorized final attempt is GREEN.
Root peer, undeclared types, WordPress declarations, public runtime subpaths, browser policy and
root out/ commit-time handling remain carried limitations; none is final-release acceptance.
S5a acceptance belongs to overseer. S5b remains blocked pending that verdict.
