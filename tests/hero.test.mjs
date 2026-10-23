import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('hero subtitle is fully removed', () => {
  assert.doesNotMatch(read('index.html'), /hero-subtitle/);
  assert.doesNotMatch(read('style.css'), /#hero-subtitle/);
  assert.doesNotMatch(read('script.js'), /#hero-subtitle/);
});
