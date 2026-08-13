// Reference data for the ISO metric hex nut chart.
// EDITING THIS TABLE: the nutData array is generated — don't hand-edit it.
// It's produced by scripts/generate_nut_data.py from the standards CSVs in
// assets/standards/ISO/nut/ (ISO 4032 standard nut, ISO 4033 tall nut,
// ISO 4035 thin nut, ISO 4161 flanged nut). To add, remove, or correct a
// value, edit the relevant CSV and rerun `python scripts/generate_nut_data.py`.
// Which sizes appear at all is controlled by the "Include?" row in the
// ISO 4032 CSV. Field names (the object keys) are what show up as row
// labels in nut-app.js, so keep them matching between the two files if you
// change the render logic.
//
// STD/TALL/THIN/FLANGED: each entry carries nested `STD`, `TALL`, `THIN`,
// and `FLANGED` objects with per-standard nut dimensions (ISO 4032, 4033,
// 4035, 4161 respectively), each rendered in its own chart row below the
// thread row using the same slider index. A standard not offered at a given
// size gets "-" placeholders. Each of those objects also carries a derived
// `nominalThread` field (e.g. "M6x1.00", diameter x pitch) for display at
// the top of that standard's spec panel.

const nutData = [
  {
    size: "M1.6",
    diameter: "1.6",
    pitch: "0.35",
    STD: { nominalThread: "M1.6x0.35", circumscribedDiam: "3.41", nutWidth: "3.2", nutHeight: "1.3" },
    TALL: { nominalThread: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    THIN: { nominalThread: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    FLANGED: { nominalThread: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M2",
    diameter: "2.0",
    pitch: "0.40",
    STD: { nominalThread: "M2x0.40", circumscribedDiam: "4.32", nutWidth: "4.0", nutHeight: "1.6" },
    TALL: { nominalThread: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    THIN: { nominalThread: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    FLANGED: { nominalThread: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M2.5",
    diameter: "2.5",
    pitch: "0.45",
    STD: { nominalThread: "M2.5x0.45", circumscribedDiam: "5.45", nutWidth: "5.0", nutHeight: "2.0" },
    TALL: { nominalThread: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    THIN: { nominalThread: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    FLANGED: { nominalThread: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M3",
    diameter: "3.0",
    pitch: "0.50",
    STD: { nominalThread: "M3x0.50", circumscribedDiam: "6.01", nutWidth: "5.5", nutHeight: "2.4" },
    TALL: { nominalThread: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    THIN: { nominalThread: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    FLANGED: { nominalThread: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M4",
    diameter: "4.0",
    pitch: "0.70",
    STD: { nominalThread: "M4x0.70", circumscribedDiam: "7.66", nutWidth: "7.0", nutHeight: "3.2" },
    TALL: { nominalThread: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    THIN: { nominalThread: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    FLANGED: { nominalThread: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M5",
    diameter: "5.0",
    pitch: "0.80",
    STD: { nominalThread: "M5x0.80", circumscribedDiam: "8.79", nutWidth: "8.0", nutHeight: "4.7" },
    TALL: { nominalThread: "M5x0.80", circumscribedDiam: "8.79", nutWidth: "8.0", nutHeight: "5.1" },
    THIN: { nominalThread: "M5x0.80", circumscribedDiam: "8.79", nutWidth: "8.0", nutHeight: "2.7" },
    FLANGED: { nominalThread: "M5x0.80", flangeDiam: "11.80", circumscribedDiam: "8.79", nutWidth: "8.0", nutHeight: "5.0" }
  },
  {
    size: "M6",
    diameter: "6.0",
    pitch: "1.00",
    STD: { nominalThread: "M6x1.00", circumscribedDiam: "11.05", nutWidth: "10.0", nutHeight: "5.2" },
    TALL: { nominalThread: "M6x1.00", circumscribedDiam: "11.05", nutWidth: "10.0", nutHeight: "5.7" },
    THIN: { nominalThread: "M6x1.00", circumscribedDiam: "11.05", nutWidth: "10.0", nutHeight: "3.2" },
    FLANGED: { nominalThread: "M6x1.00", flangeDiam: "14.20", circumscribedDiam: "11.05", nutWidth: "10.0", nutHeight: "6.0" }
  },
  {
    size: "M8",
    diameter: "8.0",
    pitch: "1.25",
    STD: { nominalThread: "M8x1.25", circumscribedDiam: "14.38", nutWidth: "13.0", nutHeight: "6.8" },
    TALL: { nominalThread: "M8x1.25", circumscribedDiam: "14.38", nutWidth: "13.0", nutHeight: "7.5" },
    THIN: { nominalThread: "M8x1.25", circumscribedDiam: "14.38", nutWidth: "13.0", nutHeight: "4.0" },
    FLANGED: { nominalThread: "M8x1.25", flangeDiam: "17.90", circumscribedDiam: "14.38", nutWidth: "13.0", nutHeight: "8.0" }
  },
  {
    size: "M10",
    diameter: "10.0",
    pitch: "1.50",
    STD: { nominalThread: "M10x1.50", circumscribedDiam: "17.77", nutWidth: "16.0", nutHeight: "8.4" },
    TALL: { nominalThread: "M10x1.50", circumscribedDiam: "17.77", nutWidth: "16.0", nutHeight: "9.3" },
    THIN: { nominalThread: "M10x1.50", circumscribedDiam: "17.77", nutWidth: "16.0", nutHeight: "5.0" },
    FLANGED: { nominalThread: "M10x1.50", flangeDiam: "21.80", circumscribedDiam: "16.64", nutWidth: "15.0", nutHeight: "10.0" }
  },
  {
    size: "M12",
    diameter: "12.0",
    pitch: "1.75",
    STD: { nominalThread: "M12x1.75", circumscribedDiam: "20.03", nutWidth: "18.0", nutHeight: "10.8" },
    TALL: { nominalThread: "M12x1.75", circumscribedDiam: "20.03", nutWidth: "18.0", nutHeight: "12" },
    THIN: { nominalThread: "M12x1.75", circumscribedDiam: "20.03", nutWidth: "18.0", nutHeight: "6.0" },
    FLANGED: { nominalThread: "M12x1.75", flangeDiam: "26.00", circumscribedDiam: "20.03", nutWidth: "18.0", nutHeight: "12.0" }
  },
  {
    size: "M16",
    diameter: "16.0",
    pitch: "2.00",
    STD: { nominalThread: "M16x2.00", circumscribedDiam: "26.75", nutWidth: "24.0", nutHeight: "14.8" },
    TALL: { nominalThread: "M16x2.00", circumscribedDiam: "26.75", nutWidth: "24.0", nutHeight: "16.4" },
    THIN: { nominalThread: "M16x2.00", circumscribedDiam: "26.75", nutWidth: "24.0", nutHeight: "8.0" },
    FLANGED: { nominalThread: "M16x2.00", flangeDiam: "34.50", circumscribedDiam: "26.75", nutWidth: "24.0", nutHeight: "16.0" }
  },
  {
    size: "M20",
    diameter: "20.0",
    pitch: "2.50",
    STD: { nominalThread: "M20x2.50", circumscribedDiam: "32.95", nutWidth: "30.0", nutHeight: "18.0" },
    TALL: { nominalThread: "M20x2.50", circumscribedDiam: "32.95", nutWidth: "30.0", nutHeight: "20.3" },
    THIN: { nominalThread: "M20x2.50", circumscribedDiam: "32.95", nutWidth: "30.0", nutHeight: "10.0" },
    FLANGED: { nominalThread: "M20x2.50", flangeDiam: "42.80", circumscribedDiam: "32.95", nutWidth: "30.0", nutHeight: "20.0" }
  },
  {
    size: "M24",
    diameter: "24.0",
    pitch: "3.00",
    STD: { nominalThread: "M24x3.00", circumscribedDiam: "39.55", nutWidth: "36.0", nutHeight: "21.5" },
    TALL: { nominalThread: "M24x3.00", circumscribedDiam: "39.55", nutWidth: "36.0", nutHeight: "23.9" },
    THIN: { nominalThread: "M24x3.00", circumscribedDiam: "39.55", nutWidth: "36.0", nutHeight: "12.0" },
    FLANGED: { nominalThread: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M30",
    diameter: "30.0",
    pitch: "3.50",
    STD: { nominalThread: "M30x3.50", circumscribedDiam: "50.85", nutWidth: "46.0", nutHeight: "25.6" },
    TALL: { nominalThread: "M30x3.50", circumscribedDiam: "50.85", nutWidth: "46.0", nutHeight: "28.6" },
    THIN: { nominalThread: "M30x3.50", circumscribedDiam: "50.85", nutWidth: "46.0", nutHeight: "15.0" },
    FLANGED: { nominalThread: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  }
];

// Labels and units shown in the Standard Nut (ISO 4032) side panel, in
// display order. key must match a field name on the STD sub-object above.
const stdFields = [
  { key: "nominalThread",     label: "Nominal Thread" },
  { key: "nutWidth",          label: "Width Across Flats",  unit: "mm" },
  { key: "nutHeight",         label: "Nut Height",          unit: "mm" },
  { key: "circumscribedDiam", label: "Across Corners Dist", unit: "mm" },
];

// Labels and units shown in the Tall Nut (ISO 4033) side panel, in display
// order. key must match a field name on the TALL sub-object above.
const tallFields = [
  { key: "nominalThread",     label: "Nominal Thread" },
  { key: "nutWidth",          label: "Width Across Flats",  unit: "mm" },
  { key: "nutHeight",         label: "Nut Height",          unit: "mm" },
  { key: "circumscribedDiam", label: "Across Corners Dist", unit: "mm" },
];

// Labels and units shown in the Thin Nut (ISO 4035) side panel, in display
// order. key must match a field name on the THIN sub-object above.
const thinFields = [
  { key: "nominalThread",     label: "Nominal Thread" },
  { key: "nutWidth",          label: "Width Across Flats",  unit: "mm" },
  { key: "nutHeight",         label: "Nut Height",          unit: "mm" },
  { key: "circumscribedDiam", label: "Across Corners Dist", unit: "mm" },
];

// Labels and units shown in the Flanged Nut (ISO 4161) side panel, in
// display order. key must match a field name on the FLANGED sub-object
// above.
const flangedFields = [
  { key: "nominalThread",     label: "Nominal Thread" },
  { key: "nutWidth",          label: "Width Across Flats",  unit: "mm" },
  { key: "nutHeight",         label: "Nut Height",          unit: "mm" },
  { key: "circumscribedDiam", label: "Across Corners Dist", unit: "mm" },
  { key: "flangeDiam",        label: "Flange Diam.",        unit: "mm" },
];
