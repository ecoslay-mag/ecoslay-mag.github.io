window.onload = function () {

  /* ── MELT ANIMATION ── */
  const turb = document.querySelector("#turb");
  const disp = document.querySelector("#disp");

  const melt = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });

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


  /* ── CUSTOM CURSOR ── */
  const cursor = document.createElement('div');
  cursor.className = 'nav-cursor';
  document.body.appendChild(cursor);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX = mouseX;
  let curY = mouseY;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    curX += (mouseX - curX) * 0.15;
    curY += (mouseY - curY) * 0.15;
    cursor.style.left = curX + 'px';
    cursor.style.top = curY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();


  /* ── MAGNETIC NAV LINKS ── */
  const links = document.querySelectorAll('.nav-link');

  links.forEach(link => {
    link.addEventListener('mousemove', e => {
      const rect = link.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;

      gsap.to(link, {
        x: dx,
        y: dy,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    link.addEventListener('mouseleave', () => {
      gsap.to(link, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.4)"
      });
    });
  });


  /* ── NAV HIDE ON SCROLL ── */
  let lastScroll = 0;
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 60) {
      navbar.style.top = '-80px';
    } else {
      navbar.style.top = '20px';
    }
    lastScroll = current;
  });

};
