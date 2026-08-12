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
// pitch, and tapDrill use it to show Coarse/Fine thread series
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
//
// LENGTHS: each SHCS/FHCS/BHCS object also carries a `lengths` array of
// { length, threaded } pairs (both in mm) — the standard lengths that head
// style is available in, and how much of each is threaded. app.js renders
// this as a horizontal chart under that type's table/diagram; when length
// and threaded are equal (fully threaded), the two cells are merged into
// one. An empty array means that head style isn't offered at this size
// (matches the "-" convention used for driverSize/headDiam/headHeight
// above). Threaded lengths follow the ISO 4762 thread-length formula
// (b = 2d+6 up to 125mm, 2d+12 up to 200mm, 2d+25 beyond) applied to all
// three head styles for now — placeholder purposes, replace/verify against
// your own source before relying on them.

const screwData = [
  {
    size: "M1.6",
    diameter: "1.6",
    pitch: { "*Coarse": "0.35", Fine: "0.2", ExtraFine: "-" },
    tapDrill: { "*Coarse": "1.25", Fine: "1.4", ExtraFine: "-" },
    clearanceHole: { Close: "1.7", "*Normal": "1.8", Loose: "2.0" },
    SHCS: {
      driverSize: "1.5", headDiam: "3.00", headHeight: "1.60", transitionDiameter: "2.00",
      lengths: [
        { length: "3", threaded: "3" }, { length: "4", threaded: "4" }, { length: "5", threaded: "5" },
        { length: "6", threaded: "6" }, { length: "8", threaded: "8" }, { length: "10", threaded: "9.2" },
        { length: "12", threaded: "9.2" }, { length: "16", threaded: "9.2" }
      ]
    },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] }
  },
  {
    size: "M2",
    diameter: "2.0",
    pitch: { "*Coarse": "0.4", Fine: "0.25", ExtraFine: "-" },
    tapDrill: { "*Coarse": "1.6", Fine: "1.75", ExtraFine: "-" },
    clearanceHole: { Close: "2.2", "*Normal": "2.4", Loose: "2.6" },
    SHCS: {
      driverSize: "1.5", headDiam: "3.80", headHeight: "2.00", transitionDiameter: "2.60",
      lengths: [
        { length: "3", threaded: "3" }, { length: "4", threaded: "4" }, { length: "5", threaded: "5" },
        { length: "6", threaded: "6" }, { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "10" }, { length: "16", threaded: "10" }, { length: "20", threaded: "10" }
      ]
    },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] }
  },
  {
    size: "M2.5",
    diameter: "2.5",
    pitch: { "*Coarse": "0.45", Fine: "0.35", ExtraFine: "-" },
    tapDrill: { "*Coarse": "2.05", Fine: "2.15", ExtraFine: "-" },
    clearanceHole: { Close: "2.7", "*Normal": "2.9", Loose: "3.1" },
    SHCS: {
      driverSize: "2.0", headDiam: "4.50", headHeight: "2.50", transitionDiameter: "3.10",
      lengths: [
        { length: "4", threaded: "4" }, { length: "5", threaded: "5" }, { length: "6", threaded: "6" },
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" }, { length: "12", threaded: "11" },
        { length: "16", threaded: "11" }, { length: "20", threaded: "11" }, { length: "25", threaded: "11" }
      ]
    },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] }
  },
  {
    size: "M3",
    diameter: "3.0",
    pitch: { "*Coarse": "0.5", Fine: "0.35", ExtraFine: "-" },
    tapDrill: { "*Coarse": "2.5", Fine: "2.65", ExtraFine: "-" },
    clearanceHole: { Close: "3.2", "*Normal": "3.4", Loose: "3.6" },
    SHCS: {
      driverSize: "2.5", headDiam: "5.50", headHeight: "3.00", transitionDiameter: "3.60",
      lengths: [
        { length: "4", threaded: "4" }, { length: "5", threaded: "5" }, { length: "6", threaded: "6" },
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "12" }, { length: "20", threaded: "12" }, { length: "25", threaded: "12" },
        { length: "30", threaded: "12" }
      ]
    },
    FHCS: {
      driverSize: "2.0", headDiam: "6.72", headHeight: "1.86",
      lengths: [
        { length: "4", threaded: "4" }, { length: "5", threaded: "5" }, { length: "6", threaded: "6" },
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "12" }, { length: "20", threaded: "12" }, { length: "25", threaded: "12" },
        { length: "30", threaded: "12" }
      ]
    },
    BHCS: {
      driverSize: "2.0", headDiam: "5.70", headHeight: "1.65",
      lengths: [
        { length: "4", threaded: "4" }, { length: "5", threaded: "5" }, { length: "6", threaded: "6" },
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "12" }, { length: "20", threaded: "12" }, { length: "25", threaded: "12" },
        { length: "30", threaded: "12" }
      ]
    }
  },
  {
    size: "M4",
    diameter: "4.0",
    pitch: { "*Coarse": "0.7", Fine: "0.5", ExtraFine: "-" },
    tapDrill: { "*Coarse": "3.3", Fine: "3.5", ExtraFine: "-" },
    clearanceHole: { Close: "4.3", "*Normal": "4.5", Loose: "4.8" },
    SHCS: {
      driverSize: "3.0", headDiam: "7.22", headHeight: "4.00", transitionDiameter: "4.70",
      lengths: [
        { length: "5", threaded: "5" }, { length: "6", threaded: "6" }, { length: "8", threaded: "8" },
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" }, { length: "16", threaded: "14" },
        { length: "20", threaded: "14" }, { length: "25", threaded: "14" }, { length: "30", threaded: "14" },
        { length: "35", threaded: "14" }, { length: "40", threaded: "14" }
      ]
    },
    FHCS: {
      driverSize: "2.5", headDiam: "8.96", headHeight: "2.48",
      lengths: [
        { length: "5", threaded: "5" }, { length: "6", threaded: "6" }, { length: "8", threaded: "8" },
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" }, { length: "16", threaded: "14" },
        { length: "20", threaded: "14" }, { length: "25", threaded: "14" }, { length: "30", threaded: "14" },
        { length: "35", threaded: "14" }, { length: "40", threaded: "14" }
      ]
    },
    BHCS: {
      driverSize: "2.5", headDiam: "7.60", headHeight: "2.20",
      lengths: [
        { length: "5", threaded: "5" }, { length: "6", threaded: "6" }, { length: "8", threaded: "8" },
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" }, { length: "16", threaded: "14" },
        { length: "20", threaded: "14" }, { length: "25", threaded: "14" }, { length: "30", threaded: "14" },
        { length: "35", threaded: "14" }, { length: "40", threaded: "14" }
      ]
    }
  },
  {
    size: "M5",
    diameter: "5.0",
    pitch: { "*Coarse": "0.8", Fine: "0.5", ExtraFine: "-" },
    tapDrill: { "*Coarse": "4.2", Fine: "4.5", ExtraFine: "-" },
    clearanceHole: { Close: "5.3", "*Normal": "5.5", Loose: "5.8" },
    SHCS: {
      driverSize: "4.0", headDiam: "8.72", headHeight: "5.00", transitionDiameter: "5.70",
      lengths: [
        { length: "6", threaded: "6" }, { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" }, { length: "20", threaded: "16" },
        { length: "25", threaded: "16" }, { length: "30", threaded: "16" }, { length: "35", threaded: "16" },
        { length: "40", threaded: "16" }, { length: "45", threaded: "16" }, { length: "50", threaded: "16" }
      ]
    },
    FHCS: {
      driverSize: "3.0", headDiam: "11.20", headHeight: "3.10",
      lengths: [
        { length: "6", threaded: "6" }, { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" }, { length: "20", threaded: "16" },
        { length: "25", threaded: "16" }, { length: "30", threaded: "16" }, { length: "35", threaded: "16" },
        { length: "40", threaded: "16" }, { length: "45", threaded: "16" }, { length: "50", threaded: "16" }
      ]
    },
    BHCS: {
      driverSize: "3.0", headDiam: "9.50", headHeight: "2.75",
      lengths: [
        { length: "6", threaded: "6" }, { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" }, { length: "20", threaded: "16" },
        { length: "25", threaded: "16" }, { length: "30", threaded: "16" }, { length: "35", threaded: "16" },
        { length: "40", threaded: "16" }, { length: "45", threaded: "16" }, { length: "50", threaded: "16" }
      ]
    }
  },
  {
    size: "M6",
    diameter: "6.0",
    pitch: { "*Coarse": "1.0", Fine: "0.75", ExtraFine: "-" },
    tapDrill: { "*Coarse": "5.0", Fine: "5.2", ExtraFine: "-" },
    clearanceHole: { Close: "6.4", "*Normal": "6.6", Loose: "7.0" },
    SHCS: {
      driverSize: "5.0", headDiam: "10.22", headHeight: "6.00", transitionDiameter: "6.80",
      lengths: [
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "16" }, { length: "20", threaded: "18" }, { length: "25", threaded: "18" },
        { length: "30", threaded: "18" }, { length: "35", threaded: "18" }, { length: "40", threaded: "18" },
        { length: "45", threaded: "18" }, { length: "50", threaded: "18" }, { length: "55", threaded: "18" },
        { length: "60", threaded: "18" }
      ]
    },
    FHCS: {
      driverSize: "4.0", headDiam: "13.44", headHeight: "3.72",
      lengths: [
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "16" }, { length: "20", threaded: "18" }, { length: "25", threaded: "18" },
        { length: "30", threaded: "18" }, { length: "35", threaded: "18" }, { length: "40", threaded: "18" },
        { length: "45", threaded: "18" }, { length: "50", threaded: "18" }, { length: "55", threaded: "18" },
        { length: "60", threaded: "18" }
      ]
    },
    BHCS: {
      driverSize: "4.0", headDiam: "10.50", headHeight: "3.30",
      lengths: [
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "16" }, { length: "20", threaded: "18" }, { length: "25", threaded: "18" },
        { length: "30", threaded: "18" }, { length: "35", threaded: "18" }, { length: "40", threaded: "18" },
        { length: "45", threaded: "18" }, { length: "50", threaded: "18" }, { length: "55", threaded: "18" },
        { length: "60", threaded: "18" }
      ]
    }
  },
  {
    size: "M8",
    diameter: "8.0",
    pitch: { "*Coarse": "1.25", Fine: "1.0", ExtraFine: "0.75" },
    tapDrill: { "*Coarse": "6.8", Fine: "7.0", ExtraFine: "7.2" },
    clearanceHole: { Close: "8.4", "*Normal": "9.0", Loose: "10.0" },
    SHCS: {
      driverSize: "6.0", headDiam: "13.27", headHeight: "8.00", transitionDiameter: "9.20",
      lengths: [
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "22" }, { length: "30", threaded: "22" },
        { length: "35", threaded: "22" }, { length: "40", threaded: "22" }, { length: "45", threaded: "22" },
        { length: "50", threaded: "22" }, { length: "55", threaded: "22" }, { length: "60", threaded: "22" },
        { length: "65", threaded: "22" }, { length: "70", threaded: "22" }, { length: "80", threaded: "22" }
      ]
    },
    FHCS: {
      driverSize: "5.0", headDiam: "17.92", headHeight: "4.96",
      lengths: [
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "22" }, { length: "30", threaded: "22" },
        { length: "35", threaded: "22" }, { length: "40", threaded: "22" }, { length: "45", threaded: "22" },
        { length: "50", threaded: "22" }, { length: "55", threaded: "22" }, { length: "60", threaded: "22" },
        { length: "65", threaded: "22" }, { length: "70", threaded: "22" }, { length: "80", threaded: "22" }
      ]
    },
    BHCS: {
      driverSize: "5.0", headDiam: "14.00", headHeight: "4.40",
      lengths: [
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "22" }, { length: "30", threaded: "22" },
        { length: "35", threaded: "22" }, { length: "40", threaded: "22" }, { length: "45", threaded: "22" },
        { length: "50", threaded: "22" }, { length: "55", threaded: "22" }, { length: "60", threaded: "22" },
        { length: "65", threaded: "22" }, { length: "70", threaded: "22" }, { length: "80", threaded: "22" }
      ]
    }
  },
  {
    size: "M10",
    diameter: "10.0",
    pitch: { "*Coarse": "1.5", Fine: "1.25", ExtraFine: "1.0" },
    tapDrill: { "*Coarse": "8.5", Fine: "8.8", ExtraFine: "9.0" },
    clearanceHole: { Close: "10.5", "*Normal": "11.0", Loose: "12.0" },
    SHCS: {
      driverSize: "8.0", headDiam: "16.27", headHeight: "10.00", transitionDiameter: "11.20",
      lengths: [
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "25" }, { length: "30", threaded: "26" }, { length: "35", threaded: "26" },
        { length: "40", threaded: "26" }, { length: "45", threaded: "26" }, { length: "50", threaded: "26" },
        { length: "55", threaded: "26" }, { length: "60", threaded: "26" }, { length: "65", threaded: "26" },
        { length: "70", threaded: "26" }, { length: "80", threaded: "26" }, { length: "90", threaded: "26" },
        { length: "100", threaded: "26" }
      ]
    },
    FHCS: {
      driverSize: "6.0", headDiam: "22.40", headHeight: "6.20",
      lengths: [
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "25" }, { length: "30", threaded: "26" }, { length: "35", threaded: "26" },
        { length: "40", threaded: "26" }, { length: "45", threaded: "26" }, { length: "50", threaded: "26" },
        { length: "55", threaded: "26" }, { length: "60", threaded: "26" }, { length: "65", threaded: "26" },
        { length: "70", threaded: "26" }, { length: "80", threaded: "26" }, { length: "90", threaded: "26" },
        { length: "100", threaded: "26" }
      ]
    },
    BHCS: {
      driverSize: "6.0", headDiam: "17.50", headHeight: "5.50",
      lengths: [
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "25" }, { length: "30", threaded: "26" }, { length: "35", threaded: "26" },
        { length: "40", threaded: "26" }, { length: "45", threaded: "26" }, { length: "50", threaded: "26" },
        { length: "55", threaded: "26" }, { length: "60", threaded: "26" }, { length: "65", threaded: "26" },
        { length: "70", threaded: "26" }, { length: "80", threaded: "26" }, { length: "90", threaded: "26" },
        { length: "100", threaded: "26" }
      ]
    }
  },
  {
    size: "M12",
    diameter: "12.0",
    pitch: { "*Coarse": "1.75", Fine: "1.5", ExtraFine: "1.25" },
    tapDrill: { "*Coarse": "10.2", Fine: "10.5", ExtraFine: "10.8" },
    clearanceHole: { Close: "13.0", "*Normal": "13.5", Loose: "14.5" },
    SHCS: {
      driverSize: "10.0", headDiam: "18.27", headHeight: "12.00", transitionDiameter: "13.70",
      lengths: [
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "30" }, { length: "35", threaded: "30" }, { length: "40", threaded: "30" },
        { length: "45", threaded: "30" }, { length: "50", threaded: "30" }, { length: "55", threaded: "30" },
        { length: "60", threaded: "30" }, { length: "65", threaded: "30" }, { length: "70", threaded: "30" },
        { length: "80", threaded: "30" }, { length: "90", threaded: "30" }, { length: "100", threaded: "30" },
        { length: "110", threaded: "30" }, { length: "120", threaded: "30" }
      ]
    },
    FHCS: {
      driverSize: "8.0", headDiam: "26.88", headHeight: "7.44",
      lengths: [
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "30" }, { length: "35", threaded: "30" }, { length: "40", threaded: "30" },
        { length: "45", threaded: "30" }, { length: "50", threaded: "30" }, { length: "55", threaded: "30" },
        { length: "60", threaded: "30" }, { length: "65", threaded: "30" }, { length: "70", threaded: "30" },
        { length: "80", threaded: "30" }, { length: "90", threaded: "30" }, { length: "100", threaded: "30" },
        { length: "110", threaded: "30" }, { length: "120", threaded: "30" }
      ]
    },
    BHCS: {
      driverSize: "8.0", headDiam: "21.00", headHeight: "6.60",
      lengths: [
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "30" }, { length: "35", threaded: "30" }, { length: "40", threaded: "30" },
        { length: "45", threaded: "30" }, { length: "50", threaded: "30" }, { length: "55", threaded: "30" },
        { length: "60", threaded: "30" }, { length: "65", threaded: "30" }, { length: "70", threaded: "30" },
        { length: "80", threaded: "30" }, { length: "90", threaded: "30" }, { length: "100", threaded: "30" },
        { length: "110", threaded: "30" }, { length: "120", threaded: "30" }
      ]
    }
  },
  {
    size: "M16",
    diameter: "16.0",
    pitch: { "*Coarse": "2.0", Fine: "1.5", ExtraFine: "-" },
    tapDrill: { "*Coarse": "14.0", Fine: "14.5", ExtraFine: "-" },
    clearanceHole: { Close: "17.0", "*Normal": "17.5", Loose: "18.5" },
    SHCS: {
      driverSize: "14.0", headDiam: "24.33", headHeight: "16.00", transitionDiameter: "17.70",
      lengths: [
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" }, { length: "30", threaded: "30" },
        { length: "35", threaded: "35" }, { length: "40", threaded: "38" }, { length: "45", threaded: "38" },
        { length: "50", threaded: "38" }, { length: "55", threaded: "38" }, { length: "60", threaded: "38" },
        { length: "65", threaded: "38" }, { length: "70", threaded: "38" }, { length: "80", threaded: "38" },
        { length: "90", threaded: "38" }, { length: "100", threaded: "38" }, { length: "110", threaded: "38" },
        { length: "120", threaded: "38" }, { length: "130", threaded: "44" }, { length: "140", threaded: "44" },
        { length: "150", threaded: "44" }, { length: "160", threaded: "44" }
      ]
    },
    FHCS: {
      driverSize: "10.0", headDiam: "33.60", headHeight: "8.80",
      lengths: [
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" }, { length: "30", threaded: "30" },
        { length: "35", threaded: "35" }, { length: "40", threaded: "38" }, { length: "45", threaded: "38" },
        { length: "50", threaded: "38" }, { length: "55", threaded: "38" }, { length: "60", threaded: "38" },
        { length: "65", threaded: "38" }, { length: "70", threaded: "38" }, { length: "80", threaded: "38" },
        { length: "90", threaded: "38" }, { length: "100", threaded: "38" }, { length: "110", threaded: "38" },
        { length: "120", threaded: "38" }, { length: "130", threaded: "44" }, { length: "140", threaded: "44" },
        { length: "150", threaded: "44" }, { length: "160", threaded: "44" }
      ]
    },
    BHCS: {
      driverSize: "10.0", headDiam: "28.00", headHeight: "8.80",
      lengths: [
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" }, { length: "30", threaded: "30" },
        { length: "35", threaded: "35" }, { length: "40", threaded: "38" }, { length: "45", threaded: "38" },
        { length: "50", threaded: "38" }, { length: "55", threaded: "38" }, { length: "60", threaded: "38" },
        { length: "65", threaded: "38" }, { length: "70", threaded: "38" }, { length: "80", threaded: "38" },
        { length: "90", threaded: "38" }, { length: "100", threaded: "38" }, { length: "110", threaded: "38" },
        { length: "120", threaded: "38" }, { length: "130", threaded: "44" }, { length: "140", threaded: "44" },
        { length: "150", threaded: "44" }, { length: "160", threaded: "44" }
      ]
    }
  },
  {
    size: "M20",
    diameter: "20.0",
    pitch: { "*Coarse": "2.5", Fine: "2.0", ExtraFine: "1.5" },
    tapDrill: { "*Coarse": "17.5", Fine: "18.0", ExtraFine: "18.5" },
    clearanceHole: { Close: "21.0", "*Normal": "22.0", Loose: "24.0" },
    SHCS: {
      driverSize: "17.0", headDiam: "30.33", headHeight: "20.00", transitionDiameter: "22.40",
      lengths: [
        { length: "25", threaded: "25" }, { length: "30", threaded: "30" }, { length: "35", threaded: "35" },
        { length: "40", threaded: "40" }, { length: "45", threaded: "45" }, { length: "50", threaded: "46" },
        { length: "55", threaded: "46" }, { length: "60", threaded: "46" }, { length: "65", threaded: "46" },
        { length: "70", threaded: "46" }, { length: "80", threaded: "46" }, { length: "90", threaded: "46" },
        { length: "100", threaded: "46" }, { length: "110", threaded: "46" }, { length: "120", threaded: "46" },
        { length: "130", threaded: "52" }, { length: "140", threaded: "52" }, { length: "150", threaded: "52" },
        { length: "160", threaded: "52" }, { length: "180", threaded: "52" }, { length: "200", threaded: "52" }
      ]
    },
    FHCS: {
      driverSize: "12.0", headDiam: "40.32", headHeight: "10.16",
      lengths: [
        { length: "25", threaded: "25" }, { length: "30", threaded: "30" }, { length: "35", threaded: "35" },
        { length: "40", threaded: "40" }, { length: "45", threaded: "45" }, { length: "50", threaded: "46" },
        { length: "55", threaded: "46" }, { length: "60", threaded: "46" }, { length: "65", threaded: "46" },
        { length: "70", threaded: "46" }, { length: "80", threaded: "46" }, { length: "90", threaded: "46" },
        { length: "100", threaded: "46" }, { length: "110", threaded: "46" }, { length: "120", threaded: "46" },
        { length: "130", threaded: "52" }, { length: "140", threaded: "52" }, { length: "150", threaded: "52" },
        { length: "160", threaded: "52" }, { length: "180", threaded: "52" }, { length: "200", threaded: "52" }
      ]
    },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] }
  },
  {
    size: "M22",
    diameter: "22.0",
    pitch: { "*Coarse": "2.5", Fine: "2.0", ExtraFine: "1.5" },
    tapDrill: { "*Coarse": "19.5", Fine: "20.0", ExtraFine: "20.5" },
    clearanceHole: { Close: "23.0", "*Normal": "24.0", Loose: "26.0" },
    SHCS: {
      driverSize: "17.0", headDiam: "33.39", headHeight: "22.00", transitionDiameter: "24.40",
      lengths: [
        { length: "30", threaded: "30" }, { length: "35", threaded: "35" }, { length: "40", threaded: "40" },
        { length: "45", threaded: "45" }, { length: "50", threaded: "50" }, { length: "55", threaded: "50" },
        { length: "60", threaded: "50" }, { length: "65", threaded: "50" }, { length: "70", threaded: "50" },
        { length: "80", threaded: "50" }, { length: "90", threaded: "50" }, { length: "100", threaded: "50" },
        { length: "110", threaded: "50" }, { length: "120", threaded: "50" }, { length: "130", threaded: "56" },
        { length: "140", threaded: "56" }, { length: "150", threaded: "56" }, { length: "160", threaded: "56" },
        { length: "180", threaded: "56" }, { length: "200", threaded: "56" }
      ]
    },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] }
  },
  {
    size: "M24",
    diameter: "24.0",
    pitch: { "*Coarse": "3.0", Fine: "2.0", ExtraFine: "-" },
    tapDrill: { "*Coarse": "21.0", Fine: "22.0", ExtraFine: "-" },
    clearanceHole: { Close: "25.0", "*Normal": "26.0", Loose: "28.0" },
    SHCS: {
      driverSize: "19.0", headDiam: "36.39", headHeight: "24.00", transitionDiameter: "26.40",
      lengths: [
        { length: "30", threaded: "30" }, { length: "35", threaded: "35" }, { length: "40", threaded: "40" },
        { length: "45", threaded: "45" }, { length: "50", threaded: "50" }, { length: "55", threaded: "54" },
        { length: "60", threaded: "54" }, { length: "65", threaded: "54" }, { length: "70", threaded: "54" },
        { length: "80", threaded: "54" }, { length: "90", threaded: "54" }, { length: "100", threaded: "54" },
        { length: "110", threaded: "54" }, { length: "120", threaded: "54" }, { length: "130", threaded: "60" },
        { length: "140", threaded: "60" }, { length: "150", threaded: "60" }, { length: "160", threaded: "60" },
        { length: "180", threaded: "60" }, { length: "200", threaded: "60" }
      ]
    },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] }
  },
  {
    size: "M30",
    diameter: "30.0",
    pitch: { "*Coarse": "3.5", Fine: "2.0", ExtraFine: "-" },
    tapDrill: { "*Coarse": "26.5", Fine: "28.0", ExtraFine: "-" },
    clearanceHole: { Close: "31.0", "*Normal": "33.0", Loose: "35.0" },
    SHCS: {
      driverSize: "22.0", headDiam: "45.39", headHeight: "30.00", transitionDiameter: "33.40",
      lengths: [
        { length: "40", threaded: "40" }, { length: "45", threaded: "45" }, { length: "50", threaded: "50" },
        { length: "55", threaded: "55" }, { length: "60", threaded: "60" }, { length: "65", threaded: "65" },
        { length: "70", threaded: "66" }, { length: "80", threaded: "66" }, { length: "90", threaded: "66" },
        { length: "100", threaded: "66" }, { length: "110", threaded: "66" }, { length: "120", threaded: "66" },
        { length: "130", threaded: "72" }, { length: "140", threaded: "72" }, { length: "150", threaded: "72" },
        { length: "160", threaded: "72" }, { length: "180", threaded: "72" }, { length: "200", threaded: "72" }
      ]
    },
    FHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] },
    BHCS: { driverSize: "-", headDiam: "-", headHeight: "-", lengths: [] }
  }
];

// Labels and units shown in the side panel, in display order.
// key must match a field name on the objects above.
const screwFields = [
  { key: "diameter",      label: "Screw Diameter - Nominal",      unit: "mm" },
  { key: "pitch",         label: "Pitch - ISO 262",     unit: "mm" },
  { key: "tapDrill",      label: "Tap drill - ISO 2306",      unit: "mm" },
  { key: "clearanceHole", label: "Clearance hole size - ISO 273", unit: "mm" },
];

// Labels and units shown in the SHCS side panel, in display order.
// key must match a field name on the SHCS sub-object above.
const shcsFields = [
  { key: "driverSize",    label: "Driver Size - Nominal",         unit: "mm" },
  { key: "headDiam",      label: "Head Diam. - MAX.",           unit: "mm" },
  { key: "headHeight",    label: "Head Height - MAX.",         unit: "mm" },
  { key: "transitionDiameter", label: "Max Transition Diam.",     unit: "mm" },
];

// Labels and units shown in the FHCS side panel, in display order.
// key must match a field name on the FHCS sub-object above.
const fhcsFields = [
  { key: "driverSize", label: "Driver Size - Nominal", unit: "mm" },
  { key: "headDiam",   label: "Head Diam. - TSC",   unit: "mm" },
  { key: "headHeight", label: "Head Height - REF ONLY", unit: "mm" },
];

// Labels and units shown in the BHCS side panel, in display order.
// key must match a field name on the BHCS sub-object above.
const bhcsFields = [
  { key: "driverSize", label: "Driver Size - Nominal", unit: "mm" },
  { key: "headDiam",   label: "Head Diam. - MAX.",   unit: "mm" },
  { key: "headHeight", label: "Head Height - MAX.", unit: "mm" },
];
