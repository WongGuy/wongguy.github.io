// Placeholder reference data for the ISO metric screw thread chart.
// EDITING THIS TABLE: each entry is one major diameter (thread size).
// Add, remove, or change rows here — the page reads this array directly,
// rebuilds the slider's selectable steps, and re-renders the side panel
// automatically. Field names (the object keys) are what show up as row
// labels in data-table.js, so keep them matching between the two files.
//
// Values below are standard ISO 724 dimensions, for placeholder purposes —
// replace/verify against your own source before relying on them.
//
// SUBLABELS: a field's value can be either a single number/string, or an
// object of { sublabel: value } to show several variants under one label.
// clearanceHole below uses this to show Close/Normal/Loose fit classes.
// pitch, tapDrill, and stressArea use it to show Coarse/Fine thread series
// (all sizes), plus ExtraFine from M10 up, where that series exists. The
// panel renders each sublabel as its own line under the field's row — no
// changes to app.js needed for this.
//
// To bold a sublabel (e.g. to call out the default/standard variant), prefix
// its key with "*", e.g. { "*Coarse": 1.0, Fine: 0.75 }. The "*" is stripped
// before display.

const screwData = [
  {
    size: "M1.6",
    pitch: { "*Coarse": "0.35", Fine: "0.2", ExtraFine: "-" },
    tapDrill: { "*Coarse": "1.25", Fine: "1.4", ExtraFine: "-" },
    clearanceHole: { Close: "1.7", "*Normal": "1.8", Loose: "2.0" },
    stressArea: { "*Coarse": "1.27", Fine: "1.57", ExtraFine: "-" },
  },
  {
    size: "M2",
    pitch: { "*Coarse": "0.4", Fine: "0.25", ExtraFine: "-" },
    tapDrill: { "*Coarse": "1.6", Fine: "1.75", ExtraFine: "-" },
    clearanceHole: { Close: "2.2", "*Normal": "2.4", Loose: "2.6" },
    stressArea: { "*Coarse": "2.07", Fine: "2.45", ExtraFine: "-" },
  },
  {
    size: "M2.5",
    pitch: { "*Coarse": "0.45", Fine: "0.35", ExtraFine: "-" },
    tapDrill: { "*Coarse": "2.05", Fine: "2.15", ExtraFine: "-" },
    clearanceHole: { Close: "2.7", "*Normal": "2.9", Loose: "3.1" },
    stressArea: { "*Coarse": "3.39", Fine: "3.70", ExtraFine: "-" },
  },
  {
    size: "M3",
    pitch: { "*Coarse": "0.5", Fine: "0.35", ExtraFine: "-" },
    tapDrill: { "*Coarse": "2.5", Fine: "2.65", ExtraFine: "-" },
    clearanceHole: { Close: "3.2", "*Normal": "3.4", Loose: "3.6" },
    stressArea: { "*Coarse": "5.03", Fine: "5.61", ExtraFine: "-" },
  },
  {
    size: "M4",
    pitch: { "*Coarse": "0.7", Fine: "0.5", ExtraFine: "-" },
    tapDrill: { "*Coarse": "3.3", Fine: "3.5", ExtraFine: "-" },
    clearanceHole: { Close: "4.3", "*Normal": "4.5", Loose: "4.8" },
    stressArea: { "*Coarse": "8.78", Fine: "9.79", ExtraFine: "-" },
  },
  {
    size: "M5",
    pitch: { "*Coarse": "0.8", Fine: "0.5", ExtraFine: "-" },
    tapDrill: { "*Coarse": "4.2", Fine: "4.5", ExtraFine: "-" },
    clearanceHole: { Close: "5.3", "*Normal": "5.5", Loose: "5.8" },
    stressArea: { "*Coarse": "14.2", Fine: "16.1", ExtraFine: "-" },
  },
  {
    size: "M6",
    pitch: { "*Coarse": "1.0", Fine: "0.75", ExtraFine: "-" },
    tapDrill: { "*Coarse": "5.0", Fine: "5.2", ExtraFine: "-" },
    clearanceHole: { Close: "6.4", "*Normal": "6.6", Loose: "7.0" },
    stressArea: { "*Coarse": "20.1", Fine: "22.0", ExtraFine: "-" },
  },
  {
    size: "M8",
    pitch: { "*Coarse": "1.25", Fine: "1.0", ExtraFine: "0.75" },
    tapDrill: { "*Coarse": "6.8", Fine: "7.0", ExtraFine: "7.2" },
    clearanceHole: { Close: "8.4", "*Normal": "9.0", Loose: "10.0" },
    stressArea: { "*Coarse": "36.6", Fine: "39.2", ExtraFine: "41.8" },
  },
  {
    size: "M10",
    pitch: { "*Coarse": "1.5", Fine: "1.25", ExtraFine: "1.0" },
    tapDrill: { "*Coarse": "8.5", Fine: "8.8", ExtraFine: "9.0" },
    clearanceHole: { Close: "10.5", "*Normal": "11.0", Loose: "12.0" },
    stressArea: { "*Coarse": "58.0", Fine: "61.2", ExtraFine: "64.5" },
  },
  {
    size: "M12",
    pitch: { "*Coarse": "1.75", Fine: "1.5", ExtraFine: "1.25" },
    tapDrill: { "*Coarse": "10.2", Fine: "10.5", ExtraFine: "10.8" },
    clearanceHole: { Close: "13.0", "*Normal": "13.5", Loose: "14.5" },
    stressArea: { "*Coarse": "84.3", Fine: "88.1", ExtraFine: "92.1" },
  },
  {
    size: "M16",
    pitch: { "*Coarse": "2.0", Fine: "1.5", ExtraFine: "-" },
    tapDrill: { "*Coarse": "14.0", Fine: "14.5", ExtraFine: "-" },
    clearanceHole: { Close: "17.0", "*Normal": "17.5", Loose: "18.5" },
    stressArea: { "*Coarse": "157", Fine: "167", ExtraFine: "-" },
  },
  {
    size: "M18",
    pitch: { "*Coarse": "2.5", Fine: "2.0", ExtraFine: "1.5" },
    tapDrill: { "*Coarse": "15.5", Fine: "16.0", ExtraFine: "16.5" },
    clearanceHole: { Close: "19.0", "*Normal": "20.0", Loose: "21.0" },
    stressArea: { "*Coarse": "192", Fine: "204", ExtraFine: "216" },
  },
  {
    size: "M20",
    pitch: { "*Coarse": "2.5", Fine: "2.0", ExtraFine: "1.5" },
    tapDrill: { "*Coarse": "17.5", Fine: "18.0", ExtraFine: "18.5" },
    clearanceHole: { Close: "21.0", "*Normal": "22.0", Loose: "24.0" },
    stressArea: { "*Coarse": "245", Fine: "258", ExtraFine: "272" },
  },
  {
    size: "M22",
    pitch: { "*Coarse": "2.5", Fine: "2.0", ExtraFine: "1.5" },
    tapDrill: { "*Coarse": "19.5", Fine: "20.0", ExtraFine: "20.5" },
    clearanceHole: { Close: "23.0", "*Normal": "24.0", Loose: "26.0" },
    stressArea: { "*Coarse": "303", Fine: "318", ExtraFine: "333" },
  },
  {
    size: "M24",
    pitch: { "*Coarse": "3.0", Fine: "2.0", ExtraFine: "-" },
    tapDrill: { "*Coarse": "21.0", Fine: "22.0", ExtraFine: "-" },
    clearanceHole: { Close: "25.0", "*Normal": "26.0", Loose: "28.0" },
    stressArea: { "*Coarse": "353", Fine: "384", ExtraFine: "-" },
  },
  {
    size: "M30",
    pitch: { "*Coarse": "3.5", Fine: "2.0", ExtraFine: "-" },
    tapDrill: { "*Coarse": "26.5", Fine: "28.0", ExtraFine: "-" },
    clearanceHole: { Close: "31.0", "*Normal": "33.0", Loose: "35.0" },
    stressArea: { "*Coarse": "561", Fine: "621", ExtraFine: "-" },
  },
  {
    size: "M36",
    pitch: { "*Coarse": "4.0", Fine: "3.0", ExtraFine: "-" },
    tapDrill: { "*Coarse": "32.0", Fine: "33.0", ExtraFine: "-" },
    clearanceHole: { Close: "37.0", "*Normal": "39.0", Loose: "42.0" },
    stressArea: { "*Coarse": "817", Fine: "865", ExtraFine: "-" },
  }
];

// Labels and units shown in the side panel, in display order.
// key must match a field name on the objects above.
const screwFields = [
  { key: "size",          label: "Screw Size", unit: "" },
  { key: "pitch",         label: "Pitch",               unit: "mm" },
  { key: "tapDrill",      label: "Tap drill size",      unit: "mm" },
  { key: "clearanceHole", label: "Clearance hole size", unit: "mm" },
  { key: "stressArea",    label: "Tensile stress area", unit: "mm²" },
];
