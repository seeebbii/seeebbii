// =====================================================================
// HASEEB ZAFAR — PORTFOLIO
// Vanilla JS — no dependencies. Built to be fast, accessible, and crisp.
// =====================================================================

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------------------------------------------------------------------
  // Theme toggle (with localStorage persistence)
  // -------------------------------------------------------------------
  const themeToggle = $('#themeToggle');
  const root = document.documentElement;

  const stored = localStorage.getItem('hz-theme');
  if (stored) root.setAttribute('data-theme', stored);

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('hz-theme', next);
  });

  // -------------------------------------------------------------------
  // Live clocks (Lahore, Asia/Karachi)
  // -------------------------------------------------------------------
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const fmtShort = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  });
  const clock = $('#clock');
  const footerClock = $('#footerClock');

  const tick = () => {
    const now = new Date();
    if (clock) clock.textContent = fmt.format(now) + ' PKT';
    if (footerClock) footerClock.textContent = fmtShort.format(now);
  };
  tick();
  setInterval(tick, 1000);

  // -------------------------------------------------------------------
  // Year in footer
  // -------------------------------------------------------------------
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -------------------------------------------------------------------
  // Nav: scrolled state + active section highlighting
  // -------------------------------------------------------------------
  const nav = $('#nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.nav__links a');
  const sectionMap = navLinks.map(a => {
    const id = a.getAttribute('href').replace('#', '');
    return { link: a, section: document.getElementById(id) };
  }).filter(x => x.section);

  if ('IntersectionObserver' in window && sectionMap.length) {
    const navObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sectionMap.forEach(x => navObs.observe(x.section));
  }

  // -------------------------------------------------------------------
  // Custom cursor (desktop only)
  // -------------------------------------------------------------------
  const cursor = $('.cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');

  if (cursor && window.matchMedia('(hover: hover)').matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot) dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });

    const followRing = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(followRing);
    };
    if (!reduceMotion) followRing();

    const hovers = 'a, button, .card, .timeline__item, .metric, .filter__btn, .stack__col li';
    document.body.addEventListener('mouseover', (e) => {
      if (e.target.closest(hovers)) cursor.classList.add('hover');
    });
    document.body.addEventListener('mouseout', (e) => {
      if (e.target.closest(hovers)) cursor.classList.remove('hover');
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  // -------------------------------------------------------------------
  // Magnetic buttons (subtle pull toward cursor)
  // -------------------------------------------------------------------
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // -------------------------------------------------------------------
  // Reveal on scroll (staggered)
  // -------------------------------------------------------------------
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.delay || (i * 90);
          e.target.style.setProperty('--d', delay);
          e.target.classList.add('in');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    $$('.reveal').forEach(el => revealObs.observe(el));

    // Auto-reveal common section parts
    const autoTargets = [
      '.section__head',
      '.metric',
      '.timeline__item',
      '.card',
      '.stack__col',
      '.connect__card',
    ];
    autoTargets.forEach(sel => {
      $$(sel).forEach((el, i) => {
        el.classList.add('reveal');
        if (!el.dataset.delay) el.dataset.delay = i * 70;
        revealObs.observe(el);
      });
    });
  }

  // -------------------------------------------------------------------
  // Animated number counters
  // -------------------------------------------------------------------
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animateCount = (el) => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const value = target * eased;
      el.textContent = (target % 1 === 0 ? Math.round(value) : value.toFixed(1)) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          countObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });

    $$('[data-count]').forEach(el => countObs.observe(el));
  } else {
    $$('[data-count]').forEach(el => {
      el.textContent = el.dataset.count + (el.dataset.suffix || '');
    });
  }

  // -------------------------------------------------------------------
  // Project filter
  // -------------------------------------------------------------------
  const filterBtns = $$('.filter__btn');
  const cards = $$('.bento .card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.toggle('active', b === btn));

      cards.forEach(card => {
        const tags = (card.dataset.tags || '').split(/\s+/);
        const match = filter === 'all' || tags.includes(filter);
        card.classList.toggle('fade-out', !match);
      });
    });
  });

  // -------------------------------------------------------------------
  // Konami easter egg → cycle accent colors
  // -------------------------------------------------------------------
  const palette = [
    { a: '#FF6B35', b: '#7DD3C0' }, // default
    { a: '#FFC857', b: '#9C7BFF' }, // amber + violet
    { a: '#84CC8E', b: '#FF6B6B' }, // green + coral
    { a: '#7DD3C0', b: '#FF6B35' }, // teal + terracotta swap
  ];
  let idx = 0;
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  window.addEventListener('keydown', (e) => {
    if (e.key === seq[pos]) {
      pos++;
      if (pos === seq.length) {
        idx = (idx + 1) % palette.length;
        document.documentElement.style.setProperty('--accent', palette[idx].a);
        document.documentElement.style.setProperty('--accent-2', palette[idx].b);
        pos = 0;
      }
    } else {
      pos = 0;
    }
  });

  // -------------------------------------------------------------------
  // Console signature
  // -------------------------------------------------------------------
  console.log(
    '%c Haseeb Zafar — Senior Software Engineer ',
    'background:#FF6B35;color:#0E0D0B;font-weight:600;padding:6px 10px;border-radius:4px;font-family:monospace;'
  );
  console.log(
    '%c hand-rolled · no template · designed and built from scratch ',
    'color:#7DD3C0;font-family:monospace;padding:4px 0;'
  );
  console.log('%c → mailto:haseebzafar.dev@gmail.com', 'color:#8A847A;font-family:monospace;');
})();
