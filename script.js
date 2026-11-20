'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* Año del pie de página */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* Aparición de elementos al hacer scroll */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
}

/* Barra de progreso de lectura */
function initProgress() {
  const bar = document.querySelector('.progress');
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    bar.style.setProperty('--p', p.toFixed(4));
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* Resaltado del enlace del menú según la sección visible */
function initNavHighlight() {
  if (!('IntersectionObserver' in window)) return;
  const links = new Map();
  document.querySelectorAll('nav a[href^="#"]').forEach((a) => links.set(a.getAttribute('href').slice(1), a));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove('active'));
      const link = links.get(e.target.id);
      if (link) link.classList.add('active');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) io.observe(section);
  });
}

/* Contadores animados */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length || reduceMotion || !('IntersectionObserver' in window)) return;

  const format = (el, value) => {
    el.textContent = (el.dataset.prefix || '') + value + (el.dataset.suffix || '');
  };
  const animate = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      format(el, Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  counters.forEach((el) => format(el, 0));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => io.observe(el));
}

/* Inclinación 3D de las tarjetas de proyecto */
function initTilt() {
  if (reduceMotion || !canHover) return;
  document.querySelectorAll('.browser').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
      el.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
    });
    el.addEventListener('mouseleave', () => {
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
    });
  });
}

/* Parallax suave de los dibujos abstractos con el ratón */
function initParallax() {
  if (reduceMotion || !canHover) return;
  const items = document.querySelectorAll('.decor-item');
  if (!items.length) return;
  window.addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    items.forEach((el) => {
      const depth = Number(el.dataset.depth) || 0;
      el.style.transform = `translate3d(${(nx * depth).toFixed(1)}px, ${(ny * depth).toFixed(1)}px, 0)`;
    });
  }, { passive: true });
}

/* Código C# que se escribe solo */
function initTyping() {
  const code = document.getElementById('code');
  if (!code || reduceMotion) return;
  const win = code.closest('.code-window');
  const replay = win.querySelector('.code-replay');
  const full = code.innerHTML;
  const caret = '<span class="caret"></span>';
  let timer = 0;

  // Avanza hasta el siguiente carácter visible, sin cortar etiquetas ni entidades HTML.
  const advance = (i) => {
    while (full[i] === '<') i = full.indexOf('>', i) + 1;
    if (full[i] === '&') return full.indexOf(';', i) + 1;
    return i + 1;
  };

  const run = () => {
    clearTimeout(timer);
    replay.hidden = true;
    let i = 0;
    const step = () => {
      if (i >= full.length) {
        code.innerHTML = full + caret;
        replay.hidden = false;
        return;
      }
      i = advance(i);
      code.innerHTML = full.slice(0, i) + caret;
      const newline = full[i - 1] === '\n';
      timer = setTimeout(step, newline ? 80 : 6 + Math.random() * 12);
    };
    step();
  };

  // Mantiene la altura para evitar saltos de diseño mientras se escribe.
  code.parentElement.style.minHeight = code.parentElement.offsetHeight + 'px';
  code.innerHTML = caret;

  replay.addEventListener('click', run);
  if (!('IntersectionObserver' in window)) { code.innerHTML = full; return; }
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { io.disconnect(); run(); }
  }, { threshold: 0.4 });
  io.observe(win);
}

/* Red neuronal de la portada */
function initNeural() {
  const canvas = document.getElementById('neural');
  const hero = document.getElementById('inicio');
  if (!canvas || !hero || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const mouse = { x: -9999, y: -9999 };
  let w = 0;
  let h = 0;
  let nodes = [];
  let frame = 0;
  let visible = true;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = document.documentElement.clientWidth;
    h = Math.round(hero.getBoundingClientRect().bottom + window.scrollY);
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = w < 700 ? 22 : Math.min(60, Math.round(w / 24));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.5 + Math.random() * 1.8,
    }));
    draw();
  };

  const LINK = 145;
  const MOUSE_LINK = 180;

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(79, 70, 229, ${((1 - d / LINK) * 0.38).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < MOUSE_LINK) {
        ctx.strokeStyle = `rgba(14, 165, 233, ${((1 - dm / MOUSE_LINK) * 0.5).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(79, 70, 229, 0.55)';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const update = () => {
    nodes.forEach((n) => {
      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const d = Math.hypot(dx, dy);
      if (d < 150 && d > 40) { n.x += dx * 0.004; n.y += dy * 0.004; }
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });
  };

  const loop = () => {
    update();
    draw();
    frame = requestAnimationFrame(loop);
  };
  const start = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(loop); };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; };

  resize();
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  window.addEventListener('load', resize);
  if (reduceMotion) return; // Fotograma estático

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY + window.scrollY; }, { passive: true });
  document.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }).observe(hero);
  }
  start();
}

initYear();
initReveal();
initProgress();
initNavHighlight();
initCounters();
initTilt();
initParallax();
initTyping();
initNeural();
