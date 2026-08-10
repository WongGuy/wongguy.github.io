// Renders the knob (SVG, built from screwData) and the side spec panel.
// See data.js to edit the underlying table.

(function () {
  const SWEEP_DEG = 270; // total rotation range of the dial
  const START_DEG = -135; // angle of the first step, measured from 12 o'clock
  const RADIUS = 70;
  const CENTER = 90;
  const SVG_SIZE = 180;

  const knobEl = document.getElementById("knob");
  const readoutEl = document.getElementById("knob-size-readout");
  const panelEl = document.getElementById("spec-panel");

  let selectedIndex = Math.floor(screwData.length / 2);

  function angleForIndex(i) {
    if (screwData.length === 1) return START_DEG + SWEEP_DEG / 2;
    return START_DEG + (SWEEP_DEG * i) / (screwData.length - 1);
  }

  function polar(angleDeg, r) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
  }

  function buildKnobSvg() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", SVG_SIZE);
    svg.setAttribute("height", SVG_SIZE);
    svg.setAttribute("viewBox", `0 0 ${SVG_SIZE} ${SVG_SIZE}`);
    svg.setAttribute("class", "knob");
    svg.setAttribute("role", "slider");
    svg.setAttribute("tabindex", "0");
    svg.setAttribute("aria-label", "Select major diameter");
    svg.setAttribute("aria-valuemin", "0");
    svg.setAttribute("aria-valuemax", String(screwData.length - 1));

    // Dial body
    const dial = document.createElementNS(svgNS, "circle");
    dial.setAttribute("cx", CENTER);
    dial.setAttribute("cy", CENTER);
    dial.setAttribute("r", RADIUS);
    dial.setAttribute("fill", "#2a2e37");
    dial.setAttribute("stroke", "#3a3f4a");
    dial.setAttribute("stroke-width", "2");
    svg.appendChild(dial);

    // Tick marks + labels
    screwData.forEach((row, i) => {
      const angle = angleForIndex(i);
      const outer = polar(angle, RADIUS);
      const inner = polar(angle, RADIUS - 8);
      const tick = document.createElementNS(svgNS, "line");
      tick.setAttribute("x1", inner.x);
      tick.setAttribute("y1", inner.y);
      tick.setAttribute("x2", outer.x);
      tick.setAttribute("y2", outer.y);
      tick.setAttribute("stroke", "#565c68");
      tick.setAttribute("stroke-width", "1.5");
      tick.setAttribute("data-tick-index", String(i));
      svg.appendChild(tick);

      const labelPos = polar(angle, RADIUS + 12);
      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", labelPos.x);
      label.setAttribute("y", labelPos.y);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("class", "knob-tick-label");
      label.setAttribute("data-label-index", String(i));
      label.textContent = row.size;
      svg.appendChild(label);
    });

    // Needle
    const needle = document.createElementNS(svgNS, "line");
    needle.setAttribute("id", "knob-needle");
    needle.setAttribute("x1", CENTER);
    needle.setAttribute("y1", CENTER);
    needle.setAttribute("stroke", "#4fa3ff");
    needle.setAttribute("stroke-width", "3");
    needle.setAttribute("stroke-linecap", "round");
    svg.appendChild(needle);

    const hub = document.createElementNS(svgNS, "circle");
    hub.setAttribute("cx", CENTER);
    hub.setAttribute("cy", CENTER);
    hub.setAttribute("r", 6);
    hub.setAttribute("fill", "#4fa3ff");
    svg.appendChild(hub);

    knobEl.appendChild(svg);
    return svg;
  }

  function updateNeedle() {
    const angle = angleForIndex(selectedIndex);
    const tip = polar(angle, RADIUS - 10);
    const needle = document.getElementById("knob-needle");
    needle.setAttribute("x2", tip.x);
    needle.setAttribute("y2", tip.y);

    document.querySelectorAll(".knob-tick-label").forEach((el) => {
      el.classList.toggle(
        "active",
        Number(el.dataset.labelIndex) === selectedIndex
      );
    });
  }

  function renderPanel() {
    const row = screwData[selectedIndex];
    readoutEl.textContent = row.size;

    const rowsHtml = screwFields
      .map(
        (f) =>
          `<tr><td>${f.label}</td><td>${row[f.key]} ${f.unit}</td></tr>`
      )
      .join("");

    panelEl.innerHTML = `
      <table>
        <caption>${row.size} — major ⌀ ${row.size.replace("M", "")} mm</caption>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
  }

  function setIndex(i) {
    selectedIndex = Math.max(0, Math.min(screwData.length - 1, i));
    updateNeedle();
    renderPanel();
    svgEl.setAttribute("aria-valuenow", String(selectedIndex));
    svgEl.setAttribute("aria-valuetext", screwData[selectedIndex].size);
  }

  const svgEl = buildKnobSvg();

  // Pointer drag rotation
  let dragging = false;

  function angleFromPointer(evt) {
    const rect = svgEl.getBoundingClientRect();
    const scale = SVG_SIZE / rect.width;
    const x = (evt.clientX - rect.left) * scale - CENTER;
    const y = (evt.clientY - rect.top) * scale - CENTER;
    let deg = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (deg > 180) deg -= 360;
    if (deg < -180) deg += 360;
    return deg;
  }

  function nearestIndexForAngle(deg) {
    const clamped = Math.max(START_DEG, Math.min(START_DEG + SWEEP_DEG, deg));
    const ratio = (clamped - START_DEG) / SWEEP_DEG;
    return Math.round(ratio * (screwData.length - 1));
  }

  svgEl.addEventListener("pointerdown", (evt) => {
    dragging = true;
    svgEl.setPointerCapture(evt.pointerId);
    setIndex(nearestIndexForAngle(angleFromPointer(evt)));
  });

  svgEl.addEventListener("pointermove", (evt) => {
    if (!dragging) return;
    setIndex(nearestIndexForAngle(angleFromPointer(evt)));
  });

  svgEl.addEventListener("pointerup", () => {
    dragging = false;
  });

  svgEl.addEventListener("keydown", (evt) => {
    if (evt.key === "ArrowRight" || evt.key === "ArrowUp") {
      evt.preventDefault();
      setIndex(selectedIndex + 1);
    } else if (evt.key === "ArrowLeft" || evt.key === "ArrowDown") {
      evt.preventDefault();
      setIndex(selectedIndex - 1);
    }
  });

  svgEl.addEventListener(
    "wheel",
    (evt) => {
      evt.preventDefault();
      setIndex(selectedIndex + (evt.deltaY > 0 ? -1 : 1));
    },
    { passive: false }
  );

  setIndex(selectedIndex);
})();
