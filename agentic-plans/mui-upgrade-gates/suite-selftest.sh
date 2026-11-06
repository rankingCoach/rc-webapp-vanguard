#!/usr/bin/env bash
# Verify bounded suite execution and nonzero raw-run propagation without launching tests.
set -eu
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/agentic-plans/mui-upgrade-gates" "$TMP/bin"
cp "$HERE/suite.sh" "$TMP/agentic-plans/mui-upgrade-gates/"
cat > "$TMP/bin/pnpm" <<'JS'
#!/usr/bin/env node
const args=process.argv.slice(2);
if(!args.includes('--maxWorkers=1') || !args.includes('--no-file-parallelism')) {
  console.error('UNBOUNDED SUITE'); process.exit(94);
}
console.log(' Test Files 1 failed (1)\n Tests 1 failed (1)');
process.exit(7);
JS
chmod +x "$TMP/bin/pnpm"
set +e
PATH="$TMP/bin:$PATH" bash "$TMP/agentic-plans/mui-upgrade-gates/suite.sh" selftest 1 > "$TMP/result" 2>&1
code=$?
set -e
if rg -q 'UNBOUNDED SUITE' "$TMP/agentic-plans/mui-upgrade-gates/out"; then
  echo 'FAIL: suite launches unbounded workers'; exit 1
fi
[ "$code" -eq 1 ] || { cat "$TMP/result"; echo 'FAIL: raw failure lost'; exit 1; }
[ "$(rg -c 'exit 7' "$TMP/result")" -eq 3 ] || { cat "$TMP/result"; exit 1; }
echo 'PASS: all three projects bounded; raw failures retain exit 7 and reject gate'
