"""Shape text with HarfBuzz and return it as outlined SVG path data.

Use as a module:
    import sys; sys.path.insert(0, "<tools dir>")
    from textpath import text_path, font_metrics, FONTS
    d, width = text_path("UTSW", FONTS["Inter Display Black"], size=200, tracking=-30)

or from the shell:
    python3 -I textpath.py --font "Inter Display Bold" --size 120 --text "MyCare" [--tracking -10] [--features ss01,cv11]

`size` is the font size in SVG user units (em size). `tracking` is extra space
per glyph in thousandths of an em (like design-app tracking). The returned path
starts at x (left edge of the first glyph's advance box) on baseline y, with
y growing downward as in SVG. `width` is the total advance width.
"""
import argparse
import glob
import json
import os

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

FONT_DIR = "/usr/share/fonts/opentype/inter"
FONTS = {}
for _p in sorted(glob.glob(os.path.join(FONT_DIR, "*.otf"))):
    _name = os.path.basename(_p)[:-4]  # e.g. InterDisplay-SemiBold
    fam, _, style = _name.partition("-")
    fam = "Inter Display" if fam == "InterDisplay" else "Inter"
    FONTS[f"{fam} {style}"] = _p

_cache = {}


def _load(font_path):
    if font_path not in _cache:
        tt = TTFont(font_path)
        blob = hb.Blob.from_file_path(font_path)
        face = hb.Face(blob)
        font = hb.Font(face)
        _cache[font_path] = (tt, font, tt["head"].unitsPerEm)
    return _cache[font_path]


def resolve(font):
    if os.path.exists(font):
        return font
    if font in FONTS:
        return FONTS[font]
    raise KeyError(f"unknown font {font!r}; choose from {sorted(FONTS)}")


def font_metrics(font, size):
    """Cap height, x-height, ascender, descender scaled to `size` (positive numbers)."""
    tt, _, upem = _load(resolve(font))
    os2 = tt["OS/2"]
    s = size / upem
    return {
        "capHeight": os2.sCapHeight * s,
        "xHeight": os2.sxHeight * s,
        "ascender": tt["hhea"].ascent * s,
        "descender": -tt["hhea"].descent * s,
    }


def text_path(text, font, size, tracking=0, x=0.0, y=0.0, features=None):
    """Return (svg_path_d, advance_width) for `text` set at `size`, baseline at (x, y)."""
    path = resolve(font)
    tt, hbfont, upem = _load(path)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    feats = {"kern": True, "liga": True}
    for f in features or []:
        feats[f] = True
    hb.shape(hbfont, buf, feats)
    glyph_order = tt.getGlyphOrder()
    gs = tt.getGlyphSet()
    s = size / upem
    track = tracking / 1000.0 * size
    pen = SVGPathPen(gs, ntos=lambda v: ("%.2f" % v).rstrip("0").rstrip("."))
    cx = x
    n = len(buf.glyph_infos)
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        name = glyph_order[info.codepoint]
        ox = cx + pos.x_offset * s
        oy = y - pos.y_offset * s
        tpen = TransformPen(pen, (s, 0, 0, -s, ox, oy))
        gs[name].draw(tpen)
        cx += pos.x_advance * s
        if i < n - 1:
            cx += track
    return pen.getCommands(), cx - x


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--font", required=True)
    ap.add_argument("--size", type=float, required=True)
    ap.add_argument("--text", required=True)
    ap.add_argument("--tracking", type=float, default=0)
    ap.add_argument("--features", default="")
    a = ap.parse_args()
    feats = [f for f in a.features.split(",") if f]
    d, w = text_path(a.text, a.font, a.size, a.tracking, features=feats)
    print(json.dumps({"d": d, "width": w, "metrics": font_metrics(a.font, a.size)}))


if __name__ == "__main__":
    main()
