"""Build UTSW MyCare logo concepts A and B plus a review sheet.
UTSW letterforms are placed only as placeholder raster art (fpo.py) - never redrawn.
"""
import math, os, sys, base64
LOGO = "/tmp/claude-0/-home-user-UTSW/5928378c-5ac3-51e1-a718-9a85fba17335/scratchpad/logo"
OUT = LOGO + "/final"
sys.path.insert(0, LOGO + "/tools")
from outline import outline_text
from fpo import utsw_image, utsw_size

BLUE, GRAY, WHITE, BLACK = "#004278", "#333333", "#FFFFFF", "#000000"
FONT_A = LOGO + "/fonts/instrument-sans-600.woff2"
FONT_B = LOGO + "/fonts/instrument-sans-700.woff2"
U = 100.0  # U-height (cap height of UTSW art) in SVG units

def svg(w, h, body, bg=None):
    r = f'<rect width="{w:.1f}" height="{h:.1f}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" '
            f'width="{w:.1f}" height="{h:.1f}">{r}{body}</svg>')

def word(text, font, cap, tracking):
    # scale so the font's cap height equals `cap`
    probe = outline_text(text, font, 1000, tracking)
    size = 1000 * cap / probe["cap_height"]
    return outline_text(text, font, size, tracking)

def save(name, s):
    open(f"{OUT}/{name}", "w").write(s)

# ---------- Concept A: Refined lockup ----------
def concept_a(utsw_color, word_color, bg=None, m=U):
    # m = clear space (1 U-height); MyCare cap height 0.9 U so it does not outweigh UTSW
    uw, uh = utsw_size(U)
    w = word("MyCare", FONT_A, 0.9 * U, -12)
    gap = 0.42 * U
    W = m + uw + gap + w["width"] + m
    H = m + U + max(w["bbox"][3], 0) + m  # include the "y" descender
    base = m + U
    body = utsw_image(m, m, U, utsw_color) + \
        f'<path transform="translate({m + uw + gap:.2f},{base:.2f})" fill="{word_color}" d="{w["d"]}"/>'
    return svg(W, H, body, bg)

def concept_a_stacked(utsw_color, word_color, bg=None):
    m = U
    uw, uh = utsw_size(U * 0.62)
    w = word("MyCare", FONT_A, U, -12)
    gap = 0.38 * U
    W = m + max(uw, w["width"]) + m
    H = m + uh + gap + U + m
    body = utsw_image(m, m, uh, utsw_color) + \
        f'<path transform="translate({m:.2f},{m + uh + gap + U:.2f})" fill="{word_color}" d="{w["d"]}"/>'
    return svg(W, H, body, bg)

# ---------- Concept B: Care ring symbol ----------
def ring(cx, cy, r, color, inner=None):
    """Symbol: a thick ring open at the upper right (the 'C' of Care, a path that leads on),
    with a solid dot at its centre (you - the 'My'). Built on a circle grid: outer radius r,
    stroke 0.30r, gap centred at 45 degrees spanning 60 degrees, dot radius 0.26r."""
    sw = 0.30 * r
    rr = r - sw / 2
    a0, a1 = math.radians(-45 + 30), math.radians(-45 - 30 + 360)
    x0, y0 = cx + rr * math.cos(a0), cy + rr * math.sin(a0)
    x1, y1 = cx + rr * math.cos(a1), cy + rr * math.sin(a1)
    arc = (f'<path d="M{x0:.2f},{y0:.2f} A{rr:.2f},{rr:.2f} 0 1 1 {x1:.2f},{y1:.2f}" fill="none" '
           f'stroke="{color}" stroke-width="{sw:.2f}" stroke-linecap="round"/>')
    dot = f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{0.26 * r:.2f}" fill="{inner or color}"/>'
    return arc + dot

def concept_b(sym_color, word_color, utsw_color, bg=None, m=U):
    w = word("MyCare", FONT_B, U, -18)
    r = 0.80 * U                      # symbol height = 1.6 U, centred on the word's cap band + endorsement
    eu = 0.50 * U                     # endorsement UTSW art height
    egap = 0.26 * U
    block_h = eu + egap + U
    sym_d = 2 * r
    top = m
    cy = top + block_h / 2 + 0.02 * U
    sx = m
    tx = sx + sym_d + 0.40 * U
    W = tx + w["width"] + m
    H = max(top + block_h + max(w["bbox"][3], 0), cy + r) + m  # include the "y" descender
    body = ring(sx + r, cy, r, sym_color) + \
        utsw_image(tx + 0.03 * U, top, eu, utsw_color) + \
        f'<path transform="translate({tx:.2f},{top + eu + egap + U:.2f})" fill="{word_color}" d="{w["d"]}"/>'
    return svg(W, H, body, bg)

def icon_b(bg, fg):
    S = 1024
    return svg(S, S, ring(S / 2, S / 2, 0.33 * S, fg), bg)

def icon_a(bg, fg):
    # Monogram "MC" outlined from Instrument Sans 700 (no UTSW letterforms)
    S = 1024
    w = word("MC", FONT_B, 0.30 * S, -20)
    x = (S - w["width"]) / 2
    return svg(S, S, f'<path transform="translate({x:.2f},{S / 2 + 0.15 * S:.2f})" fill="{fg}" d="{w["d"]}"/>', bg)

files = {
    "A-horizontal.svg": concept_a("blue", GRAY, WHITE),
    "A-stacked.svg": concept_a_stacked("blue", GRAY, WHITE),
    "A-reversed-dark.svg": concept_a("white", WHITE, GRAY),
    "A-mono-black.svg": concept_a("black", BLACK, WHITE),
    "A-app-icon.svg": icon_a(BLUE, WHITE),
    "A-horizontal-tight.svg": concept_a("blue", GRAY, None, m=4),
    "B-horizontal-tight.svg": concept_b(BLUE, BLUE, "gray80", None, m=4),
    "B-reversed-tight.svg": concept_b(WHITE, WHITE, "white", None, m=4),
    "B-horizontal.svg": concept_b(BLUE, BLUE, "gray80", WHITE),
    "B-reversed-dark.svg": concept_b(WHITE, WHITE, "white", GRAY),
    "B-mono-black.svg": concept_b(BLACK, BLACK, "black", WHITE),
    "B-app-icon.svg": icon_b(BLUE, WHITE),
    "B-app-icon-light.svg": icon_b(WHITE, BLUE),
}
for k, v in files.items():
    save(k, v)

# ---------- Review sheet ----------
def b64(p):
    return "data:image/svg+xml;base64," + base64.b64encode(open(p, "rb").read()).decode()
cur = "data:image/png;base64," + base64.b64encode(open(LOGO + "/assets/current-lockup.png", "rb").read()).decode()
F = {k: b64(f"{OUT}/{k}") for k in files}

def icons(k):
    return "".join(f'<img src="{F[k]}" style="width:{s}px;height:{s}px;border-radius:{s*0.2237:.0f}px">' for s in (180, 60, 40, 29))

def header(k, dark=False):
    bg = GRAY if dark else WHITE
    return f'<div class="bar" style="background:{bg}"><img src="{F[k]}" style="height:30px"></div>'

html = f"""<!doctype html><meta charset="utf-8"><style>
body{{font:14px/1.4 -apple-system,Helvetica,Arial,sans-serif;margin:0;padding:32px;background:#F2F4F7;color:#1a2330;width:1336px}}
h1{{font-size:22px;margin:0 0 4px}} h2{{font-size:16px;margin:28px 0 10px}} .note{{color:#556;margin:0 0 18px}}
.row{{display:flex;gap:24px;align-items:center;flex-wrap:wrap;margin-bottom:14px}}
.card{{background:#fff;padding:20px;border-radius:8px;border:1px solid #dde2e8}}
.dark{{background:{GRAY}}} .lab{{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#667;margin-bottom:8px}}
.bar{{width:375px;height:56px;display:flex;align-items:center;padding:0 16px;box-sizing:border-box;border:1px solid #dde2e8}}
</style>
<h1>UTSW MyCare – logo modernization concepts (draft for CMPA review)</h1>
<p class="note">"UTSW" art is a placeholder taken from the current lockup and must be replaced with CMPA master vector art. Colors: UT Southwestern Blue #004278; gray #333333 (80% black, screen value assumed).</p>
<div class="row"><div class="card"><div class="lab">Current</div><img src="{cur}" style="height:70px"></div></div>
<h2>A – Refined lockup</h2>
<div class="row"><div class="card"><img src="{F['A-horizontal.svg']}" style="width:600px"></div>
<div class="card"><img src="{F['A-stacked.svg']}" style="width:260px"></div></div>
<div class="row"><div class="card dark"><img src="{F['A-reversed-dark.svg']}" style="width:300px"></div>
<div class="card"><img src="{F['A-mono-black.svg']}" style="width:300px"></div>
<div class="card"><div class="lab">187 px</div><img src="{F['A-horizontal-tight.svg']}" style="width:187px"></div></div>
<div class="row">{icons('A-app-icon.svg')} {header('A-horizontal-tight.svg')}</div>
<h2>B – MyCare-led with care ring symbol</h2>
<div class="row"><div class="card"><img src="{F['B-horizontal.svg']}" style="width:600px"></div>
<div class="card dark"><img src="{F['B-reversed-dark.svg']}" style="width:300px"></div></div>
<div class="row"><div class="card"><img src="{F['B-mono-black.svg']}" style="width:300px"></div>
<div class="card"><div class="lab">187 px</div><img src="{F['B-horizontal-tight.svg']}" style="width:187px"></div></div>
<div class="row">{icons('B-app-icon.svg')} {icons('B-app-icon-light.svg')}</div>
<div class="row">{header('B-horizontal-tight.svg')} {header('B-reversed-tight.svg', True)}</div>
"""
open(f"{OUT}/review.html", "w").write(html)
print("built", len(files), "files")
