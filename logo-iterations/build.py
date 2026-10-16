"""Build the MyCare logo directions (round 2).

    python3 logo-iterations/build.py          # writes logo-iterations/<direction>/

Each direction is data: a symbol drawn on a 100-unit grid (layers tagged
"main" or "accent"), wordmark rules, and app-icon settings. One pipeline turns
that into every file in the system, so lockups, colorways, icons, and the
favicon always match. Geometry is shapely (see geo.py); type is Inter Display,
shaped with HarfBuzz and outlined.
"""
import math
import os
import sys

from shapely import affinity
from shapely.geometry import LineString, Polygon

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "..", "handoff", "logo-iterations", "tools"))
from geo import *  # noqa
from textpath import font_metrics, text_path  # noqa

BLUE = "#004278"    # UT Southwestern Blue, PMS 2945
CYAN = "#00A9E0"    # PMS 2995, shapes only
GRAY = "#5B6770"    # endorsement text, 5.9:1 on white
WHITE = "#FFFFFF"
BLACK = "#000000"
F = 100             # wordmark size in user units
CAP = font_metrics("Inter Display SemiBold", F)["capHeight"]  # 72.75


def plus(cx, cy, arm, t, r):
    return union(rect(cx - t / 2, cy - arm / 2, t, arm, r), rect(cx - arm / 2, cy - t / 2, arm, t, r))


def place(g, x, y, s):
    """Scale a 100-grid geometry by s and move its origin to (x, y)."""
    return affinity.translate(affinity.scale(g, s, s, origin=(0, 0)), x, y)


# ======================================================================
# Wordmarks
# ======================================================================

def glyph_run(text, font, tracking, x=0, feats=()):
    d, w = text_path(text, font, F, tracking, x, 0, list(feats))
    return from_svg(d), w


def wordmark_plain(spec):
    g, w = glyph_run("MyCare", spec["font"], spec["tracking"], 0, spec.get("features", ()))
    if spec.get("soft"):
        g = soften(g, *spec["soft"])
    return {"main": g}, w


def wordmark_plus_a(spec, hole=False):
    """MyCare with a plus-shaped counter in the single-storey a.
    Primary: the counter holds a cyan plus. One-color: the plus is cut out."""
    font, tr = spec["font"], spec["tracking"]
    feats = ["cv11"]
    myc, w1 = glyph_run("MyC", font, tr, 0, feats)
    ax = w1 + tr / 1000 * F
    a, wa = glyph_run("a", font, 0, ax, feats)
    rest, w3 = glyph_run("re", font, tr, ax + wa + tr / 1000 * F, feats)
    polys = list(a.geoms) if hasattr(a, "geoms") else [a]
    solid = union(*[Polygon(p.exterior) for p in polys])
    counter = diff(solid, a)
    b = counter.bounds
    cx, cy = (b[0] + b[2]) / 2 + spec.get("plus_dx", 0), (b[1] + b[3]) / 2
    size = min(b[2] - b[0], b[3] - b[1])
    arm = size * spec.get("plus_arm", 1.02)
    t = arm * spec.get("plus_t", 0.38)
    p = plus(cx, cy, arm, t, t * 0.24)
    gap = spec.get("plus_gap", 3.2)
    a_new = diff(solid, grow(p, gap))
    body = union(myc, a_new, rest)
    if spec.get("soft"):
        body = soften(body, *spec["soft"])
    width = ax + wa + tr / 1000 * F + w3
    if hole:
        return {"main": body}, width
    return {"main": body, "accent": p}, width


# ======================================================================
# Directions
# ======================================================================

def seam_symbol(small=False, t=36, r=11, gap=3.4, k=28, draft=False):
    if draft:
        t, r, gap, k = 30, 6, 5, 10
    gap = gap * (1.5 if small else 1)
    p = round_concave(plus(50, 50, 100, t, r), 3.5)
    h = t / 2
    ax, ay = 50 + h, 50 - h
    bx, by = 50 - h, 50 + h
    curve = f"M{ax} {ay} C {ax - k} {ay}, {bx + k} {by}, {bx} {by}"
    side = shape(f"{curve} L -30 {by} L -30 -30 L {ax} -30 Z")
    side = union(side, rect(-30, -30, 160, ay + 30), rect(-30, -30, bx + 30, 160))
    # extend the seam a little past each inner corner so the cut is clean
    seam = curve_line(f"M{ax + 6} {ay} L{ax} {ay} C {ax - k} {ay}, {bx + k} {by}, {bx} {by} L{bx - 6} {by}")
    channel = stroke(seam, gap)
    A = round_convex(inter(p, diff(side, channel)), 1.4)
    Bh = round_convex(diff(p, side, channel), 1.4)
    return [(A, "main"), (Bh, "accent")]


def ask_symbol(small=False, draft=False):
    """A plus that speaks: a speech tail grows from the bottom arm."""
    if draft:
        p = plus(52, 44, 88, 30, 6)
        tail = polygon([(37, 68), (26, 94), (50, 84)])
        return [(union(p, tail), "main")]
    p = plus(52, 44, 88, 35, 10.5)
    tail = round_convex(polygon([(35.5, 69), (23, 96), (51, 83)]), 2.4 if not small else 3)
    body = round_concave(union(p, tail), 3)
    return [(body, "main")]


def way_in_symbol(small=False, T=48, w=16, dot_r=8.6, draft=False):
    """A cross-shaped plan (the classic hospital floor plan) drawn as one heavy line,
    open at the bottom like a door, with a cyan dot – you – arriving inside."""
    cy = 46
    w = w * (1.12 if small else 1)
    if draft:
        outer = round_concave(plus(50, cy, 92, 46, 14), 5)
        ring = diff(outer, shrink(outer, 15))
        ring = round_convex(diff(ring, rect(50 - 8, cy + 30, 16, 40)), 2.6)
        return [(ring, "main"), (circle(50, cy + 48, 9), "accent")]
    outer = round_concave(plus(50, cy, 92, T, 10), 2)
    ring = diff(outer, shrink(outer, w))
    door = T - 2 * w
    ring = diff(ring, rect(50 - door / 2, cy + 30, door, 40))
    ring = round_convex(ring, 2.4)
    return [(ring, "main"), (circle(50, cy + 10, dot_r * (1.1 if small else 1)), "accent")]


def plus_a_symbol(small=False, draft=False):
    """App-icon crop for the wordmark-led direction: the plus-a, large, bleeding off the tile."""
    spec = [d for d in DIRECTIONS if d["name"] == "care-inside"][0]["wordmark"]
    font = spec["font"]
    a, wa = glyph_run("a", font, 0, 0, ["cv11"])
    polys = list(a.geoms) if hasattr(a, "geoms") else [a]
    solid = union(*[Polygon(p.exterior) for p in polys])
    counter = diff(solid, a)
    b = counter.bounds
    cx, cy = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
    size = min(b[2] - b[0], b[3] - b[1])
    arm = size * spec.get("plus_arm", 1.02)
    t = arm * spec.get("plus_t", 0.38)
    p = plus(cx, cy, arm, t, t * 0.24)
    if draft:
        p0 = plus(cx, cy, size * 0.86, size * 0.86 * 0.36, 1.5)
        body = soften(diff(solid, p0), *spec["soft"])
        p = Polygon()
    else:
        body = diff(solid, grow(p, spec.get("plus_gap", 3.2)))
        body = soften(body, *spec["soft"])
    # normalise into the 100 grid: bowl centred, height 100
    bb = solid.bounds
    s = 100 / (bb[3] - bb[1])
    body = affinity.translate(affinity.scale(body, s, s, origin=(0, 0)), -bb[0] * s, -bb[1] * s)
    p = affinity.translate(affinity.scale(p, s, s, origin=(0, 0)), -bb[0] * s, -bb[1] * s)
    return [(body, "main"), (p, "accent")]


DIRECTIONS = [
    dict(name="seamless", title="Seamless", symbol=seam_symbol,
         wordmark=dict(kind="plain", font="Inter Display SemiBold", tracking=-12, features=["cv11"], soft=(2.2, 0.8)),
         sym_h=1.42, gap=0.40,
         icon=dict(bg=BLUE, main=WHITE, accent=CYAN, scale=0.56)),
    dict(name="way-in", title="Way in", symbol=way_in_symbol,
         wordmark=dict(kind="plain", font="Inter Display Medium", tracking=-8, features=["cv11"], soft=(3.0, 1.0)),
         sym_h=1.46, gap=0.42,
         icon=dict(bg=BLUE, main=WHITE, accent=CYAN, scale=0.56)),
    dict(name="care-inside", title="Care inside", symbol=None, horizontal="wordmark",
         wordmark=dict(kind="plus_a", font="Inter Display Bold", tracking=-14, soft=(2.4, 0.9),
                       plus_arm=1.04, plus_t=0.38, plus_gap=3.0),
         sym_h=1.42, gap=0.40,
         icon=dict(bg=BLUE, main=WHITE, accent=CYAN, scale=0.56)),
    dict(name="ask", title="Ask", symbol=ask_symbol,
         wordmark=dict(kind="plain", font="Inter Display Bold", tracking=-16, features=[], soft=(2.0, 0.8)),
         sym_h=1.40, gap=0.40,
         icon=dict(bg=BLUE, main=WHITE, accent=WHITE, scale=0.56, dy=0.01)),
]
DIRECTIONS[2]["symbol"] = plus_a_symbol


def wordmark(d, hole=False):
    spec = d["wordmark"]
    if spec["kind"] == "plus_a":
        return wordmark_plus_a(spec, hole=hole)
    return wordmark_plain(spec)


# ======================================================================
# Composition
# ======================================================================

def paint(groups, colors):
    """groups: list of (geometry, role); colors: role -> fill. Same-color shapes merge into one path."""
    by = {}
    for g, role in groups:
        c = colors[role]
        by.setdefault(c, []).append(g)
    return "".join(f'<path d="{to_svg(union(*gs))}" fill="{c}"/>' for c, gs in by.items())


def svg(vb, body, label):
    x, y, w, h = vb
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{num(x)} {num(y)} {num(w)} {num(h)}" role="img" aria-label="{label}">'
            f'<title>{label}</title>{body}</svg>\n')


def bounds_of(groups):
    xs0, ys0, xs1, ys1 = [], [], [], []
    for g, _ in groups:
        if g.is_empty:
            continue
        b = g.bounds
        xs0.append(b[0]); ys0.append(b[1]); xs1.append(b[2]); ys1.append(b[3])
    return min(xs0), min(ys0), max(xs1), max(ys1)


def lockup_horizontal(d, hole=False, endorse=False):
    """Symbol left of the wordmark, symbol centred on the cap height."""
    wm, ww = wordmark(d, hole)
    groups = []
    x0 = 0
    if d.get("horizontal") != "wordmark":
        H = CAP * d["sym_h"]
        s = H / 100
        sym = d["symbol"]()
        for g, role in sym:
            groups.append((place(g, 0, -CAP / 2 - H / 2, s), role))
        x0 = H + CAP * d["gap"]
    for role, g in wm.items():
        groups.append((affinity.translate(g, x0, 0), "word" if role == "main" else "accent"))
    if endorse:
        ed, ew = text_path("UT Southwestern", "Inter Medium", F * 0.30, 0, x0 + 2, F * 0.62)
        groups.append((from_svg(ed), "endorse"))
    return groups


def lockup_stacked(d, hole=False):
    wm, ww = wordmark(d, hole)
    H = CAP * d["sym_h"] * 1.5
    s = H / 100
    sym = d["symbol"]()
    sb = bounds_of([(place(g, 0, 0, s), r) for g, r in sym])
    sw = sb[2] - sb[0]
    ed, ew = text_path("UT Southwestern", "Inter Medium", F * 0.30, 0, 0, 0)
    width = max(ww, sw, ew)
    groups = []
    for g, role in sym:
        groups.append((place(g, (width - sw) / 2 - sb[0], 0, s), role))
    base = sb[3] + CAP * 0.55 + CAP
    for role, g in wm.items():
        groups.append((affinity.translate(g, (width - ww) / 2, base), "word" if role == "main" else "accent"))
    ed, _ = text_path("UT Southwestern", "Inter Medium", F * 0.30, 0, (width - ew) / 2, base + F * 0.24 + F * 0.36)
    groups.append((from_svg(ed), "endorse"))
    return groups


def frame(groups, pad=2):
    x0, y0, x1, y1 = bounds_of(groups)
    return (x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad)


COLORWAYS = {
    "primary": dict(main=BLUE, accent=CYAN, word=BLUE, endorse=GRAY),
    "reversed": dict(main=WHITE, accent=CYAN, word=WHITE, endorse=WHITE),
    "blue": dict(main=BLUE, accent=BLUE, word=BLUE, endorse=BLUE),
    "black": dict(main=BLACK, accent=BLACK, word=BLACK, endorse=BLACK),
    "white": dict(main=WHITE, accent=WHITE, word=WHITE, endorse=WHITE),
}


def app_icon(d, size=1024, small=False):
    ic = d["icon"]
    sym = d["symbol"](small=small)
    S = size * ic["scale"]
    sb = bounds_of([(place(g, 0, 0, S / 100), r) for g, r in sym])
    ox = (size - (sb[2] - sb[0])) / 2 - sb[0] + size * ic.get("dx", 0)
    oy = (size - (sb[3] - sb[1])) / 2 - sb[1] + size * ic.get("dy", 0)
    tile = rect(0, 0, size, size)
    groups = [(place(g, ox, oy, S / 100), r) for g, r in sym]
    groups = [(inter(g, tile), r) for g, r in groups]
    bg = f'<rect width="{size}" height="{size}" fill="{ic["bg"]}"/>'
    return (0, 0, size, size), bg + paint(groups, dict(main=ic["main"], accent=ic["accent"]))


def icon_layer(d, role):
    """One foreground layer of the 1024 app icon on a transparent canvas (for Icon Composer and Android)."""
    ic = d["icon"]
    sym = d["symbol"]()
    if not any(r == role for _, r in sym):
        return None
    S = 1024 * ic["scale"]
    sb = bounds_of([(place(g, 0, 0, S / 100), r) for g, r in sym])
    ox = (1024 - (sb[2] - sb[0])) / 2 - sb[0] + 1024 * ic.get("dx", 0)
    oy = (1024 - (sb[3] - sb[1])) / 2 - sb[1] + 1024 * ic.get("dy", 0)
    groups = [(place(g, ox, oy, S / 100), r) for g, r in sym if r == role]
    return (0, 0, 1024, 1024), paint(groups, dict(main=ic["main"], accent=ic["accent"]))


def favicon(d):
    ic = d["icon"]
    sym = d["symbol"](small=True)
    S = 32 * min(ic["scale"] + 0.08, 0.95)
    sb = bounds_of([(place(g, 0, 0, S / 100), r) for g, r in sym])
    ox = (32 - (sb[2] - sb[0])) / 2 - sb[0] + 32 * ic.get("dx", 0)
    oy = (32 - (sb[3] - sb[1])) / 2 - sb[1] + 32 * ic.get("dy", 0)
    tile = rect(0, 0, 32, 32, 7)
    groups = [(inter(place(g, ox, oy, S / 100), tile), r) for g, r in sym]
    bg = f'<rect width="32" height="32" rx="7" fill="{ic["bg"]}"/>'
    stroke_ = '<rect x=".5" y=".5" width="31" height="31" rx="6.5" fill="none" stroke="#D5DDE5"/>' if ic["bg"] == WHITE else ""
    return (0, 0, 32, 32), bg + stroke_ + paint(groups, dict(main=ic["main"], accent=ic["accent"]))


def monochrome_icon(d):
    """Android 13+ themed icon layer: one-color glyph inside the 66 dp safe circle of a 108 dp canvas."""
    sym = d["symbol"](small=True)
    g = union(*[g for g, _ in sym])
    c = g.centroid
    far = max(math.hypot(x - 50, y - 50) for poly in (g.geoms if hasattr(g, "geoms") else [g]) for x, y in poly.exterior.coords)
    s = 31 / far
    g = place(g, 54 - 50 * s, 54 - 50 * s, s)
    return (0, 0, 108, 108), f'<path d="{to_svg(g)}" fill="{BLACK}"/>'


def clearspace(d):
    groups = lockup_horizontal(d)
    x, y, w, h = frame(groups, 0)
    m = CAP
    ox, oy, W, H = x - m, y - m, w + 2 * m, h + 2 * m
    zones = "".join(f'<rect x="{num(zx)}" y="{num(zy)}" width="{num(m)}" height="{num(m)}" fill="#D2EEF8"/>'
                    for zx, zy in [(ox, oy), (x + w, oy), (ox, y + h), (x + w, y + h)])
    guides = (f'<rect x="{num(ox)}" y="{num(oy)}" width="{num(W)}" height="{num(H)}" fill="none" stroke="{CYAN}" stroke-width="1.5"/>'
              f'<rect x="{num(x)}" y="{num(y)}" width="{num(w)}" height="{num(h)}" fill="none" stroke="{CYAN}" stroke-width="1.2" stroke-dasharray="5 4"/>')
    bg = f'<rect x="{num(ox - 8)}" y="{num(oy - 8)}" width="{num(W + 16)}" height="{num(H + 16)}" fill="#fff"/>'
    return (ox - 8, oy - 8, W + 16, H + 16), bg + zones + guides + paint(groups, COLORWAYS["primary"])


TYPE_TESTS = {
    "seamless": ["Inter Display Medium", "Inter Display SemiBold", "Inter Display Bold", "Inter Display ExtraBold"],
    "way-in": ["Inter Display Regular", "Inter Display Medium", "Inter Display SemiBold", "Inter Display Bold"],
    "care-inside": ["Inter Display Medium", "Inter Display SemiBold", "Inter Display Bold", "Inter Display ExtraBold"],
    "ask": ["Inter Display Medium", "Inter Display SemiBold", "Inter Display Bold", "Inter Display ExtraBold"],
}


def process_type(d):
    """Four weights of the wordmark; the chosen weight in blue, the others in gray."""
    groups, y = [], 0
    for font in TYPE_TESTS[d["name"]]:
        y += F * 1.18
        spec = dict(d["wordmark"], font=font)
        dd = dict(d, wordmark=spec)
        wm, w = wordmark(dd)
        chosen = font == d["wordmark"]["font"]
        for role, g in wm.items():
            r = ("word" if role == "main" else "accent") if chosen else "muted"
            groups.append((affinity.translate(g, 0, y), r))
    return frame(groups, 3), paint(groups, dict(word=BLUE, accent=CYAN, muted="#8A949C"))


def process_symbol(d):
    """First sketch, arrow, refined symbol."""
    a = [(place(g, 0, 0, 1), r) for g, r in d["symbol"](draft=True)]
    b = [(place(g, 190, 0, 1), r) for g, r in d["symbol"]()]
    ab = bounds_of(a)
    a = [(affinity.translate(g, 0, 50 - (ab[1] + ab[3]) / 2), r) for g, r in a]
    arrow = union(stroke(LineString([(122, 50), (160, 50)]), 5), stroke(LineString([(150, 39), (161, 50), (150, 61)]), 5))
    groups = a + b + [(arrow, "arrow")]
    return frame(groups, 3), paint(groups, dict(main=BLUE, accent=CYAN, arrow="#7BAFD4"))


def build(out_root, only=None):
    for d in DIRECTIONS:
        if only and d["name"] not in only:
            continue
        out = os.path.join(out_root, d["name"])
        os.makedirs(out, exist_ok=True)
        label = f"MyCare logo – {d['title']}"
        files = {}
        H = lockup_horizontal(d)
        files["horizontal.svg"] = (frame(H), paint(H, COLORWAYS["primary"]))
        HE = lockup_horizontal(d, endorse=True)
        files["horizontal-endorsed.svg"] = (frame(HE), paint(HE, COLORWAYS["primary"]))
        ST = lockup_stacked(d)
        files["stacked.svg"] = (frame(ST), paint(ST, COLORWAYS["primary"]))
        files["reversed.svg"] = (frame(H), paint(H, COLORWAYS["reversed"]))
        files["reversed-stacked.svg"] = (frame(ST), paint(ST, COLORWAYS["reversed"]))
        HO = lockup_horizontal(d, hole=True)
        STO = lockup_stacked(d, hole=True)
        for cw in ("blue", "black", "white"):
            files[f"one-color-{cw}.svg"] = (frame(HO), paint(HO, COLORWAYS[cw]))
        files["one-color-stacked-blue.svg"] = (frame(STO), paint(STO, COLORWAYS["blue"]))
        sym = d["symbol"]()
        files["symbol.svg"] = (frame(sym, 1), paint(sym, COLORWAYS["primary"]))
        files["app-icon.svg"] = app_icon(d)
        files["favicon.svg"] = favicon(d)
        files["icon-monochrome.svg"] = monochrome_icon(d)
        for layer in ("main", "accent"):
            lay = icon_layer(d, layer)
            if lay:
                files[f"icon-layer-{layer}.svg"] = lay
        files["clearspace.svg"] = clearspace(d)
        files["process-type.svg"] = process_type(d)
        files["process-symbol.svg"] = process_symbol(d)
        for fn, (vb, body) in files.items():
            with open(os.path.join(out, fn), "w") as fh:
                fh.write(svg(vb, body, label))
        print("built", out)


if __name__ == "__main__":
    build(HERE, only=sys.argv[1:] or None)
