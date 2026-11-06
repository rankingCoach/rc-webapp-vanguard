#!/usr/bin/env bash
# Demonstrate that the packed declaration consumer gate catches a prop becoming any.
# Mutates only an isolated installed fixture, never production/source/build outputs.
set -euo pipefail
DIR="${1:?usage: mutation-proof.sh /tmp/.../default-declared}"
cd "$DIR"
TARGET=node_modules/@rankingcoach/vanguard/dist/types/core/Button/Button.d.ts
BACKUP=$(mktemp /tmp/vanguard-button-declaration.XXXXXX)
cp "$TARGET" "$BACKUP"
trap 'cp "$BACKUP" "$TARGET"' EXIT
node_modules/.bin/tsc -p tsconfig.default.gated.json > mutation-before.log 2>&1
node - "$TARGET" <<'JS'
const fs=require('fs'), file=process.argv[2];
const text=fs.readFileSync(file,'utf8');
if(!text.includes('size?: ButtonSizes;')) throw Error('Button size declaration changed: update the explicit mutation');
fs.writeFileSync(file,text.replaceAll('size?: ButtonSizes;', 'size?: any;'));
JS
if node_modules/.bin/tsc -p tsconfig.default.gated.json > mutation-red.log 2>&1; then
  echo 'FAIL: declaration any mutation escaped the gate'; exit 1
fi
if ! grep -q 'error TS2344' mutation-red.log; then echo 'FAIL: mutation failed for an unrelated reason'; exit 1; fi
cp "$BACKUP" "$TARGET"
node_modules/.bin/tsc -p tsconfig.default.gated.json > mutation-green.log 2>&1
echo 'PASS: original types green; Button.size -> any red (TS2344); restored declaration green.'
