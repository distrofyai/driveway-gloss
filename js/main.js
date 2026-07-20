/* =====================================================
   Driveway Gloss main.js
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

  // Hide-on-scroll-down / show-on-scroll-up (mobile only)
  const hideNavMq = window.matchMedia('(max-width: 720px)');
  const HIDE_AFTER = 80;        // don't hide until past the top region
  const DELTA = 6;              // ignore tiny scroll jitters
  let lastY = window.scrollY;

  const onScroll = () => {
    if (!nav) return;

    const y = window.scrollY;

    if (y > SCROLL_THRESHOLD) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }

    // Direction-based show/hide, mobile only, and never while the menu is open
    const navLinks = document.getElementById('nav-links');
    const menuOpen = navLinks && navLinks.classList.contains('is-open');
    if (hideNavMq.matches && !menuOpen) {
      const diff = y - lastY;
      if (Math.abs(diff) > DELTA) {
        if (diff > 0 && y > HIDE_AFTER) {
          nav.classList.add('is-hidden');   // scrolling down
        } else {
          nav.classList.remove('is-hidden'); // scrolling up
        }
        lastY = y;
      }
    } else {
      nav.classList.remove('is-hidden');
      lastY = y;
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
    nav && nav.classList.remove('is-hidden');
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
  // Upgrades starts collapsed at every width. It used to open automatically
  // above 768px, which put a long optional list between the packages and the
  // name/phone fields people actually came to fill in. No resize listener
  // either: re-syncing on resize would snap it shut under someone mid-read.
  document.querySelectorAll('.quote-form .form-accordion').forEach((accordion) => {
    accordion.open = false;
  });

  // ---------- Single-select button groups (Individual Services + Packages) ----------
  // Checkboxes (not radios) so a second click can clear the selection,
  // while still allowing only one choice per group.
  document.querySelectorAll('.quote-form .radio-group').forEach((group) => {
    const boxes = group.querySelectorAll('input[type="checkbox"]');
    boxes.forEach((box) => {
      box.addEventListener('change', () => {
        if (box.checked) {
          boxes.forEach((other) => {
            if (other !== box) other.checked = false;
          });
        }
      });
    });
  });

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
      // threshold:0 fires as soon as any part of the element crosses the
      // boundary. The previous 0.12 required 12% of the element to be visible
      // at once, which an element taller than the viewport can never satisfy:
      // a 4000px-tall grid in a 900px viewport peaks at an intersection ratio
      // of about 0.22 only if fully spanning, and long containers sat well
      // under 0.12 and never revealed at all. The negative bottom margin keeps
      // the reveal from firing until the element is properly on screen.
      threshold: 0,
      rootMargin: '0px 0px -10% 0px',
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
    const track = root.querySelector('.base-services, .ba-grid, .steps, .sv-tier-list');
    const noWrap = root.hasAttribute('data-no-wrap');
    const prevBtn = root.querySelector('.base-carousel__arrow--prev');
    const nextBtn = root.querySelector('.base-carousel__arrow--next');
    const dots = Array.from(root.querySelectorAll('.base-carousel__dot'));
    if (!track) return;
    const cards = Array.from(track.children);
    if (!cards.length) return;

    const carouselMq = window.matchMedia('(max-width: 720px)');
    let index = cards.findIndex((c) => c.classList.contains('base-card--featured') || c.classList.contains('ba-card--featured') || c.classList.contains('sv-tier--featured'));
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
      if (prevBtn) prevBtn.disabled = noWrap && index === 0;
      if (nextBtn) nextBtn.disabled = noWrap && index === cards.length - 1;
    };

    const wrap = (i) => ((i % cards.length) + cards.length) % cards.length;
    const clamp = (i) => Math.max(0, Math.min(cards.length - 1, i));
    const goTo = (i) => {
      index = noWrap ? clamp(i) : wrap(i);
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
        goTo(dx < 0 ? index + 1 : index - 1);
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

  // ---------- Before/After comparison slider (drag to reveal) ----------
  // Mechanics ported from the Benny's Pressure Washing slider, which is smooth:
  // write the styles synchronously in the move handler, straight onto the two
  // elements that change, and listen for mousemove on window so the drag keeps
  // tracking when the cursor leaves the frame. No requestAnimationFrame: the
  // browser already fires one move event per frame while dragging, so
  // coalescing only added a frame of latency behind the cursor. No custom
  // property either, since writing one on the container restyles every
  // descendant that could read it.
  document.querySelectorAll('[data-ba-compare]').forEach((el) => {
    const beforeImg = el.querySelector('.ba-compare__img--before');
    const handle = el.querySelector('.ba-compare__handle');
    if (!beforeImg) return;

    let pos = 50;

    const apply = (p) => {
      pos = p < 0 ? 0 : p > 100 ? 100 : p;
      const clip = 'inset(0 ' + (100 - pos) + '% 0 0)';
      beforeImg.style.clipPath = clip;
      beforeImg.style.webkitClipPath = clip;
      if (handle) handle.style.left = pos + '%';
      el.setAttribute('aria-valuenow', Math.round(pos));
    };

    const fromClientX = (clientX) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width) return;
      apply(((clientX - rect.left) / rect.width) * 100);
    };

    // ----- Mouse -----
    let dragging = false;
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      dragging = true;
      fromClientX(e.clientX);
    });
    window.addEventListener('mousemove', (e) => { if (dragging) fromClientX(e.clientX); });
    window.addEventListener('mouseup', () => { dragging = false; });

    // ----- Touch -----
    // Page scrolling wins unless the gesture is clearly sideways, so a vertical
    // swipe that happens to start on the slider still scrolls the page.
    let startX = null;
    let startY = null;
    let touchDragging = false;
    el.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      touchDragging = false;
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
      if (startX === null) return;
      const t = e.touches[0];
      if (!touchDragging) {
        const dx = Math.abs(t.clientX - startX);
        const dy = Math.abs(t.clientY - startY);
        if (dy > dx) { startX = null; return; }  // vertical intent: let it scroll
        if (dx < 6) return;                      // not decisive yet
        touchDragging = true;
      }
      if (e.cancelable) e.preventDefault();
      fromClientX(t.clientX);
    }, { passive: false });
    const endTouch = () => { startX = null; touchDragging = false; };
    el.addEventListener('touchend', endTouch);
    el.addEventListener('touchcancel', endTouch);

    // ----- Keyboard -----
    el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); apply(pos - 4); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); apply(pos + 4); }
    });

    apply(50);
  });

  /* ---------- Gallery lightbox ----------
     Gallery tiles are anchors to contact.html, which stays the no-JS fallback.
     With JS we intercept the click and open a preview instead, and carry the
     quote link into the preview so the original path to contact is not lost. */
  (function () {
    const tiles = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
    if (!tiles.length) return;

    let box, imgEl, capEl, countEl, prevBtn, nextBtn;
    let shown = [];          // tiles actually visible, resolved at open time
    let index = 0;
    let lastFocused = null;

    const build = () => {
      box = document.createElement('div');
      box.className = 'lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', 'Photo preview');
      box.innerHTML =
        '<button class="lightbox__close" type="button" aria-label="Close preview">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
        '</button>' +
        '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photo">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
        '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next photo">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
        '<figure class="lightbox__stage">' +
          '<img class="lightbox__img" alt="" />' +
          '<figcaption class="lightbox__cap">' +
            '<span class="lightbox__count"></span>' +
            '<span class="lightbox__text"></span>' +
            '<a class="lightbox__cta" href="contact.html">Get a quote</a>' +
          '</figcaption>' +
        '</figure>';
      document.body.appendChild(box);

      imgEl = box.querySelector('.lightbox__img');
      capEl = box.querySelector('.lightbox__text');
      countEl = box.querySelector('.lightbox__count');
      prevBtn = box.querySelector('.lightbox__nav--prev');
      nextBtn = box.querySelector('.lightbox__nav--next');

      box.querySelector('.lightbox__close').addEventListener('click', close);
      prevBtn.addEventListener('click', () => step(-1));
      nextBtn.addEventListener('click', () => step(1));
      // Backdrop only: clicks on the image, caption or controls must not close.
      box.addEventListener('click', (e) => { if (e.target === box) close(); });
    };

    const render = () => {
      const src = shown[index].querySelector('img');
      if (!src) return;
      imgEl.src = src.currentSrc || src.src;
      imgEl.alt = src.alt || '';
      capEl.textContent = src.alt || '';
      countEl.textContent = (index + 1) + ' / ' + shown.length;
      const many = shown.length > 1;
      prevBtn.hidden = !many;
      nextBtn.hidden = !many;
    };

    const step = (delta) => {
      index = (index + delta + shown.length) % shown.length;
      render();
    };

    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };

    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.removeEventListener('keydown', onKey);
      if (lastFocused) lastFocused.focus();
    }

    const open = (tile) => {
      if (!box) build();
      // Resolved per open: the home page hides tiles past the third on mobile,
      // and the gallery hides everything past the twelfth until expanded, so
      // the preview should only step through what is actually on screen.
      shown = tiles.filter((t) => t.offsetParent !== null);
      index = shown.indexOf(tile);
      if (index < 0) { shown = tiles; index = tiles.indexOf(tile); }
      lastFocused = document.activeElement;
      render();
      box.classList.add('is-open');
      // Hiding the scrollbar reclaims its width and shifts the centred layout
      // sideways, which is visible the moment the overlay closes. Pad the body
      // by exactly the width that disappeared.
      const barWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (barWidth > 0) document.body.style.paddingRight = barWidth + 'px';
      document.addEventListener('keydown', onKey);
      box.querySelector('.lightbox__close').focus();
    };

    tiles.forEach((tile) => {
      tile.addEventListener('click', (e) => {
        if (!tile.querySelector('img')) return;
        // Let modifier and middle clicks through: these are real anchors, and
        // people expect ctrl/cmd-click on a photo grid to open a new tab.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        open(tile);
      });
    });
  })();

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

  // ---------- Sticky "Free Quote" call bar (mobile) ----------
  (function () {
    const bar = document.getElementById('stickyCall');
    if (!bar) return;

    const KEY = 'sticky-call-dismissed';
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(KEY) === '1'; } catch (e) {}

    // The head script already hides it instantly if pre-dismissed; otherwise
    // slide it up on load. Double rAF lets the browser register the off-screen
    // start state before the transition runs, so the slide actually animates.
    if (!dismissed && !document.documentElement.classList.contains('sticky-call-pre-dismissed')) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { bar.classList.add('is-visible'); });
      });
    }

    const closeBtn = document.getElementById('stickyCallClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        bar.classList.remove('is-visible');
        bar.classList.add('is-dismissed'); // slides down + disables pointer events
        try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
      });
    }
  })();

  /* ---------- "Show more" collapsers (mobile) ----------
     The collapse is applied here rather than in the stylesheet so that with
     JavaScript disabled the full list renders and the button never appears.
     CSS only hides the overflow while .is-collapsed is present, and only
     inside the mobile media query, so this is a no-op on desktop. */
  function setupCollapser(opts) {
    const list = document.getElementById(opts.listId);
    const btn = document.getElementById(opts.btnId);
    if (!list || !btn) return;

    const total = list.querySelectorAll(opts.itemSelector).length;
    if (total <= opts.visible) return;

    const hiddenCount = total - opts.visible;
    const moreLabel = 'Show ' + hiddenCount + ' more ' + opts.noun;
    list.classList.add('is-collapsed');
    btn.textContent = moreLabel;
    btn.hidden = false;

    btn.addEventListener('click', function () {
      const collapsed = list.classList.toggle('is-collapsed');
      btn.setAttribute('aria-expanded', String(!collapsed));
      btn.textContent = collapsed ? moreLabel : 'Show fewer ' + opts.noun;
      if (collapsed) {
        // Collapsing from far down the list would strand the viewport below
        // it, so bring the section heading back into view.
        const anchor = document.getElementById(opts.anchorId);
        if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  setupCollapser({
    listId: 'galleryGrid', btnId: 'galleryMore', itemSelector: '.gallery__item',
    visible: 12, noun: 'photos', anchorId: 'recent-work'
  });
  setupCollapser({
    listId: 'testimonialGrid', btnId: 'testimonialsMore', itemSelector: '.testimonial',
    visible: 4, noun: 'reviews', anchorId: 'testimonials'
  });

})();
