"""Astro Yuvam — iki dilli site kabuğu (menü, dil seçici, çerez bandı) için tek kaynak.

Türkçe sayfaların sabit menüsüne dil seçiciyi ekler ve İngilizce sayfaların ortak
parçalarını üretir. menu.js ile aynı HTML'i üretmelidir (ilk çizimde kayma olmasın).
Kullanım: python3 .i18n/chrome.py  (tüm Türkçe sayfalara ve üretici şablonlara uygular)
"""
import glob, json, os, re, sys

# Türkçe yol -> İngilizce yol (menu.js içindeki CEVIRI ile aynı tutulmalı)
CEVIRI = {
    "/": "/en/",
    "/dogum-haritasi-hesaplama.html": "/en/birth-chart-calculator.html",
    "/lilith-burcu-hesaplama.html": "/en/black-moon-lilith-calculator.html",
    "/ay-takvimi.html": "/en/moon-calendar.html",
    "/yasam-yolu.html": "/en/life-path-number-calculator.html",
    "/uyum-testi.html": "/en/zodiac-compatibility-test.html",
    "/gizlilik-kvkk.html": "/en/privacy.html",
}
TERS = {v: k for k, v in CEVIRI.items()}
SITE = "https://astroyuvam.com"

GLOBE = ('<svg class="am-globe" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">'
         '<circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.7"/>'
         '<path d="M2.8 12h18.4M12 2.8c2.5 2.6 3.8 5.7 3.8 9.2s-1.3 6.6-3.8 9.2M12 2.8C9.5 5.4 8.2 8.5 8.2 12s1.3 6.6 3.8 9.2" '
         'fill="none" stroke="currentColor" stroke-width="1.7"/></svg>')

CSS_EK = ('.am-globe{display:block;opacity:.9}.am-lang .am-drop-menu{min-width:150px}'
          '.am-drop-menu a[aria-current="true"]{color:#e7cf95;background:rgba(217,185,106,.08)}'
          '.ay-cerez-red{background:none;border:1px solid #4a3f6b;color:#f0e6d2;font:inherit;font-size:13.5px;'
          'padding:8px 20px;border-radius:20px;cursor:pointer}.ay-cerez-red:hover{border-color:#d9b96a}')
CSS_KANCA = '.am-cta:hover{background:rgba(217,185,106,.12);border-color:#d9b96a}'


def dil_html(en, tr_yol, en_yol):
    return ('<div class="am-dropdown am-lang">'
            '<button type="button" class="am-drop-btn" aria-haspopup="true" aria-expanded="false" aria-label="'
            + ('Language: English' if en else 'Dil: Türkçe') + '">' + GLOBE + ('EN' if en else 'TR')
            + ' <span class="am-caret">▾</span></button>'
            '<div class="am-drop-menu" role="menu">'
            '<a href="' + tr_yol + '" hreflang="tr" lang="tr" role="menuitem"' + ('' if en else ' aria-current="true"') + '>Türkçe</a>'
            '<a href="' + en_yol + '" hreflang="en" lang="en" role="menuitem"' + (' aria-current="true"' if en else '') + '>English</a>'
            '</div></div>')


ARACLAR_EN = [
    ("/en/birth-chart-calculator.html", "✦ Birth Chart Calculator", "Your free natal chart with houses &amp; aspects"),
    ("/en/black-moon-lilith-calculator.html", "✦ Black Moon Lilith Calculator", "Your Lilith sign, degree and house"),
    ("/en/moon-calendar.html", "✦ Moon Calendar", "Today's moon phase, full &amp; new moons"),
    ("/en/life-path-number-calculator.html", "✦ Life Path Number", "Numerology from your birth date"),
    ("/en/zodiac-compatibility-test.html", "✦ Zodiac Compatibility", "How well do your signs match?"),
]


def en_nav(en_yol):
    """İngilizce sayfanın sabit menüsü (menu.js EN çıktısıyla aynı yapı)."""
    simdi = en_yol.split("/")[-1] or "index.html"
    items = "".join(
        '<a href="%s" role="menuitem"%s>%s<span class="am-sub">%s</span></a>'
        % (h, ' aria-current="page"' if h.split("/")[-1] == simdi else "", a, alt)
        for h, a, alt in ARACLAR_EN)
    return ('<div id="astro-menu"><nav class="am-nav"><a class="am-brand" href="/en/">✦ ASTRO YUVAM</a><div class="am-links">'
            '<div class="am-dropdown"><button type="button" class="am-drop-btn" aria-haspopup="true" aria-expanded="false">'
            'Free Tools <span class="am-caret">▾</span></button><div class="am-drop-menu" role="menu">' + items + '</div></div>'
            '<a href="/en/moon-calendar.html">Moon Calendar</a>'
            '<a href="/en/birth-chart-calculator.html" class="am-cta">Birth Chart</a>'
            + dil_html(True, TERS.get(en_yol, "/"), en_yol) + '</div></nav></div>')


def hreflang(tr_yol, en_yol):
    return ('<link rel="alternate" hreflang="tr" href="%s%s">\n<link rel="alternate" hreflang="en" href="%s%s">\n'
            '<link rel="alternate" hreflang="x-default" href="%s%s">' % (SITE, tr_yol, SITE, en_yol, SITE, tr_yol))


EN_CEREZ_DIV = ('<div id="ay-cerez" class="ac-in" role="note" aria-label="Cookie notice"><div class="ay-cerez-in">'
                '<p class="ay-cerez-tx">With your permission, we use Google Analytics cookies to count visits anonymously and improve the site. '
                'See our <a href="/en/privacy.html">Privacy Policy</a>.</p><div class="ay-cerez-bt">'
                '<button type="button" class="ay-cerez-red">Decline</button><button type="button" class="ay-cerez-kabul">Accept</button>'
                '</div></div></div>\n<script>try{if(localStorage.getItem("ay_cerez_onay_v1")){var c=document.getElementById("ay-cerez");c.parentNode.removeChild(c);}}catch(e){}</script>')

TR_NAV_SON = 'class="am-cta">Raporlar</a></div></nav></div>'


def tr_yol_of(dosya):
    return "/" if dosya == "index.html" else "/" + dosya


def uygula_tr(kok="."):
    degisen = 0
    for f in sorted(glob.glob(os.path.join(kok, "*.html")) + glob.glob(os.path.join(kok, "*/*.html"))):
        rel = os.path.relpath(f, kok)
        if rel.startswith("en/"):
            continue
        s = open(f, encoding="utf-8").read()
        if 'class="am-dropdown am-lang"' in s or TR_NAV_SON not in s:
            continue
        tr = tr_yol_of(rel)
        en = CEVIRI.get(tr, "/en/")
        s = s.replace(TR_NAV_SON, 'class="am-cta">Raporlar</a>' + dil_html(False, tr, en) + '</div></nav></div>', 1)
        if CSS_KANCA in s and CSS_EK not in s:
            s = s.replace(CSS_KANCA, CSS_KANCA + CSS_EK, 1)
        if tr in CEVIRI and 'hreflang="en"' not in s.split("</head>")[0]:
            s = s.replace("</head>", hreflang(tr, en) + "\n</head>", 1)
        open(f, "w", encoding="utf-8").write(s)
        degisen += 1
    return degisen


def uygula_sablonlar(kok="."):
    """gen-burc.mjs / gen-gokyuzu.mjs içindeki JSON-kaçışlı menü ve CSS dizgeleri."""
    for f in ("gen-burc.mjs", "gen-gokyuzu.mjs"):
        p = os.path.join(kok, f)
        s = open(p, encoding="utf-8").read()
        if "am-lang" in s:
            continue
        eski = json.dumps(TR_NAV_SON, ensure_ascii=False)[1:-1]
        yeni = json.dumps('class="am-cta">Raporlar</a>' + dil_html(False, "/__TRYOL__", "/en/") + '</div></nav></div>', ensure_ascii=False)[1:-1]
        assert s.count(eski) == 1, (f, s.count(eski))
        # Üretilen sayfanın kendi yolu (haftalık/gökyüzü sayfalarının İngilizcesi yok → /en/)
        if f == "gen-gokyuzu.mjs":
            yeni = yeni.replace("/__TRYOL__", "/bugun-gokyuzu.html")
        else:  # gen-burc: her sayfa kendi yolunu head() içinde koyar (canonical'dan)
            assert s.count("${HIZ_MENU_BAR}") == 1
            s = s.replace("${HIZ_MENU_BAR}", '${HIZ_MENU_BAR.replace("/__TRYOL__", new URL(canonical).pathname)}', 1)
        s = s.replace(eski, yeni, 1)
        assert s.count(CSS_KANCA) == 1, (f, "css")
        s = s.replace(CSS_KANCA, CSS_KANCA + json.dumps(CSS_EK)[1:-1], 1)
        open(p, "w", encoding="utf-8").write(s)


if __name__ == "__main__":
    kok = sys.argv[1] if len(sys.argv) > 1 else "."
    print("türkçe sayfa:", uygula_tr(kok))
    uygula_sablonlar(kok)
    print("şablonlar tamam")
