const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mui-biome-cap-'));
try {
  const accepted = path.join(__dirname, 'baseline/master-ts7/accepted-spec-lint.json');
  const ds = JSON.parse(fs.readFileSync(accepted)).diagnostics;
  assert.equal(ds.length, 24);
  const baseline = path.join(tmp, 'baseline'); fs.writeFileSync(baseline, '');
  const report = path.join(tmp, 'report.json');
  const check = (diagnostics, expected) => {
    fs.writeFileSync(report, JSON.stringify({summary:{errors:diagnostics.length,diagnosticsNotPrinted:0},diagnostics}));
    const r = spawnSync(process.execPath, [path.join(__dirname, 'compare-biome.cjs'), report, baseline, process.cwd(), accepted], {encoding:'utf8'});
    assert.equal(r.status, expected, r.stdout + r.stderr);
  };
  check(ds, 0);
  const moved = JSON.parse(JSON.stringify(ds)); moved[0].location.start.line++;
  check(moved, 1);
  check([...ds, ds[0]], 1);
  check([...ds, {...ds[0], location:{...ds[0].location,path:'src/NewProduction.tsx'}}], 1);
  console.log('PASS: exact 24 test lint identities accepted; moved, duplicate and production findings rejected');
} finally { fs.rmSync(tmp, {recursive:true,force:true}); }
