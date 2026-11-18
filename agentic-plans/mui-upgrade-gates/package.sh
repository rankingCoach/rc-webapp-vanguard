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
exit "$fixture"
