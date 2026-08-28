// Reference data for the screw size estimation tool.
//
// Two halves, and they're maintained differently:
//
//   1. GENERATED — screwStrengthSeries, screwStrengthLoadTypes,
//      screwStrengthGrades, screwStrengthThreads, screwStrengthNotes.
//      Don't hand-edit these. They're produced by
//      scripts/generate_screw_strength_data.py from ISO 898-1 Tables 4-7 in
//      assets/standards/ISO/screw/"ISO Standards - ISO 898-1.xlsx". To
//      correct a value, fix the workbook and rerun
//      `python scripts/generate_screw_strength_data.py`.
//
//   2. HAND-MAINTAINED — screwStrengthLoadCases, screwStrengthTighteningMethods.
//      These aren't in ISO 898-1; they're the estimation method's own step
//      counts (see the block comment above them). Edit them here.
//
// THREADS: one flat array covering both thread series, sorted by diameter
// ascending then pitch descending, each row tagged with `series` ("coarse" or
// "fine"). screw-strength-app.js shows only the series whose keys are in its
// shown-series set — which today is just "coarse" — and filtering preserves
// the sort order, so turning "fine" on later needs no data change and no
// re-sorting: the table just gains M10x1.25 and M10x1 rows below M10x1.5.
//
// LOADS: each thread's `loads` map is keyed by load type first
// ("proof" / "tensile") and then by property class key, so a load-type toggle
// alongside the existing column toggles is a one-line change in the app. A
// class ISO 898-1 doesn't tabulate at a size (9.8 stops at M16) is absent
// from the map rather than holding a placeholder, so the app tests for a
// number and skips the rest — in the table and in the size stepping.
//
// PROPERTY CLASS KEYS: the class designation itself ("8.8"). These are the
// localStorage identity of each column checkbox, so renaming one resets a
// visitor's saved column selection.

const screwStrengthSeries = [
  { key: "coarse", label: "ISO metric coarse pitch thread", shownByDefault: true },
  { key: "fine", label: "ISO metric fine pitch thread", shownByDefault: false },
];

const screwStrengthLoadTypes = [
  {
    key: "proof",
    label: "Proof loads",
    description: "Proof load, Fp (As,nom × Sp,nom), N",
    shownByDefault: true,
  },
  {
    key: "tensile",
    label: "Minimum ultimate tensile loads",
    description: "Minimum ultimate tensile load, Fm,min (As,nom × Rm,min), N",
    shownByDefault: false,
  },
];

const screwStrengthGrades = [
  { key: "4.6", label: "4.6", designation: "4.6", shownByDefault: false },
  { key: "4.8", label: "4.8", designation: "4.8", shownByDefault: false },
  { key: "5.6", label: "5.6", designation: "5.6", shownByDefault: false },
  { key: "5.8", label: "5.8", designation: "5.8", shownByDefault: false },
  { key: "6.8", label: "6.8", designation: "6.8", shownByDefault: false },
  { key: "8.8", label: "8.8", designation: "8.8", shownByDefault: true },
  { key: "9.8", label: "9.8", designation: "9.8", shownByDefault: false },
  { key: "10.9", label: "10.9", designation: "10.9", shownByDefault: true },
  { key: "12.9", label: "12.9", designation: "12.9/12.9", shownByDefault: true },
];

const screwStrengthThreads = [
  {
    designation: "M3x0.5", size: "M3", diameter: 3, pitch: 0.5, series: "coarse", stressArea: 5.03,
    loads: {
      proof: { "4.6": 1130, "4.8": 1560, "5.6": 1410, "5.8": 1910, "6.8": 2210, "8.8": 2920, "9.8": 3270, "10.9": 4180, "12.9": 4880 },
      tensile: { "4.6": 2010, "4.8": 2110, "5.6": 2510, "5.8": 2620, "6.8": 3020, "8.8": 4020, "9.8": 4530, "10.9": 5230, "12.9": 6140 },
    },
  },
  {
    designation: "M3.5x0.6", size: "M3.5", diameter: 3.5, pitch: 0.6, series: "coarse", stressArea: 6.78,
    loads: {
      proof: { "4.6": 1530, "4.8": 2100, "5.6": 1900, "5.8": 2580, "6.8": 2980, "8.8": 3940, "9.8": 4410, "10.9": 5630, "12.9": 6580 },
      tensile: { "4.6": 2710, "4.8": 2850, "5.6": 3390, "5.8": 3530, "6.8": 4070, "8.8": 5420, "9.8": 6100, "10.9": 7050, "12.9": 8270 },
    },
  },
  {
    designation: "M4x0.7", size: "M4", diameter: 4, pitch: 0.7, series: "coarse", stressArea: 8.78,
    loads: {
      proof: { "4.6": 1980, "4.8": 2720, "5.6": 2460, "5.8": 3340, "6.8": 3860, "8.8": 5100, "9.8": 5710, "10.9": 7290, "12.9": 8520 },
      tensile: { "4.6": 3510, "4.8": 3690, "5.6": 4390, "5.8": 4570, "6.8": 5270, "8.8": 7020, "9.8": 7900, "10.9": 9130, "12.9": 10700 },
    },
  },
  {
    designation: "M5x0.8", size: "M5", diameter: 5, pitch: 0.8, series: "coarse", stressArea: 14.2,
    loads: {
      proof: { "4.6": 3200, "4.8": 4400, "5.6": 3980, "5.8": 5400, "6.8": 6250, "8.8": 8230, "9.8": 9230, "10.9": 11800, "12.9": 13800 },
      tensile: { "4.6": 5680, "4.8": 5960, "5.6": 7100, "5.8": 7380, "6.8": 8520, "8.8": 11350, "9.8": 12800, "10.9": 14800, "12.9": 17300 },
    },
  },
  {
    designation: "M6x1", size: "M6", diameter: 6, pitch: 1, series: "coarse", stressArea: 20.1,
    loads: {
      proof: { "4.6": 4520, "4.8": 6230, "5.6": 5630, "5.8": 7640, "6.8": 8840, "8.8": 11600, "9.8": 13100, "10.9": 16700, "12.9": 19500 },
      tensile: { "4.6": 8040, "4.8": 8440, "5.6": 10000, "5.8": 10400, "6.8": 12100, "8.8": 16100, "9.8": 18100, "10.9": 20900, "12.9": 24500 },
    },
  },
  {
    designation: "M7x1", size: "M7", diameter: 7, pitch: 1, series: "coarse", stressArea: 28.9,
    loads: {
      proof: { "4.6": 6500, "4.8": 8960, "5.6": 8090, "5.8": 11000, "6.8": 12700, "8.8": 16800, "9.8": 18800, "10.9": 24000, "12.9": 28000 },
      tensile: { "4.6": 11600, "4.8": 12100, "5.6": 14400, "5.8": 15000, "6.8": 17300, "8.8": 23100, "9.8": 26000, "10.9": 30100, "12.9": 35300 },
    },
  },
  {
    designation: "M8x1.25", size: "M8", diameter: 8, pitch: 1.25, series: "coarse", stressArea: 36.6,
    loads: {
      proof: { "4.6": 8240, "4.8": 11400, "5.6": 10200, "5.8": 13900, "6.8": 16100, "8.8": 21200, "9.8": 23800, "10.9": 30400, "12.9": 35500 },
      tensile: { "4.6": 14600, "4.8": 15400, "5.6": 18300, "5.8": 19000, "6.8": 22000, "8.8": 29200, "9.8": 32900, "10.9": 38100, "12.9": 44600 },
    },
  },
  {
    designation: "M8x1", size: "M8", diameter: 8, pitch: 1, series: "fine", stressArea: 39.2,
    loads: {
      proof: { "4.6": 8820, "4.8": 12200, "5.6": 11000, "5.8": 14900, "6.8": 17200, "8.8": 22700, "9.8": 25500, "10.9": 32500, "12.9": 38000 },
      tensile: { "4.6": 15700, "4.8": 16500, "5.6": 19600, "5.8": 20400, "6.8": 23500, "8.8": 31360, "9.8": 35300, "10.9": 40800, "12.9": 47800 },
    },
  },
  {
    designation: "M10x1.5", size: "M10", diameter: 10, pitch: 1.5, series: "coarse", stressArea: 58,
    loads: {
      proof: { "4.6": 13000, "4.8": 18000, "5.6": 16200, "5.8": 22000, "6.8": 25500, "8.8": 33700, "9.8": 37700, "10.9": 48100, "12.9": 56300 },
      tensile: { "4.6": 23200, "4.8": 24400, "5.6": 29000, "5.8": 30200, "6.8": 34800, "8.8": 46400, "9.8": 52200, "10.9": 60300, "12.9": 70800 },
    },
  },
  {
    designation: "M10x1.25", size: "M10", diameter: 10, pitch: 1.25, series: "fine", stressArea: 61.2,
    loads: {
      proof: { "4.6": 13800, "4.8": 19000, "5.6": 17100, "5.8": 23300, "6.8": 26900, "8.8": 35500, "9.8": 39800, "10.9": 50800, "12.9": 59400 },
      tensile: { "4.6": 24500, "4.8": 25700, "5.6": 30600, "5.8": 31800, "6.8": 36700, "8.8": 49000, "9.8": 55100, "10.9": 63600, "12.9": 74700 },
    },
  },
  {
    designation: "M10x1", size: "M10", diameter: 10, pitch: 1, series: "fine", stressArea: 64.5,
    loads: {
      proof: { "4.6": 14500, "4.8": 20000, "5.6": 18100, "5.8": 24500, "6.8": 28400, "8.8": 37400, "9.8": 41900, "10.9": 53500, "12.9": 62700 },
      tensile: { "4.6": 25800, "4.8": 27100, "5.6": 32300, "5.8": 33500, "6.8": 38700, "8.8": 51600, "9.8": 58100, "10.9": 67100, "12.9": 78700 },
    },
  },
  {
    designation: "M12x1.75", size: "M12", diameter: 12, pitch: 1.75, series: "coarse", stressArea: 84.3,
    loads: {
      proof: { "4.6": 19000, "4.8": 26100, "5.6": 23600, "5.8": 32000, "6.8": 37100, "8.8": 48900, "9.8": 54800, "10.9": 70000, "12.9": 81800 },
      tensile: { "4.6": 33700, "4.8": 35400, "5.6": 42200, "5.8": 43800, "6.8": 50600, "8.8": 67400, "9.8": 75900, "10.9": 87700, "12.9": 103000 },
    },
  },
  {
    designation: "M12x1.5", size: "M12", diameter: 12, pitch: 1.5, series: "fine", stressArea: 88.1,
    loads: {
      proof: { "4.6": 19800, "4.8": 27300, "5.6": 24700, "5.8": 33500, "6.8": 38800, "8.8": 51100, "9.8": 57300, "10.9": 73100, "12.9": 85500 },
      tensile: { "4.6": 35200, "4.8": 37000, "5.6": 44100, "5.8": 45800, "6.8": 52900, "8.8": 70500, "9.8": 79300, "10.9": 91600, "12.9": 107000 },
    },
  },
  {
    designation: "M12x1.25", size: "M12", diameter: 12, pitch: 1.25, series: "fine", stressArea: 92.1,
    loads: {
      proof: { "4.6": 20700, "4.8": 28600, "5.6": 25800, "5.8": 35000, "6.8": 40500, "8.8": 53400, "9.8": 59900, "10.9": 76400, "12.9": 89300 },
      tensile: { "4.6": 36800, "4.8": 38700, "5.6": 46100, "5.8": 47900, "6.8": 55300, "8.8": 73700, "9.8": 82900, "10.9": 95800, "12.9": 112000 },
    },
  },
  {
    designation: "M14x2", size: "M14", diameter: 14, pitch: 2, series: "coarse", stressArea: 115,
    loads: {
      proof: { "4.6": 25900, "4.8": 35600, "5.6": 32200, "5.8": 43700, "6.8": 50600, "8.8": 66700, "9.8": 74800, "10.9": 95500, "12.9": 112000 },
      tensile: { "4.6": 46000, "4.8": 48300, "5.6": 57500, "5.8": 59800, "6.8": 69000, "8.8": 92000, "9.8": 104000, "10.9": 120000, "12.9": 140000 },
    },
  },
  {
    designation: "M14x1.5", size: "M14", diameter: 14, pitch: 1.5, series: "fine", stressArea: 125,
    loads: {
      proof: { "4.6": 28100, "4.8": 38800, "5.6": 35000, "5.8": 47500, "6.8": 55000, "8.8": 72500, "9.8": 81200, "10.9": 104000, "12.9": 121000 },
      tensile: { "4.6": 50000, "4.8": 52500, "5.6": 62500, "5.8": 65000, "6.8": 75000, "8.8": 100000, "9.8": 112000, "10.9": 130000, "12.9": 152000 },
    },
  },
  {
    designation: "M16x2", size: "M16", diameter: 16, pitch: 2, series: "coarse", stressArea: 157,
    loads: {
      proof: { "4.6": 35300, "4.8": 48700, "5.6": 44000, "5.8": 59700, "6.8": 69100, "8.8": 91000, "9.8": 102000, "10.9": 130000, "12.9": 152000 },
      tensile: { "4.6": 62800, "4.8": 65900, "5.6": 78500, "5.8": 81600, "6.8": 94000, "8.8": 125000, "9.8": 141000, "10.9": 163000, "12.9": 192000 },
    },
  },
  {
    designation: "M16x1.5", size: "M16", diameter: 16, pitch: 1.5, series: "fine", stressArea: 167,
    loads: {
      proof: { "4.6": 37600, "4.8": 51800, "5.6": 46800, "5.8": 63500, "6.8": 73500, "8.8": 96900, "9.8": 109000, "10.9": 139000, "12.9": 162000 },
      tensile: { "4.6": 66800, "4.8": 70100, "5.6": 83500, "5.8": 86800, "6.8": 100000, "8.8": 134000, "9.8": 150000, "10.9": 174000, "12.9": 204000 },
    },
  },
  {
    designation: "M18x2.5", size: "M18", diameter: 18, pitch: 2.5, series: "coarse", stressArea: 192,
    loads: {
      proof: { "4.6": 43200, "4.8": 59500, "5.6": 53800, "5.8": 73000, "6.8": 84500, "8.8": 115000, "10.9": 159000, "12.9": 186000 },
      tensile: { "4.6": 76800, "4.8": 80600, "5.6": 96000, "5.8": 99800, "6.8": 115000, "8.8": 159000, "10.9": 200000, "12.9": 234000 },
    },
  },
  {
    designation: "M18x1.5", size: "M18", diameter: 18, pitch: 1.5, series: "fine", stressArea: 216,
    loads: {
      proof: { "4.6": 48600, "4.8": 67000, "5.6": 60500, "5.8": 82100, "6.8": 95000, "8.8": 130000, "10.9": 179000, "12.9": 210000 },
      tensile: { "4.6": 86400, "4.8": 90700, "5.6": 108000, "5.8": 112000, "6.8": 130000, "8.8": 179000, "10.9": 225000, "12.9": 264000 },
    },
  },
  {
    designation: "M20x2.5", size: "M20", diameter: 20, pitch: 2.5, series: "coarse", stressArea: 245,
    loads: {
      proof: { "4.6": 55100, "4.8": 76000, "5.6": 68600, "5.8": 93100, "6.8": 108000, "8.8": 147000, "10.9": 203000, "12.9": 238000 },
      tensile: { "4.6": 98000, "4.8": 103000, "5.6": 122000, "5.8": 127000, "6.8": 147000, "8.8": 203000, "10.9": 255000, "12.9": 299000 },
    },
  },
  {
    designation: "M20x1.5", size: "M20", diameter: 20, pitch: 1.5, series: "fine", stressArea: 272,
    loads: {
      proof: { "4.6": 61200, "4.8": 84300, "5.6": 76200, "5.8": 103000, "6.8": 120000, "8.8": 163000, "10.9": 226000, "12.9": 264000 },
      tensile: { "4.6": 109000, "4.8": 114000, "5.6": 136000, "5.8": 141000, "6.8": 163000, "8.8": 226000, "10.9": 283000, "12.9": 332000 },
    },
  },
  {
    designation: "M22x2.5", size: "M22", diameter: 22, pitch: 2.5, series: "coarse", stressArea: 303,
    loads: {
      proof: { "4.6": 68200, "4.8": 93900, "5.6": 84800, "5.8": 115000, "6.8": 133000, "8.8": 182000, "10.9": 252000, "12.9": 294000 },
      tensile: { "4.6": 121000, "4.8": 127000, "5.6": 152000, "5.8": 158000, "6.8": 182000, "8.8": 252000, "10.9": 315000, "12.9": 370000 },
    },
  },
  {
    designation: "M22x1.5", size: "M22", diameter: 22, pitch: 1.5, series: "fine", stressArea: 333,
    loads: {
      proof: { "4.6": 74900, "4.8": 103000, "5.6": 93200, "5.8": 126000, "6.8": 146000, "8.8": 200000, "10.9": 276000, "12.9": 323000 },
      tensile: { "4.6": 133000, "4.8": 140000, "5.6": 166000, "5.8": 173000, "6.8": 200000, "8.8": 276000, "10.9": 346000, "12.9": 406000 },
    },
  },
  {
    designation: "M24x3", size: "M24", diameter: 24, pitch: 3, series: "coarse", stressArea: 353,
    loads: {
      proof: { "4.6": 79400, "4.8": 109000, "5.6": 98800, "5.8": 134000, "6.8": 155000, "8.8": 212000, "10.9": 293000, "12.9": 342000 },
      tensile: { "4.6": 141000, "4.8": 148000, "5.6": 176000, "5.8": 184000, "6.8": 212000, "8.8": 293000, "10.9": 367000, "12.9": 431000 },
    },
  },
  {
    designation: "M24x2", size: "M24", diameter: 24, pitch: 2, series: "fine", stressArea: 384,
    loads: {
      proof: { "4.6": 86400, "4.8": 119000, "5.6": 108000, "5.8": 146000, "6.8": 169000, "8.8": 230000, "10.9": 319000, "12.9": 372000 },
      tensile: { "4.6": 154000, "4.8": 161000, "5.6": 192000, "5.8": 200000, "6.8": 230000, "8.8": 319000, "10.9": 399000, "12.9": 469000 },
    },
  },
  {
    designation: "M27x3", size: "M27", diameter: 27, pitch: 3, series: "coarse", stressArea: 459,
    loads: {
      proof: { "4.6": 103000, "4.8": 142000, "5.6": 128000, "5.8": 174000, "6.8": 202000, "8.8": 275000, "10.9": 381000, "12.9": 445000 },
      tensile: { "4.6": 184000, "4.8": 193000, "5.6": 230000, "5.8": 239000, "6.8": 275000, "8.8": 381000, "10.9": 477000, "12.9": 560000 },
    },
  },
  {
    designation: "M27x2", size: "M27", diameter: 27, pitch: 2, series: "fine", stressArea: 496,
    loads: {
      proof: { "4.6": 112000, "4.8": 154000, "5.6": 139000, "5.8": 188000, "6.8": 218000, "8.8": 298000, "10.9": 412000, "12.9": 481000 },
      tensile: { "4.6": 198000, "4.8": 208000, "5.6": 248000, "5.8": 258000, "6.8": 298000, "8.8": 412000, "10.9": 516000, "12.9": 605000 },
    },
  },
  {
    designation: "M30x3.5", size: "M30", diameter: 30, pitch: 3.5, series: "coarse", stressArea: 561,
    loads: {
      proof: { "4.6": 126000, "4.8": 174000, "5.6": 157000, "5.8": 213000, "6.8": 247000, "8.8": 337000, "10.9": 466000, "12.9": 544000 },
      tensile: { "4.6": 224000, "4.8": 236000, "5.6": 280000, "5.8": 292000, "6.8": 337000, "8.8": 466000, "10.9": 583000, "12.9": 684000 },
    },
  },
  {
    designation: "M30x2", size: "M30", diameter: 30, pitch: 2, series: "fine", stressArea: 621,
    loads: {
      proof: { "4.6": 140000, "4.8": 192000, "5.6": 174000, "5.8": 236000, "6.8": 273000, "8.8": 373000, "10.9": 515000, "12.9": 602000 },
      tensile: { "4.6": 248000, "4.8": 261000, "5.6": 310000, "5.8": 323000, "6.8": 373000, "8.8": 515000, "10.9": 646000, "12.9": 758000 },
    },
  },
  {
    designation: "M33x3.5", size: "M33", diameter: 33, pitch: 3.5, series: "coarse", stressArea: 694,
    loads: {
      proof: { "4.6": 156000, "4.8": 215000, "5.6": 194000, "5.8": 264000, "6.8": 305000, "8.8": 416000, "10.9": 576000, "12.9": 673000 },
      tensile: { "4.6": 278000, "4.8": 292000, "5.6": 347000, "5.8": 361000, "6.8": 416000, "8.8": 576000, "10.9": 722000, "12.9": 847000 },
    },
  },
  {
    designation: "M33x2", size: "M33", diameter: 33, pitch: 2, series: "fine", stressArea: 761,
    loads: {
      proof: { "4.6": 171000, "4.8": 236000, "5.6": 213000, "5.8": 289000, "6.8": 335000, "8.8": 457000, "10.9": 632000, "12.9": 738000 },
      tensile: { "4.6": 304000, "4.8": 320000, "5.6": 380000, "5.8": 396000, "6.8": 457000, "8.8": 632000, "10.9": 791000, "12.9": 928000 },
    },
  },
  {
    designation: "M36x4", size: "M36", diameter: 36, pitch: 4, series: "coarse", stressArea: 817,
    loads: {
      proof: { "4.6": 184000, "4.8": 253000, "5.6": 229000, "5.8": 310000, "6.8": 359000, "8.8": 490000, "10.9": 678000, "12.9": 792000 },
      tensile: { "4.6": 327000, "4.8": 343000, "5.6": 408000, "5.8": 425000, "6.8": 490000, "8.8": 678000, "10.9": 850000, "12.9": 997000 },
    },
  },
  {
    designation: "M36x3", size: "M36", diameter: 36, pitch: 3, series: "fine", stressArea: 865,
    loads: {
      proof: { "4.6": 195000, "4.8": 268000, "5.6": 242000, "5.8": 329000, "6.8": 381000, "8.8": 519000, "10.9": 718000, "12.9": 839000 },
      tensile: { "4.6": 346000, "4.8": 363000, "5.6": 432000, "5.8": 450000, "6.8": 519000, "8.8": 718000, "10.9": 900000, "12.9": 1055000 },
    },
  },
  {
    designation: "M39x4", size: "M39", diameter: 39, pitch: 4, series: "coarse", stressArea: 976,
    loads: {
      proof: { "4.6": 220000, "4.8": 303000, "5.6": 273000, "5.8": 371000, "6.8": 429000, "8.8": 586000, "10.9": 810000, "12.9": 947000 },
      tensile: { "4.6": 390000, "4.8": 410000, "5.6": 488000, "5.8": 508000, "6.8": 586000, "8.8": 810000, "10.9": 1020000, "12.9": 1200000 },
    },
  },
  {
    designation: "M39x3", size: "M39", diameter: 39, pitch: 3, series: "fine", stressArea: 1030,
    loads: {
      proof: { "4.6": 232000, "4.8": 319000, "5.6": 288000, "5.8": 391000, "6.8": 453000, "8.8": 618000, "10.9": 855000, "12.9": 999000 },
      tensile: { "4.6": 412000, "4.8": 433000, "5.6": 515000, "5.8": 536000, "6.8": 618000, "8.8": 855000, "10.9": 1070000, "12.9": 1260000 },
    },
  },
];

const screwStrengthNotes = {
  proof: [
    "For fasteners with thread tolerance 6az in accordance with ISO 965-4 subject to hot dip galvanizing, reduced values in accordance with ISO 10684:2004, Annex A, apply. (Affected cells: M8 & M10 in columns 4.6, 5.6, 8.8, 10.9)",
    "For structural bolting: 50,700 N (for M12), 68,800 N (for M14) and 94,500 N (for M16), instead of the table value in the 8.8 column.",
  ],
  tensile: [
    "For fasteners with thread tolerance 6az in accordance with ISO 965-4 subject to hot dip galvanizing, reduced values in accordance with ISO 10684:2004, Annex A, apply. (Affected cells: M8 & M10 in columns 4.6, 5.6, 8.8, 10.9)",
    "For structural bolting: 50,700 N (for M12), 68,800 N (for M14) and 94,500 N (for M16), instead of the table value in the 8.8 column.",
  ],
};

// --- Estimation method (hand-maintained) -----------------------------------
//
// The load condition and the tightening method each add a number of "steps":
// once the smallest screw whose load rating covers the force per bolt is
// found, the estimate moves that many rows further down the table. The two
// step counts add together, so the worst case (transverse loading tightened
// with an uncontrolled powered driver) moves six sizes up from the bare
// minimum, and the best case (yield-point-controlled tightening of a
// statically, centrically loaded joint) moves one.
//
// `image` is the schematic shown in the load condition picker; `shortLabel`
// is its caption, with the full `label` shown in the heading above the row.

const screwStrengthLoadCases = [
  {
    key: "transverse",
    label: "Static or Dynamic Transverse Loading",
    shortLabel: "Transverse",
    steps: 4,
    image: "assets/images/screw-strength/load-transverse.svg",
    shownByDefault: true,
  },
  {
    key: "dynamicEccentric",
    label: "Dynamic Eccentric Axial Force",
    shortLabel: "Dynamic Eccentric",
    steps: 2,
    image: "assets/images/screw-strength/load-dynamic-eccentric.svg",
    shownByDefault: false,
  },
  {
    key: "dynamicCentric",
    label: "Dynamic and Centrical Force",
    shortLabel: "Dynamic Centrical",
    steps: 1,
    image: "assets/images/screw-strength/load-dynamic-centric.svg",
    shownByDefault: false,
  },
  {
    key: "staticEccentric",
    label: "Static and Eccentric Force",
    shortLabel: "Static Eccentric",
    steps: 1,
    image: "assets/images/screw-strength/load-static-eccentric.svg",
    shownByDefault: false,
  },
  {
    key: "staticCentric",
    label: "Static and Centrical Force",
    shortLabel: "Static Centrical",
    steps: 0,
    image: "assets/images/screw-strength/load-static-centric.svg",
    shownByDefault: false,
  },
];

const screwStrengthTighteningMethods = [
  {
    key: "powered",
    label: "Motorized or Pneumatic Torque Driver",
    steps: 2,
    shownByDefault: true,
  },
  {
    key: "poweredChecked",
    label:
      "Motorized Torque Driver Checked by Dynamic Torque Measurement or Elongation Measurement",
    steps: 1,
    shownByDefault: false,
  },
  {
    key: "manualWrench",
    label: "Manual Torque Wrench",
    steps: 1,
    shownByDefault: false,
  },
  {
    key: "yieldPoint",
    label: "Yield Point Controlled / Turn of the Nut",
    steps: 0,
    shownByDefault: false,
  },
];
