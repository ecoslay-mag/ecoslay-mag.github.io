import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('impressum is a normal page section stacked under partners', () => {
  const html = read('index.html');
  const css = read('style.css');

  assert.match(html, /<section id="impressum" class="page-section">/);
  assert.doesNotMatch(html, /data-to="impressum"/);
  assert.doesNotMatch(html, /href="#impressum"/);
  assert.doesNotMatch(css, /\.impressum-section/);

  const partnersIndex = html.indexOf('id="partners"');
  const impressumIndex = html.indexOf('id="impressum"');
  assert.ok(partnersIndex > 0, 'partners section should exist');
  assert.ok(impressumIndex > partnersIndex, 'impressum should follow partners');
});
