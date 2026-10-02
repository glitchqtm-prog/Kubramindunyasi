/* panel-ek.js — Kozmik Panel'in üyelere özel ek bölümleri.
 * 1) Haritan seni nasıl anlatıyor: Chiron / Ay / Venüs / Lilith burcundan "ayna cümleleri" + hikâye kartı (1080×1920 PNG)
 * 2) Hayatının dönüm yılları (sunucuda Swiss Ephemeris ile hesaplanır, cihazda saklanır)
 * 3) Doğum günü sürprizi: Güneş'in doğduğun dereceye döndüğü an + yeni yaşın havası
 * 4) Kayıtlı kişiyle ortak hafta
 * 5) Pazartesi e-postası izni
 * panelim.html, panel açılınca window.AYPanelEk.baslat(ctx) çağırır. Yapay zekâ kullanılmaz. */
(function () {
  "use strict";
  var BN = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
  var BDA = ["Koç'ta","Boğa'da","İkizler'de","Yengeç'te","Aslan'da","Başak'ta","Terazi'de","Akrep'te","Yay'da","Oğlak'ta","Kova'da","Balık'ta"];
  var AYL = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  var GUN = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  var GUNK = ["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"];

  /* ---------- ayna cümleleri (her burç için tek, kısa, "ben buyum" cümlesi) ---------- */
  // Her nokta için bir cümle girişi; her burçta 3 cümle, hangisinin çıkacağı noktanın burçtaki derecesine göre seçilir
  // (0-10°, 10-20°, 20-30°). Böylece aynı burçtaki herkese aynı cümle çıkmaz.
  var AYNA = [
    { id: "chiron", nokta: "Chiron", giris: "Beni en çok yoran şey", m: [
      ["hep güçlü olmak zorunda kalmak.","her savaşa tek başıma girmek.","kimse sormadan her şeyi benim halletmem."],
      ["elimdekinin hiç yetmeyecekmiş gibi gelmesi.","kendimi hep sahip olduklarımla ölçmek.","güvende hissetmek için her şeyi kontrol etmek."],
      ["söylediklerimin hep yanlış anlaşılması.","kafamdaki sesi bir türlü susturamamak.","anlatmaya çalışıp yine de anlaşılmamak."],
      ["herkese annelik yapıp kendime yapamamak.","ailemden göremediğim ilgiyi herkese vermek.","kendi evimde bile tam rahat edememek."],
      ["çok uğraşıp yine de görülmemek.","herkesi alkışlayıp kendim için tek alkış duymamak.","sevilmek için hep bir şey yapmam gerekmesi."],
      ["ne yapsam eksik bulunmak.","kendime hiç 'yeter' diyememek.","herkesin işini düzeltip kendiminkine yetişememek."],
      ["herkes rahat etsin diye kendimden vazgeçmek.","kimse kırılmasın diye hep susan ben olmak.","ilişkide hep veren taraf olmak."],
      ["en güvendiğim yerden yara almak.","kimseye tam açılamamak.","her şeyi içimde yaşamak."],
      ["hep umut eden, hep hayal kırıklığına uğrayan ben olmak.","inandığım insanların beni yarı yolda bırakması.","gülerken bile içimin başka yerde olması."],
      ["erken büyümek zorunda kalmak.","zayıf görünmeye hiç iznimin olmaması.","herkesin yükünü sessizce taşımak."],
      ["kalabalığın içinde bile yabancı kalmak.","herkese yetişip hiçbir yere ait hissetmemek.","farklı olduğum için hep biraz dışarıda kalmak."],
      ["herkesin derdini dinleyip benimkini dinleyecek kimseyi bulamamak.","herkesi affedip kendimi affedememek.","hayır diyememek."]] },
    { id: "ay", nokta: "Ay", giris: "Kötü bir günümde", m: [
      ["beni yalnız bırakma ama üstüme de gelme.","biraz sinirimi atmama izin ver, sonra geçer.","beni kısa bir yürüyüşe çıkar, konuşmaya zorlama."],
      ["sessizce yanımda dur, bir çay koy, yeter.","sevdiğim bir yemek her şeyi düzeltir.","beni acele ettirme, kendime gelmem zaman alır."],
      ["benimle konuş, susup gitme.","aklımı dağıtacak bir şey anlat.","bir mesaj at, 'nasılsın' de, o bile yeter."],
      ["sarıl. açıklama isteme.","evde, battaniyenin altında kalmama izin ver.","annemin yemeği gibi bir şey yap bana."],
      ["benim için ne kadar değerli olduğumu söyle.","beni güldür, kendimi yeniden ben gibi hissettir.","yanımda ol ama bana acıyarak bakma."],
      ["yardım et ama nasihat etme.","ortalığı toplamama izin ver, öyle rahatlarım.","sorunu büyütme, çözümü birlikte bulalım."],
      ["sesini yükseltmeden konuşalım.","bana kızmadığını söyle, gerisini hallederim.","güzel bir yere çıkalım, ortam değişsin."],
      ["bana yalan söyleme, gerisini kaldırırım.","her şeyi sorma, anlatmak istediğimde anlatırım.","yanımda olduğunu göster, söylemek yetmez."],
      ["beni sıkıştırma, biraz nefes almama izin ver.","beni bir yerlere götür, yol iyi gelir.","olayı büyütmeden güldür beni."],
      ["zayıf düştüğüm anı kimseye anlatma.","ne yapmam gerektiğini değil, yapabileceğimi söyle.","beni biraz kendi hâlime bırak, toparlanırım."],
      ["biraz uzaklaşmama izin ver, döneceğim.","beni anlamaya çalışma, sadece yargılama.","kalabalık değil, tek bir arkadaş yeter."],
      ["anlamaya çalışma, sadece yanımda ol.","ağlamama izin ver, sonra hafiflerim.","bir şarkı aç, birlikte susalım."]] },
    { id: "venus", nokta: "Venüs", giris: "Beni kaybetmenin en kısa yolu", m: [
      ["ilk adımı hep bana bıraktırmak.","mesajıma saatler sonra dönmek.","beni sıradan biri gibi hissettirmek."],
      ["sözünü tutmamak.","güvenimi bir kere sarsmak.","her şeyi aceleye getirip beni sıkıştırmak."],
      ["sıkıcı olmak.","mesajlarımı cevapsız bırakmak.","anlattığım şeyi dinlemiyormuş gibi yapmak."],
      ["ailemi küçümsemek.","duygularımı abartı bulmak.","zor günümde ortadan kaybolmak."],
      ["beni başkalarının önünde küçük düşürmek.","başkasına benden fazla ilgi göstermek.","özel günlerimi unutmak."],
      ["emeğimi görmemek.","küçük şeyleri umursamamak.","söz verip hiçbirini yapmamak."],
      ["kabalık. hele başkalarının önünde.","her konuyu kavgaya çevirmek.","beni seçeneklerden biri gibi hissettirmek."],
      ["yalan. küçüğü bile.","bir şeyi benden saklamak.","sırrımı başkasına anlatmak."],
      ["beni kısıtlamak, her şeyin hesabını sormak.","hayallerimle dalga geçmek.","beni olduğum yere hapsetmeye çalışmak."],
      ["verdiği sözü unutmak.","geleceğe dair hiçbir plan yapmamak.","beni ciddiye almamak."],
      ["beni değiştirmeye çalışmak.","arkadaşlarımı kıskanmak.","bana nefes alacak alan bırakmamak."],
      ["duygularımla dalga geçmek.","soğuk ve mesafeli davranmak.","romantizmi gereksiz bulmak."]] },
    { id: "lilith", nokta: "Lilith", giris: "Belli etmem ama", m: [
      ["aslında çok öfkeliyim.","beklemekten nefret ediyorum.","ikinci planda kalmak beni deli ediyor."],
      ["istediğim hayatı hak ettiğime hâlâ tam inanamıyorum.","bazı şeyleri kimseyle paylaşmak istemiyorum.","rahatımın bozulmasına hiç tahammülüm yok."],
      ["söylemediğim cümleler söylediklerimden çok daha fazla.","kafamda herkesle saatlerce tartışıyorum.","dinlenmediğimi hissedince içim içimi yiyor."],
      ["bazen ben de birinin bana bakmasını istiyorum.","çok kolay kırılıyorum.","bazı insanlara hâlâ küsüm."],
      ["görülmek istiyorum ve bunu istediğim için utanıyorum.","unutulmaktan çok korkuyorum.","takdir edilmeyince içten içe bozuluyorum."],
      ["kusursuz görünmekten çok yoruldum.","herkesin hatasını görüyorum, sadece susuyorum.","kendimi her gün bir şey için eleştiriyorum."],
      ["herkesle iyiyim ama kimseyle tam rahat değilim.","hayır demek istediğim çok şeye evet dedim.","kavga çıkmasın diye çok şeyi yuttum."],
      ["kıskanıyorum.","hiçbir şeyi unutmuyorum.","bazen herkesi biraz sınıyorum."],
      ["bazen her şeyi bırakıp gitmek istiyorum.","bağlanmaktan biraz korkuyorum.","sıkıldığımda içimden çoktan gitmiş oluyorum."],
      ["güçlü görünmek zorunda olmaktan bıktım.","başarısız olmaktan çok korkuyorum.","ben de bazen birinin her şeyi benim yerime halletmesini istiyorum."],
      ["kimse beni tam anlamıyor gibi geliyor.","bazen insanlardan tamamen uzaklaşmak istiyorum.","kurallara uymak bana çok zor geliyor."],
      ["gerçekten kaçıp gitmek istediğim günler oluyor.","kafamda bambaşka bir hayat yaşıyorum.","insanlara verdiğim şansları kendime hiç vermiyorum."]] }
  ];

  /* ---------- doğum günü: yeni yaşın duygusal havası (yeni yaşın başladığı andaki Ay burcu) ---------- */
  var DG_AY = [
    "Hızlı kararlar ve yeni başlangıçlarla geçen bir yaş; sabrın biraz azalabilir.",
    "Daha sakin, yerleşik bir yaş; para, ev ve huzur ön planda.",
    "Hareketli bir yaş: yeni insanlar, bol mesaj, kurslar ve kısa yolculuklar.",
    "Aile ve ev ön planda; taşınma, yuva kurma ya da aileyle yakınlaşma.",
    "Görünür olacağın, kalbinin sesini dinleyeceğin bir yaş; aşk ve keyif artar.",
    "Düzen kurma yaşı: iş, sağlık ve günlük alışkanlıkların yenilenir.",
    "İlişkilerin yaşı: biriyle yakınlaşmak, bir ilişkiyi tartmak, uzlaşmak.",
    "Derin bir yaş: bir şeyi bitirip yeniden başlamak, güveni yeniden kurmak.",
    "Ufkunu açacak bir yaş: yolculuk, öğrenme, hayata yeni bir bakış.",
    "Emek ve sonuç yaşı: sorumluluk artar ama ektiğini biçersin.",
    "Sürprizli bir yaş: yeni arkadaşlar, beklenmedik değişiklikler, özgürleşme.",
    "Duygusal ve sezgisel bir yaş: dinlenmek, affetmek, iç sesini dinlemek."];

  var C = null;   // bağlam
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function norm(d){ return ((d % 360) + 360) % 360; }
  function n180(d){ return norm(d + 180) - 180; }
  function iso(d){ return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
  function lsAl(k){ try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(e){ return null; } }
  function lsKoy(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  function bulunma(ad){ var k = String(ad).toLocaleLowerCase("tr"), v = (k.match(/[aeıioöuü](?=[^aeıioöuü]*$)/) || ["e"])[0], sert = /[fstkçşhp]$/.test(k);
    return (sert ? "t" : "d") + ("aıou".indexOf(v) >= 0 ? "a" : "e"); }
  function burcI(l){ return Math.floor(norm(l) / 30); }

  var css = document.createElement("style");
  css.textContent =
    ".pe-ayna{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:700px){.pe-ayna{grid-template-columns:1fr}}" +
    ".pe-ayna label{display:flex;gap:12px;align-items:flex-start;cursor:pointer;background:rgba(28,23,51,.75);border:1px solid var(--line);border-radius:16px;padding:14px 15px;margin:0}" +
    ".pe-ayna label:hover{border-color:rgba(217,185,106,.55)}.pe-ayna input{width:18px;height:18px;margin:3px 0 0;flex:none;accent-color:#d9b96a}" +
    ".pe-ayna small{display:block;font-family:Georgia,serif;font-style:italic;font-size:14px;color:var(--gold-soft)}" +
    ".pe-ayna b{display:block;font-family:Georgia,serif;font-weight:600;font-size:18px;line-height:1.35;margin:4px 0 3px;color:var(--cream)}" +
    ".pe-ayna em{font-style:normal;font-size:12px;color:var(--mor)}" +
    ".pe-arac{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:12px}" +
    ".pe-arac label{font-size:13px;color:var(--muted);display:flex;gap:6px;align-items:center}" +
    ".pe-onizle{margin-top:14px;display:none;gap:16px;align-items:flex-start;flex-wrap:wrap}.pe-onizle.acik{display:flex}" +
    ".pe-onizle img{width:200px;max-width:46vw;border-radius:14px;border:1px solid var(--line);box-shadow:0 16px 40px rgba(0,0,0,.5)}" +
    ".pe-onizle p{flex:1 1 220px;margin:0;font-size:13.5px;color:var(--muted)}" +
    ".pe-zaman{list-style:none;margin:0;padding:0;position:relative}.pe-zaman::before{content:'';position:absolute;left:56px;top:8px;bottom:8px;width:1px;background:var(--line)}" +
    ".pe-zaman li{display:grid;grid-template-columns:46px 22px 1fr;gap:10px;padding:10px 0}" +
    ".pe-zaman .yas{text-align:right;font-family:Georgia,serif;font-size:20px;color:var(--gold-soft);line-height:1.1}.pe-zaman .yas small{display:block;font-family:'Segoe UI',sans-serif;font-size:10.5px;color:var(--muted)}" +
    ".pe-zaman .nk{width:12px;height:12px;border-radius:50%;margin:5px auto 0;background:#4a3d73;box-shadow:0 0 0 3px #14101f}" +
    ".pe-zaman li.gecti .nk{background:#6f6290}.pe-zaman li.simdi .nk{background:var(--gold);box-shadow:0 0 0 3px #14101f,0 0 14px var(--gold)}.pe-zaman li.gelecek .nk{background:var(--mor)}" +
    ".pe-zaman b{display:block;font-size:15px}.pe-zaman .tr{font-size:12.5px;color:var(--mor);margin:1px 0 4px}.pe-zaman p{margin:0;font-size:14px;color:#e2d9ee}" +
    ".pe-zaman li.gecti p{color:#bfb5d2}.pe-zaman .rz{display:inline-block;font-size:11px;font-weight:600;border-radius:10px;padding:1px 8px;margin-left:6px;vertical-align:1px}" +
    ".pe-zaman li.simdi .rz{background:var(--gold);color:#2a1e08}.pe-zaman li.gecti .rz{background:#2c2545;color:#bfb5d2}.pe-zaman li.gelecek .rz{background:rgba(169,156,240,.18);color:var(--mor)}" +
    ".pe-dg{background:radial-gradient(ellipse at 85% 0%,rgba(217,185,106,.22),transparent 60%),linear-gradient(180deg,rgba(36,28,61,.9),rgba(28,23,51,.9));border:1px solid rgba(217,185,106,.5);border-radius:20px;padding:20px 20px 18px;margin-top:14px}" +
    ".pe-dg .k{font-size:11.5px;letter-spacing:3px;text-transform:uppercase;color:var(--gold)}.pe-dg h2{font-family:Georgia,serif;font-weight:600;font-size:25px;margin:6px 0 4px;color:var(--gold-soft)}" +
    ".pe-dg p{margin:8px 0 0;font-size:15px;color:#ece4f4}.pe-dg .an{font-size:13px;color:var(--muted)}" +
    ".pe-ortak select{background:#120e1e;color:var(--cream);border:1px solid rgba(217,185,106,.45);border-radius:10px;padding:9px 12px;font:15px 'Segoe UI',system-ui,sans-serif;color-scheme:dark;max-width:100%}" +
    ".pe-ortak table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13.5px}.pe-ortak td,.pe-ortak th{border-bottom:1px solid var(--line);padding:8px 6px;text-align:left;vertical-align:top}" +
    ".pe-ortak th{color:var(--gold-soft);font-weight:600;font-size:12px}.pe-ortak tr.iyi td{background:rgba(143,216,176,.07)}.pe-ortak tr.zor td{background:rgba(233,142,162,.07)}" +
    ".pe-ortak .et{font-size:12px;color:var(--muted)}" +
    ".pe-mail{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:rgba(28,23,51,.7);border:1px dashed rgba(217,185,106,.4);border-radius:16px;padding:14px 16px;margin-top:12px}" +
    ".pe-mail b{display:block;font-size:15px}.pe-mail span{font-size:13px;color:var(--muted)}" +
    ".pe-anahtar{position:relative;width:52px;height:30px;flex:none}.pe-anahtar input{opacity:0;width:0;height:0}" +
    ".pe-anahtar i{position:absolute;inset:0;border-radius:20px;background:#2c2545;border:1px solid var(--line);cursor:pointer;transition:background .2s}" +
    ".pe-anahtar i::after{content:'';position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#cfc5e0;transition:transform .2s}" +
    ".pe-anahtar input:checked+i{background:linear-gradient(180deg,var(--gold-soft),var(--gold))}.pe-anahtar input:checked+i::after{transform:translateX(22px);background:#2a1e08}" +
    "@media (prefers-reduced-motion:reduce){.pe-anahtar i,.pe-anahtar i::after{transition:none}}";
  document.head.appendChild(css);

  /* ================= 1) AYNA CÜMLELERİ + HİKÂYE KARTI ================= */
  function aynaListe(){
    return AYNA.map(function(a){ var p = C.N.noktalar[a.nokta]; if (!p) return null; var i = burcI(p.lon), d = Math.min(2, Math.floor((norm(p.lon) % 30) / 10));
      return { id: a.id, giris: a.giris, cumle: a.m[i][d], alt: (a.nokta === "Lilith" ? "Kara Ay Lilith" : a.nokta) + " " + BDA[i] }; }).filter(Boolean);
  }
  function aynaCiz(){
    var L = aynaListe(), k = $("peAynaBolum"); if (!k || !L.length) return;
    var secili = lsAl("ay_ayna_secim") || ["chiron","ay","venus","lilith"];
    k.innerHTML = '<div class="bolum-b"><h2>Haritan seni nasıl anlatıyor</h2><span>Doğum haritandaki dört noktadan, sana ait dört cümle</span></div>' +
      '<div class="pe-ayna" id="peAyna">' + L.map(function(x){ return '<label><input type="checkbox" value="' + x.id + '"' + (secili.indexOf(x.id) >= 0 ? " checked" : "") + '><span><small>' + esc(x.giris) + '…</small><b>' + esc(x.cumle) + '</b><em>' + esc(x.alt) + '</em></span></label>'; }).join("") + '</div>' +
      '<div class="pe-arac"><button class="btn" type="button" id="peKartBtn">📤 Hikâye kartımı oluştur</button><label><input type="checkbox" id="peIsim" checked> Adım kartta yazsın</label><span class="not" style="margin:0">Tek cümle seçersen kart o cümleyi büyük yazar.</span></div>' +
      '<div class="pe-onizle" id="peOnizle"><img id="peImg" alt="Hikâye kartı önizlemesi" width="200" height="356"><p id="peNot"></p></div>';
    k.classList.remove("gizli");
    $("peAyna").addEventListener("change", function(){ lsKoy("ay_ayna_secim", [].slice.call(this.querySelectorAll("input:checked")).map(function(i){ return i.value; })); });
    $("peKartBtn").onclick = function(){ kartUret(); };
  }
  function satirla(ctx, metin, genislik){
    var kel = String(metin).split(" "), sat = [], cur = "";
    kel.forEach(function(w){ var t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > genislik && cur){ sat.push(cur); cur = w; } else cur = t; });
    if (cur) sat.push(cur); return sat;
  }
  // Kart için zarif başlık yazı tipi (yalnızca kart oluşturulurken yüklenir; gelmezse Georgia kullanılır)
  var FONT_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif", FONT_SANS = "'Segoe UI', Roboto, Arial, sans-serif";
  function fontHazir(){
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    if (!document.getElementById("pe-font")) { var l = document.createElement("link"); l.id = "pe-font"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&display=swap"; document.head.appendChild(l); }
    var bekle = Promise.all(["700 90px 'Playfair Display'", "italic 500 40px 'Playfair Display'", "500 60px 'Playfair Display'"].map(function(f){ return document.fonts.load(f, "ĞŞİçğış"); }));
    return Promise.race([bekle, new Promise(function(r){ setTimeout(r, 2500); })]).catch(function(){});
  }
  function altin(x, x0, y0, x1, y1){ var g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, "#f6e3ad"); g.addColorStop(.45, "#d6ad5c"); g.addColorStop(.7, "#f3dc9c"); g.addColorStop(1, "#b98f43"); return g; }
  function arkaPlan(x, W, H){
    x.fillStyle = "#0b0814"; x.fillRect(0, 0, W, H);
    // bulutsular
    [[.18,.16,760,"rgba(74,52,140,.55)"],[.9,.48,820,"rgba(110,40,96,.38)"],[.3,.78,760,"rgba(46,40,120,.5)"],[.75,.95,600,"rgba(120,70,40,.18)"],[.5,.2,460,"rgba(217,185,106,.13)"]].forEach(function(n){
      var g = x.createRadialGradient(n[0]*W, n[1]*H, 0, n[0]*W, n[1]*H, n[2]); g.addColorStop(0, n[3]); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H); });
    // yıldızlar (her kartta aynı desen)
    var t = 11; function r(){ t = (t * 9301 + 49297) % 233280; return t / 233280; }
    for (var i = 0; i < 260; i++){ var sx = r() * W, sy = r() * H, sr = Math.pow(r(), 3) * 2.6 + .35; x.globalAlpha = .18 + r() * .6; x.fillStyle = r() > .85 ? "#f3dc9c" : "#efe6ff"; x.beginPath(); x.arc(sx, sy, sr, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    // parıltılar yalnızca kenar boşluklarında (yazıların üstüne gelmesin)
    [[150,210,12],[930,250,9],[38,760,8],[1044,900,10],[40,1300,9],[1042,1480,8],[150,1690,10],[930,1660,12]].forEach(function(q){ parilti(x, q[0], q[1], q[2], .7); });
    // ince kumlanma
    var n = document.createElement("canvas"); n.width = n.height = 160; var nx = n.getContext("2d"), im = nx.createImageData(160, 160);
    for (var q = 0; q < im.data.length; q += 4){ var v = r() * 255; im.data[q] = im.data[q+1] = im.data[q+2] = v; im.data[q+3] = 9; }
    nx.putImageData(im, 0, 0); x.fillStyle = x.createPattern(n, "repeat"); x.fillRect(0, 0, W, H);
  }
  function parilti(x, cx, cy, s, a){
    x.save(); x.globalAlpha = a; var g = x.createRadialGradient(cx, cy, 0, cx, cy, s * 1.6); g.addColorStop(0, "rgba(255,240,200,.9)"); g.addColorStop(1, "rgba(255,240,200,0)");
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, s * 1.6, 0, 7); x.fill();
    x.fillStyle = "#fff6dc"; x.beginPath(); x.moveTo(cx, cy - s); x.quadraticCurveTo(cx, cy, cx + s * .22, cy); x.quadraticCurveTo(cx, cy, cx, cy + s); x.quadraticCurveTo(cx, cy, cx - s * .22, cy); x.quadraticCurveTo(cx, cy, cx, cy - s); x.fill();
    x.beginPath(); x.moveTo(cx - s * .7, cy); x.quadraticCurveTo(cx, cy, cx, cy + s * .16); x.quadraticCurveTo(cx, cy, cx + s * .7, cy); x.quadraticCurveTo(cx, cy, cx, cy - s * .16); x.quadraticCurveTo(cx, cy, cx - s * .7, cy); x.fill();
    x.restore();
  }
  function yuvarlak(x, l, t, w, h, r){ x.beginPath(); x.moveTo(l + r, t); x.lineTo(l + w - r, t); x.arcTo(l + w, t, l + w, t + r, r); x.lineTo(l + w, t + h - r); x.arcTo(l + w, t + h, l + w - r, t + h, r); x.lineTo(l + r, t + h); x.arcTo(l, t + h, l, t + h - r, r); x.lineTo(l, t + r); x.arcTo(l, t, l + r, t, r); x.closePath(); }
  function cerceve(x, W, H){
    var a = 60, b = 80;
    yuvarlak(x, a, a, W - 2 * a, H - 2 * a, 26); x.strokeStyle = altin(x, 0, 0, W, H); x.lineWidth = 3; x.stroke();
    yuvarlak(x, b, b, W - 2 * b, H - 2 * b, 16); x.strokeStyle = "rgba(217,185,106,.32)"; x.lineWidth = 1.2; x.stroke();
    // köşe süsleri: ince köşe çizgileri + küçük elmas
    [[b, b, 1, 1], [W - b, b, -1, 1], [b, H - b, 1, -1], [W - b, H - b, -1, -1]].forEach(function(k){
      var cx = k[0] + k[2] * 26, cy = k[1] + k[3] * 26;
      x.strokeStyle = "rgba(231,207,149,.75)"; x.lineWidth = 1.6; x.beginPath();
      x.moveTo(cx, cy + k[3] * 70); x.lineTo(cx, cy); x.lineTo(cx + k[2] * 70, cy); x.stroke();
      x.fillStyle = "#e7cf95"; x.beginPath(); x.moveTo(cx, cy - 7); x.lineTo(cx + 7, cy); x.lineTo(cx, cy + 7); x.lineTo(cx - 7, cy); x.closePath(); x.fill();
    });
  }
  function kemer(x, W, H, ic, renk, kalin){
    var L = ic, R = W - ic, T = ic + (W - 2 * ic) / 2, B = H - ic, rr = (W - 2 * ic) / 2;
    x.beginPath(); x.moveTo(L, B); x.lineTo(L, T); x.arc(W / 2, T, rr, Math.PI, 0); x.lineTo(R, B); x.closePath(); x.strokeStyle = renk; x.lineWidth = kalin; x.stroke();
  }
  function cark(x, cx, cy, R){
    x.save(); x.globalAlpha = .2; x.strokeStyle = "#d9b96a";
    [R, R * .86, R * .62].forEach(function(rr, i){ x.lineWidth = i ? 1 : 1.6; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.stroke(); });
    for (var i = 0; i < 72; i++){ var a = i * Math.PI / 36, uz = i % 6 === 0 ? R * .62 : R * (i % 3 === 0 ? .9 : .94); x.lineWidth = i % 6 === 0 ? 1.4 : 1; x.beginPath(); x.moveTo(cx + Math.cos(a) * uz, cy + Math.sin(a) * uz); x.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); x.stroke(); }
    for (var k = 0; k < 12; k++){ var b = (k + .5) * Math.PI / 6; x.fillStyle = "#e7cf95"; x.beginPath(); x.arc(cx + Math.cos(b) * R * .74, cy + Math.sin(b) * R * .74, 3.2, 0, 7); x.fill(); }
    x.restore();
  }
  function hilal(x, cx, cy, r){
    x.save(); x.fillStyle = altin(x, cx - r, cy - r, cx + r, cy + r); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    x.globalCompositeOperation = "destination-out"; x.beginPath(); x.arc(cx + r * .42, cy - r * .18, r * .86, 0, 7); x.fill(); x.restore();
  }
  function ayrac(x, cx, cy, w){
    x.save(); x.strokeStyle = "rgba(217,185,106,.55)"; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(cx - w, cy); x.lineTo(cx - 22, cy); x.moveTo(cx + 22, cy); x.lineTo(cx + w, cy); x.stroke();
    x.fillStyle = "#e7cf95"; x.beginPath(); x.moveTo(cx, cy - 11); x.lineTo(cx + 11, cy); x.lineTo(cx, cy + 11); x.lineTo(cx - 11, cy); x.closePath(); x.fill();
    [-1, 1].forEach(function(sg){ x.beginPath(); x.arc(cx + sg * (w + 8), cy, 3.5, 0, 7); x.fill(); });
    x.restore();
  }
  function harfAralik(x, metin, cx, y, aralik){
    var top = 0, h = metin.split(""); h.forEach(function(c){ top += x.measureText(c).width + aralik; }); top -= aralik;
    var px = cx - top / 2; x.textAlign = "left"; h.forEach(function(c){ x.fillText(c, px, y); px += x.measureText(c).width + aralik; }); x.textAlign = "center";
  }
  function kartUret(){
    var L = aynaListe(), sec = [].slice.call(document.querySelectorAll("#peAyna input:checked")).map(function(i){ return i.value; });
    var S = L.filter(function(x){ return sec.indexOf(x.id) >= 0; });
    if (!S.length){ $("peOnizle").classList.add("acik"); $("peNot").textContent = "Karta koymak için en az bir cümle seç."; return; }
    $("peKartBtn").disabled = true; $("peKartBtn").textContent = "Kartın hazırlanıyor…";
    fontHazir().then(function(){ ciz(S); });
  }
  function ciz(S){
    var W = 1080, H = 1920, cv = document.createElement("canvas"); cv.width = W; cv.height = H; var x = cv.getContext("2d");
    arkaPlan(x, W, H);
    // düz çift altın çerçeve + köşe süsleri + tepede ince gezegen yörüngesi
    cerceve(x, W, H);
    var ad = ($("peIsim") && $("peIsim").checked) ? (C.prof.name || "").split(" ")[0] : "";
    cark(x, W / 2, 400, 270);
    x.textAlign = "center"; x.textBaseline = "alphabetic";
    x.fillStyle = "#d9b96a"; x.font = "600 28px " + FONT_SANS; harfAralik(x, "DOĞUM HARİTAMA GÖRE", W / 2, 300, 7);
    x.save(); x.shadowColor = "rgba(217,185,106,.45)"; x.shadowBlur = 30;
    x.fillStyle = altin(x, W / 2 - 300, 330, W / 2 + 300, 450); x.font = "700 " + (ad && ad.length > 8 ? 96 : 112) + "px " + FONT_SERIF; x.fillText(ad || "ben böyleyim", W / 2, 438); x.restore();
    if (ad){ x.fillStyle = "#c7b3f0"; x.font = "italic 500 44px " + FONT_SERIF; x.fillText("böyle biri", W / 2, 506); }
    ayrac(x, W / 2, ad ? 580 : 540, 170);
    var ust = ad ? 650 : 610, alt = H - 470;
    if (S.length === 1){
      var t = S[0], boy = 74, sl;
      for (var den = 0; den < 6; den++){ x.font = "500 " + boy + "px " + FONT_SERIF; sl = satirla(x, t.cumle.charAt(0).toLocaleUpperCase("tr") + t.cumle.slice(1), W - 260); if (sl.length <= 4) break; boy -= 6; }
      var blokH = 70 + sl.length * boy * 1.3 + 70, yy = ust + (alt - ust - blokH) / 2;
      x.save(); x.globalAlpha = .55; x.fillStyle = altin(x, W / 2 - 60, yy - 150, W / 2 + 60, yy - 20); x.font = "700 210px " + FONT_SERIF; x.fillText("“", W / 2, yy - 10); x.restore();
      x.fillStyle = "#e7cf95"; x.font = "italic 500 46px " + FONT_SERIF; x.fillText(t.giris + "…", W / 2, yy + 40);
      x.fillStyle = "#f7f0e2"; x.font = "500 " + boy + "px " + FONT_SERIF; var ly = yy + 70 + boy * 1.05; sl.forEach(function(q){ x.fillText(q, W / 2, ly); ly += boy * 1.3; });
      x.fillStyle = "#a99cd6"; x.font = "28px " + FONT_SANS; harfAralik(x, t.alt.toLocaleUpperCase("tr"), W / 2, ly + 30, 3);
    } else {
      var boy2 = S.length > 3 ? 52 : 58, plan;
      for (var d2 = 0; d2 < 8; d2++){
        x.font = "500 " + boy2 + "px " + FONT_SERIF;
        plan = S.map(function(t){ var sl = satirla(x, t.cumle, W - 230); return { t: t, sl: sl, h: 44 + 16 + sl.length * boy2 * 1.25 + 34 }; });
        if (plan.reduce(function(a, b){ return a + b.h; }, 0) + (S.length - 1) * 56 <= alt - ust) break; boy2 -= 4;
      }
      var topH = plan.reduce(function(a, b){ return a + b.h; }, 0), bosluk = Math.max(56, Math.min(120, (alt - ust - topH) / (S.length - 1))), yy2 = ust + Math.max(0, (alt - ust - topH - bosluk * (S.length - 1)) / 2);
      plan.forEach(function(b, i){
        x.fillStyle = "#e7cf95"; x.font = "italic 500 36px " + FONT_SERIF; x.fillText(b.t.giris + "…", W / 2, yy2 + 36);
        x.fillStyle = "#f7f0e2"; x.font = "500 " + boy2 + "px " + FONT_SERIF; var ly2 = yy2 + 44 + 16 + boy2 * .95; b.sl.forEach(function(q){ x.fillText(q, W / 2, ly2); ly2 += boy2 * 1.25; });
        x.fillStyle = "#a99cd6"; x.font = "24px " + FONT_SANS; harfAralik(x, b.t.alt.toLocaleUpperCase("tr"), W / 2, ly2 + 2, 3);
        yy2 += b.h;
        if (i < plan.length - 1){ x.save(); x.fillStyle = "rgba(231,207,149,.7)"; x.beginPath(); x.arc(W / 2 - 18, yy2 + bosluk / 2 - 8, 3, 0, 7); x.arc(W / 2, yy2 + bosluk / 2 - 8, 4.5, 0, 7); x.fill(); x.beginPath(); x.arc(W / 2 + 18, yy2 + bosluk / 2 - 8, 3, 0, 7); x.fill(); x.restore(); yy2 += bosluk; }
      });
    }
    // alt bölüm
    ayrac(x, W / 2, H - 400, 120);
    x.fillStyle = "#f3dc9c"; x.font = "italic 500 50px " + FONT_SERIF; x.fillText("seninki ne?", W / 2, H - 312);
    x.fillStyle = "#cfc5e0"; x.font = "30px " + FONT_SANS; x.fillText("doğum haritana ücretsiz bak", W / 2, H - 262);
    var pw = 400, ph = 66, py = H - 222; x.save(); x.strokeStyle = altin(x, W / 2 - pw / 2, py, W / 2 + pw / 2, py + ph); x.lineWidth = 2;
    x.beginPath(); if (x.roundRect) x.roundRect(W / 2 - pw / 2, py, pw, ph, 33); else x.rect(W / 2 - pw / 2, py, pw, ph); x.stroke(); x.restore();
    x.fillStyle = altin(x, W / 2 - 160, py, W / 2 + 160, py + ph); x.font = "700 32px " + FONT_SANS; harfAralik(x, "astroyuvam.com", W / 2, py + 44, 2);
    cv.toBlob(function(b){
      $("peKartBtn").disabled = false; $("peKartBtn").textContent = "📤 Hikâye kartımı oluştur";
      if (!b) return;
      var url = URL.createObjectURL(b), dosya = null;
      try { dosya = new File([b], "haritam-astroyuvam.png", { type: "image/png" }); } catch(e){}
      $("peImg").src = url; $("peOnizle").classList.add("acik");
      var paylasabilir = dosya && navigator.canShare && navigator.canShare({ files: [dosya] });
      $("peNot").innerHTML = paylasabilir ? 'Kartın hazır. <button class="btn" type="button" id="pePaylas">Hikâyende paylaş</button> <a class="btn ghost" id="peIndir" download="haritam-astroyuvam.png" href="' + url + '">İndir</a>' : 'Kartın hazır. <a class="btn" id="peIndir" download="haritam-astroyuvam.png" href="' + url + '">Kartı indir</a><br><span style="font-size:12.5px">İndirdikten sonra Instagram hikâyende paylaşabilir ya da birine gönderebilirsin.</span>';
      if (paylasabilir) $("pePaylas").onclick = function(){ navigator.share({ files: [dosya], text: "doğum haritama göre ben böyleyim 👀 seninki ne?" }).catch(function(){}); };
      if (window.gtag) gtag("event", "panel_kart", { adet: S.length });
    }, "image/png");
  }

  /* ================= 2) HAYATININ DÖNÜM YILLARI ================= */
  function donum(){
    var k = $("peDonumBolum"); if (!k) return;
    var p = C.prof, anahtar = [p.birthDate, p.birthTime, p.birthPlace].join("|"), c = lsAl("ay_donum_v1");
    function ciz(j){
      if (!j || !j.ok || !j.olaylar || !j.olaylar.length) return;
      var bugun = iso(new Date()), yil = 365.25 * 864e5;
      var sira = j.olaylar.map(function(o){
        var ilk = new Date(o.ilk), son = new Date(o.son), durum = bugun < iso(new Date(ilk.getTime() - .5 * yil)) ? "gelecek" : bugun > iso(new Date(son.getTime() + .5 * yil)) ? "gecti" : "simdi";
        var fark = (ilk - new Date()) / yil, rz = durum === "simdi" ? "şu an bu dönemdesin" : durum === "gecti" ? "geride kaldı" : (fark < 1 ? Math.max(1, Math.round(fark * 12)) + " ay sonra" : Math.round(fark) + " yıl sonra");
        var tarih = AYL[ilk.getMonth()] + " " + ilk.getFullYear() + (o.son !== o.ilk && son.getFullYear() * 12 + son.getMonth() !== ilk.getFullYear() * 12 + ilk.getMonth() ? " – " + AYL[son.getMonth()] + " " + son.getFullYear() : "");
        return '<li class="' + durum + '"><div class="yas">' + Math.floor(o.yas) + '<small>yaş</small></div><i class="nk"></i><div><b>' + esc(o.baslik) + '<span class="rz">' + rz + '</span></b><div class="tr">' + tarih + '</div><p>' + esc(o.metin) + (durum === "gecti" ? " <em style='color:var(--gold-soft);font-style:normal'>O yıllarda neler olmuştu, bir hatırla.</em>" : "") + '</p></div></li>';
      }).join("");
      k.innerHTML = '<div class="bolum-b"><h2>Hayatının dönüm yılları</h2><span>Yavaş gezegenler doğduğun andaki yerlerine döndüğünde hayat yön değiştirir</span></div><ol class="pe-zaman">' + sira + '</ol>';
      k.classList.remove("gizli");
    }
    if (c && c.k === anahtar && c.v && c.v.ok) return ciz(c.v);
    var body = { birthDate: p.birthDate, birthPlace: p.birthPlace }; if (p.birthTime) body.birthTime = p.birthTime.slice(0,5);
    fetch(C.api + "/api/donum-yillari", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function(r){ return r.json(); }).then(function(j){ if (j && j.ok) lsKoy("ay_donum_v1", { k: anahtar, v: j }); ciz(j); }).catch(function(){});
  }

  /* ================= 3) DOĞUM GÜNÜ SÜRPRİZİ ================= */
  function dogumGunu(){
    var k = $("peDgBolum"), gun = C.N.noktalar["Güneş"]; if (!k || !gun) return;
    var bd = C.prof.birthDate.split("-"), simdi = new Date(), y = simdi.getFullYear();
    var adaylar = [y - 1, y, y + 1].map(function(yy){ return new Date(yy, +bd[1] - 1, +bd[2], 12); });
    var dg = adaylar.filter(function(d){ var f = (d - simdi) / 864e5; return f <= 30 && f >= -14; })[0];
    if (!dg) return;
    // Güneş'in doğduğun dereceye tam döndüğü an (güneş dönüşü)
    function f(t){ return n180(C.A.SunPosition(t).elon - gun.lon); }
    var a = new Date(dg.getTime() - 3 * 864e5), b = new Date(dg.getTime() + 3 * 864e5), fa = f(a);
    if (Math.sign(fa) === Math.sign(f(b))) return;
    for (var i = 0; i < 40; i++){ var m = new Date((a.getTime() + b.getTime()) / 2), fm = f(m); if (Math.sign(fm) === Math.sign(fa)){ a = m; fa = fm; } else b = m; }
    var an = new Date((a.getTime() + b.getTime()) / 2), ml = C.lon("Moon", an), jl = C.lon("Jupiter", an), jev = C.evBul(C.N, jl);
    var bugunGece = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate()), dgGece = new Date(dg.getFullYear(), dg.getMonth(), dg.getDate());
    var yas = dg.getFullYear() - +bd[0], kalan = Math.round((dgGece - bugunGece) / 864e5);
    var bas = kalan > 0 ? kalan + " gün sonra yeni yaşına giriyorsun" : kalan === 0 ? "Doğum günün kutlu olsun ✦" : "Yeni yaşın kutlu olsun ✦";
    var saat = String(an.getHours()).padStart(2,"0") + ":" + String(an.getMinutes()).padStart(2,"0");
    k.innerHTML = '<div class="pe-dg"><div class="k">🎂 ' + yas + '. yaşın</div><h2>' + bas + '</h2>' +
      '<div class="an">Güneş, doğduğun dereceye ' + an.getDate() + " " + AYL[an.getMonth()] + " " + an.getFullYear() + ", saat " + saat + "'te dönüyor (bu cihazın saatiyle). Yeni yaşın tam o an başlıyor.</div>" +
      '<p><b style="color:var(--gold-soft)">Yeni yaşın havası:</b> ' + DG_AY[burcI(ml)] + ' <span class="an">(o an Ay ' + BDA[burcI(ml)] + ')</span></p>' +
      '<p><b style="color:var(--gold-soft)">Bu yaşta şansının yüzü:</b> Jüpiter senin ' + jev + '. evinde, yani ' + esc(C.EVS[jev]) + '.</p>' +
      '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="/solar-return-analizi.html">Yeni yaşının tam haritası →</a><span class="not" style="margin:0;align-self:center">Solar Return raporu: yeni yaşının 12 ayını ay ay anlatır.</span></div></div>';
    k.classList.remove("gizli");
  }

  /* ================= 4) KAYITLI KİŞİYLE ORTAK HAFTA ================= */
  var PUAN = [0, 1, 1, 1, 2, 3, 0, 3, 0, 1, 0, 2, -2];
  var ORTAK_ET = { iyi: "Birlikte vakit geçirmek için çok uygun", orta: "Sakin, olağan bir gün", zor: "Duygular hassas; tartışmayı büyütmeyin" };
  function ortak(){
    var k = $("peOrtakBolum"); if (!k || !C.sb) return;
    C.sb.from("charts").select("*").order("created_at", { ascending: true }).then(function(r){
      var L = (r && r.data || []).filter(function(x){ return x && x.birth_date && x.birth_place; });
      if (!L.length){
        k.innerHTML = '<div class="bolum-b"><h2>Sevdiğinle bu hafta</h2><span>Kayıtlı kişilerinden biriyle ortak günlerinizi gör</span></div><div class="bos">Henüz kayıtlı kimse yok. <a href="/profil.html">Profilinden</a> sevgilini, eşini ya da en yakın arkadaşını ekle; burada ikinizin haftası görünsün.</div>';
        k.classList.remove("gizli"); return;
      }
      var son = lsAl("ay_ortak_son");
      k.innerHTML = '<div class="bolum-b"><h2>Sevdiğinle bu hafta</h2><span>Ay ikinizin haritasında hangi evden geçiyor</span></div><div class="pe-ortak"><select id="peKisi" aria-label="Kişi seç">' + L.map(function(x, i){ return '<option value="' + i + '"' + (son === x.id ? " selected" : "") + '>' + esc(x.name || "İsimsiz") + '</option>'; }).join("") + '</select><div id="peOrtakSonuc"><div class="not">Hesaplanıyor…</div></div></div>';
      k.classList.remove("gizli");
      function sec(){ var x = L[+$("peKisi").value]; lsKoy("ay_ortak_son", x.id); hesapla(x); }
      $("peKisi").onchange = sec; sec();
    }, function(){});
  }
  function hesapla(x){
    var anahtar = [x.birth_date, x.birth_time || "", x.birth_place].join("|"), c = lsAl("ay_kisi_" + anahtar);
    function ciz(j){
      var O = C.hazirla(j), ad = (x.name || "O").split(" ")[0], satir = [], bugun = new Date();
      for (var i = 0; i < 7; i++){
        var d = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() + i, 12), ml = C.lon("Moon", d), e1 = C.evBul(C.N, ml), e2 = C.evBul(O, ml), p = PUAN[e1] + PUAN[e2];
        satir.push({ d: d, e1: e1, e2: e2, p: p });
      }
      var enIyi = satir.slice().sort(function(a, b){ return b.p - a.p; })[0], enZor = satir.slice().sort(function(a, b){ return a.p - b.p; })[0];
      var tur = function(s){ return s === enIyi && s.p >= 3 ? "iyi" : s === enZor && s.p <= 0 ? "zor" : "orta"; };
      var gAd = function(d){ return iso(d) === iso(bugun) ? "Bugün" : GUN[d.getDay()]; };
      $("peOrtakSonuc").innerHTML = '<div class="enler" style="margin-top:12px">' + (enIyi.p >= 3 ? '<span>💞 ' + esc(ad) + ' ile en güzel gün: <b>' + gAd(enIyi.d) + '</b></span>' : "") + (enZor.p <= 0 ? '<span>🌧️ Hassas gün: <b>' + gAd(enZor.d) + '</b></span>' : "") + '</div>' +
        '<table><tr><th>Gün</th><th>Sende</th><th>' + esc(ad) + "'" + bulunma(ad) + '</th></tr>' + satir.map(function(s){ var t = tur(s);
          return '<tr class="' + t + '"><td><b>' + GUNK[s.d.getDay()] + " " + s.d.getDate() + '</b>' + (t !== "orta" ? '<div class="et">' + ORTAK_ET[t] + '</div>' : "") + '</td><td>' + s.e1 + '. ev · ' + esc(C.GUNET[s.e1]) + '</td><td>' + s.e2 + '. ev · ' + esc(C.GUNET[s.e2]) + '</td></tr>'; }).join("") + '</table>' +
        (O.saat ? "" : '<div class="not">' + esc(ad) + ' için doğum saati kayıtlı olmadığından evleri Güneş burcuna göre yaklaşık hesaplandı.</div>');
    }
    if (c && c.ok) return ciz(c);
    var body = { birthDate: x.birth_date, birthPlace: x.birth_place }; if (x.birth_time) body.birthTime = String(x.birth_time).slice(0,5);
    fetch(C.api + "/api/harita", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function(r){ return r.json(); }).then(function(j){ if (!j || !j.ok) throw 0; delete j.cark; lsKoy("ay_kisi_" + anahtar, { ok: true, gezegenler: j.gezegenler, yukselen: j.yukselen, mc: j.mc, evler: j.evler }); ciz(j); })
      .catch(function(){ $("peOrtakSonuc").innerHTML = '<div class="not">Şu an hesaplanamadı, birazdan tekrar dener misin?</div>'; });
  }

  /* ================= 5) PAZARTESİ E-POSTASI İZNİ ================= */
  function mail(){
    var k = $("peMail"); if (!k || !C.sb || !C.kullanici) return;
    var m = C.kullanici.user_metadata || {}, acik = m.weekly_mail === true;
    k.innerHTML = '<div class="pe-mail"><div><b>📬 Her pazartesi haftanı e-postayla gönderelim mi?</b><span>Haftanın gün gün özeti, haritana göre. İstediğin an buradan ya da e-postadaki bağlantıdan kapatabilirsin.</span></div><label class="pe-anahtar"><input type="checkbox" id="peMailA"' + (acik ? " checked" : "") + ' aria-label="Pazartesi e-postası"><i></i></label></div><div class="not" id="peMailN"></div>';
    k.classList.remove("gizli");
    $("peMailA").onchange = function(){ var v = this.checked, el = this; $("peMailN").textContent = "Kaydediliyor…";
      C.sb.auth.updateUser({ data: { weekly_mail: v, weekly_mail_onay: v ? new Date().toISOString() : null } }).then(function(r){
        if (r && r.error){ el.checked = !v; $("peMailN").textContent = "Kaydedilemedi, tekrar dener misin?"; return; }
        $("peMailN").textContent = v ? "Tamam ✦ İlk e-postan pazartesi sabahı gelecek." : "Kapatıldı. Artık e-posta gelmeyecek.";
        if (window.gtag) gtag("event", v ? "haftalik_mail_ac" : "haftalik_mail_kapat");
      }); };
  }

  window.AYPanelEk = { baslat: function(ctx){ C = ctx;
    [dogumGunu, aynaCiz, ortak, mail, donum].forEach(function(fn){ try { fn(); } catch(e){ if (window.console) console.warn("panel-ek", e); } });
  } };
})();
