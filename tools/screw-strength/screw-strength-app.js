// DOM logic for screw-size-estimation.html: the force-per-bolt input, the
// load condition and tightening method pickers, the load table, and the
// property class column toggles. Reads screw-strength-data.js — see that file
// for the schema and for how to regenerate the ISO 898-1 half of it.
//
// How the table is marked up:
//
//   Within each property class column, the smallest thread whose tabulated
//   load reaches the force per bolt is bolded and filled yellow — that's the
//   bare minimum before corrections, with no margin at all. The load
//   condition and the tightening method each add a
//   number of steps (see screwStrengthLoadCases / screwStrengthTighteningMethods);
//   the cell that many rows below the bolded one is the estimate, and is
//   highlighted. The rows outside that band are trimmed away, leaving one row
//   of context above the first bolded cell and one below the last estimate.
//
//   Stepping walks the rows that actually have a value in that column, not
//   every row, so class 9.8 (which ISO 898-1 stops tabulating above M16)
//   steps through its own sizes instead of stepping onto blanks. A class that
//   can't see the estimate through — nothing in it carries the load, or the
//   steps run off the bottom of it — has no size to recommend, so its column
//   header is marked instead and nothing in the column is marked.
//
// Six bits of state are remembered in localStorage between visits: the force
// per bolt, the selected load condition, the selected tightening method, which
// property class columns are shown, whether the "Show UTS Load" toggle adds the
// minimum ultimate tensile load as a second value per cell, and whether the
// "Show Cursed (2nd choice) Sizes" toggle un-hides the ISO 262 second-choice
// diameters. Columns are keyed by the class designations in screw-strength-data.js.
//
// The estimate (bolded minimum, highlighted pick, trimmed row window) always
// tracks the proof loads; "Show UTS Load" is reference only and doesn't move
// anything. The two values in a cell carry no labels of their own — the
// legend's sample cell names them once instead.
//
// The load type (proof / minimum ultimate tensile) and the thread series
// (coarse / fine) are read from their lists in the data file rather than
// hardcoded here, so today's single choice of each is a default, not an
// assumption baked into the table build.

(function () {
  const forceEl = document.getElementById("force-input");
  const forceClearEl = document.getElementById("force-clear");
  const utsToggleEl = document.getElementById("uts-toggle");
  const cursedToggleEl = document.getElementById("cursed-toggle");
  const loadCaseLabelEl = document.getElementById("load-case-label");
  const loadCaseRowEl = document.getElementById("load-case-row");
  const methodLabelEl = document.getElementById("method-label");
  const methodListEl = document.getElementById("method-list");
  const stepsNoteEl = document.getElementById("steps-note");
  const tableTitleEl = document.getElementById("table-title");
  const tableEl = document.getElementById("size-table");
  const messageEl = document.getElementById("table-message");
  const legendEl = document.getElementById("table-legend");
  const gradeTogglesEl = document.getElementById("grade-toggles");
  const gradeCommonEl = document.getElementById("grade-common");
  const notesEl = document.getElementById("source-notes");

  const FORCE_STORAGE_KEY = "screwEstForce";
  const LOAD_CASE_STORAGE_KEY = "screwEstLoadCase";
  const METHOD_STORAGE_KEY = "screwEstMethod";
  const GRADES_STORAGE_KEY = "screwEstGrades";
  const UTS_STORAGE_KEY = "screwEstShowUts";
  const CURSED_STORAGE_KEY = "screwEstShowCursed";

  // ISO 262 second-choice nominal diameters. Hidden by default — tick "Show
  // Cursed (2nd choice) Sizes" to bring their rows back.
  const CURSED_DIAMETERS = new Set([3.5, 7, 14, 18, 22, 27, 33, 39]);

  // Property classes drawn bold in the column picker — the everyday high-strength
  // choices, so they read first in the list.
  const EMPHASIZED_GRADES = new Set(["8.8", "10.9", "12.9"]);

  const numberFormat = new Intl.NumberFormat("en-US");

  function titleCase(text) {
    return text.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // --- State ---

  function firstDefault(list) {
    return list.find((entry) => entry.shownByDefault) || list[0];
  }

  function defaultKeys(list) {
    return new Set(list.filter((entry) => entry.shownByDefault).map((e) => e.key));
  }

  function storedChoice(key, list) {
    const stored = localStorage.getItem(key);
    return list.find((entry) => entry.key === stored) || firstDefault(list);
  }

  // Stored as the list of shown class keys. Anything unparseable, or a list
  // left over from a class being renamed or dropped, falls back to the
  // defaults — but an empty list is a real choice (every column unticked)
  // and is kept.
  function storedGrades() {
    try {
      const stored = JSON.parse(localStorage.getItem(GRADES_STORAGE_KEY));
      if (!Array.isArray(stored)) return defaultKeys(screwStrengthGrades);
      const all = screwStrengthGrades.map((g) => g.key);
      return new Set(stored.filter((key) => all.indexOf(key) !== -1));
    } catch (err) {
      return defaultKeys(screwStrengthGrades);
    }
  }

  function storedForce() {
    const stored = Number(localStorage.getItem(FORCE_STORAGE_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  }

  const loadType = firstDefault(screwStrengthLoadTypes);
  const shownSeries = defaultKeys(screwStrengthSeries);
  const shownGrades = storedGrades();
  let loadCase = storedChoice(LOAD_CASE_STORAGE_KEY, screwStrengthLoadCases);
  let method = storedChoice(METHOD_STORAGE_KEY, screwStrengthTighteningMethods);
  let force = storedForce();
  let showUts = localStorage.getItem(UTS_STORAGE_KEY) === "1";
  let showCursed = localStorage.getItem(CURSED_STORAGE_KEY) === "1";

  // The minimum-ultimate-tensile load type, shown as a second value per cell
  // when "Show UTS Load" is ticked. The estimate itself always tracks proof
  // loads (loadType); this is reference only.
  const utsType = screwStrengthLoadTypes.find((t) => t.key === "tensile");

  // --- Data access ---

  function visibleThreads() {
    return screwStrengthThreads.filter(
      (thread) =>
        shownSeries.has(thread.series) &&
        (showCursed || !CURSED_DIAMETERS.has(thread.diameter))
    );
  }

  function visibleGrades() {
    return screwStrengthGrades.filter((grade) => shownGrades.has(grade.key));
  }

  // The tabulated load for one thread in one class, or null where ISO 898-1
  // doesn't tabulate that combination.
  function loadOf(thread, gradeKey) {
    const values = thread.loads[loadType.key];
    const value = values ? values[gradeKey] : undefined;
    return typeof value === "number" ? value : null;
  }

  // The minimum ultimate tensile load for the same thread/class, or null where
  // ISO 898-1 doesn't tabulate it. Used only for the optional second value.
  function utsLoadOf(thread, gradeKey) {
    const values = utsType ? thread.loads[utsType.key] : undefined;
    const value = values ? values[gradeKey] : undefined;
    return typeof value === "number" ? value : null;
  }

  function totalSteps() {
    return loadCase.steps + method.steps;
  }

  // --- The estimate ---

  // For one class column: which row is the bare minimum, and which row the
  // steps land on. Both are indices into `threads`; -1 means "none".
  //
  // `rows` lists only the indices this class is tabulated at, so the steps
  // count sizes that actually exist in the column. Loads climb with size, so
  // the first row at or above the force is also the smallest one.
  function computeColumn(threads, grade, steps) {
    const rows = [];
    threads.forEach((thread, index) => {
      if (loadOf(thread, grade.key) !== null) rows.push(index);
    });

    const blank = { minIndex: -1, pickIndex: -1, unsupported: false };
    if (force === null || !rows.length) return blank;

    const position = rows.findIndex(
      (index) => loadOf(threads[index], grade.key) >= force
    );

    // Either nothing in the class carries the load at all, or the steps run
    // off the bottom of it. Both mean the class has no size to recommend, so
    // neither cell is marked and the column header carries the answer.
    if (position === -1 || position + steps > rows.length - 1) {
      return { minIndex: -1, pickIndex: -1, unsupported: true };
    }

    return {
      minIndex: rows[position],
      pickIndex: rows[position + steps],
      unsupported: false,
    };
  }

  // One row of context above the first bolded cell and one below the last
  // estimate. With nothing marked (no force yet, or nothing big enough) the
  // whole table is shown instead.
  function rowWindow(threads, columns) {
    const mins = columns.filter((c) => c.minIndex >= 0).map((c) => c.minIndex);
    if (!mins.length) return { first: 0, last: threads.length - 1 };
    const picks = columns.filter((c) => c.pickIndex >= 0).map((c) => c.pickIndex);
    return {
      first: Math.max(0, Math.min.apply(null, mins) - 1),
      last: Math.min(threads.length - 1, Math.max.apply(null, picks) + 1),
    };
  }

  // --- Rendering ---

  function stepLabel(steps) {
    return `+${steps} ${steps === 1 ? "step" : "steps"}`;
  }

  function buildLoadCases() {
    screwStrengthLoadCases.forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "est-case";
      button.dataset.key = entry.key;
      button.setAttribute("role", "radio");

      const image = document.createElement("img");
      image.className = "est-case-img";
      image.src = entry.image;
      image.alt = "";
      button.appendChild(image);

      const caption = document.createElement("span");
      caption.className = "est-case-caption";
      caption.textContent = entry.shortLabel;
      button.appendChild(caption);

      const steps = document.createElement("span");
      steps.className = "est-steps-badge";
      steps.textContent = stepLabel(entry.steps);
      button.appendChild(steps);

      button.addEventListener("click", () => setLoadCase(entry.key));
      loadCaseRowEl.appendChild(button);
    });
  }

  function buildMethods() {
    screwStrengthTighteningMethods.forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "est-method";
      button.dataset.key = entry.key;
      button.setAttribute("role", "radio");

      const label = document.createElement("span");
      label.textContent = entry.label;
      button.appendChild(label);

      const steps = document.createElement("span");
      steps.className = "est-steps-badge";
      steps.textContent = stepLabel(entry.steps);
      button.appendChild(steps);

      button.addEventListener("click", () => setMethod(entry.key));
      methodListEl.appendChild(button);
    });
  }

  function buildGradeToggles() {
    screwStrengthGrades.forEach((grade) => {
      const label = document.createElement("label");
      label.className = "est-grade-toggle";
      label.dataset.key = grade.key;

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = shownGrades.has(grade.key);
      input.addEventListener("change", () => setGradeShown(grade.key, input.checked));
      label.appendChild(input);

      const text = document.createElement("span");
      text.textContent = grade.label;
      if (EMPHASIZED_GRADES.has(grade.key)) label.classList.add("est-grade-toggle--strong");
      label.appendChild(text);

      gradeTogglesEl.appendChild(label);
    });
  }

  function buildNotes() {
    const notes = screwStrengthNotes[loadType.key] || [];
    if (!notes.length) return;

    const heading = document.createElement("h4");
    heading.textContent = "ISO 898-1 Notes";
    notesEl.appendChild(heading);

    const list = document.createElement("ul");
    notes.forEach((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      list.appendChild(item);
    });
    notesEl.appendChild(list);
  }

  function syncPickers() {
    loadCaseRowEl.querySelectorAll(".est-case").forEach((button) => {
      const isActive = button.dataset.key === loadCase.key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-checked", isActive ? "true" : "false");
    });
    methodListEl.querySelectorAll(".est-method").forEach((button) => {
      const isActive = button.dataset.key === method.key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-checked", isActive ? "true" : "false");
    });
    loadCaseLabelEl.textContent = loadCase.label;
    methodLabelEl.textContent = method.label;
  }

  function renderTable() {
    const threads = visibleThreads();
    const grades = visibleGrades();
    const steps = totalSteps();

    tableTitleEl.textContent = `${titleCase(loadType.label)} (N)`;
    stepsNoteEl.textContent =
      `Load condition: ${stepLabel(loadCase.steps)} | ` +
      `Tightening method: ${stepLabel(method.steps)} | ` +
      `Total: ${steps} ${steps === 1 ? "step" : "steps"}`;

    tableEl.replaceChildren();
    legendEl.replaceChildren();

    if (!grades.length) {
      messageEl.textContent =
        "No property classes selected.";
      return;
    }

    const columns = grades.map((grade) => computeColumn(threads, grade, steps));
    const bounds = rowWindow(threads, columns);

    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    headRow.appendChild(headerCell("Thread"));
    grades.forEach((grade, column) =>
      headRow.appendChild(headerCell(grade.label, columns[column].unsupported))
    );
    head.appendChild(headRow);
    tableEl.appendChild(head);

    const body = document.createElement("tbody");
    for (let index = bounds.first; index <= bounds.last; index++) {
      const thread = threads[index];
      const row = document.createElement("tr");

      const label = document.createElement("td");
      label.className = "est-row-label";
      label.textContent = thread.designation;
      row.appendChild(label);

      grades.forEach((grade, column) => {
        const cell = document.createElement("td");
        const value = loadOf(thread, grade.key);
        cell.textContent = value === null ? "—" : numberFormat.format(value);
        if (showUts && value !== null) {
          const uts = utsLoadOf(thread, grade.key);
          const utsEl = document.createElement("span");
          utsEl.className = "est-cell-uts";
          utsEl.textContent = uts === null ? "—" : numberFormat.format(uts);
          cell.appendChild(utsEl);
        }
        if (index === columns[column].minIndex) cell.classList.add("est-cell--min");
        if (index === columns[column].pickIndex) cell.classList.add("est-cell--pick");
        row.appendChild(cell);
      });

      body.appendChild(row);
    }
    tableEl.appendChild(body);

    renderLegend(
      columns.some((c) => c.minIndex >= 0 && c.minIndex !== c.pickIndex),
      columns.some((c) => c.pickIndex >= 0),
      columns.some((c) => c.unsupported)
    );
    renderMessage();
  }

  function headerCell(text, unsupported) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = text;
    if (unsupported) cell.classList.add("est-col--unsupported");
    return cell;
  }

  function renderLegend(hasMin, hasPick, hasUnsupported) {
    // With both loads stacked in every cell the numbers are unlabelled, so
    // the legend leads with a sample cell naming the two lines. Nothing to
    // disambiguate when only the proof load is shown.
    if (showUts) legendEl.appendChild(legendSample());
    if (hasMin) {
      legendEl.appendChild(
        legendItem("est-cell--min", "Minimum size before corrections")
      );
    }
    if (hasPick) {
      legendEl.appendChild(
        legendItem("est-cell--pick", "Rough size recommendation")
      );
    }
    if (hasUnsupported) {
      legendEl.appendChild(
        legendItem("est-col--unsupported", "No supported size under this grade")
      );
    }
  }

  // A stand-in for one table cell: the same border, font and stacking as the
  // real thing, and the same .est-cell-uts second line, so the two can't drift
  // apart visually.
  function legendSample() {
    const cell = document.createElement("span");
    cell.className = "est-legend-cell";
    cell.appendChild(document.createTextNode("Proof Load (N)"));

    const uts = document.createElement("span");
    uts.className = "est-cell-uts";
    uts.textContent = "UTS Load (N)";
    cell.appendChild(uts);

    return cell;
  }

  function legendItem(swatchClass, text) {
    const item = document.createElement("span");
    item.className = "est-legend-item";

    const swatch = document.createElement("span");
    swatch.className = `est-legend-swatch ${swatchClass}`;
    item.appendChild(swatch);

    item.appendChild(document.createTextNode(text));
    return item;
  }

  function renderMessage() {
    messageEl.textContent =
      force === null
        ? "Enter force per bolt above to show size recommendation."
        : "";
  }

  // --- Controls ---

  function setLoadCase(key) {
    loadCase = screwStrengthLoadCases.find((entry) => entry.key === key) || loadCase;
    localStorage.setItem(LOAD_CASE_STORAGE_KEY, loadCase.key);
    syncPickers();
    renderTable();
  }

  function setMethod(key) {
    method =
      screwStrengthTighteningMethods.find((entry) => entry.key === key) || method;
    localStorage.setItem(METHOD_STORAGE_KEY, method.key);
    syncPickers();
    renderTable();
  }

  function persistGrades() {
    localStorage.setItem(
      GRADES_STORAGE_KEY,
      JSON.stringify(screwStrengthGrades.map((g) => g.key).filter((k) => shownGrades.has(k)))
    );
  }

  function setGradeShown(key, shown) {
    if (shown) shownGrades.add(key);
    else shownGrades.delete(key);
    persistGrades();
    renderTable();
  }

  // "Show common": tick only the everyday high-strength classes, untick the
  // rest, and sync the checkboxes to match.
  function showCommonGrades() {
    shownGrades.clear();
    EMPHASIZED_GRADES.forEach((key) => shownGrades.add(key));
    gradeTogglesEl.querySelectorAll(".est-grade-toggle").forEach((label) => {
      const input = label.querySelector("input");
      if (input) input.checked = shownGrades.has(label.dataset.key);
    });
    persistGrades();
    renderTable();
  }

  function setShowUts(shown) {
    showUts = shown;
    if (shown) localStorage.setItem(UTS_STORAGE_KEY, "1");
    else localStorage.removeItem(UTS_STORAGE_KEY);
    renderTable();
  }

  function setShowCursed(shown) {
    showCursed = shown;
    if (shown) localStorage.setItem(CURSED_STORAGE_KEY, "1");
    else localStorage.removeItem(CURSED_STORAGE_KEY);
    renderTable();
  }

  function setForce(raw) {
    const parsed = Number(raw);
    force = raw !== "" && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    if (force === null) localStorage.removeItem(FORCE_STORAGE_KEY);
    else localStorage.setItem(FORCE_STORAGE_KEY, String(force));
    renderTable();
  }

  buildLoadCases();
  buildMethods();
  buildGradeToggles();
  buildNotes();

  if (force !== null) forceEl.value = String(force);
  forceEl.addEventListener("input", () => setForce(forceEl.value));

  forceClearEl.addEventListener("click", () => {
    forceEl.value = "";
    setForce("");
    forceEl.focus();
  });

  gradeCommonEl.addEventListener("click", showCommonGrades);

  utsToggleEl.checked = showUts;
  utsToggleEl.addEventListener("change", () => setShowUts(utsToggleEl.checked));

  cursedToggleEl.checked = showCursed;
  cursedToggleEl.addEventListener("change", () => setShowCursed(cursedToggleEl.checked));

  syncPickers();
  renderTable();
})();
