/* ay-defteri.js — Kozmik Panel'in "Ay Defteri" bölümü (yalnızca üyeler).
 * Üye her gün tek dokunuşla hâlini işaretler (isterse kısa bir not ekler).
 * Kayıtlar Supabase "ay_defteri" tablosunda, yalnızca sahibinin görebileceği şekilde (RLS) saklanır.
 * Her kaydın gününde Ay'ın burcu, üyenin hangi evinde olduğu ve evresi CİHAZDA hesaplanır;
 * yeterli kayıt birikince üyenin KENDİ kayıtlarından çıkan örüntüler gösterilir. Yapay zekâ kullanılmaz.
 * panelim.html, panel açılınca window.AYDefter.baslat(ctx) çağırır. */
(function () {
  "use strict";
  var BN = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
  var BDA = ["Koç'tayken","Boğa'dayken","İkizler'deyken","Yengeç'teyken","Aslan'dayken","Başak'tayken","Terazi'deyken","Akrep'teyken","Yay'dayken","Oğlak'tayken","Kova'dayken","Balık'tayken"];
  var AYL = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  var GUNK = ["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"];
  var ELEM = ["ateş","toprak","hava","su"], ELEM_AD = { "ateş": "ateş burçlarında (Koç, Aslan, Yay)", "toprak": "toprak burçlarında (Boğa, Başak, Oğlak)", "hava": "hava burçlarında (İkizler, Terazi, Kova)", "su": "su burçlarında (Yengeç, Akrep, Balık)" };
  /* hâller: kimlik, ad, simge, renk, ruh hâli puanı (örüntü için) */
  var HAL = [
    { id: "enerjik", ad: "Enerjik",   s: "✨", r: "#f3c96b", p: 2 },
    { id: "ask",     ad: "Aşk dolu",  s: "💗", r: "#ef9ab4", p: 2 },
    { id: "huzurlu", ad: "Huzurlu",   s: "🌿", r: "#8fd8b0", p: 1 },
    { id: "dalgin",  ad: "Dalgın",    s: "💭", r: "#b7aee0", p: 0 },
    { id: "yorgun",  ad: "Yorgun",    s: "🌙", r: "#7f93c9", p: -1 },
    { id: "gergin",  ad: "Gergin",    s: "⚡", r: "#e98e8e", p: -2 }
  ];
  var HI = {}; HAL.forEach(function (h) { HI[h.id] = h; });
  var FAZ = [ // 4 ana evre (Ay–Güneş açısına göre)
    { ad: "Yeni Ay", ek: "Yeni Ay günlerinde" },
    { ad: "Büyüyen Ay", ek: "Ay büyürken" },
    { ad: "Dolunay", ek: "Dolunay günlerinde" },
    { ad: "Küçülen Ay", ek: "Ay küçülürken" }
  ];
  var ILK = 7, TAM = 14;    // örüntü eşikleri (kayıt sayısı)
  var C = null, KAYIT = [], TABLO_YOK = false;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(x) { return ((x % 360) + 360) % 360; }
  function gunAnahtar(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function anahtarTarih(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0); }
  function bugunK() { return gunAnahtar(new Date()); }
  function dunK() { var d = new Date(); d.setDate(d.getDate() - 1); return gunAnahtar(d); }

  /* Bir günün gökyüzü: öğlen 12:00 (yerel) itibarıyla Ay burcu, üyenin evi, evresi */
  var gokOnbellek = {};
  function gok(k) {
    if (gokOnbellek[k]) return gokOnbellek[k];
    var d = anahtarTarih(k), ml = norm(C.lon("Moon", d)), faz = norm(C.A.MoonPhase(d));
    var r = { burc: Math.floor(ml / 30), ev: C.evBul(C.N, ml), faz: Math.floor(norm(faz + 45) / 90), fazAci: faz };
    r.elem = ELEM[r.burc % 4];
    return (gokOnbellek[k] = r);
  }

  /* ---------- stil ---------- */
  function stil() {
    if ($("ad-stil")) return;
    var s = document.createElement("style"); s.id = "ad-stil";
    s.textContent =
      ".ad-kap{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:14px}" +
      "@media(max-width:860px){.ad-kap{grid-template-columns:1fr}}" +
      ".ad-kart{background:radial-gradient(ellipse at 0% 0%,rgba(169,156,240,.16),transparent 55%),linear-gradient(180deg,rgba(36,28,61,.78),rgba(28,23,51,.78));border:1px solid var(--line);border-radius:20px;padding:18px}" +
      ".ad-soru{font-family:Georgia,serif;font-size:22px;line-height:1.25;margin:0 0 4px;color:var(--cream)}" +
      ".ad-alt{font-size:13px;color:var(--muted);margin:0 0 14px}" +
      ".ad-hal{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}" +
      "@media(max-width:420px){.ad-hal{grid-template-columns:repeat(2,minmax(0,1fr))}}" +
      ".ad-hal button{appearance:none;cursor:pointer;display:flex;align-items:center;gap:8px;background:rgba(20,16,31,.55);border:1px solid var(--line);border-radius:14px;padding:11px 12px;color:var(--cream);font:500 14px 'Segoe UI',system-ui,sans-serif;text-align:left;transition:border-color .15s,transform .15s,background .15s}" +
      ".ad-hal button:hover{border-color:rgba(217,185,106,.55);transform:translateY(-1px)}" +
      ".ad-hal button i{width:12px;height:12px;border-radius:50%;flex:none;box-shadow:0 0 10px currentColor}" +
      ".ad-hal button em{font-style:normal;font-size:17px;line-height:1}" +
      ".ad-hal button.on{border-color:var(--gold);background:linear-gradient(180deg,rgba(217,185,106,.2),rgba(28,23,51,.85))}" +
      ".ad-hal button:disabled{opacity:.6;cursor:wait}" +
      ".ad-not{display:flex;gap:8px;margin-top:12px}" +
      ".ad-not input{flex:1;min-width:0;background:#120e1e;color:var(--cream);border:1px solid rgba(217,185,106,.35);border-radius:12px;padding:10px 12px;font:14px 'Segoe UI',system-ui,sans-serif}" +
      ".ad-durum{font-size:13px;color:var(--gold-soft);margin-top:8px}.ad-durum:empty{display:none}" +
      ".ad-dun{appearance:none;background:none;border:none;color:var(--muted);font:12.5px 'Segoe UI',system-ui,sans-serif;text-decoration:underline;cursor:pointer;padding:0;margin-top:6px}" +
      ".ad-ipucu{margin-top:14px;background:rgba(217,185,106,.08);border:1px solid rgba(217,185,106,.3);border-radius:14px;padding:11px 14px;font-size:14px;color:var(--cream)}" +
      ".ad-ipucu b{color:var(--gold-soft)}" +
      ".ad-serit{display:grid;grid-template-columns:repeat(15,minmax(0,1fr));gap:4px;margin-top:14px}" +
      ".ad-serit span{aspect-ratio:1;border-radius:6px;border:1px dashed rgba(154,143,184,.28);position:relative}" +
      ".ad-serit span.d{border:none}.ad-serit span.b{outline:2px solid var(--gold);outline-offset:1px}" +
      ".ad-serit-b{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:4px}" +
      ".ad-saat{display:flex;flex-direction:column;align-items:center}" +
      ".ad-saat svg{width:100%;max-width:300px;height:auto;display:block}" +
      ".ad-saat svg text{font-family:'Segoe UI',system-ui,sans-serif;text-anchor:middle;dominant-baseline:central}" +
      ".ad-lej{display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;font-size:12px;color:var(--muted);margin-top:6px}" +
      ".ad-lej i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;vertical-align:0}" +
      ".ad-ilerleme{width:100%;margin-top:10px}" +
      ".ad-ilerleme div{height:8px;border-radius:6px;background:#2a2342;overflow:hidden}" +
      ".ad-ilerleme div i{display:block;height:100%;background:linear-gradient(90deg,var(--mor),var(--gold));border-radius:6px}" +
      ".ad-ilerleme span{display:block;font-size:12.5px;color:var(--muted);margin-top:6px;text-align:center}" +
      ".ad-oruntu{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}" +
      "@media(max-width:860px){.ad-oruntu{grid-template-columns:1fr}}" +
      ".ad-o{background:rgba(28,23,51,.75);border:1px solid var(--line);border-left:3px solid var(--gold);border-radius:16px;padding:13px 15px}" +
      ".ad-o small{display:block;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold)}" +
      ".ad-o>b{display:block;font-family:Georgia,serif;font-weight:600;font-size:17px;line-height:1.3;margin:5px 0 4px}" +
      ".ad-o p{margin:0;font-size:13.5px;color:#e2d9ee}.ad-o p b{color:var(--gold-soft)}" +
      ".ad-dag{display:flex;height:12px;border-radius:7px;overflow:hidden;margin-top:12px;background:#2a2342}" +
      ".ad-dag i{display:block;height:100%}" +
      "@media (prefers-reduced-motion:reduce){.ad-hal button{transition:none}}";
    document.head.appendChild(s);
  }

  /* ---------- veri ---------- */
  function yukle() {
    var bas = new Date(); bas.setDate(bas.getDate() - 400);
    return C.sb.from("ay_defteri").select("gun,hal,notu").gte("gun", gunAnahtar(bas)).order("gun", { ascending: true }).then(function (r) {
      if (r.error) { TABLO_YOK = true; throw r.error; }
      KAYIT = (r.data || []).filter(function (x) { return HI[x.hal]; });
    });
  }
  function kaydet(gun, hal, notu) {
    var satir = { user_id: C.kullanici.id, gun: gun, hal: hal, updated_at: new Date().toISOString() };
    if (notu !== undefined) satir.notu = notu ? String(notu).slice(0, 280) : null;
    return C.sb.from("ay_defteri").upsert(satir, { onConflict: "user_id,gun" }).then(function (r) {
      if (r.error) throw r.error;
      var var_ = KAYIT.filter(function (x) { return x.gun === gun; })[0];
      if (var_) { var_.hal = hal; if (notu !== undefined) var_.notu = satir.notu; }
      else { KAYIT.push({ gun: gun, hal: hal, notu: satir.notu || null }); KAYIT.sort(function (a, b) { return a.gun < b.gun ? -1 : 1; }); }
    });
  }
  function kayitBul(gun) { return KAYIT.filter(function (x) { return x.gun === gun; })[0] || null; }

  /* ---------- örüntü ---------- */
  function grupla(anahtarFn) {
    var g = {};
    KAYIT.forEach(function (x) {
      var k = anahtarFn(gok(x.gun)); if (k == null) return;
      (g[k] = g[k] || { n: 0, top: 0, say: {} });
      g[k].n++; g[k].top += HI[x.hal].p; g[k].say[x.hal] = (g[k].say[x.hal] || 0) + 1;
    });
    Object.keys(g).forEach(function (k) {
      var o = g[k]; o.ort = o.top / o.n;
      o.bas = Object.keys(o.say).sort(function (a, b) { return o.say[b] - o.say[a] || HI[b].p - HI[a].p; })[0];
    });
    return g;
  }
  function genelOrt() { return KAYIT.length ? KAYIT.reduce(function (a, x) { return a + HI[x.hal].p; }, 0) / KAYIT.length : 0; }
  /* en belirgin grup: en az minN kayıt, genel ortalamadan en az esik fark */
  function belirgin(g, minN, yon) {
    var ort = genelOrt(), en = null;
    Object.keys(g).forEach(function (k) { var o = g[k]; if (o.n < minN) return;
      var fark = (o.ort - ort) * yon; if (fark < 0.5) return;
      if (!en || fark > en.fark || (fark === en.fark && o.n > en.o.n)) en = { k: k, o: o, fark: fark }; });
    return en;
  }
  function grupCumle(o) { var h = HI[o.bas], n = o.say[o.bas];
    return (n === o.n ? "Bu günlerdeki " + o.n + " kaydının hepsinde" : "Bu günlerdeki " + o.n + " kaydının " + n + " tanesinde") + " kendini <b>" + esc(h.ad.toLocaleLowerCase("tr")) + "</b> olarak işaretlemişsin."; }

  function evAlt(ev) { var t = C.EVS[+ev]; return t ? '<span style="display:block;font-size:12.5px;color:var(--mor);margin-bottom:4px">' + esc(t.charAt(0).toLocaleUpperCase("tr") + t.slice(1)) + '</span>' : ""; }
  function oruntuler() {
    var n = KAYIT.length, minN = n >= TAM ? 3 : 2, out = [];
    var ev = grupla(function (g) { return g.ev; }), faz = grupla(function (g) { return g.faz; }), el = grupla(function (g) { return g.elem; });
    var iyiEv = belirgin(ev, minN, 1), zorEv = belirgin(ev, minN, -1);
    if (iyiEv) out.push({ t: "uyum", k: "En iyi hissettiğin ev", b: "Ay " + iyiEv.k + ". evindeyken", p: evAlt(iyiEv.k) + grupCumle(iyiEv.o) });
    if (zorEv && (!iyiEv || zorEv.k !== iyiEv.k)) out.push({ t: "zor", k: "Kendine iyi bakman gereken ev", b: "Ay " + zorEv.k + ". evindeyken", p: evAlt(zorEv.k) + grupCumle(zorEv.o) + " Ay bu evine geldiğinde kendine biraz daha alan aç." });
    var iyiF = belirgin(faz, minN, 1) || belirgin(faz, minN, -1);
    if (iyiF) { var yonF = iyiF.o.ort >= genelOrt() ? "uyum" : "zor";
      out.push({ t: yonF, k: "Ay evresiyle bağın", b: FAZ[+iyiF.k].ek, p: grupCumle(iyiF.o) + (yonF === "uyum" ? " Bu evre senin enerji dönemin olabilir." : " Bu evrede tempoyu düşürmek iyi gelebilir.") }); }
    var iyiE = belirgin(el, minN, 1);
    if (iyiE && out.length < 3) out.push({ t: "uyum", k: "Sana iyi gelen Ay", b: "Ay " + ELEM_AD[iyiE.k], p: grupCumle(iyiE.o) });
    return out.slice(0, 3);
  }

  /* bugüne kişisel ipucu: Ay bugün hangi evinde ve geçmişte bu evdeyken nasıldın */
  function bugunIpucu() {
    var g = gok(bugunK()), ev = grupla(function (x) { return x.ev; })[g.ev];
    var bas = "Bugün Ay <b>" + BN[g.burc] + "</b> burcunda, senin <b>" + g.ev + ". evinde</b>" + (C.EVS[g.ev] ? " (" + esc(C.EVS[g.ev]) + ")" : "") + ". ";
    if (ev && ev.n >= 2) { var h = HI[ev.bas];
      return bas + "Ay bu evindeyken tuttuğun " + ev.n + " kayıtta en çok <b>" + h.s + " " + esc(h.ad.toLocaleLowerCase("tr")) + "</b> hissetmişsin. Bakalım bugün de öyle mi?"; }
    return bas + "Bu evle ilgili kaydın biriktikçe, Ay buraya her geldiğinde sana nasıl hissettiğini hatırlatacağım.";
  }

  /* ---------- çizim ---------- */
  function seritCiz() {
    var h = "", bug = new Date(); bug.setHours(12, 0, 0, 0);
    for (var i = 29; i >= 0; i--) { var d = new Date(bug); d.setDate(bug.getDate() - i); var k = gunAnahtar(d), x = kayitBul(k);
      h += '<span class="' + (x ? "d" : "") + (i === 0 ? " b" : "") + '" style="' + (x ? "background:" + HI[x.hal].r : "") + '" title="' + d.getDate() + " " + AYL[d.getMonth()] + (x ? ": " + esc(HI[x.hal].ad) : ": kayıt yok") + '"></span>'; }
    var b0 = new Date(bug); b0.setDate(bug.getDate() - 29);
    return '<div class="ad-serit" role="img" aria-label="Son 30 günün kayıtları">' + h + '</div><div class="ad-serit-b"><span>' + b0.getDate() + " " + AYL[b0.getMonth()].slice(0, 3) + '</span><span>bugün</span></div>';
  }
  /* Ay Saati: her kayıt, o günkü Ay evresinin açısına yerleşir (üstte Yeni Ay, altta Dolunay) */
  function saatCiz() {
    var S = 300, M = S / 2, R = 112, h = '<svg viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="Ay Saati: kayıtlarının Ay evrelerine göre dağılımı">';
    function P(a, r) { var t = (a - 90) * Math.PI / 180; return [M + r * Math.cos(t), M + r * Math.sin(t)]; }
    h += '<defs><radialGradient id="adG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(169,156,240,.18)"/><stop offset="100%" stop-color="rgba(20,16,31,0)"/></radialGradient></defs>';
    h += '<circle cx="' + M + '" cy="' + M + '" r="' + (R + 26) + '" fill="url(#adG)"/>';
    [R + 18, R - 18, R - 54].forEach(function (r, i) { h += '<circle cx="' + M + '" cy="' + M + '" r="' + r + '" fill="none" stroke="rgba(217,185,106,' + (i === 0 ? .4 : .14) + ')"' + (i ? ' stroke-dasharray="2 5"' : "") + '/>'; });
    // dört evre simgesi
    [[0, "yeni"], [90, "ilk"], [180, "dolu"], [270, "son"]].forEach(function (f) { var p = P(f[0], R + 34), r = 9;
      var g = '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + r + '" fill="' + (f[1] === "dolu" ? "#f4ecd6" : "#2b2445") + '" stroke="rgba(231,207,149,.6)"/>';
      if (f[1] === "ilk") g += '<path d="M' + p[0].toFixed(1) + ' ' + (p[1] - r).toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + p[0].toFixed(1) + ' ' + (p[1] + r).toFixed(1) + ' Z" fill="#f4ecd6"/>';
      if (f[1] === "son") g += '<path d="M' + p[0].toFixed(1) + ' ' + (p[1] - r).toFixed(1) + ' A' + r + ' ' + r + ' 0 0 0 ' + p[0].toFixed(1) + ' ' + (p[1] + r).toFixed(1) + ' Z" fill="#f4ecd6"/>';
      h += g; });
    // kayıt noktaları: yeni kayıtlar dış halkada, eskiler içe doğru
    var L = KAYIT.slice(-60), n = L.length;
    L.forEach(function (x, i) { var g = gok(x.gun), yas = n - 1 - i, r = R - 2 - Math.min(yas, 59) * 0.9 - (i % 3) * 6, p = P(g.fazAci, r), d = anahtarTarih(x.gun);
      h += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (yas < 1 ? 7 : 5.2) + '" fill="' + HI[x.hal].r + '" fill-opacity="' + (yas < 7 ? 1 : .78) + '"' + (yas < 1 ? ' stroke="#fff" stroke-width="1.5"' : "") + '><title>' + d.getDate() + " " + AYL[d.getMonth()] + " · " + esc(HI[x.hal].ad) + " · " + FAZ[g.faz].ad + '</title></circle>'; });
    // bugünün Ay konumu (ok)
    var gb = gok(bugunK()), pb = P(gb.fazAci, R + 18);
    var pt = P(gb.fazAci, R + 30);
    h += '<circle cx="' + pb[0].toFixed(1) + '" cy="' + pb[1].toFixed(1) + '" r="4.5" fill="#d9b96a" stroke="#14101f" stroke-width="1.5"><title>Bugün Ay burada</title></circle><text x="' + pt[0].toFixed(1) + '" y="' + pt[1].toFixed(1) + '" fill="#d9b96a" font-size="10" font-weight="600">bugün</text>';
    h += '<text x="' + M + '" y="' + (M - 9) + '" fill="#e7cf95" font-size="15" font-family="Georgia,serif">Ay Saatin</text><text x="' + M + '" y="' + (M + 11) + '" fill="#9a8fb8" font-size="11">' + n + ' kayıt</text></svg>';
    var lej = HAL.map(function (x) { return '<span><i style="background:' + x.r + '"></i>' + esc(x.ad) + '</span>'; }).join("");
    return '<div class="ad-saat">' + h + '<div class="ad-lej">' + lej + '</div></div>';
  }
  function dagilimCiz() {
    if (!KAYIT.length) return "";
    var say = {}; KAYIT.forEach(function (x) { say[x.hal] = (say[x.hal] || 0) + 1; });
    return '<div class="ad-dag" role="img" aria-label="Kayıtlarının dağılımı">' + HAL.filter(function (x) { return say[x.id]; }).map(function (x) {
      return '<i style="width:' + (say[x.id] / KAYIT.length * 100).toFixed(2) + '%;background:' + x.r + '" title="' + esc(x.ad) + ": " + say[x.id] + ' gün"></i>'; }).join("") + '</div>';
  }

  var secGun = null; // bugün mü dün mü kaydediliyor
  function ciz() {
    var k = $("adBolum"); if (!k) return;
    var gun = secGun || bugunK(), x = kayitBul(gun), dunMu = gun !== bugunK(), n = KAYIT.length;
    var hal = HAL.map(function (h) { return '<button type="button" data-hal="' + h.id + '"' + (x && x.hal === h.id ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '><i style="background:' + h.r + ';color:' + h.r + '"></i><em>' + h.s + '</em>' + esc(h.ad) + '</button>'; }).join("");
    var dunVar = !!kayitBul(dunK());
    var sol = '<div class="ad-kart">' +
      '<p class="ad-soru">' + (dunMu ? "Dün nasıldın?" : "Bugün nasılsın?") + '</p>' +
      '<p class="ad-alt">Tek dokunuş yeter. Defterin doldukça Ay\'ın sende nasıl çalıştığını gösteririm.</p>' +
      '<div class="ad-hal" id="adHal" role="group" aria-label="Hâlini seç">' + hal + '</div>' +
      '<div class="ad-not' + (x ? "" : " gizli") + '" id="adNotK"><input id="adNot" maxlength="140" placeholder="İstersen bir cümle ekle (yalnızca sen görürsün)" value="' + esc(x && x.notu || "") + '" aria-label="Kısa not"><button class="btn ghost" type="button" id="adNotB">Kaydet</button></div>' +
      '<div class="ad-durum" id="adDurum" aria-live="polite"></div>' +
      (dunMu ? '<button class="ad-dun" type="button" id="adGeri">← Bugüne dön</button>' : (!dunVar ? '<button class="ad-dun" type="button" id="adDun">Dünü kaydetmeyi unuttun mu?</button>' : "")) +
      '<div class="ad-ipucu">' + bugunIpucu() + '</div>' +
      seritCiz() + dagilimCiz() +
      '</div>';
    var sag = '<div class="ad-kart">' + saatCiz() + '<p class="ad-alt" style="margin:12px 0 0;text-align:center">Her nokta bir günün. Üstte Yeni Ay, sağda büyüyen Ay, altta Dolunay, solda küçülen Ay. Bir renk aynı bölgede toplanıyorsa, o evre sende hep o hâli uyandırıyor demektir.</p>';
    if (n < ILK) sag += '<div class="ad-ilerleme"><div><i style="width:' + Math.round(n / ILK * 100) + '%"></i></div><span>İlk örüntün <b style="color:var(--gold-soft)">' + ILK + '. kayıtta</b> açılır · ' + n + '/' + ILK + '</span></div>';
    else if (n < TAM) sag += '<div class="ad-ilerleme"><div><i style="width:' + Math.round(n / TAM * 100) + '%"></i></div><span>İlk ipuçların açıldı. Örüntülerin <b style="color:var(--gold-soft)">' + TAM + ' kayıtta</b> netleşir · ' + n + '/' + TAM + '</span></div>';
    sag += '</div>';
    var oru = "";
    if (n >= ILK) { var O = oruntuler();
      oru = O.length ? '<div class="ad-oruntu">' + O.map(function (o) { return '<div class="ad-o" style="border-left-color:' + (o.t === "zor" ? "var(--pembe)" : "var(--yesil)") + '"><small>' + esc(o.k) + '</small><b>' + esc(o.b) + '</b><p>' + o.p + '</p></div>'; }).join("") + '</div>'
        : '<div class="bos" style="margin-top:14px">Henüz belirgin bir örüntü yok; hâllerin Ay\'ın konumundan bağımsız dengeli görünüyor. Kayıt ekledikçe bu bölüm kendini yeniler.</div>'; }
    k.innerHTML = '<div class="bolum-b"><h2>Ay Defteri</h2><span>Her gün hâlini işaretle; Ay\'ın senin üzerindeki etkisini kendi kayıtlarından gör</span></div>' +
      '<div class="ad-kap">' + sol + sag + '</div>' + oru;
    k.classList.remove("gizli");
    bagla();
  }

  function bagla() {
    $("adHal").onclick = function (ev) {
      var b = ev.target.closest("button[data-hal]"); if (!b) return;
      var gun = secGun || bugunK(), hal = b.getAttribute("data-hal"), btn = this.querySelectorAll("button");
      btn.forEach(function (x) { x.disabled = true; }); $("adDurum").textContent = "Kaydediliyor…";
      var ilk = !kayitBul(gun);
      kaydet(gun, hal).then(function () {
        if (window.gtag) gtag("event", "ay_defteri_kayit", { hal: hal });
        ciz();
        var g = gok(gun);
        $("adDurum").innerHTML = (ilk ? "Defterine yazıldı ✦ " : "Güncellendi ✦ ") + (gun === bugunK() ? "Bugün" : "Dün") + " Ay " + BN[g.burc] + " burcunda, senin " + g.ev + ". evindeydi. Toplam " + KAYIT.length + " kayıt.";
        $("adNotK").classList.remove("gizli");
      }).catch(function () { btn.forEach(function (x) { x.disabled = false; }); $("adDurum").textContent = "Kaydedilemedi. İnternet bağlantını kontrol edip tekrar dener misin?"; });
    };
    $("adNotB").onclick = function () {
      var gun = secGun || bugunK(), x = kayitBul(gun); if (!x) return;
      var b = this; b.disabled = true; $("adDurum").textContent = "Not kaydediliyor…";
      kaydet(gun, x.hal, $("adNot").value.trim()).then(function () { b.disabled = false; $("adDurum").textContent = "Notun kaydedildi ✦"; })
        .catch(function () { b.disabled = false; $("adDurum").textContent = "Not kaydedilemedi, tekrar dener misin?"; });
    };
    $("adNot").onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); $("adNotB").click(); } };
    if ($("adDun")) $("adDun").onclick = function () { secGun = dunK(); ciz(); };
    if ($("adGeri")) $("adGeri").onclick = function () { secGun = null; ciz(); };
  }

  window.AYDefter = {
    baslat: function (ctx) {
      C = ctx; if (!C || !C.sb || !C.kullanici || !C.N) return;
      stil();
      yukle().then(ciz).catch(function (e) { if (window.console) console.warn("ay-defteri", e && e.message); });
    },
    // test için iç fonksiyonlara erişim
    _ic: { gok: gok, oruntuler: oruntuler, grupla: grupla, kayit: function (L) { KAYIT = L; }, ciz: ciz, ctx: function (c) { C = c; } }
  };
})();
