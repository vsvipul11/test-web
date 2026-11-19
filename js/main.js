/* ==========================================================================
   The story. Builds every scene from config.js and maps scroll to one
   master timeline: sketches appear, colour floods in, ink washes between.
   ========================================================================== */
(function () {
  'use strict';

  var W = window.WEDDING, D = window.MONOGRAM_D, VB = '80 20 900 1045';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement, film = $('#film');
  var LAYOUT = matchMedia('(min-width: 900px) and (min-aspect-ratio: 1/1)'), PHONE = !LAYOUT.matches;
  var STILL = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var shot = function (k) { return 'assets/shots/' + k + '.webp'; };
  var INK = '#241712', IVORY = '#fbf5e9', GOLD = '#d9b873', GOLD_INK = '#a97c33', DEEP_GOLD = '#7f5616', RED = '#a81f2a';
  var TITLE_ON_PIC = PHONE ? IVORY : INK;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  ['sealMark', 'topMark'].forEach(function (id) { $('#' + id).setAttribute('d', D); });

  /* ---------------------------------------------------------------- markup */

  function pic(k, o) {
    o = o || {};
    var seed = (o.seed || W.seeds[k] || [.5, .45]).join(',');
    return '<div class="pic" data-img="' + k + '" data-seed="' + seed + '"' + (o.py != null ? ' data-py="' + o.py + '"' : '') + '></div>';
  }
  function section(cls, html) {
    var el = document.createElement('section');
    el.className = 'scene ' + cls; el.innerHTML = html; film.appendChild(el);
    return el;
  }
  function soak(tag, cls, text, attrs) { return '<' + tag + ' class="' + cls + '" data-soak ' + (attrs || '') + '>' + text + '</' + tag + '>'; }
  function mono(cls, attrs) { return '<div class="' + cls + '" data-mono ' + (attrs || '') + '></div>'; }

  var S = {};

  S.open = section('open',
    '<div class="open__tree" data-art="tree"></div>' +
    '<div class="open__body">' +
      '<p class="open__deva" lang="hi">प्रेम कहानी</p>' +
      '<p class="cap">A love story, years in the making</p>' +
      soak('p', 'open__line', 'We grew up.', 'data-col="' + INK + '"') +
      soak('p', 'open__line', 'We fell in love.', 'data-col="' + INK + '"') +
      soak('p', 'open__line open__line--s', 'Now, forever.', 'data-col="' + RED + '"') +
    '</div>');

  S.hero = section('hero panel',
    pic('hero', { seed: [.5, .46] }) +
    '<div class="hero__top">' + mono('hero__mono', 'data-col="' + (PHONE ? DEEP_GOLD : GOLD_INK) + '" data-foil') + '</div>' +
    '<div class="hero__foot">' +
      soak('h1', 'hero__names', 'Jhanvi &amp; Abhinav', 'data-col="' + TITLE_ON_PIC + '"') +
      soak('p', 'hero__sub', 'From Class 6 to “I do.”', 'data-col="' + (PHONE ? GOLD : RED) + '"') +
      '<p class="hero__line">And somehow, we’d still choose each other.</p></div>');

  /* paragraphs grouped into pages that fit one phone screen (about 270 letters each): a page's
     paragraphs come in together, one after another, and Next turns to the next page */
  function pagesOf(list) {
    var pages = [], n = 0;
    list.forEach(function (b) {
      var len = String(b).replace(/<[^>]+>/g, '').length;
      if (!pages.length || (n + len > 270 && pages[pages.length - 1].length)) { pages.push([]); n = 0; }
      pages[pages.length - 1].push(b); n += len;
    });
    return pages.map(function (pg) { return '<div class="page">' + pg.map(function (b) { return '<p class="beat">' + b + '</p>'; }).join('') + '</div>'; }).join('');
  }
  function chapterEl(c) {
    return section('panel', pic(c.pic, { seed: c.seed }) + '' +
      '<div class="words"><p class="cap">' + c.label + '<span class="deva" lang="hi">' + c.deva + '</span></p>' +
      soak('h2', 'title', c.title, 'data-col="' + TITLE_ON_PIC + '"') +
      '<div class="beats">' + pagesOf(c.beats) + '</div></div>');
  }
  var byId = {}; W.chapters.forEach(function (c) { byId[c.id] = c; });

  S.ch1a = chapterEl(byId.ch1a);
  S.ch1b = chapterEl(byId.ch1b);

  S.mem = section('mem',
    '<div class="mem__head"><p class="cap">Chapter two<span class="deva" lang="hi" style="margin-left:.6em">यादें</span></p>' +
    soak('h2', 'mem__title', W.memories.title, 'data-col="' + INK + '"') + '</div>' +
    '<div class="prints">' + W.memories.prints.map(function (p) { return '<figure class="print"><img src="assets/photos/' + p + '.webp" alt="A memory of the two of them" loading="lazy"></figure>'; }).join('') + '</div>' +
    '<div class="mem__words">' + pagesOf(W.memories.beats) + '</div>');

  S.ch3a = chapterEl(byId.ch3a);
  S.ch3b = chapterEl(byId.ch3b);
  S.ch3c = chapterEl(byId.ch3c);
  S.yes = section('yes',
    '<div class="yes__amb"></div>' +
    '<div class="yes__pic"><img src="assets/photos/ring.webp" alt="A hand held out at sunset, a ring on one finger"><i class="yes__glint"></i></div>' +
    '<div class="yes__shade"></div>' +
    '<p class="yes__slug">EXT. THE SHORE — LAST LIGHT</p>' +
    '<p class="yes__l yes__l--1">One question.</p>' +
    '<p class="yes__l yes__l--2">One word.</p>' +
    '<h2 class="yes__word">Yes.</h2>');

  S.final = chapterEl(byId.final);

  var at = [W.venue, W.city].filter(Boolean).join(' · ');
  S.invite = section('invite',
    '<div class="inv__branch" data-art="branch"></div>' +
    '<div class="inv__body"><p class="cap">With love, and the blessings of our families</p>' +
    mono('inv__mono', 'data-col="' + GOLD_INK + '" data-foil') +
    soak('h2', 'inv__names', 'Jhanvi &amp; Abhinav', 'data-col="' + INK + '"') +
    '<p class="inv__sub">Two childhoods intertwined. Two hearts choosing forever.</p>' +
    soak('p', 'inv__date', W.dateLong, 'data-col="' + RED + '"') +
    '<p class="inv__line">Together with our families, we invite you to celebrate the beginning of our happily ever after.</p>' +
    '<p class="inv__at">' + (at || 'Venue to be announced') + '</p></div>');

  S.events = W.events.map(function (e) {
    var meta = [['Date', e.date], ['Time', e.time], ['Venue', e.venue]].filter(function (m) { return m[1]; });
    return section('panel', pic(e.pic, { seed: e.seed }) + '' +
      '<div class="ev__words"><p class="ev__top" lang="hi">' + e.deva + '</p>' +
      soak('h3', 'ev__name', e.name, 'data-col="' + TITLE_ON_PIC + '"') +
      '<p class="ev__line">' + e.line + '</p><div class="ev__meta">' + meta.map(function (m) { return '<div' + (m[0] === 'Venue' ? ' class="ev__venue"' : '') + '><small>' + m[0] + '</small>' + m[1] + '</div>'; }).join('') + '</div></div>');
  });

  S.lore = section('panel lore',
    W.lore.map(function (l) { return pic(l.pic, { seed: [.5, .3] }); }).join('') + '' +
    '<div class="lore__words"><p class="lore__head">The Couple Lore</p>' +
    '<div class="lore__tabs" role="tablist">' + W.lore.map(function (l, i) { return '<button type="button" role="tab" data-lore="' + i + '" aria-selected="' + (i === 0) + '">' + l.name + '</button>'; }).join('') + '</div>' +
    '<div class="lore__name" id="loreName"></div><div class="lore__role" id="loreRole"></div><p class="lore__text" id="loreText"></p></div>');

  S.count = section('count',
    '<div class="cd__body"><p class="cap">The countdown is on</p>' +
    soak('h2', 'cd__title', 'Our forever<br>begins here.', 'data-col="' + GOLD + '" data-foil') +
    '<p class="cd__line">12 years in the making.<br>One beautiful day to celebrate it.</p>' +
    '<div class="cd__nums" role="timer">' + ['Days', 'Hours', 'Mins', 'Secs'].map(function (u) { return '<div><b>00</b><small>' + u + '</small></div>'; }).join('') + '</div>' +
    '<p class="cd__date">' + W.dateDots + '</p>' +
    '<p class="cd__line" style="margin-top:.8em">Save the date. Bring the love.<br>Prepare to dance.</p>' +
    '<button id="ics" class="btn btn--line cd__cal" type="button">Add to calendar</button></div>');

  S.gallery = W.gallery.map(function (k) { return section('gal', pic(k)); });

  /* ---------------------------------------------------------------- the score
     A tanpura drone with a santoor-like line in raag Bhupali, synthesised live. */

  var Score = (function () {
    var ctx, master, verb, on = false, started = false, timers = [], plucks = {};
    var SA = 293.66;
    var SCALE = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2].map(function (r) { return SA * r; });
    var PHRASES = [[0, 1, 2], [2, 3, 4, 3], [5, 4, 3, 2], [3, 2, 1, 0], [2, 3, 5, 4, 3], [0, 2, 1, 0], [3, 4, 5, 6, 5], [7, 6, 5, 3]];

    function impulse(sec) {
      var len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
      for (var ch = 0; ch < 2; ch++) {
        var d = b.getChannelData(ch);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.4);
      }
      return b;
    }
    function pluck(freq) { // Karplus-Strong
      var sr = ctx.sampleRate, n = Math.floor(sr * 3.2), p = Math.round(sr / freq), buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
      var y = new Float32Array(p), i, lp = 0;
      for (i = 0; i < p; i++) { lp = lp * 0.55 + (Math.random() * 2 - 1) * 0.45; y[i] = lp; }
      var idx = 0;
      for (i = 0; i < n; i++) {
        var v = y[idx], nx = y[(idx + 1) % p];
        d[i] = v; y[idx] = 0.4985 * (v + nx); idx = (idx + 1) % p;
      }
      return buf;
    }
    function drone(f, when, vel) {
      var o = ctx.createOscillator(), o2 = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = f;
      o2.type = 'triangle'; o2.frequency.value = f * 2.003;
      fl.type = 'lowpass'; fl.Q.value = 5;
      fl.frequency.setValueAtTime(1300, when); fl.frequency.exponentialRampToValueAtTime(420, when + 5.5);
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(vel, when + 0.09); g.gain.exponentialRampToValueAtTime(0.0001, when + 7);
      o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(master); g.connect(verb);
      o.start(when); o2.start(when); o.stop(when + 7.1); o2.stop(when + 7.1);
    }
    function note(i, when, vel) {
      var f = SCALE[i], s = ctx.createBufferSource(), g = ctx.createGain();
      s.buffer = plucks[i] || (plucks[i] = pluck(f));
      g.gain.value = vel;
      s.connect(g); g.connect(master); g.connect(verb); s.start(when);
    }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function loopDrone(i) {
      if (!on) return;
      var seq = [110, 146.83, 146.83, 73.42];
      drone(seq[i % 4], ctx.currentTime + 0.06, i % 4 === 3 ? 0.12 : 0.085);
      later(function () { loopDrone(i + 1); }, 1950);
    }
    function loopLine() {
      if (!on) return;
      var ph = PHRASES[Math.floor(Math.random() * PHRASES.length)], t = ctx.currentTime + 0.1;
      ph.forEach(function (n, k) {
        note(n, t, 0.3 + Math.random() * 0.1);
        if (k === ph.length - 1) for (var r = 1; r < 5; r++) note(n, t + r * 0.13, 0.18 / r);
        t += 0.62 + Math.random() * 0.4;
      });
      later(loopLine, (t - ctx.currentTime) * 1000 + 3200 + Math.random() * 2600);
    }
    function init() {
      if (ctx) return true;
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0;
      verb = ctx.createConvolver(); verb.buffer = impulse(3.2);
      var wet = ctx.createGain(); wet.gain.value = 0.42;
      verb.connect(wet); wet.connect(master); master.connect(ctx.destination);
      return true;
    }
    function button() { $('#snd').setAttribute('aria-pressed', String(on)); }
    function start() {
      if (!init()) return;
      ctx.resume(); on = true; started = true; button();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.62, ctx.currentTime, 1.2);
      loopDrone(0); later(loopLine, 5200);
    }
    function stop() {
      on = false; button();
      timers.forEach(clearTimeout); timers = [];
      if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    }
    function blip(f, dur, vol) {
      if (!ctx || !on) return;
      var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur);
    }
    document.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      if (document.hidden) { ctx.suspend(); } else if (on) { ctx.resume(); }
    });
    return { start: start, stop: stop, blip: blip, toggle: function () { if (on) stop(); else start(); }, get started() { return started; } };
  })();

  /* ---------------------------------------------------------------- petals + gold */

  var Motes = (function () {
    var cv = $('#motes'), x = cv.getContext('2d'), w, h, list = [], mode = 'none', raf = 0, last = 0, dpr = Math.min(devicePixelRatio || 1, 1.5), MAX = PHONE ? 26 : 50;
    function size() { w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function make() {
      if (mode === 'gold') return { g: 1, x: Math.random() * w, y: h + 10, r: .7 + Math.random() * 1.8, vx: (Math.random() - .5) * 12, vy: -(12 + Math.random() * 30), p: Math.random() * 6.28, a: .3 + Math.random() * .6 };
      return { x: Math.random() * w, y: -20, r: 4 + Math.random() * 6, vx: 6 + Math.random() * 20, vy: 36 + Math.random() * 50, rot: Math.random() * 6.28, vr: (Math.random() - .5) * 2.6, c: ['#e78b1c', '#f2a93b', '#c8322b', '#f6c25a'][Math.floor(Math.random() * 4)], p: Math.random() * 6.28 };
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min((now - last) / 1000, .05); last = now;
      x.clearRect(0, 0, w, h);
      for (var i = list.length - 1; i >= 0; i--) {
        var m = list[i]; m.p += dt * 2; m.x += (m.vx + Math.sin(m.p) * 12) * dt; m.y += m.vy * dt;
        if (m.g) { x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(255,205,130,' + (m.a * (.55 + .45 * Math.sin(m.p * 3))).toFixed(3) + ')'; x.beginPath(); x.arc(m.x, m.y, m.r, 0, 6.28); x.fill(); }
        else { m.rot += m.vr * dt; x.globalCompositeOperation = 'source-over'; x.save(); x.translate(m.x, m.y); x.rotate(m.rot); x.scale(1, .45 + .55 * Math.abs(Math.sin(m.p))); x.fillStyle = m.c; x.globalAlpha = .92; x.beginPath(); x.ellipse(0, 0, m.r, m.r * .6, 0, 0, 6.28); x.fill(); x.restore(); }
        if (m.y > h + 20 || m.y < -30) list.splice(i, 1);
      }
      if (mode !== 'none' && list.length < MAX && Math.random() < .3) list.push(make());
      if (mode === 'none' && !list.length) { cancelAnimationFrame(raf); raf = 0; x.clearRect(0, 0, w, h); }
    }
    addEventListener('resize', size); size();
    return { set: function (m) { if (m === mode) return; mode = m || 'none'; if (mode !== 'none' && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } } };
  })();

  /* ---------------------------------------------------------------- film grain */
  (function () {
    var s = 200, c = document.createElement('canvas'); c.width = c.height = s;
    var x = c.getContext('2d'), im = x.createImageData(s, s), d = im.data;
    for (var i = 0; i < d.length; i += 4) { d[i] = d[i + 1] = d[i + 2] = Math.random() < .5 ? 0 : 255; d[i + 3] = Math.random() * 20; }
    x.putImageData(im, 0, 0);
    $('.grain').style.backgroundImage = 'url(' + c.toDataURL() + ')';
  })();

  /* ---------------------------------------------------------------- small working parts */

  function countdown() {
    var t = new Date(W.date), nums = $$('.cd__nums b');
    function tick() {
      var s = Math.max(0, Math.floor((t - Date.now()) / 1000));
      nums[0].textContent = pad(Math.floor(s / 86400)); nums[1].textContent = pad(Math.floor(s / 3600) % 24);
      nums[2].textContent = pad(Math.floor(s / 60) % 60); nums[3].textContent = pad(s % 60);
    }
    tick(); setInterval(tick, 1000);
    $('#ics').addEventListener('click', function () {
      var day = W.date.slice(0, 10).replace(/-/g, ''), next = new Date(Date.UTC(+day.slice(0, 4), +day.slice(4, 6) - 1, +day.slice(6) + 1)).toISOString().slice(0, 10).replace(/-/g, '');
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JA//Wedding//EN', 'BEGIN:VEVENT', 'UID:jhanvi-abhinav-20261205@wedding', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]|\.\d{3}/g, ''), 'DTSTART;VALUE=DATE:' + day, 'DTEND;VALUE=DATE:' + next, 'SUMMARY:Jhanvi & Abhinav\\u2019s wedding'.replace('\\u2019', "'"), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'jhanvi-abhinav-wedding.ics'; a.click();
    });
  }

  function album() {
    var cta = $('#driveCta'), card = $('#driveCard');
    $('#albumDays').innerHTML = W.events.map(function (e) { return '<li>' + (e.label || e.name) + '</li>'; }).join('');
    if (W.driveLink) { cta.href = W.driveLink; card.href = W.driveLink; return; }
    cta.textContent = 'Album opens soon';
    cta.setAttribute('aria-disabled', 'true');
    card.removeAttribute('target');
    card.setAttribute('aria-disabled', 'true');
    card.setAttribute('tabindex', '-1');
    card.style.cursor = 'default';
    $('#driveNote').textContent = 'The link to our shared album will appear here, so keep your camera roll handy.';
  }

  /* "Your blessings & good words": guests write a note, everyone sees the notes.
     The notes are kept by netlify/functions/wishes.mjs; written with textContent only. */
  function wishBoard() {
    var API = '/api/wishes', form = $('#wishForm'), list = $('#wishList'), more = $('#wishMore');
    var nameEl = form.elements.namedItem('name'), textEl = form.elements.namedItem('text'), trap = form.elements.namedItem('website');
    var btn = $('button[type=submit]', form), msg = $('.wform__msg', form), count = $('.wform__count', form);
    var all = [], step = PHONE ? 4 : 6, shown = step, busy = false, settle = 0, loaded = false;
    try { nameEl.value = localStorage.getItem('ja-name') || ''; } catch (e) {}

    function say(t, bad) { msg.textContent = t; msg.classList.toggle('is-bad', !!bad); }
    function when(at) { var d = new Date(at); return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    function card(w) {
      var li = document.createElement('li'), p = document.createElement('p'), who = document.createElement('p'), t = document.createElement('time');
      li.className = 'wish' + (w.fresh ? ' is-new' : '');
      p.className = 'wish__text'; p.textContent = w.text;
      who.className = 'wish__who'; who.textContent = w.name;
      t.className = 'wish__when'; t.dateTime = w.at; t.textContent = when(w.at);
      li.appendChild(p); li.appendChild(who); li.appendChild(t);
      return li;
    }
    /* the page below the film changed height: let the scroll effects re-measure, once it settles */
    function remeasure() { clearTimeout(settle); settle = setTimeout(function () { if (window.ScrollTrigger && tl) ScrollTrigger.refresh(); }, 250); }
    function paint() {
      list.textContent = '';
      if (!all.length) {
        var e = document.createElement('li'); e.className = 'wish wish--empty';
        e.textContent = loaded ? 'No notes yet. Be the first to bless us.' : 'The notes our people leave will appear here.';
        list.appendChild(e);
      }
      all.slice(0, shown).forEach(function (w) { list.appendChild(card(w)); });
      more.hidden = all.length <= shown;
      remeasure();
    }
    function counted() { count.textContent = textEl.value.length + ' / 600'; }

    more.addEventListener('click', function () { shown += step * 2; paint(); });
    textEl.addEventListener('input', counted);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      var name = nameEl.value.trim(), text = textEl.value.trim();
      if (!name) { say('Please add your name.', true); nameEl.focus(); return; }
      if (text.length < 2) { say('Please write a few words.', true); textEl.focus(); return; }
      busy = true; btn.disabled = true; say('Sending your blessing…');
      fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: name, text: text, website: trap.value }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { ok: r.ok, b: b }; }); })
        .then(function (x) {
          if (!x.ok) throw new Error(x.b.error || '');
          if (x.b.wish) { x.b.wish.fresh = true; all.unshift(x.b.wish); loaded = true; paint(); }
          textEl.value = ''; counted();
          say('Thank you! Your blessing is on the wall.');
          try { localStorage.setItem('ja-name', name); } catch (err) {}
        })
        .catch(function (err) { say(err.message || 'That didn’t go through. Please try again in a moment.', true); })
        .then(function () { busy = false; btn.disabled = false; });
    });

    paint();
    fetch(API, { headers: { accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (b) { all = (b && b.wishes) || []; loaded = true; paint(); })
      .catch(function () { /* no notes service here (a plain static host): the form says so if used */ });
  }

  function lorePaint(i) {
    var l = W.lore[i];
    $('#loreName').textContent = l.name; $('#loreRole').textContent = l.role; $('#loreText').textContent = l.text;
    $$('[data-lore]').forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); });
  }

  /* ---------------------------------------------------------------- still page */

  function stillPage() {
    root.classList.remove('is-locked'); root.classList.add('is-still', 'is-rolling');
    $$('[data-img]').forEach(function (el) { el.innerHTML = '<img src="' + shot(el.dataset.img) + '" alt="">'; });
    $$('[data-mono]').forEach(function (m) { m.innerHTML = '<svg viewBox="' + VB + '" width="110" style="fill:currentColor"><path fill-rule="evenodd" d="' + D + '"/></svg>'; });
  }

  /* ---------------------------------------------------------------- the engine */

  var tl, C = 0, scenes = [], floods = [], flowItems = [], flowOn = {};
  /* the resting points a tap moves between: timeline times where a scene's words and picture are fully in */
  var stops = [];

  function register() {
    $$('.scene, .album, .closing').forEach(function (s) {
      s._items = [];
      $$('[data-img],[data-art],[data-soak],[data-mono]', s).forEach(function (el) {
        var it, d = el.dataset;
        if ('img' in d) {
          var k = d.img;
          if (d.plain !== undefined) it = Ink.addPicture(el, { url: 'assets/art/' + k + '.webp', ink: 1, rev: 1, half: +d.half || 0 });
          else it = Ink.addPicture(el, { url: shot(k), sketch: 'assets/shots/' + k + '-ink.webp', seed: d.seed ? d.seed.split(',').map(Number) : [.5, .45], py: d.py != null ? +d.py : (W.focus[k] != null ? W.focus[k] : .5), live: .55, edge: (!PHONE && el.classList.contains('pic')) ? .03 : 0, mask: 'arch' in d, line: 'arch' in d ? 1 : 0 });
        } else if ('art' in d) it = Ink.addDrawing(el, { url: 'assets/art/' + d.art + '.webp', seed: d.glow !== undefined ? [.5, .5] : [.5, 1], py: d.art === 'tree' ? .3 : .5, alpha: d.art === 'tree' ? (el.classList.contains('closing__tree') ? .42 : .5) : d.art === 'branch' ? .6 : 1 });
        else if ('mono' in d) { el.setAttribute('data-vb', VB); it = Ink.addLettering(el, { path: D, col: d.col, foil: 'foil' in d }); }
        else it = Ink.addLettering(el, { col: d.col, foil: 'foil' in d });
        s._items.push(it);
      });
    });
  }

  function item(el) { return el._ink; }
  var shades = [];
  function fitWords() {
    var H = innerHeight;
    shades.forEach(function (a) { a[0].sy = Math.max(.36, a[1].getBoundingClientRect().top / H); });
    if (PHONE) {
      var lines = $$('.open__line', S.open), lastEl = lines[lines.length - 1], last = lastEl.getBoundingClientRect(), gap = Math.max(30, parseFloat(getComputedStyle(lastEl).fontSize) * .36);
      $('.open__tree', S.open).style.height = Math.max(0, H - last.bottom - gap) + 'px';
    }
  }
  function scene(el, len, tone, label, opt) {
    var s = { el: el, from: C, to: C + len, tone: tone, label: label, on: false, items: el._items, motes: opt && opt.motes };
    scenes.push(s); C += len; return s;
  }
  function flood(at, s1, s2) { floods.push({ at: at, s1: s1 || [.5, .55], s2: s2 || [.5, .45] }); }

  /* when each page of paragraphs starts and comes to rest, counted from `at` in its scene */
  function plan(el, at) {
    var t = at;
    return $$('.page', el).map(function (pg) {
      var bs = $$('.beat', pg), p ={ el: pg, beats: bs, start: t, rest: t + (bs.length - 1) * .9 + 1 };
      t = p.rest + 1.4; return p;
    });
  }
  /* a page's paragraphs flow in one after another; the page rests (a stop) until Next, then
     makes way for the next page */
  function playPages(pl, s) {
    pl.forEach(function (p, k) {
      if (k) tl.to(pl[k - 1].el, { autoAlpha: 0, y: -10, duration: .5 }, s + pl[k - 1].rest + .8);
      p.beats.forEach(function (b, i) { tl.fromTo(b, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .8, ease: 'power2.out' }, s + p.start + i * .9); });
      stops.push(s + p.rest);
    });
  }

  function bloom(p, s, sketchFor, inkFor) {
    tl.fromTo(p, { rev: 0 }, { rev: 1, duration: sketchFor || 2 }, s)
      .fromTo(p, { ink: 0 }, { ink: 1, duration: inkFor || 3.2, ease: 'sine.inOut' }, s + (sketchFor || 2) * .85);
  }

  function chapter(el, c, tail) {
    var P = item($('.pic', el)), title = item($('.title', el)), cap = $('.cap', el);
    shades.push([P, $('.words', el)]);
    var pl = plan(el, 5.6), len = pl[pl.length - 1].rest + 2 + (tail ? .6 : 0), s = scene(el, len, 'photo', c.label.split('?')[0], { motes: c.petals ? 'petals' : 'none' }).from;
    bloom(P, s);
    if (PHONE) tl.fromTo(P, { scrim: 0 }, { scrim: 1, duration: 1.2 }, s + 3.6);
    tl.fromTo(cap, { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, s + 4.2)
      .fromTo(title, { rev: 0 }, { rev: 1, duration: 1.6 }, s + 4.4);
    playPages(pl, s);
  }

  function build() {
    var s;

    /* the opening page */
    var o = S.open, lines = $$('.open__line', o), tree = item($('.open__tree', o));
    s = scene(o, 5.4, 'paper', 'Prem Kahani').from;
    stops.push(s + 3.4);
    tl.fromTo(item(lines[1]), { rev: 0 }, { rev: 1, duration: 1.4 }, s + .4)
      .fromTo(item(lines[2]), { rev: 0 }, { rev: 1, duration: 1.6 }, s + 1.6);
    flood(C, [.5, .62], [.5, .4]);

    /* the title card */
    var h = S.hero, hp = item($('.pic', h));
    shades.push([hp, $('.hero__foot', h)]);
    s = scene(h, 11.5, 'photo', 'Jhanvi & Abhinav').from;
    bloom(hp, s, 2, 3.6);
    if (PHONE) tl.fromTo(hp, { scrim: 0, top: 0 }, { scrim: .92, top: .16, duration: 1.3 }, s + 4);
    tl.fromTo(item($('.hero__mono', h)), { rev: 0 }, { rev: 1, duration: 1.6 }, s + 4.6)
      .fromTo(item($('.hero__names', h)), { rev: 0 }, { rev: 1, duration: 1.4 }, s + 5.6)
      .fromTo(item($('.hero__sub', h)), { rev: 0 }, { rev: 1, duration: 1.4 }, s + 6.8)
      .fromTo($('.hero__line', h), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .8 }, s + 8);
    stops.push(s + 9.5);
    flood(C, [.5, .8], [.5, .4]);

    chapter(S.ch1a, byId.ch1a);
    flood(C, [.4, .7], [.55, .35]);
    chapter(S.ch1b, byId.ch1b);
    flood(C, [.5, .85], [.5, .3]);

    /* memories, printed */
    var m = S.mem, prints = $$('.print', m), mpl = plan(m, 4.4);
    var spots = PHONE ? [[-58, -2, -9], [58, 6, 7], [-30, 26, 5], [40, 30, -8], [2, 8, 3]] : [[-64, -8, -9], [62, 2, 8], [-40, 30, 5], [46, 34, -7], [0, 10, 3]];
    s = scene(m, mpl[mpl.length - 1].rest + 2, 'paper', 'Chapter two').from;
    tl.fromTo($('.cap', m), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, s + .4)
      .fromTo(item($('.mem__title', m)), { rev: 0 }, { rev: 1, duration: 1.8 }, s + .7);
    prints.forEach(function (p, i) {
      var q = spots[i % spots.length];
      tl.fromTo(p, { xPercent: i % 2 ? 240 : -240, yPercent: q[1], rotation: q[2] * 1.4, autoAlpha: 0 }, { xPercent: q[0], yPercent: q[1], rotation: q[2], autoAlpha: 1, duration: 1.6, ease: 'power3.out' }, s + 1.6 + i * .75);
    });
    playPages(mpl, s);
    flood(C, [.5, .3], [.4, .6]);

    chapter(S.ch3a, byId.ch3a);
    flood(C, [.2, .35], [.7, .4]);
    chapter(S.ch3b, byId.ch3b);
    flood(C, [.75, .55], [.5, .4]);
    chapter(S.ch3c, byId.ch3c);
    flood(C, [.5, .7], [.5, .4]);
    /* the question: the first version's ring close-up */
    var Y = S.yes, ypic = $('.yes__pic', Y), deep = PHONE ? 2.9 : 3.5;
    s = scene(Y, 11.7, 'dark', 'The question', { motes: 'petals' }).from;
    tl.fromTo(ypic, { scale: 1, x: 0, y: 0 }, { scale: deep, x: function () { return -(.593 - .5) * ypic.offsetWidth; }, y: function () { return (.36 - .612) * ypic.offsetHeight; }, duration: 7.6, ease: 'power2.inOut' }, s)
      .fromTo($('.yes__slug', Y), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, s + .2)
      .to($('.yes__slug', Y), { autoAlpha: 0, duration: .6 }, s + 2.2)
      .fromTo($('.yes__l--1', Y), { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 1 }, s + 1.1)
      .fromTo($('.yes__l--2', Y), { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 1 }, s + 3)
      .to($$('.yes__l', Y), { autoAlpha: 0, duration: .8 }, s + 5.9)
      .fromTo($('.yes__shade', Y), { opacity: 0 }, { opacity: 1, duration: 2 }, s + 5.7)
      .fromTo($('.yes__glint', Y), { scale: 0, rotation: 0 }, { scale: 1.3, rotation: 45, duration: 1, ease: 'power3.out' }, s + 7.6)
      .to($('.yes__glint', Y), { scale: .7, opacity: .7, duration: 1 }, s + 8.6)
      .fromTo($('.yes__word', Y), { autoAlpha: 0, y: 44, letterSpacing: '.08em' }, { autoAlpha: 1, y: 0, letterSpacing: '0em', duration: 1.3, ease: 'power3.out' }, s + 7.7);
    stops.push(s + 9.7);
    flood(C, [.5, .7], [.5, .35]);

    chapter(S.final, byId.final, 1.4);
    flood(C, [.5, .2], [.3, .5]);

    /* the invitation */
    var V = S.invite;
    s = scene(V, 8.7, 'paper', 'The invitation').from;
    tl.fromTo(item($('.inv__branch', V)), { rev: 0 }, { rev: 1, duration: 3 }, s + .4)
      .fromTo($('.inv__body .cap', V), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, s + .6)
      .fromTo(item($('.inv__mono', V)), { rev: 0 }, { rev: 1, duration: 1.4 }, s + 1)
      .fromTo(item($('.inv__names', V)), { rev: 0 }, { rev: 1, duration: 1.4 }, s + 2)
      .fromTo($('.inv__sub', V), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .7 }, s + 3.2)
      .fromTo(item($('.inv__date', V)), { rev: 0 }, { rev: 1, duration: 1.5 }, s + 4)
      .fromTo($('.inv__line', V), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .7 }, s + 5.2)
      .fromTo($('.inv__at', V), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, s + 6);
    stops.push(s + 6.7);
    flood(C, [.5, .85], [.5, .3]);

    /* the functions */
    S.events.forEach(function (el, i) {
      var P = item($('.pic', el)), n = item($('.ev__name', el));
      shades.push([P, $('.ev__words', el)]);
      s = scene(el, 8.6, 'photo', W.events[i].label || W.events[i].name).from;
      bloom(P, s, 1.8, 3);
      if (PHONE) tl.fromTo(P, { scrim: 0 }, { scrim: 1, duration: 1 }, s + 3.4);
      tl.fromTo($('.ev__top', el), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, s + 3.8)
        .fromTo(n, { rev: 0 }, { rev: 1, duration: 1.5 }, s + 4)
        .fromTo($('.ev__line', el), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .7 }, s + 5.2)
        .fromTo($('.ev__meta', el), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .7 }, s + 5.8);
      stops.push(s + 6.6);
      flood(C, [.5, i % 2 ? .3 : .7], [.5, .45]);
    });

    /* the couple lore: tap between them */
    var LO = S.lore, pics = $$('.pic', LO).map(item), tabPic = pics.slice();
    pics.forEach(function (p, i) { p.rev = 1; p.ink = i === 0 ? 1 : 0; p.alpha = i === 0 ? 1 : 0; shades.push([p, $('.lore__words', LO)]); });
    s = scene(LO, 4, 'photo', 'The couple lore').from;
    if (PHONE) pics.forEach(function (p) { p.scrim = 1; });
    tl.fromTo($('.lore__words', LO), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .8 }, s + 1);
    stops.push(s + 2);
    var cur = 0;
    $$('[data-lore]').forEach(function (b, i) {
      b.addEventListener('click', function () {
        if (i === cur) return;
        var next = tabPic[i]; cur = i;
        lorePaint(i);
        tabPic.forEach(function (p) { gsap.killTweensOf(p); });
        next.alpha = 1; next.ink = 0;
        reorder(LO, next);
        gsap.to(next, { ink: 1, duration: 1.15, ease: 'sine.inOut', onComplete: function () { tabPic.forEach(function (p) { if (p !== next) p.alpha = 0; }); } });
      });
    });
    flood(C, [.5, .5], [.5, .5]);

    /* countdown */
    var CD = S.count;
    s = scene(CD, 7.9, 'dark', 'The countdown', { motes: 'gold', night: true }).from;
    scenes[scenes.length - 1].night = true;
    tl.fromTo($('.cd__body > .cap', CD), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, s + .6)
      .fromTo(item($('.cd__title', CD)), { rev: 0 }, { rev: 1, duration: 1.8 }, s + 1)
      .fromTo($$('.cd__line', CD)[0], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .7 }, s + 2.6)
      .fromTo($('.cd__nums', CD), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .8 }, s + 3.3)
      .fromTo($('.cd__date', CD), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, s + 4)
      .fromTo($$('.cd__line', CD)[1], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .7 }, s + 4.6)
      .fromTo($('.cd__cal', CD), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, s + 5.2);
    stops.push(s + 5.9);
    flood(C, [.5, .5], [.5, .45]);

    /* the gallery */
    S.gallery.forEach(function (el, i) {
      var P = item($('.pic', el)), last = i === S.gallery.length - 1;
      s = scene(el, last ? 7 : 6.4, 'photo', 'Gallery', { motes: W.gallery[i] === 'marigold' ? 'petals' : 'none' }).from;
      bloom(P, s, 1.6, 2.8);
      stops.push(s + 4.4);
      if (!last) flood(C, [i % 2 ? .3 : .7, .4], [.5, .45]);
    });

    tl.to({}, { duration: .01 }, C);
  }

  function reorder(sceneEl, next) {
    var rec = scenes.filter(function (s) { return s.el === sceneEl; })[0];
    var i = rec.items.indexOf(next); rec.items.splice(i, 1);
    var firstNon = rec.items.findIndex(function (x) { return x.kind !== 1; });
    rec.items.splice(firstNon < 0 ? rec.items.length : firstNon, 0, next);
    sync(true);
  }

  /* map the master time to what's on screen */
  var lastTone, lastLabel, lastMotes, afterFilm = false;
  var progLine = $('#prog i');
  function sync() {
    var t = tl.time(), act = [], ahead = [], night = 0, tone = 'paper', label = '', motes = 'none';
    scenes.forEach(function (s, i) {
      var on = t >= s.from - .001 && (t < s.to || i === scenes.length - 1);
      if (on !== s.on) { s.on = on; s.el.style.visibility = on ? 'visible' : 'hidden'; }
      if (on) { act = act.concat(s.items); tone = s.tone; label = s.label; motes = s.motes || 'none'; if (s.night) night = 1; }
      else if (s.from - t < 18 && t - s.to < 6) ahead = ahead.concat(s.items);
    });
    Object.keys(flowOn).forEach(function (k) { if (flowOn[k]) act = act.concat(flowOn[k]); });
    Ink.setActive(act, ahead);
    Ink.bg.a = night;
    var f = Ink.flood, p = 0;
    floods.some(function (x) { var d = t - x.at; if (d > -1.7 && d < 1.7) { p = (d + 1.7) / 3.4 * 2; f.sx = x.s1[0]; f.sy = x.s1[1]; f.sx2 = x.s2[0]; f.sy2 = x.s2[1]; return true; } return false; });
    f.p = p;
    var dark = !afterFilm && (PHONE ? tone !== 'paper' : tone === 'dark');
    if (afterFilm) { label = 'With love'; motes = 'none'; }
    document.body.classList.toggle('past-film', afterFilm);
    if (dark !== lastTone) { lastTone = dark; document.body.dataset.tone = dark ? 'dark' : 'paper'; }
    if (label !== lastLabel) { lastLabel = label; $('#where').textContent = label; }
    if (motes !== lastMotes) { lastMotes = motes; Motes.set(motes); }
    progLine.style.transform = 'scaleX(' + Math.min(1, t / C).toFixed(4) + ')';
  }

  function run() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    /* the film is stepped through by taps (see taps()), which glide the page itself,
       so the timeline follows the scroll exactly */
    tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: sync, scrollTrigger: {
      trigger: '#film', start: 'top top', pin: true, scrub: true, anticipatePin: 1,
      onToggle: function (st) { afterFilm = !st.isActive && st.progress >= 1; if (tl) sync(); },
      end: function () { return '+=' + Math.round(C * Math.max(84, innerHeight * .105)); }
    } });
    build();
    ScrollTrigger.refresh();
    sync();

    /* after the film: drawings grow in as they arrive */
    [$('.album'), $('.closing')].forEach(function (sec, i) {
      ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: function (st) { flowOn[i] = st.isActive ? sec._items : null; sync(); } });
      sec._items.forEach(function (it, k) {
        gsap.to(it, { rev: 1, duration: it.kind === 2 ? 2.8 : 1.8, delay: k * .1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top 72%', toggleActions: 'play none none none' } });
      });
    });

    var fan = [[-58, 10, -11], [58, 14, 10], [0, -6, 2]];
    $$('.aprint', $('.album')).forEach(function (p, i) {
      var q = fan[i] || [0, 34, -3];
      gsap.fromTo(p, { xPercent: 0, yPercent: -150, rotation: q[2] * 2.4, autoAlpha: 0 }, { xPercent: q[0], yPercent: q[1], rotation: q[2], autoAlpha: 1, duration: 1.1, delay: i * .16, ease: 'power3.out', scrollTrigger: { trigger: '.album__stack', start: 'top 80%', toggleActions: 'play none none none' } });
    });
    gsap.fromTo('.wishes__head > *', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, stagger: .1, ease: 'power2.out', scrollTrigger: { trigger: '.wishes', start: 'top 82%', toggleActions: 'play none none none' } });
    gsap.fromTo('.album__copy > *', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, stagger: .1, ease: 'power2.out', scrollTrigger: { trigger: '.album__copy', start: 'top 82%', toggleActions: 'play none none none' } });

    $$('a[href="#album"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); glide(pageY($('#album')), 2.6); }); });
    $$('a[href="#invite"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var inv = scenes.filter(function (x) { return x.el === S.invite; })[0];
        stepTo(stops.filter(function (t) { return t >= inv.from; })[0], 3);
      });
    });
    $('#home').addEventListener('click', function () { stepTo(0, 3); });
    taps();
  }

  /* ---------------------------------------------------------------- step through the film
     The film moves only by its Next and Back buttons (or the arrow keys), and they show only
     once a moment has finished playing. Taps and clicks anywhere else, scrolling and swiping do
     nothing inside the film. Each Next plays the film on to the next resting point in `stops`,
     at an unhurried pace, by gliding the page (the timeline follows the scroll). After the last
     one the page carries on as a normal page: blessings, album, the end. */

  var glider = null, aim = null;
  /* film time per second while it plays: the ink, the words and the pictures arrive at about
     the pace they were made for. Going back rewinds quicker. */
  var PACE = 2, PLAY_MIN = 2, PLAY_MAX = 9, BACK_PACE = 5;
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function pageY(el) { return el.getBoundingClientRect().top + scrollY; }
  function yAt(t) { var st = tl.scrollTrigger; return st.start + (st.end - st.start) * (t / tl.duration()); }
  function inFilm() { return !!(tl && tl.scrollTrigger) && scrollY < tl.scrollTrigger.end - 4; }
  /* just past the film: its last picture still in view, or the blessings just arriving. A step back from here re-enters it. */
  function atFilmEnd() { return !!(tl && tl.scrollTrigger) && scrollY >= tl.scrollTrigger.end - 4 && scrollY <= tl.scrollTrigger.end + innerHeight + 6; }
  function glide(y, dur, done, ease) {
    if (glider) glider.kill();
    var o = { y: scrollY };
    glider = gsap.to(o, { y: y, duration: dur, ease: ease || 'sine.inOut', onUpdate: function () { scrollTo(0, o.y); }, onComplete: function () {
      glider = null; aim = null; if (done) done();
      /* look again once it has landed: on a slow phone the last frame may not move the page, and
         then no scroll event would ever bring the buttons back */
      setTimeout(function () { cueCheck(); }, 400);
    } });
  }
  /* play (or rewind) the film to time t; `cap` fixes the duration for jumps like "back to the start" */
  function stepTo(t, cap) {
    if (t == null) return;
    var dist = Math.abs(t - tl.time()), fwd = t > tl.time();
    var dur = cap || (fwd ? clamp(dist / PACE, PLAY_MIN, PLAY_MAX) : clamp(dist / BACK_PACE, .8, 2.4));
    glide(yAt(t), dur, null, cap ? 'sine.inOut' : fwd ? 'power1.inOut' : 'power2.inOut');
    aim = t;
  }
  function nextStop(from) { for (var i = 0; i < stops.length; i++) if (stops[i] > from + .05) return stops[i]; return null; }
  function step(dir) {
    if (!tl || !opened) return;
    if (!inFilm()) { if (dir < 0 && atFilmEnd()) stepTo(stops[stops.length - 1], 2.4); return; }
    var from = aim != null ? aim : tl.time(), i, t = null;
    if (dir > 0) {
      t = nextStop(from);
      if (t == null) { aim = null; glide(pageY($('#wishes')), 2.4); return; }
    } else {
      for (i = stops.length - 1; i >= 0; i--) if (stops[i] < from - .05) { t = stops[i]; break; }
      if (t == null) t = 0;
    }
    stepTo(t);
  }
  /* the film can go back from anywhere past its first resting point */
  function canBack() { return !!tl && tl.time() > (stops[0] || 0) + .05; }
  function atLast() { return !!tl && nextStop(tl.time()) == null; }

  function taps() {
    stops.sort(function (a, b) { return a - b; });

    /* inside the film the page never scrolls by hand; a swipe only points at the Next button */
    var sx = 0, sy = 0, held = false, multi = false;
    document.addEventListener('touchstart', function (e) {
      if (e.touches.length > 1) { multi = true; return; }
      var p = e.touches[0]; sx = p.clientX; sy = p.clientY; held = false; multi = false;
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (!opened || multi || e.touches.length > 1) { multi = true; return; } /* two fingers: let them zoom */
      var dy = e.touches[0].clientY - sy;
      if (inFilm() || (dy > 0 && atFilmEnd())) { e.preventDefault(); held = true; }
    }, { passive: false });
    document.addEventListener('touchend', function (e) {
      if (multi) { if (!e.touches.length) multi = false; held = false; return; }
      if (!held) return; held = false;
      var p = e.changedTouches[0], dx = p.clientX - sx, dy = p.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
      if (dy > 0 && atFilmEnd() && !inFilm()) { if (!glider) step(-1); } /* pulled down at the blessings: the last picture comes back */
      else nudge();
    }, { passive: true });

    /* a wheel or trackpad does not move the film either */
    addEventListener('wheel', function (e) {
      if (!opened || e.ctrlKey) return; /* ctrl + wheel is zoom */
      if (inFilm()) { e.preventDefault(); nudge(); return; }
      if (e.deltaY < 0 && atFilmEnd()) { e.preventDefault(); if (!glider) step(-1); } /* scrolled up from the blessings: back to the last picture */
    }, { passive: false });

    /* the keyboard: the arrow keys work like the buttons, and only when the buttons would show;
       the keys that would scroll the page do nothing inside the film */
    addEventListener('keydown', function (e) {
      if (!opened || e.target.closest('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
      var k = e.key, next = k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.shiftKey);
      var back = k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp' || (k === ' ' && e.shiftKey);
      if (!next && !back && k !== 'Home' && k !== 'End') return;
      if (k === ' ' && e.target.closest('button, a, [role=tab]')) return; /* space presses the focused button */
      if (inFilm()) { e.preventDefault(); if (next) navGo(1); else if (back) navGo(-1); return; }
      if (back && k !== ' ' && atFilmEnd()) { e.preventDefault(); if (!glider) step(-1); }
    });

    /* if the page ever comes to rest between two points (a fling from below, a resize,
       a reload into the middle of a scene), settle on the nearest one */
    var settle = 0;
    addEventListener('scroll', function () {
      clearTimeout(settle);
      settle = setTimeout(function () {
        if (glider || !opened || !inFilm()) return;
        var now = tl.time(), best = 0;
        stops.forEach(function (t) { if (Math.abs(t - now) < Math.abs(best - now)) best = t; });
        if (Math.abs(best - now) > .05) stepTo(best, Math.min(1.6, Math.max(.5, Math.abs(best - now) / 4)));
      }, 180);
    }, { passive: true });
  }

  function open() {
    var lines = $$('.open__line', S.open), tree = item($('.open__tree', S.open)), g = gsap.timeline({ onComplete: function () {
      root.classList.remove('is-locked'); root.classList.add('is-rolling');
      $('#gate').style.display = 'none';
      ScrollTrigger.refresh();
      if (stops.length && tl.time() < stops[0] - .05) stepTo(stops[0]); /* the opening lines write themselves in */
      cueCheck(); /* after the glide has started, so Next waits for the lines */
    } });
    g.to('.seal__h--l', { x: -22, y: 6, rotation: -7, duration: .35, ease: 'power2.out' }, 0)
      .to('.seal__h--r', { x: 22, y: -5, rotation: 7, duration: .35, ease: 'power2.out' }, 0)
      .to('.seal__m', { autoAlpha: 0, duration: .15 }, 0)
      .to('.gate__copy', { autoAlpha: 0, duration: .5 }, .25)
      .to('.door--l', { rotationY: -108, duration: 1.5, ease: 'power2.inOut' }, .3)
      .to('.door--r', { rotationY: 108, duration: 1.5, ease: 'power2.inOut' }, .3)
      .to('#gate', { autoAlpha: 0, duration: .3 }, 1.6)
      .to(tree, { rev: 1, duration: 3.4, ease: 'none' }, .9)
      .to(item(lines[0]), { rev: 1, duration: 1.8, ease: 'none' }, 1.2);
  }

  /* ---------------------------------------------------------------- go */

  countdown(); lorePaint(0); album(); wishBoard();
  $('#snd').addEventListener('click', Score.toggle);

  /* The film's Next and Back buttons, and "Scroll down" once the film is over.
     The buttons show only when the film rests on one of its points, that is when a moment has
     finished playing, and they hide the instant one is pressed: one press, one moment.
     "Scroll down" blinks at the foot of the page after the film. It steps aside while the page
     is moving, while someone types a blessing, when a button, field or note sits right where
     it would be drawn, and at the end. */
  var cueCheck = function () {}, navGo = function () {}, nudge = function () {};
  (function () {
    var cue = $('#cue'), closing = $('#closing'), nav = $('#fnav'), nextBtn = $('#navNext'), backBtn = $('#navBack'), nextWord = $('span', nextBtn);
    var moving = false, typing = false, still = 0, nudged = 0, keyed = false, navOn = false;
    var UNDER = 'a, button, input, textarea, .wish, .aprint';
    function covers() {
      var y = innerHeight - 30, x = innerWidth / 2;
      return [x - 70, x, x + 70].some(function (px) { var el = document.elementFromPoint(px, y); return el && el.closest && el.closest(UNDER); });
    }
    function set() {
      var f = inFilm();
      cue.classList.toggle('is-on', !f && !moving && !typing && closing.getBoundingClientRect().top > innerHeight * .8 && !covers());
      var on = !!opened && f && !moving && !glider;
      if (on) { backBtn.hidden = !canBack(); nextWord.textContent = atLast() ? 'Continue' : 'Next'; }
      if (on !== navOn) {
        navOn = on; nav.classList.toggle('is-on', on);
        if (on && keyed) nextBtn.focus({ preventScroll: true }); /* keyboard people keep their place */
      }
    }
    navGo = function (dir) {
      if (!navOn) return; /* a moment is still playing */
      navOn = false; nav.classList.remove('is-on');
      step(dir);
      if (!glider) set(); /* nothing to play: show the buttons again */
    };
    nextBtn.addEventListener('click', function (e) { keyed = e.detail === 0; navGo(1); });
    backBtn.addEventListener('click', function (e) { keyed = e.detail === 0; navGo(-1); });
    /* someone tried to scroll or swipe the film: the Next button gives a little bounce */
    nudge = function () {
      if (!navOn || Date.now() - nudged < 1100) return;
      nudged = Date.now();
      if (nextBtn.animate) nextBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(.97)' }, { transform: 'scale(1)' }], { duration: 600, easing: 'ease-out' });
    };
    addEventListener('scroll', function () {
      if (!moving) { moving = true; set(); }
      clearTimeout(still); still = setTimeout(function () { moving = false; set(); }, inFilm() ? 350 : 900);
    }, { passive: true });
    document.addEventListener('focusin', function (e) { if (e.target.matches('input, textarea')) { typing = true; set(); } });
    document.addEventListener('focusout', function () { typing = false; set(); });
    addEventListener('resize', set);
    cueCheck = set;
    set();
  })();

  if (STILL || !window.gsap || !Ink.init($('#back'), $('#front'))) { stillPage(); return; }

  var wantMusic = true, opened = false;
  $('#muteGate').addEventListener('click', function () { wantMusic = !wantMusic; this.setAttribute('aria-pressed', String(wantMusic)); this.textContent = wantMusic ? 'Music on' : 'Music off'; });

  /* The film is laid out once, for the shape of the screen it opens on: on a phone the words sit
     on the picture in ivory, on a wide screen they sit beside it in ink. When the shape changes
     (a window narrowed to phone size, a big phone turned sideways) the page reloads and comes
     back to the same place, laid out for the new shape. */
  var PLACE = 'ja-place', back = null, reshaping;
  try { back = JSON.parse(sessionStorage.getItem(PLACE) || 'null'); sessionStorage.removeItem(PLACE); } catch (e) {}
  if (back && !(Date.now() - back.at < 120000)) back = null;
  /* where the reader is. It is noted as they scroll, never during a resize: while the window
     changes size the film is briefly unpinned, the page is short, and the browser pulls the
     scroll back to its end, which would read as the cover. */
  var last = null, frozen = 0;
  function measure() {
    if (!opened || !tl || Date.now() < frozen) return;
    var st = tl.scrollTrigger, y = scrollY, place = {};
    if (y > st.end) {
      var rest = document.documentElement.scrollHeight - innerHeight - st.end;
      place.i = scenes.length - 1; place.k = 1; place.after = rest > 0 ? Math.min(1, (y - st.end) / rest) : 0;
    } else {
      /* a scene and how far into it, since scenes run a little longer or shorter in each layout */
      var t = Math.min(1, Math.max(0, (y - st.start) / (st.end - st.start))) * C;
      place.i = scenes.length - 1;
      scenes.some(function (s, n) { if (t < s.to) { place.i = n; return true; } });
      var s = scenes[place.i];
      place.k = Math.min(1, Math.max(0, (t - s.from) / (s.to - s.from)));
    }
    last = place;
  }
  addEventListener('scroll', measure, { passive: true });
  addEventListener('resize', function () { frozen = Date.now() + 1500; }, true);
  function here() {
    var place = last || (opened ? { i: 0, k: 0 } : {});
    return { at: Date.now(), i: place.i, k: place.k, after: place.after };
  }
  var saved = null;
  function reshape() {
    if (!saved) saved = here();
    clearTimeout(reshaping);
    reshaping = setTimeout(function () {
      if (PHONE === !LAYOUT.matches) { saved = null; return; }
      try { sessionStorage.setItem(PLACE, JSON.stringify(saved)); } catch (e) {}
      location.reload();
    }, 300);
  }
  if (LAYOUT.addEventListener) LAYOUT.addEventListener('change', reshape); else if (LAYOUT.addListener) LAYOUT.addListener(reshape);

  /* straight back into the film at the saved place, past the sealed card */
  function enterAt(place) {
    opened = true;
    root.classList.remove('is-locked'); root.classList.add('is-rolling');
    $('#gate').style.display = 'none';
    item($('.open__tree', S.open)).rev = 1; item($('.open__line', S.open)).rev = 1;
    ScrollTrigger.clearScrollMemory('manual'); /* or a later refresh puts back the scroll from before the reload */
    ScrollTrigger.refresh();
    var st = tl.scrollTrigger, rest = document.documentElement.scrollHeight - innerHeight - st.end;
    var s = scenes[Math.min(place.i, scenes.length - 1)], t = s.from + place.k * (s.to - s.from);
    var y = place.after != null ? st.end + place.after * Math.max(0, rest) : st.start + (st.end - st.start) * (t / C);
    function jump() { scrollTo(0, y); ScrollTrigger.update(); }
    jump();
    /* pictures still loading can make the page re-measure itself; land in the same place again if that happens */
    var until = Date.now() + 5000, moved = false;
    addEventListener('wheel', function () { moved = true; }, { once: true, passive: true });
    addEventListener('touchstart', function () { moved = true; }, { once: true, passive: true });
    ScrollTrigger.addEventListener('refresh', function again() {
      if (moved || Date.now() > until) { ScrollTrigger.removeEventListener('refresh', again); return; }
      var st2 = tl.scrollTrigger, rest2 = document.documentElement.scrollHeight - innerHeight - st2.end;
      y = place.after != null ? st2.end + place.after * Math.max(0, rest2) : st2.start + (st2.end - st2.start) * (t / C);
      jump();
    });
  }

  var fontsDone = document.fonts.load ? Promise.all([
    document.fonts.load('400 40px "Bodoni Moda"'), document.fonts.load('italic 400 40px "Bodoni Moda"'), document.fonts.load('40px "Mrs Saint Delafield"'),
    document.fonts.load('40px "Rozha One"', 'मध्यांतर'), document.fonts.load('italic 400 40px "Cormorant Garamond"'), document.fonts.load('400 40px "Jost"')
  ]) : Promise.resolve();

  Promise.race([fontsDone, new Promise(function (r) { setTimeout(r, 6000); })]).then(function () {
    register();
    run();
    var first = ['assets/art/tree.webp', shot('hero'), 'assets/shots/hero-ink.webp'];
    var ready = false;
    Ink.preload(first, function (p) { if (p >= 1 && !ready) { ready = true; $('#hint').textContent = 'Press the seal to open'; } });
    setTimeout(function () { if (!ready) { ready = true; $('#hint').textContent = 'Press the seal to open'; } }, 7000);
    fitWords(); addEventListener('resize', fitWords);
    if (back && back.i != null) enterAt(back);
    $('#seal').addEventListener('click', function () {
      if (opened) return; opened = true;
      if (wantMusic) Score.start();
      open();
    });
  });
})();
