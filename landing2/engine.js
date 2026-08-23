/* engine.js — Ultra-Fluid GSAP Scrubbing Controller for HD Canvas & Transparent Video */

(function () {
  'use strict';

  const canvas = document.getElementById('scroller-canvas');
  const video = document.getElementById('app-scroller-video');
  const spotlight = document.getElementById('ambient-spotlight');
  const hudBar = document.getElementById('hud-bar');
  const hudValue = document.getElementById('hud-value');
  const chapters = document.querySelectorAll('.chapter');

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Setup Lenis Smooth Scroll com GSAP Ticker
  const lenis = new Lenis({
    lerp: reduce ? 1 : 0.07,
    smoothWheel: !reduce,
    wheelMultiplier: 0.9
  });

  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // 2. Animações de Entrada de Texto com Easing Suave no GSAP
  chapters.forEach((chapter) => {
    const inner = chapter.querySelector('.chapter-inner');
    if (!inner) return;

    gsap.fromTo(inner, 
      { autoAlpha: 0, y: reduce ? 0 : 35 },
      {
        autoAlpha: 1,
        y: 0,
        duration: reduce ? 0.01 : 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: chapter,
          start: 'top 75%',
          end: 'bottom 25%',
          toggleActions: 'play reverse play reverse'
        }
      }
    );
  });

  // 3. GSAP Canvas Scrubber Engine (Inércia Física Nativa do GSAP)
  const frameCount = 300;
  const images = [];
  let loadedCount = 0;

  if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Objeto proxy para o GSAP animar
    const playhead = { frame: 0 };

    function drawFrame(index) {
      const img = images[index];
      if (img && img.complete && img.naturalWidth) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }

    // Carregamento dos quadros HD WebP
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const num = String(i).padStart(4, '0');
      img.src = `assets/frames/frame-${num}.webp`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) {
          drawFrame(0);
          if (video) video.style.display = 'none';
        }
      };
      images.push(img);
    }

    // GSAP Tweening com `scrub: 0.8` (Amortecimento Físico de 0.8s)
    gsap.to(playhead, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        trigger: '.col-text',
        start: 'top top',
        end: 'bottom bottom',
        scrub: reduce ? true : 0.8, // Inércia do GSAP
        onUpdate: (self) => {
          const frameIndex = Math.round(playhead.frame);
          drawFrame(frameIndex);

          // Atualizar HUD
          const progress = self.progress;
          if (hudBar) hudBar.style.transform = `scaleY(${progress})`;
          if (hudValue) hudValue.textContent = Math.round(progress * 100) + '%';

          // Transição de Spotlights
          if (!spotlight) return;
          if (progress < 0.2) {
            spotlight.className = 'spotlight hero-glow';
          } else if (progress >= 0.2 && progress < 0.45) {
            spotlight.className = 'spotlight cyan-glow';
          } else {
            spotlight.className = 'spotlight golden-glow';
          }
        }
      }
    });
  }

  window.__ENGINE_READY__ = true;
})();
