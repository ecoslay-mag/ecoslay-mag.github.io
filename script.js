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
      const target = window.matchMedia('(max-width: 600px)').matches
        ? document.getElementById('about')
        : document.getElementById('scoobydoo-unity');
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

  /* ── UNIFIED NOODLE CRAWL ── */
  const unitySection = document.getElementById('scoobydoo-unity');
  if (unitySection) {
    const STROKE_STAGGER = 0.06;
    const STROKE_DRAW_TIME = 2.0;
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
    const ccImg = document.getElementById('scooby-cc');
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

    const CYCLE_GAP = 6;

    function addCycle(tl, offset, hideImg, showImg, reverse) {
      tl.call(() => {
        strokes.forEach(({ layers, length }) => {
          const val = reverse ? -length : length;
          layers.forEach(layer => layer.style.strokeDashoffset = val);
        });
      }, [], offset);

      drawSteps.forEach(({ strokeIndex, at, duration }) => {
        tl.to(
          strokes[strokeIndex].layers,
          { strokeDashoffset: 0, duration, ease: 'power2.out' },
          offset + at,
        );
      });

      tl.set(showImg, { opacity: 1 }, offset + coveredAt - 0.15);
      tl.set(hideImg, { opacity: 0 }, offset + coveredAt - 0.15);

      [...STROKE_DRAW_ORDER].reverse().forEach((strokeIndex, order) => {
        const { layers, length } = strokes[strokeIndex];
        tl.to(
          layers,
          { strokeDashoffset: reverse ? length : -length, duration: drawDuration(order), ease: 'power2.in' },
          offset + coveredAt + startTime(order) + timingWobble(order),
        );
      });

      sparkles.forEach((sparkle, index) => {
        const popAt = offset + coveredAt - 0.4 + index * 0.25;
        tl
          .fromTo(sparkle, { scale: 0, rotate: -60, transformOrigin: 'center' },
            { scale: 1, rotate: 60, duration: 0.5, ease: 'back.out(2)' }, popAt)
          .to(sparkle, { scale: 0, rotate: 140, duration: 0.5, ease: 'back.in(2)' }, popAt + 0.6);
      });
    }

    let started = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          observer.disconnect();

          const timeline = gsap.timeline({ delay: 2 });

          addCycle(timeline, 0, beforeImg, afterImg);
          const c2 = coveredAt + CYCLE_GAP;
          addCycle(timeline, c2, afterImg, ccImg);
          const c3 = c2 + coveredAt + CYCLE_GAP;
          addCycle(timeline, c3, ccImg, wormImg);
          const c4 = c3 + coveredAt + CYCLE_GAP;

          timeline.call(() => {
            strokes.forEach(({ layers }) => {
              layers[1].style.stroke = '#ffb3c6';
            });
          }, [], c4);

          addCycle(timeline, c4, wormImg, ecoslayImg, true);

          timeline.set(strokes.map(s => s.layers).flat(), { opacity: 0 }, c4 + coveredAt + 3);

          timeline.call(() => {
            const p = document.getElementById('scooby-scroll-prompt');
            if (p) {
              p.style.opacity = 1;
              p.style.pointerEvents = 'auto';
            }
          }, [], c4 + coveredAt + 3.5);

          const scrollPrompt = document.getElementById('scooby-scroll-prompt');
          if (scrollPrompt) {
            scrollPrompt.addEventListener('click', () => {
              const target = document.getElementById('about');
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
          }
        }
      });
    }, { threshold: 0.5 });

    observer.observe(unitySection);
  }
};
