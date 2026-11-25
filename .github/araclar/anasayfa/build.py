#!/usr/bin/env python3
"""Yeni ana sayfayı kurar: eski index.html'den korunacak parçaları (head meta, menü, SSS, fiyat listesi,
haftalık video kartı, çerez bandı, alt bilgi) birebir alır; yeni gövde, stil ve betikle birleştirir."""
import re, json, sys, math, html

REPO = sys.argv[1]
OLD = sys.argv[2]          # eski index.html (main'deki hâl)
SRC = sys.argv[3]          # src klasörü
old = open(OLD, encoding="utf-8").read()
rd = lambda p: open(p, encoding="utf-8").read()

def rel(s):
    """Kök-mutlak iç bağlantıları göreli yap (kökte duran sayfa için aynı adres; dal önizlemesinde de çalışır)."""
    s = re.sub(r'(href|src)="/(?!/)([^"]+)"', r'\1="\2"', s)
    s = re.sub(r'srcset="([^"]+)"', lambda m: 'srcset="' + re.sub(r'(^|,\s*)/', r'\1', m.group(1)) + '"', s)
    return s

def between(a, b, src=old, inc_b=False):
    i = src.index(a); j = src.index(b, i)
    return src[i:j + (len(b) if inc_b else 0)]

# ---------- head ----------
head = old[:old.index("</head>")]
styles = list(re.finditer(r"<style([^>]*)>.*?</style>\s*", head, flags=re.S))
assert len(styles) == 4, len(styles)
keep = {'id="am-kritik"', 'id="ay-cerez-kritik"'}
new_css = rd(SRC + "/style.css")
new_css_min = re.sub(r"/\*.*?\*/", "", new_css, flags=re.S)
new_css_min = re.sub(r"\s*\n\s*", "", new_css_min)
new_css_min = re.sub(r"\s*([{};,>])\s*", r"\1", new_css_min).replace(";}", "}")
# Başlık yazı tipi sayfanın içine gömülür: ilk çizimde hazır olur, sonradan yazı tipi değişimi (ve geç yerleşim işi) olmaz
import base64 as _b64
assert new_css_min.count("AYFONTVERI") == 1
new_css_min = new_css_min.replace("AYFONTVERI", "data:font/woff2;base64," + _b64.b64encode(open(REPO + "/ay-fraunces.woff2", "rb").read()).decode())
first = True
def repl(m):
    global first
    if m.group(1).strip() in keep:
        return m.group(0)
    if first:
        first = False
        return ('<script>(function(d){var c="js";try{if(localStorage.getItem("ay_cerez_bilgi_v1")!=="1")c+=" cz"}catch(e){c+=" cz"}d.className=c})(document.documentElement)</script>\n'
                "<style>" + new_css_min + "</style>\n")
    return ""
head2 = re.sub(r"<style([^>]*)>.*?</style>\s*", repl, head, flags=re.S)

# ---------- korunacak gövde parçaları ----------
menu = between('<div id="astro-menu">', "<main>").rstrip()
yv = rel(between("<!-- ✦ YENİ VİDEO", '<section class="section-block" id="burc-yorumlari">').rstrip())
fliste = rel(re.search(r'<ul class="fl-liste">.*?</ul>', old, flags=re.S).group(0))
flalt = rel(re.search(r'<p class="fl-alt">.*?</p>', old, flags=re.S).group(0))
faq = rel(re.search(r'<div class="faq">.*?</div>\s*(?=<div class="disclaimer">)', old, flags=re.S).group(0).rstrip())
disc = re.search(r'<div class="disclaimer">.*?</div>', old, flags=re.S).group(0)
_ft = re.search(r"<footer>.*?</footer>", old, flags=re.S).group(0)
igsvg = re.search(r"<svg.*?</svg>", _ft, flags=re.S).group(0).replace("<svg", '<svg aria-hidden="true"', 1)
eski_linkler = set(re.findall(r'href="/?([a-z0-9-]+\.html)"', _ft))
cerez = re.search(r'<div id="ay-cerez".*?</script>', old, flags=re.S).group(0)
k = old.index('id="daily-promo"')
uyejs = re.search(r"<script>.*?</script>", old[k:], flags=re.S).group(0)
uyejs = uyejs.replace('"✦ Kozmik Panelime git"', '"Kozmik Panelime git"').replace('"/panelim.html"', '"panelim.html"').replace('href="/gunluk-yorumum.html"', 'href="gunluk-yorumum.html"')
uyejs = re.sub(r"\n\s+", "\n", uyejs)

# ---------- kart ayrıntıları (eski sayfadaki metinlerle birebir) ----------
ek = json.loads(re.search(r"const EK = (\{.*?\});\n", old, flags=re.S).group(1))
pg = re.search(r'const PG = "([^"]+)";', old).group(1)
for m in re.finditer(r'(pusula_\w+):\{\s*g:PG,\s*k:"((?:[^"\\]|\\.)*)"\s*\}', old):
    ek[m.group(1)] = {"g": pg, "k": json.loads('"' + m.group(2) + '"')}
assert len(ek) == 24, len(ek)
for v in ek.values():
    if "o" in v: assert not v["o"].startswith("/")

# ---------- blog: Yıldız Günlüğü'nden gerçek başlık, tarih, süre ----------
hub = rd(REPO + "/yildiz-gunlugu.html")
hubm = hub[hub.index("<h1"):]
txt = lambda x: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip()
posts = {}
for m in re.finditer(r'<a[^>]*href="/?([a-z0-9-]+\.html)"[^>]*>(.*?)</a>', hubm, flags=re.S):
    inner = m.group(2)
    h = re.search(r"<h[23][^>]*>(.*?)</h[23]>", inner, flags=re.S)
    if not h: continue
    meta = re.search(r'(\d{1,2} [A-Za-zÇĞİÖŞÜçğıöşü]+ \d{4})(?:\s*·\s*(\d+ dk okuma))?', txt(inner))
    posts[m.group(1)] = (txt(h.group(1)), meta.group(1) if meta else "", (meta.group(2) or "") if meta else "")
secim = ["sekt-gunduz-gece-haritasi.html", "2027-burc-yorumlari.html", "yukselen-burc-nedir.html",
         "dogum-saati-nasil-ogrenilir.html", "kader-matrisi-nedir.html", "neden-hep-ayni-tip-insana-asik-oluyorum.html"]
yg = ""
for s in secim:
    t, d, o = posts[s]
    yg += '<a href="%s"><small>%s</small><b>%s</b></a>' % (s, d + (" · " + o if o else ""), html.escape(t, quote=False))
kats = re.findall(r'<a[^>]*href="#([a-z-]+)"[^>]*>(.*?)</a>', hubm[:hubm.index("<h2")], flags=re.S)
kt = ""
for kid, inner in kats:
    t = txt(inner); mm = re.match(r"(.*?)\s*(\d+)$", t)
    kt += '<a href="yildiz-gunlugu.html#%s">%s<small>%s</small></a>' % (kid, html.escape(mm.group(1), quote=False), mm.group(2))
yazi = len(posts)
assert sum(int(re.match(r".*?(\d+)$", txt(i)).group(1)) for _, i in kats) == yazi, (yazi, kats)

# ---------- simgeler ve burç çarkı ----------
gl = json.load(open(SRC + "/../out/glyphs.json"))
sym = "".join('<symbol id="g-%s" viewBox="0 0 100 100"><path d="%s"/></symbol>' % (k2, v) for k2, v in gl.items())
SLUG = ["koc", "boga", "ikizler", "yengec", "aslan", "basak", "terazi", "akrep", "yay", "oglak", "kova", "balik"]
AD = ["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"]
TRH = ["21 Mar – 19 Nis", "20 Nis – 20 May", "21 May – 20 Haz", "21 Haz – 22 Tem", "23 Tem – 22 Ağu", "23 Ağu – 22 Eyl",
       "23 Eyl – 22 Eki", "23 Eki – 21 Kas", "22 Kas – 21 Ara", "22 Ara – 19 Oca", "20 Oca – 18 Şub", "19 Şub – 20 Mar"]
def xy(r, a):
    q = math.radians(a); return (-r * math.cos(q), r * math.sin(q))
d = ""
for a in range(0, 360, 5):
    r0 = 150 if a % 30 == 0 else (181 if a % 10 == 0 else 185)
    x0, y0 = xy(r0, a); x1, y1 = xy(190, a)
    d += "M%.1f %.1fL%.1f %.1f" % (x0, y0, x1, y1)
zod = '<path class="gk-t" stroke-width=".8" fill="none" d="%s"/>' % d
for i, s in enumerate(SLUG):
    x, y = xy(168, i * 30 + 15)
    zod += '<use class="gk-g" href="#g-%s" x="%.1f" y="%.1f" width="19" height="19"/>' % (s, x - 9.5, y - 9.5)
bz = "".join('<a href="%s-burcu.html"><svg aria-hidden="true"><use href="#g-%s"/></svg><b>%s</b><span>%s</span></a>' % (s, s, AD[i], TRH[i]) for i, s in enumerate(SLUG))

# ---------- betik ----------
app = rd(SRC + "/app.js").replace("{{EK}}", json.dumps(ek, ensure_ascii=False, separators=(",", ":")))

body = rd(SRC + "/body.html")
for key, val in {"MENU": menu, "YV": yv, "FLISTE": fliste, "FLALT": flalt, "FAQ": faq, "DISC": disc, "IGSVG": igsvg,
                 "CEREZ": cerez, "UYEJS": uyejs, "ZOD": zod, "BZ": bz, "YG": yg, "KT": kt, "SYM": sym,
                 "YAZI": str(yazi), "APPJS": app}.items():
    assert "{{" + key + "}}" in body, key
    body = body.replace("{{" + key + "}}", val)
assert "{{" not in body.replace("{{EK}}", ""), re.findall(r"\{\{\w+\}\}", body)

yeni_ft = body[body.index('<footer class="ft">'):body.index("</footer>")]
assert eski_linkler <= set(re.findall(r'href="([a-z0-9-]+\.html)"', yeni_ft)), eski_linkler - set(re.findall(r'href="([a-z0-9-]+\.html)"', yeni_ft))
out = head2 + "</head>\n<body>\n" + body
open(REPO + "/index.html", "w", encoding="utf-8").write(out)
print("yazıldı:", len(out.encode()), "bayt | yazı:", yazi, "| kategoriler:", [(a, txt(b)) for a, b in kats])
for s in secim: print("  ", posts[s])
