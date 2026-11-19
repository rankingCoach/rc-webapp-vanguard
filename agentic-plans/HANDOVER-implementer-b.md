# Handover: implementer B (Vanguard own-core rebuild)

For a reader with zero context. This file, `agentic-plans/ui-sdk-thread-b-log.md` (B's full log: every decision,
evidence, batch table) and A's plan `agentic-plans/ui-sdk-architecture-investigation.md` are the sources of truth.
When something here is short, the log has the long version under the section named.

## 1. Role

1. Vanguard (`@rankingcoach/vanguard`, published to the public npm registry) is being rebuilt on its own behaviour
   core, modelled on UI SDK. MUI is removed component by component.
   1.1 The public props API stays identical.
   1.2 Visual change stays minimal.
   1.3 The WordPress bundle (`dist-wordpress`, entry `src/index-wordpress.ts`) must keep working.
2. Threads:

   | thread | id | role |
   |---|---|---|
   | watchdog | `722326f5-024a-4cef-90a8-b30b19b29ef4` | full authority while the user is away; decisions are binding (log them as "decided-by-watchdog") |
   | implementer A | `9bbd975d-b090-467c-a1c2-8dd151cce2e3` | owns primitives, gates, package.json, plan; merges B's verified SHAs |
   | verifier 1 | `80fcbccb-4649-4a3a-88e7-93c70c8198d6` | track g Tier A/B (G1–G7 done) |
   | verifier 2 | `mcp:launch:272ebfa79da059bf6743afb44a77879389bfedf3ec30ca2cce19e696e85efd84` | B batches, G8–G10, track h, f94d932 (current) |

3. B implements. A merges B's work only after a verifier PASS on the EXACT SHA. B tells A "READY TO MERGE <sha>"
   after each PASS.

## 2. Workspace

1. Worktree: `/Users/a.kott/.t3/worktrees/rc-webapp-vanguard-git/feature-ui-sdk-b-data-s-aed05ed8753acf33`
2. Branch: `feature/ui-sdk-b-data-slots`. A's branch: `feature/ui-sdk-architecture-investigation`.
3. rc-webapp (read-only, for usage scans): `/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src`.
4. Shell is zsh: `$VAR` holding a space-separated file list does NOT word-split, so wrap such commands in
   `bash -c '…'`.
5. Never use bare `git stash`. Use `git stash push -m <unique-tag> -- <files>`, then apply the entry by its SHA and
   drop it, re-finding it by tag (the stash stack is shared with other worktrees).

## 3. Hard limits (verbatim intent, still in force)

1. No database, backend/PHP, live app or real user data. Storybook and the test kit only.
2. No `git push`, tag, publish, rebase or force, and no operation on any branch but B's. Local conventional commits
   only, commitlint-clean, no `Co-Authored-By` trailer (user rule: B never adds attribution lines).
3. No test weakened or deleted.
   3.1 Touching an existing test file: imports/setup only, and list each edit in the handoff.
   3.2 A bug-lock may be rewritten to the fixed exact value only with a watchdog decision, named in the commit
       message.
4. Never edit A's files:
   4.1 `src/primitives/**` (import read-only; a missing capability is a request to A).
   4.2 `agentic-plans/ui-sdk-architecture-investigation.md`.
   4.3 `package.json` and its dependencies.
   4.4 vite / tsconfig / vitest config.
   4.5 Gate scripts (`scripts/check-*`, `agentic-plans/mui-upgrade-gates/**`), except an allow-list entry A explicitly
       asks for.
   4.6 Exception: one A-approved `@use` line per compat partial in `src/styles/mui-compat.scss`. StyledSVG stays LAST.
5. Do not run `package.sh`, `gates.sh` or `tiered-tests.py stage`. Run the specs/stories of what you touched, tsc,
   and biome on your own files (never `biome check --write` on files you did not author).
6. A refused tool call: satisfy the hook or stop and report; never route around it.
7. Never end a turn after a status report while work is queued.
8. Rebase is forbidden. Sync by MERGING A's tip.
9. A cancelled call that arrives together with another thread's message is an interruption, not a decline:
   re-issue safe calls and continue.

## 4. How B works

### 4.1 Build, pack, measure

1. Build: `pnpm run build` (writes `dist/`, `dist-wordpress/`, `.vg-build/`).
2. Pack: `npm pack --ignore-scripts --offline --no-update-notifier --pack-destination <dir>`. Without `--offline`
   it hangs on the network. pnpm 11 has no `--ignore-scripts` for pack. Rename the tarball to
   `vanguard-b-<sha>.tgz`. Packs live in the session scratchpad, which is not durable: rebuild if it is gone.
3. Size: `node agentic-plans/uisdk-tools-b/measure-exports.mjs > out.json` after a build. Per public export it gives
   the static ESM import closure over `dist/*.js`, gzip level 9 per file, summed (an upper bound, used for
   comparison), the eager heavy libraries, and lazy chunks.
4. Other tools in `agentic-plans/uisdk-tools-b/`: `collision-check.sh` (selectors/queries that would match newly
   added `data-*` names; required in every attribute batch) and `attr-only-check.py`.
5. A's gates, run after a build:
   5.1 `node scripts/check-eager-mui.mjs`: the eager graph of every public export must contain zero `@mui/*`
       (rule B.3).
   5.2 `node scripts/check-wordpress-dynamic-imports.mjs`: 0 missing.
   5.3 `node scripts/check-fallback-audit.mjs`: N preload / N allow-listed / 0 unexpected.
6. Targeted tests: `npx vitest run --project spec <files>` and `--project storybook <story files>`; never with an
   empty file list (that runs everything). Full spec project:
   `npx vitest run --maxWorkers=4 --project spec src` (~10 min).
7. Junk-token / class scan over all stories: build a static Storybook (`npx storybook build -o <dir>`) before and
   after a change. Scan every story iframe with Playwright and compare. The scripts used are in the old session
   scratchpad (`junk-scan.mjs`, `junk-compare.mjs`); rewrite them if lost. The method is in the log section
   "Track (h) … implementation + proof", point 8, and includes a before-vs-before noise run.
8. Chromium differentials: side-by-side stories `_<Name>Parity.stories.tsx` comparing computed styles of old vs new.
   Each one has guards: forced `:hover`/`:active` via cloned rules with `[data-force-*]`, infinite animations
   frozen, icons-loaded wait, and a state-change guard so equality is never vacuous.

### 4.2 Method per component (track g)

1. Keep the former MUI implementation verbatim as a test-only `_<Name>Mui.reference.tsx`.
2. Run a whole-subtree DOM parity spec over the prop matrix and interaction timelines, in both themes
   (`VanguardThemeProvider`).
3. Run a mutation check: the spec must fail when you break the port.
4. Run the Chromium differential above.
5. Add a cleanup spec (no timer or document/window listener left; warm up React DOM and jsdom nwsapi before
   spying).
6. Put MUI's emotion CSS into a static `_<Name>.compat.scss` at the same specificity: `.Mui*:where([data-vg-core]…)`,
   with variant conditions inside `:where()`. Wire it with one A-approved `@use` line.
7. Port headers: `// Ported from @mui/material@9.5.0 <files> (MIT)`, plus `(emotion styles)` for CSS.
8. Markers:
   8.1 `data-vg-core` on own-core roots.
   8.2 `data-slot` naming: a bare slot on the element carrying the state classes, `-container` on a distinct
       ComponentContainer wrapper; a caller's data-slot wins.
   8.3 State attributes are boolean (`''` or absent).
9. Run the full spec project before the pack for anything shared-level (Icon, StyledSVG, Button, classNames
   helper).

### 4.3 Handoff format (to a verifier)

1. Pack path and tip SHA.
2. Base SHA and range.
3. Changed files.
4. Expected form: what may differ (declared deltas) and that nothing else does.
5. The story ids and spec files to run.
6. The rc-webapp screens to pick, from a usage scan.
7. WordPress membership.
8. Gates with counts (state exactly which suite ran).
9. Size, with its derivation.
10. Known non-blocking items.

### 4.4 Merging A's tip

1. `git merge --no-edit feature/ui-sdk-architecture-investigation`. The usual conflict is
   `src/styles/mui-compat.scss`: keep every `@use` line from both sides; StyledSVG stays last.
2. After the merge, run `scripts/_mui-compat-order.spec.ts` (scripts project), tsc, and the specs of anything the
   merge touches.

## 5. Rules in force (decided)

1. Attribute-only batches: add `data-*` only, no other markup change. Collision check per batch.
2. Slot naming: see 4.2.8.
3. Class builders (watchdog split, track h). There are two, on purpose; never unify them.
   3.1 Internal `cx` (A's `src/primitives/react/class-names.ts`, never exported) for own-core components that
       reproduce MUI markup. It collapses whitespace.
   3.2 The public `@helpers/classNames` for everything else. It drops non-string/empty entries and is byte-identical
       to a plain join for all-string calls (it keeps internal double spaces).
   3.3 `src/helpers/_class-builders-contract.spec.ts` pins the difference.
   3.4 Never pass booleans to a plain-join helper, and never build classes with template literals containing
       possibly-unset values.
4. Lazy MUI routes (rule B.3): "unreachable" needs all three pieces of evidence BEFORE commit.
   4.1 A site scan: rc-webapp incl. service paths, other Vanguard components, WordPress exports.
   4.2 A full spec run without global preload. Since A's f703205 that is the default: specs that deliberately render
       a MUI route preload locally and are allow-listed in
       `agentic-plans/mui-upgrade-gates/fallback-audit-allowlist.json`.
   4.3 A packed-build render without preload, asserting first-render content for every shape Vanguard renders.
   4.4 If the route is reachable: no lazy split.
5. No blanket sweeps. Fix sites individually, keep token order, prove each against its former expression.
6. No new components while the verifier backlog is ≥ 5. After track g the watchdog said no new components at all;
   do verification support instead.
7. Story files: Storybook indexes only `src/core/**/_*.stories.tsx` plus an explicit list in `.storybook/main.ts`.
   Every named export in a story file is a story.

## 6. DONE

| track | what | B SHA(s) | verdict | on A's branch |
|---|---|---|---|---|
| 1 | data-slot / state attributes on own components, batches B1–B10 | see log "Batches" | verifier 2 PASS (each) | merged (A's merges of b-data-slots) |
| 2 | agent docs (`docs/llms.txt`, per-export pages, `skills/vanguard/SKILL.md`, `scripts/generate-agent-docs.mjs`) | see log "Track 2 build" | watchdog approved | merged |
| 3 | duplication audit items 1/3/7/10 | see log | watchdog approved | merged |
| b | enable never-run tests | see log "(b)" | PASS | merged |
| d | leak hygiene (FadedCarousel rAF, StarRating timer, …) | see log "(d)" | PASS | merged |
| e | D10 measurement (no code) | — | accepted | n/a |
| f | f1 xlsx/jszip lazy `ec7b592`; f4 animateWords lazy `768ca96`; f3 StyledSVG → static SCSS `817bf04` | B10 = 768ca96+817bf04 | verifier 2 PASS | merged (A: d282b41 for B10) |
| — | StyledSVG `false`-token fix | `3ec95a8` | verifier 2 PASS | `d51c135` |
| g1–g3 | Collapse, Fade, ProgressBar (+ licence headers) | `4856fa1` | verifier 1 Tier A PASS | `5790134` |
| g4–g5 | Accordion, ListShowMore | `ecfabc0` | verifier 1 PASS | `0109680` |
| g6 | Chip | `b9f8736` | verifier 1 PASS | merged |
| g7 | Button (Grow → A's Grow) | `7c7dc1f` | verifier 1 Tier A+B PASS | merged |
| g8–g9 | Breadcrumbs, Pagination | `80cef30` (+`44075a0` log) | verifier 2 PASS | merged |
| g10 | Slider (component-local `use-own-slider.ts`) | `48a8270` + `0cac8bd` | verifier 2 PASS | merged (inside `803051f`) |
| — | StyledSVG legacy-parity lock story | `3911192` | in track h range, PASS | inside `803051f` |
| h | junk class tokens (public helper + 7 sites + ProgressCircle story) | `e280b17` + `bb393ac` | verifier 2 PASS | inside `803051f` |
| h | own-core on `cx` | `9903d56` | verifier 2 PASS | `803051f` |
| — | StarRating remount growth | log only | classified not-a-leak (watchdog) | n/a |

Verify any row with `git merge-base --is-ancestor <sha> feature/ui-sdk-architecture-investigation`.

## 7. OPEN: exact next steps

1. **f94d932: ProgressBar MUI buffer/query route behind a lazy boundary.**
   1.1 Handed to verifier 2. Verifier 2 confirmed it is queued immediately after H19 and will verify that exact SHA.
       All three reachability results went with it. The evidence is in the log,
       last section.
   1.2 On PASS: tell A "READY TO MERGE f94d932". A merges only that exact SHA.
2. **Allow-list follow-up for f94d932: COMMITTED as `d4cdc1d`.**
   2.1 The entry `src/core/ProgressBar/_ProgressBar.mui.spec.tsx` is in `fallback-audit-allowlist.json` (A asked B
       to add it). check-fallback-audit: 17/17/0.
   2.2 It is test-infra only. Verifier 2 and A were told; A merges it after f94d932 passes.
3. **Merge A's latest tip** (f703205 and anything after). Then confirm:
   3.1 the full spec project is green without global preload (that run is the reachability audit);
   3.2 `check-fallback-audit` reports 17/17/0;
   3.3 the eager-@mui count is as A reports it.
   Note: since A's c8e69a2 made the InputBase route eager again, check-eager-mui reports 23 of 298; none of them is
   B's.
4. **Agent surface (track 2) remaining items** (log "Track 2 …" sections):
   4.1 Regenerate `docs/` after the component ports with `node scripts/generate-agent-docs.mjs`. The library build
       also regenerates it. `scripts/_agent-docs.spec.ts` checks determinism and content of fresh output in temp
       directories. The comparison against the previous local output is recorded in the log.
   4.2 Page coverage for the "Internals pending rebuild" exports as their ports land.
   4.3 Example coverage (lowest priority).
5. **D10 measurement table refresh.** Re-run `measure-exports.mjs` on a fresh build after A's lazy splits and after
   f94d932. Update the log's "(e)" table (heavy-library eager-from lists, emotion-eager export count; last known
   37 of 299 before A's splits).
6. **Verification support** (the current priority per the watchdog): story-id lists, rc-webapp screen picks
   (usage scans) and parity-run file lists for the verifiers, on request.
7. **Later, scheduled by A:** move `src/core/Slider/use-own-slider.ts` and
   `src/core/Collapse/Collapse/own-collapse.tsx` into `src/primitives` after the motion group. One move commit each;
   their specs move along. Keep them component-local until A says so.
8. **Motion group** (Skeleton, IconButton, AnimatedConditional(+Switch), SlideTransition, CardMotion). This was
   B's next track-g group, but the watchdog said no new components. Do not start it without a new decision.

## 8. Findings B raised that are still open

1. **StyledSVG `<path>` width 16px → auto on rc-webapp (verifier 2), MINOR.**
   1.1 Verifier 2 is to send the matched-rules dump for one such path (CDP getMatchedStylesForNode on pack-15).
   1.2 Log which cause it was:
       1.2.1 pack CSS missing the StyledSVG.compat block;
       1.2.2 last block not loaded;
       1.2.3 a consumer rule winning (the watchdog wants 1.2.2/1.2.3 logged as a D15 order data point).
   1.3 No rendering effect: CSS width/height do nothing on `<path>`.
2. **`slider-slidermuicontract--drag-in-real-browser`** (A's story): RESOLVED as a scan artefact.
   2.1 It never completes under B's plain static-story load (no play runner).
   2.2 Verifier 2's saved G10 story-runner result shows it PASSED at 0cac8bd (`v2/out/par/g10-stories.json`).
   2.3 Not re-run at the current tip. Only act if a story-runner run fails it.
3. **tsc error in `src/helpers/hex-to-rgba.ts(8,41)` TS2741** (A's eb0df11). Reported to A; check whether it is
   fixed after the next merge.
4. **A's preload `beforeAll` hook timeout** (cold cache: 5/6 files at the 10 s hook, setup 52.5 s; full project
   20 files failed on A's tip). The watchdog ruled to fix the cause. A fixed it in f703205 (no global preload).
   Confirm with a green full spec run after merging A's tip.
5. **`src/primitives/react/Modal/_modal-host-order.spec.tsx` "SearchableSelect menu: open, Escape"** (A's file)
   times out at 5 s, reproducibly, even when run alone, on B's tree after merging A's tip incl. f703205.
   5.1 Full spec project on 803a087 + d4cdc1d: 4 files / 10 tests failed of 377 / 2713.
   5.2 Re-run alone, 9 of those 10 pass (load timeouts in A's Autocomplete/DateRangePicker differentials); this one
       does not.
   5.3 Told A. A green full run is still pending on that.
   5.4 ProgressBar + Rating (B's scope) are green: 6 files / 33.
6. Residue documented, not to be swept: ApexCharts/video.js spacing (third-party) and internal `_showcase` story
   files (101 elements).

## 9. State at handover

1. The tree is clean.
2. Last B commits:
   2.1 `d4cdc1d` (allow-list).
   2.2 `c9802f8` (this file).
   2.3 The follow-up commit with these final updates.
3. Last merge of A's tip: `803a087` (incl. f703205).
4. Pending verification: f94d932 (verifier 2).
5. Nothing in progress.
