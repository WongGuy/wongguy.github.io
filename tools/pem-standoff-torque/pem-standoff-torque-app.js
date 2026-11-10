// DOM logic for pem-standoff-torque.html: the size slider and the mating screw
// torque plot, whose legend is where PEM standoff tables and standoff
// materials are switched on and off. Reads pem-standoff-torque-data.js; see
// that file for the schema and for how to regenerate it. Built the same way as
// the PEM nut torque page, with materials in place of part numbers.
//
// WHAT'S PLOTTED
//
// A grouped bar chart: one bar per table, standoff material and thread code
// at the selected size, up to that row's maximum recommended tightening
// torque for the mating screw. The x axis is categorical, one band per table
// and thread code, table first ("M3 / SO / BSO", "3.5M3 / SO / BSO",
// "M3 / SO4 / BSO4", "3.5M3 / SO4 / BSO4", ...), so a table's 3.5M3 sits
// right beside its M3. A size's thread codes are the ones ending in it: 3.5M3
// (a 3.5 mm body with an M3 thread) belongs to M3, so it shares the M3 slider
// position and gets bands of its own. Bands are trimmed to the tables with a
// material shown.
//
// A bar's color is its material — the same in every table, and the same as
// that material's column in the legend. Within a band the table's shown
// materials stand side by side, one bar width apart.
//
// LEGEND
//
// One line per PEM table, headed by a checkbox with the table's label ("SO /
// BSO", "SO4 / BSO4", "DSO"), followed by one checkbox per standoff material
// the table offers at the size — Steel, Stainless (Steel), Aluminum — each in
// the same column on every line. A material the table doesn't offer isn't
// shown at all, the way the nut page shows only the parts at the size; its
// cell is just left empty: SO4 / BSO4 are made only in stainless steel, so
// that line has Stainless Steel alone, in the Stainless column. Which materials
// a table lists comes from the data (and so from the workbook), not from this
// file.
//
// The head and the materials work like the nut page's head and part numbers.
// Unticking a head hides all of its table's materials; ticking it again brings
// back the ones that were on before — head and materials are remembered
// separately, so a material is drawn only when both are on. The head reads as
// ticked when its table has a material drawn at this size. So:
//   - ticking a head whose materials at this size were all unticked one by
//     one brings them all back, since otherwise the tick would draw nothing;
//   - ticking a material while its table's head is off turns the head back on
//     with just that material, as every material on the line read as unticked.
// Under the lines, "Check all series" and "Uncheck all series" set every
// table's head at once, grayed-out tables included.
//
// The legend keeps one size for every slider position: every table always has
// its line and every line has a cell per material (legendSlots in plot.js), so
// a line offering fewer materials just has empty cells where the others go. A table that doesn't
// list the size is grayed out with its head locked, showing whether the table
// is switched on, so it can't be changed at a size where it would do nothing.
//
// CHART / TABLE
//
// A toggle over the chart (styled like the NASA page's torque toggle) swaps
// it for a table of the same rows: the shown tables, thread codes and
// materials at the size, in the chart's order, each with its PEM types and
// max. torque, and a line per test sheet with the installation, pushout,
// torque-out and pull-thru values the chart's tooltip gives. The table keeps
// the legend under it (drawn with renderPlotLegend), plain, with no colors,
// since there are no bars for them to key. Only the view on screen is drawn.
//
// I CRAVE DETAIL
//
// The "I Crave Detail!" checkbox beside the slider applies to the table view
// only; in the chart view it's hidden and the chart is always the one above.
// Ticked, the table is the one above. Unticked, the table shows every size at
// once instead and the slider's knob and size readout are hidden (the slider
// is disabled): the table drops the test sheet columns and the thread column,
// and its Max. Torque column splits into one column per size (M3, M3.5, M4,
// M5), a row per shown table and material. A size's thread codes share its
// column — 3.5M3 is under M3 — printing each distinct torque among them
// ("0.55", or "0.55 / 0.60" if they ever differed). The legend lists every
// material each table offers at any size, with no table locked. The checkbox
// shares its localStorage key ("detailEnabled") with the screw and nut
// selectors' checkbox, so it's the same setting site-wide.
//
// State remembered in localStorage between visits: the view, the size, which
// tables are switched off, and which materials are (per table, "SO:Aluminum"). Off rather
// than on, so a table or material not seen before starts switched on.

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
  const detailToggleEl = document.getElementById("detail-toggle");
  const sliderBlockEl = sliderEl.closest(".slider-block");

  const SIZE_STORAGE_KEY = "pemStandoffTorqueSize";
  // Shared with the screw and nut selectors, so the checkbox is one setting.
  const DETAIL_STORAGE_KEY = "detailEnabled";
  const VIEW_STORAGE_KEY = "pemStandoffTorqueView";
  const HIDDEN_SERIES_STORAGE_KEY = "pemStandoffTorqueHiddenSeries";
  const HIDDEN_MATERIALS_STORAGE_KEY = "pemStandoffTorqueHiddenMaterials";

  const DEFAULT_SIZE = "M3";

  const VIEWS = [
    { key: "chart", label: "Chart" },
    { key: "table", label: "Table" },
  ];

  const EMPTY_MESSAGE = "No standoff material selected at this size";

  // Bars are BAR_STEP apart within a band (a band is 1 wide) and a little
  // narrower than that, so neighbors don't touch. No table lists more than
  // three materials, so a band's bars fill at most 0.6 of it.
  const BAR_STEP = 0.2;
  const BAR_WIDTH = 0.17;

  // Every material any table lists, merged into one order the way the nut page
  // merges its screw materials: a material a table adds goes right after the
  // one it follows in that table. These are the legend's columns.
  const allMaterials = [];
  pemStandoffSeries.forEach((series) => {
    series.materials.forEach((material, i) => {
      if (allMaterials.includes(material.name)) return;
      const prev = i > 0 ? allMaterials.indexOf(series.materials[i - 1].name) : -1;
      allMaterials.splice(prev + 1, 0, material.name);
    });
  });

  // The plot colors live in style.css (light and dark values) so they follow
  // the theme. One per material, by its legend column.
  const SERIES_COLOR_COUNT = 5;
  const colorFor = (name) =>
    `var(--series-${(allMaterials.indexOf(name) % SERIES_COLOR_COUNT) + 1})`;

  // Shorter legend text for a material whose full name doesn't fit a legend
  // cell on a phone (two cells per row there). Only the legend uses these;
  // the tooltip and notes keep the data's name.
  const LEGEND_LABELS = { "Stainless Steel": "Stainless" };
  const legendLabel = (name) => LEGEND_LABELS[name] || name;

  // Every size any table lists, in ascending diameter, each holding one group
  // per table that lists it (table order): that table's rows at the size, and
  // the thread codes and materials they cover, in sheet order.
  const sizes = (function () {
    const bySize = new Map();
    pemStandoffSeries.forEach((series) => {
      series.rows.forEach((row) => {
        if (!bySize.has(row.size)) {
          bySize.set(row.size, { size: row.size, diameter: row.diameter, groups: new Map() });
        }
        const groups = bySize.get(row.size).groups;
        if (!groups.has(series.key)) {
          groups.set(series.key, { series: series, rows: [], threads: [], materials: [] });
        }
        const group = groups.get(series.key);
        group.rows.push(row);
        if (!group.threads.includes(row.thread)) group.threads.push(row.thread);
        if (!group.materials.includes(row.material)) group.materials.push(row.material);
      });
    });
    return Array.from(bySize.values())
      .map((s) => ({ size: s.size, diameter: s.diameter, groups: Array.from(s.groups.values()) }))
      .sort((a, b) => a.diameter - b.diameter);
  })();

  // Every size at once, shaped like an entry of `sizes` (no size name): one
  // group per table, each with all its rows, thread codes and materials. The
  // legend, the head rules and the notes take this in place of a size when
  // detail is off.
  const everySize = {
    size: null,
    groups: pemStandoffSeries.map((series) => {
      const group = { series: series, rows: series.rows.slice(), threads: [], materials: [] };
      series.rows.forEach((row) => {
        if (!group.threads.includes(row.thread)) group.threads.push(row.thread);
        if (!group.materials.includes(row.material)) group.materials.push(row.material);
      });
      return group;
    }),
  };

  function getStoredSet(key) {
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      return Array.isArray(stored) ? new Set(stored.filter((v) => typeof v === "string")) : null;
    } catch (err) {
      return null;
    }
  }

  const hiddenSeries = getStoredSet(HIDDEN_SERIES_STORAGE_KEY) || new Set();
  const hiddenMaterials = getStoredSet(HIDDEN_MATERIALS_STORAGE_KEY) || new Set();
  let selectedIndex = 0;
  const storedView = localStorage.getItem(VIEW_STORAGE_KEY);
  let selectedView = VIEWS.some((v) => v.key === storedView) ? storedView : VIEWS[0].key;
  let showDetail = localStorage.getItem(DETAIL_STORAGE_KEY) !== "false";

  function currentSize() {
    return sizes[selectedIndex];
  }

  // Whether the page shows every size at once: the table view with detail
  // off. The chart always shows one size, so the checkbox only applies to the
  // table.
  function isAllSizes() {
    return !showDetail && selectedView === "table";
  }

  // What the legend and its head rules work over: the slider's size, or
  // every size at once.
  function legendSize() {
    return isAllSizes() ? everySize : currentSize();
  }

  // The slider position for a size name: that size if it's listed, otherwise
  // the listed size nearest to it in diameter.
  function indexForSize(name) {
    const exact = sizes.findIndex((s) => s.size === name);
    if (exact >= 0) return exact;
    const target = parseFloat(String(name).replace(/^M/, ""));
    if (!Number.isFinite(target)) {
      const fallback = sizes.findIndex((s) => s.size === DEFAULT_SIZE);
      return fallback >= 0 ? fallback : 0;
    }
    let best = 0;
    sizes.forEach((s, i) => {
      if (Math.abs(s.diameter - target) < Math.abs(sizes[best].diameter - target)) best = i;
    });
    return best;
  }

  // --- Shown / hidden ---

  function materialKey(series, name) {
    return `${series.key}:${name}`;
  }

  // The PEM types a table makes in a material: ["SOS", "BSOS"].
  function typesFor(series, name) {
    const material = series.materials.find((m) => m.name === name);
    return material ? material.types : [];
  }

  function isMaterialShown(series, name) {
    return !hiddenSeries.has(series.key) && !hiddenMaterials.has(materialKey(series, name));
  }

  // A table's materials drawn at this size, in legend column order.
  function shownMaterials(group) {
    return allMaterials.filter(
      (name) => group.materials.includes(name) && isMaterialShown(group.series, name)
    );
  }

  // Whether a table's line head reads as ticked: it has a material drawn here.
  function isGroupShown(group) {
    return shownMaterials(group).length > 0;
  }

  function saveHidden() {
    localStorage.setItem(HIDDEN_SERIES_STORAGE_KEY, JSON.stringify(Array.from(hiddenSeries)));
    localStorage.setItem(HIDDEN_MATERIALS_STORAGE_KEY, JSON.stringify(Array.from(hiddenMaterials)));
  }

  // Switches a table on, bringing back its materials at this size if every
  // one of them had been switched off (see LEGEND above).
  function showGroup(group) {
    hiddenSeries.delete(group.series.key);
    const anyOn = group.materials.some(
      (name) => !hiddenMaterials.has(materialKey(group.series, name))
    );
    if (!anyOn) {
      group.materials.forEach((name) => hiddenMaterials.delete(materialKey(group.series, name)));
    }
  }

  function setGroupShown(group, shown) {
    if (shown) showGroup(group);
    else hiddenSeries.add(group.series.key);
    saveHidden();
    renderPlot();
  }

  // Every table's head at once, grayed-out tables included.
  function setAllSeriesShown(shown) {
    if (shown) {
      hiddenSeries.clear();
      legendSize().groups.forEach(showGroup);
    } else {
      pemStandoffSeries.forEach((series) => hiddenSeries.add(series.key));
    }
    saveHidden();
    renderPlot();
  }

  const LEGEND_ACTIONS = [
    { key: "check-all", label: "Check all series", onClick: () => setAllSeriesShown(true) },
    { key: "uncheck-all", label: "Uncheck all series", onClick: () => setAllSeriesShown(false) },
  ];

  function setMaterialShown(group, name, shown) {
    const series = group.series;
    if (shown) {
      hiddenMaterials.delete(materialKey(series, name));
      if (hiddenSeries.has(series.key)) {
        hiddenSeries.delete(series.key);
        group.materials.forEach((other) => {
          if (other !== name) hiddenMaterials.add(materialKey(series, other));
        });
      }
    } else {
      hiddenMaterials.add(materialKey(series, name));
    }
    saveHidden();
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

  // Horizontal offset of bar i of n within a category band (band width 1),
  // centered on the category.
  function dodge(i, n) {
    return (i - (n - 1) / 2) * BAR_STEP;
  }

  // "a", "a and b", "a, b and c".
  function joinList(items) {
    if (items.length <= 1) return items.join("");
    return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
  }

  // A printed value, or the source's dash where it has none.
  function shown(value) {
    return value === null || value === undefined ? "–" : value;
  }

  // Every table, in table order, whether or not it lists the size — see
  // LEGEND above. A line lists only the materials its table offers at the
  // size, each in its own column, with a null (an empty cell in plot.js) in
  // the columns it doesn't offer; a table without the size has a locked head
  // and no materials.
  // `plain` leaves out the color swatches (the table view's legend).
  function buildLegendItems(size, plain) {
    return pemStandoffSeries.map((series) => {
      const group = size.groups.find((g) => g.series === series);
      if (!group) {
        return {
          key: `series:${series.key}`,
          label: series.label,
          active: !hiddenSeries.has(series.key),
          disabled: true,
          onToggle: () => {},
          items: [],
        };
      }
      return {
        key: `series:${series.key}`,
        label: series.label,
        active: isGroupShown(group),
        onToggle: (checked) => setGroupShown(group, checked),
        items: allMaterials.map((name) =>
          group.materials.includes(name)
            ? {
                key: materialKey(series, name),
                label: legendLabel(name),
                color: plain ? undefined : colorFor(name),
                active: isMaterialShown(series, name),
                onToggle: (checked) => setMaterialShown(group, name, checked),
              }
            : null
        ),
      };
    });
  }

  // The x axis bands at a size: each table (table order), then each of its
  // thread codes (sheet order, so M3 before 3.5M3) that has a shown material.
  // The table view's rows follow the same order.
  function bandsFor(size) {
    const bands = [];
    size.groups.forEach((group) => {
      group.threads.forEach((thread) => {
        const drawn = group.rows.some(
          (row) => row.thread === thread && isMaterialShown(group.series, row.material)
        );
        if (drawn) bands.push({ thread: thread, group: group });
      });
    });
    return bands;
  }

  // Redraws whichever view is on screen, plus the title and notes they share.
  function renderPlot() {
    if (isAllSizes()) {
      renderAllSizes();
      return;
    }
    const size = currentSize();
    const shownGroups = size.groups.filter(isGroupShown);
    const bands = bandsFor(size);

    plotTitleEl.textContent =
      shownGroups.length === 1
        ? `${shownGroups[0].series.title}, ${size.size}`
        : `PEM® Standoffs, ${size.size}`;

    if (selectedView === "table") renderTable(size, bands);
    else renderChart(size, shownGroups, bands);

    renderNotes(describedSeries(size, shownGroups));
  }

  // --- Every size at once (I Crave Detail off) ---

  // A table's rows for one material at one size: every thread code the size
  // covers (M3 and 3.5M3 under M3), in sheet order.
  function rowsAt(group, sizeName, material) {
    return group.rows.filter((row) => row.size === sizeName && row.material === material);
  }

  // The distinct printed torques among some rows, in sheet order.
  function distinctTorques(rows) {
    const torques = [];
    rows.forEach((row) => {
      if (!torques.includes(row.torque)) torques.push(row.torque);
    });
    return torques;
  }

  // The table with every size at once: a row per shown table and material,
  // with the max. torque split into one column per size.
  function renderAllSizes() {
    const shownGroups = everySize.groups.filter(isGroupShown);

    plotTitleEl.textContent =
      shownGroups.length === 1 ? shownGroups[0].series.title : "PEM® Standoffs";

    renderAllSizesTable(shownGroups);
    renderNotes(describedSeries(everySize, shownGroups));
  }

  function renderAllSizesTable(shownGroups) {
    tableWrapEl.innerHTML = "";

    if (!shownGroups.length) {
      const empty = document.createElement("p");
      empty.className = "plot-empty pem-table-empty";
      empty.textContent = EMPTY_MESSAGE;
      tableWrapEl.appendChild(empty);
    } else {
      const table = document.createElement("table");
      table.className = "est-table pem-table";

      const thead = document.createElement("thead");
      const top = document.createElement("tr");
      top.appendChild(headerCell(["Series"], { rowspan: "2", scope: "col" }));
      top.appendChild(headerCell(["Material"], { rowspan: "2", scope: "col" }));
      top.appendChild(
        headerCell(["Type"], { rowspan: "2", scope: "col", class: "est-col-divide" })
      );
      top.appendChild(
        headerCell(["Max. Torque (Nm)"], { colspan: String(sizes.length), scope: "colgroup" })
      );
      thead.appendChild(top);
      const bottom = document.createElement("tr");
      sizes.forEach((size) =>
        bottom.appendChild(headerCell([size.size], { scope: "col", class: "pem-col-strength" }))
      );
      thead.appendChild(bottom);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      shownGroups.forEach((group) => {
        const series = group.series;
        const materials = shownMaterials(group);
        materials.forEach((name, m) => {
          const tr = document.createElement("tr");
          if (m === 0) {
            tr.className = "est-group-start";
            tr.appendChild(
              cell("th", series.label, {
                scope: "rowgroup",
                rowspan: String(materials.length),
                class: "est-row-size pem-row-series",
              })
            );
          }
          tr.appendChild(cell("th", name, { scope: "row", class: "est-row-label pem-row-part" }));
          tr.appendChild(
            cell("td", typesFor(series, name).join(" / "), {
              class: "pem-row-text est-col-divide",
            })
          );
          sizes.forEach((size) => {
            const torques = distinctTorques(rowsAt(group, size.size, name));
            const td = cell("td", torques.length ? torques.join(" / ") : shown(null), {
              class: "pem-col-strength",
            });
            if (!torques.length) td.classList.add("pem-cell-none");
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
      });
      table.appendChild(tbody);
      tableWrapEl.appendChild(table);
    }

    renderPlotLegend(tableLegendEl, {
      legendItems: buildLegendItems(everySize, true),
      legendSlots: allMaterials.length,
      legendActions: LEGEND_ACTIONS,
    });
  }

  function renderChart(size, shownGroups, bands) {
    // One series per table and material shown, a bar in each of the table's
    // bands that has a row for the material.
    const series = [];
    size.groups.forEach((group) => {
      const materials = shownMaterials(group);
      materials.forEach((name, i) => {
        const points = [];
        bands.forEach((band, b) => {
          if (band.group !== group) return;
          const row = group.rows.find((r) => r.thread === band.thread && r.material === name);
          const y = row ? parseFloat(row.torque) : NaN;
          if (!Number.isFinite(y)) return;
          points.push({ x: b + dodge(i, materials.length), y: y, row: row, series: group.series });
        });
        if (!points.length) return;
        series.push({
          key: materialKey(group.series, name),
          label: `${typesFor(group.series, name).join(" / ")} (${name})`,
          color: colorFor(name),
          bar: true,
          barWidth: BAR_WIDTH,
          points: points,
        });
      });
    });

    renderLinePlot(plotEl, {
      title: plotTitleEl.textContent,
      series: series,
      legendItems: buildLegendItems(size),
      legendSlots: allMaterials.length,
      legendActions: LEGEND_ACTIONS,
      xCategories: bands.map((band) => [band.thread, band.group.series.label]),
      xLabel: "Thread Code / Standoff Type",
      yLabel: "Max. Mating Screw Tightening Torque (Nm)",
      ariaLabel:
        `Maximum mating screw tightening torque for PEM ` +
        (shownGroups.length ? `${joinList(shownGroups.map((g) => g.series.label))} ` : "") +
        `standoffs, ${size.size}, by thread code and standoff material`,
      formatTooltip: (point) => {
        const row = point.row;
        const lines = [
          `${typesFor(point.series, row.material).join(" / ")}, ${row.thread}`,
          `${row.material}: ${row.torque} Nm`,
        ];
        point.series.testSheets.forEach((sheet, k) => {
          const p = row.performance[k];
          if (!p) {
            lines.push(`${sheet} sheet: –`);
            return;
          }
          lines.push(`${sheet} sheet:`);
          lines.push(
            `Torque-out ${shown(p.torqueOut)} Nm, pushout ${shown(p.pushout)} N, ` +
              `pull-thru ${shown(p.pullThru)} N`
          );
        });
        return lines;
      },
      emptyMessage: EMPTY_MESSAGE,
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

  function cell(tag, text, attrs) {
    const c = document.createElement(tag);
    c.textContent = text;
    Object.keys(attrs || {}).forEach((key) => c.setAttribute(key, attrs[key]));
    return c;
  }

  // The chart's rows as a table, in the chart's band order: per table, per
  // thread code, per shown material, one line per test sheet. The table,
  // thread, and material cells (types, max. torque) are merged down the lines
  // they cover, with a heavier rule starting each table.
  function renderTable(size, bands) {
    tableWrapEl.innerHTML = "";

    // Each band's shown rows, each with its test sheets' lines.
    const entries = bands.map((band) => ({
      band: band,
      rows: allMaterials
        .filter((name) => isMaterialShown(band.group.series, name))
        .map((name) => band.group.rows.find((r) => r.thread === band.thread && r.material === name))
        .filter(Boolean),
    }));

    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "plot-empty pem-table-empty";
      empty.textContent = EMPTY_MESSAGE;
      tableWrapEl.appendChild(empty);
    } else {
      const table = document.createElement("table");
      table.className = "est-table pem-table";

      const thead = document.createElement("thead");
      const head = document.createElement("tr");
      head.appendChild(headerCell(["Series"], { scope: "col" }));
      head.appendChild(headerCell(["Thread"], { scope: "col" }));
      head.appendChild(headerCell(["Material"], { scope: "col" }));
      head.appendChild(headerCell(["Type"], { scope: "col" }));
      head.appendChild(
        headerCell(["Max.", "Torque", "(Nm)"], { scope: "col", class: "pem-col-strength est-col-divide" })
      );
      head.appendChild(headerCell(["Test Sheet"], { scope: "col" }));
      head.appendChild(headerCell(["Install.", "(kN)"], { scope: "col", class: "pem-col-strength" }));
      head.appendChild(headerCell(["Pushout", "(N)"], { scope: "col", class: "pem-col-strength" }));
      head.appendChild(headerCell(["Torque-", "out (Nm)"], { scope: "col", class: "pem-col-strength" }));
      head.appendChild(headerCell(["Pull-thru", "(N)"], { scope: "col", class: "pem-col-strength" }));
      thead.appendChild(head);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      const lineCount = (series) => series.testSheets.length;
      entries.forEach((entry, e) => {
        const series = entry.band.group.series;
        const firstOfTable = e === 0 || entries[e - 1].band.group !== entry.band.group;
        const threadSpan = entry.rows.length * lineCount(series);

        entry.rows.forEach((row, r) => {
          series.testSheets.forEach((sheet, k) => {
            const tr = document.createElement("tr");
            if (firstOfTable && r === 0 && k === 0) {
              tr.className = "est-group-start";
              const tableSpan = entries
                .filter((other) => other.band.group === entry.band.group)
                .reduce((sum, other) => sum + other.rows.length * lineCount(series), 0);
              tr.appendChild(
                cell("th", series.label, {
                  scope: "rowgroup",
                  rowspan: String(tableSpan),
                  class: "est-row-size pem-row-series",
                })
              );
            }
            if (r === 0 && k === 0) {
              tr.appendChild(
                cell("th", row.thread, {
                  scope: "rowgroup",
                  rowspan: String(threadSpan),
                  class: "est-row-label pem-row-part",
                })
              );
            }
            if (k === 0) {
              const span = String(lineCount(series));
              tr.appendChild(
                cell("th", row.material, {
                  scope: "row",
                  rowspan: span,
                  class: "est-row-label pem-row-part",
                })
              );
              tr.appendChild(
                cell("td", typesFor(series, row.material).join(" / "), {
                  rowspan: span,
                  class: "pem-row-text",
                })
              );
              tr.appendChild(
                cell("td", row.torque, { rowspan: span, class: "pem-col-strength est-col-divide" })
              );
            }
            const p = row.performance[k];
            tr.appendChild(cell("td", sheet, { class: "pem-row-text" }));
            [
              p && p.installation,
              p && p.pushout,
              p && p.torqueOut,
              p && p.pullThru,
            ].forEach((value) => {
              const td = cell("td", shown(value), { class: "pem-col-strength" });
              if (value === null || value === undefined) td.classList.add("pem-cell-none");
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          });
        });
      });
      table.appendChild(tbody);
      tableWrapEl.appendChild(table);
    }

    renderPlotLegend(tableLegendEl, {
      legendItems: buildLegendItems(size, true),
      legendSlots: allMaterials.length,
      legendActions: LEGEND_ACTIONS,
    });
  }

  // The tables the notes describe. Normally the ones drawn at this size. With
  // nothing drawn, the tables switched on, even ones that don't list this
  // size; with every table off too, every table at the size, since that's
  // what the legend is offering.
  function describedSeries(size, shownGroups) {
    if (shownGroups.length) return shownGroups.map((g) => g.series);
    const switchedOn = pemStandoffSeries.filter((series) => !hiddenSeries.has(series.key));
    if (switchedOn.length) return switchedOn;
    return size.groups.map((g) => g.series);
  }

  // The test sheets and footnotes belong to the tables, so they're drawn for
  // the tables describedSeries picks rather than written into the page. With
  // more than one table, the test sheets say which table they're for, and a
  // footnote only some of the tables carry says which ones.
  function renderNotes(seriesList) {
    notesEl.innerHTML = "";
    const many = seriesList.length > 1;
    const sheets = seriesList.map(
      (series) => joinList(series.testSheets) + (many ? ` (${series.label})` : "")
    );
    const items = [
      "Torques are the maximum recommended tightening torque for the mating screw.",
    ];
    if (!isAllSizes()) {
      items.push(
        `Each bar's tooltip (and the table) also gives the standoff's torque-out, ` +
          `pushout and pull-thru in its test sheets: ${sheets.join("; ")}.`
      );
    } else {
      // The thread codes sharing another size's column (3.5M3 under M3).
      const merged = [];
      seriesList.forEach((series) => {
        series.rows.forEach((row) => {
          const text = `${row.thread} under ${row.size}`;
          if (row.thread !== row.size && !merged.includes(text)) merged.push(text);
        });
      });
      if (merged.length) {
        items.push(`A size includes its larger-body thread codes (${joinList(merged)}).`);
      }
      items.push(
        `Tick "I Crave Detail!" for one size at a time with the standoff's ` +
          `torque-out, pushout and pull-thru in its test sheets: ${sheets.join("; ")}.`
      );
    }
    const owners = new Map();
    seriesList.forEach((series) => {
      series.footnotes.forEach((note) => {
        if (!owners.has(note)) owners.set(note, []);
        owners.get(note).push(series.label);
      });
    });
    owners.forEach((labels, note) => {
      items.push(many && labels.length < seriesList.length ? `${labels.join(", ")}: ${note}` : note);
    });
    items.forEach((note) => {
      const li = document.createElement("li");
      li.textContent = note;
      notesEl.appendChild(li);
    });
  }

  // --- Controls ---

  function buildViewToggle() {
    VIEWS.forEach((view) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "metric-option";
      button.dataset.view = view.key;
      button.textContent = view.label;
      button.addEventListener("click", () => setView(view.key));
      viewToggleEl.appendChild(button);
    });
  }

  // Shows the selected view and hides the other. The view is shown before
  // it's drawn, so the chart measures its real width rather than a hidden 0.
  function syncView() {
    viewToggleEl.querySelectorAll(".metric-option").forEach((button) => {
      const isActive = button.dataset.view === selectedView;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    plotEl.hidden = selectedView !== "chart";
    tableViewEl.hidden = selectedView !== "table";
  }

  // The checkbox is only offered in the table view (hidden, not removed, so
  // the slider doesn't change width between views). With every size shown
  // the slider's size doesn't apply: hide its knob and readout (see
  // .is-all-sizes in style.css) and disable it.
  function syncDetail() {
    detailToggleEl.checked = showDetail;
    detailToggleEl.closest(".detail-toggle").classList.toggle("is-hidden", selectedView !== "table");
    sliderBlockEl.classList.toggle("is-all-sizes", isAllSizes());
    sliderEl.disabled = isAllSizes() || sizes.length === 1;
  }

  function setDetail(on) {
    showDetail = on;
    localStorage.setItem(DETAIL_STORAGE_KEY, String(on));
    syncDetail();
    renderPlot();
  }

  function setView(key) {
    selectedView = key;
    localStorage.setItem(VIEW_STORAGE_KEY, key);
    syncView();
    syncDetail();
    renderPlot();
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
  buildViewToggle();
  syncView();
  syncDetail();

  detailToggleEl.addEventListener("change", () => setDetail(detailToggleEl.checked));

  sliderEl.addEventListener("input", () => {
    pickIndex(Number(sliderEl.value));
  });

  sliderEl.addEventListener(
    "wheel",
    (evt) => {
      if (sliderEl.disabled) return;
      evt.preventDefault();
      pickIndex(selectedIndex + (evt.deltaY > 0 ? -1 : 1));
    },
    { passive: false }
  );

  showIndex(indexForSize(localStorage.getItem(SIZE_STORAGE_KEY) || DEFAULT_SIZE));
})();
