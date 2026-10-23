# Fix Hero Bubbles + Logo Reveal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the four regressions reported after the first pass: (1) `window.revealHeroLogo` is defined inside `animateIntro` (never callable), so the logo never reveals; (2) bubble tails point outward instead of toward the mouth; (3) bubbles are too far from the walkers; (4) tail CSS triangle is misaligned/ugly.

**Architecture:** Move the reveal gate to `init` scope (after `animateIntro`), swap tail orientation per walker, reduce horizontal gap from 8px to 4px, and correct the inner/outer triangle geometry so the tail reads as a 1px-outlined pointer.

**Tech Stack:** Static HTML/CSS/JS, GSAP 3.12.5, Three.js 0.169, Node test runner.

---

### Task 1: Move `revealHeroLogo` out of `animateIntro` scope

**Files:**
- Modify: `logo3d.js` (`animateIntro` definition + surrounding init scope)

- [ ] **Step 1: Remove the misplaced block from inside `animateIntro`**

Current (inside `animateIntro`, after the `gsap.to(...)` call):
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
}
```

Replace with just the function's closing brace:
```js
  }
```

- [ ] **Step 2: Re-add the block in `init` scope, after `animateIntro` closes**

Immediately after `animateIntro`'s closing brace (and before `new GLTFLoader().load(`), insert:
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

- [ ] **Step 3: Verify syntax and scope**

Run: `node --check logo3d.js`
Expected: no output (success)

- [ ] **Step 4: Commit**

```bash
git add logo3d.js
git commit -m "fix: move revealHeroLogo to init scope so it is callable"
```

---

### Task 2: Correct bubble tail orientation and spacing

**Files:**
- Modify: `script.js` (`syncBubbles`)

- [ ] **Step 1: Swap gap from 8px to 4px and keep bubble on the correct side**

Current:
```js
      pigeonBubble.style.left = (r.left - pigeonBubble.offsetWidth - 8) + 'px';
...
      parisBubble.style.left = (r.right + 8) + 'px';
```

New:
```js
      pigeonBubble.style.left = (r.right + 4) + 'px';
...
      parisBubble.style.left = (r.left - parisBubble.offsetWidth - 4) + 'px';
```

Note: this moves the pigeon bubble to the right of the walker (in front of its mouth) and the Paris bubble to the left.

- [ ] **Step 2: Commit**

```bash
git add script.js
git commit -m "fix: place bubbles in front of each walker's mouth"
```

---

### Task 3: Fix tail CSS geometry

**Files:**
- Modify: `style.css` (walker bubble tail rules)

- [ ] **Step 1: Replace the tail rules**

Current tail block:
```css
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

New tail block (tails point toward the walker):
```css
.walker-bubble__tail {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
}

/* pigeon bubble is to the right of the walker -> tail points left */
.walker-bubble--pigeon .walker-bubble__tail {
  left: -10px;
  border-right: 10px solid #111;
}

.walker-bubble--pigeon .walker-bubble__tail::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 8px solid #fff;
}

/* Paris bubble is to the left of the walker -> tail points right */
.walker-bubble--paris .walker-bubble__tail {
  right: -10px;
  border-left: 10px solid #111;
}

.walker-bubble--paris .walker-bubble__tail::after {
  content: '';
  position: absolute;
  top: 1px;
  right: 1px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 8px solid #fff;
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "fix: point bubble tails at walkers and align triangle outline"
```

---

### Task 4: Verify

- [ ] **Step 1: Run tests**

Run: `node --test tests/*.test.mjs`
Expected: all pass

- [ ] **Step 2: Syntax check**

Run: `node --check logo3d.js && node --check script.js`
Expected: no output

---

## Self-Review

- Scope fix: `revealHeroLogo` now in init scope, after `animateIntro`, so `model`/`container`/`animateIntro` are all reachable. Fixes logo never revealing.
- Tail orientation now points toward the walker; gap reduced to 4px.
- Tail triangle inner/outer geometry uses 1px inset, removing the ugly misalignment.
- No changes to walker paths/timing.
EOF
echo done