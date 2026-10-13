"""Build mycare-playful-home.html from src.html.

- Inlines the MyCare horizontal logo as a data URI (the logo file itself is never edited).
- Derives the Material Symbols subset (icon_names) from ICON_MAP plus the EXTRA_GLYPHS comment,
  and fails if any static glyph in the page is missing from that subset or if a glyph is mapped twice.
"""
import base64
import pathlib
import re

here = pathlib.Path(__file__).resolve().parent
src = (here / "src.html").read_text(encoding="utf-8")

block = src[src.index("const ICON_MAP = ["):]
block = block[: block.index("];")]
app = re.findall(r"\['\w+', '([a-z0-9_]+)'", block)
assert len(app) == len(set(app)), "a glyph is mapped to two concepts"

extra = re.search(r"EXTRA_GLYPHS: ([a-z0-9_ ]+)\*/", src).group(1).split()
names = sorted(set(app) | set(extra))

static = set(re.findall(r'class="ms[^"]*"[^>]*>([a-z0-9_]+)<', src))
missing = static - set(names)
assert not missing, f"glyphs used in the page but missing from the subset: {sorted(missing)}"

logo = base64.b64encode((here.parent.parent / "mycare-logo" / "horizontal.svg").read_bytes()).decode()
out = (
    src.replace("__ICON_NAMES__", ",".join(names))
    .replace("__LOGO__", logo)
    .replace("__APP_GLYPHS__", str(len(app)))
)
(here / "mycare-playful-home.html").write_text(out, encoding="utf-8")
print(f"{len(app)} app glyphs, {len(names)} glyphs in the font subset")
