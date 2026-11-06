#!/usr/bin/env bash
# Static gates for the MUI upgrade: tsc (app + lib), tsc over the contract tests, biome.
# master already has errors (see baseline/), so the gate is "no NEW errors vs the master baseline".
#
# Usage (from the repo root): agentic-plans/mui-upgrade-gates/gates.sh <label>
# Output: agentic-plans/mui-upgrade-gates/out/<label>/ (git-ignored by convention; delete when done)
# Exit: 0 = no new errors, 1 = new errors (printed), 2 = usage/setup error.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
LABEL="${1:?usage: gates.sh <label>}"
OUT="$HERE/out/$LABEL"
mkdir -p "$OUT"
cd "$ROOT" || exit 2
fail=0

# 1. tsc over production code. Normalise "file(line,col): error" to "file: error" so line shifts don't count as new.
for cfg in app lib; do
  ./node_modules/.bin/tsc -p "tsconfig.$cfg.json" --noEmit > "$OUT/tsc-$cfg.raw.txt" 2>&1
  code=$?
  if [ "$code" -ne 0 ] && { { [ "$code" -ne 1 ] && [ "$code" -ne 2 ]; } || ! grep -q "error TS" "$OUT/tsc-$cfg.raw.txt"; }; then
    echo "tsc $cfg execution failed (exit $code)"; cat "$OUT/tsc-$cfg.raw.txt"; fail=1
  fi
  grep -E "error TS" "$OUT/tsc-$cfg.raw.txt" | sed -E 's/\([0-9]+,[0-9]+\)//' | sort > "$OUT/tsc-$cfg.txt"
  comm -13 "$HERE/baseline/master-ts7/baseline-tsc-$cfg.txt" "$OUT/tsc-$cfg.txt" > "$OUT/tsc-$cfg.new.txt"
  n=$(wc -l < "$OUT/tsc-$cfg.new.txt" | tr -d ' ')
  echo "tsc $cfg: $(wc -l < "$OUT/tsc-$cfg.txt" | tr -d ' ') errors, $n new vs master baseline"
  [ "$n" -gt 0 ] && { head -40 "$OUT/tsc-$cfg.new.txt"; fail=1; }
done

# 2. tsc over the contract tests. tsconfig.app.json excludes *.spec/*.stories, and tsconfig.spec.json uses
#    moduleResolution Node, which cannot resolve storybook/test. Must be 0 errors.
"$HERE/tsc-contract.sh" > "$OUT/tsc-contract.txt" 2>&1
code=$?
[ "$code" -ne 0 ] && { echo "contract compiler failed (exit $code)"; cat "$OUT/tsc-contract.txt"; fail=1; }
n=$(grep -c "error TS" "$OUT/tsc-contract.txt")
echo "tsc contract tests: $n errors (must be 0)"
[ "$n" -gt 0 ] && { grep "error TS" "$OUT/tsc-contract.txt" | head -40; fail=1; }

# Every native spec, including additional compatibility fixtures, is now a permanent zero-error gate.
./node_modules/.bin/tsc -p tsconfig.spec.json --noEmit --pretty false > "$OUT/tsc-spec.txt" 2>&1
code=$?
if [ "$code" -ne 0 ]; then echo "spec compiler failed (exit $code)"; cat "$OUT/tsc-spec.txt"; fail=1; fi
n=$(grep -c "error TS" "$OUT/tsc-spec.txt")
echo "tsc all spec tests: $n errors (must be 0)"
[ "$n" -gt 0 ] && fail=1

# 3. User requires zero errors, including master baseline; no introduced warnings.
rm -f "$OUT/lint.json"
./node_modules/.bin/biome lint src --reporter=json --max-diagnostics=none > "$OUT/lint.json" 2> "$OUT/lint.raw.txt"
code=$?
if [ "$code" -ne 0 ] && [ "$code" -ne 1 ]; then
  echo "biome execution failed (exit $code)"; cat "$OUT/lint.raw.txt"; fail=1
fi
node "$HERE/compare-clean-biome.cjs" "$OUT/lint.json" "$HERE/baseline/master-ts7/lint-warnings.json" "$ROOT" || fail=1

exit $fail
