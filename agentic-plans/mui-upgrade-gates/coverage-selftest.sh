#!/usr/bin/env bash
# Check runner flags without launching a suite; preserve runner failure status.
set -eu
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/agentic-plans/mui-upgrade-gates" "$TMP/bin"
cp "$HERE/coverage.sh" "$HERE/coverage-files.json" "$TMP/agentic-plans/mui-upgrade-gates/"
cat > "$TMP/bin/pnpm" <<'JS'
#!/usr/bin/env node
if (process.env.VANGUARD_V8_COVERAGE !== "1") { console.error("V8 coverage must disable Istanbul instrumentation"); process.exit(94); }
const args = process.argv.slice(2);
for (const flag of ['--maxWorkers=1', '--no-file-parallelism', '--coverage.reportOnFailure']) {
  if (!args.includes(flag)) { console.error(`missing ${flag}`); process.exit(91); }
}
const files = require(process.cwd() + '/agentic-plans/mui-upgrade-gates/coverage-files.json');
if (files.length !== 35 || files.some(f => !args.includes('--coverage.include=' + f))) process.exit(92);
for (const flag of ['--coverage.thresholds.perFile', '--coverage.thresholds.lines=95', '--coverage.thresholds.branches=85']) {
  if (!args.includes(flag)) process.exit(93);
}
process.exit(7);
JS
chmod +x "$TMP/bin/pnpm"
set +e
PATH="$TMP/bin:$PATH" bash "$TMP/agentic-plans/mui-upgrade-gates/coverage.sh" selftest
code=$?
set -e
[ "$code" -eq 7 ] || { echo "FAIL: expected retained suite exit 7, got $code"; exit 1; }
echo 'PASS: bounded workers, report on failure, all 35 files, unchanged thresholds, failure propagated'
