import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('hero SVG is replaced by a 3D logo container', () => {
  const html = read('index.html');

  assert.match(html, /id="logo-3d"/);
  assert.match(html, /class="logo-3d"/);
  assert.match(html, /id="logo-canvas"/);
  assert.match(html, /id="logo-fallback"/);
  assert.doesNotMatch(html, /id="logo-svg"/);
  assert.doesNotMatch(html, /id="turb"/);
  assert.doesNotMatch(html, /id="disp"/);
  assert.match(html, /type="importmap"/);
  assert.match(html, /src="logo3d\.js"/);
});

test('3D logo loads the GLB and reveals the fallback only on failure', () => {
  const modulePath = path.join(root, 'logo3d.js');

  assert.ok(existsSync(modulePath), 'logo3d.js should exist');
  const js = read('logo3d.js');

  assert.match(js, /from ['"]three['"]/);
  assert.match(js, /GLTFLoader/);
  assert.match(js, /models\/ecoslay-logo\.glb/);
  assert.match(js, /ResizeObserver/);
  assert.match(js, /data-loading/);
  assert.match(js, /classList\.add\(['"]is-fallback['"]\)/);
  assert.match(js, /classList\.remove\(['"]is-fallback['"]\)/);
  assert.match(js, /classList\.add\(['"]is-ready['"]\)/);
  assert.match(js, /catch/);
  assert.doesNotMatch(js, /requestAnimationFrame/);
});

test('styles hide the fallback by default and reveal it on failure', () => {
  const css = read('style.css');

  assert.match(css, /\.logo-3d\s*\{/);
  assert.match(css, /aspect-ratio/);
  assert.doesNotMatch(css, /#logo-svg/);
  assert.match(css, /\.logo-3d img\s*\{[^}]*opacity:\s*0;/s);
  assert.match(css, /\.logo-3d\.is-fallback img\s*\{[^}]*opacity:\s*1;/s);
});

test('hero logo is 20 percent smaller than the previous size', () => {
  const css = read('style.css');

  assert.match(css, /\.logo-3d\s*\{[^}]*width:\s*125%;/s);
});

test('hero logo is whiter and centered between nav and pigeon head', () => {
  const js = read('logo3d.js');
  const css = read('style.css');

  assert.match(css, /\.stage\s*\{[^}]*justify-content:\s*flex-start;/s);
  assert.match(css, /\.logo-3d\s*\{[^}]*--pigeon-height:\s*208px;/s);
  assert.match(css, /\.logo-3d\s*\{[^}]*--pigeon-head-inset:\s*48px;/s);
  assert.match(css, /\.logo-3d\s*\{[^}]*margin-top:\s*calc\(/s);
  assert.match(css, /--pigeon-height:\s*176px/);
  assert.match(css, /--pigeon-head-inset:\s*40\.6px/);
  assert.match(js, /toneMappingExposure\s*=\s*1\.15/);

  const rim = js.match(/uRimStrength:\s*\{\s*value:\s*([\d.]+)/);
  const shadow = js.match(/uShadowStrength:\s*\{\s*value:\s*([\d.]+)/);
  assert.ok(rim, 'rim strength should be defined');
  assert.ok(shadow, 'shadow strength should be defined');
  assert.ok(Number(rim[1]) <= 0.3, 'pink rim should be reduced');
  assert.ok(Number(shadow[1]) <= 0.6, 'pink shadow should be reduced');
});

test('left-side lighting creates directional shading', () => {
  const js = read('logo3d.js');

  const key = js.match(/new THREE\.DirectionalLight\(0xffffff,\s*([\d.]+)\);\s*keyLight\.position\.set\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/);
  const fill = js.match(/new THREE\.DirectionalLight\(0xffffff,\s*([\d.]+)\);\s*fillLight\.position\.set\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/);
  const point = js.match(/new THREE\.PointLight\(0xffffff,\s*([\d.]+)\);\s*pointLight\.position\.set\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/);
  const hemi = js.match(/new THREE\.HemisphereLight\(0x[0-9a-fA-F]+,\s*0x[0-9a-fA-F]+,\s*([\d.]+)\)/);

  assert.ok(key, 'key light should be defined');
  assert.ok(fill, 'fill light should be defined');
  assert.ok(point, 'left point light should be defined');
  assert.ok(hemi, 'hemisphere light should be defined');

  const keyIntensity = Number(key[1]);
  const keyX = Number(key[2]);
  const fillIntensity = Number(fill[1]);
  const fillX = Number(fill[2]);
  const pointIntensity = Number(point[1]);
  const pointX = Number(point[2]);
  const hemiIntensity = Number(hemi[1]);

  assert.ok(keyX < 0, 'key light should come from the left');
  assert.ok(fillX > 0, 'fill light should come from the right');
  assert.ok(pointX < 0, 'point light should come from the left');
  assert.ok(pointIntensity >= 8, 'point light should create a visible left gradient');
  assert.ok(keyIntensity >= 1, 'directional key should still provide base light');
  assert.ok(keyIntensity > fillIntensity, 'key light should dominate the fill');
  assert.ok(fillIntensity <= 0.5, 'fill light should be subtle');
  assert.ok(hemiIntensity <= 0.6, 'hemisphere light should not flatten shading');
});

test('3D logo starts front-facing and spins once with an orthographic camera', () => {
  const js = read('logo3d.js');

  assert.match(js, /new THREE\.OrthographicCamera\(/);
  assert.doesNotMatch(js, /PerspectiveCamera/);
  assert.match(js, /group\.rotation\.set\(\s*0,\s*0,\s*0\s*\)/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /Math\.PI\s*\*\s*2|2\s*\*\s*Math\.PI/);
  assert.match(js, /gsap\.(?:to|timeline)/);
  assert.match(js, /degToRad\(4\)/);
  assert.match(js, /degToRad\(-12\)/);
});

test('hologram adds pink rim, horizontal scan lines, and edge shimmer to the white material', () => {
  const js = read('logo3d.js');

  assert.match(js, /onBeforeCompile/);
  assert.match(js, /uTime/);
  assert.match(js, /uEdgeColor/);
  assert.match(js, /uScanIntensity/);
  assert.match(js, /uShimmerIntensity/);
  assert.match(js, /0xff8fc4/i);
  assert.match(js, /0xffffff/i);
  assert.match(js, /vHoloLocal/);
  assert.match(js, /holoFresnel/);
  assert.match(js, /sin\(vHoloLocal\.y/);
});

test('horizontal scanner line sweeps bottom-to-top and glows through the bloom layer', () => {
  const js = read('logo3d.js');

  assert.match(js, /uScanBounds/);
  assert.match(js, /uBandIntensity/);
  assert.match(js, /scanCycle\s*=\s*fract\(uTime/);
  assert.match(js, /scanY\s*=\s*mix\(uScanBounds\.x,\s*uScanBounds\.y/);
  assert.match(js, /scanBand/);
  assert.match(js, /scanBounds\.set/);
  assert.match(js, /AdditiveBlending/);
});

test('hologram uses selective pink bloom without tinting the background', () => {
  const js = read('logo3d.js');

  assert.match(js, /EffectComposer/);
  assert.match(js, /RenderPass/);
  assert.match(js, /ShaderPass/);
  assert.match(js, /UnrealBloomPass/);
  assert.match(js, /OutputPass/);
  assert.match(js, /bloomCamera\.layers\.set\(1\)/);
  assert.match(js, /layers\.set\(1\)/);
  assert.match(js, /bloomComposer\.renderToScreen\s*=\s*false/);
  assert.match(js, /0xffb0da/i);
  assert.match(js, /bloomTintColors/);
  assert.match(js, /base\.rgb\s*\*\s*base\.a\s*\+\s*bloom/);
  assert.match(js, /vec4\(base\.rgb\s*\*\s*base\.a\s*\+\s*bloom,\s*base\.a\)/);
  assert.doesNotMatch(js, /max\(base\.a,\s*bloomMask\)/);
  assert.match(js, /premultipliedAlpha:\s*true/);
  assert.match(js, /side:\s*THREE\.DoubleSide,\s*toneMapped:\s*false/);
  assert.match(js, /new THREE\.PointLight\(0xffb6d9/);
});

test('hologram animation is throttled and pauses offscreen', () => {
  const js = read('logo3d.js');

  assert.match(js, /gsap\.ticker\.add/);
  assert.match(js, /gsap\.ticker\.remove/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /visibilitychange/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /1\s*\/\s*30/);
  assert.doesNotMatch(js, /requestAnimationFrame/);
});

test('hero markup covers module-load failure and no-JS fallback', () => {
  const html = read('index.html');

  assert.match(html, /<script type="module" src="logo3d\.js"[^>]*onerror="[^"]*is-fallback/);
  assert.match(html, /data-loading/);
  assert.match(html, /<noscript>[\s\S]*\.logo-3d img[\s\S]*opacity:\s*1/);
});

test('hero intro no longer runs the SVG melt animation', () => {
  const js = read('script.js');

  assert.doesNotMatch(js, /#turb/);
  assert.doesNotMatch(js, /#disp/);
  assert.doesNotMatch(js, /MELT ANIMATION/);
  assert.match(js, /gsap\.timeline\(\{\s*delay:\s*1\s*\}\)/);
});

test('the GLB asset is present and is a valid glTF 2 binary', () => {
  const glbPath = path.join(root, 'models', 'ecoslay-logo.glb');

  assert.ok(existsSync(glbPath), 'models/ecoslay-logo.glb should exist');
  assert.ok(statSync(glbPath).size > 0, 'GLB should not be empty');

  const buffer = readFileSync(glbPath);
  assert.equal(buffer.toString('utf8', 0, 4), 'glTF');
  assert.equal(buffer.readUInt32LE(4), 2);

  const jsonLength = buffer.readUInt32LE(12);
  const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength));
  assert.ok(gltf.meshes?.length >= 1, 'GLB should contain at least one mesh');
});
