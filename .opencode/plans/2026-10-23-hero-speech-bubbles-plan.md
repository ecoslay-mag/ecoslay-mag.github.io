# Hero Speech Bubbles + Delayed Logo Reveal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `POP CULTURE` and `ECOLOGY` speech bubbles in front of Paris and the pigeon, styled like the section headers, fading out when the walkers cross; delay the 3D logo reveal/spin until that crossing.

**Architecture:** DOM/CSS bubbles positioned each frame above their walker via GSAP ticker. Walker start is centralized in `scheduleWalkerStart`; on start we schedule a 4s delayed crossing callback that fades the bubbles and calls a new `window.revealHeroLogo()` exposed by `logo3d.js`, which runs the existing `animateIntro()` spin. Logo container starts at opacity 0 and gains `.is-revealed` at reveal.

**Tech Stack:** Static HTML/CSS/JS, GSAP 3.12.5, Three.js 0.169 (existing), Node test runner.

---

### Task 1: Add bubble markup to `index.html`

**Files:**
- Modify: `index.html` (walker section, around the PIGEON comment)

- [ ] **Step 1: Insert two bubble elements before `<!-- PIGEON -->`**

Old:
```html
  <!-- PIGEON -->
  <div id="pigeon-3d" aria-hidden="true">
```

New:
```html
  <!-- SPEECH BUBBLES -->
  <div class="walker-bubble walker-bubble--pigeon" id="pigeon-bubble" aria-hidden="true">
    <span class="walker-bubble__text">ECOLOGY</span>
    <span class="walker-bubble__tail" aria-hidden="true"></span>
  </div>
  <div class="walker-bubble walker-bubble--paris" id="paris-bubble" aria-hidden="true">
    <span class="walker-bubble__text">POP CULTURE</span>
    <span class="walker-bubble__tail" aria-hidden="true"></span>
  </div>

  <!-- PIGEON -->
  <div id="pigeon-3d" aria-hidden="true">
```

- [ ] **Step 2: Verify HTML still parses**

Run: `node --test tests/hero.test.mjs`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add hero speech bubble markup"
```

---

### Task 2: Style bubbles and gate logo container opacity in `style.css`

**Files:**
- Modify: `style.css` (after the PIGEON + PARIS block; `.logo-3d` rule)

- [ ] **Step 1: Add bubble styles after the `#paris-canvas` rule block**

Insert after:
```css
#pigeon-canvas,
#paris-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

New block:
```css
/* ── WALKER SPEECH BUBBLES ── */
.walker-bubble {
  position: fixed;
  z-index: 61;
  pointer-events: none;
  will-change: transform, opacity;
  opacity: 0;
  transition: opacity 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #111;
  border-radius: 40% 60% 55% 45% / 60% 40% 60% 40%;
  box-shadow: 0 6px 0 #000, 0 10px 25px rgba(0,0,0,0.25);
  padding: 8px 20px;
  animation: slimeMorph 6s ease-in-out infinite;
}

.walker-bubble__text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(14px, 12px + 0.6vw, 20px);
  letter-spacing: 0.12em;
  color: #111;
  white-space: nowrap;
}

.walker-bubble__tail {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}

.walker-bubble--pigeon .walker-bubble__tail {
  right: -10px;
  border-left: 10px solid #111;
}

.walker-bubble--paris .walker-bubble__tail {
  left: -10px;
  border-right: 10px solid #111;
}

.walker-bubble--pigeon .walker-bubble__tail::after {
  content: '';
  position: absolute;
  top: -7px;
  right: 2px;
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 9px solid #fff;
}

.walker-bubble--paris .walker-bubble__tail::after {
  content: '';
  position: absolute;
  top: -7px;
  left: 2px;
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-right: 9px solid #fff;
}
```

- [ ] **Step 2: Gate logo container opacity in `.logo-3d`**

In `.logo-3d { ... }`, add:
```css
  opacity: 0;
  transition: opacity 0.4s ease;
```
And after the `.logo-3d { ... }` block add:
```css
.logo-3d.is-revealed,
.logo-3d.is-fallback {
  opacity: 1;
}
```

- [ ] **Step 3: Ensure noscript reveals the container too**

In `index.html` `<noscript>` style, change:
```html
<noscript><style>.logo-3d img { opacity: 1 !important; }</style></noscript>
```
to:
```html
<noscript><style>.logo-3d, .logo-3d img { opacity: 1 !important; }</style></noscript>
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/*.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add style.css index.html
git commit -m "feat: style hero speech bubbles and gate logo opacity"
```

---

### Task 3: Hook walker start in `script.js`

**Files:**
- Modify: `script.js` (top-level `scheduleWalkerStart` IIFE)

- [ ] **Step 1: Invoke `window.onWalkersStarted` from `run()`**

Replace:
```js
    starts.splice(0).forEach((start) => start());
```
with:
```js
    starts.splice(0).forEach((start) => start());
    if (typeof window.onWalkersStarted === 'function') {
      window.onWalkersStarted();
    } else {
      window._walkersStartedPending = true;
    }
```

- [ ] **Step 2: Commit**

```bash
git add script.js
git commit -m "feat: expose walker start hook for hero sequence"
```

---

### Task 4: Add bubble sync and crossing logic to `script.js`

**Files:**
- Modify: `script.js` (inside `window.onload`, before its closing brace)

- [ ] **Step 1: Append bubble module**

Insert before the final closing brace of `window.onload`:
```js
  /* ── WALKER SPEECH BUBBLES ── */
  const pigeonBubble = document.getElementById('pigeon-bubble');
  const parisBubble = document.getElementById('paris-bubble');
  const pigeonWalker = document.getElementById('pigeon-3d');
  const parisWalker = document.getElementById('paris-3d');

  function syncBubbles() {
    if (pigeonWalker && pigeonBubble) {
      const r = pigeonWalker.getBoundingClientRect();
      pigeonBubble.style.left = (r.left - pigeonBubble.offsetWidth - 8) + 'px';
      pigeonBubble.style.top = (r.top + r.height * 0.25) + 'px';
      pigeonBubble.style.transform = 'none';
    }
    if (parisWalker && parisBubble) {
      const r = parisWalker.getBoundingClientRect();
      parisBubble.style.left = (r.right + 8) + 'px';
      parisBubble.style.top = (r.top + r.height * 0.25) + 'px';
      parisBubble.style.transform = 'none';
    }
  }

  if (window.gsap) {
    window.gsap.ticker.add(syncBubbles);
  }

  window.onWalkersStarted = function () {
    const bubbles = [pigeonBubble, parisBubble].filter(Boolean);
    if (window.gsap) {
      window.gsap.to(bubbles, { opacity: 1, duration: 0.3 });
      window.gsap.delayedCall(4 /* TRAVEL_DURATION / 2 */, function () {
        window.gsap.to(bubbles, { opacity: 0, duration: 0.4 });
        if (window.revealHeroLogo) window.revealHeroLogo();
      });
    }
  };

  if (window._walkersStartedPending) {
    window._walkersStartedPending = false;
    window.onWalkersStarted();
  }
```

- [ ] **Step 2: Run tests**

Run: `node --test tests/*.test.mjs`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: sync hero bubbles and trigger crossing reveal"
```

---

### Task 5: Gate logo reveal in `logo3d.js`

**Files:**
- Modify: `logo3d.js` (`animateIntro` definition + module-load call site)

- [ ] **Step 1: Add reveal gate after `animateIntro` definition**

After the `animateIntro` function's closing brace, add:
```js
  let logoRevealed = false;
  let pendingReveal = false;

  window.revealHeroLogo = function () {
    if (logoRevealed) return;
    if (!model) {
      pendingReveal = true;
      container.classList.add('is-revealed');
      return;
    }
    logoRevealed = true;
    container.classList.add('is-revealed');
    animateIntro();
  };
```

- [ ] **Step 2: Handle pending reveal after model load**

In the GLTF loader success callback, after:
```js
      render();
      container.classList.remove('is-fallback');
      canvas.classList.add('is-ready');
```
add:
```js
      if (pendingReveal && !logoRevealed) {
        window.revealHeroLogo();
      }
```

- [ ] **Step 3: Remove unconditional `animateIntro();` call**

Replace the final `animateIntro();` in the loader callback with nothing (delete the line). Keep the surrounding code.

- [ ] **Step 4: Reveal on module failure fallback**

In the `onerror` attribute of the logo script tag in `index.html`, add `is-revealed`:
```html
<script type="module" src="logo3d.js" onerror="var l=document.getElementById('logo-3d'); if(l){ l.classList.add('is-fallback'); l.classList.add('is-revealed'); }"></script>
```

- [ ] **Step 5: Run tests**

Run: `node --test tests/*.test.mjs`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add logo3d.js index.html
git commit -m "feat: delay 3D logo reveal until walkers cross"
```

---

### Task 6: Add bubble tests

**Files:**
- Create: `tests/bubbles.test.mjs`

- [ ] **Step 1: Write tests**

```js
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
```

- [ ] **Step 2: Run tests**

Run: `node --test tests/bubbles.test.mjs`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add tests/bubbles.test.mjs
git commit -m "test: cover hero speech bubbles and delayed logo reveal"
```

---

### Task 7: Full verification

- [ ] **Step 1: Run entire suite**

Run: `node --test tests/*.test.mjs`
Expected: all pass

- [ ] **Step 2: Manual smoke check (optional)**

Run: `python3 -m http.server 8000` and open `http://localhost:8000`; confirm bubbles appear, fade at crossing, logo spins in.

---

## Self-Review

- Spec coverage: markup (Task 1), styles (Task 2), start hook (Task 3), sync/crossing (Task 4), logo gating (Task 5), tests (Task 6). Covered.
- Placeholders: none.
- Type/identifier consistency: `window.revealHeroLogo`, `window.onWalkersStarted`, `syncBubbles`, `pendingReveal`, `logoRevealed` consistent across tasks.
EOF
echo done