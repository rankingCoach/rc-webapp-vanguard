#!/usr/bin/env bash
# Combined source + real browser coverage. Each listed wrapper must meet both thresholds.
set -eu
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
LABEL="${1:?usage: coverage.sh <label>}"
OUT="$HERE/out/$LABEL"
mkdir -p "$OUT"
cd "$ROOT"
args=()
while IFS= read -r file; do args+=("--coverage.include=$file"); done < <(node -e 'for(const p of require(process.argv[1]))console.log(p)' "$HERE/coverage-files.json")
echo "start=$(date) load=$(uptime)"
VANGUARD_V8_COVERAGE=1 pnpm vitest run --project spec --project storybook --maxWorkers=1 --no-file-parallelism --coverage --coverage.provider=v8 \
  --reporter=default --reporter=json --outputFile.json="$OUT/tests.json" \
  "${args[@]}" --coverage.reportOnFailure --coverage.reporter=json --coverage.reporter=json-summary --coverage.reporter=text \
  --coverage.reportsDirectory="$OUT/coverage" --coverage.thresholds.perFile \
  --coverage.thresholds.lines=95 --coverage.thresholds.branches=85
