// Renders the size slider (native range input, driven by nutData) and the
// side spec panels. See nut-data.js to edit the underlying table.

(function () {
  const sliderEl = document.getElementById("size-slider");
  const ticksEl = document.getElementById("slider-ticks");
  const readoutEl = document.getElementById("size-readout");
  const minLabelEl = document.getElementById("slider-min-label");
  const maxLabelEl = document.getElementById("slider-max-label");
  const stdPanelEl = document.getElementById("std-spec-panel");
  const tallPanelEl = document.getElementById("tall-spec-panel");
  const thinPanelEl = document.getElementById("thin-spec-panel");
  const flangedPanelEl = document.getElementById("flanged-spec-panel");

  const maxIndex = nutData.length - 1;
  sliderEl.max = String(maxIndex);
  minLabelEl.textContent = nutData[0].size;
  maxLabelEl.textContent = nutData[maxIndex].size;

  const SLIDER_STORAGE_KEY = "nutSliderIndex";

  function getStoredIndex() {
    const stored = Number(localStorage.getItem(SLIDER_STORAGE_KEY));
    if (Number.isInteger(stored) && stored >= 0 && stored <= maxIndex) {
      return stored;
    }
    return Math.floor(nutData.length / 2);
  }

  let selectedIndex = getStoredIndex();

  function getThumbWidth() {
    const raw = getComputedStyle(sliderEl).getPropertyValue("--thumb-width");
    return parseFloat(raw) || 0;
  }

  const measureCanvas = document.createElement("canvas");
  function measureTextWidth(text, font, letterSpacing) {
    const ctx = measureCanvas.getContext("2d");
    ctx.font = font;
    return ctx.measureText(text).width + (letterSpacing || 0) * text.length;
  }

  // Locks the readout box to the exact pixel width of the widest possible
  // size label at the current font (which changes across the mobile
  // breakpoint), so switching between e.g. "M6" and "M1.6" never resizes the
  // box — and therefore never steals width from the slider track next to it.
  function updateReadoutWidth() {
    const style = getComputedStyle(readoutEl);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const letterSpacing = parseFloat(style.letterSpacing) || 0;
    const maxWidth = nutData.reduce((max, row) => {
      return Math.max(max, measureTextWidth(row.size, font, letterSpacing));
    }, 0);
    readoutEl.style.width = `${Math.ceil(maxWidth) + 1}px`;
  }

  function buildTicks() {
    // The thumb's travel is inset by half its width on each side (a range
    // input centers the thumb within the track, it doesn't run edge-to-edge),
    // so ticks must be offset the same way to line up with the thumb center.
    const thumbWidth = getThumbWidth();
    nutData.forEach((row, i) => {
      const tick = document.createElement("div");
      tick.className = "slider-tick";
      const fraction = i / maxIndex;
      tick.style.left = `calc(${thumbWidth / 2}px + (100% - ${thumbWidth}px) * ${fraction})`;
      ticksEl.appendChild(tick);
    });
  }

  function buildRowsHtml(data, fields) {
    return fields
      .map((f) => {
        const value = data[f.key];
        if (value === "-") return `<tr><td>${f.label}</td><td>-</td></tr>`;
        return `<tr><td>${f.label}</td><td>${value}${f.unit ? " " + f.unit : ""}</td></tr>`;
      })
      .join("");
  }

  function renderSpecPanel(el, data, fields) {
    el.innerHTML = `<table><tbody>${buildRowsHtml(data, fields)}</tbody></table>`;
  }

  function renderPanel() {
    const row = nutData[selectedIndex];
    readoutEl.textContent = row.size;

    renderSpecPanel(stdPanelEl, row.STD, stdFields);
    renderSpecPanel(tallPanelEl, row.TALL, tallFields);
    renderSpecPanel(thinPanelEl, row.THIN, thinFields);
    renderSpecPanel(flangedPanelEl, row.FLANGED, flangedFields);
  }

  function setIndex(i) {
    selectedIndex = Math.max(0, Math.min(maxIndex, i));
    sliderEl.value = String(selectedIndex);
    localStorage.setItem(SLIDER_STORAGE_KEY, String(selectedIndex));
    renderPanel();
  }

  buildTicks();
  updateReadoutWidth();
  window.addEventListener("resize", updateReadoutWidth);

  sliderEl.addEventListener("input", () => {
    setIndex(Number(sliderEl.value));
  });

  sliderEl.addEventListener(
    "wheel",
    (evt) => {
      evt.preventDefault();
      setIndex(selectedIndex + (evt.deltaY > 0 ? -1 : 1));
    },
    { passive: false }
  );

  setIndex(selectedIndex);
})();
