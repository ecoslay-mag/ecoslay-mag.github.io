import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

const chrome = (() => {
  const candidates = [process.env.CHROME_BIN, 'google-chrome', 'chromium', 'chromium-browser'].filter(Boolean);
  for (const candidate of candidates) {
    try {
      execFileSync('which', [candidate], { stdio: 'ignore' });
      return candidate;
    } catch {}
  }
  return null;
})();

function measure(width) {
  const css = read('style.css').replace(/@import[^;]*;/g, '');
  const html = `<!doctype html><html><head><style>${css}
.walker-bubble { position: relative !important; opacity: 1 !important; animation: none !important; }
</style></head><body>
<div class="walker-bubble walker-bubble--pigeon" id="pigeon-bubble"><span class="walker-bubble__text">ECOLOGY</span><span class="walker-bubble__tail"></span></div>
<div class="walker-bubble walker-bubble--paris" id="paris-bubble"><span class="walker-bubble__text">POP CULTURE</span><span class="walker-bubble__tail"></span></div>
<script>
const out = [...document.querySelectorAll('.walker-bubble')].map((b) => {
  const text = b.querySelector('.walker-bubble__text');
  const tail = b.querySelector('.walker-bubble__tail');
  const bs = getComputedStyle(b);
  const ts = getComputedStyle(text);
  const tls = getComputedStyle(tail);
  const br = b.getBoundingClientRect();
  const tr = text.getBoundingClientRect();
  const tailRect = tail.getBoundingClientRect();
  const pl = parseFloat(bs.paddingLeft);
  const pr = parseFloat(bs.paddingRight);
  const pt = parseFloat(bs.paddingTop);
  const pb = parseFloat(bs.paddingBottom);
  return {
    id: b.id,
    bubble: { w: br.width, h: br.height, left: br.left, right: br.right },
    tailRect: { left: tailRect.left, right: tailRect.right },
    text: { w: tr.width, h: tr.height },
    padding: { l: pl, r: pr, t: pt, b: pb },
    font: parseFloat(ts.fontSize),
    tail: {
      top: parseFloat(tls.borderTopWidth),
      bottom: parseFloat(tls.borderBottomWidth),
      horiz: b.classList.contains('walker-bubble--pigeon')
        ? parseFloat(tls.borderRightWidth)
        : parseFloat(tls.borderLeftWidth),
    },
    overflowX: tr.left < br.left + pl - 0.5 || tr.right > br.right - pr + 0.5,
    overflowY: tr.top < br.top + pt - 0.5 || tr.bottom > br.bottom - pb + 0.5,
  };
});
const marker = '__' + 'RESULT__:';
  document.body.insertAdjacentHTML('beforeend', '<pre id="result">' + marker + btoa(JSON.stringify({ innerWidth, out })) + '</pre>');
</script></body></html>`;
  const filePath = `/tmp/opencode/bubble-measure-${width}.html`;
  writeFileSync(filePath, html);
  const url = `file://${filePath}`;
  const output = execFileSync(chrome, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    `--window-size=${width},900`,
    '--virtual-time-budget=1000',
    '--dump-dom',
    url,
  ], { encoding: 'utf8', timeout: 30000 });
  const match = output.match(/__RESULT__:([A-Za-z0-9+/=]+)/);
  if (!match) throw new Error('Chrome did not expose the measurement result\n' + output.slice(0, 500));
  return JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
}

test('bubbles keep text inside padding and scale proportionally', { skip: !chrome }, () => {
  const widths = [500, 768, 1440];
  const results = widths.map((width) => ({ width, ...measure(width) }));

  for (const { width, out } of results) {
    assert.equal(out.length, 2, `${width}: expected two bubbles`);
    for (const bubble of out) {
      assert.equal(bubble.overflowX, false, `${width} ${bubble.id}: text overflows horizontally`);
      assert.equal(bubble.overflowY, false, `${width} ${bubble.id}: text overflows vertically`);
      assert.ok(bubble.padding.l > 0 && bubble.padding.r > 0 && bubble.padding.t > 0 && bubble.padding.b > 0, `${width} ${bubble.id}: missing padding`);
      assert.ok(bubble.font > 0, `${width} ${bubble.id}: missing font size`);
      assert.ok(bubble.tail.top > 0 && bubble.tail.bottom > 0 && bubble.tail.horiz > 0, `${width} ${bubble.id}: missing tail`);
      if (bubble.id === 'pigeon-bubble') {
        const inward = bubble.tailRect.right - bubble.bubble.left;
        assert.ok(inward > 1 && inward < 12, `${width} ${bubble.id}: tail offset should be a few pixels inside the bubble (got ${inward})`);
      } else {
        const inward = bubble.bubble.right - bubble.tailRect.left;
        assert.ok(inward > 1 && inward < 12, `${width} ${bubble.id}: tail offset should be a few pixels inside the bubble (got ${inward})`);
      }
      assert.ok(bubble.bubble.w > 0 && bubble.bubble.h > 0, `${width} ${bubble.id}: missing bubble box`);
    }
  }

  const paris500 = results[0].out.find((bubble) => bubble.id === 'paris-bubble');
  const paris1440 = results[2].out.find((bubble) => bubble.id === 'paris-bubble');
  assert.ok(paris1440.bubble.w > paris500.bubble.w, 'bubble width should grow with viewport');
  assert.ok(paris1440.font >= paris500.font, 'font size should grow with viewport');
  assert.ok(paris1440.tail.horiz > paris500.tail.horiz, 'tail should grow with viewport');
});
