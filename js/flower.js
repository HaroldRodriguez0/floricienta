// ============================================================
// flower.js — construye los pétalos de la rosa y expone setStage()
// ============================================================
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const PETAL_COUNT = 14;
  // silueta tipo pétalo de rosa: redondeado arriba, con un pequeño pico central
  const PETAL_PATH =
    "M0,0 C-16,-6 -18,-24 -6,-34 C-2,-38 2,-38 6,-34 C18,-24 16,-6 0,0 Z";
  const CENTER_PETAL_COUNT = 7; // pétalos diminutos del capullo/centro

  function buildPetals(svg) {
    const group = svg.querySelector("#petals");
    if (!group) return;
    group.innerHTML = "";
    for (let i = 0; i < PETAL_COUNT; i++) {
      const angle = (360 / PETAL_COUNT) * i;
      const slot = document.createElementNS(NS, "g");
      slot.setAttribute("class", "petal-slot");
      slot.style.transform = `rotate(${angle}deg)`;

      const petal = document.createElementNS(NS, "path");
      petal.setAttribute("class", "petal");
      petal.setAttribute("d", PETAL_PATH);
      // pequeño escalonado para que no abran todas a la vez
      petal.style.transitionDelay = (i * 0.035).toFixed(3) + "s";

      slot.appendChild(petal);
      group.appendChild(slot);
    }
  }

  // pequeño remolino de pétalos apretados en el centro, como un capullo de rosa
  function buildCenterBud(svg) {
    const group = svg.querySelector("#center-dots");
    if (!group) return;
    group.innerHTML = "";
    for (let i = 0; i < CENTER_PETAL_COUNT; i++) {
      const angle = (360 / CENTER_PETAL_COUNT) * i + 14;
      const slot = document.createElementNS(NS, "g");
      slot.setAttribute("class", "center-petal-slot");
      slot.style.transform = `rotate(${angle}deg)`;

      const petal = document.createElementNS(NS, "path");
      petal.setAttribute("class", "center-petal");
      petal.setAttribute("d", PETAL_PATH);
      petal.style.transitionDelay = (i * 0.05).toFixed(3) + "s";

      slot.appendChild(petal);
      group.appendChild(slot);
    }
  }

  function setStage(svg, stage) {
    svg.dataset.stage = String(stage);
  }

  window.Flower = {
    PETAL_COUNT,
    init(svg) {
      buildPetals(svg);
      buildCenterBud(svg);
    },
    setStage,
  };
})();
