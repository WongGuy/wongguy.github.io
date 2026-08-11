// Shared dark-mode toggle logic. Knows nothing about any page's color
// values (those live in each page's own stylesheet as CSS custom
// properties) — it only ever sets/reads the `data-theme` attribute on
// <html> and persists the choice. Include this on every page, before the
// stylesheet, so the theme is applied before first paint (no flash).

(function () {
  const STORAGE_KEY = "theme";

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  applyTheme(getPreferredTheme());

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    toggle.checked =
      document.documentElement.getAttribute("data-theme") === "dark";

    toggle.addEventListener("change", () => {
      const theme = toggle.checked ? "dark" : "light";
      applyTheme(theme);
      localStorage.setItem(STORAGE_KEY, theme);
    });
  });
})();
