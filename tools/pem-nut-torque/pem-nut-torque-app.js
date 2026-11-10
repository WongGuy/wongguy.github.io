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
// and one torque column per material (a dash where a table has no such
// column). The table keeps the legend under it, drawn with renderPlotLegend
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
// tables are switched off, and which part numbers are. Off rather than on, so a part or
// table not seen before starts switched on — except on a first visit, where
// only one table is on (the series the page's old one-table picker had
// selected, if any) rather than every part at the size at once.

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

  const SIZE_STORAGE_KEY = "pemNutTorqueSize";
  const VIEW_STORAGE_KEY = "pemNutTorqueView";
  const HIDDEN_STORAGE_KEY = "pemNutTorqueHidden";
  const HIDDEN_SERIES_STORAGE_KEY = "pemNutTorqueHiddenSeries";
  // Written by the one-table series picker this page used to have. Only read
  // now, to pick which table a returning visitor starts with.
  const OLD_SERIES_STORAGE_KEY = "pemNutTorqueSeries";

  const DEFAULT_SIZE = "M6";

  const VIEWS = [
    { key: "chart", label: "Chart" },
    { key: "table", label: "Table" },
  ];

  const EMPTY_MESSAGE = "No valid PEM series selected at this size";

  // The plot colors live in style.css (light and dark values) so they follow
  // the theme. A part's color is its place within its own table's line, and
  // no table lists more than four parts at one size, so colors never repeat
  // within a line. They do repeat across tables, so tables are told apart by
  // marker instead (below).
  const SERIES_COLOR_COUNT = 5;
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
  let selectedIndex = 0;
  const storedView = localStorage.getItem(VIEW_STORAGE_KEY);
  let selectedView = VIEWS.some((v) => v.key === storedView) ? storedView : VIEWS[0].key;

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

  // "a", "a and b", "a, b and c".
  function joinList(items) {
    if (items.length <= 1) return items.join("");
    return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
  }

  // Every table, in table order, whether or not it lists the size — see
  // LEGEND above. A table without the size has a locked head that reads as
  // ticked when the table is switched on, and no parts.
  // `plain` leaves out the markers and colors (the table view's legend).
  function buildLegendItems(size, plain) {
    const look = (marker, color) =>
      plain ? {} : { shape: marker.shape, hollow: marker.hollow, color: color };
    return pemNutSeries.map((series) => {
      const group = size.groups.find((g) => g.series === series);
      if (!group) {
        return Object.assign(look(markerFor(series)), {
          key: `series:${series.key}`,
          label: series.label,
          active: !hiddenSeries.has(series.key),
          disabled: true,
          onToggle: () => {},
          items: [],
        });
      }
      return Object.assign(look(markerFor(series)), {
        key: `series:${series.key}`,
        label: series.label,
        active: isGroupShown(group),
        onToggle: (checked) => setGroupShown(group, checked),
        items: group.parts.map((part, i) =>
          Object.assign(plain ? {} : { color: colorFor(i) }, {
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
    const materials = allMaterials.filter((m) =>
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
      shownGroups.length === 1
        ? `${shownGroups[0].series.title}, ${size.size}`
        : `PEM® Nuts, ${size.size}`;

    if (selectedView === "table") {
      renderTable(size, materials, shownParts);
    } else {
      renderChart(size, shownGroups, materials, shownParts);
    }

    renderNotes(described);
  }

  function renderChart(size, shownGroups, materials, shownParts) {
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
        .filter((p) => Number.isFinite(p.y)),
    }));

    renderLinePlot(plotEl, {
      series: series,
      legendItems: buildLegendItems(size),
      legendSlots: legendSlots,
      legendActions: LEGEND_ACTIONS,
      xCategories: materials.map(categoryLines),
      xLabel: "Screw Material",
      yLabel: "Mating Screw Tightening Torque (Nm)",
      ariaLabel:
        `Mating screw tightening torque by screw material for PEM ` +
        (shownGroups.length ? `${joinList(shownGroups.map((g) => g.series.label))} ` : "") +
        `nuts, ${size.size}, ${series.length} part numbers`,
      formatTooltip: (point, s) => [
        s.label,
        `${point.material}: ${point.torque} Nm`,
        `Min. axial strength (PC 12.9 screw): ${point.part.minAxialStrength} kN`,
        `Screw strength to develop min. axial: ${point.part.screwStrength} MPa`,
      ],
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

  // The plot's values as a table: one row per shown part, grouped by PEM
  // table (a merged first cell with the table's label, and a heavier rule
  // starting each group), then the part number, its strengths, and its torque
  // under each material column.
  function renderTable(size, materials, shownParts) {
    tableWrapEl.innerHTML = "";

    if (!shownParts.length) {
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
      legendItems: buildLegendItems(size, true),
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
  // it's drawn, so the plot measures its real width rather than a hidden 0.
  function syncView() {
    viewToggleEl.querySelectorAll(".metric-option").forEach((button) => {
      const isActive = button.dataset.view === selectedView;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    plotEl.hidden = selectedView !== "chart";
    tableViewEl.hidden = selectedView !== "table";
  }

  function setView(key) {
    selectedView = key;
    localStorage.setItem(VIEW_STORAGE_KEY, key);
    syncView();
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
