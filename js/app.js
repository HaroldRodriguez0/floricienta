// ============================================================
// app.js — orquesta el juego de riego, las pantallas y las acciones finales
// ============================================================
(function () {
  "use strict";

  const DATA = window.DATA || {};
  const RATE_PER_MS = 100 / 11000; // ~11s de riego sostenido para florecer del todo

  // ---- referencias ----
  const svg = document.getElementById("flower-svg");
  const gardenEl = document.getElementById("garden");
  const waterBtn = document.getElementById("water-btn");
  const wateringCan = document.getElementById("watering-can");
  const waterFill = document.getElementById("water-fill");
  const stageNum = document.getElementById("stage-num");
  const phraseBox = document.getElementById("phrase-box");
  const startBtn = document.getElementById("start-btn");
  const skipLink = document.getElementById("skip-link");
  const restartBtn = document.getElementById("restart-btn");
  const saveBtn = document.getElementById("save-btn");
  const shareBtn = document.getElementById("share-btn");

  // ---- estado ----
  let water = 0;
  let stage = 0;
  let watering = false;
  let bloomed = false;
  let lastTime = null;

  // ============================================================
  // Poblar contenido personal
  // ============================================================
  function populateData() {
    setText("her-name", DATA.her || "ti");
    setText("intro-text", DATA.intro || "");
    setText("pot-initials", DATA.initials || "");
    setText("final-message", DATA.finalMessage || "");
    setText("signature", DATA.signature || "");

    const daysEl = document.getElementById("days-together");
    if (DATA.since) {
      const since = new Date(DATA.since + "T00:00:00");
      if (!isNaN(since.getTime())) {
        const days = Math.max(
          0,
          Math.floor((Date.now() - since.getTime()) / 86400000)
        );
        daysEl.textContent = `Llevamos ${days} día${days === 1 ? "" : "s"} juntos`;
      } else {
        daysEl.style.display = "none";
      }
    } else {
      daysEl.style.display = "none";
    }

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

  function triggerBloom() {
    stopWatering();
    const disc = svg.querySelector("#center-disc");
    const rect = disc.getBoundingClientRect();
    window.Petals.burstBloom(rect.left + rect.width / 2, rect.top + rect.height / 2);
    setTimeout(() => showScreen("screen-final"), 3200);
  }

  // ============================================================
  // Navegación
  // ============================================================
  startBtn.addEventListener("click", () => showScreen("screen-garden"));

  skipLink.addEventListener("click", (e) => {
    e.preventDefault();
    showScreen("screen-final");
  });

  restartBtn.addEventListener("click", () => {
    water = 0;
    stage = 0;
    bloomed = false;
    watering = false;
    waterFill.style.width = "0%";
    stageNum.textContent = "0";
    phraseBox.innerHTML = "";
    window.Flower.setStage(svg, 0);
    showScreen("screen-intro");
  });

  // ============================================================
  // Guardar como imagen
  // ============================================================
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(" ");
    const lines = [];
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
    return lines.length;
  }

  saveBtn.addEventListener("click", () => {
    const serializer = new XMLSerializer();
    const clone = svg.cloneNode(true);
    clone.setAttribute("data-stage", "5");
    const svgStr = serializer.serializeToString(clone);
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const W = 1080;
      const H = 1350;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const c = canvas.getContext("2d");

      const bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#FFFBF0");
      bg.addColorStop(1, "#FDF3DC");
      c.fillStyle = bg;
      c.fillRect(0, 0, W, H);

      const glow = c.createRadialGradient(W / 2, -80, 50, W / 2, -80, W * 0.9);
      glow.addColorStop(0, "rgba(255,243,196,0.95)");
      glow.addColorStop(1, "rgba(255,243,196,0)");
      c.fillStyle = glow;
      c.fillRect(0, 0, W, H * 0.55);

      const aspect = 400 / 460;
      const drawW = W * 0.72;
      const drawH = drawW / aspect;
      const dx = (W - drawW) / 2;
      const dy = H * 0.12;
      c.drawImage(img, dx, dy, drawW, drawH);

      c.fillStyle = "#3B2F1E";
      c.textAlign = "center";
      c.font = "italic 42px 'Playfair Display', Georgia, serif";
      const lineCount = wrapText(
        c,
        DATA.finalMessage || "",
        W / 2,
        dy + drawH + 100,
        W * 0.78,
        56
      );

      c.fillStyle = "#E0A800";
      c.font = "56px 'Caveat', cursive";
      c.fillText(DATA.signature || "", W / 2, dy + drawH + 100 + lineCount * 32 + 90);

      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mi-flor-amarilla.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    };
    img.src = url;
  });

  // ============================================================
  // Compartir
  // ============================================================
  shareBtn.addEventListener("click", async () => {
    const url = window.location.href;
    const text = `${DATA.her || ""}, tienes una flor amarilla esperándote 🌻`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Una flor amarilla para ti", text, url });
        return;
      } catch (e) {
        /* usuario canceló, no hacer nada */
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flashShareLabel("¡Enlace copiado!");
    } catch (e) {
      flashShareLabel(url);
    }
  });

  function flashShareLabel(msg) {
    const original = shareBtn.textContent;
    shareBtn.textContent = msg;
    setTimeout(() => (shareBtn.textContent = original), 2200);
  }

  // ============================================================
  // Init
  // ============================================================
  window.Flower.init(svg);
  window.Flower.setStage(svg, 0);
  populateData();
})();
