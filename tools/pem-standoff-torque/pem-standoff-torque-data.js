// Reference data for the PEM standoff torque plot (pem-standoff-torque.html):
// the maximum recommended tightening torque of the mating screw threaded into
// a PEM self-clinching standoff, per standoff material, with the standoff's
// installation and performance values in the bulletin's test sheets.
//
// GENERATED — the pemStandoffSeries block below is rebuilt from
// assets/standards/PEM/Penn Engineering - Standoff Torques.xlsx by
// scripts/generate_pem_standoff_torque_data.py. Edit the workbook and rerun
// the script rather than editing the block by hand; anything outside the block
// (this comment) is left alone.
//
// Shape:
//
//   pemStandoffSeries = [{
//     key:        stable id, also the localStorage identity of the series
//     label:      the series' legend head text ("SO / BSO", ...)
//     title:      the source table's title, minus " - Metric"
//     footnotes:  the source's notes for the table, as plain sentences
//     materials: [{               // the standoff materials this table lists,
//       name:  "Stainless Steel", // in sheet order — the only ones the page
//       types: ["SOS", "BSOS"],   // lets a visitor tick for this table
//     }, ...]
//     testSheets: the sheet materials the performance values were measured in
//                 ("1.5 mm 5052-H34 Aluminum", ...)
//     rows: [{
//       thread:      as printed, e.g. "M3" or "3.5M3" (a 3.5 mm body, M3 thread)
//       size:        the thread size it belongs to on the slider, e.g. "M3"
//       diameter:    that size as a number, for sorting the slider
//       material:    one of the table's material names
//       torque:      N·m, max. recommended tightening torque for the mating screw
//       performance: one entry per testSheets entry, same order, or null where
//                    the source prints dashes (aluminum in cold-rolled steel):
//                    { installation: kN, pushout: N, torqueOut: N·m, pullThru: N }
//     }, ...]                  // sheet order; the app groups them by size
//   }, ...]
//
// Values are strings exactly as the source tables print them ("0.55", "2"),
// since a printed trailing zero is significant and this page only plots and
// prints the values. pem-standoff-torque-app.js parseFloat()s the torques for
// the plot.

const pemStandoffSeries = [
  {
    key: "SO",
    label: "SO / BSO",
    title: "PEM® SO™/SOS™/SOA™/BSO™/BSOS™/BSOA™ Standoffs",
    footnotes: ["Steel standoffs (SO™, BSO™) are hardened carbon steel, stainless (SOS™, BSOS™) 300 series stainless steel (Material and Finish Specifications, page SO-8).", "Installation forces are for general reference: confirm complete installation by the proper seating of the fastener. Other performance values are averages with proper installation; mounting hole size, sheet material and installation procedure can change them, so testing in the application is recommended.", "Torque-out and pull-thru: joint failure depends on the strength and type of screw used, and in some cases is in the screw rather than the standoff.", "Performance data for SO™ standoffs installed into copper sheets is in a separate PEM® tech sheet."],
    materials: [
      { name: "Steel", types: ["SO", "BSO"] },
      { name: "Stainless Steel", types: ["SOS", "BSOS"] },
      { name: "Aluminum", types: ["SOA", "BSOA"] },
    ],
    testSheets: ["1.5 mm 5052-H34 Aluminum", "1.5 mm Cold-rolled Steel"],
    rows: [
      { thread: "M3", size: "M3", diameter: 3, material: "Steel", torque: "0.55", performance: [
        { installation: "4.9", pushout: "710", torqueOut: "1.24", pullThru: "1245" },
        { installation: "9.8", pushout: "1000", torqueOut: "2.15", pullThru: "1465" },
      ] },
      { thread: "M3", size: "M3", diameter: 3, material: "Stainless Steel", torque: "0.44", performance: [
        { installation: "4.9", pushout: "710", torqueOut: "1.24", pullThru: "996" },
        { installation: "9.8", pushout: "1000", torqueOut: "2.15", pullThru: "1172" },
      ] },
      { thread: "M3", size: "M3", diameter: 3, material: "Aluminum", torque: "0.33", performance: [
        { installation: "4.9", pushout: "710", torqueOut: "1.24", pullThru: "747" },
        null,
      ] },
      { thread: "3.5M3", size: "M3", diameter: 3, material: "Steel", torque: "0.55", performance: [
        { installation: "7.6", pushout: "1330", torqueOut: "2.82", pullThru: "1375" },
        { installation: "14.7", pushout: "1860", torqueOut: "3.95", pullThru: "1690" },
      ] },
      { thread: "3.5M3", size: "M3", diameter: 3, material: "Stainless Steel", torque: "0.44", performance: [
        { installation: "7.6", pushout: "1330", torqueOut: "2.82", pullThru: "1100" },
        { installation: "14.7", pushout: "1860", torqueOut: "3.95", pullThru: "1352" },
      ] },
      { thread: "3.5M3", size: "M3", diameter: 3, material: "Aluminum", torque: "0.33", performance: [
        { installation: "7.6", pushout: "1330", torqueOut: "2.82", pullThru: "825" },
        null,
      ] },
      { thread: "M3.5", size: "M3.5", diameter: 3.5, material: "Steel", torque: "0.91", performance: [
        { installation: "7.6", pushout: "1330", torqueOut: "2.82", pullThru: "1375" },
        { installation: "14.7", pushout: "1860", torqueOut: "3.95", pullThru: "1690" },
      ] },
      { thread: "M3.5", size: "M3.5", diameter: 3.5, material: "Stainless Steel", torque: "0.73", performance: [
        { installation: "7.6", pushout: "1330", torqueOut: "2.82", pullThru: "1100" },
        { installation: "14.7", pushout: "1860", torqueOut: "3.95", pullThru: "1352" },
      ] },
      { thread: "M3.5", size: "M3.5", diameter: 3.5, material: "Aluminum", torque: "0.55", performance: [
        { installation: "7.6", pushout: "1330", torqueOut: "2.82", pullThru: "825" },
        null,
      ] },
      { thread: "M4", size: "M4", diameter: 4, material: "Steel", torque: "2", performance: [
        { installation: "10.7", pushout: "1780", torqueOut: "5.08", pullThru: "2575" },
        { installation: "17.8", pushout: "2490", torqueOut: "8.47", pullThru: "3110" },
      ] },
      { thread: "M4", size: "M4", diameter: 4, material: "Stainless Steel", torque: "1.6", performance: [
        { installation: "10.7", pushout: "1780", torqueOut: "5.08", pullThru: "2060" },
        { installation: "17.8", pushout: "2490", torqueOut: "8.47", pullThru: "2488" },
      ] },
      { thread: "M4", size: "M4", diameter: 4, material: "Aluminum", torque: "1.2", performance: [
        { installation: "10.7", pushout: "1780", torqueOut: "5.08", pullThru: "1545" },
        null,
      ] },
      { thread: "M5", size: "M5", diameter: 5, material: "Steel", torque: "3.6", performance: [
        { installation: "10.7", pushout: "1780", torqueOut: "5.08", pullThru: "2575" },
        { installation: "17.8", pushout: "2490", torqueOut: "8.47", pullThru: "3110" },
      ] },
      { thread: "M5", size: "M5", diameter: 5, material: "Stainless Steel", torque: "2.88", performance: [
        { installation: "10.7", pushout: "1780", torqueOut: "5.08", pullThru: "2060" },
        { installation: "17.8", pushout: "2490", torqueOut: "8.47", pullThru: "2488" },
      ] },
      { thread: "M5", size: "M5", diameter: 5, material: "Aluminum", torque: "2.16", performance: [
        { installation: "10.7", pushout: "1780", torqueOut: "5.08", pullThru: "1545" },
        null,
      ] },
    ],
  },
  {
    key: "SO4",
    label: "SO4 / BSO4",
    title: "PEM® SO4™/BSO4™ Standoffs",
    footnotes: ["SO4™/BSO4™ standoffs are hardened 400 series stainless steel, for installing into stainless steel sheets.", "Installation forces are for general reference: confirm complete installation by the proper seating of the fastener. Other performance values are averages with proper installation; mounting hole size, sheet material and installation procedure can change them, so testing in the application is recommended.", "Torque-out and pull-thru: joint failure depends on the strength and type of screw used, and in some cases is in the screw rather than the standoff."],
    materials: [
      { name: "Stainless Steel", types: ["SO4", "BSO4"] },
    ],
    testSheets: ["1.3 mm 300 Series Stainless Steel"],
    rows: [
      { thread: "M3", size: "M3", diameter: 3, material: "Stainless Steel", torque: "0.55", performance: [
        { installation: "24.5", pushout: "1493", torqueOut: "2.36", pullThru: "2650" },
      ] },
      { thread: "3.5M3", size: "M3", diameter: 3, material: "Stainless Steel", torque: "0.55", performance: [
        { installation: "42.3", pushout: "2877", torqueOut: "3.06", pullThru: "3025" },
      ] },
      { thread: "M3.5", size: "M3.5", diameter: 3.5, material: "Stainless Steel", torque: "0.91", performance: [
        { installation: "42.3", pushout: "2877", torqueOut: "3.06", pullThru: "3025" },
      ] },
      { thread: "M4", size: "M4", diameter: 4, material: "Stainless Steel", torque: "2", performance: [
        { installation: "46.7", pushout: "4003", torqueOut: "8.89", pullThru: "6458" },
      ] },
      { thread: "M5", size: "M5", diameter: 5, material: "Stainless Steel", torque: "3.6", performance: [
        { installation: "46.7", pushout: "4003", torqueOut: "8.89", pullThru: "6226" },
      ] },
    ],
  },
  {
    key: "DSO",
    label: "DSO",
    title: "PEM® DSOS™/DSO™ Standoffs",
    footnotes: ["One torque and one set of performance values are given for both DSO™ (steel) and DSOS™ (stainless steel).", "Installation forces are for general reference: confirm complete installation by the proper seating of the fastener. Other performance values are averages with proper installation; mounting hole size, sheet material and installation procedure can change them, so testing in the application is recommended.", "Torque-out and pull-thru: joint failure depends on the strength and type of screw used, and in some cases is in the screw rather than the standoff."],
    materials: [
      { name: "Steel", types: ["DSO"] },
      { name: "Stainless Steel", types: ["DSOS"] },
    ],
    testSheets: ["1 mm 5052-H34 Aluminum", "1 mm Cold-rolled Steel"],
    rows: [
      { thread: "M3", size: "M3", diameter: 3, material: "Steel", torque: "0.44", performance: [
        { installation: "3.1", pushout: "223", torqueOut: "1.1", pullThru: "1422" },
        { installation: "4.9", pushout: "334", torqueOut: "1.1", pullThru: "1587" },
      ] },
      { thread: "M3", size: "M3", diameter: 3, material: "Stainless Steel", torque: "0.44", performance: [
        { installation: "3.1", pushout: "223", torqueOut: "1.1", pullThru: "1422" },
        { installation: "4.9", pushout: "334", torqueOut: "1.1", pullThru: "1587" },
      ] },
    ],
  },
];
