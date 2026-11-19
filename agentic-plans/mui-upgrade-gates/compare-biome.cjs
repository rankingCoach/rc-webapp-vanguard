const fs = require('fs');
const path = require('path');
const [json, base, root, accepted] = process.argv.slice(2);
const report = JSON.parse(fs.readFileSync(json, 'utf8'));
if (!report.summary || !Array.isArray(report.diagnostics) || report.summary.diagnosticsNotPrinted !== 0 || !Number.isInteger(report.summary.errors)) throw new Error('Incomplete or malformed Biome report');
const identity = d => JSON.stringify([path.isAbsolute(d.location.path) ? path.relative(root, d.location.path) : d.location.path, d.category, d.location.start, d.location.end]);
const allowed = new Set(accepted ? JSON.parse(fs.readFileSync(accepted, 'utf8')).diagnostics.map(d => {
  if (!/\.spec\.[cm]?[jt]sx?$/.test(d.location.path) || d.category !== 'lint/correctness/noComponentHookFactories') throw new Error('Invalid accepted test-only lint identity');
  return identity(d);
}) : []);
const consumed = new Set();
const cur = new Map();
let errors = 0;
for (const d of report.diagnostics) {
  if (d.severity !== 'error' && d.severity !== 'fatal') continue;
  if (!d.location || typeof d.location.path !== 'string' || typeof d.category !== 'string') throw new Error('Malformed Biome diagnostic');
  const file = path.isAbsolute(d.location.path) ? path.relative(root, d.location.path) : d.location.path;
  const k = file + '|' + d.category;
  errors++;
  const id = identity(d);
  if (allowed.has(id) && !consumed.has(id)) { consumed.add(id); continue; }
  cur.set(k, (cur.get(k) || 0) + 1);
}
if (errors !== report.summary.errors) throw new Error('Incomplete Biome error inventory');
const b = new Map(fs.readFileSync(base, 'utf8').split('\n').filter(Boolean).map(l => {
  const p = l.split('|'); return [p[0] + '|' + p[1], +p[2]];
}));
const worse = [...cur].filter(([k, v]) => v > (b.get(k) || 0));
console.log('lint: ' + errors + ' errors (' + consumed.size + ' exact accepted test identities), ' + worse.length + ' file|rule pairs worse than master baseline');
worse.slice(0, 40).forEach(([k, v]) => console.log('  ' + k + ' ' + (b.get(k) || 0) + ' -> ' + v));
process.exit(worse.length ? 1 : 0);
