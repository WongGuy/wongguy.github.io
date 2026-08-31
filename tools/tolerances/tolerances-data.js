// Reference data for the ISO 2768-1 general (unindicated) tolerances page.
// EDITING THIS TABLE: the toleranceTables array is generated — don't hand-edit
// it. It's produced by scripts/generate_tolerances_data.py from the workbook
// in assets/standards/ISO/tolerances/ (ISO 2768-1:1989 Tables 1-3). To add,
// remove, or correct a value, edit the workbook and rerun
// `python scripts/generate_tolerances_data.py`.
//
// SHAPE: one entry per table in the standard, each with the same structure so
// tolerances-app.js renders all three from one code path:
//
//   key         stable identity ("linear" / "brokenEdges" / "angular"),
//               also the anchor for any future per-table control/state
//   number      the "Table N" it is in the standard
//   label       short name for a control or heading
//   title       the standard's own table title
//   unitNote    e.g. "Values in millimetres". Read from the workbook, but a
//               `unitNote` in TABLE_SPECS in the generator script overrides it
//               (Table 3's is set there — the workbook leaves it blank).
//   rangeHeader the banner spanning the range columns. Not from the workbook —
//               a fixed per-table caption hardcoded in TABLE_SPECS in the
//               generator script; reword it there.
//   ranges      the basic-size / length ranges as numeric bounds, in order.
//               Each is { min, max, minInclusive, maxInclusive }; a null bound
//               is an open end ("over 6" -> max null; "up to 10" -> min null).
//               "over X" is exclusive, "up to Y" inclusive. tolerances-app.js
//               renders each as a concise interval label, e.g. "(30 - 120]".
//   classes     one row per tolerance class, each:
//                 designation   "f" / "m" / "c" / "v"
//                 description   "fine" / "medium" / "coarse" / "very coarse"
//                 deviations    one permissible deviation per range, in the
//                               same order as `ranges`, or null where the
//                               standard gives none. Plain numbers: every
//                               deviation is symmetric, so the ± is dropped
//                               and only the magnitude is kept. Table 3's
//                               angles are in decimal degrees (0°30' -> 0.5).
//                               tolerances-app.js re-adds the ± when it renders
//                               the cell, and Table 3 has a toggle to show its
//                               values as degrees or back as D°M'.
//
// The standard's parenthetical subtitle, its footnotes, and its citation line
// are read past by the generator and don't appear here - the page shows the
// bare tables. Footnote reference markers are stripped from the range headers
// along with the footnotes.
//
// Classes the standard folds together (Table 2 medium = fine and very coarse
// = coarse; Table 3 medium = fine) are expanded here into full per-class
// rows rather than left blank, so a lookup by class stands on its own.

const toleranceTables = [
  {
    key: "linear",
    number: 1,
    label: "Linear dimensions",
    title: "Permissible deviations for linear dimensions except for broken edges",
    unitNote: "Values in millimetres",
    rangeHeader: "Permissible deviations for basic size range",
    ranges: [
      { min: 0.5, max: 3, minInclusive: true, maxInclusive: true },
      { min: 3, max: 6, minInclusive: false, maxInclusive: true },
      { min: 6, max: 30, minInclusive: false, maxInclusive: true },
      { min: 30, max: 120, minInclusive: false, maxInclusive: true },
      { min: 120, max: 400, minInclusive: false, maxInclusive: true },
      { min: 400, max: 1000, minInclusive: false, maxInclusive: true },
      { min: 1000, max: 2000, minInclusive: false, maxInclusive: true },
      { min: 2000, max: 4000, minInclusive: false, maxInclusive: true },
    ],
    classes: [
      {
        designation: "f",
        description: "fine",
        deviations: [
          0.05,
          0.05,
          0.1,
          0.15,
          0.2,
          0.3,
          0.5,
          null
        ],
      },
      {
        designation: "m",
        description: "medium",
        deviations: [
          0.1,
          0.1,
          0.2,
          0.3,
          0.5,
          0.8,
          1.2,
          2
        ],
      },
      {
        designation: "c",
        description: "coarse",
        deviations: [
          0.2,
          0.3,
          0.5,
          0.8,
          1.2,
          2,
          3,
          4
        ],
      },
      {
        designation: "v",
        description: "very coarse",
        deviations: [
          null,
          0.5,
          1,
          1.5,
          2.5,
          4,
          6,
          8
        ],
      },
    ],
  },
  {
    key: "brokenEdges",
    number: 2,
    label: "Broken edges",
    title: "Permissible deviations for broken edges (external radii and chamfer heights)",
    unitNote: "Values in millimetres",
    rangeHeader: "Permissible deviations for basic size range",
    ranges: [
      { min: 0.5, max: 3, minInclusive: true, maxInclusive: true },
      { min: 3, max: 6, minInclusive: false, maxInclusive: true },
      { min: 6, max: null, minInclusive: false, maxInclusive: null },
    ],
    classes: [
      {
        designation: "f",
        description: "fine",
        deviations: [
          0.2,
          0.5,
          1
        ],
      },
      {
        designation: "m",
        description: "medium",
        deviations: [
          0.2,
          0.5,
          1
        ],
      },
      {
        designation: "c",
        description: "coarse",
        deviations: [
          0.4,
          1,
          2
        ],
      },
      {
        designation: "v",
        description: "very coarse",
        deviations: [
          0.4,
          1,
          2
        ],
      },
    ],
  },
  {
    key: "angular",
    number: 3,
    label: "Angular dimensions",
    title: "Permissible deviations of angular dimensions",
    unitNote: "Side Length in mm",
    rangeHeader: "Permissible deviations for ranges of lengths (shorter side)",
    ranges: [
      { min: null, max: 10, minInclusive: null, maxInclusive: true },
      { min: 10, max: 50, minInclusive: false, maxInclusive: true },
      { min: 50, max: 120, minInclusive: false, maxInclusive: true },
      { min: 120, max: 400, minInclusive: false, maxInclusive: true },
      { min: 400, max: null, minInclusive: false, maxInclusive: null },
    ],
    classes: [
      {
        designation: "f",
        description: "fine",
        deviations: [
          1,
          0.5,
          0.333333,
          0.166667,
          0.083333
        ],
      },
      {
        designation: "m",
        description: "medium",
        deviations: [
          1,
          0.5,
          0.333333,
          0.166667,
          0.083333
        ],
      },
      {
        designation: "c",
        description: "coarse",
        deviations: [
          1.5,
          1,
          0.5,
          0.25,
          0.166667
        ],
      },
      {
        designation: "v",
        description: "very coarse",
        deviations: [
          3,
          2,
          1,
          0.5,
          0.333333
        ],
      },
    ],
  }
];
