#!/usr/bin/env bash
# Infrastructure regression: a compiler crash must never produce a green static gate.
set -eu
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP=$(mktemp -d)
TMP=$(cd "$TMP" && pwd -P)
trap 'rm -rf "$TMP"' EXIT
G="$TMP/agentic-plans/mui-upgrade-gates"
mkdir -p "$G/baseline/master-ts7" "$TMP/bin" "$TMP/node_modules/.bin"
cp "$HERE/gates.sh" "$G/gates.sh"
cp "$HERE/compare-clean-biome.cjs" "$G/compare-clean-biome.cjs"
printf '%s' '{"inventory":{}}' > "$G/baseline/master-ts7/lint-warnings.json"
for f in baseline-tsc-app.txt baseline-tsc-lib.txt lint-errors.txt; do : > "$G/baseline/master-ts7/$f"; done
printf '#!/bin/sh\nexit 0\n' > "$G/tsc-contract.sh"
printf '#!/bin/sh\nexit 137\n' > "$TMP/node_modules/.bin/tsc"
cat > "$TMP/node_modules/.bin/biome" <<'JS'
#!/usr/bin/env node
process.stdout.write(JSON.stringify({summary:{errors:0,warnings:0,diagnosticsNotPrinted:0},diagnostics:[]}));
JS
chmod +x "$G/tsc-contract.sh" "$TMP/node_modules/.bin/tsc" "$TMP/node_modules/.bin/biome"
if PATH="$TMP/bin:$PATH" bash "$G/gates.sh" crashed > "$TMP/result" 2>&1; then
  cat "$TMP/result"
  echo 'FAIL: compiler exit 137 was accepted as green'
  exit 1
fi
echo 'PASS: compiler crash rejected'
printf '#!/bin/sh\nexit 0\n' > "$TMP/node_modules/.bin/tsc"
printf '#!/bin/sh\nexit 137\n' > "$G/tsc-contract.sh"
if PATH="$TMP/bin:$PATH" bash "$G/gates.sh" contract-crashed > "$TMP/result" 2>&1; then
  cat "$TMP/result"
  echo 'FAIL: contract compiler exit 137 was accepted as green'
  exit 1
fi
echo 'PASS: contract compiler crash rejected'
printf '#!/bin/sh\nexit 0\n' > "$G/tsc-contract.sh"
PATH="$TMP/bin:$PATH" bash "$G/gates.sh" healthy > "$TMP/result" 2>&1
echo 'PASS: healthy tools accepted'

# TypeScript uses exit 1 (diagnostics, outputs skipped) with --noEmit.
printf 'known.ts: error TS2322: baseline diagnostic\n' > "$G/baseline/master-ts7/baseline-tsc-app.txt"
cp "$G/baseline/master-ts7/baseline-tsc-app.txt" "$G/baseline/master-ts7/baseline-tsc-lib.txt"
printf '#!/bin/sh\ncase "$*" in *tsconfig.spec.json*) exit 0;; esac\necho "known.ts(1,1): error TS2322: baseline diagnostic"\nexit 1\n' > "$TMP/node_modules/.bin/tsc"
PATH="$TMP/bin:$PATH" bash "$G/gates.sh" diagnostic-exit-one > "$TMP/result" 2>&1 || { cat "$TMP/result"; echo 'FAIL: baseline diagnostics exit 1 rejected'; exit 1; }
echo 'PASS: baseline diagnostics exit 1 accepted'

# A crash must not be accepted from a previous run's lint JSON.
mkdir -p "$G/out/stale-lint"
printf '%s' '{"summary":{"errors":0,"warnings":0,"diagnosticsNotPrinted":0},"diagnostics":[]}' > "$G/out/stale-lint/lint.json"
printf '#!/bin/sh\nexit 137\n' > "$TMP/node_modules/.bin/biome"
if PATH="$TMP/bin:$PATH" bash "$G/gates.sh" stale-lint > "$TMP/result" 2>&1; then
  cat "$TMP/result"
  echo 'FAIL: stale lint JSON accepted after Biome exit 137'
  exit 1
fi
echo 'PASS: stale lint JSON rejected after Biome crash'
for kind in missing malformed; do
  if [ "$kind" = missing ]; then
    printf '#!/bin/sh\nexit 0\n' > "$TMP/node_modules/.bin/biome"
  else
    cat > "$TMP/node_modules/.bin/biome" <<'JS'
#!/usr/bin/env node
process.stdout.write('{');
JS
  fi
  if PATH="$TMP/bin:$PATH" bash "$G/gates.sh" "lint-$kind" > "$TMP/result" 2>&1; then
    echo "FAIL: $kind Biome output accepted"; exit 1
  fi
  echo "PASS: $kind Biome output rejected"
done
printf 'src/known.ts|known-rule|1\n' > "$G/baseline/master-ts7/lint-errors.txt"
cat > "$TMP/node_modules/.bin/biome" <<'JS'
#!/usr/bin/env node
const fs = require('fs'), path = require('path');
process.stdout.write(JSON.stringify({summary:{errors:1,warnings:0,diagnosticsNotPrinted:0},diagnostics:[
  {location:{path:'src/known.ts'},severity:'error',category:'known-rule',message:'baseline error'}
]}));
process.exit(1);
JS
if PATH="$TMP/bin:$PATH" bash "$G/gates.sh" baseline-lint > "$TMP/result" 2>&1; then cat "$TMP/result"; echo 'FAIL: baseline lint errors accepted despite user zero-error rule'; exit 1; fi
echo 'PASS: even master baseline Biome errors rejected by zero-error rule'

# The strict final lint gate permits no errors or new warning identities.
node "$HERE/clean-biome-selftest.cjs"

node "$HERE/result-files-selftest.cjs"
node "$HERE/selection-selftest.mjs"
