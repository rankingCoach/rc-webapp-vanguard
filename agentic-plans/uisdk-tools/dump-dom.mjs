// Dump outerHTML of a story's root (and open popup) with emotion hash classes stripped. Usage:
//   node agentic-plans/uisdk-tools/dump-dom.mjs <storybookUrl> <storyId[:open]>
import { chromium } from 'playwright';
const [base, spec] = process.argv.slice(2);
const [id, mode] = spec.split(':');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
await page.waitForSelector('#storybook-root *', { timeout: 120000 });
if (mode === 'open') {
  await page.locator('[role=combobox]').first().click();
  await page.waitForSelector('[role=listbox]');
  await page.waitForTimeout(600);
}
const html = await page.evaluate(() => {
  const strip = (s) => s.replace(/\s?css-[a-z0-9]+(-[\w-]+)?/gi, '').replace(/ class=""/g, '');
  const root = document.querySelector('#storybook-root').innerHTML;
  const menu = document.querySelector('.MuiMenu-root')?.outerHTML ?? '';
  return strip(root) + '\n\n<!-- POPUP -->\n' + strip(menu);
});
console.log(html.replace(/></g, '>\n<'));
await browser.close();
