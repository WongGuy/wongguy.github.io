#!/usr/bin/env python3
"""Regenerates the generated blocks in torque-data.js from the NASA torque
workbook checked into assets/standards/NASA/Torque/.

Run with no arguments to rewrite torque-data.js in place:

    python scripts/generate_torque_data.py

Run with --check to print the generated blocks to stdout instead (useful for
diffing against the current file without touching it):

    python scripts/generate_torque_data.py --check

Source
------
NASA/TM-2017-219475, "Installation Torque Tables for Noncritical
Applications" (metric tables), transcribed into
NASA_TM-2017-219475_Metric_Torque_Tables.xlsx: one worksheet per
(material, fastener size) pair, 180 of them, plus an "Index" sheet.

Each data sheet is laid out identically:

    A1  "<Material> - Fastener Size <M__>"
    A2  "Fsu = <n> ksi, K = <n>"
    A3  disclaimer
    A4  source note (PDF page)
    A6  column headers: Thread Engagement (in) | Pullout Load (lb)
                        | Assembly Torque (lb-in) | 100 % Torque (lb-in)
    A7+ one row per thread engagement

The xlsx is read with zipfile + ElementTree rather than openpyxl/pandas, so
this script has no third-party dependencies (matching the other generators,
which only need the csv module). The workbook stores strings inline (there is
no sharedStrings part), so every cell value is read straight off the sheet.

Design notes
------------
- UNITS: the source tables are US customary; every value is converted to
  metric on the way out, since the site is metric-only. in -> mm (x25.4),
  lb -> N (x4.4482216152605), lb-in -> N*m (x0.1129848290276167). Nothing
  downstream re-converts, so torque-data.js is metric end to end.
- Converted values are rounded to 6 significant figures and printed as bare
  JS numbers (not strings, unlike the other data files) because the plot
  arithmetic in torque-app.js consumes them directly. 6 figures is more than
  the 3-5 the source tables carry, so the rounding only trims float noise
  from the conversion and never loses source precision.
- Engagement is rounded to 4 decimals instead, which is exact for every
  fraction the tables use (the finest is 1/16 in = 1.5875 mm).
- SHAPE: torqueData is an array of size entries, in ascending diameter order,
  so the slider in torque-app.js can index it the same way the other
  selectors index their tables. Each entry holds a `materials` map keyed by
  material key; a material with no table at that size is simply absent from
  the map (rather than carrying "-" placeholders like washer-data.js) because
  the plot draws nothing for it instead of rendering an empty row.
- Material order is by ultimate shear strength ascending, so the legend reads
  weakest-to-strongest, which is also roughly the order the curves stack on
  the plot.
"""
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = (
    ROOT
    / "assets"
    / "standards"
    / "NASA"
    / "Torque"
    / "NASA_TM-2017-219475_Metric_Torque_Tables.xlsx"
)
DATA_JS = ROOT / "torque-data.js"

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# --- Unit conversions (source tables are US customary, the site is metric) ---
IN_TO_MM = 25.4
LB_TO_N = 4.4482216152605
LB_IN_TO_NM = 0.1129848290276167
KSI_TO_MPA = 6.894757

# Short, stable keys for the five materials, used as the object keys in
# torqueData entries and as the localStorage identity of each legend toggle in
# torque-app.js — renaming one silently resets a visitor's saved selection.
MATERIAL_KEYS = {
    "Aluminum 6061-T6": "AL6061",
    "ASTM A36 Steel": "A36",
    "Aluminum 2024-T4/T351": "AL2024",
    "Aluminum 7075-T6/T651": "AL7075",
    "304 Stainless Steel": "SS304",
}

# Fastener sizes to include in torque-data.js; every other size in the
# workbook is skipped. Write each size exactly as it appears in the sheet
# titles (e.g. "M14").
SIZE_ALLOWLIST = {
    "M2", "M2.5", "M3", "M4", "M5", "M6", "M8",
    "M10", "M12", "M16", "M20", "M24", "M30",
}


# ---------------------------------------------------------------------------
# xlsx reading
# ---------------------------------------------------------------------------

def read_sheets(path):
    """Yields (sheet_name, {cell_ref: value}) for every worksheet, in workbook
    order. Values come back as raw strings exactly as stored."""
    with zipfile.ZipFile(path) as z:
        workbook = z.read("xl/workbook.xml").decode("utf-8")
        rel_xml = z.read("xl/_rels/workbook.xml.rels").decode("utf-8")
        targets = {
            rel_id: target
            for target, rel_id in re.findall(
                r'Target="([^"]+)"\s+Id="(rId\d+)"', rel_xml
            )
        }
        sheets = re.findall(
            r'name="([^"]+)"\s+sheetId="\d+"\s+state="visible"\s+r:id="(rId\d+)"',
            workbook,
        )
        for name, rel_id in sheets:
            member = targets[rel_id].lstrip("/")
            yield name, read_cells(z.read(member))


def read_cells(sheet_xml):
    cells = {}
    root = ET.fromstring(sheet_xml)
    for row in root.findall(".//m:sheetData/m:row", NS):
        for c in row.findall("m:c", NS):
            inline = c.find("m:is/m:t", NS)
            value = c.find("m:v", NS)
            if inline is not None:
                cells[c.get("r")] = inline.text
            elif value is not None:
                cells[c.get("r")] = value.text
    return cells


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

TITLE_RE = re.compile(r"^(?P<material>.+?)\s+[—-]\s+Fastener Size\s+(?P<size>M[\d.]+)$")
FSU_RE = re.compile(r"Fsu\s*=\s*(?P<fsu>[\d.]+)\s*ksi,\s*K\s*=\s*(?P<k>[\d.]+)")
HEADERS = (
    "Thread Engagement (in)",
    "Pullout Load (lb)",
    "Assembly Torque (lb-in)",
    "100 % Torque (lb-in)",
)


def parse_fraction(text):
    """Engagement cells are written as inch fractions: "1/16", "3/8", "1",
    "1 1/2". Returns the value in inches."""
    total = 0.0
    for part in text.split():
        if "/" in part:
            num, den = part.split("/")
            total += float(num) / float(den)
        else:
            total += float(part)
    return total


def parse_sheet(name, cells):
    """Reads one (material, size) worksheet into a dict, converting to metric.
    Returns None for the Index sheet."""
    title = cells.get("A1", "")
    match = TITLE_RE.match(title)
    if match is None:
        return None

    size = match.group("size")
    if size not in SIZE_ALLOWLIST:
        return None

    material = match.group("material")
    if material not in MATERIAL_KEYS:
        raise SystemExit(f"{name}: unknown material {material!r}")

    fsu_match = FSU_RE.search(cells.get("A2", ""))
    if fsu_match is None:
        raise SystemExit(f"{name}: could not read Fsu/K from {cells.get('A2')!r}")

    headers = tuple(cells.get(ref) for ref in ("A6", "B6", "C6", "D6"))
    if headers != HEADERS:
        raise SystemExit(f"{name}: unexpected column headers {headers!r}")

    rows = []
    row_num = 7
    while f"A{row_num}" in cells:
        get = lambda col: cells.get(f"{col}{row_num}")  # noqa: E731
        if any(get(col) is None for col in "BCD"):
            raise SystemExit(f"{name}: row {row_num} is missing a value")
        rows.append(
            {
                "engagement": round(parse_fraction(get("A")) * IN_TO_MM, 4),
                "pulloutLoad": sig(float(get("B")) * LB_TO_N),
                "assemblyTorque": sig(float(get("C")) * LB_IN_TO_NM),
                "fullTorque": sig(float(get("D")) * LB_IN_TO_NM),
            }
        )
        row_num += 1

    if not rows:
        raise SystemExit(f"{name}: no data rows")

    return {
        "material": material,
        "size": size,
        "fsuKsi": float(fsu_match.group("fsu")),
        "k": fsu_match.group("k"),
        "rows": rows,
    }


def sig(value, digits=6):
    """Rounds to `digits` significant figures. The conversion factors carry
    far more precision than the 3-5 figures the source tables have, so this
    trims the float tail without touching real precision."""
    if value == 0:
        return 0.0
    return float(f"%.{digits}g" % value)


def size_sort_key(size):
    return float(size[1:])


def build_tables():
    """Returns (materials, torque_data): the material list ordered by Fsu
    ascending, and one entry per fastener size in ascending diameter order."""
    sheets = []
    for name, cells in read_sheets(WORKBOOK):
        parsed = parse_sheet(name, cells)
        if parsed is not None:
            sheets.append(parsed)

    materials = {}
    for sheet in sheets:
        key = MATERIAL_KEYS[sheet["material"]]
        entry = materials.setdefault(
            key,
            {
                "key": key,
                "label": sheet["material"],
                "fsuKsi": sheet["fsuKsi"],
                "fsuMPa": sig(sheet["fsuKsi"] * KSI_TO_MPA, 4),
                "k": sheet["k"],
            },
        )
        if entry["fsuKsi"] != sheet["fsuKsi"] or entry["k"] != sheet["k"]:
            raise SystemExit(f"{sheet['material']}: Fsu/K differ between sheets")

    material_list = sorted(materials.values(), key=lambda m: m["fsuKsi"])

    by_size = {}
    for sheet in sheets:
        by_size.setdefault(sheet["size"], {})[MATERIAL_KEYS[sheet["material"]]] = sheet[
            "rows"
        ]

    torque_data = [
        {
            "size": size,
            "diameter": f"{size_sort_key(size):.1f}",
            "materials": by_size[size],
        }
        for size in sorted(by_size, key=size_sort_key)
    ]
    return material_list, torque_data


# ---------------------------------------------------------------------------
# JS serialization
# ---------------------------------------------------------------------------

def js_str(value):
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def js_num(value):
    text = repr(float(value))
    return text[:-2] if text.endswith(".0") else text


def render_materials_block(materials):
    lines = ["const torqueMaterials = ["]
    for m in materials:
        fields = [
            f'key: {js_str(m["key"])}',
            f'label: {js_str(m["label"])}',
            f'fsu: {js_num(m["fsuMPa"])}',
            f'k: {js_str(m["k"])}',
        ]
        lines.append("  { " + ", ".join(fields) + " },")
    lines.append("];")
    return "\n".join(lines)


def render_data_block(torque_data, materials):
    order = [m["key"] for m in materials]
    lines = ["const torqueData = ["]
    for entry in torque_data:
        lines.append("  {")
        lines.append(f'    size: {js_str(entry["size"])},')
        lines.append(f'    diameter: {js_str(entry["diameter"])},')
        lines.append("    materials: {")
        for key in order:
            rows = entry["materials"].get(key)
            if not rows:
                continue
            lines.append(f"      {key}: [")
            for row in rows:
                cells = ", ".join(
                    f"{name}: {js_num(row[name])}"
                    for name in ("engagement", "pulloutLoad", "assemblyTorque", "fullTorque")
                )
                lines.append("        { " + cells + " },")
            lines.append("      ],")
        lines.append("    },")
        lines.append("  },")
    lines.append("];")
    return "\n".join(lines)


MATERIALS_RE = re.compile(r"const torqueMaterials = \[.*?\n\];", re.DOTALL)
DATA_RE = re.compile(r"const torqueData = \[.*?\n\];", re.DOTALL)


def main():
    check_only = "--check" in sys.argv[1:]

    materials, torque_data = build_tables()
    materials_block = render_materials_block(materials)
    data_block = render_data_block(torque_data, materials)

    if check_only:
        print(materials_block)
        print()
        print(data_block)
        return

    original = DATA_JS.read_text(encoding="utf-8")
    for label, pattern in (("torqueMaterials", MATERIALS_RE), ("torqueData", DATA_RE)):
        if not pattern.search(original):
            raise SystemExit(f"Could not find `const {label} = [ ... ];` block in torque-data.js")
    updated = MATERIALS_RE.sub(lambda _: materials_block, original, count=1)
    updated = DATA_RE.sub(lambda _: data_block, updated, count=1)
    with DATA_JS.open("w", encoding="utf-8", newline="\n") as f:
        f.write(updated)

    rows = sum(len(rows) for e in torque_data for rows in e["materials"].values())
    print(
        f"Wrote {len(torque_data)} sizes / {len(materials)} materials / "
        f"{rows} data rows to {DATA_JS}"
    )


if __name__ == "__main__":
    main()
