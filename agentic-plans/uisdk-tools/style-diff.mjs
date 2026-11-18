// Self-check before a verifier handoff: computed-style diff of a story between a baseline Storybook and the branch
// Storybook, element by element (DOM order of elements carrying a stable identity: data-slot / Mui* / vanguard
// classes / role), including the open popup. Usage:
//   node agentic-plans/uisdk-tools/style-diff.mjs <baseUrl> <branchUrl> <storyId[:open]>...
import { chromium } from 'playwright';

const [baseUrl, branchUrl, ...stories] = process.argv.slice(2);
const PROPS = ['display', 'position', 'box-sizing', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top-width', 'border-top-style', 'border-top-color', 'border-left-width', 'border-left-color', 'border-top-left-radius',
  'border-bottom-right-radius', 'color', 'background-color', 'background-image', 'font-family', 'font-size', 'font-weight',
  'line-height', 'letter-spacing', 'text-transform', 'box-shadow', 'opacity', 'transform', 'visibility', 'z-index', 'gap',
  'flex-direction', 'align-items', 'justify-content', 'overflow-x', 'overflow-y', 'cursor', 'pointer-events', 'outline-style',
  'white-space', 'text-overflow', 'top', 'left', 'transition'];

const snapshot = async (page, url, id, open) => {
  await page.goto(`${url}/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#storybook-root *', { timeout: 120000 });
  if (open) {
    await page.locator('[role=combobox]').first().click();
    await page.waitForSelector('[role=listbox]');
    await page.waitForTimeout(800);
  }
  return page.evaluate((props) => {
    const roots = [document.querySelector('#storybook-root'), document.querySelector('.MuiMenu-root')].filter(Boolean);
    const out = [];
    for (const root of roots) {
      for (const el of root.querySelectorAll('*')) {
        const stable = [...el.classList].filter((c) => !/^css-/.test(c)).sort().join('.');
        const key = `${el.tagName.toLowerCase()}${stable ? '.' + stable : ''}${el.getAttribute('role') ? `[${el.getAttribute('role')}]` : ''}`;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        out.push({ key, box: [r.x, r.y, r.width, r.height].map((n) => Math.round(n * 10) / 10), style: Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)])) });
      }
    }
    return out;
  }, PROPS);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let total = 0;
for (const spec of stories) {
  const [id, mode] = spec.split(':');
  let a;
  let b;
  try {
    a = await snapshot(page, baseUrl, id, mode === 'open');
    b = await snapshot(page, branchUrl, id, mode === 'open');
  } catch (e) {
    console.log(`== ${spec}: SKIPPED (${String(e.message).split('\n')[0]})`);
    continue;
  }
  // align by key occurrence order
  const index = (list) => { const seen = {}; return list.map((e) => ({ ...e, k: `${e.key}#${(seen[e.key] = (seen[e.key] ?? 0) + 1)}` })); };
  const A = new Map(index(a).map((e) => [e.k, e]));
  const B = new Map(index(b).map((e) => [e.k, e]));
  const lines = [];
  for (const [k, ea] of A) {
    const eb = B.get(k);
    if (!eb) { lines.push(`  - only in base: ${k}`); continue; }
    if (ea.box.some((v, i) => Math.abs(v - eb.box[i]) > 0.5)) lines.push(`  ${k} box ${ea.box} -> ${eb.box}`);
    for (const p of Object.keys(ea.style)) if (ea.style[p] !== eb.style[p]) lines.push(`  ${k} ${p}: ${ea.style[p]} -> ${eb.style[p]}`);
  }
  for (const k of B.keys()) if (!A.has(k)) lines.push(`  + only in branch: ${k}`);
  total += lines.length;
  console.log(`== ${spec}: ${lines.length} deltas`);
  console.log(lines.slice(0, 60).join('\n'));
}
await browser.close();
console.log(`TOTAL ${total}`);
