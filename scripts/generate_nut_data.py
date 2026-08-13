#!/usr/bin/env python3
"""Regenerates the `nutData` array in nut-data.js from the ISO standard CSVs
checked into assets/standards/ISO/nut/.

Run with no arguments to rewrite nut-data.js in place:

    python scripts/generate_nut_data.py

Run with --check to print the generated block to stdout instead (useful for
diffing against the current file without touching it):

    python scripts/generate_nut_data.py --check

Design notes
------------
- Every numeric value in the output is copied verbatim (just whitespace
  stripped) from the source CSV cell that produced it. Nothing is rounded,
  padded, or reformatted, so the generated file only ever contains values
  that exist in the CSVs.
- Unlike the screw CSVs (one row per size), the nut CSVs are transposed: one
  column per size, one row per attribute. ISO 4032 drives which sizes exist
  at all, via its "Include?" row, matching the screw generator's convention.
- ISO 4033 (Tall Nut), ISO 4035 (Thin Nut), and ISO 4161 (Flanged Nut) only
  cover a subset of sizes. A size missing from one of those standards gets
  its block filled with "-" placeholders, matching the SHCS/FHCS/BHCS
  convention in screw-data.js.
"""
import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STANDARDS_DIR = ROOT / "assets" / "standards" / "ISO" / "nut"
DATA_JS = ROOT / "nut-data.js"

TRUE_VALUES = {"true", "1", "yes", "y"}


def read_rows(filename):
    path = STANDARDS_DIR / filename
    with path.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.reader(f))
    # Drop fully-blank rows (trailing blank lines, stray spacer rows, etc).
    return [row for row in rows if any(cell.strip() for cell in row)]


def cell(row, i):
    return row[i].strip() if i < len(row) else ""


def normalize_size(s):
    """Collapses internal whitespace in a size label, e.g. "M 20" -> "M20",
    so header cells that were typo'd with a stray space still match."""
    return re.sub(r"\s+", "", s.strip())


def parse_transposed(filename):
    """Reads a nut standard CSV: first row is a header of size labels (first
    cell is the row-label header, e.g. "Thread (d)"), each subsequent row is
    one attribute with one value per size. Returns (sizes, {label: {size:
    value}})."""
    rows = read_rows(filename)
    sizes = [normalize_size(c) for c in rows[0][1:]]
    data = {}
    for row in rows[1:]:
        label = cell(row, 0)
        data[label] = {size: cell(row, i + 1) for i, size in enumerate(sizes)}
    return sizes, data


# ---------------------------------------------------------------------------
# ISO 4032 — Standard hex nut. Drives which sizes exist at all.
# ---------------------------------------------------------------------------

def parse_iso4032():
    sizes, data = parse_transposed("ISO Standards - ISO 4032.csv")
    included = []
    for size in sizes:
        if data["Include?"].get(size, "").lower() in TRUE_VALUES:
            included.append(size)
    return included, data


# ---------------------------------------------------------------------------
# ISO 4033 / 4035 / 4161 — Tall, Thin, and Flanged nuts. Each only defines a
# subset of sizes; sizes missing from a standard get "-" placeholders.
# ---------------------------------------------------------------------------

EMPTY_STD = {"circumscribedDiam": "-", "nutHeight": "-", "nutWidth": "-"}
EMPTY_FLANGED = {"flangeDiam": "-", "circumscribedDiam": "-", "nutHeight": "-", "nutWidth": "-"}


def build_std_entry(size, data):
    if size not in data.get("Circumscribed Diam Min", {}) or not data["Circumscribed Diam Min"][size]:
        return dict(EMPTY_STD)
    return {
        "circumscribedDiam": data["Circumscribed Diam Min"][size],
        "nutHeight": data["Nut Height Max"][size],
        "nutWidth": data["Nut Width Max"][size],
    }


def build_flanged_entry(size, data):
    if size not in data.get("Circumscribed Diam Min", {}) or not data["Circumscribed Diam Min"][size]:
        return dict(EMPTY_FLANGED)
    return {
        "flangeDiam": data["Flange Diam Max"][size],
        "circumscribedDiam": data["Circumscribed Diam Min"][size],
        "nutHeight": data["Nut Height Max"][size],
        "nutWidth": data["Nut Width Max"][size],
    }


# ---------------------------------------------------------------------------
# Assembly
# ---------------------------------------------------------------------------

def format_diameter(diam_str):
    """Derived display field (not itself a CSV column): always one decimal,
    e.g. "2" -> "2.0", "2.5" -> "2.5"."""
    return f"{float(diam_str):.1f}"


def build_nut_data():
    sizes, std_data = parse_iso4032()
    _, tall_data = parse_transposed("ISO Standards - ISO 4033.csv")
    _, thin_data = parse_transposed("ISO Standards - ISO 4035.csv")
    _, flanged_data = parse_transposed("ISO Standards - ISO 4161.csv")

    nut_data = []
    for size in sizes:
        diam_str = size[1:]  # strip leading "M"
        entry = {
            "size": size,
            "diameter": format_diameter(diam_str),
            "pitch": std_data["Pitch"][size],
            "STD": build_std_entry(size, std_data),
            "TALL": build_std_entry(size, tall_data),
            "THIN": build_std_entry(size, thin_data),
            "FLANGED": build_flanged_entry(size, flanged_data),
        }
        nut_data.append(entry)

    return nut_data


# ---------------------------------------------------------------------------
# JS serialization
# ---------------------------------------------------------------------------

def js_str(value):
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def js_std_entry(entry, indent, extra_key=None):
    pad = " " * indent
    fields = []
    if extra_key:
        fields.append(f'{extra_key}: {js_str(entry[extra_key])}')
    fields.append(f'circumscribedDiam: {js_str(entry["circumscribedDiam"])}')
    fields.append(f'nutHeight: {js_str(entry["nutHeight"])}')
    fields.append(f'nutWidth: {js_str(entry["nutWidth"])}')
    return "{ " + ", ".join(fields) + " }"


def js_nut_entry(entry):
    pad = "  "
    inner = "    "
    lines = []
    lines.append(f"{pad}{{")
    lines.append(f'{inner}size: {js_str(entry["size"])},')
    lines.append(f'{inner}diameter: {js_str(entry["diameter"])},')
    lines.append(f'{inner}pitch: {js_str(entry["pitch"])},')
    lines.append(f'{inner}STD: {js_std_entry(entry["STD"], len(inner))},')
    lines.append(f'{inner}TALL: {js_std_entry(entry["TALL"], len(inner))},')
    lines.append(f'{inner}THIN: {js_std_entry(entry["THIN"], len(inner))},')
    lines.append(f'{inner}FLANGED: {js_std_entry(entry["FLANGED"], len(inner), extra_key="flangeDiam")}')
    lines.append(f"{pad}}}")
    return "\n".join(lines)


def render_nut_data_block(nut_data):
    entries = ",\n".join(js_nut_entry(e) for e in nut_data)
    return f"const nutData = [\n{entries}\n];"


NUT_DATA_RE = re.compile(r"const nutData = \[.*?\n\];", re.DOTALL)


def main():
    check_only = "--check" in sys.argv[1:]

    nut_data = build_nut_data()
    block = render_nut_data_block(nut_data)

    if check_only:
        print(block)
        return

    original = DATA_JS.read_text(encoding="utf-8")
    if not NUT_DATA_RE.search(original):
        raise SystemExit("Could not find `const nutData = [ ... ];` block in nut-data.js")
    updated = NUT_DATA_RE.sub(lambda _: block, original, count=1)
    with DATA_JS.open("w", encoding="utf-8", newline="\n") as f:
        f.write(updated)
    print(f"Wrote {len(nut_data)} sizes to {DATA_JS}")


if __name__ == "__main__":
    main()
