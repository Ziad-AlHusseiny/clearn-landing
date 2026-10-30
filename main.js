/* Clearn landing page: language switch, the live demo question, and the scroll animations (GSAP + ScrollTrigger).
   Without JavaScript, or with "reduce motion", the page is complete and static — the animations only add to it. */
(function () {
  'use strict';

  var root = document.documentElement;
  var DICT = window.CLEARN_I18N;
  var Q = window.CLEARN_QUESTION;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var mm = null;
  var compareTween = null;

  function lang() { return root.lang === 'ar' ? 'ar' : 'en'; }
  function t(key) { return DICT[lang()][key]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  /* ---------- Words → spans, for the reveal effects (keeps <mark>, <em> and <br>) ---------- */
  function splitWords(el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            var wi = document.createElement('span');
            w.className = 'w';
            wi.className = 'wi';
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    })(el);
  }

  /* ---------- The live question (os-l05-q002) ---------- */
  var quiz = {
    card: $('[data-quiz]'),
    picked: null,
    qlang: 'en',
    render: function (focusSel) {
      if (!this.card) return;
      var self = this;
      var ql = this.qlang;
      var done = this.picked !== null;
      var right = this.picked === Q.answer;
      var ui = lang();
      var h = '<div class="q-top"><span class="q-tag mono">CORE · MCQ</span><span class="q-src mono">' + esc(Q.source) + '</span>' +
        '<button type="button" class="q-translate" aria-pressed="' + (ql === 'ar') + '">' + esc(t(ql === 'ar' ? 'try.toEn' : 'try.toAr')) + '</button></div>' +
        '<div class="q-content" lang="' + ql + '" dir="' + (ql === 'ar' ? 'rtl' : 'ltr') + '">' +
        '<p class="q-stem" id="q-stem">' + esc(Q.stem[ql]) + '</p>' +
        '<div class="q-options" role="group" aria-labelledby="q-stem">';
      Q.options.forEach(function (o, i) {
        var cls = 'q-opt';
        var badge = '';
        if (done) {
          if (o.id === Q.answer) { cls += ' is-right'; badge = t('try.right'); }
          else if (o.id === self.picked) { cls += ' is-wrong'; badge = t('try.yours'); }
          else cls += ' is-dim';
        }
        h += '<button type="button" class="' + cls + '" data-id="' + o.id + '"' +
          (done ? ' aria-disabled="true"' : '') + (o.id === self.picked ? ' aria-pressed="true"' : '') + '>' +
          '<span class="q-letter" aria-hidden="true">' + 'ABCD'.charAt(i) + '</span>' +
          '<span class="q-body"><span class="q-text">' + esc(o.text[ql]) + '</span>' +
          (done ? '<span class="q-why">' + esc(o.why[ql]) + '</span>' : '') + '</span>' +
          (badge ? '<span class="q-badge" lang="' + ui + '">' + esc(badge) + '</span>' : '') +
          '</button>';
      });
      h += '</div>';
      if (done) {
        h += '<div class="q-feedback ' + (right ? 'ok' : 'no') + '"><strong lang="' + ui + '"><bdi>' + esc(t(right ? 'try.correct' : 'try.wrong')) + '</bdi></strong>' +
          esc(Q.explanation[ql]) + '</div>';
      }
      h += '</div><div class="q-foot">' + (done ? '<button type="button" class="q-reset">' + esc(t('try.again')) + '</button>' : '') + '</div>';
      h += '<p class="sr-only" aria-live="polite" data-live></p>';
      this.card.innerHTML = h;
      if (focusSel) {
        var f = this.card.querySelector(focusSel);
        if (f) f.focus({ preventScroll: true });
      }
    },
  };

  if (quiz.card) {
    quiz.card.addEventListener('click', function (e) {
      var el = e.target.closest('button');
      if (!el) return;
      if (el.classList.contains('q-translate')) {
        quiz.qlang = quiz.qlang === 'ar' ? 'en' : 'ar';
        quiz.render('.q-translate');
      } else if (el.classList.contains('q-reset')) {
        quiz.picked = null;
        quiz.render('.q-opt');
      } else if (el.classList.contains('q-opt') && quiz.picked === null) {
        quiz.picked = el.getAttribute('data-id');
        quiz.render('.q-opt[data-id="' + quiz.picked + '"]');
        var right = quiz.picked === Q.answer;
        var live = quiz.card.querySelector('[data-live]');
        setTimeout(function () { if (live) live.textContent = t(right ? 'try.correct' : 'try.wrong') + ' ' + Q.explanation[quiz.qlang]; }, 60);
        if (gsap && root.classList.contains('fx')) {
          gsap.fromTo(quiz.card.querySelector('.q-opt.is-right'), { scale: .97 }, { scale: 1, duration: .6, ease: 'back.out(3)' });
          if (!right) gsap.fromTo(quiz.card.querySelector('.q-opt.is-wrong'), { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' });
        }
      }
    });
  }

  /* ---------- Language ---------- */
  function applyLang(next) {
    var d = DICT[next];
    root.lang = next;
    root.dir = next === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach(function (el) {
      var v = d[el.getAttribute('data-i18n')];
      if (v != null) el.innerHTML = v;
    });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        if (d[p[1]] != null) el.setAttribute(p[0], d[p[1]]);
      });
    });
    $$('img[data-src-ar]').forEach(function (img) {
      if (!img.getAttribute('data-src-en')) img.setAttribute('data-src-en', img.getAttribute('src'));
      var src = next === 'ar' ? img.getAttribute('data-src-ar') : img.getAttribute('data-src-en');
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    });
    document.title = d['meta.title'];
    $$('[data-split]').forEach(splitWords);
    quiz.render();
    root.classList.remove('i18n-pending');
  }

  var toggle = $('[data-lang-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = lang() === 'ar' ? 'en' : 'ar';
      try { localStorage.setItem('clearn-landing:lang', next); } catch (e) { /* private mode: the choice just isn't remembered */ }
      try {
        var url = new URL(location.href);
        if (url.searchParams.has('lang')) { url.searchParams.set('lang', next); history.replaceState(null, '', url); }
      } catch (e) { /* old browser: leave the URL alone */ }
      if (mm) mm.revert();
      applyLang(next);
      startMotion();
    });
  }

  /* ---------- Nav state + scroll progress (no library needed) ---------- */
  var nav = $('.nav');
  var bar = $('.progress span');
  var nights = $$('[data-night]');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    var probe = nav.offsetHeight / 2;
    nav.classList.toggle('is-scrolled', y > 12);
    nav.classList.toggle('is-night', nights.some(function (n) { var r = n.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);

  /* In-page links scroll smoothly (CSS smooth scrolling would fight ScrollTrigger's pinning). */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip')) return;
    var id = a.getAttribute('href');
    var target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------- Compare slider (drag, keys, and scroll) ---------- */
  var cmp = $('[data-compare]');
  if (cmp) {
    var dragging = false;
    var setSplit = function (pct) {
      pct = Math.max(0, Math.min(100, pct));
      cmp.style.setProperty('--split', pct + '%');
      cmp.setAttribute('aria-valuenow', Math.round(pct));
    };
    var stopScrollTween = function () {
      if (!compareTween) return;
      if (compareTween.scrollTrigger) compareTween.scrollTrigger.kill();
      compareTween.kill();
      compareTween = null;
    };
    var fromPointer = function (e) {
      var r = cmp.querySelector('.phone-screen').getBoundingClientRect();
      setSplit(((e.clientX - r.left) / r.width) * 100);
    };
    cmp.addEventListener('pointerdown', function (e) {
      dragging = true;
      stopScrollTween();
      if (cmp.setPointerCapture) cmp.setPointerCapture(e.pointerId);
      fromPointer(e);
    });
    cmp.addEventListener('pointermove', function (e) { if (dragging) fromPointer(e); });
    ['pointerup', 'pointercancel'].forEach(function (ev) { cmp.addEventListener(ev, function () { dragging = false; }); });
    cmp.addEventListener('keydown', function (e) {
      var now = parseFloat(cmp.getAttribute('aria-valuenow')) || 50;
      var step = { ArrowLeft: -10, ArrowRight: 10, ArrowDown: -10, ArrowUp: 10, Home: -100, End: 100 }[e.key];
      if (step === undefined) return;
      e.preventDefault();
      stopScrollTween();
      setSplit(now + step);
    });
  }

  /* ---------- Scroll animations ---------- */
  function startMotion() {
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 961px)' }, function (ctx) {
      if (!ctx.conditions.motion) return undefined;
      var wide = ctx.conditions.wide;
      var sx = root.dir === 'rtl' ? -1 : 1;
      root.classList.add('fx');

      /* Hero intro (plays once on load) */
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero .eyebrow', { y: 20, opacity: 0, duration: .9 })
        .from('.hero-title .wi', { yPercent: 118, duration: 1.25, stagger: .07 }, '<.05')
        .fromTo('.hero-title mark', { '--hl': '0%' }, { '--hl': '100%', duration: .9, ease: 'power3.inOut' }, '-=.55')
        .from('.hero-sub, .hero-ctas', { y: 26, opacity: 0, duration: 1, stagger: .1 }, '-=1.05')
        .from('.hero-stage', { y: 140, opacity: 0, duration: 1.6 }, '-=1.1')
        .from('.float-chip', { scale: .5, opacity: 0, duration: .8, stagger: .12, ease: 'back.out(2.2)' }, '-=.9');

      /* Hero scroll: the laptop tilts flat and grows, the phone and chips drift at their own speeds */
      gsap.fromTo('.laptop', { rotateX: 15, scale: wide ? .93 : .96 }, {
        rotateX: 0, scale: wide ? 1.06 : 1, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: function () { return '+=' + window.innerHeight * .75; }, scrub: .8, invalidateOnRefresh: true },
      });
      var heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 };
      gsap.to('.hero-phone', { yPercent: -24, ease: 'none', scrollTrigger: heroST });
      gsap.to('.chip-src', { y: -140, ease: 'none', scrollTrigger: heroST });
      gsap.to('.chip-streak', { y: -220, ease: 'none', scrollTrigger: heroST });
      gsap.to('.chip-ok', { y: -90, ease: 'none', scrollTrigger: heroST });
      gsap.to('.hero-copy', { y: -70, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '45% top', scrub: true } });

      /* Subjects marquee: endless loop that speeds up with the scroll */
      var row = $('.marquee-row');
      Array.prototype.slice.call(row.children).forEach(function (c) {
        var k = c.cloneNode(true);
        k.setAttribute('aria-hidden', 'true');
        k.setAttribute('data-clone', '');
        row.appendChild(k);
      });
      var loop = gsap.to(row, { xPercent: -50, repeat: -1, duration: 42, ease: 'none' });
      ScrollTrigger.create({
        trigger: '.marquee', start: 'top bottom', end: 'bottom top',
        onUpdate: function (self) {
          var boost = 1 + Math.min(Math.abs(self.getVelocity()) / 220, 7);
          gsap.to(loop, { timeScale: boost, duration: .2, overwrite: true, onComplete: function () { gsap.to(loop, { timeScale: 1, duration: 1.2 }); } });
        },
      });

      /* Clear it → Learn it → Earn it: pinned, the phone screen wipes to the next step */
      var titles = $$('.how-title');
      var paras = $$('.how-paras p');
      var screens = $$('.how-screen');
      var fills = $$('.how-bars i');
      gsap.set(titles.slice(1), { opacity: .16 });
      gsap.set(paras.slice(1), { opacity: 0, y: 26 });
      gsap.set(fills, { scaleY: 0 });
      var how = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: { trigger: '.how', start: 'top top', end: '+=230%', pin: true, scrub: .7, anticipatePin: 1 },
      });
      how.to(fills[0], { scaleY: 1, duration: 1, ease: 'none' });
      [1, 2].forEach(function (i) {
        var at = 'step' + i;
        how.addLabel(at)
          .to(titles[i - 1], { opacity: .16, duration: .5 }, at)
          .to(titles[i], { opacity: 1, duration: .5 }, at)
          .to(paras[i - 1], { opacity: 0, y: -26, duration: .4 }, at)
          .to(paras[i], { opacity: 1, y: 0, duration: .5 }, at + '+=.2')
          .fromTo(screens[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .8 }, at)
          .to(screens[i - 1], { scale: .9, opacity: .3, duration: .8 }, at)
          .to(fills[i], { scaleY: 1, duration: 1, ease: 'none' });
      });

      /* Statement: words light up as you read */
      gsap.fromTo('.statement-text .wi', { opacity: .13 }, {
        opacity: 1, stagger: .08, ease: 'none',
        scrollTrigger: { trigger: '.statement-text', start: 'top 80%', end: 'bottom 45%', scrub: .5 },
      });

      /* Proof: the window tilts up, then zooms into the L04 · p.5 chip (pinned on wide screens) */
      gsap.fromTo('.proof-browser', { rotateX: 22, y: 90, scale: .9, transformPerspective: 1600, transformOrigin: '50% 0%' }, {
        rotateX: 0, y: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.proof-stage', start: 'top 98%', end: 'top 40%', scrub: .6 },
      });
      gsap.set(['.proof-ring', '.proof-call', '.proof-card'], { opacity: 0 });
      gsap.timeline({
        scrollTrigger: wide
          ? { trigger: '.proof-stage', start: 'center 54%', end: '+=120%', pin: '.proof', scrub: .7, anticipatePin: 1 }
          : { trigger: '.proof-stage', start: 'top 55%', end: 'bottom 25%', scrub: .7 },
      })
        .to('.proof-zoom', { scale: wide ? 2.3 : 1.9, duration: 1, ease: 'power2.inOut' })
        .to('.proof-ring', { opacity: 1, duration: .2 }, '-=.3')
        .fromTo('.proof-ring', { scale: 1.7 }, { scale: 1, duration: .35, ease: 'back.out(2)' }, '<')
        .to('.proof-call', { opacity: 1, duration: .01 })
        .fromTo('.proof-line', { scaleX: 0 }, { scaleX: 1, duration: .25, ease: 'power2.out' })
        .fromTo('.proof-card', { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: .35, ease: 'power3.out' }, '-=.05')
        .to({}, { duration: .45 });

      /* Night panels open from a rounded card to full width */
      nights.forEach(function (n) {
        gsap.fromTo(n, { clipPath: 'inset(0% 3% 0% 3% round 44px)' }, {
          clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
          scrollTrigger: { trigger: n, start: 'top bottom', end: 'top 25%', scrub: true },
        });
      });

      /* Live question card */
      gsap.from('.qcard', { y: 90, opacity: 0, rotate: 2 * sx, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.qcard', start: 'top 88%' } });

      /* Numbers: cards rise, values count up */
      $$('.num').forEach(function (n, i) {
        gsap.from(n, { y: 70, opacity: 0, duration: 1, delay: i ? (i - 1) * .1 : 0, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 90%' } });
      });
      $$('[data-count]').forEach(function (el) {
        var end = Number(el.getAttribute('data-count'));
        var o = { v: 0 };
        el.textContent = '0';
        gsap.to(o, {
          v: end, duration: 2.2, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('en-US'); },
        });
      });

      /* Compare: English-light gives way to Arabic-dark as you scroll (until you drag it yourself) */
      compareTween = gsap.fromTo('[data-compare]', { '--split': '94%' }, {
        '--split': '6%', ease: 'none',
        scrollTrigger: { trigger: '.compare-wrap', start: 'top 75%', end: 'bottom 35%', scrub: .6 },
      });

      /* Plan: three layers drift at different speeds; the steps tick as they reach the middle */
      var planST = { trigger: '.plan-visual', start: 'top bottom', end: 'bottom top', scrub: .8 };
      gsap.fromTo('.plan-browser', { y: 60 }, { y: -40, ease: 'none', scrollTrigger: planST });
      gsap.fromTo('.pace-card', { y: 150, rotate: 5 * sx }, { y: -90, rotate: -2 * sx, ease: 'none', scrollTrigger: planST });
      gsap.fromTo('.plan-phone', { y: 230 }, { y: -130, ease: 'none', scrollTrigger: planST });
      $$('.checks li').forEach(function (li) {
        ScrollTrigger.create({
          trigger: li, start: 'top 70%',
          onEnter: function () { li.classList.add('is-done'); },
          onLeaveBack: function () { li.classList.remove('is-done'); },
        });
      });

      /* Prep: list slides in, the phone tilts, the QUIZ 1 stamp lands */
      gsap.from('.prep-list li', { x: -50 * sx, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.prep-list', start: 'top 82%' } });
      gsap.fromTo('.prep-phone', { y: 120, rotate: -6 * sx }, { y: -50, rotate: 3 * sx, ease: 'none', scrollTrigger: { trigger: '.prep-visual', start: 'top bottom', end: 'bottom top', scrub: .8 } });
      gsap.from('.prep-stamp', { scale: 2.8, opacity: 0, rotate: -30, duration: .55, ease: 'power4.in', scrollTrigger: { trigger: '.prep-visual', start: 'top 55%' } });

      /* Gallery: pinned, the phones slide sideways */
      var track = $('.gallery-track');
      var dist = function () { return Math.max(0, track.scrollWidth - root.clientWidth); };
      gsap.to(track, {
        x: function () { return -sx * dist(); }, ease: 'none',
        scrollTrigger: { trigger: '.gallery', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 },
      });

      /* Earn: the result card swings flat in 3D */
      gsap.fromTo('.result-card', { rotateY: -34 * sx, rotateX: 14, y: 90, transformPerspective: 1400 }, {
        rotateY: 4 * sx, rotateX: 0, y: -20, ease: 'none',
        scrollTrigger: { trigger: '.earn-visual', start: 'top bottom', end: 'center 40%', scrub: .8 },
      });
      gsap.fromTo('.earn-phone', { y: 220 }, { y: -60, ease: 'none', scrollTrigger: { trigger: '.earn-visual', start: 'top bottom', end: 'bottom top', scrub: .8 } });
      gsap.from('.pills li', { y: 22, opacity: 0, scale: .9, stagger: .07, duration: .6, ease: 'back.out(2)', scrollTrigger: { trigger: '.pills', start: 'top 88%' } });

      /* Final call: the logo bars rise, the words come up */
      gsap.from('.final-bars span', { scaleY: 0, transformOrigin: '50% 100%', stagger: .14, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.final', start: 'top 65%' } });
      gsap.from('.final-title .wi', { yPercent: 118, stagger: .08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.final-title', start: 'top 88%' } });

      /* Section copy fades up */
      $$('[data-reveal]').forEach(function (el) {
        gsap.from(el.children, { y: 40, opacity: 0, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 84%' } });
      });

      ScrollTrigger.sort();
      ScrollTrigger.refresh();

      return function () {
        root.classList.remove('fx');
        $$('.marquee-row [data-clone]').forEach(function (k) { k.remove(); });
        $$('[data-count]').forEach(function (el) { el.textContent = Number(el.getAttribute('data-count')).toLocaleString('en-US'); });
        $$('.checks li').forEach(function (li) { li.classList.remove('is-done'); });
        compareTween = null;
      };
    });
  }

  /* ---------- Start ---------- */
  applyLang(lang());
  startMotion();
  onScroll();
  window.addEventListener('load', function () { if (ScrollTrigger) ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (ScrollTrigger) ScrollTrigger.refresh(); });
})();
