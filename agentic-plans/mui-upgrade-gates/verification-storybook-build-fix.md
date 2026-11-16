# Storybook production-build memory fix

Implemented locally on release/mui-upgrade after the user's authorization to fix items1 and2. No staging, commits, pushes, publishing or TeamCity changes.

Validation artifacts remain under `/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/`. The fix and tests were moved byte-for-byte into the main `release/mui-upgrade` checkout; evidence `out/` paths below refer to that original validation location. This relocation note is the only post-validation text change.

## Cause and changes

CI build141 (revision36efe27) passed build-lib, then aborted in the static Storybook build with Node heap exhaustion and exit134. Storybook inherited library output/declaration plugins and enabled both Istanbul paths by default.

`.storybook/main.ts` now allows only shared resolution, CSS, esbuild/optimizeDeps and required named transforms. Library mode/output, declaration generation, asset-analysis build plugin and duplicate shared checker are excluded. Storybook owns its output; the existing shared warning policy is retained explicitly. The original shared config is not mutated.

Both addon-coverage and the manual Istanbul plugin require `VANGUARD_ISTANBUL_COVERAGE=1`. The V8 flag takes precedence, disables both and preserves the original-source transform path. Normal development and production builds have no coverage instrumentation.

The new fifth Node test file protects these modes and warning-policy preservation. Resolution guards and future audit counts now enumerate five files /42 cases; coverage remains scoped by project, not file exclusions. README documents the explicit coverage flag.

## TDD and validation

- Initial regression RED: normal production/development inherited library output. Separate default-coverage assertion also reproduced the unintended addon. Both RED reports retained.
- Warning-policy preservation regression RED before the selective onwarn copy.
- Final config regressions:5/5 PASS.
- Production static build: PASS, raw/reported0/0, sleep-VALID,45.594s. Node24.14.1 with `--max-old-space-size=3456`; maximum RSS reported by time was2428010496 bytes. The run was on macOS, not the Linux TeamCity container, so this is not an identical-host benchmark.
- Production log contains no vite:dts, addon-coverage or Istanbul activation. Output contains the generated static Storybook.
- app/lib/contracts/spec compiler gates and lint: PASS,0 errors/no introduced warnings. Dedicated config/test compiler check: PASS.
- Actual Node project:42/42 PASS. Discovery and exact five-file isolation checks: PASS.
- Separate C1:267.338 /171.347 /162.204ms, all below2500ms.
- Full V8 coverage runtime:3069/3069 PASS,0 failed/pending,292 files. All35 mapped files meet95% lines /85% branches; minima96.71 /85.71. No uncaught-error markers.
- git diff --check: PASS. Component source, existing assertions, package/lock and library/app/WordPress build configs unchanged. Production package probes were not repeated because their inputs are unchanged.

Evidence: `out/storybook-build-fix/` and `out/storybook-config-fix-coverage/`. All bounded processes were sleep-valid with no deadline timeout. The first static invocation used an obsolete CLI path and failed before a build started; corrected entrypoint was taken from installed package metadata. The first dedicated type-check invocation hit TS7's TS5112 command requirement; adding --ignoreConfig corrected the invocation, without source/test changes. Both invocation failures remain in history.

Reproduce the static build (no release/publish commands):

```sh
npx --yes --package=node@24.14.1 node --max-old-space-size=3456 node_modules/storybook/dist/bin/dispatcher.js build --output-dir agentic-plans/mui-upgrade-gates/out/storybook-build-fix/storybook-static
```

## Separate CI research — not implemented

The user asked to research master-only Storybook builds, pending confirmation. TeamCity supports parameter-based step conditions. Prefer its full VCS branch metadata; use teamcity.build.branch.is_default only after confirming master is the configured default. Logical labels need not equal full Git branch names.

Proposed flow: common install/library build →master-only Storybook build →common release/package publishing →master-only Storybook archive and all SSH deployment steps. This preserves the existing master failure ordering (Storybook failure blocks publication), while branches skip both the build and every archive/deploy operation. The current combined first step needs conditional separation; merely skipping build-storybook leaves the later tar/upload/extract commands unsafe.

Sources: [build branch parameters](https://www.jetbrains.com/help/teamcity/predefined-build-parameters.html), [step execution conditions](https://www.jetbrains.com/help/teamcity/build-step-execution-conditions.html). No live CI settings or scripts were changed. Waiting for the user's confirmation before implementing this separate policy.
