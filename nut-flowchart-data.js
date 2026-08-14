// Static flowchart text shown on the nut selector page. Edit these strings
// directly to update the flowchart (kept in sync by hand with
// nut-selection-flowchart.txt, which is the plain-text authoring copy).
// nutFlowchart is the full coarse/fine breakdown; nutFlowchartSimple is the
// same tree with the coarse/fine distinction collapsed to just the coarse
// ISO standard, shown when the detail toggle is off. The disclaimer footnote
// is kept separate so it can wrap naturally instead of living inside the
// <pre> flowchart text.

const nutFlowchart =
`Do you need a locking feature?
├─ No  ─► Do you need a flange?
│         ├─ No  ─► What nut height?
│         │         ├─ Thin   ─► Coarse: ISO 4035 | Fine: ISO 8675
│         │         ├─ Normal ─► Coarse: ISO 4032 | Fine: ISO 8673
│         │         └─ Tall   ─► Coarse: ISO 4033 | Fine: ISO 8674
│         └─ Yes ─► Coarse: ISO 4161 | Fine: ISO 10663
│
└─ Yes ─► Do you need a flange?
          ├─ No  ─► What type of insert?
          │         ├─ Nylon ─► What nut height?
          │         │           ├─ Thin   ─► Coarse: ISO 10511 | Fine: NO
          │         │           ├─ Normal ─► Coarse: ISO 7040  | Fine: ISO 10512
          │         │           └─ Tall   ─► Coarse: ISO 7041  | Fine: NO
          │         └─ Metal ─► What nut height?
          │                     ├─ Normal ─► Coarse: ISO 7719  | Fine: NO
          │                     ├─ Tall   ─► Coarse: ISO 7042  | Fine: ISO 10513
          │                     └─ Taller ─► Coarse: ISO 7720† | Fine: NO
          └─ Yes ─► What type of insert?
                    ├─ Nylon ─► Coarse: ISO 7043 | Fine: ISO 12125
                    └─ Metal ─► Coarse: ISO 7044 | Fine: ISO 12126`;

const nutFlowchartSimple =
`Do you need a locking feature?
├─ No  ─► Do you need a flange?
│         ├─ No  ─► What nut height?
│         │         ├─ Thin   ─► ISO 4035
│         │         ├─ Normal ─► ISO 4032
│         │         └─ Tall   ─► ISO 4033
│         └─ Yes ─► ISO 4161
│
└─ Yes ─► Do you need a flange?
          ├─ No  ─► What type of insert?
          │         ├─ Nylon ─► What nut height?
          │         │           ├─ Thin   ─► ISO 10511
          │         │           ├─ Normal ─► ISO 7040
          │         │           └─ Tall   ─► ISO 7041
          │         └─ Metal ─► What nut height?
          │                     ├─ Normal ─► ISO 7719
          │                     ├─ Tall   ─► ISO 7042
          │                     └─ Taller ─► ISO 7720†
          └─ Yes ─► What type of insert?
                    ├─ Nylon ─► ISO 7043
                    └─ Metal ─► ISO 7044`;

const nutFlowchartDisclaimer =
`†In 2025, ISO completely changed the title of ISO 7720. See, in 1983, ISO 7720 was named "Prevailing torque type all-metal hexagon nuts, style 2 — Property class 9". This is because it was essentially a Class 9 extension to ISO 7042 (which supported class 5, 8, 10 and 12). Now, you may be wondering, why would ISO issue an entire new standard for this instead of updating ISO 7042 to include class 9? I think a hint lies in the fact that the two specs have slightly different nut heights and wrenching heights. I had never seen class 9 fasteners before reading this, and it appears that class 9 was mostly used in European automotive. This suggests to me that 7720 was added to accomodate the European auto industry, maybe absorbing an existing standard they used, and in doing so, they absorbed slightly different nut dimensions, resulting in a different ISO number. But even if all that was the case, why would ISO change the title of this standard? In 2025, ISO 7720 was retitled "Fasteners — Prevailing torque hexagon nuts — High nuts (all metal) with slot(s)", something completely diffent. Why not just withdraw the standard, as they have done with many nut standards before, and put out a new one for this taller nut with a slotted collar? I am not entirely sure. It's possible that when 7720 was first defined, that in addition to being a slightly different height, it had a different locking mechanism, and that the title has been changed to describe the locking mechanism and not the class. This generally tracks with ISO's desire to separate dimensions and classes into separate standards. If you have any insider knowledge on this, contact me via the github issues page. Please. I am unwilling to pay $65.88 to purchase the full standard and find out.`;

const nutFlowchartDisclaimerSimple =
`†In 2025, ISO changed the title of ISO 7720.`;

(function () {
  const flowchartEl = document.getElementById("flowchart");
  const disclaimerEl = document.getElementById("flowchart-disclaimer");
  const detailToggleEl = document.getElementById("detail-toggle");

  // Shared with screw-app.js (not nut-prefixed) so the detail toggle stays in
  // sync across tools.
  const DETAIL_STORAGE_KEY = "detailEnabled";

  function getStoredDetail() {
    const stored = localStorage.getItem(DETAIL_STORAGE_KEY);
    if (stored === null) {
      return true;
    }
    return stored === "true";
  }

  let showDetail = getStoredDetail();
  detailToggleEl.checked = showDetail;

  // ISO standards with a matching spec-group section further down this page,
  // keyed by the id to link to. Only these get turned into links in the
  // flowchart text; the rest have no drawing on the page yet.
  const linkedStandards = {
    4032: "nut-iso-4032",
    4033: "nut-iso-4033",
    4035: "nut-iso-4035",
    4161: "nut-iso-4161",
  };

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  }

  function linkifyFlowchart(text) {
    let html = escapeHtml(text);
    for (const [number, id] of Object.entries(linkedStandards)) {
      html = html.replace(
        new RegExp(`ISO ${number}(?!\\d)`, "g"),
        `<a href="#${id}">ISO ${number}</a>`
      );
    }
    return html;
  }

  function render() {
    flowchartEl.innerHTML = linkifyFlowchart(showDetail ? nutFlowchart : nutFlowchartSimple);
    disclaimerEl.textContent = showDetail
      ? nutFlowchartDisclaimer
      : nutFlowchartDisclaimerSimple;
  }

  detailToggleEl.addEventListener("change", () => {
    showDetail = detailToggleEl.checked;
    localStorage.setItem(DETAIL_STORAGE_KEY, String(showDetail));
    render();
  });

  render();
})();
