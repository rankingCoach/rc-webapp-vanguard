#!/usr/bin/env bash
# Install the packed release in isolated consumers; no workspace links or source aliases.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
BASELINE_V5=0
SKIP_BUILD=0
for arg in "$@"; do
  case "$arg" in
    --baseline-v5) BASELINE_V5=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done
OUT="${PACKAGE_FIXTURE_OUT:-$(mktemp -d /tmp/vanguard-package-fixture.XXXXXX)}"
mkdir -p "$OUT/pack"
OUT="$(cd "$OUT" && pwd)"
python3 "$HERE/../package-isolation.py" preflight "$ROOT" "$OUT" > "$OUT/isolation-preflight.log"
echo "Fixture outputs: $OUT"
cd "$ROOT"
if [ -n "${PACKAGE_FIXTURE_TGZ:-}" ]; then
  TGZ="$PACKAGE_FIXTURE_TGZ"
else
if [ "$SKIP_BUILD" -eq 0 ]; then pnpm build > "$OUT/build.log" 2>&1; fi
npm pack --ignore-scripts --json --pack-destination "$OUT/pack" > "$OUT/pack.json" 2> "$OUT/pack-lifecycle.log"
TGZ=$(node -e 'const fs=require("fs"),path=require("path"); const raw=fs.readFileSync(process.argv[1],"utf8"); const candidates=[...raw.matchAll(/^\[/gm)].reverse(); let packed; for(const m of candidates){try{const value=JSON.parse(raw.slice(m.index));if(value[0]?.filename){packed=value;break;}}catch{}} if(!packed)throw Error("npm pack produced no valid JSON result"); console.log(path.join(process.argv[2],packed[0].filename))' "$OUT/pack.json" "$OUT/pack")
fi
fail=0
for bundle in default wp; do
  for peer in declared mui; do
    DIR="$OUT/$bundle-$peer"
    mkdir -p "$DIR"
    cp "$HERE"/templates/tsconfig*.json "$HERE/templates/vitest.config.ts" "$DIR/"
    cp -R "$HERE/fixtures" "$HERE/smoke" "$DIR/"
    node - "$HERE/templates/package.json" "$DIR/package.json" "$TGZ" "$ROOT/package.json" "$peer" <<'JS'
const fs=require('fs');
const [template,dest,tgz,repo,peer]=process.argv.slice(2);
const p=JSON.parse(fs.readFileSync(template));
p.dependencies['@rankingcoach/vanguard']='file:'+tgz;
const production=JSON.parse(fs.readFileSync(repo));
for (const key of ['@emotion/react','@emotion/styled','imask','react-imask']) p.dependencies[key]=production.peerDependencies[key];
if(peer==='mui') for (const key of ['@mui/material', '@mui/system', '@mui/x-date-pickers']) p.dependencies[key]=production.devDependencies[key];
fs.writeFileSync(dest,JSON.stringify(p,null,2));
JS
    if [ "$bundle" = wp ]; then cp "$HERE/templates/vanguardrc.wordpress.json" "$DIR/.vanguardrc"; fi
    (
      cd "$DIR"
      npx --yes --registry=https://registry.npmjs.org npm@11.6.2 install --registry=https://registry.npmjs.org --ignore-scripts --strict-peer-deps --no-audit --no-fund > install.log 2>&1 || exit $?
      python3 "$HERE/../package-isolation.py" probe "$ROOT" "$DIR" "$peer" > isolation-probe.log 2>&1 || exit $?
      # Reproduce Vanguard's normal install lifecycle with the consumer cwd and configuration.
      node node_modules/@rankingcoach/vanguard/scripts/clean-assets-based-on-vanguardrc.js > postinstall.log 2>&1 || exit $?
      result=0
      node_modules/.bin/tsc -p "tsconfig.$bundle.gated.json" > types-gated.log 2>&1 || result=1
      if [ "$bundle-$peer" = default-mui ]; then
        node_modules/.bin/tsc -p tsconfig.default.mui-gated.json > types-mui-gated.log 2>&1 || result=1
      fi
      BUNDLE="$bundle" node_modules/.bin/vitest run > smoke.log 2>&1 || result=1
      exit "$result"
    ) || {
      # The original v5 graph pins Emotion below MUI's optional-peer minimum. Never bypass resolution.
      if [ "$BASELINE_V5-$peer" = 1-mui ] && node - "$DIR/package.json" "$DIR/install.log" <<'JSBASE'
const fs=require('fs');
const p=JSON.parse(fs.readFileSync(process.argv[2]));
const log=fs.readFileSync(process.argv[3],'utf8');
const exact=p.dependencies['@mui/material']==='5.16.14' && p.dependencies['@emotion/react']==='11.0.0' && p.dependencies['@emotion/styled']==='11.0.0';
const known=log.includes('ERESOLVE') && log.includes('@mui/material@5.16.14') && log.includes('@emotion/react@"^11.5.0"');
process.exit(exact && known ? 0 : 1);
JSBASE
      then
        echo "KNOWN V5 PEER CONFLICT: $bundle/$peer; MUI-dependent type gate UNAVAILABLE (required from S1)." | tee "$DIR/known-v5-peer-conflict.txt"
      else
        fail=1
      fi
    }
    # Measure all declaration diagnostics, including missing undeclared type dependencies.
    if [ -x "$DIR/node_modules/.bin/tsc" ]; then
    (
      cd "$DIR"
      for kind in gated measured; do
        for skip in true false; do
          node_modules/.bin/tsc -p "tsconfig.$bundle.$kind.json" --skipLibCheck "$skip" > "types-$kind-skip-$skip.log" 2>&1 || true
        done
      done
    )
    else
      echo "Declaration measurements unavailable: installation did not produce a compiler." > "$DIR/types-unavailable.txt"
    fi
    echo "$bundle/$peer: $(test -f "$DIR/smoke.log" && tail -8 "$DIR/smoke.log" | tr '\n' ' ')"
  done
done
echo "Gate exit: $fail; measured diagnostics remain in $OUT (not a full declaration pass)."
exit "$fail"
