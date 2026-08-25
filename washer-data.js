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
    NORMAL: { nominalID: "1.7", nominalOD: "4", nominalThickness: "0.3" },
    SMALL: { nominalID: "1.7", nominalOD: "3.5", nominalThickness: "0.3" },
    LARGE: { nominalID: "-", nominalOD: "-", nominalThickness: "-" }
  },
  {
    size: "M2",
    diameter: "2.0",
    NORMAL: { nominalID: "2.2", nominalOD: "5", nominalThickness: "0.3" },
    SMALL: { nominalID: "2.2", nominalOD: "4.5", nominalThickness: "0.3" },
    LARGE: { nominalID: "-", nominalOD: "-", nominalThickness: "-" }
  },
  {
    size: "M2.5",
    diameter: "2.5",
    NORMAL: { nominalID: "2.7", nominalOD: "6", nominalThickness: "0.5" },
    SMALL: { nominalID: "2.7", nominalOD: "5", nominalThickness: "0.5" },
    LARGE: { nominalID: "-", nominalOD: "-", nominalThickness: "-" }
  },
  {
    size: "M3",
    diameter: "3.0",
    NORMAL: { nominalID: "3.2", nominalOD: "7", nominalThickness: "0.5" },
    SMALL: { nominalID: "3.2", nominalOD: "6", nominalThickness: "0.5" },
    LARGE: { nominalID: "3.2", nominalOD: "9", nominalThickness: "0.8" }
  },
  {
    size: "M3.5",
    diameter: "3.5",
    NORMAL: { nominalID: "3.7", nominalOD: "8", nominalThickness: "0.5" },
    SMALL: { nominalID: "3.7", nominalOD: "7", nominalThickness: "0.5" },
    LARGE: { nominalID: "-", nominalOD: "-", nominalThickness: "-" }
  },
  {
    size: "M4",
    diameter: "4.0",
    NORMAL: { nominalID: "4.3", nominalOD: "9", nominalThickness: "0.8" },
    SMALL: { nominalID: "4.3", nominalOD: "8", nominalThickness: "0.5" },
    LARGE: { nominalID: "4.3", nominalOD: "12", nominalThickness: "1" }
  },
  {
    size: "M5",
    diameter: "5.0",
    NORMAL: { nominalID: "5.3", nominalOD: "10", nominalThickness: "1" },
    SMALL: { nominalID: "5.3", nominalOD: "9", nominalThickness: "1" },
    LARGE: { nominalID: "5.3", nominalOD: "15", nominalThickness: "1" }
  },
  {
    size: "M6",
    diameter: "6.0",
    NORMAL: { nominalID: "6.4", nominalOD: "12", nominalThickness: "1.6" },
    SMALL: { nominalID: "6.4", nominalOD: "11", nominalThickness: "1.6" },
    LARGE: { nominalID: "6.4", nominalOD: "18", nominalThickness: "1.6" }
  },
  {
    size: "M8",
    diameter: "8.0",
    NORMAL: { nominalID: "8.4", nominalOD: "16", nominalThickness: "1.6" },
    SMALL: { nominalID: "8.4", nominalOD: "15", nominalThickness: "1.6" },
    LARGE: { nominalID: "8.4", nominalOD: "24", nominalThickness: "2" }
  },
  {
    size: "M10",
    diameter: "10.0",
    NORMAL: { nominalID: "10.5", nominalOD: "20", nominalThickness: "2" },
    SMALL: { nominalID: "10.5", nominalOD: "18", nominalThickness: "1.6" },
    LARGE: { nominalID: "10.5", nominalOD: "30", nominalThickness: "2.5" }
  },
  {
    size: "M12",
    diameter: "12.0",
    NORMAL: { nominalID: "13", nominalOD: "24", nominalThickness: "2.5" },
    SMALL: { nominalID: "13", nominalOD: "20", nominalThickness: "2" },
    LARGE: { nominalID: "13", nominalOD: "37", nominalThickness: "3" }
  },
  {
    size: "M14",
    diameter: "14.0",
    NORMAL: { nominalID: "15", nominalOD: "28", nominalThickness: "2.5" },
    SMALL: { nominalID: "15", nominalOD: "24", nominalThickness: "2.5" },
    LARGE: { nominalID: "-", nominalOD: "-", nominalThickness: "-" }
  },
  {
    size: "M16",
    diameter: "16.0",
    NORMAL: { nominalID: "17", nominalOD: "30", nominalThickness: "3" },
    SMALL: { nominalID: "17", nominalOD: "28", nominalThickness: "2.5" },
    LARGE: { nominalID: "17", nominalOD: "50", nominalThickness: "3" }
  },
  {
    size: "M20",
    diameter: "20.0",
    NORMAL: { nominalID: "21", nominalOD: "37", nominalThickness: "3" },
    SMALL: { nominalID: "21", nominalOD: "34", nominalThickness: "3" },
    LARGE: { nominalID: "21", nominalOD: "60", nominalThickness: "4" }
  },
  {
    size: "M24",
    diameter: "24.0",
    NORMAL: { nominalID: "25", nominalOD: "44", nominalThickness: "4" },
    SMALL: { nominalID: "25", nominalOD: "39", nominalThickness: "4" },
    LARGE: { nominalID: "25", nominalOD: "72", nominalThickness: "5" }
  },
  {
    size: "M30",
    diameter: "30.0",
    NORMAL: { nominalID: "31", nominalOD: "56", nominalThickness: "4" },
    SMALL: { nominalID: "31", nominalOD: "50", nominalThickness: "4" },
    LARGE: { nominalID: "33", nominalOD: "92", nominalThickness: "6" }
  },
  {
    size: "M36",
    diameter: "36.0",
    NORMAL: { nominalID: "37", nominalOD: "66", nominalThickness: "5" },
    SMALL: { nominalID: "37", nominalOD: "60", nominalThickness: "5" },
    LARGE: { nominalID: "39", nominalOD: "110", nominalThickness: "8" }
  }
];

// Labels and units shown in the Normal Washer (ISO 7089) side panel, in
// display order. key must match a field name on the NORMAL sub-object above.
const normalFields = [
  { key: "nominalID",        label: "Inside Diameter - Nominal",  unit: "mm" },
  { key: "nominalOD",        label: "Outside Diameter - Nominal", unit: "mm" },
  { key: "nominalThickness", label: "Thickness - Nominal",        unit: "mm" },
];

// Labels and units shown in the Small Washer (ISO 7092) side panel, in
// display order. key must match a field name on the SMALL sub-object above.
const smallFields = [
  { key: "nominalID",        label: "Inside Diameter - Nominal",  unit: "mm" },
  { key: "nominalOD",        label: "Outside Diameter - Nominal", unit: "mm" },
  { key: "nominalThickness", label: "Thickness - Nominal",        unit: "mm" },
];

// Labels and units shown in the Large Washer (ISO 7093-1) side panel, in
// display order. key must match a field name on the LARGE sub-object above.
const largeFields = [
  { key: "nominalID",        label: "Inside Diameter - Nominal",  unit: "mm" },
  { key: "nominalOD",        label: "Outside Diameter - Nominal", unit: "mm" },
  { key: "nominalThickness", label: "Thickness - Nominal",        unit: "mm" },
];
