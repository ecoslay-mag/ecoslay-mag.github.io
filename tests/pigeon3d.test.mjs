import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('pigeon is added and ghost is disabled', () => {
  const html = read('index.html');
  assert.match(html, /id="pigeon-3d"/);
  assert.match(html, /id="pigeon-canvas"/);
  assert.match(html, /pigeon3d\.js/);
  assert.match(html, /GHOST \(temporarily disabled/);
});

test('pigeon script loads GLB and animates', () => {
  const js = read('pigeon3d.js');
  assert.match(js, /GLTFLoader/);
  assert.match(js, /models\/pigeon\.glb/);
  assert.match(js, /AnimationMixer/);
  assert.match(js, /gsap/);
});

test('pigeon styles exist', () => {
  const css = read('style.css');
  assert.match(css, /#pigeon-3d/);
  assert.match(css, /#pigeon-canvas/);
});

test('pigeon GLB asset exists and is valid', () => {
  const glbPath = path.join(root, 'models', 'pigeon.glb');
  assert.ok(existsSync(glbPath));
  assert.ok(statSync(glbPath).size > 0);
  const buffer = readFileSync(glbPath);
  assert.equal(buffer.toString('utf8', 0, 4), 'glTF');
  assert.equal(buffer.readUInt32LE(4), 2);
  const jsonLength = buffer.readUInt32LE(12);
  const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength));
  assert.ok(gltf.animations?.length >= 1);
});
