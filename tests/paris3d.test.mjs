import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('paris walker is added to the page', () => {
  const html = read('index.html');
  assert.match(html, /id="paris-3d"/);
  assert.match(html, /id="paris-canvas"/);
  assert.match(html, /paris3d\.js/);
});

test('paris script loads the walking model and walks right to left', () => {
  const js = read('paris3d.js');
  assert.match(js, /GLTFLoader/);
  assert.match(js, /DRACOLoader/);
  assert.match(js, /models\/paris-walking\.glb/);
  assert.match(js, /AnimationMixer/);
  assert.match(js, /gsap/);
});

test('paris styles exist and pigeon is lifted above the walker', () => {
  const css = read('style.css');
  assert.match(css, /#paris-3d/);
  assert.match(css, /#paris-canvas/);
  assert.match(css, /--walker-height/);
  assert.match(css, /#pigeon-3d\s*\{[^}]*bottom:\s*var\(--walker-height\)/s);
});

test('pigeon is lowered to sit above paris head', () => {
  const css = read('style.css');
  assert.match(css, /--walker-height:\s*calc\(var\(--paris-size\)\s*\*\s*0\.73\)/);
});

test('pigeon is 20 percent smaller than paris via size variables', () => {
  const css = read('style.css');
  assert.match(css, /#pigeon-3d\s*\{[^}]*width:\s*var\(--pigeon-size\);[^}]*height:\s*var\(--pigeon-size\);/s);
  assert.match(css, /#paris-3d\s*\{[^}]*width:\s*var\(--paris-size\);[^}]*height:\s*var\(--paris-size\);/s);
  assert.match(css, /--pigeon-size:\s*calc\(var\(--paris-size\)\s*\*\s*0\.8\)/);
});

test('paris root motion is neutralized and walk is 20 percent faster', () => {
  const js = read('paris3d.js');
  assert.match(js, /Hips\.position/);
  assert.match(js, /WALK_TIME_SCALE\s*=\s*0\.6/);
  assert.match(js, /mixer\.timeScale\s*=\s*WALK_TIME_SCALE/);
  assert.match(js, /--travel/);
  assert.match(js, /ResizeObserver/);
  assert.match(js, /neutralizeRootMotion/);
});

test('paris root motion is neutralized and walk is 20 percent faster', () => {
  const js = read('paris3d.js');
  assert.match(js, /Hips\.position/);
  assert.match(js, /WALK_TIME_SCALE\s*=\s*0\.6/);
  assert.match(js, /mixer\.timeScale\s*=\s*WALK_TIME_SCALE/);
  assert.match(js, /--travel/);
  assert.match(js, /ResizeObserver/);
  assert.match(js, /neutralizeRootMotion/);
});

test('walkers start together and cross in eight seconds', () => {
  const pigeon = read('pigeon3d.js');
  const paris = read('paris3d.js');
  const script = read('script.js');

  assert.match(script, /window\.scheduleWalkerStart/);
  assert.match(pigeon, /TRAVEL_DURATION\s*=\s*8/);
  assert.match(pigeon, /duration:\s*TRAVEL_DURATION/);
  assert.match(pigeon, /scheduleWalkerStart/);
  assert.match(paris, /TRAVEL_DURATION\s*=\s*8/);
  assert.match(paris, /duration:\s*TRAVEL_DURATION/);
  assert.match(paris, /scheduleWalkerStart/);
});

test('paris GLB exists, is optimized, and keeps the walking animation', () => {
  const glbPath = path.join(root, 'models', 'paris-walking.glb');
  assert.ok(existsSync(glbPath));
  const buffer = readFileSync(glbPath);
  assert.equal(buffer.toString('utf8', 0, 4), 'glTF');
  assert.equal(buffer.readUInt32LE(4), 2);
  const jsonLength = buffer.readUInt32LE(12);
  const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength));
  assert.ok(gltf.skins?.length >= 1);
  assert.ok(gltf.animations?.some((a) => a.name === 'HumanWalking'));
  assert.ok(buffer.length < 8 * 1024 * 1024);
  assert.ok(gltf.extensionsUsed?.includes('KHR_draco_mesh_compression'));
});
