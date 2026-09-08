/**
 * background.js
 * Interactive cursor-responsive canvas — Google Antigravity style
 * Particle field + radial glow that follows the mouse
 */

(function () {
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
      ctx.fillStyle = `rgba(255,255,255,${this.alpha.toFixed(2)})`;
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
          ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ---- Mouse radial glow ---- */
  function drawGlow() {
    if (mouse.x < -1000) return;
    const gr = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 450);
    gr.addColorStop(0,   'rgba(34,158,217,0.10)');
    gr.addColorStop(0.4, 'rgba(34,158,217,0.04)');
    gr.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);
  }

  /* ---- Ambient glow orbs (static aesthetic) ---- */
  function drawAmbient() {
    const orbs = [
      { x: W * 0.15, y: H * 0.25, r: 300, c: '34,158,217', a: 0.06 },
      { x: W * 0.85, y: H * 0.70, r: 260, c: '0,113,227',  a: 0.05 },
      { x: W * 0.50, y: H * 0.90, r: 200, c: '34,158,217', a: 0.04 },
    ];
    orbs.forEach(o => {
      const gr = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      gr.addColorStop(0, `rgba(${o.c},${o.a})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
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

  /* ---- Mobile nav ---- */
  document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.nav__hamburger');
    const drawer    = document.querySelector('.nav__drawer');
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

    /* ---- Active Footer Links ---- */
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.footer__col a').forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });
  });

  resize();
  render();
})();
