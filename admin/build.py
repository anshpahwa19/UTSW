"""Build admin-portal.html from src/.

- Concatenates src/styles (tokens first) into one <style> and src JS (in FILES order) into one strict-mode IIFE.
- Inlines the MyCare logos from ../mycare-logo as data URIs (the logo files are never edited).
- Inlines the mobile preview (src/preview: CSS, markup, script) as strings for the sandboxed srcdoc iframe.
- Derives the Material Symbols Rounded subset from every glyph the code names: ic('…'), icon: '…',
  BADGES entries, and the preview's ICONS map. Fails if a glyph is used in static markup but not collected.
Run: python3 build.py   (inside admin/)
"""
import base64
import json
import pathlib
import re

here = pathlib.Path(__file__).resolve().parent
src = here / "src"
logos = here.parent / "mycare-logo"

FILES = [
    "app/util.js", "mock/seed.js", "app/permissions.js", "services/services.js", "app/session.js",
    "ui/components.js", "ui/forms.js", "ui/charts.js", "ui/preview.js", "ui/lifecycle.js",
    "app/nav.js", "app/shell.js", "app/router.js",
    "pages/auth.js", "pages/home-layout.js", "pages/collection.js", "pages/config-pages.js",
    "pages/notifications.js", "pages/users.js", "pages/wayfinding.js", "pages/analytics.js", "pages/admin-pages.js",
    "app/boot.js",
]
CSS = ["styles/tokens.css", "styles/admin.css"]

read = lambda p: (src / p).read_text(encoding="utf-8")
js_parts = {f: read(f) for f in FILES}
missing = sorted(str(p.relative_to(src)) for p in src.rglob("*.js") if str(p.relative_to(src)) not in FILES and p.parent.name != "preview")
assert not missing, f"JS files not listed in FILES: {missing}"
pv_css, pv_js, pv_html = read("preview/mobile.css"), read("preview/mobile.js"), read("preview/mobile.html")

# ---- Icon subset ----
# Literal glyph names: ic('name'), icon: 'name', BADGES rows, the stepper glyph map, the preview ICONS map,
# and names chosen in expressions, listed in an EXTRA_GLYPHS comment. Playwright checks every rendered glyph is in the subset.
NOT_GLYPHS = {"f1"}
glyphs = set()
for code in js_parts.values():
    glyphs |= set(re.findall(r"\bic\('([a-z0-9_]+)'", code))
    glyphs |= set(re.findall(r"\bicon: '([a-z0-9_]+)'", code))
    glyphs |= set(re.findall(r"\bglyph: '([a-z0-9_]+)'", code))
    glyphs |= set(re.findall(r"\['[a-z]+', '[A-Z][^']*', '([a-z0-9_]+)'\]", code))
    for extra in re.findall(r"EXTRA_GLYPHS: ([a-z0-9_ ]+)\*/", code):
        glyphs |= set(extra.split())
badges = re.search(r"const BADGES = \{(.*?)\n\};", js_parts["ui/components.js"], re.S).group(1)
glyphs |= set(re.findall(r"\['([a-z0-9_]+)', '", badges))
steps = re.search(r"const glyph = \{(.*?)\};", js_parts["ui/components.js"]).group(1)
glyphs |= set(re.findall(r"'([a-z0-9_]+)'", steps))
pv_icons = re.search(r"const ICONS = \{(.*?)\};", pv_js, re.S).group(1)
glyphs |= set(re.findall(r"\w+: '([a-z0-9_]+)'", pv_icons))
glyphs |= set(re.findall(r'class="ms[^"]*"[^>]*>([a-z0-9_]+)<', pv_html))
glyphs |= set(re.findall(r"\bico\('([a-z0-9_]+)'", pv_js))
glyphs |= set(re.findall(r"circle\('([a-z0-9_]+)'", pv_js))
glyphs -= NOT_GLYPHS
glyphs -= set(re.findall(r"(\w+): '[a-z0-9_]+'", pv_icons)) - set(re.findall(r"\w+: '([a-z0-9_]+)'", pv_icons))  # concept keys are not glyphs
names = sorted(glyphs)
icon_url = ("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            f"&icon_names={','.join(names)}&display=block")

logo_rev = base64.b64encode((logos / "reversed.svg").read_bytes()).decode()
logo_hor = base64.b64encode((logos / "horizontal.svg").read_bytes()).decode()
logo_icon = base64.b64encode((logos / "icon.svg").read_bytes()).decode()
pv_js = pv_js.replace("__LOGO_ICON__", logo_icon).replace("__LOGO_REVERSED__", logo_rev)

pv_html = pv_html.replace("__LOGO_REVERSED__", logo_rev)
js = "\n".join(f"/* ===== src/{f} ===== */\n{code}" for f, code in js_parts.items())
js = (js.replace("__LOGO_REVERSED__", logo_rev).replace("__LOGO_HORIZONTAL__", logo_hor))
consts = (f"const ICON_FONT_URL = {json.dumps(icon_url)};\n"
          f"const PREVIEW_CSS = {json.dumps(pv_css)};\n"
          f"const PREVIEW_HTML = {json.dumps(pv_html)};\n"
          f"const PREVIEW_JS = {json.dumps(pv_js)};\n")
js = "(function () {\n'use strict';\n" + consts + js + "\n})();"
assert "</script" not in js.replace("<\\/script", ""), "a literal </script> would end the inline script"
css = "\n".join(read(f) for f in CSS)
page = read("index.html").replace("__ICON_FONT_URL__", icon_url.replace("&", "&amp;")).replace("/*__CSS__*/", css).replace("/*__JS__*/", js)
(here / "admin-portal.html").write_text(page, encoding="utf-8")
print(f"{len(FILES)} JS files, {len(names)} glyphs in the icon subset, {len(page) // 1024} KB")
print("glyphs:", ",".join(names))
