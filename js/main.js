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
  // Always try to autoplay (muted + playsinline = allowed on iOS/Android).
  // If the browser blocks it, show the play button as a fallback.
  const hero = document.getElementById('hero');
  const heroVideo = document.getElementById('hero-video');
  const heroPlayBtn = document.getElementById('hero-video-play');

  if (hero && heroVideo && heroPlayBtn) {
    const startVideo = () => {
      const playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => { hero.classList.remove('is-mobile-paused'); })
          .catch(() => { hero.classList.add('is-mobile-paused'); });
      }
    };

    startVideo();

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

  // ---------- Quote form: post to Google Apps Script ----------
  // Replace the placeholder below with the Web App URL from your Apps Script deployment.
  // It looks like: https://script.google.com/macros/s/AKfyc.../exec
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw-Pu41dKIKoZVqfXkESTixVQfUuve4qBUCBCfNl8DSiVE5FQiqIe-sCYJVC-lG6xBD/exec';

  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    // Capture user agent for the Sheet
    const uaInput = document.createElement('input');
    uaInput.type = 'hidden';
    uaInput.name = '_ua';
    uaInput.value = navigator.userAgent;
    quoteForm.appendChild(uaInput);

    const submitBtn = quoteForm.querySelector('button[type="submit"]');
    const successEl = quoteForm.querySelector('.form__success');
    const errorEl = quoteForm.querySelector('.form__error');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';

    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Open collapsed accordions so validation messages are visible
      quoteForm.querySelectorAll('details').forEach((d) => d.open = true);

      if (!quoteForm.checkValidity()) {
        quoteForm.reportValidity();
        return;
      }

      if (successEl) successEl.hidden = true;
      if (errorEl) errorEl.hidden = true;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      if (FORM_ENDPOINT.startsWith('PASTE_')) {
        console.warn('Form endpoint not configured. See main.js FORM_ENDPOINT.');
        if (errorEl) errorEl.hidden = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
        return;
      }

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: new FormData(quoteForm),
        });
        if (!response.ok) throw new Error('Bad response: ' + response.status);
        if (successEl) successEl.hidden = false;
        quoteForm.reset();
      } catch (err) {
        console.error('Form submit failed:', err);
        if (errorEl) errorEl.hidden = false;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }

  // ---------- Mobile carousels (base packages + before/after) ----------
  const initCarousel = (root) => {
    const track = root.querySelector('.base-services, .ba-grid');
    const prevBtn = root.querySelector('.base-carousel__arrow--prev');
    const nextBtn = root.querySelector('.base-carousel__arrow--next');
    const dots = Array.from(root.querySelectorAll('.base-carousel__dot'));
    if (!track) return;
    const cards = Array.from(track.children);
    if (!cards.length) return;

    const carouselMq = window.matchMedia('(max-width: 720px)');
    let index = cards.findIndex((c) => c.classList.contains('base-card--featured') || c.classList.contains('ba-card--featured'));
    if (index < 0) index = 0;

    const layout = () => {
      if (!carouselMq.matches) {
        // Desktop: clear inline state
        track.style.transform = '';
        cards.forEach((c) => c.classList.remove('is-active'));
        return;
      }
      const card = cards[index];
      if (!card) return;
      const containerCenter = root.clientWidth / 2;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const offset = containerCenter - cardCenter;
      track.style.setProperty('--offset', offset + 'px');

      cards.forEach((c, i) => c.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => {
        const active = i === index;
        d.classList.toggle('is-active', active);
        if (active) d.setAttribute('aria-selected', 'true');
        else d.removeAttribute('aria-selected');
      });
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= cards.length - 1;
    };

    const goTo = (i) => {
      index = Math.max(0, Math.min(cards.length - 1, i));
      layout();
    };

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    // Touch swipe
    let startX = null;
    let startY = null;
    let dragging = false;
    track.addEventListener('touchstart', (e) => {
      if (!carouselMq.matches) return;
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY; dragging = true;
    }, { passive: true });
    track.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const t = e.touches[0];
      if (Math.abs(t.clientX - startX) > Math.abs(t.clientY - startY) + 4) {
        // horizontal intent
      }
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (!dragging) return;
      dragging = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goTo(index + 1); else goTo(index - 1);
      }
    });

    // Recompute on resize / breakpoint changes / image load
    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    if (carouselMq.addEventListener) carouselMq.addEventListener('change', onResize);
    root.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', onResize, { once: true });
    });

    if (document.readyState === 'complete') layout();
    else window.addEventListener('load', layout, { once: true });
    // Initial sync immediately too so CSS variable applies on first paint
    layout();
  };

  document.querySelectorAll('[data-base-carousel]').forEach(initCarousel);

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
