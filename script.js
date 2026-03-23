window.onload = function () {

  const navbar = document.getElementById('navbar');

  /* ── HAMBURGER ── */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
    }
  });

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
  cursor.textContent = 'SLAYY';
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

  /* ── NAV HIDE ON SCROLL ── */
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 60) {
      navbar.style.top = '-80px';
    } else {
      navbar.style.top = '20px';
    }
    lastScroll = current;
  });

  /* ── HERO SEQUENCE ── */
  const stage = document.querySelector('.stage');
  const ctaBtn = document.getElementById('cta-btn');
  
  const intro = gsap.timeline({ delay: 3 });
  
  intro
    .to(".stage", {
      y: -80, 
      duration: 0.8
    })
    .to("#cta-btn", {
      opacity: 1,
      y: 0,
      duration: 0.6
    }, "<"); 

  /* ── POPUP ── */
  const popup = document.getElementById('popup');
  const popupClose = document.getElementById('popup-close');

  setTimeout(() => {
    popup.classList.add('visible');
  }, 7000);

  popupClose.addEventListener('click', () => {
    popup.style.transition = 'left 0.4s cubic-bezier(0.4, 0, 1, 1)';
    popup.style.left = '-380px';
  });

};
