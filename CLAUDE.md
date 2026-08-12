# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A lightweight website designed to aggregate mechanical reference materials into a single unified source. Designed to have simple mechanical calculators, tables, charts, etc.

## Structure

Static site, no build step, no framework, no dependencies — plain HTML/CSS/JS loaded directly by the browser.

- `index.html` — a bare redirect (meta refresh) to `screw-selector.html`, kept only so GitHub Pages has a root document at `/`. Don't put real markup here.
- `screw-selector.html`, `nut-selector.html`, `washer-selector.html` — one page per reference tool. Each has its own `<section class="chart-card">` and a shared `.tab-nav` linking between the three.
- `style.css` — all styling. Colors as CSS custom properties on `:root`, plus a `:root[data-theme="dark"]` block overriding the same properties for dark mode.
- `theme.js` — shared, page-agnostic dark-mode toggle. Reads/writes `localStorage` and sets `data-theme` on `<html>`; has no knowledge of any page's actual colors. Include it in `<head>`, before the stylesheet link, so the theme is applied before first paint. Any page also needs a `#theme-toggle` checkbox (see the `.theme-switch` markup in `screw-selector.html`) for the toggle to attach to.
- `screw-data.js` — reference data tables for the screw selector (currently `screwData`, the ISO metric thread values, plus `screwFields` describing how to label/order them for display). This is the file to edit when adding or correcting screw reference values.
- `screw-app.js` — DOM logic that reads `screw-data.js` and renders the screw selector's interactive controls (slider + spec panel). Wrapped in an IIFE, queries elements by ID, no globals besides what `screw-data.js` exposes.
- `assets/images/<tool>/` — static images for that tool's page (e.g. `assets/images/screw/thread-diagram.svg`). `nut/` and `washer/` exist as empty placeholders until those selectors have diagrams.
- `assets/standards/ISO/<tool>/` — source-of-truth ISO standard CSVs for that tool (e.g. `assets/standards/ISO/screw/ISO Standards - ISO 262.csv`), checked in alongside a generator script (see `scripts/generate_screw_data.py`) that rebuilds the tool's `<tool>-data.js` from them. `nut/` and `washer/` exist as empty placeholders until those standards are sourced.

Each reference tool follows the same pattern: a data file (e.g. `screw-data.js`) describing the values, plus rendering logic (e.g. `screw-app.js`) that builds the table/panel from it. When adding a new reference tool, give it its own `<tool>-selector.html`, `<tool>-data.js`, `<tool>-app.js`, `assets/images/<tool>/`, and `assets/standards/ISO/<tool>/`, following this same data/render split rather than hardcoding values into HTML.

When adding a new page, give it its own stylesheet (or its own `:root` / `:root[data-theme="dark"]` blocks) so it can define a completely independent light/dark palette — `theme.js` is shared and reusable as-is, but colors are never shared, they're per-page CSS custom properties.

## Working in this repo

- Assume this project is hosted on github pages, with the site being deployed from main. Make sure that the site can always be easily ported to standalone if needed.
- Avoid fillets on page elements when possible in favor of sharp rectangular elements.