# Installed-package contract fixture

From the release worktree root, run:

```sh
agentic-plans/mui-upgrade-gates/package-fixture/run.sh
```

The default command builds both bundles first. `run.sh --skip-build` tests the existing build outputs; rebuild before using that option after a production change. `PACKAGE_FIXTURE_OUT=/absolute/empty/directory` selects a retained output directory; otherwise the runner creates one under `/tmp` and prints it. Run only when other suite/gate runners have finished.

The runner uses `npm pack --ignore-scripts` and installs that tarball in four independent consumers: default/WordPress, each with declared peers only and with the release's MUI material version installed. Installs use `--strict-peer-deps`; there are no force flags, source aliases, workspace links, or consumer `paths`. Peer ranges with broad minimums are exercised at the pinned template versions, not every possible supported peer version. Emotion/imask pins follow the release's declared peers.

WordPress consumers have `.vanguardrc` before installation. Install scripts are disabled for dependencies, then Vanguard's real asset-cleanup lifecycle script is explicitly executed from the consumer cwd. Its selected bundle is asserted using the installed filesystem. The package root import resolves through its actual `exports` map. Four jsdom checks per consumer verify installed entry selection, Button click events, Input native prop/change forwarding, and Textarea rendering. These checks complement source component coverage; they do not repeat every source interaction.

`types-gated.log` must pass with the checked-in `skipLibCheck: true` consumer configuration. The default fixture covers root component declarations and public subpath declaration resolution, with invalid prop and `any` probes. WordPress gates valid exported usage and checks the absence of DatePicker from that entry. `types-*-skip-{true,false}.log` are measurements, not passing gates: they expose MUI-dependent props that become `any`, missing undeclared type dependencies, and incomplete WordPress declarations. Do not describe a passing gated fixture as a clean full declaration check.

Existing S0 limitations: emitted declarations reference undeclared packages including `@mui/material`; root `skipLibCheck: false` fails without those packages. Installing MUI resolves only that dependency, not all missing declaration dependencies. WordPress emitted declarations are incomplete. `wp-measured.tsx`, `mui-typed.tsx`, `undeclared-types.tsx`, and `realistic-usage.tsx` retain diagnostics for those baseline defects. Public runtime subpaths are not covered by the root runtime smoke: some exports point to unbuilt `dist/core/*.js` targets, while default build output uses flattened chunks. No production packaging policy is changed here.

Run results are recorded below after execution; the runner preserves all raw diagnostics and install/smoke logs in its printed output directory.

## S0 peer-graph limitation and mandatory S1 gate

At S0, the optional MUI-present consumer cannot install with strict peers: Vanguard requires Emotion React/Styled **11.0.0**, while Material **5.16.14** requires Emotion React **^11.5.0**. This is a real existing dependency-graph defect. It is not bypassed. `run.sh --baseline-v5` permits only that specifically identified ERESOLVE, with those exact dependency pins; it prints that the MUI-dependent gate is unavailable. Every declared-only bundle/type check still must pass. S0 is therefore not universally peer-valid and M5 is partial with respect to MUI-dependent declarations.

After S1 updates Emotion, use normal `run.sh` without `--baseline-v5`. Normal mode requires all four installs and the additional `tsconfig.default.mui-gated.json` check. That fixture gates healthy MUI-dependent public types against becoming `any` and checks legacy passthrough validity/rejection. It does not absorb diagnostics into a new baseline. The original broader measured fixtures remain separate evidence of pre-existing missing/incomplete declarations.

Install tooling is pinned to `npx --yes --registry=https://registry.npmjs.org npm@11.6.2 install --registry=https://registry.npmjs.org --ignore-scripts --strict-peer-deps --no-audit --no-fund`. Node 22.16.0 / npm 10.9.2 produced an internal Arborist `edgesOut` exception before tests on both the configured registry and public npm registry. npm 11.6.2 completes the declared-only installs and exposes the genuine MUI peer conflict. No force/legacy-peer flags are used.

In this environment, npm 10.9.2 `pack --ignore-scripts` still invoked `prepare`, causing another normal build. The runner retains lifecycle output and extracts the final valid pack JSON. This extra build is accepted; production metadata is preserved. To rerun consumer checks against the identical genuine tarball, set `PACKAGE_FIXTURE_TGZ=/absolute/path/to/rankingcoach-vanguard-2.8.0.tgz`; that skips build/pack. This is useful for tooling diagnosis, and the initial pack/build logs should be retained alongside it.

jsdom platform shims supply the canvas feature probe Lottie performs during import and a non-layout ResizeObserver. No Vanguard/MUI modules are mocked. Browser contract stories remain responsible for real layout and sizing.

`mutation-proof.sh /absolute/temp/default-declared` checks the original consumer gate, changes only the installed Button declaration's `size` to `any`, requires a TS2344 failure, restores the declaration, and requires green again. Its EXIT trap restores on failure as well. The mutation never changes source, build outputs or package metadata.

## Verified S0 result (2026-11-03)

Command: `PACKAGE_FIXTURE_TGZ=/tmp/vanguard-package-fixture.kh3x9x/pack/rankingcoach-vanguard-2.8.0.tgz agentic-plans/mui-upgrade-gates/package-fixture/run.sh --skip-build --baseline-v5`.

Stable final output: `/tmp/vanguard-package-fixture.Z1NraN`, transcript `/tmp/vanguard-package-fixture-verified-run.log`; exit **0** in the explicitly limited baseline mode. Default and WordPress declared-only consumers each passed **4/4** runtime checks and their gated type checks (zero diagnostics). Both MUI-present consumers produced the exact known strict peer conflict, so the MUI-dependent gate remains unavailable at S0.

Measured diagnostics, retained rather than suppressed:

| Consumer | Gated fixtures, skipLibCheck false | Measured fixtures, skipLibCheck true | Measured fixtures, skipLibCheck false |
|---|---:|---:|---:|
| default, declared peers | 90 | 36 | 126 |
| WordPress, declared peers | 85 | 12 | 97 |

Mutation command: `agentic-plans/mui-upgrade-gates/package-fixture/mutation-proof.sh /tmp/vanguard-package-fixture.Z1NraN/default-declared`. Exit **0**: original gate green; `Button.size -> any` produced `components.tsx(76,10): TS2344`; restored declaration green. The installed declaration is restored. These logs live in that consumer as `mutation-before.log`, `mutation-red.log`, and `mutation-green.log`.

Earlier raw failures remain visible: configured/public registry npm10 internal install failures at `/tmp/vanguard-package-fixture.kh3x9x` and `/tmp/vanguard-package-fixture.yN25VD`; npm11 first runtime checks at `/tmp/vanguard-package-fixture.OJCjVf` exposed missing jsdom canvas/ResizeObserver platform primitives. The first WordPress valid-usage fixture also needed explicit callback annotations because the existing declarations omit contextual types (measured negative probes remain intact). `/tmp/vanguard-package-fixture.3C61Lk` passed both raw smokes but its runner exited **2** because the script was edited while bash was reading it. The immutable final runner was then checked with `bash -n` and rerun to completion; this script failure is not presented as a passing run.

For S2's custom DatePicker field, default consumers also gate controlled date restoration and locale changes
against the actual packed DatePicker. Default consumers now run5runtime checks each; WordPress still runs4
because its public entry intentionally omits DatePicker. The current total is18checks across4consumers.
This probe was RED against the pre-fix S2 tarball; the fresh candidate package must pass it. Earlier S0/S1
16-check results above are retained as historical evidence for those stages.
