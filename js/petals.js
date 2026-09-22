// ============================================================
// petals.js — canvas de partículas: gotas de agua, lluvia de pétalos,
// fuegos artificiales y lluvia de palabras bonitas para el final
// ============================================================
(function () {
  "use strict";

  const canvas = document.getElementById("fx-canvas");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const FIREWORK_COLORS = ["#FFF6D8", "#FFD84D", "#F5C518", "#E0A800", "#FFB347"];
  const WORD_COLORS = ["#E0A800", "#C9860A", "#B5750A", "#D99A1B"];
  const HEART_COLORS = ["#E0A800", "#FFD84D", "#FF8C69"];

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let drops = [];
  let rainPetals = [];
  let sparks = [];
  let wordParticles = [];
  let heartParticles = [];
  let watering = false;
  let waterOrigin = { x: 0, y: 0 };
  let wordRainActive = false;
  let wordList = [];
  let wordSpawnTimer = 0;
  let heartRainActive = false;
  let heartSpawnTimer = 0;
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

  // ---------------- gotas de agua ----------------
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
  function drawDrop(d) {
    const alpha = 1 - d.life / d.maxLife;
    ctx.globalAlpha = Math.max(alpha, 0);
    ctx.fillStyle = "#7FB8E8";
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, d.size * 0.6, d.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ---------------- lluvia de pétalos ----------------
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

  // ---------------- fuegos artificiales ----------------
  function makeSpark(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4.5;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 45 + Math.random() * 30,
      size: 2 + Math.random() * 2.5,
      color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
    };
  }
  function drawSpark(p) {
    const alpha = Math.max(0, 1 - p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---------------- lluvia de palabras ----------------
  function makeWordParticle(word) {
    return {
      word,
      x: 20 + Math.random() * (width - 40),
      y: -30,
      vy: 0.5 + Math.random() * 0.45,
      drift: Math.random() * Math.PI * 2,
      driftSpeed: 0.3 + Math.random() * 0.4,
      size: 20 + Math.random() * 12,
      rotation: (Math.random() - 0.5) * 0.3,
      color: WORD_COLORS[Math.floor(Math.random() * WORD_COLORS.length)],
      life: 0,
      maxLife: 650 + Math.random() * 300,
    };
  }
  function drawWord(p) {
    let alpha = 1;
    if (p.life < 40) alpha = p.life / 40;
    else if (p.life > p.maxLife - 60) alpha = Math.max(0, (p.maxLife - p.life) / 60);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.font = `600 ${p.size}px 'Caveat', cursive`;
    ctx.textAlign = "center";
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillText(p.word, 0, 0);
    ctx.restore();
  }

  // ---------------- lluvia de corazones ----------------
  function makeHeartParticle() {
    return {
      x: 20 + Math.random() * (width - 40),
      y: -20,
      vy: 0.6 + Math.random() * 0.5,
      drift: Math.random() * Math.PI * 2,
      driftSpeed: 0.3 + Math.random() * 0.4,
      size: 10 + Math.random() * 10,
      rotation: (Math.random() - 0.5) * 0.6,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      life: 0,
      maxLife: 500 + Math.random() * 300,
    };
  }
  function drawHeart(p) {
    let alpha = 1;
    if (p.life < 30) alpha = p.life / 30;
    else if (p.life > p.maxLife - 50) alpha = Math.max(0, (p.maxLife - p.life) / 50);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    const s = p.size;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s, -s * 0.4, -s * 0.5, -s, 0, -s * 0.32);
    ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.4, 0, s * 0.35);
    ctx.fill();
    ctx.restore();
  }

  // ---------------- bucle principal ----------------
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

    sparks = sparks.filter((p) => p.life < p.maxLife);
    for (const p of sparks) {
      p.life++;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.vy += 0.03;
      p.x += p.vx;
      p.y += p.vy;
      drawSpark(p);
    }

    if (wordRainActive) {
      wordSpawnTimer++;
      const cap = reduceMotion ? 6 : 14;
      if (wordSpawnTimer > 45 && wordParticles.length < cap && wordList.length) {
        wordSpawnTimer = 0;
        const w = wordList[Math.floor(Math.random() * wordList.length)];
        wordParticles.push(makeWordParticle(w));
      }
    }
    wordParticles = wordParticles.filter((p) => p.life < p.maxLife && p.y < height + 40);
    for (const p of wordParticles) {
      p.life++;
      p.y += p.vy;
      p.x += Math.sin(p.life * 0.02 * p.driftSpeed + p.drift) * 0.5;
      drawWord(p);
    }

    if (heartRainActive) {
      heartSpawnTimer++;
      const cap = reduceMotion ? 5 : 12;
      if (heartSpawnTimer > 38 && heartParticles.length < cap) {
        heartSpawnTimer = 0;
        heartParticles.push(makeHeartParticle());
      }
    }
    heartParticles = heartParticles.filter((p) => p.life < p.maxLife && p.y < height + 40);
    for (const p of heartParticles) {
      p.life++;
      p.y += p.vy;
      p.x += Math.sin(p.life * 0.02 * p.driftSpeed + p.drift) * 0.5;
      drawHeart(p);
    }

    if (
      drops.length ||
      rainPetals.length ||
      sparks.length ||
      wordRainActive ||
      wordParticles.length ||
      heartRainActive ||
      heartParticles.length
    ) {
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
    } else if (!document.hidden && (drops.length || rainPetals.length || sparks.length || watering || wordRainActive || heartRainActive)) {
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
    fireworks(x, y) {
      const count = reduceMotion ? 14 : 70;
      for (let i = 0; i < count; i++) {
        sparks.push(makeSpark(x, y));
      }
      ensureLoop();
    },
    startWordRain(words) {
      wordList = (words || []).slice();
      wordRainActive = true;
      ensureLoop();
    },
    stopWordRain() {
      wordRainActive = false;
    },
    startHeartRain() {
      heartRainActive = true;
      ensureLoop();
    },
    stopHeartRain() {
      heartRainActive = false;
    },
  };
})();
