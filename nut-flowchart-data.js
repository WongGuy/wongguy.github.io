// Flowchart data shown on the nut selector page, rendered by flowchart.js.
// Edit the nutFlowchartData tree below to update the flowchart itself; see
// flowchart.js for the shape Node/Edge objects are expected to have.
//
// Each result node's `variants` entry (tagged "detail") is the fine-pitch
// standard/range shown alongside the coarse one when the "I Crave Detail!"
// toggle is on; results with no fine-pitch equivalent just omit it.

const nutFlowchartData = {
  trees: [
    {
      label: "Locking feature?",
      children: [
        {
          edge: "No",
          node: {
            label: "Flange?",
            children: [
              {
                edge: "No",
                node: {
                  label: "Height?",
                  children: [
                    {
                      edge: "Thin",
                      node: {
                        result: true,
                        label: "ISO 4035",
                        link: "nut-iso-4035",
                        meta: "M1.6-64",
                        note: "Coarse",
                        variants: [{ tag: "detail", note: "Fine", label: "ISO 8675", meta: "M8-64" }],
                      },
                    },
                    {
                      edge: "Normal",
                      node: {
                        result: true,
                        label: "ISO 4032",
                        link: "nut-iso-4032",
                        meta: "M5-39",
                        note: "Coarse",
                        variants: [{ tag: "detail", note: "Fine", label: "ISO 8673", meta: "M8-39" }],
                      },
                    },
                    {
                      edge: "Tall",
                      node: {
                        result: true,
                        label: "ISO 4033",
                        link: "nut-iso-4033",
                        meta: "M5-39",
                        note: "Coarse",
                        variants: [{ tag: "detail", note: "Fine", label: "ISO 8674", meta: "M8-39" }],
                      },
                    },
                  ],
                },
              },
              {
                edge: "Yes",
                node: {
                  result: true,
                  label: "ISO 4161",
                  link: "nut-iso-4161",
                  meta: "M5-20",
                  note: "Coarse",
                  variants: [{ tag: "detail", note: "Fine", label: "ISO 10663", meta: "M8-20" }],
                },
              },
            ],
          },
        },
        {
          edge: "Yes",
          node: {
            label: "Flange?",
            children: [
              {
                edge: "No",
                node: {
                  label: "Insert material?",
                  children: [
                    {
                      edge: "Nylon",
                      node: {
                        label: "Height?",
                        children: [
                          {
                            edge: "Thin",
                            node: { result: true, label: "ISO 10511", meta: "M3-39", note: "Coarse" },
                          },
                          {
                            edge: "Normal",
                            node: {
                              result: true,
                              label: "ISO 7040",
                              meta: "M3-39",
                              note: "Coarse",
                              variants: [{ tag: "detail", note: "Fine", label: "ISO 10512", meta: "M8-39" }],
                            },
                          },
                          {
                            edge: "Tall",
                            node: { result: true, label: "ISO 7041", meta: "M5-39", note: "Coarse" },
                          },
                        ],
                      },
                    },
                    {
                      edge: "Metal",
                      node: {
                        label: "Height?",
                        children: [
                          {
                            edge: "Normal",
                            node: { result: true, label: "ISO 7719", meta: "M5-39", note: "Coarse" },
                          },
                          {
                            edge: "Tall",
                            node: {
                              result: true,
                              label: "ISO 7042",
                              meta: "M5-39",
                              note: "Coarse",
                              variants: [{ tag: "detail", note: "Fine", label: "ISO 10513", meta: "M8-39" }],
                            },
                          },
                          {
                            edge: "Taller",
                            node: {
                              result: true,
                              label: "ISO 7720",
                              meta: "M5-39",
                              note: "Coarse",
                              footnote: { marker: "†", href: "flowchart-disclaimer" },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                edge: "Yes",
                node: {
                  label: "Insert material?",
                  children: [
                    {
                      edge: "Nylon",
                      node: {
                        result: true,
                        label: "ISO 7043",
                        meta: "M5-20",
                        note: "Coarse",
                        variants: [{ tag: "detail", note: "Fine", label: "ISO 12125", meta: "M8-20" }],
                      },
                    },
                    {
                      edge: "Metal",
                      node: {
                        result: true,
                        label: "ISO 7044",
                        meta: "M5-20",
                        note: "Coarse",
                        variants: [{ tag: "detail", note: "Fine", label: "ISO 12126", meta: "M8-20" }],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

const nutFlowchartDisclaimer =
`†In 2025, ISO completely changed the title of ISO 7720. See, in 1983, ISO 7720 was named "Prevailing torque type all-metal hexagon nuts, style 2 — Property class 9". On the surface, this looks like a Class 9 extension to ISO 7042 (which supported class 5, 8, 10 and 12). Now, you may be wondering, why would ISO issue an entire new standard for this instead of updating ISO 7042 to include class 9? I think a hint lies in the fact that the two specs have slightly different nut heights and wrenching heights. I had never seen or used class 9 fasteners before researching this, but it appears that class 9 was mostly used in European automotive. This suggests to me that 7720 might have been added to accomodate the European auto industry, absorbing an existing standard they used, and in doing so, absorbing a slightly different set of nut dimensions resulting in a different ISO number. But even if all that was the case, why would ISO change the title of this standard? In 2025, ISO 7720 was retitled "Fasteners — Prevailing torque hexagon nuts — High nuts (all metal) with slot(s)", something completely diffent. Why not just withdraw the standard, as they have done with many nut standards before, and put out a new one for this taller nut with a slotted collar? I am not entirely sure. It's possible that when 7720 was first defined, that in addition to being a slightly different height, it had a different locking mechanism, and that the title has been changed to describe the locking mechanism and not the class. This generally tracks with ISO's desire to separate dimensions and classes into separate standards. If you have any insider knowledge on this, contact me via the github issues page. Please. I am unwilling to pay $65.88 to purchase the full standard and find out.`;

const nutFlowchartDisclaimerSimple =
`†In 2025, ISO changed the title of ISO 7720 from "Prevailing torque type all-metal hexagon nuts, style 2 — Property class 9" to "Fasteners — Prevailing torque hexagon nuts — High nuts (all metal) with slot(s)".`;

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

  function renderChart() {
    renderFlowchart(flowchartEl, nutFlowchartData, { activeTags: showDetail ? ["detail"] : [] });
  }

  function updateDisclaimer() {
    disclaimerEl.textContent = showDetail ? nutFlowchartDisclaimer : nutFlowchartDisclaimerSimple;
  }

  detailToggleEl.addEventListener("change", () => {
    showDetail = detailToggleEl.checked;
    localStorage.setItem(DETAIL_STORAGE_KEY, String(showDetail));
    updateDisclaimer();
    // Skip the rebuild while minimized — initFlowchartCollapse re-renders
    // with the current showDetail value when the flowchart is expanded again.
    if (!flowchartEl.hidden) renderChart();
  });

  updateDisclaimer();

  initFlowchartCollapse({
    toggle: document.getElementById("flowchart-collapse-toggle"),
    container: flowchartEl,
    group: document.getElementById("nut-flowchart-group"),
    // Shared with washer-flowchart-data.js (not nut-prefixed) so the
    // collapsed state stays in sync across tools.
    storageKey: "flowchartCollapsed",
    render: renderChart,
  });
})();
