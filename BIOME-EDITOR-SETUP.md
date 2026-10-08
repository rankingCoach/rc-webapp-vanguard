# Biome — editor setup (VS Code & PhpStorm)

**Biome** (`biome.json` at the repo root) is the linter **and** formatter **and** import organizer for
Vanguard — one tool, replacing ESLint + Prettier. Same setup as the webapp (`rc-webapp/html/react`), same
ruleset; the only formatter difference is quote style — Vanguard keeps **single quotes** (translated from
the old `.prettierrc.js`), the webapp uses double.

Version is pinned in `package.json` (`@biomejs/biome` 2.5.6); editors must use the **project binary**
from `node_modules`, never a globally installed one, so everyone formats identically.

Prerequisite for both IDEs: `pnpm install` (installs the pinned Biome).

---

## VS Code

1. Install the **Biome** extension (`biomejs.biome`) — it is in `.vscode/extensions.json`, so VS Code
   prompts you automatically.
2. Done — the committed `.vscode/settings.json` does the rest. On every save of a `.js` / `.ts` / `.tsx`
   file Biome formats the file, organizes imports and applies safe lint fixes. Other file types (SCSS,
   JSON, …) are untouched.

## PhpStorm / WebStorm

PhpStorm **2024.3+** has Biome support built in; on older versions install the **Biome** plugin first.

1. **Settings → Languages & Frameworks → Biome**.
2. Point it at the project's Biome: **Biome package** `node_modules/@biomejs/biome`, **Configuration
   path** `biome.json` (only if not auto-detected).
3. Enable ✅ **Run format on save** and ✅ **Run safe fixes on save** (includes import organizing).

---

## CLI

```bash
pnpm exec biome check --write path/to/file.tsx   # ← what format-on-save does: format + organize imports + safe fixes
pnpm exec biome check --write --staged           # same, for everything you have staged
pnpm check                                       # report across src (no writes)
pnpm lint                                        # lint all of src (warnings expected; errors must be 0)
pnpm lint:err                                    # errors only — the "is it green" gate
pnpm exec biome lint path/to/file.tsx            # lint one file
```

⚠️ **`biome format` is NOT what your editor does.** Format-on-save runs the formatter, the
`organizeImports` assist and safe lint fixes — only `biome check` runs all three. `pnpm format` leaves
imports unsorted, so files change again the next time they are saved. Use `check` / `check:fix`.

## Scope rules

- **`*.stories.tsx`, `*.story.tsx` and `window.store.ts` are formatted but NOT linted** (`overrides` in
  `biome.json`).
- **Generated code** — `src/models/swagger/`, `src/stores/swagger/` and
  `src/custom-hooks/use-dynamic-import/assets/index.ts` — is excluded entirely. Never format it by hand.
- ⚠️ **Until the tree-wide reformat lands:** do NOT run `pnpm format`, `pnpm check:fix` or
  `biome check --write` across all of `src` — that reformat (~1150 files) must be its own isolated,
  blame-ignored commit:
  ```bash
  pnpm exec biome check --write --linter-enabled=false src
  ```
  then add its SHA to `.git-blame-ignore-revs`. Formatting single files you are already changing is fine.
  (`pnpm format:check` and `pnpm check` failing repo-wide is expected until then.)

## TypeScript

`typescript` is **7.0.2** — the native Go compiler, same as the webapp — so `tsc` *is* tsgo
(`@typescript/native-preview` is gone). Type check: `pnpm exec tsc --noEmit -p tsconfig.lib.json`; the build runs
the same via `tsgoChecker` in `vite.config.lib.ts`.

TS 7's package no longer exposes the JS compiler API, but `vite-plugin-dts` (which emits the published
`dist/types`) and `vite-plugin-checker` still need it — `.pnpmfile.cjs` gives them their own TS 5.9.3 copy.
`vite-plugin-ts` was removed (it bundled TS 4.9 and rejects `moduleResolution: "bundler"`); `.ts`/`.tsx`
now go through Vite's built-in esbuild transform, like Storybook and Vitest already did.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Formatting produces **tabs** | Biome is running without `biome.json` (tabs are its default). Set the configuration path explicitly in the IDE. |
| "No files were processed" | The file is a generated, excluded file, or you linted a story / `window.store.ts` (lint-off by design). |
| IDE and CLI disagree | The IDE resolved a global/bundled Biome instead of `node_modules/@biomejs/biome`. |
