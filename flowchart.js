// Shared, page-agnostic flowchart renderer. Takes a plain JSON tree
// description and renders it as a top-down decision-tree diagram: question
// (decision) nodes are drawn as diamonds, results as rectangles, and the
// two are joined by CSS-drawn elbow connectors with the branch's answer
// labelled right where it leaves the diamond above it. The root question is
// centered at the top and children fan out left/right beneath it. Built
// from real DOM boxes, not a fixed layout, so labels wrap instead of
// overflowing — though a wide tree can still need to scroll horizontally
// inside its .flowchart panel on narrow screens.
//
// Data shape passed to renderFlowchart(container, data, options):
//   { title?: string, trees: Node[] }
//
// Node (decision node — a branch point, drawn as a diamond):
//   { label?: string, sublabel?: string, children?: Edge[] }
//   `label` may be omitted for a node that's just a pass-through (its edge
//   label already says everything needed) straight into more children.
//
// Node (leaf/result node — an answer, drawn as a rectangle):
//   {
//     result: true,
//     label: string,
//     meta?: string,                 // e.g. size range
//     note?: string,                 // e.g. "Coarse" — shown only while
//                                    // options.activeTags is non-empty,
//                                    // whether or not this node has a
//                                    // matching variant of its own
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
// Edge: { edge?: string, node: Node } — `edge` is the branch's answer label
// (e.g. "Yes"), shown right below the diamond it leaves; omit/empty for an
// unlabeled branch.
//
// Options: { activeTags?: string[] }
//
// initFlowchartCollapse(options) wires up a minimize/expand toggle button for
// a flowchart. Collapsing hides `group` (via the `hidden` attribute) — the
// whole spec-group the flowchart lives in, title and all — and clears
// `container`'s contents, so a minimized flowchart costs nothing — no
// layout, no paint, no DOM nodes sitting around — rather than just being
// visually hidden. Expanding calls `render` again to rebuild it. State
// persists per page via `storageKey` in localStorage.
//
// options: {
//   toggle: HTMLElement,     // the button that switches collapsed state
//   group: HTMLElement,      // the .spec-group to show/hide
//   container: HTMLElement,  // the .flowchart element to clear/rebuild
//   storageKey: string,      // localStorage key for persisting collapsed state
//   render: () => void,      // (re)builds the flowchart into `container`
// }

(function () {
  function buildResultNode(node, activeTags) {
    const el = document.createElement(node.link ? "a" : "span");
    el.className = "fc-node fc-result";
    if (node.link) el.href = "#" + node.link;

    const activeVariants = (node.variants || []).filter((v) => activeTags.has(v.tag));

    if (node.note && activeTags.size) {
      const noteEl = document.createElement("span");
      noteEl.className = "fc-result-note";
      noteEl.textContent = node.note;
      el.appendChild(noteEl);
    }

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

    activeVariants.forEach((v) => {
      const variantEl = document.createElement("span");
      variantEl.className = "fc-variant";

      if (v.note) {
        const noteEl = document.createElement("span");
        noteEl.className = "fc-result-note";
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

  function buildDecisionNode(node, isRoot) {
    const wrap = document.createElement("div");
    wrap.className = "fc-node-labelwrap";

    if (node.sublabel) {
      const subEl = document.createElement("span");
      subEl.className = "fc-node-sublabel";
      subEl.textContent = node.sublabel;
      wrap.appendChild(subEl);
    }

    const diamond = document.createElement("span");
    diamond.className = "fc-node fc-decision" + (isRoot ? " fc-decision--root" : "");

    const labelEl = document.createElement("span");
    labelEl.className = "fc-decision-label";
    labelEl.textContent = node.label;
    diamond.appendChild(labelEl);

    wrap.appendChild(diamond);
    return wrap;
  }

  function appendNode(li, node, activeTags, isRoot) {
    const isDecision = !node.result && node.label;
    if (node.result) {
      li.appendChild(buildResultNode(node, activeTags));
    } else if (isDecision) {
      li.appendChild(buildDecisionNode(node, isRoot));
    }

    if (node.children && node.children.length) {
      // A short tail off the point of the diamond, appended here (as a
      // sibling of the node box, not inside it) so the labelwrap's own gap
      // doesn't leave a blank break between the diamond and the tail. It
      // shifts the branch labels below clear of the diamond's point instead
      // of them overlapping/cropping it.
      if (isDecision) {
        const stub = document.createElement("span");
        stub.className = "fc-decision-stub";
        li.appendChild(stub);
      }

      const ul = document.createElement("ul");
      node.children.forEach((edge) => {
        const childLi = document.createElement("li");
        if (edge.edge) {
          const edgeEl = document.createElement("span");
          edgeEl.className = "fc-edge-label";
          edgeEl.textContent = edge.edge;
          childLi.appendChild(edgeEl);
        }
        appendNode(childLi, edge.node, activeTags, false);
        ul.appendChild(childLi);
      });
      li.appendChild(ul);
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
      const rootUl = document.createElement("ul");
      rootUl.className = "fc-tree";
      const rootLi = document.createElement("li");
      appendNode(rootLi, tree, activeTags, true);
      rootUl.appendChild(rootLi);
      container.appendChild(rootUl);
    });
  }

  function initFlowchartCollapse(options) {
    const { toggle, container, group, storageKey, render } = options;
    const SHOW_LABEL = "Show Flowchart";
    const HIDE_LABEL = "Hide Flowchart";

    // Lock the button to whichever label is wider so it doesn't change size
    // when the label toggles between the two.
    toggle.textContent = SHOW_LABEL;
    const showWidth = toggle.offsetWidth;
    toggle.textContent = HIDE_LABEL;
    const hideWidth = toggle.offsetWidth;
    toggle.style.minWidth = Math.max(showWidth, hideWidth) + "px";

    function apply(collapsed) {
      group.hidden = collapsed;
      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggle.classList.toggle("is-collapsed", collapsed);
      toggle.textContent = collapsed ? SHOW_LABEL : HIDE_LABEL;
      if (collapsed) {
        container.innerHTML = "";
        // renderFlowchart leaves "fc-forest" (display: flex) on the
        // container; that author rule beats the `[hidden]` UA style, so it
        // has to come off too or the empty, still-styled box stays visible.
        container.classList.remove("fc-forest");
      } else {
        render();
      }
    }

    let collapsed = localStorage.getItem(storageKey) === "true";
    apply(collapsed);

    toggle.addEventListener("click", () => {
      collapsed = !collapsed;
      localStorage.setItem(storageKey, String(collapsed));
      apply(collapsed);
    });
  }

  window.renderFlowchart = renderFlowchart;
  window.initFlowchartCollapse = initFlowchartCollapse;
})();
