# Handover: implementer A (Vanguard own-core rebuild), 2026-11-19

Tree at handover: branch `feature/ui-sdk-architecture-investigation`, HEAD = the commit that adds this file (on top of
803051f). Working tree clean, no stash.

## 1. Role and goal

Rebuild the Vanguard library (this repo) on its own headless core, architecture after ui-sdk.dev but without
@ui-sdk/core. MUI and other third-party code is removed component by component, under these hard requirements:
1. Identical public API.
2. Minimal visual change.
3. The WordPress variant keeps working.
4. rc-webapp import paths stay unchanged.

The full plan is `agentic-plans/ui-sdk-architecture-investigation.md` (the "plan"; map in §6).

**People and threads.** All are T3 threads; send with `t3_thread_send`.
1. Watchdog `722326f5-024a-4cef-90a8-b30b19b29ef4`. Architecture decisions go here. Log every decision in the plan
   as "decided-by-watchdog".
2. Verifier 1 `80fcbccb-4649-4a3a-88e7-93c70c8198d6`. Runs Tier A/B/C/P on A's handoffs.
3. Verifier 2 `mcp:launch:272ebfa79da059bf6743afb44a77879389bfedf3ec30ca2cce19e696e85efd84`. Verifies B's work and
   some of A's (H15, H19).
4. Implementer B `mcp:launch:5b729fe0c4ac7abc1d54ad91123983b6a1a5e7840fd1027656448bbf6fd62bef`. Branch
   `feature/ui-sdk-b-data-slots`, worktree `~/.t3/worktrees/rc-webapp-vanguard-git/feature-ui-sdk-b-data-s-*`.

**A owns:**
1. The MUI-backed overlay and input stack: Autocomplete/SearchableSelect, Select, Menu/MenuItem, Modal/Drawer/
   Snackbar, Popover/Tooltip/PopoverModal/Popper, the pickers (DatePicker, DateRange*), FocusTrap, AppBar/Toolbar,
   FormControl and VanguardThemeProvider.
2. `src/primitives/**` and `src/styles/mui-compat.scss` (B adds `@use` lines only after A approves).
3. `config/**` (derived-notices.txt, build plugins), package.json, the gates (`agentic-plans/mui-upgrade-gates/**`,
   `scripts/check-*.mjs`) and the plan file.

**B owns:** the MUI-backed leaf components (Collapse, Fade, Button, ProgressBar, Accordion, List, Chip, Breadcrumbs,
Pagination, Slider, then the react-spring motion group) and track (h) (junk class tokens). B never edits
src/primitives, mui-compat.scss (except approved lines) or config/derived-notices.txt.

## 2. Hard limits

1. No database or backend calls, no live app, no real user data. UI work only: Storybook, unit tests and the
   gate kit.
2. Commit only in this repo, on this branch. Never push, tag, publish, or rebase/amend published history. Never
   touch other branches.
3. Merge B only at the exact SHA a verifier passed (plain `git merge --no-ff`), never B's tip.
4. Commit messages:
   1. No Co-Authored-By trailer (user rule).
   2. Conventional commits. Commitlint types: feat, fix, chore, refactor, style, test, perf.
   3. Subject ≤ 100 characters, body lines ≤ 100.
   4. One commit per component- or decision-sized change.
5. Tests: never weaken or delete one. TDD: a red spec against MUI first, then green.
6. Say "passed" only for verifier verdicts. Your own results are "green on my side".
7. If a command fails or hangs twice the same way, stop and report.
8. Licence: ported code starts with `// Ported from <package>@<version> <file> (MIT)`. New source packages go into
   `config/derived-notices.txt`; the package gate asserts its lines in both bundles.
9. Format only the exact files you changed (`npx biome check --write <files>`). Never run the formatter on a folder:
   it reformats other people's files, and that already had to be reverted twice.
10. In zsh, word-split file lists with `${=VAR}`.
11. Run Codex non-interactively with `codex exec ... < /dev/null`. Without closed stdin, the S1 draft hung until
    killed.

## 3. Gates and how to run them

Use `--maxWorkers=4` at most and `--maxWorkers=2` for targeted runs. Per decision 13, reserve a wide slot with the
watchdog, start only below a one-minute load of 40, and keep it clear of verifier Storybook swaps. Run at most one
Storybook on the host.

1. **Targeted:**
   `npx vitest run --maxWorkers=2 --project spec <dirs/files>`
   `npx vitest run --maxWorkers=2 --project storybook <dirs>`
   Storybook stories are collected only from `src/core/**/_*.stories.tsx`.
2. **Library type check:** `npx tsc --noEmit -p tsconfig.lib.json`. The spec config misses some errors this one
   catches.
3. **Full spec project:** `npx vitest run --maxWorkers=4 --project spec src scripts`. A failure that looks like load
   timing gets re-run alone before it is called that. Until §36.5's timings are in, assume load failures may be
   caused by the old preload.
4. **Package gate:** `PACKAGE_FIXTURE_OUT=<dir> bash agentic-plans/mui-upgrade-gates/package.sh`.
   1. The gated declaration, runtime and packaging checks must exit zero. The separate measured diagnostics
      are informational. Check these outputs alongside the exit status:
      1. H20 `runtime-counts.json` expected 34/34/44/44 = 156.
      2. "package contents … present".
      3. "dist identity: N packed dist files equal the build on disk".
      4. "wordpress dynamic imports: … 0 missing targets".
      5. "fallback audit: … 0 unexpected, 0 stale".
      6. The first line of `eager-mui.txt`.
   2. `npm pack` runs `prepare` (the build) even with --ignore-scripts, so the pack IS the build and `--skip-build`
      has no effect. Use `PACKAGE_FIXTURE_TGZ=<verified pack>` to replay the consumer fixture without a build.
   3. Cadence: per handoff, build + pack + targeted checks. The full package.sh runs when package.json, build config,
      notices or exports change, every 3rd handoff, and before Tier C.
5. **Eager-@mui gate (§36.3):** after `pnpm build`, run `node scripts/check-eager-mui.mjs` and
   `node scripts/check-eager-mui.mjs --wordpress-table`. It reads `.vg-build/module-graph.dist.json`, written by
   `config/module-graph.ts`. The allow-list holds exactly one module, `@mui/system/RtlProvider` (2 KB cap, no further
   @mui/@emotion in its graph). `--assert-zero` becomes the gate once everything is lazy or own.
6. **WordPress integrity:** `node scripts/check-wordpress-dynamic-imports.mjs [dist-wordpress|dist]`. Every chunk
   import reachable from the entry must exist after `scripts/cleanup-wordpress-assets.js`.
7. **Fallback-preload allow-list:** `node scripts/check-fallback-audit.mjs`.
   1. The spec setup preloads NO lazy MUI fallback (no global preload).
   2. Only the specs that deliberately render a MUI route call `beforeAll(() => preloadMuiFallbacks())`. They are
      listed with a reason each in `agentic-plans/mui-upgrade-gates/fallback-audit-allowlist.json`: 16 entries, and
      B adds a 17th for ProgressBar.
   3. A green full spec run is then the reachability audit.
   4. Do not raise hookTimeout instead.
   5. The Storybook setup (`.storybook/vitest.setup.ts`) still has a global preload (7072a25). It needs the same
      treatment (owed, §7).
8. **Class junk scan:** `src/core/_class-junk-scan.spec.tsx`, part of the spec project.

## 4. Handoff format (to a verifier)

Commit by path first as `… (handoff N, verdict pending)`. A FAIL gets a fix commit on top. Then send one message
containing:
1. One SHA.
2. The pack path, with the sha256 computed from that exact file. pkg-16b/16c got mixed up once.
   Store it at `/Users/a.kott/vanguard-verify/packs/<sha>-<label>.tgz`, with its checksum in `SHA256SUMS` there.
   Keep the logs and traces relied on for decisions under `agentic-plans/` or `/Users/a.kott/vanguard-verify/`
   (decision 14).
3. The base: 9d3b75b for Vanguard stories, .472 for rc-webapp.
4. Gate numbers.
5. Changed files.
6. Declared deltas. Anything else is expected identical to MUI.
7. Parity files: the jsdom differential vs a frozen `_X.mui-reference.tsx`, the Chromium `_XComputedParity.stories.tsx`
   (both themes), cleanup/order specs.
   1. For a migrated part, run parity inside the actual parent frame it ships in. A standalone check alone misses
      context-dependent classes, as H19 found with the DateRangePicker end adornment in its masked MUI field.
8. Suggested rc-webapp screens: Storybook/mocked data only, never a live call. If no mocked story exists, list it as
   a gap.
9. What stays on MUI.
10. Which SHA each pending handoff is judged at.

## 5. Merging B

1. Plain `git merge --no-ff <exact passed SHA>`.
2. The usual conflict is the `@use` list in `src/styles/mui-compat.scss`. Keep everything, with
   `@use '../core/StyledSVG/StyledSVG.compat';` LAST. Run `npx vitest run --project spec scripts/_mui-compat-order.spec.ts`
   plus the merged components' specs.
3. B's WordPress smoke patches are hand-written. Put them inside the SHARED describe of
   `agentic-plans/mui-upgrade-gates/package-fixture/smoke/bundle.test.tsx`, on real timers with `waitFor`: fake
   timers don't reach the WP bundle. Raise the counts in `package-counts.py` and `test_package_counts.py`.

Pending from B: f94d932 (ProgressBar lazy split, at a verifier). Merge after its PASS, with B's allow-list entry.

## 6. Plan map (`agentic-plans/ui-sdk-architecture-investigation.md`)

1. Top "Decisions log": items 1–11, verdicts recorded for the user. Item 10 is the SnackbarRoot leak; item 11 the
   class builders (internal `cx` vs public `classNames`).
2. §23: paths still on MUI.
3. §24 / §26: when MUI can leave `dependencies`, types first.
4. §31 / §32: duplication audit; §32.1 the reachability map (verifier 2's file:
   `~/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/v2/reachability-map.md`).
5. §33: Popover on the own Tooltip. §34 / §34.1: D10 efficiency and gate cadence.
6. §35: H16 scroll-lock root cause and the two-phase ModalHost.
7. §36: DatePicker off @mui/x-date-pickers, staged S1–S3.
   1. §36.0: the watchdog conditions and the inventory.
   2. §36.1: what is left on @mui/material.
   3. §36.2: decisions A (locale) and B (MUI-exit rule).
   4. §36.3: the eager-@mui gate, numbers, allow-list, WordPress table and corrections.
   5. §36.4: the order after the B.3 correction.
   6. §36.5: preload fix timings (OWED, not written yet).
8. "Decisions for the user" section: the user's to-do list, including the DatePicker locale table.

## 7. Watchdog decisions still in force

1. **MUI-exit rule for this major (§36.2 B).** An identical API is a hard limit; narrowing types is not allowed.
   1. B.1: vendored types.
   2. B.2: implement on the own core every fallback prop with reachability evidence, plus cheap, exact props
      (className, classes keys already emitted, style, flat sx).
   3. B.3: put the rest behind a lazy fallback module (`src/core/_internal/lazy-fallback.tsx`, files named
      `*Fallback.tsx`), so the eager graph of every export has zero @mui. `@mui/material` stays a regular dependency.
   4. B.4: a lazy route renders async on first use. That is acceptable only for unreachable routes.
   5. B.5: WordPress keeps its fallbacks inline (`config/inline-mui-fallbacks.ts`, WP build only). The user gets the
      question about the 4 WP exports in §36.3.
   6. B.6: FormControl and VanguardThemeProvider go last. VanguardThemeProvider needs a separate proposal to the
      watchdog BEFORE touching it.
2. **Three-evidence reachability rule (§36.4.5).** "Unreachable" needs a site scan, an audit-mode spec run (no
   preload) and a packed smoke. A site scan alone is not accepted.
3. **Theme reader 5.3.** Own routes use `useThemeDefaultProps(props, name)` (`src/core/_internal/theme-default-props.ts`,
   differential vs MUI). The protected specs `_MuiTextFieldCompatibility` and `_TextFieldV9Compatibility:143` stay
   unchanged.
4. **RtlProvider allow-list.** Exactly one module, as in §3.5. It is on the next-major removal list.
5. **§36 conditions.**
   1. AdapterMoment stays: the own code talks to one adapter seam. S1 is refactored onto it BEFORE its parity spec
      may count as green.
   2. S2 parity is locale × format, plus paste, IME, Backspace, min/max, readOnly/disabled, mid-edit change and the
      section a11y DOM.
   3. S3 uses `(pointer: fine)` via the ported useMediaQuery. The mobile dialog goes on ModalHost only after the H16b
      PASS.
   4. MUI X notices.
   5. Stop rule: two behaviour FAILs at a verifier on S2/S3 → DatePicker stays on MUI X, logged with the evidence.
6. **Locale bug-lock (§36.2 A).** `getDatePatternFromLocale` misses rc-webapp's dash locales (every site falls back
   to DD.MM.YYYY). Keep it byte-for-byte (`src/helpers/_locale-date-pattern.bug-lock.spec.ts`). The fix is the
   user's decision.
7. **Order (§36.4).** The own text field modelling `InputProps.ref` and `inputComponent` comes FIRST, before
   S1–S3.
8. **SnackbarRoot pub-sub leak (decisions log 10).** Fix it in a separate commit only after H17 PASSES. Rewrite the
   `[bug-lock]` in `_SnackbarRoot.mui.spec.tsx:258` to the fixed behaviour in that same commit. Give verifier 2 the
   Tier P scenario (mount/unmount ×200).

## 8. Handoff state

| Handoff | SHA | Verdict / where |
| --- | --- | --- |
| H1–H11 | see `git log` and plan §30–§33 | passed, closed (H10 failed, then H10b passed) |
| H12 Popover | 245e579 | PASS with an OPEN item, later closed |
| H13 PopoverModal | 1f6c32e | PASS |
| H14 SearchableSelect | a0936b1 | PASS; the DropdownMenu arrow OPEN item was closed with 92abeba |
| H15 Autocomplete | 01bcea8, fix 13077d6 (+ ca3fefb Tooltip ids) | FAIL (id prefix), then PASS at 277bc04 (verifier 2) |
| H16 Drawer | cef8535 | FAIL (scroll lock, tooltip arrow) |
| H16b | 277bc04 (pkg-16d, lost at reboot) | FAIL for the BusinessProfile tooltip, scroll lock and readiness PASS. Broad sweep closed as partial |
| H17 Snackbar | e56293b | PASS at 277bc04, unsubscribe fix committed separately in 452359b |
| H18 small items (FlagAdornment, hexToRgb, useMediaQuery, AutocompleteWithAnchor, Skeleton, notices) | 76817e8…72f20f2 + 277bc04 | PASS at 277bc04 |
| d51c135 delta re-judge (ButtonBase spacing) | fixed in e04a23c | PASS at 277bc04 |
| H19 AppBar/Toolbar, FocusTrap, DateRangePicker, adornments, AIAssistant, Documents | cac6a6b (pkg-19, lost at reboot) | FAIL for the masked DateRangePicker adornment. Navbar D15 tie #13 accepted at 73d25d7 |
| H19b / H16c shared corrective pack | 32a6b93a2683ea766d4406fae4693e918dbd3a93, SHA-256 bd4cc895eb200808677f95d5a28dd644173b59c997f284e1e4a7d6281d2ab6b0 | Sent to both verifiers. V1 rechecks 601b392 and restarts the broad consumer sweep, V2 rechecks 4d88e97 in the actual masked picker |
| H20 B.3 work (lazy splits, gates, theme reader, preload fix, WP inline fix) | 0f71f7f … 803051f | NOT SENT |

Packs and `SHA256SUMS` live at `/Users/a.kott/vanguard-verify/packs/`. The 12:25 reboot removed the old scratchpad
packs. The watchdog closed the `277bc04` sweep as partial and directed the broad sweep to restart on H19b / H16c.

## 9. Running or parked at handover

1. **Timing runs.** `scratchpad/timing.sh` runs a cold then a warm full spec project at 0f71f7f (before the lazy
   splits), c8e69a2 (global preload) and f703205 (after the fix), in detached worktrees `scratchpad/wt-<sha>` that
   symlink node_modules. Output goes to `scratchpad/timing.txt`, with the logs beside it.
   1. It was still on its first run at handover. If timing.txt ends with DONE, use the numbers. Otherwise re-run the
      script at a comparable load (it records the load average per run).
   2. Caveat: the worktrees share `node_modules/.vite`, so "cold" clears only the vitest results cache.
   3. Remove the worktrees afterwards: `git worktree remove --force <dir>`.
2. **DatePicker S1.** The Codex draft produced nothing (it hung on stdin, then hit the 2 h limit). Discard that
   session. The placeholder and the red 8-case parity spec are parked OUTSIDE the tree at
   `scratchpad/s1-parked/DateCalendar/`. The spec compares against MUI X 9.17 DateCalendar with a pinned date. MUI X
   calendar CSS is extracted in `scratchpad/cal-emotion-0.json` / `-1.json` (both themes; they differ only in font
   size). Restart S1 only after the text-field port, with `< /dev/null`.
3. The reboot stopped the timing script. The five finished samples and the void sixth sample are recorded in
   plan §36.5. The three benchmark worktree registrations have been removed.

## 10. OWED, in order, with the next commands

1. **Preload-fix timings → plan §36.5.** Wall time and setup time, cold and warm, at the 3 commits (§9.1). The suite
   must not be slower than before the splits beyond noise. Then re-run once each earlier "load timing" failure
   classified after 7072a25: `_Form.spec`, Chip parity, DateRangePicker, the Autocomplete differential, the
   Autocomplete computed parity story.
2. **Storybook global preload (7072a25).** Remove it. Add explicit preloads via meta-level `beforeEach` in the
   stories that render MUI routes. Find them by running `--project storybook` for the affected dirs without the
   preload.
3. **Corrected eager-@mui number in §36.3.** The packed 32a6b93 build has 25 of 298 (+1 allow-listed), including
   the restored planner fallback. Expect 24 once B's f94d932 is merged. The earlier "4 of 298" was never shippable.
4. **No-preload first-render packed smoke (§36.4.3.2).** In `package-fixture/smoke/bundle.test.tsx`, render every
   WordPress export and the ModalHost/Autocomplete/Menu/Snackbar/AppBar shapes without preload, and assert content on
   the FIRST render (not waitFor). Raise the counts.
5. **H20 handoff to verifier 1** (§4 format).
   1. Full gate first (build config changed).
   2. Ask explicitly for first-paint captures (no settle wait) on both builds for Autocomplete (26 sites), the IMask
      inputs (PhoneNumber, DateRangePicker), AccountNavMenu and every lazy-split component.
   3. Say that any "load timing" failure before f703205 may have come from the old preload.
6. **Own text field: `InputProps.ref` + `inputComponent`** (FIRST of the ports, §36.4.1).
   1. `InputTextField` (src/primitives/react/TextField/) forwards `slotProps.input.ref` to the InputBase root (it is
      Autocomplete's popper anchor).
   2. It renders `inputComponent` in place of `<input>`, with the same props and ref MUI passes (MUI's styled `as`
      forwards all props except ownerState/theme/sx/as).
   3. Remove `ref` and `inputComponent` from `OWN_TEXT_FALLBACK_INPUT_KEYS` in
      `src/core/_internal/InputBase/MuiTextField.tsx`.
   4. Sites: Autocomplete renderInput (`InputProps.ref`), `PhoneNumberBase` (PhoneNumberIMask), `DateRangePicker`
      (DateRangePickerIMaskInput).
   5. Differential: freeze today's MuiTextField as `_MuiTextField.mui-reference.tsx`; per consumer component, load
      once with `vi.doMock` of the router module. Compare DOM, the popper anchor rect (3 sizes + multi-with-chips),
      typing/caret/paste/controlled reset for IMask, and focus/hover/disabled/error computed styles. Add a WordPress
      smoke for Autocomplete + Input.
   6. After that, the MuiTextField route may become lazy for real, with all three reachability evidences.
7. **Consumer-fixture theme evidence (§36.3).** A consumer's own MUI ThemeProvider with
   `components.MuiTextField.defaultProps` around a packed Vanguard Input, on .472's Vanguard and on the candidate.
   Does the default apply? MUI and emotion are both bundled, so expect "no" on both. Log it in §36.3.
8. **DatePicker S1 → S2 → S3** (§36, §9.2).

## 11. Open findings

1. **Drawer readiness / first render.** Verifier 1 measured 277bc04 vs .472, 10 loads per side, fingerprinted. There
   is no candidate-only failure; the first-pass blank bodies did not reproduce. The candidate's spread is wider on 2
   of 3 stories under load 50–90, not deterministic. Remaining: the "Edit opening times" arrow trace, due with the
   H16b/H17/H18 verdicts.
2. **Tooltip x 506 vs 514** (BusinessProfile drawer). The cause matches 601b392; expect x 514 on a pack containing
   it.
3. **SnackbarRoot pub-sub unsubscribe fix.** Only after the H17 PASS (§7.8).
4. **ModalHost two-phase (f1924b5).** Commits per open vs MUI: Drawer 3 = 3, SearchableSelect 5 vs 6. Order spec:
   `src/primitives/react/Modal/_modal-host-order.spec.tsx`.

## 12. User to-do items logged in the plan ("Decisions for the user")

1. Before release, check `<head>` CSS order in the built rc-webapp (entry/vanguard/route CSS) and the 12 tie rules in
   7 places.
2. Other rc-webapp shapes that import style.css statically, and the WordPress enqueue order.
3. The DatePicker locale format table (dash vs underscore keys): fix or keep.
4. WordPress plugin: does it pass any fallback props to Autocomplete/Input/Select/Textarea (§36.3 table)?
5. Next-major list: remove `@mui/material` and the remaining fallback props, and the RtlProvider allow-list together
   with RTL routing.
