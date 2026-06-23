/* ============================================================
   MÔII NIGHTCLUB — main.js
   Partículas · Parallax · Scrollytelling · Menu tabs · Reserva
   ============================================================ */

'use strict';

/* ── Utilidades ──────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ══════════════════════════════════════════════════════════
   1. PARTICLES CANVAS — pontos dourados no hero
══════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = $('#particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const PARTICLE_COUNT = 90;
  const COLORS = ['rgba(205,151,69,', 'rgba(164,103,60,', 'rgba(117,54,29,'];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = Math.random() * 2.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.6 + 0.15);
      this.alpha = Math.random() * 0.6 + 0.1;
      this.fade = (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1);
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      // metaball-like glow
      this.glow = Math.random() > 0.8;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha += this.fade;
      if (this.alpha <= 0.05 || this.alpha >= 0.75) this.fade *= -1;
      if (this.y < -20 || this.x < -20 || this.x > W + 20) this.reset();
    }
    draw() {
      ctx.save();
      if (this.glow) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color + '0.8)';
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha.toFixed(2) + ')';
      ctx.fill();
      ctx.restore();
    }
  }

  // Connection lines between close particles
  function drawConnections() {
    const MAX_DIST = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * 0.15;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(205,151,69,${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  init();
  loop();
}

/* ══════════════════════════════════════════════════════════
   2. HERO PARALLAX — imagens flutuantes com mouse
══════════════════════════════════════════════════════════ */
function initParallax() {
  const hero = $('#hero');
  if (!hero) return;
  const imgs = $$('.float-img', hero);
  // Profundidade de cada imagem (1 = mais lento / fundo, 3 = mais rápido / frente)
  const depths = [1.2, 0.8, 1.5, 1.0, 2.0, 0.6];

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    mouseX = (e.clientX - rect.left - rect.width  / 2) / rect.width;
    mouseY = (e.clientY - rect.top  - rect.height / 2) / rect.height;
  });

  hero.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
  });

  function tick() {
    currentX += (mouseX - currentX) * 0.06;
    currentY += (mouseY - currentY) * 0.06;

    imgs.forEach((img, i) => {
      const d = depths[i] || 1;
      const tx = currentX * d * 35;
      const ty = currentY * d * 25;
      img.style.transform = `translate(${tx}px, ${ty}px)`;
    });
    requestAnimationFrame(tick);
  }
  tick();

  // Touch / gyroscope on mobile
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', e => {
      mouseX =  (e.gamma || 0) / 45;
      mouseY =  (e.beta  || 0) / 45;
    });
  }
}

/* ══════════════════════════════════════════════════════════
   3. SCROLLYTELLING — IntersectionObserver reveals
══════════════════════════════════════════════════════════ */
function initScrollytelling() {
  const reveals = $$('.reveal, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════════════
   4. NAVIGATION — scroll state & smooth active link
══════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = $('#navbar');
  const sections = $$('section[id]');
  const links = $$('.nav-links a, .nav-mobile-overlay a');

  // Scroll class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Active link
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  // Mobile menu toggle
  const toggle = $('#nav-toggle');
  const overlay = $('#nav-mobile-overlay');
  if (toggle && overlay) {
    toggle.addEventListener('click', () => {
      overlay.classList.toggle('open');
      document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    });
    $$('#nav-mobile-overlay a').forEach(a => {
      a.addEventListener('click', () => {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ══════════════════════════════════════════════════════════
   5. MENU TABS
══════════════════════════════════════════════════════════ */
function initMenuTabs() {
  const tabs = $$('.menu-tab');
  const panels = $$('.menu-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = $(`#panel-${target}`);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ══════════════════════════════════════════════════════════
   6. GALERIA LIGHTBOX
══════════════════════════════════════════════════════════ */
function initLightbox() {
  const items = $$('.galeria-item');
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightbox-img');
  const lightboxClose = $('#lightbox-close');

  if (!lightbox) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img')?.src;
      if (!src) return;
      lightboxImg.src = src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  lightboxClose?.addEventListener('click', close);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}

/* ══════════════════════════════════════════════════════════
   7. FORMULÁRIO DE RESERVA
══════════════════════════════════════════════════════════ */
function initReservaForm() {
  const form = $('#reserva-form');
  if (!form) return;

  // Define data mínima como hoje
  const dateInput = form.querySelector('input[type="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    // Validação básica
    const nome = form.querySelector('#res-nome').value.trim();
    const tel  = form.querySelector('#res-tel').value.trim();
    if (!nome || !tel) return;

    // Toast de confirmação
    showToast('✅ Reserva solicitada! Entraremos em contato em breve.');
    form.reset();
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
    }
  });
}

function showToast(msg) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ══════════════════════════════════════════════════════════
   8. COUNTER ANIMATION (Estatísticas)
══════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = $$('.stat-num[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString('pt-BR') + suffix;
        if (current >= target) clearInterval(timer);
      }, 24);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(c => observer.observe(c));
}

/* ══════════════════════════════════════════════════════════
   9. SMOOTH HOVER CARD TILT
══════════════════════════════════════════════════════════ */
function initCardTilt() {
  $$('.oferta-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ══════════════════════════════════════════════════════════
   10. CURSOR GLOW (desktop only)
══════════════════════════════════════════════════════════ */
function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed; width:300px; height:300px; border-radius:50%;
    background:radial-gradient(circle, rgba(205,151,69,0.08) 0%, transparent 70%);
    pointer-events:none; z-index:0; transform:translate(-50%,-50%);
    transition:opacity 0.3s ease; top:-9999px; left:-9999px;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initParallax();
  initScrollytelling();
  initNavbar();
  initMenuTabs();
  initLightbox();
  initReservaForm();
  initCounters();
  initCardTilt();
  initCursorGlow();
});
