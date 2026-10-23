# Hero Bubble Tail + Paris Spacing Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the inner white triangle from each bubble tail (solid black pointer), and move the Paris bubble flush with the walker (0px gap) so both bubbles sit equally close to their heads. The logo spin animation is unchanged from the original (`SETTLE_YAW - Math.PI * 2` around the vertical axis); no code change is needed there beyond the already-fixed reveal gate.

**Architecture:** Delete the `::after` rules that draw the white inner triangle, leaving the outer black `border-*` triangle. Adjust the Paris bubble's horizontal offset in `syncBubbles` from 4px to 0px.

**Tech Stack:** Static HTML/CSS/JS, Node test runner.

---

### Task 1: Remove white inner triangles

**Files:**
- Modify: `style.css` (walker bubble tail `::after` rules)

- [ ] **Step 1: Delete both `::after` blocks**

Remove:
```css
.walker-bubble--pigeon .walker-bubble__tail::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 8px solid #fff;
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
git commit -m "fix: remove white inner triangle from bubble tails"
```

---

### Task 2: Move Paris bubble flush to the walker

**Files:**
- Modify: `script.js` (`syncBubbles`)

- [ ] **Step 1: Change Paris gap from 4px to 0px**

Current:
```js
      parisBubble.style.left = (r.left - parisBubble.offsetWidth - 4) + 'px';
```

New:
```js
      parisBubble.style.left = (r.left - parisBubble.offsetWidth) + 'px';
```

- [ ] **Step 2: Commit**

```bash
git add script.js
git commit -m "fix: bring Paris bubble flush to the walker head"
```

---

### Task 3: Verify

- [ ] **Step 1: Run tests**

Run: `node --test tests/*.test.mjs`
Expected: all pass

- [ ] **Step 2: Syntax check**

Run: `node --check script.js && node --check logo3d.js`
Expected: no output
EOF
echo done