(function () {
  'use strict';

  const disableSmoke = new URLSearchParams(location.search).has('nosmoke');


  const SPARKLE_COUNT = 10;
  const DEFAULT_TIMING = { expand: 0, hold: 3, fade: 0.5 };
  const PUFF_RADII = [12, 20, 32, 48, 68];
  const PINK = { r: 255, g: 20, b: 147 };
  const GREEN = { r: 57, g: 255, b: 20 };

  let canvas = null;
  let ctx = null;
  let target = null;
  let maskCanvas = null;
  let sparkleTexture = null;
  let puffTextures = [];
  let particles = [];
  let sparkles = [];
  let running = false;
  let raf = 0;
  let startTime = 0;
  let lastFrame = 0;
  let timing = { ...DEFAULT_TIMING };
  let callbacks = {};
  let expandNotified = false;
  let spawnAccumulator = 0;

  let W = 0;
  let H = 0;
  let CX = 0;
  let CY = 0;
  let RX = 0;
  let RY = 0;
  let SCALE = 1;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function init(canvasEl, targetEl) {
    if (disableSmoke || !canvasEl) return false;
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    if (targetEl) target = targetEl;
    resize();
    return true;
  }

  function setTarget(targetEl) {
    target = targetEl || null;
    if (canvas) resize();
  }

  function resize() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width || window.innerWidth || 1200));
    H = Math.max(1, Math.round(rect.height || window.innerHeight || 560));
    canvas.width = W;
    canvas.height = H;

    let centerX = W / 2;
    let centerY = H / 2;
    let radiusX = Math.min(W, H) * 0.22;
    let radiusY = Math.min(W, H) * 0.16;

    if (target) {
      const targetRect = target.getBoundingClientRect();
      centerX = targetRect.left + targetRect.width / 2;
      centerY = targetRect.top + targetRect.height / 2;
      radiusX = Math.max(72, targetRect.width * 0.62 + 48);
      radiusY = Math.max(52, targetRect.height * 0.62 + 36);
    }

    CX = centerX;
    CY = centerY;
    RX = radiusX;
    RY = radiusY;
    SCALE = Math.max(0.45, Math.min(1.4, Math.min(W / 1200, H / 560)));
    buildTextures();
    clear();
  }

  function buildTextures() {
    puffTextures = PUFF_RADII.map((radius) =>
      [PINK, GREEN].map((color) =>
        Array.from({ length: 3 }, () => makePuffTexture(radius * SCALE, color))
      )
    );
    sparkleTexture = makeSparkleTexture();
    maskCanvas = makeMask();
  }

  function makePuffTexture(radius, color) {
    const size = Math.ceil(radius * 4);
    const center = size / 2;
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d');

    function lobe(ox, oy, r, coreAlpha) {
      const grad = octx.createRadialGradient(
        center + ox,
        center + oy,
        0,
        center + ox,
        center + oy,
        r
      );
      grad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${coreAlpha})`);
      grad.addColorStop(0.35, `rgba(${color.r},${color.g},${color.b},${coreAlpha * 0.7})`);
      grad.addColorStop(0.7, `rgba(${color.r},${color.g},${color.b},${coreAlpha * 0.25})`);
      grad.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
      octx.fillStyle = grad;
      octx.beginPath();
      octx.arc(center + ox, center + oy, r, 0, Math.PI * 2);
      octx.fill();
    }

    lobe(0, 0, radius, 0.65);
    const lobeCount = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < lobeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = radius * (0.35 + Math.random() * 0.55);
      const lobeRadius = radius * (0.35 + Math.random() * 0.55);
      lobe(
        Math.cos(angle) * dist,
        Math.sin(angle) * dist,
        lobeRadius,
        0.35 + Math.random() * 0.25
      );
    }

    return off;
  }

  function makeBaseCloud() {
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const octx = off.getContext('2d');

    octx.save();
    octx.translate(CX, CY);
    octx.scale(1, RY / RX);
    const fill = octx.createLinearGradient(-RX, 0, RX, 0);
    fill.addColorStop(0, 'rgba(57,255,20,0.9)');
    fill.addColorStop(0.45, 'rgba(255,255,255,0.95)');
    fill.addColorStop(1, 'rgba(255,20,147,0.9)');
    octx.beginPath();
    octx.arc(0, 0, RX, 0, Math.PI * 2);
    octx.fillStyle = fill;
    octx.fill();
    octx.restore();

    octx.globalCompositeOperation = 'destination-in';
    octx.save();
    octx.translate(CX, CY);
    octx.scale(1, RY / RX);
    const mask = octx.createRadialGradient(0, 0, 0, 0, 0, RX);
    mask.addColorStop(0, 'rgba(0,0,0,1)');
    mask.addColorStop(0.7, 'rgba(0,0,0,1)');
    mask.addColorStop(0.9, 'rgba(0,0,0,0.55)');
    mask.addColorStop(1, 'rgba(0,0,0,0)');
    octx.beginPath();
    octx.arc(0, 0, RX, 0, Math.PI * 2);
    octx.fillStyle = mask;
    octx.fill();
    octx.restore();
    octx.globalCompositeOperation = 'source-over';

    return off;
  }

  function makeCoreCloud() {
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const octx = off.getContext('2d');

    // Solid central core so the middle cannot be seen through.
    octx.save();
    octx.translate(CX, CY);
    octx.scale(1, RY / RX);
    octx.beginPath();
    octx.arc(0, 0, RX * 0.42, 0, Math.PI * 2);
    octx.fillStyle = 'rgba(255, 240, 246, 0.98)';
    octx.fill();
    octx.restore();

    // Dense static core so the center cannot be seen through.
    for (let i = 0; i < 220; i++) {
      const sizeIndex = Math.floor(Math.random() * Math.min(3, PUFF_RADII.length));
      const colorIndex = Math.random() < 0.5 ? 0 : 1;
      const variants = puffTextures[sizeIndex][colorIndex];
      const tex = variants[Math.floor(Math.random() * variants.length)];
      const radius = PUFF_RADII[sizeIndex] * SCALE;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * RX * 0.42;
      const x = CX + Math.cos(angle) * dist;
      const y = CY + Math.sin(angle) * dist * (RY / RX);
      const size = radius * (2.6 + Math.random() * 0.8);
      octx.save();
      octx.globalAlpha = 0.55 + Math.random() * 0.35;
      octx.translate(x, y);
      octx.rotate(Math.random() * Math.PI * 2);
      octx.scale(0.85 + Math.random() * 0.5, 0.85 + Math.random() * 0.5);
      octx.drawImage(tex, -size / 2, -size / 2, size, size);
      octx.restore();
    }

    octx.save();
    octx.translate(CX, CY);
    octx.scale(1, RY / RX);
    const grad = octx.createRadialGradient(0, 0, 0, 0, 0, RX * 0.5);
    grad.addColorStop(0, 'rgba(255, 248, 251, 0.9)');
    grad.addColorStop(0.45, 'rgba(255, 190, 212, 0.55)');
    grad.addColorStop(1, 'rgba(255, 20, 147, 0)');
    octx.beginPath();
    octx.arc(0, 0, RX * 0.5, 0, Math.PI * 2);
    octx.fillStyle = grad;
    octx.fill();
    octx.restore();

    return off;
  }

  function makeMask() {
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const octx = off.getContext('2d');
    octx.save();
    octx.translate(CX, CY);
    octx.scale(1, RY / RX);
    const grad = octx.createRadialGradient(0, 0, 0, 0, 0, RX);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.72, 'rgba(0,0,0,1)');
    grad.addColorStop(0.9, 'rgba(0,0,0,0.55)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    octx.beginPath();
    octx.arc(0, 0, RX, 0, Math.PI * 2);
    octx.fillStyle = grad;
    octx.fill();
    octx.restore();
    return off;
  }

  function makeSparkleTexture() {
    const size = 128;
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d');
    octx.font = '76px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.shadowColor = 'rgba(255,255,255,0.9)';
    octx.shadowBlur = 14;
    octx.fillText('✨', size / 2, size / 2 + 4);
    return off;
  }

  function spawnParticle(spread, centerYOffset = 0) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.sqrt(Math.random()) * spread;
    const centerY = CY + centerYOffset;
    const sizeIndex = Math.floor(Math.random() * PUFF_RADII.length);
    const colorIndex = Math.random() < 0.5 ? 0 : 1;
    const variants = puffTextures[sizeIndex][colorIndex];
    const tex = variants[Math.floor(Math.random() * variants.length)];
    const drift = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.7 + 0.15) * SCALE;

    return {
      x: CX + Math.cos(angle) * dist,
      y: centerY + Math.sin(angle) * dist * (RY / RX),
      vx: Math.cos(drift) * speed,
      vy: Math.sin(drift) * speed - 0.25 * SCALE,
      size: PUFF_RADII[sizeIndex] * SCALE,
      tex,
      life: 0,
      maxLife: 3.6 + Math.random() * 0.9,
      growth: 1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      scaleX: 0.75 + Math.random() * 0.6,
      scaleY: 0.75 + Math.random() * 0.6,
      turbPhase: Math.random() * Math.PI * 2,
      turbSpeed: 0.6 + Math.random() * 1.2,
      turbStrength: 0.05 * SCALE,
    };
  }

  function spawnSparkles() {
    return Array.from({ length: SPARKLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * RX * 0.55;
      return {
        x: CX + Math.cos(angle) * dist,
        y: CY + Math.sin(angle) * dist * (RY / RX),
        vx: (Math.random() - 0.5) * 0.25 * SCALE,
        vy: (-0.2 - Math.random() * 0.5) * SCALE,
        size: (24 + Math.random() * 34) * SCALE,
        phase: Math.random() * Math.PI * 2,
        twinkle: 1.5 + Math.random() * 2.5,
        rotation: (Math.random() - 0.5) * 0.6,
        rotSpeed: (Math.random() - 0.5) * 0.3,
      };
    });
  }

  function clear() {
    if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
  }

  function burst(options) {
    if (disableSmoke || !ctx || running) return false;
    callbacks = options || {};
    timing = {
      expand: callbacks.expand ?? DEFAULT_TIMING.expand,
      hold: callbacks.hold ?? DEFAULT_TIMING.hold,
      fade: callbacks.fade ?? DEFAULT_TIMING.fade,
    };

    const rect = canvas.getBoundingClientRect();
    if (Math.round(rect.width) !== W || Math.round(rect.height) !== H) resize();

    particles = [];
    for (let i = 0; i < 420; i++) particles.push(spawnParticle(RX * 0.30));
    for (let i = 0; i < 220; i++) particles.push(spawnParticle(RX * 0.76));
    for (let i = 0; i < 1200; i++) particles.push(spawnParticle(RX * 0.76, -RY * 0.45));
    sparkles = spawnSparkles();
    spawnAccumulator = 0;
    expandNotified = false;
    running = true;
    startTime = performance.now();
    lastFrame = startTime;
    clear();
    raf = requestAnimationFrame(frame);
    return true;
  }

  function frame(now) {
    if (!running) return;

    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    const elapsed = (now - startTime) / 1000;
    const holdEnd = timing.expand + timing.hold;
    const total = holdEnd + timing.fade;
    const expandProgress = Math.min(1, elapsed / timing.expand);
    const fadeProgress = Math.max(0, Math.min(1, (elapsed - holdEnd) / timing.fade));

    if (!expandNotified && elapsed >= timing.expand) {
      expandNotified = true;
      if (typeof callbacks.onExpandComplete === 'function') callbacks.onExpandComplete();
    }

    // All smoke is spawned up front so density is immediate.

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      if (p.life > p.maxLife) {
        particles.splice(i, 1);
        continue;
      }
      p.turbPhase += p.turbSpeed * dt;
      p.vx += Math.cos(p.turbPhase) * p.turbStrength * dt * 10;
      p.vy += Math.sin(p.turbPhase * 1.3) * p.turbStrength * dt * 10;
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vx *= Math.pow(0.985, dt * 60);
      p.vy *= Math.pow(0.985, dt * 60);
      p.size *= Math.pow(p.growth, dt * 60);
      p.rotation += p.rotSpeed * dt * 60;
    }

    for (const sparkle of sparkles) {
      sparkle.x += sparkle.vx * dt * 60;
      sparkle.y += sparkle.vy * dt * 60;
      sparkle.rotation += sparkle.rotSpeed * dt;
    }

    clear();
    const alpha = fadeProgress > 0 ? 1 - easeInOut(fadeProgress) : (timing.expand <= 0 ? 1 : Math.min(1, elapsed / 0.25));

    for (const p of particles) {
      const lifeRatio = p.life / p.maxLife;
      let puffAlpha;
      if (lifeRatio < 0.12) puffAlpha = lifeRatio / 0.12;
      else if (lifeRatio < 0.65) puffAlpha = 1;
      else puffAlpha = 1 - (lifeRatio - 0.65) / 0.35;

      ctx.save();
      ctx.globalAlpha = alpha * Math.max(0, Math.min(1, puffAlpha)) * 0.9;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scaleX, p.scaleY);
      ctx.drawImage(p.tex, -p.size * 1.2, -p.size * 1.2, p.size * 2.8, p.size * 2.8);
      ctx.restore();
    }

    const sparkleFadeIn = Math.min(1, elapsed / Math.max(0.2, timing.expand * 0.4));
    for (const sparkle of sparkles) {
      const twinkle = 0.55 + 0.45 * Math.sin(sparkle.phase + elapsed * sparkle.twinkle);
      const size = sparkle.size * (0.85 + 0.15 * twinkle);
      ctx.save();
      ctx.globalAlpha = alpha * sparkleFadeIn * Math.max(0, twinkle);
      ctx.translate(sparkle.x, sparkle.y);
      ctx.rotate(sparkle.rotation);
      ctx.drawImage(sparkleTexture, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    ctx.globalCompositeOperation = 'destination-in';
    ctx.globalAlpha = 1;
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    if (elapsed >= total) {
      finish();
      return;
    }

    raf = requestAnimationFrame(frame);
  }

  function finish() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    clear();
    if (typeof callbacks.onComplete === 'function') callbacks.onComplete();
  }

  window.SmokeBurst = {
    init,
    setTarget,
    burst,
    resize,
    isRunning: function () {
      return running;
    },
    get sparkleCount() {
      return SPARKLE_COUNT;
    },
  };
})();
