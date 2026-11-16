#!/usr/bin/env bash
# Test-suite gate for the MUI upgrade. Runs the spec project, then the storybook project, ONE AT A TIME
# (never overlapping Chromium suites), and records the resource conditions next to the results.
#
# Usage (from the repo root): agentic-plans/mui-upgrade-gates/suite.sh <label> [runs=2]
# Output: agentic-plans/mui-upgrade-gates/out/<label>/suite-*.log and summary.txt
#
# Gate rule: every raw run must be fully green. Failures are listed as they happened.
# The isolated rerun of a failing file is diagnosis ONLY ("does it also fail alone?"). It never turns a red run green.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
LABEL="${1:?usage: suite.sh <label> [runs]}"
RUNS="${2:-2}"
OUT="$HERE/out/$LABEL"
mkdir -p "$OUT"
cd "$ROOT" || exit 2
# Hard per-command time limit that also ends vitest's children (Chromium): the command runs in its own process
# group (set -m), and the watchdog kills the whole group. macOS has no `timeout`, and killing only the leader
# leaves orphaned Chromium renderers at 100% CPU.
run() {
  local t=$1; shift
  set -m; "$@" & local pid=$!; set +m
  ( sleep "$t"; kill -TERM -- "-$pid" 2>/dev/null; sleep 5; kill -KILL -- "-$pid" 2>/dev/null ) >/dev/null 2>&1 &
  local dog=$!
  wait "$pid"; local code=$?
  kill "$dog" 2>/dev/null
  return $code
}
SUM="$OUT/summary.txt"; : > "$SUM"
note() { echo "$*" | tee -a "$SUM"; }

others=$(ps aux | grep -E "vitest|headless_shell" | grep -v grep | wc -l | tr -d ' ')
note "label=$LABEL runs=$RUNS start=$(date '+%F %T') node=$(node -v) cpus=$(sysctl -n hw.ncpu 2>/dev/null || nproc)"
note "pre-existing vitest/headless_shell processes: $others"
fail=0
for i in $(seq 1 "$RUNS"); do
  for proj in spec scripts storybook; do
    log="$OUT/suite-$proj-run$i.log"
    note "--- run $i $proj | load before: $(uptime | sed 's/.*load averages*: //')"
    run 1200 pnpm vitest run --project "$proj" --maxWorkers=1 --no-file-parallelism > "$log" 2>&1
    code=$?
    note "    $(grep -E '^\s+Test Files ' "$log" | tr -s ' ') | $(grep -E '^\s+Tests ' "$log" | tr -s ' ') | exit $code | load after: $(uptime | sed 's/.*load averages*: //')"
    if [ $code -ne 0 ]; then
      fail=1
      grep -E "^ FAIL " "$log" | sed -E 's/^ FAIL +//' | sort -u | sed 's/^/    FAIL /' | tee -a "$SUM"
      # Diagnosis: rerun each failing FILE once, alone.
      for f in $(grep -E "^ FAIL " "$log" | sed -E 's/^ FAIL +\|[^|]+\| ([^ ]+) .*/\1/' | sort -u); do
        r=$(run 600 pnpm vitest run --project "$proj" --maxWorkers=1 --no-file-parallelism "$f" 2>&1 | grep -E '^\s+Tests ' | tr -s ' ')
        note "    isolated rerun (diagnosis only) $f: $r"
      done
    fi
  done
done
left=$(ps aux | grep -E "vitest|headless_shell" | grep -v grep | wc -l | tr -d ' ')
note "end=$(date '+%F %T') vitest/headless_shell processes left: $left (before: $others)"
note "SUITE GATE: $([ $fail -eq 0 ] && echo PASS || echo FAIL)"
exit $fail
