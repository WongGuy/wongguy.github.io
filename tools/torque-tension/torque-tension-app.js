// DOM logic for torque-tension-diagram.html: the size slider, the thread
// parameter readout under it, and the torque-tension plot itself.
//
// Reads tools/bolt/bolt-data.js for the thread geometry (P, d2, d0) and the
// per-property-class minimum Rp0,2, and torque-tension-data.js for the
// assumptions this page makes on top of them (see that file).
//
// WHAT'S PLOTTED
//
// One curve per property class, each the yield limit of that class drawn as a
// parametric sweep of the friction coefficient. Both formulas printed at the
// top of the page take μ, so a single μ fixes one point:
//
//   F_Mper(μ) = ν·Rp0,2·d0³ / sqrt(1.62·d0² + (1.06·P + 3.84·d2·μ)²)
//   M_A(μ)    = F_Mper(μ)·(0.16·P + 0.58·d2·μ + (D_Km/2)·μ)
//
// Sweeping μ from frictionMin to frictionMax then traces the arc: at low
// friction almost all the torque becomes preload, so the curve starts high
// and to the left; as friction climbs, more of the torque is spent turning
// the fastener against itself and the thread torsion eats into the preload
// the bolt can carry, so the curve falls away to the right. A point below the
// arc is a safe torque/preload pair for that class; the arc itself is where
// the bolt reaches ν of its yield point.
//
// A property class is only drawn if ISO 898-1 gives it an Rp0,2 (8.8 and up);
// the lower classes aren't listed in the legend at all, since without Rp0,2
// there's no curve to switch on. Classes are switched from the plot's own
// legend, the same arrangement as the NASA torque page.
//
// Coarse pitches only, and the ISO 262 preferred (first-choice) diameters
// only — the second-choice sizes (M3.5, M14, M18, M22, ...) are blocked from
// the slider so it steps through the R10 series a mechanical designer
// actually reaches for.
//
// State remembered in localStorage between visits: the selected size, the
// friction coefficient μ, the yield utilization ν, the tightening factor α,
// which property classes are shown, and whether the α lower-bound lines are
// shown.
//
// Two sliders sit under the size slider — μ and ν. μ marks one point on every
// curve; ν redraws the curves at that fraction of yield. A third, α, sits
// between the plot and the assumptions and adds a lower-bound preload line
// under each μ mark at that mark's preload ÷ α; it's shown only while the
// legend's "Show Min Force After α" checkbox is ticked, since that's the only
// thing it affects.
//
// Each of the three carries an editable number field, not just a readout.
// Dragging the slider (or the arrow keys / wheel) snaps to its step grid; a
// value typed into the field is kept exactly, clamped only to the slider's
// range — so 0.112 stays 0.112 rather than snapping to 0.11.

(function () {
  const sliderEl = document.getElementById("size-slider");
  const ticksEl = document.getElementById("slider-ticks");
  const readoutEl = document.getElementById("size-readout");
  const minLabelEl = document.getElementById("slider-min-label");
  const maxLabelEl = document.getElementById("slider-max-label");
  const muSliderEl = document.getElementById("mu-slider");
  const muFieldEl = document.getElementById("mu-field");
  const muMinLabelEl = document.getElementById("mu-min-label");
  const muMaxLabelEl = document.getElementById("mu-max-label");
  const nuSliderEl = document.getElementById("nu-slider");
  const nuFieldEl = document.getElementById("nu-field");
  const nuMinLabelEl = document.getElementById("nu-min-label");
  const nuMaxLabelEl = document.getElementById("nu-max-label");
  const alphaSliderEl = document.getElementById("alpha-slider");
  const alphaBlockEl = alphaSliderEl.closest(".slider-block");
  const alphaFieldEl = document.getElementById("alpha-field");
  const alphaMinLabelEl = document.getElementById("alpha-min-label");
  const alphaMaxLabelEl = document.getElementById("alpha-max-label");
  const paramsEl = document.getElementById("thread-params");
  const plotEl = document.getElementById("torque-tension-plot");
  const plotTitleEl = document.getElementById("plot-title");
  const assumptionsEl = document.getElementById("assumptions");

  const SLIDER_STORAGE_KEY = "torqueTensionSizeIndex";
  const GRADES_STORAGE_KEY = "torqueTensionGrades";
  const MU_STORAGE_KEY = "torqueTensionFriction";
  const NU_STORAGE_KEY = "torqueTensionUtilization";
  const ALPHA_STORAGE_KEY = "torqueTensionTighteningFactor";
  const LOWER_BOUND_STORAGE_KEY = "torqueTensionShowMinForce";

  // The minimum (not nominal) Rp0,2 from ISO 898-1 Table 3 — the yield stress
  // VDI 2230 and this diagram are built on. For class 8.8 the minimum splits
  // by diameter, so the value can be a { "d ≤ 16 mm": …, "d > 16 mm": … } map
  // rather than a bare number; rp02For() resolves it against the thread.
  const RP02_KEY = "minNonProportionalElongationStress";

  function hasRp02(grade) {
    const value = grade.properties[RP02_KEY];
    return typeof value === "number" || (value != null && typeof value === "object");
  }

  function rp02For(grade, thread) {
    const value = grade.properties[RP02_KEY];
    if (typeof value === "number") return value;
    if (value != null && typeof value === "object") {
      return thread.diameter <= 16 ? value["d ≤ 16 mm"] : value["d > 16 mm"];
    }
    return undefined;
  }

  // ISO 262 second-choice nominal diameters. The slider steps one size at a
  // time, so dropping the rarely-specified second-choice sizes keeps it to the
  // preferred R10 series (M3, M4, M5, M6, M8, M10, M12, M16, M20, M24, ...).
  const SECOND_CHOICE_DIAMETERS = new Set([
    1.4, 1.8, 3.5, 7, 14, 18, 22, 27, 33, 39, 45, 52, 60,
  ]);

  const threads = boltThreads.filter(
    (t) => t.series === "coarse" && !SECOND_CHOICE_DIAMETERS.has(t.diameter)
  );
  const grades = boltGrades.filter(hasRp02);

  // The plot line colors live in style.css (light and dark values), so they
  // follow the theme; this just assigns one to each class in order.
  const SERIES_COLORS = grades.map((g, i) => `var(--series-${i + 1})`);

  const maxIndex = threads.length - 1;
  sliderEl.max = String(maxIndex);
  minLabelEl.textContent = threads[0].size;
  maxLabelEl.textContent = threads[maxIndex].size;

  // --- Friction slider range ---
  // Driven off the same assumptions the curve is swept over, so the slider
  // can't range outside the plotted friction band.
  const MU_MIN = torqueTensionAssumptions.frictionMin;
  const MU_MAX = torqueTensionAssumptions.frictionMax;
  const MU_STEP = torqueTensionAssumptions.frictionSliderStep;
  muSliderEl.min = String(MU_MIN);
  muSliderEl.max = String(MU_MAX);
  muSliderEl.step = String(MU_STEP);
  muMinLabelEl.textContent = `μ ${MU_MIN.toFixed(2)}`;
  muMaxLabelEl.textContent = `μ ${MU_MAX.toFixed(2)}`;

  // --- Utilization (ν) slider range ---
  // ν scales every curve linearly (it's a bare multiplier on the permissible
  // preload), so the slider just picks which fraction of yield the curves are
  // drawn at.
  const NU_MIN = torqueTensionAssumptions.utilizationMin;
  const NU_MAX = torqueTensionAssumptions.utilizationMax;
  const NU_STEP = torqueTensionAssumptions.utilizationStep;
  nuSliderEl.min = String(NU_MIN);
  nuSliderEl.max = String(NU_MAX);
  nuSliderEl.step = String(NU_STEP);
  nuMinLabelEl.textContent = `ν ${NU_MIN.toFixed(2)}`;
  nuMaxLabelEl.textContent = `ν ${NU_MAX.toFixed(2)}`;

  // --- Tightening factor (α) slider range ---
  // α doesn't enter either formula; it only sets the lower-bound preload line
  // (the μ-mark preload divided by α).
  const ALPHA_MIN = torqueTensionAssumptions.tighteningFactorMin;
  const ALPHA_MAX = torqueTensionAssumptions.tighteningFactorMax;
  const ALPHA_STEP = torqueTensionAssumptions.tighteningFactorStep;
  alphaSliderEl.min = String(ALPHA_MIN);
  alphaSliderEl.max = String(ALPHA_MAX);
  alphaSliderEl.step = String(ALPHA_STEP);
  alphaMinLabelEl.textContent = `α ${ALPHA_MIN.toFixed(1)}`;
  alphaMaxLabelEl.textContent = `α ${ALPHA_MAX.toFixed(1)}`;

  const numberFormat = new Intl.NumberFormat("en-US");

  // --- Formulas ---
  //
  // The two relations printed at the top of the page, in the same form and
  // with the same constants. Lengths are mm and stresses MPa, so preload
  // comes out in N and the torque in N*mm — divided to N*m at the end, which
  // is the only unit conversion on the page.

  function bearingDiameter(thread) {
    return torqueTensionAssumptions.bearingDiameterFactor * thread.diameter;
  }

  function permissiblePreload(thread, rp02, mu, nu) {
    const torsion = 1.06 * thread.pitch + 3.84 * thread.d2 * mu;
    return (
      (nu * rp02 * Math.pow(thread.d0, 3)) /
      Math.sqrt(1.62 * thread.d0 * thread.d0 + torsion * torsion)
    );
  }

  function tighteningTorque(thread, preload, mu) {
    const armMm =
      0.16 * thread.pitch +
      0.58 * thread.d2 * mu +
      (bearingDiameter(thread) / 2) * mu;
    return (preload * armMm) / 1000;
  }

  // The friction values the curve is drawn through. Built by index rather
  // than by accumulating the step, so a step like 0.02 doesn't drift into
  // 0.30000000000000004 and print as such in the tooltip.
  const frictions = (function () {
    const { frictionMin, frictionMax, frictionStep } = torqueTensionAssumptions;
    const steps = Math.round((frictionMax - frictionMin) / frictionStep);
    const values = [];
    for (let i = 0; i <= steps; i++) {
      values.push(Number((frictionMin + i * frictionStep).toFixed(6)));
    }
    return values;
  })();

  // --- State ---

  function defaultIndex() {
    const m10 = threads.findIndex((t) => t.size === "M10");
    return m10 >= 0 ? m10 : Math.floor(threads.length / 2);
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

  // Stored as the list of shown class keys. Anything unparseable, or a list
  // left over from a class rename, falls back to the data file's defaults.
  function getStoredGrades() {
    const fallback = () =>
      new Set(grades.filter((g) => g.shownByDefault).map((g) => g.key));
    try {
      const stored = JSON.parse(localStorage.getItem(GRADES_STORAGE_KEY));
      if (!Array.isArray(stored)) return fallback();
      const valid = stored.filter((key) => grades.some((g) => g.key === key));
      return new Set(valid);
    } catch (err) {
      return fallback();
    }
  }

  // The sliders (drag, arrow keys, wheel) snap to their step grid; the text
  // fields don't — a typed 0.112 stays 0.112 — they only clamp to range. Both
  // paths round off floating-point noise at 6 dp before it reaches storage.
  function clampTo(value, min, max) {
    return Number(Math.min(max, Math.max(min, value)).toFixed(6));
  }

  function snapTo(value, step, min, max) {
    const snapped = Math.round(value / step) * step;
    return clampTo(snapped, min, max);
  }

  function snapMu(value) {
    return snapTo(value, MU_STEP, MU_MIN, MU_MAX);
  }

  function getStoredMu() {
    const raw = localStorage.getItem(MU_STORAGE_KEY);
    const fallback = torqueTensionAssumptions.frictionDefault;
    if (raw === null) return clampTo(fallback, MU_MIN, MU_MAX);
    const stored = Number(raw);
    if (Number.isFinite(stored) && stored >= MU_MIN && stored <= MU_MAX) {
      return clampTo(stored, MU_MIN, MU_MAX);
    }
    return clampTo(fallback, MU_MIN, MU_MAX);
  }

  // ν and α restore the stored value as-is (clamped), so a value typed into
  // the field on the last visit isn't snapped back to the grid on this one.
  function getStored(key, min, max, fallback) {
    const raw = localStorage.getItem(key);
    if (raw === null) return clampTo(fallback, min, max);
    const stored = Number(raw);
    if (Number.isFinite(stored) && stored >= min && stored <= max) {
      return clampTo(stored, min, max);
    }
    return clampTo(fallback, min, max);
  }

  let selectedIndex = getStoredIndex();
  const shownGrades = getStoredGrades();
  let selectedMu = getStoredMu();
  let selectedNu = getStored(
    NU_STORAGE_KEY,
    NU_MIN,
    NU_MAX,
    torqueTensionAssumptions.utilization
  );
  let selectedAlpha = getStored(
    ALPHA_STORAGE_KEY,
    ALPHA_MIN,
    ALPHA_MAX,
    torqueTensionAssumptions.tighteningFactorDefault
  );

  // The α lower-bound lines default on, so the checkbox that adds them starts
  // ticked; only an explicit "false" left in storage turns them off.
  let showLowerBounds =
    localStorage.getItem(LOWER_BOUND_STORAGE_KEY) !== "false";

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
  // size label at the current font, so switching between e.g. "M6" and "M3.5"
  // never resizes the box — and therefore never steals width from the slider
  // track next to it.
  function updateReadoutWidth() {
    const style = getComputedStyle(readoutEl);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const letterSpacing = parseFloat(style.letterSpacing) || 0;
    const maxWidth = threads.reduce((max, thread) => {
      return Math.max(max, measureTextWidth(thread.size, font, letterSpacing));
    }, 0);
    readoutEl.style.width = `${Math.ceil(maxWidth) + 1}px`;
  }

  function buildTicks() {
    // The thumb's travel is inset by half its width on each side (a range
    // input centers the thumb within the track, it doesn't run edge-to-edge),
    // so ticks must be offset the same way to line up with the thumb center.
    const thumbWidth = getThumbWidth();
    threads.forEach((thread, i) => {
      const tick = document.createElement("div");
      tick.className = "slider-tick";
      const fraction = i / maxIndex;
      tick.style.left = `calc(${thumbWidth / 2}px + (100% - ${thumbWidth}px) * ${fraction})`;
      ticksEl.appendChild(tick);
    });
  }

  // --- Formatting ---

  function fmtMm(value) {
    return value.toFixed(3).replace(/\.?0+$/, "");
  }

  function fmtTorque(value) {
    const abs = Math.abs(value);
    return value.toFixed(abs >= 100 ? 0 : abs >= 10 ? 1 : 2);
  }

  function designation(thread) {
    return `${thread.size} × ${thread.pitch}`;
  }

  // --- Thread parameter readout ---
  //
  // The symbols the slider drives, in the order they appear in the formulas
  // above the plot. They're marked in the same accent color there, so the
  // two read as one set of values.

  const PARAMETERS = [
    { symbol: "P", sub: "", title: "Pitch", value: (t) => t.pitch },
    { symbol: "d", sub: "2", title: "Pitch diameter (ISO 724)", value: (t) => t.d2 },
    {
      symbol: "d",
      sub: "0",
      title: "Stress diameter, sqrt(4 As / π)",
      value: (t) => t.d0,
    },
    {
      symbol: "D",
      sub: "Km",
      title: "Effective head bearing diameter",
      value: bearingDiameter,
    },
  ];

  // Each parameter's value swaps between numbers of different widths as the
  // slider moves (P goes "0.5" -> "3.5", d2 "2.675" -> "37.129"). Left to
  // themselves the flex items would resize and the whole centered row would
  // shuffle sideways on every step. So each value cell is pinned to the pixel
  // width of the widest value it will ever show — and the leading designation
  // to its widest — measured once at the current font (recomputed on resize,
  // since the font size drops at the narrow breakpoint).
  let paramWidths = null;

  function computeParamWidths() {
    const valueEl = paramsEl.querySelector(".tt-param-value");
    const symbolEl = paramsEl.querySelector(".tt-param-symbol");
    if (!valueEl || !symbolEl) return;

    const vs = getComputedStyle(valueEl);
    const valueFont = `${vs.fontWeight} ${vs.fontSize} ${vs.fontFamily}`;
    const valueSpacing = parseFloat(vs.letterSpacing) || 0;
    const ss = getComputedStyle(symbolEl);
    const symbolFont = `${ss.fontWeight} ${ss.fontSize} ${ss.fontFamily}`;
    const symbolSpacing = parseFloat(ss.letterSpacing) || 0;

    const widths = { designation: 0, values: PARAMETERS.map(() => 0) };
    threads.forEach((thread) => {
      widths.designation = Math.max(
        widths.designation,
        measureTextWidth(designation(thread), symbolFont, symbolSpacing)
      );
      PARAMETERS.forEach((p, i) => {
        widths.values[i] = Math.max(
          widths.values[i],
          measureTextWidth(fmtMm(p.value(thread)), valueFont, valueSpacing)
        );
      });
    });
    paramWidths = widths;
    applyParamWidths();
  }

  function applyParamWidths() {
    if (!paramWidths) return;
    const symbolEl = paramsEl.querySelector(".tt-param-symbol");
    if (symbolEl) {
      symbolEl.style.display = "inline-block";
      symbolEl.style.textAlign = "center";
      symbolEl.style.width = `${Math.ceil(paramWidths.designation) + 1}px`;
    }
    paramsEl.querySelectorAll(".tt-param-value").forEach((el, i) => {
      el.style.display = "inline-block";
      el.style.textAlign = "right";
      el.style.width = `${Math.ceil(paramWidths.values[i]) + 1}px`;
    });
  }

  function renderParameters() {
    const thread = threads[selectedIndex];
    paramsEl.innerHTML =
      `<span class="tt-param"><span class="tt-param-symbol">${designation(thread)}</span></span>` +
      PARAMETERS.map((p) => {
        const symbol = p.sub ? `${p.symbol}<sub>${p.sub}</sub>` : p.symbol;
        return (
          `<span class="tt-param" title="${p.title}">` +
          `<span class="tt-param-symbol">${symbol}</span>` +
          `<span class="tt-param-value">${fmtMm(p.value(thread))}</span>` +
          `<span class="tt-param-unit">mm</span>` +
          `</span>`
        );
      }).join("");
    if (paramWidths) applyParamWidths();
    else computeParamWidths();
  }

  // --- Plot ---

  // The friction values the curve is drawn through, plus the one the slider
  // is currently on (so the selected μ always lands exactly on the line), in
  // ascending order. The slider steps finer than the curve is sampled, so the
  // slider value usually isn't already in the list.
  function curveFrictions() {
    if (frictions.some((mu) => Math.abs(mu - selectedMu) < 1e-9)) {
      return frictions;
    }
    return frictions.concat(selectedMu).sort((a, b) => a - b);
  }

  function buildSeries() {
    const thread = threads[selectedIndex];
    const sampleMus = curveFrictions();
    return grades
      .map((grade, i) => {
        if (!shownGrades.has(grade.key)) return null;
        const rp02 = rp02For(grade, thread);
        return {
          key: grade.key,
          label: `Class ${grade.label}`,
          color: SERIES_COLORS[i],
          points: sampleMus.map((mu) => {
            const preload = permissiblePreload(thread, rp02, mu, selectedNu);
            const isPick = Math.abs(mu - selectedMu) < 1e-9;
            return {
              x: tighteningTorque(thread, preload, mu),
              y: preload,
              mu: mu,
              rp02: rp02,
              // Only the point at the selected μ carries a dot; the rest are
              // just there to draw the line. That same point gets the drop
              // lines and axis readouts.
              marker: isPick ? undefined : false,
              guide: isPick || undefined,
            };
          }),
        };
      })
      .filter(Boolean);
  }

  // A straight guide line from the origin through the selected-μ point on
  // every curve. For a fixed μ both coordinates of that point scale linearly
  // with the class's Rp0,2, so all the classes' marks lie on one ray out of
  // the origin — a single dashed line drawn to the outermost mark passes
  // through all of them.
  function buildFrictionRay(drawnSeries) {
    let far = null;
    drawnSeries.forEach((s) => {
      const mark = s.points.find((p) => p.marker !== false);
      if (mark && (!far || mark.x > far.x)) far = mark;
    });
    if (!far) return null;
    return {
      key: "friction-ray",
      label: "μ guide",
      color: "var(--text-dim)",
      dash: "5 4",
      points: [
        { x: 0, y: 0, marker: false },
        { x: far.x, y: far.y, marker: false },
      ],
    };
  }

  // The lower-bound preload for each drawn class: its preload at the selected
  // μ divided by the tightening factor α. Same target torque as the μ mark,
  // but α is how far below that mark the real preload can land once the
  // scatter of the tightening tool is allowed for. The plot draws each as a
  // horizontal readout on the preload axis, stopped under the mark it's from.
  // Nothing unless the "Show Min Force After α" legend checkbox is ticked.
  function buildLowerBounds(drawnSeries) {
    if (!showLowerBounds) return [];
    return drawnSeries
      .map((s) => {
        const mark = s.points.find((p) => p.guide);
        if (!mark) return null;
        return { y: mark.y / selectedAlpha, xMax: mark.x, color: s.color };
      })
      .filter(Boolean);
  }

  // One legend row per property class that has an Rp0,2 — always all of them,
  // so a class switched off still has a row to switch back on. No `note` on
  // any row: a note dims the row's label (it means "nothing to draw" on the
  // NASA torque page), and a note on every row would read as all switched
  // off. The class's Rp0,2 goes in the tooltip instead.
  function buildLegendItems() {
    const classItems = grades.map((grade, i) => ({
      key: grade.key,
      label: `Class ${grade.label}`,
      color: SERIES_COLORS[i],
      active: shownGrades.has(grade.key),
      onToggle: (checked) => setGradeShown(grade.key, checked),
    }));
    // A checkbox for the per-class α lower-bound lines. The dashed μ ray gets
    // no row — it's driven by the μ slider, not toggled from here.
    classItems.push({
      key: "alpha-lower-bound",
      label: "Show Min Force After α",
      color: "var(--text-dim)",
      active: showLowerBounds,
      onToggle: (checked) => setShowLowerBounds(checked),
    });
    return classItems;
  }

  function setGradeShown(key, shown) {
    if (shown) shownGrades.add(key);
    else shownGrades.delete(key);
    localStorage.setItem(
      GRADES_STORAGE_KEY,
      JSON.stringify(Array.from(shownGrades))
    );
    renderPlot();
  }

  // The α slider only affects the lower-bound lines, so it's hidden unless
  // those are switched on from the legend.
  function updateAlphaVisibility() {
    alphaBlockEl.hidden = !showLowerBounds;
  }

  function setShowLowerBounds(shown) {
    showLowerBounds = shown;
    localStorage.setItem(LOWER_BOUND_STORAGE_KEY, String(shown));
    updateAlphaVisibility();
    renderPlot();
  }

  function renderPlot() {
    const thread = threads[selectedIndex];
    plotTitleEl.textContent = `Assembly Preload vs Tightening Torque — ${designation(thread)}`;

    const series = buildSeries();
    const ray = buildFrictionRay(series);
    // Ray first so the curve lines and their markers draw over it.
    const plotSeries = ray ? [ray].concat(series) : series;

    renderLinePlot(plotEl, {
      series: plotSeries,
      legendItems: buildLegendItems(),
      yGuides: buildLowerBounds(series),
      xLabel: "Tightening Torque (Nm)",
      yLabel: "Assembly Preload (N)",
      formatY: (value) => numberFormat.format(Math.round(value)),
      ariaLabel:
        `Yield-limited assembly preload against tightening torque for ` +
        `${designation(thread)}, swept over the friction coefficient, ` +
        `${series.length} property classes`,
      formatTooltip: (point, s) => [
        s.label,
        `μ = ${point.mu.toFixed(2)}`,
        `Permissible preload: ${numberFormat.format(Math.round(point.y))} N`,
        `Tightening torque: ${fmtTorque(point.x)} Nm`,
        `Rp0,2 (min.): ${point.rp02} MPa`,
      ],
      emptyMessage:
        "No property classes selected. Tick one in the legend to plot it.",
    });
  }

  // --- Assumptions ---
  //
  // Rendered from torque-tension-data.js rather than written into the page,
  // so the numbers quoted here are the numbers the curve is drawn with.

  function renderAssumptions() {
    const a = torqueTensionAssumptions;
    const items = [
      `Thread friction and head friction are assumed equal (μ<sub>G</sub> = μ<sub>K</sub> = μ).`,
      `Effective head bearing diameter D<sub>Km</sub> = ${a.bearingDiameterFactor}*d is for a normal clearance hole. Torque increases if a larger cleraance hole is used.`,
      `R<sub>p0,2</sub> uses the <em>minimum</em> value from ISO 898-1 Table 3 and not the nominal. After looking at the VDI 2230 tightening table, I concluded that they were also using the nominal value which for class 10.9 and 12.9 is slightly higher than the nominal.`,
      `For class 8.8, the minimum value splits by size (640 MPa at d ≤ 16 mm, 660 MPa above) and the curve follows this split.`,
      `Despite all this, the values here still differ slightly from VDI 2230, as they are based on applying the formulas to the ISO 989-1 values and not a direct copy of the VDI tables themselves.`,
    ];
    assumptionsEl.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  }

  // --- Controls ---

  function setIndex(i) {
    selectedIndex = Math.max(0, Math.min(maxIndex, i));
    sliderEl.value = String(selectedIndex);
    localStorage.setItem(SLIDER_STORAGE_KEY, String(selectedIndex));
    readoutEl.textContent = threads[selectedIndex].size;
    renderParameters();
    renderPlot();
  }

  // The value shown in a field: trimmed to at most 4 decimals, trailing zeros
  // dropped, so a snapped 0.900 reads "0.9" and a typed 0.112 reads "0.112".
  function fmtField(value) {
    return Number(value.toFixed(4)).toString();
  }

  // Each param setter takes { snap }: the sliders pass snap:true and land on
  // the step grid, the text fields pass snap:false and keep the exact value.
  // { silent } leaves the field's own text alone while it's being typed in.
  function setMu(value, { snap = true, silent = false } = {}) {
    if (!Number.isFinite(value)) return;
    selectedMu = snap ? snapMu(value) : clampTo(value, MU_MIN, MU_MAX);
    muSliderEl.value = String(selectedMu);
    localStorage.setItem(MU_STORAGE_KEY, String(selectedMu));
    if (!silent) muFieldEl.value = fmtField(selectedMu);
    renderPlot();
  }

  function setNu(value, { snap = true, silent = false } = {}) {
    if (!Number.isFinite(value)) return;
    selectedNu = snap
      ? snapTo(value, NU_STEP, NU_MIN, NU_MAX)
      : clampTo(value, NU_MIN, NU_MAX);
    nuSliderEl.value = String(selectedNu);
    localStorage.setItem(NU_STORAGE_KEY, String(selectedNu));
    if (!silent) nuFieldEl.value = fmtField(selectedNu);
    renderAssumptions();
    renderPlot();
  }

  function setAlpha(value, { snap = true, silent = false } = {}) {
    if (!Number.isFinite(value)) return;
    selectedAlpha = snap
      ? snapTo(value, ALPHA_STEP, ALPHA_MIN, ALPHA_MAX)
      : clampTo(value, ALPHA_MIN, ALPHA_MAX);
    alphaSliderEl.value = String(selectedAlpha);
    localStorage.setItem(ALPHA_STORAGE_KEY, String(selectedAlpha));
    if (!silent) alphaFieldEl.value = fmtField(selectedAlpha);
    renderAssumptions();
    renderPlot();
  }

  // Wire one editable field to its setter: live-update the plot on every
  // parseable keystroke without rewriting what's being typed, then normalize
  // the text on commit (blur or Enter), snapping a blank/garbage entry back to
  // the current value.
  function wireField(fieldEl, setValue, current) {
    fieldEl.addEventListener("input", () => {
      const parsed = parseFloat(fieldEl.value);
      if (Number.isFinite(parsed)) setValue(parsed, { snap: false, silent: true });
    });
    fieldEl.addEventListener("change", () => {
      const parsed = parseFloat(fieldEl.value);
      setValue(Number.isFinite(parsed) ? parsed : current(), { snap: false });
    });
    fieldEl.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter") fieldEl.blur();
    });
  }

  buildTicks();
  updateReadoutWidth();
  window.addEventListener("resize", () => {
    updateReadoutWidth();
    computeParamWidths();
  });

  renderAssumptions();

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

  muSliderEl.addEventListener("input", () => {
    setMu(Number(muSliderEl.value));
  });

  muSliderEl.addEventListener(
    "wheel",
    (evt) => {
      evt.preventDefault();
      setMu(selectedMu + (evt.deltaY > 0 ? -MU_STEP : MU_STEP));
    },
    { passive: false }
  );

  nuSliderEl.addEventListener("input", () => {
    setNu(Number(nuSliderEl.value));
  });

  nuSliderEl.addEventListener(
    "wheel",
    (evt) => {
      evt.preventDefault();
      setNu(selectedNu + (evt.deltaY > 0 ? -NU_STEP : NU_STEP));
    },
    { passive: false }
  );

  alphaSliderEl.addEventListener("input", () => {
    setAlpha(Number(alphaSliderEl.value));
  });

  alphaSliderEl.addEventListener(
    "wheel",
    (evt) => {
      evt.preventDefault();
      setAlpha(selectedAlpha + (evt.deltaY > 0 ? -ALPHA_STEP : ALPHA_STEP));
    },
    { passive: false }
  );

  wireField(muFieldEl, setMu, () => selectedMu);
  wireField(nuFieldEl, setNu, () => selectedNu);
  wireField(alphaFieldEl, setAlpha, () => selectedAlpha);

  updateAlphaVisibility();
  // Restore without snapping — a value typed into a field last visit keeps its
  // exact value rather than being pulled back onto the slider's step grid.
  setNu(selectedNu, { snap: false });
  setAlpha(selectedAlpha, { snap: false });
  setMu(selectedMu, { snap: false });
  setIndex(selectedIndex);
})();
