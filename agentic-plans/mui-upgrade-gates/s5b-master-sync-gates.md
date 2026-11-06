# S5b master sync and toolchain gate impact

Synced by authorized fast-forward from 95ee244 to f02d3f5 (Vanguard 2.9.1).
No commit, version command or push was performed. Full patch, untracked archive,
file hashes, exact master source provenance and resolver audit are retained at
`/tmp/mui-upgrade/pre-sync-20261106T122630Z/`.

| Gate | Synchronized invocation / baseline | Required evidence |
|---|---|---|
| Production app/lib types | Local `node_modules/.bin/tsc`, native TypeScript 7.0.2 | Clean master app 0 / lib 0; no new errors |
| MUI contract compiler | Same native TS7, bundler resolver; obsolete baseUrl removed | Zero errors; inherited explicit path aliases retained |
| Dedicated additional type probes | Local native TS7 CLI, no JS API import | Native tsconfig.spec.json permanently requires 0 errors, as do app/lib/contracts; rerun changed regressions and consumer API contracts |
| Static lint | Biome 2.6.4 JSON, all diagnostics emitted | User superseded the 42-error baseline: require ZERO errors repo-wide plus no new warning identities vs master; crashes/missing/malformed/truncated output rejected |
| AST/codemod guard tests | Master-provided `typescript5` 5.9.3 JS API alias | Existing assertion bodies unchanged; TS7 has no createProgram JS API |
| Storybook / Vite | Master's TS7 checker, dts TS5 per `.pnpmfile.cjs` | Recheck browser collection and declaration builds |
| Library/WordPress build | Master-only build error and warning inventory | 0 TS diagnostics; existing WP mv error; 720 use-client warnings / 360 identities before MUI bump; dependency warning differences must be reconciled |
| Packed type and runtime probes | Fresh tarball and strict independent consumers | All four declarations plus runtime 5/5/4/4 = 18 |
| Suites / mapped coverage | Synced source/config/lock | No pre-sync full-run reuse; 35 files stay at 95/85; scripts remain mandatory normal node project only |

Historical TS5.9/ESLint baselines are retained. New baselines are separate at
`baseline/master-ts7/`, derived solely from the detached master checkout.
The first old contract harness invocation encountered TS5102 (`baseUrl` removed);
its corrected TS7-only config passed. No test inclusion or behavioral assertion changed.
The clean master contract scope contains only files present on master, not the
untracked MUI characterization suite; the synchronized candidate must independently
pass the full contract scope.

The two master-owned spec updates are listed separately in
`master-sync-frozen-changes.json`, including exact master blob hashes. They are
also registered with the existing frozen auditor so original historical snapshots
remain intact. All other pre-sync source spec/story hashes must remain unchanged.

Browser support remains a user policy decision; see `../mui-v9-browser-baseline.md`.
