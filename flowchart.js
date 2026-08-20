// Shared, page-agnostic flowchart renderer. Takes a plain JSON tree
// description and renders it as a decision-tree diagram built from real
// DOM boxes (not monospace text), so it reflows and wraps instead of
// breaking a fixed-width ASCII layout on resize.
//
// Data shape passed to renderFlowchart(container, data, options):
//   { title?: string, trees: Node[] }
//
// Node (decision node — a branch point):
//   { label?: string, sublabel?: string, children?: Edge[] }
//   `label` may be omitted for a node that's just a pass-through (its edge
//   label already says everything needed) straight into more children.
//
// Node (leaf/result node — an answer):
//   {
//     result: true,
//     label: string,
//     meta?: string,                 // e.g. size range
//     link?: string,                 // id elsewhere on the page to jump to
//     footnote?: { marker: string, href: string },
//     variants?: {                   // extra lines shown only when active
//       tag: string,                 // gated by options.activeTags
//       note?: string,               // e.g. "Fine"
//       label: string,
//       meta?: string
//     }[]
//   }
//
// Edge: { edge?: string, node: Node } — `edge` is the branch condition
// label (e.g. "Thin"); omit/empty for an unlabeled branch.
//
// Options: { activeTags?: string[] }

(function () {
  function buildResultNode(node, activeTags) {
    const el = document.createElement(node.link ? "a" : "span");
    el.className = "fc-node fc-result";
    if (node.link) el.href = "#" + node.link;

    const labelEl = document.createElement("span");
    labelEl.className = "fc-result-label";
    labelEl.textContent = node.label;
    el.appendChild(labelEl);

    if (node.footnote) {
      const fnEl = document.createElement("a");
      fnEl.className = "fc-footnote";
      fnEl.href = "#" + node.footnote.href;
      fnEl.textContent = node.footnote.marker;
      el.appendChild(fnEl);
    }

    if (node.meta) {
      const metaEl = document.createElement("span");
      metaEl.className = "fc-result-meta";
      metaEl.textContent = node.meta;
      el.appendChild(metaEl);
    }

    (node.variants || [])
      .filter((v) => activeTags.has(v.tag))
      .forEach((v) => {
        const variantEl = document.createElement("span");
        variantEl.className = "fc-variant";

        if (v.note) {
          const noteEl = document.createElement("span");
          noteEl.className = "fc-variant-note";
          noteEl.textContent = v.note;
          variantEl.appendChild(noteEl);
        }

        const vLabelEl = document.createElement("span");
        vLabelEl.className = "fc-result-label";
        vLabelEl.textContent = v.label;
        variantEl.appendChild(vLabelEl);

        if (v.meta) {
          const vMetaEl = document.createElement("span");
          vMetaEl.className = "fc-result-meta";
          vMetaEl.textContent = v.meta;
          variantEl.appendChild(vMetaEl);
        }

        el.appendChild(variantEl);
      });

    return el;
  }

  function buildNodeRow(node, edgeLabel, activeTags, isRoot) {
    const row = document.createElement("div");
    row.className = "fc-node-row" + (isRoot ? " fc-node-row--root" : "");

    if (edgeLabel) {
      const edgeEl = document.createElement("span");
      edgeEl.className = "fc-edge-label";
      edgeEl.textContent = edgeLabel;
      row.appendChild(edgeEl);
    }

    if (node.result) {
      row.appendChild(buildResultNode(node, activeTags));
    } else if (node.label) {
      const decisionEl = document.createElement("span");
      decisionEl.className = "fc-node fc-decision";
      decisionEl.textContent = node.label;
      row.appendChild(decisionEl);

      if (node.sublabel) {
        const subEl = document.createElement("span");
        subEl.className = "fc-node-sublabel";
        subEl.textContent = node.sublabel;
        row.appendChild(subEl);
      }
    }

    return row;
  }

  function appendNode(parentEl, node, edgeLabel, activeTags, isRoot) {
    parentEl.appendChild(buildNodeRow(node, edgeLabel, activeTags, isRoot));

    if (node.children && node.children.length) {
      const ul = document.createElement("ul");
      node.children.forEach((edge) => {
        const li = document.createElement("li");
        appendNode(li, edge.node, edge.edge, activeTags, false);
        ul.appendChild(li);
      });
      parentEl.appendChild(ul);
    }
  }

  function renderFlowchart(container, data, options) {
    const activeTags = new Set((options && options.activeTags) || []);

    container.innerHTML = "";
    container.classList.add("fc-forest");

    if (data.title) {
      const titleEl = document.createElement("p");
      titleEl.className = "fc-title";
      titleEl.textContent = data.title;
      container.appendChild(titleEl);
    }

    data.trees.forEach((tree) => {
      const treeEl = document.createElement("div");
      treeEl.className = "fc-tree";
      appendNode(treeEl, tree, null, activeTags, true);
      container.appendChild(treeEl);
    });
  }

  window.renderFlowchart = renderFlowchart;
})();
