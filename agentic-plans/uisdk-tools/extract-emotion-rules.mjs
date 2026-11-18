// Extract the exact CSS that MUI's emotion runtime applies to Vanguard components, keyed by the elements' stable
// Mui* class names, so own-core SCSS can reproduce it 1:1. Usage:
//   node agentic-plans/uisdk-tools/extract-emotion-rules.mjs <storybookUrl> <outJson> <storyId[:open]>...
// `:open` clicks the first [role=combobox] and waits for [role=listbox] before collecting.
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const [base, out, ...stories] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const result = {};

for (const spec of stories) {
  const [id, mode] = spec.split(':');
  await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#storybook-root *', { timeout: 120000 });
  if (mode === 'open') {
    await page.locator('[role=combobox]').first().click();
    await page.waitForSelector('[role=listbox]', { timeout: 10000 });
    await page.waitForTimeout(600); // let the Grow transition finish
  }
  const data = await page.evaluate(() => {
    // emotion rules: any rule whose selector mentions a .css-<hash> class
    const rules = [];
    const walk = (list, media) => {
      for (const r of list) {
        if (r.cssRules && r.media) walk(r.cssRules, r.media.mediaText);
        else if (r.selectorText && /\.css-[a-z0-9]+/i.test(r.selectorText)) rules.push({ sel: r.selectorText, css: r.style.cssText, media });
        else if (r.cssText?.startsWith('@keyframes')) rules.push({ keyframes: r.cssText });
      }
    };
    for (const sheet of document.styleSheets) {
      try { walk(sheet.cssRules, null); } catch { /* cross-origin */ }
    }
    const byHash = {};
    for (const el of document.querySelectorAll('[class*="css-"]')) {
      const classes = [...el.classList];
      const hashes = classes.filter((c) => /^css-[a-z0-9]+/i.test(c));
      const stable = classes.filter((c) => /^Mui/.test(c)).sort();
      for (const h of hashes) {
        byHash[h] ??= { stable: new Set(), tag: el.tagName.toLowerCase() };
        for (const s of stable) byHash[h].stable.add(s);
      }
    }
    const out = {};
    for (const [h, info] of Object.entries(byHash)) {
      out[h] = {
        tag: info.tag,
        stable: [...info.stable],
        rules: rules.filter((r) => r.sel && new RegExp(`\\.${h}(?![\\w-])`).test(r.sel)),
      };
    }
    return { out, keyframes: rules.filter((r) => r.keyframes).map((r) => r.keyframes) };
  });
  result[spec] = data;
}
writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
console.log(`wrote ${out}: ${Object.values(result).reduce((n, d) => n + Object.keys(d.out).length, 0)} emotion classes`);
