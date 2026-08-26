// DOM logic for the torque plot: the size slider, the torque-vs-engagement
// plot itself, and the assembly/100 % torque toggle. Reads torque-data.js;
// see that file for the schema and for how to regenerate it.
//
// The materials are switched on and off from the plot's own legend rather
// than from a separate control: this page hands plot.js a legendItems list
// covering every material — not just the plotted ones — so each legend row
// doubles as that material's checkbox.
//
// Three bits of state are remembered in localStorage between visits: the
// selected size, which torque column is plotted, and which materials are
// shown. The material selection is keyed by the material keys in
// torque-data.js.

(function () {
  const sliderEl = document.getElementById("size-slider");
  const ticksEl = document.getElementById("slider-ticks");
  const readoutEl = document.getElementById("size-readout");
  const minLabelEl = document.getElementById("slider-min-label");
  const maxLabelEl = document.getElementById("slider-max-label");
  const plotEl = document.getElementById("torque-plot");
  const plotTitleEl = document.getElementById("plot-title");
  const metricEl = document.getElementById("metric-toggle");

  const SLIDER_STORAGE_KEY = "torqueSliderIndex";
  const METRIC_STORAGE_KEY = "torqueMetric";
  const MATERIALS_STORAGE_KEY = "torqueMaterialsShown";

  // Which torque column is plotted. Both are torque in N*m, so the Y axis
  // label doesn't change between them.
  const METRICS = [
    {
      key: "assemblyTorque",
      label: "Assembly Torque",
      title: "Assembly Torque vs Thread Engagement",
    },
    {
      key: "fullTorque",
      label: "100 % Torque",
      title: "100 % Torque vs Thread Engagement",
    },
  ];

  // The plot line colors live in style.css (light and dark values), so they
  // follow the theme; this just assigns one to each material in order.
  const SERIES_COLORS = torqueMaterials.map((m, i) => `var(--series-${i + 1})`);

  const maxIndex = torqueData.length - 1;
  sliderEl.max = String(maxIndex);
  minLabelEl.textContent = torqueData[0].size;
  maxLabelEl.textContent = torqueData[maxIndex].size;

  function defaultIndex() {
    const m6 = torqueData.findIndex((row) => row.size === "M6");
    return m6 >= 0 ? m6 : Math.floor(torqueData.length / 2);
  }

  function getStoredIndex() {
    const raw = localStorage.getItem(SLIDER_STORAGE_KEY);
    // Guard the null case explicitly: Number(null) is 0, which is a valid
    // index, so a first-time visitor would otherwise land on the smallest
    // size instead of the default.
    if (raw === null) return defaultIndex();
    const stored = Number(raw);
    if (Number.isInteger(stored) && stored >= 0 && stored <= maxIndex) {
      return stored;
    }
    return defaultIndex();
  }

  function getStoredMetric() {
    const stored = localStorage.getItem(METRIC_STORAGE_KEY);
    return METRICS.some((m) => m.key === stored) ? stored : METRICS[0].key;
  }

  // Stored as the list of shown material keys. Anything unparseable, or a
  // list left over from a material rename, falls back to showing everything.
  function getStoredMaterials() {
    const all = torqueMaterials.map((m) => m.key);
    try {
      const stored = JSON.parse(localStorage.getItem(MATERIALS_STORAGE_KEY));
      if (!Array.isArray(stored)) return new Set(all);
      const valid = stored.filter((key) => all.indexOf(key) !== -1);
      return new Set(valid);
    } catch (err) {
      return new Set(all);
    }
  }

  let selectedIndex = getStoredIndex();
  let selectedMetric = getStoredMetric();
  const shownMaterials = getStoredMaterials();

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

  // Locks the readout box to the exact pixel width of the widest possible
  // size label at the current font, so switching between e.g. "M6" and "M1.6"
  // never resizes the box — and therefore never steals width from the slider
  // track next to it.
  function updateReadoutWidth() {
    const style = getComputedStyle(readoutEl);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const letterSpacing = parseFloat(style.letterSpacing) || 0;
    const maxWidth = torqueData.reduce((max, row) => {
      return Math.max(max, measureTextWidth(row.size, font, letterSpacing));
    }, 0);
    readoutEl.style.width = `${Math.ceil(maxWidth) + 1}px`;
  }

  function buildTicks() {
    // The thumb's travel is inset by half its width on each side (a range
    // input centers the thumb within the track, it doesn't run edge-to-edge),
    // so ticks must be offset the same way to line up with the thumb center.
    const thumbWidth = getThumbWidth();
    torqueData.forEach((row, i) => {
      const tick = document.createElement("div");
      tick.className = "slider-tick";
      const fraction = i / maxIndex;
      tick.style.left = `calc(${thumbWidth / 2}px + (100% - ${thumbWidth}px) * ${fraction})`;
      ticksEl.appendChild(tick);
    });
  }

  // --- Formatting ---

  function fmt(value) {
    const abs = Math.abs(value);
    const decimals = abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 10 ? 2 : abs >= 1 ? 2 : 3;
    return value.toFixed(decimals);
  }

  // --- Plot ---

  function currentMetric() {
    return METRICS.find((m) => m.key === selectedMetric) || METRICS[0];
  }

  function buildSeries() {
    const row = torqueData[selectedIndex];
    return torqueMaterials
      .map((material, i) => {
        if (!shownMaterials.has(material.key)) return null;
        const rows = row.materials[material.key];
        if (!rows || !rows.length) return null;
        return {
          key: material.key,
          label: material.label,
          color: SERIES_COLORS[i],
          points: rows.map((r) => ({
            x: r.engagement,
            y: r[selectedMetric],
            row: r,
          })),
        };
      })
      .filter(Boolean);
  }

  // One legend row per material, always all five — a material that's switched
  // off, or that the report doesn't tabulate at this size, still needs its row
  // to say so and to switch back on.
  function buildLegendItems() {
    const row = torqueData[selectedIndex];
    return torqueMaterials.map((material, i) => ({
      key: material.key,
      label: material.label,
      color: SERIES_COLORS[i],
      active: shownMaterials.has(material.key),
      note: (row.materials[material.key] || []).length
        ? ""
        : `no data at ${row.size}`,
      onToggle: (checked) => setMaterialShown(material.key, checked),
    }));
  }

  function setMaterialShown(key, shown) {
    if (shown) shownMaterials.add(key);
    else shownMaterials.delete(key);
    localStorage.setItem(
      MATERIALS_STORAGE_KEY,
      JSON.stringify(Array.from(shownMaterials))
    );
    renderPlot();
  }

  function renderPlot() {
    const row = torqueData[selectedIndex];
    const metric = currentMetric();
    plotTitleEl.textContent = metric.title;

    const series = buildSeries();
    const anyDataAtSize = torqueMaterials.some(
      (m) => (row.materials[m.key] || []).length
    );

    renderLinePlot(plotEl, {
      series: series,
      legendItems: buildLegendItems(),
      xLabel: "Thread Engagement (mm)",
      yLabel: "Torque (Nm)",
      ariaLabel: `${metric.label} versus thread engagement for ${row.size}, ${series.length} materials`,
      formatTooltip: (point, s) => [
        s.label,
        `Engagement: ${fmt(point.x)} mm`,
        `${metric.label}: ${fmt(point.y)} Nm`,
        `Pullout load: ${fmt(point.row.pulloutLoad)} N`,
      ],
      emptyMessage: anyDataAtSize
        ? "No materials selected. Tick one in the legend to plot it."
        : `No tabulated data for ${row.size} in the selected materials.`,
    });
  }

  // --- Controls ---

  function buildMetricToggle() {
    METRICS.forEach((metric) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "metric-option";
      button.dataset.metric = metric.key;
      button.textContent = metric.label;
      button.addEventListener("click", () => setMetric(metric.key));
      metricEl.appendChild(button);
    });
  }

  function syncMetricToggle() {
    metricEl.querySelectorAll(".metric-option").forEach((button) => {
      const isActive = button.dataset.metric === selectedMetric;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setMetric(key) {
    selectedMetric = key;
    localStorage.setItem(METRIC_STORAGE_KEY, key);
    syncMetricToggle();
    renderPlot();
  }

  function setIndex(i) {
    selectedIndex = Math.max(0, Math.min(maxIndex, i));
    sliderEl.value = String(selectedIndex);
    localStorage.setItem(SLIDER_STORAGE_KEY, String(selectedIndex));
    readoutEl.textContent = torqueData[selectedIndex].size;
    renderPlot();
  }

  buildTicks();
  updateReadoutWidth();
  window.addEventListener("resize", updateReadoutWidth);

  buildMetricToggle();
  syncMetricToggle();

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
