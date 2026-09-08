/**
 * background.js
 * Interactive cursor-responsive canvas — Google Antigravity style
 * Particle field + radial glow that follows the mouse
 * + Theme toggle (dark / light)
 */

(function () {
  /* ---- Theme Setup ---- */
  const THEME_KEY = 'gs-theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyThemeDOM(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  function setTheme(theme, save = true) {
    applyThemeDOM(theme);
    if (save) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {}
    }
  }

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function toggleTheme() {
    const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next, true);
  }

  // Apply initial theme: stored user choice first, otherwise follow OS / system theme
  const initialSaved = getStoredTheme();
  if (initialSaved) {
    applyThemeDOM(initialSaved);
  } else {
    applyThemeDOM(getSystemTheme());
  }

  // If user hasn't explicitly set a preference, automatically adapt to live OS theme changes
  if (window.matchMedia) {
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const handleOSThemeChange = (e) => {
      if (!getStoredTheme()) {
        applyThemeDOM(e.matches ? 'light' : 'dark');
      }
    };
    if (mql.addEventListener) {
      mql.addEventListener('change', handleOSThemeChange);
    } else if (mql.addListener) {
      mql.addListener(handleOSThemeChange);
    }
  }

  /* ---- Theme-aware colors ---- */
  function particleColor(alpha) {
    if (getCurrentTheme() === 'light') {
      return `rgba(0,0,0,${alpha.toFixed(2)})`;
    }
    return `rgba(255,255,255,${alpha.toFixed(2)})`;
  }

  function connectionColor(alpha) {
    if (getCurrentTheme() === 'light') {
      return `rgba(0,0,0,${alpha.toFixed(3)})`;
    }
    return `rgba(255,255,255,${alpha.toFixed(3)})`;
  }

  function glowStops() {
    if (getCurrentTheme() === 'light') {
      return [
        { stop: 0,   color: 'rgba(26,139,199,0.07)' },
        { stop: 0.4, color: 'rgba(26,139,199,0.02)' },
        { stop: 1,   color: 'rgba(248,249,250,0)' },
      ];
    }
    return [
      { stop: 0,   color: 'rgba(34,158,217,0.10)' },
      { stop: 0.4, color: 'rgba(34,158,217,0.04)' },
      { stop: 1,   color: 'rgba(0,0,0,0)' },
    ];
  }

  function ambientOrbs() {
    if (getCurrentTheme() === 'light') {
      return [
        { x: W * 0.15, y: H * 0.25, r: 300, c: '26,139,199', a: 0.035 },
        { x: W * 0.85, y: H * 0.70, r: 260, c: '0,98,204',   a: 0.025 },
        { x: W * 0.50, y: H * 0.90, r: 200, c: '26,139,199', a: 0.02 },
      ];
    }
    return [
      { x: W * 0.15, y: H * 0.25, r: 300, c: '34,158,217', a: 0.06 },
      { x: W * 0.85, y: H * 0.70, r: 260, c: '0,113,227',  a: 0.05 },
      { x: W * 0.50, y: H * 0.90, r: 200, c: '34,158,217', a: 0.04 },
    ];
  }

  function ambientEnd() {
    if (getCurrentTheme() === 'light') return 'rgba(248,249,250,0)';
    return 'rgba(0,0,0,0)';
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');

  let W, H, mouse = { x: -2000, y: -2000 }, particles = [], animId;

  /* ---- Resize ---- */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildParticles();
  }

  /* ---- Particle pool ---- */
  function buildParticles() {
    particles = [];
    const count = Math.floor((W * H) / 12000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x  = initial ? Math.random() * W : (Math.random() < 0.5 ? 0 : W);
      this.y  = initial ? Math.random() * H : Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.5 + 0.4;
      this.baseAlpha = Math.random() * 0.18 + 0.06;
      this.alpha = this.baseAlpha;
    }

    update() {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);
      const radius = 180;

      if (dist < radius) {
        const force = ((radius - dist) / radius) ** 2;
        this.vx -= (dx / dist) * force * 0.06;
        this.vy -= (dy / dist) * force * 0.06;
        this.alpha = Math.min(0.6, this.baseAlpha + force * 0.5);
      } else {
        this.alpha += (this.baseAlpha - this.alpha) * 0.06;
        this.vx *= 0.98;
        this.vy *= 0.98;
        if (Math.abs(this.vx) < 0.05) this.vx += (Math.random() - 0.5) * 0.08;
        if (Math.abs(this.vy) < 0.05) this.vy += (Math.random() - 0.5) * 0.08;
      }

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = particleColor(this.alpha);
      ctx.fill();
    }
  }

  /* ---- Connection lines between close particles ---- */
  function drawConnections() {
    const limit = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i], p2 = particles[j];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (d < limit) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          const a = (1 - d / limit) * 0.12;
          ctx.strokeStyle = connectionColor(a);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ---- Mouse radial glow ---- */
  function drawGlow() {
    if (mouse.x < -1000) return;
    const stops = glowStops();
    const gr = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 450);
    stops.forEach(s => gr.addColorStop(s.stop, s.color));
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);
  }

  /* ---- Ambient glow orbs (static aesthetic) ---- */
  function drawAmbient() {
    const orbs = ambientOrbs();
    const end = ambientEnd();
    orbs.forEach(o => {
      const gr = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      gr.addColorStop(0, `rgba(${o.c},${o.a})`);
      gr.addColorStop(1, end);
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);
    });
  }

  /* ---- Render loop ---- */
  function render() {
    ctx.clearRect(0, 0, W, H);
    drawAmbient();
    drawGlow();
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(render);
  }

  /* ---- Events ---- */
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    mouse.x = t.clientX; mouse.y = t.clientY;
  }, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.x = -2000; mouse.y = -2000; }, { passive: true });

  /* ---- Theme toggle button HTML helper ---- */
  const getThemeToggleHTML = (id) => `
    <button class="theme-toggle" aria-label="Toggle theme" id="${id}">
      <svg class="theme-icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg class="theme-icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>`;

  /* ---- DOMContentLoaded ---- */
  document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.nav__hamburger');
    const drawer    = document.querySelector('.nav__drawer');

    /* ── Inject theme toggle into nav CTA area (Desktop) ── */
    const navCta = document.querySelector('.nav__cta');
    if (navCta) {
      navCta.insertAdjacentHTML('afterbegin', getThemeToggleHTML('theme-toggle-desktop'));
    }

    /* ── Inject theme toggle next to hamburger menu for mobile ── */
    if (hamburger && hamburger.parentNode) {
      const mobileActions = document.createElement('div');
      mobileActions.className = 'nav__mobile-actions';
      hamburger.parentNode.insertBefore(mobileActions, hamburger);
      mobileActions.insertAdjacentHTML('beforeend', getThemeToggleHTML('theme-toggle-mobile-header'));
      mobileActions.appendChild(hamburger);
    }

    /* ── Wire up all theme toggles ── */
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTheme();
      });
    });

    /* ── Mobile nav ── */
    if (hamburger && drawer) {
      hamburger.addEventListener('click', () => {
        drawer.classList.toggle('open');
        const isOpen = drawer.classList.contains('open');
        hamburger.setAttribute('aria-expanded', isOpen);
        hamburger.innerHTML = isOpen
          ? `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
          : `<svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
      });
      drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        drawer.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = `<svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
      }));
    }

    /* ---- Scroll reveal ---- */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      revealEls.forEach(el => io.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('visible'));
    }

    /* ---- Infinite Marquee — seamless auto-clone & constant professional speed ---- */
    function setupMarquees() {
      const SPEED_PX_PER_SEC = 35; // Calm, professional speed

      document.querySelectorAll('.marquee-items').forEach(track => {
        // Collect unique items on first run (deduplicating if HTML has duplicate sets)
        if (!track._uniqueElements) {
          const seen = new Set();
          const unique = [];
          Array.from(track.querySelectorAll('.logo-item')).forEach(item => {
            const key = item.querySelector('span')?.textContent?.trim() ||
                        item.querySelector('img')?.getAttribute('src') ||
                        item.outerHTML;
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(item.cloneNode(true));
            }
          });
          track._uniqueElements = unique.length ? unique : Array.from(track.children).map(c => c.cloneNode(true));
        }

        // Measure single set width with an inline container
        track.innerHTML = '';
        const tempContainer = document.createElement('div');
        tempContainer.style.display = 'inline-flex';
        tempContainer.style.gap = 'inherit';
        track._uniqueElements.forEach(el => tempContainer.appendChild(el.cloneNode(true)));
        track.appendChild(tempContainer);

        const singleSetWidth = tempContainer.offsetWidth || 300;
        const targetHalfWidth = Math.max(window.innerWidth + 200, singleSetWidth);
        const reps = Math.max(1, Math.ceil(targetHalfWidth / singleSetWidth));

        // Build Half A
        const fragA = document.createDocumentFragment();
        for (let i = 0; i < reps; i++) {
          track._uniqueElements.forEach(el => fragA.appendChild(el.cloneNode(true)));
        }

        // Build Half B (exact mirror for 100% seamless -50% loop)
        const fragB = document.createDocumentFragment();
        for (let i = 0; i < reps; i++) {
          track._uniqueElements.forEach(el => fragB.appendChild(el.cloneNode(true)));
        }

        track.innerHTML = '';
        track.appendChild(fragA);
        track.appendChild(fragB);

        // Calculate halfWidth and set animation duration for constant professional speed
        const halfWidth = track.scrollWidth / 2;
        const duration = Math.max(25, Math.round(halfWidth / SPEED_PX_PER_SEC));
        track.style.animationDuration = `${duration}s`;
      });
    }

    setupMarquees();
    window.addEventListener('load', setupMarquees);
    window.addEventListener('resize', () => {
      clearTimeout(window._marqueeResizeTimer);
      window._marqueeResizeTimer = setTimeout(setupMarquees, 250);
    });

    /* ---- Back to Top Button ---- */
    const btt = document.createElement('button');
    btt.className = 'back-to-top';
    btt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
    btt.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(btt);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btt.classList.add('visible');
      } else {
        btt.classList.remove('visible');
      }
    });

    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  resize();
  render();
})();

