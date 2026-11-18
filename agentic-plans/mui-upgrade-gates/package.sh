#!/usr/bin/env bash
# Canonical release gate; retain the frozen fixture's exact nonzero exit.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
export PACKAGE_FIXTURE_OUT="${PACKAGE_FIXTURE_OUT:-$(mktemp -d /tmp/vanguard-package-gate.XXXXXX)}"
bash "$HERE/package-fixture/run.sh" "$@"
python3 "$HERE/package-counts.py" "$PACKAGE_FIXTURE_OUT"
# Track 2: llms.txt, the skill and one docs page per value export ship in the tarball.
node "$HERE/../../scripts/check-package-contents.mjs" "$PACKAGE_FIXTURE_OUT"/pack/*.tgz
