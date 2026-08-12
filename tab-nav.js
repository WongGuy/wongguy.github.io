// Shared, page-agnostic tab-nav behavior. Each page is a separate full
// navigation, so the horizontally-scrollable tab bar (see .tab-nav in
// style.css) always loads scrolled back to the start. On load, scroll the
// active tab into view so navigating to an off-screen tab doesn't snap the
// bar back to the first entry.

document.addEventListener("DOMContentLoaded", () => {
  const active = document.querySelector(".tab-nav-link[aria-current='page']");
  if (!active) return;
  active.scrollIntoView({ block: "nearest", inline: "center" });
});
