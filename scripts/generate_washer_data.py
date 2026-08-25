#!/usr/bin/env python3
"""Regenerates the `washerData` array in washer-data.js from the ISO standard
CSVs checked into assets/standards/ISO/washer/.

Run with no arguments to rewrite washer-data.js in place:

    python scripts/generate_washer_data.py

Run with --check to print the generated block to stdout instead (useful for
diffing against the current file without touching it):

    python scripts/generate_washer_data.py --check

Design notes
------------
- Every numeric value in the output is copied verbatim (just whitespace
  stripped) from the source CSV cell that produced it. Nothing is rounded,
  padded, or reformatted, so the generated file only ever contains values
  that exist in the CSVs.
- Each CSV is one row per nominal size (like the screw CSVs, not transposed
  like the nut CSVs), with no "Include?" column — every row is included.
  Sizes are driven by the union of all three standards, sorted numerically,
  since ISO 7089 (Normal) and ISO 7092 (Small) share the same size range and
  ISO 7093-1 (Large) only covers a subset of it.
- NORMAL/SMALL/LARGE: each entry carries nested `NORMAL`, `SMALL`, and
  `LARGE` objects (ISO 7089, 7092, 7093-1 respectively) with `minID`,
  `maxOD`, and `nominalThickness`, each rendered in its own chart row
  below using the same slider index. A standard not offered at a given size
  gets "-" placeholders, matching the SHCS/FHCS/BHCS convention in
  screw-data.js.
- ISO 7093-1's source CSV has a handful of duplicate trailing rows (same
  size, same values); parsing keeps the first occurrence of each size and
  ignores the rest.
"""
import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STANDARDS_DIR = ROOT / "assets" / "standards" / "ISO" / "washer"
DATA_JS = ROOT / "washer-data.js"

STANDARDS = {
    "NORMAL": "ISO Standards - ISO 7089.csv",
    "SMALL": "ISO Standards - ISO 7092.csv",
    "LARGE": "ISO Standards - ISO 7093-1.csv",
}

EMPTY_ENTRY = {"minID": "-", "maxOD": "-", "nominalThickness": "-"}


def read_rows(filename):
    path = STANDARDS_DIR / filename
    with path.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.reader(f))
    # Drop fully-blank rows (trailing blank lines, stray spacer rows, etc).
    return [row for row in rows if any(cell.strip() for cell in row)]


def cell(row, i):
    return row[i].strip() if i < len(row) else ""


def fkey(s, digits=3):
    """Float key for matching a numeric label across CSVs that may format
    the same value with different precision (e.g. "1.5" vs "1.50")."""
    return round(float(s.strip()), digits)


def parse_standard(filename):
    """Reads a washer standard CSV: one row per nominal size, columns for
    clearance hole (ID), outside diameter (OD), and thickness. Returns
    {size_fkey: {"size": raw_size_str, "minID": ..., "maxOD": ...,
    "nominalThickness": ...}}, keeping the first occurrence of a duplicate
    size row.

    Each CSV has two clearance-hole columns and two outside-diameter columns
    (a nominal value and a min/max bound); we want the min bound for the
    clearance hole and the max bound for the outside diameter, so the column
    is picked by matching "min"/"max" in the header text rather than by
    position."""
    rows = read_rows(filename)
    header = [h.strip() for h in rows[0]]
    idx = {
        "size": 0,
        "id": next(
            i for i, h in enumerate(header)
            if h.startswith("Clearance hole") and "min" in h.lower()
        ),
        "od": next(
            i for i, h in enumerate(header)
            if h.startswith("Outside diameter") and "max" in h.lower()
        ),
        "thickness": next(i for i, h in enumerate(header) if h.startswith("Thickness h nom")),
    }

    entries = {}
    for row in rows[1:]:
        size_str = cell(row, idx["size"])
        key = fkey(size_str)
        if key in entries:
            continue
        entries[key] = {
            "size": size_str,
            "minID": cell(row, idx["id"]),
            "maxOD": cell(row, idx["od"]),
            "nominalThickness": cell(row, idx["thickness"]),
        }
    return entries


def format_diameter(diam_str):
    """Derived display field (not itself a CSV column): always one decimal,
    e.g. "2" -> "2.0", "2.5" -> "2.5"."""
    return f"{float(diam_str):.1f}"


def build_washer_data():
    standards = {key: parse_standard(filename) for key, filename in STANDARDS.items()}

    all_keys = sorted({key for entries in standards.values() for key in entries})

    washer_data = []
    for key in all_keys:
        # Use whichever standard has this size for the display size string.
        diam_str = next(
            standards[std][key]["size"] for std in STANDARDS if key in standards[std]
        )
        entry = {
            "size": f"M{diam_str}",
            "diameter": format_diameter(diam_str),
        }
        for std in STANDARDS:
            std_entries = standards[std]
            entry[std] = dict(std_entries[key]) if key in std_entries else dict(EMPTY_ENTRY)
            entry[std].pop("size", None)
        washer_data.append(entry)

    return washer_data


# ---------------------------------------------------------------------------
# JS serialization
# ---------------------------------------------------------------------------

def js_str(value):
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def js_std_entry(entry):
    fields = [
        f'minID: {js_str(entry["minID"])}',
        f'maxOD: {js_str(entry["maxOD"])}',
        f'nominalThickness: {js_str(entry["nominalThickness"])}',
    ]
    return "{ " + ", ".join(fields) + " }"


def js_washer_entry(entry):
    pad = "  "
    inner = "    "
    lines = []
    lines.append(f"{pad}{{")
    lines.append(f'{inner}size: {js_str(entry["size"])},')
    lines.append(f'{inner}diameter: {js_str(entry["diameter"])},')
    lines.append(f'{inner}NORMAL: {js_std_entry(entry["NORMAL"])},')
    lines.append(f'{inner}SMALL: {js_std_entry(entry["SMALL"])},')
    lines.append(f'{inner}LARGE: {js_std_entry(entry["LARGE"])}')
    lines.append(f"{pad}}}")
    return "\n".join(lines)


def render_washer_data_block(washer_data):
    entries = ",\n".join(js_washer_entry(e) for e in washer_data)
    return f"const washerData = [\n{entries}\n];"


WASHER_DATA_RE = re.compile(r"const washerData = \[.*?\n\];", re.DOTALL)


def main():
    check_only = "--check" in sys.argv[1:]

    washer_data = build_washer_data()
    block = render_washer_data_block(washer_data)

    if check_only:
        print(block)
        return

    original = DATA_JS.read_text(encoding="utf-8")
    if not WASHER_DATA_RE.search(original):
        raise SystemExit("Could not find `const washerData = [ ... ];` block in washer-data.js")
    updated = WASHER_DATA_RE.sub(lambda _: block, original, count=1)
    with DATA_JS.open("w", encoding="utf-8", newline="\n") as f:
        f.write(updated)
    print(f"Wrote {len(washer_data)} sizes to {DATA_JS}")


if __name__ == "__main__":
    main()
