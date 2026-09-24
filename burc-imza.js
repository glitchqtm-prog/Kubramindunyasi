/* Astro Yuvam — Burç İmza Görseli (paylaşımlı, kendi kendine yeten bileşen)
   Kullanım:  <div id="burc-imza" data-sign="0"></div><script src="/burc-imza.js" defer></script>
   data-sign: 0=Koç ... 11=Balık.  CSS'ini kendi içinde enjekte eder; sayfa temasından bağımsız çalışır. */
(function () {
  "use strict";

  var BURCLAR = [
    { ad: "Koç",     glif: "♈︎", el: "fire",  nitelik: "Öncü",     yon: "Mars",             kutup: "+", tarih: "21 Mart – 19 Nisan",   slug: "koc" },
    { ad: "Boğa",    glif: "♉︎", el: "earth", nitelik: "Sabit",    yon: "Venüs",            kutup: "−", tarih: "20 Nisan – 20 Mayıs",  slug: "boga" },
    { ad: "İkizler", glif: "♊︎", el: "air",   nitelik: "Değişken", yon: "Merkür",           kutup: "+", tarih: "21 Mayıs – 20 Haziran",slug: "ikizler" },
    { ad: "Yengeç",  glif: "♋︎", el: "water", nitelik: "Öncü",     yon: "Ay",               kutup: "−", tarih: "21 Haziran – 22 Temmuz",slug: "yengec" },
    { ad: "Aslan",   glif: "♌︎", el: "fire",  nitelik: "Sabit",    yon: "Güneş",            kutup: "+", tarih: "23 Temmuz – 22 Ağustos",slug: "aslan" },
    { ad: "Başak",   glif: "♍︎", el: "earth", nitelik: "Değişken", yon: "Merkür",           kutup: "−", tarih: "23 Ağustos – 22 Eylül",slug: "basak" },
    { ad: "Terazi",  glif: "♎︎", el: "air",   nitelik: "Öncü",     yon: "Venüs",            kutup: "+", tarih: "23 Eylül – 22 Ekim",   slug: "terazi" },
    { ad: "Akrep",   glif: "♏︎", el: "water", nitelik: "Sabit",    yon: "Mars / Plüton",    kutup: "−", tarih: "23 Ekim – 21 Kasım",   slug: "akrep" },
    { ad: "Yay",     glif: "♐︎", el: "fire",  nitelik: "Değişken", yon: "Jüpiter",          kutup: "+", tarih: "22 Kasım – 21 Aralık", slug: "yay" },
    { ad: "Oğlak",   glif: "♑︎", el: "earth", nitelik: "Öncü",     yon: "Satürn",           kutup: "−", tarih: "22 Aralık – 19 Ocak",  slug: "oglak" },
    { ad: "Kova",    glif: "♒︎", el: "air",   nitelik: "Sabit",    yon: "Satürn / Uranüs",  kutup: "+", tarih: "20 Ocak – 18 Şubat",   slug: "kova" },
    { ad: "Balık",   glif: "♓︎", el: "water", nitelik: "Değişken", yon: "Jüpiter / Neptün", kutup: "−", tarih: "19 Şubat – 20 Mart",   slug: "balik" }
  ];

  var EL = {
    fire:  { ad: "Ateş",   renk: "#e0894e", not: "Kıvılcım, atılganlık, irade" },
    earth: { ad: "Toprak", renk: "#8fb98a", not: "Somutluk, sabır, üretkenlik" },
    air:   { ad: "Hava",   renk: "#b9aefc", not: "Fikir, iletişim, ilişki" },
    water: { ad: "Su",     renk: "#6fb3d9", not: "Duygu, sezgi, derinlik" }
  };
  var KUTUP = { "+": "Pozitif / erkil (aktif, dışa dönük)", "−": "Negatif / dişil (alıcı, içe dönük)" };

  var CSS = ''
    + '#burc-imza{--bi-gold:#d9b96a;--bi-gold-soft:#e7cf95;--bi-panel:#1c1733;--bi-panel2:#241c3d;'
    + '--bi-line:#332a4d;--bi-cream:#f0e6d2;--bi-muted:#9a8fb8;margin:26px 0;}'
    + '#burc-imza *{box-sizing:border-box;}'
    + '#burc-imza .bi-kart{background:linear-gradient(160deg,#1c1733,#141020);border:1px solid var(--bi-line);'
    + 'border-radius:18px;padding:20px 20px 22px;box-shadow:0 10px 34px rgba(0,0,0,.34);}'
    + '#burc-imza .bi-ust{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px;}'
    + '#burc-imza .bi-kicker{font:600 12px/1.4 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--bi-gold);}'
    + '#burc-imza .bi-ipucu{font:500 12px/1.4 system-ui,sans-serif;color:var(--bi-muted);margin-left:auto;}'
    + '#burc-imza .bi-grid{display:flex;gap:22px;flex-wrap:wrap;align-items:center;margin-top:10px;}'
    + '#burc-imza .bi-wheel{flex:0 0 300px;max-width:300px;width:100%;margin:0 auto;}'
    + '#burc-imza svg{width:100%;height:auto;display:block;overflow:visible;}'
    + '#burc-imza .bi-glif{cursor:pointer;transition:opacity .25s;}'
    + '#burc-imza .bi-glif:hover{opacity:.75;}'
    + '#burc-imza .bi-glif text{font-family:"Segoe UI Symbol","Noto Sans Symbols2",system-ui,sans-serif;}'
    + '#burc-imza .bi-trig{stroke-linejoin:round;fill:none;}'
    + '#burc-imza .bi-kunye{flex:1 1 260px;min-width:230px;}'
    + '#burc-imza .bi-ad{font:700 26px/1.1 Georgia,serif;color:var(--bi-cream);margin:0 0 2px;}'
    + '#burc-imza .bi-alt{font:500 13px/1.5 system-ui,sans-serif;color:var(--bi-muted);margin:0 0 14px;}'
    + '#burc-imza .bi-sat{display:flex;gap:10px;align-items:baseline;padding:7px 0;border-top:1px solid rgba(255,255,255,.05);}'
    + '#burc-imza .bi-et{flex:0 0 92px;font:600 12.5px/1.4 system-ui,sans-serif;color:var(--bi-muted);text-transform:uppercase;letter-spacing:.04em;}'
    + '#burc-imza .bi-vl{font:600 14.5px/1.45 system-ui,sans-serif;color:var(--bi-cream);}'
    + '#burc-imza .bi-nokta{display:inline-block;width:10px;height:10px;border-radius:50%;vertical-align:middle;margin-right:7px;}'
    + '#burc-imza .bi-kardes{margin-top:15px;}'
    + '#burc-imza .bi-kardes .bi-lbl{font:600 12px/1.4 system-ui,sans-serif;color:var(--bi-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px;}'
    + '#burc-imza .bi-cip{display:inline-flex;align-items:center;gap:6px;text-decoration:none;background:#241c3d;'
    + 'border:1px solid var(--bi-line);border-radius:999px;padding:6px 13px;margin:0 7px 7px 0;'
    + 'font:600 13.5px/1 system-ui,sans-serif;color:var(--bi-cream);transition:border-color .2s,transform .2s;}'
    + '#burc-imza .bi-cip:hover{border-color:var(--bi-gold);transform:translateY(-1px);}'
    + '#burc-imza .bi-cip b{font-size:16px;}'
    + '#burc-imza .bi-git{display:inline-block;margin-top:16px;text-decoration:none;background:linear-gradient(135deg,#d9b96a,#e7cf95);'
    + 'color:#241c3d;font:700 14px/1 system-ui,sans-serif;padding:11px 18px;border-radius:11px;transition:transform .2s,box-shadow .2s;}'
    + '#burc-imza .bi-git:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(217,185,106,.32);}'
    + '@media(max-width:560px){#burc-imza .bi-grid{gap:16px;}#burc-imza .bi-ipucu{margin-left:0;flex-basis:100%;}}'
    + '@media(prefers-reduced-motion:reduce){#burc-imza .bi-trig{transition:none!important;}#burc-imza .bi-glif{transition:none;}}';

  function konum(idx, r) {
    var a = (-90 + idx * 30) * Math.PI / 180;
    return { x: 150 + r * Math.cos(a), y: 150 + r * Math.sin(a) };
  }
  function trigonlar(el) {
    var t = [];
    for (var i = 0; i < 12; i++) if (BURCLAR[i].el === el) t.push(i);
    return t; // 3 üye, 120° arayla
  }
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function render(host, aktif) {
    var b = BURCLAR[aktif], e = EL[b.el], NS = "http://www.w3.org/2000/svg";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    // ---- SVG çark ----
    var svg = '<svg viewBox="0 0 300 300" role="img" aria-label="' + esc(b.ad) + ' burcu ve ' + esc(e.ad) + ' element üçgeni">';
    // dış/iç halka
    svg += '<circle cx="150" cy="150" r="128" fill="none" stroke="#2a2340" stroke-width="1"/>';
    svg += '<circle cx="150" cy="150" r="86" fill="none" stroke="#241d38" stroke-width="1"/>';
    // element üçgeni (aktif burcun elementi)
    var tri = trigonlar(b.el), pts = tri.map(function (i) { return konum(i, 110); });
    var d = "M" + pts[0].x.toFixed(1) + "," + pts[0].y.toFixed(1) +
            "L" + pts[1].x.toFixed(1) + "," + pts[1].y.toFixed(1) +
            "L" + pts[2].x.toFixed(1) + "," + pts[2].y.toFixed(1) + "Z";
    svg += '<path class="bi-trig" id="bi-trig" d="' + d + '" stroke="' + e.renk + '" stroke-width="2" opacity=".85"/>';
    // odak halkası (aktif glif altında)
    var pa = konum(aktif, 110);
    svg += '<circle id="bi-odak" cx="' + pa.x.toFixed(1) + '" cy="' + pa.y.toFixed(1) + '" r="20" fill="' + e.renk + '" opacity=".16"/>';
    svg += '<circle id="bi-halka" cx="' + pa.x.toFixed(1) + '" cy="' + pa.y.toFixed(1) + '" r="20" fill="none" stroke="' + e.renk + '" stroke-width="1.6"/>';
    // 12 glif
    for (var i = 0; i < 12; i++) {
      var p = konum(i, 110), c = BURCLAR[i], ec = EL[c.el].renk;
      var on = (i === aktif);
      svg += '<g class="bi-glif" data-i="' + i + '" role="button" tabindex="0" aria-label="' + esc(c.ad) + '">';
      svg += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="17" fill="transparent"/>';
      svg += '<text x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) + '" text-anchor="middle" dominant-baseline="central" ' +
             'font-size="' + (on ? 26 : 20) + '" fill="' + (on ? ec : "#6f6690") + '" ' +
             (on ? 'font-weight="700"' : '') + '>' + c.glif + '</text>';
      svg += '</g>';
    }
    // merkez: aktif glif + ad
    svg += '<text id="bi-merkez-g" x="150" y="142" text-anchor="middle" dominant-baseline="central" font-size="46" fill="' + e.renk + '">' + b.glif + '</text>';
    svg += '<text id="bi-merkez-a" x="150" y="176" text-anchor="middle" font-size="15" font-weight="700" fill="#f0e6d2" font-family="Georgia,serif">' + esc(b.ad) + '</text>';
    svg += '</svg>';

    // ---- künye ----
    var kardesler = tri.filter(function (i) { return i !== aktif; });
    var kardesHTML = kardesler.map(function (i) {
      var c = BURCLAR[i];
      return '<a class="bi-cip" href="/' + c.slug + '-burcu.html"><b style="color:' + EL[c.el].renk + '">' + c.glif + '</b> ' + esc(c.ad) + '</a>';
    }).join("");

    var kunye = ''
      + '<h3 class="bi-ad" id="bi-ad">' + esc(b.ad) + ' Burcu</h3>'
      + '<p class="bi-alt" id="bi-alt">' + esc(b.tarih) + '</p>'
      + '<div class="bi-sat"><span class="bi-et">Element</span><span class="bi-vl" id="bi-el"><span class="bi-nokta" style="background:' + e.renk + '"></span>' + e.ad + '</span></div>'
      + '<div class="bi-sat"><span class="bi-et">Nitelik</span><span class="bi-vl" id="bi-nit">' + esc(b.nitelik) + '</span></div>'
      + '<div class="bi-sat"><span class="bi-et">Yönetici</span><span class="bi-vl" id="bi-yon">' + esc(b.yon) + '</span></div>'
      + '<div class="bi-sat"><span class="bi-et">Kutup</span><span class="bi-vl" id="bi-kut">' + esc(b.kutup === "+" ? "Pozitif · erkil" : "Negatif · dişil") + '</span></div>'
      + '<div class="bi-kardes"><div class="bi-lbl">Element kardeşleri (' + e.ad + ' üçgeni)</div><div id="bi-kardes-liste">' + kardesHTML + '</div></div>'
      + '<a class="bi-git" id="bi-git" href="/' + b.slug + '-burcu.html">' + esc(b.ad) + ' burcu sayfası →</a>';

    host.innerHTML =
      '<div class="bi-kart">'
      + '<div class="bi-ust"><span class="bi-kicker">✦ Burç İmzası</span>'
      + '<span class="bi-ipucu">Çarktaki bir sembole dokun → o burcun künyesini ve element üçgenini gör</span></div>'
      + '<div class="bi-grid"><div class="bi-wheel">' + svg + '</div><div class="bi-kunye">' + kunye + '</div></div>'
      + '</div>';

    // trigon çizim animasyonu
    var trig = host.querySelector("#bi-trig");
    if (trig && !reduce) {
      try {
        var len = trig.getTotalLength();
        trig.style.strokeDasharray = len;
        trig.style.strokeDashoffset = len;
        trig.style.transition = "stroke-dashoffset .9s ease";
        requestAnimationFrame(function () { requestAnimationFrame(function () { trig.style.strokeDashoffset = 0; }); });
      } catch (err) {}
    }

    // etkileşim
    var glifler = host.querySelectorAll(".bi-glif");
    for (var g = 0; g < glifler.length; g++) {
      (function (node) {
        function sec() { render(host, parseInt(node.getAttribute("data-i"), 10)); }
        node.addEventListener("click", sec);
        node.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); sec(); }
        });
      })(glifler[g]);
    }
  }

  function init() {
    var host = document.getElementById("burc-imza");
    if (!host || host.dataset.hazir) return;
    host.dataset.hazir = "1";
    var st = document.getElementById("burc-imza-css");
    if (!st) { st = document.createElement("style"); st.id = "burc-imza-css"; st.textContent = CSS; document.head.appendChild(st); }
    var idx = parseInt(host.getAttribute("data-sign") || "0", 10);
    if (isNaN(idx) || idx < 0 || idx > 11) idx = 0;
    render(host, idx);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
