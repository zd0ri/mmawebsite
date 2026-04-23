/* ============================================================
   ROTOSPACE · script.js
   Handles: custom cursor, star canvas, typing effect,
   parallax, navigation, tabs, solar system canvas,
   planet age calculator, scroll reveals, theme toggle,
   YouTube modal, mobile menu.
   ============================================================ */

/* ─────────────────────────────────────────
   1.  INITIALISATION (waits for DOM)
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initStarField();
  initCustomCursor();
  initTypingEffect();
  initParallax();
  initHeader();
  initMobileMenu();
  initThemeToggle();
  initPortfolioTabs();
  initScrollReveal();
  initSolarSystem();
  initAgeCalculator();
  initYouTubeModal();
  setFooterYear();
});

/* ─────────────────────────────────────────
   2.  STAR FIELD CANVAS
───────────────────────────────────────── */
function initStarField() {
  const canvas = document.getElementById('starCanvas');
  const ctx    = canvas.getContext('2d');
  let stars    = [];
  let W, H;

  /* Resize canvas to full viewport */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  /* Create star objects */
  function buildStars() {
    stars = [];
    const count = Math.min(Math.floor((W * H) / 4000), 300);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:    Math.random() * W,
        y:    Math.random() * H,
        r:    Math.random() * 1.4 + 0.2,
        a:    Math.random(),           // alpha
        da:   (Math.random() - .5) * .004,  // twinkle delta
        vx:   (Math.random() - .5) * .08,
        vy:   (Math.random() - .5) * .08,
        hue:  Math.random() > .85 ? `${200 + Math.random()*80}` : '240',
      });
    }
  }

  /* Shooting-star state */
  let shooters = [];
  function spawnShooter() {
    shooters.push({
      x:  Math.random() * W * .7,
      y:  Math.random() * H * .3,
      vx: 6 + Math.random() * 8,
      vy: 2 + Math.random() * 4,
      len: 100 + Math.random() * 80,
      a:  1,
    });
  }
  setInterval(spawnShooter, 3500);

  /* Animation loop */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Stars
    stars.forEach(s => {
      s.a  += s.da;
      if (s.a > 1 || s.a < .1) s.da *= -1;
      s.x  += s.vx;
      s.y  += s.vy;
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue},80%,90%,${s.a})`;
      ctx.fill();
    });

    // Shooting stars
    shooters = shooters.filter(sh => {
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.a -= .02;
      if (sh.a <= 0) return false;

      const grd = ctx.createLinearGradient(
        sh.x - sh.vx * (sh.len / sh.vx),
        sh.y - sh.vy * (sh.len / sh.vx),
        sh.x, sh.y
      );
      grd.addColorStop(0, `rgba(185,127,255,0)`);
      grd.addColorStop(1, `rgba(185,200,255,${sh.a})`);
      ctx.beginPath();
      ctx.moveTo(sh.x - sh.vx * 8, sh.y - sh.vy * 8);
      ctx.lineTo(sh.x, sh.y);
      ctx.strokeStyle = grd;
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      return true;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

/* ─────────────────────────────────────────
   3.  CUSTOM CURSOR
───────────────────────────────────────── */
function initCustomCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  let mx = 0, my = 0;  // mouse
  let rx = 0, ry = 0;  // ring (lagged)

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = `${mx}px`;
    dot.style.top  = `${my}px`;
  });

  // Animate ring with lag
  (function animRing() {
    rx += (mx - rx) * .18;
    ry += (my - ry) * .18;
    ring.style.left = `${rx}px`;
    ring.style.top  = `${ry}px`;
    requestAnimationFrame(animRing);
  })();

  // Scale ring on interactive elements
  const hover = document.querySelectorAll('a, button, .video-card, .port-tab, .flip-card, summary, input');
  hover.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '52px';
      ring.style.height = '52px';
      ring.style.borderColor = 'var(--accent-3)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'var(--accent-1)';
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '0.5';
  });
}

/* ─────────────────────────────────────────
   4.  TYPING EFFECT (hero subtitle)
───────────────────────────────────────── */
function initTypingEffect() {
  const el = document.getElementById('typingText');
  const phrases = [
    'Rotoscoping: where every frame is a universe ✨',
    'Tracing life, one pixel at a time 🎨',
    'Planets orbit, pencils draw — magic happens 🪐',
    'From live-action footage to living animation 🎬',
    'Space is infinite. So is creativity. 🌌',
  ];
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(type, 2000); // pause before deleting
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(type, deleting ? 30 : 55);
  }
  setTimeout(type, 800);
}

/* ─────────────────────────────────────────
   5.  PARALLAX (mouse movement on home)
───────────────────────────────────────── */
function initParallax() {
  const layer = document.getElementById('parallaxLayer');
  if (!layer) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    layer.style.transform = `translate(${dx * 18}px, ${dy * 12}px)`;

    // Move mini system subtly too
    const ms = document.getElementById('miniSystem');
    if (ms) ms.style.transform = `translateY(-50%) translate(${dx * -10}px, ${dy * -8}px)`;
  });
}

/* ─────────────────────────────────────────
   6.  STICKY HEADER + ACTIVE NAV
───────────────────────────────────────── */
function initHeader() {
  const header  = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

  // Sections to observe
  const sections = ['home', 'portfolio', 'about'];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.dataset.section === id);
        });
      }
    });
  }, { threshold: .35 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

/* ─────────────────────────────────────────
   7.  MOBILE MENU
───────────────────────────────────────── */
function initMobileMenu() {
  const btn   = document.getElementById('hamburger');
  const menu  = document.getElementById('mobileMenu');
  const links = menu.querySelectorAll('.mobile-link');

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('menu-open', open);
  });

  // Close on link click
  links.forEach(l => l.addEventListener('click', () => {
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', true);
    document.body.classList.remove('menu-open');
  }));
}

/* ─────────────────────────────────────────
   8.  THEME TOGGLE
───────────────────────────────────────── */
function initThemeToggle() {
  const btn  = document.getElementById('themeToggle');
  const root = document.documentElement;

  // Persist preference
  const saved = localStorage.getItem('roto-theme');
  if (saved) root.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('roto-theme', next);
  });
}

/* ─────────────────────────────────────────
   9.  PORTFOLIO TABS
───────────────────────────────────────── */
function initPortfolioTabs() {
  const tabs   = document.querySelectorAll('.port-tab');
  const panels = document.querySelectorAll('.port-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === target);
        t.setAttribute('aria-selected', t.dataset.tab === target);
      });
      panels.forEach(p => {
        p.classList.toggle('active', p.id === `panel-${target}`);
      });

      // When solar panel activates, re-init canvas sizing
      if (target === 'solar') {
        setTimeout(resizeSolarCanvas, 50);
      }
    });
  });
}

/* ─────────────────────────────────────────
   10. SCROLL REVEAL
───────────────────────────────────────── */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-up');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .12 });

  items.forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────
   11. SOLAR SYSTEM CANVAS
───────────────────────────────────────── */
/* Planet data */
const PLANETS = [
  { name: 'Mercury', emoji: '☿', color: '#b5b5b5', glow: '#aaa', radius: 5,
    dist: 70,  speed: .047, angle: 0,   label: 'Mercury', yearDays: 88 },
  { name: 'Venus',   emoji: '♀', color: '#e8c87a', glow: '#e8b', radius: 8,
    dist: 110, speed: .035, angle: 1,   label: 'Venus',   yearDays: 225 },
  { name: 'Earth',   emoji: '🌍', color: '#4b9fe4', glow: '#6af', radius: 9,
    dist: 155, speed: .029, angle: 2,   label: 'Earth',   yearDays: 365 },
  { name: 'Mars',    emoji: '♂', color: '#d16030', glow: '#e74', radius: 7,
    dist: 205, speed: .024, angle: .5,  label: 'Mars',    yearDays: 687 },
  { name: 'Jupiter', emoji: '♃', color: '#c9956b', glow: '#db8', radius: 16,
    dist: 268, speed: .013, angle: 3,   label: 'Jupiter', yearDays: 4333 },
  { name: 'Saturn',  emoji: '♄', color: '#e3c87a', glow: '#eca', radius: 13,
    dist: 330, speed: .009, angle: 1.3, label: 'Saturn',  yearDays: 10759, rings: true },
  { name: 'Uranus',  emoji: '⛢', color: '#9de3e8', glow: '#7ee', radius: 10,
    dist: 385, speed: .006, angle: 4,   label: 'Uranus',  yearDays: 30687 },
  { name: 'Neptune', emoji: '♆', color: '#4b7bec', glow: '#57f', radius: 10,
    dist: 430, speed: .005, angle: 2.2, label: 'Neptune', yearDays: 60190 },
];

let solarCanvas, solarCtx, solarAnim;
let mouseXS = 0, mouseYS = 0; // mouse over solar canvas
let hoveredPlanet = null;
const tooltip = document.getElementById('planetTooltip');

function resizeSolarCanvas() {
  if (!solarCanvas) return;
  const rect = solarCanvas.getBoundingClientRect();
  solarCanvas.width  = rect.width;
  solarCanvas.height = rect.height;
}

function initSolarSystem() {
  solarCanvas = document.getElementById('solarCanvas');
  solarCtx    = solarCanvas.getContext('2d');
  resizeSolarCanvas();

  window.addEventListener('resize', resizeSolarCanvas);

  /* Track mouse over canvas */
  solarCanvas.addEventListener('mousemove', e => {
    const rect = solarCanvas.getBoundingClientRect();
    mouseXS = e.clientX - rect.left;
    mouseYS = e.clientY - rect.top;
    checkHover(e.clientX, e.clientY);
  });
  solarCanvas.addEventListener('mouseleave', () => {
    hoveredPlanet = null;
    tooltip.classList.remove('visible');
  });

  /* Background stars for solar canvas */
  const bgStars = buildSolarStars();

  function loop() {
    const W = solarCanvas.width;
    const H = solarCanvas.height;
    const cx = W / 2 + (mouseXS - W / 2) * .04; // subtle parallax
    const cy = H / 2 + (mouseYS - H / 2) * .04;

    solarCtx.clearRect(0, 0, W, H);

    // BG stars
    bgStars.forEach(s => {
      solarCtx.beginPath();
      solarCtx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      solarCtx.fillStyle = `rgba(220,210,255,${s.a})`;
      solarCtx.fill();
    });

    // Sun
    const sunGrd = solarCtx.createRadialGradient(cx, cy, 0, cx, cy, 28);
    sunGrd.addColorStop(0,   '#fff9a0');
    sunGrd.addColorStop(.5,  '#ffc96b');
    sunGrd.addColorStop(1,   'rgba(255,140,0,0)');
    solarCtx.beginPath();
    solarCtx.arc(cx, cy, 18, 0, Math.PI * 2);
    solarCtx.fillStyle = sunGrd;
    solarCtx.fill();

    // Sun corona glow
    const coroGrd = solarCtx.createRadialGradient(cx, cy, 10, cx, cy, 50);
    coroGrd.addColorStop(0, 'rgba(255,200,50,.25)');
    coroGrd.addColorStop(1, 'rgba(255,140,0,0)');
    solarCtx.beginPath();
    solarCtx.arc(cx, cy, 50, 0, Math.PI * 2);
    solarCtx.fillStyle = coroGrd;
    solarCtx.fill();

    // Planets
    PLANETS.forEach(p => {
      p.angle += p.speed * .016 * 6; // speed it up for visibility

      const px = cx + Math.cos(p.angle) * p.dist * (W / 960);
      const py = cy + Math.sin(p.angle) * p.dist * (H / 540);

      // Store screen position for hover detection
      p._sx = px;
      p._sy = py;

      // Orbit ring
      solarCtx.beginPath();
      solarCtx.ellipse(cx, cy, p.dist * (W / 960), p.dist * (H / 540), 0, 0, Math.PI * 2);
      solarCtx.strokeStyle = hoveredPlanet === p
        ? `rgba(185,127,255,.35)` : `rgba(140,120,200,.12)`;
      solarCtx.lineWidth   = hoveredPlanet === p ? 1.5 : .8;
      solarCtx.stroke();

      // Planet glow
      const pr = p.radius * (W / 960);
      const gGrd = solarCtx.createRadialGradient(px, py, 0, px, py, pr * 3);
      gGrd.addColorStop(0, p.glow + '55');
      gGrd.addColorStop(1, 'rgba(0,0,0,0)');
      solarCtx.beginPath();
      solarCtx.arc(px, py, pr * 3, 0, Math.PI * 2);
      solarCtx.fillStyle = gGrd;
      solarCtx.fill();

      // Planet body
      const pGrd = solarCtx.createRadialGradient(px - pr * .3, py - pr * .3, 0, px, py, pr);
      pGrd.addColorStop(0, lighten(p.color));
      pGrd.addColorStop(1, darken(p.color));
      solarCtx.beginPath();
      solarCtx.arc(px, py, Math.max(pr, 3), 0, Math.PI * 2);
      solarCtx.fillStyle = pGrd;
      solarCtx.fill();

      // Saturn rings
      if (p.rings) {
        solarCtx.save();
        solarCtx.translate(px, py);
        solarCtx.scale(1, .3);
        solarCtx.beginPath();
        solarCtx.arc(0, 0, pr * 2.5, 0, Math.PI * 2);
        solarCtx.strokeStyle = 'rgba(210,180,100,.55)';
        solarCtx.lineWidth   = pr * .9;
        solarCtx.stroke();
        solarCtx.restore();
      }

      // Name label (on hover)
      if (hoveredPlanet === p) {
        solarCtx.fillStyle = 'rgba(220,200,255,.9)';
        solarCtx.font      = `bold ${12 * (W / 960)}px 'Syne', sans-serif`;
        solarCtx.textAlign = 'center';
        solarCtx.fillText(p.label, px, py - pr * 2);
      }
    });

    solarAnim = requestAnimationFrame(loop);
  }

  loop();
}

function buildSolarStars() {
  const stars = [];
  for (let i = 0; i < 180; i++) {
    stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * .9 + .2, a: Math.random() * .6 + .1 });
  }
  return stars;
}

function checkHover(cx, cy) {
  const rect = solarCanvas.getBoundingClientRect();
  const mx   = cx - rect.left;
  const my   = cy - rect.top;
  const W    = solarCanvas.width;
  const H    = solarCanvas.height;

  hoveredPlanet = null;
  PLANETS.forEach(p => {
    if (!p._sx) return;
    const dx = mx - p._sx;
    const dy = my - p._sy;
    const pr = p.radius * (W / 960);
    if (Math.sqrt(dx * dx + dy * dy) < Math.max(pr, 12)) {
      hoveredPlanet = p;
    }
  });

  if (hoveredPlanet) {
    tooltip.innerHTML = `<strong>${hoveredPlanet.emoji} ${hoveredPlanet.name}</strong><br>
      Year: ${hoveredPlanet.yearDays} Earth days`;
    tooltip.style.left = `${cx + 16}px`;
    tooltip.style.top  = `${cy - 10}px`;
    tooltip.classList.add('visible');
  } else {
    tooltip.classList.remove('visible');
  }
}

/* Colour helpers */
function lighten(hex) {
  let [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.min(r+50,255)},${Math.min(g+50,255)},${Math.min(b+50,255)})`;
}
function darken(hex) {
  let [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.max(r-40,0)},${Math.max(g-40,0)},${Math.max(b-40,0)})`;
}
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* ─────────────────────────────────────────
   12. PLANET AGE CALCULATOR
───────────────────────────────────────── */
/* Orbital periods in Earth years */
const PLANET_YEARS = [
  { name: 'Mercury', emoji: '☿', period: .241  },
  { name: 'Venus',   emoji: '♀', period: .615  },
  { name: 'Mars',    emoji: '♂', period: 1.881 },
  { name: 'Jupiter', emoji: '♃', period: 11.86 },
  { name: 'Saturn',  emoji: '♄', period: 29.46 },
  { name: 'Uranus',  emoji: '⛢', period: 84.01 },
  { name: 'Neptune', emoji: '♆', period: 164.8 },
];

function initAgeCalculator() {
  const btn     = document.getElementById('calcBtn');
  const input   = document.getElementById('earthAge');
  const results = document.getElementById('ageResults');

  btn.addEventListener('click', calculate);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });

  function calculate() {
    const age = parseFloat(input.value);
    if (isNaN(age) || age <= 0 || age > 999) {
      results.innerHTML = `<p style="color:var(--accent-3);font-family:var(--font-mono);font-size:.85rem;padding:10px 0;">
        Please enter a valid age (1–999) 🙏</p>`;
      return;
    }

    results.innerHTML = '';

    PLANET_YEARS.forEach((p, i) => {
      const planetAge = (age / p.period).toFixed(2);
      const card = document.createElement('div');
      card.className = 'planet-result';
      card.style.animationDelay = `${i * .07}s`;
      card.innerHTML = `
        <div class="p-emoji">${p.emoji}</div>
        <div class="p-name">${p.name}</div>
        <div class="p-age">${planetAge}</div>
        <div class="p-years">planet years old</div>
      `;
      results.appendChild(card);
    });
  }
}

/* ─────────────────────────────────────────
   13. YOUTUBE MODAL
───────────────────────────────────────── */
function initYouTubeModal() {
  const modal    = document.getElementById('ytModal');
  const iframe   = document.getElementById('ytIframe');
  const closeBtn = document.getElementById('ytClose');
  const backdrop = document.getElementById('ytBackdrop');
  const cards    = document.querySelectorAll('.video-card');

  function openModal(videoId) {
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    iframe.src = '';
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.vid));
  });

  closeBtn.addEventListener('click',  closeModal);
  backdrop.addEventListener('click',  closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ─────────────────────────────────────────
   14. FOOTER YEAR
───────────────────────────────────────── */
function setFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────
   15. SMOOTH SCROLL (fallback for older browsers)
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
