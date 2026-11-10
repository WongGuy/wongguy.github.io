// Shared, page-agnostic line-plot renderer, in the same spirit as
// flowchart.js: it knows how to draw axes, lines, markers, a legend, and a
// hover tooltip, and knows nothing about what's being plotted. Pages hand it
// plain data and get real DOM/SVG back, so the plot reflows with the layout
// instead of being a fixed-size image.
//
//   renderLinePlot(container, {
//     series: [{
//       key:    unique id for the series,
//       label:  legend text,
//       color:  any CSS color (pass a var(--...) so it follows the theme),
//       points: [{ x, y, ...anything else }, ...]   // sorted by x
//       shape:  optional marker shape, see MARKER_SHAPES (default "circle")
//       hollow: optional; true draws the markers as outlines in the color
//     }, ...],
//     xLabel, yLabel,       // axis titles, drawn as-is
//     xMin, xMax, yMin, yMax, // optional; override the computed domain on
//                             // that axis (default: 0 to just past the data)
//                             // so a caller can truncate an axis that never
//                             // approaches zero and use the freed space
//     formatX, formatY,     // (value) => string, for tick labels
//     formatTooltip,        // (point, series) => [string, ...] lines
//     emptyMessage,         // shown when no series has points, in a box the
//                           // height of the plot it replaces
//     legendItems: [{       // optional; defaults to one item per drawn series
//       key, label, color,
//       active,             // false renders the item as switched off
//       note,               // small trailing text, e.g. why there's no line
//       onToggle,           // (nextActive) => void; makes the item a checkbox
//       disabled,           // true grays the item out and locks its checkbox
//       shape, hollow,      // optional; draws that marker as the swatch (in
//                           // `color`, or the text color without one)
//       items,              // optional; makes this item a group, see below
//     }, ...],
//     legendSlots,          // optional; fixed item columns per group, see below
//     legendActions: [{     // optional; buttons in a row under the legend
//       key, label,
//       onClick,            // () => void; e.g. switch every series on or off
//     }, ...],
//   })
//
// Passing `legendItems` is what turns the legend into the plot's control
// surface: the list is drawn as given rather than derived from what's on the
// plot, so a series the caller has switched off still has a row to switch back
// on, and the legend stays up even when nothing is plotted at all.
//
// A legend item with `items` is a group: its own label (and checkbox, given an
// onToggle) heads a line, followed by its child items, which are ordinary
// legend items. Once any item is a group the legend is laid out as a table —
// heads in one column, each group's items wrapping in the next — so the heads
// line up. What a group's toggle does to its children is up to the caller;
// the legend only reports the click.
//
// `legendSlots: n` fixes a grouped legend's layout so it doesn't move when the
// items do: the legend spans the plot's width (up to a cap), every group's
// items sit in n equal-width cells (padded with empty ones; 2 per row on a
// phone), and labels too long for a cell are cut with an ellipsis rather than
// widening it. Given the same groups and n, the legend is the same size no
// matter which items are passed — so a caller that wants a stable legend
// passes every group every time, with `disabled` on the ones that have nothing
// to offer right now, rather than dropping them.
//
// Calling it again on the same container redraws in place, so a page can call
// it on every control change. The container is measured on each draw and
// re-drawn on resize, so tick density and label room track the real width
// rather than a viewBox scale (which would distort the text).
//
// A series with a single point is drawn as a lone marker — that's a real case
// in the torque tables, not a degenerate one, so markers are drawn by default.
// An individual point can opt out of its marker with `marker: false` (it still
// anchors the line), and a series can set `dash` to a stroke-dasharray string
// to draw its line dashed, or `line: false` to draw its markers unconnected
// (for points that don't lie on a continuous x, like categories).
//
// Markers are circles unless a series names a `shape` from MARKER_SHAPES
// below, and filled unless it sets `hollow` — between them, ten looks, for
// telling series apart when color alone can't (e.g. more series than colors).
// A legend item with the same `shape` / `hollow` shows that marker, so the
// legend can say which look is which.
//
// Two helpers are exported alongside renderLinePlot for pages that show the
// same data without the plot: renderPlotLegend(container, options) draws just
// the legend (same legendItems / legendSlots options), and
// createPlotMarker({ shape, hollow, color }) returns one marker as a small
// inline SVG.
//
// `xCategories: [label, ...]` makes the x axis categorical: category i sits at
// x = i, the domain defaults to -0.5 .. n - 0.5 so each category gets an equal
// band, the vertical gridlines fall on the band edges instead of on ticks, and
// each band is labeled with its category instead of a number. A label can be a
// string or an array of strings, one per line. A point's x needn't be a whole
// number — a caller can nudge series apart within a band (dodging) so markers
// with equal values don't hide each other. When the widest label line won't
// fit its band, the labels are drawn on one line each, rotated 45°, and the
// plot grows taller to make room for them. A drawn point with `guide: true` also gets lines
// dropped to both axes and its x/y values printed on them, all in the series
// color.
//
// `yGuides: [{ y, color, text, xMax }, ...]` draws a horizontal reference line
// at each `y`, with a readout on the y axis, in `color` — the same look as a
// guide point's y drop line but not tied to any plotted point (used for a
// derived level like a lower bound). The line runs from the y axis to
// `xScale(xMax)` if given, otherwise across the whole plot; the readout shows
// `text` if given, otherwise the formatted `y`. That readout and the guide
// points' y readouts share the y-axis gutter and are spread vertically when
// two would otherwise overlap, while their lines stay at the true value.

(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Per-container state, so redraws reuse one ResizeObserver instead of
  // stacking a new one per call.
  const states = new WeakMap();

  function el(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  }

  // Marker outlines as SVG path data, centered on (cx, cy), for a marker of
  // nominal radius r. Each is scaled so the shapes read as about the same
  // size as the circle rather than having the same bounding box.
  const MARKER_SHAPES = {
    circle: (cx, cy, r) =>
      `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`,
    square: (cx, cy, r) => {
      const h = r * 0.9;
      return `M${cx - h} ${cy - h}H${cx + h}V${cy + h}H${cx - h}Z`;
    },
    diamond: (cx, cy, r) => {
      const h = r * 1.25;
      return `M${cx} ${cy - h}L${cx + h} ${cy}L${cx} ${cy + h}L${cx - h} ${cy}Z`;
    },
    triangle: (cx, cy, r) => {
      const h = r * 1.3;
      const w = h * 0.866;
      return `M${cx} ${cy - h}L${cx + w} ${cy + h / 2}L${cx - w} ${cy + h / 2}Z`;
    },
    "triangle-down": (cx, cy, r) => {
      const h = r * 1.3;
      const w = h * 0.866;
      return `M${cx} ${cy + h}L${cx + w} ${cy - h / 2}L${cx - w} ${cy - h / 2}Z`;
    },
  };

  function markerPath(shape, cx, cy, r) {
    return (MARKER_SHAPES[shape] || MARKER_SHAPES.circle)(cx, cy, r);
  }

  // Rounds a raw step up to the next 1/2/2.5/5 x 10^n, so tick labels land on
  // values a person would have picked. 2.5 is in the list because without it
  // a range like 0-900 over 4 ticks jumps straight to a step of 500 and the
  // axis ends up with two labels on it.
  const NICE_STEPS = [1, 2, 2.5, 5, 10];

  function niceStep(rawStep) {
    if (!(rawStep > 0)) return 1;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    const step = NICE_STEPS.find((s) => normalized <= s) || 10;
    return step * magnitude;
  }

  function ticksFor(min, max, count) {
    const step = niceStep((max - min) / Math.max(1, count));
    const first = Math.ceil(min / step - 1e-9) * step;
    const ticks = [];
    for (let v = first; v <= max + step * 1e-9; v += step) {
      // Re-round each tick: accumulating `step` drifts into values like
      // 0.30000000000000004, which then format badly. `+ 0` folds a -0 (which
      // Math.ceil/Math.round can produce at the origin) back to 0, so a
      // caller's formatter isn't handed -0 and doesn't print "-0".
      ticks.push(Math.round(v / step) * step + 0);
    }
    return ticks;
  }

  // One unlabeled tick at the midpoint of each pair of adjacent major ticks —
  // enough to help the eye interpolate without crowding the axis.
  function minorTicksBetween(majorTicks) {
    const minors = [];
    for (let i = 0; i < majorTicks.length - 1; i++) {
      minors.push((majorTicks[i] + majorTicks[i + 1]) / 2);
    }
    return minors;
  }

  function defaultFormat(value) {
    if (value === 0) return "0";
    const abs = Math.abs(value);
    const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : abs >= 1 ? 2 : 3;
    const text = value.toFixed(decimals);
    // Trim the padding zeros a fixed decimal count leaves ("0.250" -> "0.25"),
    // but only past the decimal point — trimming "100" would leave "1".
    return decimals ? text.replace(/\.?0+$/, "") : text;
  }

  // Measures how wide each { cls, text } renders under the plot's own CSS
  // (e.g. `.plot-tick-label text`) by drawing them into a hidden probe SVG
  // inside the container. Callers measure before the container is cleared —
  // forcing layout on an emptied container is what the clientWidth note in
  // draw() warns about. Comes back as 0s when the container isn't laid out
  // (e.g. display: none), which callers read as "fits".
  function measureText(container, items) {
    if (!items.length) return [];
    const probe = el("svg", { width: 1, height: 1, "aria-hidden": "true" });
    probe.style.position = "absolute";
    probe.style.left = "0";
    probe.style.top = "0";
    probe.style.visibility = "hidden";
    const nodes = items.map((item) => {
      const group = el("g", { class: item.cls });
      const text = el("text", {});
      text.textContent = item.text;
      group.appendChild(text);
      probe.appendChild(group);
      return text;
    });
    container.appendChild(probe);
    let widths;
    try {
      widths = nodes.map((node) => node.getComputedTextLength() || 0);
    } catch (err) {
      widths = items.map(() => 0);
    }
    container.removeChild(probe);
    return widths;
  }

  function extent(series, axis) {
    let min = Infinity;
    let max = -Infinity;
    series.forEach((s) => {
      s.points.forEach((p) => {
        const v = p[axis];
        if (v < min) min = v;
        if (v > max) max = v;
      });
    });
    return [min, max];
  }

  // Builds the legend, either as plain labels or — when the caller supplies
  // legendItems with an onToggle — as the checkbox row that decides which
  // series are drawn. Toggling redraws the whole container, so focus is
  // handed back to the equivalent checkbox afterwards; without that, a
  // keyboard user loses their place on every toggle.
  function buildLegend(container, opts, drawnSeries) {
    const legend = document.createElement("div");
    legend.className = "plot-legend";

    const items =
      opts.legendItems ||
      drawnSeries.map((s) => ({ key: s.key, label: s.label, color: s.color, active: true }));

    const grouped = items.some((item) => Array.isArray(item.items));
    if (!grouped) {
      items.forEach((item) => legend.appendChild(buildLegendItem(container, item)));
      appendLegendActions(container, legend, opts);
      return legend;
    }

    // Grouped: a two-column grid of head | items. An ungrouped item among
    // groups sits in the items column with an empty head beside it.
    legend.classList.add("plot-legend--grouped");
    const slots = opts.legendSlots > 0 ? Math.floor(opts.legendSlots) : 0;
    if (slots) {
      legend.classList.add("plot-legend--slotted");
      legend.style.setProperty("--legend-slots", String(slots));
    }
    items.forEach((item) => {
      const isGroup = Array.isArray(item.items);
      const head = isGroup
        ? buildLegendItem(container, item)
        : document.createElement("span");
      head.classList.add("plot-legend-group-head");
      legend.appendChild(head);

      const body = document.createElement("div");
      body.className = "plot-legend-group-items";
      if (isGroup) {
        body.setAttribute("role", "group");
        body.setAttribute("aria-label", item.label);
        item.items.forEach((child) => body.appendChild(buildLegendItem(container, child)));
      } else {
        body.appendChild(buildLegendItem(container, item));
      }
      while (body.children.length < slots) {
        const empty = document.createElement("span");
        empty.className = "plot-legend-slot";
        body.appendChild(empty);
      }
      legend.appendChild(body);
    });
    appendLegendActions(container, legend, opts);
    return legend;
  }

  // The legendActions buttons, on a row of their own under the items. Like a
  // legend checkbox, a button's click usually redraws the legend, so focus is
  // handed to the same button in the new one.
  function appendLegendActions(container, legend, opts) {
    const actions = (opts.legendActions || []).filter((a) => typeof a.onClick === "function");
    if (!actions.length) return;
    const row = document.createElement("div");
    row.className = "plot-legend-actions";
    actions.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "plot-legend-action";
      button.dataset.legendAction = action.key;
      button.textContent = action.label;
      button.addEventListener("click", () => {
        action.onClick();
        const next = container.querySelector(
          `.plot-legend button[data-legend-action="${action.key}"]`
        );
        if (next) next.focus();
      });
      row.appendChild(button);
    });
    legend.appendChild(row);
  }

  // One legend row: checkbox (when the item has an onToggle), swatch (when it
  // has a color — a group head usually doesn't), label, and optional note.
  function buildLegendItem(container, item) {
    const active = item.active !== false;
    const interactive = typeof item.onToggle === "function";
    const row = document.createElement(interactive ? "label" : "span");
    row.className = "plot-legend-item";
    if (interactive) row.classList.add("plot-legend-item--toggle");
    if (!active) row.classList.add("is-off");
    if (item.note) row.classList.add("is-noted");
    if (item.disabled) row.classList.add("is-disabled");

    if (interactive) {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = active;
      input.disabled = !!item.disabled;
      input.dataset.legendKey = item.key;
      input.addEventListener("change", () => {
        const wasFocused = document.activeElement === input;
        item.onToggle(input.checked);
        if (!wasFocused) return;
        const next = container.querySelector(
          `.plot-legend input[data-legend-key="${item.key}"]`
        );
        if (next) next.focus();
      });
      row.appendChild(input);
    }

    if (item.shape || item.hollow) {
      row.appendChild(createPlotMarker(item));
    } else if (item.color) {
      const swatch = document.createElement("span");
      swatch.className = "plot-legend-swatch";
      swatch.style.background = item.color;
      row.appendChild(swatch);
    }

    const label = document.createElement("span");
    label.className = "plot-legend-label";
    label.textContent = item.label;
    row.appendChild(label);

    if (item.note) {
      const note = document.createElement("span");
      note.className = "plot-legend-note";
      note.textContent = item.note;
      row.appendChild(note);
    }

    return row;
  }

  // A marker drawn on its own, as a small inline SVG — the legend's swatch for
  // an item that names a shape, and exported so a page can show the same
  // marker elsewhere (e.g. beside a row in a table of the plotted values).
  // Filled in `color`, or the text color without one (see style.css).
  function createPlotMarker(opts) {
    const swatch = el("svg", {
      class: "plot-legend-marker",
      viewBox: "-7 -7 14 14",
      "aria-hidden": "true",
    });
    const path = el("path", { d: markerPath(opts.shape, 0, 0, 4.2) });
    if (opts.hollow) {
      path.classList.add("is-hollow");
      if (opts.color) path.style.stroke = opts.color;
    } else if (opts.color) {
      path.style.fill = opts.color;
    }
    swatch.appendChild(path);
    return swatch;
  }

  function draw(container) {
    const state = states.get(container);
    if (!state) return;
    const opts = state.options;
    const series = (opts.series || []).filter((s) => s.points && s.points.length);

    // Measured before clearing the container: reading clientWidth after an
    // innerHTML wipe forces a synchronous layout while the plot is empty,
    // which can momentarily shrink the page shorter than the current scroll
    // position and snap the browser's scroll to the top.
    const width = Math.max(280, container.clientWidth || 640);

    // Each category as an array of label lines (see xCategories above).
    const categories = Array.isArray(opts.xCategories)
      ? opts.xCategories.map((c) => (Array.isArray(c) ? c.map(String) : [String(c)]))
      : null;

    // Text whose rendered size decides the layout — the y-axis title and the
    // category labels — measured now, for the same reason as clientWidth
    // above. Each probe() returns that string's index into `textWidths`.
    const probes = [];
    const probe = (cls, text) => probes.push({ cls: cls, text: text }) - 1;
    const yTitleProbe = opts.yLabel ? probe("plot-axis-title", opts.yLabel) : -1;
    const categoryProbes = categories
      ? categories.map((lines) => ({
          lines: lines.map((line) => probe("plot-tick-label", line)),
          joined: probe("plot-tick-label", lines.join(" ")),
        }))
      : [];
    const textWidths = series.length ? measureText(container, probes) : [];

    container.innerHTML = "";

    const baseHeight = Math.round(Math.min(460, Math.max(260, width * 0.58)));

    if (!series.length) {
      // The message takes the plot's place at the plot's height, so emptying
      // the plot doesn't pull the legend and everything under it up the page.
      // That's the height of the last plot drawn at this width (which may have
      // grown for rotated labels); failing that, the height a plot starts at.
      const empty = document.createElement("p");
      empty.className = "plot-empty";
      empty.textContent = opts.emptyMessage || "No data to plot.";
      const height =
        state.drawnWidth === width && state.drawnHeight > 0 ? state.drawnHeight : baseHeight;
      empty.style.height = `${height}px`;
      container.appendChild(empty);
      // The legend is drawn even with nothing to plot: when it carries the
      // toggles, it's the only way back to a non-empty plot.
      container.appendChild(buildLegend(container, opts, series));
      return;
    }

    let height = baseHeight;
    const compact = width < 520;

    const margin = {
      top: 14,
      right: compact ? 12 : 18,
      bottom: compact ? 46 : 52,
      // Wide enough that the tick / guide readouts (right-anchored just inside
      // this margin) clear the rotated y-axis title sitting at x = 12.
      left: compact ? 60 : 72,
    };
    const plotW = width - margin.left - margin.right;

    // Category labels sit stacked under their band if the widest line fits
    // it, otherwise on one line each, rotated 45°. Either way the extra room
    // is added to the plot's height rather than taken out of the plot area.
    const categoryLineHeight = compact ? 11 : 12;
    let rotateCategories = false;
    if (categories) {
      const band = plotW / Math.max(1, categories.length);
      const widestLine = Math.max(
        0,
        ...categoryProbes.flatMap((p) => p.lines.map((i) => textWidths[i] || 0))
      );
      if (widestLine <= band - 6) {
        const maxLines = Math.max(1, ...categories.map((lines) => lines.length));
        const extra = (maxLines - 1) * categoryLineHeight;
        margin.bottom += extra;
        height += extra;
      } else {
        rotateCategories = true;
        const widestJoined = Math.max(
          0,
          ...categoryProbes.map((p) => textWidths[p.joined] || 0)
        );
        // A label rotated 45° drops by its length (plus a line of glyph
        // height) times sin 45°, below a small gap under the axis; the axis
        // title keeps its usual row beneath that.
        const drop = Math.ceil((widestJoined + categoryLineHeight) * Math.SQRT1_2);
        const bottom = 10 + drop + (compact ? 24 : 28);
        if (bottom > margin.bottom) {
          height += bottom - margin.bottom;
          margin.bottom = bottom;
        }
      }
    }

    // A y-axis title longer than the plot is tall would run off both ends of
    // it, into whatever sits above and below; grow the plot to fit it instead.
    const yTitleRoom = yTitleProbe >= 0 ? Math.ceil(textWidths[yTitleProbe] || 0) + 8 : 0;
    if (height - margin.top - margin.bottom < yTitleRoom) {
      height = margin.top + margin.bottom + yTitleRoom;
    }
    const plotH = height - margin.top - margin.bottom;

    const [xMinData, xMaxData] = extent(series, "x");
    const [, yMaxData] = extent(series, "y");

    // X starts at 0 and Y starts at 0 by default, so values read against a
    // real origin instead of exaggerating the spread between series — but a
    // caller can override any bound (e.g. yMin/yMax) to truncate an axis and
    // use the screen space on a series that never approaches zero. The x
    // domain is padded a little past the last point so its marker isn't
    // clipped by the axis; explicit xMax/yMax bounds are taken as-is.
    // A categorical axis instead defaults to one equal band per category.
    const xPad = (xMaxData - xMinData) * 0.06 || Math.max(xMaxData * 0.06, 1);
    const xMin = opts.xMin != null ? opts.xMin : categories ? -0.5 : 0;
    const xMax =
      opts.xMax != null
        ? opts.xMax
        : categories
          ? categories.length - 0.5
          : xMaxData + xPad;
    const yMin = opts.yMin != null ? opts.yMin : 0;
    const yMax =
      opts.yMax != null ? opts.yMax : yMaxData > 0 ? yMaxData * 1.08 : 1;

    const xScale = (v) => margin.left + ((v - xMin) / (xMax - xMin)) * plotW;
    const yScale = (v) => margin.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    const formatX =
      opts.formatX ||
      (categories
        ? (v) => (categories[Math.round(v)] || []).join(" ")
        : defaultFormat);
    const formatY = opts.formatY || defaultFormat;

    // Points flagged `guide: true` (and actually drawn) get lines dropped to
    // both axes and their coordinates printed there, in the series color.
    // Collected here so the regular tick labels can step aside for them.
    const guides = [];
    series.forEach((s) => {
      s.points.forEach((p) => {
        if (p.marker !== false && p.guide) {
          guides.push({ cx: xScale(p.x), cy: yScale(p.y), point: p, series: s });
        }
      });
    });
    // Caller-supplied horizontal reference lines (e.g. a derived lower bound),
    // clipped to the visible y domain and pre-scaled like the guide points.
    const yGuides = (opts.yGuides || [])
      .filter((g) => g.y >= yMin && g.y <= yMax)
      .map((g) => ({
        y: g.y,
        color: g.color,
        text: g.text,
        cy: yScale(g.y),
        x2: g.xMax != null ? xScale(g.xMax) : margin.left + plotW,
      }));

    // A regular tick label is dropped when a guide readout would sit this close
    // to it. The y gap is a bit over one line height, so a tick label that
    // would merely touch a guide readout (e.g. "50,000" under "52,200") steps
    // aside rather than overlapping it.
    const nearGuideX = (px) => guides.some((g) => Math.abs(g.cx - px) < 14);
    const nearGuideY = (py) =>
      guides.some((g) => Math.abs(g.cy - py) < 15) ||
      yGuides.some((g) => Math.abs(g.cy - py) < 15);

    state.drawnWidth = width;
    state.drawnHeight = height;

    const svg = el("svg", {
      class: "plot-svg",
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label":
        opts.ariaLabel ||
        `${opts.yLabel || "y"} versus ${opts.xLabel || "x"}, ${series.length} series`,
    });

    // On a categorical axis the labels sit at the category centers but the
    // gridlines run along the band edges, and there's no minor x grid.
    const xTicks = categories
      ? categories.map((_, i) => i)
      : ticksFor(xMin, xMax, compact ? 6 : 12);
    const xGridTicks = categories
      ? categories.slice(1).map((_, i) => i + 0.5)
      : xTicks;
    const yTicks = ticksFor(yMin, yMax, compact ? 6 : 9);
    const xMinorTicks = categories ? [] : minorTicksBetween(xTicks);
    const yMinorTicks = minorTicksBetween(yTicks);

    // --- Grid ---
    // Minor gridlines are drawn first (and styled fainter in CSS) so the
    // major grid — which carries the tick labels — reads on top of them.
    const minorGrid = el("g", { class: "plot-grid plot-grid-minor" });
    xMinorTicks.forEach((t) => {
      minorGrid.appendChild(
        el("line", {
          x1: xScale(t), y1: margin.top,
          x2: xScale(t), y2: margin.top + plotH,
        })
      );
    });
    yMinorTicks.forEach((t) => {
      minorGrid.appendChild(
        el("line", {
          x1: margin.left, y1: yScale(t),
          x2: margin.left + plotW, y2: yScale(t),
        })
      );
    });
    svg.appendChild(minorGrid);

    const grid = el("g", { class: "plot-grid" });
    xGridTicks.forEach((t) => {
      grid.appendChild(
        el("line", {
          x1: xScale(t), y1: margin.top,
          x2: xScale(t), y2: margin.top + plotH,
        })
      );
    });
    yTicks.forEach((t) => {
      grid.appendChild(
        el("line", {
          x1: margin.left, y1: yScale(t),
          x2: margin.left + plotW, y2: yScale(t),
        })
      );
    });
    svg.appendChild(grid);

    // --- Axes ---
    const axes = el("g", { class: "plot-axis" });
    axes.appendChild(
      el("line", {
        x1: margin.left, y1: margin.top + plotH,
        x2: margin.left + plotW, y2: margin.top + plotH,
      })
    );
    axes.appendChild(
      el("line", {
        x1: margin.left, y1: margin.top,
        x2: margin.left, y2: margin.top + plotH,
      })
    );
    svg.appendChild(axes);

    const labels = el("g", { class: "plot-tick-label" });
    if (categories) {
      const axisY = margin.top + plotH;
      categories.forEach((lines, i) => {
        const cx = xScale(i);
        if (rotateCategories) {
          // Anchored by its end just under the tick, so the label hangs down
          // and to the left of its band.
          const ax = cx + 4;
          const ay = axisY + 12;
          const text = el("text", {
            x: ax,
            y: ay,
            "text-anchor": "end",
            transform: `rotate(-45 ${ax} ${ay})`,
          });
          text.textContent = lines.join(" ");
          labels.appendChild(text);
          return;
        }
        const text = el("text", { x: cx, y: axisY + 16, "text-anchor": "middle" });
        lines.forEach((line, j) => {
          const tspan = el("tspan", { x: cx, dy: j === 0 ? 0 : categoryLineHeight });
          tspan.textContent = line;
          text.appendChild(tspan);
        });
        labels.appendChild(text);
      });
    }
    (categories ? [] : xTicks).forEach((t) => {
      // Drop a regular tick label that a guide readout would land on top of.
      if (nearGuideX(xScale(t))) return;
      const text = el("text", {
        x: xScale(t),
        y: margin.top + plotH + 16,
        "text-anchor": "middle",
      });
      text.textContent = formatX(t);
      labels.appendChild(text);
    });
    yTicks.forEach((t) => {
      if (nearGuideY(yScale(t))) return;
      const text = el("text", {
        x: margin.left - 8,
        y: yScale(t) + 4,
        "text-anchor": "end",
      });
      text.textContent = formatY(t);
      labels.appendChild(text);
    });
    svg.appendChild(labels);

    const axisTitles = el("g", { class: "plot-axis-title" });
    if (opts.xLabel) {
      const text = el("text", {
        x: margin.left + plotW / 2,
        y: height - 8,
        "text-anchor": "middle",
      });
      text.textContent = opts.xLabel;
      axisTitles.appendChild(text);
    }
    if (opts.yLabel) {
      const text = el("text", {
        x: 12,
        y: margin.top + plotH / 2,
        "text-anchor": "middle",
        transform: `rotate(-90 12 ${margin.top + plotH / 2})`,
      });
      text.textContent = opts.yLabel;
      axisTitles.appendChild(text);
    }
    svg.appendChild(axisTitles);

    // --- Guide lines to the axes ---
    // The drop lines for each `guide` point (collected above). Drawn here so
    // they sit over the grid but behind the series; the coordinate readouts
    // are added after the series so they stay on top.
    if (guides.length || yGuides.length) {
      const guideLines = el("g", { class: "plot-guide-lines" });
      guides.forEach((g) => {
        guideLines.appendChild(
          el("line", {
            class: "plot-guide-line",
            x1: g.cx, y1: g.cy, x2: margin.left, y2: g.cy,
            stroke: g.series.color,
          })
        );
        guideLines.appendChild(
          el("line", {
            class: "plot-guide-line",
            x1: g.cx, y1: g.cy, x2: g.cx, y2: margin.top + plotH,
            stroke: g.series.color,
          })
        );
      });
      yGuides.forEach((g) => {
        guideLines.appendChild(
          el("line", {
            class: "plot-guide-line",
            x1: margin.left, y1: g.cy, x2: g.x2, y2: g.cy,
            stroke: g.color,
          })
        );
      });
      svg.appendChild(guideLines);
    }

    // --- Series ---
    const markers = [];
    series.forEach((s) => {
      const group = el("g", { class: "plot-series" });
      if (s.points.length > 1 && s.line !== false) {
        const d = s.points
          .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.x)} ${yScale(p.y)}`)
          .join(" ");
        const path = el("path", { class: "plot-line", d: d, stroke: s.color });
        // A series can ask for a dashed line (e.g. an auxiliary guide line
        // that isn't one of the plotted data curves).
        if (s.dash) path.setAttribute("stroke-dasharray", s.dash);
        group.appendChild(path);
      }
      s.points.forEach((p) => {
        // A point with `marker: false` contributes to the line but draws no
        // dot — used to keep a curve's construction points hidden while
        // showing only a single point of interest on it.
        if (p.marker === false) return;
        const r = compact ? 3 : 3.5;
        let marker;
        if (s.shape || s.hollow) {
          // A path rather than a circle, so it can take any shape. Its hover
          // enlargement is a CSS scale about its own center, since there's no
          // `r` to change.
          marker = el("path", {
            class: "plot-marker plot-marker--shape",
            d: markerPath(s.shape, xScale(p.x), yScale(p.y), r),
          });
          if (s.hollow) {
            marker.classList.add("plot-marker--hollow");
            marker.style.stroke = s.color;
          } else {
            marker.setAttribute("fill", s.color);
          }
        } else {
          marker = el("circle", {
            class: "plot-marker",
            cx: xScale(p.x),
            cy: yScale(p.y),
            r: r,
            fill: s.color,
          });
        }
        group.appendChild(marker);
        markers.push({ marker: marker, point: p, series: s, cx: xScale(p.x), cy: yScale(p.y) });
      });
      svg.appendChild(group);
    });

    // Axis readouts for the guide points, drawn last so they sit above the
    // gridlines and the regular tick labels. A panel-colored halo (via
    // paint-order: stroke in CSS) keeps them legible over whatever's behind.
    if (guides.length || yGuides.length) {
      const guideLabels = el("g", { class: "plot-guide-label" });

      // The x readouts for guide points sit under the x axis and don't crowd
      // each other, so they're drawn straight at the point.
      guides.forEach((g) => {
        const xText = el("text", {
          x: g.cx,
          y: margin.top + plotH + 16,
          "text-anchor": "middle",
          fill: g.series.color,
        });
        xText.textContent = formatX(g.point.x);
        guideLabels.appendChild(xText);
      });

      // The y readouts — from both the guide points and the yGuide reference
      // lines — all share the narrow gutter left of the y axis, and two can
      // land at nearly the same height (e.g. one class's max-force mark and a
      // lower class's min-force-after-α line). Sort them by height and push
      // any that would collide a line or so apart, then slide the whole block
      // back inside the plot if the spreading ran it past an edge. The
      // reference line itself stays at the true value, so a nudged label is
      // still tied to its line by colour and proximity.
      const yReadouts = yGuides
        .map((g) => ({
          cy: g.cy,
          color: g.color,
          text: g.text != null ? g.text : formatY(g.y),
        }))
        .concat(
          guides.map((g) => ({
            cy: g.cy,
            color: g.series.color,
            text: formatY(g.point.y),
          }))
        )
        .sort((a, b) => a.cy - b.cy);

      const MIN_GAP = 13;
      for (let i = 1; i < yReadouts.length; i++) {
        const gap = yReadouts[i].cy - yReadouts[i - 1].cy;
        if (gap < MIN_GAP) yReadouts[i].cy = yReadouts[i - 1].cy + MIN_GAP;
      }
      for (let i = yReadouts.length - 2; i >= 0; i--) {
        const gap = yReadouts[i + 1].cy - yReadouts[i].cy;
        if (gap < MIN_GAP) yReadouts[i].cy = yReadouts[i + 1].cy - MIN_GAP;
      }
      if (yReadouts.length) {
        const overflow = yReadouts[yReadouts.length - 1].cy - (margin.top + plotH);
        if (overflow > 0) yReadouts.forEach((r) => (r.cy -= overflow));
        const underflow = margin.top + 4 - yReadouts[0].cy;
        if (underflow > 0) yReadouts.forEach((r) => (r.cy += underflow));
      }

      yReadouts.forEach((r) => {
        const yText = el("text", {
          x: margin.left - 8,
          y: r.cy + 4,
          "text-anchor": "end",
          fill: r.color,
        });
        yText.textContent = r.text;
        guideLabels.appendChild(yText);
      });

      svg.appendChild(guideLabels);
    }

    container.appendChild(svg);

    container.appendChild(buildLegend(container, opts, series));

    // --- Hover tooltip ---
    // One overlay catches the pointer for the whole plot area and picks the
    // nearest marker, so hitting a 3px circle isn't required.
    const tooltip = document.createElement("div");
    tooltip.className = "plot-tooltip";
    tooltip.hidden = true;
    container.appendChild(tooltip);

    const overlay = el("rect", {
      class: "plot-overlay",
      x: margin.left,
      y: margin.top,
      width: plotW,
      height: plotH,
      fill: "transparent",
    });
    svg.appendChild(overlay);

    let active = null;
    function clearActive() {
      if (active) active.marker.classList.remove("is-active");
      active = null;
      tooltip.hidden = true;
    }

    function onMove(evt) {
      const rect = svg.getBoundingClientRect();
      const px = evt.clientX - rect.left;
      const py = evt.clientY - rect.top;
      let best = null;
      let bestDist = Infinity;
      markers.forEach((m) => {
        const dist = Math.hypot(m.cx - px, m.cy - py);
        if (dist < bestDist) {
          bestDist = dist;
          best = m;
        }
      });
      if (!best || bestDist > 40) {
        clearActive();
        return;
      }
      if (active !== best) {
        if (active) active.marker.classList.remove("is-active");
        active = best;
        active.marker.classList.add("is-active");
        const lines = opts.formatTooltip
          ? opts.formatTooltip(best.point, best.series)
          : [best.series.label, `${formatX(best.point.x)}, ${formatY(best.point.y)}`];
        tooltip.innerHTML = lines
          .map((line, i) =>
            i === 0
              ? `<strong class="plot-tooltip-title">${line}</strong>`
              : `<span>${line}</span>`
          )
          .join("");
      }
      tooltip.hidden = false;
      // Flip the tooltip to the other side of the point near the edges so it
      // stays inside the container.
      const tipW = tooltip.offsetWidth;
      const tipH = tooltip.offsetHeight;
      let left = best.cx + 12;
      if (left + tipW > width) left = best.cx - 12 - tipW;
      let top = best.cy - tipH - 10;
      if (top < 0) top = best.cy + 12;
      tooltip.style.left = `${Math.max(0, left)}px`;
      tooltip.style.top = `${top}px`;
    }

    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerleave", clearActive);
  }

  function renderLinePlot(container, options) {
    if (!container) return;
    let state = states.get(container);
    if (!state) {
      state = { options: options, width: 0 };
      states.set(container, state);
      if (typeof ResizeObserver !== "undefined") {
        // Only redraw when the width actually changes: the draw itself
        // changes the container's content (and so its height), which would
        // otherwise feed back into the observer.
        const observer = new ResizeObserver(() => {
          const width = container.clientWidth;
          if (width !== state.width) {
            state.width = width;
            draw(container);
          }
        });
        observer.observe(container);
      } else {
        window.addEventListener("resize", () => draw(container));
      }
    }
    state.options = options;
    state.width = container.clientWidth;
    draw(container);
  }

  // Draws just the legend into its own container, from the same options
  // renderLinePlot takes (legendItems, legendSlots). For a page that shows the
  // plotted data some other way — a table, say — but keeps the legend as its
  // series control. Call it again to redraw after a toggle.
  function renderPlotLegend(container, options) {
    if (!container) return;
    container.innerHTML = "";
    container.appendChild(buildLegend(container, options, []));
  }

  window.renderLinePlot = renderLinePlot;
  window.renderPlotLegend = renderPlotLegend;
  window.createPlotMarker = createPlotMarker;
})();
