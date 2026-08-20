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
// size gets "-" placeholders. Each of those objects also carries derived
// `nominalDiameter` and `threadPitch` fields for display at the top of that
// standard's spec panel.

const nutData = [
  {
    size: "M1.6",
    diameter: "1.6",
    pitch: "0.35",
    STD: { nominalDiameter: "1.6", threadPitch: "0.35", circumscribedDiam: "3.41", nutWidth: "3.2", nutHeight: "1.3" },
    TALL: { nominalDiameter: "-", threadPitch: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    THIN: { nominalDiameter: "-", threadPitch: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    FLANGED: { nominalDiameter: "-", threadPitch: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M2",
    diameter: "2.0",
    pitch: "0.40",
    STD: { nominalDiameter: "2.0", threadPitch: "0.40", circumscribedDiam: "4.32", nutWidth: "4.0", nutHeight: "1.6" },
    TALL: { nominalDiameter: "-", threadPitch: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    THIN: { nominalDiameter: "-", threadPitch: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    FLANGED: { nominalDiameter: "-", threadPitch: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M2.5",
    diameter: "2.5",
    pitch: "0.45",
    STD: { nominalDiameter: "2.5", threadPitch: "0.45", circumscribedDiam: "5.45", nutWidth: "5.0", nutHeight: "2.0" },
    TALL: { nominalDiameter: "-", threadPitch: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    THIN: { nominalDiameter: "-", threadPitch: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    FLANGED: { nominalDiameter: "-", threadPitch: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M3",
    diameter: "3.0",
    pitch: "0.50",
    STD: { nominalDiameter: "3.0", threadPitch: "0.50", circumscribedDiam: "6.01", nutWidth: "5.5", nutHeight: "2.4" },
    TALL: { nominalDiameter: "-", threadPitch: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    THIN: { nominalDiameter: "-", threadPitch: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    FLANGED: { nominalDiameter: "-", threadPitch: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M4",
    diameter: "4.0",
    pitch: "0.70",
    STD: { nominalDiameter: "4.0", threadPitch: "0.70", circumscribedDiam: "7.66", nutWidth: "7.0", nutHeight: "3.2" },
    TALL: { nominalDiameter: "-", threadPitch: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    THIN: { nominalDiameter: "-", threadPitch: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" },
    FLANGED: { nominalDiameter: "-", threadPitch: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M5",
    diameter: "5.0",
    pitch: "0.80",
    STD: { nominalDiameter: "5.0", threadPitch: "0.80", circumscribedDiam: "8.79", nutWidth: "8.0", nutHeight: "4.7" },
    TALL: { nominalDiameter: "5.0", threadPitch: "0.80", circumscribedDiam: "8.79", nutWidth: "8.0", nutHeight: "5.1" },
    THIN: { nominalDiameter: "5.0", threadPitch: "0.80", circumscribedDiam: "8.79", nutWidth: "8.0", nutHeight: "2.7" },
    FLANGED: { nominalDiameter: "5.0", threadPitch: "0.80", flangeDiam: "11.80", circumscribedDiam: "8.79", nutWidth: "8.0", nutHeight: "5.0" }
  },
  {
    size: "M6",
    diameter: "6.0",
    pitch: "1.00",
    STD: { nominalDiameter: "6.0", threadPitch: "1.00", circumscribedDiam: "11.05", nutWidth: "10.0", nutHeight: "5.2" },
    TALL: { nominalDiameter: "6.0", threadPitch: "1.00", circumscribedDiam: "11.05", nutWidth: "10.0", nutHeight: "5.7" },
    THIN: { nominalDiameter: "6.0", threadPitch: "1.00", circumscribedDiam: "11.05", nutWidth: "10.0", nutHeight: "3.2" },
    FLANGED: { nominalDiameter: "6.0", threadPitch: "1.00", flangeDiam: "14.20", circumscribedDiam: "11.05", nutWidth: "10.0", nutHeight: "6.0" }
  },
  {
    size: "M8",
    diameter: "8.0",
    pitch: "1.25",
    STD: { nominalDiameter: "8.0", threadPitch: "1.25", circumscribedDiam: "14.38", nutWidth: "13.0", nutHeight: "6.8" },
    TALL: { nominalDiameter: "8.0", threadPitch: "1.25", circumscribedDiam: "14.38", nutWidth: "13.0", nutHeight: "7.5" },
    THIN: { nominalDiameter: "8.0", threadPitch: "1.25", circumscribedDiam: "14.38", nutWidth: "13.0", nutHeight: "4.0" },
    FLANGED: { nominalDiameter: "8.0", threadPitch: "1.25", flangeDiam: "17.90", circumscribedDiam: "14.38", nutWidth: "13.0", nutHeight: "8.0" }
  },
  {
    size: "M10",
    diameter: "10.0",
    pitch: "1.50",
    STD: { nominalDiameter: "10.0", threadPitch: "1.50", circumscribedDiam: "17.77", nutWidth: "16.0", nutHeight: "8.4" },
    TALL: { nominalDiameter: "10.0", threadPitch: "1.50", circumscribedDiam: "17.77", nutWidth: "16.0", nutHeight: "9.3" },
    THIN: { nominalDiameter: "10.0", threadPitch: "1.50", circumscribedDiam: "17.77", nutWidth: "16.0", nutHeight: "5.0" },
    FLANGED: { nominalDiameter: "10.0", threadPitch: "1.50", flangeDiam: "21.80", circumscribedDiam: "16.64", nutWidth: "15.0", nutHeight: "10.0" }
  },
  {
    size: "M12",
    diameter: "12.0",
    pitch: "1.75",
    STD: { nominalDiameter: "12.0", threadPitch: "1.75", circumscribedDiam: "20.03", nutWidth: "18.0", nutHeight: "10.8" },
    TALL: { nominalDiameter: "12.0", threadPitch: "1.75", circumscribedDiam: "20.03", nutWidth: "18.0", nutHeight: "12" },
    THIN: { nominalDiameter: "12.0", threadPitch: "1.75", circumscribedDiam: "20.03", nutWidth: "18.0", nutHeight: "6.0" },
    FLANGED: { nominalDiameter: "12.0", threadPitch: "1.75", flangeDiam: "26.00", circumscribedDiam: "20.03", nutWidth: "18.0", nutHeight: "12.0" }
  },
  {
    size: "M16",
    diameter: "16.0",
    pitch: "2.00",
    STD: { nominalDiameter: "16.0", threadPitch: "2.00", circumscribedDiam: "26.75", nutWidth: "24.0", nutHeight: "14.8" },
    TALL: { nominalDiameter: "16.0", threadPitch: "2.00", circumscribedDiam: "26.75", nutWidth: "24.0", nutHeight: "16.4" },
    THIN: { nominalDiameter: "16.0", threadPitch: "2.00", circumscribedDiam: "26.75", nutWidth: "24.0", nutHeight: "8.0" },
    FLANGED: { nominalDiameter: "16.0", threadPitch: "2.00", flangeDiam: "34.50", circumscribedDiam: "26.75", nutWidth: "24.0", nutHeight: "16.0" }
  },
  {
    size: "M20",
    diameter: "20.0",
    pitch: "2.50",
    STD: { nominalDiameter: "20.0", threadPitch: "2.50", circumscribedDiam: "32.95", nutWidth: "30.0", nutHeight: "18.0" },
    TALL: { nominalDiameter: "20.0", threadPitch: "2.50", circumscribedDiam: "32.95", nutWidth: "30.0", nutHeight: "20.3" },
    THIN: { nominalDiameter: "20.0", threadPitch: "2.50", circumscribedDiam: "32.95", nutWidth: "30.0", nutHeight: "10.0" },
    FLANGED: { nominalDiameter: "20.0", threadPitch: "2.50", flangeDiam: "42.80", circumscribedDiam: "32.95", nutWidth: "30.0", nutHeight: "20.0" }
  },
  {
    size: "M24",
    diameter: "24.0",
    pitch: "3.00",
    STD: { nominalDiameter: "24.0", threadPitch: "3.00", circumscribedDiam: "39.55", nutWidth: "36.0", nutHeight: "21.5" },
    TALL: { nominalDiameter: "24.0", threadPitch: "3.00", circumscribedDiam: "39.55", nutWidth: "36.0", nutHeight: "23.9" },
    THIN: { nominalDiameter: "24.0", threadPitch: "3.00", circumscribedDiam: "39.55", nutWidth: "36.0", nutHeight: "12.0" },
    FLANGED: { nominalDiameter: "-", threadPitch: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  },
  {
    size: "M30",
    diameter: "30.0",
    pitch: "3.50",
    STD: { nominalDiameter: "30.0", threadPitch: "3.50", circumscribedDiam: "50.85", nutWidth: "46.0", nutHeight: "25.6" },
    TALL: { nominalDiameter: "30.0", threadPitch: "3.50", circumscribedDiam: "50.85", nutWidth: "46.0", nutHeight: "28.6" },
    THIN: { nominalDiameter: "30.0", threadPitch: "3.50", circumscribedDiam: "50.85", nutWidth: "46.0", nutHeight: "15.0" },
    FLANGED: { nominalDiameter: "-", threadPitch: "-", flangeDiam: "-", circumscribedDiam: "-", nutWidth: "-", nutHeight: "-" }
  }
];

// Labels and units shown in the Standard Nut (ISO 4032) side panel, in
// display order. key must match a field name on the STD sub-object above.
const stdFields = [
  { key: "nominalDiameter",   label: "Nominal Thread Diameter", unit: "mm" },
  { key: "threadPitch",       label: "Thread Pitch",        unit: "mm" },
  { key: "nutWidth",          label: "Width Across Flats",  unit: "mm" },
  { key: "nutHeight",         label: "Nut Height",          unit: "mm" },
  { key: "circumscribedDiam", label: "Across Corners Dist", unit: "mm" },
];

// Labels and units shown in the Tall Nut (ISO 4033) side panel, in display
// order. key must match a field name on the TALL sub-object above.
const tallFields = [
  { key: "nominalDiameter",   label: "Nominal Thread Diameter", unit: "mm" },
  { key: "threadPitch",       label: "Thread Pitch",        unit: "mm" },
  { key: "nutWidth",          label: "Width Across Flats",  unit: "mm" },
  { key: "nutHeight",         label: "Nut Height",          unit: "mm" },
  { key: "circumscribedDiam", label: "Across Corners Dist", unit: "mm" },
];

// Labels and units shown in the Thin Nut (ISO 4035) side panel, in display
// order. key must match a field name on the THIN sub-object above.
const thinFields = [
  { key: "nominalDiameter",   label: "Nominal Thread Diameter", unit: "mm" },
  { key: "threadPitch",       label: "Thread Pitch",        unit: "mm" },
  { key: "nutWidth",          label: "Width Across Flats",  unit: "mm" },
  { key: "nutHeight",         label: "Nut Height",          unit: "mm" },
  { key: "circumscribedDiam", label: "Across Corners Dist", unit: "mm" },
];

// Labels and units shown in the Flanged Nut (ISO 4161) side panel, in
// display order. key must match a field name on the FLANGED sub-object
// above.
const flangedFields = [
  { key: "nominalDiameter",   label: "Nominal Thread Diameter", unit: "mm" },
  { key: "threadPitch",       label: "Thread Pitch",        unit: "mm" },
  { key: "nutWidth",          label: "Width Across Flats",  unit: "mm" },
  { key: "nutHeight",         label: "Nut Height",          unit: "mm" },
  { key: "circumscribedDiam", label: "Across Corners Dist", unit: "mm" },
  { key: "flangeDiam",        label: "Flange Diam.",        unit: "mm" },
];
