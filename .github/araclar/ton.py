#!/usr/bin/env python3
"""Site geneli görünüm: ana sayfadaki gece laciverdi ton, yenilenmiş üst menü ve Asterna penceresi.
Tekrar çalıştırılabilir (aynı dosyaya ikinci kez uygulanınca değişiklik yapmaz).
Kullanım: python3 .github/araclar/ton.py  (depo kökünde)"""
import re, glob, sys

RENK = {
 '#14101f':'#04060d','#0c0914':'#03050b','#0b0b14':'#04060d','#0b0b13':'#03050b','#0e0b1d':'#070a14',
 '#0f0d18':'#05070f','#0f0b1a':'#03050b','#120e1e':'#060912','#13131f':'#080b17','#161022':'#070a15',
 '#171227':'#080c18','#1a1428':'#090d1a','#1b1530':'#0a0e1c','#1c1733':'#0b1020','#1c1638':'#0c1226',
 '#1c1a2e':'#0b1224','#1d1830':'#0b1021','#1d1533':'#0c1326','#241c3d':'#0e1630','#2a1c33':'#141a34',
 '#2a2140':'#161d33','#2c2545':'#19213a','#332a4d':'#1f2942','#3a2f5c':'#283454','#3a2f72':'#24336c',
 '#4a3d73':'#36436e','#9a8fb8':'#a39db6','#6f6690':'#807b94',
}
RGB = {(20,16,31):(4,6,13),(12,9,20):(3,5,11),(36,28,61):(14,22,48),(27,21,48):(10,14,28),(28,23,51):(11,16,32),(11,11,20):(4,6,13),(22,16,34):(7,10,21)}

MENU_EK = ('.am-nav{padding:20px}.am-links{gap:24px;font-size:14.5px}'
 '.am-links>a,.am-drop-btn{color:#f0e6d2;opacity:.8;font-size:14.5px;min-height:40px;display:inline-flex;align-items:center}'
 '.am-links>a:hover,.am-drop-btn:hover,.am-drop-btn[aria-expanded="true"]{opacity:1;color:#e7cf95}'
 '.am-cta{border:1px solid rgba(217,185,106,.55);padding:0 22px;border-radius:999px;font-weight:650;letter-spacing:.02em;transition:background .25s,color .25s,border-color .25s}'
 '.am-cta:hover{background:#e7cf95;border-color:#e7cf95;color:#17120a !important}'
 '.am-drop-menu{background:rgba(7,10,20,.97);border:1px solid rgba(217,185,106,.24);border-radius:18px;padding:10px;min-width:290px;box-shadow:0 30px 80px rgba(0,0,0,.65);top:calc(100% + 10px)}'
 '.am-cat + .am-cat{border-top:1px solid rgba(240,230,210,.1)}'
 '.am-cat-btn{font-size:11.5px;letter-spacing:.22em;padding:14px 12px;border-radius:10px}'
 '.am-drop-menu a{border-radius:10px;padding:10px 12px;font-size:15px;color:#f0e6d2}'
 '.am-drop-menu a:hover{background:rgba(217,185,106,.09);color:#e7cf95}'
 '.am-sub{color:#aaa5ba;font-size:12.5px;margin-top:3px}'
 '@media (max-width:600px){.am-nav{position:relative;display:block;padding:12px 20px 0}.am-brand{display:block;line-height:42px}'
 '.am-links{position:static;flex-wrap:nowrap;justify-content:space-between;gap:8px;margin-top:8px;border-top:1px solid rgba(240,230,210,.1);padding:4px 0}'
 '.am-links>a,.am-drop-btn{font-size:13.5px;min-height:44px}.am-cta{position:absolute;top:12px;right:20px;min-height:42px;padding:0 20px}'
 '.am-drop-menu{top:calc(100% + 6px);width:min(92vw,340px)}}'
 '@media (max-width:370px){.am-links>a,.am-drop-btn{font-size:12.5px}}'
 '/*ay-menu-2*/')

ASTERNA_EK = ('body #asterna-fab{width:58px;height:58px;background:radial-gradient(circle at 50% 35%,#141a33,#070a14 70%);box-shadow:0 14px 40px rgba(0,0,0,.6),inset 0 0 0 1px rgba(217,185,106,.6),inset 0 0 18px rgba(217,185,106,.12);color:#e7cf95;font-size:22px;transition:transform .25s ease,box-shadow .25s}'
 'body #asterna-fab:hover{transform:translateY(-3px);box-shadow:0 18px 46px rgba(0,0,0,.65),inset 0 0 0 1px #e7cf95,inset 0 0 22px rgba(217,185,106,.22)}'
 'body #asterna-fab .pip{top:3px;right:3px;width:10px;height:10px;background:#e7cf95;border:2px solid #070a14}'
 '@media(min-width:900px){body #asterna-fab{width:auto;height:54px;border-radius:999px;padding:0 22px 0 18px;gap:10px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}'
 'body #asterna-fab::after{content:"Asterna\\\'ya sor";font-size:14.5px;font-weight:600;letter-spacing:.02em;color:#f0e6d2}body #asterna-fab .pip{top:-2px;right:10px}}'
 'body #asterna-panel{width:392px;height:600px;background:#070a14;border:1px solid rgba(217,185,106,.3);border-radius:22px;box-shadow:0 40px 110px rgba(0,0,0,.75);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#f0e6d2}'
 'body #asterna-panel .ast-head{padding:18px 18px 16px;background:none;border-bottom:1px solid rgba(240,230,210,.1);gap:12px}'
 'body #asterna-panel .ast-head .ay{width:40px;height:40px;background:radial-gradient(circle at 50% 35%,#141a33,#070a14 70%);box-shadow:inset 0 0 0 1px rgba(217,185,106,.6);color:#e7cf95;font-size:17px}'
 'body #asterna-panel .ast-head .ad{font-size:18px;letter-spacing:.01em}'
 'body #asterna-panel .ast-head .alt{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#aaa5ba;margin-top:4px}'
 'body #asterna-panel .ast-head .yeni{border:1px solid rgba(240,230,210,.1);border-radius:50%;width:36px;height:36px;padding:0;color:#aaa5ba}'
 'body #asterna-panel .ast-head .kapat{width:36px;height:36px;padding:0;color:#aaa5ba}'
 'body #asterna-panel .ast-akis{padding:18px;gap:14px;background:radial-gradient(90% 50% at 50% 0,rgba(22,44,88,.32),transparent 70%)}'
 'body #asterna-panel .ast-msg{font-size:14.5px;line-height:1.6;padding:12px 15px;border-radius:18px}'
 'body #asterna-panel .ast-msg.bot{background:rgba(240,230,210,.055);border:1px solid rgba(240,230,210,.1);color:#e9e2d6;border-bottom-left-radius:6px}'
 'body #asterna-panel .ast-msg.ben{background:linear-gradient(180deg,#ecd6a0,#d9b96a);color:#17120a;border-bottom-right-radius:6px}'
 'body #asterna-panel .ast-yaz{color:#aaa5ba}'
 'body #asterna-panel .ast-alt{border-top:1px solid rgba(240,230,210,.1);background:#05070f;padding:12px 12px 10px}'
 'body #asterna-panel .ast-cips{gap:7px;margin-bottom:10px}'
 'body #asterna-panel .ast-cip{background:none;border:1px solid rgba(240,230,210,.1);border-radius:999px;padding:7px 12px;font-size:12.5px;color:#d5cfde}'
 'body #asterna-panel .ast-cip:hover{border-color:#d9b96a;color:#e7cf95}'
 'body #asterna-panel .ast-giris textarea{background:#03050b;border:1px solid rgba(240,230,210,.1);border-radius:16px;padding:12px 14px;min-height:46px;font-size:15px}'
 'body #asterna-panel .ast-giris textarea:focus{border-color:#d9b96a}'
 'body #asterna-panel .ast-gonder{width:46px;height:46px;border-radius:50%;background:linear-gradient(180deg,#ecd6a0,#d4b262);font-size:16px}'
 'body #asterna-panel .ast-feragat{color:#8b8698;font-size:11px;margin-top:9px}'
 'body #asterna-panel .ast-rapor-oge{background:rgba(240,230,210,.04);border:1px solid rgba(240,230,210,.1);border-radius:14px}'
 '@media(max-width:480px){body #asterna-panel{left:8px;right:8px;width:auto;bottom:8px;height:min(82vh,640px);max-height:none;border-radius:22px}}'
 '/*ay-asterna-2*/')

def renk(s):
    s = re.sub(r'#[0-9a-fA-F]{6}\b', lambda m: RENK.get(m.group(0).lower(), m.group(0)), s)
    def f(m):
        t = (int(m.group(2)), int(m.group(3)), int(m.group(4)))
        if t in RGB:
            n = RGB[t]; return '%s%d,%d,%d' % (m.group(1), n[0], n[1], n[2])
        return m.group(0)
    return re.sub(r'(rgba?\(\s*)(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})', f, s)

def menu(s):
    if '/*ay-menu-2*/' in s: return s
    # sayfaya gömülü menü stili
    s = re.sub(r'(<style id="am-kritik">)(.*?)(</style>)', lambda m: m.group(1) + m.group(2) + MENU_EK + m.group(3), s, count=1, flags=re.S)
    # üretici betiklerde JSON içine gömülü (tırnakları kaçışlı) menü stili
    s = re.sub(r'(<style id=\\"am-kritik\\">)(.*?)(</style>)', lambda m: m.group(1) + m.group(2) + MENU_EK.replace('"', '\\"') + m.group(3), s, count=1, flags=re.S)
    return s

def main():
    yollar = sorted(set(glob.glob('*.html') + glob.glob('*/*.html') + glob.glob('*.js') + glob.glob('*.mjs') + glob.glob('*.css') + ['manifest.json']))
    atla = {'astronomy.browser.min.js', 'gizli-noktalar.js', 'index.html'}
    say = 0
    for y in yollar:
        if y in atla: continue
        s = open(y, encoding='utf-8').read(); o = s
        s = renk(s)
        if y.endswith('.html') or y.endswith('.mjs'): s = menu(s)
        if y == 'menu.js' and '/*ay-menu-2*/' not in s:
            k = "  + '#ay-cerez{position:fixed"
            assert k in s
            s = s.replace(k, "  + '" + MENU_EK.replace("'", "\\'") + "'\n" + k, 1)
        if y == 'asterna-widget.js' and '/*ay-asterna-2*/' not in s:
            k = "@media(max-width:480px){#asterna-panel{right:8px;left:8px;width:auto;bottom:84px}}';"
            assert k in s
            s = s.replace(k, k[:-2] + ASTERNA_EK + "';", 1)
        if s != o:
            open(y, 'w', encoding='utf-8').write(s); say += 1
    print('değişen dosya:', say)

if __name__ == '__main__':
    main()
