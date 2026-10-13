"""Download the Material Symbols Rounded SVGs listed in icons/manifest.json from Google Fonts.

Run once when the manifest changes; the SVGs are committed, so build.py needs no network.
"""
import json, re, urllib.request
from pathlib import Path

here = Path(__file__).parent / "icons"
manifest = json.loads((here / "manifest.json").read_text())
out = here / "svg"
out.mkdir(exist_ok=True)
base = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded"
for name, keys in manifest["glyphs"].items():
    for key in keys:
        v = manifest["variants"][key]
        url = f"{base}/{name}/{v['style']}/{v['opsz']}px.svg"
        svg = urllib.request.urlopen(url, timeout=30).read().decode()
        assert re.search(r' d="', svg), url
        (out / f"{name}--{key}.svg").write_text(svg)
wanted = {f"{n}--{k}.svg" for n, keys in manifest["glyphs"].items() for k in keys}
for stale in out.glob("*.svg"):
    if stale.name not in wanted:
        stale.unlink()
print("fetched", sum(len(k) for k in manifest["glyphs"].values()), "files into", out)
