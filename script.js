/* Podes — smooth scroll, reveals, drawing, nav, lightbox, form.
   Fail-to-visible everywhere; the all-in hammer only fires if this file never ran. */
(function () {
  'use strict';

  window.__podesJS = true;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- smooth scroll (Lenis, lerp-based per approved config) ---------- */
  var lenis = null;
  if (!reduced && typeof Lenis === 'function') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(0);
  }

  /* anchor navigation works with or without Lenis */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -72 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------- year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- header scrolled state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- hero intro + parallax ---------- */
  var hero = document.querySelector('.hero');
  var heroMedia = document.querySelector('.hero-media');

  if (hero) {
    if (reduced) {
      hero.classList.add('hero-in');
    } else {
      /* let first paint land, then run the one-time intro; the timeout covers
         rAF starvation in background tabs */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { hero.classList.add('hero-in'); });
      });
      setTimeout(function () { hero.classList.add('hero-in'); }, 450);
    }
  }

  if (!reduced && heroMedia && window.matchMedia('(min-width: 1024px)').matches) {
    var heroImg = heroMedia.querySelector('img');
    heroMedia.classList.add('px');
    var pxTicking = false;
    function parallax() {
      pxTicking = false;
      var h = hero.offsetHeight || 1;
      var y = Math.min(Math.max(window.scrollY, 0), h);
      heroImg.style.transform = 'translate3d(0,' + (-(y / h) * 7).toFixed(2) + '%,0)';
    }
    window.addEventListener('scroll', function () {
      if (!pxTicking) { pxTicking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
    parallax();
  }

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      }
    });
  }

  /* ---------- reveals + drawing ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var act = document.querySelector('.act');
  var ioAlive = false;

  function showAll() {
    reveals.forEach(function (el) { el.classList.add('in'); });
    if (act) act.classList.add('drawn');
  }

  /* safety: reveal only what is on screen — a blanket showAll would erase
     every scroll animation below the fold before the user scrolls */
  function revealVisible() {
    var vh = window.innerHeight;
    reveals.forEach(function (el) {
      if (el.classList.contains('in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add('in');
    });
    if (act && !act.classList.contains('drawn')) {
      var ar = act.getBoundingClientRect();
      if (ar.top < vh && ar.bottom > 0) act.classList.add('drawn');
    }
  }

  if (reduced || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      ioAlive = true;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });

    if (act) {
      var actIo = new IntersectionObserver(function (entries) {
        ioAlive = true;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            act.classList.add('drawn');
            actIo.disconnect();
          }
        });
      }, { threshold: 0.35 });
      actIo.observe(act);
    }

    window.addEventListener('load', function () {
      setTimeout(function () { if (ioAlive) revealVisible(); else showAll(); }, 2500);
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) setTimeout(revealVisible, 600);
    });
  }

  /* ---------- gallery expand / collapse ---------- */
  var galleryEl = document.querySelector('.gallery');
  var moreBtn = document.querySelector('.gallery-more');
  if (galleryEl && moreBtn) {
    moreBtn.addEventListener('click', function () {
      var collapsed = galleryEl.classList.toggle('collapsed');
      moreBtn.setAttribute('aria-expanded', String(!collapsed));
      moreBtn.textContent = collapsed ? 'Rodyti visus darbus' : 'Suskleisti galeriją';
      if (collapsed) {
        var darbai = document.getElementById('darbai');
        if (lenis) lenis.scrollTo(darbai, { offset: -72 });
        else darbai.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      }
    });
  }

  /* ---------- mobile call bar ---------- */
  var callBar = document.querySelector('.call-bar');
  var contactEl = document.getElementById('kontaktai');
  if (callBar && hero && contactEl && 'IntersectionObserver' in window) {
    var heroVisible = true, contactVisible = false;
    function updateBar() {
      callBar.hidden = heroVisible || contactVisible;
    }
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting; updateBar();
    }, { threshold: 0.1 }).observe(hero);
    new IntersectionObserver(function (entries) {
      contactVisible = entries[0].isIntersecting; updateBar();
    }, { threshold: 0.05 }).observe(contactEl);
  }

  /* ---------- lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-cap');
  var items = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  var current = 0;

  function openLb(i) {
    current = (i + items.length) % items.length;
    var img = items[current].querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = items[current].getAttribute('data-cap') || '';
    if (lightbox.hidden) {
      lightbox.hidden = false;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { lightbox.classList.add('show'); });
      });
    }
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }
  function closeLb() {
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    setTimeout(function () { lightbox.hidden = true; }, 210);
  }

  if (lightbox && items.length) {
    items.forEach(function (item, i) {
      item.addEventListener('click', function () { openLb(i); });
    });
    lightbox.querySelector('.lb-close').addEventListener('click', closeLb);
    lightbox.querySelector('.lb-prev').addEventListener('click', function () { openLb(current - 1); });
    lightbox.querySelector('.lb-next').addEventListener('click', function () { openLb(current + 1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLb();
    });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') openLb(current - 1);
      if (e.key === 'ArrowRight') openLb(current + 1);
    });
  }

  /* ---------- form ---------- */
  var form = document.getElementById('quote-form');
  var status = document.getElementById('form-status');

  function setErr(name, msg) {
    var field = form.querySelector('[name="' + name + '"]').closest('.field');
    var err = field.querySelector('.err');
    field.classList.toggle('invalid', !!msg);
    if (err) err.textContent = msg || '';
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var message = form.message.value.trim();
      var ok = true;

      if (!name) { setErr('name', 'Įrašykite vardą'); ok = false; } else setErr('name', '');
      if (!phone || phone.replace(/\D/g, '').length < 8) {
        setErr('phone', 'Įrašykite telefono numerį'); ok = false;
      } else setErr('phone', '');
      if (!ok) return;

      var isPlaceholder = form.action.indexOf('your-form-id') !== -1;
      if (isPlaceholder) {
        var body = 'Vardas: ' + name + '\nTelefonas: ' + phone + (message ? '\n\n' + message : '');
        window.location.href = 'mailto:podessistemos@gmail.com'
          + '?subject=' + encodeURIComponent('Užklausa dėl pasiūlymo — ' + name)
          + '&body=' + encodeURIComponent(body);
        status.textContent = 'Atsidarys jūsų pašto programa — arba tiesiog paskambinkite +370 686 40272.';
        return;
      }

      status.textContent = 'Siunčiama…';
      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (r) {
        if (r.ok) {
          form.reset();
          status.textContent = 'Ačiū! Užklausą gavome — susisieksime artimiausiu metu.';
        } else { throw new Error(); }
      }).catch(function () {
        status.textContent = 'Nepavyko išsiųsti. Paskambinkite +370 686 40272.';
      });
    });
  }
})();
