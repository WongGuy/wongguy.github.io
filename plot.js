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
// in the torque tables, not a degenerate one, so markers are always drawn.

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
      // 0.30000000000000004, which then format badly.
      ticks.push(Math.round(v / step) * step);
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
      left: compact ? 52 : 62,
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
      const text = el("text", {
        x: xScale(t),
        y: margin.top + plotH + 16,
        "text-anchor": "middle",
      });
      text.textContent = formatX(t);
      labels.appendChild(text);
    });
    yTicks.forEach((t) => {
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

    // --- Series ---
    const markers = [];
    series.forEach((s) => {
      const group = el("g", { class: "plot-series" });
      if (s.points.length > 1) {
        const d = s.points
          .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.x)} ${yScale(p.y)}`)
          .join(" ");
        group.appendChild(el("path", { class: "plot-line", d: d, stroke: s.color }));
      }
      s.points.forEach((p) => {
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
