/* Astro Yuvam — Sekt (gündüz/gece haritası) hesaplama + gökyüzü simülatörü
   • [data-sekt]      → doğum bilgisiyle haritanın gündüz mü gece mi olduğunu, sektin ışığını,
                        yardımcı ve zorlayıcı gezegenleri ve evlerini gösterir.
                        Doğum haritası Astro Yuvam sunucusunda (Placidus) hesaplanır.
   • [data-sekt-sim]  → seçilen şehir, ay ve saatte Güneş'in ufkun üstünde mi altında mı
                        olduğunu tarayıcıda astronomy-engine ile hesaplar (sunucu yok). */
(function () {
  "use strict";
  if (window.__sektHesap) return; window.__sektHesap = 1;
  var API = "https://astro-rapor.onrender.com/api/harita";
  var VS = "︎";
  var BN = ["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"];
  var GL = { "Güneş": "☉", "Ay": "☽", "Merkür": "☿", "Venüs": "♀", "Mars": "♂", "Jüpiter": "♃", "Satürn": "♄" };
  var BGL = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  function $(s, k) { return (k || document).querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function norm(x) { x %= 360; return x < 0 ? x + 360 : x; }
  function g(ad) { return (GL[ad] || "") + VS; }

  /* ---------- evlerin anlattığı alanlar ---------- */
  var ALAN = ["kendin, bedenin ve ilk izlenimin", "para, kazanç ve kendini değerli hissetmen", "konuşma, yazışma, kardeşler ve yakın çevren",
    "ev, aile, anne-baba ve iç huzurun", "aşk, çocuklar, keyif ve yaratıcılığın", "iş rutinin, günlük düzenin ve sağlık alışkanlıkların",
    "eşin, evliliğin ve birebir ilişkilerin", "ortak para, borç, miras ve derin bağların", "eğitim, yolculuk, inanç ve hayata bakışın",
    "kariyerin, statün ve toplumdaki yerin", "arkadaşların, çevren ve gelecek planların", "iç dünyan, yalnız kalma ihtiyacın ve görünmeyen yüklerin"];
  var IPUCU = [
    "Kendine yüklenmeden önce dinlenmeyi bir görev gibi takvimine yaz; bedenin ilk uyarıyı verdiğinde dur.",
    "Büyük para kararlarını bir gece beklet, bütçeni yazılı tut; değerini sadece kazancınla ölçme.",
    "Önemli konuşmaları mesajla değil yüz yüze yap; gönderdiğin her cümleyi bir kez daha oku.",
    "Evde herkesin sorumluluğunu konuşup paylaştırın; aile içindeki eski kırgınlıkları ertelemek yükü büyütür.",
    "Keyfi 'iş bitince' diye erteleme; aşkta ve çocuklarla ilişkide beklentini açıkça söyle.",
    "Günlük düzenini gerçekçi kur, uykunu ve öğün saatlerini koru; işte her şeyi tek başına üstlenme.",
    "Eşinle ya da ortağınla kim neyi yapacak, baştan netleştirin; kırgınlığı biriktirmeden konuşun.",
    "Ortak para ve borç konularını yazıya dök; güven kırıldığında hemen değil, sakinleşince konuş.",
    "Fikirlerini dayatmak yerine soru sor; uzun yolculuk ve eğitim planlarına gerçekçi süre ayır.",
    "İş yerinde sınırını erken çiz; hırsının seni yormasına izin vermeden molaları planla.",
    "Herkese yetişmeye çalışma; çevrende sana enerji veren birkaç kişiye zaman ayır.",
    "İçine attıklarını yazarak ya da güvendiğin biriyle konuşarak dışarı çıkar; yalnız kalma ihtiyacını suçluluk duymadan karşıla."];
  var DOGA = {
    "Mars": "Bu alanda işler hızla kızışabilir; acele, tartışma ya da sabırsızlık en sık karşılaştığın sınav olabilir.",
    "Satürn": "Bu alanda işler gecikebilir ya da sana fazladan yük gibi gelebilir; “neden hep ben” hissi en çok burada uyanabilir."
  };
  var YARDIM = {
    "Jüpiter": "Gündüz haritasının yardımcı gezegeni. Fırsat, destek ve kolaylık en çok bu alandan gelebilir.",
    "Venüs": "Gece haritasının yardımcı gezegeni. Sevgi, uyum ve toparlanma en çok bu alandan gelebilir."
  };
  var YAPICI = {
    "Satürn": "Gündüz haritasında Satürn daha ılımlı çalışır: zorlansan da emek verdikçe sağlam ve kalıcı sonuç alabilirsin.",
    "Mars": "Gece haritasında Mars daha ılımlı çalışır: öfken ve cesaretin işe dönüşür, sınır çizmeni kolaylaştırır."
  };

  /* ---------- harita ---------- */
  function haritaGetir(v) {
    var anahtar = [v.birthDate, v.birthTime, v.birthPlace].join("|");
    try { var c = JSON.parse(localStorage.getItem("ay_natal_v1") || "null"); if (c && c.k === anahtar && c.v && c.v.ok) return Promise.resolve(c.v); } catch (e) {}
    var b = { name: v.name || "", birthDate: v.birthDate, birthPlace: v.birthPlace }; if (v.birthTime) b.birthTime = v.birthTime;
    return fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) })
      .then(function (r) { return r.json().then(function (j) { if (r.status === 429) throw new Error(j.mesaj || "Bugünlük hesaplama hakkın doldu, yarın tekrar dene."); return j; }); })
      .then(function (j) { if (j && j.ok) { delete j.cark; try { localStorage.setItem("ay_natal_v1", JSON.stringify({ k: anahtar, v: j })); } catch (e) {} } return j; });
  }
  function hazirla(j) {
    var N = { p: {}, asc: null, saat: !(j.dogumBilgi && j.dogumBilgi.saatBilinmiyor) };
    (j.gezegenler || []).forEach(function (x) { var i = BN.indexOf(x.burc); if (i >= 0) N.p[x.ad] = { lon: i * 30 + (+x.derece || 0), burc: x.burc, der: +x.derece || 0, ev: x.ev }; });
    if (j.yukselen) N.asc = BN.indexOf(j.yukselen.burc) * 30 + (+j.yukselen.derece || 0);
    if (j.evler && j.evler.length === 12) N.cusp = j.evler.slice().sort(function (a, b) { return a.ev - b.ev; }).map(function (e) { return BN.indexOf(e.burc) * 30 + (+e.derece || 0); });
    return N;
  }
  function konum(p) { return p ? esc(p.burc) + " " + Math.floor(p.der) + "°" + (p.ev ? " · " + p.ev + ". ev" : "") : "—"; }

  /* ---------- mini çark: ufuk yatay, üst yarı gündüz, alt yarı gece ---------- */
  function cark(N, gunduz) {
    var S = 300, C = 150, R0 = 142, R1 = 118, R2 = 62;
    function P(l, r) { var a = Math.PI + (l - N.asc) * Math.PI / 180; return [+(C + r * Math.cos(a)).toFixed(1), +(C - r * Math.sin(a)).toFixed(1)]; }
    var h = '<svg viewBox="0 0 ' + S + " " + S + '" role="img" aria-label="Haritanın ufuk çizgisi ve gezegenler">' +
      '<defs><clipPath id="sk-ust"><rect x="0" y="0" width="300" height="150"/></clipPath><clipPath id="sk-alt"><rect x="0" y="150" width="300" height="150"/></clipPath></defs>' +
      '<circle cx="150" cy="150" r="' + R0 + '" fill="rgba(246,194,154,.20)" clip-path="url(#sk-ust)"/>' +
      '<circle cx="150" cy="150" r="' + R0 + '" fill="rgba(35,52,106,.55)" clip-path="url(#sk-alt)"/>' +
      '<circle cx="150" cy="150" r="' + R0 + '" fill="none" stroke="rgba(217,185,106,.55)"/>' +
      '<circle cx="150" cy="150" r="' + R2 + '" fill="rgba(20,16,31,.55)" stroke="rgba(217,185,106,.3)"/>';
    if (N.cusp) N.cusp.forEach(function (c, i) {
      var a = P(c, R0), b = P(c, R2), n = P(c + norm(N.cusp[(i + 1) % 12] - c) / 2, R2 + 12);
      if (i !== 0 && i !== 6) h += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="rgba(154,143,184,.28)"/>';
      h += '<text x="' + n[0] + '" y="' + n[1] + '" fill="#9a8fb8" font-size="9" font-family="Segoe UI,sans-serif">' + (i + 1) + "</text>";
    });
    h += '<line x1="4" y1="150" x2="296" y2="150" stroke="#f3dca0" stroke-width="2.2"/>' +
      '<text x="20" y="140" fill="#e7cf95" font-size="10" font-family="Segoe UI,sans-serif" text-anchor="start">ASC</text>' +
      '<text x="280" y="140" fill="#e7cf95" font-size="10" font-family="Segoe UI,sans-serif" text-anchor="end">DSC</text>' +
      '<text x="150" y="30" fill="#7a5a22" font-size="10" font-family="Segoe UI,sans-serif" letter-spacing="2">GÜNDÜZ</text>' +
      '<text x="150" y="276" fill="#aebbe6" font-size="10" font-family="Segoe UI,sans-serif" letter-spacing="2">GECE</text>';
    var sira = ["Güneş", "Ay", "Merkür", "Venüs", "Mars", "Jüpiter", "Satürn"], kul = [];
    sira.forEach(function (ad) {
      var p = N.p[ad]; if (!p) return; var l = p.lon, r = 96;
      kul.forEach(function (u) { if (Math.abs(norm(l - u.l + 180) - 180) < 9 && Math.abs(r - u.r) < 1) r -= 20; });
      kul.push({ l: l, r: r }); var q = P(l, r);
      var ana = ad === "Güneş" || ad === (gunduz ? "Mars" : "Satürn");
      h += '<g><circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (ana ? 13 : 11) + '" fill="' + (ad === "Güneş" ? "#3a2d10" : "#221a3a") + '" stroke="' + (ad === "Güneş" ? "#f3d27a" : ana ? "#e5624e" : "rgba(217,185,106,.55)") + '" stroke-width="' + (ana ? 1.8 : 1) + '"/>' +
        '<text x="' + q[0] + '" y="' + q[1] + '" fill="' + (ad === "Güneş" ? "#f7dc8c" : "#f0e6d2") + '" font-size="' + (ana ? 15 : 13) + '" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI Symbol,Noto Sans Symbols 2,DejaVu Sans,sans-serif">' + (GL[ad] + VS) + "</text></g>";
    });
    return h + "</svg>";
  }

  function kart(b, deg, metin, alt, cls) { return '<div class="ev-kart' + (cls ? " " + cls : "") + '"><div class="ev-kb">' + esc(b) + '</div><div class="ev-deg">' + deg + "</div><p>" + esc(metin) + "</p>" + (alt ? '<p class="ev-kucuk">' + esc(alt) + "</p>" : "") + "</div>"; }

  function sonuc(k, j, v) {
    var N = hazirla(j), out = $(".ev-sonuc", k), gs = N.p["Güneş"];
    if (!N.saat || !gs || !gs.ev || N.asc == null) {
      out.innerHTML = '<div class="ev-uyari">Gündüz mü gece mi olduğunu bulmak için doğum saati gerekir: aynı gün sabah doğan biriyle akşam doğan birinin sekti farklıdır. Saatini bilmiyorsan aşağıdaki gökyüzü simülatöründen doğduğun ayda Güneş\'in kaçta battığına bakabilir, saatini öğrenmek için <a href="/dogum-saati-nasil-ogrenilir.html">doğum saatini öğrenme rehberimizi</a> okuyabilirsin.</div>';
      out.hidden = false; out.scrollIntoView({ behavior: "smooth", block: "start" }); return;
    }
    var gunduz = gs.ev >= 7;
    var isik = gunduz ? "Güneş" : "Ay", yard = gunduz ? "Jüpiter" : "Venüs", yap = gunduz ? "Satürn" : "Mars", zor = gunduz ? "Mars" : "Satürn";
    var dsc = norm(N.asc + 180), yakin = Math.min(Math.abs(norm(gs.lon - N.asc + 180) - 180), Math.abs(norm(gs.lon - dsc + 180) - 180));
    var me = N.p["Merkür"], meSabah = me ? norm(gs.lon - me.lon) < 180 && norm(gs.lon - me.lon) > 0 : null;
    var ad = v.name ? esc(v.name) + ", " : "";
    var h = '<div class="sk-hukum ' + (gunduz ? "gun" : "gece") + '"><span class="sk-ikon">' + (gunduz ? "☉" : "☽") + VS + '</span><div><div class="sk-hk">' + ad + "haritan</div>" +
      '<div class="sk-ht">' + (gunduz ? "Gündüz haritası" : "Gece haritası") + "</div>" +
      '<div class="sk-ha">Güneş ' + konum(gs) + " · ufuk çizgisinin " + (gunduz ? "üstünde" : "altında") + "</div></div></div>";
    if (yakin < 5) h += '<div class="ev-uyari">Güneş ufuk çizgisine çok yakın (yaklaşık ' + Math.max(1, Math.round(yakin)) + '°). Doğum saatin birkaç dakika farklıysa sonuç değişebilir; saatin kesin değilse <a href="/yaz-saati-dogum-saati.html">yaz saati kontrolünü</a> de yap.</div>';
    h += '<div class="ev-ust"><div class="ev-cark">' + cark(N, gunduz) + '<div class="ev-lej"><span style="color:#f3d27a">☉' + VS + ' Güneş</span><span style="color:#e5624e">◯ en çok zorlayan</span></div></div><div class="ev-kartlar">' +
      kart("Sektin ışığı", g(isik) + " " + isik + " · " + konum(N.p[isik]), gunduz ? "Gündüz doğduğun için Güneş haritanın ana ışığı. Güneş burcun seni iyi anlatır; hedeflerin ve görünür yanın öne çıkar." : "Gece doğduğun için Ay haritanın ana ışığı. Ay burcun ve Ay'ın evi seni Güneş burcundan daha iyi anlatabilir; duygusal ihtiyaçların belirleyicidir.") +
      kart("Yardımcın", g(yard) + " " + yard + " · " + konum(N.p[yard]), YARDIM[yard], N.p[yard] && N.p[yard].ev ? "Bu alan: " + ALAN[N.p[yard].ev - 1] + "." : "") +
      "</div></div>" +
      '<div class="ev-kartlar ev-iki">' +
      kart("En çok zorlayan gezegenin", g(zor) + " " + zor + " · " + konum(N.p[zor]), DOGA[zor], N.p[zor] && N.p[zor].ev ? "Bu alan: " + ALAN[N.p[zor].ev - 1] + ". " + IPUCU[N.p[zor].ev - 1] : "", "sk-zor") +
      kart("Zorlayıcı ama yapıcı", g(yap) + " " + yap + " · " + konum(N.p[yap]), YAPICI[yap], N.p[yap] && N.p[yap].ev ? "Bu alan: " + ALAN[N.p[yap].ev - 1] + "." : "") +
      "</div>";
    if (meSabah !== null) h += '<p class="ev-kucuk" style="margin-top:12px">' + g("Merkür") + " Merkür'ün " + (meSabah ? "sabah yıldızı: Güneş'ten önce doğuyor, bu yüzden gündüz takımında sayılır." : "akşam yıldızı: Güneş'ten sonra batıyor, bu yüzden gece takımında sayılır.") + "</p>";
    h += '<div class="ev-zaman-b">Senin için üç küçük öneri</div><ul class="y-l iyi">' + (gunduz ?
      "<li><b>Acele kararları bir gece beklet.</b> Mars'ın hızı en çok anlık tepkilerde sorun çıkarır.</li><li><b>Gününü sıraya koy.</b> Liste ve plan, Satürn'ün iyi tarafını çalıştırır.</li><li><b>Kafan karışınca danış.</b> Güvendiğin birinin fikri Jüpiter'in kapısını açar.</li>" :
      "<li><b>Yardım istemekten çekinme.</b> Satürn'ün yükü paylaşınca hafifler.</li><li><b>Kusursuzu bekleme.</b> Yeterince iyi, çoğu zaman gerçekten yeterlidir.</li><li><b>Sevdiğin biriyle vakit geçir.</b> Venüs seni en çok sohbet ve yakınlıkla toparlar.</li>") + "</ul>";
    h += '<div class="ev-btns"><button type="button" class="ev-btn ev-ghost sk-paylas">Sonucu paylaş</button><a class="ev-btn" href="/dogum-haritasi-analizi.html">Haritanın tamamını oku →</a></div>';
    out.innerHTML = h; out.hidden = false;
    $(".sk-paylas", out).onclick = function () {
      var m = "Benim haritam " + (gunduz ? "gündüz haritası ☉" : "gece haritası ☽") + ", en çok zorlayan gezegenim " + zor + ". Seninki hangisi? astroyuvam.com/sekt-gunduz-gece-haritasi.html";
      var b = this; if (navigator.share) navigator.share({ text: m }).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(m).then(function () { b.textContent = "Kopyalandı ✓"; });
    };
    out.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.gtag) gtag("event", "sekt_hesap", { sonuc: gunduz ? "gunduz" : "gece" });
  }

  function kur(k) {
    k.innerHTML = '<form class="ev-form" novalidate>' +
      '<label>Adın (isteğe bağlı)<input type="text" class="ev-ad" autocomplete="given-name"></label>' +
      '<label>Doğum tarihi<input type="date" data-dg class="ev-tarih" min="1930-01-01" max="2030-12-31" required></label>' +
      '<label>Doğum saati<input type="time" data-dg class="ev-saat" required></label>' +
      '<label>Doğum yeri<input type="text" data-yer class="ev-yer" placeholder="Örn. Bursa" required></label>' +
      '<button class="ev-btn tam" type="submit">✦ Haritam gündüz mü gece mi?</button><div class="ev-msg tam" aria-live="polite"></div></form><div class="ev-sonuc" hidden></div>';
    var f = $(".ev-form", k), msg = $(".ev-msg", k);
    try { for (var i = 0; i < localStorage.length; i++) { var kk = localStorage.key(i); if (/^sb-.*-auth-token$/.test(kk)) { var o = JSON.parse(localStorage.getItem(kk) || "{}"), u = o.user || (o.currentSession && o.currentSession.user), m = u && u.user_metadata; if (m && m.birth_date) { $(".ev-ad", k).value = (m.full_name || "").split(" ")[0]; $(".ev-tarih", k).value = m.birth_date; $(".ev-saat", k).value = (m.birth_time || "").slice(0, 5); $(".ev-yer", k).value = m.birth_place || ""; msg.textContent = "Üye bilgilerin dolduruldu ✦"; } } } } catch (e) {}
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = { name: $(".ev-ad", k).value.trim(), birthDate: $(".ev-tarih", k).value, birthTime: ($(".ev-saat", k).value || "").slice(0, 5), birthPlace: $(".ev-yer", k).value.trim() };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.birthDate)) { msg.textContent = "Lütfen doğum tarihini yaz."; return; }
      if (!/^\d{2}:\d{2}$/.test(v.birthTime)) { msg.textContent = "Gündüz mü gece mi olduğunu bulmak için doğum saati gerekir."; return; }
      if (!v.birthPlace) { msg.textContent = "Lütfen doğum yerini yaz."; return; }
      var btn = $(".ev-btn", f); btn.disabled = true; msg.textContent = "Haritan hesaplanıyor…";
      haritaGetir(v).then(function (j) {
        btn.disabled = false;
        if (!j || !j.ok) { msg.textContent = (j && (j.mesaj || (j.errors && j.errors.join(" ")))) || "Harita şu an hesaplanamadı, birazdan tekrar dener misin?"; return; }
        msg.textContent = ""; sonuc(k, j, v);
      }).catch(function (er) { btn.disabled = false; msg.textContent = (er && er.message && er.message.length < 120 ? er.message : "Bağlantı kurulamadı, birazdan tekrar dener misin?"); });
    });
  }

  /* ---------- gökyüzü simülatörü (tarayıcıda, sunucusuz) ---------- */
  var SEHIR = [["İstanbul", 41.01, 28.98], ["Ankara", 39.93, 32.86], ["İzmir", 38.42, 27.14], ["Bursa", 40.19, 29.06], ["Antalya", 36.90, 30.70],
    ["Adana", 37.00, 35.32], ["Konya", 37.87, 32.48], ["Gaziantep", 37.07, 37.38], ["Kayseri", 38.73, 35.49], ["Samsun", 41.29, 36.33],
    ["Trabzon", 41.00, 39.72], ["Erzurum", 39.90, 41.27], ["Diyarbakır", 37.91, 40.24], ["Van", 38.50, 43.38], ["Edirne", 41.68, 26.56]];
  var AY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  function yukle(src) { return new Promise(function (ok, no) { if (window.Astronomy) return ok(); var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  function sat(t) { return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); }
  function simKur(k) {
    k.innerHTML = '<div class="sk-sim-f"><label>Şehir<select class="sk-sehir">' + SEHIR.map(function (s, i) { return '<option value="' + i + '">' + s[0] + "</option>"; }).join("") + "</select></label>" +
      '<label>Ay<select class="sk-ay">' + AY.map(function (a, i) { return '<option value="' + i + '"' + (i === 6 ? " selected" : "") + ">" + a + "</option>"; }).join("") + "</select></label></div>" +
      '<label class="sk-saat-l">Doğum saati: <b class="sk-saat-y">20:00</b><input type="range" class="sk-saat" min="0" max="1439" step="5" value="1200" aria-label="Doğum saati"></label>' +
      '<div class="sk-bar" aria-hidden="true"><div class="sk-gun"></div><div class="sk-imlec"></div></div><div class="sk-bar-e"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>' +
      '<div class="sk-sim-s" aria-live="polite">Hesaplamak için bir saat seç.</div>';
    var hazir = false, cache = {};
    function gunHesap(si, ay) {
      var key = si + "-" + ay; if (cache[key]) return cache[key];
      var A = window.Astronomy, s = SEHIR[si], o = new A.Observer(s[1], s[2], 0), yil = new Date().getFullYear();
      var bas = new Date(Date.UTC(yil, ay, 15, 0, 0) - 3 * 3600e3);
      var r = A.SearchRiseSet(A.Body.Sun, o, +1, bas, 1), b = A.SearchRiseSet(A.Body.Sun, o, -1, bas, 1);
      function dk(t) { var d = new Date(t.date.getTime() + 3 * 3600e3); return d.getUTCHours() * 60 + d.getUTCMinutes(); }
      return (cache[key] = { o: o, bas: bas, dog: dk(r), bat: dk(b) });
    }
    function ciz() {
      var si = +$(".sk-sehir", k).value, ay = +$(".sk-ay", k).value, dk = +$(".sk-saat", k).value;
      $(".sk-saat-y", k).textContent = sat(dk);
      $(".sk-imlec", k).style.left = (dk / 1440 * 100) + "%";
      if (!hazir) return;
      var G = gunHesap(si, ay), A = window.Astronomy;
      $(".sk-gun", k).style.left = (G.dog / 1440 * 100) + "%"; $(".sk-gun", k).style.width = ((G.bat - G.dog) / 1440 * 100) + "%";
      var t = new Date(G.bas.getTime() + dk * 6e4), eq = A.Equator(A.Body.Sun, t, G.o, true, true), hz = A.Horizon(t, G.o, eq.ra, eq.dec, "normal"), alt = hz.altitude;
      var gun = alt > 0;
      $(".sk-sim-s", k).innerHTML = '<span class="sk-r ' + (gun ? "gun" : "gece") + '">' + (gun ? "☉" + VS + " Gündüz haritası" : "☽" + VS + " Gece haritası") + "</span> " +
        SEHIR[si][0] + ", " + AY[ay] + " ortası, saat " + sat(dk) + ": Güneş ufkun " + Math.abs(alt).toFixed(1).replace(".", ",") + "° " + (gun ? "üstünde" : "altında") +
        ". O gün Güneş " + sat(G.dog) + "'da doğuyor, " + sat(G.bat) + "'da batıyor.";
    }
    ["change", "input"].forEach(function (ev) { k.addEventListener(ev, ciz); });
    function basla() { yukle("/astronomy.browser.min.js").then(function () { hazir = true; ciz(); }).catch(function () { $(".sk-sim-s", k).textContent = "Simülatör şu an yüklenemedi."; }); }
    ciz();
    if ("IntersectionObserver" in window) { var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); basla(); } }, { rootMargin: "300px" }); io.observe(k); } else basla();
  }

  function calistir() { document.querySelectorAll("[data-sekt]").forEach(kur); document.querySelectorAll("[data-sekt-sim]").forEach(simKur); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", calistir); else calistir();
})();
