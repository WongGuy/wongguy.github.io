# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A static website with no build step. The entire site currently consists of a single `index.html` file — there is no bundler, package manager, framework, CSS/JS tooling, or test suite in place.

## Working in this repo

- Edit `index.html` (and any additional static assets) directly; there is nothing to compile or transpile.
- To preview locally, open `index.html` in a browser or serve the directory with any static file server (e.g. `npx serve .` or Python's `http.server`) — there is no dedicated dev-server command configured.
- `node_modules/`, `dist/`, `.env`, and `.DS_Store` are gitignored, suggesting a build step may be introduced later; don't assume any of that tooling exists until it's actually added to the repo.
