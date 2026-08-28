#!/usr/bin/env python3
"""Regenerates the generated blocks in bolt-strength-data.js from the ISO 898-1
workbook checked into assets/standards/ISO/screw/.

Run with no arguments to rewrite bolt-strength-data.js in place:

    python scripts/generate_bolt_strength_data.py

Run with --check to print the generated blocks to stdout instead (useful for
diffing against the current file without touching it):

    python scripts/generate_bolt_strength_data.py --check

Source
------
ISO 898-1:2013(E), Tables 4-7, transcribed into
"ISO Standards - ISO 898-1.xlsx": one worksheet per (load type, thread
series) pair.

    Table 4  minimum ultimate tensile loads, coarse pitch
    Table 5  proof loads,                    coarse pitch
    Table 6  minimum ultimate tensile loads, fine pitch
    Table 7  proof loads,                    fine pitch

All four sheets are laid out identically:

    A1  "Table <n> - <load type>"
    A2  thread series ("ISO metric coarse pitch thread")
    A3  source line
    A5  (merged, blank)   thread designation column
    B5  (merged, blank)   nominal stress area column
    C5  "Property class"  spanning C:K
    C6..K6  the nine property classes, "4.6" through "12.9/12.9"
    A7  the load being tabulated, spanning A:K
    A8+ one row per thread designation:
        A designation ("M8x1.25") | B As,nom (mm^2) | C..K load (N)

    then a blank row, "Notes", and the table's footnotes.

An em dash in a load cell means that class isn't offered at that size (9.8
stops at M16).

The xlsx is read with zipfile + ElementTree rather than openpyxl/pandas, so
this script has no third-party dependencies, matching the other generators.

Design notes
------------
- UNITS: the source tables are already metric (N, mm^2), so unlike the NASA
  generator nothing is converted -- every number is the source value, parsed
  as a float and printed back with no rounding or padding.
- SHAPE: one flat `boltStrengthThreads` array holding both thread series,
  sorted by diameter ascending then pitch descending, with a `series` key on
  each row. bolt-strength-app.js filters on that key, so the sort order
  survives filtering -- and showing both series at once (the fine-thread
  toggle this shape exists for) still reads M10x1.5, M10x1.25, M10x1.
- Each row carries a `loads` map keyed by load type ("proof"/"tensile") and
  then by property class key. A class an em dash rules out at that size is
  simply absent from the map rather than carrying a placeholder, so the app
  can test `typeof value === "number"` and skip it in both the table and the
  size-stepping arithmetic.
- The property class key is the class designation itself ("8.8"), which is
  also the localStorage identity of each column checkbox in the app --
  renaming one silently resets a visitor's saved column selection. The
  12.9 column is headed "12.9/12.9" in the source; it keeps "12.9" as its
  key and label with the source header preserved as `designation`.
"""
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = (
    ROOT / "assets" / "standards" / "ISO" / "screw" / "ISO Standards - ISO 898-1.xlsx"
)
DATA_JS = ROOT / "tools" / "bolt-strength" / "bolt-strength-data.js"

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# Which worksheet holds which (load type, thread series) pair. Load type keys
# are the first level of each thread's `loads` map; series keys are the value
# of its `series` field.
SHEETS = {
    "Table 4": ("tensile", "coarse"),
    "Table 5": ("proof", "coarse"),
    "Table 6": ("tensile", "fine"),
    "Table 7": ("proof", "fine"),
}

# Load type shown by the app on first visit, and the property classes and
# thread series shown by default. Everything else is off until the visitor
# ticks it on. These are display defaults, not source data -- they live here
# so the whole shape of the table is described by one generated file.
DEFAULT_LOAD_TYPE = "proof"
DEFAULT_GRADES = {"8.8", "10.9", "12.9"}
DEFAULT_SERIES = {"coarse"}

# Property class column headers, in source order. The 12.9 column is headed
# "12.9/12.9" in the standard (the two variants differ only in surface
# hardness limits, which these tables don't distinguish), so it gets the
# shorter key/label with the source header kept as its designation.
GRADE_KEYS = {"12.9/12.9": "12.9"}

EM_DASH = "—"


# ---------------------------------------------------------------------------
# xlsx reading
# ---------------------------------------------------------------------------

def read_sheets(path):
    """Yields (sheet_name, {cell_ref: value}) for every worksheet, in workbook
    order. Values come back as strings exactly as stored."""
    with zipfile.ZipFile(path) as z:
        shared = read_shared_strings(z)
        rel_xml = z.read("xl/_rels/workbook.xml.rels").decode("utf-8")
        targets = {
            m.group(1): m.group(2)
            for m in re.finditer(r'Id="(rId\d+)"[^>]*?Target="([^"]+)"', rel_xml)
        }
        workbook = z.read("xl/workbook.xml").decode("utf-8")
        sheets = re.findall(r'name="([^"]+)"\s+sheetId="\d+"\s+r:id="(rId\d+)"', workbook)
        for name, rel_id in sheets:
            member = "xl/" + targets[rel_id].lstrip("/")
            yield name, read_cells(z.read(member), shared)


def read_shared_strings(z):
    if "xl/sharedStrings.xml" not in z.namelist():
        return []
    root = ET.fromstring(z.read("xl/sharedStrings.xml"))
    return [
        "".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t"))
        for si in root.findall("m:si", NS)
    ]


def read_cells(sheet_xml, shared):
    cells = {}
    root = ET.fromstring(sheet_xml)
    for row in root.findall(".//m:sheetData/m:row", NS):
        for c in row.findall("m:c", NS):
            inline = c.find("m:is/m:t", NS)
            value = c.find("m:v", NS)
            if inline is not None:
                cells[c.get("r")] = inline.text
            elif value is None:
                continue
            elif c.get("t") == "s":
                cells[c.get("r")] = shared[int(value.text)]
            else:
                cells[c.get("r")] = value.text
    return cells


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

TITLE_RE = re.compile(r"^Table \d+\s*[—-]\s*(?P<label>.+)$")
DESIGNATION_RE = re.compile(r"^M(?P<diameter>[\d.]+)x(?P<pitch>[\d.]+)$")
GRADE_COLUMNS = "CDEFGHIJK"


def parse_sheet(name, cells):
    """Reads one worksheet into
    {label, series_label, grades, notes, rows: [{designation, ...}]}."""
    title = cells.get("A1", "")
    match = TITLE_RE.match(title)
    if match is None:
        raise SystemExit(f"{name}: unexpected title {title!r}")

    if cells.get("C5") != "Property class":
        raise SystemExit(f"{name}: expected 'Property class' in C5, got {cells.get('C5')!r}")

    grades = [cells.get(f"{col}6") for col in GRADE_COLUMNS]
    if any(g is None for g in grades):
        raise SystemExit(f"{name}: missing a property class header in C6:K6")

    rows = []
    row_num = 8
    while cells.get(f"A{row_num}"):
        designation = cells[f"A{row_num}"].strip()
        if DESIGNATION_RE.match(designation) is None:
            break
        area = cells.get(f"B{row_num}")
        if area is None:
            raise SystemExit(f"{name}: row {row_num} has no stress area")
        loads = {}
        for col, grade in zip(GRADE_COLUMNS, grades):
            raw = (cells.get(f"{col}{row_num}") or "").strip()
            if raw == "" or raw == EM_DASH:
                continue
            loads[grade] = float(raw)
        rows.append(
            {
                "designation": designation,
                "stressArea": float(area),
                "loads": loads,
            }
        )
        row_num += 1

    if not rows:
        raise SystemExit(f"{name}: no data rows")

    return {
        "label": match.group("label").strip(),
        "loadDescription": (cells.get("A7") or "").strip(),
        "seriesLabel": (cells.get("A2") or "").strip(),
        "source": (cells.get("A3") or "").strip(),
        "grades": grades,
        "notes": read_notes(cells, row_num),
        "rows": rows,
    }


# Footnotes about how to read the standard's own table rather than about the
# loads in it: the thread designation convention (this table always writes the
# pitch out) and how to compute As,nom (there's no stress area column on the
# page). Dropped so the note list under the table only carries notes that bear
# on the values shown. Matched on the full note text with its letter marker
# stripped; a note listed here that matches nothing in the workbook is an
# error, so a reworded footnote surfaces rather than silently reappearing.
SKIPPED_NOTES = (
    "Where no thread pitch is indicated in a thread designation, coarse pitch is specified.",
    "To calculate As,nom, see 9.1.6.1.",
)

NOTE_MARKER_RE = re.compile(r"^[a-z]\s+")


def read_notes(cells, after_row):
    """The footnotes below the table: a "Notes" heading, then one merged
    A-column cell per note.

    The leading "a ", "b ", ... marker is dropped. The letters are per-table,
    so the same note carries different ones in different sheets (the coarse
    tables' note b is the fine tables' note a) -- keeping them would both
    read as nonsense once the sheets are merged and would defeat the
    deduplication in build_tables()."""
    notes = []
    heading_row = None
    for row_num in range(after_row, after_row + 6):
        if (cells.get(f"A{row_num}") or "").strip() == "Notes":
            heading_row = row_num
            break
    if heading_row is None:
        return notes
    row_num = heading_row + 1
    while (cells.get(f"A{row_num}") or "").strip():
        notes.append(NOTE_MARKER_RE.sub("", cells[f"A{row_num}"].strip()))
        row_num += 1
    return notes


def series_key(sheet_name):
    return SHEETS[sheet_name][1]


def load_key(sheet_name):
    return SHEETS[sheet_name][0]


def build_tables():
    """Returns (series, load_types, grades, threads, notes)."""
    sheets = {}
    for name, cells in read_sheets(WORKBOOK):
        if name not in SHEETS:
            raise SystemExit(f"Unexpected worksheet {name!r} in {WORKBOOK.name}")
        sheets[name] = parse_sheet(name, cells)

    missing = set(SHEETS) - set(sheets)
    if missing:
        raise SystemExit(f"Workbook is missing worksheet(s): {sorted(missing)}")

    # Every sheet must carry the same nine property classes in the same order,
    # otherwise the columns can't be shared across load types and series.
    grade_headers = {tuple(s["grades"]) for s in sheets.values()}
    if len(grade_headers) != 1:
        raise SystemExit("Property class headers differ between worksheets")
    grade_headers = grade_headers.pop()

    grades = []
    for header in grade_headers:
        key = GRADE_KEYS.get(header, header)
        grades.append(
            {
                "key": key,
                "label": key,
                "designation": header,
                "shownByDefault": key in DEFAULT_GRADES,
            }
        )
    unknown = DEFAULT_GRADES - {g["key"] for g in grades}
    if unknown:
        raise SystemExit(f"DEFAULT_GRADES names classes not in the workbook: {sorted(unknown)}")

    series = []
    for key in ("coarse", "fine"):
        labels = {
            s["seriesLabel"] for name, s in sheets.items() if series_key(name) == key
        }
        if len(labels) != 1:
            raise SystemExit(f"{key}: worksheets disagree on the thread series label")
        series.append(
            {
                "key": key,
                "label": labels.pop(),
                "shownByDefault": key in DEFAULT_SERIES,
            }
        )

    load_types = []
    for key in ("proof", "tensile"):
        sheet = next(s for name, s in sheets.items() if load_key(name) == key)
        load_types.append(
            {
                "key": key,
                "label": sheet["label"],
                "description": sheet["loadDescription"],
                "shownByDefault": key == DEFAULT_LOAD_TYPE,
            }
        )

    # Merge the four sheets into one row per thread designation, keyed by
    # designation so the two load types land on the same row.
    threads = {}
    for name, sheet in sheets.items():
        for row in sheet["rows"]:
            designation = row["designation"]
            match = DESIGNATION_RE.match(designation)
            entry = threads.setdefault(
                designation,
                {
                    "designation": designation,
                    "size": "M" + match.group("diameter"),
                    "diameter": float(match.group("diameter")),
                    "pitch": float(match.group("pitch")),
                    "series": series_key(name),
                    "stressArea": row["stressArea"],
                    "loads": {},
                },
            )
            if entry["series"] != series_key(name):
                raise SystemExit(f"{designation}: appears in both thread series")
            if entry["stressArea"] != row["stressArea"]:
                raise SystemExit(f"{designation}: stress area differs between worksheets")
            entry["loads"][load_key(name)] = {
                GRADE_KEYS.get(grade, grade): value
                for grade, value in row["loads"].items()
            }

    ordered = sorted(threads.values(), key=lambda t: (t["diameter"], -t["pitch"]))

    # Footnotes are per load type, since the notes about substitute values
    # quote figures from the table they sit under. The coarse and fine sheets
    # for one load type share most of their notes, so they're deduplicated
    # while keeping source order.
    notes = {}
    skipped = set()
    for key in ("proof", "tensile"):
        collected = []
        for name in sorted(SHEETS):
            if load_key(name) != key:
                continue
            for note in sheets[name]["notes"]:
                if note in SKIPPED_NOTES:
                    skipped.add(note)
                    continue
                if note not in collected:
                    collected.append(note)
        notes[key] = collected

    unmatched = set(SKIPPED_NOTES) - skipped
    if unmatched:
        raise SystemExit(
            "SKIPPED_NOTES entries match no footnote in the workbook "
            f"(reworded or removed?): {sorted(unmatched)}"
        )

    return series, load_types, grades, ordered, notes


# ---------------------------------------------------------------------------
# JS serialization
# ---------------------------------------------------------------------------

def js_str(value):
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def js_num(value):
    text = repr(float(value))
    return text[:-2] if text.endswith(".0") else text


def js_bool(value):
    return "true" if value else "false"


def render_series_block(series):
    lines = ["const boltStrengthSeries = ["]
    for s in series:
        lines.append(
            "  { "
            + ", ".join(
                [
                    f'key: {js_str(s["key"])}',
                    f'label: {js_str(s["label"])}',
                    f'shownByDefault: {js_bool(s["shownByDefault"])}',
                ]
            )
            + " },"
        )
    lines.append("];")
    return "\n".join(lines)


def render_load_types_block(load_types):
    lines = ["const boltStrengthLoadTypes = ["]
    for t in load_types:
        lines.append("  {")
        lines.append(f'    key: {js_str(t["key"])},')
        lines.append(f'    label: {js_str(t["label"])},')
        lines.append(f'    description: {js_str(t["description"])},')
        lines.append(f'    shownByDefault: {js_bool(t["shownByDefault"])},')
        lines.append("  },")
    lines.append("];")
    return "\n".join(lines)


def render_grades_block(grades):
    lines = ["const boltStrengthGrades = ["]
    for g in grades:
        lines.append(
            "  { "
            + ", ".join(
                [
                    f'key: {js_str(g["key"])}',
                    f'label: {js_str(g["label"])}',
                    f'designation: {js_str(g["designation"])}',
                    f'shownByDefault: {js_bool(g["shownByDefault"])}',
                ]
            )
            + " },"
        )
    lines.append("];")
    return "\n".join(lines)


def render_threads_block(threads, load_types, grades):
    grade_order = [g["key"] for g in grades]
    lines = ["const boltStrengthThreads = ["]
    for t in threads:
        lines.append("  {")
        lines.append(
            "    "
            + ", ".join(
                [
                    f'designation: {js_str(t["designation"])}',
                    f'size: {js_str(t["size"])}',
                    f'diameter: {js_num(t["diameter"])}',
                    f'pitch: {js_num(t["pitch"])}',
                    f'series: {js_str(t["series"])}',
                    f'stressArea: {js_num(t["stressArea"])}',
                ]
            )
            + ","
        )
        lines.append("    loads: {")
        for load_type in load_types:
            values = t["loads"].get(load_type["key"], {})
            if not values:
                continue
            pairs = ", ".join(
                f'"{key}": {js_num(values[key])}'
                for key in grade_order
                if key in values
            )
            lines.append(f'      {load_type["key"]}: {{ {pairs} }},')
        lines.append("    },")
        lines.append("  },")
    lines.append("];")
    return "\n".join(lines)


def render_notes_block(notes, load_types):
    lines = ["const boltStrengthNotes = {"]
    for load_type in load_types:
        entries = notes.get(load_type["key"], [])
        if not entries:
            lines.append(f'  {load_type["key"]}: [],')
            continue
        lines.append(f'  {load_type["key"]}: [')
        for note in entries:
            lines.append(f"    {js_str(note)},")
        lines.append("  ],")
    lines.append("};")
    return "\n".join(lines)


BLOCKS = (
    ("boltStrengthSeries", re.compile(r"const boltStrengthSeries = \[.*?\n\];", re.DOTALL)),
    ("boltStrengthLoadTypes", re.compile(r"const boltStrengthLoadTypes = \[.*?\n\];", re.DOTALL)),
    ("boltStrengthGrades", re.compile(r"const boltStrengthGrades = \[.*?\n\];", re.DOTALL)),
    ("boltStrengthThreads", re.compile(r"const boltStrengthThreads = \[.*?\n\];", re.DOTALL)),
    ("boltStrengthNotes", re.compile(r"const boltStrengthNotes = \{.*?\n\};", re.DOTALL)),
)


def main():
    check_only = "--check" in sys.argv[1:]

    series, load_types, grades, threads, notes = build_tables()
    rendered = {
        "boltStrengthSeries": render_series_block(series),
        "boltStrengthLoadTypes": render_load_types_block(load_types),
        "boltStrengthGrades": render_grades_block(grades),
        "boltStrengthThreads": render_threads_block(threads, load_types, grades),
        "boltStrengthNotes": render_notes_block(notes, load_types),
    }

    if check_only:
        for name, _ in BLOCKS:
            print(rendered[name])
            print()
        return

    original = DATA_JS.read_text(encoding="utf-8")
    updated = original
    for name, pattern in BLOCKS:
        if not pattern.search(updated):
            raise SystemExit(
                f"Could not find the `const {name} = ...;` block in {DATA_JS.name}"
            )
        updated = pattern.sub(lambda _, block=rendered[name]: block, updated, count=1)

    with DATA_JS.open("w", encoding="utf-8", newline="\n") as f:
        f.write(updated)

    coarse = sum(1 for t in threads if t["series"] == "coarse")
    print(
        f"Wrote {len(threads)} threads ({coarse} coarse, {len(threads) - coarse} fine) "
        f"/ {len(grades)} property classes / {len(load_types)} load types to {DATA_JS}"
    )


if __name__ == "__main__":
    main()
