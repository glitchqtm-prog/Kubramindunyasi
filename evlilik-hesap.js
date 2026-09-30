/* evlilik-hesap.js — Astro Yuvam "Haritada evlilik göstergeleri" hesaplayıcısı.
 * Doğum haritası Astro Yuvam sunucusunda (Placidus) hesaplanır; Juno için gömülü efemeris tablosu (Swiss Ephemeris'ten üretildi),
 * Vertex ve transitler tarayıcıda astronomy-engine ile hesaplanır. */
(function () {
  "use strict";
  var T = {"dsc":{"Koç":"Seni harekete geçiren, cesur, dürüst ve doğrudan bir partner arıyorsun. İlişkide durgunluk seni sıkar; birlikte yeni şeyler başlatmak ve heyecanı canlı tutmak senin için önemli. Dikkat etmen gereken nokta sabırsızlık ve rekabet: “kim haklı” yerine “biz ne istiyoruz” sorusu ilişkini korur.","Boğa":"Güven veren, sadık, sakin ve somut bir partner arıyorsun. Sözden çok davranışa bakarsın; istikrar, dokunmak ve birlikte güzel bir hayat kurmak senin için aşkın dilidir. Dikkat etmen gereken nokta konfor alanı: alışkanlığı sevgiyle karıştırmamak ilişkiyi taze tutar.","İkizler":"Seninle konuşabilen, merakını besleyen, esprili ve zeki bir partner arıyorsun. Zihinsel uyum olmadan kalbin açılmaz; birlikte öğrenmek ve gülmek ilişkinin yakıtıdır. Dikkat etmen gereken nokta kararsızlık: derinlik de hafiflik kadar değerli.","Yengeç":"Şefkatli, koruyucu, ailesine bağlı ve duygusal olarak ulaşılabilir bir partner arıyorsun. Evlilik senin için bir yuva kurmak demek. Dikkat etmen gereken nokta roller: partnerine ebeveyn rolü yüklemek ya da ondan böyle bir rol beklemek dengeyi bozabilir.","Aslan":"Parlak, cömert, kendine güvenen ve seni gururlandıran bir partner arıyorsun. Takdir edilmek ve sevgini içtenlikle göstermek istersin. Dikkat etmen gereken nokta sahne: partnerinin ışığını kıskanmadan alkışlamak ilişkiyi büyütür.","Başak":"Güvenilir, özenli, yardımsever ve gündelik hayatta seninle omuz omuza duran bir partner arıyorsun. Aşkı küçük hizmetlerde ve detaylarda görürsün. Dikkat etmen gereken nokta mükemmeliyetçilik: eleştiri yakınlığın önüne geçmesin.","Terazi":"Zarif, adil, uyumlu ve seninle eşit bir ortaklık kurabilecek bir partner arıyorsun. İlişkilere doğal bir yatkınlığın var; evlilik senin için önemli bir hedef olabilir. Dikkat etmen gereken nokta kendini ertelemek: huzuru korumak için gerçek isteklerinden vazgeçme.","Akrep":"Derin, tutkulu, sadık ve seni tüm katmanlarınla görmekten korkmayan bir partner arıyorsun. Yüzeysel ilişkiler sana göre değil. Dikkat etmen gereken nokta güven ve kontrol: savunmasız olabilmek senin gerçek gücün.","Yay":"Özgür ruhlu, iyimser, dünyayı ve fikirleri seninle keşfedecek bir partner arıyorsun. Farklı bir kültürden ya da uzak bir yerden biri de olabilir. Dikkat etmen gereken nokta bağlanma korkusu: bağlanmak özgürlüğü kaybetmek değil, birlikte büyüyeceğiniz alanı konuşmak demek.","Oğlak":"Olgun, sorumluluk sahibi, hedefleri olan ve uzun vadeli düşünen bir partner arıyorsun. Yaşça büyük ya da hayatı oturmuş biri seni çekebilir. Evliliği ciddiye alırsın; çoğu zaman acele etmeden ama sağlam kurarsın. Dikkat etmen gereken nokta mesafe: duygulara da alan aç.","Kova":"Arkadaşın olabilecek, özgün, bağımsız ve zihnen özgür bir partner arıyorsun. Alışılmadık ilişki biçimleri seni korkutmaz. Dikkat etmen gereken nokta soğukluk: mesafeyi koruma isteğin partnerine uzaklık gibi gelebilir, yakınlığı da sahiplen.","Balık":"Hassas, romantik, sezgisel ve ruhunu anlayan bir partner arıyorsun. Aşkı neredeyse ruhsal bir birlik olarak yaşarsın. Dikkat etmen gereken nokta idealleştirme: partnerini kurtarmaya ya da kusursuz görmeye çalışmak yerine onu olduğu gibi sevmek en güzel aşktır."},"yon":{"1":"Evlilik kimliğinin bir parçası; ilişkiler seni tanımlar ve partner çoğu zaman senin enerjinle hayatına girer. İlişkide kendin kalmak ile partnerinle birlikte büyümek arasında denge kurman gerekir.","2":"Partner ile para, değer ve güven konuları iç içe. Evlilik maddi bir temel ister ya da partnerin maddi hayatına katkı sağlar. Ortak bütçe ve ortak değerler ilişkinin sağlamlığını belirler.","3":"Partnerle tanışmanın yolu iletişim: yakın çevre, komşular, okul, kurs, sosyal medya ya da kardeşler. İlişkide konuşmak, yazışmak ve birlikte öğrenmek çok önemli.","4":"Evlilik ve yuva senin için neredeyse aynı şey. Partner aile yoluyla gelebilir ya da ilişki hızla ev kurmaya döner. Ailelerin onayı ve ev hayatının uyumu önemli.","5":"Evlilik aşk, eğlence ve yaratıcılıkla başlar; önce büyük bir aşk, sonra ortaklık. Çocuk konusu ilişkinin önemli bir parçası olabilir. Romantizmi evlilikten sonra da canlı tutmak gerekir.","6":"Partnerle iş ortamında, günlük rutin içinde ya da sağlıkla ilgili bir ortamda tanışabilirsin. İlişkide birbirine destek olmak, pratik yardım ve ortak düzen ön planda.","7":"Yönetici kendi evinde; ilişkiler senin için doğal ve güçlü bir alan. Evlilik hayatında belirleyici bir yer tutar, ortaklıklardan destek görürsün.","8":"Derin, dönüştürücü ve tutkulu bir bağ. Evlilik ortak kaynakları, güveni ve yakınlığı sınar; ilişki seni köklü biçimde değiştirebilir. Ortak para ve miras konuları da gündeme gelebilir.","9":"Partner uzak bir yerden, farklı bir kültürden ya da eğitim, seyahat veya inanç ortamından gelebilir. Evlilik ufkunu genişletir; birlikte keşfetmek ilişkinizi besler.","10":"Evlilik ile kariyer ve statü birbirine bağlı. Partnerle iş hayatında ya da kariyerinle ilgili bir ortamda tanışabilirsin; evlilik toplumdaki yerini de etkiler.","11":"Partnerin önce arkadaşın olabilir; tanışma bir arkadaş çevresi, topluluk ya da dijital platform üzerinden gerçekleşebilir. İlişkide ortak hayaller ve arkadaşlık kalbin yerini tutar.","12":"İlişkiler daha gizli, sessiz ya da ruhsal bir düzlemde gelişebilir. Uzun süre dile getirilmeyen bir aşk ya da uzaktan başlayan bir bağ mümkün. Evlilikte fedakarlık ve şefkat önemli; kendini kaybetmemeye dikkat et."},"gez7":{"Güneş":"Kimliğin ilişkilerle parlıyor; evlilik hayatında merkezi bir yer tutar. Güçlü, özgüvenli partnerler seni çeker. Kendi ışığını partnerin üzerinden aramamak önemli.","Ay":"Duygusal güveni ilişkide ararsın; partnerin sana yuva hissi vermeli. İlişkilerin iniş çıkışlı olabilir ama bağlandığında derin bağlanırsın.","Merkür":"İletişim ilişkinin kalbi. Konuşabildiğin, fikirlerini paylaşabildiğin biri seni çeker; bazen yaşça küçük ya da genç ruhlu bir partner. Anlaşmalar ve sözleşmeler hayatında önemli.","Venüs":"Evlilik için en güzel yerleşimlerden biri. Uyumlu, çekici ve sevgi dolu ilişkiler çekersin; partnerin estetik ve nazik olabilir. Uyumu korurken gerçek isteklerini de dile getir.","Mars":"Tutkulu, dinamik ve zaman zaman çatışmalı ilişkiler. Enerjik, girişken partnerler seni çeker. Rekabeti ortak hedefe çevirdiğinizde çok güçlü bir ekip olursunuz.","Jüpiter":"Evlilik için koruyucu ve şanslı bir yerleşim. Cömert, iyimser, bilge partnerler; ilişkiler hayatını genişletir. Aşırı beklenti ve idealizme dikkat.","Satürn":"Evliliği ciddiye alırsın; çoğu zaman acele etmeden ama sağlam bağlanırsın. Olgun, sorumluluk sahibi partnerler. Zamanla güçlenen kalıcı bir ilişki mümkün; korkuların kapı kapatmasın.","Uranüs":"Sürpriz başlangıçlar ve alışılmadık ilişkiler. Özgürlüğüne saygı duyan, farklı bir partnere ihtiyacın var. Birbirinize alan tanımak ilişkiyi korur.","Neptün":"Romantik, ruhsal ve idealize eden bir aşk anlayışı; ruh eşi arayışı güçlü. Partnerini olduğu gibi görmek hayal kırıklığını önler.","Plüton":"Yoğun, dönüştürücü ve tutkulu ilişkiler; partnerler hayatında köklü değişimler başlatır. Güç ve kontrol konularını fark etmek bağı derinleştirir.","Kuzey Ay Düğümü":"Bu hayattaki gelişim yönün ilişkilerde: ortaklık kurmayı, uzlaşmayı ve “biz” olmayı öğrenmek senin için büyüme demek.","Güney Ay Düğümü":"İlişkilere dair doğal bir tecrübe taşıyorsun ama asıl büyüme kendi kimliğini kurmakta. Kendini partnerinde kaybetmeden sevmek senin dersin.","Chiron":"İlişkilerde eski bir kırılganlık taşıyabilirsin; bu yara başkalarını anlama ve iyileştirme gücüne de dönüşür. Güveni adım adım kurmak iyi gelir."},"venus":{"Koç":"Sevgini hızlı, cesur ve açık gösterirsin. Heyecan, spontane jestler ve ilk adımı atmak senin aşk dilin.","Boğa":"Dokunmak, güzel bir sofra, sadakat ve istikrar. Sevgi senin için somut bir şeydir ve zamanla derinleşir.","İkizler":"Konuşmak, yazışmak, gülmek. Zihinsel kıvılcım yoksa kalbin uyanmaz; oyunbaz ve meraklı bir aşk.","Yengeç":"Şefkat, koruma ve ev sıcaklığı. Sevdiğini beslemek ve güvende hissettirmek senin aşk dilin.","Aslan":"Cömert, sıcak ve gösterişli bir sevgi. Takdir edilmek ve sevdiğini yüceltmek istersin.","Başak":"Sevgini hizmetle gösterirsin: yardım etmek, detayları hatırlamak, hayatı kolaylaştırmak.","Terazi":"Zarafet, uyum ve romantizm. İlişki senin için bir sanat; eşitlik ve incelik ararsın.","Akrep":"Derin, tutkulu ve bütünüyle. Ya hep ya hiç; güven kazanıldığında sonsuz sadakat.","Yay":"Özgür, maceracı ve eğlenceli bir aşk. Birlikte keşfetmek, gülmek ve büyümek istersin.","Oğlak":"Sadık, ciddi ve uzun vadeli. Sevgini sözle değil, emek ve güvenilirlikle gösterirsin.","Kova":"Arkadaşlıkla başlayan, özgün ve özgür bir aşk. Alan tanınmak ve zihinsel bağ senin için şart.","Balık":"Romantik, fedakar ve ruhsal. Sevdiğinle bir olmak ve onu sezgiyle anlamak istersin."},"juno":{"Koç":"Evlilikte bağımsızlığını koruyabileceğin, canlı ve dürüst bir ortaklık istersin. Birlikte harekete geçen, birbirini cesaretlendiren bir çift olmak sana iyi gelir.","Boğa":"Güven, sadakat ve maddi-manevi istikrar. Evliliğin sağlam bir zemin ve huzurlu bir ev olmalı.","İkizler":"İletişimi hiç bitmeyen, birlikte öğrenen, birbirinin en iyi sohbet arkadaşı olan bir evlilik.","Yengeç":"Aile odaklı, duygusal güvenin merkezde olduğu, yuvası sıcak bir evlilik.","Aslan":"Birbirini takdir eden, sevgisini gösteren, birlikte parlayan bir çift. Sadakat ve gurur önemli.","Başak":"Günlük hayatta uyumlu, birbirine destek olan, sorumlulukları paylaşan pratik bir ortaklık.","Terazi":"Eşitlik, adalet ve zarafet. Juno Terazi'de özellikle güçlü sayılır; evlilik fikri senin için ayrı bir anlam taşır.","Akrep":"Derin bir bağ, tam güven ve tutku. Yüzeysel bir birliktelik seni tatmin etmez; birlikte dönüşmek istersin.","Yay":"Özgürlüğe saygılı, birlikte seyahat eden, öğrenen ve büyüyen bir evlilik. Ortak inanç ve vizyon önemli.","Oğlak":"Ciddi, sorumluluk sahibi ve uzun vadeli bir birlik. Birlikte bir hayat inşa etmek evliliğin anlamı.","Kova":"Arkadaşlık temelli, özgür ve kalıplara sıkışmayan bir evlilik. Birbirinin bireyselliğine alan tanımak şart.","Balık":"Ruhsal bir birlik, şefkat ve karşılıksız sevgi. Evlilikte romantizmin ve sezginin yaşaması gerekir."},"vertex":{"Koç":"Seni cesarete ve harekete çağıran, hayatına aniden giren insanlar.","Boğa":"Sana güven ve değer duygusu kazandıran, sakin ama derin karşılaşmalar.","İkizler":"Bir sohbetle, bir mesajla başlayan ve zihnini açan karşılaşmalar.","Yengeç":"Aile, yuva ve duygusal güvenle ilgili kader bağları.","Aslan":"Kalbini açan, yaratıcılığını ve aşk hayatını ateşleyen karşılaşmalar.","Başak":"İş, sağlık ya da günlük hayat içinde gelen ve hayatını düzene sokan insanlar.","Terazi":"Ortaklık ve evlilik temalı, ilişkilere dair büyük dönüm noktaları.","Akrep":"Derin, dönüştürücü, seni sarsan ama büyüten bağlar.","Yay":"Yolculuklarda, eğitimde ya da farklı kültürlerle gelen ufuk açıcı karşılaşmalar.","Oğlak":"Hayatına sorumluluk, yön ve olgunluk getiren insanlar.","Kova":"Arkadaşlık ve topluluk içinden çıkan, alışılmadık ve özgürleştirici bağlar.","Balık":"Ruhsal, sezgisel ve neredeyse rüya gibi başlayan karşılaşmalar."},"yonetici":{"Koç":"Mars","Boğa":"Venüs","İkizler":"Merkür","Yengeç":"Ay","Aslan":"Güneş","Başak":"Merkür","Terazi":"Venüs","Akrep":"Mars","Yay":"Jüpiter","Oğlak":"Satürn","Kova":"Satürn","Balık":"Jüpiter"},"modern":{"Akrep":"Plüton","Kova":"Uranüs","Balık":"Neptün"}}; if (!T) return;
  var API = "https://astro-rapor.onrender.com/api/harita";
  var VS = "︎";
  var BN = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
  var GL = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  var EL = ["Ateş","Toprak","Hava","Su"];
  var AYL = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  var PG = {"Güneş":"☉","Ay":"☽","Merkür":"☿","Venüs":"♀","Mars":"♂","Jüpiter":"♃","Satürn":"♄","Uranüs":"♅","Neptün":"♆","Plüton":"♇","Kuzey Ay Düğümü":"☊","Güney Ay Düğümü":"☋","Chiron":"⚷"};
  var EV = ["","Kimlik","Para ve değerler","İletişim","Ev ve aile","Aşk ve yaratıcılık","İş ve günlük hayat","İlişki ve evlilik","Derin bağlar","Yolculuk ve eğitim","Kariyer","Arkadaşlar","İç dünya"];
  function $(s, k) { return (k || document).querySelector(s); }
  function norm(d) { return ((d % 360) + 360) % 360; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function sg(l) { return Math.floor(norm(l) / 30); }
  function derece(l) { var x = norm(l) % 30, d = Math.floor(x), m = Math.round((x - d) * 60); if (m === 60) { d++; m = 0; } return d + "°" + String(m).padStart(2, "0") + "′"; }
  function konum(l) { return GL[sg(l)] + VS + " " + BN[sg(l)] + " " + derece(l); }
  function trT(d) { return d.getDate() + " " + AYL[d.getMonth()] + " " + d.getFullYear(); }
  function yukle(src) { return new Promise(function (ok, no) { if (document.querySelector('script[src="' + src + '"]')) { var t = setInterval(function () { if ((src.indexOf("juno") >= 0 && window.AY_JUNO) || (src.indexOf("astronomy") >= 0 && window.Astronomy)) { clearInterval(t); ok(); } }, 50); return; } var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }

  /* ---------- Juno (gömülü tablo + kübik enterpolasyon) ---------- */
  var JB = null;
  function juno(jd) {
    var J = window.AY_JUNO; if (!JB) JB = atob(J.v);
    function v(i) { return (JB.charCodeAt(2 * i) | (JB.charCodeAt(2 * i + 1) << 8)) / 100; }
    var x = (jd - J.j0) / J.adim, i = Math.floor(x), t = x - i, p = [v(i - 1), v(i), v(i + 1), v(i + 2)];
    for (var k = 1; k < 4; k++) { while (p[k] - p[k - 1] > 180) p[k] -= 360; while (p[k] - p[k - 1] < -180) p[k] += 360; }
    return norm(-t * (t - 1) * (t - 2) / 6 * p[0] + (t + 1) * (t - 1) * (t - 2) / 2 * p[1] - (t + 1) * t * (t - 2) / 2 * p[2] + (t + 1) * t * (t - 1) / 6 * p[3]);
  }
  // Türkiye saat dilimi (yaklaşık): 2016 sonrası UTC+3, öncesi UTC+2 ve yaz saati +3
  function trOfset(y, m, d) {
    if (y > 2016 || (y === 2016 && (m > 9 || (m === 9 && d >= 7)))) return 3;
    if (y >= 1985 || (y >= 1972 && y <= 1978)) { var yaz = (m > 3 && m < 10) || (m === 3 && d >= 25) || (m === 10 && d <= 25); return yaz ? 3 : 2; }
    return 2;
  }

  /* ---------- Vertex: MC'den RAMC, yükselenden enlem, sonra eş-enlemle doğu ufku ---------- */
  function vertex(asc, mc, jd) {
    var R = Math.PI / 180, T_ = (jd - 2451545) / 36525, e = (23.4392911 - 0.0130042 * T_) * R;
    var ramc = Math.atan2(Math.sin(mc * R) * Math.cos(e), Math.cos(mc * R));
    var tanf = (-Math.cos(ramc) / Math.tan(asc * R) - Math.sin(ramc) * Math.cos(e)) / Math.sin(e), lat = Math.atan(tanf);
    var r2 = ramc + Math.PI, colat = Math.PI / 2 - lat;
    return norm(Math.atan2(Math.cos(r2), -(Math.sin(r2) * Math.cos(e) + Math.tan(colat) * Math.sin(e))) / R);
  }

  /* ---------- harita ---------- */
  function haritaGetir(g) {
    var anahtar = [g.birthDate, g.birthTime, g.birthPlace].join("|");
    try { var c = JSON.parse(localStorage.getItem("ay_natal_v1") || "null"); if (c && c.k === anahtar && c.v && c.v.ok) return Promise.resolve(c.v); } catch (e) {}
    var b = { name: g.name || "", birthDate: g.birthDate, birthPlace: g.birthPlace }; if (g.birthTime) b.birthTime = g.birthTime;
    return fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) })
      .then(function (r) { return r.json().then(function (j) { if (r.status === 429) throw new Error(j.mesaj || "Bugünlük hesaplama hakkın doldu, yarın tekrar dene."); return j; }); })
      .then(function (j) { if (j && j.ok) { delete j.cark; try { localStorage.setItem("ay_natal_v1", JSON.stringify({ k: anahtar, v: j })); } catch (e) {} } return j; });
  }
  function hazirla(j) {
    var N = { p: {}, cusp: null };
    (j.gezegenler || []).forEach(function (g) { var i = BN.indexOf(g.burc); if (i >= 0) N.p[g.ad] = { lon: i * 30 + (+g.derece || 0), ev: g.ev, retro: !!g.retro }; });
    if (j.yukselen) N.asc = BN.indexOf(j.yukselen.burc) * 30 + (+j.yukselen.derece || 0);
    if (j.mc) N.mc = BN.indexOf(j.mc.burc) * 30 + (+j.mc.derece || 0);
    if (j.evler && j.evler.length === 12) N.cusp = j.evler.slice().sort(function (a, b) { return a.ev - b.ev; }).map(function (e) { return BN.indexOf(e.burc) * 30 + (+e.derece || 0); });
    return N;
  }
  function evBul(N, l) { if (!N.cusp) return null; for (var i = 0; i < 12; i++) { var a = N.cusp[i], b = N.cusp[(i + 1) % 12]; if (norm(l - a) < norm(b - a)) return i + 1; } return 1; }

  /* ---------- zamanlama: önümüzdeki 6 yıl ---------- */
  function zaman(N) {
    var A = window.Astronomy, E = [], bas = new Date(), bit = new Date(bas.getTime() + 6 * 365.25 * 864e5), dsc = N.cusp[6];
    function lon(b, d) { return A.Ecliptic(A.GeoVector(A.Body[b], d, true)).elon; }
    function kes(f, t0, t1) { var a = t0, b = t1, fa = f(a); for (var i = 0; i < 20; i++) { var m = new Date((a.getTime() + b.getTime()) / 2), fm = f(m); if ((fm < 0) === (fa < 0)) { a = m; fa = fm; } else b = m; } return new Date((a.getTime() + b.getTime()) / 2); }
    [["Jupiter","Jüpiter"],["Saturn","Satürn"]].forEach(function (pl) {
      var b = pl[0], adim = 5 * 864e5, t = bas, evOnce = evBul(N, lon(b, t)), fDsc = function (d) { return norm(lon(b, d) - dsc + 180) - 180; }, fOnce = fDsc(t);
      var fVen = N.p["Venüs"] ? function (d) { return norm(lon(b, d) - N.p["Venüs"].lon + 180) - 180; } : null, vOnce = fVen ? fVen(t) : 0;
      if (evOnce === 7) E.push({ d: bas, tip: "ev", b: pl[1] + " şu anda 7. evinde", a: pl[1] === "Jüpiter" ? "İlişkiler ve evlilik için gökyüzünün en destekleyici dönemlerinden birinin içindesin." : "Satürn ilişkilerde ciddiyet ve bağlılık istiyor; kalıcı kararlar bu dönemde olgunlaşır." });
      for (var x = bas.getTime() + adim; x <= bit.getTime(); x += adim) {
        var d = new Date(x), t0 = new Date(x - adim), ev = evBul(N, lon(b, d)), fd = fDsc(d);
        if (ev !== evOnce) {
          var giris = ev === 7, cikis = evOnce === 7;
          if (giris || cikis) { var tk = kes(function (z) { return evBul(N, lon(b, z)) === 7 ? 1 : -1; }, t0, d);
            E.push({ d: tk, tip: "ev", b: pl[1] + (giris ? " 7. evine giriyor" : " 7. evinden çıkıyor"), a: giris ? (pl[1] === "Jüpiter" ? "Yaklaşık 12 yılda bir gelen ilişki ve evlilik penceresi açılıyor. Yeni bir aşk, nişan ya da evlilik kararı için güçlü bir dönem." : "Yaklaşık 29 yılda bir yaşanan ciddiyet dönemi: ilişkiler ya resmileşir ya da sınanır.") : pl[1] + " ilişki alanından ayrılıyor; bu dönemde kurulan bağlar yerine oturuyor." });
          }
          evOnce = ev;
        }
        if ((fd < 0) !== (fOnce < 0) && Math.abs(fd - fOnce) < 30) E.push({ d: kes(fDsc, t0, d), tip: "dsc", b: pl[1] + " alçalan noktanın (7. ev ucu) tam üzerinde", a: pl[1] === "Jüpiter" ? "Evlilik göstergeleri açısından en güçlü günlerden biri: ilişkiler genişliyor, fırsatlar kapıyı çalıyor." : "İlişkide netleşme anı: bir bağ resmileşebilir ya da gerçekler açıkça görülür." });
        fOnce = fd;
        if (fVen && pl[1] === "Jüpiter") { var fv = fVen(d); if ((fv < 0) !== (vOnce < 0) && Math.abs(fv - vOnce) < 30) E.push({ d: kes(fVen, t0, d), tip: "ven", b: "Jüpiter natal Venüs'ünün üzerinde", a: "Aşk hayatın için yılın en şanslı günlerinden biri; sevgi, uyum ve yeni bir ilişki için kapılar açık." }); vOnce = fv; }
      }
    });
    // tutulmalar: 1.–7. ev ekseni
    try {
      var t = A.SearchGlobalSolarEclipse(bas);
      while (t.peak.date < bit) { var l = A.SunPosition(t.peak.date).elon, ev = evBul(N, l); if (ev === 7 || ev === 1) E.push({ d: t.peak.date, tip: "tut", b: "Güneş tutulması " + ev + ". evinde (" + BN[sg(l)] + ")", a: ev === 7 ? "İlişkiler alanında yeni bir sayfa: tanışma, nişan ya da ilişkide dönüm noktası." : "Kimlik ile ilişki arasındaki denge yeniden kuruluyor; ‘ben’ ve ‘biz’ konuşuluyor." }); t = A.NextGlobalSolarEclipse(t.peak); }
      var m = A.SearchLunarEclipse(bas);
      while (m.peak.date < bit) { var lm = A.EclipticGeoMoon(m.peak.date).lon, em = evBul(N, lm); if (em === 7 || em === 1) E.push({ d: m.peak.date, tip: "tut", b: "Ay tutulması " + em + ". evinde (" + BN[sg(lm)] + ")", a: em === 7 ? "İlişkide bir döngü tamamlanıyor; bir karar netleşebilir." : "Kendinle ilgili bir farkındalık ilişkilerini de etkiliyor." }); m = A.NextLunarEclipse(m.peak); }
    } catch (e) {}
    E.sort(function (a, b) { return a.d - b.d; });
    return E;
  }

  /* ---------- mini çark: 7. ev vurgulu ---------- */
  function cark(N, ek) {
    var S = 320, C = 160, R0 = 150, R1 = 126, R2 = 60, off = N.asc;
    function P(l, r) { var a = (180 + l - off) * Math.PI / 180; return [C + r * Math.cos(a), C - r * Math.sin(a)]; }
    function yay(a1, a2, r1, r2) { var p1 = P(a1, r1), p2 = P(a2, r1), p3 = P(a2, r2), p4 = P(a1, r2), buyuk = norm(a2 - a1) > 180 ? 1 : 0;
      return "M" + p1 + " A" + r1 + "," + r1 + " 0 " + buyuk + " 0 " + p2 + " L" + p3 + " A" + r2 + "," + r2 + " 0 " + buyuk + " 1 " + p4 + "Z"; }
    var h = '<svg viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="7. evi vurgulanmış doğum haritası"><circle cx="160" cy="160" r="150" fill="rgba(20,16,31,.7)" stroke="rgba(217,185,106,.5)"/>';
    h += '<path d="' + yay(N.cusp[6], N.cusp[7], R1, R2) + '" fill="rgba(217,185,106,.22)" stroke="rgba(217,185,106,.7)"/>';
    h += '<circle cx="160" cy="160" r="' + R1 + '" fill="none" stroke="rgba(217,185,106,.3)"/><circle cx="160" cy="160" r="' + R2 + '" fill="rgba(217,185,106,.04)" stroke="rgba(217,185,106,.25)"/>';
    for (var s = 0; s < 12; s++) { var a = P(s * 30, R0), b = P(s * 30, R1), m = P(s * 30 + 15, (R0 + R1) / 2); h += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="rgba(217,185,106,.3)"/><text x="' + m[0] + '" y="' + m[1] + '" fill="rgba(231,207,149,.8)" font-size="12">' + GL[s] + VS + "</text>"; }
    N.cusp.forEach(function (c, i) { var a = P(c, R1), b = P(c, R2), n = P(c + norm(N.cusp[(i + 1) % 12] - c) / 2, R2 + 11); h += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + (i === 0 || i === 6 ? "rgba(231,207,149,.8)" : "rgba(154,143,184,.25)") + '"/><text x="' + n[0] + '" y="' + n[1] + '" fill="' + (i === 6 ? "#f3dca0" : "#9a8fb8") + '" font-size="' + (i === 6 ? 12 : 9) + '" font-family="Segoe UI,sans-serif" font-weight="' + (i === 6 ? 700 : 400) + '">' + (i + 1) + "</text>"; });
    ek.forEach(function (x, k) { var q = P(x.l, 100 - (k % 2) * 16); h += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="10" fill="#231c3a" stroke="' + x.renk + '"/><text x="' + q[0] + '" y="' + q[1] + '" fill="' + x.renk + '" font-size="' + (x.g.length > 2 ? 8 : 12) + '" font-family="Segoe UI Symbol,Segoe UI,sans-serif">' + x.g + "</text>"; });
    var ac = P(N.asc + 4, R1 - 10), dc = P(N.cusp[6] - 4, R1 - 10);
    h += '<text x="' + ac[0] + '" y="' + ac[1] + '" fill="#e7cf95" font-size="10" font-family="Segoe UI,sans-serif" font-weight="700">AC</text><text x="' + dc[0] + '" y="' + dc[1] + '" fill="#e7cf95" font-size="10" font-family="Segoe UI,sans-serif" font-weight="700">DC</text></svg>';
    return h;
  }

  /* ---------- sonuç ---------- */
  function sonuc(k, j, g) {
    var N = hazirla(j), out = $(".ev-sonuc", k), saat = !!N.cusp;
    var p = g.birthDate.split("-"), hh = g.birthTime ? g.birthTime.split(":") : ["12", "00"], of = trOfset(+p[0], +p[1], +p[2]);
    var jd = Date.UTC(+p[0], +p[1] - 1, +p[2], +hh[0] - of, +hh[1]) / 864e5 + 2440587.5;
    var ju = juno(jd), ven = N.p["Venüs"];
    var kartlar = [], ozet = [];
    if (saat) {
      var dsc = N.cusp[6], dB = BN[sg(dsc)], yon = T.yonetici[dB], mod = T.modern[dB], yp = N.p[yon];
      kartlar.push(kart("7. ev burcun (alçalan burç)", konum(dsc), T.dsc[dB], "Partnerinde aradığın, ilişki tarzın ve evliliğe yaklaşımın bu burçla anlatılır."));
      if (yp) kartlar.push(kart("7. ev yöneticisi", (PG[yon] || "") + VS + " " + yon + ", " + BN[sg(yp.lon)] + " burcunda, " + yp.ev + ". evde", T.yon[yp.ev], "Evliliğin nereden ve nasıl geldiğini, partnerle tanışma ortamını gösterir." + (mod && N.p[mod] ? " Modern yönetici " + mod + " de " + N.p[mod].ev + ". evinde." : "")));
      var ic = Object.keys(N.p).filter(function (a) { return N.p[a].ev === 7; });
      if (ic.length) ic.forEach(function (a) { if (T.gez7[a]) kartlar.push(kart("7. evinde " + a, (PG[a] || "") + VS + " " + konum(N.p[a].lon), T.gez7[a], "")); });
      else kartlar.push(kart("7. evinde gezegen", "Boş ev", "7. evin boş olması evliliğin önemsiz olduğu anlamına gelmez; bu durumda evin burcu ve yöneticisi belirleyicidir. Pek çok mutlu evlilik boş 7. evli haritalarda görülür.", ""));
      var vx = vertex(N.asc, N.mc, jd); kartlar.push(kart("Vertex (kader noktası)", konum(vx) + " · " + evBul(N, vx) + ". ev", T.vertex[BN[sg(vx)]], "Hayatına kaderin eliyle giriyormuş gibi hissettiren karşılaşmaların noktası."));
      ozet.push("7. evim " + dB);
    }
    if (ven) kartlar.push(kart("Venüs: sevgi dilin", konum(ven.lon) + (saat ? " · " + ven.ev + ". ev" : ""), T.venus[BN[sg(ven.lon)]], ""));
    kartlar.push(kart("Juno: evlilik asteroidi", konum(ju) + (saat ? " · " + evBul(N, ju) + ". ev" : ""), T.juno[BN[sg(ju)]], "Juno, evlilikte uzun vadede neye ihtiyaç duyduğunu anlatır."));
    ozet.push("Venüs'üm " + (ven ? BN[sg(ven.lon)] : "?"), "Juno'm " + BN[sg(ju)]);
    var partner = $(".ev-partner", k).value, pHtml = "";
    if (partner !== "" && saat) {
      var ps = +partner, ds = sg(N.cusp[6]), ayni = ps === ds, el = ps % 4 === ds % 4, zit = norm((ps - ds) * 30) === 180;
      pHtml = '<div class="ev-partner-sonuc">' + (ayni ? "✦ Partnerinin Güneş burcu tam senin 7. ev burcun: " + BN[ps] + ". Astrolojide bu, “aradığın kişiyi bulmak” diye yorumlanan güçlü bir eşleşmedir." : el ? "✦ Partnerinin burcu (" + BN[ps] + ") 7. ev burcunla aynı elementte (" + EL[ps % 4] + "). Aradığın niteliklerle doğal bir uyum var." : zit ? "✦ Partnerinin Güneş burcu (" + BN[ps] + ") senin yükselen burcunla aynı. Birbirinizde kendinizi görebilir, çok tanıdık bir enerji hissedebilirsiniz." : "Partnerinin burcu (" + BN[ps] + ") 7. ev burcundan farklı bir enerji taşıyor. Bu uyumsuzluk demek değil; sinastride Ay, Venüs ve Mars bağlantıları çok daha belirleyicidir.") + ' <a href="/uyum-testi.html">Ücretsiz uyum testine</a> de bakabilirsin.</div>';
    }
    var ekler = [];
    if (saat) { if (ven) ekler.push({ l: ven.lon, g: "♀" + VS, renk: "#f3b6c8" }); ekler.push({ l: ju, g: "⚵", renk: "#a99cf0" }); ekler.push({ l: vertex(N.asc, N.mc, jd), g: "Vx", renk: "#8fd8b0" }); }
    out.innerHTML = (saat ? "" : '<div class="ev-uyari">Doğum saatini girmediğin için 7. ev, yöneticisi ve Vertex hesaplanamadı. Venüs ve Juno yine de sana çok şey söyler; tam sonuç için doğum saatini ekle.</div>') +
      (saat ? '<div class="ev-ust"><div class="ev-cark">' + cark(N, ekler) + '<div class="ev-lej"><span style="color:#f3b6c8">♀' + VS + ' Venüs</span><span style="color:#a99cf0">⚵ Juno</span><span style="color:#8fd8b0">Vx Vertex</span><span style="color:#e7cf95">▮ 7. ev</span></div></div><div class="ev-kartlar">' + kartlar.slice(0, 2).join("") + "</div></div>" + '<div class="ev-kartlar ev-iki">' + kartlar.slice(2).join("") + "</div>" : '<div class="ev-kartlar ev-iki">' + kartlar.join("") + "</div>") + pHtml +
      (saat ? '<div class="ev-zaman-b">Önümüzdeki 6 yılda ilişkiler için güçlü dönemlerin</div><ol class="ev-zaman"><li class="yuk">Hesaplanıyor…</li></ol><p class="ev-kucuk">Bu tarihler evliliği garanti etmez; gökyüzünün ilişkileri en çok desteklediği dönemleri gösterir. Tutulmalar ve Satürn dönemleri kolay değil ama belirleyicidir.</p>' : "") +
      '<div class="ev-btns"><button type="button" class="ev-btn ev-paylas">Sonucumu paylaş</button><a class="ev-btn ev-ghost" href="/sinastri-uyum-analizi.html">İkimizin uyumunu analiz et →</a></div>';
    out.hidden = false;
    $(".ev-paylas", out).onclick = function () { var m = ozet.join(", ") + ". Senin haritanda evlilik göstergeleri ne diyor? astroyuvam.com/haritada-evlilik-gostergeleri.html"; if (navigator.share) navigator.share({ text: m }).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(m).then(function () { $(".ev-paylas", out).textContent = "Kopyalandı ✓"; }); };
    if (saat) yukle("/astronomy.browser.min.js").then(function () {
      var E = zaman(N), ol = $(".ev-zaman", out);
      ol.innerHTML = E.length ? E.slice(0, 14).map(function (e) { return '<li class="' + e.tip + '"><time>' + trT(e.d) + "</time><div><b>" + esc(e.b) + "</b><span>" + esc(e.a) + "</span></div></li>"; }).join("") : "<li>Önümüzdeki 6 yılda Jüpiter ya da Satürn 7. evinden geçmiyor ve 1.–7. ev eksenine tutulma düşmüyor. Bu durumda Venüs ve Juno geçişleri ile doğum gününden başlayan kişisel yılına (Solar Return) bakmak daha anlamlı.</li>";
    }).catch(function () { $(".ev-zaman", out).innerHTML = "<li>Zamanlama şu an hesaplanamadı.</li>"; });
    out.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.gtag) gtag("event", "evlilik_hesap", { saat: saat ? "var" : "yok" });
  }
  function kart(b, deg, metin, alt) { return '<div class="ev-kart"><div class="ev-kb">' + esc(b) + '</div><div class="ev-deg">' + deg + "</div><p>" + esc(metin) + "</p>" + (alt ? '<p class="ev-kucuk">' + esc(alt) + "</p>" : "") + "</div>"; }

  /* ---------- form ---------- */
  function kur(k) {
    k.innerHTML = '<form class="ev-form" novalidate>' +
      '<label>Adın (isteğe bağlı)<input type="text" class="ev-ad" autocomplete="given-name"></label>' +
      '<label>Doğum tarihi<input type="date" data-dg class="ev-tarih" min="1930-01-01" max="2030-12-31" required></label>' +
      '<label>Doğum saati<input type="time" data-dg class="ev-saat"><span class="ev-cb"><input type="checkbox" class="ev-saatyok"> Saatimi bilmiyorum</span></label>' +
      '<label>Doğum yeri<input type="text" data-yer class="ev-yer" placeholder="Örn. İzmir" required></label>' +
      '<label class="tam">Partnerinin Güneş burcu (isteğe bağlı)<select class="ev-partner"><option value="">Seçme</option>' + BN.map(function (b, i) { return '<option value="' + i + '">' + GL[i] + VS + " " + b + "</option>"; }).join("") + "</select></label>" +
      '<button class="ev-btn tam" type="submit">✦ Evlilik göstergelerimi hesapla</button><div class="ev-msg tam" aria-live="polite"></div></form><div class="ev-sonuc" hidden></div>';
    var f = $(".ev-form", k), msg = $(".ev-msg", k);
    $(".ev-saatyok", k).onchange = function () { $(".ev-saat", k).disabled = this.checked; if (this.checked) $(".ev-saat", k).value = ""; };
    // üyeysen bilgilerin otomatik dolsun
    try { for (var i = 0; i < localStorage.length; i++) { var kk = localStorage.key(i); if (/^sb-.*-auth-token$/.test(kk)) { var o = JSON.parse(localStorage.getItem(kk) || "{}"), u = o.user || (o.currentSession && o.currentSession.user), m = u && u.user_metadata; if (m && m.birth_date) { $(".ev-ad", k).value = (m.full_name || "").split(" ")[0]; $(".ev-tarih", k).value = m.birth_date; $(".ev-saat", k).value = (m.birth_time || "").slice(0, 5); $(".ev-yer", k).value = m.birth_place || ""; msg.textContent = "Üye bilgilerin dolduruldu ✦"; } } } } catch (e) {}
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var g = { name: $(".ev-ad", k).value.trim(), birthDate: $(".ev-tarih", k).value, birthTime: $(".ev-saatyok", k).checked ? "" : ($(".ev-saat", k).value || "").slice(0, 5), birthPlace: $(".ev-yer", k).value.trim() };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(g.birthDate)) { msg.textContent = "Lütfen doğum tarihini seç."; return; }
      if (!g.birthPlace) { msg.textContent = "Lütfen doğum yerini yaz."; return; }
      var btn = $(".ev-btn", f); btn.disabled = true; msg.textContent = "Haritan hesaplanıyor…";
      Promise.all([haritaGetir(g), yukle("/juno-veri.js")]).then(function (r) {
        btn.disabled = false; var j = r[0];
        if (!j || !j.ok) { msg.textContent = (j && (j.mesaj || (j.errors && j.errors.join(" ")))) || "Harita şu an hesaplanamadı, birazdan tekrar dener misin?"; return; }
        msg.textContent = ""; sonuc(k, j, g);
      }).catch(function (er) { btn.disabled = false; msg.textContent = (er && er.message && er.message.length < 120 ? er.message : "Bağlantı kurulamadı, birazdan tekrar dener misin?"); });
    });
  }
  function basla() { document.querySelectorAll("[data-evlilik]").forEach(kur); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla); else basla();
})();
