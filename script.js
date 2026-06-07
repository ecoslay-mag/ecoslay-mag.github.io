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
      const about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ── ABSORB DISSOLVE ── */
  const absorbDisp = document.querySelector("#absorb-disp");
  if (absorbDisp) {
    gsap.to(absorbDisp, {
      attr: { scale: 0 },
      duration: 0,
      delay: 4,
      onComplete: () => {
        gsap.timeline({ repeat: -1, repeatDelay: 1 })
          .to(absorbDisp, { attr: { scale: 70 }, duration: 4, ease: "power1.in" })
          .to(absorbDisp, { attr: { scale: 0 }, duration: 2, ease: "power1.out" });
      }
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

};
