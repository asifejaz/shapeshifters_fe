#!/usr/bin/env python3
"""Generate branded downloadable PDFs from the public training-guide source data."""

import json
import re
import subprocess
from pathlib import Path

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "src/pages/public/trainingGuideData.js"
ASSET_DIR = ROOT / "src/assets/training-guides"
OUTPUT_DIR = ROOT / "public/downloads/training-guides"
PDF_IMAGE_DIR = ROOT / "tmp/pdfs/training-guide-images"
LOGO = ROOT / "src/assets/logo.png"

ORANGE = colors.HexColor("#F05A28")
INK = colors.HexColor("#121212")
MUTED = colors.HexColor("#5F5F5F")
PAPER = colors.HexColor("#F7F4EE")
LINE = colors.HexColor("#D9D4CB")

ASSETS = {
    "men-muscle-shape": ("men-muscle-building.webp", "men-muscle-exercise-board.webp"),
    "men-weight-loss": ("men-weight-loss.webp", "men-weight-loss-exercise-board.webp"),
    "women-weight-loss": ("women-weight-loss.webp", "women-weight-loss-exercise-board.webp"),
    "women-fitness": ("women-fitness.webp", "women-fitness-exercise-board.webp"),
}


def ascii_text(value):
    replacements = {
        "\u2013": "-", "\u2014": "-", "\u2011": "-", "\u00d7": " x ",
        "\u00b7": " | ", "\u2019": "'", "\u2018": "'", "\u201c": '"', "\u201d": '"',
    }
    text = str(value)
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def load_guides():
    source = DATA_FILE.read_text(encoding="utf-8")
    source = re.sub(
        r"^import\s+(\w+)\s+from\s+['\"][^'\"]+['\"];\s*$",
        r'const \1 = "";',
        source,
        flags=re.MULTILINE,
    )
    source = source.replace("export const", "const")
    source += "\nprocess.stdout.write(JSON.stringify(trainingGuides));\n"
    result = subprocess.run(
        ["node", "-e", source],
        check=True,
        capture_output=True,
        text=True,
        cwd=ROOT,
    )
    return json.loads(result.stdout)


def paragraph(text, style):
    escaped = ascii_text(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(escaped, style)


def pdf_image_path(filename):
    source = ASSET_DIR / filename
    PDF_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    target = PDF_IMAGE_DIR / f"{source.stem}.jpg"
    with PILImage.open(source) as image:
        image.convert("RGB").save(target, "JPEG", quality=82, optimize=True, progressive=True)
    return target


def draw_chrome(canvas, doc):
    width, height = landscape(A4)
    canvas.saveState()
    canvas.setFillColor(INK)
    canvas.rect(0, height - 15 * mm, width, 15 * mm, fill=1, stroke=0)
    canvas.drawImage(str(LOGO), 12 * mm, height - 12.2 * mm, width=31 * mm, height=8.7 * mm, preserveAspectRatio=True, mask="auto")
    canvas.setFillColor(ORANGE)
    canvas.rect(0, height - 15.8 * mm, width, 0.8 * mm, fill=1, stroke=0)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(12 * mm, 8 * mm, "SHAPE SHIFTERS | TRAINING + NUTRITION GUIDE")
    canvas.drawRightString(width - 12 * mm, 8 * mm, f"shapeshifters.pk | PAGE {doc.page}")
    canvas.restoreState()


def build_pdf(guide):
    slug = guide["slug"]
    hero_name, board_name = ASSETS[slug]
    output = OUTPUT_DIR / f"{slug}.pdf"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Eyebrow", fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=ORANGE, spaceAfter=4, tracking=1.2))
    styles.add(ParagraphStyle(name="Display", fontName="Helvetica-Bold", fontSize=28, leading=29, textColor=INK, spaceAfter=8))
    styles.add(ParagraphStyle(name="Section", fontName="Helvetica-Bold", fontSize=18, leading=21, textColor=INK, spaceAfter=10))
    styles.add(ParagraphStyle(name="BodySmall", fontName="Helvetica", fontSize=8.2, leading=11.5, textColor=MUTED))
    styles.add(ParagraphStyle(name="TableHead", fontName="Helvetica-Bold", fontSize=7.2, leading=8.5, textColor=colors.white, alignment=TA_LEFT))
    styles.add(ParagraphStyle(name="TableCell", fontName="Helvetica", fontSize=6.8, leading=9.2, textColor=MUTED))
    styles.add(ParagraphStyle(name="TableCellStrong", fontName="Helvetica-Bold", fontSize=6.8, leading=9.2, textColor=INK))
    styles.add(ParagraphStyle(name="Label", fontName="Helvetica-Bold", fontSize=7, leading=9, textColor=colors.white, alignment=TA_CENTER))

    doc = SimpleDocTemplate(
        str(output), pagesize=landscape(A4),
        leftMargin=12 * mm, rightMargin=12 * mm,
        topMargin=21 * mm, bottomMargin=14 * mm,
        title=ascii_text(guide["title"]), author="Shape Shifters Gym",
        subject="Weekly training and Pakistani meal guide",
    )
    story = []

    story.append(Spacer(1, 8 * mm))
    story.append(paragraph(f'{guide["audience"]} | COMPLETE 7-DAY PLAN', styles["Eyebrow"]))
    story.append(paragraph(guide["title"].upper(), styles["Display"]))
    story.append(paragraph(guide["intro"], styles["BodySmall"]))
    story.append(Spacer(1, 5 * mm))
    hero = Image(str(pdf_image_path(hero_name)), width=245 * mm, height=82 * mm)
    story.append(hero)
    story.append(Spacer(1, 4 * mm))
    overview = Table([
        [paragraph("PRIMARY GOAL", styles["Eyebrow"]), paragraph("NUTRITION APPROACH", styles["Eyebrow"])],
        [paragraph(guide["goal"], styles["BodySmall"]), paragraph(guide["nutrition"], styles["BodySmall"])],
    ], colWidths=[122.5 * mm, 122.5 * mm])
    overview.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PAPER),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(overview)

    story.append(PageBreak())
    story.append(paragraph("EXERCISE GUIDE | KEY MOVEMENTS", styles["Eyebrow"]))
    story.append(paragraph("SEE THE MOVEMENTS", styles["Section"]))
    board = Image(str(pdf_image_path(board_name)), width=190 * mm, height=126.7 * mm)
    story.append(board)
    labels = Table([[paragraph(label, styles["Label"]) for label in guide["exerciseLabels"]]], colWidths=[47.5 * mm] * 4)
    labels.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), INK),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.5, INK),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#444444")),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(labels)
    story.append(Spacer(1, 4 * mm))
    story.append(paragraph("Use the board as a visual orientation only. Ask a Shape Shifters coach to check setup, range of motion, and technique before increasing load.", styles["BodySmall"]))

    story.append(PageBreak())
    story.append(paragraph("WEEK 01 | EXERCISE", styles["Eyebrow"]))
    story.append(paragraph("WEEKLY TRAINING PLAN", styles["Section"]))
    workout_rows = [[paragraph(h, styles["TableHead"]) for h in ["DAY", "FOCUS", "SESSION", "FINISH / NOTE"]]]
    for day, focus, session, note in guide["days"]:
        workout_rows.append([
            paragraph(day, styles["TableCellStrong"]), paragraph(focus, styles["TableCellStrong"]),
            paragraph(session, styles["TableCell"]), paragraph(note, styles["TableCell"]),
        ])
    workout = Table(workout_rows, colWidths=[24 * mm, 50 * mm, 122 * mm, 49 * mm], repeatRows=1)
    workout.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PAPER]),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(workout)
    story.append(Spacer(1, 4 * mm))
    story.append(paragraph("PROGRESSION: Warm up for 5-10 minutes. Beginners may start with two sets. When every repetition feels controlled for two sessions, add the smallest available weight or 1-2 repetitions. Stop if an exercise causes sharp or unusual pain.", styles["BodySmall"]))

    story.append(PageBreak())
    story.append(paragraph("WEEK 01 | FOOD", styles["Eyebrow"]))
    story.append(paragraph("PAKISTANI MEAL PLAN", styles["Section"]))
    meal_rows = [[paragraph(h, styles["TableHead"]) for h in ["DAY", "BREAKFAST", "LUNCH", "SNACK", "DINNER"]]]
    for meal in guide["meals"]:
        meal_rows.append([paragraph(value, styles["TableCellStrong"] if index == 0 else styles["TableCell"]) for index, value in enumerate(meal)])
    meals = Table(meal_rows, colWidths=[22 * mm, 56 * mm, 58 * mm, 48 * mm, 61 * mm], repeatRows=1)
    meals.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PAPER]),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(meals)
    story.append(Spacer(1, 4 * mm))
    story.append(paragraph("EVERY DAY: Drink water regularly and include vegetables or salad. Prefer home-cooked food and adjust roti or rice portions to your calculated energy needs. Tea is fine; limit added sugar, frequent biscuits, bakery items, soft drinks, and deep-fried snacks.", styles["BodySmall"]))
    story.append(Spacer(1, 4 * mm))
    story.append(paragraph("GENERAL GUIDANCE ONLY: This plan is for generally healthy adults and is not a medical or individual diet prescription. If you are pregnant, under 18, managing diabetes, high blood pressure, an injury, an eating disorder, or another medical condition, speak with a qualified clinician or dietitian before starting. Exercise technique should be checked by a coach.", styles["BodySmall"]))

    doc.build(story, onFirstPage=draw_chrome, onLaterPages=draw_chrome)
    return output


def main():
    outputs = [build_pdf(guide) for guide in load_guides()]
    for output in outputs:
        print(output)


if __name__ == "__main__":
    main()
