"""Build the four MyCare logo iterations as outlined-type SVGs.

    python3 logo-iterations/build.py            # writes logo-iterations/<name>/*.svg

Every file comes from the symbol and wordmark definitions below, so the
horizontal, stacked, reversed, one-color, app icon, and favicon versions of an
iteration always match. Type is outlined with handoff/logo-iterations/tools/textpath.py.
"""
import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "handoff", "logo-iterations", "tools"))
from textpath import text_path, font_metrics  # noqa: E402

BLUE = "#004278"   # UT Southwestern Blue, PMS 2945
CYAN = "#00A9E0"   # PMS 2995, shapes only
GRAY = "#5B6770"   # endorsement text, 5.9:1 on white
WHITE = "#FFFFFF"
BLACK = "#000000"


def f(v):
    return ("%.2f" % v).rstrip("0").rstrip(".")


def bbox_of_path(d):
    nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", d)]
    xs, ys = nums[0::2], nums[1::2]
    return min(xs), min(ys), max(xs), max(ys)


# --------------------------------------------------------------------------
# Symbols. Each is drawn in a 100 × 100 box and returns SVG markup.
#   main   – the symbol's primary color
#   accent – the accent color (same as main in one-color versions)
#   ground – color behind the symbol, for knocked-out details
# --------------------------------------------------------------------------

def capsule(x1, y1, x2, y2):
    """Rounded bar (fully round ends) from (x1, y1) to (x2, y2) corners."""
    r = min(x2 - x1, y2 - y1) / 2
    return f'<rect x="{f(x1)}" y="{f(y1)}" width="{f(x2 - x1)}" height="{f(y2 - y1)}" rx="{f(r)}"/>'


def plus_path(cx, cy, arm, t, r=None, reverse=False):
    """Plus sign as one closed path (for even-odd knockouts). arm = full length, t = bar thickness."""
    a, h = arm / 2, t / 2
    r = h * 0.35 if r is None else r
    # Corners of the plus outline, clockwise, starting at top-left of the top bar.
    pts = [(-h, -a), (h, -a), (h, -h), (a, -h), (a, h), (h, h), (h, a), (-h, a), (-h, h), (-a, h), (-a, -h), (-h, -h)]
    # Round only the 8 outer corners.
    outer = {0, 1, 3, 4, 6, 7, 9, 10}
    if reverse:
        pts = pts[::-1]
        outer = {11 - i for i in outer}
    d = []
    n = len(pts)
    for i, (px, py) in enumerate(pts):
        if i in outer and r > 0:
            pxp, pyp = pts[i - 1]
            pxn, pyn = pts[(i + 1) % n]
            def towards(qx, qy):
                dx, dy = qx - px, qy - py
                L = math.hypot(dx, dy)
                return px + dx / L * r, py + dy / L * r
            s = towards(pxp, pyp)
            e = towards(pxn, pyn)
            d.append(("L" if d else "M") + f"{f(cx + s[0])} {f(cy + s[1])}")
            d.append(f"Q{f(cx + px)} {f(cy + py)} {f(cx + e[0])} {f(cy + e[1])}")
        else:
            d.append(("L" if d else "M") + f"{f(cx + px)} {f(cy + py)}")
    return "".join(d) + "Z"


def rrect_path(x, y, w, h, r):
    return (f"M{f(x + r)} {f(y)}H{f(x + w - r)}A{f(r)} {f(r)} 0 0 1 {f(x + w)} {f(y + r)}"
            f"V{f(y + h - r)}A{f(r)} {f(r)} 0 0 1 {f(x + w - r)} {f(y + h)}H{f(x + r)}"
            f"A{f(r)} {f(r)} 0 0 1 {f(x)} {f(y + h - r)}V{f(y + r)}A{f(r)} {f(r)} 0 0 1 {f(x + r)} {f(y)}Z")


# 1. Open arms – a medical plus whose top arm is a head: a person welcoming you.
def sym_open_arms(main, accent, ground, uid="", draft=False):
    t = 27 if not draft else 22
    c = 54 if not draft else 50
    h = t / 2
    head_r = h + 1 if not draft else 9
    head_cy = c - h - 7 - head_r if not draft else c - h - 14 - head_r
    return (f'<g fill="{main}">{capsule(3, c - h, 97, c + h)}{capsule(50 - h, c - h, 50 + h, 97)}</g>'
            f'<circle cx="50" cy="{f(head_cy)}" r="{f(head_r)}" fill="{accent}"/>')


# 2. Care chat – your message and your care team's reply; the plus marks it as care.
def chat_front(draft=False):
    if draft:
        x, y, w, hh, r = 6, 24, 70, 58, 18
        tail = f"M{f(x + 12)} {f(y + hh - 4)}L{f(x + 6)} {f(y + hh + 16)}L{f(x + 30)} {f(y + hh)}Z"
    else:
        x, y, w, hh, r = 3, 30, 72, 56, 22
        tail = (f"M{f(x + 32)} {f(y + hh - 2)}L{f(x + 11)} {f(y + hh + 11)}"
                f"Q{f(x + 8)} {f(y + hh + 13)} {f(x + 8)} {f(y + hh + 10)}L{f(x + 10)} {f(y + hh - 10)}Z")
    return x, y, w, hh, r, tail


def sym_care_chat(main, accent, ground, uid="", draft=False):
    x, y, w, hh, r, tail = chat_front(draft)
    cx, cy = x + w / 2, y + hh / 2
    arm, t = (34, 12) if not draft else (26, 8)
    front = rrect_path(x, y, w, hh, r) + tail + plus_path(cx, cy, arm, t, reverse=True)
    # Back bubble (the reply) sits up and to the right, with its tail at bottom right.
    bx, by, bw, bh, br = (31, 4, 66, 52, 20) if not draft else (30, 6, 64, 50, 16)
    if draft:
        btail = f"M{f(bx + bw - 4)} {f(by + bh - 20)}L{f(bx + bw)} {f(by + bh + 8)}L{f(bx + bw - 28)} {f(by + bh - 1)}Z"
    else:
        btail = (f"M{f(bx + bw - 10)} {f(by + bh - 10)}L{f(bx + bw - 8)} {f(by + bh + 10)}"
                 f"Q{f(bx + bw - 8)} {f(by + bh + 13)} {f(bx + bw - 11)} {f(by + bh + 11)}L{f(bx + bw - 32)} {f(by + bh - 2)}Z")
    back = rrect_path(bx, by, bw, bh, br) + btail
    gap = 6
    m = f"cm{uid}"
    return (f'<defs><mask id="{m}" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">'
            f'<rect x="-10" y="-10" width="120" height="120" fill="#fff"/>'
            f'<path d="{rrect_path(x, y, w, hh, r)}{tail}" fill="#000" stroke="#000" stroke-width="{gap * 2}" stroke-linejoin="round"/></mask></defs>'
            f'<path d="{back}" fill="{accent}" mask="url(#{m})"/>'
            f'<path d="{front}" fill="{main}"/>')


def sym_care_chat_small(main, accent, ground):
    """Favicon version: the front bubble alone, centered, so the plus survives at 16–32 px."""
    x, y, w, hh, r, tail = chat_front()
    body = rrect_path(x, y, w, hh, r) + tail + plus_path(x + w / 2, y + hh / 2, 36, 13, reverse=True)
    return f'<g transform="translate(50 50) scale(1.22) translate({f(-(x + w / 2))} {f(-(y + hh / 2 + 4))})"><path d="{body}" fill="{main}"/></g>'


# 3. Heart path – two lines, you and your care team, meet in the middle: an M that is also a heart.
HEART = ("M50 93C30 78 8 60 8 36C8 19 18 8 30.5 8C43 8 50 20 50 52"
         "C50 20 57 8 69.5 8C82 8 92 19 92 36C92 60 70 78 50 93Z")
HEART_DRAFT = ("M50 90C28 74 10 58 10 36C10 20 20 10 31 10C42 10 50 20 50 36"
               "C50 20 58 10 69 10C80 10 90 20 90 36C90 58 72 74 50 90Z")


def sym_heart_path(main, accent, ground, uid="", draft=False, sw=None):
    d = HEART_DRAFT if draft else HEART
    sw = sw or (10 if draft else 13.5)
    m = f"hl{uid}"
    s = f'fill="none" stroke-width="{f(sw)}" stroke-linejoin="round" stroke-linecap="round"'
    if main == accent:
        return f'<path d="{d}" {s} stroke="{main}"/>'
    return (f'<defs><clipPath id="{m}l"><rect x="-10" y="-10" width="60" height="120"/></clipPath>'
            f'<clipPath id="{m}r"><rect x="50" y="-10" width="60" height="120"/></clipPath></defs>'
            f'<path d="{d}" {s} stroke="{main}" clip-path="url(#{m}l)"/>'
            f'<path d="{d}" {s} stroke="{accent}" clip-path="url(#{m}r)"/>')


# 4. Care C – a custom C that holds a plus; used in the wordmark and as the monogram.
def c_ring(cx, cy, ro, t, gap_deg):
    """Filled C outline: ring of outer radius ro and thickness t, open on the right,
    with terminals cut horizontally like Inter's C."""
    ri = ro - t
    a = math.radians(gap_deg / 2)
    yo, xo = ro * math.sin(a), ro * math.cos(a)
    xi = math.sqrt(max(ri * ri - yo * yo, 0.01))
    return (f"M{f(cx + xo)} {f(cy - yo)}A{f(ro)} {f(ro)} 0 1 0 {f(cx + xo)} {f(cy + yo)}"
            f"L{f(cx + xi)} {f(cy + yo)}A{f(ri)} {f(ri)} 0 1 1 {f(cx + xi)} {f(cy - yo)}Z")


def sym_care_c(main, accent, ground, uid="", draft=False):
    if draft:
        return (f'<path d="{c_ring(50, 50, 46, 14, 84)}" fill="{main}"/>'
                f'<path d="{plus_path(52, 50, 30, 9)}" fill="{accent}"/>')
    return (f'<path d="{c_ring(50, 50, 48, 19, 64)}" fill="{main}"/>'
            f'<path d="{plus_path(50, 50, 34, 12)}" fill="{accent}"/>')


def sym_care_c_small(main, accent, ground):
    """Favicon version: a slightly thinner C with a larger plus."""
    return (f'<path d="{c_ring(50, 50, 48, 16, 64)}" fill="{main}"/>'
            f'<path d="{plus_path(50, 50, 44, 15)}" fill="{accent}"/>')


# --------------------------------------------------------------------------
# Wordmarks
# --------------------------------------------------------------------------

def wordmark(it, color, x, baseline, size, accent=None):
    """Return (svg, width) for the MyCare wordmark of iteration `it`."""
    font, tracking, feats = it["font"], it["tracking"], it.get("features", [])
    if it["name"] != "care-c":
        d, w = text_path("MyCare", font, size, tracking, x, baseline, feats)
        return f'<path d="{d}" fill="{color}"/>', w
    # Custom C: "My" + ring C with plus + "are"
    accent = accent or color
    d1, w1 = text_path("My", font, size, tracking, x, baseline, feats)
    cap = font_metrics(font, size)["capHeight"]
    ro = size * 1538 / 2048 / 2   # Inter C height including overshoot
    t = size * 0.145              # Inter Display Bold round stroke
    cx = x + w1 + size * 0.03 + ro
    cy = baseline - cap / 2
    sx = 0.9                      # narrow the circle to Inter's C proportions
    cx = x + w1 + size * 0.03 + ro * sx
    ring = c_ring(cx, cy, ro, t, 64)
    plus = plus_path(cx, cy, (ro - t) * 1.38, size * 0.08)
    nx = cx + ro * sx + size * 0.03
    d2, w2 = text_path("are", font, size, tracking, nx, baseline, feats)
    width = nx + w2 - x
    svg = (f'<path d="{d1}{d2}" fill="{color}"/>'
           f'<path d="{ring}" fill="{color}" transform="translate({f(cx)} 0) scale({sx} 1) translate({f(-cx)} 0)"/>'
           f'<path d="{plus}" fill="{accent}"/>')
    return svg, width


# --------------------------------------------------------------------------
# Iterations
# --------------------------------------------------------------------------

ITERATIONS = [
    dict(name="open-arms", title="Open arms", symbol=sym_open_arms,
         font="Inter Display Bold", tracking=-12, features=["cv11"], sym_scale=1.72,
         icon_bg=BLUE, icon_main=WHITE, icon_accent=CYAN, icon_scale=0.62),
    dict(name="care-chat", title="Care chat", symbol=sym_care_chat,
         font="Inter Display SemiBold", tracking=-10, features=[], sym_scale=1.55,
         icon_bg=WHITE, icon_main=BLUE, icon_accent=CYAN, icon_scale=0.62, small=sym_care_chat_small),
    dict(name="heart-path", title="Heart path", symbol=sym_heart_path,
         font="Inter Display ExtraBold", tracking=-18, features=["cv11"], sym_scale=1.5,
         icon_bg=BLUE, icon_main=WHITE, icon_accent=CYAN, icon_scale=0.62,
         small=lambda m, a, g: sym_heart_path(m, a, g, uid="s", sw=17)),
    dict(name="care-c", title="Care C", symbol=sym_care_c,
         font="Inter Display Bold", tracking=-14, features=[], sym_scale=1.30,
         icon_bg=CYAN, icon_main=WHITE, icon_accent=BLUE, icon_scale=0.56, small=sym_care_c_small),
]


def svg_doc(vb, body, label):
    x, y, w, h = vb
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{f(x)} {f(y)} {f(w)} {f(h)}" role="img" aria-label="{label}">'
            f'<title>{label}</title>{body}</svg>\n')


def symbol_group(it, x, y, size, main, accent, ground, uid, draft=False, small=False):
    s = size / 100
    if small and it.get("small"):
        inner = it["small"](main, accent, ground)
    else:
        inner = it["symbol"](main, accent, ground, uid=uid, draft=draft)
    return f'<g transform="translate({f(x)} {f(y)}) scale({f(s)})">{inner}</g>'


F = 100  # wordmark font size in user units


def horizontal(it, word, main, accent, ground, uid="h", wordmark_only=False):
    cap = font_metrics(it["font"], F)["capHeight"]
    base = 0
    H = cap * it["sym_scale"]
    if wordmark_only:
        wsvg, ww = wordmark(it, word, 0, base, F, accent)
        body = wsvg
        x0, x1 = -2, ww + 2
    else:
        sx = 0
        sy = base - cap / 2 - H / 2
        gap = cap * 0.42
        wsvg, ww = wordmark(it, word, sx + H + gap, base, F, accent)
        body = symbol_group(it, sx, sy, H, main, accent, ground, uid) + wsvg
        x0, x1 = -2, H + gap + ww + 2
    top = min(-cap - 3, base - cap / 2 - H / 2) - 2
    bot = max(F * 0.235, base - cap / 2 + H / 2) + 2
    return (x0, top, x1 - x0, bot - top), body


def stacked(it, word, main, accent, ground, endorse_color, uid="s"):
    cap = font_metrics(it["font"], F)["capHeight"]
    wsvg_probe, ww = wordmark(it, word, 0, 0, F, accent)
    H = cap * it["sym_scale"] * 1.55
    end_size = F * 0.30
    ed, ew = text_path("UT Southwestern", "Inter Medium", end_size, 0)
    width = max(ww, H, ew)
    cx = width / 2
    sy = 0
    base = H + cap * 0.62 + cap
    wsvg, _ = wordmark(it, word, cx - ww / 2, base, F, accent)
    eb = base + F * 0.235 + end_size * 1.25
    ed, _ = text_path("UT Southwestern", "Inter Medium", end_size, 0, cx - ew / 2, eb)
    body = (symbol_group(it, cx - H / 2, sy, H, main, accent, ground, uid) + wsvg +
            f'<path d="{ed}" fill="{endorse_color}"/>')
    return (-4, -4, width + 8, eb + end_size * 0.3 + 6), body


def app_icon(it, size=1024, scale=None, uid="i"):
    scale = scale or it["icon_scale"]
    S = size * scale
    o = (size - S) / 2
    dy = size * it.get("icon_dy", 0)
    body = (f'<rect width="{size}" height="{size}" fill="{it["icon_bg"]}"/>' +
            symbol_group(it, o, o + dy, S, it["icon_main"], it["icon_accent"], it["icon_bg"], uid))
    return (0, 0, size, size), body


def favicon(it, uid="f"):
    # Rounded tile at 32 units, symbol a touch larger than on the app icon for small sizes.
    S = 32 * min(it["icon_scale"] + 0.1, 0.72)
    o = (32 - S) / 2
    body = (f'<rect width="32" height="32" rx="7" fill="{it["icon_bg"]}"/>' +
            symbol_group(it, o, o, S, it["icon_main"], it["icon_accent"], it["icon_bg"], uid, small=True))
    return (0, 0, 32, 32), body


def clearspace(it):
    vb, body = horizontal(it, BLUE, BLUE, CYAN, WHITE, uid="c", wordmark_only=it["name"] == "care-c")
    x, y, w, h = vb
    cap = font_metrics(it["font"], F)["capHeight"]
    m = cap
    ox, oy, W, Hh = x - m, y - m, w + 2 * m, h + 2 * m
    zones = "".join(
        f'<rect x="{f(zx)}" y="{f(zy)}" width="{f(m)}" height="{f(m)}" fill="#D2EEF8"/>'
        for zx, zy in [(ox, oy), (x + w, oy), (ox, y + h), (x + w, y + h)])
    guides = (f'<rect x="{f(ox)}" y="{f(oy)}" width="{f(W)}" height="{f(Hh)}" fill="none" stroke="{CYAN}" stroke-width="1.5"/>'
              f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" fill="none" stroke="{CYAN}" stroke-width="1.2" stroke-dasharray="5 4"/>')
    return (ox - 8, oy - 8, W + 16, Hh + 16), f'<rect x="{f(ox - 8)}" y="{f(oy - 8)}" width="{f(W + 16)}" height="{f(Hh + 16)}" fill="#fff"/>' + zones + guides + body


TYPE_TESTS = {
    "open-arms": [("Inter Display SemiBold", []), ("Inter Display Bold", ["cv11"]), ("Inter Display ExtraBold", ["cv11"]), ("Inter Display Medium", [])],
    "care-chat": [("Inter Display Medium", []), ("Inter Display SemiBold", []), ("Inter Display Bold", ["cv11"]), ("Inter Display Regular", [])],
    "heart-path": [("Inter Display Bold", []), ("Inter Display ExtraBold", ["cv11"]), ("Inter Display Black", ["cv11"]), ("Inter Display SemiBold", ["cv11"])],
    "care-c": [("Inter Display SemiBold", []), ("Inter Display Bold", []), ("Inter Display ExtraBold", []), ("Inter Display Black", [])],
}


def type_tests(it):
    """Four wordmark weights stacked; the chosen one in blue, the others in gray."""
    rows, y, wmax = [], 0, 0
    for font, feats in TYPE_TESTS[it["name"]]:
        y += 100
        chosen = font == it["font"]
        col = BLUE if chosen else "#8A949C"
        t = dict(it, font=font, features=feats)
        if it["name"] == "care-c":
            svg, w = wordmark(t, col, 0, y, F, CYAN if chosen else col)
        else:
            d, w = text_path("MyCare", font, F, it["tracking"], 0, y, feats)
            svg = f'<path d="{d}" fill="{col}"/>'
        rows.append(svg)
        wmax = max(wmax, w)
        y += 22
    return (-4, 0, wmax + 8, y + 4), "".join(rows)


def symbol_evolution(it):
    arrow = ('<path d="M128 50H162" stroke="#7BAFD4" stroke-width="5" stroke-linecap="round"/>'
             '<path d="M152 39L164 50L152 61" fill="none" stroke="#7BAFD4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>')
    a = symbol_group(it, 0, 0, 100, BLUE, CYAN, WHITE, "a", draft=True)
    b = symbol_group(it, 192, 0, 100, BLUE, CYAN, WHITE, "b")
    return (-6, -6, 304, 112), a + arrow + b


def build(out_root):
    for it in ITERATIONS:
        d = os.path.join(out_root, it["name"])
        os.makedirs(d, exist_ok=True)
        name = f"MyCare logo – {it['title']}"
        wm = it["name"] == "care-c"
        files = {
            "horizontal.svg": horizontal(it, BLUE, BLUE, CYAN, WHITE, wordmark_only=wm),
            "horizontal-symbol.svg": horizontal(it, BLUE, BLUE, CYAN, WHITE) if wm else None,
            "stacked.svg": stacked(it, BLUE, BLUE, CYAN, WHITE, GRAY),
            "reversed.svg": horizontal(it, WHITE, WHITE, CYAN, BLUE, wordmark_only=wm),
            "reversed-stacked.svg": stacked(it, WHITE, WHITE, CYAN, BLUE, WHITE),
            "one-color-blue.svg": horizontal(it, BLUE, BLUE, BLUE, WHITE, wordmark_only=wm),
            "one-color-black.svg": horizontal(it, BLACK, BLACK, BLACK, WHITE, wordmark_only=wm),
            "symbol.svg": ((0, 0, 100, 100), it["symbol"](BLUE, CYAN, WHITE, uid="y")),
            "symbol-draft.svg": ((0, 0, 100, 100), it["symbol"](BLUE, CYAN, WHITE, uid="d", draft=True)),
            "app-icon.svg": app_icon(it),
            "favicon.svg": favicon(it),
            "clearspace.svg": clearspace(it),
            "process-type.svg": type_tests(it),
            "process-symbol.svg": symbol_evolution(it),
        }
        for fn, v in files.items():
            if v is None:
                continue
            vb, body = v
            with open(os.path.join(d, fn), "w") as fh:
                fh.write(svg_doc(vb, body, name))
        print("built", d)


if __name__ == "__main__":
    build(HERE)
