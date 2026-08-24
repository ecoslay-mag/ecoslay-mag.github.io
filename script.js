window.onload = function () {

  /* ── HAMBURGER TOGGLE ── */
  const navToggle = document.getElementById('nav-toggle');
  const topbar = document.getElementById('topbar');
  if (navToggle && topbar) {
    navToggle.addEventListener('click', () => {
      topbar.classList.toggle('nav-open');
    });
    document.querySelectorAll('.topbar-link').forEach(link => {
      link.addEventListener('click', () => {
        topbar.classList.remove('nav-open');
      });
    });
  }

  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('.topbar-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ── MELT ANIMATION ── */
  const turb = document.querySelector("#turb");
  const disp = document.querySelector("#disp");

  const melt = gsap.timeline({ repeat: 0, repeatDelay: 1.5 });

  melt
    .to(turb, {
      duration: 1.4,
      ease: "power2.in",
      attr: { baseFrequency: "0.025 0.09" }
    })
    .to(disp, {
      duration: 1.8,
      ease: "power3.in",
      attr: { scale: 120 }
    }, "<0.3")
    .to({}, { duration: 0.8 })
    .to(disp, {
      duration: 4.5,
      ease: "elastic.out(1, 0.5)",
      attr: { scale: 0 }
    })
    .to(turb, {
      duration: 3.0,
      ease: "power2.out",
      attr: { baseFrequency: "0.02 0.06" }
    }, "<0.4");




  
  /* ── HERO SEQUENCE ── */
  const stage = document.querySelector('.stage');
  
  const intro = gsap.timeline({ delay: 3 });
  
  intro
    .to(".stage", {
      y: -80, 
      duration: 0.8
    })
    .to("#hero-subtitle", {
      opacity: 1,
      y: 0,
      duration: 0.6
    }, "-=0.3")
    .to("#scroll-prompt", {
      opacity: 1,
      duration: 0.5
    }, "-=0.1");

  /* ── SCROLL PROMPT CLICK ── */
  const scrollPrompt = document.getElementById('scroll-prompt');
  if (scrollPrompt) {
    scrollPrompt.addEventListener('click', () => {
      const target = document.getElementById('about');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ── CAROUSEL SLIDE LAZY LOAD ── */
  function ensureCarouselImg(slide) {
    const img = slide.querySelector('img');
    if (img && img.dataset.src && !img.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  }

  function preloadAround(track, i) {
    const slides = track.querySelectorAll('.carousel-slide');
    const n = slides.length;
    if (!n) return;
    [-1, 0, 1].forEach(off => {
      ensureCarouselImg(slides[((i + off) % n + n) % n]);
    });
  }

  /* ── CAROUSEL ── */
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const slides = track ? track.querySelectorAll('.carousel-slide') : [];
  const carousel = track ? track.closest('.carousel') : null;

  if (track && slides.length) {
    let index = 0;
    let interval;

    function goTo(i) {
      index = i;
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      preloadAround(track, index);
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    function startAuto() {
      if (!interval) interval = setInterval(next, 4000);
    }
    function stopAuto() {
      clearInterval(interval);
      interval = null;
    }

    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startAuto();
        } else {
          stopAuto();
        }
      });
    }, { threshold: 0.5 });

    observer.observe(carousel);
  }

  /* ── ABOUT CAROUSEL ── */
  const aboutTrack = document.getElementById('about-track');
  const aboutPrev = document.getElementById('about-prev');
  const aboutNext = document.getElementById('about-next');
  const aboutSlides = aboutTrack ? aboutTrack.querySelectorAll('.carousel-slide') : [];
  const aboutCarousel = aboutTrack ? aboutTrack.closest('.carousel') : null;

  if (aboutTrack && aboutSlides.length) {
    let idx = 0;
    let interval;

    function aboutGoTo(i) {
      idx = i;
      if (idx < 0) idx = aboutSlides.length - 1;
      if (idx >= aboutSlides.length) idx = 0;
      aboutTrack.style.transform = 'translateX(-' + (idx * 100) + '%)';
      preloadAround(aboutTrack, idx);
      if (idx === 1) {
        const gif = aboutSlides[1].querySelector('img');
        if (gif) gif.src = gif.src;
      }
      startAboutAuto();
    }

    function aboutNextSlide() { aboutGoTo(idx + 1); }
    function aboutPrevSlide() { aboutGoTo(idx - 1); }

    aboutNext.addEventListener('click', aboutNextSlide);
    aboutPrev.addEventListener('click', aboutPrevSlide);

    function startAboutAuto() {
      stopAboutAuto();
      const delay = idx === 1 ? 9000 : 4000;
      interval = setInterval(aboutNextSlide, delay);
    }
    function stopAboutAuto() {
      clearInterval(interval);
      interval = null;
    }

    aboutTrack.addEventListener('mouseenter', stopAboutAuto);
    aboutTrack.addEventListener('mouseleave', startAboutAuto);

    const aboutObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) startAboutAuto();
        else stopAboutAuto();
      });
    }, { threshold: 0.5 });

    aboutObserver.observe(aboutCarousel);
  }

  /* ── SNACKS CAROUSEL ── */
  const snacksTrack = document.getElementById('snacks-track');
  const snacksPrev = document.getElementById('snacks-prev');
  const snacksNext = document.getElementById('snacks-next');
  const snacksSlides = snacksTrack ? snacksTrack.querySelectorAll('.carousel-slide') : [];
  const snacksCarousel = snacksTrack ? snacksTrack.closest('.carousel') : null;

  if (snacksTrack && snacksSlides.length) {
    let sIdx = 0;
    let sInterval;

    function snacksGoTo(i) {
      sIdx = i;
      if (sIdx < 0) sIdx = snacksSlides.length - 1;
      if (sIdx >= snacksSlides.length) sIdx = 0;
      snacksTrack.style.transform = 'translateX(-' + (sIdx * 100) + '%)';
      preloadAround(snacksTrack, sIdx);
    }

    function snacksNextSlide() { snacksGoTo(sIdx + 1); }
    function snacksPrevSlide() { snacksGoTo(sIdx - 1); }

    snacksNext.addEventListener('click', snacksNextSlide);
    snacksPrev.addEventListener('click', snacksPrevSlide);

    function startSnacksAuto() {
      if (!sInterval) sInterval = setInterval(snacksNextSlide, 4000);
    }
    function stopSnacksAuto() {
      clearInterval(sInterval);
      sInterval = null;
    }

    snacksTrack.addEventListener('mouseenter', stopSnacksAuto);
    snacksTrack.addEventListener('mouseleave', startSnacksAuto);

    const snacksObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) startSnacksAuto();
        else stopSnacksAuto();
      });
    }, { threshold: 0.5 });

    snacksObserver.observe(snacksCarousel);
  }

  /* ── BOOK RELEASE CAROUSEL ── */
  const bookTrack = document.getElementById('book-release-track');
  const bookPrev = document.getElementById('book-release-prev');
  const bookNext = document.getElementById('book-release-next');
  const bookSlides = bookTrack ? bookTrack.querySelectorAll('.carousel-slide') : [];
  const bookCarousel = bookTrack ? bookTrack.closest('.carousel') : null;

  if (bookTrack && bookSlides.length) {
    let bIdx = 0;
    let bInterval;

    function bookGoTo(i) {
      bIdx = i;
      if (bIdx < 0) bIdx = bookSlides.length - 1;
      if (bIdx >= bookSlides.length) bIdx = 0;
      bookTrack.style.transform = 'translateX(-' + (bIdx * 100) + '%)';
      preloadAround(bookTrack, bIdx);
    }

    function bookNextSlide() { bookGoTo(bIdx + 1); }
    function bookPrevSlide() { bookGoTo(bIdx - 1); }

    bookNext.addEventListener('click', bookNextSlide);
    bookPrev.addEventListener('click', bookPrevSlide);

    function startBookAuto() {
      if (!bInterval) bInterval = setInterval(bookNextSlide, 4000);
    }
    function stopBookAuto() {
      clearInterval(bInterval);
      bInterval = null;
    }

    bookTrack.addEventListener('mouseenter', stopBookAuto);
    bookTrack.addEventListener('mouseleave', startBookAuto);

    const bookObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) startBookAuto();
        else stopBookAuto();
      });
    }, { threshold: 0.5 });

    bookObserver.observe(bookCarousel);
  }

  /* ── BERLIN CAROUSEL ── */
  const berlinTrack = document.getElementById('berlin-track');
  const berlinPrev = document.getElementById('berlin-prev');
  const berlinNext = document.getElementById('berlin-next');
  const berlinSlides = berlinTrack ? berlinTrack.querySelectorAll('.carousel-slide') : [];
  const berlinCarousel = berlinTrack ? berlinTrack.closest('.carousel') : null;

  if (berlinTrack && berlinSlides.length) {
    let blIdx = 0;
    let blInterval;

    function berlinGoTo(i) {
      blIdx = i;
      if (blIdx < 0) blIdx = berlinSlides.length - 1;
      if (blIdx >= berlinSlides.length) blIdx = 0;
      berlinTrack.style.transform = 'translateX(-' + (blIdx * 100) + '%)';
      preloadAround(berlinTrack, blIdx);
    }

    function berlinNextSlide() { berlinGoTo(blIdx + 1); }
    function berlinPrevSlide() { berlinGoTo(blIdx - 1); }

    berlinNext.addEventListener('click', berlinNextSlide);
    berlinPrev.addEventListener('click', berlinPrevSlide);

    function startBerlinAuto() {
      if (!blInterval) blInterval = setInterval(berlinNextSlide, 4000);
    }
    function stopBerlinAuto() {
      clearInterval(blInterval);
      blInterval = null;
    }

    berlinTrack.addEventListener('mouseenter', stopBerlinAuto);
    berlinTrack.addEventListener('mouseleave', startBerlinAuto);

    const berlinObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) startBerlinAuto();
        else stopBerlinAuto();
      });
    }, { threshold: 0.5 });

    berlinObserver.observe(berlinCarousel);
  }

  /* ── OPEN CALL VIDEO ── */
  const openCallVideo = document.querySelector('.open-call-video');
  if (openCallVideo) {
    const openCallObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          openCallVideo.play().catch(() => {});
        } else {
          openCallVideo.pause();
        }
      });
    }, { threshold: 0.3 });

    openCallObserver.observe(openCallVideo);
  }

  /* ── TEAM LABEL ── */
  const teamLabel = document.getElementById('team-label');
  const teamPaths = document.querySelectorAll('.team-contours path');
  teamPaths.forEach(path => {
    path.addEventListener('mouseenter', () => {
      teamLabel.textContent = path.id;
      teamLabel.classList.add('visible');
    });
    path.addEventListener('mouseleave', () => {
      teamLabel.classList.remove('visible');
    });
  });

  /* ── EVENTS ACCORDION ── */
  document.querySelectorAll('.event-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const wasOpen = item.classList.contains('open');
      if (wasOpen) {
        item.classList.remove('open');
        return;
      }
      const prevItems = document.querySelectorAll('.event-item.open');
      const headerBefore = header.getBoundingClientRect().top + window.scrollY;

      prevItems.forEach(el => {
        const body = el.querySelector('.event-body');
        if (body) body.style.transition = 'none';
      });
      prevItems.forEach(el => el.classList.remove('open'));
      item.classList.add('open');

      const headerAfter = header.getBoundingClientRect().top + window.scrollY;
      window.scrollBy(0, headerAfter - headerBefore);

      prevItems.forEach(el => {
        const body = el.querySelector('.event-body');
        if (body) body.style.transition = '';
      });
    });
  });

  /* ── GHOST BOTTOM DRIFT ── */
  const ghost = document.getElementById('ghost');
  if (ghost && window.gsap) {
    const SPEED = 120;
    let ghostTl;
    let ghostStarted = false;
    let ghostResize;

    function placeGhost() {
      gsap.set(ghost, { x: 0, y: window.innerHeight - ghost.offsetHeight });
    }

    function ghostLoop() {
      if (ghostTl) ghostTl.kill();
      placeGhost();
      const maxX = Math.max(window.innerWidth - ghost.offsetWidth, 0);
      ghostTl = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } });
      ghostTl
        .to(ghost, { x: maxX, duration: maxX / SPEED })
        .to(ghost, { x: 0, duration: maxX / SPEED });
    }

    placeGhost();

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      intro.eventCallback('onComplete', () => {
        if (ghostStarted) return;
        ghostStarted = true;
        ghostLoop();
      });

      window.addEventListener('resize', () => {
        clearTimeout(ghostResize);
        ghostResize = setTimeout(() => {
          if (ghostStarted) ghostLoop();
          else placeGhost();
        }, 200);
      });
    }

    /* ── GHOST UNMASK SMOKE TRANSITION (exact from mockup) ── */
    const smokeCanvas = document.getElementById('smoke');
    const unmaskedImg = document.getElementById('unmasked');
    let ghostUnmasked = false;

    // Canvas internal resolution — square so particles expand equally in all directions
    const CANVAS_W = 320;
    const CANVAS_H = 320;
    smokeCanvas.width = CANVAS_W;
    smokeCanvas.height = CANVAS_H;
    const ctx = smokeCanvas.getContext('2d');
    // Ghost display is ~1.91:1, canvas is 1:1 → scale Y by 1/1.91 to compensate browser stretch
    const DRAW_SCALE_Y = 1 / 1.91;

    // Pre-render puff textures — 1.5x larger for 50% bigger coverage
    const puffSizes = [15, 24, 33, 45, 60, 83];
    const variantsPerSize = 3;
    const puffTextures = puffSizes.map(r =>
      Array.from({ length: variantsPerSize }, () => makePuffTexture(r))
    );

    function makePuffTexture(radius) {
      const size = radius * 3;
      const c = radius * 1.5;
      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const octx = off.getContext('2d');

      function lobe(ox, oy, r, coreAlpha) {
        const grad = octx.createRadialGradient(c + ox, c + oy, 0, c + ox, c + oy, r);
        grad.addColorStop(0, `rgba(255,255,255,${coreAlpha})`);
        grad.addColorStop(0.35, `rgba(255,255,255,${coreAlpha * 0.7})`);
        grad.addColorStop(0.7, `rgba(255,255,255,${coreAlpha * 0.25})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        octx.fillStyle = grad;
        octx.beginPath();
        octx.arc(c + ox, c + oy, r, 0, Math.PI * 2);
        octx.fill();
      }

      // EXACT from mockup: central 0.7, offset 0.45-0.75
      lobe(0, 0, radius, 0.7);
      const lobeCount = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < lobeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius * (0.35 + Math.random() * 0.55);
        const lr = radius * (0.35 + Math.random() * 0.55);
        lobe(Math.cos(angle) * dist, Math.sin(angle) * dist, lr, 0.45 + Math.random() * 0.3);
      }
      return off;
    }

    function spawnParticle(cx, cy, opts) {
      const angle = Math.random() * Math.PI * 2;
      const isCore = opts.core;
      const speed = isCore
        ? Math.random() * 0.4 + 0.05
        : Math.random() * 1.8 + 0.6;
      const sizeIndex = isCore
        ? puffSizes.length - 1 - Math.floor(Math.random() * 2)
        : Math.floor(Math.random() * puffSizes.length);
      const variant = puffTextures[sizeIndex][Math.floor(Math.random() * variantsPerSize)];

      return {
        x: cx + (Math.random() - 0.5) * (isCore ? 20 : 160),
        y: cy + (Math.random() - 0.5) * (isCore ? 20 : 160),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isCore ? 0.1 : 0.3),
        size: puffSizes[sizeIndex],
        tex: variant,
        life: 0,
        maxLife: isCore ? (70 + Math.random() * 30) : (50 + Math.random() * 40),
        growth: isCore ? (1.012 + Math.random() * 0.008) : (1.005 + Math.random() * 0.008),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        scaleX: 0.75 + Math.random() * 0.6,
        scaleY: 0.75 + Math.random() * 0.6,
        turbPhase: Math.random() * Math.PI * 2,
        turbSpeed: 0.03 + Math.random() * 0.05,
        turbStrength: isCore ? 0.05 : 0.2,
        delay: isCore ? Math.random() * 6 : Math.random() * 18,
      };
    }

    let particles = [];
    let animating = false;
    let frame = 0;
    const totalFrames = 130;

    function tick() {
      frame++;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      let anyAlive = false;

      for (const p of particles) {
        if (frame < p.delay) { anyAlive = true; continue; }

        p.life++;
        if (p.life > p.maxLife) continue;
        anyAlive = true;

        p.turbPhase += p.turbSpeed;
        p.vx += Math.cos(p.turbPhase) * p.turbStrength * 0.1;
        p.vy += Math.sin(p.turbPhase * 1.3) * p.turbStrength * 0.1;

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.size *= p.growth;
        p.rotation += p.rotSpeed;

        const lifeRatio = p.life / p.maxLife;
        let alpha;
        if (lifeRatio < 0.15) alpha = lifeRatio / 0.15;
        else if (lifeRatio < 0.6) alpha = 1;
        else alpha = 1 - (lifeRatio - 0.6) / 0.4;

        const drawSize = p.size * 3;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scaleX, p.scaleY * DRAW_SCALE_Y);
        ctx.drawImage(p.tex, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.restore();
      }

// Soft edge fade — elliptical gradient with simple turbulence
      ctx.globalCompositeOperation = 'destination-in';
      ctx.save();
      // Scale Y to create ellipse matching ghost aspect (~1.91:1)
      ctx.translate(CANVAS_W/2, CANVAS_H/2);
      ctx.scale(1, 1.91);
      // Simple turbulence: modulate radius with sine waves based on frame
      const baseRadius = CANVAS_W/2 * 1.05;
      const turb1 = Math.sin(frame * 0.08) * 8;
      const turb2 = Math.sin(frame * 0.13 * 1.7) * 5;
      const turb3 = Math.sin(frame * 0.05 * 2.3) * 3;
      const radius = baseRadius + turb1 + turb2 + turb3;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.65, 'rgba(0,0,0,1)');
      grad.addColorStop(0.85, 'rgba(0,0,0,0.3)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(-CANVAS_W/2, -CANVAS_H/2, CANVAS_W, CANVAS_H);
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';

      if (frame < totalFrames && anyAlive) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        animating = false;
        // Swap ghost → unmasked
        ghost.style.opacity = '0';
        unmaskedImg.style.opacity = '1';
        // Fade out unmasked after delay
        setTimeout(() => {
          unmaskedImg.style.opacity = '0';
          // Clean up after fade
          setTimeout(() => {
            ghost.remove();
            smokeCanvas.remove();
            unmaskedImg.remove();
          }, 1000);
        }, 4000);
      }
    }

    function triggerUnmask() {
      if (ghostUnmasked || animating) return;
      ghostUnmasked = true;

      // Stop ghost drift
      if (ghostTl) ghostTl.kill();
      ghost.style.pointerEvents = 'none';

      // Position canvas and unmasked at ghost's current screen position
      const rect = ghost.getBoundingClientRect();
      smokeCanvas.style.width = rect.width + 'px';
      smokeCanvas.style.height = rect.height + 'px';
      smokeCanvas.style.left = rect.left + 'px';
      smokeCanvas.style.top = rect.top + 'px';
      smokeCanvas.style.transform = 'none';

      unmaskedImg.style.width = rect.width + 'px';
      unmaskedImg.style.height = rect.height + 'px';
      unmaskedImg.style.left = rect.left + 'px';
      unmaskedImg.style.top = rect.top + 'px';
      unmaskedImg.style.transform = 'none';

      // Spawn particles at center of canvas — increased counts for full coverage
      const cx = CANVAS_W / 2;
      const cy = CANVAS_H / 2;
      particles = [];
      for (let i = 0; i < 80; i++) particles.push(spawnParticle(cx, cy, { core: true }));
      for (let i = 0; i < 140; i++) particles.push(spawnParticle(cx, cy, { core: false }));

      frame = 0;
      animating = true;
      requestAnimationFrame(tick);
    }

    ghost.addEventListener('click', triggerUnmask);
    ghost.addEventListener('touchstart', triggerUnmask, { passive: true });
  }

  /* ── SCROLL-DRIVEN BACKGROUND TRANSITIONS ── */
  const bgCurrent = document.getElementById('bg-current');
  const bgNext = document.getElementById('bg-next');
  const sections = [
    { id: 'about',     bg: 'images/pages/anthology-103.webp' },
    { id: 'magazine',  bg: 'images/pages/anthology-23.webp' },
    { id: 'open-call', bg: 'images/pages/anthology-53.webp' },
    { id: 'events',    bg: 'images/pages/anthology-71.webp' },
    { id: 'team',      bg: 'images/pages/anthology-93.webp' },
    { id: 'contact',   bg: 'images/pages/anthology-08.webp' },
    { id: 'partners',  bg: 'images/pages/anthology-08.webp' },
    { id: 'impressum', bg: 'images/pages/anthology-08.webp' }
  ];

  if (bgCurrent && bgNext && sections.length) {
    const sectionEls = sections.map(s => ({ ...s, el: document.getElementById(s.id) })).filter(s => s.el);
    const spacers = Array.from(document.querySelectorAll('.bg-transition-spacer'));

    // Map spacer data-to to target section and its bg
    const bgMap = Object.fromEntries(sections.map(s => [s.id, s.bg]));
    bgMap.hero = null;

    const transitions = spacers.map(spacer => {
      const targetId = spacer.dataset.to;
      const targetIdx = sectionEls.findIndex(se => se.id === targetId);
      const fromId = targetIdx > 0 ? sectionEls[targetIdx - 1].id : 'hero';
      
      return {
        el: spacer,
        fromBg: bgMap[fromId],
        toBg: bgMap[targetId],
        targetId,
        fromId,
        top: 0,
        bottom: 0,
        height: 0,
        transitionStart: 0,
        transitionEnd: 0
      };
    });

    // Preload all backgrounds
    sections.forEach(s => { new Image().src = s.bg; });

    let bgTick = false;

    function updateSpacerBounds() {
      transitions.forEach(t => {
        const rect = t.el.getBoundingClientRect();
        t.top = rect.top + window.scrollY;
        t.bottom = rect.bottom + window.scrollY;
        t.height = rect.height;
      });
    }

    function updateTransitionPositions() {
      const vh = window.innerHeight;
      transitions.forEach(t => {
        // Spacer top IS the section bottom (they're flush).
        // Transition: starts at spacerTop - 85vh, ends at spacerTop + 15vh (100vh rise)
        t.transitionStart = t.top + (-85) * vh / 100;
        t.transitionEnd = t.top + 15 * vh / 100;
      });
    }

    function update() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Find active transition (spacerTop - 85vh to spacerTop + 15vh)
      let activeTransition = null;
      for (const t of transitions) {
        if (scrollY >= t.transitionStart && scrollY <= t.transitionEnd) {
          activeTransition = t;
          break;
        }
      }

      if (activeTransition) {
        // Transition over 100vh: new bg rises from bottom to full
        const transitionHeight = 100 * vh / 100;
        const progress = Math.min(1, Math.max(0, (scrollY - activeTransition.transitionStart) / transitionHeight));
        bgNext.style.backgroundImage = `url("${activeTransition.toBg}")`;
        bgNext.style.setProperty('--reveal', `${progress * 100}%`);

        // If transition complete, commit to bgCurrent
        if (progress >= 1) {
          bgCurrent.style.backgroundImage = `url("${activeTransition.toBg}")`;
          bgNext.style.setProperty('--reveal', '0%');
        }
      } else {
        // Not in a transition - find last completed transition
        let lastCompleted = null;
        for (const t of transitions) {
          if (scrollY > t.transitionEnd) {
            lastCompleted = t;
          }
        }
        if (lastCompleted) {
          bgCurrent.style.backgroundImage = `url("${lastCompleted.toBg}")`;
        } else {
          // Before first transition - hero, show pink (no bg on bgCurrent)
          bgCurrent.style.backgroundImage = 'none';
        }
        bgNext.style.setProperty('--reveal', '0%');
      }
    }

    function requestUpdate() {
      if (bgTick) return;
      bgTick = true;
      requestAnimationFrame(() => { update(); bgTick = false; });
    }

    updateSpacerBounds();
    updateTransitionPositions();
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', () => {
      updateTransitionPositions();
      updateSpacerBounds();
      requestUpdate();
    });
  }
};
