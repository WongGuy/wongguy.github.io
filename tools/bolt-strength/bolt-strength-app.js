// DOM logic for bolt-size-estimation.html: the force-per-bolt input, the
// load condition and tightening method pickers, the load table, and the
// property class column toggles. Reads bolt-strength-data.js — see that file
// for the schema and for how to regenerate the ISO 898-1 half of it.
//
// How the table is marked up:
//
//   Within each property class column, the smallest thread whose tabulated
//   load reaches the force per bolt is bolded and filled yellow — that's the
//   bare minimum before corrections, with no margin at all. The load
//   condition and the tightening method each add a
//   number of steps (see boltStrengthLoadCases / boltStrengthTighteningMethods);
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
//   The row label is always a merged "Size" cell plus a per-row "Pitch" cell.
//   "Include Fine Pitches" just brings the fine-thread rows in below their
//   coarse sibling (the Size cell then spans them); with it off each size is a
//   lone coarse row. The estimate steps over sizes, not individual threads: a
//   size carries the load if its strongest pitch does. The bold/highlight then
//   lands only on the pitch rows that individually carry the force, not the
//   whole size group — so when a size's coarse thread falls short while a finer
//   pitch clears it, the coarse row stays unmarked and the coarse mark moves to
//   the next size up (which steps down from there like any other). Row trimming
//   keeps whole size groups.
//
// Only ISO 262 first-choice nominal diameters are ever shown; the second-choice
// sizes are filtered out and there's no control to bring them back.
//
// Six bits of state are remembered in localStorage between visits: the force
// per bolt, the selected load condition, the selected tightening method, which
// property class columns are shown, whether the "Show UTS Load" toggle adds the
// minimum ultimate tensile load as a second value per cell, and whether
// "Include Fine Pitches" is on. Columns are keyed by the class designations in
// bolt-strength-data.js.
//
// The loads the tool works from are 75% of the ISO 898-1 proof loads, not the
// full proof loads — a common preload ceiling, and the margin this rough
// estimate leans on. The derate is applied in loadOf() and so flows into the
// displayed cell values, the bolded minimum, and the highlighted pick alike.
//
// The estimate (bolded minimum, highlighted pick, trimmed row window) always
// tracks those 75%-of-proof loads; "Show UTS Load" adds the full ISO 898-1
// minimum ultimate tensile load as reference only and doesn't move anything.
// The two values in a cell carry no labels of their own — the legend's sample
// cell names them once instead.
//
// The load type (proof / minimum ultimate tensile) and the thread series
// (coarse / fine) are read from their lists in the data file rather than
// hardcoded here, so today's single choice of each is a default, not an
// assumption baked into the table build.

(function () {
  const forceEl = document.getElementById("force-input");
  const forceClearEl = document.getElementById("force-clear");
  const utsToggleEl = document.getElementById("uts-toggle");
  const fineToggleEl = document.getElementById("fine-toggle");
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

  const FORCE_STORAGE_KEY = "boltEstForce";
  const LOAD_CASE_STORAGE_KEY = "boltEstLoadCase";
  const METHOD_STORAGE_KEY = "boltEstMethod";
  const GRADES_STORAGE_KEY = "boltEstGrades";
  const UTS_STORAGE_KEY = "boltEstShowUts";
  const FINE_STORAGE_KEY = "boltEstShowFine";

  // ISO 262 second-choice nominal diameters. Always filtered out of the table.
  const SECOND_CHOICE_DIAMETERS = new Set([3.5, 7, 14, 18, 22, 27, 33, 39]);

  // Property classes drawn bold in the column picker — the everyday high-strength
  // choices, so they read first in the list.
  const EMPHASIZED_GRADES = new Set(["8.8", "10.9", "12.9"]);

  const numberFormat = new Intl.NumberFormat("en-US");

  // The tool sizes bolts against 75% of the ISO 898-1 proof load rather than
  // the full proof load — a common preload ceiling. Applied to the proof
  // values only (see loadOf); the optional "Show UTS Load" column still shows
  // the full ISO 898-1 minimum ultimate tensile load.
  const PROOF_LOAD_FACTOR = 0.75;
  const PROOF_LOAD_PERCENT = Math.round(PROOF_LOAD_FACTOR * 100);

  function deratedProof(value) {
    const scaled = value * PROOF_LOAD_FACTOR;
    // Round to 3 significant figures, matching the ISO tables' precision.
    const step = Math.pow(10, Math.floor(Math.log10(scaled)) - 2);
    return Math.round(scaled / step) * step;
  }

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
      if (!Array.isArray(stored)) return defaultKeys(boltStrengthGrades);
      const all = boltStrengthGrades.map((g) => g.key);
      return new Set(stored.filter((key) => all.indexOf(key) !== -1));
    } catch (err) {
      return defaultKeys(boltStrengthGrades);
    }
  }

  function storedForce() {
    const stored = Number(localStorage.getItem(FORCE_STORAGE_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  }

  const loadType = firstDefault(boltStrengthLoadTypes);
  const shownSeries = defaultKeys(boltStrengthSeries);
  const shownGrades = storedGrades();
  let loadCase = storedChoice(LOAD_CASE_STORAGE_KEY, boltStrengthLoadCases);
  let method = storedChoice(METHOD_STORAGE_KEY, boltStrengthTighteningMethods);
  let force = storedForce();
  let showUts = localStorage.getItem(UTS_STORAGE_KEY) === "1";
  let showFine = localStorage.getItem(FINE_STORAGE_KEY) === "1";

  // The non-default thread series (today just "fine"). "Include Fine Pitches"
  // adds them to / removes them from the shown-series set; the table build
  // itself still just reads that set.
  const FINE_SERIES = boltStrengthSeries
    .filter((entry) => !entry.shownByDefault)
    .map((entry) => entry.key);

  function syncSeries() {
    FINE_SERIES.forEach((key) => {
      if (showFine) shownSeries.add(key);
      else shownSeries.delete(key);
    });
  }

  // The minimum-ultimate-tensile load type, shown as a second value per cell
  // when "Show UTS Load" is ticked. The estimate itself always tracks proof
  // loads (loadType); this is reference only.
  const utsType = boltStrengthLoadTypes.find((t) => t.key === "tensile");

  // --- Data access ---

  function visibleThreads() {
    return boltStrengthThreads.filter(
      (thread) =>
        shownSeries.has(thread.series) &&
        !SECOND_CHOICE_DIAMETERS.has(thread.diameter)
    );
  }

  function visibleGrades() {
    return boltStrengthGrades.filter((grade) => shownGrades.has(grade.key));
  }

  // The tabulated load for one thread in one class, or null where ISO 898-1
  // doesn't tabulate that combination.
  function loadOf(thread, gradeKey) {
    const values = thread.loads[loadType.key];
    const value = values ? values[gradeKey] : undefined;
    if (typeof value !== "number") return null;
    return loadType.key === "proof" ? deratedProof(value) : value;
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

  // --- Size groups ---

  // Consecutive visible threads sharing a nominal size, as
  // [{ size, indices: [threadIndex, ...] }]. With "Include Fine Pitches" off
  // every group holds a single thread, so the stepping below is unchanged.
  // Threads are pre-sorted by diameter then pitch, so same-size rows are
  // always adjacent and the first index of a group is its coarsest pitch.
  function groupThreads(threads) {
    const groups = [];
    threads.forEach((thread, index) => {
      const last = groups[groups.length - 1];
      if (showFine && last && last.size === thread.size) {
        last.indices.push(index);
      } else {
        groups.push({ size: thread.size, indices: [index] });
      }
    });
    return groups;
  }

  // The load a size offers a class: the strongest pitch of that size the class
  // is tabulated at, or null if the class isn't tabulated at any of them. With
  // fine pitches off this is just the single thread's load.
  function groupLoad(threads, group, gradeKey) {
    let best = null;
    group.indices.forEach((index) => {
      const value = loadOf(threads[index], gradeKey);
      if (value !== null && (best === null || value > best)) best = value;
    });
    return best;
  }

  // --- The estimate ---

  // For one class column: which size group is the bare minimum, and which the
  // steps land on. All four fields are indices into `groups`; -1 means "none".
  //
  // `rows` lists only the groups this class is tabulated at, so the steps
  // count sizes that actually exist in the column. Loads climb with size, so
  // the first group at or above the force is also the smallest one.
  //
  // A size group qualifies on its strongest pitch. With "Include Fine Pitches"
  // on, that can leave the group's coarse thread sitting below the force while
  // a finer pitch clears it — a "split". The coarse thread's own minimum is
  // then the next tabulated size up, and its estimate steps from there, so the
  // split gets its own `coarseMinGroup` / `coarsePickGroup` (the marks the
  // renderer puts on the coarse row instead of the whole-group ones).
  function computeColumn(threads, groups, grade, steps) {
    const rows = [];
    groups.forEach((group, index) => {
      if (groupLoad(threads, group, grade.key) !== null) rows.push(index);
    });

    const blank = {
      minGroup: -1,
      pickGroup: -1,
      coarseMinGroup: -1,
      coarsePickGroup: -1,
      unsupported: false,
    };
    if (force === null || !rows.length) return blank;

    const position = rows.findIndex(
      (index) => groupLoad(threads, groups[index], grade.key) >= force
    );

    // Either nothing in the class carries the load at all, or the steps run
    // off the bottom of it. Both mean the class has no size to recommend, so
    // no cell is marked and the column header carries the answer.
    if (position === -1 || position + steps > rows.length - 1) {
      return Object.assign({}, blank, { unsupported: true });
    }

    const minGroup = rows[position];
    const coarseLoad = loadOf(threads[groups[minGroup].indices[0]], grade.key);
    // Split only when the coarse thread is tabulated here, falls short, and
    // there's a next size up to move it to. Off the bottom of the column the
    // coarse pick is simply dropped — the finer pitches still carry the answer.
    const split =
      showFine &&
      coarseLoad !== null &&
      coarseLoad < force &&
      position + 1 < rows.length;

    return {
      minGroup: minGroup,
      pickGroup: rows[position + steps],
      coarseMinGroup: split ? rows[position + 1] : -1,
      coarsePickGroup:
        split && position + 1 + steps <= rows.length - 1
          ? rows[position + 1 + steps]
          : -1,
      unsupported: false,
    };
  }

  // One size group of context above the first bolded group and one below the
  // last estimate. With nothing marked (no force yet, or nothing big enough)
  // every group is shown instead.
  function groupWindow(groups, columns) {
    const mins = [];
    const picks = [];
    columns.forEach((c) => {
      if (c.minGroup >= 0) mins.push(c.minGroup);
      if (c.coarseMinGroup >= 0) mins.push(c.coarseMinGroup);
      if (c.pickGroup >= 0) picks.push(c.pickGroup);
      if (c.coarsePickGroup >= 0) picks.push(c.coarsePickGroup);
    });
    if (!mins.length) return { first: 0, last: groups.length - 1 };
    return {
      first: Math.max(0, Math.min.apply(null, mins) - 1),
      last: Math.min(groups.length - 1, Math.max.apply(null, picks) + 1),
    };
  }

  // --- Rendering ---

  function stepLabel(steps) {
    return `+${steps} ${steps === 1 ? "step" : "steps"}`;
  }

  function buildLoadCases() {
    boltStrengthLoadCases.forEach((entry) => {
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
    boltStrengthTighteningMethods.forEach((entry) => {
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
    boltStrengthGrades.forEach((grade) => {
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
    const notes = (boltStrengthNotes[loadType.key] || []).slice();
    if (loadType.key === "proof") {
      notes.unshift(
        `Loads shown are ${PROOF_LOAD_PERCENT}% of the ISO 898-1 proof load; ` +
          "the notes below quote the full ISO 898-1 values."
      );
    }
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
    const groups = groupThreads(threads);
    const grades = visibleGrades();
    const steps = totalSteps();

    const shownLabel =
      loadType.key === "proof"
        ? `${PROOF_LOAD_PERCENT}% ${loadType.label}`
        : loadType.label;
    tableTitleEl.textContent = `${titleCase(shownLabel)} (N)`;
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

    const columns = grades.map((grade) => computeColumn(threads, groups, grade, steps));
    const bounds = groupWindow(groups, columns);

    const head = document.createElement("thead");

    // Grouping row: "Thread" over Size + Pitch, "Strength Class" over the class
    // columns.
    const groupRow = document.createElement("tr");
    const threadHead = headerCell("Thread");
    threadHead.scope = "colgroup";
    threadHead.colSpan = 2;
    threadHead.classList.add("est-col-divide");
    groupRow.appendChild(threadHead);
    const classHead = headerCell("Strength Class");
    classHead.scope = "colgroup";
    classHead.colSpan = grades.length;
    groupRow.appendChild(classHead);
    head.appendChild(groupRow);

    const headRow = document.createElement("tr");
    headRow.appendChild(headerCell("Size"));
    const pitchHead = headerCell("Pitch");
    pitchHead.classList.add("est-col-divide");
    headRow.appendChild(pitchHead);
    grades.forEach((grade, column) =>
      headRow.appendChild(headerCell(grade.label, columns[column].unsupported))
    );
    head.appendChild(headRow);
    tableEl.appendChild(head);

    const body = document.createElement("tbody");
    for (let g = bounds.first; g <= bounds.last; g++) {
      const group = groups[g];

      group.indices.forEach((threadIndex, rowInGroup) => {
        const thread = threads[threadIndex];
        const row = document.createElement("tr");
        // The heavier rule between size groups only earns its place when a
        // group can span multiple pitch rows — i.e. with fine pitches shown.
        if (showFine && rowInGroup === 0) row.classList.add("est-group-start");

        if (rowInGroup === 0) {
          const sizeCell = document.createElement("td");
          sizeCell.className = "est-row-label est-row-size";
          sizeCell.rowSpan = group.indices.length;
          sizeCell.textContent = group.size;
          row.appendChild(sizeCell);
        }
        const pitchCell = document.createElement("td");
        pitchCell.className = "est-row-pitch est-col-divide";
        pitchCell.textContent = String(thread.pitch);
        row.appendChild(pitchCell);

        grades.forEach((grade, column) => {
          const col = columns[column];
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
          // The mark only belongs on pitch rows that individually carry the
          // force. A size group qualifies on its strongest pitch, so with fine
          // pitches shown its coarse row (index 0 of the group) can sit below
          // the force while a finer pitch clears it: that coarse row stays
          // unmarked and the mark moves to the coarse thread one size up
          // (coarseMinGroup / coarsePickGroup). With fine pitches off every
          // group is a lone coarse row and the split never arises.
          const carries = value !== null && force !== null && value >= force;
          const coarseRow = rowInGroup === 0;
          const minTarget =
            coarseRow && col.coarseMinGroup >= 0 ? col.coarseMinGroup : col.minGroup;
          const pickTarget =
            coarseRow && col.coarsePickGroup >= 0 ? col.coarsePickGroup : col.pickGroup;
          if (carries && g === minTarget) cell.classList.add("est-cell--min");
          if (carries && g === pickTarget) cell.classList.add("est-cell--pick");
          row.appendChild(cell);
        });

        body.appendChild(row);
      });
    }
    tableEl.appendChild(body);

    renderLegend(
      columns.some((c) => c.minGroup >= 0 && c.minGroup !== c.pickGroup),
      columns.some((c) => c.pickGroup >= 0),
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
    cell.appendChild(
      document.createTextNode(`${PROOF_LOAD_PERCENT}% Proof Load (N)`)
    );

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
    loadCase = boltStrengthLoadCases.find((entry) => entry.key === key) || loadCase;
    localStorage.setItem(LOAD_CASE_STORAGE_KEY, loadCase.key);
    syncPickers();
    renderTable();
  }

  function setMethod(key) {
    method =
      boltStrengthTighteningMethods.find((entry) => entry.key === key) || method;
    localStorage.setItem(METHOD_STORAGE_KEY, method.key);
    syncPickers();
    renderTable();
  }

  function persistGrades() {
    localStorage.setItem(
      GRADES_STORAGE_KEY,
      JSON.stringify(boltStrengthGrades.map((g) => g.key).filter((k) => shownGrades.has(k)))
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

  function setShowFine(shown) {
    showFine = shown;
    if (shown) localStorage.setItem(FINE_STORAGE_KEY, "1");
    else localStorage.removeItem(FINE_STORAGE_KEY);
    syncSeries();
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

  fineToggleEl.checked = showFine;
  fineToggleEl.addEventListener("change", () => setShowFine(fineToggleEl.checked));

  syncSeries();
  syncPickers();
  renderTable();
})();
