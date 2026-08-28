// Shared, page-agnostic navigation renderer. Builds both nav bars into
// every page's <div class="site-nav"></div> from the structure in
// site-nav-data.js, so pages never hardcode the tab list.
//
//   upper bar (.category-nav) — the categories. Clicking one only swaps
//     which set of tabs the lower bar shows; it never navigates.
//   lower bar (.tab-nav) — the pages of the selected category. These are
//     real links, and are the only things here that navigate.
//
// On load the selected category is the one containing the current page, and
// that page's tab is marked active. Each page is a separate full navigation,
// so the horizontally-scrollable bars always load scrolled back to the
// start — centerInBar() brings the active entries into view so an off-screen
// tab doesn't leave the bar snapped to the first entry.

// Bring `el` into view in a horizontally-scrolling bar. Done by setting the
// bar's own scrollLeft rather than with scrollIntoView(), which also scrolls
// every ancestor — including the document, which would jump the page down on
// load just to nudge a nav bar sideways.
function centerInBar(bar, el) {
  if (!el) return;
  const barBox = bar.getBoundingClientRect();
  const elBox = el.getBoundingClientRect();
  // Already fully in view (the common case) — don't scroll at all, so a
  // narrow screen doesn't clip the first entry just to center it.
  if (elBox.left >= barBox.left && elBox.right <= barBox.right) return;
  // An entry wider than the bar can't be centered without clipping both
  // ends, so show it from its start instead.
  const offset =
    elBox.width >= barBox.width ? 0 : (barBox.width - elBox.width) / 2;
  bar.scrollLeft += elBox.left - barBox.left - offset;
}

// Compare page identities ignoring a ".html" extension. Some hosts (GitHub
// Pages) keep the extension in the URL, others (Cloudflare Pages) serve the
// same file at a clean, extensionless path and redirect the ".html" URL
// there — so the location's filename won't always match the ".html" hrefs in
// site-nav-data.js. Strip the extension from both before comparing.
function pageKey(name) {
  return name.replace(/\.html$/, "");
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".site-nav");
  if (!container || typeof siteNav === "undefined") return;

  const currentFile = (() => {
    const file = window.location.pathname.split("/").pop();
    // index.html is a bare redirect, so a bare directory URL lands on the
    // first page of the first category.
    return file && pageKey(file) !== "index"
      ? file
      : siteNav[0].pages[0].href;
  })();
  const currentKey = pageKey(currentFile);

  const activeCategoryIndex = Math.max(
    0,
    siteNav.findIndex((category) =>
      category.pages.some((page) => pageKey(page.href) === currentKey)
    )
  );

  const categoryNav = document.createElement("nav");
  categoryNav.className = "category-nav";
  categoryNav.setAttribute("aria-label", "Reference category selection");
  const categoryList = document.createElement("ul");
  categoryList.setAttribute("role", "tablist");
  categoryNav.appendChild(categoryList);

  const tabNav = document.createElement("nav");
  tabNav.className = "tab-nav";
  tabNav.setAttribute("aria-label", "Reference tool selection");
  const tabList = document.createElement("ul");
  tabNav.appendChild(tabList);

  function renderTabs(categoryIndex) {
    tabList.replaceChildren();
    for (const page of siteNav[categoryIndex].pages) {
      const link = document.createElement("a");
      link.className = "tab-nav-link";
      link.href = page.href;
      link.textContent = page.label;
      if (pageKey(page.href) === currentKey)
        link.setAttribute("aria-current", "page");

      const item = document.createElement("li");
      item.appendChild(link);
      tabList.appendChild(item);
    }
    tabNav.scrollLeft = 0;
    centerInBar(
      tabNav,
      tabList.querySelector(".tab-nav-link[aria-current='page']")
    );
  }

  function selectCategory(categoryIndex) {
    for (const button of categoryList.querySelectorAll(".category-nav-link")) {
      const selected = Number(button.dataset.categoryIndex) === categoryIndex;
      button.setAttribute("aria-selected", selected ? "true" : "false");
    }
    renderTabs(categoryIndex);
  }

  siteNav.forEach((category, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-nav-link";
    button.dataset.categoryIndex = String(index);
    button.setAttribute("role", "tab");
    button.textContent = category.label;
    button.addEventListener("click", () => selectCategory(index));

    const item = document.createElement("li");
    item.appendChild(button);
    categoryList.appendChild(item);
  });

  container.replaceChildren(categoryNav, tabNav);
  selectCategory(activeCategoryIndex);
  centerInBar(
    categoryNav,
    categoryList.querySelector(".category-nav-link[aria-selected='true']")
  );
});
