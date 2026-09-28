#!/usr/bin/env node
/* Astro Yuvam — Günlük Gökyüzü Verisi üreticisi (yapay zekâ GEREKMEZ, yalnızca astronomi hesabı)
   GitHub Actions her gece (Türkiye saatiyle 00:05) çalıştırır:
     • bugun-gokyuzu.html  — bugünün gezegen konumları, Ay, retrolar, Yeni Ay/Dolunay, tutulmalar, 30 günlük olaylar
     • gokyuzu.json        — aynı veri makine okunur biçimde (yapay zekâ asistanları ve geliştiriciler için)
     • sitemap.xml          — bu sayfanın <lastmod> tarihi güncellenir
   Hesap: astronomy-engine (Swiss Ephemeris ile karşılaştırıldığında fark yay saniyeleri düzeyinde).
   Hata olursa HİÇBİR dosya yazılmaz; mevcut sayfa korunur. */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import * as A from "astronomy-engine";

const T = {"BAS": "<!DOCTYPE html>\n<html lang=\"tr\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n", "HEAD_SON": "<style id=\"am-kritik\">.am-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:820px;margin:0 auto;padding:18px 20px;font-family:\"Segoe UI\",system-ui,sans-serif}.am-brand{font-family:Georgia,\"Times New Roman\",serif;font-size:18px;letter-spacing:2px;color:#d9b96a;font-weight:bold;white-space:nowrap;text-decoration:none}.am-links{display:flex;gap:18px;font-size:14px;align-items:center;white-space:nowrap}.am-links>a{color:#f0e6d2;opacity:.82;text-decoration:none;transition:color .2s,opacity .2s}.am-links>a:hover{opacity:1;color:#e7cf95}.am-dropdown{position:relative;display:inline-block}.am-drop-btn{background:none;border:none;color:#f0e6d2;opacity:.82;font:inherit;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:0;transition:color .2s,opacity .2s}.am-drop-btn:hover,.am-drop-btn[aria-expanded=\"true\"]{opacity:1;color:#e7cf95}.am-caret{font-size:11px;transition:transform .2s}.am-drop-btn[aria-expanded=\"true\"] .am-caret{transform:rotate(180deg)}.am-drop-menu{position:absolute;top:calc(100% + 12px);right:0;min-width:262px;background:#241c3d;border:1px solid #332a4d;border-radius:12px;padding:8px;box-shadow:0 16px 40px rgba(0,0,0,.5);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .18s,transform .18s,visibility .18s;z-index:60;text-align:left}.am-dropdown.open .am-drop-menu{opacity:1;visibility:visible;transform:translateY(0)}.am-cat + .am-cat{border-top:1px solid #2c2545;margin-top:2px}.am-cat-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;background:none;border:none;cursor:pointer;font:inherit;color:#d9b96a;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;opacity:.9;padding:12px 12px;text-align:left;border-radius:8px;transition:background .15s,color .15s,opacity .15s}.am-cat-btn:hover{opacity:1;color:#e7cf95;background:rgba(217,185,106,.06)}.am-cat-caret{font-size:10px;opacity:.75;transition:transform .22s}.am-cat.open>.am-cat-btn{color:#e7cf95;opacity:1}.am-cat.open>.am-cat-btn .am-cat-caret{transform:rotate(180deg)}.am-cat-items{display:grid;grid-template-rows:0fr;transition:grid-template-rows .22s ease}.am-cat.open>.am-cat-items{grid-template-rows:1fr}.am-cat-inner{overflow:hidden;min-height:0}.am-drop-menu a{display:block;padding:10px 12px;border-radius:8px;color:#f0e6d2;font-size:14.5px;text-decoration:none;transition:background .15s}.am-drop-menu a:hover{background:rgba(217,185,106,.10);color:#e7cf95}.am-drop-menu a[aria-current=\"page\"]{color:#e7cf95;background:rgba(217,185,106,.08)}.am-sub{display:block;font-size:12px;color:#9a8fb8;margin-top:2px}.am-cta{color:#d9b96a !important;opacity:1 !important;font-weight:bold;border:1px solid #332a4d;padding:7px 16px;border-radius:20px;transition:background .2s,border-color .2s}.am-cta:hover{background:rgba(217,185,106,.12);border-color:#d9b96a}@media (max-width:600px){.am-nav{flex-wrap:wrap;justify-content:center}.am-links{flex-wrap:wrap;justify-content:center;position:relative}.am-dropdown{position:static}.am-drop-menu{left:50%;right:auto;transform:translate(-50%,-6px);width:min(88vw,320px);min-width:0}.am-dropdown.open .am-drop-menu{transform:translate(-50%,0)}}@media (prefers-reduced-motion:reduce){.am-drop-menu,.am-caret,.am-cat-caret,.am-cat-items,.am-links>a,.am-cta{transition:none !important}}</style>\n<style id=\"ay-cerez-kritik\">#ay-cerez{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#1b1530;border-top:1px solid #332a4d;box-shadow:0 -12px 34px rgba(0,0,0,.45);transform:translateY(100%);transition:transform .32s ease;font-family:\"Segoe UI\",system-ui,sans-serif}#ay-cerez.ac-in{transform:translateY(0)}.ay-cerez-in{max-width:980px;margin:0 auto;padding:14px 22px;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}.ay-cerez-tx{margin:0;color:#f0e6d2;opacity:.9;font-size:13.5px;line-height:1.55;flex:1;min-width:230px}.ay-cerez-tx a{color:#e7cf95;text-decoration:underline}.ay-cerez-bt{display:flex;gap:10px;flex-shrink:0}.ay-cerez-kabul{background:linear-gradient(180deg,#e7cf95,#d9b96a);border:none;color:#1a1428;font:inherit;font-weight:bold;font-size:13.5px;padding:9px 26px;border-radius:20px;cursor:pointer;transition:filter .2s}.ay-cerez-kabul:hover{filter:brightness(1.06)}@media (max-width:600px){.ay-cerez-in{padding:12px 16px}.ay-cerez-bt{width:100%}.ay-cerez-kabul{flex:1}}@media (prefers-reduced-motion:reduce){#ay-cerez{transition:none}}@media (prefers-reduced-motion:reduce){.am-drop-menu,.am-caret,.am-cat-caret,.am-cat-items,.am-links>a,.am-cta{transition:none !important}}#ay-cerez.ac-in{animation:ayCerezGir .32s ease}@keyframes ayCerezGir{from{transform:translateY(100%)}}@media (prefers-reduced-motion:reduce){#ay-cerez.ac-in{animation:none}}</style>\n<link rel=\"manifest\" href=\"/manifest.json\"><meta name=\"theme-color\" content=\"#14101f\"><meta name=\"mobile-web-app-capable\" content=\"yes\"><meta name=\"apple-mobile-web-app-capable\" content=\"yes\"><meta name=\"apple-mobile-web-app-title\" content=\"Astro Yuvam\"><meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\"><link rel=\"apple-touch-icon\" href=\"/apple-touch-icon.png\">\n", "STIL": "<style>\n  :root{--bg-1:#0c0914;--bg-2:#14101f;--panel:#1c1733;--panel-2:#241c3d;--gold:#d9b96a;--gold-soft:#e7cf95;--cream:#f0e6d2;--muted:#9a8fb8;--line:#332a4d}\n  *{box-sizing:border-box}html,body{margin:0}\n  body{background:radial-gradient(ellipse at 50% -10%, #241c3d 0%, var(--bg-2) 55%, var(--bg-1) 100%) fixed;color:var(--cream);font-family:Georgia,'Times New Roman',serif;min-height:100vh;-webkit-font-smoothing:antialiased;line-height:1.8}\n  a{color:var(--gold);text-decoration:none}\n  .wrap{max-width:720px;margin:0 auto;padding:0 20px 60px}\n  .kicker{font-family:'Segoe UI',system-ui,sans-serif;font-size:11.5px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);opacity:.85;text-align:center;margin:22px 0 0}\n  h1{font-size:32px;line-height:1.25;margin:10px 0 8px;font-weight:600;text-align:center}\n  .yazi-meta{font-family:'Segoe UI',system-ui,sans-serif;font-size:13px;color:var(--muted);text-align:center}\n  .etiketler{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:12px 0 4px}\n  .etiketler span{background:rgba(217,185,106,.08);border:1px solid var(--line);border-radius:20px;padding:4px 12px;font-family:'Segoe UI',system-ui,sans-serif;font-size:12px;color:var(--cream)}\n  .ozet{font-size:18px;color:#efe7f6;font-style:italic;text-align:center;max-width:600px;margin:16px auto 0}\n  hr.ayrac{border:none;border-top:1px solid var(--line);max-width:80px;margin:26px auto}\n  h2{font-size:22px;color:var(--gold-soft);margin:32px 0 10px;font-weight:600}\n  p{font-size:16.5px;color:#efe7f6}\n  .soru{font-weight:bold;color:var(--cream);margin:20px 0 4px}\n  .kapanis{font-size:16.5px;color:#efe7f6;background:rgba(217,185,106,.05);border-left:3px solid var(--gold);padding:14px 18px;border-radius:0 10px 10px 0;margin:28px 0}\n  .cta-kutu{text-align:center;margin:32px 0 0;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line);border-radius:16px;padding:24px 22px}\n  .cta-kutu h3{margin:0 0 12px;font-size:18px}\n  .cta{display:inline-block;background:linear-gradient(180deg,var(--gold-soft),var(--gold));color:#2a1e08;font-weight:bold;padding:12px 24px;border-radius:30px;font-size:15px;font-family:'Segoe UI',system-ui,sans-serif}\n  .ilgili{margin-top:26px}\n  .ilgili .b{font-family:'Segoe UI',system-ui,sans-serif;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);opacity:.85;margin-bottom:10px;text-align:center}\n  .ilgili .satir{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}\n  .ilgili a{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:11px 16px;color:var(--cream);font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;transition:background .15s,border-color .15s}\n  .ilgili a:hover{background:rgba(217,185,106,.10);border-color:var(--gold)}\n  .disclaimer{font-family:'Segoe UI',system-ui,sans-serif;font-size:12.5px;color:var(--muted);max-width:560px;margin:26px auto 0;line-height:1.6;text-align:center}\n  .geri{display:block;text-align:center;margin-top:28px;font-family:'Segoe UI',system-ui,sans-serif;font-size:14px}\n</style>", "GOVDE_BAS": "<body>\n<div id=\"astro-menu\"><nav class=\"am-nav\"><a class=\"am-brand\" href=\"/\">✦ ASTRO YUVAM</a><div class=\"am-links\"><div class=\"am-dropdown\"><button type=\"button\" class=\"am-drop-btn\" aria-haspopup=\"true\" aria-expanded=\"false\">Keşfet <span class=\"am-caret\">▾</span></button><div class=\"am-drop-menu\" role=\"menu\"></div></div><div class=\"am-dropdown\"><button type=\"button\" class=\"am-drop-btn\" aria-haspopup=\"true\" aria-expanded=\"false\">Burç Yorumları <span class=\"am-caret\">▾</span></button><div class=\"am-drop-menu\" role=\"menu\"></div></div><a href=\"/yildiz-gunlugu.html\">Yıldız Günlüğü</a><a href=\"/giris.html\">Giriş</a><a href=\"/#cards\" class=\"am-cta\">Raporlar</a></div></nav></div>\n<script>(function(){try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&/^sb-.*-auth-token$/.test(k)){var o=JSON.parse(localStorage.getItem(k)||\"{}\"),t=o.access_token||(o.currentSession&&o.currentSession.access_token),e=o.expires_at||(o.currentSession&&o.currentSession.expires_at);if(t&&(!e||e*1000>Date.now())){var g=document.querySelector('#astro-menu a[href=\"/giris.html\"]');if(g)g.outerHTML='<div class=\"am-dropdown\"><button type=\"button\" class=\"am-drop-btn\" aria-haspopup=\"true\" aria-expanded=\"false\">Hesabım <span class=\"am-caret\">▾</span></button><div class=\"am-drop-menu\" role=\"menu\"></div></div>';}break;}}}catch(x){}})();</script>\n<script>/* Hız: ortak menü betiği ilk içerik çizildikten sonra (ya da ilk dokunuşta) yüklenir */(function(){var o=false,E=[\"pointerdown\",\"keydown\",\"touchstart\"];function y(){if(o)return;o=true;E.forEach(function(e){removeEventListener(e,y,true)});var m=document.createElement(\"script\");m.src=\"/menu.js\";document.body.appendChild(m);}E.forEach(function(e){addEventListener(e,y,{capture:true,passive:true})});try{var p=new PerformanceObserver(function(l){l.getEntries().forEach(function(x){if(x.name===\"first-contentful-paint\"){p.disconnect();setTimeout(y,0)}})});p.observe({type:\"paint\",buffered:true})}catch(e){}setTimeout(y,1500)})();</script>\n", "KUYRUK": "\n<div id=\"ay-cerez\" class=\"ac-in\" role=\"note\" aria-label=\"Çerez bilgilendirmesi\"><div class=\"ay-cerez-in\"><p class=\"ay-cerez-tx\">Deneyimini iyileştirmek ve ziyaret istatistikleri için çerezler kullanıyoruz. Ayrıntılar için <a href=\"/gizlilik-kvkk.html\">Gizlilik &amp; KVKK</a> metnimize göz atabilirsin.</p><div class=\"ay-cerez-bt\"><button type=\"button\" class=\"ay-cerez-kabul\">Tamam</button></div></div></div>\n<script>try{if(localStorage.getItem(\"ay_cerez_bilgi_v1\")===\"1\"){var c=document.getElementById(\"ay-cerez\");c.parentNode.removeChild(c);}}catch(e){}</script>\n</body>\n</html>", "EK_STIL": "<style>\n  .wrap.genis{max-width:860px}\n  .kutu{background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:18px 0}\n  .kutu p{margin:6px 0}\n  .kisa-cevap{border-left:3px solid var(--gold);background:rgba(217,185,106,.06);border-radius:0 12px 12px 0;padding:14px 18px;margin:22px 0}\n  .kisa-cevap b{color:var(--gold-soft)}\n  .olgular{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:18px 0}\n  .olgu{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;text-align:center;font-family:'Segoe UI',system-ui,sans-serif}\n  .olgu b{display:block;font-family:Georgia,serif;font-size:24px;color:var(--gold-soft);line-height:1.2}\n  .olgu span{font-size:12.5px;color:var(--muted)}\n  ul.duz{padding-left:20px}ul.duz li{margin:6px 0;font-size:16px;color:#efe7f6}\n  .tablo-kap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:14px 0;border:1px solid var(--line);border-radius:14px}\n  table.fiyat{width:100%;border-collapse:collapse;font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;min-width:560px}\n  table.fiyat th{background:var(--panel-2);color:var(--gold-soft);text-align:left;padding:10px 12px;font-weight:600;font-size:12.5px;letter-spacing:.4px}\n  table.fiyat td{padding:10px 12px;border-top:1px solid var(--line);color:#efe7f6;vertical-align:top}\n  table.fiyat td.tl{white-space:nowrap;color:var(--gold-soft);font-weight:600}\n  table.fiyat td a{font-weight:600}\n  table.fiyat small{color:var(--muted);display:block;font-size:12px;margin-top:2px}\n  .kat-baslik{font-family:'Segoe UI',system-ui,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin:26px 0 8px}\n  .arac-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}\n  .arac{display:block;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:13px 15px;color:var(--cream);transition:border-color .15s,background .15s}\n  .arac:hover{border-color:var(--gold);background:rgba(217,185,106,.07)}\n  .arac b{display:block;font-size:16px;color:var(--gold-soft);margin-bottom:3px}\n  .arac span{font-family:'Segoe UI',system-ui,sans-serif;font-size:13.5px;color:#cfc5e0;line-height:1.5}\n  .kontrol{counter-reset:k;list-style:none;padding:0}\n  .kontrol li{counter-increment:k;position:relative;padding:12px 14px 12px 52px;margin:8px 0;background:var(--panel);border:1px solid var(--line);border-radius:14px;font-size:16px;color:#efe7f6}\n  .kontrol li::before{content:counter(k);position:absolute;left:14px;top:12px;width:26px;height:26px;border-radius:50%;background:linear-gradient(180deg,var(--gold-soft),var(--gold));color:#2a1e08;font:bold 14px/26px 'Segoe UI',system-ui,sans-serif;text-align:center}\n  .kontrol li b{color:var(--gold-soft)}\n  .sss details{background:var(--panel);border:1px solid var(--line);border-radius:14px;margin:8px 0;padding:0 16px}\n  .sss summary{cursor:pointer;padding:14px 0;font-weight:bold;color:var(--cream);list-style:none}\n  .sss summary::-webkit-details-marker{display:none}\n  .sss summary::after{content:\"+\";float:right;color:var(--gold)}\n  .sss details[open] summary::after{content:\"–\"}\n  .sss details p{margin:0 0 14px}\n  @media (max-width:640px){\n    .tablo-kap{border:none;overflow:visible}\n    table.fiyat{min-width:0}\n    table.fiyat thead{display:none}\n    table.fiyat,table.fiyat tbody,table.fiyat tr,table.fiyat td{display:block;width:100%}\n    table.fiyat tr{background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:0 0 10px}\n    table.fiyat td{border:none;padding:3px 0}\n    table.fiyat td.ad{padding-bottom:8px}\n    table.fiyat td[data-l]{display:flex;justify-content:space-between;gap:12px;border-top:1px dashed var(--line);padding:7px 0}\n    table.fiyat td[data-l]::before{content:attr(data-l);color:var(--muted);font-size:12.5px}\n    table.fiyat td[data-l] a{padding:4px 0}\n  }\n  @media (max-width:520px){h1{font-size:27px}.olgu b{font-size:21px}}\n</style>"};
const TZ = "Europe/Istanbul";
const SITE = "https://astroyuvam.com/";
const BURC = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
const GLIF = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"].map(g => g + "︎");
const HAL = ["Koç'ta","Boğa'da","İkizler'de","Yengeç'te","Aslan'da","Başak'ta","Terazi'de","Akrep'te","Yay'da","Oğlak'ta","Kova'da","Balık'ta"];
const YON = ["Koç'a","Boğa'ya","İkizler'e","Yengeç'e","Aslan'a","Başak'a","Terazi'ye","Akrep'e","Yay'a","Oğlak'a","Kova'ya","Balık'a"];
const GEZ = [
  ["Güneş", A.Body.Sun, "☉"], ["Ay", A.Body.Moon, "☽"], ["Merkür", A.Body.Mercury, "☿"], ["Venüs", A.Body.Venus, "♀"],
  ["Mars", A.Body.Mars, "♂"], ["Jüpiter", A.Body.Jupiter, "♃"], ["Satürn", A.Body.Saturn, "♄"], ["Uranüs", A.Body.Uranus, "♅"],
  ["Neptün", A.Body.Neptune, "♆"], ["Plüton", A.Body.Pluto, "♇"],
];
const RETROLU = GEZ.slice(2);
const norm = x => ((x % 360) + 360) % 360;
const DAY = 864e5;

function lon(body, d){
  if (body === A.Body.Sun) return norm(A.SunPosition(d).elon);
  if (body === A.Body.Moon) return norm(A.EclipticGeoMoon(d).lon);
  return norm(A.Ecliptic(A.GeoVector(body, d, true)).elon);
}
const fark = (a, b) => { let x = b - a; if (x > 180) x -= 360; if (x < -180) x += 360; return x; };
const hiz = (body, d) => fark(lon(body, new Date(d.getTime() - DAY/2)), lon(body, new Date(d.getTime() + DAY/2)));   // °/gün
const burcNo = l => Math.floor(norm(l) / 30);
const dm = l => { const w = norm(l) % 30; let d = Math.floor(w), m = Math.round((w - d) * 60); if (m === 60){ d++; m = 0; } return `${d}°${String(m).padStart(2,"0")}′`; };
const ortalamaDugum = d => { const g = d.getTime()/DAY + 2440587.5 - 2451545.0; return norm(125.0445479 - 0.0529539222*g); };

const fmtT = (d, o) => new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, ...o }).format(d);
const tarih = d => fmtT(d, { day:"numeric", month:"long", year:"numeric" });
const tarihGun = d => fmtT(d, { day:"numeric", month:"long", year:"numeric", weekday:"long" });
const saat = d => fmtT(d, { hour:"2-digit", minute:"2-digit" });
const kisa = d => fmtT(d, { day:"numeric", month:"long" });
const tarihSaat = d => `${tarih(d)} ${saat(d)}`;
const isoGun = d => { const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year:"numeric", month:"2-digit", day:"2-digit" }).format(d); return p; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// —— Arama yardımcıları ——
function kesSinir(f, a, b, adim = 60e3){ // f(a)!=f(b); ikiye bölerek dakikaya indir
  let fa = f(a);
  while (b.getTime() - a.getTime() > adim){ const m = new Date((a.getTime() + b.getTime())/2); if (f(m) === fa) a = m; else b = m; }
  return b;
}
function sonrakiBurcGirisi(body, bas, adimMs, sinirGun){
  const f = d => burcNo(lon(body, d));
  const b0 = f(bas); let t = bas;
  const son = bas.getTime() + sinirGun*DAY;
  while (t.getTime() < son){
    const n = new Date(t.getTime() + adimMs);
    if (f(n) !== b0) return { zaman: kesSinir(f, t, n), burc: f(n) };
    t = n;
  }
  return null;
}
function duraklar(body, bas, bit){ // hız işareti değişimleri (retro başlangıç/bitiş)
  const out = []; let t = bas, s = Math.sign(hiz(body, t));
  while (t < bit){
    const n = new Date(t.getTime() + DAY); const sn = Math.sign(hiz(body, n));
    if (sn !== s && sn !== 0){
      const z = kesSinir(d => Math.sign(hiz(body, d)), t, n, 3600e3);
      out.push({ zaman: z, tur: sn < 0 ? "retro" : "direkt", lon: lon(body, z) }); s = sn;
    }
    t = n;
  }
  return out;
}

// —— Hesap ——
const simdi = new Date();
const bugun = isoGun(simdi);
const ogle = new Date(`${bugun}T09:00:00Z`);   // Türkiye 12:00 (UTC+3)
const gunBas = new Date(`${bugun}T00:00:00+03:00`);

const konumlar = GEZ.map(([ad, body, g]) => {
  const l = lon(body, ogle), v = body === A.Body.Sun || body === A.Body.Moon ? null : hiz(body, ogle);
  const sonraki = sonrakiBurcGirisi(body, ogle, body === A.Body.Moon ? 3600e3 : DAY, body === A.Body.Moon ? 4 : 1200);
  return { ad, g, lon: l, burc: burcNo(l), derece: dm(l), retro: v != null && v < 0, hiz: v, sonraki };
});
const dugum = ortalamaDugum(ogle);

// Ay
const ayAci = A.MoonPhase(ogle);
const ayIsik = Math.round(A.Illumination(A.Body.Moon, ogle).phase_fraction * 100);
const EVRE = [[0,"Yeni Ay"],[12,"Hilal (büyüyen)"],[80,"İlk Dördün"],[100,"Şişkin Ay (büyüyen)"],[168,"Dolunay"],[192,"Şişkin Ay (küçülen)"],[260,"Son Dördün"],[280,"Hilal (küçülen)"],[348,"Yeni Ay"]];
const ayEvre = EVRE.filter(([a]) => ayAci >= a).pop()[1];
const ay = konumlar[1];
// Ay'ın bugünkü burç geçişleri (gün içinde)
const ayGecisleri = [];
{ let t = gunBas; for (let k = 0; k < 2; k++){ const s = sonrakiBurcGirisi(A.Body.Moon, t, 3600e3, 3); if (!s) break; if (isoGun(s.zaman) !== bugun) break; ayGecisleri.push(s); t = new Date(s.zaman.getTime() + 60e3); } }

// Yeni Ay / Dolunay (13 ay)
const lunasyon = [];
{ let t = gunBas; for (let k = 0; k < 28; k++){
    const yeni = A.SearchMoonPhase(0, t, 40), dolu = A.SearchMoonPhase(180, t, 40);
    const ilk = [yeni && { tur:"Yeni Ay", z: yeni.date }, dolu && { tur:"Dolunay", z: dolu.date }].filter(Boolean).sort((a,b) => a.z - b.z)[0];
    if (!ilk || ilk.z.getTime() > gunBas.getTime() + 400*DAY) break;
    lunasyon.push({ ...ilk, burc: burcNo(lon(A.Body.Moon, ilk.z)), derece: dm(lon(A.Body.Moon, ilk.z)) });
    t = new Date(ilk.z.getTime() + 3600e3);
} }
// Tutulmalar (18 ay)
const tutulma = [];
{ let t = gunBas; for (let k = 0; k < 4; k++){ const e = A.SearchLunarEclipse(t); if (e.peak.date.getTime() > gunBas.getTime() + 550*DAY) break;
    const TUR = { penumbral:"yarı gölge", partial:"parçalı", total:"tam" };
    tutulma.push({ tur:`Ay tutulması (${TUR[e.kind] || e.kind})`, z: e.peak.date, burc: burcNo(lon(A.Body.Moon, e.peak.date)), derece: dm(lon(A.Body.Moon, e.peak.date)) }); t = new Date(e.peak.date.getTime() + 20*DAY); } }
{ let t = gunBas; for (let k = 0; k < 4; k++){ const e = A.SearchGlobalSolarEclipse(t); if (e.peak.date.getTime() > gunBas.getTime() + 550*DAY) break;
    const TUR = { partial:"parçalı", annular:"halkalı", total:"tam", hybrid:"hibrit" };
    tutulma.push({ tur:`Güneş tutulması (${TUR[e.kind] || e.kind})`, z: e.peak.date, burc: burcNo(lon(A.Body.Sun, e.peak.date)), derece: dm(lon(A.Body.Sun, e.peak.date)) }); t = new Date(e.peak.date.getTime() + 20*DAY); } }
tutulma.sort((a,b) => a.z - b.z);

// Retro dönemleri (geçmiş 1 yıl + gelecek ~14 ay)
const retrolar = RETROLU.map(([ad, body, g]) => {
  const d = duraklar(body, new Date(gunBas.getTime() - 400*DAY), new Date(gunBas.getTime() + 430*DAY));
  const donem = [];
  for (let k = 0; k < d.length; k++) if (d[k].tur === "retro"){ const bit = d.slice(k+1).find(x => x.tur === "direkt"); donem.push({ bas: d[k], bit: bit || null }); }
  const suan = konumlar.find(x => x.ad === ad).retro;
  const aktif = donem.find(p => p.bas.zaman <= simdi && (!p.bit || p.bit.zaman > simdi)) || null;
  const gelecek = donem.filter(p => p.bas.zaman > simdi);
  return { ad, g, suan, aktif, gelecek };
});

// 30 günlük olay takvimi
const olay = [];
const bit30 = new Date(gunBas.getTime() + 31*DAY);
for (const [ad, body, g] of GEZ){
  if (body === A.Body.Moon) continue;
  let t = gunBas;
  for (let k = 0; k < 4; k++){ const s = sonrakiBurcGirisi(body, t, DAY/4, 32); if (!s || s.zaman > bit30) break; olay.push({ z: s.zaman, metin: `${g}︎ ${ad} ${YON[s.burc]} geçiyor` }); t = new Date(s.zaman.getTime() + 3600e3); }
}
for (const r of retrolar){
  const body = GEZ.find(x => x[0] === r.ad)[1];
  for (const d of duraklar(body, gunBas, bit30)) olay.push({ z: d.zaman, metin: `${r.g}︎ ${r.ad} ${d.tur === "retro" ? "retro başlıyor" : "düz harekete geçiyor (retro bitiyor)"} · ${dm(d.lon)} ${BURC[burcNo(d.lon)]}` });
}
for (const l of lunasyon) if (l.z < bit30) olay.push({ z: l.z, metin: `${l.tur === "Dolunay" ? "🌕" : "🌑"} ${l.tur} · ${l.derece} ${BURC[l.burc]}` });
for (const e of tutulma) if (e.z < bit30) olay.push({ z: e.z, metin: `${e.tur} · ${e.derece} ${BURC[e.burc]}` });
olay.sort((a,b) => a.z - b.z);

// —— Metinler ——
const retroSimdi = retrolar.filter(r => r.suan).map(r => r.ad);
const sonrakiDolunay = lunasyon.find(l => l.tur === "Dolunay"), sonrakiYeniAy = lunasyon.find(l => l.tur === "Yeni Ay");
const merkur = retrolar.find(r => r.ad === "Merkür");
const merkurMetin = merkur.aktif
  ? `Merkür şu an retro: ${tarih(merkur.aktif.bas.zaman)} tarihinde başladı, ${merkur.aktif.bit ? tarihSaat(merkur.aktif.bit.zaman) + "'de sona eriyor" : "bitiş tarihi hesaplanıyor"}.`
  : (merkur.gelecek[0] ? `Merkür şu an retro değil. Bir sonraki Merkür retrosu ${tarih(merkur.gelecek[0].bas.zaman)} – ${merkur.gelecek[0].bit ? tarih(merkur.gelecek[0].bit.zaman) : "?"} arasında (${dm(merkur.gelecek[0].bas.lon)} ${BURC[burcNo(merkur.gelecek[0].bas.lon)]}).` : "Merkür şu an retro değil.");
const ayMetin = `${tarih(simdi)} günü Ay ${HAL[ay.burc]} (öğle 12:00'de ${ay.derece}), evresi ${ayEvre}, aydınlanma %${ayIsik}.` +
  (ayGecisleri.length ? " " + ayGecisleri.map(s => `Saat ${saat(s.zaman)}'da ${YON[s.burc]} geçiyor.`).join(" ") : (ay.sonraki ? ` Bir sonraki burç değişimi: ${tarihSaat(ay.sonraki.zaman)}, ${YON[ay.sonraki.burc]}.` : ""));

const SSS = [
  ["Ay bugün hangi burçta?", ayMetin],
  ["Şu an retro olan gezegenler hangileri?", retroSimdi.length ? `${tarih(simdi)} itibarıyla retro olan gezegenler: ${retroSimdi.join(", ")}.` : `${tarih(simdi)} itibarıyla retro hareket eden gezegen yok.`],
  ["Merkür retrosu ne zaman?", merkurMetin],
  ["Bir sonraki dolunay ne zaman?", sonrakiDolunay ? `Bir sonraki Dolunay ${tarihSaat(sonrakiDolunay.z)} (Türkiye saati), ${sonrakiDolunay.derece} ${BURC[sonrakiDolunay.burc]} burcunda.` : "—"],
  ["Bir sonraki yeni ay ne zaman?", sonrakiYeniAy ? `Bir sonraki Yeni Ay ${tarihSaat(sonrakiYeniAy.z)} (Türkiye saati), ${sonrakiYeniAy.derece} ${BURC[sonrakiYeniAy.burc]} burcunda.` : "—"],
  ["Güneş şu an hangi burçta?", `${tarih(simdi)} günü Güneş ${HAL[konumlar[0].burc]} (${konumlar[0].derece})${konumlar[0].sonraki ? `; ${tarihSaat(konumlar[0].sonraki.zaman)}'de ${YON[konumlar[0].sonraki.burc]} geçecek` : ""}.`],
];

// —— HTML ——
const ozet = `${tarihGun(simdi)} gökyüzü: Güneş ${HAL[konumlar[0].burc]}, Ay ${HAL[ay.burc]} (${ayEvre}). ${retroSimdi.length ? "Retro: " + retroSimdi.join(", ") + "." : "Retro gezegen yok."}`;
const satir = konumlar.map(k => `<tr><td class="gz-ad"><span class="gz-g">${k.g}︎</span> ${k.ad}</td><td data-l="Burç"><span class="gz-b">${GLIF[k.burc]}</span> ${BURC[k.burc]}</td><td class="gz-d" data-l="Derece">${k.derece}</td><td data-l="Hareket">${k.retro ? '<span class="gz-r">℞ Retro</span>' : (k.hiz == null ? "—" : "Düz")}</td><td data-l="Sonraki burç">${k.sonraki ? `${YON[k.sonraki.burc]}: ${k.ad === "Ay" ? tarihSaat(k.sonraki.zaman) : tarih(k.sonraki.zaman)}` : "—"}</td></tr>`).join("")
  + `<tr><td class="gz-ad"><span class="gz-g">☊︎</span> Kuzey Ay Düğümü</td><td data-l="Burç"><span class="gz-b">${GLIF[burcNo(dugum)]}</span> ${BURC[burcNo(dugum)]}</td><td class="gz-d" data-l="Derece">${dm(dugum)}</td><td data-l="Hareket">Geri (ortalama düğüm)</td><td data-l="Sonraki burç">—</td></tr>`;
const retroSatir = retrolar.map(r => {
  const durum = r.aktif ? `<span class="gz-r">℞ Şu an retro</span> · ${r.aktif.bit ? tarih(r.aktif.bit.zaman) + "'de bitiyor" : ""}` : "Düz hareket";
  const sonraki = r.gelecek[0] ? `${tarih(r.gelecek[0].bas.zaman)} – ${r.gelecek[0].bit ? tarih(r.gelecek[0].bit.zaman) : "…"} <small>(${dm(r.gelecek[0].bas.lon)} ${BURC[burcNo(r.gelecek[0].bas.lon)]}${r.gelecek[0].bit ? " → " + dm(r.gelecek[0].bit.lon) + " " + BURC[burcNo(r.gelecek[0].bit.lon)] : ""})</small>` : "—";
  return `<tr><td class="gz-ad"><span class="gz-g">${r.g}︎</span> ${r.ad}</td><td data-l="Şu an">${durum}</td><td data-l="Sonraki retro">${sonraki}</td></tr>`;
}).join("");
const lunSatir = lunasyon.slice(0, 26).map(l => `<tr><td>${l.tur === "Dolunay" ? "🌕 Dolunay" : "🌑 Yeni Ay"}</td><td>${tarih(l.z)}</td><td>${saat(l.z)}</td><td><span class="gz-b">${GLIF[l.burc]}</span> ${l.derece} ${BURC[l.burc]}</td></tr>`).join("");
const tutSatir = tutulma.map(e => `<tr><td>${e.tur}</td><td>${tarih(e.z)}</td><td>${saat(e.z)}</td><td><span class="gz-b">${GLIF[e.burc]}</span> ${e.derece} ${BURC[e.burc]}</td></tr>`).join("");
const olaySatir = olay.map(o => `<li><b>${kisa(o.z)} · ${saat(o.z)}</b> ${o.metin}</li>`).join("");

const CSS = `<style>
.gz-tablo{overflow-x:auto;border:1px solid var(--line);border-radius:14px;margin:12px 0 6px}
.gz-tablo table{width:100%;border-collapse:collapse;font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;min-width:520px}
.gz-tablo th{background:var(--panel-2);color:var(--gold-soft);text-align:left;padding:9px 11px;font-size:12.5px;font-weight:600}
.gz-tablo td{padding:9px 11px;border-top:1px solid var(--line);color:#efe7f6;vertical-align:top}
.gz-tablo small{color:var(--muted)}
.gz-g{color:var(--gold-soft);display:inline-block;width:1.3em}.gz-b{color:var(--gold)}
.gz-d{font-variant-numeric:tabular-nums;white-space:nowrap}.gz-r{color:#ff9c8f;font-weight:600}
.gz-olay{list-style:none;padding:0;margin:10px 0}.gz-olay li{padding:9px 12px;border:1px solid var(--line);border-radius:12px;margin:6px 0;background:var(--panel);font-family:'Segoe UI',system-ui,sans-serif;font-size:14.5px;color:#efe7f6}
.gz-olay b{color:var(--gold-soft);margin-right:6px}
@media (max-width:640px){
  .gz-tablo table{min-width:0}
  .gz-kart{border:none;overflow:visible}
  .gz-kart thead{display:none}
  .gz-kart table,.gz-kart tbody,.gz-kart tr,.gz-kart td{display:block;width:100%}
  .gz-kart tr{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:10px 12px;margin:0 0 8px}
  .gz-kart td{border:none;padding:0;width:auto}
  .gz-kart td.gz-ad{grid-column:1/-1;font-weight:600;color:var(--gold-soft)}
  .gz-kart td[data-l]::before{content:attr(data-l);display:block;color:var(--muted);font-size:11.5px;letter-spacing:.3px;margin-bottom:1px}
}
.gz-ay{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.gz-ay svg{flex:0 0 84px}
</style>`;
// Ay evresi çizimi (aydınlanma oranına göre)
const ayCiz = (() => { const f = ayIsik/100, buyuyen = ayAci < 180, r = 36, c = 42;
  const x = Math.abs(1 - 2*f) * r, sw = f > 0.5 ? 1 : 0, yon = buyuyen ? 1 : 0;
  const yol = `M${c} ${c-r} A${r} ${r} 0 1 ${yon} ${c} ${c+r} A${x} ${r} 0 1 ${f > 0.5 ? yon : 1-yon} ${c} ${c-r}Z`;
  return `<svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true"><circle cx="${c}" cy="${c}" r="${r}" fill="#2a2147" stroke="#d9b96a" stroke-width="1"/><path d="${yol}" fill="#f3e3b0"/></svg>`; })();

const govde = `
  <div class="kisa-cevap"><b>Bugün (${tarihGun(simdi)}):</b> Güneş ${HAL[konumlar[0].burc]} (${konumlar[0].derece}), Ay ${HAL[ay.burc]} (${ay.derece}, ${ayEvre}, %${ayIsik} aydınlık). ${retroSimdi.length ? `Şu an retro olan gezegenler: <b>${retroSimdi.join(", ")}</b>.` : "Şu an retro olan gezegen yok."} ${sonrakiDolunay ? `Bir sonraki Dolunay: <b>${tarihSaat(sonrakiDolunay.z)}</b> (${BURC[sonrakiDolunay.burc]}).` : ""}</div>
  <p class="yazi-meta" style="text-align:left">Konumlar Türkiye saatiyle bugün 12:00 içindir; tüm saatler Türkiye saatidir (UTC+3). Hesap: astronomi efemerisi, Swiss Ephemeris ile yay saniyesi düzeyinde uyumlu. Sayfa her gece kendiliğinden güncellenir. Son güncelleme: ${tarihSaat(simdi)}.</p>
  <h2>Gezegenler bugün hangi burçta?</h2>
  <div class="gz-tablo gz-kart"><table><thead><tr><th>Gök cismi</th><th>Burç</th><th>Derece</th><th>Hareket</th><th>Sonraki burç</th></tr></thead><tbody>${satir}</tbody></table></div>
  <h2>Ay bugün</h2>
  <div class="gz-ay">${ayCiz}<p style="flex:1 1 260px;margin:0">${esc(ayMetin)}</p></div>
  <p>Ay her burçta yaklaşık iki buçuk gün kalır; duygusal iklimi ve günlük ritmi en hızlı değiştiren gök cismidir. Evrelerin anlamı için <a href="/dolunay-yeni-ay-ay-dongusu.html">Ay döngüsü rehberine</a>, günlük ritüel için <a href="/ay-takvimi.html">Ay takvimine</a> bakabilirsin.</p>
  <h2>Retro gezegenler ve retro takvimi</h2>
  <p>${esc(merkurMetin)} Retro, gezegenin Dünya'dan bakınca geri gidiyormuş gibi görünmesidir; <a href="/retrograd-nedir.html">retrograd nedir?</a> yazısında animasyonla anlatıyoruz.</p>
  <div class="gz-tablo gz-kart"><table><thead><tr><th>Gezegen</th><th>Şu an</th><th>Sonraki retro dönemi</th></tr></thead><tbody>${retroSatir}</tbody></table></div>
  <h2>Önümüzdeki 30 günün gökyüzü olayları</h2>
  <ul class="gz-olay">${olaySatir || "<li>Bu dönemde büyük bir geçiş yok.</li>"}</ul>
  <h2>Yeni Ay ve Dolunay tarihleri (12 ay)</h2>
  <div class="gz-tablo"><table><thead><tr><th>Evre</th><th>Tarih</th><th>Saat</th><th>Burç</th></tr></thead><tbody>${lunSatir}</tbody></table></div>
  ${tutSatir ? `<h2>Yaklaşan tutulmalar</h2><div class="gz-tablo"><table><thead><tr><th>Tutulma</th><th>Tarih</th><th>Saat (en yüksek an)</th><th>Burç</th></tr></thead><tbody>${tutSatir}</tbody></table></div><p class="yazi-meta" style="text-align:left">Tutulmanın Türkiye'den görünüp görünmediği ayrı bir konudur; burada tutulmanın gerçekleştiği an ve burcu verilir.</p>` : ""}
  <h2>Bu gökyüzü sana ne anlatıyor?</h2>
  <p>Bu sayfa herkes için aynı gökyüzünü gösterir. Bu geçişlerin <b>senin</b> haritanda hangi evlere dokunduğunu görmek istersen <a href="/dogum-haritasi-hesaplama.html">ücretsiz doğum haritanı</a> çıkarabilir, önündeki 12 ayı tarih tarih okuyan <a href="/transit-analizi.html">Transit Raporu</a>'na, önemli bir iş için en uygun günü bulan <a href="/secim-astrolojisi-analizi.html">Seçim Astrolojisi</a>'ne ya da bu ayın duygusal haritası için <a href="/lunar-return-analizi.html">Lunar Return</a>'e bakabilirsin. Canlı, saniye saniye değişen gökyüzü için <a href="/gokyuzu.html">Şu An Gökyüzü</a> sayfası da hazır.</p>
  <h2>Sıkça sorulan sorular</h2>
  <div class="sss">${SSS.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
  <p class="yazi-meta" style="text-align:left">Geliştiriciler ve yapay zekâ asistanları için aynı veri makine okunur biçimde: <a href="/gokyuzu.json">gokyuzu.json</a> (günlük güncellenir, kaynak gösterilerek kullanılabilir).</p>
`;
const baslik = `Bugün Gökyüzü: Gezegenler Hangi Burçta? Ay, Retrolar, Dolunay (${tarih(simdi)}) | Astro Yuvam`;
const aciklama = `${tarih(simdi)} gökyüzü: Güneş ${HAL[konumlar[0].burc]}, Ay ${HAL[ay.burc]} (${ayEvre}). ${retroSimdi.length ? "Retro: " + retroSimdi.join(", ") + ". " : ""}Gezegen dereceleri, Merkür retrosu tarihleri, Yeni Ay ve Dolunay takvimi, tutulmalar — her gün güncellenir.`;
const url = SITE + "bugun-gokyuzu.html";
const ld = [
  { "@context":"https://schema.org", "@type":"WebPage", name:"Bugün Gökyüzü — Günlük Gezegen Konumları", url, dateModified: simdi.toISOString(), inLanguage:"tr-TR",
    isPartOf:{ "@type":"WebSite", name:"Astro Yuvam", url: SITE }, description: aciklama },
  { "@context":"https://schema.org", "@type":"FAQPage", mainEntity: SSS.map(([q, a]) => ({ "@type":"Question", name:q, acceptedAnswer:{ "@type":"Answer", text:a } })) },
  { "@context":"https://schema.org", "@type":"Dataset", name:"Astro Yuvam günlük gökyüzü verisi", description:"Güneş, Ay ve gezegenlerin günlük tropikal burç ve dereceleri, retro dönemleri, Yeni Ay/Dolunay ve tutulma tarihleri (Türkiye saati).",
    url, license:"https://astroyuvam.com/hakkimizda.html", creator:{ "@type":"Organization", name:"Astro Yuvam", url: SITE }, dateModified: simdi.toISOString(),
    distribution:[{ "@type":"DataDownload", encodingFormat:"application/json", contentUrl: SITE + "gokyuzu.json" }] },
];
const sayfa = T.BAS + `<title>${esc(baslik)}</title>\n<meta name="description" content="${esc(aciklama)}">\n<link rel="canonical" href="${url}">\n`
  + `<meta property="og:type" content="website">\n<meta property="og:title" content="${esc("Bugün Gökyüzü — " + tarih(simdi))}">\n<meta property="og:description" content="${esc(aciklama)}">\n<meta property="og:url" content="${url}">\n<meta property="og:image" content="${SITE}logo-512.png">\n`
  + `<link rel="icon" href="/favicon-32x32.png" sizes="32x32">\n<link rel="icon" href="/favicon-16x16.png" sizes="16x16">\n`
  + ld.map(x => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join("\n") + "\n" + T.STIL + "\n" + T.EK_STIL + "\n" + CSS + "\n" + T.HEAD_SON + "</head>\n"
  + T.GOVDE_BAS + `<article class="wrap genis">\n  <p class="kicker">Günlük Gökyüzü</p>\n  <h1>Bugün Gökyüzü: Gezegenler Hangi Burçta?</h1>\n  <div class="yazi-meta">${esc(tarihGun(simdi))}</div>\n  <p class="ozet">${esc(ozet)}</p>\n  <hr class="ayrac">\n`
  + govde + `\n  <p class="disclaimer">Astro Yuvam içerikleri öz-farkındalık ve rehberlik amaçlıdır; kesin kehanet niteliği taşımaz. Kararlar her zaman senindir.</p>\n  <p class="geri"><a href="/hakkimizda.html">Hakkımızda</a> · <a href="/fiyatlar.html">Rapor fiyatları</a> · <a href="/ucretsiz-astroloji-araclari.html">Ücretsiz araçlar</a> · <a href="/yildiz-gunlugu.html">Yıldız Günlüğü</a></p>\n</article>` + T.KUYRUK;

const json = {
  kaynak: "Astro Yuvam — https://astroyuvam.com/bugun-gokyuzu.html", guncelleme: simdi.toISOString(), tarih: bugun, saatDilimi: "Europe/Istanbul (UTC+3)",
  not: "Konumlar Türkiye saatiyle 12:00 içindir. Tropikal zodyak, geosentrik görünür konum.",
  gezegenler: konumlar.map(k => ({ ad:k.ad, burc:BURC[k.burc], derece:k.derece, boylam:+k.lon.toFixed(3), retro:k.retro, sonrakiBurc: k.sonraki ? { burc: BURC[k.sonraki.burc], zaman: k.sonraki.zaman.toISOString() } : null })),
  kuzeyAyDugumu: { burc: BURC[burcNo(dugum)], derece: dm(dugum), tip:"ortalama" },
  ay: { burc: BURC[ay.burc], evre: ayEvre, aydinlanmaYuzde: ayIsik, bugunkuGecisler: ayGecisleri.map(s => ({ burc: BURC[s.burc], zaman: s.zaman.toISOString() })) },
  retrolar: retrolar.map(r => ({ gezegen: r.ad, suanRetro: r.suan, aktifDonem: r.aktif ? { bas: r.aktif.bas.zaman.toISOString(), bit: r.aktif.bit ? r.aktif.bit.zaman.toISOString() : null } : null,
    sonrakiDonem: r.gelecek[0] ? { bas: r.gelecek[0].bas.zaman.toISOString(), bit: r.gelecek[0].bit ? r.gelecek[0].bit.zaman.toISOString() : null, basBurc: BURC[burcNo(r.gelecek[0].bas.lon)] } : null })),
  lunasyonlar: lunasyon.map(l => ({ tur: l.tur, zaman: l.z.toISOString(), burc: BURC[l.burc], derece: l.derece })),
  tutulmalar: tutulma.map(e => ({ tur: e.tur, zaman: e.z.toISOString(), burc: BURC[e.burc], derece: e.derece })),
  olaylar30Gun: olay.map(o => ({ zaman: o.z.toISOString(), olay: o.metin.replace(/︎/g, "") })),
};

// —— Güvenlik kontrolleri: bir şey eksikse yazma ——
if (konumlar.length !== 10 || lunasyon.length < 20 || !sayfa.includes("</html>")) { console.error("HATA: eksik veri, dosyalar yazılmadı."); process.exit(1); }
writeFileSync("bugun-gokyuzu.html", sayfa);
writeFileSync("gokyuzu.json", JSON.stringify(json, null, 1));
if (existsSync("sitemap.xml")){
  const sm = readFileSync("sitemap.xml", "utf8");
  const yeni = sm.replace(/(<loc>https:\/\/astroyuvam\.com\/bugun-gokyuzu\.html<\/loc>\s*<lastmod>)[^<]*/, `$1${bugun}`);
  if (yeni !== sm) writeFileSync("sitemap.xml", yeni);
}
console.log("✓ bugun-gokyuzu.html + gokyuzu.json:", bugun, "| retro:", retroSimdi.join(", ") || "yok", "| olay:", olay.length);
