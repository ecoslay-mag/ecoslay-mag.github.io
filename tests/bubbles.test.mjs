import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('hero has speech bubbles for both walkers', () => {
  const html = read('index.html');
  assert.match(html, /id="pigeon-bubble"/);
  assert.match(html, /id="paris-bubble"/);
  assert.match(html, />ECOLOGY</);
  assert.match(html, />POP CULTURE</);
});

test('bubble styles exist', () => {
  const css = read('style.css');
  assert.match(css, /\.walker-bubble\b/);
  assert.match(css, /\.walker-bubble__tail/);
});

test('logo reveal is gated and bubbles sync to walkers', () => {
  const logo = read('logo3d.js');
  const script = read('script.js');
  assert.match(logo, /window\.revealHeroLogo/);
  assert.match(script, /window\.onWalkersStarted/);
  assert.match(script, /syncBubbles/);
  assert.match(script, /getBoundingClientRect/);
});


test('bubble scale and mouth anchors are CSS-driven', () => {
  const css = read('style.css');
  assert.match(css, /--bubble-scale:\s*clamp\(/);
  assert.match(css, /--bubble-gap:\s*calc\(/);
  assert.match(css, /--bubble-overlap:\s*calc\(/);
  assert.match(css, /--bubble-lift:\s*calc\(/);
  assert.match(css, /--bubble-tail:\s*calc\(/);
});

test('bubble sync reads scaled mouth anchors', () => {
  const script = read('script.js');
  assert.match(script, /getComputedStyle\(document\.documentElement\)/);
  assert.match(script, /bubbleMetric\('--bubble-gap'/);
  assert.match(script, /bubbleMetric\('--bubble-overlap'/);
  assert.match(script, /bubbleMetric\('--bubble-lift'/);
});
