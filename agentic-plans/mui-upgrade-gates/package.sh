#!/usr/bin/env bash
# Canonical release gate: source specs, isolated package fixtures, and the scripts project against the packed output.
# A gated declaration or runtime failure makes the fixture exit nonzero. Measurements run separately. The checks
# below run regardless of the fixture status and preserve that status when they pass.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
export PACKAGE_FIXTURE_OUT="${PACKAGE_FIXTURE_OUT:-$(mktemp -d /tmp/vanguard-package-gate.XXXXXX)}"
export VG_NO_FALLBACK_PRELOAD=1
workers="${VG_PACKAGE_GATE_WORKERS:-3}"
case "$workers" in
  1|2|3|4) ;;
  *) echo "VG_PACKAGE_GATE_WORKERS must be 1, 2, 3, or 4" >&2; exit 2 ;;
esac
mkdir -p "$PACKAGE_FIXTURE_OUT"
PACKAGE_FIXTURE_OUT="$(cd "$PACKAGE_FIXTURE_OUT" && pwd)"
cd "$ROOT"
node node_modules/vitest/vitest.mjs run --project spec --maxWorkers="$workers" 2>&1 | tee "$PACKAGE_FIXTURE_OUT/source-spec.log"
fixture=0
bash "$HERE/package-fixture/run.sh" "$@" || fixture=$?
VG_PACKAGE_EXPORTS_ROOT="$PACKAGE_FIXTURE_OUT/default-declared/node_modules/@rankingcoach/vanguard" \
  node node_modules/vitest/vitest.mjs run --project scripts --maxWorkers=1 --no-file-parallelism 2>&1 | tee "$PACKAGE_FIXTURE_OUT/source-scripts.log"
python3 "$HERE/package-counts.py" "$PACKAGE_FIXTURE_OUT"
# Track 2: llms.txt, the skill and one docs page per value export ship in the tarball.
if [ -n "${PACKAGE_FIXTURE_TGZ:-}" ]; then
  node "$ROOT/scripts/check-package-contents.mjs" "$PACKAGE_FIXTURE_TGZ"
else
  node "$ROOT/scripts/check-package-contents.mjs" "$PACKAGE_FIXTURE_OUT"/pack/*.tgz
fi
# Plan §36.5: exactly the allow-listed spec files preload MUI fallback routes (with a green full spec run = audit).
node "$HERE/../../scripts/check-fallback-audit.mjs"
# WordPress output integrity: every import() / static chunk import of dist-wordpress/index.js exists after cleanup.
node "$HERE/../../scripts/check-wordpress-dynamic-imports.mjs" "$HERE/../../dist-wordpress"
# Plan §36.2 B.3: exports whose EAGER ESM graph contains @mui/* (report until every fallback is lazy, then --assert-zero).
node "$HERE/../../scripts/check-eager-mui.mjs" > "$PACKAGE_FIXTURE_OUT/eager-mui.txt"
node "$HERE/../../scripts/check-eager-mui.mjs" --wordpress-table > "$PACKAGE_FIXTURE_OUT/eager-mui-wordpress.txt"
head -1 "$PACKAGE_FIXTURE_OUT/eager-mui.txt"
exit "$fixture"
