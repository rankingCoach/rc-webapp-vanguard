#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const RESULTS_PATH = path.resolve(process.cwd(), '.stress-results.json');
const OUT_PATH = path.resolve(process.cwd(), 'STRESS_RANKING.md');

if (!fs.existsSync(RESULTS_PATH)) {
  console.error('[stress-report] no .stress-results.json found — did the stress suite run?');
  process.exit(1);
}

const records = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));

const rank = (values, lowerIsBetter = true) => {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return values.map(() => 0);
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const span = max - min || 1;
  return values.map((v) =>
    Number.isFinite(v) ? (lowerIsBetter ? 1 - (v - min) / span : (v - min) / span) : 0,
  );
};

// Composite: prefer fast total + low max-render + larger variant coverage (more stress = bonus).
const totalScores = rank(records.map((r) => r.totalMs), true);
const maxScores = rank(records.map((r) => r.maxRenderMs), true);
const variantScores = rank(records.map((r) => r.variantCount), false);
const bytesScores = rank(records.map((r) => r.bytes), true);

const ranked = records
  .map((r, i) => {
    const composite = r.rendered
      ? 0.45 * totalScores[i] + 0.25 * maxScores[i] + 0.15 * variantScores[i] + 0.15 * bytesScores[i]
      : 0;
    const rating = r.rendered ? Math.max(1, Math.min(10, Math.round(1 + composite * 9))) : 1;
    return { ...r, composite, rating };
  })
  .sort((a, b) => b.composite - a.composite);

const total = ranked.length;
const rendered = ranked.filter((r) => r.rendered).length;
const totalVariants = ranked.reduce((a, r) => a + r.variantCount, 0);
const totalRenders = ranked.reduce((a, r) => a + r.totalRenders, 0);

const lines = [
  '# Component Stress Ranking',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Components stressed: **${total}** — rendered: **${rendered}**, failed/skipped: **${total - rendered}**`,
  `Total prop variants exercised: **${totalVariants}** across **${totalRenders}** renders`,
  '',
  '## Scoring',
  '',
  '- **variants** — distinct prop sets pulled from `_*.stories.tsx` exports',
  '- **renders** — variants × cycles (default 30 cycles, override with `STRESS_CYCLES`)',
  '- **total ms** — cumulative render time across all stress renders (lower better)',
  '- **max ms** — slowest single render observed (lower better)',
  '- **avg ms** — per-render average',
  '- **composite** — `0.45·total + 0.25·max + 0.15·variants + 0.15·bytes`, normalized cohort-wide; the variants term *rewards* components that survived more prop combinations',
  '- **rating** — 1..10. 1 = failed/skipped. 10 = best-optimized under stress',
  '',
  '## Ranking',
  '',
  '| # | Component | Rating | Composite | Variants | Renders | Total (ms) | Max (ms) | Avg (ms) | Bytes | Notes |',
  '|---|-----------|-------:|----------:|---------:|--------:|-----------:|---------:|---------:|------:|-------|',
];
ranked.forEach((r, i) => {
  const total = r.rendered ? r.totalMs.toFixed(2) : '—';
  const max = r.rendered ? r.maxRenderMs.toFixed(2) : '—';
  const avg = r.rendered ? r.avgRenderMs.toFixed(3) : '—';
  const composite = r.rendered ? (r.composite * 100).toFixed(1) : '—';
  const notes = r.rendered ? '' : (r.error ?? '');
  lines.push(
    `| ${i + 1} | ${r.name} | ${r.rating} | ${composite} | ${r.variantCount} | ${r.totalRenders} | ${total} | ${max} | ${avg} | ${r.bytes} | ${notes} |`,
  );
});

fs.writeFileSync(OUT_PATH, lines.join('\n') + '\n', 'utf8');
console.log('');
console.log('==================================================================');
console.log(`  stress ranking written: ${OUT_PATH}`);
console.log(`  raw results:            ${RESULTS_PATH}`);
console.log(`  components:             ${ranked.length}`);
console.log('==================================================================');
