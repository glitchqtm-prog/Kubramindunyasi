/* Astro Yuvam — Burç Laboratuvarı (paylaşımlı, veri-güdümlü etkileşimli bileşenler)
   Kullanım: sayfada istediğin yere
     <div class="burc-lab" data-sign="0" data-comp="radar"></div>
     <div class="burc-lab" data-sign="0" data-comp="matris"></div>
     <div class="burc-lab" data-sign="0" data-comp="uyum"></div>
   ve bir kez:  <script src="/burc-lab.js" defer></script>
   data-sign: 0=Koç … 11=Balık.  CSS'ini kendi enjekte eder; sayfa temasından bağımsız çalışır.
   prefers-reduced-motion'a saygılıdır. */
(function () {
  "use strict";

  var EL = {
    fire:  { ad: "Ateş",   renk: "#e0794f" },
    earth: { ad: "Toprak", renk: "#b79a5a" },
    air:   { ad: "Hava",   renk: "#6aa9d6" },
    water: { ad: "Su",     renk: "#5fb3a3" }
  };
  // eksenler: radar için 6 özellik (tüm burçlarda ortak)
  var EKSEN = ["Enerji", "Liderlik", "Tutku", "Sabır", "İletişim", "Duygu"];

  // idx: 0..11 ; t: [Enerji,Liderlik,Tutku,Sabır,İletişim,Duygu]
  var B = [
    { ad:"Koç",     glif:"♈︎", el:"fire",  nitelik:"Öncü",     yon:"Mars",             tarih:"21 Mart – 19 Nisan",   ing:"Aries",       mevsim:"İlkbaharın başlangıcı", slug:"koc",     t:[95,92,88,30,65,50] },
    { ad:"Boğa",    glif:"♉︎", el:"earth", nitelik:"Sabit",    yon:"Venüs",            tarih:"20 Nisan – 20 Mayıs",  ing:"Taurus",      mevsim:"İlkbaharın ortası",     slug:"boga",    t:[55,60,72,95,55,65] },
    { ad:"İkizler", glif:"♊︎", el:"air",   nitelik:"Değişken", yon:"Merkür",           tarih:"21 Mayıs – 20 Haziran",ing:"Gemini",      mevsim:"İlkbaharın sonu",       slug:"ikizler", t:[80,58,60,40,95,50] },
    { ad:"Yengeç",  glif:"♋︎", el:"water", nitelik:"Öncü",     yon:"Ay",               tarih:"21 Haziran – 22 Temmuz",ing:"Cancer",     mevsim:"Yazın başlangıcı",      slug:"yengec",  t:[55,66,66,72,60,95] },
    { ad:"Aslan",   glif:"♌︎", el:"fire",  nitelik:"Sabit",    yon:"Güneş",            tarih:"23 Temmuz – 22 Ağustos",ing:"Leo",        mevsim:"Yazın ortası",          slug:"aslan",   t:[88,95,90,55,75,65] },
    { ad:"Başak",   glif:"♍︎", el:"earth", nitelik:"Değişken", yon:"Merkür",           tarih:"23 Ağustos – 22 Eylül", ing:"Virgo",      mevsim:"Yazın sonu",            slug:"basak",   t:[60,60,50,88,78,55] },
    { ad:"Terazi",  glif:"♎︎", el:"air",   nitelik:"Öncü",     yon:"Venüs",            tarih:"23 Eylül – 22 Ekim",    ing:"Libra",      mevsim:"Sonbaharın başlangıcı", slug:"terazi",  t:[60,72,65,60,90,68] },
    { ad:"Akrep",   glif:"♏︎", el:"water", nitelik:"Sabit",    yon:"Mars / Plüton",    tarih:"23 Ekim – 21 Kasım",    ing:"Scorpio",    mevsim:"Sonbaharın ortası",     slug:"akrep",   t:[80,80,98,75,60,92] },
    { ad:"Yay",     glif:"♐︎", el:"fire",  nitelik:"Değişken", yon:"Jüpiter",          tarih:"22 Kasım – 21 Aralık",  ing:"Sagittarius",mevsim:"Sonbaharın sonu",       slug:"yay",     t:[90,72,80,40,82,55] },
    { ad:"Oğlak",   glif:"♑︎", el:"earth", nitelik:"Öncü",     yon:"Satürn",           tarih:"22 Aralık – 19 Ocak",   ing:"Capricorn",  mevsim:"Kışın başlangıcı",      slug:"oglak",   t:[70,90,60,92,62,48] },
    { ad:"Kova",    glif:"♒︎", el:"air",   nitelik:"Sabit",    yon:"Satürn / Uranüs",  tarih:"20 Ocak – 18 Şubat",    ing:"Aquarius",   mevsim:"Kışın ortası",          slug:"kova",    t:[72,70,60,65,88,55] },
    { ad:"Balık",   glif:"♓︎", el:"water", nitelik:"Değişken", yon:"Jüpiter / Neptün", tarih:"19 Şubat – 20 Mart",    ing:"Pisces",     mevsim:"Kışın sonu",            slug:"balik",   t:[50,52,70,68,65,96] }
  ];

  // ——— Uyum: açısal ilişkiye göre skor + not (tüm harita değil, sembolik güneş-burcu çerçevesi) ———
  function uyum(i, j) {
    var d = ((j - i) % 12 + 12) % 12;
    var g = Math.min(d, 12 - d); // 0..6
    var tablo = {
      0: { s: 70, k: "Aynı burç", n: "Güçlü bir ayna: benzerlik hem konfor hem de tanıdık bir meydan okuma getirir." },
      1: { s: 62, k: "Komşu",     n: "Komşu enerjiler — tanıdık ama farklı; küçük ayarlarla yumuşayan bir bağ." },
      2: { s: 84, k: "Altmışlık", n: "Birbirini besleyen elementler: kolay iletişim ve destekleyici, akıcı bir çekim." },
      3: { s: 54, k: "Kare",      n: "Farklı ritimler — kıvılcımlı ve büyütücü; sabır ve anlayışla güçlenir." },
      4: { s: 92, k: "Üçgen",     n: "Aynı elementten: doğal bir akış, ortak bir dil ve rahat, sıcak bir uyum." },
      5: { s: 58, k: "Ayarlama",  n: "Farklı diller konuşurlar; uyum için ayar ister ama çok şey öğretir." },
      6: { s: 76, k: "Karşıt",    n: "Zodyağın karşıt ucu — manyetik bir çekim; denge kurulursa birbirini tamamlar." }
    };
    return tablo[g];
  }

  var CSS = ''
    + '.blab{--bl-gold:#d9b96a;--bl-gold2:#e7cf95;--bl-panel:#1c1733;--bl-panel2:#241c3d;--bl-line:#332a4d;--bl-cream:#f0e6d2;--bl-muted:#9a8fb8;'
    + '--fire:#e0794f;--earth:#b79a5a;--air:#6aa9d6;--water:#5fb3a3;margin:22px 0;font-family:"Segoe UI",system-ui,sans-serif}'
    + '.blab *{box-sizing:border-box}'
    + '.blab .kart{background:linear-gradient(160deg,#1c1733,#141020);border:1px solid var(--bl-line);border-radius:18px;padding:18px 18px 20px;box-shadow:0 10px 34px rgba(0,0,0,.30)}'
    + '.blab .kick{font:600 11.5px/1.4 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--bl-gold);margin-bottom:2px}'
    + '.blab .bas{font:700 19px/1.2 Georgia,serif;color:var(--bl-cream);margin:0 0 3px}'
    + '.blab .ipu{font:500 12.5px/1.5 system-ui,sans-serif;color:var(--bl-muted);margin:0 0 12px}'
    + '.blab svg{display:block;width:100%;height:auto;overflow:visible}'
    + '.blab svg text{font-family:"Segoe UI",system-ui,sans-serif}'
    // radar
    + '.blab .rlejant{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:6px}'
    + '.blab .rlejant span{font:600 12px/1 system-ui,sans-serif;color:var(--bl-muted)}'
    + '.blab .rlejant b{color:var(--bl-cream)}'
    // matris
    + '.blab .mtablo{width:100%;border-collapse:separate;border-spacing:7px}'
    + '.blab .mtablo th{font:600 11px/1.2 system-ui,sans-serif;color:var(--bl-muted);text-transform:uppercase;letter-spacing:.06em;padding:2px;text-align:center}'
    + '.blab .mtablo th.el{text-align:right;white-space:nowrap;padding-right:6px}'
    + '.blab .hucre{display:flex;flex-direction:column;align-items:center;gap:2px;background:#241c3d;border:1px solid var(--bl-line);border-radius:11px;padding:9px 4px;cursor:pointer;color:var(--bl-cream);text-decoration:none;transition:transform .18s,border-color .18s,background .18s}'
    + '.blab .hucre:hover{transform:translateY(-2px);border-color:var(--bl-gold)}'
    + '.blab .hucre .hg{font-size:22px;line-height:1}'
    + '.blab .hucre .hn{font:600 12px/1.1 system-ui,sans-serif}'
    + '.blab .hucre.akt{border-color:var(--bl-gold);background:rgba(217,185,106,.14);box-shadow:0 0 0 1px var(--bl-gold) inset}'
    + '.blab .mnot{margin-top:12px;font:500 13px/1.6 system-ui,sans-serif;color:var(--bl-cream)}'
    + '.blab .mnot b{color:var(--bl-gold2)}'
    // uyum
    + '.blab .ucips{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin-bottom:14px}'
    + '.blab .ucip{display:inline-flex;align-items:center;gap:5px;background:#241c3d;border:1px solid var(--bl-line);border-radius:999px;padding:6px 11px;cursor:pointer;color:var(--bl-cream);font:600 13px/1 system-ui,sans-serif;transition:border-color .18s,transform .18s}'
    + '.blab .ucip:hover{border-color:var(--bl-gold);transform:translateY(-1px)}'
    + '.blab .ucip.akt{border-color:var(--bl-gold);background:rgba(217,185,106,.14)}'
    + '.blab .ucip b{font-size:15px}'
    + '.blab .upanel{background:#241c3d;border:1px solid var(--bl-line);border-radius:13px;padding:14px 15px}'
    + '.blab .ubas{display:flex;align-items:center;gap:9px;margin-bottom:9px}'
    + '.blab .ubas .ig{font-size:26px}'
    + '.blab .ubas .it{font:700 15px/1.2 Georgia,serif;color:var(--bl-cream)}'
    + '.blab .ubas .ik{margin-left:auto;font:600 11px/1 system-ui,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:var(--bl-gold);border:1px solid var(--bl-line);border-radius:999px;padding:5px 10px}'
    + '.blab .ubar{height:9px;border-radius:6px;background:#15111f;overflow:hidden;margin:8px 0 4px}'
    + '.blab .ubar i{display:block;height:100%;width:0;border-radius:6px;background:linear-gradient(90deg,var(--bl-gold),var(--bl-gold2));transition:width .7s ease}'
    + '.blab .uskor{font:700 13px/1 system-ui,sans-serif;color:var(--bl-gold2);text-align:right}'
    + '.blab .unot{font:500 13px/1.6 system-ui,sans-serif;color:var(--bl-cream);margin-top:7px}'
    + '@media(max-width:560px){.blab .hucre .hn{font-size:10.5px}.blab .ubas .ik{display:none}}'
    + '@media(prefers-reduced-motion:reduce){.blab *{transition:none!important;animation:none!important}}';

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function reduce(){ return window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches; }

  // ——— RADAR ———
  function radar(host, i) {
    var b = B[i], renk = EL[b.el].renk, C = 130, R = 96, n = 6;
    function pt(k, r) { var a = (-90 + k * (360 / n)) * Math.PI / 180; return [C + r * Math.cos(a), C + r * Math.sin(a)]; }
    var svg = '<svg viewBox="-38 -12 336 296" role="img" aria-label="' + esc(b.ad) + ' kişilik radarı">';
    // grid halkaları
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var d = ""; for (var k = 0; k < n; k++) { var p = pt(k, R * f); d += (k ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); }
      svg += '<path d="' + d + 'Z" fill="none" stroke="#2c2545" stroke-width="1"/>';
    });
    // eksen çizgileri + etiketler
    for (var k = 0; k < n; k++) {
      var pe = pt(k, R), pl = pt(k, R + 22);
      svg += '<line x1="' + C + '" y1="' + C + '" x2="' + pe[0].toFixed(1) + '" y2="' + pe[1].toFixed(1) + '" stroke="#2c2545" stroke-width="1"/>';
      var anc = Math.abs(pl[0] - C) < 6 ? "middle" : (pl[0] > C ? "start" : "end");
      svg += '<text x="' + pl[0].toFixed(1) + '" y="' + (pl[1] + 4).toFixed(1) + '" text-anchor="' + anc + '" font-size="12" font-weight="600" fill="#9a8fb8">' + EKSEN[k] + '</text>';
    }
    // veri poligonu
    var dd = "", pts = [];
    for (var k2 = 0; k2 < n; k2++) { var v = Math.max(0, Math.min(100, b.t[k2])) / 100; var p2 = pt(k2, R * v); pts.push(p2); dd += (k2 ? "L" : "M") + p2[0].toFixed(1) + "," + p2[1].toFixed(1); }
    dd += "Z";
    svg += '<path id="rpoly" d="' + dd + '" fill="' + renk + '33" stroke="' + renk + '" stroke-width="2.2" stroke-linejoin="round" style="transform-box:fill-box;transform-origin:center"/>';
    pts.forEach(function (p) { svg += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.2" fill="' + renk + '"/>'; });
    svg += '</svg>';

    host.innerHTML = '<div class="kart"><div class="kick">✦ Kişilik Radarı</div>'
      + '<h3 class="bas">' + esc(b.ad) + ' — Baskın Enerjiler</h3>'
      + '<p class="ipu">Altı eksende ' + esc(b.ad) + ' burcunun sembolik vurguları. Değerler kesin ölçüm değil, arketip eğilimidir.</p>'
      + svg
      + '<div class="rlejant"><span>En güçlü: <b>' + EKSEN[enBuyuk(b.t)] + '</b></span><span>Gelişim alanı: <b>' + EKSEN[enKucuk(b.t)] + '</b></span></div></div>';

    var poly = host.querySelector("#rpoly");
    if (poly && !reduce()) {
      poly.style.opacity = 0; poly.style.transform = "scale(.2)"; poly.style.transition = "transform .8s cubic-bezier(.2,.8,.2,1),opacity .8s";
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ poly.style.opacity = 1; poly.style.transform = "scale(1)"; }); });
    }
  }
  function enBuyuk(a){ var m=0; for(var i=1;i<a.length;i++) if(a[i]>a[m]) m=i; return m; }
  function enKucuk(a){ var m=0; for(var i=1;i<a.length;i++) if(a[i]<a[m]) m=i; return m; }

  // ——— ELEMENT × NİTELİK MATRİSİ ———
  var NITELIK = ["Öncü", "Sabit", "Değişken"];
  var ELSIRA = ["fire", "earth", "air", "water"];
  function matris(host, i) {
    var aktif = B[i];
    var bul = function (el, nit) { for (var x = 0; x < 12; x++) if (B[x].el === el && B[x].nitelik === nit) return x; return -1; };
    var satirlar = "";
    ELSIRA.forEach(function (el) {
      var hucreler = NITELIK.map(function (nit) {
        var idx = bul(el, nit), c = B[idx], on = (idx === i);
        return '<td><a class="hucre' + (on ? " akt" : "") + '" href="/' + c.slug + '-burcu.html" data-i="' + idx + '" '
          + 'style="border-color:' + (on ? EL[el].renk : "var(--bl-line)") + '">'
          + '<span class="hg" style="color:' + EL[el].renk + '">' + c.glif + '</span>'
          + '<span class="hn">' + esc(c.ad) + '</span></a></td>';
      }).join("");
      satirlar += '<tr><th class="el" style="color:' + EL[el].renk + '">' + EL[el].ad + '</th>' + hucreler + '</tr>';
    });
    host.innerHTML = '<div class="kart"><div class="kick">✦ Zodyak Konum Matrisi</div>'
      + '<h3 class="bas">' + esc(aktif.ad) + ' Nerede Durur?</h3>'
      + '<p class="ipu">Her burç bir <b style="color:var(--bl-gold2)">element</b> ve bir <b style="color:var(--bl-gold2)">nitelikle</b> tek bir kareye oturur. ' + esc(aktif.ad) + ': <b style="color:' + EL[aktif.el].renk + '">' + EL[aktif.el].ad + ' · ' + esc(aktif.nitelik) + '</b>. Bir kareye dokun, o burcun sayfasına git.</p>'
      + '<table class="mtablo"><tr><th></th><th>' + NITELIK.join("</th><th>") + '</th></tr>' + satirlar + '</table>'
      + '<div class="mnot" id="mnot">✦ <b>' + esc(aktif.ad) + '</b>, ' + EL[aktif.el].ad.toLowerCase() + ' elementinin ' + esc(aktif.nitelik).toLowerCase() + ' burcudur.</div></div>';
  }

  // ——— UYUM GEZGİNİ ———
  function uyumGezgini(host, i) {
    var b = B[i];
    // en uyumlu varsayılan (üçgen/aynı element) — ilk trine
    var varsayilan = i;
    for (var d = 4; d <= 8; d += 4) { varsayilan = (i + d) % 12; break; }
    var cips = B.map(function (c, j) {
      if (j === i) return "";
      return '<button class="ucip" data-j="' + j + '" type="button"><b style="color:' + EL[c.el].renk + '">' + c.glif + '</b> ' + esc(c.ad) + '</button>';
    }).join("");
    host.innerHTML = '<div class="kart"><div class="kick">✦ Uyum Gezgini</div>'
      + '<h3 class="bas">' + esc(b.ad) + ' Kiminle Anlaşır?</h3>'
      + '<p class="ipu">Bir burca dokun, ' + esc(b.ad) + ' ile sembolik uyumunu gör. Gerçek uyum tüm doğum haritasına bağlıdır; bu, güneş burcu çerçevesinde bir başlangıçtır.</p>'
      + '<div class="ucips">' + cips + '</div>'
      + '<div class="upanel" id="upanel"></div></div>';

    function goster(j) {
      var c = B[j], u = uyum(i, j);
      var panel = host.querySelector("#upanel");
      panel.innerHTML = '<div class="ubas"><span class="ig" style="color:' + EL[c.el].renk + '">' + c.glif + '</span>'
        + '<span class="it">' + esc(b.ad) + ' & ' + esc(c.ad) + '</span><span class="ik">' + u.k + '</span></div>'
        + '<div class="ubar"><i id="ubarfill"></i></div><div class="uskor">' + u.s + '%</div>'
        + '<div class="unot">' + u.n + '</div>';
      var f = panel.querySelector("#ubarfill");
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ f.style.width = u.s + "%"; }); });
      var cipsler = host.querySelectorAll(".ucip");
      for (var x = 0; x < cipsler.length; x++) cipsler[x].classList.toggle("akt", +cipsler[x].getAttribute("data-j") === j);
    }
    var btns = host.querySelectorAll(".ucip");
    for (var x = 0; x < btns.length; x++) (function (btn) {
      btn.addEventListener("click", function () { goster(+btn.getAttribute("data-j")); });
    })(btns[x]);
    goster(varsayilan);
  }

  function initOne(host) {
    if (host.dataset.hazir) return;
    host.dataset.hazir = "1";
    host.classList.add("blab");
    var i = parseInt(host.getAttribute("data-sign") || "0", 10);
    if (isNaN(i) || i < 0 || i > 11) i = 0;
    var comp = host.getAttribute("data-comp");
    if (comp === "radar") radar(host, i);
    else if (comp === "matris") matris(host, i);
    else if (comp === "uyum") uyumGezgini(host, i);
  }

  function init() {
    if (!document.getElementById("burc-lab-css")) {
      var st = document.createElement("style"); st.id = "burc-lab-css"; st.textContent = CSS; document.head.appendChild(st);
    }
    var hepsi = document.querySelectorAll(".burc-lab");
    for (var k = 0; k < hepsi.length; k++) initOne(hepsi[k]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
