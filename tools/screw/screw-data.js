// Reference data for the ISO metric screw thread chart.
// EDITING THIS TABLE: the screwData array is generated — don't hand-edit it.
// It's produced by scripts/generate_screw_data.py from the standards CSVs in
// assets/standards/ISO/screw/ (ISO 262 pitch/inclusion, ISO 2306 tap drills,
// ISO 273 clearance holes, ISO 4762/10642/7380 SHCS/FHCS/BHCS geometry and
// lengths). To add, remove, or correct a value, edit the relevant CSV and
// rerun `python scripts/generate_screw_data.py`. Which sizes appear at all
// is controlled by the "Include?" column in the ISO 262 CSV. Field names
// (the object keys) are what show up as row labels in screw-app.js, so keep
// them matching between the two files if you change the render logic.
//
// SUBLABELS: a field's value can be either a single number/string, or an
// object of { sublabel: value } to show several variants under one label.
// clearanceHole below uses this to show Close/Normal/Loose fit classes.
// pitch and tapDrill use it to show Coarse/Fine/ExtraFine thread series —
// Fine and ExtraFine are "-" for sizes where ISO 262 doesn't define that
// series. The panel renders each sublabel as its own line under the field's
// row — no changes to screw-app.js needed for this.
//
// To bold a sublabel (e.g. to call out the default/standard variant), prefix
// its key with "*", e.g. { "*Coarse": 1.0, Fine: 0.75 }. The "*" is stripped
// before display.
//
// SHCS/FHCS/BHCS: each entry also carries nested `SHCS`, `FHCS`, and `BHCS`
// objects with cap screw head geometry (socket, flat, and button head styles
// respectively, per ISO 4762/10642/7380), each rendered in its own chart row
// below the thread row using the same slider index. A head style not
// offered at a given size gets "-" placeholders and an empty lengths array.
//
// LENGTHS: each SHCS/FHCS/BHCS object also carries a `lengths` array of
// { length, threaded } pairs (both in mm), taken directly from that
// standard's own threaded-length table — the standard lengths that head
// style is available in, and how much of each is threaded. screw-app.js
// renders this as a horizontal chart under that type's table/diagram; when
// length and threaded are equal (fully threaded), the two cells are merged
// into one.

const screwData = [
  {
    size: "M1.6",
    diameter: "1.6",
    pitch: { "*Coarse": "0.35", "Fine": "-", "ExtraFine": "-" },
    tapDrill: { "*Coarse": "1.25", "Fine": "-", "ExtraFine": "-" },
    clearanceHole: { "Close": "1.7", "*Normal": "1.8", "Loose": "2" },
    SHCS: {
      driverSize: "1.5", headDiam: "3.0", headHeight: "1.60", transitionDiameter: "2.00",
      lengths: [
        { length: "2.5", threaded: "2.5" }, { length: "3", threaded: "3" },
        { length: "4", threaded: "4" }, { length: "5", threaded: "5" }, { length: "6", threaded: "6" },
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" }
      ]
    },
    FHCS: {
      driverSize: "-", headDiam: "-", headHeight: "-",
      lengths: []
    },
    BHCS: {
      driverSize: "-", headDiam: "-", headHeight: "-",
      lengths: []
    }
  },
  {
    size: "M2",
    diameter: "2.0",
    pitch: { "*Coarse": "0.4", "Fine": "-", "ExtraFine": "-" },
    tapDrill: { "*Coarse": "1.60", "Fine": "-", "ExtraFine": "-" },
    clearanceHole: { "Close": "2.2", "*Normal": "2.4", "Loose": "2.6" },
    SHCS: {
      driverSize: "1.5", headDiam: "3.8", headHeight: "2.00", transitionDiameter: "2.60",
      lengths: [
        { length: "3", threaded: "3" }, { length: "4", threaded: "4" }, { length: "5", threaded: "5" },
        { length: "6", threaded: "6" }, { length: "8", threaded: "8" },
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "16" }, { length: "20", threaded: "16" }
      ]
    },
    FHCS: {
      driverSize: "-", headDiam: "-", headHeight: "-",
      lengths: []
    },
    BHCS: {
      driverSize: "-", headDiam: "-", headHeight: "-",
      lengths: []
    }
  },
  {
    size: "M2.5",
    diameter: "2.5",
    pitch: { "*Coarse": "0.45", "Fine": "-", "ExtraFine": "-" },
    tapDrill: { "*Coarse": "2.05", "Fine": "-", "ExtraFine": "-" },
    clearanceHole: { "Close": "2.7", "*Normal": "2.9", "Loose": "3.1" },
    SHCS: {
      driverSize: "2.0", headDiam: "4.5", headHeight: "2.50", transitionDiameter: "3.10",
      lengths: [
        { length: "4", threaded: "4" }, { length: "5", threaded: "5" }, { length: "6", threaded: "6" },
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "17" }
      ]
    },
    FHCS: {
      driverSize: "-", headDiam: "-", headHeight: "-",
      lengths: []
    },
    BHCS: {
      driverSize: "-", headDiam: "-", headHeight: "-",
      lengths: []
    }
  },
  {
    size: "M3",
    diameter: "3.0",
    pitch: { "*Coarse": "0.5", "Fine": "-", "ExtraFine": "-" },
    tapDrill: { "*Coarse": "2.50", "Fine": "-", "ExtraFine": "-" },
    clearanceHole: { "Close": "3.2", "*Normal": "3.4", "Loose": "3.6" },
    SHCS: {
      driverSize: "2.5", headDiam: "5.5", headHeight: "3.00", transitionDiameter: "3.60",
      lengths: [
        { length: "5", threaded: "5" }, { length: "6", threaded: "6" }, { length: "8", threaded: "8" },
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "18" }, { length: "30", threaded: "18" }
      ]
    },
    FHCS: {
      driverSize: "2.0", headDiam: "6.72", headHeight: "1.86",
      lengths: [
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "18" }
      ]
    },
    BHCS: {
      driverSize: "2.0", headDiam: "6.70", headHeight: "1.65",
      lengths: [
        { length: "6", threaded: "6" }, { length: "8", threaded: "8" },
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "18" }, { length: "30", threaded: "18" }
      ]
    }
  },
  {
    size: "M4",
    diameter: "4.0",
    pitch: { "*Coarse": "0.7", "Fine": "-", "ExtraFine": "-" },
    tapDrill: { "*Coarse": "3.30", "Fine": "-", "ExtraFine": "-" },
    clearanceHole: { "Close": "4.3", "*Normal": "4.5", "Loose": "4.8" },
    SHCS: {
      driverSize: "3.0", headDiam: "7.0", headHeight: "4.00", transitionDiameter: "4.70",
      lengths: [
        { length: "6", threaded: "6" }, { length: "8", threaded: "8" },
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "25" }, { length: "30", threaded: "20" },
        { length: "35", threaded: "20" }, { length: "40", threaded: "20" }
      ]
    },
    FHCS: {
      driverSize: "2.5", headDiam: "8.96", headHeight: "2.48",
      lengths: [
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "20" }, { length: "35", threaded: "20" },
        { length: "40", threaded: "20" }
      ]
    },
    BHCS: {
      driverSize: "2.5", headDiam: "7.60", headHeight: "2.20",
      lengths: [
        { length: "6", threaded: "6" }, { length: "8", threaded: "8" },
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "25" }, { length: "30", threaded: "20" },
        { length: "35", threaded: "20" }, { length: "40", threaded: "20" }
      ]
    }
  },
  {
    size: "M5",
    diameter: "5.0",
    pitch: { "*Coarse": "0.8", "Fine": "-", "ExtraFine": "-" },
    tapDrill: { "*Coarse": "4.20", "Fine": "-", "ExtraFine": "-" },
    clearanceHole: { "Close": "5.3", "*Normal": "5.5", "Loose": "5.8" },
    SHCS: {
      driverSize: "4.0", headDiam: "8.5", headHeight: "5.00", transitionDiameter: "5.70",
      lengths: [
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "22" }, { length: "35", threaded: "22" },
        { length: "40", threaded: "22" }, { length: "45", threaded: "22" },
        { length: "50", threaded: "22" }
      ]
    },
    FHCS: {
      driverSize: "3.0", headDiam: "11.20", headHeight: "3.10",
      lengths: [
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "30" }, { length: "35", threaded: "22" },
        { length: "40", threaded: "22" }, { length: "45", threaded: "22" },
        { length: "50", threaded: "22" }
      ]
    },
    BHCS: {
      driverSize: "3.0", headDiam: "9.50", headHeight: "2.75",
      lengths: [
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "22" }, { length: "35", threaded: "22" },
        { length: "40", threaded: "22" }, { length: "45", threaded: "22" },
        { length: "50", threaded: "22" }
      ]
    }
  },
  {
    size: "M6",
    diameter: "6.0",
    pitch: { "*Coarse": "1", "Fine": "-", "ExtraFine": "-" },
    tapDrill: { "*Coarse": "5.00", "Fine": "-", "ExtraFine": "-" },
    clearanceHole: { "Close": "6.4", "*Normal": "6.6", "Loose": "7" },
    SHCS: {
      driverSize: "5.0", headDiam: "10.0", headHeight: "6.00", transitionDiameter: "6.80",
      lengths: [
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "25" }, { length: "30", threaded: "30" },
        { length: "35", threaded: "24" }, { length: "40", threaded: "24" },
        { length: "45", threaded: "24" }, { length: "50", threaded: "24" },
        { length: "55", threaded: "24" }, { length: "60", threaded: "24" }
      ]
    },
    FHCS: {
      driverSize: "4.0", headDiam: "13.44", headHeight: "3.72",
      lengths: [
        { length: "8", threaded: "8" }, { length: "10", threaded: "10" },
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "30" }, { length: "35", threaded: "35" },
        { length: "40", threaded: "24" }, { length: "45", threaded: "24" },
        { length: "50", threaded: "24" }, { length: "55", threaded: "24" },
        { length: "60", threaded: "24" }
      ]
    },
    BHCS: {
      driverSize: "4.0", headDiam: "10.50", headHeight: "3.30",
      lengths: [
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "25" }, { length: "30", threaded: "30" },
        { length: "35", threaded: "24" }, { length: "40", threaded: "24" },
        { length: "45", threaded: "24" }, { length: "50", threaded: "24" },
        { length: "55", threaded: "24" }, { length: "60", threaded: "24" }
      ]
    }
  },
  {
    size: "M8",
    diameter: "8.0",
    pitch: { "*Coarse": "1.25", "Fine": "1", "ExtraFine": "-" },
    tapDrill: { "*Coarse": "6.80", "Fine": "7.00", "ExtraFine": "-" },
    clearanceHole: { "Close": "8.4", "*Normal": "9", "Loose": "10" },
    SHCS: {
      driverSize: "6.0", headDiam: "13.0", headHeight: "8.00", transitionDiameter: "9.20",
      lengths: [
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "30" }, { length: "35", threaded: "35" },
        { length: "40", threaded: "28" }, { length: "45", threaded: "28" },
        { length: "50", threaded: "28" }, { length: "55", threaded: "28" },
        { length: "60", threaded: "28" }, { length: "65", threaded: "28" },
        { length: "70", threaded: "28" }, { length: "80", threaded: "28" }
      ]
    },
    FHCS: {
      driverSize: "5.0", headDiam: "17.92", headHeight: "4.96",
      lengths: [
        { length: "10", threaded: "10" }, { length: "12", threaded: "12" },
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "25" }, { length: "30", threaded: "30" },
        { length: "35", threaded: "35" }, { length: "40", threaded: "40" },
        { length: "45", threaded: "45" }, { length: "50", threaded: "28" },
        { length: "55", threaded: "28" }, { length: "60", threaded: "28" },
        { length: "65", threaded: "28" }, { length: "70", threaded: "28" },
        { length: "80", threaded: "28" }
      ]
    },
    BHCS: {
      driverSize: "5.0", headDiam: "14.00", headHeight: "4.40",
      lengths: [
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "30" }, { length: "35", threaded: "35" },
        { length: "40", threaded: "28" }, { length: "45", threaded: "28" },
        { length: "50", threaded: "28" }, { length: "55", threaded: "28" },
        { length: "60", threaded: "28" }, { length: "65", threaded: "28" },
        { length: "70", threaded: "28" }, { length: "80", threaded: "28" }
      ]
    }
  },
  {
    size: "M10",
    diameter: "10.0",
    pitch: { "*Coarse": "1.5", "Fine": "1.25", "ExtraFine": "1" },
    tapDrill: { "*Coarse": "8.50", "Fine": "8.80", "ExtraFine": "9.00" },
    clearanceHole: { "Close": "10.5", "*Normal": "11", "Loose": "12" },
    SHCS: {
      driverSize: "8.0", headDiam: "16.0", headHeight: "10.00", transitionDiameter: "11.20",
      lengths: [
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "25" }, { length: "30", threaded: "30" },
        { length: "35", threaded: "35" }, { length: "40", threaded: "40" },
        { length: "45", threaded: "32" }, { length: "50", threaded: "32" },
        { length: "55", threaded: "32" }, { length: "60", threaded: "32" },
        { length: "65", threaded: "32" }, { length: "70", threaded: "32" },
        { length: "80", threaded: "32" }, { length: "90", threaded: "32" },
        { length: "100", threaded: "32" }
      ]
    },
    FHCS: {
      driverSize: "6.0", headDiam: "22.40", headHeight: "6.20",
      lengths: [
        { length: "12", threaded: "12" }, { length: "16", threaded: "16" },
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "30" }, { length: "35", threaded: "35" },
        { length: "40", threaded: "40" }, { length: "45", threaded: "45" },
        { length: "50", threaded: "50" }, { length: "55", threaded: "32" },
        { length: "60", threaded: "32" }, { length: "65", threaded: "32" },
        { length: "70", threaded: "32" }, { length: "80", threaded: "32" },
        { length: "90", threaded: "32" }, { length: "100", threaded: "32" }
      ]
    },
    BHCS: {
      driverSize: "6.0", headDiam: "17.50", headHeight: "5.50",
      lengths: [
        { length: "16", threaded: "16" }, { length: "20", threaded: "20" },
        { length: "25", threaded: "25" }, { length: "30", threaded: "30" },
        { length: "35", threaded: "35" }, { length: "40", threaded: "40" },
        { length: "45", threaded: "32" }, { length: "50", threaded: "32" },
        { length: "55", threaded: "32" }, { length: "60", threaded: "32" },
        { length: "65", threaded: "32" }, { length: "70", threaded: "32" },
        { length: "80", threaded: "32" }, { length: "90", threaded: "32" }
      ]
    }
  },
  {
    size: "M12",
    diameter: "12.0",
    pitch: { "*Coarse": "1.75", "Fine": "1.5", "ExtraFine": "1.25" },
    tapDrill: { "*Coarse": "10.20", "Fine": "10.50", "ExtraFine": "10.80" },
    clearanceHole: { "Close": "13", "*Normal": "14", "Loose": "15" },
    SHCS: {
      driverSize: "10.0", headDiam: "18.0", headHeight: "12.00", transitionDiameter: "14.20",
      lengths: [
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "30" }, { length: "35", threaded: "35" },
        { length: "40", threaded: "40" }, { length: "45", threaded: "45" },
        { length: "50", threaded: "36" }, { length: "55", threaded: "36" },
        { length: "60", threaded: "36" }, { length: "65", threaded: "36" },
        { length: "70", threaded: "36" }, { length: "80", threaded: "36" },
        { length: "90", threaded: "36" }, { length: "100", threaded: "36" },
        { length: "110", threaded: "36" }, { length: "120", threaded: "36" }
      ]
    },
    FHCS: {
      driverSize: "8.0", headDiam: "26.88", headHeight: "7.44",
      lengths: [
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "30" }, { length: "35", threaded: "35" },
        { length: "40", threaded: "40" }, { length: "45", threaded: "45" },
        { length: "50", threaded: "50" }, { length: "55", threaded: "55" },
        { length: "60", threaded: "60" }, { length: "65", threaded: "36" },
        { length: "70", threaded: "36" }, { length: "80", threaded: "36" },
        { length: "90", threaded: "36" }, { length: "100", threaded: "36" }
      ]
    },
    BHCS: {
      driverSize: "8.0", headDiam: "21.00", headHeight: "6.60",
      lengths: [
        { length: "20", threaded: "20" }, { length: "25", threaded: "25" },
        { length: "30", threaded: "30" }, { length: "35", threaded: "35" },
        { length: "40", threaded: "40" }, { length: "45", threaded: "45" },
        { length: "50", threaded: "50" }, { length: "55", threaded: "36" },
        { length: "60", threaded: "36" }, { length: "65", threaded: "36" },
        { length: "70", threaded: "36" }, { length: "80", threaded: "36" },
        { length: "90", threaded: "36" }
      ]
    }
  },
  {
    size: "M16",
    diameter: "16.0",
    pitch: { "*Coarse": "2", "Fine": "1.5", "ExtraFine": "-" },
    tapDrill: { "*Coarse": "14.00", "Fine": "14.50", "ExtraFine": "-" },
    clearanceHole: { "Close": "17", "*Normal": "18", "Loose": "19" },
    SHCS: {
      driverSize: "14.0", headDiam: "24.0", headHeight: "16.00", transitionDiameter: "18.20",
      lengths: [
        { length: "25", threaded: "25" }, { length: "30", threaded: "30" },
        { length: "35", threaded: "35" }, { length: "40", threaded: "40" },
        { length: "45", threaded: "45" }, { length: "50", threaded: "50" },
        { length: "55", threaded: "55" }, { length: "60", threaded: "44" },
        { length: "65", threaded: "44" }, { length: "70", threaded: "44" },
        { length: "80", threaded: "44" }, { length: "90", threaded: "44" },
        { length: "100", threaded: "44" }, { length: "110", threaded: "44" },
        { length: "120", threaded: "44" }, { length: "130", threaded: "44" },
        { length: "140", threaded: "44" }, { length: "150", threaded: "44" },
        { length: "160", threaded: "44" }
      ]
    },
    FHCS: {
      driverSize: "10.0", headDiam: "33.60", headHeight: "8.80",
      lengths: [
        { length: "30", threaded: "30" }, { length: "35", threaded: "35" },
        { length: "40", threaded: "40" }, { length: "45", threaded: "45" },
        { length: "50", threaded: "50" }, { length: "55", threaded: "55" },
        { length: "60", threaded: "60" }, { length: "65", threaded: "65" },
        { length: "70", threaded: "70" }, { length: "80", threaded: "44" },
        { length: "90", threaded: "44" }, { length: "100", threaded: "44" }
      ]
    },
    BHCS: {
      driverSize: "10.0", headDiam: "28.00", headHeight: "8.80",
      lengths: [
        { length: "25", threaded: "25" }, { length: "30", threaded: "30" },
        { length: "35", threaded: "35" }, { length: "40", threaded: "40" },
        { length: "45", threaded: "45" }, { length: "50", threaded: "50" },
        { length: "55", threaded: "55" }, { length: "60", threaded: "60" },
        { length: "65", threaded: "44" }, { length: "70", threaded: "44" },
        { length: "80", threaded: "44" }, { length: "90", threaded: "44" }
      ]
    }
  },
  {
    size: "M20",
    diameter: "20.0",
    pitch: { "*Coarse": "2.5", "Fine": "2", "ExtraFine": "1.5" },
    tapDrill: { "*Coarse": "17.50", "Fine": "18.00", "ExtraFine": "18.50" },
    clearanceHole: { "Close": "21", "*Normal": "22", "Loose": "24" },
    SHCS: {
      driverSize: "17.0", headDiam: "30.0", headHeight: "20.00", transitionDiameter: "22.40",
      lengths: [
        { length: "30", threaded: "30" }, { length: "35", threaded: "35" },
        { length: "40", threaded: "40" }, { length: "45", threaded: "45" },
        { length: "50", threaded: "50" }, { length: "55", threaded: "55" },
        { length: "60", threaded: "60" }, { length: "65", threaded: "65" },
        { length: "70", threaded: "52" }, { length: "80", threaded: "52" },
        { length: "90", threaded: "52" }, { length: "100", threaded: "52" },
        { length: "110", threaded: "52" }, { length: "120", threaded: "52" },
        { length: "130", threaded: "52" }, { length: "140", threaded: "52" },
        { length: "150", threaded: "52" }, { length: "160", threaded: "52" },
        { length: "180", threaded: "52" }, { length: "200", threaded: "52" }
      ]
    },
    FHCS: {
      driverSize: "12.0", headDiam: "40.32", headHeight: "10.16",
      lengths: [
        { length: "35", threaded: "35" }, { length: "40", threaded: "40" },
        { length: "45", threaded: "45" }, { length: "50", threaded: "50" },
        { length: "55", threaded: "55" }, { length: "60", threaded: "60" },
        { length: "65", threaded: "65" }, { length: "70", threaded: "70" },
        { length: "80", threaded: "80" }, { length: "90", threaded: "90" },
        { length: "100", threaded: "52" }
      ]
    },
    BHCS: {
      driverSize: "-", headDiam: "-", headHeight: "-",
      lengths: []
    }
  },
  {
    size: "M24",
    diameter: "24.0",
    pitch: { "*Coarse": "3", "Fine": "2", "ExtraFine": "-" },
    tapDrill: { "*Coarse": "21.00", "Fine": "22.00", "ExtraFine": "-" },
    clearanceHole: { "Close": "25", "*Normal": "26", "Loose": "28" },
    SHCS: {
      driverSize: "19.0", headDiam: "36.0", headHeight: "24.00", transitionDiameter: "26.40",
      lengths: [
        { length: "40", threaded: "40" }, { length: "45", threaded: "45" },
        { length: "50", threaded: "50" }, { length: "55", threaded: "55" },
        { length: "60", threaded: "60" }, { length: "65", threaded: "65" },
        { length: "70", threaded: "70" }, { length: "80", threaded: "80" },
        { length: "90", threaded: "60" }, { length: "100", threaded: "60" },
        { length: "110", threaded: "60" }, { length: "120", threaded: "60" },
        { length: "130", threaded: "60" }, { length: "140", threaded: "60" },
        { length: "150", threaded: "60" }, { length: "160", threaded: "50" },
        { length: "180", threaded: "60" }, { length: "200", threaded: "60" }
      ]
    },
    FHCS: {
      driverSize: "-", headDiam: "-", headHeight: "-",
      lengths: []
    },
    BHCS: {
      driverSize: "-", headDiam: "-", headHeight: "-",
      lengths: []
    }
  },
  {
    size: "M30",
    diameter: "30.0",
    pitch: { "*Coarse": "3.5", "Fine": "2", "ExtraFine": "-" },
    tapDrill: { "*Coarse": "26.50", "Fine": "28.00", "ExtraFine": "-" },
    clearanceHole: { "Close": "31", "*Normal": "33", "Loose": "35" },
    SHCS: {
      driverSize: "22.0", headDiam: "45.0", headHeight: "30.00", transitionDiameter: "33.40",
      lengths: [
        { length: "45", threaded: "45" }, { length: "50", threaded: "50" },
        { length: "55", threaded: "55" }, { length: "60", threaded: "60" },
        { length: "65", threaded: "65" }, { length: "70", threaded: "70" },
        { length: "80", threaded: "80" }, { length: "90", threaded: "90" },
        { length: "100", threaded: "72" }, { length: "110", threaded: "72" },
        { length: "120", threaded: "72" }, { length: "130", threaded: "72" },
        { length: "140", threaded: "72" }, { length: "150", threaded: "72" },
        { length: "160", threaded: "72" }, { length: "180", threaded: "72" },
        { length: "200", threaded: "72" }
      ]
    },
    FHCS: {
      driverSize: "-", headDiam: "-", headHeight: "-",
      lengths: []
    },
    BHCS: {
      driverSize: "-", headDiam: "-", headHeight: "-",
      lengths: []
    }
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
