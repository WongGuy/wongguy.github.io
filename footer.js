// Shared, page-agnostic footer content. Populates every page's <footer>
// on load, so pages only need to include this script (like theme.js /
// tab-nav.js) and an empty <footer></footer> rather than duplicating
// the markup.

document.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector("footer");
  if (!footer) return;

  const sourceData = document.createElement("p");
  sourceData.innerHTML =
    '<a href="https://github.com/WongGuy/wongguy.github.io/tree/main/assets/standards/ISO" target="_blank" rel="noopener">Source Data Tables</a>';
  footer.appendChild(sourceData);

  const attribution = document.createElement("p");
  attribution.innerHTML =
    'Made by Eric: <a href="https://ericwong.design" target="_blank" rel="noopener">ericwong.design</a>';
  footer.appendChild(attribution);
});
