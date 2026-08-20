// Flowchart data shown on the washer selector page, rendered by
// flowchart.js. Edit the washerFlowchartData tree below to update the
// flowchart itself; see flowchart.js for the shape Node/Edge objects are
// expected to have.

const washerFlowchartData = {
  title: "What is going through the washer?",
  trees: [
    {
      label: "Regular Bolt/Screw, Up to Class 10.9",
      sublabel: "Grade A Washers, Default",
      children: [
        {
          edge: "Small",
          node: { result: true, label: "ISO 7092", meta: "M1.6-M36" },
        },
        {
          edge: "Normal",
          node: {
            children: [
              {
                edge: "Default",
                node: { result: true, label: "ISO 7089", meta: "M1.6-M64" },
              },
              {
                edge: "Chamfered",
                node: { result: true, label: "ISO 7090", meta: "M5-M64" },
              },
            ],
          },
        },
        {
          edge: "Large",
          node: { result: true, label: "ISO 7093-1", meta: "M3-M36" },
        },
      ],
    },
    {
      label: "Regular Bolt/Screw, Up to Class 6.8",
      sublabel: "Grade C Washers",
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
    {
      label: "Clevis Pin",
      children: [{ node: { result: true, label: "ISO 8738", meta: "⌀3-100" } }],
    },
    {
      label: "Captive Screw",
      children: [{ node: { result: true, label: "ISO 10673", meta: "M2-M12" } }],
    },
  ],
};

(function () {
  const flowchartEl = document.getElementById("flowchart");
  renderFlowchart(flowchartEl, washerFlowchartData);
})();
