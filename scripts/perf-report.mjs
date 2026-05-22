#!/usr/bin/env node
// Build PERF_RANKING.md from .perf-results.json.
// Runs as a separate step so a crash inside the vitest worker still yields a report.
import fs from 'node:fs';
import path from 'node:path';

const RESULTS_PATH = path.resolve(process.cwd(), '.perf-results.json');
const OUT_PATH = path.resolve(process.cwd(), 'PERF_RANKING.md');
const RERENDER_ITERATIONS = 20;

if (!fs.existsSync(RESULTS_PATH)) {
  console.error('[perf-report] no .perf-results.json found — did the perf suite run?');
  process.exit(1);
}

const records = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));

const rank = (values) => {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return values.map(() => 0);
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const span = max - min || 1;
  return values.map((v) => (Number.isFinite(v) ? 1 - (v - min) / span : 0));
};

const mountScores = rank(records.map((r) => r.mountMs));
const rerenderScores = rank(records.map((r) => r.rerenderMs));
const bytesScores = rank(records.map((r) => r.bytes));

const ranked = records
  .map((r, i) => {
    const composite = r.rendered
      ? 0.4 * mountScores[i] + 0.4 * rerenderScores[i] + 0.2 * bytesScores[i]
      : 0;
    const rating = r.rendered ? Math.max(1, Math.min(10, Math.round(1 + composite * 9))) : 1;
    return { ...r, composite, rating };
  })
  .sort((a, b) => b.composite - a.composite);

const total = ranked.length;
const rendered = ranked.filter((r) => r.rendered).length;
const lines = [
  '# Component Performance Ranking',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Components measured: **${total}** — rendered successfully: **${rendered}**, failed: **${total - rendered}**`,
  '',
  '## Scoring',
  '',
  '- **mount ms** — avg ms to mount + unmount a fresh component (lower better)',
  `- **rerender ms** — total ms to force ${RERENDER_ITERATIONS} prop-driven re-renders (lower better)`,
  '- **bytes** — source file size in folder, excluding stories/specs (lower better)',
  '- **composite** — `0.4·mount + 0.4·rerender + 0.2·bytes`, normalized across the cohort',
  '- **rating** — 1..10. 1 = unusable / failed to render. 10 = best-optimized component in the history of mankind.',
  '',
  '## Ranking',
  '',
  '| # | Component | Rating | Composite | Mount (ms) | Rerender (ms) | Bytes | Notes |',
  '|---|-----------|-------:|----------:|-----------:|--------------:|------:|-------|',
];
ranked.forEach((r, i) => {
  const mount = r.rendered ? r.mountMs.toFixed(2) : '—';
  const re = r.rendered ? r.rerenderMs.toFixed(2) : '—';
  const composite = r.rendered ? (r.composite * 100).toFixed(1) : '—';
  const notes = r.rendered ? '' : `did not render: ${r.error ?? 'unknown'}`;
  lines.push(
    `| ${i + 1} | ${r.name} | ${r.rating} | ${composite} | ${mount} | ${re} | ${r.bytes} | ${notes} |`,
  );
});

fs.writeFileSync(OUT_PATH, lines.join('\n') + '\n', 'utf8');
console.log('');
console.log('==================================================================');
console.log(`  perf ranking written: ${OUT_PATH}`);
console.log(`  raw results:          ${RESULTS_PATH}`);
console.log(`  components:           ${ranked.length}`);
console.log('==================================================================');
