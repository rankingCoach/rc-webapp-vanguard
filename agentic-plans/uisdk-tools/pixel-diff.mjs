// Pixel parity between two elements of one Storybook story (D15 production-order fixtures).
// Usage: node pixel-diff.mjs <storybook-url> <story-id> <labelA>:<labelB> [<labelA>:<labelB> ...]
// Each label is an aria-label (role=group etc.). Screenshots both elements, decodes the PNGs and counts differing
// pixels. Exit 1 when any pair differs in size or pixels. Writes <out>/<story>-<label>.png when OUT_DIR is set.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const [base, storyId, ...pairs] = process.argv.slice(2);
if (!base || !storyId || pairs.length === 0) {
  console.error('usage: node pixel-diff.mjs <storybook-url> <story-id> <labelA>:<labelB> ...');
  process.exit(2);
}
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1, viewport: { width: 1000, height: 800 } });
await page.goto(`${base}/iframe.html?id=${storyId}&viewMode=story`, { waitUntil: 'networkidle' });
await page.waitForSelector('#storybook-root *');
await page.mouse.move(999, 799); // park the pointer away from fixtures (a pointer at 0,0 can still :hover the first one)
await page.waitForTimeout(800);

const shot = async (label) => {
  const el = page.locator(`[aria-label="${label}"]`).first();
  // Fixtures stack the two columns, so one usually starts on a fractional y (e.g. after a 48.5px group) and Chrome
  // snaps its borders differently. Shift the whole page in LAYOUT (body padding) so this element starts on whole
  // pixels; geometry itself is compared by the story's play function.
  await el.evaluate((node) => {
    document.body.style.paddingTop = '0px';
    document.body.style.paddingLeft = '0px';
    const r = node.getBoundingClientRect();
    document.body.style.paddingTop = `${(Math.ceil(r.y) - r.y).toFixed(3)}px`;
    document.body.style.paddingLeft = `${(Math.ceil(r.x) - r.x).toFixed(3)}px`;
  });
  // Let `transition: all` skins settle after the layout shift before shooting.
  await page.waitForTimeout(400);
  const buf = await el.screenshot({ animations: 'disabled' });
  if (process.env.OUT_DIR) writeFileSync(join(process.env.OUT_DIR, `${storyId}-${label}.png`), buf);
  return PNG.sync.read(buf);
};

let failed = false;
for (const pair of pairs) {
  const [a, b] = pair.split(':');
  const [pa, pb] = [await shot(a), await shot(b)];
  if (pa.width !== pb.width || pa.height !== pb.height) {
    console.log(`${a} vs ${b}: SIZE ${pa.width}x${pa.height} vs ${pb.width}x${pb.height}`);
    failed = true;
    continue;
  }
  let diff = 0;
  for (let i = 0; i < pa.data.length; i += 4) {
    if (pa.data[i] !== pb.data[i] || pa.data[i + 1] !== pb.data[i + 1] || pa.data[i + 2] !== pb.data[i + 2] || pa.data[i + 3] !== pb.data[i + 3]) diff++;
  }
  console.log(`${a} vs ${b}: ${pa.width}x${pa.height}, ${diff} differing pixels`);
  if (diff > 0) failed = true;
}
await browser.close();
process.exit(failed ? 1 : 0);
