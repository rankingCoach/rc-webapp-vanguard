# MUI v9 browser baseline — adopted policy

**Decision: option 1, user, 2026-11-06.** Adopt MUI core9 upstream minimums: Chrome 117, Edge 121, Firefox 121, Safari 17.0 and iOS Safari 17.0. S5b (core9.5.0 + pickers9.17.0) is accepted. The user selected Vanguard 3.0.0; standard-version computes it at the master release from the breaking commit. package.json remains 2.9.1 and is not hand-edited.

## Verified upstream and local targets

[Official v7→v9 guide](https://mui.com/material-ui/migration/upgrade-to-v9/#supported-browsers-and-versions),
[tagged v7.3.11 snapshot](https://github.com/mui/material-ui/blob/v7.3.11/.browserslistrc),
[tagged v9.5.0 snapshot](https://github.com/mui/material-ui/blob/v9.5.0/.browserslistrc).

| Browser | Core7 default minimum | Core9 default minimum | Newly below target |
|---|---:|---:|---|
| Chrome |109|117|109–116|
| Edge |121|121|None|
| Firefox |115|121|115–120|
| macOS Safari |15.4|17.0|15.4–16.x|
| iOS Safari |15.4|17.0|15.4–16.7|

Vanguard library and app output target **es2020** (vite.config.lib.ts106/app.ts93); WordPress merges
BaseViteConfig and inherits it. No explicit Vanguard package.json browserslist field was found; the documented policy is now the adopted minimums above. ES2020 is a JS
output setting: it does not establish support for MUI's DOM/CSS/runtime requirements.

Actual consumer: `/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react`, observed branch
`feature/agents-marius-FE` at `b71e8694e1451c4c916f16f70262ff1076043f5d`. Depends on Vanguard2.9.1, Vite5.4.11.
Production Browserslist: `>0.2%`, `not dead`, `not op_mini all`; development: last1Chrome/Firefox/Safari.
Its vite.config.ts115/156 targetses2020; tsconfig.vite/default targets es6, default libes2021+dom.
No consumer files were edited. Master sync is complete: ff-only to f02d3f5, inheriting Vanguard2.9.1, TypeScript7.0.2 and Biome2.6.4. App/lib/contracts/spec and lint gates were re-baselined. The user adopted option 1; the rc-webapp team owns alignment of its consumer targets.

## Concrete consumer delta using OUR locked browser database

Resolved at **2026-11-06T10:38:58.348Z**, Browserslist**4.28.2**,
caniuse-lite**1.0.30001793**, unchanged from pnpm lock. No DB update was run.
The resolver warns the data is six months old; these are reproducible locked-data results, not live
customer analytics. Production query resolves35browser-version entries; complete query/results,
package paths, source snapshots and checksum evidence: `out/s5b-preflight/browser-baseline-delta.json`
and `actual-consumer-target-evidence.json`, `upstream-browser-targets.json`.

| Consumer entries newly below core9 minimum | Was inside core7 minimum |
|---|---|
| chrome116,112,111,109 |Yes, Chrome>=109|
| ios_saf16.6–16.7,15.6–15.8 |Yes, iOS>=15.4|

Those six entries total approximately**3.0463%** in this locked GLOBAL
usage database. This is not the percentage of RankingCoach customers affected. Existing production
query also includes chrome103 andios_saf11.0–11.2, already below the retained core7minimum: a
pre-existing policy mismatch, not a newly caused v9 regression.

The query additionally resolves and_uc15.5,android148,op_mob80,samsung29, whose named families are
not enumerated in the v9 stable snapshot. Keep these separate for engine/compatibility review; absence
from a finite release snapshot does not prove a newer/aliased evergreen browser is unsupported.
Likewise Chrome147/Firefox149–150/Safari26.4 must not be called unsupported merely because they were
released after that snapshot. The reported delta compares per-family minimums, not literal set exclusion.
The earlier raw literal-set artifact is explicitly marked as such and is not a support verdict.

The current installed Playwright executable reports Chromium131.0.6778.33 (rechecked after master sync). That tests a modern supported engine;
it does not prove minimum Chrome 117/Safari17/Firefox 121 or all production-query engines. No new
browser matrix test has been claimed; the policy was adopted by the user, not inferred from a single-engine gate.

## Options considered — option 1 selected

1. **Adopt core9's upstream minimums (selected by the user).** Align documented
   consumer production targets with the minimums above; explicitly decide the already-old and
   unlisted-family cases, using actual customer traffic and the chosen browser test matrix. This avoids
   promising broad support solely because the consumer query still contains those browsers.
2. **Retain the existing wider consumer query.** Authorize separate compatibility work and evidence
   for the older engines, covering CSS/runtime/interaction behavior as well as emitted JS. Current
   ES2020 transpilation alone is insufficient evidence; no universal polyfill fix is promised here.
3. **Defer releasing core9 while policy/evidence is resolved.** Accepted S5a can remain the release
   checkpoint; S5b stays isolated. This delays the latest-core release and does not silently change support.

**Consumer ACTION ITEM:** the rc-webapp team should align its own browserslist and support statement with the adopted minimums. Chrome 109–116 and iOS 15.4–16.7 drop out relative to core7; the concrete production-query entries above total about 3.05% global locked usage, not RankingCoach traffic.

This is a documentation-only policy decision. No Vanguard browserslist field, build target, consumer file, polyfill, package version or power setting was changed. The 846 pre-existing Biome warnings are a separate follow-up after this upgrade.
