#!/usr/bin/env python3
"""Regenerates the `toleranceTables` array in tolerances-data.js from the
ISO 2768-1 workbook checked into assets/standards/ISO/tolerances/.

Run with no arguments to rewrite tolerances-data.js in place:

    python scripts/generate_tolerances_data.py

Run with --check to print the generated block to stdout instead (useful for
diffing against the current file without touching it):

    python scripts/generate_tolerances_data.py --check

Source
------
ISO 2768-1:1989(E), "General tolerances - Part 1: Tolerances for linear and
angular dimensions without individual tolerance indications", clause 4,
transcribed into "ISO Standards - ISO 2768-1.xlsx": one worksheet per table.

    Table 1  Permissible deviations for linear dimensions except for broken edges
    Table 2  Permissible deviations for broken edges (external radii, chamfer heights)
    Table 3  Permissible deviations of angular dimensions

All three sheets share one shape: two label columns (tolerance-class
Designation and Description) followed by one column per basic-size / length
range, and one row per tolerance class (f / m / c / v). They differ only in
how many range columns there are and in a unit-note line above the grid. The
sheets also carry a subtitle, footnotes, and a source citation; those are read
past and left out of the output (see Design notes).

Vertically merged value cells
-----------------------------
Tables 2 and 3 merge classes that share a deviation: in Table 2 medium takes
the same values as fine and very coarse the same as coarse, and in Table 3
medium takes the same values as fine. The workbook records this as vertical
`mergeCell` ranges over the value cells. This script expands them, so every
class row in the output carries its own full `deviations` array (one value per
range) rather than an empty row that only makes sense next to the one above
it - the shape a future picker ("show me class m") wants.

Design notes
------------
- Deviation values are stored as plain numbers, not the source strings. Every
  deviation in the standard is symmetric, so the "+/-" is dropped and only the
  magnitude is kept ("+/-0.15" -> 0.15). Table 3's degree/minute angles are
  converted to decimal degrees ("+/-0°30'" -> 0.5, rounded to 6 places). The
  standard's "no value given" dash becomes null. The app re-adds the "+/-"
  (and, for Table 3, the degree sign) when it renders the cell.
- Range headers ("over 30 up to 120") are parsed into numeric bounds - each
  becomes {min, max, minInclusive, maxInclusive}, with a null bound for an
  open end ("over 6" -> max null; "up to 10" -> min null). "over X" is an
  exclusive lower bound, "up to Y" / "X up to Y" are inclusive. The app turns
  these back into a concise label ("(30 - 120]").
- The standard's own citation line, its footnotes, and the parenthetical
  subtitle under Table 1's title are all dropped - the page shows the bare
  tables. Footnote reference markers (the superscript "1)" on a range header)
  are stripped from the range text along with the footnotes they point at.
- Row and range order follow the worksheet. Sheets are matched to output
  entries by their "Table N" title, and columns/rows are found by their
  header text ("Designation" / "Description"), not by fixed cell addresses,
  so re-spacing a sheet doesn't break the parse.
- The xlsx is read with zipfile + ElementTree rather than openpyxl/pandas, so
  this script has no third-party dependencies, matching the other generators.
"""
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = (
    ROOT / "assets" / "standards" / "ISO" / "tolerances" / "ISO Standards - ISO 2768-1.xlsx"
)
DATA_JS = ROOT / "tools" / "tolerances" / "tolerances-data.js"

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"

# One output entry per worksheet, keyed by the "Table N" the sheet title
# starts with. `key` is the stable identity the app uses (and the anchor a
# future control would persist); `slug` seeds nothing yet but keeps the three
# entries self-describing.
TABLE_SPECS = {
    1: {"key": "linear", "label": "Linear dimensions"},
    2: {"key": "brokenEdges", "label": "Broken edges"},
    3: {"key": "angular", "label": "Angular dimensions"},
}

TITLE_RE = re.compile(r"^Table\s+(?P<num>\d+)\s*[—-]\s*(?P<title>.+)$")
DESIGNATION_RE = re.compile(r"^[a-z]$")
# Superscript run left behind by a footnote reference, e.g. the "¹⁾" in
# "0.5¹⁾ up to 3". Stripped from range headers since the footnotes are dropped.
SUPERSCRIPT_RE = re.compile(r"[²³¹⁰-⁾]+")

# Range-header grammar (see module docstring): "X up to Y", "over X up to Y",
# "over X", "up to Y". "over" is an exclusive lower bound; everything else is
# inclusive.
_NUM = r"([0-9]+(?:\.[0-9]+)?)"
RANGE_OVER_UPTO_RE = re.compile(rf"^over\s+{_NUM}\s+up\s+to\s+{_NUM}$", re.I)
RANGE_X_UPTO_Y_RE = re.compile(rf"^{_NUM}\s+up\s+to\s+{_NUM}$", re.I)
RANGE_OVER_RE = re.compile(rf"^over\s+{_NUM}$", re.I)
RANGE_UPTO_RE = re.compile(rf"^up\s+to\s+{_NUM}$", re.I)


def parse_range(text):
    """"over 30 up to 120" -> {min: 30.0, max: 120.0, minInclusive: False,
    maxInclusive: True}. A null bound marks an open end."""
    t = text.strip()
    m = RANGE_X_UPTO_Y_RE.match(t)
    if m:
        return {
            "min": float(m.group(1)),
            "max": float(m.group(2)),
            "minInclusive": True,
            "maxInclusive": True,
        }
    m = RANGE_OVER_UPTO_RE.match(t)
    if m:
        return {
            "min": float(m.group(1)),
            "max": float(m.group(2)),
            "minInclusive": False,
            "maxInclusive": True,
        }
    m = RANGE_OVER_RE.match(t)
    if m:
        return {
            "min": float(m.group(1)),
            "max": None,
            "minInclusive": False,
            "maxInclusive": None,
        }
    m = RANGE_UPTO_RE.match(t)
    if m:
        return {
            "min": None,
            "max": float(m.group(1)),
            "minInclusive": None,
            "maxInclusive": True,
        }
    raise SystemExit(f"unrecognized range header {text!r}")


# A permissible deviation: "±" plus a magnitude. The magnitude is either a
# decimal (Tables 1-2, millimetres) or a degree/minute angle (Table 3). "—"
# is the standard's "no value given".
NO_VALUE = {"—", "–", "-", ""}
DEVIATION_MM_RE = re.compile(r"^±?\s*([0-9]+(?:\.[0-9]+)?)$")
DEVIATION_ANGLE_RE = re.compile(r"^±?\s*(?:([0-9]+)°)?\s*(?:([0-9]+)['′])?$")


def parse_deviation(text):
    """"±0.15" -> 0.15, "±0°30'" -> 0.5, "—" -> None. Every deviation in the
    standard is symmetric (±), so only the magnitude is kept. Angles are
    returned in decimal degrees (0°30' = 0.5)."""
    t = text.strip()
    if t in NO_VALUE:
        return None
    m = DEVIATION_MM_RE.match(t)
    if m:
        return float(m.group(1))
    m = DEVIATION_ANGLE_RE.match(t)
    if m and (m.group(1) or m.group(2)):
        degrees = int(m.group(1) or 0)
        minutes = int(m.group(2) or 0)
        return round(degrees + minutes / 60, 6)
    raise SystemExit(f"unrecognized deviation {text!r}")


# ---------------------------------------------------------------------------
# xlsx reading
# ---------------------------------------------------------------------------


def col_to_index(col):
    """"A" -> 0, "B" -> 1, ... (letters only, no row number)."""
    result = 0
    for ch in col:
        result = result * 26 + (ord(ch) - ord("A") + 1)
    return result - 1


def split_ref(ref):
    """"C5" -> ("C", 5)."""
    match = re.match(r"([A-Z]+)(\d+)", ref)
    return match.group(1), int(match.group(2))


def read_sheets(path):
    """Yields (sheet_name, cells, merges) for every worksheet, in workbook
    order. `cells` maps a cell ref to its stripped string value; `merges` maps
    every ref covered by a merge range to that range's top-left (anchor) ref."""
    with zipfile.ZipFile(path) as z:
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        targets = {
            rel.get("Id"): rel.get("Target")
            for rel in rels.findall(f"{REL_NS}Relationship")
        }
        workbook = ET.fromstring(z.read("xl/workbook.xml"))
        r_id = f"{{{NS['r']}}}id"
        for sheet in workbook.findall("m:sheets/m:sheet", NS):
            target = targets[sheet.get(r_id)]
            member = target[1:] if target.startswith("/") else "xl/" + target
            xml = z.read(member)
            yield sheet.get("name"), read_cells(xml), read_merges(xml)


def read_cells(sheet_xml):
    cells = {}
    root = ET.fromstring(sheet_xml)
    for row in root.findall(".//m:sheetData/m:row", NS):
        for c in row.findall("m:c", NS):
            inline = c.find("m:is/m:t", NS)
            value = c.find("m:v", NS)
            if inline is not None:
                text = inline.text
            elif value is not None:
                text = value.text
            else:
                continue
            if text is not None and text.strip():
                cells[c.get("r")] = text.strip()
    return cells


def read_merges(sheet_xml):
    merges = {}
    root = ET.fromstring(sheet_xml)
    for merge in root.findall(".//m:mergeCells/m:mergeCell", NS):
        start_ref, end_ref = merge.get("ref").split(":")
        start_col, start_row = split_ref(start_ref)
        end_col, end_row = split_ref(end_ref)
        c0, c1 = col_to_index(start_col), col_to_index(end_col)
        for col_i in range(min(c0, c1), max(c0, c1) + 1):
            for row_i in range(min(start_row, end_row), max(start_row, end_row) + 1):
                ref = index_to_col(col_i) + str(row_i)
                merges[ref] = start_ref
    return merges


def index_to_col(index):
    letters = ""
    index += 1
    while index:
        index, rem = divmod(index - 1, 26)
        letters = chr(ord("A") + rem) + letters
    return letters


def cell(cells, merges, ref):
    """The value at `ref`, falling back to the anchor value if `ref` sits
    inside a merge range and is itself empty."""
    if ref in cells:
        return cells[ref]
    anchor = merges.get(ref)
    if anchor and anchor in cells:
        return cells[anchor]
    return ""


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------


def row_refs(cells, row_num):
    return sorted(
        (ref for ref in cells if split_ref(ref)[1] == row_num),
        key=lambda ref: col_to_index(split_ref(ref)[0]),
    )


def find_row(cells, predicate):
    for row_num in sorted({split_ref(ref)[1] for ref in cells}):
        if predicate(row_num):
            return row_num
    return None


def parse_sheet(name, cells, merges):
    title_cell = cells.get("A1", "")
    match = TITLE_RE.match(title_cell)
    if match is None:
        raise SystemExit(f"{name}: title {title_cell!r} is not 'Table N - ...'")
    number = int(match.group("num"))
    if number not in TABLE_SPECS:
        raise SystemExit(f"{name}: unexpected table number {number}")

    # Header row: the one whose first two columns are Designation / Description.
    header_row = find_row(
        cells,
        lambda r: cells.get(f"A{r}", "").lower() == "designation"
        and cells.get(f"B{r}", "").lower() == "description",
    )
    if header_row is None:
        raise SystemExit(f"{name}: no 'Designation | Description' header row")

    # Range columns: every populated cell from column C rightward on the
    # header row, in column order.
    range_cols = []
    ranges = []
    for ref in row_refs(cells, header_row):
        col, _ = split_ref(ref)
        if col_to_index(col) >= col_to_index("C"):
            range_cols.append(col)
            ranges.append(parse_range(SUPERSCRIPT_RE.sub("", cells[ref]).strip()))
    if not ranges:
        raise SystemExit(f"{name}: header row {header_row} has no range columns")

    # The banner above the header row that spans the range columns.
    range_header = ""
    for ref in row_refs(cells, header_row - 1):
        col, _ = split_ref(ref)
        if col_to_index(col) >= col_to_index("C"):
            range_header = cells[ref]
            break

    # The "Values in ..." unit note between the title and the class-header
    # banner (any column). The parenthetical subtitle that can sit alongside it
    # is intentionally not picked up - the page shows the bare tables.
    unit_note = ""
    for row_num in range(2, header_row - 1):
        for ref in row_refs(cells, row_num):
            text = cells[ref]
            if text.lower().startswith("values in") and not unit_note:
                unit_note = text

    # Data rows: a single-letter designation in column A, below the header.
    classes = []
    row_num = header_row + 1
    last_row = max(split_ref(ref)[1] for ref in cells)
    while row_num <= last_row:
        designation = cells.get(f"A{row_num}", "")
        if DESIGNATION_RE.match(designation) is None:
            row_num += 1
            continue
        description = cells.get(f"B{row_num}", "")
        deviations = [
            parse_deviation(cell(cells, merges, f"{col}{row_num}"))
            for col in range_cols
        ]
        if all(d is None for d in deviations):
            raise SystemExit(
                f"{name}: class {designation!r} row {row_num} has no deviations "
                "(merge not expanded?)"
            )
        classes.append(
            {
                "designation": designation,
                "description": description,
                "deviations": deviations,
            }
        )
        row_num += 1

    if not classes:
        raise SystemExit(f"{name}: no tolerance-class rows")

    spec = TABLE_SPECS[number]
    return {
        "key": spec["key"],
        "number": number,
        "label": spec["label"],
        "title": match.group("title").strip(),
        "unitNote": unit_note,
        "rangeHeader": range_header,
        "ranges": ranges,
        "classes": classes,
    }


def build_tables():
    tables = {}
    for name, cells, merges in read_sheets(WORKBOOK):
        parsed = parse_sheet(name, cells, merges)
        tables[parsed["number"]] = parsed

    missing = set(TABLE_SPECS) - set(tables)
    if missing:
        raise SystemExit(f"Workbook is missing Table(s): {sorted(missing)}")

    return [tables[num] for num in sorted(tables)]


# ---------------------------------------------------------------------------
# JS serialization
# ---------------------------------------------------------------------------


def js_str(value):
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def js_num(value):
    if value is None:
        return "null"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return repr(value)


def js_bool(value):
    if value is None:
        return "null"
    return "true" if value else "false"


def render_range(r):
    return (
        "{ "
        f'min: {js_num(r["min"])}, max: {js_num(r["max"])}, '
        f'minInclusive: {js_bool(r["minInclusive"])}, '
        f'maxInclusive: {js_bool(r["maxInclusive"])} '
        "}"
    )


def js_num_array(values, indent):
    pad = " " * indent
    inner = " " * (indent + 2)
    if not values:
        return "[]"
    body = ",\n".join(f"{inner}{js_num(v)}" for v in values)
    return f"[\n{body}\n{pad}]"


def render_class(cls, indent):
    pad = " " * indent
    inner = " " * (indent + 2)
    return (
        f"{pad}{{\n"
        f'{inner}designation: {js_str(cls["designation"])},\n'
        f'{inner}description: {js_str(cls["description"])},\n'
        f'{inner}deviations: {js_num_array(cls["deviations"], indent + 2)},\n'
        f"{pad}}}"
    )


def render_table(table):
    lines = ["  {"]
    lines.append(f'    key: {js_str(table["key"])},')
    lines.append(f'    number: {table["number"]},')
    lines.append(f'    label: {js_str(table["label"])},')
    lines.append(f'    title: {js_str(table["title"])},')
    lines.append(f'    unitNote: {js_str(table["unitNote"])},')
    lines.append(f'    rangeHeader: {js_str(table["rangeHeader"])},')
    range_entries = ",\n".join(f"      {render_range(r)}" for r in table["ranges"])
    lines.append("    ranges: [")
    lines.append(range_entries + ",")
    lines.append("    ],")
    class_entries = ",\n".join(render_class(c, 6) for c in table["classes"])
    lines.append("    classes: [")
    lines.append(class_entries + ",")
    lines.append("    ],")
    lines.append("  }")
    return "\n".join(lines)


def render_block(tables):
    entries = ",\n".join(render_table(t) for t in tables)
    return f"const toleranceTables = [\n{entries}\n];"


BLOCK_RE = re.compile(r"const toleranceTables = \[.*?\n\];", re.DOTALL)


def main():
    check_only = "--check" in sys.argv[1:]
    tables = build_tables()
    block = render_block(tables)

    if check_only:
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except (AttributeError, ValueError):
            pass
        print(block)
        return

    original = DATA_JS.read_text(encoding="utf-8")
    if not BLOCK_RE.search(original):
        raise SystemExit(
            f"Could not find `const toleranceTables = [ ... ];` block in {DATA_JS.name}"
        )
    updated = BLOCK_RE.sub(lambda _: block, original, count=1)
    with DATA_JS.open("w", encoding="utf-8", newline="\n") as f:
        f.write(updated)

    print(
        f"Wrote {len(tables)} tables "
        f"({', '.join(str(t['number']) for t in tables)}) to {DATA_JS}"
    )


if __name__ == "__main__":
    main()
