#!/usr/bin/env python3
"""Regenerates the `screwData` array in screw-data.js from the ISO standard CSVs
checked into assets/standards/ISO/screw/.

Run with no arguments to rewrite screw-data.js in place:

    python scripts/generate_screw_data.py

Run with --check to print the generated block to stdout instead (useful for
diffing against the current file without touching it):

    python scripts/generate_screw_data.py --check

Design notes
------------
- Every numeric value in the output is copied verbatim (just whitespace
  stripped) from the source CSV cell that produced it. Nothing is rounded,
  padded, or reformatted, so the generated file only ever contains values
  that exist in the CSVs — no invented precision.
- Sizes are driven entirely by ISO 262's "Include?" column: a nominal
  diameter is only added to screwData if that column is TRUE for it, and
  every other CSV is looked up by diameter (and, for drill sizes, by pitch)
  rather than by row position. Adding/removing/reordering rows in any CSV,
  or changing which sizes are included, does not require touching this
  script.
- Head-style (SHCS/FHCS/BHCS) dimensions and lengths are optional per size:
  if a size doesn't appear in a given standard's "Screw Dimensions" CSV, its
  block is filled with "-" placeholders and an empty lengths array, matching
  the existing screw-data.js convention for head styles a size isn't offered in.
"""
import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STANDARDS_DIR = ROOT / "assets" / "standards" / "ISO" / "screw"
DATA_JS = ROOT / "tools" / "screw" / "screw-data.js"

TRUE_VALUES = {"true", "1", "yes", "y"}


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


# ---------------------------------------------------------------------------
# ISO 262 — nominal diameters, coarse/fine/extra-fine pitch, and inclusion
# ---------------------------------------------------------------------------

def parse_iso262():
    rows = read_rows("ISO Standards - ISO 262.csv")
    header = [h.strip() for h in rows[0]]
    idx = {h: header.index(h) for h in ("Nominal Diameter", "Coarse", "Fine", "Extra Fine", "Include?")}

    sizes = []
    for row in rows[1:]:
        included = cell(row, idx["Include?"]).lower() in TRUE_VALUES
        if not included:
            continue
        sizes.append({
            "diam": cell(row, idx["Nominal Diameter"]),
            "coarse": cell(row, idx["Coarse"]) or None,
            "fine": cell(row, idx["Fine"]) or None,
            "xfine": cell(row, idx["Extra Fine"]) or None,
        })
    return sizes


# ---------------------------------------------------------------------------
# ISO 2306 — tap drill size, indexed by (diameter, pitch)
# ---------------------------------------------------------------------------

def parse_iso2306():
    rows = read_rows("ISO Standards - ISO 2306.csv")
    header = rows[0]
    pitch_cols = [(i, fkey(header[i])) for i in range(1, len(header)) if header[i].strip()]

    drill = {}
    for row in rows[1:]:
        diam = fkey(cell(row, 0))
        for i, pitch_f in pitch_cols:
            val = cell(row, i)
            if val:
                drill[(diam, pitch_f)] = val
    return drill


def tap_drill_for(drill_index, diam_str, pitch_str):
    if pitch_str is None:
        return None
    return drill_index.get((fkey(diam_str), fkey(pitch_str)))


# ---------------------------------------------------------------------------
# ISO 273 — clearance hole sizes, indexed by diameter
# ---------------------------------------------------------------------------

def parse_iso273():
    rows = read_rows("ISO Standards - ISO 273.csv")
    header = [h.strip() for h in rows[0]]
    idx = {h: header.index(h) for h in ("Thread Diameter", "Tight", "Normal", "Loose")}

    clearance = {}
    for row in rows[1:]:
        diam = fkey(cell(row, idx["Thread Diameter"]))
        clearance[diam] = {
            "Close": cell(row, idx["Tight"]),
            "Normal": cell(row, idx["Normal"]),
            "Loose": cell(row, idx["Loose"]),
        }
    return clearance


# ---------------------------------------------------------------------------
# Head-style standards (ISO 4762 SHCS, ISO 10642 FHCS, ISO 7380 BHCS) —
# each has a "Screw Dimensions" CSV and a "Threaded Lengths" matrix CSV.
# ---------------------------------------------------------------------------

def parse_dimensions(filename, extra_cols=()):
    rows = read_rows(filename)
    header = [h.strip() for h in rows[0]]
    idx = {h: header.index(h) for h in ("Nominal Diam", "Driver Size", "Head Diam", "Head Height", *extra_cols)}

    dims = {}
    for row in rows[1:]:
        diam = fkey(cell(row, idx["Nominal Diam"]))
        entry = {
            "driverSize": cell(row, idx["Driver Size"]),
            "headDiam": cell(row, idx["Head Diam"]),
            "headHeight": cell(row, idx["Head Height"]),
        }
        for col in extra_cols:
            entry[col] = cell(row, idx[col])
        dims[diam] = entry
    return dims


def parse_lengths(filename):
    """Threaded-lengths matrix: first column is the overall length, the rest
    are one column per diameter, cell = threaded length for that pairing.
    Returns {diam_fkey: [{length, threaded}, ...]} in row (ascending) order."""
    rows = read_rows(filename)
    header = rows[0]
    diam_cols = [(i, fkey(header[i])) for i in range(1, len(header)) if header[i].strip()]

    lengths = {diam_f: [] for _, diam_f in diam_cols}
    for row in rows[1:]:
        length = cell(row, 0)
        for i, diam_f in diam_cols:
            threaded = cell(row, i)
            if threaded:
                lengths[diam_f].append({"length": length, "threaded": threaded})
    return lengths


HEAD_STYLES = {
    "SHCS": {
        "dims_file": "ISO Standards - ISO 4762 - Screw Dimensions.csv",
        "lengths_file": "ISO Standards - ISO 4762 - Threaded Lengths.csv",
        "extra_cols": ("Max Transition",),
    },
    "FHCS": {
        "dims_file": "ISO Standards - ISO 10642 - Screw Dimensions.csv",
        "lengths_file": "ISO Standards - ISO 10642 - Threaded Lengths.csv",
        "extra_cols": (),
    },
    "BHCS": {
        "dims_file": "ISO Standards - ISO 7380 - Screw Dimensions.csv",
        "lengths_file": "ISO Standards - ISO 7380 - Threaded Lengths.csv",
        "extra_cols": (),
    },
}

EMPTY_HEAD = {"driverSize": "-", "headDiam": "-", "headHeight": "-", "lengths": []}


def build_head_entry(style, diam_str, dims_index, lengths_index):
    diam_f = fkey(diam_str)
    dims = dims_index.get(diam_f)
    if dims is None:
        return dict(EMPTY_HEAD)

    entry = {
        "driverSize": dims["driverSize"],
        "headDiam": dims["headDiam"],
        "headHeight": dims["headHeight"],
    }
    if "Max Transition" in dims:
        entry["transitionDiameter"] = dims["Max Transition"]
    entry["lengths"] = lengths_index.get(diam_f, [])
    return entry


# ---------------------------------------------------------------------------
# Assembly
# ---------------------------------------------------------------------------

def format_diameter(diam_str):
    """Derived display field (not itself a CSV column): always one decimal,
    e.g. "2" -> "2.0", "2.5" -> "2.5"."""
    return f"{float(diam_str):.1f}"


def build_screw_data():
    sizes = parse_iso262()
    drill_index = parse_iso2306()
    clearance_index = parse_iso273()

    head_indexes = {}
    for style, cfg in HEAD_STYLES.items():
        head_indexes[style] = (
            parse_dimensions(cfg["dims_file"], cfg["extra_cols"]),
            parse_lengths(cfg["lengths_file"]),
        )

    screw_data = []
    for size in sizes:
        diam_str = size["diam"]

        pitch = {"*Coarse": size["coarse"] or "-", "Fine": size["fine"] or "-", "ExtraFine": size["xfine"] or "-"}
        tap_drill = {
            "*Coarse": tap_drill_for(drill_index, diam_str, size["coarse"]) or "-",
            "Fine": tap_drill_for(drill_index, diam_str, size["fine"]) or "-",
            "ExtraFine": tap_drill_for(drill_index, diam_str, size["xfine"]) or "-",
        }
        clearance = clearance_index.get(fkey(diam_str))
        if clearance is None:
            raise ValueError(f"No ISO 273 clearance hole entry for diameter {diam_str}")
        clearance_hole = {"Close": clearance["Close"], "*Normal": clearance["Normal"], "Loose": clearance["Loose"]}

        entry = {
            "size": f"M{diam_str}",
            "diameter": format_diameter(diam_str),
            "pitch": pitch,
            "tapDrill": tap_drill,
            "clearanceHole": clearance_hole,
        }
        for style, cfg in HEAD_STYLES.items():
            dims_index, lengths_index = head_indexes[style]
            entry[style] = build_head_entry(style, diam_str, dims_index, lengths_index)

        screw_data.append(entry)

    return screw_data


# ---------------------------------------------------------------------------
# JS serialization
# ---------------------------------------------------------------------------

def js_str(value):
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def js_sublabel_object(obj, indent):
    pad = " " * indent
    parts = [f"{js_str(k)}: {js_str(v)}" for k, v in obj.items()]
    return "{ " + ", ".join(parts) + " }"


def js_lengths_array(lengths, indent):
    if not lengths:
        return "[]"
    pad = " " * indent
    inner_pad = " " * (indent + 2)
    entries = [f'{{ length: {js_str(l["length"])}, threaded: {js_str(l["threaded"])} }}' for l in lengths]

    # Wrap entries several-per-line, similar in spirit to the hand-formatted
    # original, so the generated file stays reasonably readable/diffable.
    lines = []
    current = []
    current_len = 0
    max_width = 96
    for e in entries:
        piece_len = len(e) + 2
        if current and current_len + piece_len > max_width:
            lines.append(", ".join(current))
            current = []
            current_len = 0
        current.append(e)
        current_len += piece_len
    if current:
        lines.append(", ".join(current))

    body = f",\n{inner_pad}".join(lines)
    return f"[\n{inner_pad}{body}\n{pad}]"


def js_head_entry(entry, indent):
    pad = " " * indent
    inner_pad = " " * (indent + 2)
    fields = []
    fields.append(f'driverSize: {js_str(entry["driverSize"])}')
    fields.append(f'headDiam: {js_str(entry["headDiam"])}')
    fields.append(f'headHeight: {js_str(entry["headHeight"])}')
    if "transitionDiameter" in entry:
        fields.append(f'transitionDiameter: {js_str(entry["transitionDiameter"])}')
    header_line = ", ".join(fields) + ","
    lengths_js = js_lengths_array(entry["lengths"], indent + 2)
    return f"{{\n{inner_pad}{header_line}\n{inner_pad}lengths: {lengths_js}\n{pad}}}"


def js_screw_entry(entry):
    pad = "  "
    inner = "    "
    lines = []
    lines.append(f"{pad}{{")
    lines.append(f'{inner}size: {js_str(entry["size"])},')
    lines.append(f'{inner}diameter: {js_str(entry["diameter"])},')
    lines.append(f'{inner}pitch: {js_sublabel_object(entry["pitch"], len(inner))},')
    lines.append(f'{inner}tapDrill: {js_sublabel_object(entry["tapDrill"], len(inner))},')
    lines.append(f'{inner}clearanceHole: {js_sublabel_object(entry["clearanceHole"], len(inner))},')
    for style in ("SHCS", "FHCS", "BHCS"):
        trailing = "," if style != "BHCS" else ""
        lines.append(f'{inner}{style}: {js_head_entry(entry[style], len(inner))}{trailing}')
    lines.append(f"{pad}}}")
    return "\n".join(lines)


def render_screw_data_block(screw_data):
    entries = ",\n".join(js_screw_entry(e) for e in screw_data)
    return f"const screwData = [\n{entries}\n];"


SCREW_DATA_RE = re.compile(r"const screwData = \[.*?\n\];", re.DOTALL)


def main():
    check_only = "--check" in sys.argv[1:]

    screw_data = build_screw_data()
    block = render_screw_data_block(screw_data)

    if check_only:
        print(block)
        return

    original = DATA_JS.read_text(encoding="utf-8")
    if not SCREW_DATA_RE.search(original):
        raise SystemExit("Could not find `const screwData = [ ... ];` block in screw-data.js")
    updated = SCREW_DATA_RE.sub(lambda _: block, original, count=1)
    with DATA_JS.open("w", encoding="utf-8", newline="\n") as f:
        f.write(updated)
    print(f"Wrote {len(screw_data)} sizes to {DATA_JS}")


if __name__ == "__main__":
    main()
