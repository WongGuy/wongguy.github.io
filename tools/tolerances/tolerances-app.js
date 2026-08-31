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

    if (table.key === "angular") {
      block.appendChild(buildAngleFormatToggle());
    }

    if (table.unitNote) {
      block.appendChild(el("p", "tol-caption tol-caption--unit", table.unitNote));
    }

    const wrap = el("div", "est-table-wrap");
    const tableEl = el("table", "est-table tol-table");
    tableEl.appendChild(buildHead(table));
    tableEl.appendChild(buildBody(table));
    wrap.appendChild(tableEl);
    block.appendChild(wrap);

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
  }

  render();
})();
