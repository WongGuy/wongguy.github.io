// Flowchart data shown on the washer selector page, rendered by
// flowchart.js. Edit the washerFlowchartData tree below to update the
// flowchart itself; see flowchart.js for the shape Node/Edge objects are
// expected to have.

const washerFlowchartData = {
  trees: [
    {
      label: "What's going through the washer?",
      children: [
        {
          edge: "Bolt/screw, up to Class 10.9",
          node: {
            sublabel: "Grade A Washers, Default",
            label: "Diameter?",
            children: [
              {
                edge: "Small",
                node: { result: true, label: "ISO 7092", link: "washer-iso-7092", meta: "M1.6-M36" },
              },
              {
                edge: "Normal",
                node: {
                  label: "Chamfered?",
                  children: [
                    {
                      edge: "No (Default)",
                      node: { result: true, label: "ISO 7089", link: "washer-iso-7089", meta: "M1.6-M64" },
                    },
                    {
                      edge: "Yes",
                      node: { result: true, label: "ISO 7090", meta: "M5-M64" },
                    },
                  ],
                },
              },
              {
                edge: "Large",
                node: { result: true, label: "ISO 7093-1", link: "washer-iso-7093-1", meta: "M3-M36" },
              },
            ],
          },
        },
        {
          edge: "Bolt/screw, up to Class 6.8",
          node: {
            sublabel: "Grade C Washers",
            label: "Diameter?",
            children: [
              {
                edge: "Normal",
                node: { result: true, label: "ISO 7091", meta: "M1.6-M64" },
              },
              {
                edge: "Large",
                node: { result: true, label: "ISO 7093-2", meta: "M3-M36" },
              },
              {
                edge: "Extra large",
                node: { result: true, label: "ISO 7094", meta: "M5-M36" },
              },
            ],
          },
        },
        {
          edge: "Clevis pin",
          node: { result: true, label: "ISO 8738", meta: "⌀3-100" },
        },
        {
          edge: "Captive screw",
          node: { result: true, label: "ISO 10673", meta: "M2-M12" },
        },
      ],
    },
  ],
};

(function () {
  const flowchartEl = document.getElementById("flowchart");

  function renderChart() {
    renderFlowchart(flowchartEl, washerFlowchartData);
  }

  initFlowchartCollapse({
    toggle: document.getElementById("flowchart-collapse-toggle"),
    container: flowchartEl,
    group: document.getElementById("washer-flowchart-group"),
    // Shared with nut-flowchart-data.js (not washer-prefixed) so the
    // collapsed state stays in sync across tools.
    storageKey: "flowchartCollapsed",
    render: renderChart,
  });
})();
