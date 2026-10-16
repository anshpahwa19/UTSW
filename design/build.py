"""Build home-screen.html from home-screen.src.html.

- Inlines the UTSW MyCare logo SVGs from ../mycare-logo unchanged (never redrawn).
- Inlines the Material Symbols Rounded icons listed in icons/manifest.json from icons/svg
  (run fetch_icons.py first if the manifest changed).
"""
import json
import re
from pathlib import Path

here = Path(__file__).parent
logos = here.parent / "mycare-logo"


def logo(name):
    return (logos / name).read_text().strip().replace("<svg ", '<svg aria-hidden="true" focusable="false" ', 1)


def icons():
    manifest = json.loads((here / "icons" / "manifest.json").read_text())
    data = {}
    for name, keys in manifest["glyphs"].items():
        for key in keys:
            svg = (here / "icons" / "svg" / f"{name}--{key}.svg").read_text()
            paths = re.findall(r' d="([^"]+)"', svg)
            assert len(paths) == 1, f"{name}--{key}: expected one path, found {len(paths)}"
            data.setdefault(name, {})[key] = paths[0]
    return json.dumps(data, separators=(",", ":"))


src = (here / "home-screen.src.html").read_text()
assert "/*ICONS*/{}" in src
out = (src.replace("<!--LOGO_REVERSED-->", logo("reversed.svg"))
          .replace("<!--APP_ICON-->", logo("icon.svg"))
          .replace("/*ICONS*/{}", icons()))
(here / "home-screen.html").write_text(out)
print("wrote", here / "home-screen.html", len(out), "bytes")
