// DOM logic for pem-nut-torque.html: the PEM series picker, the size slider,
// and the torque-vs-screw-material plot. Reads pem-nut-torque-data.js; see
// that file for the schema and for how to regenerate it.
//
// WHAT'S PLOTTED
//
// One series per PEM part number at the selected size (S-M3-0ZI, S-M3-1ZI,
// S-M3-2ZI, ...), each a marker per mating screw material at that material's
// recommended tightening torque. The x axis is categorical — the materials in
// the order the source table prints them — so the markers are not joined by
// lines. Within each material's band the parts are dodged side by side by a
// fixed offset, since parts at one size often share a torque (S-M6-0ZI/1ZI/
// 2ZI agree on every class below 12.9) and would otherwise hide each other.
// The offset comes from a part's place among all parts at that size, not just
// the shown ones, so switching one off doesn't shuffle the rest.
//
// SERIES AND SIZES
//
// The series buttons are the source tables (S, CLS, SP, ...), and the slider
// steps through only the sizes the selected table lists, so it's rebuilt on
// every series change. The size is remembered by name rather than by slider
// position: switching series keeps it if the new table has it, otherwise
// lands on the nearest size it does have.
//
// Parts are switched on and off from the plot's own legend (as on the NASA
// torque page), via legendItems covering every part at the size.
//
// State remembered in localStorage between visits: the series, the size, and
// which part numbers are hidden. Hidden rather than shown, because the legend
// changes with every size and series — a part not seen before should start
// switched on.

(function () {
  const sliderEl = document.getElementById("size-slider");
  const ticksEl = document.getElementById("slider-ticks");
  const readoutEl = document.getElementById("size-readout");
  const minLabelEl = document.getElementById("slider-min-label");
  const maxLabelEl = document.getElementById("slider-max-label");
  const plotEl = document.getElementById("torque-plot");
  const plotTitleEl = document.getElementById("plot-title");
  const seriesEl = document.getElementById("series-toggle");
  const notesEl = document.getElementById("series-notes");

  const SERIES_STORAGE_KEY = "pemNutTorqueSeries";
  const SIZE_STORAGE_KEY = "pemNutTorqueSize";
  const HIDDEN_STORAGE_KEY = "pemNutTorqueHidden";

  const DEFAULT_SIZE = "M6";

  // The plot colors live in style.css (light and dark values) so they follow
  // the theme. No table lists more than four parts at one size, so the five
  // series colors never repeat within a plot.
  const SERIES_COLOR_COUNT = 5;
  const colorFor = (i) => `var(--series-${(i % SERIES_COLOR_COUNT) + 1})`;

  // Each table with its parts grouped by size, sizes in ascending diameter.
  const tables = pemNutSeries.map((series) => {
    const bySize = new Map();
    series.parts.forEach((part) => {
      if (!bySize.has(part.size)) {
        bySize.set(part.size, { size: part.size, diameter: part.diameter, parts: [] });
      }
      bySize.get(part.size).parts.push(part);
    });
    const sizes = Array.from(bySize.values()).sort((a, b) => a.diameter - b.diameter);
    return { series: series, sizes: sizes };
  });

  function getStoredSeries() {
    const stored = localStorage.getItem(SERIES_STORAGE_KEY);
    return tables.some((t) => t.series.key === stored) ? stored : tables[0].series.key;
  }

  function getStoredHidden() {
    try {
      const stored = JSON.parse(localStorage.getItem(HIDDEN_STORAGE_KEY));
      return new Set(Array.isArray(stored) ? stored.filter((v) => typeof v === "string") : []);
    } catch (err) {
      return new Set();
    }
  }

  let selectedSeries = getStoredSeries();
  // The size the visitor last picked, by name. Kept even while the current
  // table doesn't list it, so stepping through a table without, say, M3.5
  // and back to one with it returns to M3.5.
  let preferredSize = localStorage.getItem(SIZE_STORAGE_KEY) || DEFAULT_SIZE;
  let selectedIndex = 0;
  const hiddenParts = getStoredHidden();

  function currentTable() {
    return tables.find((t) => t.series.key === selectedSeries) || tables[0];
  }

  function currentSize() {
    return currentTable().sizes[selectedIndex];
  }

  // The slider position for a size name in the current table: that size if
  // it's listed, otherwise the listed size nearest to it in diameter.
  function indexForSize(name) {
    const sizes = currentTable().sizes;
    const exact = sizes.findIndex((s) => s.size === name);
    if (exact >= 0) return exact;
    const target = parseFloat(String(name).replace(/^M/, ""));
    if (!Number.isFinite(target)) {
      const fallback = sizes.findIndex((s) => s.size === DEFAULT_SIZE);
      return fallback >= 0 ? fallback : Math.floor(sizes.length / 2);
    }
    let best = 0;
    sizes.forEach((s, i) => {
      if (Math.abs(s.diameter - target) < Math.abs(sizes[best].diameter - target)) best = i;
    });
    return best;
  }

  // --- Slider (same construction as the other selectors) ---

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

  // Locks the readout box to the widest size label in any table, not just the
  // current one, so switching series never resizes the box — and therefore
  // never steals width from the slider track next to it.
  function updateReadoutWidth() {
    const style = getComputedStyle(readoutEl);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const letterSpacing = parseFloat(style.letterSpacing) || 0;
    const maxWidth = tables.reduce((max, t) => {
      return t.sizes.reduce((m, s) => {
        return Math.max(m, measureTextWidth(s.size, font, letterSpacing));
      }, max);
    }, 0);
    readoutEl.style.width = `${Math.ceil(maxWidth) + 1}px`;
  }

  // Rebuilds the slider's range, ticks and end labels for the current table.
  function rebuildSlider() {
    const sizes = currentTable().sizes;
    const maxIndex = sizes.length - 1;
    sliderEl.max = String(maxIndex);
    sliderEl.disabled = maxIndex === 0;
    minLabelEl.textContent = sizes[0].size;
    maxLabelEl.textContent = sizes[maxIndex].size;

    // The thumb's travel is inset by half its width on each side (a range
    // input centers the thumb within the track, it doesn't run edge-to-edge),
    // so ticks must be offset the same way to line up with the thumb center.
    ticksEl.innerHTML = "";
    const thumbWidth = getThumbWidth();
    sizes.forEach((s, i) => {
      const tick = document.createElement("div");
      tick.className = "slider-tick";
      const fraction = maxIndex > 0 ? i / maxIndex : 0.5;
      tick.style.left = `calc(${thumbWidth / 2}px + (100% - ${thumbWidth}px) * ${fraction})`;
      ticksEl.appendChild(tick);
    });
  }

  // --- Plot ---

  // "Steel PC 4.6" -> ["Steel", "PC 4.6"]: the material family on one line
  // and the grade under it, so seven categories fit across the plot.
  function categoryLines(material) {
    const space = material.indexOf(" ");
    return space > 0 ? [material.slice(0, space), material.slice(space + 1)] : [material];
  }

  // Horizontal offset of part i of n within a category band (band width 1),
  // centered on the category.
  function dodge(i, n) {
    if (n <= 1) return 0;
    const step = Math.min(0.2, 0.7 / n);
    return (i - (n - 1) / 2) * step;
  }

  function buildSeries() {
    const table = currentTable();
    const parts = currentSize().parts;
    return parts
      .map((part, i) => {
        if (hiddenParts.has(part.partNumber)) return null;
        return {
          key: part.partNumber,
          label: part.partNumber,
          color: colorFor(i),
          line: false,
          points: part.torque.map((torque, m) => ({
            x: m + dodge(i, parts.length),
            y: parseFloat(torque),
            torque: torque,
            material: table.series.materials[m],
            part: part,
          })),
        };
      })
      .filter(Boolean);
  }

  function buildLegendItems() {
    return currentSize().parts.map((part, i) => ({
      key: part.partNumber,
      label: part.partNumber,
      color: colorFor(i),
      active: !hiddenParts.has(part.partNumber),
      onToggle: (checked) => setPartShown(part.partNumber, checked),
    }));
  }

  function setPartShown(partNumber, shown) {
    if (shown) hiddenParts.delete(partNumber);
    else hiddenParts.add(partNumber);
    localStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify(Array.from(hiddenParts)));
    renderPlot();
  }

  function renderPlot() {
    const table = currentTable();
    const size = currentSize();
    plotTitleEl.textContent = `${table.series.title}, ${size.size}`;

    const series = buildSeries();
    renderLinePlot(plotEl, {
      series: series,
      legendItems: buildLegendItems(),
      xCategories: table.series.materials.map(categoryLines),
      xLabel: "Screw Material",
      yLabel: "Mating Screw Tightening Torque (Nm)",
      ariaLabel:
        `Mating screw tightening torque by screw material for PEM ${table.series.label} ` +
        `nuts, ${size.size}, ${series.length} part numbers`,
      formatTooltip: (point, s) => [
        s.label,
        `${point.material}: ${point.torque} Nm`,
        `Min. axial strength (PC 12.9 screw): ${point.part.minAxialStrength} kN`,
        `Screw strength to develop min. axial: ${point.part.screwStrength} MPa`,
      ],
      emptyMessage: "No part numbers selected. Tick one in the legend to plot it.",
    });
  }

  // The nut factor and any footnotes belong to the table, so they're redrawn
  // with the series rather than written into the page.
  function renderNotes() {
    const series = currentTable().series;
    notesEl.innerHTML = "";
    const items = [
      `Torques assume a nut factor K = ${series.k}. Actual K may vary.`,
    ].concat(series.footnotes);
    items.forEach((note) => {
      const li = document.createElement("li");
      li.textContent = note;
      notesEl.appendChild(li);
    });
  }

  // --- Controls ---

  function buildSeriesToggle() {
    tables.forEach((t) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "metric-option";
      button.dataset.series = t.series.key;
      button.textContent = t.series.label;
      button.title = t.series.title;
      button.addEventListener("click", () => setSeries(t.series.key));
      seriesEl.appendChild(button);
    });
  }

  function syncSeriesToggle() {
    seriesEl.querySelectorAll(".metric-option").forEach((button) => {
      const isActive = button.dataset.series === selectedSeries;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setSeries(key) {
    selectedSeries = key;
    localStorage.setItem(SERIES_STORAGE_KEY, key);
    syncSeriesToggle();
    rebuildSlider();
    renderNotes();
    showIndex(indexForSize(preferredSize));
  }

  // Moves the slider to a position in the current table and redraws.
  function showIndex(i) {
    const maxIndex = currentTable().sizes.length - 1;
    selectedIndex = Math.max(0, Math.min(maxIndex, i));
    sliderEl.value = String(selectedIndex);
    readoutEl.textContent = currentSize().size;
    renderPlot();
  }

  // A size the visitor picked: remembered as their preferred size.
  function pickIndex(i) {
    showIndex(i);
    preferredSize = currentSize().size;
    localStorage.setItem(SIZE_STORAGE_KEY, preferredSize);
  }

  updateReadoutWidth();
  window.addEventListener("resize", updateReadoutWidth);

  buildSeriesToggle();

  sliderEl.addEventListener("input", () => {
    pickIndex(Number(sliderEl.value));
  });

  sliderEl.addEventListener(
    "wheel",
    (evt) => {
      evt.preventDefault();
      pickIndex(selectedIndex + (evt.deltaY > 0 ? -1 : 1));
    },
    { passive: false }
  );

  setSeries(selectedSeries);
})();
