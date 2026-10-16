import base64,pathlib
root=pathlib.Path(__file__).parent
s=(root/'src.html').read_text()
def uri(f): return 'data:image/svg+xml;base64,'+base64.b64encode((root.parent/'mycare-logo'/f).read_bytes()).decode()
s=s.replace('{{LOGO}}',uri('horizontal.svg')).replace('{{ICON}}',uri('icon.svg'))
(root/'mycare-guest-grey.html').write_text(s)
print(len(s))
