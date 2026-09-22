// ============================================================
// petals.js — canvas de partículas: gotas de agua + lluvia de pétalos
// ============================================================
(function () {
  "use strict";

  const canvas = document.getElementById("fx-canvas");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let drops = [];
  let rainPetals = [];
  let watering = false;
  let waterOrigin = { x: 0, y: 0 };
  let rafId = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function makeDrop() {
    return {
      x: waterOrigin.x + (Math.random() - 0.5) * 18,
      y: waterOrigin.y,
      vy: 2 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.6,
      life: 0,
      maxLife: 40 + Math.random() * 20,
      size: 3 + Math.random() * 2,
    };
  }

  function makeRainPetal(burstX, burstY) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    return {
      x: burstX,
      y: burstY,
      vx: Math.cos(angle) * speed * 0.6,
      vy: -Math.abs(Math.sin(angle) * speed) - 2,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.15,
      size: 6 + Math.random() * 6,
      gravity: 0.05 + Math.random() * 0.03,
      drift: Math.random() * Math.PI * 2,
      life: 0,
      maxLife: 220 + Math.random() * 120,
      color: Math.random() > 0.5 ? "#F5C518" : "#FFD84D",
    };
  }

  function drawDrop(d) {
    const alpha = 1 - d.life / d.maxLife;
    ctx.globalAlpha = Math.max(alpha, 0);
    ctx.fillStyle = "#7FB8E8";
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, d.size * 0.6, d.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawPetal(p) {
    const alpha = p.life > p.maxLife - 40 ? Math.max(0, (p.maxLife - p.life) / 40) : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);

    if (watering && !reduceMotion && Math.random() < 0.55) {
      drops.push(makeDrop());
    }

    drops = drops.filter((d) => d.life < d.maxLife && d.y < height + 20);
    for (const d of drops) {
      d.x += d.vx;
      d.y += d.vy;
      d.vy += 0.15;
      d.life++;
      drawDrop(d);
    }

    rainPetals = rainPetals.filter((p) => p.life < p.maxLife && p.y < height + 40);
    for (const p of rainPetals) {
      p.life++;
      p.vy += p.gravity;
      p.x += p.vx + Math.sin(p.life * 0.05 + p.drift) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;
      drawPetal(p);
    }

    if (drops.length || rainPetals.length) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  function ensureLoop() {
    if (rafId === null) {
      rafId = requestAnimationFrame(tick);
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && (drops.length || rainPetals.length || watering)) {
      ensureLoop();
    }
  });

  window.Petals = {
    setWatering(on, x, y) {
      watering = on;
      if (typeof x === "number") waterOrigin = { x, y };
      if (on) ensureLoop();
    },
    updateOrigin(x, y) {
      waterOrigin = { x, y };
    },
    burstBloom(x, y) {
      const count = reduceMotion ? 12 : 60;
      for (let i = 0; i < count; i++) {
        rainPetals.push(makeRainPetal(x, y));
      }
      ensureLoop();
    },
  };
})();
