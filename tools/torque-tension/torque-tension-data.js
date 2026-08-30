// The assumptions behind the torque-tension diagram, kept out of
// torque-tension-app.js the same way every other tool's numbers are kept out
// of its renderer. Nothing here is from a standard: ISO 898-1 supplies Rp0,2
// and ISO 724 the thread geometry (both in tools/bolt/bolt-data.js), but the
// friction range that's swept to draw the curve, the yield utilization, and
// the head bearing diameter are choices this page makes, so they live here
// where they can be read and changed without touching the plot code.
//
// The app also renders the page's assumptions list from these values, so the
// numbers quoted on the page can't drift away from the numbers plotted.

const torqueTensionAssumptions = {
  // ν, the fraction of Rp0,2 the assembly preload is allowed to reach. 0.9 is
  // the usual VDI 2230 figure for a torque-controlled joint: 90 % of the
  // yield point once the thread torsion in the tightening formula is already
  // accounted for. The ν slider under the size slider sweeps it; this is where
  // the slider starts.
  utilization: 0.9,
  utilizationMin: 0.1,
  utilizationMax: 0.9,
  utilizationStep: 0.01,

  // α_A, the tightening factor — the ratio of the largest to the smallest
  // preload a given target torque produces, i.e. the scatter of the tightening
  // tool. The α slider sets it; the plot uses it only to draw the lower-bound
  // preload line (the μ-mark preload divided by α), never the curve itself.
  // 1.1 is a measured, calibrated joint; 4 is a hand-feel impact wrench. 1.4
  // is a typical torque wrench and is where the slider starts.
  tighteningFactorMin: 1.1,
  tighteningFactorMax: 4,
  tighteningFactorStep: 0.1,
  tighteningFactorDefault: 1.4,

  // The friction coefficient swept along the curve. Every point on the arc is
  // one value of μ, and both the thread friction μG in the preload formula
  // and the head friction μK in the torque formula are set to it — a lubed
  // thread under a dry head (or the reverse) isn't a point on this curve.
  // 0.04 to 0.30 spans the usual range, from a well-lubricated fastener to a
  // dry, as-received one.
  frictionMin: 0.04,
  frictionMax: 0.3,
  frictionStep: 0.02,

  // The friction slider under the size slider picks one μ off that range and
  // marks it on every curve, with a ray from the origin through those marks.
  // It moves in finer steps than the curve is sampled at, and starts here — a
  // typical as-received, lightly-oiled value.
  frictionSliderStep: 0.005,
  frictionDefault: 0.12,

  // D_Km, the effective diameter the head friction torque acts at, as a
  // multiple of the nominal diameter d. It's really the mean of the head
  // bearing outside diameter and the clearance hole, so it belongs to the
  // head style and the hole, not the thread; 1.3 d is the usual
  // approximation for a standard head on a normal clearance hole and keeps
  // this page independent of any one head standard.
  bearingDiameterFactor: 1.3,
};
