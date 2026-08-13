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
// size gets "-" placeholders.

const nutData = [
  {
    size: "M1.6",
    diameter: "1.6",
    pitch: "0.35",
    STD: { circumscribedDiam: "3.41", nutHeight: "1.3", nutWidth: "3.2" },
    TALL: { circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" },
    THIN: { circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" },
    FLANGED: { flangeDiam: "-", circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" }
  },
  {
    size: "M2",
    diameter: "2.0",
    pitch: "0.40",
    STD: { circumscribedDiam: "4.32", nutHeight: "1.6", nutWidth: "4.0" },
    TALL: { circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" },
    THIN: { circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" },
    FLANGED: { flangeDiam: "-", circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" }
  },
  {
    size: "M2.5",
    diameter: "2.5",
    pitch: "0.45",
    STD: { circumscribedDiam: "5.45", nutHeight: "2.0", nutWidth: "5.0" },
    TALL: { circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" },
    THIN: { circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" },
    FLANGED: { flangeDiam: "-", circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" }
  },
  {
    size: "M3",
    diameter: "3.0",
    pitch: "0.50",
    STD: { circumscribedDiam: "6.01", nutHeight: "2.4", nutWidth: "5.5" },
    TALL: { circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" },
    THIN: { circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" },
    FLANGED: { flangeDiam: "-", circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" }
  },
  {
    size: "M4",
    diameter: "4.0",
    pitch: "0.70",
    STD: { circumscribedDiam: "7.66", nutHeight: "3.2", nutWidth: "7.0" },
    TALL: { circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" },
    THIN: { circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" },
    FLANGED: { flangeDiam: "-", circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" }
  },
  {
    size: "M5",
    diameter: "5.0",
    pitch: "0.80",
    STD: { circumscribedDiam: "8.79", nutHeight: "4.7", nutWidth: "8.0" },
    TALL: { circumscribedDiam: "8.79", nutHeight: "5.1", nutWidth: "8" },
    THIN: { circumscribedDiam: "8.79", nutHeight: "2.7", nutWidth: "8.0" },
    FLANGED: { flangeDiam: "11.80", circumscribedDiam: "8.79", nutHeight: "5.0", nutWidth: "8.0" }
  },
  {
    size: "M6",
    diameter: "6.0",
    pitch: "1.00",
    STD: { circumscribedDiam: "11.05", nutHeight: "5.2", nutWidth: "10.0" },
    TALL: { circumscribedDiam: "11.05", nutHeight: "5.7", nutWidth: "10" },
    THIN: { circumscribedDiam: "11.05", nutHeight: "3.2", nutWidth: "10.0" },
    FLANGED: { flangeDiam: "14.20", circumscribedDiam: "11.05", nutHeight: "6.0", nutWidth: "10.0" }
  },
  {
    size: "M8",
    diameter: "8.0",
    pitch: "1.25",
    STD: { circumscribedDiam: "14.38", nutHeight: "6.8", nutWidth: "13.0" },
    TALL: { circumscribedDiam: "14.38", nutHeight: "7.5", nutWidth: "13" },
    THIN: { circumscribedDiam: "14.38", nutHeight: "4.0", nutWidth: "13.0" },
    FLANGED: { flangeDiam: "17.90", circumscribedDiam: "14.38", nutHeight: "8.0", nutWidth: "13.0" }
  },
  {
    size: "M10",
    diameter: "10.0",
    pitch: "1.50",
    STD: { circumscribedDiam: "17.77", nutHeight: "8.4", nutWidth: "16.0" },
    TALL: { circumscribedDiam: "17.77", nutHeight: "9.3", nutWidth: "16" },
    THIN: { circumscribedDiam: "17.77", nutHeight: "5.0", nutWidth: "16.0" },
    FLANGED: { flangeDiam: "21.80", circumscribedDiam: "16.64", nutHeight: "10.0", nutWidth: "15.0" }
  },
  {
    size: "M12",
    diameter: "12.0",
    pitch: "1.75",
    STD: { circumscribedDiam: "20.03", nutHeight: "10.8", nutWidth: "18.0" },
    TALL: { circumscribedDiam: "20.03", nutHeight: "12", nutWidth: "18" },
    THIN: { circumscribedDiam: "20.03", nutHeight: "6.0", nutWidth: "18.0" },
    FLANGED: { flangeDiam: "26.00", circumscribedDiam: "20.03", nutHeight: "12.0", nutWidth: "18.0" }
  },
  {
    size: "M16",
    diameter: "16.0",
    pitch: "2.00",
    STD: { circumscribedDiam: "26.75", nutHeight: "14.8", nutWidth: "24.0" },
    TALL: { circumscribedDiam: "26.75", nutHeight: "16.4", nutWidth: "24" },
    THIN: { circumscribedDiam: "26.75", nutHeight: "8.0", nutWidth: "24.0" },
    FLANGED: { flangeDiam: "34.50", circumscribedDiam: "26.75", nutHeight: "16.0", nutWidth: "24.0" }
  },
  {
    size: "M20",
    diameter: "20.0",
    pitch: "2.50",
    STD: { circumscribedDiam: "32.95", nutHeight: "18.0", nutWidth: "30.0" },
    TALL: { circumscribedDiam: "32.95", nutHeight: "20.3", nutWidth: "30" },
    THIN: { circumscribedDiam: "32.95", nutHeight: "10.0", nutWidth: "30.0" },
    FLANGED: { flangeDiam: "42.80", circumscribedDiam: "32.95", nutHeight: "20.0", nutWidth: "30.0" }
  },
  {
    size: "M24",
    diameter: "24.0",
    pitch: "3.00",
    STD: { circumscribedDiam: "39.55", nutHeight: "21.5", nutWidth: "36.0" },
    TALL: { circumscribedDiam: "39.55", nutHeight: "23.9", nutWidth: "36" },
    THIN: { circumscribedDiam: "39.55", nutHeight: "12.0", nutWidth: "36.0" },
    FLANGED: { flangeDiam: "-", circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" }
  },
  {
    size: "M30",
    diameter: "30.0",
    pitch: "3.50",
    STD: { circumscribedDiam: "50.85", nutHeight: "25.6", nutWidth: "46.0" },
    TALL: { circumscribedDiam: "50.85", nutHeight: "28.6", nutWidth: "46" },
    THIN: { circumscribedDiam: "50.85", nutHeight: "15.0", nutWidth: "46.0" },
    FLANGED: { flangeDiam: "-", circumscribedDiam: "-", nutHeight: "-", nutWidth: "-" }
  }
];

// Labels and units shown in the Standard Nut (ISO 4032) side panel, in
// display order. key must match a field name on the STD sub-object above.
const stdFields = [
  { key: "nutHeight",         label: "Nut Height - MAX.",          unit: "mm" },
  { key: "nutWidth",          label: "Width Across Flats - MAX.",  unit: "mm" },
  { key: "circumscribedDiam", label: "Circumscribed Diam. - MIN.", unit: "mm" },
];

// Labels and units shown in the Tall Nut (ISO 4033) side panel, in display
// order. key must match a field name on the TALL sub-object above.
const tallFields = [
  { key: "nutHeight",         label: "Nut Height - MAX.",          unit: "mm" },
  { key: "nutWidth",          label: "Width Across Flats - MAX.",  unit: "mm" },
  { key: "circumscribedDiam", label: "Circumscribed Diam. - MIN.", unit: "mm" },
];

// Labels and units shown in the Thin Nut (ISO 4035) side panel, in display
// order. key must match a field name on the THIN sub-object above.
const thinFields = [
  { key: "nutHeight",         label: "Nut Height - MAX.",          unit: "mm" },
  { key: "nutWidth",          label: "Width Across Flats - MAX.",  unit: "mm" },
  { key: "circumscribedDiam", label: "Circumscribed Diam. - MIN.", unit: "mm" },
];

// Labels and units shown in the Flanged Nut (ISO 4161) side panel, in
// display order. key must match a field name on the FLANGED sub-object
// above.
const flangedFields = [
  { key: "nutHeight",         label: "Nut Height - MAX.",          unit: "mm" },
  { key: "nutWidth",          label: "Width Across Flats - MAX.",  unit: "mm" },
  { key: "circumscribedDiam", label: "Circumscribed Diam. - MIN.", unit: "mm" },
  { key: "flangeDiam",        label: "Flange Diam. - MAX.",        unit: "mm" },
];
