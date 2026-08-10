// Placeholder reference data for the ISO metric screw thread chart.
// EDITING THIS TABLE: each entry is one major diameter (thread size).
// Add, remove, or change rows here — the page reads this array directly,
// rebuilds the knob's selectable steps, and re-renders the side panel
// automatically. Field names (the object keys) are what show up as row
// labels in data-table.js, so keep them matching between the two files.
//
// Values below are standard ISO 724 coarse-pitch dimensions, for
// placeholder purposes — replace/verify against your own source before
// relying on them.

const screwData = [
  { size: "M1.6", pitch: 0.35, pitchDia: 1.373, minorDia: 1.221, tapDrill: 1.25 },
  { size: "M2",   pitch: 0.4,  pitchDia: 1.740, minorDia: 1.567, tapDrill: 1.6 },
  { size: "M2.5", pitch: 0.45, pitchDia: 2.208, minorDia: 2.013, tapDrill: 2.05 },
  { size: "M3",   pitch: 0.5,  pitchDia: 2.675, minorDia: 2.459, tapDrill: 2.5 },
  { size: "M4",   pitch: 0.7,  pitchDia: 3.545, minorDia: 3.242, tapDrill: 3.3 },
  { size: "M5",   pitch: 0.8,  pitchDia: 4.480, minorDia: 4.134, tapDrill: 4.2 },
  { size: "M6",   pitch: 1.0,  pitchDia: 5.350, minorDia: 4.917, tapDrill: 5.0 },
  { size: "M8",   pitch: 1.25, pitchDia: 7.188, minorDia: 6.647, tapDrill: 6.8 },
  { size: "M10",  pitch: 1.5,  pitchDia: 9.026, minorDia: 8.376, tapDrill: 8.5 },
  { size: "M12",  pitch: 1.75, pitchDia: 10.863, minorDia: 10.106, tapDrill: 10.2 },
  { size: "M16",  pitch: 2.0,  pitchDia: 14.701, minorDia: 13.835, tapDrill: 14.0 },
  { size: "M20",  pitch: 2.5,  pitchDia: 18.376, minorDia: 17.294, tapDrill: 17.5 },
  { size: "M24",  pitch: 3.0,  pitchDia: 22.051, minorDia: 20.752, tapDrill: 21.0 },
  { size: "M30",  pitch: 3.5,  pitchDia: 27.727, minorDia: 26.211, tapDrill: 26.5 },
  { size: "M36",  pitch: 4.0,  pitchDia: 33.402, minorDia: 31.670, tapDrill: 32.0 },
];

// Labels and units shown in the side panel, in display order.
// key must match a field name on the objects above.
const screwFields = [
  { key: "pitch",    label: "Pitch (coarse)", unit: "mm" },
  { key: "pitchDia", label: "Pitch diameter", unit: "mm" },
  { key: "minorDia", label: "Minor diameter", unit: "mm" },
  { key: "tapDrill",  label: "Tap drill size", unit: "mm" },
];
