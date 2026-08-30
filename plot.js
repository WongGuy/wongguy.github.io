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
//     }, ...],
//     xLabel, yLabel,       // axis titles, drawn as-is
//     xMin, xMax, yMin, yMax, // optional; override the computed domain on
//                             // that axis (default: 0 to just past the data)
//                             // so a caller can truncate an axis that never
//                             // approaches zero and use the freed space
//     formatX, formatY,     // (value) => string, for tick labels
//     formatTooltip,        // (point, series) => [string, ...] lines
//     emptyMessage,         // shown when no series has points
//     legendItems: [{       // optional; defaults to one item per drawn series
//       key, label, color,
//       active,             // false renders the item as switched off
//       note,               // small trailing text, e.g. why there's no line
//       onToggle,           // (nextActive) => void; makes the item a checkbox
//     }, ...],
//   })
//
// Passing `legendItems` is what turns the legend into the plot's control
// surface: the list is drawn as given rather than derived from what's on the
// plot, so a series the caller has switched off still has a row to switch back
// on, and the legend stays up even when nothing is plotted at all.
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
// to draw its line dashed. A drawn point with `guide: true` also gets lines
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

    items.forEach((item) => {
      const active = item.active !== false;
      const interactive = typeof item.onToggle === "function";
      const row = document.createElement(interactive ? "label" : "span");
      row.className = "plot-legend-item";
      if (interactive) row.classList.add("plot-legend-item--toggle");
      if (!active) row.classList.add("is-off");
      if (item.note) row.classList.add("is-noted");

      if (interactive) {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = active;
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

      const swatch = document.createElement("span");
      swatch.className = "plot-legend-swatch";
      swatch.style.background = item.color;
      row.appendChild(swatch);

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

      legend.appendChild(row);
    });

    return legend;
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

    container.innerHTML = "";

    if (!series.length) {
      const empty = document.createElement("p");
      empty.className = "plot-empty";
      empty.textContent = opts.emptyMessage || "No data to plot.";
      container.appendChild(empty);
      // The legend is drawn even with nothing to plot: when it carries the
      // toggles, it's the only way back to a non-empty plot.
      container.appendChild(buildLegend(container, opts, series));
      return;
    }

    const height = Math.round(Math.min(460, Math.max(260, width * 0.58)));
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
    const plotH = height - margin.top - margin.bottom;

    const [xMinData, xMaxData] = extent(series, "x");
    const [, yMaxData] = extent(series, "y");

    // X starts at 0 and Y starts at 0 by default, so values read against a
    // real origin instead of exaggerating the spread between series — but a
    // caller can override any bound (e.g. yMin/yMax) to truncate an axis and
    // use the screen space on a series that never approaches zero. The x
    // domain is padded a little past the last point so its marker isn't
    // clipped by the axis; explicit xMax/yMax bounds are taken as-is.
    const xPad = (xMaxData - xMinData) * 0.06 || Math.max(xMaxData * 0.06, 1);
    const xMin = opts.xMin != null ? opts.xMin : 0;
    const xMax = opts.xMax != null ? opts.xMax : xMaxData + xPad;
    const yMin = opts.yMin != null ? opts.yMin : 0;
    const yMax =
      opts.yMax != null ? opts.yMax : yMaxData > 0 ? yMaxData * 1.08 : 1;

    const xScale = (v) => margin.left + ((v - xMin) / (xMax - xMin)) * plotW;
    const yScale = (v) => margin.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    const formatX = opts.formatX || defaultFormat;
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

    const xTicks = ticksFor(xMin, xMax, compact ? 6 : 12);
    const yTicks = ticksFor(yMin, yMax, compact ? 6 : 9);
    const xMinorTicks = minorTicksBetween(xTicks);
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
    xTicks.forEach((t) => {
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
    xTicks.forEach((t) => {
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
      if (s.points.length > 1) {
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
        const marker = el("circle", {
          class: "plot-marker",
          cx: xScale(p.x),
          cy: yScale(p.y),
          r: compact ? 3 : 3.5,
          fill: s.color,
        });
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

  window.renderLinePlot = renderLinePlot;
})();
