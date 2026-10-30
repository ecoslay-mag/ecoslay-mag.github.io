# Hero Bubble Font + Neon Green Glow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the speech-bubble text to Hiragino Maru Gothic Pro (with sensible fallbacks) and render it in neon green (`#39ff14`) with a strong outward glow.

**Architecture:** Update `.walker-bubble__text` in `style.css` only. No markup or JS changes.

**Tech Stack:** Static CSS.

---

### Task 1: Update bubble text typography and color

**Files:**
- Modify: `style.css` (`.walker-bubble__text`)

- [ ] **Step 1: Replace the `.walker-bubble__text` rule**

Current:
```css
.walker-bubble__text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(14px, 12px + 0.6vw, 20px);
  letter-spacing: 0.12em;
  color: #111;
  white-space: nowrap;
}
```

New:
```css
.walker-bubble__text {
  font-family: 'Hiragino Maru Gothic Pro', 'Hiragino Maru Gothic ProN', 'Hiragino Sans', 'Yu Gothic', sans-serif;
  font-size: clamp(14px, 12px + 0.6vw, 20px);
  letter-spacing: 0.06em;
  color: #39ff14;
  white-space: nowrap;
  text-shadow:
    0 0 4px #39ff14,
    0 0 8px #39ff14,
    0 0 16px #39ff14,
    0 0 32px #39ff14,
    0 0 48px rgba(57, 255, 20, 0.6);
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "feat: neon green Hiragino Maru Gothic Pro bubble text with glow"
```

---

### Task 2: Verify

- [ ] **Step 1: Run tests**

Run: `node --test tests/*.test.mjs`
Expected: all pass

---

## Self-Review

- Only `.walker-bubble__text` changes; markup, JS, and tail geometry untouched.
- Font stack prioritizes Hiragino Maru Gothic Pro then falls back to other rounded/standard sans faces.
- Neon green `#39ff14` with a five-layer outward glow.
EOF
echo done