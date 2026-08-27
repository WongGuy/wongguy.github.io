// Reference data for the torque-vs-thread-engagement plot.
// EDITING THESE TABLES: the torqueMaterials and torqueData blocks below are
// generated — don't hand-edit them. They're produced by
// scripts/generate_nasa_torque_data.py from the NASA workbook in
// assets/standards/NASA/Torque/ (NASA/TM-2017-219475, "Installation Torque
// Tables for Noncritical Applications", metric tables). To add, remove, or
// correct a value, fix the workbook and rerun
// `python scripts/generate_nasa_torque_data.py`.
//
// UNITS: everything here is metric, converted from the US customary source
// tables by the generator (in -> mm, lb -> N, lb-in -> N*m). Values are plain
// numbers rather than display strings — unlike screw-data.js et al — because
// nasa-torque-app.js does arithmetic on them to lay out the plot, and formats them
// for display itself.
//
// torqueMaterials: the five materials the report covers, ordered by ultimate
// shear strength ascending (which is also roughly the order their curves
// stack on the plot). `key` is the identity used both as the torqueData
// object key and as the saved on/off state of that material's checkbox, so
// renaming one resets a visitor's saved selection. `fsu` is ultimate shear
// strength in MPa and `k` the nut factor the source tables assumed — both are
// shown as legend/footnote detail, neither is used in any calculation here.
//
// torqueData: one entry per fastener size in ascending diameter order, so the
// slider can index it the way the other selectors index their tables. Each
// entry's `materials` map holds only the materials the report tabulates at
// that size — small sizes in strong materials are simply absent, and the plot
// draws nothing for them. Every row is one tabulated thread engagement:
//
//   engagement     thread engagement depth, mm
//   pulloutLoad    thread pullout load, N
//   assemblyTorque recommended installation torque, N*m
//   fullTorque     torque developing 100 % of the pullout load, N*m
//
// Row counts differ per material at the same size: the report stops tabulating
// once a deeper engagement stops buying capacity, so a strong material has
// fewer (and shorter) engagements listed than a soft one. Some size/material
// pairs have a single row, which is why the plot draws point markers and not
// just connecting lines.

const torqueMaterials = [
  { key: "AL6061", label: "Aluminum 6061-T6", fsu: 186.2, k: "0.20" },
  { key: "A36", label: "ASTM A36 Steel", fsu: 239.9, k: "0.20" },
  { key: "AL2024", label: "Aluminum 2024-T4/T351", fsu: 258.6, k: "0.20" },
  { key: "AL7075", label: "Aluminum 7075-T6/T651", fsu: 314.4, k: "0.20" },
  { key: "SS304", label: "304 Stainless Steel", fsu: 344.7, k: "0.20" },
];

const torqueData = [
  {
    size: "M2",
    diameter: "2.0",
    materials: {
      AL6061: [
        { engagement: 1.5875, pulloutLoad: 538.68, assemblyTorque: 0.135582, fullTorque: 0.214671 },
        { engagement: 3.175, pulloutLoad: 1076.91, assemblyTorque: 0.282462, fullTorque: 0.429342 },
      ],
      A36: [
        { engagement: 1.5875, pulloutLoad: 693.923, assemblyTorque: 0.180776, fullTorque: 0.282462 },
      ],
      AL2024: [
        { engagement: 1.5875, pulloutLoad: 747.746, assemblyTorque: 0.192074, fullTorque: 0.293761 },
      ],
      AL7075: [
        { engagement: 1.5875, pulloutLoad: 909.661, assemblyTorque: 0.237268, fullTorque: 0.361551 },
      ],
      SS304: [
        { engagement: 1.5875, pulloutLoad: 997.291, assemblyTorque: 0.259865, fullTorque: 0.395447 },
      ],
    },
  },
  {
    size: "M2.5",
    diameter: "2.5",
    materials: {
      AL6061: [
        { engagement: 1.5875, pulloutLoad: 683.247, assemblyTorque: 0.22597, fullTorque: 0.338954 },
        { engagement: 3.175, pulloutLoad: 1366.49, assemblyTorque: 0.440641, fullTorque: 0.677909 },
      ],
      A36: [
        { engagement: 1.5875, pulloutLoad: 880.748, assemblyTorque: 0.282462, fullTorque: 0.440641 },
        { engagement: 3.175, pulloutLoad: 1761.5, assemblyTorque: 0.576223, fullTorque: 0.881282 },
      ],
      AL2024: [
        { engagement: 1.5875, pulloutLoad: 949.25, assemblyTorque: 0.305059, fullTorque: 0.474536 },
      ],
      AL7075: [
        { engagement: 1.5875, pulloutLoad: 1153.87, assemblyTorque: 0.37285, fullTorque: 0.576223 },
      ],
      SS304: [
        { engagement: 1.5875, pulloutLoad: 1265.52, assemblyTorque: 0.406745, fullTorque: 0.632715 },
      ],
    },
  },
  {
    size: "M3",
    diameter: "3.0",
    materials: {
      AL6061: [
        { engagement: 1.5875, pulloutLoad: 827.814, assemblyTorque: 0.327656, fullTorque: 0.497133 },
        { engagement: 3.175, pulloutLoad: 1655.63, assemblyTorque: 0.644014, fullTorque: 0.994266 },
        { engagement: 4.7625, pulloutLoad: 2483.44, assemblyTorque: 0.97167, fullTorque: 1.4914 },
      ],
      A36: [
        { engagement: 1.5875, pulloutLoad: 1067.13, assemblyTorque: 0.418044, fullTorque: 0.644014 },
        { engagement: 3.175, pulloutLoad: 2133.81, assemblyTorque: 0.836088, fullTorque: 1.27673 },
      ],
      AL2024: [
        { engagement: 1.5875, pulloutLoad: 1149.87, assemblyTorque: 0.451939, fullTorque: 0.689207 },
        { engagement: 3.175, pulloutLoad: 2299.73, assemblyTorque: 0.89258, fullTorque: 1.37841 },
      ],
      AL7075: [
        { engagement: 1.5875, pulloutLoad: 1398.08, assemblyTorque: 0.542327, fullTorque: 0.836088 },
      ],
      SS304: [
        { engagement: 1.5875, pulloutLoad: 1532.86, assemblyTorque: 0.59882, fullTorque: 0.915177 },
      ],
    },
  },
  {
    size: "M4",
    diameter: "4.0",
    materials: {
      AL6061: [
        { engagement: 3.175, pulloutLoad: 2194.31, assemblyTorque: 1.14115, fullTorque: 1.75126 },
        { engagement: 4.7625, pulloutLoad: 3291.24, assemblyTorque: 1.70607, fullTorque: 2.63255 },
        { engagement: 6.35, pulloutLoad: 4388.17, assemblyTorque: 2.28229, fullTorque: 3.51383 },
      ],
      A36: [
        { engagement: 3.175, pulloutLoad: 2828.18, assemblyTorque: 1.4688, fullTorque: 2.2597 },
        { engagement: 4.7625, pulloutLoad: 4242.27, assemblyTorque: 2.2032, fullTorque: 3.38954 },
      ],
      AL2024: [
        { engagement: 3.175, pulloutLoad: 3047.48, assemblyTorque: 1.58179, fullTorque: 2.44047 },
        { engagement: 4.7625, pulloutLoad: 4570.99, assemblyTorque: 2.37268, fullTorque: 3.66071 },
      ],
      AL7075: [
        { engagement: 3.175, pulloutLoad: 3705.81, assemblyTorque: 1.93204, fullTorque: 2.9602 },
      ],
      SS304: [
        { engagement: 3.175, pulloutLoad: 4063.45, assemblyTorque: 2.11282, fullTorque: 3.25396 },
      ],
    },
  },
  {
    size: "M5",
    diameter: "5.0",
    materials: {
      AL6061: [
        { engagement: 3.175, pulloutLoad: 2773.02, assemblyTorque: 1.80776, fullTorque: 2.76813 },
        { engagement: 4.7625, pulloutLoad: 4159.53, assemblyTorque: 2.70034, fullTorque: 4.15784 },
        { engagement: 6.35, pulloutLoad: 5545.6, assemblyTorque: 3.60422, fullTorque: 5.54756 },
        { engagement: 7.9375, pulloutLoad: 6932.11, assemblyTorque: 4.50809, fullTorque: 6.93727 },
      ],
      A36: [
        { engagement: 3.175, pulloutLoad: 3574.15, assemblyTorque: 2.32749, fullTorque: 3.57032 },
        { engagement: 4.7625, pulloutLoad: 5361, assemblyTorque: 3.47993, fullTorque: 5.35548 },
        { engagement: 6.35, pulloutLoad: 7147.85, assemblyTorque: 4.64368, fullTorque: 7.15194 },
      ],
      AL2024: [
        { engagement: 3.175, pulloutLoad: 3851.27, assemblyTorque: 2.50826, fullTorque: 3.85278 },
        { engagement: 4.7625, pulloutLoad: 5776.91, assemblyTorque: 3.7511, fullTorque: 5.77352 },
      ],
      AL7075: [
        { engagement: 3.175, pulloutLoad: 4683.09, assemblyTorque: 3.03929, fullTorque: 4.67757 },
        { engagement: 4.7625, pulloutLoad: 7024.63, assemblyTorque: 4.56459, fullTorque: 7.02766 },
      ],
      SS304: [
        { engagement: 3.175, pulloutLoad: 5135.03, assemblyTorque: 3.33305, fullTorque: 5.12951 },
      ],
    },
  },
  {
    size: "M6",
    diameter: "6.0",
    materials: {
      AL6061: [
        { engagement: 3.175, pulloutLoad: 3311.26, assemblyTorque: 2.58735, fullTorque: 3.97707 },
        { engagement: 4.7625, pulloutLoad: 4966.88, assemblyTorque: 3.87538, fullTorque: 5.9656 },
        { engagement: 6.35, pulloutLoad: 6622.96, assemblyTorque: 5.16341, fullTorque: 7.94283 },
        { engagement: 7.9375, pulloutLoad: 8278.59, assemblyTorque: 6.46273, fullTorque: 9.93137 },
        { engagement: 9.525, pulloutLoad: 9934.21, assemblyTorque: 7.75076, fullTorque: 11.9199 },
      ],
      A36: [
        { engagement: 3.175, pulloutLoad: 4268.07, assemblyTorque: 3.33305, fullTorque: 5.11821 },
        { engagement: 4.7625, pulloutLoad: 6401.88, assemblyTorque: 4.99393, fullTorque: 7.68297 },
        { engagement: 6.35, pulloutLoad: 8536.14, assemblyTorque: 6.65481, fullTorque: 10.2477 },
      ],
      AL2024: [
        { engagement: 3.175, pulloutLoad: 4599.02, assemblyTorque: 3.59292, fullTorque: 5.51366 },
        { engagement: 4.7625, pulloutLoad: 6898.75, assemblyTorque: 5.37808, fullTorque: 8.28179 },
        { engagement: 6.35, pulloutLoad: 9198.48, assemblyTorque: 7.17454, fullTorque: 11.0386 },
      ],
      AL7075: [
        { engagement: 3.175, pulloutLoad: 5592.75, assemblyTorque: 4.36121, fullTorque: 6.7113 },
        { engagement: 4.7625, pulloutLoad: 8388.9, assemblyTorque: 6.54182, fullTorque: 10.0669 },
      ],
      SS304: [
        { engagement: 3.175, pulloutLoad: 6132.32, assemblyTorque: 4.77926, fullTorque: 7.35531 },
        { engagement: 4.7625, pulloutLoad: 9198.48, assemblyTorque: 7.17454, fullTorque: 11.0386 },
      ],
    },
  },
  {
    size: "M8",
    diameter: "8.0",
    materials: {
      AL6061: [
        { engagement: 4.7625, pulloutLoad: 6673.67, assemblyTorque: 6.93727, fullTorque: 10.6771 },
        { engagement: 6.35, pulloutLoad: 8898.22, assemblyTorque: 9.25346, fullTorque: 14.2361 },
        { engagement: 7.9375, pulloutLoad: 11122.3, assemblyTorque: 11.5696, fullTorque: 17.7951 },
        { engagement: 9.525, pulloutLoad: 13346.9, assemblyTorque: 13.8858, fullTorque: 21.3541 },
        { engagement: 11.1125, pulloutLoad: 15571.4, assemblyTorque: 16.1907, fullTorque: 24.9132 },
        { engagement: 12.7, pulloutLoad: 17796, assemblyTorque: 18.5069, fullTorque: 28.4722 },
      ],
      A36: [
        { engagement: 4.7625, pulloutLoad: 8601.53, assemblyTorque: 8.9484, fullTorque: 13.7616 },
        { engagement: 6.35, pulloutLoad: 11468.4, assemblyTorque: 11.9312, fullTorque: 18.3487 },
        { engagement: 7.9375, pulloutLoad: 14335.7, assemblyTorque: 14.914, fullTorque: 22.9359 },
        { engagement: 9.525, pulloutLoad: 17203.1, assemblyTorque: 17.8855, fullTorque: 27.5231 },
      ],
      AL2024: [
        { engagement: 4.7625, pulloutLoad: 9268.76, assemblyTorque: 9.63761, fullTorque: 14.8349 },
        { engagement: 6.35, pulloutLoad: 12358.5, assemblyTorque: 12.8577, fullTorque: 19.7723 },
        { engagement: 7.9375, pulloutLoad: 15447.8, assemblyTorque: 16.0664, fullTorque: 24.7211 },
        { engagement: 9.525, pulloutLoad: 18537.5, assemblyTorque: 19.2752, fullTorque: 29.6585 },
      ],
      AL7075: [
        { engagement: 4.7625, pulloutLoad: 11270.9, assemblyTorque: 11.7165, fullTorque: 18.0324 },
        { engagement: 6.35, pulloutLoad: 15027.9, assemblyTorque: 15.6258, fullTorque: 24.0432 },
        { engagement: 7.9375, pulloutLoad: 18784.8, assemblyTorque: 19.5351, fullTorque: 30.054 },
      ],
      SS304: [
        { engagement: 4.7625, pulloutLoad: 12358.5, assemblyTorque: 12.8577, fullTorque: 19.7723 },
        { engagement: 6.35, pulloutLoad: 16478, assemblyTorque: 17.1398, fullTorque: 26.3594 },
      ],
    },
  },
  {
    size: "M10",
    diameter: "10.0",
    materials: {
      AL6061: [
        { engagement: 4.7625, pulloutLoad: 8380, assemblyTorque: 10.8917, fullTorque: 16.7557 },
        { engagement: 6.35, pulloutLoad: 11173.5, assemblyTorque: 14.5298, fullTorque: 22.3484 },
        { engagement: 7.9375, pulloutLoad: 13966.5, assemblyTorque: 18.1567, fullTorque: 27.9298 },
        { engagement: 9.525, pulloutLoad: 16760, assemblyTorque: 21.7835, fullTorque: 33.5226 },
        { engagement: 11.1125, pulloutLoad: 19553, assemblyTorque: 25.4216, fullTorque: 39.104 },
        { engagement: 12.7, pulloutLoad: 22346.5, assemblyTorque: 29.0484, fullTorque: 44.6968 },
        { engagement: 14.2875, pulloutLoad: 25140, assemblyTorque: 32.6865, fullTorque: 50.2782 },
        { engagement: 15.875, pulloutLoad: 27933.1, assemblyTorque: 36.3133, fullTorque: 55.871 },
      ],
      A36: [
        { engagement: 4.7625, pulloutLoad: 10800.7, assemblyTorque: 14.044, fullTorque: 21.6027 },
        { engagement: 6.35, pulloutLoad: 14401.1, assemblyTorque: 18.7216, fullTorque: 28.7998 },
        { engagement: 7.9375, pulloutLoad: 18001.5, assemblyTorque: 23.3992, fullTorque: 36.0083 },
        { engagement: 9.525, pulloutLoad: 21601.5, assemblyTorque: 28.0767, fullTorque: 43.2054 },
        { engagement: 11.1125, pulloutLoad: 25201.8, assemblyTorque: 32.7656, fullTorque: 50.4025 },
        { engagement: 12.7, pulloutLoad: 28802.2, assemblyTorque: 37.4432, fullTorque: 57.5997 },
      ],
      AL2024: [
        { engagement: 4.7625, pulloutLoad: 11638.8, assemblyTorque: 15.1287, fullTorque: 23.2749 },
        { engagement: 6.35, pulloutLoad: 15518.5, assemblyTorque: 20.1791, fullTorque: 31.0369 },
        { engagement: 7.9375, pulloutLoad: 19398.2, assemblyTorque: 25.2182, fullTorque: 38.799 },
        { engagement: 9.525, pulloutLoad: 23277.5, assemblyTorque: 30.2573, fullTorque: 46.5497 },
        { engagement: 11.1125, pulloutLoad: 27157.3, assemblyTorque: 35.3078, fullTorque: 54.3118 },
      ],
      AL7075: [
        { engagement: 4.7625, pulloutLoad: 14152.9, assemblyTorque: 18.3939, fullTorque: 28.3027 },
        { engagement: 6.35, pulloutLoad: 18870.2, assemblyTorque: 24.529, fullTorque: 37.7369 },
        { engagement: 7.9375, pulloutLoad: 23588, assemblyTorque: 30.6641, fullTorque: 47.1712 },
        { engagement: 9.525, pulloutLoad: 28305.8, assemblyTorque: 36.7992, fullTorque: 56.6167 },
      ],
      SS304: [
        { engagement: 4.7625, pulloutLoad: 15518.5, assemblyTorque: 20.1791, fullTorque: 31.0369 },
        { engagement: 6.35, pulloutLoad: 20691.3, assemblyTorque: 26.9017, fullTorque: 41.3863 },
        { engagement: 7.9375, pulloutLoad: 25864.2, assemblyTorque: 33.6243, fullTorque: 51.7245 },
      ],
    },
  },
  {
    size: "M12",
    diameter: "12.0",
    materials: {
      AL6061: [
        { engagement: 6.35, pulloutLoad: 13447.4, assemblyTorque: 20.9813, fullTorque: 32.2685 },
        { engagement: 7.9375, pulloutLoad: 16808.9, assemblyTorque: 26.2238, fullTorque: 40.3469 },
        { engagement: 9.525, pulloutLoad: 20170.9, assemblyTorque: 31.4663, fullTorque: 48.414 },
        { engagement: 11.1125, pulloutLoad: 23532.9, assemblyTorque: 36.7088, fullTorque: 56.4811 },
        { engagement: 12.7, pulloutLoad: 26894.4, assemblyTorque: 41.9513, fullTorque: 64.5482 },
        { engagement: 14.2875, pulloutLoad: 30256.4, assemblyTorque: 47.2051, fullTorque: 72.6153 },
        { engagement: 15.875, pulloutLoad: 33618.3, assemblyTorque: 52.4476, fullTorque: 80.6825 },
        { engagement: 19.05, pulloutLoad: 40341.8, assemblyTorque: 62.9325, fullTorque: 96.8167 },
      ],
      A36: [
        { engagement: 6.35, pulloutLoad: 17332.1, assemblyTorque: 27.0373, fullTorque: 41.601 },
        { engagement: 7.9375, pulloutLoad: 21665.1, assemblyTorque: 33.7938, fullTorque: 51.9956 },
        { engagement: 9.525, pulloutLoad: 25998.1, assemblyTorque: 40.5616, fullTorque: 62.3902 },
        { engagement: 11.1125, pulloutLoad: 30331.1, assemblyTorque: 47.318, fullTorque: 72.7961 },
        { engagement: 12.7, pulloutLoad: 34664.1, assemblyTorque: 54.0745, fullTorque: 83.1907 },
        { engagement: 14.2875, pulloutLoad: 38997.1, assemblyTorque: 60.831, fullTorque: 93.5966 },
        { engagement: 15.875, pulloutLoad: 43330.1, assemblyTorque: 67.5988, fullTorque: 103.991 },
      ],
      AL2024: [
        { engagement: 6.35, pulloutLoad: 18676.7, assemblyTorque: 29.1388, fullTorque: 44.8211 },
        { engagement: 7.9375, pulloutLoad: 23346, assemblyTorque: 36.415, fullTorque: 56.0292 },
        { engagement: 9.525, pulloutLoad: 28015.3, assemblyTorque: 43.7025, fullTorque: 67.2373 },
        { engagement: 11.1125, pulloutLoad: 32684.2, assemblyTorque: 50.9901, fullTorque: 78.4454 },
        { engagement: 12.7, pulloutLoad: 37353.5, assemblyTorque: 58.2663, fullTorque: 89.6535 },
        { engagement: 14.2875, pulloutLoad: 42022.8, assemblyTorque: 65.5538, fullTorque: 100.85 },
      ],
      AL7075: [
        { engagement: 6.35, pulloutLoad: 22710.8, assemblyTorque: 35.432, fullTorque: 54.5039 },
        { engagement: 7.9375, pulloutLoad: 28388.6, assemblyTorque: 44.2901, fullTorque: 68.1299 },
        { engagement: 9.525, pulloutLoad: 34066.3, assemblyTorque: 53.1481, fullTorque: 81.7558 },
        { engagement: 11.1125, pulloutLoad: 39744.4, assemblyTorque: 62.0061, fullTorque: 95.3818 },
      ],
      SS304: [
        { engagement: 6.35, pulloutLoad: 24902.5, assemblyTorque: 38.8442, fullTorque: 59.769 },
        { engagement: 7.9375, pulloutLoad: 31128.2, assemblyTorque: 48.5609, fullTorque: 74.7056 },
        { engagement: 9.525, pulloutLoad: 37353.5, assemblyTorque: 58.2663, fullTorque: 89.6535 },
        { engagement: 11.1125, pulloutLoad: 43579.2, assemblyTorque: 67.983, fullTorque: 104.59 },
      ],
    },
  },
  {
    size: "M16",
    diameter: "16.0",
    materials: {
      AL6061: [
        { engagement: 6.35, pulloutLoad: 18198.6, assemblyTorque: 37.8499, fullTorque: 58.2324 },
        { engagement: 7.9375, pulloutLoad: 22747.8, assemblyTorque: 47.318, fullTorque: 72.7961 },
        { engagement: 9.525, pulloutLoad: 27297.4, assemblyTorque: 56.7749, fullTorque: 87.3486 },
        { engagement: 11.1125, pulloutLoad: 31847, assemblyTorque: 66.243, fullTorque: 101.912 },
        { engagement: 12.7, pulloutLoad: 36396.7, assemblyTorque: 75.6998, fullTorque: 116.465 },
        { engagement: 14.2875, pulloutLoad: 40946.3, assemblyTorque: 85.168, fullTorque: 131.029 },
        { engagement: 15.875, pulloutLoad: 45496, assemblyTorque: 94.6361, fullTorque: 145.592 },
        { engagement: 19.05, pulloutLoad: 54595.2, assemblyTorque: 113.561, fullTorque: 174.708 },
        { engagement: 22.225, pulloutLoad: 63694.1, assemblyTorque: 132.486, fullTorque: 203.825 },
        { engagement: 25.4, pulloutLoad: 72793.4, assemblyTorque: 151.411, fullTorque: 232.941 },
        { engagement: 28.575, pulloutLoad: 81892.6, assemblyTorque: 170.336, fullTorque: 262.057 },
      ],
      A36: [
        { engagement: 6.35, pulloutLoad: 23455.5, assemblyTorque: 48.7868, fullTorque: 75.0558 },
        { engagement: 7.9375, pulloutLoad: 29319.6, assemblyTorque: 60.9892, fullTorque: 93.8226 },
        { engagement: 9.525, pulloutLoad: 35183.7, assemblyTorque: 73.1803, fullTorque: 112.589 },
        { engagement: 11.1125, pulloutLoad: 41047.3, assemblyTorque: 85.3826, fullTorque: 131.356 },
        { engagement: 12.7, pulloutLoad: 46911.4, assemblyTorque: 97.5737, fullTorque: 150.112 },
        { engagement: 14.2875, pulloutLoad: 52775, assemblyTorque: 109.776, fullTorque: 168.878 },
        { engagement: 15.875, pulloutLoad: 58639.1, assemblyTorque: 121.967, fullTorque: 187.645 },
        { engagement: 19.05, pulloutLoad: 70366.9, assemblyTorque: 146.361, fullTorque: 225.179 },
        { engagement: 22.225, pulloutLoad: 82094.6, assemblyTorque: 170.754, fullTorque: 262.701 },
      ],
      AL2024: [
        { engagement: 6.35, pulloutLoad: 25275.7, assemblyTorque: 52.5718, fullTorque: 80.8858 },
        { engagement: 7.9375, pulloutLoad: 31594.4, assemblyTorque: 65.712, fullTorque: 101.099 },
        { engagement: 9.525, pulloutLoad: 37913.1, assemblyTorque: 78.8634, fullTorque: 121.323 },
        { engagement: 11.1125, pulloutLoad: 44232.2, assemblyTorque: 92.0035, fullTorque: 141.547 },
        { engagement: 12.7, pulloutLoad: 50550.9, assemblyTorque: 105.144, fullTorque: 161.76 },
        { engagement: 14.2875, pulloutLoad: 56869.6, assemblyTorque: 118.284, fullTorque: 181.985 },
        { engagement: 15.875, pulloutLoad: 63188.8, assemblyTorque: 131.435, fullTorque: 202.209 },
        { engagement: 19.05, pulloutLoad: 75826.6, assemblyTorque: 157.716, fullTorque: 242.646 },
      ],
      AL7075: [
        { engagement: 6.35, pulloutLoad: 30735, assemblyTorque: 63.9268, fullTorque: 98.3533 },
        { engagement: 7.9375, pulloutLoad: 38418.8, assemblyTorque: 79.9142, fullTorque: 122.939 },
        { engagement: 9.525, pulloutLoad: 46102.7, assemblyTorque: 95.8902, fullTorque: 147.524 },
        { engagement: 11.1125, pulloutLoad: 53786.1, assemblyTorque: 111.878, fullTorque: 172.121 },
        { engagement: 12.7, pulloutLoad: 61470, assemblyTorque: 127.854, fullTorque: 196.707 },
        { engagement: 14.2875, pulloutLoad: 69153.8, assemblyTorque: 143.841, fullTorque: 221.292 },
        { engagement: 15.875, pulloutLoad: 76837.7, assemblyTorque: 159.817, fullTorque: 245.878 },
      ],
      SS304: [
        { engagement: 6.35, pulloutLoad: 33700.6, assemblyTorque: 70.0958, fullTorque: 107.844 },
        { engagement: 7.9375, pulloutLoad: 42126, assemblyTorque: 87.6197, fullTorque: 134.802 },
        { engagement: 9.525, pulloutLoad: 50550.9, assemblyTorque: 105.144, fullTorque: 161.76 },
        { engagement: 11.1125, pulloutLoad: 58976.3, assemblyTorque: 122.668, fullTorque: 188.719 },
        { engagement: 12.7, pulloutLoad: 67401.2, assemblyTorque: 140.192, fullTorque: 215.688 },
        { engagement: 14.2875, pulloutLoad: 75826.6, assemblyTorque: 157.716, fullTorque: 242.646 },
      ],
    },
  },
  {
    size: "M20",
    diameter: "20.0",
    materials: {
      AL6061: [
        { engagement: 7.9375, pulloutLoad: 28434.4, assemblyTorque: 73.926, fullTorque: 113.742 },
        { engagement: 9.525, pulloutLoad: 34121.4, assemblyTorque: 88.7157, fullTorque: 136.486 },
        { engagement: 11.1125, pulloutLoad: 39808.5, assemblyTorque: 103.505, fullTorque: 159.23 },
        { engagement: 12.7, pulloutLoad: 45495.1, assemblyTorque: 118.284, fullTorque: 181.985 },
        { engagement: 14.2875, pulloutLoad: 51182.1, assemblyTorque: 133.074, fullTorque: 204.729 },
        { engagement: 15.875, pulloutLoad: 56869.2, assemblyTorque: 147.863, fullTorque: 227.472 },
        { engagement: 19.05, pulloutLoad: 68242.8, assemblyTorque: 177.431, fullTorque: 272.971 },
        { engagement: 22.225, pulloutLoad: 79616.5, assemblyTorque: 207, fullTorque: 318.47 },
        { engagement: 25.4, pulloutLoad: 90990.6, assemblyTorque: 236.579, fullTorque: 363.958 },
        { engagement: 28.575, pulloutLoad: 102364, assemblyTorque: 266.147, fullTorque: 409.457 },
        { engagement: 31.75, pulloutLoad: 113738, assemblyTorque: 295.715, fullTorque: 454.956 },
        { engagement: 34.925, pulloutLoad: 125112, assemblyTorque: 325.295, fullTorque: 500.444 },
      ],
      A36: [
        { engagement: 7.9375, pulloutLoad: 36648.9, assemblyTorque: 95.2914, fullTorque: 146.598 },
        { engagement: 9.525, pulloutLoad: 43978.7, assemblyTorque: 114.341, fullTorque: 175.917 },
        { engagement: 11.1125, pulloutLoad: 51308.5, assemblyTorque: 133.401, fullTorque: 205.237 },
        { engagement: 12.7, pulloutLoad: 58638.2, assemblyTorque: 152.462, fullTorque: 234.557 },
        { engagement: 14.2875, pulloutLoad: 65968, assemblyTorque: 171.522, fullTorque: 263.876 },
        { engagement: 15.875, pulloutLoad: 73297.8, assemblyTorque: 190.572, fullTorque: 293.196 },
        { engagement: 19.05, pulloutLoad: 87957.4, assemblyTorque: 228.693, fullTorque: 351.835 },
        { engagement: 22.225, pulloutLoad: 102617, assemblyTorque: 266.802, fullTorque: 410.474 },
        { engagement: 25.4, pulloutLoad: 117276, assemblyTorque: 304.923, fullTorque: 469.102 },
      ],
      AL2024: [
        { engagement: 7.9375, pulloutLoad: 39492.2, assemblyTorque: 102.681, fullTorque: 157.964 },
        { engagement: 9.525, pulloutLoad: 47390.9, assemblyTorque: 123.221, fullTorque: 189.566 },
        { engagement: 11.1125, pulloutLoad: 55289.2, assemblyTorque: 143.751, fullTorque: 221.157 },
        { engagement: 12.7, pulloutLoad: 63187.9, assemblyTorque: 164.291, fullTorque: 252.747 },
        { engagement: 14.2875, pulloutLoad: 71086.1, assemblyTorque: 184.821, fullTorque: 284.349 },
        { engagement: 15.875, pulloutLoad: 78984.8, assemblyTorque: 205.361, fullTorque: 315.939 },
        { engagement: 19.05, pulloutLoad: 94781.8, assemblyTorque: 246.431, fullTorque: 379.132 },
        { engagement: 22.225, pulloutLoad: 110579, assemblyTorque: 287.501, fullTorque: 442.313 },
        { engagement: 25.4, pulloutLoad: 126376, assemblyTorque: 328.571, fullTorque: 505.505 },
      ],
      AL7075: [
        { engagement: 7.9375, pulloutLoad: 48022.6, assemblyTorque: 124.86, fullTorque: 192.086 },
        { engagement: 9.525, pulloutLoad: 57627.2, assemblyTorque: 149.829, fullTorque: 230.512 },
        { engagement: 11.1125, pulloutLoad: 67231.8, assemblyTorque: 174.799, fullTorque: 268.926 },
        { engagement: 12.7, pulloutLoad: 76836.4, assemblyTorque: 199.78, fullTorque: 307.341 },
        { engagement: 14.2875, pulloutLoad: 86441, assemblyTorque: 224.749, fullTorque: 345.767 },
        { engagement: 15.875, pulloutLoad: 96045.6, assemblyTorque: 249.719, fullTorque: 384.182 },
        { engagement: 19.05, pulloutLoad: 115255, assemblyTorque: 299.658, fullTorque: 461.023 },
      ],
      SS304: [
        { engagement: 7.9375, pulloutLoad: 52656.7, assemblyTorque: 136.904, fullTorque: 210.626 },
        { engagement: 9.525, pulloutLoad: 63187.9, assemblyTorque: 164.291, fullTorque: 252.747 },
        { engagement: 11.1125, pulloutLoad: 73719, assemblyTorque: 191.667, fullTorque: 294.879 },
        { engagement: 12.7, pulloutLoad: 84250.7, assemblyTorque: 219.055, fullTorque: 337 },
        { engagement: 14.2875, pulloutLoad: 94781.8, assemblyTorque: 246.431, fullTorque: 379.132 },
        { engagement: 15.875, pulloutLoad: 105313, assemblyTorque: 273.819, fullTorque: 421.253 },
        { engagement: 19.05, pulloutLoad: 126376, assemblyTorque: 328.571, fullTorque: 505.505 },
      ],
    },
  },
  {
    size: "M24",
    diameter: "24.0",
    materials: {
      AL6061: [
        { engagement: 9.525, pulloutLoad: 40945.4, assemblyTorque: 127.752, fullTorque: 196.537 },
        { engagement: 11.1125, pulloutLoad: 47769.5, assemblyTorque: 149.038, fullTorque: 229.291 },
        { engagement: 12.7, pulloutLoad: 54593.9, assemblyTorque: 170.336, fullTorque: 262.046 },
        { engagement: 14.2875, pulloutLoad: 61417.9, assemblyTorque: 191.622, fullTorque: 294.811 },
        { engagement: 15.875, pulloutLoad: 68242.4, assemblyTorque: 212.92, fullTorque: 327.566 },
        { engagement: 19.05, pulloutLoad: 81890.9, assemblyTorque: 255.504, fullTorque: 393.074 },
        { engagement: 22.225, pulloutLoad: 95539.3, assemblyTorque: 298.077, fullTorque: 458.583 },
        { engagement: 25.4, pulloutLoad: 109188, assemblyTorque: 340.661, fullTorque: 524.103 },
        { engagement: 28.575, pulloutLoad: 122836, assemblyTorque: 383.245, fullTorque: 589.611 },
        { engagement: 31.75, pulloutLoad: 136484, assemblyTorque: 425.829, fullTorque: 655.131 },
        { engagement: 34.925, pulloutLoad: 150133, assemblyTorque: 468.413, fullTorque: 720.64 },
        { engagement: 38.1, pulloutLoad: 163781, assemblyTorque: 510.996, fullTorque: 786.148 },
      ],
      A36: [
        { engagement: 9.525, pulloutLoad: 52774.1, assemblyTorque: 164.653, fullTorque: 253.312 },
        { engagement: 11.1125, pulloutLoad: 61569.6, assemblyTorque: 192.097, fullTorque: 295.534 },
        { engagement: 12.7, pulloutLoad: 70365.5, assemblyTorque: 219.541, fullTorque: 337.757 },
        { engagement: 14.2875, pulloutLoad: 79161, assemblyTorque: 246.985, fullTorque: 379.968 },
        { engagement: 15.875, pulloutLoad: 87956.9, assemblyTorque: 274.429, fullTorque: 422.19 },
        { engagement: 19.05, pulloutLoad: 105548, assemblyTorque: 329.306, fullTorque: 506.635 },
        { engagement: 22.225, pulloutLoad: 123139, assemblyTorque: 384.194, fullTorque: 591.069 },
        { engagement: 25.4, pulloutLoad: 140731, assemblyTorque: 439.082, fullTorque: 675.502 },
        { engagement: 28.575, pulloutLoad: 158322, assemblyTorque: 493.97, fullTorque: 759.947 },
        { engagement: 31.75, pulloutLoad: 175913, assemblyTorque: 548.846, fullTorque: 844.381 },
      ],
      AL2024: [
        { engagement: 9.525, pulloutLoad: 56868.7, assemblyTorque: 177.431, fullTorque: 272.971 },
        { engagement: 11.1125, pulloutLoad: 66346.6, assemblyTorque: 207, fullTorque: 318.459 },
        { engagement: 12.7, pulloutLoad: 75824.8, assemblyTorque: 236.568, fullTorque: 363.958 },
        { engagement: 14.2875, pulloutLoad: 85302.7, assemblyTorque: 266.147, fullTorque: 409.457 },
        { engagement: 15.875, pulloutLoad: 94780.9, assemblyTorque: 295.715, fullTorque: 454.945 },
        { engagement: 19.05, pulloutLoad: 113737, assemblyTorque: 354.863, fullTorque: 545.943 },
        { engagement: 22.225, pulloutLoad: 132693, assemblyTorque: 413.999, fullTorque: 636.929 },
        { engagement: 25.4, pulloutLoad: 151650, assemblyTorque: 473.147, fullTorque: 727.916 },
        { engagement: 28.575, pulloutLoad: 170606, assemblyTorque: 532.294, fullTorque: 818.903 },
      ],
      AL7075: [
        { engagement: 9.525, pulloutLoad: 69152.1, assemblyTorque: 215.756, fullTorque: 331.927 },
        { engagement: 11.1125, pulloutLoad: 80677.4, assemblyTorque: 251.719, fullTorque: 387.256 },
        { engagement: 12.7, pulloutLoad: 92202.7, assemblyTorque: 287.671, fullTorque: 442.573 },
        { engagement: 14.2875, pulloutLoad: 103728, assemblyTorque: 323.634, fullTorque: 497.89 },
        { engagement: 15.875, pulloutLoad: 115253, assemblyTorque: 359.597, fullTorque: 553.219 },
        { engagement: 19.05, pulloutLoad: 138304, assemblyTorque: 431.512, fullTorque: 663.865 },
        { engagement: 22.225, pulloutLoad: 161355, assemblyTorque: 503.427, fullTorque: 774.5 },
        { engagement: 25.4, pulloutLoad: 184406, assemblyTorque: 575.341, fullTorque: 885.146 },
      ],
      SS304: [
        { engagement: 9.525, pulloutLoad: 75824.8, assemblyTorque: 236.568, fullTorque: 363.958 },
        { engagement: 11.1125, pulloutLoad: 88462.2, assemblyTorque: 275.999, fullTorque: 424.62 },
        { engagement: 12.7, pulloutLoad: 101100, assemblyTorque: 315.431, fullTorque: 485.281 },
        { engagement: 14.2875, pulloutLoad: 113737, assemblyTorque: 354.863, fullTorque: 545.943 },
        { engagement: 15.875, pulloutLoad: 126374, assemblyTorque: 394.283, fullTorque: 606.593 },
        { engagement: 19.05, pulloutLoad: 151650, assemblyTorque: 473.147, fullTorque: 727.916 },
        { engagement: 22.225, pulloutLoad: 176924, assemblyTorque: 551.999, fullTorque: 849.239 },
      ],
    },
  },
  {
    size: "M30",
    diameter: "30.0",
    materials: {
      AL6061: [
        { engagement: 11.1125, pulloutLoad: 60065.7, assemblyTorque: 234.251, fullTorque: 360.399 },
        { engagement: 12.7, pulloutLoad: 68646.3, assemblyTorque: 267.718, fullTorque: 411.875 },
        { engagement: 14.2875, pulloutLoad: 77227.4, assemblyTorque: 301.184, fullTorque: 463.362 },
        { engagement: 15.875, pulloutLoad: 85808, assemblyTorque: 334.65, fullTorque: 514.849 },
        { engagement: 19.05, pulloutLoad: 102970, assemblyTorque: 401.582, fullTorque: 617.812 },
        { engagement: 22.225, pulloutLoad: 120131, assemblyTorque: 468.514, fullTorque: 720.787 },
        { engagement: 25.4, pulloutLoad: 137293, assemblyTorque: 535.446, fullTorque: 823.761 },
        { engagement: 28.575, pulloutLoad: 154454, assemblyTorque: 602.367, fullTorque: 926.724 },
        { engagement: 31.75, pulloutLoad: 171616, assemblyTorque: 669.3, fullTorque: 1029.7 },
        { engagement: 34.925, pulloutLoad: 188778, assemblyTorque: 736.232, fullTorque: 1132.66 },
        { engagement: 38.1, pulloutLoad: 205939, assemblyTorque: 803.164, fullTorque: 1235.64 },
        { engagement: 44.45, pulloutLoad: 240263, assemblyTorque: 937.028, fullTorque: 1441.57 },
        { engagement: 50.8, pulloutLoad: 274586, assemblyTorque: 1070.88, fullTorque: 1647.51 },
      ],
      A36: [
        { engagement: 11.1125, pulloutLoad: 77417.7, assemblyTorque: 301.929, fullTorque: 464.503 },
        { engagement: 12.7, pulloutLoad: 88477.8, assemblyTorque: 345.067, fullTorque: 530.871 },
        { engagement: 14.2875, pulloutLoad: 99537.4, assemblyTorque: 388.193, fullTorque: 597.227 },
        { engagement: 15.875, pulloutLoad: 110597, assemblyTorque: 431.331, fullTorque: 663.582 },
        { engagement: 19.05, pulloutLoad: 132716, assemblyTorque: 517.595, fullTorque: 796.294 },
        { engagement: 22.225, pulloutLoad: 154836, assemblyTorque: 603.859, fullTorque: 929.018 },
        { engagement: 25.4, pulloutLoad: 176955, assemblyTorque: 690.123, fullTorque: 1061.73 },
        { engagement: 28.575, pulloutLoad: 199075, assemblyTorque: 776.387, fullTorque: 1194.45 },
        { engagement: 31.75, pulloutLoad: 221194, assemblyTorque: 862.662, fullTorque: 1327.16 },
        { engagement: 34.925, pulloutLoad: 243313, assemblyTorque: 948.926, fullTorque: 1459.88 },
        { engagement: 38.1, pulloutLoad: 265433, assemblyTorque: 1035.19, fullTorque: 1592.6 },
      ],
      AL2024: [
        { engagement: 11.1125, pulloutLoad: 83424.6, assemblyTorque: 325.351, fullTorque: 500.545 },
        { engagement: 12.7, pulloutLoad: 95342.3, assemblyTorque: 371.833, fullTorque: 572.053 },
        { engagement: 14.2875, pulloutLoad: 107260, assemblyTorque: 418.315, fullTorque: 643.562 },
        { engagement: 15.875, pulloutLoad: 119178, assemblyTorque: 464.797, fullTorque: 715.07 },
        { engagement: 19.05, pulloutLoad: 143013, assemblyTorque: 557.75, fullTorque: 858.086 },
        { engagement: 22.225, pulloutLoad: 166849, assemblyTorque: 650.714, fullTorque: 1001.09 },
        { engagement: 25.4, pulloutLoad: 190685, assemblyTorque: 743.666, fullTorque: 1144.11 },
        { engagement: 28.575, pulloutLoad: 214520, assemblyTorque: 836.63, fullTorque: 1287.12 },
        { engagement: 31.75, pulloutLoad: 238356, assemblyTorque: 929.583, fullTorque: 1430.14 },
        { engagement: 34.925, pulloutLoad: 262191, assemblyTorque: 1022.55, fullTorque: 1573.14 },
        { engagement: 38.1, pulloutLoad: 286027, assemblyTorque: 1115.5, fullTorque: 1716.16 },
      ],
      AL7075: [
        { engagement: 11.1125, pulloutLoad: 101444, assemblyTorque: 395.628, fullTorque: 608.661 },
        { engagement: 12.7, pulloutLoad: 115936, assemblyTorque: 452.154, fullTorque: 695.614 },
        { engagement: 14.2875, pulloutLoad: 130428, assemblyTorque: 508.669, fullTorque: 782.567 },
        { engagement: 15.875, pulloutLoad: 144920, assemblyTorque: 565.184, fullTorque: 869.52 },
        { engagement: 19.05, pulloutLoad: 173904, assemblyTorque: 678.225, fullTorque: 1043.43 },
        { engagement: 22.225, pulloutLoad: 202888, assemblyTorque: 791.267, fullTorque: 1217.33 },
        { engagement: 25.4, pulloutLoad: 231872, assemblyTorque: 904.308, fullTorque: 1391.24 },
        { engagement: 28.575, pulloutLoad: 260857, assemblyTorque: 1017.34, fullTorque: 1565.13 },
        { engagement: 31.75, pulloutLoad: 289840, assemblyTorque: 1130.38, fullTorque: 1739.04 },
      ],
      SS304: [
        { engagement: 11.1125, pulloutLoad: 111233, assemblyTorque: 433.805, fullTorque: 667.401 },
        { engagement: 12.7, pulloutLoad: 127123, assemblyTorque: 495.777, fullTorque: 762.738 },
        { engagement: 14.2875, pulloutLoad: 143013, assemblyTorque: 557.75, fullTorque: 858.086 },
        { engagement: 15.875, pulloutLoad: 158904, assemblyTorque: 619.722, fullTorque: 953.422 },
        { engagement: 19.05, pulloutLoad: 190685, assemblyTorque: 743.666, fullTorque: 1144.11 },
        { engagement: 22.225, pulloutLoad: 222465, assemblyTorque: 867.611, fullTorque: 1334.79 },
        { engagement: 25.4, pulloutLoad: 254246, assemblyTorque: 991.555, fullTorque: 1525.48 },
        { engagement: 28.575, pulloutLoad: 286027, assemblyTorque: 1115.5, fullTorque: 1716.16 },
      ],
    },
  },
];
