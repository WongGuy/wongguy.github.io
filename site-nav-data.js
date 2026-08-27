// Site-wide navigation structure, kept separate from the renderer (see
// tab-nav.js) the same way each tool's data file is kept separate from its
// app file. Adding a page to the site means adding an entry here — no page
// markup changes, since every page renders both nav bars from this list.
//
// Shape:
//   [{ label: <category name>, pages: [{ label, href }, ...] }, ...]
//
// The upper bar shows the categories; the lower bar shows the pages of the
// selected category. Selecting a category only swaps the lower bar — it
// never navigates. Only a lower-bar page link navigates.

const siteNav = [
  {
    label: "Hardware Standards",
    pages: [
      { label: "Socket Screw Selector", href: "screw-selector.html" },
      { label: "Nut Selector", href: "nut-selector.html" },
      { label: "Washer Selector", href: "washer-selector.html" },
    ],
  },
  {
    label: "Bolting Information",
    pages: [
      { label: "NASA Tightening Torque", href: "nasa-tightening-torque.html" },
      { label: "VDI Screw Sizing", href: "vdi-screw-sizing.html" },
    ],
  },
];
