"""Render an in-use mockup for one MyCare iteration.

    python3 logo-iterations/mockup.py <iteration-folder> <out.png>

Shows the app icon on a phone home screen, the launch screen, the in-app
header, and a browser tab with the favicon. The logo files are embedded as
<img> SVGs exactly as delivered; everything else is neutral placeholder UI.
"""
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SHOT = r"""
const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const [inp, out, w, h] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 2 });
  await p.goto('file://' + inp); await p.waitForTimeout(300);
  await p.screenshot({ path: out }); await b.close();
})();
"""

PLACEHOLDER_TILES = ["#E9EDF2", "#DCE3EA", "#E4E9EE", "#D7DEE6", "#E1E6EC", "#DDE3E9", "#E6EAEF", "#D9E0E7",
                     "#E2E7ED", "#DEE4EA", "#E8ECF1", "#DAE1E8", "#E3E8EE", "#DFE5EB", "#E5E9EE"]


def html(folder, name):
    f = lambda n: "file://" + os.path.join(folder, n)
    icons = []
    k = 0
    for i in range(16):
        if i == 5:
            icons.append(f'<div class="app"><img class="ic" src="{f("app-icon.svg")}"><span>MyCare</span></div>')
        else:
            icons.append(f'<div class="app"><div class="ic ph" style="background:{PLACEHOLDER_TILES[k % len(PLACEHOLDER_TILES)]}"></div><span>&#160;</span></div>')
            k += 1
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:1664px;height:760px;background:#EEF2F6;font-family:Inter, sans-serif;display:flex;gap:32px;align-items:center;justify-content:center;padding:40px}}
.phone{{width:290px;height:620px;border-radius:48px;background:#0E1116;padding:12px;box-shadow:0 20px 50px rgba(0,30,60,.18);flex:none}}
.screen{{width:100%;height:100%;border-radius:38px;overflow:hidden;position:relative}}
.status{{height:44px;display:flex;justify-content:space-between;align-items:center;padding:0 26px;font-size:14px;font-weight:600}}
.home{{background:linear-gradient(160deg,#3B6E9C 0%,#1D3F63 55%,#0F2741 100%);color:#fff}}
.grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:20px 0;padding:18px 8px 0}}
.app{{display:flex;flex-direction:column;align-items:center;gap:6px}}
.app .ic{{width:56px;height:56px;border-radius:13px;display:block}}
.app .ph{{opacity:.28}}
.app span{{font-size:11px;color:#fff;font-weight:500;letter-spacing:.1px}}
.dock{{position:absolute;left:10px;right:10px;bottom:10px;height:80px;border-radius:30px;background:rgba(255,255,255,.18);display:flex;justify-content:space-around;align-items:center}}
.dock div{{width:56px;height:56px;border-radius:13px;background:rgba(255,255,255,.28)}}
.launch{{background:#004278;display:flex;flex-direction:column;align-items:center;justify-content:center}}
.launch img{{width:170px}}
.app-ui{{background:#F7F8FA}}
.bar{{background:#fff;height:100px;padding:44px 20px 0;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #E3E8EE}}
.bar img{{height:30px}}
.avatar{{width:30px;height:30px;border-radius:50%;background:#D5DDE5}}
.hello{{padding:22px 20px 10px;font-size:22px;font-weight:700;color:#004278}}
.card{{margin:10px 16px;background:#fff;border:1px solid #E3E8EE;border-radius:16px;padding:16px}}
.card .t{{font-size:13px;font-weight:600;color:#5B6770;text-transform:uppercase;letter-spacing:.6px}}
.card .v{{font-size:17px;font-weight:600;color:#1F2A33;margin-top:6px}}
.card .s{{font-size:14px;color:#5B6770;margin-top:4px}}
.btn{{margin-top:12px;height:40px;border-radius:20px;background:#004278;color:#fff;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center}}
.browser{{width:620px;height:420px;border-radius:14px;background:#fff;box-shadow:0 20px 50px rgba(0,30,60,.14);overflow:hidden;flex:none;align-self:center}}
.tabs{{height:44px;background:#DEE3E9;display:flex;align-items:end;padding:0 10px;gap:6px}}
.tab{{height:36px;border-radius:10px 10px 0 0;padding:0 14px;display:flex;align-items:center;gap:8px;font-size:13px;color:#333;white-space:nowrap}}
.tab.on{{background:#fff}}
.tab img{{width:16px;height:16px}}
.tab .ph{{width:16px;height:16px;border-radius:4px;background:#B9C3CD}}
.url{{height:40px;border-bottom:1px solid #E3E8EE;display:flex;align-items:center;padding:0 14px}}
.url div{{height:26px;border-radius:13px;background:#F1F4F7;flex:1;font-size:12px;color:#5B6770;display:flex;align-items:center;padding:0 12px}}
.site{{padding:18px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #EEF1F4}}
.site img{{height:34px}}
.site .nav{{display:flex;gap:16px;font-size:13px;color:#5B6770}}
.hero{{margin:22px 24px;border-radius:14px;background:#EBF0F5;height:200px;padding:26px;display:flex;flex-direction:column;justify-content:end;gap:10px}}
.hero .h{{font-size:24px;font-weight:700;color:#004278;width:330px;line-height:1.2}}
.hero .b{{width:150px;height:36px;border-radius:18px;background:#004278}}
</style></head><body>
<div class="phone"><div class="screen home"><div class="status"><span>9:41</span><span>&#9679;&#9679;&#9679;</span></div>
<div class="grid">{''.join(icons)}</div><div class="dock"><div></div><div></div><div></div><div></div></div></div></div>
<div class="phone"><div class="screen launch"><img src="{f("reversed-stacked.svg")}" alt=""></div></div>
<div class="phone"><div class="screen app-ui"><div class="bar"><img src="{f("horizontal.svg")}" alt=""><div class="avatar"></div></div>
<div class="hello">Good morning, Alex</div>
<div class="card"><div class="t">Next appointment</div><div class="v">Tue, Oct 21 · 9:30 a.m.</div><div class="s">Primary care · Clements University Hospital</div><div class="btn">Check in</div></div>
<div class="card"><div class="t">Messages</div><div class="v">1 new message from your care team</div></div>
<div class="card"><div class="t">Test results</div><div class="v">Lab results are ready</div></div>
</div></div>
<div class="browser"><div class="tabs"><div class="tab on"><img src="{f("favicon.svg")}" alt="">MyCare | UT Southwestern</div><div class="tab"><div class="ph"></div>New tab</div></div>
<div class="url"><div>mycare.utsouthwestern.edu</div></div>
<div class="site"><img src="{f("horizontal.svg")}" alt=""><div class="nav"><span>Appointments</span><span>Messages</span><span>Results</span></div></div>
<div class="hero"><div class="h">Your care, all in one place</div><div class="b"></div></div>
</div>
</body></html>"""


def render(folder, out):
    folder = os.path.abspath(folder)
    with tempfile.TemporaryDirectory() as td:
        h = os.path.join(td, "m.html")
        js = os.path.join(td, "shot.js")
        open(h, "w").write(html(folder, os.path.basename(folder)))
        open(js, "w").write(SHOT)
        subprocess.run(["node", js, h, os.path.abspath(out), "1664", "760"], check=True)


if __name__ == "__main__":
    render(sys.argv[1], sys.argv[2])
