// Renders the ISO 2768-1 general-tolerance tables. Reads tolerances-data.js —
// see that file for the schema and for how to regenerate it from the workbook.
//
// Each entry in `toleranceTables` becomes one block: a heading, an optional
// unit note, and the class-by-range grid. All three tables share this one
// build. The standard's subtitle, footnotes, and citation are dropped upstream
// by the generator - see tolerances-data.js.
//
// Table 3 (angular) carries one control: a Decimal / Minutes toggle for the
// deviation notation, since the data stores decimal degrees but the standard
// prints degree/minute. It drives `angleFormat` and re-renders. The same
// render()-reads-module-state shape is left in place for the two seams still
// fixed (`selectedClass`, `activeTable`), so a future "which class applies"
// picker is a listener plus state, not a rewrite of the table build.
//
// The "Maximum Perpendicularity Error Over Length" plot is a derived figure
// (not one of the standard's tables) that belongs to Table 3: buildTable()
// appends its title, mount point, and note inside the angular table's own
// .spec-group, and a second IIFE at the bottom draws the plot itself via
// plot.js. render() re-invokes that draw after every rebuild, since the
// angle-format toggle replaces the whole table block.

(function () {
  const mountEl = document.getElementById("tolerance-tables");
  if (!mountEl || typeof toleranceTables === "undefined") return;

  const ANGLE_FORMAT_STORAGE_KEY = "toleranceAngleFormat";
  const ANGLE_FORMATS = ["decimal", "minutes"];

  // --- State ---
  // "decimal" shows the stored decimal degrees (capped to 3 significant
  // figures in the fraction); "minutes" converts back to D°M'.
  let angleFormat = getStoredAngleFormat();
  // null = highlight nothing; a designation ("m") would tint that row.
  let selectedClass = null;
  // null = show every table; a key would show just one.
  let activeTable = null;

  function getStoredAngleFormat() {
    const stored = localStorage.getItem(ANGLE_FORMAT_STORAGE_KEY);
    return ANGLE_FORMATS.indexOf(stored) !== -1 ? stored : "decimal";
  }

  function visibleTables() {
    return activeTable
      ? toleranceTables.filter((t) => t.key === activeTable)
      : toleranceTables;
  }

  // --- Rendering ---

  // A numeric range { min, max, minInclusive, maxInclusive } -> a concise
  // interval label. Bounded both ends: "(30 - 120]" (bracket = inclusive,
  // paren = exclusive). One open end: "≤ 10" / "> 6".
  function formatRange(range) {
    if (!range || typeof range !== "object") return String(range ?? "");
    const { min, max, minInclusive, maxInclusive } = range;
    if (min == null && max == null) return "all";
    if (min == null) return (maxInclusive ? "≤ " : "< ") + max;
    if (max == null) return (minInclusive ? "≥ " : "> ") + min;
    return `${minInclusive ? "[" : "("}${min} - ${max}${maxInclusive ? "]" : ")"}`;
  }

  // A deviation magnitude (data holds bare numbers, the ± stripped) -> the
  // cell text. null is the standard's "no value given". The angular table's
  // numbers are decimal degrees, shown either as degrees or as D°M' depending
  // on the toggle.
  function formatDeviation(value, table) {
    if (value == null) return "—";
    if (table.key !== "angular") return `±${value}`;
    return angleFormat === "minutes"
      ? `±${degreesToDMS(value)}`
      : `±${sigFigFraction(value, 3)}°`;
  }

  // Decimal degrees -> "1°" / "0°30'" (minutes dropped when zero).
  function degreesToDMS(deg) {
    let whole = Math.floor(deg);
    let minutes = Math.round((deg - whole) * 60);
    if (minutes === 60) {
      whole += 1;
      minutes = 0;
    }
    return minutes === 0 ? `${whole}°` : `${whole}°${minutes}'`;
  }

  // Round `value` so its fractional part keeps at most `figs` significant
  // figures: 0.0833333 -> 0.0833, 0.333333 -> 0.333, 0.5 -> 0.5, 1.5 -> 1.5.
  // Exact values are left as-is (this only caps precision).
  function sigFigFraction(value, figs) {
    const frac = value - Math.trunc(value);
    if (Math.abs(frac) < 1e-9) return String(value);
    const decimals = figs - 1 - Math.floor(Math.log10(Math.abs(frac)));
    return String(parseFloat(value.toFixed(Math.max(0, decimals))));
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildHead(table) {
    const thead = document.createElement("thead");

    const bannerRow = document.createElement("tr");
    const classHead = el("th", null, "Tolerance class");
    classHead.scope = "colgroup";
    classHead.colSpan = 2;
    classHead.rowSpan = 2;
    classHead.classList.add("est-col-divide");
    bannerRow.appendChild(classHead);

    const rangeBanner = el("th", null, table.rangeHeader);
    rangeBanner.scope = "colgroup";
    rangeBanner.colSpan = table.ranges.length;
    bannerRow.appendChild(rangeBanner);
    thead.appendChild(bannerRow);

    const rangeRow = document.createElement("tr");
    table.ranges.forEach((range) => {
      const cell = el("th", null, formatRange(range));
      cell.scope = "col";
      rangeRow.appendChild(cell);
    });
    thead.appendChild(rangeRow);

    return thead;
  }

  function buildBody(table) {
    const tbody = document.createElement("tbody");
    table.classes.forEach((cls) => {
      const row = document.createElement("tr");
      if (selectedClass && cls.designation === selectedClass) {
        row.classList.add("tol-row--selected");
      }

      const designation = el("td", "est-row-label est-row-size", cls.designation);
      row.appendChild(designation);
      const description = el("td", "est-row-label est-col-divide", cls.description);
      row.appendChild(description);

      cls.deviations.forEach((value) => {
        row.appendChild(el("td", "tol-value", formatDeviation(value, table)));
      });
      tbody.appendChild(row);
    });
    return tbody;
  }

  function buildTable(table) {
    const block = el("section", "spec-group");

    const heading = el(
      "h3",
      "spec-group-title",
      `Table ${table.number} — ${table.title}`
    );
    block.appendChild(heading);

    const unitCaption = table.unitNote
      ? el("p", "tol-caption tol-caption--unit", table.unitNote)
      : null;

    if (table.key === "angular") {
      // Toggle sits left, unit caption right — they never overlap, so share a row.
      const controls = el("div", "tol-table-controls");
      controls.appendChild(buildAngleFormatToggle());
      if (unitCaption) controls.appendChild(unitCaption);
      block.appendChild(controls);
    } else if (unitCaption) {
      block.appendChild(unitCaption);
    }

    const wrap = el("div", "est-table-wrap");
    const tableEl = el("table", "est-table tol-table");
    tableEl.appendChild(buildHead(table));
    tableEl.appendChild(buildBody(table));
    wrap.appendChild(tableEl);
    block.appendChild(wrap);

    // The perpendicularity plot is derived straight from Table 3, so it lives
    // inside that table's group rather than in a section of its own. Only the
    // scaffolding is built here; the second IIFE fills #perpendicularity-plot.
    if (table.key === "angular") {
      block.appendChild(
        el(
          "h4",
          "spec-group-title tol-figure-title",
          "Maximum Perpendicularity Error Over Length"
        )
      );
      const plotMount = el("div", "plot");
      plotMount.id = "perpendicularity-plot";
      block.appendChild(plotMount);
    }

    return block;
  }

  // --- Angular deviation format toggle (Table 3 only) ---

  const ANGLE_FORMAT_OPTIONS = [
    { key: "decimal", label: "Decimal" },
    { key: "minutes", label: "Minutes" },
  ];

  function buildAngleFormatToggle() {
    const group = el("div", "tol-format-toggle");
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Angular deviation format");
    ANGLE_FORMAT_OPTIONS.forEach((opt) => {
      const button = el("button", "tol-format-option", opt.label);
      button.type = "button";
      button.dataset.format = opt.key;
      const isActive = angleFormat === opt.key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.addEventListener("click", () => setAngleFormat(opt.key));
      group.appendChild(button);
    });
    return group;
  }

  function setAngleFormat(key) {
    if (angleFormat === key || ANGLE_FORMATS.indexOf(key) === -1) return;
    angleFormat = key;
    localStorage.setItem(ANGLE_FORMAT_STORAGE_KEY, key);
    render();
  }

  function render() {
    mountEl.replaceChildren();
    visibleTables().forEach((table) => mountEl.appendChild(buildTable(table)));
    // buildTable just left a fresh (empty) #perpendicularity-plot in the DOM
    // whenever the angular table is on screen; (re)draw it.
    if (typeof window.renderPerpendicularityPlot === "function") {
      window.renderPerpendicularityPlot();
    }
  }

  render();
})();

// --- Maximum perpendicularity error over length (companion to Table 3) ---
//
// Not part of ISO 2768-1: a derived plot that walks each angular tolerance
// class's permissible deviation across the length of the shorter side. That
// length is taken as the hypotenuse of a right triangle and the perpendicularity
// error as the opposite side, so error = L * sin(theta). theta comes straight
// from Table 3, so it steps down as the shorter side lengthens and every curve
// saws back down at a range boundary (10, 50, 120, 400 mm) before climbing
// again through the next range.
//
// Curves are switched from the plot's own legend, the same arrangement as the
// NASA torque and torque-tension pages; the selection persists in localStorage.
//
// Table 3 folds fine and medium together (identical angular deviations), so
// classes that share a deviation row are merged into one curve here — see
// curves below.
//
// The mount point (#perpendicularity-plot) is built by the table IIFE above,
// inside Table 3's section, and replaced whenever that table is rebuilt — so
// render() looks it up each call and the table IIFE re-invokes render()
// (via window.renderPerpendicularityPlot) after every rebuild.

(function () {
  const angular =
    typeof toleranceTables !== "undefined" &&
    toleranceTables.find((t) => t.key === "angular");
  if (!angular || typeof renderLinePlot !== "function") {
    window.renderPerpendicularityPlot = function () {};
    return;
  }

  const CURVES_STORAGE_KEY = "tolerancePerpendicularityCurves";
  const X_MIN = 5;
  const X_MAX = 500;

  // One curve per distinct deviation row: classes whose Table 3 deviations are
  // identical (fine and medium) collapse into a single entry carrying both
  // designations. Order and grouping follow the table.
  const curves = (function () {
    const groups = [];
    angular.classes.forEach((cls) => {
      const sig = JSON.stringify(cls.deviations);
      const group = groups.find((g) => g.sig === sig);
      if (group) group.members.push(cls);
      else groups.push({ sig: sig, members: [cls] });
    });
    return groups.map((g, i) => ({
      key: g.members.map((c) => c.designation).join("+"),
      label:
        `Class${g.members.length > 1 ? "es" : ""} ` +
        `${g.members.map((c) => c.designation).join(", ")} ` +
        `(${g.members.map((c) => c.description).join(", ")})`,
      deviations: g.members[0].deviations,
      // The plot line colors live in style.css (light and dark values), so
      // they follow the theme; each curve just takes the next one in order.
      color: `var(--series-${i + 1})`,
    }));
  })();

  // Stored as the list of shown curve keys. Anything unparseable, or a list
  // left over from a key change, falls back to showing every curve.
  function getStoredCurves() {
    const all = curves.map((c) => c.key);
    try {
      const stored = JSON.parse(localStorage.getItem(CURVES_STORAGE_KEY));
      if (!Array.isArray(stored)) return new Set(all);
      return new Set(stored.filter((k) => all.indexOf(k) !== -1));
    } catch (err) {
      return new Set(all);
    }
  }

  const shownCurves = getStoredCurves();

  // Decimal degrees -> "1°" / "0°30'" / "20'", the way the standard prints the
  // deviations. Every value in Table 3 lands on a whole minute.
  function fmtAngle(deg) {
    const totalMin = Math.round(deg * 60);
    const d = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (m === 0) return `${d}°`;
    return d === 0 ? `${m}'` : `${d}°${m}'`;
  }

  function fmtMm(value) {
    return value.toFixed(value >= 1 ? 2 : 3);
  }

  // One polyline per curve. Each of Table 3's length ranges contributes a
  // straight segment — theta is constant across a range, so L * sin(theta) is
  // linear in L — clipped to [X_MIN, X_MAX]. Where two ranges meet, a segment's
  // end point and the next segment's start point share an x, so the line
  // between them is the vertical drop as theta steps down. Only the range-end
  // points carry a marker; the duplicated range-start point that draws the drop
  // is flagged marker:false.
  function buildPoints(curve) {
    const points = [];
    let segStart = X_MIN;
    for (let i = 0; i < angular.ranges.length; i++) {
      const upper = angular.ranges[i].max;
      const segEnd = upper == null ? X_MAX : Math.min(upper, X_MAX);
      if (segEnd <= segStart) continue;
      const theta = curve.deviations[i];
      if (theta == null) {
        segStart = segEnd;
        continue;
      }
      const rad = (theta * Math.PI) / 180;
      points.push({ x: segStart, y: segStart * Math.sin(rad), theta: theta });
      points.push({ x: segEnd, y: segEnd * Math.sin(rad), theta: theta });
      segStart = segEnd;
      if (segEnd >= X_MAX) break;
    }
    points.forEach((p, i) => {
      if (i > 0 && Math.abs(p.x - points[i - 1].x) < 1e-9) p.marker = false;
    });
    return points;
  }

  function buildSeries() {
    return curves
      .filter((curve) => shownCurves.has(curve.key))
      .map((curve) => ({
        key: curve.key,
        label: curve.label,
        color: curve.color,
        points: buildPoints(curve),
      }));
  }

  // One legend row per curve, always all of them — a curve switched off still
  // needs its row to switch back on.
  function buildLegendItems() {
    return curves.map((curve) => ({
      key: curve.key,
      label: curve.label,
      color: curve.color,
      active: shownCurves.has(curve.key),
      onToggle: (checked) => setCurveShown(curve.key, checked),
    }));
  }

  function setCurveShown(key, shown) {
    if (shown) shownCurves.add(key);
    else shownCurves.delete(key);
    localStorage.setItem(
      CURVES_STORAGE_KEY,
      JSON.stringify(Array.from(shownCurves))
    );
    render();
  }

  function render() {
    const mountEl = document.getElementById("perpendicularity-plot");
    if (!mountEl) return;
    renderLinePlot(mountEl, {
      series: buildSeries(),
      legendItems: buildLegendItems(),
      xLabel: "Length of Shorter Side (mm)",
      yLabel: "Perpendicularity Error (mm)",
      xMin: X_MIN,
      xMax: X_MAX,
      ariaLabel:
        "Maximum perpendicularity error against the length of the shorter " +
        "side, one curve per distinct ISO 2768-1 angular tolerance class",
      formatTooltip: (point, s) => [
        s.label,
        `Shorter side: ${point.x} mm`,
        `Perpendicularity error: ${fmtMm(point.y)} mm`,
        `Angular tolerance: ±${fmtAngle(point.theta)}`,
      ],
      emptyMessage: "Pick a Tolerance Class.",
    });
  }

  window.renderPerpendicularityPlot = render;
  render();
})();
