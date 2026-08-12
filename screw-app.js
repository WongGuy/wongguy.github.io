// Renders the size slider (native range input, driven by screwData) and the
// side spec panel. See screw-data.js to edit the underlying table.

(function () {
  const sliderEl = document.getElementById("size-slider");
  const ticksEl = document.getElementById("slider-ticks");
  const readoutEl = document.getElementById("size-readout");
  const minLabelEl = document.getElementById("slider-min-label");
  const maxLabelEl = document.getElementById("slider-max-label");
  const panelEl = document.getElementById("spec-panel");
  const shcsPanelEl = document.getElementById("shcs-spec-panel");
  const fhcsPanelEl = document.getElementById("fhcs-spec-panel");
  const bhcsPanelEl = document.getElementById("bhcs-spec-panel");
  const shcsLengthChartEl = document.getElementById("shcs-length-chart");
  const fhcsLengthChartEl = document.getElementById("fhcs-length-chart");
  const bhcsLengthChartEl = document.getElementById("bhcs-length-chart");
  const detailToggleEl = document.getElementById("detail-toggle");

  const maxIndex = screwData.length - 1;
  sliderEl.max = String(maxIndex);
  minLabelEl.textContent = screwData[0].size;
  maxLabelEl.textContent = screwData[maxIndex].size;

  const SLIDER_STORAGE_KEY = "screwSliderIndex";
  const DETAIL_STORAGE_KEY = "screwDetailEnabled";

  function getStoredIndex() {
    const stored = Number(localStorage.getItem(SLIDER_STORAGE_KEY));
    if (Number.isInteger(stored) && stored >= 0 && stored <= maxIndex) {
      return stored;
    }
    return Math.floor(screwData.length / 2);
  }

  function getStoredDetail() {
    const stored = localStorage.getItem(DETAIL_STORAGE_KEY);
    if (stored === null) {
      return true;
    }
    return stored === "true";
  }

  let selectedIndex = getStoredIndex();
  let showDetail = getStoredDetail();
  detailToggleEl.checked = showDetail;

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

  // Reads the font a CSS class would apply, without needing a real instance
  // of that element on the page yet (sub-label/sub-num spans only exist once
  // a panel has rendered at least once).
  function getClassFontMetrics(className) {
    const el = document.createElement("span");
    el.className = className;
    el.style.position = "absolute";
    el.style.visibility = "hidden";
    document.body.appendChild(el);
    const style = getComputedStyle(el);
    const metrics = {
      font: `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
      letterSpacing: parseFloat(style.letterSpacing) || 0,
    };
    document.body.removeChild(el);
    return metrics;
  }

  // Locks the readout box to the exact pixel width of the widest possible
  // size label at the current font (which changes across the mobile
  // breakpoint), so switching between e.g. "M6" and "M1.6" never resizes the
  // box — and therefore never steals width from the slider track next to it.
  function updateReadoutWidth() {
    const style = getComputedStyle(readoutEl);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const letterSpacing = parseFloat(style.letterSpacing) || 0;
    const maxWidth = screwData.reduce((max, row) => {
      return Math.max(max, measureTextWidth(row.size, font, letterSpacing));
    }, 0);
    readoutEl.style.width = `${Math.ceil(maxWidth) + 1}px`;
  }

  // For every field that can render as multiple sublabel/value rows (e.g.
  // clearanceHole's Close/Normal/Loose), pre-measure the widest sublabel and
  // widest value across *all* sizes, not just the selected one. Applying
  // these as fixed column widths means switching sizes only ever changes the
  // digits — the sublabel and value never shift position to accommodate a
  // wider or narrower number.
  function computeSubValueWidths(panels) {
    const labelFont = getClassFontMetrics("sub-label");
    const labelBoldFont = getClassFontMetrics("sub-label sub-label-bold");
    const valueFont = getClassFontMetrics("sub-num");
    const widths = {};
    panels.forEach(({ key, rows, fields }) => {
      fields.forEach((field) => {
        let maxLabel = 0;
        let maxValue = 0;
        let hasObject = false;
        rows.forEach((row) => {
          const value = row[field.key];
          if (value === null || typeof value !== "object") return;
          hasObject = true;
          Object.entries(value).forEach(([sublabel, subvalue]) => {
            const bold = sublabel.startsWith("*");
            const label = bold ? sublabel.slice(1) : sublabel;
            const font = bold ? labelBoldFont : labelFont;
            maxLabel = Math.max(
              maxLabel,
              measureTextWidth(label, font.font, font.letterSpacing)
            );
            const valueText = `${subvalue}${field.unit ? " " + field.unit : ""}`;
            maxValue = Math.max(
              maxValue,
              measureTextWidth(valueText, valueFont.font, valueFont.letterSpacing)
            );
          });
        });
        if (hasObject) {
          widths[`${key}:${field.key}`] = {
            label: Math.ceil(maxLabel) + 1,
            value: Math.ceil(maxValue) + 1,
          };
        }
      });
    });
    return widths;
  }

  const subValueWidths = computeSubValueWidths([
    { key: "screw", rows: screwData, fields: screwFields },
    { key: "SHCS", rows: screwData.map((r) => r.SHCS), fields: shcsFields },
    { key: "FHCS", rows: screwData.map((r) => r.FHCS), fields: fhcsFields },
    { key: "BHCS", rows: screwData.map((r) => r.BHCS), fields: bhcsFields },
  ]);

  function buildTicks() {
    // The thumb's travel is inset by half its width on each side (a range
    // input centers the thumb within the track, it doesn't run edge-to-edge),
    // so ticks must be offset the same way to line up with the thumb center.
    const thumbWidth = getThumbWidth();
    screwData.forEach((row, i) => {
      const tick = document.createElement("div");
      tick.className = "slider-tick";
      const fraction = i / maxIndex;
      tick.style.left = `calc(${thumbWidth / 2}px + (100% - ${thumbWidth}px) * ${fraction})`;
      ticksEl.appendChild(tick);
    });
  }

  function subValueHtml(label, bold, subvalue, unit, widths) {
    const labelClass = bold ? "sub-label sub-label-bold" : "sub-label";
    const labelStyle = widths ? ` style="width:${widths.label}px"` : "";
    const valueStyle = widths ? ` style="width:${widths.value}px"` : "";
    return `<div class="sub-value"><span class="${labelClass}"${labelStyle}>${label}</span><span class="sub-num"${valueStyle}>${subvalue}${unit ? " " + unit : ""}</span></div>`;
  }

  // Returns the rendered value HTML, or null if the field's row should be
  // omitted entirely (no-detail mode, no starred sublabel to fall back on).
  function formatValue(field, value, detail, widths) {
    const unit = field.unit;
    if (value !== null && typeof value === "object") {
      const entries = Object.entries(value).map(([sublabel, subvalue]) => {
        const bold = sublabel.startsWith("*");
        return { label: bold ? sublabel.slice(1) : sublabel, bold, subvalue };
      });

      if (detail) {
        return entries
          .map((e) => subValueHtml(e.label, e.bold, e.subvalue, unit, widths))
          .join("");
      }

      const starred = entries.filter((e) => e.bold);
      if (starred.length === 0) {
        return null;
      }
      if (starred.length === 1) {
        return `${starred[0].subvalue}${unit ? " " + unit : ""}`;
      }
      return starred
        .map((e) => subValueHtml(e.label, e.bold, e.subvalue, unit, widths))
        .join("");
    }
    return `${value}${unit ? " " + unit : ""}`;
  }

  function buildRowsHtml(data, fields, detail, panelKey) {
    return fields
      .map((f) => {
        const widths = subValueWidths[`${panelKey}:${f.key}`];
        const valueHtml = formatValue(f, data[f.key], detail, widths);
        if (valueHtml === null) return "";
        return `<tr><td>${f.label}</td><td>${valueHtml}</td></tr>`;
      })
      .join("");
  }

  // Both the detail and compact tables are rendered at once, stacked in the
  // same grid cell with the inactive one hidden via visibility (not
  // display), so the panel always reserves the taller detail table's height
  // and toggling the detail slider never resizes the surrounding layout.
  function renderSpecPanel(el, data, fields, panelKey) {
    const detailRows = buildRowsHtml(data, fields, true, panelKey);
    const compactRows = buildRowsHtml(data, fields, false, panelKey);

    el.innerHTML = `
      <div class="spec-panel-stack">
        <table class="${showDetail ? "" : "spec-hidden"}">
          <tbody>${detailRows}</tbody>
        </table>
        <table class="${showDetail ? "spec-hidden" : ""}">
          <tbody>${compactRows}</tbody>
        </table>
      </div>
    `;
  }

  // Two rows (overall length, threaded length) with one column per valid
  // length. When a length is fully threaded (length === threaded), its
  // column is a single cell spanning both rows instead of two identical
  // ones. Relies on the browser's normal rowspan column-filling: row two
  // only emits a <td> for columns row one didn't already span, and the
  // browser slots each into the next open column automatically.
  function buildLengthChartHtml(lengths) {
    if (!lengths || lengths.length === 0) {
      // Same two-row structure as the populated table (row labels plus a
      // rowspan-2 message cell) so the empty state reserves the same
      // vertical space instead of collapsing the layout.
      return `
        <table class="length-table">
          <tbody>
            <tr><td class="length-row-label">Tot. Len</td><td class="length-cell length-empty-msg" rowspan="2">Configuration Not Supported by ISO</td></tr>
            <tr><td class="length-row-label">Thrd. Len</td></tr>
          </tbody>
        </table>
      `;
    }

    const lengthCells = [];
    const threadedCells = [];
    lengths.forEach(({ length, threaded }) => {
      if (length === threaded) {
        lengthCells.push(`<td class="length-cell" rowspan="2">${length}</td>`);
      } else {
        lengthCells.push(`<td class="length-cell">${length}</td>`);
        threadedCells.push(`<td class="length-cell">${threaded}</td>`);
      }
    });

    return `
      <table class="length-table">
        <tbody>
          <tr><td class="length-row-label">Tot. Len</td>${lengthCells.join("")}</tr>
          <tr><td class="length-row-label">Thrd. Len</td>${threadedCells.join("")}</tr>
        </tbody>
      </table>
    `;
  }

  function renderLengthChart(el, headData) {
    el.innerHTML = buildLengthChartHtml(headData.lengths);
  }

  function renderPanel() {
    const row = screwData[selectedIndex];
    readoutEl.textContent = row.size;

    renderSpecPanel(panelEl, row, screwFields, "screw");
    renderSpecPanel(shcsPanelEl, row.SHCS, shcsFields, "SHCS");
    renderSpecPanel(fhcsPanelEl, row.FHCS, fhcsFields, "FHCS");
    renderSpecPanel(bhcsPanelEl, row.BHCS, bhcsFields, "BHCS");

    renderLengthChart(shcsLengthChartEl, row.SHCS);
    renderLengthChart(fhcsLengthChartEl, row.FHCS);
    renderLengthChart(bhcsLengthChartEl, row.BHCS);
  }

  function setIndex(i) {
    selectedIndex = Math.max(0, Math.min(maxIndex, i));
    sliderEl.value = String(selectedIndex);
    localStorage.setItem(SLIDER_STORAGE_KEY, String(selectedIndex));
    renderPanel();
  }

  buildTicks();
  updateReadoutWidth();
  window.addEventListener("resize", updateReadoutWidth);

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

  detailToggleEl.addEventListener("change", () => {
    showDetail = detailToggleEl.checked;
    localStorage.setItem(DETAIL_STORAGE_KEY, String(showDetail));
    renderPanel();
  });

  setIndex(selectedIndex);
})();
