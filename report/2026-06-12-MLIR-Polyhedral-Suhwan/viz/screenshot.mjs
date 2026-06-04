// screenshot.mjs — render topic pages in real Chromium and capture PNGs.
// OPTIONAL tool (visual QA only — the site itself needs no dependencies).
// Requires puppeteer:  cd poly-mlir-viz && npm i puppeteer
// Usage: node screenshot.mjs [topic-name step,step,...] ...
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shotDir = path.join(__dirname, 'shots');
fs.mkdirSync(shotDir, { recursive: true });

// default capture plan: [topicName, [stepIndices]]
let plan = [
  ['01-iteration-space', [1, 3]],
  ['07-skewing', [0, 2, 3]]
];
const args = process.argv.slice(2);
if (args.length) {
  plan = [];
  for (let k = 0; k < args.length; k += 2) {
    plan.push([args[k], (args[k + 1] || '0').split(',').map(Number)]);
  }
}

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--force-color-profile=srgb']
});
const page = await browser.newPage();
await page.setViewport({ width: 1240, height: 1000, deviceScaleFactor: 1.5 });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('  [page]', m.type(), m.text()); });
page.on('pageerror', (e) => console.log('  [PAGEERROR]', e.message));

for (const [name, steps] of plan) {
  const url = 'file://' + path.join(__dirname, 'topics', name + '.html');
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.__scene && window.__scene.points', { timeout: 5000 });
  for (const st of steps) {
    await page.evaluate((k) => {
      window.__scene.pause();
      window.__scene.gotoStep(k, { animate: false, replay: false });
      // let a couple of frames settle then draw a mid-play frame to show active points
      window.__scene.phase = 'play';
      if (window.__scene.ticks) window.__scene.playTick = Math.ceil(window.__scene.ticks.length * 0.55);
      window.__scene.draw(900);
    }, st);
    await new Promise((r) => setTimeout(r, 250));
    const file = path.join(shotDir, `${name}-step${st}.png`);
    const el = await page.$('#wrap');
    await (el ? el.screenshot({ path: file }) : page.screenshot({ path: file }));
    console.log('  saved', path.relative(__dirname, file));
  }
}
await browser.close();
console.log('done.');
