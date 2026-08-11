// Renders the size slider (native range input, driven by screwData) and the
// side spec panel. See data.js to edit the underlying table.

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

  function subValueHtml(label, bold, subvalue, unit) {
    const labelClass = bold ? "sub-label sub-label-bold" : "sub-label";
    return `<div class="sub-value"><span class="${labelClass}">${label}</span><span class="sub-num">${subvalue}${unit ? " " + unit : ""}</span></div>`;
  }

  // Returns the rendered value HTML, or null if the field's row should be
  // omitted entirely (no-detail mode, no starred sublabel to fall back on).
  function formatValue(field, value, detail) {
    const unit = field.unit;
    if (value !== null && typeof value === "object") {
      const entries = Object.entries(value).map(([sublabel, subvalue]) => {
        const bold = sublabel.startsWith("*");
        return { label: bold ? sublabel.slice(1) : sublabel, bold, subvalue };
      });

      if (detail) {
        return entries
          .map((e) => subValueHtml(e.label, e.bold, e.subvalue, unit))
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
        .map((e) => subValueHtml(e.label, e.bold, e.subvalue, unit))
        .join("");
    }
    return `${value}${unit ? " " + unit : ""}`;
  }

  function buildRowsHtml(data, fields, detail) {
    return fields
      .map((f) => {
        const valueHtml = formatValue(f, data[f.key], detail);
        if (valueHtml === null) return "";
        return `<tr><td>${f.label}</td><td>${valueHtml}</td></tr>`;
      })
      .join("");
  }

  // Both the detail and compact tables are rendered at once, stacked in the
  // same grid cell with the inactive one hidden via visibility (not
  // display), so the panel always reserves the taller detail table's height
  // and toggling the detail slider never resizes the surrounding layout.
  function renderSpecPanel(el, data, fields) {
    const detailRows = buildRowsHtml(data, fields, true);
    const compactRows = buildRowsHtml(data, fields, false);

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

  function renderPanel() {
    const row = screwData[selectedIndex];
    readoutEl.textContent = row.size;

    renderSpecPanel(panelEl, row, screwFields);
    renderSpecPanel(shcsPanelEl, row.SHCS, shcsFields);
    renderSpecPanel(fhcsPanelEl, row.FHCS, fhcsFields);
    renderSpecPanel(bhcsPanelEl, row.BHCS, bhcsFields);
  }

  function setIndex(i) {
    selectedIndex = Math.max(0, Math.min(maxIndex, i));
    sliderEl.value = String(selectedIndex);
    localStorage.setItem(SLIDER_STORAGE_KEY, String(selectedIndex));
    renderPanel();
  }

  buildTicks();

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
