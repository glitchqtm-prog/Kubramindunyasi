"""
pdf_generator.py
-----------------
Claude'un ürettiği Markdown benzeri (## Başlık) rapor metnini şık bir PDF'e çevirir.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
)

GOLD = colors.HexColor("#C9A15A")
NAVY = colors.HexColor("#12121F")
INK = colors.HexColor("#1a1a2e")
MUTED = colors.HexColor("#555566")


def _build_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="ReportTitle", fontName="Helvetica-Bold", fontSize=26,
        textColor=INK, spaceAfter=6, alignment=1,
    ))
    styles.add(ParagraphStyle(
        name="ReportSubtitle", fontName="Helvetica", fontSize=12,
        textColor=MUTED, spaceAfter=24, alignment=1,
    ))
    styles.add(ParagraphStyle(
        name="SectionHeading", fontName="Helvetica-Bold", fontSize=15,
        textColor=GOLD, spaceBefore=18, spaceAfter=8,
        borderWidth=0, borderColor=GOLD,
    ))
    styles.add(ParagraphStyle(
        name="BodyTextTR", fontName="Helvetica", fontSize=10.5,
        textColor=INK, leading=16, spaceAfter=10, alignment=4,
    ))
    return styles


def _chart_table(chart: dict, styles) -> Table:
    data = [["Gezegen", "Burç", "Derece"]]
    for name, d in chart["planets"].items():
        retro = " R" if d.get("retrograde") else ""
        data.append([name, d["sign"] + retro, f"{d['degree_in_sign']}°"])
    data.append(["Yükselen", chart["ascendant"]["sign"], f"{chart['ascendant']['degree_in_sign']}°"])
    table = Table(data, colWidths=[5 * cm, 5 * cm, 3 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dddddd")),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f5ef")]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def generate_pdf(output_path: str, title: str, person_name: str,
                  report_text: str, chart: dict, chart_b: dict = None,
                  person_b_name: str = None) -> str:
    styles = _build_styles()
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        topMargin=2.5 * cm, bottomMargin=2.5 * cm,
        leftMargin=2.2 * cm, rightMargin=2.2 * cm,
    )
    story = []

    story.append(Spacer(1, 4 * cm))
    story.append(Paragraph(title, styles["ReportTitle"]))
    subtitle = person_name if not chart_b else f"{person_name} & {person_b_name}"
    story.append(Paragraph(subtitle, styles["ReportSubtitle"]))
    story.append(Spacer(1, 1 * cm))
    story.append(_chart_table(chart, styles))
    if chart_b:
        story.append(Spacer(1, 0.5 * cm))
        story.append(_chart_table(chart_b, styles))
    story.append(PageBreak())

    for block in report_text.split("\n"):
        stripped = block.strip()
        if not stripped:
            continue
        if stripped.startswith("## "):
            story.append(Paragraph(stripped[3:], styles["SectionHeading"]))
        elif stripped.startswith("# "):
            story.append(Paragraph(stripped[2:], styles["SectionHeading"]))
        else:
            safe = stripped.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            safe = safe.replace("**", "")
            story.append(Paragraph(safe, styles["BodyTextTR"]))

    doc.build(story)
    return output_path
