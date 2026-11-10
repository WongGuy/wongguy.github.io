// DOM logic for pem-nut-torque.html: the size slider and the torque-vs-screw-
// material plot, whose legend is where PEM series and part numbers are
// switched on and off. Reads pem-nut-torque-data.js; see that file for the
// schema and for how to regenerate it.
//
// WHAT'S PLOTTED
//
// One series per PEM part number at the selected size, across every PEM
// table (S-M3-0ZI, CLS-M3-1, RT-M3-...), each a marker per mating screw
// material at that material's recommended tightening torque. The x axis is
// categorical — the materials — so the markers are not joined by lines.
// CLA's table has a different column set from the rest (Aluminum 2024-T4, no
// PC 4.6 or 9.8), so the categories are the tables' material lists merged in
// print order, trimmed to the columns of the tables that have a part shown:
// the Aluminum column is only there while a CLA part is.
//
// Within each material's band the shown parts are dodged side by side, since
// parts often share a torque (S-M6-0ZI/1ZI/2ZI agree on every class below
// 12.9) and would otherwise hide each other. The dodge is over the shown parts
// only: with every table on there are around twenty parts at M3 or M6, and holding
// a slot for each hidden one would crowd the few that are shown.
//
// SCREW GRADES
//
// Under the plot, a checkbox per mating screw material (every table's
// materials merged, as above) picks which of them are shown: the plot's
// categories and the table view's torque columns are both cut down to the
// ticked ones. "Show common" ticks just Stainless A2-70 and Steel PC 8.8, 10.9
// and 12.9 — the same four drawn bold in the list — like the bolt size
// estimator's "Show common" for its property classes.
//
// With exactly one grade ticked there's only one category left to plot, so
// the chart turns over: a bar chart with the PEM tables (the series) along
// the x axis instead of the materials, one band per table with a torque at
// that grade, its shown parts as bars side by side in their legend colors.
// The table, not a marker, now says which series a bar is from, so the
// legend drops the markers and keeps just the part colors; the grade moves
// into the title. The rule is the checkbox count, not how many categories
// survive trimming, so toggling a table never flips the chart type.
//
// TORQUE BY THREAD SIZE
//
// With exactly one grade ticked, a second plot comes up under the grade
// list: the same torque axis against thread size, every size at once (the
// slider doesn't move it). A part number only exists at one size, so this
// plot works in part families instead — the part number with its size taken
// out, "S-M*-0ZI" — one dot series per family, in its table's marker and its
// color on that table's legend line. Its legend is built the way the one
// above is (a line per table, its families after the head, the same head and
// "Check all" rules, fixed cells), but it's its own: kept apart from the
// legend above and remembered separately, so the two plots can show different
// tables. It has its own Chart | Table toggle too; its table is a row per
// shown family and a column per size. A two-knob slider at the top of its
// group picks the smallest and largest size it spans (both views); families
// with no torque inside that span are grayed out in its legend. See
// renderSizePlot().
//
// LEGEND
//
// One line per PEM table, headed by a checkbox with the table's label ("S",
// "SH / HNL / H", ...), followed by that table's part numbers at the size,
// each with its own checkbox. Unticking a table's head
// hides all of its parts; ticking it again brings back the ones that were on
// before — the head and the parts are remembered separately, so a part is
// drawn only when both are on. The head reads as ticked when its table has a
// part drawn at this size. Two edge cases follow from that:
//   - ticking a head whose parts at this size were all unticked one by one
//     brings them all back, since otherwise the tick would draw nothing;
//   - ticking a part while its table's head is off turns the head back on
//     with just that part, as every part on the line read as unticked.
// Under the lines, "Check all series" and "Uncheck all series" set every
// table's head at once, including tables grayed out at this size. Checking
// all follows the first rule above for each table drawn here.
//
// The legend keeps one size for every slider position: every table always
// has its line, and each line has as many fixed-width part cells as the
// most parts any table lists at one size (legendSlots in plot.js), so a line
// with fewer parts just has empty cells. A table that doesn't list the size
// is grayed out with its head locked, showing whether the table is switched
// on, so it can't be changed at a size where it would do nothing.
//
// CHART / TABLE
//
// A toggle over the plot (styled like the NASA page's torque toggle) swaps
// the plot for a table of the same values: the same shown parts at the size,
// grouped by table, with each part's min. axial strength, screw strength,
// and one torque column per material — the same ticked screw grades the plot
// shows (a dash where a table has no such column). The table keeps the legend under it, drawn with renderPlotLegend
// from the same items the plot gets, so the selection can be changed in
// either view. The table is plain: no markers or colors in its cells or in
// its legend, since there's no plot for them to key. Only the view on screen
// is drawn.
//
// SIZES
//
// The slider steps through every size any table lists. A table without the
// selected size is grayed out in the legend.
//
// State remembered in localStorage between visits: the view, the size, which
// tables are switched off, which part numbers are, and which screw grades
// are. Off rather than on, so a part, table or grade not seen before starts
// switched on — except on a first visit, where only one table is on (the
// series the page's old one-table picker had selected, if any) rather than
// every part at the size at once. Every grade starts on.

(function () {
  const sliderEl = document.getElementById("size-slider");
  const ticksEl = document.getElementById("slider-ticks");
  const readoutEl = document.getElementById("size-readout");
  const minLabelEl = document.getElementById("slider-min-label");
  const maxLabelEl = document.getElementById("slider-max-label");
  const plotEl = document.getElementById("torque-plot");
  const plotTitleEl = document.getElementById("plot-title");
  const notesEl = document.getElementById("series-notes");
  const viewToggleEl = document.getElementById("view-toggle");
  const tableViewEl = document.getElementById("torque-table-view");
  const tableWrapEl = document.getElementById("torque-table-wrap");
  const tableLegendEl = document.getElementById("torque-table-legend");
  const gradeTogglesEl = document.getElementById("grade-toggles");
  const gradeCommonEl = document.getElementById("grade-common");
  const sizePlotGroupEl = document.getElementById("size-plot-group");
  const sizePlotTitleEl = document.getElementById("size-plot-title");
  const sizePlotEl = document.getElementById("size-plot");
  const sizeViewToggleEl = document.getElementById("size-view-toggle");
  const sizeTableViewEl = document.getElementById("size-table-view");
  const sizeTableWrapEl = document.getElementById("size-table-wrap");
  const sizeTableLegendEl = document.getElementById("size-table-legend");
  const rangeLoEl = document.getElementById("size-range-lo");
  const rangeHiEl = document.getElementById("size-range-hi");
  const rangeReadoutEl = document.getElementById("size-range-readout");
  const rangeTicksEl = document.getElementById("size-range-ticks");
  const rangeMinLabelEl = document.getElementById("size-range-min-label");
  const rangeMaxLabelEl = document.getElementById("size-range-max-label");

  const SIZE_STORAGE_KEY = "pemNutTorqueSize";
  const SIZE_PLOT_HIDDEN_SERIES_STORAGE_KEY = "pemNutTorqueSizePlotHiddenSeries";
  const SIZE_PLOT_HIDDEN_STORAGE_KEY = "pemNutTorqueSizePlotHidden";
  const SIZE_PLOT_VIEW_STORAGE_KEY = "pemNutTorqueSizePlotView";
  const SIZE_PLOT_RANGE_STORAGE_KEY = "pemNutTorqueSizePlotRange";
  const VIEW_STORAGE_KEY = "pemNutTorqueView";
  const HIDDEN_STORAGE_KEY = "pemNutTorqueHidden";
  const HIDDEN_SERIES_STORAGE_KEY = "pemNutTorqueHiddenSeries";
  const HIDDEN_GRADES_STORAGE_KEY = "pemNutTorqueHiddenGrades";
  // Written by the one-table series picker this page used to have. Only read
  // now, to pick which table a returning visitor starts with.
  const OLD_SERIES_STORAGE_KEY = "pemNutTorqueSeries";

  const DEFAULT_SIZE = "M6";

  const VIEWS = [
    { key: "chart", label: "Chart" },
    { key: "table", label: "Table" },
  ];

  const EMPTY_MESSAGE = "No valid PEM series selected at this size";
  const NO_GRADE_MESSAGE = "No screw grade selected";

  // The everyday screw grades: what "Show common" ticks, drawn bold in the
  // grade list. Names as the tables print them (see `materials` in the data).
  const COMMON_GRADES = new Set([
    "Stainless A2-70",
    "Steel PC 8.8",
    "Steel PC 10.9",
    "Steel PC 12.9",
  ]);

  // The single-grade bar chart: bars BAR_STEP apart within a table's band (a
  // band is 1 wide) and a little narrower than that, so neighbors don't touch
  // — the standoff page's spacing. No table lists more than four parts at one
  // size, so a band's bars fill at most 0.8 of it.
  const BAR_STEP = 0.2;
  const BAR_WIDTH = 0.17;

  // The plot colors live in style.css (light and dark values) so they follow
  // the theme. A part's color is its place within its own table's line, and
  // no table lists more than four parts at one size, so colors never repeat
  // within a line. They do repeat across tables, so tables are told apart by
  // marker instead (below).
  // Seven colors: the thread size plot's legend lines run up to seven part
  // families (S), where the size legend above never passes four parts.
  const SERIES_COLOR_COUNT = 7;
  const colorFor = (i) => `var(--series-${(i % SERIES_COLOR_COUNT) + 1})`;

  // Each table's marker: five shapes, filled for the first five tables and
  // hollow for the next five, in table order. Every part in a table plots
  // with its table's marker (in its own color), and the table's legend head
  // shows the marker, so a dot's shape says which table it's from and its
  // color which part on that table's line. Ten looks for nine tables; a tenth
  // table would take the last, and an eleventh would repeat the first.
  const MARKER_SHAPES = ["circle", "square", "triangle", "diamond", "triangle-down"];
  const markerFor = (() => {
    const byKey = new Map();
    pemNutSeries.forEach((series, i) => {
      byKey.set(series.key, {
        shape: MARKER_SHAPES[i % MARKER_SHAPES.length],
        hollow: Math.floor(i / MARKER_SHAPES.length) % 2 === 1,
      });
    });
    return (series) => byKey.get(series.key);
  })();

  // Every size any table lists, in ascending diameter, each holding one group
  // per table that lists it (table order) with that table's parts at the size.
  const sizes = (function () {
    const bySize = new Map();
    pemNutSeries.forEach((series) => {
      series.parts.forEach((part) => {
        if (!bySize.has(part.size)) {
          bySize.set(part.size, { size: part.size, diameter: part.diameter, groups: new Map() });
        }
        const groups = bySize.get(part.size).groups;
        if (!groups.has(series.key)) groups.set(series.key, { series: series, parts: [] });
        groups.get(series.key).parts.push(part);
      });
    });
    return Array.from(bySize.values())
      .map((s) => ({ size: s.size, diameter: s.diameter, groups: Array.from(s.groups.values()) }))
      .sort((a, b) => a.diameter - b.diameter);
  })();

  // The most parts any one table lists at one size: the legend's cells per line.
  const legendSlots = sizes.reduce((max, s) => {
    return s.groups.reduce((m, g) => Math.max(m, g.parts.length), max);
  }, 1);

  // Every table's materials merged into one order. A material a table adds is
  // placed right after the one it follows in that table (or first, if it
  // leads), so CLA's Aluminum 2024-T4 lands ahead of Steel PC 4.6.
  const allMaterials = [];
  pemNutSeries.forEach((series) => {
    series.materials.forEach((material, i) => {
      if (allMaterials.includes(material)) return;
      const prev = i > 0 ? allMaterials.indexOf(series.materials[i - 1]) : -1;
      allMaterials.splice(prev + 1, 0, material);
    });
  });

  function getStoredSet(key) {
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      return Array.isArray(stored) ? new Set(stored.filter((v) => typeof v === "string")) : null;
    } catch (err) {
      return null;
    }
  }

  // First visit: every table off but one.
  function defaultHiddenSeries() {
    const old = localStorage.getItem(OLD_SERIES_STORAGE_KEY);
    const keep = pemNutSeries.some((s) => s.key === old) ? old : pemNutSeries[0].key;
    return new Set(pemNutSeries.map((s) => s.key).filter((key) => key !== keep));
  }

  const hiddenSeries = getStoredSet(HIDDEN_SERIES_STORAGE_KEY) || defaultHiddenSeries();
  const hiddenParts = getStoredSet(HIDDEN_STORAGE_KEY) || new Set();
  const hiddenGrades = getStoredSet(HIDDEN_GRADES_STORAGE_KEY) || new Set();
  // The thread size plot's own selection, independent of the legend above but
  // following the same rules: tables and part families kept separately, and
  // a first visit starting with one table on.
  const sizePlotHiddenSeries =
    getStoredSet(SIZE_PLOT_HIDDEN_SERIES_STORAGE_KEY) || defaultHiddenSeries();
  const sizePlotHiddenFamilies = getStoredSet(SIZE_PLOT_HIDDEN_STORAGE_KEY) || new Set();
  let selectedIndex = 0;
  function storedViewFor(key) {
    const stored = localStorage.getItem(key);
    return VIEWS.some((v) => v.key === stored) ? stored : VIEWS[0].key;
  }
  let selectedView = storedViewFor(VIEW_STORAGE_KEY);
  let sizePlotView = storedViewFor(SIZE_PLOT_VIEW_STORAGE_KEY);
  // The thread size plot's size range, as slider positions into `sizes`:
  // every size unless a narrower range was picked before. Stored by size name,
  // so a range survives sizes being added to the data.
  let rangeLo = 0;
  let rangeHi = sizes.length - 1;
  (function () {
    try {
      const stored = JSON.parse(localStorage.getItem(SIZE_PLOT_RANGE_STORAGE_KEY));
      if (!Array.isArray(stored) || stored.length !== 2) return;
      const lo = indexForSize(stored[0]);
      const hi = indexForSize(stored[1]);
      if (lo <= hi) {
        rangeLo = lo;
        rangeHi = hi;
      }
    } catch (err) {
      // Nothing usable stored: keep the full range.
    }
  })();

  function currentSize() {
    return sizes[selectedIndex];
  }

  // The slider position for a size name: that size if it's listed, otherwise
  // the listed size nearest to it in diameter.
  function indexForSize(name) {
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

  // --- Shown / hidden ---

  function isPartShown(series, part) {
    return !hiddenSeries.has(series.key) && !hiddenParts.has(part.partNumber);
  }

  // Whether a table's line head reads as ticked: it has a part drawn here.
  function isGroupShown(group) {
    return group.parts.some((part) => isPartShown(group.series, part));
  }

  function saveHidden() {
    localStorage.setItem(HIDDEN_SERIES_STORAGE_KEY, JSON.stringify(Array.from(hiddenSeries)));
    localStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify(Array.from(hiddenParts)));
  }

  // Switches a table's head on, bringing back every part at this size if
  // none of them was on (see LEGEND above).
  function showGroup(group) {
    hiddenSeries.delete(group.series.key);
    const anyPartOn = group.parts.some((part) => !hiddenParts.has(part.partNumber));
    if (!anyPartOn) group.parts.forEach((part) => hiddenParts.delete(part.partNumber));
  }

  function setGroupShown(group, shown) {
    if (shown) showGroup(group);
    else hiddenSeries.add(group.series.key);
    saveHidden();
    renderPlot();
  }

  // Every table's head at once, including tables that don't list this size.
  function setAllSeriesShown(shown) {
    if (shown) {
      hiddenSeries.clear();
      currentSize().groups.forEach(showGroup);
    } else {
      pemNutSeries.forEach((series) => hiddenSeries.add(series.key));
    }
    saveHidden();
    renderPlot();
  }

  const LEGEND_ACTIONS = [
    { key: "check-all", label: "Check all series", onClick: () => setAllSeriesShown(true) },
    { key: "uncheck-all", label: "Uncheck all series", onClick: () => setAllSeriesShown(false) },
  ];

  function setPartShown(group, part, shown) {
    if (shown) {
      hiddenParts.delete(part.partNumber);
      if (hiddenSeries.has(group.series.key)) {
        hiddenSeries.delete(group.series.key);
        group.parts.forEach((other) => {
          if (other !== part) hiddenParts.add(other.partNumber);
        });
      }
    } else {
      hiddenParts.add(part.partNumber);
    }
    saveHidden();
    renderPlot();
  }

  // --- Screw grades ---

  // The ticked grades, in category order.
  function shownGrades() {
    return allMaterials.filter((material) => !hiddenGrades.has(material));
  }

  // The grade the chart is a bar chart of: the only one ticked, if there is.
  function singleGrade() {
    const grades = shownGrades();
    return grades.length === 1 ? grades[0] : null;
  }

  const gradeInputs = new Map();

  function buildGradeToggles() {
    allMaterials.forEach((material) => {
      const label = document.createElement("label");
      label.className = "est-grade-toggle";
      if (COMMON_GRADES.has(material)) label.classList.add("est-grade-toggle--strong");

      const input = document.createElement("input");
      input.type = "checkbox";
      input.addEventListener("change", () => setGradeShown(material, input.checked));
      label.appendChild(input);
      gradeInputs.set(material, input);

      const text = document.createElement("span");
      text.textContent = material;
      label.appendChild(text);

      gradeTogglesEl.appendChild(label);
    });
    syncGradeToggles();
  }

  function syncGradeToggles() {
    gradeInputs.forEach((input, material) => {
      input.checked = !hiddenGrades.has(material);
    });
  }

  function saveHiddenGrades() {
    localStorage.setItem(HIDDEN_GRADES_STORAGE_KEY, JSON.stringify(Array.from(hiddenGrades)));
  }

  function setGradeShown(material, shown) {
    if (shown) hiddenGrades.delete(material);
    else hiddenGrades.add(material);
    saveHiddenGrades();
    renderPlot();
  }

  // "Show common": tick only COMMON_GRADES, untick the rest.
  function showCommonGrades() {
    hiddenGrades.clear();
    allMaterials.forEach((material) => {
      if (!COMMON_GRADES.has(material)) hiddenGrades.add(material);
    });
    syncGradeToggles();
    saveHiddenGrades();
    renderPlot();
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

  // Locks the readout box to the widest size label, so moving the slider
  // never resizes the box — and therefore never steals width from the slider
  // track next to it.
  function updateReadoutWidth() {
    const style = getComputedStyle(readoutEl);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const letterSpacing = parseFloat(style.letterSpacing) || 0;
    const maxWidth = sizes.reduce((max, s) => {
      return Math.max(max, measureTextWidth(s.size, font, letterSpacing));
    }, 0);
    readoutEl.style.width = `${Math.ceil(maxWidth) + 1}px`;
  }

  function buildSlider() {
    const maxIndex = sizes.length - 1;
    sliderEl.max = String(maxIndex);
    sliderEl.disabled = maxIndex === 0;
    minLabelEl.textContent = sizes[0].size;
    maxLabelEl.textContent = sizes[maxIndex].size;

    buildTicks(ticksEl);
  }

  // A tick per size under a slider. The thumb's travel is inset by half its
  // width on each side (a range input centers the thumb within the track, it
  // doesn't run edge-to-edge), so ticks must be offset the same way to line
  // up with the thumb center.
  function buildTicks(el) {
    const maxIndex = sizes.length - 1;
    el.innerHTML = "";
    const thumbWidth = getThumbWidth();
    sizes.forEach((s, i) => {
      const tick = document.createElement("div");
      tick.className = "slider-tick";
      const fraction = maxIndex > 0 ? i / maxIndex : 0.5;
      tick.style.left = `calc(${thumbWidth / 2}px + (100% - ${thumbWidth}px) * ${fraction})`;
      el.appendChild(tick);
    });
  }

  // --- Thread size range (the thread size plot's two-knob slider) ---

  // The sizes the thread size plot spans, smallest to largest.
  function rangeSizes() {
    return sizes.slice(rangeLo, rangeHi + 1);
  }

  function buildRangeSlider() {
    const maxIndex = String(sizes.length - 1);
    [rangeLoEl, rangeHiEl].forEach((input) => {
      input.max = maxIndex;
      input.disabled = sizes.length < 2;
    });
    rangeMinLabelEl.textContent = sizes[0].size;
    rangeMaxLabelEl.textContent = sizes[sizes.length - 1].size;
    buildTicks(rangeTicksEl);
    syncRangeSlider();
  }

  // Knob positions, the readout, and the solid stretch of track between the
  // knobs (--lo / --hi, see .range-slider in style.css).
  function syncRangeSlider() {
    const maxIndex = sizes.length - 1;
    rangeLoEl.value = String(rangeLo);
    rangeHiEl.value = String(rangeHi);
    rangeReadoutEl.textContent =
      rangeLo === rangeHi ? sizes[rangeLo].size : `${sizes[rangeLo].size} – ${sizes[rangeHi].size}`;
    rangeLoEl.style.setProperty("--lo", maxIndex > 0 ? rangeLo / maxIndex : 0);
    rangeLoEl.style.setProperty("--hi", maxIndex > 0 ? rangeHi / maxIndex : 1);
    rangeLoEl.classList.toggle("is-raised", rangeLo === maxIndex);
  }

  // A knob moved. A knob dragged past the other pushes it along rather than
  // stopping at it, so the range can narrow to a single size but never turn
  // inside out. `moved` says which knob the visitor has hold of.
  function setRange(lo, hi, moved) {
    rangeLo = Math.max(0, Math.min(lo, sizes.length - 1));
    rangeHi = Math.max(0, Math.min(hi, sizes.length - 1));
    if (rangeLo > rangeHi) {
      if (moved === "lo") rangeHi = rangeLo;
      else rangeLo = rangeHi;
    }
    syncRangeSlider();
    localStorage.setItem(
      SIZE_PLOT_RANGE_STORAGE_KEY,
      JSON.stringify([sizes[rangeLo].size, sizes[rangeHi].size])
    );
    renderSizePlot(singleGrade());
  }

  // --- Plot ---

  // "Steel PC 4.6" -> ["Steel", "PC 4.6"]: the material family on one line
  // and the grade under it, so the categories fit across the plot.
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

  // The same for bar i of n within a table's band in the bar chart.
  function barOffset(i, n) {
    return (i - (n - 1) / 2) * BAR_STEP;
  }

  // "a", "a and b", "a, b and c".
  function joinList(items) {
    if (items.length <= 1) return items.join("");
    return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
  }

  // Every table, in table order, whether or not it lists the size — see
  // LEGEND above. A table without the size has a locked head that reads as
  // ticked when the table is switched on, and no parts.
  // `swatches` is what the legend keys: "markers" (the dot plot — each head
  // shows its table's marker, each part its color), "colors" (the bar chart —
  // part colors only, since the x axis now says which table a bar is from),
  // or "none" (the table view, which has nothing to key).
  function buildLegendItems(size, swatches) {
    const headLook = (series) => {
      if (swatches !== "markers") return {};
      const marker = markerFor(series);
      return { shape: marker.shape, hollow: marker.hollow };
    };
    const partLook = (i) => (swatches === "none" ? {} : { color: colorFor(i) });
    return pemNutSeries.map((series) => {
      const group = size.groups.find((g) => g.series === series);
      if (!group) {
        return Object.assign(headLook(series), {
          key: `series:${series.key}`,
          label: series.label,
          active: !hiddenSeries.has(series.key),
          disabled: true,
          onToggle: () => {},
          items: [],
        });
      }
      return Object.assign(headLook(series), {
        key: `series:${series.key}`,
        label: series.label,
        active: isGroupShown(group),
        onToggle: (checked) => setGroupShown(group, checked),
        items: group.parts.map((part, i) =>
          Object.assign(partLook(i), {
            key: part.partNumber,
            label: part.partNumber,
            active: isPartShown(series, part),
            onToggle: (checked) => setPartShown(group, part, checked),
          })
        ),
      });
    });
  }

  // Redraws whichever view is on screen, plus the title and notes they share.
  function renderPlot() {
    const size = currentSize();
    const shownGroups = size.groups.filter(isGroupShown);
    const described = describedSeries(size, shownGroups);
    const grades = shownGrades();
    const grade = singleGrade();
    const materials = grades.filter((m) =>
      described.some((series) => series.materials.includes(m))
    );

    const shownParts = [];
    size.groups.forEach((group) => {
      group.parts.forEach((part, i) => {
        if (isPartShown(group.series, part)) {
          shownParts.push({ series: group.series, part: part, color: colorFor(i) });
        }
      });
    });

    plotTitleEl.textContent =
      (shownGroups.length === 1
        ? `${shownGroups[0].series.title}, ${size.size}`
        : `PEM® Nuts, ${size.size}`) + (grade ? `, ${grade} Screw` : "");

    // Why there's nothing to draw, for whichever view comes up empty.
    const emptyMessage = !grades.length
      ? NO_GRADE_MESSAGE
      : !shownParts.length
        ? EMPTY_MESSAGE
        : `No torque listed for ${grade || "the selected screw grades"} in the selected series`;

    if (selectedView === "table") {
      renderTable(size, materials, shownParts, emptyMessage);
    } else if (grade) {
      renderBarChart(size, shownGroups, grade, shownParts, emptyMessage);
    } else {
      renderChart(size, shownGroups, materials, shownParts, emptyMessage);
    }

    renderSizePlot(grade);
    renderNotes(described);
  }

  // A plotted point's tooltip, the same for a dot or a bar.
  function tooltipLines(point, s) {
    return [
      s.label,
      `${point.material}: ${point.torque} Nm`,
      `Min. axial strength (PC 12.9 screw): ${point.part.minAxialStrength} kN`,
      `Screw strength to develop min. axial: ${point.part.screwStrength} MPa`,
    ];
  }

  // The dot plot: screw materials along x, a marker per shown part in each.
  function renderChart(size, shownGroups, materials, shownParts, emptyMessage) {
    const series = shownParts.map((entry, j) => ({
      key: entry.part.partNumber,
      label: entry.part.partNumber,
      color: entry.color,
      shape: markerFor(entry.series).shape,
      hollow: markerFor(entry.series).hollow,
      line: false,
      points: entry.series.materials
        .map((material, m) => ({
          x: materials.indexOf(material) + dodge(j, shownParts.length),
          y: parseFloat(entry.part.torque[m]),
          torque: entry.part.torque[m],
          material: material,
          part: entry.part,
        }))
        .filter((p) => materials.includes(p.material) && Number.isFinite(p.y)),
    }));

    renderLinePlot(plotEl, {
      title: plotTitleEl.textContent,
      series: series,
      legendItems: buildLegendItems(size, "markers"),
      legendSlots: legendSlots,
      legendActions: LEGEND_ACTIONS,
      xCategories: materials.map(categoryLines),
      xLabel: "Screw Material",
      yLabel: "Mating Screw Tightening Torque (Nm)",
      ariaLabel:
        `Mating screw tightening torque by screw material for PEM ` +
        (shownGroups.length ? `${joinList(shownGroups.map((g) => g.series.label))} ` : "") +
        `nuts, ${size.size}, ${series.length} part numbers`,
      formatTooltip: tooltipLines,
      emptyMessage: emptyMessage,
    });
  }

  // The bar chart, for exactly one grade ticked: the PEM tables along x, one
  // band per table with a torque at the grade (a table without that column,
  // like CLA at PC 4.6, gets no band), and its shown parts as bars side by
  // side in their legend colors.
  function renderBarChart(size, shownGroups, grade, shownParts, emptyMessage) {
    // shownParts runs in table order, so a table's parts are consecutive.
    const bands = [];
    shownParts.forEach((entry) => {
      const m = entry.series.materials.indexOf(grade);
      const y = m >= 0 ? parseFloat(entry.part.torque[m]) : NaN;
      if (!Number.isFinite(y)) return;
      let band = bands[bands.length - 1];
      if (!band || band.series !== entry.series) {
        band = { series: entry.series, bars: [] };
        bands.push(band);
      }
      band.bars.push({ entry: entry, y: y, torque: entry.part.torque[m] });
    });

    const series = [];
    bands.forEach((band, b) => {
      band.bars.forEach((bar, i) => {
        series.push({
          key: bar.entry.part.partNumber,
          label: bar.entry.part.partNumber,
          color: bar.entry.color,
          bar: true,
          barWidth: BAR_WIDTH,
          points: [
            {
              x: b + barOffset(i, band.bars.length),
              y: bar.y,
              torque: bar.torque,
              material: grade,
              part: bar.entry.part,
            },
          ],
        });
      });
    });

    renderLinePlot(plotEl, {
      title: plotTitleEl.textContent,
      series: series,
      legendItems: buildLegendItems(size, "colors"),
      legendSlots: legendSlots,
      legendActions: LEGEND_ACTIONS,
      xCategories: bands.map((band) => band.series.label),
      xLabel: "Series",
      yLabel: "Mating Screw Tightening Torque (Nm)",
      ariaLabel:
        `Mating screw tightening torque with a ${grade} screw by PEM series` +
        (shownGroups.length ? ` (${joinList(shownGroups.map((g) => g.series.label))})` : "") +
        `, ${size.size}, ${series.length} part numbers`,
      formatTooltip: tooltipLines,
      emptyMessage: emptyMessage,
    });
  }

  // --- Torque by thread size ---

  // Every table's part families: its part numbers with the thread size taken
  // out (S-M3-0ZI, S-M4-0ZI, ... -> "S-M*-0ZI"; S-RTM3-0ZI -> "S-RTM*-0ZI"),
  // in the order the sheet first lists them. A family is one variant of the
  // nut across the sizes it's made in, so it's what the thread size plot
  // draws as a series and lists in its legend — the plot spans every size,
  // where a single part number only exists at one.
  const familiesBySeries = new Map();
  pemNutSeries.forEach((series) => {
    const byLabel = new Map();
    series.parts.forEach((part) => {
      const label = part.partNumber.replace(part.size, "M*");
      if (!byLabel.has(label)) {
        byLabel.set(label, { key: `${series.key}:${label}`, label: label, parts: new Map() });
      }
      byLabel.get(label).parts.set(part.size, part);
    });
    familiesBySeries.set(series.key, Array.from(byLabel.values()));
  });

  // The thread size legend's cells per row: as many as the most families any
  // table has, but no more than four, so the family names fit uncut. A table
  // with more (S and CLS have seven) wraps onto a second row of the same
  // cells. Every line is always passed with all its families, so the legend
  // still keeps one size whatever is ticked.
  const SIZE_PLOT_LEGEND_MAX_SLOTS = 4;
  const sizePlotLegendSlots = Math.min(
    SIZE_PLOT_LEGEND_MAX_SLOTS,
    Array.from(familiesBySeries.values()).reduce(
      (max, families) => Math.max(max, families.length),
      1
    )
  );

  // A family's torque at one size and grade, as printed, or null when the
  // family isn't made in that size or its table prints no torque there.
  function familyTorque(series, family, size, grade) {
    const part = family.parts.get(size);
    const m = series.materials.indexOf(grade);
    if (!part || m < 0 || !Number.isFinite(parseFloat(part.torque[m]))) return null;
    return part.torque[m];
  }

  // The families a table offers at the grade: those with a torque at a size
  // in the range slider's span. The rest are grayed out in the legend, as the
  // legend above grays out a table that doesn't list the size.
  function offeredFamilies(series, grade) {
    return familiesBySeries
      .get(series.key)
      .filter((family) =>
        rangeSizes().some((size) => familyTorque(series, family, size.size, grade))
      );
  }

  function isFamilyShown(series, family) {
    return !sizePlotHiddenSeries.has(series.key) && !sizePlotHiddenFamilies.has(family.key);
  }

  function saveSizePlotHidden() {
    localStorage.setItem(
      SIZE_PLOT_HIDDEN_SERIES_STORAGE_KEY,
      JSON.stringify(Array.from(sizePlotHiddenSeries))
    );
    localStorage.setItem(
      SIZE_PLOT_HIDDEN_STORAGE_KEY,
      JSON.stringify(Array.from(sizePlotHiddenFamilies))
    );
  }

  // The same head rules as the legend above (see LEGEND), over a table's
  // families at the grade rather than its parts at the size.
  function showSizePlotSeries(series, grade) {
    sizePlotHiddenSeries.delete(series.key);
    const offered = offeredFamilies(series, grade);
    if (!offered.some((family) => !sizePlotHiddenFamilies.has(family.key))) {
      offered.forEach((family) => sizePlotHiddenFamilies.delete(family.key));
    }
  }

  function setSizePlotSeriesShown(series, shown) {
    if (shown) showSizePlotSeries(series, singleGrade());
    else sizePlotHiddenSeries.add(series.key);
    saveSizePlotHidden();
    renderSizePlot(singleGrade());
  }

  function setAllSizePlotSeriesShown(shown) {
    const grade = singleGrade();
    pemNutSeries.forEach((series) => {
      if (shown) showSizePlotSeries(series, grade);
      else sizePlotHiddenSeries.add(series.key);
    });
    saveSizePlotHidden();
    renderSizePlot(grade);
  }

  function setFamilyShown(series, family, shown) {
    if (shown) {
      sizePlotHiddenFamilies.delete(family.key);
      if (sizePlotHiddenSeries.has(series.key)) {
        sizePlotHiddenSeries.delete(series.key);
        familiesBySeries.get(series.key).forEach((other) => {
          if (other !== family) sizePlotHiddenFamilies.add(other.key);
        });
      }
    } else {
      sizePlotHiddenFamilies.add(family.key);
    }
    saveSizePlotHidden();
    renderSizePlot(singleGrade());
  }

  const SIZE_PLOT_LEGEND_ACTIONS = [
    { key: "check-all", label: "Check all series", onClick: () => setAllSizePlotSeriesShown(true) },
    { key: "uncheck-all", label: "Uncheck all series", onClick: () => setAllSizePlotSeriesShown(false) },
  ];

  // Built like buildLegendItems: a line per table, always, headed by the
  // table's checkbox and followed by its families. A table with no torque at
  // the grade is grayed out with its head locked; so is a family. `swatches`
  // is "markers" for the plot and "none" for the table view.
  function buildSizePlotLegendItems(grade, swatches) {
    return pemNutSeries.map((series) => {
      const offered = offeredFamilies(series, grade);
      const marker = markerFor(series);
      const head = swatches === "markers" ? { shape: marker.shape, hollow: marker.hollow } : {};
      return Object.assign(head, {
        key: `series:${series.key}`,
        label: series.label,
        active: offered.length
          ? offered.some((family) => isFamilyShown(series, family))
          : !sizePlotHiddenSeries.has(series.key),
        disabled: !offered.length,
        onToggle: offered.length ? (checked) => setSizePlotSeriesShown(series, checked) : () => {},
        items: familiesBySeries.get(series.key).map((family, i) => {
          const isOffered = offered.includes(family);
          return Object.assign(swatches === "none" ? {} : { color: colorFor(i) }, {
            key: family.key,
            label: family.label,
            active: isFamilyShown(series, family),
            disabled: !isOffered,
            onToggle: isOffered ? (checked) => setFamilyShown(series, family, checked) : () => {},
          });
        }),
      });
    });
  }

  // The second plot, shown only with exactly one grade ticked: that grade's
  // torque across every thread size, one dot series per part family in its
  // table's marker and its color on that table's legend line — the same look
  // as the plot above, with part families in place of part numbers. It's
  // switched from its own legend under it, not the one above, and the slider
  // doesn't move it. The x axis is the sizes a shown family has a torque at;
  // within each size's band the families there are dodged side by side, as
  // the plot above dodges parts within a material's band.
  function renderSizePlot(grade) {
    sizePlotGroupEl.hidden = !grade;
    if (!grade) return;

    // Shown families with a torque at the grade, in table order.
    const shown = [];
    pemNutSeries.forEach((series) => {
      familiesBySeries.get(series.key).forEach((family, i) => {
        if (!isFamilyShown(series, family)) return;
        if (!rangeSizes().some((size) => familyTorque(series, family, size.size, grade))) return;
        shown.push({ series: series, family: family, color: colorFor(i) });
      });
    });
    const columns = rangeSizes().filter((size) =>
      shown.some((entry) => familyTorque(entry.series, entry.family, size.size, grade))
    );

    const plottedSeries = pemNutSeries.filter((series) => shown.some((e) => e.series === series));
    sizePlotTitleEl.textContent =
      (plottedSeries.length === 1 ? plottedSeries[0].title : "PEM® Nuts") +
      ` by Thread Size, ${grade} Screw`;

    const span = rangeSizes();
    const spanText =
      span.length === 1 ? `at ${span[0].size}` : `from ${span[0].size} to ${span[span.length - 1].size}`;
    const anySelected = pemNutSeries.some((series) =>
      familiesBySeries.get(series.key).some((family) => isFamilyShown(series, family))
    );
    const emptyMessage = anySelected
      ? `No torque listed for ${grade} in the selected series ${spanText}`
      : EMPTY_MESSAGE.replace(" at this size", "");

    if (sizePlotView === "table") {
      renderSizeTable(grade, shown, columns, emptyMessage);
      return;
    }

    // Each size's band dodges just the families present at that size.
    const slots = new Map();
    columns.forEach((size) => {
      const present = shown.filter((e) => familyTorque(e.series, e.family, size.size, grade));
      present.forEach((entry, j) => {
        slots.set(`${entry.family.key}@${size.size}`, dodge(j, present.length));
      });
    });

    const series = shown.map((entry) => {
      const marker = markerFor(entry.series);
      const points = [];
      columns.forEach((size, c) => {
        const torque = familyTorque(entry.series, entry.family, size.size, grade);
        if (!torque) return;
        points.push({
          x: c + slots.get(`${entry.family.key}@${size.size}`),
          y: parseFloat(torque),
          torque: torque,
          material: grade,
          part: entry.family.parts.get(size.size),
        });
      });
      return {
        key: entry.family.key,
        label: entry.family.label,
        color: entry.color,
        shape: marker.shape,
        hollow: marker.hollow,
        line: false,
        points: points,
      };
    });

    renderLinePlot(sizePlotEl, {
      title: sizePlotTitleEl.textContent,
      series: series,
      legendItems: buildSizePlotLegendItems(grade, "markers"),
      legendSlots: sizePlotLegendSlots,
      legendActions: SIZE_PLOT_LEGEND_ACTIONS,
      xCategories: columns.map((size) => size.size),
      xLabel: "Thread Size",
      yLabel: "Mating Screw Tightening Torque (Nm)",
      ariaLabel:
        `Mating screw tightening torque with a ${grade} screw by thread size for PEM ` +
        (plottedSeries.length ? `${joinList(plottedSeries.map((s) => s.label))} ` : "") +
        `nuts, ${series.length} part families`,
      formatTooltip: (point) => tooltipLines(point, { label: point.part.partNumber }),
      emptyMessage: emptyMessage,
    });
  }

  // The thread size plot's values as a table: one row per shown part family,
  // grouped by table as in the table view above, and one torque column per
  // size on the plot's axis (a dash where the family isn't made in it).
  function renderSizeTable(grade, shown, columns, emptyMessage) {
    sizeTableWrapEl.innerHTML = "";

    if (!shown.length) {
      const empty = document.createElement("p");
      empty.className = "plot-empty pem-table-empty";
      empty.textContent = emptyMessage;
      sizeTableWrapEl.appendChild(empty);
    } else {
      const table = document.createElement("table");
      table.className = "est-table pem-table";

      const thead = document.createElement("thead");
      const top = document.createElement("tr");
      top.appendChild(headerCell(["Series"], { rowspan: "2", scope: "col" }));
      top.appendChild(
        headerCell(["Part No."], { rowspan: "2", scope: "col", class: "est-col-divide" })
      );
      top.appendChild(
        headerCell([`Mating Screw Tightening Torque, ${grade} Screw (Nm)`], {
          colspan: String(columns.length),
          scope: "colgroup",
        })
      );
      thead.appendChild(top);
      const bottom = document.createElement("tr");
      columns.forEach((size) => bottom.appendChild(headerCell([size.size], { scope: "col" })));
      thead.appendChild(bottom);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      shown.forEach((entry, j) => {
        const tr = document.createElement("tr");
        if (j === 0 || shown[j - 1].series !== entry.series) {
          tr.className = "est-group-start";
          const seriesCell = document.createElement("th");
          seriesCell.className = "est-row-size pem-row-series";
          seriesCell.setAttribute("scope", "rowgroup");
          seriesCell.setAttribute(
            "rowspan",
            String(shown.filter((e) => e.series === entry.series).length)
          );
          seriesCell.textContent = entry.series.label;
          tr.appendChild(seriesCell);
        }

        const familyCell = document.createElement("th");
        familyCell.className = "est-row-label pem-row-part est-col-divide";
        familyCell.setAttribute("scope", "row");
        familyCell.textContent = entry.family.label;
        tr.appendChild(familyCell);

        columns.forEach((size) => {
          const td = document.createElement("td");
          const torque = familyTorque(entry.series, entry.family, size.size, grade);
          if (torque) {
            td.textContent = torque;
          } else {
            td.textContent = "—";
            td.className = "pem-cell-none";
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      sizeTableWrapEl.appendChild(table);
    }

    renderPlotLegend(sizeTableLegendEl, {
      legendItems: buildSizePlotLegendItems(grade, "none"),
      legendSlots: sizePlotLegendSlots,
      legendActions: SIZE_PLOT_LEGEND_ACTIONS,
    });
  }

  // --- Table ---

  function headerCell(lines, attrs) {
    const th = document.createElement("th");
    lines.forEach((line, i) => {
      if (i) th.appendChild(document.createElement("br"));
      th.appendChild(document.createTextNode(line));
    });
    Object.keys(attrs || {}).forEach((key) => th.setAttribute(key, attrs[key]));
    return th;
  }

  // The plot's values as a table: one row per shown part, grouped by PEM
  // table (a merged first cell with the table's label, and a heavier rule
  // starting each group), then the part number, its strengths, and its torque
  // under each material column.
  function renderTable(size, materials, shownParts, emptyMessage) {
    tableWrapEl.innerHTML = "";

    if (!shownParts.length || !materials.length) {
      const empty = document.createElement("p");
      empty.className = "plot-empty pem-table-empty";
      empty.textContent = emptyMessage;
      tableWrapEl.appendChild(empty);
    } else {
      const table = document.createElement("table");
      table.className = "est-table pem-table";

      const thead = document.createElement("thead");
      const top = document.createElement("tr");
      top.appendChild(headerCell(["Series"], { rowspan: "2", scope: "col" }));
      top.appendChild(headerCell(["Part No."], { rowspan: "2", scope: "col" }));
      top.appendChild(
        headerCell(["Min.", "Axial", "Strength", "(kN)"], {
          rowspan: "2",
          scope: "col",
          class: "pem-col-strength",
        })
      );
      top.appendChild(
        headerCell(["Screw", "Strength", "Needed", "(MPa)"], {
          rowspan: "2",
          scope: "col",
          class: "pem-col-strength est-col-divide",
        })
      );
      top.appendChild(
        headerCell(["Mating Screw Tightening Torque (Nm)"], {
          colspan: String(materials.length),
          scope: "colgroup",
        })
      );
      thead.appendChild(top);
      const bottom = document.createElement("tr");
      materials.forEach((material) => {
        bottom.appendChild(headerCell(categoryLines(material), { scope: "col" }));
      });
      thead.appendChild(bottom);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      shownParts.forEach((entry, j) => {
        const tr = document.createElement("tr");
        const firstOfGroup = j === 0 || shownParts[j - 1].series !== entry.series;
        if (firstOfGroup) {
          tr.className = "est-group-start";
          const span = shownParts.filter((e) => e.series === entry.series).length;
          const seriesCell = document.createElement("th");
          seriesCell.className = "est-row-size pem-row-series";
          seriesCell.setAttribute("scope", "rowgroup");
          seriesCell.setAttribute("rowspan", String(span));
          seriesCell.textContent = entry.series.label;
          tr.appendChild(seriesCell);
        }

        const partCell = document.createElement("th");
        partCell.className = "est-row-label pem-row-part";
        partCell.setAttribute("scope", "row");
        partCell.textContent = entry.part.partNumber;
        tr.appendChild(partCell);

        const axial = document.createElement("td");
        axial.className = "pem-col-strength";
        axial.textContent = entry.part.minAxialStrength;
        tr.appendChild(axial);
        const strength = document.createElement("td");
        strength.className = "pem-col-strength est-col-divide";
        strength.textContent = entry.part.screwStrength;
        tr.appendChild(strength);

        materials.forEach((material) => {
          const td = document.createElement("td");
          const m = entry.series.materials.indexOf(material);
          if (m >= 0 && entry.part.torque[m]) {
            td.textContent = entry.part.torque[m];
          } else {
            td.textContent = "\u2014";
            td.className = "pem-cell-none";
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrapEl.appendChild(table);
    }

    renderPlotLegend(tableLegendEl, {
      legendItems: buildLegendItems(size, "none"),
      legendSlots: legendSlots,
      legendActions: LEGEND_ACTIONS,
    });
  }

  // The tables the axis and notes describe. Normally the ones drawn at this
  // size. With nothing drawn, the tables switched on, even ones that don't
  // list this size: with only RT on and the slider at M2 (which RT doesn't
  // list), the notes should still give RT's K = 0.25, not the K = 0.20 of the
  // tables that do list M2. With every table off too, every table at the
  // size, since that's what the legend is offering.
  function describedSeries(size, shownGroups) {
    if (shownGroups.length) return shownGroups.map((g) => g.series);
    const switchedOn = pemNutSeries.filter((series) => !hiddenSeries.has(series.key));
    if (switchedOn.length) return switchedOn;
    return size.groups.map((g) => g.series);
  }

  // The nut factor and any footnotes belong to the tables, so they're drawn
  // for the tables describedSeries picks rather than written into the page.
  // With more than one table, a K that differs and each footnote say which
  // table they belong to.
  function renderNotes(seriesList) {
    notesEl.innerHTML = "";
    const labelsByK = new Map();
    seriesList.forEach((series) => {
      if (!labelsByK.has(series.k)) labelsByK.set(series.k, []);
      labelsByK.get(series.k).push(series.label);
    });
    // "K = 0.20" for one K, "K = 0.20 (S, CLS) or K = 0.25 (RT)" for several.
    const kText =
      labelsByK.size === 1
        ? `K = ${labelsByK.keys().next().value}`
        : Array.from(labelsByK, ([k, labels]) => `K = ${k} (${labels.join(", ")})`).join(" or ");
    const items = [`Torques assume a nut factor ${kText}. Actual K may vary.`];
    seriesList.forEach((series) => {
      series.footnotes.forEach((note) => {
        items.push(seriesList.length > 1 ? `${series.label}: ${note}` : note);
      });
    });
    items.forEach((note) => {
      const li = document.createElement("li");
      li.textContent = note;
      notesEl.appendChild(li);
    });
  }

  // --- Controls ---

  // A Chart | Table toggle. Both plots have one, each with its own view.
  function buildViewToggle(toggleEl, onPick) {
    VIEWS.forEach((view) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "metric-option";
      button.dataset.view = view.key;
      button.textContent = view.label;
      button.addEventListener("click", () => onPick(view.key));
      toggleEl.appendChild(button);
    });
  }

  // Shows a toggle's selected view and hides the other. The view is shown
  // before it's drawn, so the plot measures its real width rather than a
  // hidden 0.
  function syncViewToggle(toggleEl, chartEl, tableEl, view) {
    toggleEl.querySelectorAll(".metric-option").forEach((button) => {
      const isActive = button.dataset.view === view;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    chartEl.hidden = view !== "chart";
    tableEl.hidden = view !== "table";
  }

  function syncView() {
    syncViewToggle(viewToggleEl, plotEl, tableViewEl, selectedView);
    syncViewToggle(sizeViewToggleEl, sizePlotEl, sizeTableViewEl, sizePlotView);
  }

  function setView(key) {
    selectedView = key;
    localStorage.setItem(VIEW_STORAGE_KEY, key);
    syncView();
    renderPlot();
  }

  function setSizePlotView(key) {
    sizePlotView = key;
    localStorage.setItem(SIZE_PLOT_VIEW_STORAGE_KEY, key);
    syncView();
    renderSizePlot(singleGrade());
  }

  // Moves the slider to a size and redraws.
  function showIndex(i) {
    selectedIndex = Math.max(0, Math.min(sizes.length - 1, i));
    sliderEl.value = String(selectedIndex);
    readoutEl.textContent = currentSize().size;
    renderPlot();
  }

  // A size the visitor picked: remembered for their next visit.
  function pickIndex(i) {
    showIndex(i);
    localStorage.setItem(SIZE_STORAGE_KEY, currentSize().size);
  }

  updateReadoutWidth();
  window.addEventListener("resize", updateReadoutWidth);

  buildSlider();
  buildRangeSlider();
  buildViewToggle(viewToggleEl, setView);
  buildViewToggle(sizeViewToggleEl, setSizePlotView);
  buildGradeToggles();
  syncView();

  gradeCommonEl.addEventListener("click", showCommonGrades);

  rangeLoEl.addEventListener("input", () => setRange(Number(rangeLoEl.value), rangeHi, "lo"));
  rangeHiEl.addEventListener("input", () => setRange(rangeLo, Number(rangeHiEl.value), "hi"));

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

  showIndex(indexForSize(localStorage.getItem(SIZE_STORAGE_KEY) || DEFAULT_SIZE));
})();
