"""Vector geometry helpers for the MyCare marks.

Shapes are shapely geometries. SVG path data (including outlined Inter glyphs)
is flattened to polygons with a tight tolerance, so boolean operations,
offsets, and corner rounding are robust. Output is SVG path data with 2-decimal
coordinates; curve flattening is fine enough (sagitta < 0.01 units on a
100-unit symbol) that the result is indistinguishable from Béziers even on a
1024 px app icon.
"""
import math

from shapely import affinity
from shapely.geometry import LineString, MultiPolygon, Point, Polygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union
from svgpathtools import parse_path

RES = 48  # buffer quad segments (points per quarter circle) for large radii
TOL = 0.035  # output simplification tolerance in user units


def num(v):
    s = ("%.2f" % v).rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


# ---------------------------------------------------------------- input

def _flatten(seg, tol=0.05):
    """Sample a segment into points with roughly constant chord error."""
    L = seg.length(error=1e-3) if hasattr(seg, "length") else 1
    n = max(2, int(math.sqrt(L / tol) * 0.6) + 1)
    if seg.__class__.__name__ == "Line":
        n = 2
    return [seg.point(i / (n - 1)) for i in range(n)]


def from_svg(d):
    """SVG path data (non-zero fill, any contours) -> shapely geometry."""
    path = parse_path(d)
    rings, cur = [], []
    for sub in path.continuous_subpaths():
        pts = []
        for seg in sub:
            ps = _flatten(seg)
            if pts:
                ps = ps[1:]
            pts.extend(ps)
        if len(pts) >= 3:
            rings.append([(p.real, p.imag) for p in pts])
    return _nonzero(rings)


def _nonzero(rings):
    """Combine rings with non-zero winding (outer contours one direction, counters the other)."""
    polys = [Polygon(r).buffer(0) for r in rings]
    signed = []
    for r, p in zip(rings, polys):
        a = 0
        for (x1, y1), (x2, y2) in zip(r, r[1:] + r[:1]):
            a += x1 * y2 - x2 * y1
        signed.append((a, p))
    if not signed:
        return Polygon()
    # The dominant orientation is "fill"; the opposite orientation is "hole".
    big = max(signed, key=lambda t: abs(t[0]))
    fill_sign = 1 if big[0] > 0 else -1
    fills = unary_union([p for a, p in signed if a * fill_sign > 0])
    holes = unary_union([p for a, p in signed if a * fill_sign < 0])
    return fills.difference(holes)


# ---------------------------------------------------------------- output

def to_svg(geom):
    """shapely geometry -> SVG path data (polygons with holes, non-zero safe)."""
    if geom.is_empty:
        return ""
    polys = [geom] if isinstance(geom, Polygon) else [g for g in getattr(geom, "geoms", []) if isinstance(g, Polygon)]
    out = []
    for p in polys:
        p = orient(p.simplify(TOL, preserve_topology=True), 1.0)
        for ring in [p.exterior] + list(p.interiors):
            cs = list(ring.coords)[:-1]
            out.append("M" + num(cs[0][0]) + " " + num(cs[0][1]) +
                       "".join("L" + num(x) + " " + num(y) for x, y in cs[1:]) + "Z")
    return "".join(out)


# ---------------------------------------------------------------- operations

def union(*gs):
    return unary_union([g for g in gs if g is not None and not g.is_empty])


def diff(a, *bs):
    for b in bs:
        a = a.difference(b)
    return a


def inter(a, b):
    return a.intersection(b)


def _segs(d):
    """Points per quarter circle, scaled to the radius (small fillets need few points)."""
    return max(5, min(RES, int(abs(d) * 2.5)))


def grow(g, d):
    return g.buffer(d, quad_segs=_segs(d), join_style="round")


def shrink(g, d):
    return g.buffer(-d, quad_segs=_segs(d), join_style="round")


def round_convex(g, r):
    """Round outside corners with radius r (opening)."""
    return grow(shrink(g, r), r)


def round_concave(g, r):
    """Fillet inside corners with radius r (closing)."""
    return shrink(grow(g, r), r)


def soften(g, r_out=0, r_in=0):
    if r_out:
        g = round_convex(g, r_out)
    if r_in:
        g = round_concave(g, r_in)
    return g


def cut(a, b, gap):
    """a minus b grown by gap: a clean channel between overlapping shapes."""
    return a.difference(grow(b, gap))


def stroke(line, width, cap="round", join="round"):
    caps = {"round": "round", "butt": "flat", "square": "square"}
    return line.buffer(width / 2, quad_segs=RES, cap_style=caps[cap], join_style=join)


def move(g, dx=0, dy=0):
    return affinity.translate(g, dx, dy)


def scale(g, sx, sy=None, origin=(0, 0)):
    return affinity.scale(g, sx, sy if sy is not None else sx, origin=origin)


def rotate(g, deg, origin=(50, 50)):
    return affinity.rotate(g, deg, origin=origin)


def mirror_x(g, cx=50):
    return affinity.scale(g, -1, 1, origin=(cx, 0))


# ---------------------------------------------------------------- primitives

def circle(cx, cy, r):
    return Point(cx, cy).buffer(r, quad_segs=RES * 2)


def ellipse(cx, cy, rx, ry):
    return affinity.scale(circle(0, 0, 1), rx, ry).pipe(lambda g: move(g, cx, cy)) if False else move(affinity.scale(circle(0, 0, 1), rx, ry, origin=(0, 0)), cx, cy)


def rect(x, y, w, h, r=0):
    if r <= 0:
        return Polygon([(x, y), (x + w, y), (x + w, y + h), (x, y + h)])
    r = min(r, w / 2, h / 2)
    x0, y0, x1, y1 = x + r, y + r, x + w - r, y + h - r
    if x1 - x0 < 1e-9 and y1 - y0 < 1e-9:
        core = Point(x0, y0)
    elif x1 - x0 < 1e-9 or y1 - y0 < 1e-9:
        core = LineString([(x0, y0), (x1, y1)])
    else:
        core = Polygon([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])
    return core.buffer(r, quad_segs=RES)


def capsule(x1, y1, x2, y2, width):
    """Bar with round ends from point to point."""
    return stroke(LineString([(x1, y1), (x2, y2)]), width)


def squircle(x, y, w, h, n=5.0, steps=400):
    cx, cy, a, b = x + w / 2, y + h / 2, w / 2, h / 2
    pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        ct, st = math.cos(t), math.sin(t)
        pts.append((cx + a * math.copysign(abs(ct) ** (2 / n), ct), cy + b * math.copysign(abs(st) ** (2 / n), st)))
    return Polygon(pts)


def polygon(pts):
    return Polygon(pts)


def arc_line(cx, cy, r, a0, a1, steps=None):
    """Polyline along a circular arc from a0 to a1 degrees (SVG orientation: y down)."""
    n = steps or max(8, int(abs(a1 - a0) * 2))
    return LineString([(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
                        cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)])


def curve_line(d):
    """Open SVG path data -> LineString (for stroking)."""
    path = parse_path(d)
    pts = []
    for seg in path:
        ps = _flatten(seg)
        if pts:
            ps = ps[1:]
        pts.extend(ps)
    return LineString([(p.real, p.imag) for p in pts])


def shape(d):
    """Closed SVG path data -> geometry."""
    return from_svg(d)


def bbox(g):
    return g.bounds
