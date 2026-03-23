window.onload = function () {

  const navbar = document.getElementById('navbar');

  /* ── HAMBURGER ── */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  hamburger.addEventListener('click', () => {
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

/* ── NAV ── */
#navbar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

#hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid #999;
  cursor: pointer;
  background: linear-gradient(180deg,
    #ffffff 0%,
    #e0e0e0 25%,
    #b0b0b0 50%,
    #d8d8d8 75%,
    #f5f5f5 100%
  );
  box-shadow:
    0 1px 0 #fff inset,
    0 -1px 0 #888 inset,
    0 4px 16px rgba(0,0,0,0.25);
  position: relative;
  z-index: 101;
}

#hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: #333;
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

#hamburger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
#hamburger.open span:nth-child(2) {
  opacity: 0;
}
#hamburger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

#nav-menu {
  position: absolute;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-radius: 18px;
  background: linear-gradient(180deg,
    #ffffff 0%,
    #e0e0e0 25%,
    #b0b0b0 50%,
    #d8d8d8 75%,
    #f5f5f5 100%
  );
  box-shadow:
    0 1px 0 #fff inset,
    0 -1px 0 #888 inset,
    0 4px 16px rgba(0,0,0,0.25);
  border: 1px solid #999;
  min-width: 180px;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-50%) translateY(-8px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

#nav-menu.open {
  opacity: 1;
  pointer-events: all;
  transform: translateX(-50%) translateY(0);
}

.nav-link {
  position: relative;
  padding: 10px 24px;
  border-radius: 999px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13.5px;
  letter-spacing: 0.08em;
  text-decoration: none;
  color: #333;
  text-transform: uppercase;
  transition: all 0.15s ease;
  background: transparent;
  white-space: nowrap;
  text-align: center;
}

.nav-link:hover {
  background: linear-gradient(180deg,
    #e8e8e8 0%,
    #c0c0c0 40%,
    #a0a0a0 50%,
    #c8c8c8 60%,
    #ececec 100%
  );
}

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

/* ── POPUP ── */
  const popup = document.getElementById('popup');
  const popupClose = document.getElementById('popup-close');

  setTimeout(() => {
    popup.classList.add('visible');
  }, 2500);

  popupClose.addEventListener('click', () => {
    popup.style.transition = 'left 0.4s cubic-bezier(0.4, 0, 1, 1)';
    popup.style.left = '-380px';
  });
  
};
