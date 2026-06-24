/* =========================================================
   PODES — interactions
   Vanilla, dependency-free. Respects prefers-reduced-motion.
   ========================================================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- header scrolled state ---------- */
  var header = document.querySelector('.site-header');
  var onScrollHeader = function () {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    var setNav = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      if (open) { mobileNav.hidden = false; requestAnimationFrame(function () { mobileNav.classList.add('open'); }); }
      else { mobileNav.classList.remove('open'); mobileNav.hidden = true; }
      toggle.setAttribute('aria-label', open ? 'Uždaryti meniu' : 'Atidaryti meniu');
    };
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
  }

  /* ---------- reveal on scroll (staggered) ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    // stagger index among reveal siblings sharing a parent
    var seen = new Map();
    reveals.forEach(function (el) {
      var p = el.parentElement;
      var n = seen.get(p) || 0;
      el.dataset._idx = n;
      seen.set(p, n + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var idx = parseInt(e.target.dataset._idx || '0', 10);
          e.target.style.transitionDelay = Math.min(idx * 70, 420) + 'ms';
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- self-drawing aluminium frame ---------- */
  function setupFrame(sel) {
    var svg = document.querySelector(sel);
    if (!svg) return;
    var lines = svg.querySelectorAll('.fl');
    lines.forEach(function (ln) {
      var len = 0;
      try { len = ln.getTotalLength(); } catch (e) { len = 2000; }
      ln.style.strokeDasharray = len;
      ln.style.strokeDashoffset = reduce ? 0 : len;
      ln.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)';
    });
    if (reduce) return;
    var drawn = false;
    var draw = function () {
      if (drawn) return; drawn = true;
      lines.forEach(function (ln, i) {
        setTimeout(function () { ln.style.strokeDashoffset = 0; }, i * 180);
      });
    };
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { draw(); fio.disconnect(); } });
    }, { threshold: 0.25 });
    fio.observe(svg);
  }
  setupFrame('.hero-frame');
  setupFrame('.threshold-frame');

  /* ---------- subtle parallax (hero + threshold) ---------- */
  if (!reduce) {
    var pHero = document.querySelector('.hero-media img');
    var pThresh = document.querySelector('.threshold img');
    var ticking = false;
    var parallax = function () {
      ticking = false;
      if (pHero) {
        var hr = pHero.closest('.hero').getBoundingClientRect();
        if (hr.bottom > 0 && hr.top < window.innerHeight) {
          pHero.style.transform = 'translateY(' + (-hr.top * 0.12) + 'px) scale(1.06)';
        }
      }
      if (pThresh) {
        var tr = pThresh.closest('.threshold').getBoundingClientRect();
        if (tr.bottom > 0 && tr.top < window.innerHeight) {
          var prog = (tr.top - window.innerHeight) / (tr.height + window.innerHeight);
          pThresh.style.transform = 'translateY(' + (prog * 60) + 'px) scale(1.12)';
        }
      }
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
    parallax();
  }

  /* ---------- lightbox gallery ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  var lb = document.getElementById('lightbox');
  if (lb && items.length) {
    var lbImg = document.getElementById('lb-img');
    var lbCap = document.getElementById('lb-cap');
    var btnClose = lb.querySelector('.lb-close');
    var btnPrev = lb.querySelector('.lb-prev');
    var btnNext = lb.querySelector('.lb-next');
    var current = 0;
    var lastFocus = null;

    var show = function (i) {
      current = (i + items.length) % items.length;
      var it = items[current];
      lbImg.src = it.getAttribute('data-src');
      lbImg.alt = it.querySelector('img') ? it.querySelector('img').alt : '';
      lbCap.textContent = it.getAttribute('data-cap') || '';
    };
    var open = function (i) {
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      lb.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(function () { lb.classList.add('open'); });
      document.body.style.overflow = 'hidden';
      btnClose.focus();
    };
    var close = function () {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(function () { lb.hidden = true; lbImg.src = ''; }, 320);
      if (lastFocus) lastFocus.focus();
    };

    items.forEach(function (it, i) {
      it.setAttribute('tabindex', '0');
      it.setAttribute('role', 'button');
      it.setAttribute('aria-label', 'Atidaryti nuotrauką: ' + (it.getAttribute('data-cap') || ''));
      it.addEventListener('click', function () { open(i); });
      it.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { show(current - 1); });
    btnNext.addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- FAQ: subtle accessible accordion ---------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) {
        faqItems.forEach(function (o) { if (o !== d) o.open = false; });
      }
    });
  });

  /* ---------- contact form ---------- */
  var form = document.getElementById('quote-form');
  if (form) {
    var status = document.getElementById('form-status');
    var showErr = function (name, msg) {
      var input = form.querySelector('[name="' + name + '"]');
      var slot = form.querySelector('.err[data-for="' + name + '"]');
      if (slot) slot.textContent = msg || '';
      if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };
    var clearErrs = function () { ['name', 'phone', 'email'].forEach(function (n) { showErr(n, ''); }); };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrs();
      status.textContent = '';
      status.className = 'form-status';

      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var firstBad = null;

      if (!name) { showErr('name', 'Įveskite vardą.'); firstBad = firstBad || form.name; }
      if (!phone || phone.replace(/[^0-9]/g, '').length < 6) { showErr('phone', 'Įveskite telefono numerį.'); firstBad = firstBad || form.phone; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('email', 'Patikrinkite el. pašto adresą.'); firstBad = firstBad || form.email; }

      if (firstBad) { firstBad.focus(); return; }

      var action = form.getAttribute('action') || '';
      var configured = action.indexOf('formspree.io') !== -1 && action.indexOf('your-form-id') === -1;

      if (configured) {
        status.textContent = 'Siunčiama…';
        fetch(action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        }).then(function (r) {
          if (r.ok) {
            form.reset();
            status.textContent = 'Ačiū! Gavome jūsų užklausą ir netrukus susisieksime.';
            status.classList.add('ok');
          } else { throw new Error('bad'); }
        }).catch(function () {
          mailtoFallback(name, phone, email, message);
        });
      } else {
        mailtoFallback(name, phone, email, message);
      }
    });

    function mailtoFallback(name, phone, email, message) {
      var subject = 'Užklausa iš svetainės — ' + name;
      var body = 'Vardas: ' + name + '\nTelefonas: ' + phone +
        (email ? '\nEl. paštas: ' + email : '') +
        '\n\nApie objektą:\n' + (message || '—');
      window.location.href = 'mailto:podessistemos@gmail.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status.textContent = 'Atidaromas el. laiškas. Greičiausias kelias — skambutis: +370 686 40272.';
      status.classList.add('ok');
    }
  }
})();
