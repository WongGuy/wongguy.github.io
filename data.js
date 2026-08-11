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
//
// SHCS/FHCS/BHCS: each entry also carries nested `SHCS`, `FHCS`, and `BHCS`
// objects with cap screw head geometry (socket, flat, and button head styles
// respectively), each rendered in its own chart row below the thread row
// using the same slider index. Values are approximate ISO 4762/10642/7380
// dimensions, placeholder purposes — replace/verify against your own source
// before relying on them.

const screwData = [
  {
    size: "M1.6",
    diameter: "1.6",
    pitch: { "*Coarse": "0.35", Fine: "0.2", ExtraFine: "-" },
    tapDrill: { "*Coarse": "1.25", Fine: "1.4", ExtraFine: "-" },
    clearanceHole: { Close: "1.7", "*Normal": "1.8", Loose: "2.0" },
    stressArea: { "*Coarse": "1.27", Fine: "1.57", ExtraFine: "-" },
    SHCS: { driverSize: "1.5", headDiam: "3.00", headHeight: "1.60", maxFilletDiam: "2.00" },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-" },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-" }
  },
  {
    size: "M2",
    diameter: "2.0",
    pitch: { "*Coarse": "0.4", Fine: "0.25", ExtraFine: "-" },
    tapDrill: { "*Coarse": "1.6", Fine: "1.75", ExtraFine: "-" },
    clearanceHole: { Close: "2.2", "*Normal": "2.4", Loose: "2.6" },
    stressArea: { "*Coarse": "2.07", Fine: "2.45", ExtraFine: "-" },
    SHCS: { driverSize: "1.5", headDiam: "3.80", headHeight: "2.00", maxFilletDiam: "2.60" },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-" },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-" }
  },
  {
    size: "M2.5",
    diameter: "2.5",
    pitch: { "*Coarse": "0.45", Fine: "0.35", ExtraFine: "-" },
    tapDrill: { "*Coarse": "2.05", Fine: "2.15", ExtraFine: "-" },
    clearanceHole: { Close: "2.7", "*Normal": "2.9", Loose: "3.1" },
    stressArea: { "*Coarse": "3.39", Fine: "3.70", ExtraFine: "-" },
    SHCS: { driverSize: "2.0", headDiam: "4.50", headHeight: "2.50", maxFilletDiam: "3.10" },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-" },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-" }
  },
  {
    size: "M3",
    diameter: "3.0",
    pitch: { "*Coarse": "0.5", Fine: "0.35", ExtraFine: "-" },
    tapDrill: { "*Coarse": "2.5", Fine: "2.65", ExtraFine: "-" },
    clearanceHole: { Close: "3.2", "*Normal": "3.4", Loose: "3.6" },
    stressArea: { "*Coarse": "5.03", Fine: "5.61", ExtraFine: "-" },
    SHCS: { driverSize: "2.5", headDiam: "5.50", headHeight: "3.00", maxFilletDiam: "3.60" },
    FHCS: { driverSize: "2.0", headDiam: "6.72", headHeight: "1.86" },
    BHCS: { driverSize: "2.0", headDiam: "5.70", headHeight: "1.65" }
  },
  // {
  //   size: "M3.5",
  //   diameter: "3.5",
  //   pitch: { "*Coarse": "0.6", Fine: "0.35", ExtraFine: "-" },
  //   tapDrill: { "*Coarse": "2.9", Fine: "3.15", ExtraFine: "-" },
  //   clearanceHole: { Close: "3.7", "*Normal": "3.9", Loose: "4.2" },
  //   stressArea: { "*Coarse": "6.78", Fine: "7.90", ExtraFine: "-" },
  //   SHCS: { driverSize: "2.5", headDiam: "6.00", headHeight: "3.50", maxFilletDiam: "4.10" },
  //   FHCS: { driverSize: "-", headDiam: "-", headHeight: "-" },
  //   BHCS: { driverSize: "-", headDiam: "-", headHeight: "-" }
  // },
  {
    size: "M4",
    diameter: "4.0",
    pitch: { "*Coarse": "0.7", Fine: "0.5", ExtraFine: "-" },
    tapDrill: { "*Coarse": "3.3", Fine: "3.5", ExtraFine: "-" },
    clearanceHole: { Close: "4.3", "*Normal": "4.5", Loose: "4.8" },
    stressArea: { "*Coarse": "8.78", Fine: "9.79", ExtraFine: "-" },
    SHCS: { driverSize: "3.0", headDiam: "7.22", headHeight: "4.00", maxFilletDiam: "4.70" },
    FHCS: { driverSize: "2.5", headDiam: "8.96", headHeight: "2.48" },
    BHCS: { driverSize: "2.5", headDiam: "7.60", headHeight: "2.20" }
  },
  {
    size: "M5",
    diameter: "5.0",
    pitch: { "*Coarse": "0.8", Fine: "0.5", ExtraFine: "-" },
    tapDrill: { "*Coarse": "4.2", Fine: "4.5", ExtraFine: "-" },
    clearanceHole: { Close: "5.3", "*Normal": "5.5", Loose: "5.8" },
    stressArea: { "*Coarse": "14.2", Fine: "16.1", ExtraFine: "-" },
    SHCS: { driverSize: "4.0", headDiam: "8.72", headHeight: "5.00", maxFilletDiam: "5.70" },
    FHCS: { driverSize: "3.0", headDiam: "11.20", headHeight: "3.10" },
    BHCS: { driverSize: "3.0", headDiam: "9.50", headHeight: "2.75" }
  },
  {
    size: "M6",
    diameter: "6.0",
    pitch: { "*Coarse": "1.0", Fine: "0.75", ExtraFine: "-" },
    tapDrill: { "*Coarse": "5.0", Fine: "5.2", ExtraFine: "-" },
    clearanceHole: { Close: "6.4", "*Normal": "6.6", Loose: "7.0" },
    stressArea: { "*Coarse": "20.1", Fine: "22.0", ExtraFine: "-" },
    SHCS: { driverSize: "5.0", headDiam: "10.22", headHeight: "6.00", maxFilletDiam: "6.80" },
    FHCS: { driverSize: "4.0", headDiam: "13.44", headHeight: "3.72" },
    BHCS: { driverSize: "4.0", headDiam: "10.50", headHeight: "3.30" }
  },
  {
    size: "M8",
    diameter: "8.0",
    pitch: { "*Coarse": "1.25", Fine: "1.0", ExtraFine: "0.75" },
    tapDrill: { "*Coarse": "6.8", Fine: "7.0", ExtraFine: "7.2" },
    clearanceHole: { Close: "8.4", "*Normal": "9.0", Loose: "10.0" },
    stressArea: { "*Coarse": "36.6", Fine: "39.2", ExtraFine: "41.8" },
    SHCS: { driverSize: "6.0", headDiam: "13.27", headHeight: "8.00", maxFilletDiam: "9.20" },
    FHCS: { driverSize: "5.0", headDiam: "17.92", headHeight: "4.96" },
    BHCS: { driverSize: "5.0", headDiam: "14.00", headHeight: "4.40" }
  },
  {
    size: "M10",
    diameter: "10.0",
    pitch: { "*Coarse": "1.5", Fine: "1.25", ExtraFine: "1.0" },
    tapDrill: { "*Coarse": "8.5", "Fine": "8.8", ExtraFine: "9.0" },
    clearanceHole: { Close: "10.5", "*Normal": "11.0", Loose: "12.0" },
    stressArea: { "*Coarse": "58.0", Fine: "61.2", ExtraFine: "64.5" },
    SHCS: { driverSize: "8.0", headDiam: "16.27", headHeight: "10.00", maxFilletDiam: "11.20" },
    FHCS: { driverSize: "6.0", headDiam: "22.40", headHeight: "6.20" },
    BHCS: { driverSize: "6.0", headDiam: "17.50", headHeight: "5.50" }
  },
  {
    size: "M12",
    diameter: "12.0",
    pitch: { "*Coarse": "1.75", Fine: "1.5", ExtraFine: "1.25" },
    tapDrill: { "*Coarse": "10.2", Fine: "10.5", ExtraFine: "10.8" },
    clearanceHole: { Close: "13.0", "*Normal": "13.5", Loose: "14.5" },
    stressArea: { "*Coarse": "84.3", Fine: "88.1", ExtraFine: "92.1" },
    SHCS: { driverSize: "10.0", headDiam: "18.27", headHeight: "12.00", maxFilletDiam: "13.70" },
    FHCS: { driverSize: "8.0", headDiam: "26.88", headHeight: "7.44" },
    BHCS: { driverSize: "8.0", headDiam: "21.00", headHeight: "6.60" }
  },
  {
    size: "M16",
    diameter: "16.0",
    pitch: { "*Coarse": "2.0", Fine: "1.5", ExtraFine: "-" },
    tapDrill: { "*Coarse": "14.0", Fine: "14.5", ExtraFine: "-" },
    clearanceHole: { Close: "17.0", "*Normal": "17.5", Loose: "18.5" },
    stressArea: { "*Coarse": "157", Fine: "167", ExtraFine: "-" },
    SHCS: { driverSize: "14.0", headDiam: "24.33", headHeight: "16.00", maxFilletDiam: "17.70" },
    FHCS: { driverSize: "10.0", headDiam: "33.60", headHeight: "8.80" },
    BHCS: { driverSize: "10.0", headDiam: "28.00", headHeight: "8.80" }
  },
  // {
  //   size: "M18",
  //   diameter: "18.0",
  //   pitch: { "*Coarse": "2.5", Fine: "2.0", ExtraFine: "1.5" },
  //   tapDrill: { "*Coarse": "15.5", Fine: "16.0", ExtraFine: "16.5" },
  //   clearanceHole: { Close: "19.0", "*Normal": "20.0", Loose: "21.0" },
  //   stressArea: { "*Coarse": "192", Fine: "204", ExtraFine: "216" },
  //   SHCS: { driverSize: "14.0", headDiam: "27.33", headHeight: "18.00", maxFilletDiam: "20.20" },
  //   FHCS: { driverSize: "-", headDiam: "-", headHeight: "-" },
  //   BHCS: { driverSize: "-", headDiam: "-", headHeight: "-" }
  // },
  {
    size: "M20",
    diameter: "20.0",
    pitch: { "*Coarse": "2.5", Fine: "2.0", ExtraFine: "1.5" },
    tapDrill: { "*Coarse": "17.5", Fine: "18.0", ExtraFine: "18.5" },
    clearanceHole: { Close: "21.0", "*Normal": "22.0", Loose: "24.0" },
    stressArea: { "*Coarse": "245", Fine: "258", ExtraFine: "272" },
    SHCS: { driverSize: "17.0", headDiam: "30.33", headHeight: "20.00", maxFilletDiam: "22.40" },
    FHCS: { driverSize: "12.0", headDiam: "40.32", headHeight: "10.16" },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-" }
  },
  {
    size: "M22",
    diameter: "22.0",
    pitch: { "*Coarse": "2.5", Fine: "2.0", ExtraFine: "1.5" },
    tapDrill: { "*Coarse": "19.5", Fine: "20.0", ExtraFine: "20.5" },
    clearanceHole: { Close: "23.0", "*Normal": "24.0", Loose: "26.0" },
    stressArea: { "*Coarse": "303", Fine: "318", ExtraFine: "333" },
    SHCS: { driverSize: "17.0", headDiam: "33.39", headHeight: "22.00", maxFilletDiam: "24.40" },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-" },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-" }
  },
  {
    size: "M24",
    diameter: "24.0",
    pitch: { "*Coarse": "3.0", Fine: "2.0", ExtraFine: "-" },
    tapDrill: { "*Coarse": "21.0", Fine: "22.0", ExtraFine: "-" },
    clearanceHole: { Close: "25.0", "*Normal": "26.0", Loose: "28.0" },
    stressArea: { "*Coarse": "353", Fine: "384", ExtraFine: "-" },
    SHCS: { driverSize: "19.0", headDiam: "36.39", headHeight: "24.00", maxFilletDiam: "26.40" },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-" },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-" }
  },
  {
    size: "M30",
    diameter: "30.0",
    pitch: { "*Coarse": "3.5", Fine: "2.0", ExtraFine: "-" },
    tapDrill: { "*Coarse": "26.5", Fine: "28.0", ExtraFine: "-" },
    clearanceHole: { Close: "31.0", "*Normal": "33.0", Loose: "35.0" },
    stressArea: { "*Coarse": "561", Fine: "621", ExtraFine: "-" },
    SHCS: { driverSize: "22.0", headDiam: "45.39", headHeight: "30.00", maxFilletDiam: "33.40" },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-" },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-" }
  },
  {
    size: "M36",
    diameter: "36.0",
    pitch: { "*Coarse": "4.0", Fine: "3.0", ExtraFine: "-" },
    tapDrill: { "*Coarse": "32.0", Fine: "33.0", ExtraFine: "-" },
    clearanceHole: { Close: "37.0", "*Normal": "39.0", Loose: "42.0" },
    stressArea: { "*Coarse": "817", Fine: "865", ExtraFine: "-" },
    SHCS: { driverSize: "27.0", headDiam: "54.46", headHeight: "36.00", maxFilletDiam: "39.40" },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-" },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-" }
  }
];

// Labels and units shown in the side panel, in display order.
// key must match a field name on the objects above.
const screwFields = [
  { key: "diameter",      label: "Screw Diameter",      unit: "mm" },
  { key: "pitch",         label: "Pitch",               unit: "mm" },
  { key: "tapDrill",      label: "Tap drill size",      unit: "mm" },
  { key: "clearanceHole", label: "Clearance hole size", unit: "mm" },
  // { key: "stressArea",    label: "Tensile stress area", unit: "mm²" },
];

// Labels and units shown in the SHCS side panel, in display order.
// key must match a field name on the SHCS sub-object above.
const shcsFields = [
  { key: "driverSize",    label: "Driver Size",         unit: "mm" },
  { key: "headDiam",      label: "Head Diam",           unit: "mm" },
  { key: "headHeight",    label: "Head Height",         unit: "mm" },
  { key: "maxFilletDiam", label: "Max Fillet Diam",     unit: "mm" },
];

// Labels and units shown in the FHCS side panel, in display order.
// key must match a field name on the FHCS sub-object above.
const fhcsFields = [
  { key: "driverSize", label: "Driver Size", unit: "mm" },
  { key: "headDiam",   label: "Head Diam",   unit: "mm" },
  { key: "headHeight", label: "Head Height", unit: "mm" },
];

// Labels and units shown in the BHCS side panel, in display order.
// key must match a field name on the BHCS sub-object above.
const bhcsFields = [
  { key: "driverSize", label: "Driver Size", unit: "mm" },
  { key: "headDiam",   label: "Head Diam",   unit: "mm" },
  { key: "headHeight", label: "Head Height", unit: "mm" },
];
