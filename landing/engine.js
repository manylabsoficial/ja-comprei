/* ============================================================================
 * frameseq.js — the EXACT PDF technique: a canvas frame-sequence scrubber.
 * "this scrolling effect ... is technically a video separated into multiple
 *  frames" [VIDEO]. Scroll progress → frame index → drawImage on a canvas.
 * Consumes the frames written by the ASSETS stage (real Seedance decode, or
 * procedural SVG placeholders). window.__STORY__.frames describes them.
 * ==========================================================================*/
(function () {
  'use strict';
  const STORY = window.__STORY__;
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  // The frame scrub itself is already 100% scroll-driven (no idle/ambient
  // motion to strip, unlike engine.js's dt-based particle drift). What's left
  // to respect prefers-reduced-motion: Lenis's inertia/lag, and the GSAP
  // slide-in on each chapter's text.
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Two frame sequences may ship: the desktop landscape set (STORY.frames) and,
  // when the brief provided portrait re-shoots, a mobile set (STORY.framesVertical)
  // — the landscape frames crop badly cover-fit into a narrow canvas. We pick by
  // viewport width AND keep re-picking whenever the page crosses the 767px
  // breakpoint (resize on desktop, orientation change on a phone), swapping the
  // video live. Each set is loaded lazily the first time it's actually needed and
  // then cached, so a phone never downloads the desktop frames and vice-versa.
  const DEFAULT = { count: 48, dir: 'assets/frames', pattern: 'frame-%03d.svg' };
  const mobileMQ = window.matchMedia ? window.matchMedia('(max-width: 767px)') : null;

  function descFor(isMobile) {
    return (isMobile && STORY.framesVertical) ? STORY.framesVertical : (STORY.frames || DEFAULT);
  }

  // dir → { F, imgs } — one cached, fully-requested image set per frame directory.
  const sets = new Map();
  function loadSet(desc) {
    const cached = sets.get(desc.dir);
    if (cached) return cached;
    const pad = (desc.pattern.match(/%0(\d+)/) || [, '3'])[1] | 0;
    const ext = desc.pattern.split('.').pop();
    const imgs = [];
    const entry = { F: desc, imgs };
    for (let i = 0; i < desc.count; i++) {
      const im = new Image();
      // first frame of whichever set is currently on-screen triggers a resize
      // so the initial paint fits the (possibly just-swapped) canvas.
      im.onload = () => { if (entry === active) resize(); };
      im.src = `${desc.dir}/frame-${String(i).padStart(pad, '0')}.${ext}`;
      imgs.push(im);
    }
    sets.set(desc.dir, entry);
    return entry;
  }

  // `active` is the set draw() reads from; it's mutable so the breakpoint handler
  // can swap it live. Starts on whatever matches the load-time viewport.
  let active = loadSet(descFor(mobileMQ ? mobileMQ.matches : false));

  function applyBreakpoint() {
    const want = descFor(mobileMQ ? mobileMQ.matches : false);
    if (want.dir === active.F.dir) return;
    active = loadSet(want); // lazy-load the other set the first time we cross over
    resize();
  }
  if (mobileMQ) {
    if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', applyBreakpoint);
    else if (mobileMQ.addListener) mobileMQ.addListener(applyBreakpoint); // older Safari
  }

  function resize() {
    canvas.width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
    canvas.height = window.innerHeight * Math.min(window.devicePixelRatio || 1, 2);
    // Resizing resets 2d-context state — re-enable high-quality resampling so
    // the cover-fit upscale doesn't pixelate on Retina backing stores.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  window.addEventListener('resize', resize); resize();

  let progress = 0;
  const lenis = new Lenis({ lerp: reduce ? 1 : 0.09, smoothWheel: !reduce });
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('.chapter').forEach((el) => {
    gsap.fromTo(el.querySelector('.chapter-inner'), { autoAlpha: 0, y: reduce ? 0 : 48 }, { autoAlpha: 1, y: 0, duration: reduce ? 0.01 : 1,
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 40%', toggleActions: 'play reverse play reverse' } });
  });

  const hudValue = document.getElementById('hud-value');
  const hudBar = document.getElementById('hud-bar');
  // HUD value: piecewise-linear between the sections' hudValues (supports
  // non-linear and non-monotonic counters, e.g. parts 1 → 847 → 1). Falls back
  // to a global from→to lerp when sections carry no usable values.
  const hudStops = (STORY.sections || []).filter((s) => typeof s.hudValue === 'number');
  function hudAt(pr) {
    if (hudStops.length < 2) return STORY.hud.from + (STORY.hud.to - STORY.hud.from) * pr;
    let a = hudStops[0], b = hudStops[hudStops.length - 1];
    for (let i = 0; i < hudStops.length - 1; i++) {
      if (pr >= hudStops[i].start && pr <= hudStops[i + 1].start) { a = hudStops[i]; b = hudStops[i + 1]; break; }
    }
    const t = Math.min(1, Math.max(0, (pr - a.start) / ((b.start - a.start) || 1)));
    return a.hudValue + (b.hudValue - a.hudValue) * t;
  }
  function draw() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const F = active.F, imgs = active.imgs;
    const idx = Math.round(progress * (F.count - 1));
    const im = imgs[idx];
    if (im && im.complete && im.naturalWidth) {
      // cover-fit
      const cw = canvas.width, ch = canvas.height, iw = im.naturalWidth, ih = im.naturalHeight;
      const s = Math.max(cw / iw, ch / ih);
      const w = iw * s, h = ih * s;
      ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    if (hudValue && STORY.hud) {
      const v = Math.round(hudAt(progress));
      hudValue.textContent = v.toLocaleString() + (STORY.hud.unit ? ' ' + STORY.hud.unit : '');
    }
    if (hudBar) hudBar.style.transform = `scaleY(${progress})`;
    window.__RENDERED__ = (window.__RENDERED__ || 0) + 1;
    window.__PROGRESS__ = progress;
    requestAnimationFrame(draw);
  }
  window.__scrollTo = (frac) => { const max = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo(0, max * frac); lenis.scrollTo(max * frac, { immediate: true }); };
  requestAnimationFrame(draw);
  window.__ENGINE_READY__ = true;
})();
