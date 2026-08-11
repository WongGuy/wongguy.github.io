# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A lightweight website designed to aggregate mechanical reference materials into a single unified source. Designed to have simple mechanical calculators, tables, charts, etc.

## Structure

Static site, no build step, no framework, no dependencies — plain HTML/CSS/JS loaded directly by the browser.

- `index.html` — page shell/markup. One `<section class="chart-card">` per reference tool.
- `style.css` — all styling. Colors as CSS custom properties on `:root`, plus a `:root[data-theme="dark"]` block overriding the same properties for dark mode.
- `theme.js` — shared, page-agnostic dark-mode toggle. Reads/writes `localStorage` and sets `data-theme` on `<html>`; has no knowledge of any page's actual colors. Include it in `<head>`, before the stylesheet link, so the theme is applied before first paint. Any page also needs a `#theme-toggle` checkbox (see the `.theme-switch` markup in `index.html`) for the toggle to attach to.
- `data.js` — reference data tables (currently `screwData`, the ISO metric thread values, plus `screwFields` describing how to label/order them for display). This is the file to edit when adding or correcting reference values.
- `app.js` — DOM logic that reads `data.js` and renders the interactive controls (slider + spec panel). Wrapped in an IIFE, queries elements by ID, no globals besides what `data.js` exposes.
- `assets/images/` — static images (e.g. thread diagram SVG).

Each reference tool follows the same pattern: a data file (or section of `data.js`) describing the values, plus rendering logic that builds the table/panel from it. When adding a new reference tool, follow this same data/render split rather than hardcoding values into HTML.

When adding a new page, give it its own stylesheet (or its own `:root` / `:root[data-theme="dark"]` blocks) so it can define a completely independent light/dark palette — `theme.js` is shared and reusable as-is, but colors are never shared, they're per-page CSS custom properties.

## Working in this repo

- Assume this project is hosted on github pages, with the site being deployed from main. Make sure that the site can always be easily ported to standalone if needed.
- Avoid fillets on page elements when possible in favor of sharp rectangular elements.