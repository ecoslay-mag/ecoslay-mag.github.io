import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('walker position is anchored with a CSS variable travel value', () => {
  const css = read('style.css');
  assert.match(css, /--travel/);
  assert.match(css, /translateX\(calc\(var\(--travel\)\s*\*\s*\(100vw\s*-\s*100%\)\)\)/);
});

test('walker sizes scale with the viewport and fit desktop gutters', () => {
  const css = read('style.css');
  assert.match(css, /--paris-size:\s*clamp\(/);
  assert.match(css, /--pigeon-size:\s*calc\(var\(--paris-size\)\s*\*\s*0\.8\)/);
  assert.match(css, /--walker-height:\s*calc\(var\(--paris-size\)\s*\*\s*0\.73\)/);
});

test('walker modules resize the renderer and animate the travel variable', () => {
  for (const file of ['pigeon3d.js', 'paris3d.js']) {
    const js = read(file);
    assert.match(js, /ResizeObserver/);
    assert.match(js, /setProperty\(\s*['"]--travel['"]/);
    assert.match(js, /camera\.aspect/);
  }
});

test('mobile walkers stay on the landing page', () => {
  const js = read('script.js');
  assert.match(js, /matchMedia\(['"]\(max-width:\s*700px\)['"]\)/);
  assert.match(js, /IntersectionObserver|scrollY/);
});
