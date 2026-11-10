#!/usr/bin/env python3
"""Regenerates the generated block in pem-nut-torque-data.js from the PEM nut
torque workbook checked into assets/standards/PEM/.

Run with no arguments to rewrite pem-nut-torque-data.js in place:

    python scripts/generate_pem_nut_torque_data.py

Run with --check to print the generated block to stdout instead (useful for
diffing against the current file without touching it):

    python scripts/generate_pem_nut_torque_data.py --check

Source
------
PennEngineering PEM fastener data, metric nut torque tables, transcribed into
"Penn Engineering - Nut Torques.xlsx": an "Index" sheet plus one worksheet per
PEM table (S, CLS, SP, CLA, SH/HNL/H, RT, SMP, WN/WNS, KF2).

Each table sheet is laid out identically:

    A1   "<table title> - Metric"
    A2   "Mating screw recommended tightening torque assuming K = 0.20 ..."
    A3   source note
    A5   "PEM Part Number" | B5 min. axial strength (kN)
                           | C5 screw strength to develop min. axial (MPa)
                           | D5 "Mating Screw Recommended Tightening Torque, (N.m)"
    D6+  one mating screw material per column, in the order the table prints
         them (CLA swaps PC 4.6 / PC 9.8 for an Aluminum 2024-T4 column, so the
         column set is read per sheet, not assumed)
    A7+  one row per part number, ending at the first blank row
    then "Notes", one note per row

The Index sheet lists every table sheet with its row count, nut factor K and
mating screw columns. The generator cross-checks each table against its Index
row and stops if any of them disagree.

The xlsx is read with zipfile + ElementTree rather than openpyxl/pandas, so
this script has no third-party dependencies (matching the other generators).
The workbook stores strings inline (there is no sharedStrings part).

Design notes
------------
- SERIES are the worksheets, one per PEM table, not one per part-number
  prefix. A table can hold more than one prefix (SH / HNL / H share a sheet,
  the S table prints its M5 rows as SS-M5, KF2 includes KFS2), and the page
  offers the tables as the source groups them. The key and legend label for
  each sheet live in SERIES below; an unknown sheet stops the script rather
  than appearing under a guessed name.
- VALUES ARE STRINGS, as printed. The workbook stores floats (so 0.81 comes
  back as 0.8100000000000001), but each cell's number format reproduces the
  decimal places the source table printed, and a printed "0.40" carries a
  significant zero that a JS number would drop. Each value is formatted with
  its own cell's number format on the way out; the app parseFloat()s the
  torque strings for the y position and shows the strings themselves in the
  tooltip. (nasa-torque-data.js and bolt-data.js use bare numbers instead
  because their apps do arithmetic on them; this one only plots and prints.)
- SIZE comes from the part number: the first "M<d>" that ends at a dash or at
  the end of the string. That covers every shape the tables use: "S-M3-0ZI",
  "SMPS-M2.5", "KF2-M4", and RT's "S-RTM6-00ZI" (thread code "RTM6").
- Parts stay in sheet order. The app groups them by size for the slider, so
  a sheet that lists all its SH rows before its HNL rows still lands each part
  under the right size, and within a size the legend reads in table order.
- FOOTNOTES: notes that begin with "*" are the source table's own footnotes
  (e.g. RT's "RT Factor: 1.25") and are carried into the data for the page to
  show. The other notes describe the transcription (borders, typos, "values
  entered as printed") and are left in the workbook.
"""
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "assets" / "standards" / "PEM" / "Penn Engineering - Nut Torques.xlsx"
DATA_JS = ROOT / "tools" / "pem-nut-torque" / "pem-nut-torque-data.js"

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}

# Worksheet name -> (key, legend label). The key is the series' identity in
# pem-nut-torque-app.js and in localStorage — renaming one silently resets a
# visitor's saved selection. Order here is the order of the series' lines in
# the plot legend.
SERIES = {
    "S Nuts": ("S", "S"),
    "CLS Nuts": ("CLS", "CLS"),
    "SP Nuts": ("SP", "SP"),
    "CLA Nuts": ("CLA", "CLA"),
    "SH, HNL, H Nuts": ("SH", "SH / HNL / H"),
    "RT Nuts": ("RT", "RT"),
    "SMP Nuts": ("SMP", "SMP"),
    "WN, WNS Weld Nuts": ("WN", "WN / WNS"),
    "KF2 Nuts": ("KF2", "KF2"),
}

HEADER_PART = "PEM® Part Number"
HEADER_AXIAL = "Min. Axial Strength w/PC12.9 Screw, kN"
HEADER_SCREW = "Screw Strength Required to Develop Min. Axial, MPa"
HEADER_TORQUE = "Mating Screw Recommended Tightening Torque, (N·m)"

# Built-in number formats the workbook relies on (custom ones are read from
# styles.xml). Anything else stops the script, since the decimal places it
# prints are the whole point of reading the formats.
BUILTIN_FORMATS = {0: "General", 1: "0", 2: "0.00"}


# ---------------------------------------------------------------------------
# xlsx reading
# ---------------------------------------------------------------------------

def read_workbook(path):
    """Returns (sheets, formats): sheets is a list of (name, cells) in workbook
    order, where cells maps a cell ref to (raw value, number format code)."""
    with zipfile.ZipFile(path) as z:
        formats = read_style_formats(z.read("xl/styles.xml"))

        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        targets = {rel.get("Id"): rel.get("Target") for rel in rels}

        workbook = ET.fromstring(z.read("xl/workbook.xml"))
        sheets = []
        for sheet in workbook.findall("m:sheets/m:sheet", NS):
            rel_id = sheet.get(f"{{{NS['r']}}}id")
            target = targets[rel_id].lstrip("/")
            if not target.startswith("xl/"):
                target = "xl/" + target
            sheets.append((sheet.get("name"), read_cells(z.read(target), formats)))
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


def read_cells(sheet_xml, formats):
    cells = {}
    root = ET.fromstring(sheet_xml)
    for row in root.findall(".//m:sheetData/m:row", NS):
        for c in row.findall("m:c", NS):
            inline = c.find("m:is/m:t", NS)
            value = c.find("m:v", NS)
            text = inline.text if inline is not None else (
                value.text if value is not None else None
            )
            if text is None:
                continue
            cells[c.get("r")] = (text, formats[int(c.get("s", "0"))])
    return cells


# ---------------------------------------------------------------------------
# Value formatting
# ---------------------------------------------------------------------------

FIXED_FORMAT_RE = re.compile(r"^0(?:\.(0+))?$")


def format_number(raw, code, where):
    """Formats a numeric cell the way its number format prints it: "0.00"
    gives two decimals, "0" none, and General the value with the float tail
    from the transcription trimmed off (6 significant figures, more than any
    source value carries)."""
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
K_RE = re.compile(r"assuming\s+k\s*=\s*(?P<k>[\d.]+)", re.IGNORECASE)
SIZE_RE = re.compile(r"M(?P<d>\d+(?:\.\d+)?)(?=-|$)")
TITLE_SUFFIX = " - Metric"


def text(cells, ref):
    cell = cells.get(ref)
    return cell[0] if cell else None


def parse_index(cells):
    """Reads the Index sheet's table list into {sheet name: row}."""
    expected = ("Sheet", "Table", "Rows", "Nut factor K", "Mating screw columns")
    headers = tuple(text(cells, f"{col}5") for col in "ABCDE")
    if headers != expected:
        raise SystemExit(f"Index: unexpected column headers {headers!r}")
    index = {}
    row = 6
    while text(cells, f"A{row}"):
        index[text(cells, f"A{row}")] = {
            "table": text(cells, f"B{row}"),
            "rows": int(float(text(cells, f"C{row}"))),
            "k": float(text(cells, f"D{row}")),
            "materials": [m.strip() for m in text(cells, f"E{row}").split(",")],
        }
        row += 1
    return index


def parse_size(part_number, where):
    matches = SIZE_RE.findall(part_number)
    if len(matches) != 1:
        raise SystemExit(f"{where}: can't read one thread size from {part_number!r}")
    diameter = float(matches[0])
    return f"M{matches[0]}", diameter


def parse_table(name, cells):
    where = f"'{name}'"

    title = text(cells, "A1") or ""
    if not title.endswith(TITLE_SUFFIX):
        raise SystemExit(f"{where}: title {title!r} doesn't end in {TITLE_SUFFIX!r}")

    k_match = K_RE.search(text(cells, "A2") or "")
    if k_match is None:
        raise SystemExit(f"{where}: could not read K from {text(cells, 'A2')!r}")

    headers = tuple(text(cells, f"{col}5") for col in "ABCD")
    if headers != (HEADER_PART, HEADER_AXIAL, HEADER_SCREW, HEADER_TORQUE):
        raise SystemExit(f"{where}: unexpected column headers {headers!r}")

    material_cols = []
    for col in COLUMNS[3:]:
        label = text(cells, f"{col}6")
        if not label:
            break
        material_cols.append((col, label))
    if not material_cols:
        raise SystemExit(f"{where}: no mating screw material columns in row 6")

    parts = []
    seen = set()
    row = 7
    while text(cells, f"A{row}"):
        part_number = text(cells, f"A{row}").strip()
        row_where = f"{where} row {row} ({part_number})"
        if part_number in seen:
            raise SystemExit(f"{row_where}: duplicate part number")
        seen.add(part_number)

        def value(col):
            cell = cells.get(f"{col}{row}")
            if cell is None:
                raise SystemExit(f"{row_where}: column {col} is empty")
            return format_number(cell[0], cell[1], f"{row_where} column {col}")

        size, diameter = parse_size(part_number, row_where)
        parts.append(
            {
                "partNumber": part_number,
                "size": size,
                "diameter": diameter,
                "minAxialStrength": value("B"),
                "screwStrength": value("C"),
                "torque": [value(col) for col, _ in material_cols],
            }
        )
        row += 1
    if not parts:
        raise SystemExit(f"{where}: no part rows")

    # Notes start at the "Notes" heading after the part rows; only the source
    # table's own footnotes (marked "*") are kept.
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
        "k": k_match.group("k"),
        "footnotes": footnotes,
        "materials": [label for _, label in material_cols],
        "parts": parts,
    }


def cross_check(name, table, index_row):
    """Stops if a table disagrees with its Index sheet row."""
    where = f"'{name}'"
    if index_row is None:
        raise SystemExit(f"{where}: not listed on the Index sheet")
    if index_row["table"] != table["title"] + TITLE_SUFFIX:
        raise SystemExit(
            f"{where}: title {table['title']!r} doesn't match Index {index_row['table']!r}"
        )
    if index_row["rows"] != len(table["parts"]):
        raise SystemExit(
            f"{where}: {len(table['parts'])} part rows, Index says {index_row['rows']}"
        )
    if index_row["k"] != float(table["k"]):
        raise SystemExit(f"{where}: K = {table['k']}, Index says {index_row['k']}")
    if index_row["materials"] != table["materials"]:
        raise SystemExit(
            f"{where}: material columns {table['materials']!r} don't match "
            f"Index {index_row['materials']!r}"
        )


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
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def js_num(value):
    text = repr(float(value))
    return text[:-2] if text.endswith(".0") else text


def js_str_list(values):
    return "[" + ", ".join(js_str(v) for v in values) + "]"


def render_series_block(series):
    lines = ["const pemNutSeries = ["]
    for s in series:
        lines.append("  {")
        lines.append(f"    key: {js_str(s['key'])},")
        lines.append(f"    label: {js_str(s['label'])},")
        lines.append(f"    title: {js_str(s['title'])},")
        lines.append(f"    k: {js_str(s['k'])},")
        lines.append(f"    footnotes: {js_str_list(s['footnotes'])},")
        lines.append(f"    materials: {js_str_list(s['materials'])},")
        lines.append("    parts: [")
        for p in s["parts"]:
            fields = [
                f"partNumber: {js_str(p['partNumber'])}",
                f"size: {js_str(p['size'])}",
                f"diameter: {js_num(p['diameter'])}",
                f"minAxialStrength: {js_str(p['minAxialStrength'])}",
                f"screwStrength: {js_str(p['screwStrength'])}",
                f"torque: {js_str_list(p['torque'])}",
            ]
            lines.append("      { " + ", ".join(fields) + " },")
        lines.append("    ],")
        lines.append("  },")
    lines.append("];")
    return "\n".join(lines)


SERIES_RE = re.compile(r"const pemNutSeries = \[.*?\n\];", re.DOTALL)


def main():
    check_only = "--check" in sys.argv[1:]

    series = build_series()
    block = render_series_block(series)

    if check_only:
        print(block)
        return

    original = DATA_JS.read_text(encoding="utf-8")
    if not SERIES_RE.search(original):
        raise SystemExit(
            "Could not find `const pemNutSeries = [ ... ];` block in pem-nut-torque-data.js"
        )
    updated = SERIES_RE.sub(lambda _: block, original, count=1)
    with DATA_JS.open("w", encoding="utf-8", newline="\n") as f:
        f.write(updated)

    parts = sum(len(s["parts"]) for s in series)
    print(f"Wrote {len(series)} series / {parts} part numbers to {DATA_JS}")


if __name__ == "__main__":
    main()
