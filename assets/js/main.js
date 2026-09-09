/* Shadab Hossain Shaikh : portfolio behaviour.
   No framework, no animation library: IntersectionObserver + CSS do the work. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Scroll reveals + doodle draw-in ─────────────────────── */
  var revealTargets = document.querySelectorAll(
    '.rv, .s-title, .drives h3, .cta__ul, .name-swoosh, .circled, .draw'
  );

  if (!('IntersectionObserver' in window) || reduced) {
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ── 2. Stat counters ───────────────────────────────────────── */
  var stats = document.getElementById('stats');
  if (stats) {
    var runCounters = function () {
      stats.querySelectorAll('[data-count]').forEach(function (n) {
        var target = parseFloat(n.dataset.count);
        var pre = n.dataset.prefix || '';
        var suf = n.dataset.suffix || '';
        if (reduced) { n.textContent = pre + target + suf; return; }
        var t0 = null, dur = 1300;
        var step = function (ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          n.textContent = pre + Math.round(target * eased) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { runCounters(); so.disconnect(); }
      }, { threshold: 0.4 });
      so.observe(stats);
    } else { runCounters(); }
  }

  /* ── 3. Header: stuck state + active section ────────────────── */
  var hdr = document.getElementById('hdr');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  var onScroll = function () {
    if (hdr) hdr.classList.toggle('stuck', window.scrollY > 12);
    var pos = window.scrollY + 140, current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s; });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 4. Mobile menu ─────────────────────────────────────────── */
  var burger = document.getElementById('burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mnav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mnav.classList.contains('open')) { setMenu(false); burger.focus(); }
    });
  }

  /* ── 5. Avatar: swap the sketch for a real portrait
     Set data-avatar-src on #avatar (see assets/img/README.md) and the photo
     replaces the placeholder illustration. Empty by default, so no 404. */
  var slot = document.getElementById('avatar');
  var sketch = document.getElementById('avatarSketch');
  var src = slot && slot.getAttribute('data-avatar-src');
  if (slot && sketch && src) {
    var photo = new Image();
    photo.alt = slot.getAttribute('data-avatar-alt') || '';
    photo.onload = function () { slot.insertBefore(photo, sketch); sketch.remove(); };
    photo.src = src;
  }

  /* ── 6. Contact form (Web3Forms, unchanged endpoint + key) ──── */
  var cf = document.getElementById('contactForm');
  if (cf) {
    var cfStatus = document.getElementById('cf-status');
    var cfSend = document.getElementById('cf-send');
    var sendLabel = cfSend.innerHTML;

    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!cf.checkValidity()) { cf.reportValidity(); return; }
      cfSend.disabled = true;
      cfSend.textContent = 'Sending…';
      cfStatus.className = 'cform-status';
      cfStatus.textContent = 'POST /message, awaiting ack…';

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: '9a1b343d-f256-44fd-b4b1-61449091fd56',
          name: cf.name.value.trim(),
          email: cf.email.value.trim(),
          message: cf.message.value.trim(),
          subject: 'Portfolio message from ' + cf.name.value.trim(),
          botcheck: cf.botcheck.checked,
          from_name: 'Portfolio Contact Form'
        })
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok || !res.d.success) throw new Error(res.d.message || 'failed');
          cfStatus.className = 'cform-status ok';
          cfStatus.textContent = '✓ Delivered. I usually reply the same day.';
          cf.reset();
          cfSend.textContent = 'Sent ✓';
          setTimeout(function () { cfSend.disabled = false; cfSend.innerHTML = sendLabel; }, 4000);
        })
        .catch(function () {
          cfStatus.className = 'cform-status err';
          cfStatus.innerHTML = '✗ Delivery failed. <a href="mailto:shaikhshadab.hossain@gmail.com">email me directly</a> instead.';
          cfSend.disabled = false;
          cfSend.innerHTML = sendLabel;
        });
    });
  }
})();
