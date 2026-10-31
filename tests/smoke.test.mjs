import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('walker smoke canvas and script are present', () => {
  const html = read('index.html');
  assert.match(html, /id="walker-smoke"/);
  assert.match(html, /src="smoke\.js"/);
});

test('walker smoke styles cover walkers and bubbles', () => {
  const css = read('style.css');
  assert.match(css, /#walker-smoke\s*\{[^}]*position:\s*fixed/s);
  assert.match(css, /#walker-smoke\s*\{[^}]*width:\s*100vw/s);
  assert.match(css, /#walker-smoke\s*\{[^}]*z-index:\s*62/s);
});

test('smoke module exposes burst API with ten sparkles', () => {
  const js = read('smoke.js');
  assert.match(js, /window\.SmokeBurst/);
  assert.match(js, /SPARKLE_COUNT\s*=\s*10|sparkleCount:\s*10/);
  assert.match(js, /✨/);
  assert.match(js, /expand/);
  assert.match(js, /hold/);
  assert.match(js, /fade/);
});

test('hero sequence triggers smoke at crossing and reveals logo after expansion', () => {
  const js = read('script.js');
  assert.match(js, /SmokeBurst/);
  assert.match(js, /triggerWalkerSmoke/);
  assert.match(js, /onExpandComplete/);
  assert.match(js, /revealHeroLogo/);
});
