#!/usr/bin/env bash
# Canonical release gate; retain the frozen fixture's exact nonzero exit.
# The fixture ends nonzero by design (measured diagnostics, not a full declaration pass), so the checks below run
# regardless of its code and the script still exits with the fixture's code when they pass.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
export PACKAGE_FIXTURE_OUT="${PACKAGE_FIXTURE_OUT:-$(mktemp -d /tmp/vanguard-package-gate.XXXXXX)}"
fixture=0
bash "$HERE/package-fixture/run.sh" "$@" || fixture=$?
python3 "$HERE/package-counts.py" "$PACKAGE_FIXTURE_OUT"
# Track 2: llms.txt, the skill and one docs page per value export ship in the tarball.
node "$HERE/../../scripts/check-package-contents.mjs" "$PACKAGE_FIXTURE_OUT"/pack/*.tgz
# Plan §36.5: exactly the allow-listed spec files preload MUI fallback routes (with a green full spec run = audit).
node "$HERE/../../scripts/check-fallback-audit.mjs"
# WordPress output integrity: every import() / static chunk import of dist-wordpress/index.js exists after cleanup.
node "$HERE/../../scripts/check-wordpress-dynamic-imports.mjs" "$HERE/../../dist-wordpress"
# Plan §36.2 B.3: exports whose EAGER ESM graph contains @mui/* (report until every fallback is lazy, then --assert-zero).
node "$HERE/../../scripts/check-eager-mui.mjs" > "$PACKAGE_FIXTURE_OUT/eager-mui.txt"
node "$HERE/../../scripts/check-eager-mui.mjs" --wordpress-table > "$PACKAGE_FIXTURE_OUT/eager-mui-wordpress.txt"
head -1 "$PACKAGE_FIXTURE_OUT/eager-mui.txt"
exit "$fixture"
