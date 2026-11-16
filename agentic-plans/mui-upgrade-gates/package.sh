#!/usr/bin/env bash
# Canonical release gate; retain the frozen fixture's exact nonzero exit.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
export PACKAGE_FIXTURE_OUT="${PACKAGE_FIXTURE_OUT:-$(mktemp -d /tmp/vanguard-package-gate.XXXXXX)}"
bash "$HERE/package-fixture/run.sh" "$@"
python3 "$HERE/package-counts.py" "$PACKAGE_FIXTURE_OUT"
