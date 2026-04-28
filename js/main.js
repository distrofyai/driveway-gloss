/* =====================================================
   Driveway Gloss — main.js
   - Sticky nav scroll state
   - Mobile nav toggle
   - Hero video: desktop autoplay, mobile tap-to-play (data-aware)
   - Reveal-on-scroll via IntersectionObserver
   - Footer year
   ===================================================== */

(function () {
  'use strict';

  // ---------- Footer year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Sticky nav: add solid background after scrolling ----------
  const nav = document.getElementById('nav');
  const SCROLL_THRESHOLD = 24;

  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Mobile nav toggle ----------
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  const closeMenu = () => {
    if (!toggle || !links) return;
    toggle.classList.remove('is-open');
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    if (!toggle || !links) return;
    toggle.classList.add('is-open');
    links.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });

    // Close menu when a nav link is tapped
    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (links.classList.contains('is-open')) closeMenu();
      });
    });

    // Close on Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('is-open')) closeMenu();
    });

    // Close if viewport grows past mobile breakpoint while menu open
    const mq = window.matchMedia('(min-width: 721px)');
    const onMqChange = (e) => { if (e.matches) closeMenu(); };
    if (mq.addEventListener) mq.addEventListener('change', onMqChange);
    else if (mq.addListener) mq.addListener(onMqChange);
  }

  // ---------- Mobile quote accordions ----------
  const quoteAccordions = document.querySelectorAll('.quote-form .form-accordion');
  if (quoteAccordions.length) {
    const accordionMq = window.matchMedia('(max-width: 768px)');
    const syncQuoteAccordions = (e) => {
      quoteAccordions.forEach((accordion) => {
        accordion.open = !e.matches;
      });
    };

    syncQuoteAccordions(accordionMq);
    if (accordionMq.addEventListener) accordionMq.addEventListener('change', syncQuoteAccordions);
    else if (accordionMq.addListener) accordionMq.addListener(syncQuoteAccordions);
  }

  // ---------- Hero video ----------
  // Desktop & wifi: autoplay muted+looped.
  // Mobile or Save-Data: keep poster image, show a play button. Tap to start.
  const hero = document.getElementById('hero');
  const heroVideo = document.getElementById('hero-video');
  const heroPlayBtn = document.getElementById('hero-video-play');

  if (hero && heroVideo && heroPlayBtn) {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = !!(conn && conn.saveData);
    const slowConn = !!(conn && /^(2g|slow-2g)$/.test(conn.effectiveType || ''));
    const isMobile = window.matchMedia('(max-width: 720px)').matches;

    const startVideo = () => {
      const playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => { hero.classList.remove('is-mobile-paused'); })
          .catch(() => { hero.classList.add('is-mobile-paused'); });
      }
    };

    const showPoster = () => {
      hero.classList.add('is-mobile-paused');
    };

    if (isMobile || saveData || slowConn) {
      // Don't burn cellular data — show poster + play button
      heroVideo.removeAttribute('autoplay');
      showPoster();
    } else {
      // Desktop on a reasonable connection — autoplay
      startVideo();
    }

    heroPlayBtn.addEventListener('click', () => {
      startVideo();
    });
  }

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    });

    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: just show everything
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Smooth scroll polish ----------
  // CSS handles smooth-scroll for anchor jumps. We just need to compensate
  // for the sticky nav so anchors don't land underneath it.
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({
        top,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
  });
})();
