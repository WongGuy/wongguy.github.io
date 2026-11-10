// DOM logic for pem-standoff-torque.html: the size slider and the mating screw
// torque plot, whose legend is where PEM standoff tables and standoff
// materials are switched on and off. Reads pem-standoff-torque-data.js; see
// that file for the schema and for how to regenerate it. Built the same way as
// the PEM nut torque page, with materials in place of part numbers.
//
// WHAT'S PLOTTED
//
// One marker per table, standoff material and thread code at the selected
// size, at that row's maximum recommended tightening torque for the mating
// screw. The x axis is categorical, one band per thread code and table, thread
// code first ("M3 / SO / BSO", "M3 / SO4 / BSO4", ..., "3.5M3 / SO / BSO", ...)
// so the tables sit side by side for each thread. A size's thread codes are
// the ones ending in it: 3.5M3 (a 3.5 mm body with an M3 thread) belongs to
// M3, so it shares the M3 slider position and gets bands of its own. Bands are
// trimmed to the tables with a material shown.
//
// A marker's color is its material — the same in every table, and the same as
// that material's column in the legend. Within a band the table's shown
// materials are dodged side by side, since they can share a torque.
//
// LEGEND
//
// One line per PEM table, headed by a checkbox with the table's label ("SO /
// BSO", "SO4 / BSO4", "DSO"), followed by one checkbox per standoff material —
// Steel, Stainless (Steel), Aluminum — in the same column on every line. A
// material the table doesn't list is grayed out and can't be ticked: SO4 /
// BSO4 are made only in stainless steel, so that line offers Stainless Steel
// alone. Which materials a table lists comes from the data (and so from the
// workbook), not from this file.
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
// Under the lines, "Check all tables" and "Uncheck all tables" set every
// table's head at once.
//
// The legend keeps one size for every slider position: every table always has
// its line and every line has a cell per material (legendSlots in plot.js). A
// table that doesn't list the size is grayed out, head and materials locked,
// showing what's switched on, so it can't be changed at a size where it would
// do nothing.
//
// State remembered in localStorage between visits: the size, which tables are
// switched off, and which materials are (per table, "SO:Aluminum"). Off rather
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

  const SIZE_STORAGE_KEY = "pemStandoffTorqueSize";
  const HIDDEN_SERIES_STORAGE_KEY = "pemStandoffTorqueHiddenSeries";
  const HIDDEN_MATERIALS_STORAGE_KEY = "pemStandoffTorqueHiddenMaterials";

  const DEFAULT_SIZE = "M3";

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

  function isListed(series, name) {
    return series.materials.some((m) => m.name === name);
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
      currentSize().groups.forEach(showGroup);
    } else {
      pemStandoffSeries.forEach((series) => hiddenSeries.add(series.key));
    }
    saveHidden();
    renderPlot();
  }

  const LEGEND_ACTIONS = [
    { key: "check-all", label: "Check all tables", onClick: () => setAllSeriesShown(true) },
    { key: "uncheck-all", label: "Uncheck all tables", onClick: () => setAllSeriesShown(false) },
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

  // Horizontal offset of marker i of n within a category band (band width 1),
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

  // A printed value, or the source's dash where it has none.
  function shown(value) {
    return value === null || value === undefined ? "–" : value;
  }

  // Every table, in table order, whether or not it lists the size — see
  // LEGEND above. Every line has a cell per material; the ones the table
  // can't offer here are locked, unticked if the table never lists them.
  function buildLegendItems(size) {
    return pemStandoffSeries.map((series) => {
      const group = size.groups.find((g) => g.series === series);
      const items = allMaterials.map((name) => {
        const offered = !!group && group.materials.includes(name);
        return {
          key: materialKey(series, name),
          label: legendLabel(name),
          color: colorFor(name),
          active: isListed(series, name) && isMaterialShown(series, name),
          disabled: !offered,
          onToggle: offered ? (checked) => setMaterialShown(group, name, checked) : () => {},
        };
      });
      if (!group) {
        return {
          key: `series:${series.key}`,
          label: series.label,
          active: !hiddenSeries.has(series.key),
          disabled: true,
          onToggle: () => {},
          items: items,
        };
      }
      return {
        key: `series:${series.key}`,
        label: series.label,
        active: isGroupShown(group),
        onToggle: (checked) => setGroupShown(group, checked),
        items: items,
      };
    });
  }

  // The x axis bands at a size: each thread code (in the order the tables
  // list them, so M3 before 3.5M3), then each table with a shown material
  // at that thread.
  function bandsFor(size) {
    const threads = [];
    size.groups.forEach((group) => {
      group.threads.forEach((thread) => {
        if (!threads.includes(thread)) threads.push(thread);
      });
    });
    const bands = [];
    threads.forEach((thread) => {
      size.groups.forEach((group) => {
        const drawn = group.rows.some(
          (row) => row.thread === thread && isMaterialShown(group.series, row.material)
        );
        if (drawn) bands.push({ thread: thread, group: group });
      });
    });
    return bands;
  }

  function renderPlot() {
    const size = currentSize();
    const shownGroups = size.groups.filter(isGroupShown);
    const bands = bandsFor(size);

    // One series per table and material shown, a marker in each of the
    // table's bands that has a row for the material.
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
          line: false,
          points: points,
        });
      });
    });

    plotTitleEl.textContent =
      shownGroups.length === 1
        ? `${shownGroups[0].series.title}, ${size.size}`
        : `PEM® Standoffs, ${size.size}`;

    renderLinePlot(plotEl, {
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
      emptyMessage: "No standoff material selected at this size",
    });

    renderNotes(describedSeries(size, shownGroups));
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
      `Each marker's tooltip also gives the standoff's torque-out, pushout and ` +
        `pull-thru in its test sheets: ${sheets.join("; ")}.`,
    ];
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
