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
      const target = document.getElementById('scoobydoo-unity');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
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
      document.querySelectorAll('.event-item.open').forEach(el => {
        el.classList.remove('open');
      });
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ── UNIFIED NOODLE CRAWL ── */
  const unitySection = document.getElementById('scoobydoo-unity');
  if (unitySection) {
    const STROKE_STAGGER = 0.045;
    const STROKE_DRAW_TIME = 1.25;
    const OUTLINE_WIDTH = 7;
    const STROKE_DRAW_ORDER = [0, 12, 2, 10, 4, 8, 6, 1, 3, 5, 7, 9, 11];

    const strokes = Array.from(document.querySelectorAll('.stroke')).map(fill => {
      const fillWidth = parseFloat(fill.getAttribute('stroke-width'));
      const outline = fill.cloneNode(true);
      outline.setAttribute('stroke', '#141414');
      fill.setAttribute('stroke-width', fillWidth - OUTLINE_WIDTH);
      fill.before(outline);
      const length = fill.getTotalLength();
      const layers = [outline, fill];
      layers.forEach(layer => {
        layer.style.strokeDasharray = length;
        layer.style.strokeDashoffset = length;
      });
      return { layers, length };
    });

    const sparkles = gsap.utils.toArray('.sparkle');
    const beforeImg = document.getElementById('scooby-before');
    const afterImg = document.getElementById('scooby-after');
    const wormImg = document.getElementById('scooby-worm');
    const ecoslayImg = document.getElementById('scooby-ecoslay');

    const startTime = (order) => order * STROKE_STAGGER;
    const timingWobble = (order) => (order % 2 === 0 ? 0 : STROKE_STAGGER * 0.6);
    const drawDuration = (order) => STROKE_DRAW_TIME + (order % 3) * 0.12;

    const drawSteps = STROKE_DRAW_ORDER.map((strokeIndex, order) => ({
      strokeIndex,
      at: startTime(order) + timingWobble(order),
      duration: drawDuration(order),
    }));
    const coveredAt = Math.max(...drawSteps.map(step => step.at + step.duration));

    let started = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          observer.disconnect();

          const timeline = gsap.timeline({ delay: 2 });

          // ── Cycle 1: before → trash (pink, same direction) ──
          drawSteps.forEach(({ strokeIndex, at, duration }) => {
            timeline.to(
              strokes[strokeIndex].layers,
              { strokeDashoffset: 0, duration, ease: 'power2.out' },
              at,
            );
          });

          timeline.set(afterImg, { opacity: 1 }, coveredAt - 0.15);
          timeline.set(beforeImg, { opacity: 0 }, coveredAt - 0.15);

          [...STROKE_DRAW_ORDER].reverse().forEach((strokeIndex, order) => {
            const { layers, length } = strokes[strokeIndex];
            timeline.to(
              layers,
              { strokeDashoffset: -length, duration: drawDuration(order), ease: 'power2.in' },
              coveredAt + startTime(order) + timingWobble(order),
            );
          });

          sparkles.forEach((sparkle, index) => {
            const popAt = coveredAt - 0.4 + index * 0.25;
            timeline
              .fromTo(sparkle, { scale: 0, rotate: -60, transformOrigin: 'center' },
                { scale: 1, rotate: 60, duration: 0.5, ease: 'back.out(2)' }, popAt)
              .to(sparkle, { scale: 0, rotate: 140, duration: 0.5, ease: 'back.in(2)' }, popAt + 0.6);
          });

          // ── Cycle 2: trash → worm (pink, same direction) ──
          const cycle2Start = coveredAt + 2.5;

          timeline.set(strokes.map(s => s.layers).flat(), { opacity: 1 }, cycle2Start);

          drawSteps.forEach(({ strokeIndex, at, duration }) => {
            timeline.to(
              strokes[strokeIndex].layers,
              { strokeDashoffset: 0, duration, ease: 'power2.out' },
              cycle2Start + at,
            );
          });

          timeline.set(wormImg, { opacity: 1 }, cycle2Start + coveredAt - 0.15);
          timeline.set(afterImg, { opacity: 0 }, cycle2Start + coveredAt - 0.15);

          [...STROKE_DRAW_ORDER].reverse().forEach((strokeIndex, order) => {
            const { layers, length } = strokes[strokeIndex];
            timeline.to(
              layers,
              { strokeDashoffset: -length, duration: drawDuration(order), ease: 'power2.in' },
              cycle2Start + coveredAt + startTime(order) + timingWobble(order),
            );
          });

          sparkles.forEach((sparkle, index) => {
            const popAt = cycle2Start + coveredAt - 0.4 + index * 0.25;
            timeline
              .fromTo(sparkle, { scale: 0, rotate: -60, transformOrigin: 'center' },
                { scale: 1, rotate: 60, duration: 0.5, ease: 'back.out(2)' }, popAt)
              .to(sparkle, { scale: 0, rotate: 140, duration: 0.5, ease: 'back.in(2)' }, popAt + 0.6);
          });

          // ── Cycle 3: worm → ecoslay (WHITE, opposite direction) ──
          const cycle3Start = cycle2Start + coveredAt + 2.5;

          timeline.call(() => {
            strokes.forEach(({ layers }) => {
              layers.forEach(layer => layer.style.stroke = '#ffffff');
            });
          }, [], cycle3Start);

          drawSteps.forEach(({ strokeIndex, at, duration }) => {
            timeline.to(
              strokes[strokeIndex].layers,
              { strokeDashoffset: 0, duration, ease: 'power2.out' },
              cycle3Start + at,
            );
          });

          timeline.set(ecoslayImg, { opacity: 1 }, cycle3Start + coveredAt - 0.15);
          timeline.set(wormImg, { opacity: 0 }, cycle3Start + coveredAt - 0.15);

          [...STROKE_DRAW_ORDER].reverse().forEach((strokeIndex, order) => {
            const { layers, length } = strokes[strokeIndex];
            timeline.to(
              layers,
              { strokeDashoffset: length, duration: drawDuration(order), ease: 'power2.in' },
              cycle3Start + coveredAt + startTime(order) + timingWobble(order),
            );
          });

          sparkles.forEach((sparkle, index) => {
            const popAt = cycle3Start + coveredAt - 0.4 + index * 0.25;
            timeline
              .fromTo(sparkle, { scale: 0, rotate: -60, transformOrigin: 'center' },
                { scale: 1, rotate: 60, duration: 0.5, ease: 'back.out(2)' }, popAt)
              .to(sparkle, { scale: 0, rotate: 140, duration: 0.5, ease: 'back.in(2)' }, popAt + 0.6);
          });

          timeline.set(strokes.map(s => s.layers).flat(), { opacity: 0 }, cycle3Start + coveredAt + 3);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(unitySection);
  }
};
