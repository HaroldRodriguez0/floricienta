// ============================================================
// flower.js — construye los pétalos del SVG y expone setStage()
// ============================================================
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const PETAL_COUNT = 14;
  const DOT_RINGS = [4, 8, 12]; // radios de los anillos de semillas del centro

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
      petal.setAttribute(
        "d",
        "M0,0 C -9,-16 -8,-32 0,-42 C 8,-32 9,-16 0,0 Z"
      );
      // pequeño escalonado para que no abran todas a la vez
      petal.style.transitionDelay = (i * 0.035).toFixed(3) + "s";

      slot.appendChild(petal);
      group.appendChild(slot);
    }
  }

  function buildCenterDots(svg) {
    const group = svg.querySelector("#center-dots");
    if (!group) return;
    group.innerHTML = "";
    let count = 0;
    DOT_RINGS.forEach((radius, ringIndex) => {
      const dotsInRing = 6 + ringIndex * 4;
      for (let i = 0; i < dotsInRing; i++) {
        const angle = (2 * Math.PI * i) / dotsInRing;
        const cx = Math.cos(angle) * radius;
        const cy = Math.sin(angle) * radius;
        const dot = document.createElementNS(NS, "circle");
        dot.setAttribute("cx", cx.toFixed(2));
        dot.setAttribute("cy", cy.toFixed(2));
        dot.setAttribute("r", 1.4);
        dot.setAttribute("fill", "#7A4E12");
        dot.style.transitionDelay = (count * 0.015).toFixed(3) + "s";
        group.appendChild(dot);
        count++;
      }
    });
  }

  function setStage(svg, stage) {
    svg.dataset.stage = String(stage);
  }

  window.Flower = {
    PETAL_COUNT,
    init(svg) {
      buildPetals(svg);
      buildCenterDots(svg);
    },
    setStage,
  };
})();
