# Fresh S5b read-only review

**Verdict: no actionable BLOCKER, MAJOR or MINOR finding established.** The candidate is suitable for the remaining lock-exact install and one TIER-3 final validation, subject to the build-diagnostic reconciliation and completeness checks below. This is not S5b acceptance or release-policy approval.

Reviewed the current core/system 9.5.0 + pickers 9.17.0 candidate on synchronized master f02d3f5, including the accepted S5a history and subsequent approved edits. No tests, builds, installs or runners were executed. Only this report was written.

## Production compatibility

- `src/core/_internal/mui-legacy-props.ts` retains Vanguard-owned deprecated legacy TextField/Input/Menu/Popover/Snackbar aliases. It does not re-export removed aliases under MUI names or augment MUI globally. `mapLegacySlots` and the component/Modal adapters make explicit slots/slotProps take precedence. The TextField regression cases cover each exposed alias, refs/events, object/function slots, styled InputLabel/asterisk and label/display wiring, including theme defaults.
- `MuiTextField.tsx:10–14,59–74` preserves InputLabel/FormLabel by forwarding the legacy component through the public InputLabel boundary, rather than replacing its styled root. `Popover.tsx` retains default TooltipPopper and forwards the Vanguard class through popper props. The existing Snackbar transition wrapper keeps stable identity and explicit slot-component precedence. No repeated S4a styled-default replacement was identified in the reviewed mappings.
- Menu focus, Select label association, Autocomplete generated input/adornment props, SearchableSelect trigger padding, rounded ProgressBar ARIA and explicit ToggleButton per-child Tab behavior are scoped production repairs of the frozen contracts. The underlying ProgressBar fraction remains unrounded. The accepted root `mergeSlotProps` import avoids a new runtime subpath/optimizer entry; the public-import guard separately protects this boundary.
- The lint-only production lifting preserves captured values and per-parent-render component identity through bound functions; directly invoked helpers are renamed without changing their calls. I found no public prop or callback signature change caused by those refactors.

## Frozen classification and proofs

Checked the 14-row `out/s5b-v9-quirk-flips/change-ledger.json` against the edited nodes and `ast-proof.json`. The classification is consistent with the specific authorizations:

| Cases | Authorized reason checked |
|---|---|
| spec-1 | Tagged Autocomplete right-click quirk; official v9 guide lines49–51 and installed button-zero guard |
| spec-8 / storybook-1 | Tagged Menu roving-tabindex change; guide224–230 and installed roving hooks |
| spec-9/10/14/15/21/22 | Tagged keyboard click MouseEvent/bubbling change; guide91–97 and installed ButtonBase click dispatch |
| spec-13/19 | Tagged disabled-item/option activation change; guide99–101 and installed disabled event guards |
| spec-23 | Original S4a bug-lock provenance verified; restored prefix and disabled click/Enter/Space expectations, not an untagged contract waiver |
| spec-16 | Tagged plain Backdrop default ARIA change; guide85–87; no blanket change to Modal's explicit backdrop attributes |
| spec-20 | Tagged Slider pointer-event change; guide240–242 and installed pointer handlers |

The proof reconstructs every affected whole file from its before snapshot plus explicit case/comment replacements, preserves test/expect counts, and records AST locations and source/guide excerpts. The Select replacement keeps the no-onChange assertion and checks the visible option's native `aria-selected` attribute. Both mistaken new-guard REDs remain history. The approval registry contains the eight C/D files and retains previous approval chains.

MenuItem Option A follows the user-selected breaking change: production MenuItem is unchanged, standalone rendering now expects MUI's missing-context error, and the supported in-list case still checks item DOM and activation. The nine story names/args are unchanged; only the public same-graph MenuList wrapper is added. `menuitem-option-a/ast-proof.json` records the whole-file allowlist. The migration draft correctly requires **Vanguard Menu**, not a consumer's separately installed MUI MenuList; no fallback, private context import or new MenuList export was introduced. The consumer-pattern test covers wrapped/unwrapped Render children and focus/activation.

Lint/static-hygiene evidence is separately scoped: the 35-file assertion/title proofs, unchanged fullNames/statuses, typed-theme runtime-data equality and nested approval chains distinguish these edits from the authorized C/D assertion flips. Master-owned changes are separately inventoried. The master-42 and upgrade-24 changesets are documented for separate commits by the user. No suppression/rule-policy change was used.

## Test infrastructure and evidence

- `vitest.setup.tsx:8–12` installs the shim only for a jsdom user agent. `pointer-capture.ts` defines only missing capture methods, preserves existing native function identities, and uses per-element/per-pointer bookkeeping. It does not suppress errors or patch production/browser paths. The new Slider regression observes uncaught errors without preventing them and checks the committed value.
- Recorded sleep-valid evidence: full Select26/26; pointer plus full Slider47/47 with zero uncaught exceptions; guarded13 C/D cases plus3 pointer cases16/16; MenuItem/Menu consumer/contract component run40/40. These are scoped evidence, not a substitute for the final complete run. Screenshot artifacts and the recorded nine-case visual inspection are distinct from the earlier rejected lagging trace frames.
- Selection is based on manifests, with shared setup/internal/theme/config/lock changes forcing TIER3. The related-resolution selftest and file-count validator address the earlier discovery/count defects. The stage runner uses one instrumented spec+storybook run, separate mandatory scripts and separate three-case C1; it does not duplicate the two full uninstrumented projects. The bounded runner's production sleep/deadline paths remain unchanged in this phase.
- Static gate requires native TS7 app/lib/contracts/spec zero, Biome error zero and no new warning identities against clean master. The prior 24-cap is historical and inactive. Package count checking fails closed at5/5/4/4=18.

## Remaining final evidence, not implementation findings

Before S5b handoff, obtain and record:

1. Lock-exact frozen install and unchanged package/lock/hook hashes; installed react-is19.3.1 and MUI9 graph agree with the lock.
2. Exact core9 build warning identities reconciled against accepted S5a584 occurrences/337 identities and synchronized master720/360, with all warning sources under node_modules. No new/changed TS or WP error may be silently accepted. This build evidence was still pending during review.
3. One complete TIER3: zero failed/uncaught/unexpected skipped tests in every project, all1292 Storybook cases present, correct resolved spec/scripts counts, C1 each<2500ms, all35 mapped files95/85, four strict packed consumers/types/runtime counts and byte/pin audits. The mandatory stage-specific audit must check completeness, not just aggregate exit0.
4. Input/frozen integrity and the remaining peer/type/WP/runtime-subpath limitations explicitly reported. User browser-support policy remains undecided: the report gives concrete locked-data deltas and options, without treating es2020 or one Chromium run as broad support proof.

A stale plan status paragraph (2.8.0 / MenuItem and master-sync pending) was reported to ROOT for a small documentation correction. Later plan sections already record the approved decisions; this is not a source finding and needs no duplicate reviewer run after correction.
