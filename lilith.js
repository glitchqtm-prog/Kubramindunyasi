/* lilith.js — Astro Yuvam "Lilith burcu hesaplama" sayfası.
 * Ortalama Lilith: analitik formül (Meeus ortalama perije + 180°, Ay yörüngesinden ekliptiğe izdüşüm) — Swiss Ephemeris ile ±0,005°.
 * Gerçek (salınımlı) Lilith: Ay'ın anlık konum/hız vektöründen oskülasyon elipsinin apojesi (astronomy-engine) — Swiss Ephemeris ile ort. ±0,06°.
 * Evler: Astro Yuvam sunucusu (Placidus). */
(function () {
  "use strict";
  var API = "https://astro-rapor.onrender.com/api/harita";
  var VS = "︎", LIL = "⚸" + VS;
  var BN = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
  var DE = ["Koç'ta","Boğa'da","İkizler'de","Yengeç'te","Aslan'da","Başak'ta","Terazi'de","Akrep'te","Yay'da","Oğlak'ta","Kova'da","Balık'ta"];
  var YE = ["Koç'a","Boğa'ya","İkizler'e","Yengeç'e","Aslan'a","Başak'a","Terazi'ye","Akrep'e","Yay'a","Oğlak'a","Kova'ya","Balık'a"];
  var SL = ["koc","boga","ikizler","yengec","aslan","basak","terazi","akrep","yay","oglak","kova","balik"];
  var GL = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  var AYL = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  var PG = {"Güneş":"☉","Ay":"☽","Merkür":"☿","Venüs":"♀","Mars":"♂","Jüpiter":"♃","Satürn":"♄","Uranüs":"♅","Neptün":"♆","Plüton":"♇"};
  var ACIK = {"Güneş":"gunes","Ay":"ay","Merkür":"merkur","Venüs":"venus","Mars":"mars","Jüpiter":"jupiter","Satürn":"saturn","Uranüs":"uranus","Neptün":"neptun","Plüton":"pluton","Yükselen":"yukselen","MC":"mc"};
  var R = Math.PI / 180;
  function $(s, k) { return (k || document).querySelector(s); }
  function norm(d) { return ((d % 360) + 360) % 360; }
  function fark(a, b) { return norm(a - b + 180) - 180; }
  function sg(l) { return Math.floor(norm(l) / 30); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function derece(l) { var x = norm(l) % 30, d = Math.floor(x), m = Math.round((x - d) * 60); if (m === 60) { d++; m = 0; } return d + "°" + String(m).padStart(2, "0") + "′"; }
  function konum(l) { return GL[sg(l)] + VS + " " + BN[sg(l)] + " " + derece(l); }
  function trT(d) { return d.getDate() + " " + AYL[d.getMonth()] + " " + d.getFullYear(); }
  function jdOf(t) { return t / 864e5 + 2440587.5; }
  function dateOf(jd) { return new Date((jd - 2440587.5) * 864e5); }
  function yukle(src, hazir) {
    return new Promise(function (ok, no) {
      if (hazir()) return ok();
      var v = document.querySelector('script[src="' + src + '"]');
      if (v) { var t = setInterval(function () { if (hazir()) { clearInterval(t); ok(); } }, 40); return; }
      var s = document.createElement("script"); s.src = src; s.async = true; s.onload = ok; s.onerror = no; document.head.appendChild(s);
    });
  }
  function astro() { return yukle("/astronomy.browser.min.js", function () { return !!window.Astronomy; }); }

  /* ---------- Lilith hesapları ---------- */
  function ortalama(jd) {
    var T = (jd - 2451545) / 36525;
    var P = 83.3532465 + 4069.0137287 * T - 0.0103200 * T * T - T * T * T / 80053 + T * T * T * T / 18999000;
    var Om = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441 - T * T * T * T / 60616000;
    var u = (P + 180 - Om) * R, i = 5.1453964 * R;
    return norm(Om + Math.atan2(Math.cos(i) * Math.sin(u), Math.cos(u)) / R);
  }
  var AU = 149597870.7, MU = (398600.4418 + 4902.800066) * 86400 * 86400 / (AU * AU * AU);
  function gercek(jd) {
    var A = window.Astronomy, t = dateOf(jd), s = A.GeoMoonState(t);
    var r = [s.x, s.y, s.z], v = [s.vx, s.vy, s.vz];
    function cr(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    var h = cr(r, v), vh = cr(v, h), rl = Math.hypot(r[0], r[1], r[2]);
    var e = [vh[0] / MU - r[0] / rl, vh[1] / MU - r[1] / rl, vh[2] / MU - r[2] / rl];
    var ec = A.RotateVector(A.Rotation_EQJ_ECT(t), new A.Vector(-e[0], -e[1], -e[2], new A.AstroTime(t)));
    return norm(Math.atan2(ec.y, ec.x) / R);
  }
  var HIZ = 360 / 3232.6; // ortalama Lilith, derece/gün
  // Ortalama Lilith'in hedef boylama ulaştığı an (tek yönlü ilerlediği için Newton ile)
  function ulas(hedef, jdBas) {
    var jd = jdBas + norm(hedef - ortalama(jdBas)) / HIZ;
    for (var k = 0; k < 6; k++) jd -= fark(ortalama(jd), hedef) / HIZ;
    return jd;
  }

  // Türkiye saat dilimi (yaklaşık) — sunucudaki Ay konumuyla sonradan düzeltilir
  function trOfset(y, m, d) {
    if (y > 2016 || (y === 2016 && (m > 9 || (m === 9 && d >= 7)))) return 3;
    if (y >= 1985 || (y >= 1972 && y <= 1978)) { var yaz = (m > 3 && m < 10) || (m === 3 && d >= 25) || (m === 10 && d <= 25); return yaz ? 3 : 2; }
    return 2;
  }
  function yerelJD(tarih, saat) {
    var p = tarih.split("-").map(Number), hh = (saat || "12:00").split(":").map(Number);
    return jdOf(Date.UTC(p[0], p[1] - 1, p[2], hh[0] - trOfset(p[0], p[1], p[2]), hh[1]));
  }

  /* ---------- şu an Lilith ---------- */
  function simdi() {
    var k = $('[data-lilith="simdi"]'); if (!k) return;
    var jd = jdOf(Date.now()), l = ortalama(jd), b = sg(l), sonraki = (b + 1) % 12;
    var gun = Math.ceil((ulas(sonraki * 30, jd) - jd));
    $(".li-s-b", k).textContent = BN[b] + " " + Math.floor(l % 30) + "°";
    $(".li-s-n", k).textContent = YE[sonraki] + " geçişine yaklaşık " + gun + " gün";
  }

  /* ---------- metinleri sayfadan al (içerik iki kez indirilmesin) ---------- */
  function burcMetni(b) { var s = document.getElementById("lilith-" + SL[b]); if (!s) return ""; var ps = s.querySelectorAll("p:not(.li-oz)"); return ps.length ? ps[0].textContent : ""; }
  function burcOz(b) { var s = document.getElementById("lilith-" + SL[b]); var o = s && s.querySelector(".li-oz"); return o ? o.textContent : ""; }
  function evMetni(n) { var s = document.getElementById("lilith-ev-" + n); var p = s && s.querySelector("p"); return p ? p.textContent : ""; }
  function aciMetni(ad) { var s = document.getElementById("aci-" + ACIK[ad]); var p = s && s.querySelector("p"); return p ? p.textContent : ""; }

  /* ---------- harita (sunucu) ---------- */
  function haritaGetir(g) {
    var anahtar = [g.birthDate, g.birthTime, g.birthPlace].join("|");
    try { var c = JSON.parse(localStorage.getItem("ay_natal_v1") || "null"); if (c && c.k === anahtar && c.v && c.v.ok) return Promise.resolve(c.v); } catch (e) {}
    var b = { name: "", birthDate: g.birthDate, birthPlace: g.birthPlace }; if (g.birthTime) b.birthTime = g.birthTime;
    return fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) })
      .then(function (r) { return r.json().then(function (j) { if (r.status === 429) throw new Error(j.mesaj || "Bugünlük hesaplama hakkın doldu, yarın tekrar dene."); return j; }); })
      .then(function (j) { if (j && j.ok) { delete j.cark; try { localStorage.setItem("ay_natal_v1", JSON.stringify({ k: anahtar, v: j })); } catch (e) {} } return j; });
  }
  function hazirla(j) {
    var N = { p: {}, cusp: null };
    (j.gezegenler || []).forEach(function (x) { var i = BN.indexOf(x.burc); if (i >= 0) N.p[x.ad] = { lon: i * 30 + (+x.derece || 0), ev: x.ev }; });
    if (j.yukselen) N.asc = BN.indexOf(j.yukselen.burc) * 30 + (+j.yukselen.derece || 0);
    if (j.mc) N.mc = BN.indexOf(j.mc.burc) * 30 + (+j.mc.derece || 0);
    if (j.evler && j.evler.length === 12) N.cusp = j.evler.slice().sort(function (a, b) { return a.ev - b.ev; }).map(function (e) { return BN.indexOf(e.burc) * 30 + (+e.derece || 0); });
    return N;
  }
  function evBul(N, l) { if (!N || !N.cusp) return null; for (var i = 0; i < 12; i++) { var a = N.cusp[i], b = N.cusp[(i + 1) % 12]; if (norm(l - a) < norm(b - a)) return i + 1; } return 1; }
  // Doğum anını sunucudaki Ay konumuyla düzelt (saat dilimi farkını giderir; Ay saatte ~0,55° ilerler)
  function jdDuzelt(jd, N) {
    if (!N.p["Ay"] || !window.Astronomy) return jd;
    for (var k = 0; k < 3; k++) {
      var l = window.Astronomy.EclipticGeoMoon(dateOf(jd)).lon, l2 = window.Astronomy.EclipticGeoMoon(dateOf(jd + 1 / 24)).lon;
      var hiz = fark(l2, l); if (Math.abs(hiz) < 0.2) break;
      var d = fark(N.p["Ay"].lon, l) / hiz / 24; if (Math.abs(d) > 1) break;
      jd += d;
    }
    return jd;
  }

  /* ---------- mini çark ---------- */
  function cark(N, lm, lt) {
    var cx = 140, cy = 140, r1 = 130, r2 = 104, r3 = 80, asc = N && N.asc != null ? N.asc : 0;
    function nk(l, r) { var a = (180 + (l - asc)) * R; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; }
    var s = '<svg viewBox="0 0 280 280" role="img" aria-label="Doğum haritanda Lilith\'in konumu">';
    s += '<circle cx="140" cy="140" r="' + r1 + '" fill="#130f22" stroke="#332a4d"/>';
    for (var b = 0; b < 12; b++) {
      var p0 = nk(b * 30, r1), p1 = nk(b * 30, r2), m = nk(b * 30 + 15, (r1 + r2) / 2);
      s += '<line x1="' + p0[0].toFixed(1) + '" y1="' + p0[1].toFixed(1) + '" x2="' + p1[0].toFixed(1) + '" y2="' + p1[1].toFixed(1) + '" stroke="#332a4d"/>';
      s += '<text x="' + m[0].toFixed(1) + '" y="' + m[1].toFixed(1) + '" font-size="13" fill="' + (b === sg(lm) ? "#e7cf95" : "#9a8fb8") + '">' + GL[b] + VS + '</text>';
    }
    s += '<circle cx="140" cy="140" r="' + r2 + '" fill="none" stroke="#4a3f6b"/>';
    if (N && N.cusp) N.cusp.forEach(function (c, i) { var a = nk(c, r2), z = nk(c, 18); s += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + z[0].toFixed(1) + '" y2="' + z[1].toFixed(1) + '" stroke="' + (i === 0 || i === 9 ? "rgba(217,185,106,.6)" : "rgba(154,143,184,.22)") + '" stroke-width="' + (i === 0 || i === 9 ? 1.4 : 1) + '"/>'; var mm = nk(c + fark(N.cusp[(i + 1) % 12], c) / 2 + 0, 30); s += '<text x="' + mm[0].toFixed(1) + '" y="' + mm[1].toFixed(1) + '" font-size="9" fill="#6f6690" font-family="Segoe UI,sans-serif">' + (i + 1) + '</text>'; });
    if (N && N.p) Object.keys(N.p).forEach(function (ad) { if (!PG[ad]) return; var q = nk(N.p[ad].lon, r3); s += '<text x="' + q[0].toFixed(1) + '" y="' + q[1].toFixed(1) + '" font-size="12" fill="#cfc4e6">' + PG[ad] + VS + '</text>'; });
    function nokta(l, renk, et, rr) { var q = nk(l, rr), t = nk(l, r2); s += '<line x1="' + t[0].toFixed(1) + '" y1="' + t[1].toFixed(1) + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '" stroke="' + renk + '" stroke-width="1.2"/><circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="11" fill="#1c1733" stroke="' + renk + '" stroke-width="1.6"/><text x="' + q[0].toFixed(1) + '" y="' + q[1].toFixed(1) + '" font-size="13" fill="' + renk + '">' + et + '</text>'; }
    if (lt != null && Math.abs(fark(lt, lm)) > 4) nokta(lt, "#9a8fb8", LIL, 58);
    nokta(lm, "#e7cf95", LIL, 58);
    if (N && N.asc != null) { var aa = nk(N.asc, r1 + 2); s += '<text x="' + (aa[0] + 12).toFixed(1) + '" y="' + (aa[1] - 8).toFixed(1) + '" font-size="9.5" fill="#e7cf95" font-family="Segoe UI,sans-serif">ASC</text>'; }
    return s + "</svg>";
  }
  function kart(b, deg, metin, alt, ana) { return '<div class="li-kart' + (ana ? " ana" : "") + '"><div class="li-kb">' + esc(b) + '</div><div class="li-deg">' + deg + "</div>" + (metin ? "<p>" + esc(metin) + "</p>" : "") + (alt ? '<p class="li-kucuk">' + alt + "</p>" : "") + "</div>"; }

  /* ---------- sonuç ---------- */
  function sonuc(k, g, N, jd) {
    var out = $(".li-sonuc", k), lm = ortalama(jd), lt = window.Astronomy ? gercek(jd) : null, bm = sg(lm), bt = lt != null ? sg(lt) : null;
    var ev = N ? evBul(N, lm) : null, saat = !!(N && N.cusp);
    var h = [];
    h.push(kart("Ortalama Lilith burcun", konum(lm) + (ev ? " · " + ev + ". ev" : ""), burcOz(bm) + " " + burcMetni(bm), '<a href="#lilith-' + SL[bm] + '">' + BN[bm] + " burcunda Lilith yorumunun tamamı →</a>", true));
    if (lt != null) h.push(kart("Gerçek (salınımlı) Lilith", konum(lt) + (N && N.cusp ? " · " + evBul(N, lt) + ". ev" : ""), bt === bm ? "Gerçek Lilith de aynı burçta: Lilith temaların net ve tutarlı." : "Gerçek Lilith farklı bir burçta (" + BN[bt] + "). Önce ortalama Lilith'i oku; " + BN[bt] + " temalarını ikinci bir katman olarak değerlendirebilirsin.", 'Ortalama ile gerçek Lilith arasındaki fark: ' + Math.abs(fark(lt, lm)).toFixed(1).replace(".", ",") + "°", false));
    if (ev) h.push(kart(ev + ". evde Lilith", EVAD[ev], evMetni(ev), '<a href="#lilith-ev-' + ev + '">' + ev + ". evde Lilith yorumunun tamamı →</a>"));
    // açılar
    var acilar = [];
    if (N) {
      var hedef = {}; Object.keys(N.p).forEach(function (a) { if (ACIK[a]) hedef[a] = N.p[a].lon; });
      if (N.asc != null) hedef["Yükselen"] = N.asc; if (N.mc != null) hedef["MC"] = N.mc;
      Object.keys(hedef).forEach(function (a) {
        var d = Math.abs(fark(lm, hedef[a]));
        if (d <= 5) acilar.push({ a: a, t: "kavuşum", o: d });
        else if (Math.abs(d - 180) <= 5) acilar.push({ a: a, t: "karşıtlık", o: Math.abs(d - 180) });
        else if (Math.abs(d - 90) <= 3) acilar.push({ a: a, t: "kare", o: Math.abs(d - 90) });
        else if (Math.abs(d - 120) <= 3) acilar.push({ a: a, t: "üçgen", o: Math.abs(d - 120) });
      });
      acilar.sort(function (x, y) { return x.o - y.o; });
    }
    var aciHtml = "";
    if (N) {
      aciHtml = '<div class="li-bolum-b">Lilith\'inin gezegenlerle açıları</div>' + (acilar.length ? acilar.map(function (x) {
        var tm = TEMA[x.a] || "bu gezegenin temaları", yorum;
        if (x.t === "kavuşum") yorum = aciMetni(x.a);
        else if (x.t === "karşıtlık" && x.a === "Yükselen") yorum = "Lilith, yükselenin tam karşısında; yani alçalan noktanın (7. ev başlangıcı) üzerinde. İlişkiler, evlilik ve ortaklıklar hayatında yoğun ve dönüştürücü bir alan: güçlü, sıra dışı partnerlerle karşılaşabilir, ilişkide eşitliği ve kendin kalmayı öğrenirsin.";
        else if (x.t === "karşıtlık" && x.a === "MC") yorum = "Lilith, MC'nin tam karşısında; yani IC'nin (4. ev başlangıcı) üzerinde. Aile, ev ve kökler konusu derin ve yoğun; kendi yuvanı kendi kurallarınla kurmak senin için özgürleştirici bir yolculuk.";
        else if (x.t === "karşıtlık") yorum = "Lilith, " + tm + " ile karşı karşıya duruyor. Bu gerilim çoğu zaman ilişkiler ve karşına çıkan insanlar üzerinden yaşanır: başkalarında seni rahatsız eden ya da büyüleyen yoğunluk, sahiplenmediğin bir yanını gösterebilir. Dengeyi bulduğunda bu eksen güçlü bir farkındalık kaynağına dönüşür.";
        else if (x.t === "kare") yorum = "Lilith, " + tm + " ile kare açı yapıyor: içinde bir gerilim ve güçlü bir itici güç var. Bu alanda bastırdığın bir şey zaman zaman kendini hatırlatır; enerjiyi bilinçli kullandığında büyük bir motivasyona dönüşür.";
        else yorum = "Lilith, " + tm + " ile üçgen açı yapıyor: bu iki enerji uyumla akar. Lilith'in cesaretini ve özgünlüğünü bu alanda doğal biçimde ifade edebilirsin.";
        return '<div class="li-kart"><div class="li-kb">' + esc(x.a) + " · " + x.t + " · " + x.o.toFixed(1).replace(".", ",") + "°</div><p>" + esc(yorum) + "</p></div>";
      }).join("") : '<p class="li-kucuk">Lilith\'in Güneş, Ay, gezegenler, yükselen ve MC ile dar açısı yok. Bu durumda Lilith\'in burcu ve evi belirleyicidir.</p>');
    }
    // Lilith dönüşleri
    var bugun = jdOf(Date.now()), don = [], j2 = jd + 30;
    for (var n = 1; n <= 9; n++) { j2 = ulas(lm, j2 + 3000); don.push(j2); }
    var donHtml = '<div class="li-bolum-b">Lilith dönüşlerin</div><ol class="li-liste">' + don.map(function (x) {
      var yas = ((x - jd) / 365.25).toFixed(1).replace(".", ","), fk = x - bugun, simdi = Math.abs(fk) <= 45, yaklas = fk > 45 && fk <= 365;
      var et = simdi ? " · şu sıralar" : yaklasMi(fk) ? " · yaklaşıyor" : fk > 0 ? " · önünde" : "";
      return '<li><time>' + trT(dateOf(x)) + "</time><div><b>" + yas + " yaşında" + et + "</b><span>" + (simdi || yaklas ? "Lilith doğum anındaki yerine dönüyor; eski kalıpları bırakmak ve kendini daha özgür ifade etmek için güçlü bir dönem." : fk > 0 ? "Lilith doğumdaki yerine geri gelecek." : "Lilith doğumdaki yerine geri geldi.") + "</span></div></li>";
    }).join("") + "</ol>";
    // Önümüzdeki 10 yılda transit Lilith kavuşumları
    var trHtml = "";
    if (N) {
      var olay = [];
      var hedefler = {}; ["Güneş", "Ay", "Venüs", "Mars"].forEach(function (a) { if (N.p[a]) hedefler[a] = N.p[a].lon; });
      if (N.asc != null) hedefler["Yükselen"] = N.asc; if (N.mc != null) hedefler["MC"] = N.mc;
      Object.keys(hedefler).forEach(function (a) { var t = ulas(hedefler[a], bugun - 20); if (t - bugun < 3652) olay.push({ jd: t, a: a }); });
      olay.sort(function (x, y) { return x.jd - y.jd; });
      trHtml = '<div class="li-bolum-b">Önümüzdeki yıllarda Lilith\'in haritandaki önemli noktalardan geçişi</div><ol class="li-liste">' + olay.map(function (o) {
        return "<li><time>" + trT(dateOf(o.jd)) + "</time><div><b>Transit Lilith, natal " + esc(o.a) + " üzerinde</b><span>" + esc(TRANSIT[o.a] || "") + "</span></div></li>";
      }).join("") + "</ol>";
    }
    var ozet = "Lilith'im " + BN[bm] + (ev ? ", " + ev + ". evde" : "");
    out.innerHTML = '<div class="li-ust"><div class="li-cark">' + cark(N, lm, lt) + '<p class="li-kucuk" style="text-align:center">' + LIL + " ortalama Lilith" + (lt != null && Math.abs(fark(lt, lm)) > 4 ? " · gri: gerçek Lilith" : "") + (N && N.cusp ? " · yükselen solda" : "") + '</p></div><div class="li-kartlar">' + h.join("") + "</div></div>" +
      (!saat ? '<p class="li-not">Lilith\'in hangi evde olduğunu ve gezegenlerinle açılarını görmek için doğum saatini ve yerini de ekle.</p>' : "") +
      aciHtml + trHtml + donHtml +
      '<div class="li-btns"><button type="button" class="li-btn li-paylas">Sonucumu paylaş</button><a class="li-btn li-ghost" href="/dogum-haritasi-analizi.html">Tüm haritamı okut →</a></div>';
    out.hidden = false;
    $(".li-paylas", out).onclick = function () { var m = ozet + ". Senin Lilith burcun ne? astroyuvam.com/lilith-burcu-hesaplama.html"; if (navigator.share) navigator.share({ text: m }).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(m).then(function () { $(".li-paylas", out).textContent = "Kopyalandı ✓"; }); };
    out.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.gtag) gtag("event", "lilith_hesap", { ev: ev ? "var" : "yok" });
  }
  function yaklasMi(fk) { return fk > 45 && fk <= 365; }
  var TEMA = {"Güneş":"kimliğin ve öz ifaden (Güneş)","Ay":"duygusal ihtiyaçların (Ay)","Merkür":"düşüncelerin ve sözlerin (Merkür)","Venüs":"aşk ve değerlerin (Venüs)","Mars":"arzun, cesaretin ve öfken (Mars)","Jüpiter":"inançların ve büyüme isteğin (Jüpiter)","Satürn":"sorumlulukların ve sınırların (Satürn)","Uranüs":"özgürlük ihtiyacın (Uranüs)","Neptün":"hayallerin ve sezgilerin (Neptün)","Plüton":"güç ve dönüşüm temaların (Plüton)","Yükselen":"kendini ortaya koyuşun (yükselen)","MC":"kariyer ve toplumsal hedeflerin (MC)"};
  var EVAD = ["", "Kimlik ve görünüş", "Para ve öz değer", "İletişim ve yakın çevre", "Aile ve kökler", "Aşk ve yaratıcılık", "İş, sağlık ve günlük hayat", "İlişkiler ve evlilik", "Tutku, derin bağlar ve dönüşüm", "İnanç, yolculuk ve eğitim", "Kariyer ve toplumsal statü", "Arkadaşlar ve topluluklar", "Bilinçaltı ve iç dünya"];
  var TRANSIT = {
    "Güneş": "Kimliğinle ilgili bastırdığın bir yan yüzeye çıkabilir; kendini daha cesurca ortaya koyma zamanı.",
    "Ay": "Duygusal ihtiyaçların yoğunlaşır; neye ihtiyaç duyduğunu dürüstçe söylemek için güçlü bir dönem.",
    "Venüs": "Aşkta ve çekimde yoğunluk artar; beklenmedik bir çekim ya da arzuların hakkında bir farkındalık gelebilir.",
    "Mars": "Öfke, tutku ve cesaret yükselir; sınır çizmek ve istediğin şey için harekete geçmek için uygun.",
    "Yükselen": "Görünüşünde ve kendini sunuşunda değişim isteği; daha özgün bir sen ortaya çıkabilir.",
    "MC": "Kariyerde ve toplumdaki duruşunda kalıp kırma zamanı; otoriteyle ilişkin yeniden şekillenir."
  };

  /* ---------- form ---------- */
  function kur(k) {
    var f = $(".li-form", k), msg = $(".li-msg", k);
    $(".li-saatyok", k).onchange = function () { $(".li-saat", k).disabled = this.checked; if (this.checked) $(".li-saat", k).value = ""; };
    try { for (var i = 0; i < localStorage.length; i++) { var kk = localStorage.key(i); if (/^sb-.*-auth-token$/.test(kk)) { var o = JSON.parse(localStorage.getItem(kk) || "{}"), u = o.user || (o.currentSession && o.currentSession.user), m = u && u.user_metadata; if (m && m.birth_date) { $(".li-tarih", k).value = m.birth_date; $(".li-saat", k).value = (m.birth_time || "").slice(0, 5); $(".li-yer", k).value = m.birth_place || ""; msg.textContent = "Üye bilgilerin dolduruldu ✦"; } } } } catch (e) {}
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var g = { birthDate: $(".li-tarih", k).value, birthTime: $(".li-saatyok", k).checked ? "" : ($(".li-saat", k).value || "").slice(0, 5), birthPlace: $(".li-yer", k).value.trim() };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(g.birthDate)) { msg.textContent = "Lütfen doğum tarihini seç."; return; }
      var jd = yerelJD(g.birthDate, g.birthTime), btn = $(".li-btn", f);
      if (!g.birthTime || !g.birthPlace) {
        btn.disabled = true; msg.textContent = "Hesaplanıyor…";
        astro().catch(function () {}).then(function () { btn.disabled = false; msg.textContent = ""; sonuc(k, g, null, jd); });
        return;
      }
      btn.disabled = true; msg.textContent = "Haritan hesaplanıyor…";
      Promise.all([haritaGetir(g), astro()]).then(function (r) {
        btn.disabled = false; var j = r[0];
        if (!j || !j.ok) { msg.textContent = (j && (j.mesaj || (j.errors && j.errors.join(" ")))) || "Harita şu an hesaplanamadı; yalnızca burcunu gösteriyorum."; sonuc(k, g, null, jd); return; }
        msg.textContent = ""; var N = hazirla(j); sonuc(k, g, N, jdDuzelt(jd, N));
      }).catch(function (er) { btn.disabled = false; msg.textContent = (er && er.message && er.message.length < 120 ? er.message : "Sunucuya ulaşılamadı; yalnızca burcunu gösteriyorum."); astro().catch(function () {}).then(function () { sonuc(k, g, null, jd); }); });
    });
  }

  /* ---------- yörünge animasyonu ---------- */
  function yorunge(k) {
    var svg = $("svg", k), gg = $(".li-yor-g", k), ay = $(".li-ay", k), yl = $(".li-yl", k), yp = $(".li-yp", k), yok = $(".li-yok", k), yazi = $(".li-yor-s", k);
    var burclar = k.querySelectorAll(".li-yb"), oyna = $('[data-k="oynat"]', k), hizB = $('[data-k="hiz"]', k);
    var az = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var calis = !az, hizli = false, gorunur = false, son = null, raf = 0, eskiB = -1;
    var a = 150, b = 138, c = Math.sqrt(a * a - b * b), e = c / a;
    var lam = ortalama(jdOf(Date.now())), faz = 0; // Lilith bugünkü yerinden başlar
    function P(l, r) { var t = l * R; return [250 - r * Math.cos(t), 250 + r * Math.sin(t)]; }
    function ciz() {
      var rot = 180 - lam, E = faz;
      for (var i = 0; i < 6; i++) E = faz + e * Math.sin(E);
      var lx = c - a * Math.cos(E), ly = b * Math.sin(E), rr = rot * R;
      gg.setAttribute("transform", "translate(250 250) rotate(" + rot.toFixed(2) + ")");
      ay.setAttribute("cx", (250 + lx * Math.cos(rr) - ly * Math.sin(rr)).toFixed(1)); ay.setAttribute("cy", (250 + lx * Math.sin(rr) + ly * Math.cos(rr)).toFixed(1));
      var ap = P(lam, a + c), pe = P(lam + 180, a - c), uc = P(lam, 236);
      yl.setAttribute("x", ap[0].toFixed(1)); yl.setAttribute("y", (ap[1] + (Math.sin(lam * R) > 0.3 ? -16 : 24)).toFixed(1));
      yp.setAttribute("x", pe[0].toFixed(1)); yp.setAttribute("y", (pe[1] - 14).toFixed(1));
      yok.setAttribute("x2", uc[0].toFixed(1)); yok.setAttribute("y2", uc[1].toFixed(1));
      var bb = sg(lam); if (bb !== eskiB) { eskiB = bb; burclar.forEach(function (t) { t.setAttribute("fill", +t.dataset.b === bb ? "#e7cf95" : "#6f6690"); }); yazi.textContent = "Lilith şu an animasyonda " + BN[bb] + " burcu yönünde"; }
    }
    function kare(ts) {
      if (son != null) { var dt = Math.min(0.05, (ts - son) / 1000); lam = norm(lam + dt * 360 / (hizli ? 12 : 40)); faz += dt * 2 * Math.PI / (hizli ? 1.1 : 3.2); }
      son = ts; ciz(); if (calis && gorunur) raf = requestAnimationFrame(kare);
    }
    function basla() { cancelAnimationFrame(raf); son = null; if (calis && gorunur) raf = requestAnimationFrame(kare); }
    oyna.onclick = function () { calis = !calis; oyna.setAttribute("aria-pressed", calis); oyna.textContent = calis ? "⏸ Duraklat" : "▶ Oynat"; basla(); };
    hizB.onclick = function () { hizli = !hizli; hizB.textContent = "Hız: " + (hizli ? "hızlı" : "yavaş"); basla(); };
    if (az) { oyna.setAttribute("aria-pressed", "false"); oyna.textContent = "▶ Oynat"; }
    ciz();
    new IntersectionObserver(function (es) { gorunur = es[0].isIntersecting; basla(); }).observe(svg);
  }

  /* ---------- sapma grafiği ---------- */
  function grafik(k) {
    astro().then(function () {
      var bas = jdOf(Date.now()), veri = [];
      for (var i = 0; i <= 365; i++) { var jd = bas + i; veri.push([jd, fark(gercek(jd), ortalama(jd))]); }
      var W = 640, H = 260, sol = 44, sag = 12, ust = 14, alt = 34, iw = W - sol - sag, ih = H - ust - alt;
      var mx = Math.max(10, Math.ceil(Math.max.apply(null, veri.map(function (v) { return Math.abs(v[1]); })) / 10) * 10);
      function X(i) { return sol + i / 365 * iw; } function Y(v) { return ust + (mx - v) / (2 * mx) * ih; }
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Önümüzdeki 12 ay için gerçek Lilith ile ortalama Lilith arasındaki fark (derece)"><g font-family="Segoe UI,system-ui,sans-serif" font-size="11" fill="#9a8fb8">';
      for (var v = -mx; v <= mx; v += 10) s += '<line x1="' + sol + '" x2="' + (W - sag) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" stroke="' + (v === 0 ? "rgba(231,207,149,.55)" : "rgba(154,143,184,.14)") + '" stroke-width="1"/><text x="' + (sol - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + (v > 0 ? "+" : "") + v + "°</text>";
      var d0 = dateOf(bas);
      for (var m = 0; m <= 12; m++) { var dm = new Date(d0.getFullYear(), d0.getMonth() + m, 1), gi = (jdOf(dm.getTime()) - bas); if (gi < 0 || gi > 365) continue; s += '<line x1="' + X(gi).toFixed(1) + '" x2="' + X(gi).toFixed(1) + '" y1="' + (ust + ih) + '" y2="' + (ust + ih + 4) + '" stroke="rgba(154,143,184,.5)"/>' + (m % 2 === 0 || W > 500 ? '<text x="' + X(gi).toFixed(1) + '" y="' + (ust + ih + 17) + '" text-anchor="middle">' + AYL[dm.getMonth()].slice(0, 3) + "</text>" : ""); }
      s += '<text x="' + (sol + 4) + '" y="' + (Y(0) - 6).toFixed(1) + '" fill="#e7cf95">ortalama Lilith</text>';
      s += '<path d="' + veri.map(function (p, i) { return (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join("") + '" fill="none" stroke="#d9b96a" stroke-width="2" stroke-linejoin="round"/>';
      s += '<line class="li-gx" x1="0" x2="0" y1="' + ust + '" y2="' + (ust + ih) + '" stroke="rgba(240,230,210,.45)" stroke-width="1" visibility="hidden"/><circle class="li-gn" r="4.5" fill="#e7cf95" stroke="#1c1733" stroke-width="2" visibility="hidden"/>';
      s += '<rect class="li-gh" x="' + sol + '" y="' + ust + '" width="' + iw + '" height="' + ih + '" fill="transparent" style="cursor:crosshair"/></g></svg><div class="li-ipucu"></div>';
      k.innerHTML = s;
      var sv = $("svg", k), gx = $(".li-gx", k), gn = $(".li-gn", k), ip = $(".li-ipucu", k), hit = $(".li-gh", k);
      function goster(ev) {
        var r = sv.getBoundingClientRect(), px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) / r.width * W;
        var i = Math.max(0, Math.min(365, Math.round((px - sol) / iw * 365))), p = veri[i], x = X(i), y = Y(p[1]);
        gx.setAttribute("x1", x); gx.setAttribute("x2", x); gx.setAttribute("visibility", "visible"); gn.setAttribute("cx", x); gn.setAttribute("cy", y); gn.setAttribute("visibility", "visible");
        var lt = gercek(p[0]), lm = ortalama(p[0]);
        ip.innerHTML = "<b>" + trT(dateOf(p[0])) + "</b><br>Gerçek: " + BN[sg(lt)] + " " + derece(lt) + "<br>Ortalama: " + BN[sg(lm)] + " " + derece(lm) + "<br>Fark: " + (p[1] > 0 ? "+" : "") + p[1].toFixed(1).replace(".", ",") + "°";
        ip.style.left = Math.max(16, Math.min(84, x / W * 100)) + "%"; ip.style.top = Math.max(78, y / H * r.height) + "px"; ip.style.opacity = 1;
      }
      function gizle() { gx.setAttribute("visibility", "hidden"); gn.setAttribute("visibility", "hidden"); ip.style.opacity = 0; }
      hit.addEventListener("pointermove", goster); hit.addEventListener("pointerdown", goster); hit.addEventListener("pointerleave", gizle);
    }).catch(function () { k.innerHTML = '<p class="y-kucuk" style="text-align:center;padding-top:120px">Grafik şu an yüklenemedi.</p>'; });
  }

  /* ---------- tablo araması ---------- */
  function ara(k) {
    var yil = $("#liYil"), gun = $("#liGun"), s = $(".li-ara-s", k), kap = document.querySelector(".li-tablo-kap"), satir = kap ? kap.querySelectorAll("tbody tr") : [];
    function temizle() { satir.forEach(function (r) { r.classList.remove("vurgu"); }); }
    function bul(fn, mesaj) {
      temizle(); var ilk = null, n = 0;
      satir.forEach(function (r) { if (fn(r.dataset.b, r.dataset.s)) { r.classList.add("vurgu"); n++; if (!ilk) ilk = r; } });
      if (ilk) { kap.scrollTop = ilk.offsetTop - 40; s.textContent = mesaj(n, ilk); } else s.textContent = "Bu tarih tabloda yok (1930–2040).";
    }
    yil.addEventListener("input", function () {
      var y = +yil.value; if (!(y >= 1930 && y <= 2040)) { temizle(); s.textContent = ""; return; }
      var b0 = y + "-01-01", b1 = y + "-12-31";
      bul(function (a, c) { return a <= b1 && c > b0; }, function (n) { return y + " yılında Lilith " + n + " burçta bulundu; doğum tarihini de yazarsan kesin satırı gösteririm."; });
    });
    gun.addEventListener("change", function () {
      var d = gun.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
      bul(function (a, c) { return a <= d && c > d; }, function (n, r) { var b = r.cells[2].textContent.trim(); return "Doğum tarihine göre Lilith burcun: " + b + ". Geçiş gününe yakın doğduysan yukarıdaki hesaplayıcıyla derecene bak."; });
    });
  }

  function basla() {
    simdi();
    document.querySelectorAll('[data-lilith="hesap"]').forEach(kur);
    document.querySelectorAll('[data-lilith="ara"]').forEach(ara);
    var tembel = { yorunge: yorunge, grafik: grafik };
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); tembel[e.target.dataset.lilith](e.target); } }); }, { rootMargin: "400px 0px" }) : null;
    document.querySelectorAll('[data-lilith="yorunge"],[data-lilith="grafik"]').forEach(function (k) { if (io) io.observe(k); else tembel[k.dataset.lilith](k); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla); else basla();
})();
