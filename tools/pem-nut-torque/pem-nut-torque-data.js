// Reference data for the PEM nut torque plot (pem-nut-torque.html): the
// recommended tightening torque of the mating screw threaded into a PEM
// self-clinching, broaching or weld nut, per screw material.
//
// GENERATED — the pemNutSeries block below is rebuilt from
// assets/standards/PEM/Penn Engineering - Nut Torques.xlsx by
// scripts/generate_pem_nut_torque_data.py. Edit the workbook and rerun the
// script rather than editing the block by hand; anything outside the block
// (this comment) is left alone.
//
// Shape:
//
//   pemNutSeries = [{
//     key:       stable id, also the localStorage identity of the series
//     label:     series button text ("S", "SH / HNL / H", ...)
//     title:     the source table's title, minus " - Metric"
//     k:         nut factor the table's torques assume, as printed ("0.20")
//     footnotes: the source table's own footnotes, as plain sentences
//     materials: mating screw materials — the plot's X categories — in the
//                order the source table prints its columns. Read per table:
//                CLA has a different column set from the rest.
//     parts: [{
//       partNumber:       as printed, e.g. "S-M3-0ZI" (legend label)
//       size:             thread size read from the part number, e.g. "M3"
//       diameter:         that size as a number, for sorting the slider
//       minAxialStrength: kN, the nut's min. axial strength w/ a PC 12.9 screw
//       screwStrength:    MPa, screw stress needed to develop that strength
//       torque:           N·m, one per entry in `materials`, same order
//     }, ...]                // sheet order; the app groups them by size
//   }, ...]
//
// Values are strings exactly as the source tables print them ("0.40", not
// 0.4), since a printed trailing zero is significant and this page only plots
// and prints the values. pem-nut-torque-app.js parseFloat()s the torques for
// the plot.

const pemNutSeries = [
  {
    key: "S",
    label: "S",
    title: "PEM® Brand S™ Nuts",
    k: "0.20",
    footnotes: [],
    materials: ["Steel PC 4.6", "Steel PC 5.6", "Stainless A2-70", "Steel PC 8.8", "Steel PC 9.8", "Steel PC 10.9", "Steel PC 12.9"],
    parts: [
      { partNumber: "S-M2-0ZI", size: "M2", diameter: 2, minAxialStrength: "2.53", screwStrength: "1220", torque: ["0.15", "0.19", "0.28", "0.40", "0.45", "0.59", "0.61"] },
      { partNumber: "S-M2-1ZI", size: "M2", diameter: 2, minAxialStrength: "2.53", screwStrength: "1220", torque: ["0.15", "0.19", "0.28", "0.40", "0.45", "0.59", "0.68"] },
      { partNumber: "S-M2-2ZI", size: "M2", diameter: 2, minAxialStrength: "2.53", screwStrength: "1220", torque: ["0.15", "0.19", "0.28", "0.40", "0.45", "0.59", "0.68"] },
      { partNumber: "S-M2.5-0ZI", size: "M2.5", diameter: 2.5, minAxialStrength: "3.81", screwStrength: "1220", torque: ["0.28", "0.35", "0.53", "0.75", "0.84", "1.10", "1.18"] },
      { partNumber: "S-M2.5-1ZI", size: "M2.5", diameter: 2.5, minAxialStrength: "4.14", screwStrength: "1220", torque: ["0.31", "0.38", "0.57", "0.81", "0.92", "1.20", "1.32"] },
      { partNumber: "S-M2.5-2ZI", size: "M2.5", diameter: 2.5, minAxialStrength: "4.14", screwStrength: "1220", torque: ["0.31", "0.38", "0.57", "0.81", "0.92", "1.20", "1.40"] },
      { partNumber: "S-M3-0ZI", size: "M3", diameter: 3, minAxialStrength: "5.09", screwStrength: "1220", torque: ["0.45", "0.56", "0.85", "1.20", "1.35", "1.77", "1.88"] },
      { partNumber: "S-M3-1ZI", size: "M3", diameter: 3, minAxialStrength: "5.65", screwStrength: "1220", torque: ["0.50", "0.62", "0.94", "1.33", "1.50", "1.96", "2.09"] },
      { partNumber: "S-M3-2ZI", size: "M3", diameter: 3, minAxialStrength: "6.14", screwStrength: "1220", torque: ["0.54", "0.68", "1.02", "1.45", "1.63", "2.13", "2.49"] },
      { partNumber: "S-M3.5-0ZI", size: "M3.5", diameter: 3.5, minAxialStrength: "5.63", screwStrength: "1220", torque: ["0.58", "0.73", "1.09", "1.55", "1.74", "2.28", "2.42"] },
      { partNumber: "S-M3.5-1ZI", size: "M3.5", diameter: 3.5, minAxialStrength: "6.29", screwStrength: "1220", torque: ["0.65", "0.81", "1.22", "1.73", "1.95", "2.54", "2.71"] },
      { partNumber: "S-M3.5-2ZI", size: "M3.5", diameter: 3.5, minAxialStrength: "7.61", screwStrength: "1220", torque: ["0.79", "0.98", "1.47", "2.10", "2.36", "3.08", "3.29"] },
      { partNumber: "S-M4-0ZI", size: "M4", diameter: 4, minAxialStrength: "7.81", screwStrength: "1220", torque: ["0.92", "1.15", "1.73", "2.46", "2.76", "3.61", "3.88"] },
      { partNumber: "S-M4-1ZI", size: "M4", diameter: 4, minAxialStrength: "8.58", screwStrength: "1220", torque: ["1.01", "1.27", "1.90", "2.70", "3.04", "3.97", "4.27"] },
      { partNumber: "S-M4-2ZI", size: "M4", diameter: 4, minAxialStrength: "10.1", screwStrength: "1220", torque: ["1.20", "1.49", "2.24", "3.19", "3.59", "4.68", "5.05"] },
      { partNumber: "SS-M5-0ZI", size: "M5", diameter: 5, minAxialStrength: "11.2", screwStrength: "1220", torque: ["1.65", "2.06", "3.09", "4.40", "4.95", "6.46", "6.95"] },
      { partNumber: "SS-M5-1ZI", size: "M5", diameter: 5, minAxialStrength: "12.2", screwStrength: "1220", torque: ["1.80", "2.25", "3.37", "4.79", "5.39", "7.04", "7.57"] },
      { partNumber: "SS-M5-2ZI", size: "M5", diameter: 5, minAxialStrength: "14.2", screwStrength: "1220", torque: ["2.09", "2.62", "3.92", "5.58", "6.28", "8.20", "8.82"] },
      { partNumber: "S-M6-00ZI", size: "M6", diameter: 6, minAxialStrength: "23.7", screwStrength: "1220", torque: ["4.20", "5.25", "7.88", "11.2", "12.6", "16.5", "17.8"] },
      { partNumber: "S-M6-0ZI", size: "M6", diameter: 6, minAxialStrength: "24.6", screwStrength: "1220", torque: ["4.35", "5.43", "8.15", "11.6", "13.0", "17.0", "18.9"] },
      { partNumber: "S-M6-1ZI", size: "M6", diameter: 6, minAxialStrength: "24.6", screwStrength: "1220", torque: ["4.35", "5.43", "8.15", "11.6", "13.0", "17.0", "19.9"] },
      { partNumber: "S-M6-2ZI", size: "M6", diameter: 6, minAxialStrength: "24.6", screwStrength: "1220", torque: ["4.35", "5.43", "8.15", "11.6", "13.0", "17.0", "19.9"] },
      { partNumber: "S-M8-1ZI", size: "M8", diameter: 8, minAxialStrength: "44.7", screwStrength: "1220", torque: ["10.5", "13.2", "19.8", "28.1", "31.6", "41.3", "47.0"] },
      { partNumber: "S-M8-2ZI", size: "M8", diameter: 8, minAxialStrength: "44.7", screwStrength: "1220", torque: ["10.5", "13.2", "19.8", "28.1", "31.6", "41.3", "48.3"] },
      { partNumber: "S-M10-1ZI", size: "M10", diameter: 10, minAxialStrength: "70.7", screwStrength: "1220", torque: ["20.9", "26.1", "39.1", "55.7", "62.6", "81.8", "95.7"] },
      { partNumber: "S-M10-2ZI", size: "M10", diameter: 10, minAxialStrength: "70.7", screwStrength: "1220", torque: ["20.9", "26.1", "39.1", "55.7", "62.6", "81.8", "95.7"] },
      { partNumber: "S-M12-1ZI", size: "M12", diameter: 12, minAxialStrength: "102.8", screwStrength: "1220", torque: ["36.4", "45.5", "68.3", "97.1", "109", "143", "167"] },
    ],
  },
  {
    key: "CLS",
    label: "CLS",
    title: "PEM® Brand CLS™ Nuts",
    k: "0.20",
    footnotes: [],
    materials: ["Steel PC 4.6", "Steel PC 5.6", "Stainless A2-70", "Steel PC 8.8", "Steel PC 9.8", "Steel PC 10.9", "Steel PC 12.9"],
    parts: [
      { partNumber: "CLS-M2-0", size: "M2", diameter: 2, minAxialStrength: "1.76", screwStrength: "847", torque: ["0.15", "0.19", "0.28", "0.37", "0.37", "0.37", "0.37"] },
      { partNumber: "CLS-M2-1", size: "M2", diameter: 2, minAxialStrength: "2.00", screwStrength: "966", torque: ["0.15", "0.19", "0.28", "0.40", "0.42", "0.42", "0.42"] },
      { partNumber: "CLS-M2-2", size: "M2", diameter: 2, minAxialStrength: "2.50", screwStrength: "1204", torque: ["0.15", "0.19", "0.28", "0.40", "0.45", "0.52", "0.52"] },
      { partNumber: "CLS-M2.5-0", size: "M2.5", diameter: 2.5, minAxialStrength: "2.71", screwStrength: "868", torque: ["0.28", "0.35", "0.53", "0.71", "0.71", "0.71", "0.71"] },
      { partNumber: "CLS-M2.5-1", size: "M2.5", diameter: 2.5, minAxialStrength: "3.03", screwStrength: "895", torque: ["0.31", "0.38", "0.57", "0.80", "0.80", "0.80", "0.80"] },
      { partNumber: "CLS-M2.5-2", size: "M2.5", diameter: 2.5, minAxialStrength: "3.69", screwStrength: "1087", torque: ["0.31", "0.38", "0.57", "0.81", "0.92", "0.97", "0.97"] },
      { partNumber: "CLS-M3-0", size: "M3", diameter: 3, minAxialStrength: "3.60", screwStrength: "863", torque: ["0.45", "0.56", "0.85", "1.13", "1.13", "1.13", "1.13"] },
      { partNumber: "CLS-M3-1", size: "M3", diameter: 3, minAxialStrength: "4.00", screwStrength: "864", torque: ["0.50", "0.63", "0.94", "1.26", "1.26", "1.26", "1.26"] },
      { partNumber: "CLS-M3-2", size: "M3", diameter: 3, minAxialStrength: "4.80", screwStrength: "953", torque: ["0.54", "0.68", "1.02", "1.45", "1.51", "1.51", "1.51"] },
      { partNumber: "CLS-M3.5-0", size: "M3.5", diameter: 3.5, minAxialStrength: "3.98", screwStrength: "862", torque: ["0.58", "0.73", "1.09", "1.46", "1.46", "1.46", "1.46"] },
      { partNumber: "CLS-M3.5-1", size: "M3.5", diameter: 3.5, minAxialStrength: "4.45", screwStrength: "863", torque: ["0.65", "0.81", "1.22", "1.64", "1.64", "1.64", "1.64"] },
      { partNumber: "CLS-M3.5-2", size: "M3.5", diameter: 3.5, minAxialStrength: "5.40", screwStrength: "866", torque: ["0.79", "0.98", "1.47", "1.98", "1.98", "1.98", "1.98"] },
      { partNumber: "CLS-M4-0", size: "M4", diameter: 4, minAxialStrength: "5.58", screwStrength: "871", torque: ["0.92", "1.15", "1.73", "2.34", "2.34", "2.34", "2.34"] },
      { partNumber: "CLS-M4-1", size: "M4", diameter: 4, minAxialStrength: "6.13", screwStrength: "872", torque: ["1.01", "1.27", "1.90", "2.58", "2.58", "2.58", "2.58"] },
      { partNumber: "CLS-M4-2", size: "M4", diameter: 4, minAxialStrength: "7.25", screwStrength: "874", torque: ["1.20", "1.49", "2.24", "3.04", "3.04", "3.04", "3.04"] },
      { partNumber: "CLSS-M5-0", size: "M5", diameter: 5, minAxialStrength: "7.98", screwStrength: "870", torque: ["1.65", "2.06", "3.09", "4.19", "4.19", "4.19", "4.19"] },
      { partNumber: "CLSS-M5-1", size: "M5", diameter: 5, minAxialStrength: "8.69", screwStrength: "871", torque: ["1.80", "2.25", "3.37", "4.56", "4.56", "4.56", "4.56"] },
      { partNumber: "CLSS-M5-2", size: "M5", diameter: 5, minAxialStrength: "10.13", screwStrength: "871", torque: ["2.09", "2.62", "3.92", "5.32", "5.32", "5.32", "5.32"] },
      { partNumber: "CLS-M6-00", size: "M6", diameter: 6, minAxialStrength: "17.0", screwStrength: "876", torque: ["4.20", "5.25", "7.88", "10.7", "10.7", "10.7", "10.7"] },
      { partNumber: "CLS-M6-0", size: "M6", diameter: 6, minAxialStrength: "18.1", screwStrength: "901", torque: ["4.35", "5.43", "8.15", "11.4", "11.4", "11.4", "11.4"] },
      { partNumber: "CLS-M6-1", size: "M6", diameter: 6, minAxialStrength: "19.1", screwStrength: "950", torque: ["4.35", "5.43", "8.15", "11.6", "12.0", "12.0", "12.0"] },
      { partNumber: "CLS-M6-2", size: "M6", diameter: 6, minAxialStrength: "22.7", screwStrength: "1130", torque: ["4.35", "5.43", "8.15", "11.6", "13.0", "13.0", "14.3"] },
      { partNumber: "CLS-M8-1", size: "M8", diameter: 8, minAxialStrength: "33.7", screwStrength: "921", torque: ["10.5", "13.2", "19.8", "28.1", "28.3", "28.3", "28.3"] },
      { partNumber: "CLS-M8-2", size: "M8", diameter: 8, minAxialStrength: "38.7", screwStrength: "1057", torque: ["10.5", "13.2", "19.8", "28.1", "31.6", "32.5", "32.5"] },
      { partNumber: "CLS-M10-1", size: "M10", diameter: 10, minAxialStrength: "66.5", screwStrength: "1147", torque: ["20.9", "26.1", "39.1", "55.7", "62.6", "69.8", "69.8"] },
      { partNumber: "CLS-M10-2", size: "M10", diameter: 10, minAxialStrength: "70.7", screwStrength: "1220", torque: ["20.9", "26.1", "39.1", "55.7", "62.6", "76.8", "76.8"] },
      { partNumber: "CLS-M12-1", size: "M12", diameter: 12, minAxialStrength: "87.1", screwStrength: "1033", torque: ["36.4", "45.5", "68.3", "97.1", "109", "110", "110"] },
    ],
  },
  {
    key: "SP",
    label: "SP",
    title: "PEM® Brand SP™ Nuts",
    k: "0.20",
    footnotes: [],
    materials: ["Steel PC 4.6", "Steel PC 5.6", "Stainless A2-70", "Steel PC 8.8", "Steel PC 9.8", "Steel PC 10.9", "Steel PC 12.9"],
    parts: [
      { partNumber: "SP-M2-1", size: "M2", diameter: 2, minAxialStrength: "2.53", screwStrength: "1220", torque: ["0.15", "0.19", "0.28", "0.40", "0.45", "0.59", "0.68"] },
      { partNumber: "SP-M2-2", size: "M2", diameter: 2, minAxialStrength: "2.53", screwStrength: "1220", torque: ["0.15", "0.19", "0.28", "0.40", "0.45", "0.59", "0.68"] },
      { partNumber: "SP-M2.5-0", size: "M2.5", diameter: 2.5, minAxialStrength: "3.81", screwStrength: "1220", torque: ["0.28", "0.35", "0.53", "0.75", "0.84", "1.10", "1.29"] },
      { partNumber: "SP-M2.5-1", size: "M2.5", diameter: 2.5, minAxialStrength: "4.14", screwStrength: "1220", torque: ["0.31", "0.38", "0.57", "0.82", "0.92", "1.20", "1.40"] },
      { partNumber: "SP-M2.5-2", size: "M2.5", diameter: 2.5, minAxialStrength: "4.14", screwStrength: "1220", torque: ["0.31", "0.38", "0.57", "0.82", "0.92", "1.20", "1.40"] },
      { partNumber: "SP-M3-0", size: "M3", diameter: 3, minAxialStrength: "5.09", screwStrength: "1220", torque: ["0.45", "0.56", "0.85", "1.20", "1.35", "1.77", "2.07"] },
      { partNumber: "SP-M3-1", size: "M3", diameter: 3, minAxialStrength: "5.65", screwStrength: "1220", torque: ["0.50", "0.62", "0.94", "1.33", "1.50", "1.96", "2.29"] },
      { partNumber: "SP-M3-2", size: "M3", diameter: 3, minAxialStrength: "6.14", screwStrength: "1220", torque: ["0.54", "0.68", "1.02", "1.45", "1.63", "2.13", "2.49"] },
      { partNumber: "SP-M3.5-0", size: "M3.5", diameter: 3.5, minAxialStrength: "5.63", screwStrength: "1220", torque: ["0.58", "0.73", "1.09", "1.55", "1.74", "2.28", "2.66"] },
      { partNumber: "SP-M3.5-1", size: "M3.5", diameter: 3.5, minAxialStrength: "6.29", screwStrength: "1220", torque: ["0.65", "0.81", "1.22", "1.73", "1.95", "2.54", "2.98"] },
      { partNumber: "SP-M3.5-2", size: "M3.5", diameter: 3.5, minAxialStrength: "7.61", screwStrength: "1220", torque: ["0.79", "0.98", "1.47", "2.10", "2.36", "3.08", "3.60"] },
      { partNumber: "SP-M4-0", size: "M4", diameter: 4, minAxialStrength: "7.81", screwStrength: "1220", torque: ["0.92", "1.15", "1.73", "2.46", "2.76", "3.61", "4.22"] },
      { partNumber: "SP-M4-1", size: "M4", diameter: 4, minAxialStrength: "8.58", screwStrength: "1220", torque: ["1.01", "1.27", "1.90", "2.70", "3.04", "3.97", "4.64"] },
      { partNumber: "SP-M4-2", size: "M4", diameter: 4, minAxialStrength: "10.1", screwStrength: "1220", torque: ["1.20", "1.49", "2.24", "3.19", "3.59", "4.68", "5.48"] },
      { partNumber: "SP-M5-0", size: "M5", diameter: 5, minAxialStrength: "11.2", screwStrength: "1220", torque: ["1.65", "2.06", "3.09", "4.40", "4.95", "6.46", "7.56"] },
      { partNumber: "SP-M5-1", size: "M5", diameter: 5, minAxialStrength: "12.2", screwStrength: "1220", torque: ["1.80", "2.25", "3.37", "4.79", "5.39", "7.04", "8.24"] },
      { partNumber: "SP-M5-2", size: "M5", diameter: 5, minAxialStrength: "14.2", screwStrength: "1220", torque: ["2.09", "2.62", "3.92", "5.58", "6.28", "8.20", "9.59"] },
      { partNumber: "SP-M6-1", size: "M6", diameter: 6, minAxialStrength: "24.6", screwStrength: "1220", torque: ["4.35", "5.43", "8.15", "11.6", "13.0", "17.0", "19.9"] },
      { partNumber: "SP-M6-2", size: "M6", diameter: 6, minAxialStrength: "24.6", screwStrength: "1220", torque: ["4.35", "5.43", "8.15", "11.6", "13.0", "17.0", "19.9"] },
      { partNumber: "SP-M8-1", size: "M8", diameter: 8, minAxialStrength: "44.7", screwStrength: "1220", torque: ["10.5", "13.2", "19.8", "28.1", "31.6", "41.3", "48.3"] },
      { partNumber: "SP-M8-2", size: "M8", diameter: 8, minAxialStrength: "44.7", screwStrength: "1220", torque: ["10.5", "13.2", "19.8", "28.1", "31.6", "41.3", "48.3"] },
      { partNumber: "SP-M10-1", size: "M10", diameter: 10, minAxialStrength: "70.7", screwStrength: "1220", torque: ["20.9", "26.1", "39.1", "55.7", "62.6", "81.8", "95.7"] },
    ],
  },
  {
    key: "CLA",
    label: "CLA",
    title: "PEM® Brand CLA™ Nuts",
    k: "0.20",
    footnotes: [],
    materials: ["Aluminum 2024-T4", "Steel PC 5.6", "Stainless A2-70", "Steel PC 8.8", "Steel PC 10.9", "Steel PC 12.9"],
    parts: [
      { partNumber: "CLA-M2-1", size: "M2", diameter: 2, minAxialStrength: "0.969", screwStrength: "639", torque: ["0.141", "0.136", "0.205", "0.211", "0.211", "0.211"] },
      { partNumber: "CLA-M2-2", size: "M2", diameter: 2, minAxialStrength: "1.309", screwStrength: "632", torque: ["0.193", "0.187", "0.280", "0.285", "0.285", "0.285"] },
      { partNumber: "CLA-M3-1", size: "M3", diameter: 3, minAxialStrength: "2.428", screwStrength: "651", torque: ["0.521", "0.503", "0.755", "0.793", "0.793", "0.793"] },
      { partNumber: "CLA-M3-2", size: "M3", diameter: 3, minAxialStrength: "2.977", screwStrength: "642", torque: ["0.647", "0.626", "0.939", "0.972", "0.972", "0.972"] },
      { partNumber: "CLA-M3.5-1", size: "M3.5", diameter: 3.5, minAxialStrength: "2.831", screwStrength: "669", torque: ["0.690", "0.667", "1.00", "1.08", "1.08", "1.08"] },
      { partNumber: "CLA-M3.5-2", size: "M3.5", diameter: 3.5, minAxialStrength: "3.485", screwStrength: "656", torque: ["0.866", "0.837", "1.26", "1.33", "1.33", "1.33"] },
      { partNumber: "CLA-M4-1", size: "M4", diameter: 4, minAxialStrength: "4.195", screwStrength: "660", torque: ["1.47", "1.42", "2.13", "2.26", "2.26", "2.26"] },
      { partNumber: "CLA-M4-2", size: "M4", diameter: 4, minAxialStrength: "5.965", screwStrength: "679", torque: ["1.63", "1.58", "2.37", "2.60", "2.60", "2.60"] },
      { partNumber: "CLA-M5-1", size: "M5", diameter: 5, minAxialStrength: "8.502", screwStrength: "654", torque: ["3.02", "2.92", "4.39", "4.63", "4.63", "4.63"] },
      { partNumber: "CLA-M5-2", size: "M5", diameter: 5, minAxialStrength: "9.492", screwStrength: "669", torque: ["3.30", "3.19", "4.79", "5.17", "5.17", "5.17"] },
      { partNumber: "CLA-M6-1", size: "M6", diameter: 6, minAxialStrength: "10.55", screwStrength: "674", torque: ["4.37", "4.23", "6.34", "6.89", "6.89", "6.89"] },
      { partNumber: "CLA-M6-2", size: "M6", diameter: 6, minAxialStrength: "13.05", screwStrength: "659", torque: ["5.52", "5.34", "8.01", "8.52", "8.52", "8.52"] },
    ],
  },
  {
    key: "SH",
    label: "SH / HNL / H",
    title: "PEM® Brand SH™, HNL™ and H™ Nuts",
    k: "0.20",
    footnotes: [],
    materials: ["Steel PC 4.6", "Steel PC 5.6", "Stainless A2-70", "Steel PC 8.8", "Steel PC 9.8", "Steel PC 10.9", "Steel PC 12.9"],
    parts: [
      { partNumber: "SH-M6-1X", size: "M6", diameter: 6, minAxialStrength: "24.6", screwStrength: "1220", torque: ["4.35", "5.43", "8.15", "11.6", "13.0", "17.0", "19.9"] },
      { partNumber: "SH-M6-2X", size: "M6", diameter: 6, minAxialStrength: "24.6", screwStrength: "1220", torque: ["4.35", "5.43", "8.15", "11.6", "13.0", "17.0", "19.9"] },
      { partNumber: "SH-M8-1X", size: "M8", diameter: 8, minAxialStrength: "44.7", screwStrength: "1220", torque: ["10.5", "13.2", "19.8", "28.1", "31.6", "41.3", "48.3"] },
      { partNumber: "SH-M8-2X", size: "M8", diameter: 8, minAxialStrength: "44.7", screwStrength: "1220", torque: ["10.5", "13.2", "19.8", "28.1", "31.6", "41.3", "48.3"] },
      { partNumber: "SH-M10-1X", size: "M10", diameter: 10, minAxialStrength: "70.7", screwStrength: "1220", torque: ["20.9", "26.1", "39.1", "55.7", "62.6", "81.8", "95.7"] },
      { partNumber: "HNL-M6-LZ", size: "M6", diameter: 6, minAxialStrength: "16.7", screwStrength: "877", torque: ["4.1", "5.1", "7.7", "10.5", "10.5", "10.5", "10.5"] },
      { partNumber: "HNL-M8-LZ", size: "M8", diameter: 8, minAxialStrength: "31.1", screwStrength: "862", torque: ["10", "13", "19", "26", "26", "26", "26"] },
      { partNumber: "HNL-M10-LZ", size: "M10", diameter: 10, minAxialStrength: "51.3", screwStrength: "884", torque: ["21", "26", "39", "54", "54", "54", "54"] },
      { partNumber: "H-M10-ZI", size: "M10", diameter: 10, minAxialStrength: "70.7", screwStrength: "1220", torque: ["21", "26", "39", "56", "63", "82", "89"] },
    ],
  },
  {
    key: "RT",
    label: "RT",
    title: "PEM RT® Nuts",
    k: "0.25",
    footnotes: ["The additional tightening torque for the PEM RT® nut is 25% more than a standard thread (RT Factor: 1.25)."],
    materials: ["Steel PC 4.6", "Steel PC 5.6", "Stainless A2-70", "Steel PC 8.8", "Steel PC 9.8", "Steel PC 10.9", "Steel PC 12.9"],
    parts: [
      { partNumber: "S-RTM3-0ZI", size: "M3", diameter: 3, minAxialStrength: "3.17", screwStrength: "1220", torque: ["0.3", "0.38", "0.57", "0.81", "0.91", "1.19", "1.39"] },
      { partNumber: "S-RTM3-1ZI", size: "M3", diameter: 3, minAxialStrength: "3.52", screwStrength: "1220", torque: ["0.34", "0.43", "0.64", "0.91", "1.03", "1.34", "1.49"] },
      { partNumber: "S-RTM3-2ZI", size: "M3", diameter: 3, minAxialStrength: "6.14", screwStrength: "1220", torque: ["0.42", "0.52", "0.78", "1.12", "1.26", "1.64", "1.92"] },
      { partNumber: "S-RTM4-0ZI", size: "M4", diameter: 4, minAxialStrength: "5.31", screwStrength: "1220", torque: ["0.65", "0.81", "1.22", "1.73", "1.95", "2.54", "2.98"] },
      { partNumber: "S-RTM4-1ZI", size: "M4", diameter: 4, minAxialStrength: "5.83", screwStrength: "1220", torque: ["0.73", "0.91", "1.36", "1.94", "2.18", "2.85", "3.33"] },
      { partNumber: "S-RTM4-2ZI", size: "M4", diameter: 4, minAxialStrength: "6.9", screwStrength: "1220", torque: ["0.88", "1.1", "1.65", "2.35", "2.65", "3.45", "4.04"] },
      { partNumber: "S-RTM5-0ZI", size: "M5", diameter: 5, minAxialStrength: "5.9", screwStrength: "1220", torque: ["1.08", "1.35", "2.03", "2.89", "3.25", "4.24", "4.96"] },
      { partNumber: "S-RTM5-1ZI", size: "M5", diameter: 5, minAxialStrength: "6.4", screwStrength: "1220", torque: ["1.18", "1.48", "2.21", "3.15", "3.54", "4.62", "5.41"] },
      { partNumber: "S-RTM5-2ZI", size: "M5", diameter: 5, minAxialStrength: "7.4", screwStrength: "1220", torque: ["1.37", "1.72", "2.58", "3.66", "4.12", "5.38", "6.3"] },
      { partNumber: "S-RTM6-00ZI", size: "M6", diameter: 6, minAxialStrength: "20", screwStrength: "1220", torque: ["4.42", "5.52", "8.28", "11.8", "13.3", "17.3", "19.5"] },
      { partNumber: "S-RTM6-0ZI", size: "M6", diameter: 6, minAxialStrength: "24.6", screwStrength: "1220", torque: ["4.7", "5.88", "8.81", "12.5", "14.1", "18.4", "20.8"] },
      { partNumber: "S-RTM6-1ZI", size: "M6", diameter: 6, minAxialStrength: "24.6", screwStrength: "1220", torque: ["4.96", "6.2", "9.29", "13", "14.9", "19.4", "21.9"] },
      { partNumber: "S-RTM6-2ZI", size: "M6", diameter: 6, minAxialStrength: "24.6", screwStrength: "1220", torque: ["5.89", "7.37", "11.1", "15.7", "17.7", "23.1", "26.1"] },
      { partNumber: "S-RTM8-1ZI", size: "M8", diameter: 8, minAxialStrength: "44.7", screwStrength: "1220", torque: ["11.5", "14.4", "21.6", "30.8", "34.6", "45.2", "47.9"] },
      { partNumber: "S-RTM8-2ZI", size: "M8", diameter: 8, minAxialStrength: "44.7", screwStrength: "1220", torque: ["13.3", "16.6", "24", "35.5", "39.9", "52.1", "60.7"] },
    ],
  },
  {
    key: "SMP",
    label: "SMP",
    title: "PEM® Brand SMP™ Nuts",
    k: "0.20",
    footnotes: [],
    materials: ["Steel PC 4.6", "Steel PC 5.6", "Stainless A2-70", "Steel PC 8.8", "Steel PC 9.8", "Steel PC 10.9", "Steel PC 12.9"],
    parts: [
      { partNumber: "SMPS-M2.5", size: "M2.5", diameter: 2.5, minAxialStrength: "2.24", screwStrength: "865", torque: ["0.23", "0.29", "0.44", "0.59", "0.59", "0.59", "0.59"] },
      { partNumber: "SMPP-M2.5", size: "M2.5", diameter: 2.5, minAxialStrength: "3.10", screwStrength: "1220", torque: ["0.23", "0.29", "0.43", "0.61", "0.69", "0.90", "1.05"] },
      { partNumber: "SMPS-M3", size: "M3", diameter: 3, minAxialStrength: "2.63", screwStrength: "858", torque: ["0.33", "0.41", "0.62", "0.83", "0.83", "0.83", "0.83"] },
      { partNumber: "SMPP-M3", size: "M3", diameter: 3, minAxialStrength: "3.68", screwStrength: "1220", torque: ["0.33", "0.41", "0.61", "0.87", "0.98", "1.27", "1.49"] },
      { partNumber: "SMPS-M3.5", size: "M3.5", diameter: 3.5, minAxialStrength: "2.97", screwStrength: "858", torque: ["0.44", "0.55", "0.82", "1.09", "1.09", "1.09", "1.09"] },
      { partNumber: "SMPP-M3.5", size: "M3.5", diameter: 3.5, minAxialStrength: "4.15", screwStrength: "1220", torque: ["0.43", "0.54", "0.80", "1.14", "1.28", "1.68", "1.96"] },
    ],
  },
  {
    key: "WN",
    label: "WN / WNS",
    title: "PEM® Brand WN™ and WNS™ Weld Nuts",
    k: "0.20",
    footnotes: [],
    materials: ["Steel PC 4.6", "Steel PC 5.6", "Stainless A2-70", "Steel PC 8.8", "Steel PC 9.8", "Steel PC 10.9", "Steel PC 12.9"],
    parts: [
      { partNumber: "WN-M3-0CU", size: "M3", diameter: 3, minAxialStrength: "1.73", screwStrength: "597", torque: ["0.31", "0.39", "0.51", "0.51", "0.51", "0.51", "0.51"] },
      { partNumber: "WN-M4-0CU", size: "M4", diameter: 4, minAxialStrength: "4.73", screwStrength: "564", torque: ["1.21", "1.51", "1.85", "1.85", "1.85", "1.85", "1.85"] },
      { partNumber: "WN-M5-0CU", size: "M5", diameter: 5, minAxialStrength: "8.86", screwStrength: "624", torque: ["2.82", "3.52", "4.32", "4.32", "4.32", "4.32", "4.32"] },
      { partNumber: "WN-M6-0CU", size: "M6", diameter: 6, minAxialStrength: "12.9", screwStrength: "639", torque: ["4.76", "5.95", "7.53", "7.53", "7.53", "7.53", "7.53"] },
      { partNumber: "WNS-M3-0", size: "M3", diameter: 3, minAxialStrength: "2.6", screwStrength: "896", torque: ["0.31", "0.39", "0.59", "0.82", "0.82", "0.82", "0.82"] },
      { partNumber: "WNS-M4-0", size: "M4", diameter: 4, minAxialStrength: "7.1", screwStrength: "846", torque: ["1.21", "1.51", "2.27", "2.98", "2.98", "2.98", "2.98"] },
      { partNumber: "WNS-M5-0", size: "M5", diameter: 5, minAxialStrength: "13.3", screwStrength: "937", torque: ["2.55", "3.19", "4.79", "6.81", "6.97", "6.97", "6.97"] },
      { partNumber: "WNS-M6-0", size: "M6", diameter: 6, minAxialStrength: "19.3", screwStrength: "959", torque: ["4.35", "5.43", "8.15", "11.6", "12.2", "12.2", "12.2"] },
    ],
  },
  {
    key: "KF2",
    label: "KF2",
    title: "PEM® Brand KF2™ Nuts",
    k: "0.20",
    footnotes: [],
    materials: ["Steel PC 4.6", "Steel PC 5.6", "Stainless A2-70", "Steel PC 8.8", "Steel PC 9.8", "Steel PC 10.9", "Steel PC 12.9"],
    parts: [
      { partNumber: "KF2-M2", size: "M2", diameter: 2, minAxialStrength: "1.92", screwStrength: "925", torque: ["0.15", "0.19", "0.28", "0.40", "0.45", "0.45", "0.45"] },
      { partNumber: "KF2-M2.5", size: "M2.5", diameter: 2.5, minAxialStrength: "2.51", screwStrength: "741", torque: ["0.31", "0.38", "0.57", "0.74", "0.74", "0.74", "0.74"] },
      { partNumber: "KF2-M3", size: "M3", diameter: 3, minAxialStrength: "3.24", screwStrength: "692", torque: ["0.51", "0.63", "0.95", "1.14", "1.14", "1.14", "1.14"] },
      { partNumber: "KF2-M4", size: "M4", diameter: 4, minAxialStrength: "5.63", screwStrength: "703", torque: ["1.15", "1.44", "2.16", "2.65", "2.65", "2.65", "2.65"] },
      { partNumber: "KF2-M5", size: "M5", diameter: 5, minAxialStrength: "9.81", screwStrength: "699", torque: ["2.53", "3.16", "4.73", "5.78", "5.78", "5.78", "5.78"] },
      { partNumber: "KFS2-M2", size: "M2", diameter: 2, minAxialStrength: "2.5", screwStrength: "1220", torque: ["0.15", "0.19", "0.28", "0.40", "0.45", "0.53", "0.53"] },
      { partNumber: "KFS2-M2.5", size: "M2.5", diameter: 2.5, minAxialStrength: "3.48", screwStrength: "1027", torque: ["0.31", "0.38", "0.57", "0.81", "0.87", "0.87", "0.87"] },
      { partNumber: "KFS2-M3", size: "M3", diameter: 3, minAxialStrength: "4.49", screwStrength: "959", torque: ["0.51", "0.63", "0.95", "1.35", "1.35", "1.35", "1.35"] },
      { partNumber: "KFS2-M4", size: "M4", diameter: 4, minAxialStrength: "7.79", screwStrength: "975", torque: ["1.15", "1.44", "2.16", "3.07", "3.13", "3.13", "3.13"] },
      { partNumber: "KFS2-M5", size: "M5", diameter: 5, minAxialStrength: "13.6", screwStrength: "969", torque: ["2.53", "3.16", "4.73", "6.73", "6.83", "6.83", "6.83"] },
    ],
  },
];
