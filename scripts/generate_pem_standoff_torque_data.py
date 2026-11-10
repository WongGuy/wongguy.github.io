#!/usr/bin/env python3
"""Regenerates the generated block in pem-standoff-torque-data.js from the PEM
standoff torque workbook checked into assets/standards/PEM/.

Run with no arguments to rewrite pem-standoff-torque-data.js in place:

    python scripts/generate_pem_standoff_torque_data.py

Run with --check to print the generated block to stdout instead (useful for
diffing against the current file without touching it):

    python scripts/generate_pem_standoff_torque_data.py --check

Source
------
PennEngineering PEM Self-Clinching Standoffs bulletin (SO), Performance Data,
pages SO-12 / SO-13, metric tables, transcribed from the PDF's text layer into
"Penn Engineering - Standoff Torques.xlsx": an "Index" sheet plus one worksheet
per PEM table (SO/SOS/SOA/BSO/BSOS/BSOA, SO4/BSO4, DSOS/DSO). The tables the
bulletin prints without a mating screw torque (TSO, TSO4, SOSG/SOAG) aren't in
the workbook.

Each table sheet is laid out identically:

    A1   "<table title> - Metric"
    A3   source note
    A5   "Thread Code" | B5 "Standoff Material"
                       | C5 "Max. Rec. Tightening Torque For Mating Screw, (N·m)"
    D5+  one block of four columns per test sheet material, its name in the
         block's first row-5 cell ("1.5 mm 5052-H34 Aluminum"); row 6 names
         the block's columns: installation (kN), pushout (N), torque-out
         (N·m), pull-thru (N). The number of blocks is read per sheet (SO4
         has one, the others two).
    A7+  one row per (thread code, standoff material), ending at the first
         blank row. A dash where the source prints one (aluminum standoffs
         have no cold-rolled steel values).
    then "Notes", one note per row

The Index sheet lists every table sheet with its row count, its standoff
materials (each with the PEM types made in it, "Steel (SO, BSO); ...") and its
test sheet materials. The generator cross-checks each table against its Index
row and stops if any of them disagree.

The xlsx is read with zipfile + ElementTree rather than openpyxl/pandas, so
this script has no third-party dependencies (matching the other generators).
Strings may be inline or in the shared strings part, so the workbook can be
saved from Excel without breaking the script.

Design notes
------------
- SERIES are the worksheets, one per PEM table, as in the nut generator. The
  key and legend label for each sheet live in SERIES below; an unknown sheet
  stops the script rather than appearing under a guessed name.
- MATERIALS are what the page switches, so each table's material list is the
  data's own: the distinct values of its Standoff Material column, in sheet
  order. A material a table doesn't list is one the page can't tick for that
  table — SO4/BSO4 are made only in (hardened 400 series) stainless, so the
  SO4 sheet lists only Stainless Steel. The bulletin's SO4 and DSOS/DSO tables
  print no material column; the workbook fills it from the bulletin's material
  specifications (its notes say so), and the Index row repeats the list with
  the PEM types per material, which must match the sheet's own list exactly.
- SIZE comes from the thread code: the "M<d>" it ends in. A leading number is
  the body diameter of a thread code like "3.5M3" (a 3.5 mm body with an M3
  thread), so 3.5M3 is an M3 part and sits on the slider with M3.
- VALUES ARE STRINGS, as printed, formatted with each cell's own number format
  (see the nut generator). A dash becomes null, and a test sheet whose four
  values are all dashes becomes a null entry.
- FOOTNOTES: notes that begin with "*" are carried into the data for the page
  to show (the source's own footnotes, and the material notes the page needs).
  The other notes describe the transcription and are left in the workbook.
"""
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "assets" / "standards" / "PEM" / "Penn Engineering - Standoff Torques.xlsx"
DATA_JS = ROOT / "tools" / "pem-standoff-torque" / "pem-standoff-torque-data.js"

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}

# Worksheet name -> (key, legend label). The key is the series' identity in
# pem-standoff-torque-app.js and in localStorage — renaming one silently resets
# a visitor's saved selection. Order here is the order of the series' lines in
# the plot legend. The label names the table by its steel members (SOS is "SO
# in stainless", SOA "SO in aluminum"), since the legend's material checkboxes
# say the rest.
SERIES = {
    "SO, SOS, SOA, BSO, BSOS, BSOA": ("SO", "SO / BSO"),
    "SO4, BSO4": ("SO4", "SO4 / BSO4"),
    "DSOS, DSO": ("DSO", "DSO"),
}

INDEX_HEADERS = ("Sheet", "Table", "Rows", "Standoff materials (types)", "Test sheet materials")
HEADER_THREAD = "Thread Code"
HEADER_MATERIAL = "Standoff Material"
HEADER_TORQUE = "Max. Rec. Tightening Torque For Mating Screw, (N·m)"
# Row-6 headers of each test sheet block, and the data key each becomes.
PERFORMANCE_COLUMNS = (
    ("Installation, kN", "installation"),
    ("Pushout, N", "pushout"),
    ("Torque-out, N·m", "torqueOut"),
    ("Pull-thru, N", "pullThru"),
)
DASHES = ("–", "—", "-")

# Built-in number formats the workbook relies on (custom ones are read from
# styles.xml). Anything else stops the script, since the decimal places it
# prints are the whole point of reading the formats.
BUILTIN_FORMATS = {0: "General", 1: "0", 2: "0.00"}


# ---------------------------------------------------------------------------
# xlsx reading
# ---------------------------------------------------------------------------

def read_workbook(path):
    """Returns a list of (name, cells) in workbook order, where cells maps a
    cell ref to (raw value, number format code, is_string)."""
    with zipfile.ZipFile(path) as z:
        formats = read_style_formats(z.read("xl/styles.xml"))
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            shared = [
                "".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t"))
                for si in root.findall("m:si", NS)
            ]

        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        targets = {rel.get("Id"): rel.get("Target") for rel in rels}

        workbook = ET.fromstring(z.read("xl/workbook.xml"))
        sheets = []
        for sheet in workbook.findall("m:sheets/m:sheet", NS):
            rel_id = sheet.get(f"{{{NS['r']}}}id")
            target = targets[rel_id].lstrip("/")
            if not target.startswith("xl/"):
                target = "xl/" + target
            sheets.append((sheet.get("name"), read_cells(z.read(target), formats, shared)))
    return sheets


def read_style_formats(styles_xml):
    """Returns a list mapping each cellXfs style index to its format code."""
    root = ET.fromstring(styles_xml)
    custom = {
        int(fmt.get("numFmtId")): fmt.get("formatCode")
        for fmt in root.findall("m:numFmts/m:numFmt", NS)
    }
    codes = []
    for xf in root.findall("m:cellXfs/m:xf", NS):
        fmt_id = int(xf.get("numFmtId", "0"))
        code = custom.get(fmt_id, BUILTIN_FORMATS.get(fmt_id))
        codes.append(code if code is not None else f"<numFmtId {fmt_id}>")
    return codes


def read_cells(sheet_xml, formats, shared):
    cells = {}
    root = ET.fromstring(sheet_xml)
    for row in root.findall(".//m:sheetData/m:row", NS):
        for c in row.findall("m:c", NS):
            kind = c.get("t")
            value = c.find("m:v", NS)
            if kind == "inlineStr":
                parts = [t.text or "" for t in c.iter(f"{{{NS['m']}}}t")]
                text, is_string = ("".join(parts) if parts else None), True
            elif kind == "s":
                text, is_string = (shared[int(value.text)] if value is not None else None), True
            else:
                text, is_string = (value.text if value is not None else None), kind == "str"
            if text is None:
                continue
            cells[c.get("r")] = (text, formats[int(c.get("s", "0"))], is_string)
    return cells


# ---------------------------------------------------------------------------
# Value formatting
# ---------------------------------------------------------------------------

FIXED_FORMAT_RE = re.compile(r"^0(?:\.(0+))?$")


def format_number(raw, code, where):
    """Formats a numeric cell the way its number format prints it: "0.00"
    gives two decimals, "0" none, and General the value with any float tail
    trimmed off (6 significant figures, more than any source value carries)."""
    try:
        value = float(raw)
    except ValueError:
        raise SystemExit(f"{where}: expected a number, got {raw!r}")
    if code == "General":
        return "%g" % float("%.6g" % value)
    match = FIXED_FORMAT_RE.match(code)
    if match is None:
        raise SystemExit(f"{where}: unsupported number format {code!r}")
    decimals = len(match.group(1) or "")
    return f"{value:.{decimals}f}"


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

COLUMNS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
TITLE_SUFFIX = " - Metric"
# "M3", "M3.5", or a body diameter ahead of the thread: "3.5M3".
THREAD_RE = re.compile(r"^(?:\d+(?:\.\d+)?)?M(?P<d>\d+(?:\.\d+)?)$")
# "Stainless Steel (SOS, BSOS)"
MATERIAL_RE = re.compile(r"^(?P<name>[^()]+?)\s*\((?P<types>[^()]+)\)$")


def text(cells, ref):
    cell = cells.get(ref)
    return cell[0].strip() if cell else None


def parse_index(cells):
    """Reads the Index sheet's table list into {sheet name: row}."""
    headers = tuple(text(cells, f"{col}5") for col in "ABCDE")
    if headers != INDEX_HEADERS:
        raise SystemExit(f"Index: unexpected column headers {headers!r}")
    index = {}
    row = 6
    while text(cells, f"A{row}"):
        where = f"Index row {row}"
        materials = []
        for entry in (text(cells, f"D{row}") or "").split(";"):
            match = MATERIAL_RE.match(entry.strip())
            if match is None:
                raise SystemExit(f"{where}: can't read a material from {entry.strip()!r}")
            materials.append(
                {
                    "name": match.group("name"),
                    "types": [t.strip() for t in match.group("types").split(",")],
                }
            )
        index[text(cells, f"A{row}")] = {
            "table": text(cells, f"B{row}"),
            "rows": int(float(text(cells, f"C{row}"))),
            "materials": materials,
            "testSheets": [s.strip() for s in (text(cells, f"E{row}") or "").split(",")],
        }
        row += 1
    return index


def parse_size(thread, where):
    match = THREAD_RE.match(thread)
    if match is None:
        raise SystemExit(f"{where}: can't read a metric thread size from {thread!r}")
    return f"M{match.group('d')}", float(match.group("d"))


def parse_table(name, cells):
    where = f"'{name}'"

    title = text(cells, "A1") or ""
    if not title.endswith(TITLE_SUFFIX):
        raise SystemExit(f"{where}: title {title!r} doesn't end in {TITLE_SUFFIX!r}")

    headers = tuple(text(cells, f"{col}5") for col in "ABC")
    if headers != (HEADER_THREAD, HEADER_MATERIAL, HEADER_TORQUE):
        raise SystemExit(f"{where}: unexpected column headers {headers!r}")

    # Test sheet blocks: four columns each from D, until a block has no name.
    blocks = []
    first = 3
    while first + len(PERFORMANCE_COLUMNS) <= len(COLUMNS):
        cols = COLUMNS[first : first + len(PERFORMANCE_COLUMNS)]
        sheet_name = text(cells, f"{cols[0]}5")
        if not sheet_name:
            break
        for col in cols[1:]:
            if text(cells, f"{col}5"):
                raise SystemExit(f"{where}: {col}5 should be part of the {sheet_name!r} header")
        labels = tuple(text(cells, f"{col}6") for col in cols)
        if labels != tuple(label for label, _ in PERFORMANCE_COLUMNS):
            raise SystemExit(f"{where}: unexpected {sheet_name!r} column headers {labels!r}")
        blocks.append((sheet_name, cols))
        first += len(PERFORMANCE_COLUMNS)
    if not blocks:
        raise SystemExit(f"{where}: no test sheet material columns from D5")

    rows = []
    materials = []
    seen = set()
    row = 7
    while text(cells, f"A{row}"):
        thread = text(cells, f"A{row}")
        material = text(cells, f"B{row}")
        row_where = f"{where} row {row} ({thread}, {material})"
        if not material:
            raise SystemExit(f"{row_where}: no standoff material")
        if (thread, material) in seen:
            raise SystemExit(f"{row_where}: duplicate thread code and material")
        seen.add((thread, material))
        if material not in materials:
            materials.append(material)

        def value(col, allow_dash):
            cell = cells.get(f"{col}{row}")
            if cell is None:
                raise SystemExit(f"{row_where}: column {col} is empty")
            raw, code, is_string = cell
            if is_string:
                if allow_dash and raw.strip() in DASHES:
                    return None
                raise SystemExit(f"{row_where} column {col}: expected a number, got {raw!r}")
            return format_number(raw, code, f"{row_where} column {col}")

        performance = []
        for _, cols in blocks:
            entry = {
                key: value(col, allow_dash=True)
                for col, (_, key) in zip(cols, PERFORMANCE_COLUMNS)
            }
            performance.append(entry if any(v is not None for v in entry.values()) else None)

        size, diameter = parse_size(thread, row_where)
        rows.append(
            {
                "thread": thread,
                "size": size,
                "diameter": diameter,
                "material": material,
                "torque": value("C", allow_dash=False),
                "performance": performance,
            }
        )
        row += 1
    if not rows:
        raise SystemExit(f"{where}: no data rows")

    # Notes follow the data; only the ones marked "*" are kept.
    footnotes = []
    while row < 200:
        note = text(cells, f"A{row}")
        if note and note.startswith("*"):
            footnotes.append(note.lstrip("* ").strip())
        row += 1

    key, label = SERIES[name]
    return {
        "key": key,
        "label": label,
        "title": title[: -len(TITLE_SUFFIX)],
        "footnotes": footnotes,
        "materials": materials,
        "testSheets": [sheet_name for sheet_name, _ in blocks],
        "rows": rows,
    }


def cross_check(name, table, index_row):
    """Stops if a table disagrees with its Index sheet row, and takes the
    types per material from it."""
    where = f"'{name}'"
    if index_row is None:
        raise SystemExit(f"{where}: not listed on the Index sheet")
    if index_row["table"] != table["title"] + TITLE_SUFFIX:
        raise SystemExit(
            f"{where}: title {table['title']!r} doesn't match Index {index_row['table']!r}"
        )
    if index_row["rows"] != len(table["rows"]):
        raise SystemExit(f"{where}: {len(table['rows'])} rows, Index says {index_row['rows']}")
    index_materials = [m["name"] for m in index_row["materials"]]
    if index_materials != table["materials"]:
        raise SystemExit(
            f"{where}: standoff materials {table['materials']!r} don't match "
            f"Index {index_materials!r}"
        )
    if index_row["testSheets"] != table["testSheets"]:
        raise SystemExit(
            f"{where}: test sheets {table['testSheets']!r} don't match "
            f"Index {index_row['testSheets']!r}"
        )
    table["materials"] = index_row["materials"]


def build_series():
    sheets = read_workbook(WORKBOOK)
    by_name = dict(sheets)
    if "Index" not in by_name:
        raise SystemExit("Workbook has no Index sheet")
    index = parse_index(by_name["Index"])

    for name, _ in sheets:
        if name != "Index" and name not in SERIES:
            raise SystemExit(f"'{name}': unknown sheet — add it to SERIES")
    for name in index:
        if name not in by_name:
            raise SystemExit(f"Index lists '{name}', which isn't in the workbook")

    series = []
    for name in SERIES:
        if name not in by_name:
            raise SystemExit(f"'{name}' is in SERIES but not in the workbook")
        table = parse_table(name, by_name[name])
        cross_check(name, table, index.get(name))
        series.append(table)
    return series


# ---------------------------------------------------------------------------
# JS serialization
# ---------------------------------------------------------------------------

def js_str(value):
    if value is None:
        return "null"
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def js_num(value):
    text = repr(float(value))
    return text[:-2] if text.endswith(".0") else text


def js_str_list(values):
    return "[" + ", ".join(js_str(v) for v in values) + "]"


def render_series_block(series):
    lines = ["const pemStandoffSeries = ["]
    for s in series:
        lines.append("  {")
        lines.append(f"    key: {js_str(s['key'])},")
        lines.append(f"    label: {js_str(s['label'])},")
        lines.append(f"    title: {js_str(s['title'])},")
        lines.append(f"    footnotes: {js_str_list(s['footnotes'])},")
        lines.append("    materials: [")
        for m in s["materials"]:
            lines.append(f"      {{ name: {js_str(m['name'])}, types: {js_str_list(m['types'])} }},")
        lines.append("    ],")
        lines.append(f"    testSheets: {js_str_list(s['testSheets'])},")
        lines.append("    rows: [")
        for r in s["rows"]:
            fields = [
                f"thread: {js_str(r['thread'])}",
                f"size: {js_str(r['size'])}",
                f"diameter: {js_num(r['diameter'])}",
                f"material: {js_str(r['material'])}",
                f"torque: {js_str(r['torque'])}",
            ]
            lines.append("      { " + ", ".join(fields) + ", performance: [")
            for p in r["performance"]:
                if p is None:
                    lines.append("        null,")
                    continue
                values = ", ".join(f"{key}: {js_str(p[key])}" for _, key in PERFORMANCE_COLUMNS)
                lines.append(f"        {{ {values} }},")
            lines.append("      ] },")
        lines.append("    ],")
        lines.append("  },")
    lines.append("];")
    return "\n".join(lines)


SERIES_RE = re.compile(r"const pemStandoffSeries = \[.*?\n\];", re.DOTALL)


def main():
    check_only = "--check" in sys.argv[1:]

    series = build_series()
    block = render_series_block(series)

    if check_only:
        sys.stdout.reconfigure(encoding="utf-8")
        print(block)
        return

    original = DATA_JS.read_text(encoding="utf-8")
    if not SERIES_RE.search(original):
        raise SystemExit(
            "Could not find `const pemStandoffSeries = [ ... ];` block in "
            "pem-standoff-torque-data.js"
        )
    updated = SERIES_RE.sub(lambda _: block, original, count=1)
    with DATA_JS.open("w", encoding="utf-8", newline="\n") as f:
        f.write(updated)

    rows = sum(len(s["rows"]) for s in series)
    print(f"Wrote {len(series)} series / {rows} rows to {DATA_JS}")


if __name__ == "__main__":
    main()
