# S0 final exception and gate-integrity evidence

S0 final overseer verdict pending. No dependency bump, commit or push.

The overseer approved the narrowly unreachable PopoverModal exception; the fresh reviewer agreed conditionally
and raised a stale ESLint JSON false-green finding. Both remediations below preserve public behavior.

## Coverage exception scope

Original mapped combined run (`s0-mapped`) passed all267files/2983tests, static gates, and34/35file coverage
thresholds. Raw PopoverModal:51/57lines89.47%,37/51branches72.54%,7/10functions. This raw red is retained.

Only the three unreferenced/unattached local declarations are separately bracketed by ignore start/stop comments:

| Declaration | Original region | Current excluded region |
|---|---|---|
| handleMouseEnter |77–81|80–84|
| handleMouseLeave |83–87|89–93|
| handleClick |89–93|98–102|

The original six uncovered executable lines are78–79,84–85,90–91. Removed branch IDs9–15 were seven entries
with14slots, all originally0. Three uncalled functions are excluded. No handleClose/backdrop/effect/JSX code is
excluded. Remove the annotation and add behavioral tests if any declaration is wired or called.

Targeted combined real-MUI specs/browser stories after annotations:32/32tests,2/2files,exit0. Adjusted PopoverModal:
48/48lines100%,37/37branches100%,7/7functions100%. The annotation removes three covered declaration lines plus
six unreachable lines; the other34files retain the passing evidence from the prior full corrected run.

Map audit `out/popover-exception-green/exception-audit.json` verifies exactly14branch slots and3functions
removed; all surviving branch signatures match the original map against their source text. No final statement,
branch or function map starts inside the excluded declaration ranges. Reachable handleClose/backdrop/render
branches remain mapped.

Negative control: run only the existing no-anchor rendering test with the same annotations/95/85thresholds.
The selected assertion passes; coverage exits1 with32/46lines69.56% and21/37branches56.75%. Thus missing reachable
coverage is still rejected. No reachable-code exclusion or lowered threshold was introduced.

Commands used the same V8-only environment, one worker, no file parallelism, PopoverModal source include and
JSON/summary/text reporters. Negative control used `--project spec` and `-t 'isOpen=true without anchorEl renders
nothing'`; positive used both projects and `_PopoverModal.mui.spec.tsx` + `_PopoverModalMuiContract.stories.tsx`.
Artifacts: `out/popover-exception-negative/` and `out/popover-exception-green/`; raw transcripts
`/tmp/mui-upgrade/popover-exception-negative.log` and `/tmp/mui-upgrade/popover-exception-green.log`.

Per overseer instruction, no full-suite rerun solely for comments: prior full2983pass plus targeted behavioral
and mapped coverage evidence are retained. This differs from the reviewer's suggested full rerun but follows the
overseer's explicit targeted-validation allowance.

## Stale ESLint output regression

New selftest preseeded acceptable `lint.json`, simulated ESLint exit137: original gate incorrectly passed (RED).
Fix removes prior JSON before invocation and preserves exit status; only normal0/1 accepted. Missing/malformed
JSON is rejected by the parser/comparison. Final selftests PASS: compiler137,contract137,healthy execution,
baseline TypeScript exit1,stale ESLint137,missing/malformed lint output,baseline ESLint diagnostics exit1.

The added baseline-positive fixture initially hit macOS `/var` vs `/private/var` path aliases; canonicalizing its
temporary root fixed that harness issue. Production gate comparison behavior was not weakened. Final transcript:
`/tmp/mui-upgrade/selftest-final.log`. Coverage-runner selftest also PASS (flags/includes/thresholds/failure exit).

`gates.sh s0-final`:exit0,app1001/lib4errors0new,contract0,lint1319errors0worsepairs. Raw static transcript
`/tmp/mui-upgrade/static-final.log`, detailed artifacts `out/s0-final/`.

## M5 limitation and acceptance

M5 remains partial at S0: declared-only default/WP consumers pass gated types and4runtime checks each, plus
Button.size:any mutation RED/restoredGREEN. Exact strict Emotion11.0/MUI5.16.14^11.5peer conflict remains an
explicit baseline exception; S1 must resolve Emotion and pass normal fixture mode, including MUI-present types.
No universal declaration/peer-valid claim is made. Existing reviewer report is the final fresh review; no duplicate
review started. Final overseer acceptance is still required before S1.
