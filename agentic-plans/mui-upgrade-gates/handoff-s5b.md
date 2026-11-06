# S5b handoff — core/system 9.5.0 + pickers 9.17.0

Validation is GREEN through the explicitly authorized runtime reuse and isolated package completion. **Awaiting overseer acceptance; browser-support policy remains a user decision.** Vanguard stays2.9.1, inherited from master f02d3f5. No manual version bump, commits, pushes, PRs or CR posts.

## What changed

- Core/system exact9.5.0 with the approved resolver closure; pickers stay9.17.0. Frozen pnpm11.5.1 graph and shared react-is19.3.1 verified.
- Vanguard-owned deprecated legacy-prop types/maps retain public compatibility; explicit slots win and styled MUI defaults stay. Labels, focus, adornments,32px trigger, per-button Tab and rounded progress ARIA repaired test-first.
- User-approved MenuItem break: use **Vanguard Menu**, not a consumer's external MUI Menu/MenuList. No fallback/private context/new export. Nine stories use the internal public MUI MenuList;40 component cases and screenshots pass.
- Fourteen narrowly authorized upstream quirk flips have source/official-guide intent, whole-file AST proofs and chained approvals. No unapproved behavioral assertion changed.
- All66 Biome errors fixed (master42 + upgrade24), with lint-only assertion/title proofs;0 new warnings. Source app/lib/contracts/spec types0. Minimal jsdom-only pointer capture preserves native browser methods.
- User-directed build filters hide only dependency MODULE_LEVEL_DIRECTIVE messages containing quoted use-client, and INVALID_ANNOTATION under node_modules/@mui. Other warnings keep the previous handlers.12 helper cases pass after intended REDs.
- Package isolation guard is test-first: worktree fixtures fail; ancestors cannot contain MUI/React; declared-only MUI resolution must fail and MUI-present resolution must be inside the consumer. Future package tiers always use/tmp.

## Validation and reuse boundary

| Evidence | Result |
|---|---|
| Full source/browser V8 run |1777 spec +1292 Storybook =3069 PASS;292 files;0 fail/skip/uncaught |
| Mapped coverage |35/35 meet95% lines /85% branches; minima96.71/85.71 |
| Separate noncoverage C1 |242.467 /160.072 /144.335ms; each<2500 |
| Node script cases |37 unique PASS: unchanged25 + helper12; old full34 included9 of those12 |
| Static |app/lib/contracts/spec0; Biome0 errors,846 existing warnings,0 introduced; lint:err0 |
| Final original build |raw/reported0/0, sleep-VALID150.964s;0 client directives,0 MUI annotation warnings,0 TS diagnostics |
| Other build messages |All complete warning blocks (kind,module,normalized full message) equal clean master; exact WP move diagnostic unchanged |
| Isolated fresh package |four strict consumers5/5/4/4 =18; required type and MUI-present probes0 |
| Isolation |all4 roots/tmp; no ancestor MUI/React; declared-only all3 MODULE_NOT_FOUND; present all3 owned |
| Artifact |8 installed/built/tar byte comparisons + exact pins PASS |
| Integrity |486 frozen baseline files match approved chains/master blobs; source/lock drift=[] |

The full runtime candidate's only production-adjacent changes were the build-only warning helper and its unit test. Later changes are the explicitly authorized isolation guard/fixtures/runner and documentation. The parent accepted runtime/coverage/C1/static reuse. No additional full run was performed; source/runtime inputs stayed unchanged. The isolated package gate took183.470s, raw/reported0/0, sleep-VALID; guard selftests5/5. Timings are after the overseer's authorized orphan kill and are not compared with earlier contention runs. Estimated avoided duplicate normal full passes remain about547s, not a measured cross-host benchmark.

## Release limitations — no broad waiver

- Emotion/MUI strict consumer resolution is fixed; the broader root peer baseline is not a blanket release approval.
- All required package probes pass, but full uncurated declarations remain non-clean. `skipLibCheck=false` gated measurements are default-declared88 (S5a90), default-MUI75 (76), WP85/85 (unchanged). Full measured totals are124/80/97/97; the measured skip-true totals36/5/12/12 match S5a.
- The default strict difference is one inherited master use-stepper CaseReducerActions generic fix. Three missing-MUI references consolidated into two owned compatibility-type references (net−1 missing-module diagnostic) in declared-only. Remaining categories/WordPress counts are baseline-like; exact normalized inventories are retained. These optional measurements are not declared GREEN or waived.
- Undeclared public type dependencies, legacy Redux/React namespace declarations and WordPress declaration paths remain explicit follow-up limitations. Source compiler and build TS diagnostics are now0 after TS7 synchronization.
- The existing WP mv diagnostic remains; public runtime subpath exports and the consumer browser-support policy remain unapproved final-release limitations.

## Browser policy — final technical report, user chooses

See [browser baseline](../mui-v9-browser-baseline.md): exact locked-data rc-webapp query (>0.2%,not dead,not op_mini all), source versions/date and concrete deltas. Core9 minimums: Chrome117,Edge121,Firefox121,Safari/iOS17. Newly below the minimum in that production query: Chrome116/112/111/109 and iOS16.6–16.7/15.6–15.8. Their locked global usage is3.0463%, **not customer traffic**; the database is stale and no update was run. Chromium131 tests do not certify the full minimum-browser matrix. ES2020 output alone is not runtime/CSS support.

1. **Recommended: adopt upstream minimums**, explicitly resolve already-old/unlisted families with customer traffic and a browser matrix before release.
2. Retain the wider consumer query, with separately authorized compatibility work and evidence.
3. Defer releasing core9 at the accepted S5a checkpoint until policy/evidence is resolved.

No support policy, consumer query or build target was changed.

## Migration and suggested commits — text only

[Consumer migration draft](../mui-v9-consumer-migration.md) covers the accepted DatePicker sections/typing/payload changes, QA IDs, core9 legacy prop shims, keyboard MouseEvent/bubbling, pointer events, disabled activation, roving tabindex, Backdrop/right-click and the Vanguard-Menu-only boundary with examples. **Vanguard major version recommended; the user chooses the version.**

Suggested split (not executed):
1. `chore(lint): fix pre-existing Biome errors` — master42 hunk group from [lint change sets](../lint-cleanup-changeset.md).
2. `feat: upgrade MUI to core9 and pickers9` — dependencies, compatibility, approved break/quirk proofs, characterization/gate tests and migration docs, including upgrade24 lint cleanup. Earlier MUI edits overlap some master-error files: stage by the supplied hunks, not entire files blindly.

No ticket/PR URLs were created, and no placeholder or CR was posted. Root out/ proof copies stay untouched and excluded from discovery; their commit-time handling remains the user's item.

## Evidence index

- [Full accepted runtime/C1/static/selftests](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s5b-final-23043a75e7134da29bf274d1122a1a13)
- [Full coverage JSON and35 metrics](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s5b-final-23043a75e7134da29bf274d1122a1a13-coverage)
- [Original build and complete warning-block audit](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s5b-completion-763d2e97dc8c4ade8bcc024b5edc2733)
- [VALID isolated package audit/probes/counts/bytes](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s5b-isolated-package-e89bf5669b4a4c049a0a9a9c6e987a27)
- [Isolated packed consumers/tarball/type logs](/tmp/mui-upgrade/s5b-isolated-package-e89bf5669b4a4c049a0a9a9c6e987a27-package)
- [Fresh read-only review](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/review-s5b.md)
- [C/D classification/source/guide/AST proofs](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s5b-v9-quirk-flips)
- [Approved frozen chains](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/approved-frozen-changes.json)
- [Lint before/after AST/runtime/type-fixture proofs](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/lint-zero-work)
- [Guard and warning-helper RED/GREEN proofs](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s5b-use-client-filter)
- [Lock-exact graph evidence](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s5b-onwarn-lock-exact-install)

Tarball SHA256: `66585135b37947c67850edac7ef6852b780ab31be997f4d1998523a60297c284`.

History retained: initial characterization REDs; known post-sync captures and authorized transport diagnostic; both Select new-guard mistakes; user-superseded402484 run;23043 Tabs warning stop;2b83 ESM observer-wrapper failure;763d2e package proof explicitly REJECTED for ancestor leakage. None is silently rewritten as GREEN. Only the earlier explicitly adjudicated TextHighlighted transport case is called a host/resource flake. Final isolated package proof is e89bf566, not763d2e.
