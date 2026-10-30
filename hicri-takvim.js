/* ay-takvimi.js — Astro Yuvam: "Doğduğun gün Ay takviminde kaçıncı gündü?" aracı ve "Rûznâme" yazısının etkileşimleri.
 * Hicri tarih: tarayıcının Ümmü'l-Kurâ takvimi (Intl, islamic-umalqura); desteklenmezse aritmetik (tablolu) hicri takvim.
 * Gün batımı, Ay evresi ve Ay'ın boylamı: astronomy-engine (tarayıcıda). Konum: şehir adından koordinat (open-meteo geocoding).
 * Hiçbir doğum bilgisi sunucuya gönderilmez ve kaydedilmez. */
(function () {
  "use strict";
  var D = document, R = Math.PI / 180, SYN = 29.530588853, GUNMS = 864e5;
  var G = [null, ["sad", "Oğlan doğsa zeyrek ve bahtlu ola.", "Bu günde doğan çocuk zeki, uyanık ve talihli olur."], ["sad", "Ammâ oğlan ve kız doğsa yaşı uzun ola.", "Bu günde doğan oğlan da kız da uzun ömürlü olur."], ["nahs", "Oğlan doğsa fâsık, yalancı ve kezzâb ola.", "Metin bu günde doğan için yoldan çıkmış, yalan söyleyen biri olacağını yazar."], ["sad", "Oğlan doğsa kademi mübârek ola ve sâhib-i hüner ola.", "Bu günde doğanın ayağı uğurlu olur, eli hünerli olur."], ["nahs", "Oğlan doğsa Kâbil'iñ ve Fir'avn'uñ huyun tuta ve ömri kısa ola.", "Metin bu günde doğanın Kâbil ve Firavun'un huyunu taşıyacağını ve kısa ömürlü olacağını yazar."], ["sad", "Oğlan doğsa mün'im ve şâd-mân ola.", "Bu günde doğan cömert, iyilik eden ve sevinçli biri olur."], ["sad", "Oğlan doğsa âbid ve zâhid ola ve du'âsı kabul ola.", "Bu günde doğan kendini adayan, gönlünü dünyaya bağlamayan biri olur ve duası kabul olur."], ["sad", "Oğlan doğsa devletlü ola. Anaya, ataya müşfik ola ve yaraşık ola.", "Bu günde doğan talihli ve saygın olur, annesine babasına şefkatli olur, güzel ve yakışıklı olur."], ["yok", "", "Rûznâme bu gün için hüküm yazmamıştır."], ["sad", "Oğlan doğsa âkıl ola, sayru olsa tiz şifâ bula.", "Bu günde doğan akıllı olur; hastalanırsa çabuk şifa bulur."], ["sad", "Eger oğlan doğsa âlim ve âkıl ola ve kâmil ola ve sözi mevzûn ve kutlu ola.", "Bu günde doğan bilgili, akıllı ve olgun olur; sözü ölçülü ve uğurlu olur."], ["sad", "Oğlan doğsa kademi mübârek ola.", "Bu günde doğanın ayağı uğurlu olur; girdiği yere bereket getirir."], ["nahs", "Oğlan doğsa münâfık ola.", "Metin bu günde doğanın iki yüzlü olacağını yazar."], ["sad", "Oğlan doğsa 'âlim ve müneccim ve zâhid ola.", "Bu günde doğan bilgili olur, yıldızlardan anlar ve gönlünü dünyaya bağlamaz."], ["sad", "Oğul, kız doğsa devletlü ola.", "Bu günde doğan oğlan da kız da talihli ve saygın olur."], ["nahs", "Oğlan doğsa yalancı ola ve fâsık ola ve hâ'in ola.", "Metin bu günde doğanın yalan söyleyen, yoldan çıkmış ve hain biri olacağını yazar."], ["sad", "Oğlan doğsa râst ola ve ercümend ola.", "Bu günde doğan dürüst ve doğru sözlü olur, saygın ve değerli biri olur."], ["sad", "Oğlan doğsa 'âlim ve zâhid ola, hıredmend ola, şerri az ola, düşmeni dost ola.", "Bu günde doğan bilgili olur, gönlünü dünyaya bağlamaz, akıllı olur, kimseye kötülüğü dokunmaz ve düşmanı bile dostu olur."], ["sad", "Oğlan doğsa kademi mübârek ola, 'ömri uzun ola.", "Bu günde doğanın ayağı uğurlu olur ve ömrü uzun olur."], ["sad", "Oğlan doğsa şâ'ir ola.", "Bu günde doğan şair olur."], ["nahs", "Oğlan doğsa yaşamaya.", "Metin bu günde doğan çocuğun yaşamayacağını yazar."], ["sad", "Oğlan doğsa bahtlu ola ve esbab çok olup kendü kavmine hâkim ola, hükmi yürüye.", "Bu günde doğan talihli olur, imkânları çok olur, kendi çevresinin önderi olur ve sözü geçer."], ["karma", "Oğlan doğsa kademi mübârek ola.", "Bu günde doğanın ayağı uğurlu olur."], ["nahs", "Oğlan doğsa dili uzun ola, gâyetle yavuz ola.", "Metin bu günde doğanın dilinin uzun ve huyunun çok sert olacağını yazar."], ["nahs", "Oğlan doğsa yaşamaya.", "Metin bu günde doğan çocuğun yaşamayacağını yazar."], ["sad", "Oğlan doğsa kademi mübârek ola, 'ömri uzun ola, sözi geçer ola.", "Bu günde doğanın ayağı uğurlu olur, ömrü uzun olur ve sözü geçer."], ["sad", "Oğlan doğsa devletlüdür.", "Bu günde doğan talihlidir, saygındır."], ["sad", "Bu günde oğlan doğsa hayırludur.", "Bu günde doğan hayırlı biridir."], ["sad", "Oğlan doğsa kademi mübârek ola.", "Bu günde doğanın ayağı uğurlu olur."]];          // [null, [tur, söz, anlam], ...] — 1..29
  var MZ = [["Şeratân", "İki işaret", "Koç takımyıldızının β ve γ yıldızları", "Koç 0°"], ["Butayn", "Küçük karın", "Koç takımyıldızının δ ve ε yıldızları", "Koç 12°51′"], ["Süreyyâ", "Ülker; “küçük çokluk”", "Ülker (Pleiades) yıldız kümesi", "Koç 25°43′"], ["Debarân", "Takip eden", "Aldebaran (Boğa'nın gözü)", "Boğa 8°34′"], ["Hak'a", "Beyaz leke", "Avcı'nın başındaki λ ve φ yıldızları", "Boğa 21°26′"], ["Hen'a", "Damga, iz", "Alhena (İkizler'in γ yıldızı)", "İkizler 4°17′"], ["Zirâ'", "Dirsek, kol", "Kastor ve Polluks", "İkizler 17°09′"], ["Nesre", "Aralık, burun", "Arı Kovanı kümesi (Praesepe)", "Yengeç 0°"], ["Tarf", "Bakış, göz", "Aslan'ın λ yıldızı", "Yengeç 12°51′"], ["Cebhe", "Alın", "Regulus (Aslan'ın kalbi)", "Yengeç 25°43′"], ["Zübre", "Yele", "Aslan'ın δ ve θ yıldızları", "Aslan 8°34′"], ["Sarfe", "Değiştiren, döndüren", "Denebola (Aslan'ın kuyruğu)", "Aslan 21°26′"], ["Avvâ", "Havlayan", "Başak'ın β yıldızı", "Başak 4°17′"], ["Simâk", "Silahsız (es-Simâkü'l-a'zel)", "Spika (Başak'ın başağı)", "Başak 17°09′"], ["Gafr", "Örtü", "Başak'ın ι ve κ yıldızları", "Terazi 0°"], ["Zübânâ", "Kıskaçlar", "Terazi'nin α ve β yıldızları", "Terazi 12°51′"], ["İklîl", "Taç", "Akrep'in β, δ ve π yıldızları", "Terazi 25°43′"], ["Kalb", "Kalp", "Antares (Akrep'in kalbi)", "Akrep 8°34′"], ["Şevle", "İğne, kuyruk ucu", "Şaula (Akrep'in iğnesi)", "Akrep 21°26′"], ["Neâim", "Devekuşları", "Yay takımyıldızının yıldızları", "Yay 4°17′"], ["Belde", "Şehir, yurt", "Yay'ın yıldızsız bir bölgesi", "Yay 17°09′"], ["Sa'dü'z-Zâbih", "Kurban edenin talihi", "Oğlak'ın α ve β yıldızları", "Oğlak 0°"], ["Sa'dü Bula'", "Yutanın talihi", "Kova'nın μ ve ν yıldızları", "Oğlak 12°51′"], ["Sa'dü's-Suûd", "Talihlerin talihi", "Sadalsuud (Kova'nın β yıldızı)", "Oğlak 25°43′"], ["Sa'dü'l-Ahbiye", "Gizlilerin talihi", "Kova'nın γ yıldızı", "Kova 8°34′"], ["Fergu'l-Mukaddem", "Ön kova ağzı", "Pegasus'un α ve β yıldızları", "Kova 21°26′"], ["Fergu'l-Muahhar", "Arka kova ağzı", "Pegasus'un γ yıldızı (Algenib)", "Balık 4°17′"], ["Batnü'l-Hût", "Balığın karnı", "Andromeda'nın β yıldızı (Mirach)", "Balık 17°09′"]];         // [[ad, anlam, yıldız, başlangıç], ...] — 28
  var AYLAR = ["Muharrem", "Safer", "Rebîülevvel", "Rebîülâhir", "Cemâziyelevvel", "Cemâziyelâhir", "Receb", "Şâban", "Ramazan", "Şevvâl", "Zilkâde", "Zilhicce"];
  var MAY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var GUNAD = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  var BN = ["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"];
  var TUR = { sad: "Sa'd · uğurlu gün", nahs: "Nahs · dikkat günü", karma: "Uğurlu ama uyarılı", yok: "Hüküm yazılmamış" };
  var GEZ = ["Satürn", "Jüpiter", "Mars", "Güneş", "Venüs", "Merkür", "Ay"];          // Keldani sırası
  var GL = { "Satürn": "♄", "Jüpiter": "♃", "Mars": "♂", "Güneş": "☉", "Venüs": "♀", "Merkür": "☿", "Ay": "☽" };
  var GUNYON = [3, 6, 2, 5, 1, 4, 0];                                                   // Pazar..Cumartesi → GEZ
  var VARSAYILAN = { ad: "İstanbul, Türkiye", lat: 41.0082, lon: 28.9784, tz: "Europe/Istanbul" };

  function $(s, k) { return (k || D).querySelector(s); }
  function $$(s, k) { return Array.prototype.slice.call((k || D).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function norm(d) { return ((d % 360) + 360) % 360; }
  function sade(s) { return String(s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").trim(); }
  function yukle(src, hazir) {
    return new Promise(function (ok, no) {
      if (hazir()) return ok();
      var v = D.querySelector('script[src="' + src + '"]');
      if (v) { var t = setInterval(function () { if (hazir()) { clearInterval(t); ok(); } }, 40); setTimeout(function () { clearInterval(t); if (!hazir()) no(); }, 15000); return; }
      var s = D.createElement("script"); s.src = src; s.async = true; s.onload = ok; s.onerror = no; D.head.appendChild(s);
    });
  }
  function astro() { return yukle("/astronomy.browser.min.js", function () { return !!window.Astronomy; }); }
  function depo(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function gor(el, fn) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) return fn();
    var io = new IntersectionObserver(function (l) { if (l.some(function (x) { return x.isIntersecting; })) { io.disconnect(); fn(); } }, { rootMargin: "300px" });
    io.observe(el);
  }

  /* ---------- Takvim hesapları ---------- */
  var fmtH = null;
  try {
    fmtH = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { timeZone: "UTC", day: "numeric", month: "numeric", year: "numeric" });
    if (fmtH.resolvedOptions().calendar !== "islamic-umalqura") fmtH = null;
  } catch (e) { fmtH = null; }
  function jdn(y, m, d) { return Math.floor(Date.UTC(y, m - 1, d) / GUNMS) + 2440588; }
  function jdnTarih(j) { var t = new Date((j - 2440588) * GUNMS); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; }
  function tablo(j) {                                       // aritmetik hicri takvim (yedek)
    var l = j - 1948440 + 10632, n = Math.floor((l - 1) / 10631); l = l - 10631 * n + 354;
    var k = Math.floor((10985 - l) / 5316) * Math.floor(50 * l / 17719) + Math.floor(l / 5670) * Math.floor(43 * l / 15238);
    l = l - Math.floor((30 - k) / 15) * Math.floor(17719 * k / 50) - Math.floor(k / 16) * Math.floor(15238 * k / 43) + 29;
    var m = Math.floor(24 * l / 709), d = l - Math.floor(709 * m / 24), y = 30 * n + k - 30;
    return { y: y, m: m, d: d };
  }
  function hicriJ(j) {
    if (fmtH) {
      try {
        var t = jdnTarih(j), p = {};
        fmtH.formatToParts(new Date(Date.UTC(t.y, t.m - 1, t.d, 12))).forEach(function (x) { p[x.type] = x.value; });
        var h = { y: parseInt(p.year, 10), m: parseInt(p.month, 10), d: parseInt(p.day, 10) };
        if (h.y && h.m && h.d) return h;
      } catch (e) {}
    }
    return tablo(j);
  }
  function hicri(y, m, d) { return hicriJ(jdn(y, m, d)); }
  function hicriMiladi(hy, hm, hd) {                         // hicri → miladi (jdn)
    var j = Math.floor((11 * hy + 3) / 30) + 354 * hy + 30 * hm - Math.floor((hm - 1) / 2) + hd + 1948440 - 385;
    for (var k = 0; k <= 4; k++) {
      var c = [j + k, j - k];
      for (var i = 0; i < 2; i++) { var h = hicriJ(c[i]); if (h.y === hy && h.m === hm && h.d === hd) return c[i]; }
    }
    return null;
  }
  function hYaz(h) { return h.d + " " + AYLAR[h.m - 1] + " " + h.y; }
  function mYaz(t) { return t.d + " " + MAY[t.m - 1] + " " + t.y; }
  function ofset(tz, t) {
    try {
      var f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }), p = {};
      f.formatToParts(new Date(t)).forEach(function (x) { p[x.type] = x.value; });
      return Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - t) / 6e4);
    } catch (e) { return null; }
  }
  function yerelUTC(y, m, d, h, mi, tz) {
    var g = Date.UTC(y, m - 1, d, h, mi), o = ofset(tz, g); if (o == null) o = 180;
    var t = g - o * 6e4, o2 = ofset(tz, t); if (o2 != null && o2 !== o) t = g - o2 * 6e4;
    return t;
  }
  function saatYaz(t, tz) {
    try { return new Intl.DateTimeFormat("tr-TR", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(t)); }
    catch (e) { var x = new Date(t); return pad(x.getHours()) + ":" + pad(x.getMinutes()); }
  }
  function yerelBugun(tz) {
    try {
      var p = {}; new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { y: +p.year, m: +p.month, d: +p.day };
    } catch (e) { var n = new Date(); return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }; }
  }
  function tarayiciTz() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul"; } catch (e) { return "Europe/Istanbul"; } }

  /* ---------- Konum ---------- */
  var yerOnb = {};
  function yerBul(txt) {
    var parca = String(txt || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
    if (!parca.length) return Promise.resolve(null);
    var key = parca.join("|").toLocaleLowerCase("tr");
    if (yerOnb[key]) return yerOnb[key];
    function sor(q) {
      return fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) + "&count=10&language=tr&format=json")
        .then(function (r) { return r.json(); }).then(function (j) { return (j && j.results || []).filter(function (r) { return r.latitude != null; }); })
        .catch(function () { return null; });
    }
    function sec(l, ekler) {
      if (!l || !l.length) return null;
      var ek = ekler.map(sade), r = l[0];
      for (var i = 0; i < l.length && ek.length; i++) {
        var c = [l[i].country, l[i].admin1, l[i].admin2, l[i].country_code].map(sade);
        if (ek.some(function (e) { return c.indexOf(e) >= 0 || (e === "turkiye" && l[i].country_code === "TR"); })) { r = l[i]; break; }
      }
      return { ad: [r.name, r.admin1 && r.admin1 !== r.name ? r.admin1 : "", r.country || ""].filter(Boolean).join(", "), lat: r.latitude, lon: r.longitude, tz: r.timezone || "Europe/Istanbul" };
    }
    yerOnb[key] = sor(parca[0]).then(function (l) {
      var s = sec(l, parca.slice(1));
      if (s || parca.length < 2) return s;
      return sor(parca[1]).then(function (l2) { return sec(l2, parca.slice(2)); });   // ilçe bulunamazsa il
    });
    return yerOnb[key];
  }

  /* ---------- Gökyüzü ---------- */
  function gunes(lat, lon, y, m, d, tz) {                    // o yerel günün doğuş ve batış anları
    var A = window.Astronomy, obs = new A.Observer(lat, lon, 0), t0 = yerelUTC(y, m, d, 0, 0, tz);
    var dog = A.SearchRiseSet(A.Body.Sun, obs, +1, new Date(t0), 1.2), bat = A.SearchRiseSet(A.Body.Sun, obs, -1, new Date(t0), 1.2);
    return { dog: dog ? dog.date.getTime() : null, bat: bat ? bat.date.getTime() : null };
  }
  function ayHal(t) {
    var A = window.Astronomy, dt = new Date(t), faz = A.MoonPhase(dt), il = A.Illumination(A.Body.Moon, dt).phase_fraction, lon = norm(A.EclipticGeoMoon(dt).lon);
    return { faz: faz, yas: faz / 360 * SYN, isik: il, lon: lon, mz: Math.floor(lon / (360 / 28)) };
  }
  function ayLon(t) { return norm(window.Astronomy.EclipticGeoMoon(new Date(t)).lon); }
  function tipikFaz(g) { return norm((g + 0.5) * 360 / SYN); }
  function evreAd(faz) {
    if (faz < 7 || faz > 353) return "Yeni Ay (görünmez)";
    if (faz < 83) return "Büyüyen hilal"; if (faz < 97) return "İlk dördün"; if (faz < 173) return "Büyüyen şişkin Ay";
    if (faz < 187) return "Dolunay"; if (faz < 263) return "Küçülen şişkin Ay"; if (faz < 277) return "Son dördün"; return "Küçülen hilal";
  }
  function aySVG(faz, r, cls) {
    r = r || 40; var c = r + 2, w = Math.abs(Math.cos(faz * R)) * r, sag = faz < 180, gib = faz > 90 && faz < 270;
    var d = "M" + c + " " + (c - r) + " A" + r + " " + r + " 0 0 " + (sag ? 1 : 0) + " " + c + " " + (c + r) +
      " A" + w.toFixed(2) + " " + r + " 0 0 " + (sag ? (gib ? 1 : 0) : (gib ? 0 : 1)) + " " + c + " " + (c - r) + "Z";
    var isik = (1 - Math.cos(faz * R)) / 2;
    return '<svg class="' + (cls || "at-ay") + '" viewBox="0 0 ' + 2 * c + " " + 2 * c + '" width="' + 2 * c + '" height="' + 2 * c + '" role="img" aria-label="Ay evresi: ' + evreAd(faz) + ', yüzde ' + Math.round(isik * 100) + ' aydınlık">' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="#1d1830" stroke="#4a3d73" stroke-width="1.2"/>' +
      (isik > 0.004 ? '<path d="' + d + '" fill="#f0e6d2"/>' : "") + "</svg>";
  }
  function mzAralik(i) { var a = i * 360 / 28, b = (i + 1) * 360 / 28; return dYaz(a) + " – " + dYaz(b); }
  function dYaz(l) { l = norm(l); var s = Math.floor(l / 30), x = l - s * 30, dd = Math.floor(x + 1e-9), mm = Math.round((x - dd) * 60); if (mm === 60) { dd++; mm = 0; } if (dd === 30) { s = (s + 1) % 12; dd = 0; } return BN[s] + " " + dd + "°" + (mm ? pad(mm) + "′" : ""); }

  /* Gezegen saatleri: o yerel gün için 12 gündüz + 12 gece saati */
  function gezSaatleri(yer, t) {
    var A = window.Astronomy, obs = new A.Observer(yer.lat, yer.lon, 0);
    var g = yerelBugun(yer.tz); if (t) { var p = {}; try { new Intl.DateTimeFormat("en-US", { timeZone: yer.tz, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date(t)).forEach(function (x) { p[x.type] = x.value; }); g = { y: +p.year, m: +p.month, d: +p.day }; } catch (e) {} }
    function kur(y, m, d) {
      var t0 = yerelUTC(y, m, d, 0, 0, yer.tz), dog = A.SearchRiseSet(A.Body.Sun, obs, +1, new Date(t0), 1.2);
      if (!dog) return null;
      var bat = A.SearchRiseSet(A.Body.Sun, obs, -1, dog.date, 1), dog2 = bat && A.SearchRiseSet(A.Body.Sun, obs, +1, bat.date, 1);
      if (!bat || !dog2) return null;
      var wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay(), bas = GUNYON[wd], l = [], a = dog.date.getTime(), b = bat.date.getTime(), c = dog2.date.getTime();
      for (var i = 0; i < 24; i++) {
        var s = i < 12 ? a + (b - a) * i / 12 : b + (c - b) * (i - 12) / 12, e = i < 12 ? a + (b - a) * (i + 1) / 12 : b + (c - b) * (i - 11) / 12;
        l.push({ i: i, gez: GEZ[(bas + i) % 7], bas: s, son: e, gece: i >= 12 });
      }
      return { gunAd: GUNAD[wd], yon: GEZ[bas], dog: a, bat: b, dog2: c, saat: l, gunUz: (b - a) / 12, geceUz: (c - b) / 12 };
    }
    var bug = kur(g.y, g.m, g.d), an = t || Date.now();
    if (bug && an < bug.dog) { var dn = jdnTarih(jdn(g.y, g.m, g.d) - 1); var dun = kur(dn.y, dn.m, dn.d); if (dun) return dun; }
    return bug;
  }
  function ezani(t, oncekiBatis) {                            // Osmanlı alaturka saati: gün batımı = 12:00
    var dk = Math.round((t - oncekiBatis) / 6e4); if (dk < 0) dk += 1440;
    var h = Math.floor(dk / 60) % 12, m = dk % 60;
    return { yazi: (h === 0 ? 12 : h) + ":" + pad(m), dk: dk };
  }

  /* ---------- Ortak parçalar ---------- */
  function ekDe(w) { var v = String(w).toLocaleLowerCase("tr").match(/[aıoueiöü]/g), s = v ? v[v.length - 1] : "e"; return w + "'" + (/[çfhkpsşt]$/i.test(w) ? "t" : "d") + ("aıou".indexOf(s) >= 0 ? "a" : "e"); }
  var GEZE = { "Satürn": "Satürn'e", "Jüpiter": "Jüpiter'e", "Mars": "Mars'a", "Güneş": "Güneş'e", "Venüs": "Venüs'e", "Merkür": "Merkür'e", "Ay": "Ay'a" };
  function gunVeri(n) { return n >= 1 && n <= 29 ? G[n] : null; }
  function rozet(tur) { return '<span class="at-rz ' + tur + '">' + esc(TUR[tur] || "") + "</span>"; }
  function sozKutu(n) {
    var v = gunVeri(n);
    if (!v) return '<p class="at-yok">Rûznâmede otuzuncu gün için ayrı bir hüküm bulunmaz; hicri aylar 29 ya da 30 gün sürer ve metin 29. günde biter.</p>';
    if (v[0] === "yok") return '<p class="at-yok">' + esc(v[2]) + "</p>";
    return '<blockquote class="at-soz"><p>“' + esc(v[1]) + '”</p><footer>' + esc(v[2]) + "</footer></blockquote>";
  }

  /* ---------- 1. Bugün Ay'ın kaçıncı günü ---------- */
  function bugunKur() {
    $$('[data-at="bugun"]').forEach(function (el) {
      var tz = tarayiciTz(), b = yerelBugun(tz), h = hicri(b.y, b.m, b.d), v = gunVeri(h.d);
      el.innerHTML = '<span class="at-b-ay" aria-hidden="true">' + aySVG(tipikFaz(h.d), 13, "at-ay-k") + "</span><span>Bugün <b>" + esc(hYaz(h)) + "</b> · Ay'ın <b>" + h.d + ".</b> günü</span>" +
        (v ? rozet(v[0]) : "") + '<a class="at-b-git" href="' + (el.getAttribute("data-git") || "#gun-") + h.d + '">Bu günün hükmü →</a>';
      astro().then(function () {
        var A = window.Astronomy, x = ayHal(Date.now()), y = tz === "Europe/Istanbul" ? VARSAYILAN : null;
        var ay = el.querySelector(".at-b-ay"); if (ay) ay.innerHTML = aySVG(x.faz, 13, "at-ay-k");
        if (y) {
          var gs = gunes(y.lat, y.lon, b.y, b.m, b.d, y.tz);
          if (gs.bat) { var s = D.createElement("span"); s.className = "at-b-n"; var sn = h.d >= 29 ? "yeni ayın ilk" : (h.d + 1) + "."; s.textContent = gs.bat > Date.now() ? "İstanbul'da bu akşam " + saatYaz(gs.bat, y.tz) + "'de gün batınca Ay'ın " + sn + " gününe geçilir" : "İstanbul'da güneş " + saatYaz(gs.bat, y.tz) + "'de battı; hicri takvimde Ay'ın " + sn + " günü başladı"; el.appendChild(s); }
        }
      }).catch(function () {});
    });
  }

  /* ---------- 2. Ana araç ---------- */
  function hesapKur() {
    var kok = $('[data-at="hesap"]'); if (!kok) return;
    var form = $("form", kok), msg = $(".at-msg", kok), out = $(".at-sonuc", kok), btn = $(".li-btn", form);
    var fT = $(".at-tarih", form), fS = $(".at-saat", form), fY = $(".at-yer", form), fN = $(".at-saatyok", form), fA = $(".at-aksam", form);
    function saatDurum() { fS.disabled = fN.checked; $(".at-aksam-k", form).hidden = !fN.checked; }
    fN.addEventListener("change", saatDurum); saatDurum();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var tv = fT.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(tv)) { msg.textContent = "Önce doğum tarihini gir (GG.AA.YYYY)."; fT.focus(); return; }
      var p = tv.split("-").map(Number); if (p[0] < 1900 || p[0] > 2100) { msg.textContent = "1900 ile 2100 arasında bir tarih gir."; return; }
      var sv = fN.checked ? "" : fS.value, hm = /^\d{2}:\d{2}/.test(sv) ? sv.split(":").map(Number) : null;
      msg.textContent = "Hesaplanıyor…"; btn.disabled = true;
      var yt = fY.value.trim();
      Promise.all([astro().catch(function () { return null; }), yt ? yerBul(yt) : Promise.resolve(null)]).then(function (v) {
        var yer = v[1] || VARSAYILAN, yerNot = !yt ? "Doğum yeri yazılmadığı için gün batımı İstanbul'a göre hesaplandı." : (!v[1] ? "“" + yt + "” bulunamadı; gün batımı İstanbul'a göre hesaplandı." : "");
        var sonuc = hesapla(p[0], p[1], p[2], hm, fN.checked ? (fA.checked ? "aksam" : "gunduz") : null, yer, !!window.Astronomy);
        sonuc.yerNot = yerNot;
        ciz(sonuc); msg.textContent = ""; btn.disabled = false;
        out.hidden = false; out.scrollIntoView({ behavior: "smooth", block: "start" });
      }).catch(function () { msg.textContent = "Bir şeyler ters gitti; sayfayı yenileyip tekrar dene."; btn.disabled = false; });
    });

    function hesapla(y, m, d, hm, tahmin, yer, gok) {
      var r = { y: y, m: m, d: d, hm: hm, yer: yer, gok: gok, j: jdn(y, m, d) };
      r.hGunduz = hicriJ(r.j); r.hAksam = hicriJ(r.j + 1);
      if (gok) {
        var gs = gunes(yer.lat, yer.lon, y, m, d, yer.tz); r.bat = gs.bat; r.dog = gs.dog;
        var t = hm ? yerelUTC(y, m, d, hm[0], hm[1], yer.tz) : yerelUTC(y, m, d, tahmin === "aksam" ? 21 : 12, 0, yer.tz);
        r.t = t; r.ay = ayHal(t);
        if (hm && gs.bat) { r.aksam = t >= gs.bat; r.fark = Math.round((t - gs.bat) / 6e4); }
        else r.aksam = tahmin === "aksam";
        try { var dun = jdnTarih(r.j - 1), gd = gunes(yer.lat, yer.lon, dun.y, dun.m, dun.d, yer.tz); if (hm) r.ez = ezani(t, r.aksam ? gs.bat : gd.bat); } catch (e) {}
      } else r.aksam = hm ? hm[0] >= 19 : tahmin === "aksam";
      r.h = r.aksam ? r.hAksam : r.hGunduz;
      r.kesin = !!hm;
      return r;
    }

    function ciz(r) {
      var n = r.h.d, v = gunVeri(n), faz = r.ay ? r.ay.faz : tipikFaz(n), h = [];
      h.push('<div class="at-ust"><div class="at-ust-ay">' + aySVG(faz, 46) + '</div><div><div class="at-kb">Doğduğun gün Ay takviminde</div><div class="at-buyuk">' + n + '. gün</div>' +
        '<div class="at-hd">' + esc(hYaz(r.h)) + '</div>' + (v ? rozet(v[0]) : "") + "</div></div>");
      h.push(sozKutu(n));
      if (v && v[0] !== "yok") h.push('<p class="at-git"><a href="#gun-' + n + '">Rûznâmede ' + n + ". günün bütün hükümlerini ve kelimelerin anlamını oku ↓</a></p>");
      if (v && v[0] === "nahs") h.push('<p class="at-yumusak">Bu gün rûznâmenin “nahs” saydığı yedi günden biridir. Bu sözler bir insanın karakterini ölçmek için değil, yüzyıllar önce ayın her gününe bir hâl yüklemek için yazılmıştır; bugün tarihî bir metin olarak okunur. Metin her günü “gaybı Allah bilür” diyerek bilinmeyeni Allah\'a bırakır.</p>');
      // gün batımı
      var gb = [];
      if (r.bat) gb.push("Doğduğun gün " + esc(ekDe(r.yer.ad.split(",")[0])) + " güneş <b>" + saatYaz(r.bat, r.yer.tz) + "</b>'de battı.");
      if (r.kesin && r.fark != null) gb.push(r.fark >= 0 ? "Sen gün batımından <b>" + sure(r.fark) + " sonra</b> doğdun; hicri takvimde gün akşamla başladığı için doğumun ertesi hicri güne, <b>" + n + ". güne</b> düşüyor." : "Sen gün batımından <b>" + sure(-r.fark) + " önce</b> doğdun; bu yüzden doğumun o günün hicri tarihinde, <b>" + n + ". günde</b> kalıyor.");
      if (!r.kesin) gb.push("Doğum saatini girmediğin için " + (r.aksam ? "akşam (gün batımından sonra) doğduğunu varsaydık." : "gündüz (gün batımından önce) doğduğunu varsaydık.") + " Gün batımından " + (r.aksam ? "önce" : "sonra") + " doğduysan Ay'ın <b>" + (r.aksam ? r.hGunduz.d : r.hAksam.d) + ".</b> günündesin.");
      if (r.ez) gb.push("Osmanlı'nın kullandığı ezânî (alaturka) saatle doğum saatin <b>" + r.ez.yazi + "</b>: o dönemde saatler her akşam gün batımında 12'ye ayarlanırdı.");
      if (r.yerNot) gb.push('<span class="at-k">' + esc(r.yerNot) + "</span>");
      h.push('<div class="at-blok"><div class="at-bb">Gün batımı kuralı</div><p>' + gb.join(" ") + "</p></div>");
      // Ay
      if (r.ay) {
        var mz = MZ[r.ay.mz];
        h.push('<div class="li-kartlar at-kartlar">' +
          kart("Ay'ın evresi", evreAd(r.ay.faz), "%" + Math.round(r.ay.isik * 100) + " aydınlık") +
          kart("Ay'ın yaşı", r.ay.yas.toFixed(1).replace(".", ",") + " gün", "Son yeni Ay'dan bu yana") +
          kart("Ay'ın burcu", dYaz(r.ay.lon), "Doğduğun andaki konumu") +
          kart("Ay'ın konağı", (r.ay.mz + 1) + ". " + mz[0], mz[1]) + "</div>");
        h.push('<p class="at-k">Ay o gece 28 konaktan <b>' + (r.ay.mz + 1) + ". konak olan " + esc(mz[0]) + "</b> konağındaydı (" + esc(mzAralik(r.ay.mz)) + "). Bu konağın işaret yıldızı: " + esc(mz[2]) + '. <a href="/ruzname-nedir.html#menzil-' + (r.ay.mz + 1) + '">Ay\'ın 28 konağını oku →</a></p>');
      }
      // komşu günler
      var jb = r.aksam ? r.j + 1 : r.j, on = hicriJ(jb - 1), so = hicriJ(jb + 1);
      h.push('<div class="at-blok"><div class="at-bb">Bir gün önce, bir gün sonra</div><p class="at-k">Hicri tarihler kullanılan takvime ve hilalin görülüp görülmemesine göre bir gün kayabilir. Bu yüzden komşu günleri de okumanı öneririz:</p><div class="at-komsu">' +
        komsu(on.d, "Bir gün önce") + komsu(n, "Hesaplanan gün", true) + komsu(so.d, "Bir gün sonra") + "</div></div>");
      // hicri yaş ve doğum günleri
      var b = yerelBugun(tarayiciTz()), hb = hicri(b.y, b.m, b.d), yas = hb.y - r.h.y - ((hb.m < r.h.m || (hb.m === r.h.m && hb.d < r.h.d)) ? 1 : 0);
      var my = b.y - r.y - ((b.m < r.m || (b.m === r.m && b.d < r.d)) ? 1 : 0), li = [];
      for (var yy = hb.y; li.length < 5 && yy < hb.y + 7; yy++) {
        var dd = Math.min(r.h.d, 29), jj = hicriMiladi(yy, r.h.m, r.h.d) || hicriMiladi(yy, r.h.m, dd);
        if (jj && jj >= jdn(b.y, b.m, b.d)) { var mt = jdnTarih(jj); li.push("<li><time>" + mYaz(mt) + "</time><b>" + (yy - r.h.y) + ". hicri yaşın</b><span>" + esc(hYaz({ y: yy, m: r.h.m, d: r.h.d })) + " · " + GUNAD[new Date(Date.UTC(mt.y, mt.m - 1, mt.d)).getUTCDay()] + "</span></li>"); }
      }
      if (yas >= 0) h.push('<div class="at-blok"><div class="at-bb">Hicri yaşın ve Ay takvimindeki doğum günlerin</div><p>Güneş takvimine göre <b>' + my + "</b> yaşındasın; Ay takvimine göre ise <b>" + yas + "</b> hicri yıl yaşadın. Hicri yıl güneş yılından yaklaşık 11 gün kısa olduğu için hicri doğum günün her yıl biraz daha erken gelir:</p><ul class=\"li-liste\">" + li.join("") + "</ul></div>");
      h.push('<div class="li-btns"><button type="button" class="li-btn" data-at-kart>✦ Paylaşım kartımı oluştur</button><button type="button" class="li-btn li-ghost" data-at-aile-ac>Ailemi ekle, karşılaştır</button><button type="button" class="li-btn li-ghost" data-at-yeni>Başka bir tarih hesapla</button></div>');
      h.push('<div class="at-kartalan" hidden></div>');
      out.innerHTML = h.join("");
      out._r = r;
      $("[data-at-yeni]", out).addEventListener("click", function () { form.scrollIntoView({ behavior: "smooth" }); fT.focus(); });
      $("[data-at-kart]", out).addEventListener("click", function () { paylasimKarti(r, $(".at-kartalan", out)); });
      $("[data-at-aile-ac]", out).addEventListener("click", function () { var a = $('[data-at="aile"]'); if (a) { aileSonuc = { gun: n, ay: r.h.m, tur: v ? v[0] : "" }; aileCiz(); a.scrollIntoView({ behavior: "smooth", block: "center" }); var i = $("input", a); if (i) i.focus(); } });
      aileSonuc = { gun: n, ay: r.h.m, tur: v ? v[0] : "" }; aileCiz();
    }
    function sure(dk) { var s = Math.floor(dk / 60), d = dk % 60; return (s ? s + " saat " : "") + (d || !s ? d + " dakika" : "").trim(); }
    function kart(b, d, n) { return '<div class="li-kart"><div class="li-kb">' + esc(b) + '</div><div class="li-deg">' + esc(d) + '</div><p class="li-kucuk">' + esc(n) + "</p></div>"; }
    function komsu(g, b, ana) {
      var v = gunVeri(g);
      return '<a class="at-km' + (ana ? " ana" : "") + '" href="#gun-' + Math.min(g, 29) + '"><span class="at-km-b">' + b + '</span><b>' + g + ". gün</b>" + (v ? rozet(v[0]) : "") + "<span>" + esc(v ? (v[1] || v[2]) : "Rûznâmede 30. gün için hüküm yoktur.") + "</span></a>";
    }
  }

  /* ---------- 3. Paylaşım kartı ---------- */
  function paylasimKarti(r, alan) {
    var n = r.h.d, v = gunVeri(n), c = D.createElement("canvas"); c.width = 1080; c.height = 1920;
    var x = c.getContext("2d"), tarihGoster = false;
    function satir(t, maxw, font) { x.font = font; var k = t.split(" "), l = [], s = ""; k.forEach(function (w) { var d = s ? s + " " + w : w; if (x.measureText(d).width > maxw && s) { l.push(s); s = w; } else s = d; }); if (s) l.push(s); return l; }
    function ciz() {
      var g = x.createRadialGradient(540, 300, 50, 540, 900, 1300); g.addColorStop(0, "#2a2150"); g.addColorStop(.55, "#14101f"); g.addColorStop(1, "#0a0812");
      x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
      var s = 7; for (var i = 0; i < 140; i++) { s = (s * 9301 + 49297) % 233280; var px = s / 233280 * 1080; s = (s * 9301 + 49297) % 233280; var py = s / 233280 * 1920; s = (s * 9301 + 49297) % 233280; x.globalAlpha = .25 + s / 233280 * .6; x.fillStyle = "#f0e6d2"; x.beginPath(); x.arc(px, py, 1 + (i % 3) * .7, 0, 7); x.fill(); }
      x.globalAlpha = 1;
      x.strokeStyle = "rgba(217,185,106,.55)"; x.lineWidth = 3; x.strokeRect(54, 54, 972, 1812); x.strokeStyle = "rgba(217,185,106,.22)"; x.lineWidth = 1.5; x.strokeRect(72, 72, 936, 1776);
      x.textAlign = "center"; x.fillStyle = "#d9b96a"; x.font = "600 34px 'Segoe UI', system-ui, sans-serif"; x.fillText("DOĞDUĞUM GÜN AY TAKVİMİNDE", 540, 190);
      // Ay
      var faz = r.ay ? r.ay.faz : tipikFaz(n), cx = 540, cy = 470, rr = 170, w = Math.abs(Math.cos(faz * R)) * rr, sag = faz < 180, gib = faz > 90 && faz < 270;
      x.fillStyle = "#1d1830"; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill(); x.strokeStyle = "#4a3d73"; x.lineWidth = 3; x.stroke();
      x.save(); x.fillStyle = "#f0e6d2"; x.shadowColor = "rgba(240,230,210,.45)"; x.shadowBlur = 50; x.beginPath();
      x.arc(cx, cy, rr, -Math.PI / 2, Math.PI / 2, !sag);
      x.ellipse(cx, cy, Math.max(w, .01), rr, 0, Math.PI / 2, -Math.PI / 2, sag ? !gib : gib);
      x.closePath(); x.fill(); x.restore();
      x.fillStyle = "#f0e6d2"; x.font = "bold 190px Georgia, 'Times New Roman', serif"; x.fillText(n + ".", 540, 860);
      x.font = "52px Georgia, 'Times New Roman', serif"; x.fillStyle = "#e7cf95"; x.fillText("gün", 540, 930);
      x.font = "38px 'Segoe UI', system-ui, sans-serif"; x.fillStyle = "#cfc5e0";
      x.fillText(tarihGoster ? hYaz(r.h) : AYLAR[r.h.m - 1] + " ayının " + n + ". günü", 540, 1000);
      if (v && v[0] !== "yok") {
        var l = satir("“" + v[1] + "”", 860, "italic 54px Georgia, 'Times New Roman', serif"), y0 = 1130;
        x.fillStyle = "#f0e6d2"; l.forEach(function (t, i) { x.fillText(t, 540, y0 + i * 72); });
        var l2 = satir(v[2], 820, "34px 'Segoe UI', system-ui, sans-serif"), y1 = y0 + l.length * 72 + 40; x.fillStyle = "#b9aecb";
        l2.forEach(function (t, i) { x.fillText(t, 540, y1 + i * 48); });
        x.font = "600 30px 'Segoe UI', system-ui, sans-serif"; x.fillStyle = v[0] === "nahs" ? "#ff9a8a" : "#d9b96a"; x.fillText(TUR[v[0]].toUpperCase(), 540, y1 + l2.length * 48 + 60);
      } else { x.font = "40px 'Segoe UI', system-ui, sans-serif"; x.fillStyle = "#cfc5e0"; x.fillText("Rûznâme bu gün için hüküm yazmamış.", 540, 1160); }
      x.font = "30px 'Segoe UI', system-ui, sans-serif"; x.fillStyle = "#9a8fb8"; x.fillText("Sultan Mahmud'a nispet edilen eski bir rûznâmeden", 540, 1690);
      x.fillStyle = "#d9b96a"; x.font = "bold 40px Georgia, 'Times New Roman', serif"; x.fillText("✦ ASTRO YUVAM", 540, 1770);
    }
    ciz();
    alan.hidden = false;
    alan.innerHTML = '<div class="at-bb">Paylaşım kartın (1080×1920)</div><img class="at-kart-img" alt="Ay takvimindeki doğum günü paylaşım kartı"><label class="li-cb at-cb"><input type="checkbox" data-at-tg> Hicri yılı da kartta göster</label><p class="at-k">Güvenliğin için kartta doğum tarihin ve saatin yazmaz; yalnızca Ay takvimindeki günün görünür.</p><div class="li-btns"><a class="li-btn" download="ay-takviminde-dogum-gunum.png">Kartı indir</a><button type="button" class="li-btn li-ghost" data-at-pay>Paylaş</button></div>';
    var img = $("img", alan), a = $("a[download]", alan);
    function guncelle() { var u = c.toDataURL("image/png"); img.src = u; a.href = u; }
    guncelle();
    $("[data-at-tg]", alan).addEventListener("change", function (e) { tarihGoster = e.target.checked; ciz(); guncelle(); });
    var pb = $("[data-at-pay]", alan);
    pb.addEventListener("click", function () {
      if (!c.toBlob) return;
      c.toBlob(function (b) {
        var f = new File([b], "ay-takviminde-dogum-gunum.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: "Doğduğum gün Ay takviminde " + n + ". gündü" }).catch(function () {});
        else { pb.textContent = "Paylaşım desteklenmiyor — kartı indirebilirsin"; }
      });
    });
    alan.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- 4. Aile ve arkadaş karşılaştırması ---------- */
  var aileSonuc = null;
  function aileCiz() {
    var kok = $('[data-at="aile"]'); if (!kok) return;
    var l = depo("ay-aile") || [], ic = $(".at-aile-l", kok), ek = $(".at-aile-ek", kok);
    ek.hidden = !aileSonuc;
    var nt = $(".at-aile-not", kok); if (nt) nt.hidden = !!aileSonuc;
    if (!l.length) { ic.innerHTML = '<p class="at-k">Henüz kimseyi eklemedin. Yukarıdaki araçla bir doğum tarihini hesapla, sonra burada bir isim vererek listeye ekle.</p>'; return; }
    var say = {}; l.forEach(function (x) { say[x.gun] = (say[x.gun] || 0) + 1; });
    var s = l.slice().sort(function (a, b) { return a.gun - b.gun; });
    ic.innerHTML = '<ul class="at-aile-u">' + s.map(function (x) {
      var v = gunVeri(x.gun);
      return '<li class="' + (say[x.gun] > 1 ? "es" : "") + '"><span class="at-ai-g">' + x.gun + '.</span><span class="at-ai-a"><b>' + esc(x.ad) + "</b><small>" + esc(AYLAR[(x.ay || 1) - 1]) + " · " + esc(v ? TUR[v[0]] : "30. gün") + '</small></span><button type="button" class="at-ai-s" data-sil="' + esc(x.id) + '" aria-label="' + esc(x.ad) + ' kişisini sil">×</button></li>';
    }).join("") + "</ul>" + (Object.keys(say).some(function (k) { return say[k] > 1; }) ? '<p class="at-k">Altın çizgili satırlar Ay takviminin aynı gününde doğmuş kişileri gösterir.</p>' : "") +
      '<button type="button" class="li-btn li-ghost at-ai-t">Listeyi temizle</button>';
    $$("[data-sil]", ic).forEach(function (b) { b.addEventListener("click", function () { depo("ay-aile", (depo("ay-aile") || []).filter(function (x) { return x.id !== b.getAttribute("data-sil"); })); aileCiz(); }); });
    $(".at-ai-t", ic).addEventListener("click", function () { depo("ay-aile", []); aileCiz(); });
  }
  function aileKur() {
    var kok = $('[data-at="aile"]'); if (!kok) return;
    $(".at-aile-ek", kok).addEventListener("submit", function (e) {
      e.preventDefault(); var i = $("input", e.target), ad = i.value.trim().slice(0, 24);
      if (!ad || !aileSonuc) return;
      var l = depo("ay-aile") || []; l.push({ id: Date.now().toString(36), ad: ad, gun: aileSonuc.gun, ay: aileSonuc.ay }); depo("ay-aile", l.slice(-30)); i.value = ""; aileCiz();
    });
    aileCiz();
  }

  /* ---------- 5. 29 günlük gezgin ---------- */
  function kasifKur() {
    $$('[data-at="kasif"]').forEach(function (kok) {
      var izgara = $(".at-iz", kok), panel = $(".at-iz-p", kok), kay = $("input[type=range]", kok);
      var h = ""; for (var n = 1; n <= 29; n++) h += '<button type="button" class="at-iz-b ' + G[n][0] + '" data-n="' + n + '" aria-label="' + n + ". gün: " + TUR[G[n][0]] + '">' + aySVG(tipikFaz(n), 11, "at-ay-k") + "<b>" + n + "</b></button>";
      izgara.innerHTML = h;
      function sec(n) {
        $$(".at-iz-b", izgara).forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-n") === n); });
        var v = G[n];
        panel.innerHTML = '<div class="at-iz-ust">' + aySVG(tipikFaz(n), 30) + "<div><b>Ay'ın " + n + ". günü</b>" + rozet(v[0]) + '<span class="at-k">' + esc(evreAd(tipikFaz(n))) + "</span></div></div>" + sozKutu(n) + '<a class="at-git" href="#gun-' + n + '">Bu günün bütün hükümlerini oku ↓</a>';
        if (kay && +kay.value !== n) kay.value = n;
      }
      izgara.addEventListener("click", function (e) { var b = e.target.closest(".at-iz-b"); if (b) sec(+b.getAttribute("data-n")); });
      if (kay) kay.addEventListener("input", function () { sec(+kay.value); });
      var b = yerelBugun(tarayiciTz()); sec(Math.min(hicri(b.y, b.m, b.d).d, 29));
    });
  }

  /* ---------- 6. Miladi ↔ hicri çevirici ---------- */
  function ceviriciKur() {
    $$('[data-at="cevir"]').forEach(function (kok) {
      var m = $(".at-cv-m", kok), mo = $(".at-cv-mo", kok), hy = $(".at-cv-hy", kok), hm = $(".at-cv-hm", kok), hd = $(".at-cv-hd", kok), ho = $(".at-cv-ho", kok);
      hm.innerHTML = AYLAR.map(function (a, i) { return '<option value="' + (i + 1) + '">' + (i + 1) + ". " + a + "</option>"; }).join("");
      var b = yerelBugun(tarayiciTz()), hb = hicri(b.y, b.m, b.d);
      hy.value = hb.y; hm.value = hb.m; hd.value = hb.d;
      function m2h() {
        var v = m.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { mo.innerHTML = ""; return; }
        var p = v.split("-").map(Number), h = hicri(p[0], p[1], p[2]), ert = hicri(jdnTarih(jdn(p[0], p[1], p[2]) + 1).y, jdnTarih(jdn(p[0], p[1], p[2]) + 1).m, jdnTarih(jdn(p[0], p[1], p[2]) + 1).d);
        mo.innerHTML = "<b>" + esc(hYaz(h)) + "</b> · Ay'ın " + h.d + ". günü " + (G[h.d] ? rozet(G[h.d][0]) : "") + '<span class="at-k">O gün akşam gün batımından sonra: ' + esc(hYaz(ert)) + "</span>";
      }
      function h2m() {
        var y = +hy.value, a = +hm.value, g = +hd.value;
        if (!(y > 1300 && y < 1600 && g >= 1 && g <= 30)) { ho.textContent = "1300 ile 1600 arasında bir hicri yıl ve 1–30 arasında bir gün gir."; return; }
        var j = hicriMiladi(y, a, g);
        if (!j) { ho.textContent = "Bu ay " + (g === 30 ? "29 gün çekiyor; 30. gün yok." : "için tarih bulunamadı."); return; }
        var t = jdnTarih(j); ho.innerHTML = "<b>" + mYaz(t) + "</b> · " + GUNAD[new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay()] + '<span class="at-k">Hicri gün bir önceki akşam, ' + mYaz(jdnTarih(j - 1)) + " gün batımında başlar.</span>";
      }
      m.addEventListener("change", m2h); m.addEventListener("input", m2h);
      [hy, hm, hd].forEach(function (e) { e.addEventListener("input", h2m); e.addEventListener("change", h2m); });
      h2m();
    });
  }

  /* ---------- 7. Bu ayın rûznâme takvimi ---------- */
  function takvimKur() {
    $$('[data-at="takvim"]').forEach(function (kok) {
      var b = yerelBugun(tarayiciTz()), bj = jdn(b.y, b.m, b.d), cur = hicri(b.y, b.m, b.d), y = cur.y, m = cur.m;
      var bas = $(".at-tk-b", kok), iz = $(".at-tk-iz", kok), p = $(".at-tk-p", kok), geri = $("[data-onc]", kok), ileri = $("[data-son]", kok);
      function ciz() {
        var j1 = hicriMiladi(y, m, 1); if (!j1) return;
        var l = [], j = j1; while (l.length < 30) { var h = hicriJ(j); if (h.m !== m) break; l.push({ j: j, h: h }); j++; }
        var t1 = jdnTarih(j1), t2 = jdnTarih(j - 1);
        bas.textContent = AYLAR[m - 1] + " " + y + " · " + t1.d + " " + MAY[t1.m - 1] + " – " + t2.d + " " + MAY[t2.m - 1] + " " + t2.y;
        var wd = new Date(Date.UTC(t1.y, t1.m - 1, t1.d)).getUTCDay(), off = (wd + 6) % 7, h = "";
        ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].forEach(function (g) { h += '<span class="at-tk-g">' + g + "</span>"; });
        for (var i = 0; i < off; i++) h += "<span></span>";
        l.forEach(function (x) {
          var t = jdnTarih(x.j), v = G[x.h.d], tur = v ? v[0] : "otuz";
          h += '<button type="button" class="at-tk-c ' + tur + (x.j === bj ? " bugun" : "") + '" data-n="' + x.h.d + '" data-j="' + x.j + '"><b>' + x.h.d + "</b><small>" + t.d + " " + MAY[t.m - 1].slice(0, 3) + "</small></button>";
        });
        iz.innerHTML = h;
        var sec = l.filter(function (x) { return x.j === bj; })[0] || l[0]; goster(sec.h.d, sec.j);
      }
      function goster(n, j) {
        $$(".at-tk-c", iz).forEach(function (c) { c.classList.toggle("on", +c.getAttribute("data-j") === j); });
        var t = jdnTarih(j), on = jdnTarih(j - 1), v = G[n];
        p.innerHTML = "<b>" + n + " " + esc(AYLAR[m - 1]) + "</b> · " + mYaz(t) + " " + GUNAD[new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay()] + (v ? " " + rozet(v[0]) : "") +
          '<span class="at-k">Bu hicri gün ' + on.d + " " + MAY[on.m - 1] + " akşamı gün batımında başlar.</span>" + sozKutu(n);
      }
      iz.addEventListener("click", function (e) { var c = e.target.closest(".at-tk-c"); if (c) goster(+c.getAttribute("data-n"), +c.getAttribute("data-j")); });
      geri.addEventListener("click", function () { m--; if (m < 1) { m = 12; y--; } ciz(); });
      ileri.addEventListener("click", function () { m++; if (m > 12) { m = 1; y++; } ciz(); });
      ciz();
    });
  }

  /* ---------- 8. Gezegen saatleri ---------- */
  function saatlerKur() {
    $$('[data-at="saatler"]').forEach(function (kok) {
      var form = $("form", kok), inp = $(".at-yer-f input", kok), out = $(".at-gs-o", kok), msg = $(".at-msg", kok), konum = $("[data-konum]", kok), yer = depo("ay-gs-yer") || VARSAYILAN, zam = 0;
      function ciz() {
        astro().then(function () {
          var g = gezSaatleri(yer); if (!g) { out.innerHTML = '<p class="at-k">Bu konumda bugün güneş doğup batmadığı için gezegen saatleri hesaplanamıyor.</p>'; return; }
          var an = Date.now(), h = '<p class="at-gs-ust">' + esc(yer.ad) + " · <b>" + g.gunAd + "</b> günü <b>" + GL[g.yon] + " " + GEZE[g.yon] + "</b> aittir. Güneş " + saatYaz(g.dog, yer.tz) + "'de doğdu, " + saatYaz(g.bat, yer.tz) + "'de batıyor. Bugün bir gündüz saati <b>" + Math.round(g.gunUz / 6e4) + " dakika</b>, bir gece saati <b>" + Math.round(g.geceUz / 6e4) + " dakika</b>.</p>";
          h += '<div class="at-gs-iki"><div><div class="at-bb">Gündüz saatleri</div><ol class="at-gs">';
          g.saat.forEach(function (s, i) {
            if (i === 12) h += '</ol></div><div><div class="at-bb">Gece saatleri</div><ol class="at-gs">';
            var simdi = an >= s.bas && an < s.son;
            h += '<li class="' + (simdi ? "simdi" : "") + '"><span class="no">' + ((i % 12) + 1) + '.</span><time>' + saatYaz(s.bas, yer.tz) + "–" + saatYaz(s.son, yer.tz) + '</time><b>' + GL[s.gez] + " " + s.gez + "</b>" + (simdi ? "<em>şu an</em>" : "") + "</li>";
          });
          h += "</ol></div></div>";
          out.innerHTML = h;
        }).catch(function () { out.innerHTML = '<p class="at-k">Hesaplama dosyası yüklenemedi; bağlantını kontrol edip sayfayı yenile.</p>'; });
      }
      form.addEventListener("submit", function (e) {
        e.preventDefault(); var v = inp.value.trim(); if (!v) return; msg.textContent = "Konum aranıyor…";
        yerBul(v).then(function (y) { if (!y) { msg.textContent = "Bu yeri bulamadık; şehri ve ülkeyi yaz."; return; } msg.textContent = ""; yer = y; depo("ay-gs-yer", y); ciz(); });
      });
      if (konum) konum.addEventListener("click", function () {
        if (!navigator.geolocation) { msg.textContent = "Tarayıcın konum paylaşımını desteklemiyor."; return; }
        msg.textContent = "Konum alınıyor…";
        navigator.geolocation.getCurrentPosition(function (p) { msg.textContent = ""; yer = { ad: "Bulunduğun yer", lat: p.coords.latitude, lon: p.coords.longitude, tz: tarayiciTz() }; ciz(); }, function () { msg.textContent = "Konum izni verilmedi; şehir adını yazabilirsin."; }, { timeout: 10000, maximumAge: 6e5 });
      });
      gor(kok, function () { ciz(); zam = setInterval(ciz, 60000); });
    });
  }

  /* ---------- 9. Doğduğun günün ve saatin gezegeni ---------- */
  function dogumSaatKur() {
    $$('[data-at="dogumsaat"]').forEach(function (kok) {
      var form = $("form", kok), out = $(".at-ds-o", kok), msg = $(".at-msg", kok);
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var tv = $(".at-ds-t", form).value, sv = $(".at-ds-s", form).value, yt = $(".at-ds-y", form).value.trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(tv)) { msg.textContent = "Doğum tarihini gir."; return; }
        if (!/^\d{2}:\d{2}/.test(sv)) { msg.textContent = "Gezegen saati için doğum saatini de gir."; return; }
        msg.textContent = "Hesaplanıyor…";
        Promise.all([astro(), yt ? yerBul(yt) : Promise.resolve(null)]).then(function (v) {
          var yer = v[1] || VARSAYILAN, p = tv.split("-").map(Number), s = sv.split(":").map(Number), t = yerelUTC(p[0], p[1], p[2], s[0], s[1], yer.tz);
          var g = gezSaatleri(yer, t); if (!g) { msg.textContent = "Bu tarih ve yer için gezegen saati hesaplanamadı."; return; }
          var sa = g.saat.filter(function (x) { return t >= x.bas && t < x.son; })[0];
          var wd = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(), once = g.gunAd !== GUNAD[wd], ez = ezani(t, t >= g.bat ? g.bat : (function () { var d = jdnTarih(jdn(p[0], p[1], p[2]) - 1); return gunes(yer.lat, yer.lon, d.y, d.m, d.d, yer.tz).bat; })());
          msg.textContent = "";
          out.hidden = false;
          out.innerHTML = '<div class="li-kartlar at-kartlar">' +
            '<div class="li-kart"><div class="li-kb">Doğduğun gün</div><div class="li-deg">' + GUNAD[wd] + '</div><p class="li-kucuk">Gezegen günü: ' + GL[g.yon] + " " + g.yon + (once ? " (gün doğumundan önce doğduğun için bir önceki günün gecesi)" : "") + "</p></div>" +
            '<div class="li-kart ana"><div class="li-kb">Doğduğun saatin gezegeni</div><div class="li-deg">' + (sa ? GL[sa.gez] + " " + sa.gez : "—") + '</div><p class="li-kucuk">' + (sa ? (sa.gece ? "Gecenin " : "Gündüzün ") + ((sa.i % 12) + 1) + ". saati · " + saatYaz(sa.bas, yer.tz) + "–" + saatYaz(sa.son, yer.tz) : "") + "</p></div>" +
            '<div class="li-kart"><div class="li-kb">Ezânî saatle</div><div class="li-deg">' + ez.yazi + '</div><p class="li-kucuk">Gün batımından ' + Math.floor(ez.dk / 60) + " saat " + (ez.dk % 60) + " dakika sonra</p></div></div>" +
            (yt && !v[1] ? '<p class="at-k">“' + esc(yt) + "” bulunamadı; İstanbul'a göre hesaplandı.</p>" : "");
        }).catch(function () { msg.textContent = "Hesaplama dosyası yüklenemedi; bağlantını kontrol et."; });
      });
    });
  }

  /* ---------- 10. Ay'ın 28 konağı çarkı ---------- */
  function menzilKur() {
    $$('[data-at="menzil"]').forEach(function (kok) {
      var svg = $("svg", kok), p = $(".at-mz-p", kok), aySec = -1;
      function goster(i) {
        $$(".mz", svg).forEach(function (g) { g.classList.toggle("on", +g.getAttribute("data-i") === i); });
        var m = MZ[i];
        p.innerHTML = "<b>" + (i + 1) + ". konak · " + esc(m[0]) + "</b> <span class=\"at-k\">“" + esc(m[1]) + "”</span><span class=\"at-k\">" + esc(mzAralik(i)) + " · İşaret yıldızı: " + esc(m[2]) + "</span>" + (i === aySec ? '<span class="at-rz sad">Ay şu an bu konakta</span>' : '<span class="at-k at-mz-gel">Ay\'ın bu konağa bir sonraki girişi hesaplanıyor…</span>') + '<a class="at-git" href="#menzil-' + (i + 1) + '">Bu konağın açıklamasını oku ↓</a>';
        if (i !== aySec && window.Astronomy) {
          var bas = i * 360 / 28, t = Date.now(), lon0 = ayLon(t), adim = 36e5;
          for (var k = 1; k < 24 * 29; k++) { var l = ayLon(t + k * adim); if (norm(l - bas) < norm(lon0 - bas) && norm(l - bas) < 20) { var tt = new Date(t + k * adim), gel = $(".at-mz-gel", p); if (gel) gel.textContent = "Ay bu konağa bir sonraki sefer " + tt.getDate() + " " + MAY[tt.getMonth()] + " " + GUNAD[tt.getDay()] + " günü girer."; break; } lon0 = l; }
        }
      }
      svg.addEventListener("click", function (e) { var g = e.target.closest(".mz"); if (g) goster(+g.getAttribute("data-i")); });
      svg.addEventListener("keydown", function (e) { var g = e.target.closest(".mz"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); goster(+g.getAttribute("data-i")); } });
      gor(kok, function () {
        astro().then(function () {
          var h = ayHal(Date.now()), mk = $(".mz-ay", svg), c = 210, rr = 150;
          aySec = h.mz;
          if (mk) { mk.setAttribute("transform", "translate(" + (c - rr * Math.cos(h.lon * R)).toFixed(1) + " " + (c + rr * Math.sin(h.lon * R)).toFixed(1) + ")"); mk.style.display = ""; }
          var fz = $(".mz-faz", svg); if (fz) fz.innerHTML = aySVG(h.faz, 22, "at-ay-k").replace(/^<svg[^>]*>|<\/svg>$/g, "");
          var bl = $(".mz-bilgi", kok); if (bl) bl.innerHTML = "Ay şu an <b>" + BN[Math.floor(h.lon / 30)] + "</b> burcunda (" + dYaz(h.lon).replace(/^\S+ /, "") + "), <b>" + (h.mz + 1) + ". konak " + esc(MZ[h.mz][0]) + "</b> konağında · " + esc(evreAd(h.faz)) + ", %" + Math.round(h.isik * 100) + " aydınlık";
          goster(h.mz);
        }).catch(function () { goster(0); });
      });
    });
  }

  /* ---------- 11. Kısa test ---------- */
  function testKur() {
    $$('[data-at="test"]').forEach(function (kok) {
      var dogru = 0, cev = 0, top = $$(".at-ts", kok).length, skor = $(".at-ts-skor", kok);
      $$(".at-ts", kok).forEach(function (q) {
        q.addEventListener("click", function (e) {
          var b = e.target.closest("button"); if (!b || q.classList.contains("bitti")) return;
          q.classList.add("bitti"); cev++;
          var ok = b.hasAttribute("data-d"); if (ok) dogru++;
          $$("button", q).forEach(function (x) { x.disabled = true; if (x.hasAttribute("data-d")) x.classList.add("d"); });
          if (!ok) b.classList.add("y");
          var a = $(".at-ts-a", q); if (a) a.hidden = false;
          if (cev === top && skor) skor.textContent = top + " sorudan " + dogru + " doğru. " + (dogru === top ? "Bir müneccimbaşı kadar bilgilisin!" : dogru >= top / 2 ? "Güzel; açıklamaları okuyunca eksikler tamamlanır." : "Yazının ilgili bölümlerine bir göz atmak iyi gelecek.");
        });
      });
    });
  }

  function basla() { bugunKur(); hesapKur(); aileKur(); kasifKur(); ceviriciKur(); takvimKur(); saatlerKur(); dogumSaatKur(); menzilKur(); testKur(); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", basla); else basla();
})();
