// ============================================================
// app.js — orquesta el juego de riego y el gran final (sin cambiar de pantalla)
// ============================================================
(function () {
  "use strict";

  const DATA = window.DATA || {};
  const RATE_PER_MS = 100 / 11000; // ~11s de riego sostenido para florecer del todo
  const AMBIANCE_INTERVAL_MS = 2200;

  // palabras bonitas para la lluvia final (nada de "te amo", a propósito)
  const LOVE_WORDS = [
    "te quiero", "amor", "mi vida", "mi niña", "malcriada", "mi sol",
    "pedacito de vida", "cariño", "mi cielo", "ternura", "mi persona",
    "corazón", "preciosa", "mi todo", "mi calma",
  ];

  // ---- referencias ----
  const svg = document.getElementById("flower-svg");
  const gardenScreen = document.getElementById("screen-garden");
  const gardenEl = document.getElementById("garden");
  const waterBtn = document.getElementById("water-btn");
  const wateringCan = document.getElementById("watering-can");
  const waterFill = document.getElementById("water-fill");
  const stageNum = document.getElementById("stage-num");
  const phraseBox = document.getElementById("phrase-box");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");

  // ---- estado ----
  let water = 0;
  let stage = 0;
  let watering = false;
  let bloomed = false;
  let lastTime = null;
  let ambianceTimer = null;

  // ============================================================
  // Poblar contenido personal
  // ============================================================
  function populateData() {
    setText("her-name", DATA.her || "ti");
    setText("intro-text", DATA.intro || "");
    setText("global-footer", DATA.footer || "");
    setText("pot-initials", DATA.initials || "");
    setText("final-message", DATA.finalMessage || "");
    setText("signature", DATA.signature || "");

    const songWrap = document.getElementById("song-link-wrap");
    const songLink = document.getElementById("song-link");
    if (DATA.song && DATA.song.url) {
      songLink.href = DATA.song.url;
      songLink.textContent = DATA.song.title || "Nuestra canción";
      songWrap.hidden = false;
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ============================================================
  // Pantallas
  // ============================================================
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  }

  // ============================================================
  // Frases
  // ============================================================
  function setPhrase(text) {
    if (!text) return;
    phraseBox.innerHTML = "";
    const span = document.createElement("span");
    span.className = "phrase";
    span.textContent = text;
    phraseBox.appendChild(span);
  }

  // ============================================================
  // Riego
  // ============================================================
  function updateCanPosition(clientX, clientY) {
    const rect = gardenEl.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const y = clamp(clientY - rect.top, 0, rect.height);
    wateringCan.style.left = x + "px";
    wateringCan.style.top = y + "px";
    wateringCan.classList.add("visible");
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function startWatering(clientX, clientY) {
    if (bloomed) return;
    watering = true;
    window.Petals.setWatering(true, clientX, clientY);
    updateCanPosition(clientX, clientY);
  }

  function moveWatering(clientX, clientY) {
    window.Petals.updateOrigin(clientX, clientY);
    updateCanPosition(clientX, clientY);
  }

  function stopWatering() {
    watering = false;
    window.Petals.setWatering(false);
    wateringCan.classList.remove("visible");
  }

  gardenEl.addEventListener("pointerdown", (e) => {
    gardenEl.setPointerCapture(e.pointerId);
    startWatering(e.clientX, e.clientY);
  });
  gardenEl.addEventListener("pointermove", (e) => {
    if (watering) moveWatering(e.clientX, e.clientY);
  });
  ["pointerup", "pointercancel"].forEach((evt) =>
    gardenEl.addEventListener(evt, stopWatering)
  );

  function wateringButtonOrigin() {
    const rect = gardenEl.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.12 };
  }

  waterBtn.addEventListener("pointerdown", (e) => {
    waterBtn.setPointerCapture(e.pointerId);
    const o = wateringButtonOrigin();
    startWatering(o.x, o.y);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((evt) =>
    waterBtn.addEventListener(evt, stopWatering)
  );
  waterBtn.addEventListener("keydown", (e) => {
    if ((e.code === "Space" || e.code === "Enter") && !watering) {
      e.preventDefault();
      const o = wateringButtonOrigin();
      startWatering(o.x, o.y);
    }
  });
  waterBtn.addEventListener("keyup", (e) => {
    if (e.code === "Space" || e.code === "Enter") stopWatering();
  });

  // ============================================================
  // Bucle de crecimiento
  // ============================================================
  function loop(ts) {
    if (lastTime === null) lastTime = ts;
    const dt = ts - lastTime;
    lastTime = ts;

    if (watering && water < 100) {
      water = Math.min(100, water + dt * RATE_PER_MS);
      waterFill.style.width = water + "%";

      const newStage = Math.min(5, Math.floor(water / 20));
      if (newStage > stage) {
        stage = newStage;
        window.Flower.setStage(svg, stage);
        stageNum.textContent = String(stage);
        if (stage >= 1 && DATA.phrases && DATA.phrases[stage - 1]) {
          setPhrase(DATA.phrases[stage - 1]);
        }
        if (navigator.vibrate) navigator.vibrate(10);
        if (stage === 5 && !bloomed) {
          bloomed = true;
          triggerBloom();
        }
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ============================================================
  // Gran final: pétalos + fuegos artificiales + lluvia de palabras.
  // Se queda en esta misma pantalla, no avanza sola.
  // ============================================================
  function triggerBloom() {
    stopWatering();
    const disc = svg.querySelector("#center-disc");
    const rect = disc.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // ráfaga grande inicial
    window.Petals.burstBloom(cx, cy);
    window.Petals.fireworks(cx, cy);
    setTimeout(() => window.Petals.fireworks(cx - 90, cy - 60), 250);
    setTimeout(() => window.Petals.fireworks(cx + 90, cy - 40), 500);
    setTimeout(() => window.Petals.fireworks(cx, cy - 110), 750);
    setTimeout(() => window.Petals.burstBloom(cx - 60, cy - 20), 900);
    setTimeout(() => window.Petals.fireworks(cx - 50, cy - 90), 1050);
    setTimeout(() => window.Petals.fireworks(cx + 50, cy - 70), 1300);

    window.Petals.startWordRain(LOVE_WORDS);
    window.Petals.startHeartRain();

    // se queda ahí: la fiesta continúa mientras la vea
    ambianceTimer = setInterval(() => {
      const ox = cx + (Math.random() - 0.5) * 240;
      const oy = Math.max(60, cy - 40 - Math.random() * 180);
      window.Petals.fireworks(ox, oy);
      if (Math.random() < 0.6) {
        window.Petals.burstBloom(cx + (Math.random() - 0.5) * 160, cy - Math.random() * 30);
      }
    }, AMBIANCE_INTERVAL_MS);

    gardenScreen.classList.add("bloomed");
  }

  function stopAmbiance() {
    if (ambianceTimer) {
      clearInterval(ambianceTimer);
      ambianceTimer = null;
    }
    window.Petals.stopWordRain();
    window.Petals.stopHeartRain();
  }

  // ============================================================
  // Navegación
  // ============================================================
  startBtn.addEventListener("click", () => showScreen("screen-garden"));

  restartBtn.addEventListener("click", () => {
    stopAmbiance();
    water = 0;
    stage = 0;
    bloomed = false;
    watering = false;
    waterFill.style.width = "0%";
    stageNum.textContent = "0";
    phraseBox.innerHTML = "";
    gardenScreen.classList.remove("bloomed");
    window.Flower.setStage(svg, 0);
    showScreen("screen-intro");
  });

  // ============================================================
  // Init
  // ============================================================
  window.Flower.init(svg);
  window.Flower.setStage(svg, 0);
  populateData();
})();
