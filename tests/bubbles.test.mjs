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

test('bubble metrics are proportional to each walker', () => {
  const css = read('style.css');
  assert.match(css, /\.walker-bubble\s*\{[^}]*--bubble-base:\s*var\(--paris-size\)/s);
  assert.match(css, /\.walker-bubble--pigeon\s*\{[^}]*--bubble-base:\s*var\(--pigeon-size\)/s);
  assert.match(css, /--bubble-padding-y:\s*calc\(var\(--bubble-base\)\s*\*\s*0\.03\)/);
  assert.match(css, /--bubble-padding-x:\s*calc\(var\(--bubble-base\)\s*\*\s*0\.077\)/);
  assert.match(css, /--bubble-tail:\s*calc\(var\(--bubble-base\)\s*\*\s*0\.077\)/);
  assert.match(css, /--bubble-font-size:\s*clamp\(12px,\s*calc\(var\(--bubble-base\)\s*\*\s*0\.077\),\s*20px\)/);
  assert.doesNotMatch(css, /var\(--paris-size\)\s*\/\s*\d+px/);
});

test('bubble sync measures each tail instead of a global metric', () => {
  const script = read('script.js');
  assert.match(script, /querySelector\(['"]\.walker-bubble__tail['"]\)/);
  assert.match(script, /borderRightWidth/);
  assert.match(script, /borderLeftWidth/);
  assert.doesNotMatch(script, /bubbleMetric\('--bubble-tail'/);
});

test('bubble layout avoids fixed dimensions and keeps text on one line', () => {
  const css = read('style.css');
  assert.doesNotMatch(css, /\.walker-bubble\s*\{[^}]*width:/s);
  assert.doesNotMatch(css, /\.walker-bubble\s*\{[^}]*height:/s);
  assert.match(css, /\.walker-bubble__text[^}]*white-space:\s*nowrap/s);
});
