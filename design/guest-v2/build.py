"""Build guest-flow.html from guest-flow.src.html and guest-flow.src.js.

- Inlines the UTSW MyCare logo SVGs from ../../mycare-logo unchanged (never redrawn).
- Inlines the Material Symbols Rounded icons listed in ../icons/manifest.json from ../icons/svg
  (run ../fetch_icons.py first if the manifest changed).
"""
import json
import re
from pathlib import Path

here = Path(__file__).parent
icons_dir = here.parent / "icons"
logos = here.parent.parent / "mycare-logo"


def logo(name):
    return (logos / name).read_text().strip().replace("<svg ", '<svg aria-hidden="true" focusable="false" ', 1)


def icons():
    manifest = json.loads((icons_dir / "manifest.json").read_text())
    data = {}
    for name, keys in manifest["glyphs"].items():
        for key in keys:
            svg = (icons_dir / "svg" / f"{name}--{key}.svg").read_text()
            paths = re.findall(r' d="([^"]+)"', svg)
            assert len(paths) == 1, f"{name}--{key}: expected one path, found {len(paths)}"
            data.setdefault(name, {})[key] = paths[0]
    return json.dumps(data, separators=(",", ":"))


src = (here / "guest-flow.src.html").read_text()
js = (here / "guest-flow.src.js").read_text()
assert "<!--SCRIPT-->" in src and "/*ICONS*/{}" in js and "`" not in logo("reversed.svg")
src = src.replace("<!--SCRIPT-->", "<script>\n" + js + "</script>")
out = (src.replace("<!--LOGO_REVERSED-->", logo("reversed.svg"))
          .replace("<!--APP_ICON-->", logo("icon.svg"))
          .replace("/*ICONS*/{}", icons()))
(here / "guest-flow.html").write_text(out)
print("wrote", here / "guest-flow.html", len(out), "bytes")
