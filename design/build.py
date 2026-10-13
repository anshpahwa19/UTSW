"""Inline the UTSW MyCare logo SVGs into the prototype (the logo files are used as-is, never redrawn)."""
from pathlib import Path
here = Path(__file__).parent
logos = here.parent / "mycare-logo"
def svg(name):
    return (logos / name).read_text().strip().replace("<svg ", '<svg aria-hidden="true" focusable="false" ', 1)
src = (here / "home-screen.src.html").read_text()
out = src.replace("<!--LOGO_REVERSED-->", svg("reversed.svg")).replace("<!--APP_ICON-->", svg("icon.svg"))
(here / "home-screen.html").write_text(out)
print("wrote", here / "home-screen.html", len(out), "bytes")
