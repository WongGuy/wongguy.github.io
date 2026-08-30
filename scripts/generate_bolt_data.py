#!/usr/bin/env python3
"""Regenerates the generated blocks in bolt-data.js from the ISO 898-1 and
ISO 724 workbooks checked into assets/standards/ISO/screw/.

Run with no arguments to rewrite bolt-data.js in place:

    python scripts/generate_bolt_data.py

Run with --check to print the generated blocks to stdout instead (useful for
diffing against the current file without touching it):

    python scripts/generate_bolt_data.py --check

Source
------
ISO 898-1:2013(E), Tables 3-7, transcribed into
"ISO Standards - ISO 898-1.xlsx": one worksheet per table.

    Table 3  mechanical and physical properties per property class
    Table 4  minimum ultimate tensile loads, coarse pitch
    Table 5  proof loads,                    coarse pitch
    Table 6  minimum ultimate tensile loads, fine pitch
    Table 7  proof loads,                    fine pitch

Tables 4-7 all share one layout (see below) and feed `boltThreads`.
Table 3 has its own layout (one row per mechanical property, property
classes across the columns, 8.8 split into d <= 16 mm and d > 16 mm) and
feeds the per-class `properties` map on `boltGrades` plus the
`boltGradeProperties` descriptor list. Only the nominal Rm and Sp rows and
the minimum Rp0.2 row are pulled from it.

The four load-table sheets (4-7) are laid out identically:

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

The second workbook, "ISO Standards - ISO 724.xlsx", holds ISO 724:2023
Table 1 (basic dimensions) on its one worksheet, and supplies the pitch
diameter d2 -- which ISO 898-1 doesn't tabulate and which can't be recovered
from the stress area. See the ISO 724 block below for its layout.

The xlsx is read with zipfile + ElementTree rather than openpyxl/pandas, so
this script has no third-party dependencies, matching the other generators.

Design notes
------------
- UNITS: the source tables are already metric (N, mm^2), so unlike the NASA
  generator nothing is converted -- every number is the source value, parsed
  as a float and printed back with no rounding or padding. The one derived
  number is `d0` on each thread: the diameter of the circle whose area is the
  tabulated stress area, d0 = sqrt(4 As / pi), rounded to 3 decimal places.
  d2 is likewise the published ISO 724 value, unconverted.
- SHAPE: one flat `boltThreads` array holding both thread series,
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
import math
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = (
    ROOT / "assets" / "standards" / "ISO" / "screw" / "ISO Standards - ISO 898-1.xlsx"
)
THREAD_WORKBOOK = (
    ROOT / "assets" / "standards" / "ISO" / "screw" / "ISO Standards - ISO 724.xlsx"
)
DATA_JS = ROOT / "tools" / "bolt" / "bolt-data.js"

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}

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

# Table 3 -------------------------------------------------------------------
#
# Table 3 is laid out the other way up from Tables 4-7: one row per
# mechanical/physical property (some spanning two rows for a nom./min. pair),
# the ten property-class columns across D:M, and property class 8.8 split
# into a "d <= 16 mm" and a "d > 16 mm" column that carry different numbers
# for some properties. Only three rows are pulled, each on the basis named in
# its spec below -- Rm and Sp on "nom.", Rp0.2 on "min.":
#
#   Tensile strength, Rm                                    nom.
#   Stress under proof load, Sp                             nom.
#   Stress at 0,2 % non-proportional elongation, Rp0.2      min.
#
# They land as a `properties` map on each `boltGrades` entry, keyed
# by the keys below; `boltGradeProperties` carries their label,
# symbol, unit, basis and Table 3 footnote. A class where the standard prints
# an em dash for a property (Rp0.2 below 8.8) simply omits that key.
#
# Rp0.2 is read on the "min." basis because that -- not the nominal, which
# ISO 898-1 states is "given only for the purpose of the property-class
# designation system" -- is the yield stress VDI 2230 tightening tables and
# the torque-tension diagram are built on. On the min. basis class 8.8 splits
# by diameter (640 MPa at d <= 16 mm, 660 MPa above), so its value is a
# { "d <= 16 mm": ..., "d > 16 mm": ... } map like Sp,nom.
TABLE3_SHEET = "Table 3"
TABLE3_GRADE_COLUMNS = "DEFGHIJKLM"

# One entry per Table 3 row that becomes a grade property, in display order.
# `match` is a substring of the (whitespace-collapsed, lower-cased) property
# name in column B, chosen to be unambiguous against the other rows -- note
# "non-proportional elongation" alone also matches the Rpf row. `basis` picks
# which of the row's nom./min. sub-rows the values are read from.
TABLE3_PROPERTIES = [
    {
        "key": "tensileStrength",
        "match": "tensile strength, rm,",
        "label": "Tensile strength",
        "symbol": "Rm",
        "unit": "MPa",
        "basis": "nom.",
    },
    {
        "key": "stressUnderProofLoad",
        "match": "stress under proof load, sp,",
        "label": "Stress under proof load",
        "symbol": "Sp",
        "unit": "MPa",
        "basis": "nom.",
    },
    {
        "key": "minNonProportionalElongationStress",
        "match": "non-proportional elongation, rp0.2,",
        "label": "Stress at 0,2 % non-proportional elongation",
        "symbol": "Rp0,2",
        "unit": "MPa",
        "basis": "min.",
    },
]

TABLE3_PROPERTY_ORDER = [p["key"] for p in TABLE3_PROPERTIES]

# ISO 724 ------------------------------------------------------------------
#
# The second workbook, "ISO Standards - ISO 724.xlsx", holds ISO 724:2023
# Table 1 (basic dimensions) on a single worksheet. ISO 898-1 tabulates only
# the stress area, so the pitch diameter d2 -- which the torque/preload
# relations need and which no amount of arithmetic recovers from As alone --
# comes from here.
#
#     A1  "Table 1 - Basic dimensions (ISO 724:2023)"
#     A2  "Dimensions in millimetres"
#     A4  nominal/major diameter (D, d)   B4  pitch (P)
#     C4  pitch diameter (D2, d2)         D4  "Minor diameter", spanning D:E
#     D5  internal thread, flat crest (D1)
#     E5  external thread, rounded root (d3)
#     A6+ one row per (diameter, pitch), the diameter written only on the
#         first row of each group and carried down
#
#     then a "Source: ..." line.
#
# The sheet covers every ISO metric thread, far more than ISO 898-1 tabulates
# loads for, so it's read into a lookup and only the threads that already
# exist in `boltThreads` take a d2 from it.
THREAD_SHEET_TITLE = "Table 1"
THREAD_FIRST_DATA_ROW = 6

# Read for the consistency check in build_tables() rather than for output:
# As,nom is defined on the mean of the pitch and minor diameters, so
# (d2 + d3) / 2 must reproduce the d0 recovered from the tabulated As. The
# two disagree by up to ~0.03 mm because ISO 898-1 rounds As to three
# significant figures, so the check is a sanity guard on the two workbooks
# describing the same threads, not an equality.
THREAD_D0_TOLERANCE = 0.05


# ---------------------------------------------------------------------------
# xlsx reading
# ---------------------------------------------------------------------------

REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"


def read_sheets(path):
    """Yields (sheet_name, {cell_ref: value}) for every worksheet, in workbook
    order. Values come back as strings exactly as stored.

    The two workbooks this script reads were saved by different tools and
    write the same XML differently, so neither the relationship parts nor the
    <sheet> elements can be picked apart by a fixed attribute order: the ISO
    724 file puts Id after Target on a Relationship and carries an extra
    state="visible" on its sheet, the ISO 898-1 file does neither. Attributes
    are therefore read by name, and a Target is treated as package-absolute
    when it starts with "/" and as relative to xl/ otherwise."""
    with zipfile.ZipFile(path) as z:
        shared = read_shared_strings(z)
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
            yield sheet.get("name"), read_cells(z.read(member), shared)


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


TABLE3_HEADER_RE = re.compile(
    r"^(?P<cls>[\d./]+)(?:\s*\(\s*(?P<variant>[^)]+?)\s*\))?$"
)
TABLE3_NOTE_RE = re.compile(r"^(?P<letter>[a-z])\s+(?P<text>.+)$", re.DOTALL)


def _collapse(text):
    return re.sub(r"\s+", " ", (text or "")).strip()


def parse_table3(cells, grade_keys):
    """Reads the "Table 3" worksheet into a
    ({grade_key: {property_key: number | {variant: number}}}, [descriptor])
    pair: the per-class `properties` maps and the property descriptor list.

    Only the rows named in TABLE3_PROPERTIES are read, each on the basis
    named in its spec ("nom." for Rm and Sp, "min." for Rp0,2). Property
    class 8.8 spans two columns (d <= 16 mm / d > 16 mm); a property whose
    two columns agree collapses to a single number, one whose columns differ
    (Sp,nom and Rp0,2,min) stays a map keyed by the column's parenthesised
    variant label. An em-dash column means the class doesn't have that
    property and the key is left out."""
    if not _collapse(cells.get("A1")).startswith("Table 3"):
        raise SystemExit(f"Table 3: unexpected title {cells.get('A1')!r}")
    if _collapse(cells.get("C5")) != "Basis":
        raise SystemExit(f"Table 3: expected 'Basis' in C5, got {cells.get('C5')!r}")
    if _collapse(cells.get("D5")) != "Property class":
        raise SystemExit(
            f"Table 3: expected 'Property class' in D5, got {cells.get('D5')!r}"
        )

    # Column -> (grade key, variant label or None) from the class header row.
    columns = []
    seen_keys = []
    for col in TABLE3_GRADE_COLUMNS:
        header = _collapse(cells.get(f"{col}6"))
        match = TABLE3_HEADER_RE.match(header)
        if match is None:
            raise SystemExit(f"Table 3: unparseable class header {header!r} in {col}6")
        key = GRADE_KEYS.get(match.group("cls"), match.group("cls"))
        columns.append((col, key, match.group("variant")))
        if key not in seen_keys:
            seen_keys.append(key)
    if seen_keys != list(grade_keys):
        raise SystemExit(
            f"Table 3: property classes {seen_keys} don't match Tables 4-7 "
            f"{list(grade_keys)}"
        )

    last_row = max(int(r[1:]) for r in cells if r[1:].isdigit())
    notes = {}
    for row_num in range(1, last_row + 1):
        if _collapse(cells.get(f"A{row_num}")) == "Notes":
            for note_row in range(row_num + 1, last_row + 1):
                match = TABLE3_NOTE_RE.match((cells.get(f"A{note_row}") or "").strip())
                if match:
                    notes[match.group("letter")] = _collapse(match.group("text"))
            break

    properties_by_grade = {key: {} for key in grade_keys}
    descriptors = []
    for spec in TABLE3_PROPERTIES:
        name_row = None
        for row_num in range(7, last_row + 1):
            if spec["match"] in _collapse(cells.get(f"B{row_num}")).lower():
                name_row = row_num
                break
        if name_row is None:
            raise SystemExit(f"Table 3: no row matching {spec['match']!r}")

        basis = spec["basis"]
        basis_tag = basis.rstrip(".")
        basis_row = next(
            (
                r
                for r in (name_row, name_row + 1, name_row + 2)
                if _collapse(cells.get(f"C{r}")).rstrip(".") == basis_tag
            ),
            None,
        )
        if basis_row is None:
            raise SystemExit(f"Table 3: no {basis!r} basis for {spec['match']!r}")

        # Gather the raw cells per grade key, preserving column order so the
        # 8.8 variant map reads d <= 16 mm then d > 16 mm.
        raw = {}
        for col, key, variant in columns:
            raw.setdefault(key, []).append((variant, _collapse(cells.get(f"{col}{basis_row}"))))

        for key, entries in raw.items():
            parsed = {
                variant: float(text)
                for variant, text in entries
                if text not in ("", EM_DASH)
            }
            if not parsed:
                continue
            if len(entries) == 1:
                properties_by_grade[key][spec["key"]] = next(iter(parsed.values()))
            elif len(set(parsed.values())) == 1 and len(parsed) == len(entries):
                properties_by_grade[key][spec["key"]] = next(iter(parsed.values()))
            else:
                properties_by_grade[key][spec["key"]] = parsed

        # The footnote marker sits on the property-name row or on the basis
        # sub-row. Note "c" ("Nominal values are given only for ...") hangs on
        # the name row but qualifies only the nom. sub-row, so a non-nom.
        # basis takes a marker only from its own sub-row.
        note_letter = _collapse(cells.get(f"N{basis_row}"))
        if not note_letter and basis == "nom.":
            note_letter = _collapse(cells.get(f"N{name_row}"))
        descriptor = {
            "key": spec["key"],
            "label": spec["label"],
            "symbol": spec["symbol"],
            "unit": spec["unit"],
            "basis": basis,
        }
        if note_letter:
            if note_letter not in notes:
                raise SystemExit(
                    f"Table 3: {spec['match']!r} cites note {note_letter!r} "
                    "but no such footnote is defined"
                )
            descriptor["note"] = notes[note_letter]
        descriptors.append(descriptor)

    return properties_by_grade, descriptors


NUMBER_RE = re.compile(r"^[\d.]+$")


def parse_basic_dimensions(cells):
    """Reads the ISO 724 basic dimensions worksheet into
    {(diameter, pitch): {"d2": float, "d3": float}}.

    The nominal diameter is written only on the first row of each group and
    carried down, so it's tracked across rows rather than read per row. The
    table ends at the "Source:" line, which is the first column-A value that
    isn't a number."""
    if "Table 1" not in _collapse(cells.get("A1")):
        raise SystemExit(f"ISO 724: unexpected title {cells.get('A1')!r}")
    headers = {
        "A4": "nominal diameter",
        "B4": "pitch",
        "C4": "pitch diameter",
        "D5": "(d1)",
        "E5": "(d3)",
    }
    for ref, expected in headers.items():
        if expected not in _collapse(cells.get(ref)).lower():
            raise SystemExit(
                f"ISO 724: expected {expected!r} in {ref}, got {cells.get(ref)!r}"
            )

    last_row = max(int(r[1:]) for r in cells if r[1:].isdigit())
    dimensions = {}
    diameter = None
    for row_num in range(THREAD_FIRST_DATA_ROW, last_row + 1):
        label = (cells.get(f"A{row_num}") or "").strip()
        if label and NUMBER_RE.match(label) is None:
            break
        if label:
            diameter = float(label)
        pitch = (cells.get(f"B{row_num}") or "").strip()
        if not pitch:
            continue
        if diameter is None:
            raise SystemExit(f"ISO 724: row {row_num} has a pitch but no diameter above it")
        dimensions[(diameter, float(pitch))] = {
            "d2": float(cells[f"C{row_num}"]),
            "d3": float(cells[f"E{row_num}"]),
        }

    if not dimensions:
        raise SystemExit("ISO 724: no data rows")
    return dimensions


def read_basic_dimensions():
    sheets = list(read_sheets(THREAD_WORKBOOK))
    if len(sheets) != 1:
        raise SystemExit(
            f"{THREAD_WORKBOOK.name}: expected one worksheet, found "
            f"{[name for name, _ in sheets]}"
        )
    return parse_basic_dimensions(sheets[0][1])


def series_key(sheet_name):
    return SHEETS[sheet_name][1]


def load_key(sheet_name):
    return SHEETS[sheet_name][0]


def build_tables():
    """Returns (series, load_types, grades, threads, notes, grade_properties)."""
    sheets = {}
    table3_cells = None
    for name, cells in read_sheets(WORKBOOK):
        if name == TABLE3_SHEET:
            table3_cells = cells
            continue
        if name not in SHEETS:
            raise SystemExit(f"Unexpected worksheet {name!r} in {WORKBOOK.name}")
        sheets[name] = parse_sheet(name, cells)

    missing = set(SHEETS) - set(sheets)
    if missing:
        raise SystemExit(f"Workbook is missing worksheet(s): {sorted(missing)}")
    if table3_cells is None:
        raise SystemExit(f"Workbook is missing the {TABLE3_SHEET!r} worksheet")

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

    # Table 3: nominal Rm / Sp and minimum Rp0.2 per property class, hung on
    # each grade as a `properties` map, plus the descriptor list.
    properties_by_grade, grade_properties = parse_table3(
        table3_cells, [g["key"] for g in grades]
    )
    for grade in grades:
        grade["properties"] = properties_by_grade.get(grade["key"], {})

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
                    # d0 is the diameter of the circle whose area is the stress
                    # area: As = pi/4 * d0^2, so d0 = sqrt(4 As / pi). ISO
                    # 898-1 defines As from the mean of the pitch and minor
                    # diameters; this recovers that equivalent diameter from
                    # the tabulated As so the app doesn't have to.
                    "d0": 2.0 * math.sqrt(row["stressArea"] / math.pi),
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

    # ISO 724: the pitch diameter d2 for every thread ISO 898-1 tabulates. The
    # sheet covers the whole metric range, so a thread missing from it means
    # the two workbooks disagree about which threads exist and is an error;
    # the extra ISO 724 rows with no load table are simply not looked up.
    dimensions = read_basic_dimensions()
    for thread in ordered:
        basic = dimensions.get((thread["diameter"], thread["pitch"]))
        if basic is None:
            raise SystemExit(
                f'{thread["designation"]}: no ISO 724 basic dimensions row'
            )
        thread["d2"] = basic["d2"]
        stress_diameter = (basic["d2"] + basic["d3"]) / 2
        if abs(stress_diameter - thread["d0"]) > THREAD_D0_TOLERANCE:
            raise SystemExit(
                f'{thread["designation"]}: ISO 724 gives (d2 + d3) / 2 = '
                f"{stress_diameter:.3f} mm but ISO 898-1's As gives d0 = "
                f'{thread["d0"]:.3f} mm'
            )

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

    return series, load_types, grades, ordered, notes, grade_properties


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
    lines = ["const boltSeries = ["]
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
    lines = ["const boltLoadTypes = ["]
    for t in load_types:
        lines.append("  {")
        lines.append(f'    key: {js_str(t["key"])},')
        lines.append(f'    label: {js_str(t["label"])},')
        lines.append(f'    description: {js_str(t["description"])},')
        lines.append(f'    shownByDefault: {js_bool(t["shownByDefault"])},')
        lines.append("  },")
    lines.append("];")
    return "\n".join(lines)


def render_grade_property_value(value):
    """A grade property is a plain number, or a map keyed by the 8.8 diameter
    variant where the two columns disagree."""
    if isinstance(value, dict):
        inner = ", ".join(f"{js_str(k)}: {js_num(v)}" for k, v in value.items())
        return "{ " + inner + " }"
    return js_num(value)


def render_grade_properties(properties):
    if not properties:
        return "{}"
    pairs = ", ".join(
        f"{key}: {render_grade_property_value(properties[key])}"
        for key in TABLE3_PROPERTY_ORDER
        if key in properties
    )
    return "{ " + pairs + " }"


def render_grades_block(grades):
    lines = ["const boltGrades = ["]
    for g in grades:
        lines.append(
            "  { "
            + ", ".join(
                [
                    f'key: {js_str(g["key"])}',
                    f'label: {js_str(g["label"])}',
                    f'designation: {js_str(g["designation"])}',
                    f'shownByDefault: {js_bool(g["shownByDefault"])}',
                    f'properties: {render_grade_properties(g["properties"])}',
                ]
            )
            + " },"
        )
    lines.append("];")
    return "\n".join(lines)


def render_grade_properties_block(grade_properties):
    lines = ["const boltGradeProperties = ["]
    for p in grade_properties:
        parts = [
            f'key: {js_str(p["key"])}',
            f'label: {js_str(p["label"])}',
            f'symbol: {js_str(p["symbol"])}',
            f'unit: {js_str(p["unit"])}',
            f'basis: {js_str(p["basis"])}',
        ]
        if p.get("note"):
            parts.append(f'note: {js_str(p["note"])}')
        lines.append("  { " + ", ".join(parts) + " },")
    lines.append("];")
    return "\n".join(lines)


def render_threads_block(threads, load_types, grades):
    grade_order = [g["key"] for g in grades]
    lines = ["const boltThreads = ["]
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
                    f'd2: {js_num(t["d2"])}',
                    f'stressArea: {js_num(t["stressArea"])}',
                    f'd0: {js_num(round(t["d0"], 3))}',
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
    lines = ["const boltNotes = {"]
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
    ("boltSeries", re.compile(r"const boltSeries = \[.*?\n\];", re.DOTALL)),
    ("boltLoadTypes", re.compile(r"const boltLoadTypes = \[.*?\n\];", re.DOTALL)),
    ("boltGrades", re.compile(r"const boltGrades = \[.*?\n\];", re.DOTALL)),
    (
        "boltGradeProperties",
        re.compile(r"const boltGradeProperties = \[.*?\n\];", re.DOTALL),
    ),
    ("boltThreads", re.compile(r"const boltThreads = \[.*?\n\];", re.DOTALL)),
    ("boltNotes", re.compile(r"const boltNotes = \{.*?\n\};", re.DOTALL)),
)


def main():
    check_only = "--check" in sys.argv[1:]

    series, load_types, grades, threads, notes, grade_properties = build_tables()
    rendered = {
        "boltSeries": render_series_block(series),
        "boltLoadTypes": render_load_types_block(load_types),
        "boltGrades": render_grades_block(grades),
        "boltGradeProperties": render_grade_properties_block(grade_properties),
        "boltThreads": render_threads_block(threads, load_types, grades),
        "boltNotes": render_notes_block(notes, load_types),
    }

    if check_only:
        # The generated blocks carry non-Latin-1 characters (em dash, "≤"),
        # so force the console to UTF-8 rather than let a cp1252 stdout choke.
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except (AttributeError, ValueError):
            pass
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
        f"/ {len(grades)} property classes ({len(grade_properties)} Table 3 properties each) "
        f"/ {len(load_types)} load types to {DATA_JS}"
    )


if __name__ == "__main__":
    main()
