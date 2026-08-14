// Shared, page-agnostic footer content. Populates every page's <footer>
// on load, so pages only need to include this script (like theme.js /
// tab-nav.js) and an empty <footer></footer> rather than duplicating
// the markup.

document.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector("footer");
  if (!footer) return;

  const links = document.createElement("p");
  links.innerHTML =
    '<a href="https://github.com/WongGuy/wongguy.github.io/tree/main/assets/standards/ISO" target="_blank" rel="noopener">Source Data Tables</a>' +
    ' | ' +
    '<a href="https://github.com/WongGuy/wongguy.github.io/issues/new" target="_blank" rel="noopener">Report Issue</a>';
  footer.appendChild(links);

  const attribution = document.createElement("p");
  attribution.innerHTML =
    'Made by Eric: <a href="https://ericwong.design" target="_blank" rel="noopener">ericwong.design</a>';
  footer.appendChild(attribution);

  const disclaimer = document.createElement("p");
  disclaimer.textContent =
    "These are reference values only and may contain errors. Verify against the applicable standard before use in critical applications.";
  footer.appendChild(disclaimer);
});
