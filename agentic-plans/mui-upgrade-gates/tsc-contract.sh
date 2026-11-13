#!/usr/bin/env bash
# Type-check the MUI contract tests (jsdom specs + Storybook contract stories) with bundler resolution.
# The config is written into node_modules/ so that `types` and `extends` resolve like the repo's own configs.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
CFG="$ROOT/node_modules/.tsconfig.mui-contract.json"
cat > "$CFG" <<'JSON'
{
  "extends": "../tsconfig.spec.json",
  "compilerOptions": { "rootDir": "..", "moduleResolution": "bundler", "module": "ESNext", "noEmit": true },
  "include": [
    "../src/**/_*.mui.spec.ts",
    "../src/**/_*.mui.spec.tsx",
    "../src/**/_*MuiContract.stories.tsx",
    "../src/helpers/_hex-to-rgba.spec.ts",
    "../src/core/DatePicker/_date-picker-value-parser.spec.ts",
    "../src/global.d.ts",
    "../src/vite-env.d.ts",
    "../vitest.shims.d.ts"
  ],
  "exclude": []
}
JSON
cd "$ROOT" && ./node_modules/.bin/tsc -p "$CFG"
