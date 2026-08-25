// Reference data for the ISO metric flat washer chart.
// EDITING THIS TABLE: the washerData array is generated — don't hand-edit it.
// It's produced by scripts/generate_washer_data.py from the standards CSVs in
// assets/standards/ISO/washer/ (ISO 7089 normal series, ISO 7092 small
// series, ISO 7093-1 large series). To add, remove, or correct a value, edit
// the relevant CSV and rerun `python scripts/generate_washer_data.py`. Which
// sizes appear at all is the union of sizes across all three CSVs. Field
// names (the object keys) are what show up as row labels in washer-app.js,
// so keep them matching between the two files if you change the render
// logic.
//
// NORMAL/SMALL/LARGE: each entry carries nested `NORMAL`, `SMALL`, and
// `LARGE` objects with per-standard washer dimensions (ISO 7089, 7092,
// 7093-1 respectively), each rendered in its own chart row below using the
// same slider index. A standard not offered at a given size gets "-"
// placeholders.

const washerData = [
  {
    size: "M1.6",
    diameter: "1.6",
    NORMAL: { minID: "1.7", maxOD: "4", nominalThickness: "0.3" },
    SMALL: { minID: "1.7", maxOD: "3.5", nominalThickness: "0.3" },
    LARGE: { minID: "-", maxOD: "-", nominalThickness: "-" }
  },
  {
    size: "M2",
    diameter: "2.0",
    NORMAL: { minID: "2.2", maxOD: "5", nominalThickness: "0.3" },
    SMALL: { minID: "2.2", maxOD: "4.5", nominalThickness: "0.3" },
    LARGE: { minID: "-", maxOD: "-", nominalThickness: "-" }
  },
  {
    size: "M2.5",
    diameter: "2.5",
    NORMAL: { minID: "2.7", maxOD: "6", nominalThickness: "0.5" },
    SMALL: { minID: "2.7", maxOD: "5", nominalThickness: "0.5" },
    LARGE: { minID: "-", maxOD: "-", nominalThickness: "-" }
  },
  {
    size: "M3",
    diameter: "3.0",
    NORMAL: { minID: "3.2", maxOD: "7", nominalThickness: "0.5" },
    SMALL: { minID: "3.2", maxOD: "6", nominalThickness: "0.5" },
    LARGE: { minID: "3.2", maxOD: "9", nominalThickness: "0.8" }
  },
  {
    size: "M4",
    diameter: "4.0",
    NORMAL: { minID: "4.3", maxOD: "9", nominalThickness: "0.8" },
    SMALL: { minID: "4.3", maxOD: "8", nominalThickness: "0.5" },
    LARGE: { minID: "4.3", maxOD: "12", nominalThickness: "1" }
  },
  {
    size: "M5",
    diameter: "5.0",
    NORMAL: { minID: "5.3", maxOD: "10", nominalThickness: "1" },
    SMALL: { minID: "5.3", maxOD: "9", nominalThickness: "1" },
    LARGE: { minID: "5.3", maxOD: "15", nominalThickness: "1" }
  },
  {
    size: "M6",
    diameter: "6.0",
    NORMAL: { minID: "6.4", maxOD: "12", nominalThickness: "1.6" },
    SMALL: { minID: "6.4", maxOD: "11", nominalThickness: "1.6" },
    LARGE: { minID: "6.4", maxOD: "18", nominalThickness: "1.6" }
  },
  {
    size: "M8",
    diameter: "8.0",
    NORMAL: { minID: "8.4", maxOD: "16", nominalThickness: "1.6" },
    SMALL: { minID: "8.4", maxOD: "15", nominalThickness: "1.6" },
    LARGE: { minID: "8.4", maxOD: "24", nominalThickness: "2" }
  },
  {
    size: "M10",
    diameter: "10.0",
    NORMAL: { minID: "10.5", maxOD: "20", nominalThickness: "2" },
    SMALL: { minID: "10.5", maxOD: "18", nominalThickness: "1.6" },
    LARGE: { minID: "10.5", maxOD: "30", nominalThickness: "2.5" }
  },
  {
    size: "M12",
    diameter: "12.0",
    NORMAL: { minID: "13", maxOD: "24", nominalThickness: "2.5" },
    SMALL: { minID: "13", maxOD: "20", nominalThickness: "2" },
    LARGE: { minID: "13", maxOD: "37", nominalThickness: "3" }
  },
  {
    size: "M16",
    diameter: "16.0",
    NORMAL: { minID: "17", maxOD: "30", nominalThickness: "3" },
    SMALL: { minID: "17", maxOD: "28", nominalThickness: "2.5" },
    LARGE: { minID: "17", maxOD: "50", nominalThickness: "3" }
  },
  {
    size: "M20",
    diameter: "20.0",
    NORMAL: { minID: "21", maxOD: "37", nominalThickness: "3" },
    SMALL: { minID: "21", maxOD: "34", nominalThickness: "3" },
    LARGE: { minID: "21", maxOD: "60", nominalThickness: "4" }
  },
  {
    size: "M24",
    diameter: "24.0",
    NORMAL: { minID: "25", maxOD: "44", nominalThickness: "4" },
    SMALL: { minID: "25", maxOD: "39", nominalThickness: "4" },
    LARGE: { minID: "25", maxOD: "72", nominalThickness: "5" }
  },
  {
    size: "M30",
    diameter: "30.0",
    NORMAL: { minID: "31", maxOD: "56", nominalThickness: "4" },
    SMALL: { minID: "31", maxOD: "50", nominalThickness: "4" },
    LARGE: { minID: "33", maxOD: "92", nominalThickness: "6" }
  },
  {
    size: "M36",
    diameter: "36.0",
    NORMAL: { minID: "37", maxOD: "66", nominalThickness: "5" },
    SMALL: { minID: "37", maxOD: "60", nominalThickness: "5" },
    LARGE: { minID: "39", maxOD: "110", nominalThickness: "8" }
  }
];

// Labels and units shown in the Normal Washer (ISO 7089) side panel, in
// display order. key must match a field name on the NORMAL sub-object above.
const normalFields = [
  { key: "minID",        label: "Inside Diameter",  unit: "mm" },
  { key: "maxOD",        label: "Outside Diameter", unit: "mm" },
  { key: "nominalThickness", label: "Thickness",        unit: "mm" },
];

// Labels and units shown in the Small Washer (ISO 7092) side panel, in
// display order. key must match a field name on the SMALL sub-object above.
const smallFields = [
  { key: "minID",        label: "Inside Diameter",  unit: "mm" },
  { key: "maxOD",        label: "Outside Diameter", unit: "mm" },
  { key: "nominalThickness", label: "Thickness",        unit: "mm" },
];

// Labels and units shown in the Large Washer (ISO 7093-1) side panel, in
// display order. key must match a field name on the LARGE sub-object above.
const largeFields = [
  { key: "minID",        label: "Inside Diameter",  unit: "mm" },
  { key: "maxOD",        label: "Outside Diameter", unit: "mm" },
  { key: "nominalThickness", label: "Thickness",        unit: "mm" },
];
