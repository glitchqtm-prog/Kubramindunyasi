/* burc-nabzi.js — "Burçların Nabzı": her gün tek soru (bugün nasılsın?), herkese açık.
 * Ziyaretçi burcunu ve hâlini seçer; oy Supabase'deki nabiz_oy fonksiyonuna gider (cihaz başına günde 1 oy,
 * gün içinde değiştirilebilir). Bugünün sonuçları oy verince açılır; dünün özeti herkese görünür.
 * Kütüphane yok (düz fetch), stil kendi içinde. Sayfada <div id="burcNabzi"></div> olması yeterli.
 * Sayılar gerçek oylardan gelir; az oy alan burçlarda yüzde gösterilmez. */
(function () {
  "use strict";
  var URL = "https://htyywgmgbmzhrqtgihqd.supabase.co/rest/v1/rpc/";
  var KEY = "sb_publishable_S1Bm79ihKGNyjY7R7yIwfQ_U4K6JJYM";
  var MIN = 3; // bir burcun yüzdesini göstermek için gereken en az oy
  var BN = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
  var GL = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  var BLAR = ["Koçların","Boğaların","İkizlerin","Yengeçlerin","Aslanların","Başakların","Terazilerin","Akreplerin","Yayların","Oğlakların","Kovaların","Balıkların"];
  var BDI = ["Koç'tu","Boğa'ydı","İkizler'di","Yengeç'ti","Aslan'dı","Başak'tı","Terazi'ydi","Akrep'ti","Yay'dı","Oğlak'tı","Kova'ydı","Balık'tı"];
  var HAL = [
    { id: "enerjik", ad: "Enerjik",  k: "enerjik",   en: "en enerjik", s: "✨", r: "#f3c96b" },
    { id: "ask",     ad: "Aşk dolu", k: "aşk dolu",  en: "en aşk dolu", s: "💗", r: "#ef9ab4" },
    { id: "huzurlu", ad: "Huzurlu",  k: "huzurlu",   en: "en huzurlu", s: "🌿", r: "#8fd8b0" },
    { id: "dalgin",  ad: "Dalgın",   k: "dalgın",    en: "en dalgın", s: "💭", r: "#b7aee0" },
    { id: "yorgun",  ad: "Yorgun",   k: "yorgun",    en: "en yorgun", s: "🌙", r: "#7f93c9" },
    { id: "gergin",  ad: "Gergin",   k: "gergin",    en: "en gergin", s: "⚡", r: "#e98e8e" }
  ];
  var HI = {}; HAL.forEach(function (h) { HI[h.id] = h; });
  var VS = "︎";
  var K = null, VERI = null, SEKME = "bugun", secBurc = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsAl(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsKoy(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function istGun() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { var d = new Date(Date.now() + 3 * 3600e3); return d.toISOString().slice(0, 10); } }
  function cihaz() {
    var c = lsAl("ay_cihaz");
    if (!c || !/^[0-9a-f-]{36}$/.test(c)) {
      c = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (ch) { var r = Math.random() * 16 | 0; return (ch === "x" ? r : (r & 3 | 8)).toString(16); });
      lsKoy("ay_cihaz", c);
    }
    return c;
  }
  function oyum() { try { var o = JSON.parse(lsAl("ay_nabiz") || "null"); return o && o.g === istGun() ? o : null; } catch (e) { return null; } }
  /* Türkçe: yüzdeye iyelik eki (%42'si, %40'ı, %30'u, %100'ü …) */
  function yuzdeEk(n) {
    if (n === 0) return "%0'ı";
    if (n % 100 === 0) return "%" + n + "'ü";
    var son = n % 10, ek;
    if (son) ek = ["", "i", "si", "ü", "ü", "i", "sı", "si", "i", "u"][son];
    else ek = { 10: "u", 20: "si", 30: "u", 40: "ı", 50: "si", 60: "ı", 70: "i", 80: "i", 90: "ı" }[n % 100];
    return "%" + n + "'" + ek;
  }
  function rpc(ad, govde) {
    return fetch(URL + ad, { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify(govde || {}) })
      .then(function (r) { if (!r.ok) throw new Error("nabiz " + r.status); return r.json(); });
  }

  /* ham satırlar [burc, hal, n] → burç bazında özet */
  function ozet(satir) {
    var B = [], top = 0, genel = {};
    for (var i = 0; i < 12; i++) B.push({ i: i, n: 0, say: {} });
    (satir || []).forEach(function (x) { var b = B[x[0]]; if (!b || !HI[x[1]]) return; b.n += x[2]; b.say[x[1]] = (b.say[x[1]] || 0) + x[2]; top += x[2]; genel[x[1]] = (genel[x[1]] || 0) + x[2]; });
    B.forEach(function (b) { b.bas = Object.keys(b.say).sort(function (p, q) { return b.say[q] - b.say[p]; })[0] || null; b.oran = b.bas ? b.say[b.bas] / b.n : 0; });
    return { B: B, top: top, genel: genel };
  }
  /* "en …" başlıkları: her hâl için o hâlin payı en yüksek burç (en az MIN oy) */
  function enler(O, adet) {
    var out = [];
    HAL.forEach(function (h) {
      var en = null;
      O.B.forEach(function (b) { if (b.n < MIN || !b.say[h.id]) return; var p = b.say[h.id] / b.n; if (!en || p > en.p || (p === en.p && b.n > en.b.n)) en = { b: b, p: p, h: h }; });
      if (en && en.p >= 0.3) out.push(en);
    });
    out.sort(function (a, b) { return b.p - a.p; });
    var gor = {}, son = [];
    out.forEach(function (x) { if (son.length < adet && !gor[x.b.i]) { gor[x.b.i] = 1; son.push(x); } });
    return son;
  }

  /* ---------- stil ---------- */
  function stil() {
    if ($("bn-stil")) return;
    var s = document.createElement("style"); s.id = "bn-stil";
    s.textContent =
      "#burcNabzi{--bn-gold:#d9b96a;--bn-gs:#e7cf95;--bn-cr:#f0e6d2;--bn-mu:#9a8fb8;--bn-ln:#332a4d;color:var(--bn-cr);font-family:'Segoe UI',system-ui,-apple-system,sans-serif}" +
      ".bn-kart{background:radial-gradient(ellipse at 100% 0%,rgba(169,156,240,.16),transparent 55%),linear-gradient(180deg,rgba(36,28,61,.82),rgba(24,19,43,.82));border:1px solid var(--bn-ln);border-radius:22px;padding:22px;text-align:left}" +
      ".bn-adim{font-size:11.5px;letter-spacing:2.5px;text-transform:uppercase;color:var(--bn-gold);margin:0 0 10px}" +
      ".bn-burc{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px}" +
      "@media(max-width:600px){.bn-burc{grid-template-columns:repeat(4,minmax(0,1fr))}}" +
      ".bn-burc button,.bn-hal button{appearance:none;cursor:pointer;background:rgba(20,16,31,.6);border:1px solid var(--bn-ln);border-radius:13px;color:var(--bn-cr);font:500 13px 'Segoe UI',system-ui,sans-serif;transition:border-color .15s,background .15s,transform .15s}" +
      ".bn-burc button{padding:8px 2px;display:flex;flex-direction:column;align-items:center;gap:2px}" +
      ".bn-burc button b{font-size:19px;font-weight:400;color:var(--bn-gs);font-family:'Segoe UI Symbol','Noto Sans Symbols 2','DejaVu Sans',sans-serif;line-height:1.1}" +
      ".bn-burc button:hover,.bn-hal button:hover{border-color:rgba(217,185,106,.6);transform:translateY(-1px)}" +
      ".bn-burc button.on,.bn-hal button.on{border-color:var(--bn-gold);background:linear-gradient(180deg,rgba(217,185,106,.22),rgba(28,23,51,.9))}" +
      ".bn-hal{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}" +
      "@media(max-width:420px){.bn-hal{grid-template-columns:repeat(2,minmax(0,1fr))}}" +
      ".bn-hal button{display:flex;align-items:center;gap:8px;padding:11px 12px;font-size:14px;text-align:left}" +
      ".bn-hal button i{width:11px;height:11px;border-radius:50%;flex:none}" +
      ".bn-hal[aria-disabled=true]{opacity:.45;pointer-events:none}" +
      ".bn-durum{font-size:13px;color:var(--bn-gs);margin-top:10px}.bn-durum:empty{display:none}" +
      ".bn-dun{margin-top:16px;padding-top:14px;border-top:1px dashed var(--bn-ln);font-size:14px;color:#e2d9ee;line-height:1.6}" +
      ".bn-dun b{color:var(--bn-gs)}" +
      ".bn-ust{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}" +
      ".bn-sek{display:flex;gap:6px}" +
      ".bn-sek button{appearance:none;border:1px solid var(--bn-ln);background:rgba(20,16,31,.6);color:var(--bn-cr);border-radius:16px;padding:5px 13px;font:12.5px 'Segoe UI',system-ui,sans-serif;cursor:pointer}" +
      ".bn-sek button.on{background:linear-gradient(180deg,var(--bn-gs),var(--bn-gold));color:#2a1e08;border-color:var(--bn-gold)}" +
      ".bn-say{font-size:13px;color:var(--bn-mu)}.bn-say b{color:var(--bn-gs);font-size:15px}" +
      ".bn-ben{background:rgba(217,185,106,.09);border:1px solid rgba(217,185,106,.32);border-radius:14px;padding:11px 14px;font-size:14.5px;margin-bottom:12px;line-height:1.55}" +
      ".bn-ben b{color:var(--bn-gs)}" +
      ".bn-bar{display:flex;height:12px;border-radius:7px;overflow:hidden;background:#2a2342;margin-bottom:6px}" +
      ".bn-bar i{display:block;height:100%}" +
      ".bn-lej{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--bn-mu);margin-bottom:14px}" +
      ".bn-lej i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}" +
      ".bn-izgara{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}" +
      "@media(max-width:760px){.bn-izgara{grid-template-columns:repeat(4,minmax(0,1fr))}}" +
      "@media(max-width:420px){.bn-izgara{grid-template-columns:repeat(3,minmax(0,1fr))}}" +
      ".bn-k{position:relative;background:rgba(20,16,31,.6);border:1px solid var(--bn-ln);border-radius:14px;padding:10px 8px 9px;text-align:center;overflow:hidden}" +
      ".bn-k.ben{border-color:var(--bn-gold);box-shadow:0 0 0 1px rgba(217,185,106,.35)}" +
      ".bn-k .g{font-size:18px;color:var(--bn-gs);font-family:'Segoe UI Symbol','Noto Sans Symbols 2','DejaVu Sans',sans-serif;line-height:1}" +
      ".bn-k .a{font-size:12.5px;font-weight:600;margin:3px 0 4px}" +
      ".bn-k .h{font-size:12px;line-height:1.3}" +
      ".bn-k .h small{display:block;color:var(--bn-mu);font-size:11px}" +
      ".bn-k .z{position:absolute;left:0;bottom:0;height:3px}" +
      ".bn-k.az .h{color:var(--bn-mu)}" +
      ".bn-alt{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px}" +
      ".bn-btn{appearance:none;border:none;cursor:pointer;background:linear-gradient(180deg,var(--bn-gs),var(--bn-gold));color:#2a1e08;font:600 14px 'Segoe UI',system-ui,sans-serif;padding:10px 16px;border-radius:22px}" +
      ".bn-btn.gh{background:transparent;color:var(--bn-gs);border:1px solid rgba(217,185,106,.45)}" +
      ".bn-not{font-size:12px;color:var(--bn-mu);margin:10px 0 0}" +
      ".bn-yuk{color:var(--bn-mu);font-size:14px;padding:30px 0;text-align:center}" +
      "@media (prefers-reduced-motion:reduce){.bn-burc button,.bn-hal button{transition:none}}";
    document.head.appendChild(s);
  }

  /* ---------- çizim ---------- */
  function dunMetni() {
    var O = ozet(VERI && VERI.d), E = enler(O, 3);
    if (!O.top) return "";
    if (!E.length) return '<div class="bn-dun">Dün <b>' + O.top + '</b> kişi oy verdi. Burç başına oylar henüz az olduğu için dünün öne çıkanlarını çıkaramadık; bugün sen de katıl.</div>';
    return '<div class="bn-dun">Dün <b>' + O.top + '</b> kişi oy verdi. ' + E.map(function (x, j) {
      return (j ? (j === E.length - 1 ? " ve " : ", ") : "") + x.h.en + " burç <b>" + BDI[x.b.i] + "</b> (%" + Math.round(x.p * 100) + ")";
    }).join("").replace(/^./, function (c) { return c.toLocaleUpperCase("tr"); }) + ".</div>";
  }
  
  function oyEkrani() {
    var o = oyum(), b = secBurc != null ? secBurc : (o ? o.b : (lsAl("ay_burc") != null ? +lsAl("ay_burc") : null));
    secBurc = b;
    var burc = BN.map(function (ad, i) { return '<button type="button" data-b="' + i + '"' + (b === i ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '><b>' + GL[i] + VS + '</b>' + ad + '</button>'; }).join("");
    var hal = HAL.map(function (h) { return '<button type="button" data-h="' + h.id + '"' + (o && o.h === h.id ? ' class="on"' : "") + '><i style="background:' + h.r + '"></i>' + h.s + " " + h.ad + '</button>'; }).join("");
    return '<div class="bn-kart">' +
      '<p class="bn-adim">1 · Burcun</p><div class="bn-burc" id="bnBurc" role="group" aria-label="Burcunu seç">' + burc + '</div>' +
      '<p class="bn-adim" style="margin-top:16px">2 · Bugün nasılsın?</p><div class="bn-hal" id="bnHal" role="group" aria-label="Hâlini seç"' + (b == null ? ' aria-disabled="true"' : "") + '>' + hal + '</div>' +
      '<div class="bn-durum" id="bnDurum" aria-live="polite">' + (b == null ? "Önce burcunu seç." : "") + '</div>' +
      dunMetni() + '</div>';
  }

  function sonucEkrani() {
    var o = oyum(), dun = SEKME === "dun", O = ozet(VERI && (dun ? VERI.d : VERI.b));
    var ust = '<div class="bn-ust"><div class="bn-say">' + (dun ? "Dün" : "Bugün şu ana kadar") + ' <b>' + O.top + '</b> kişi oy verdi</div>' +
      '<div class="bn-sek"><button type="button" data-s="bugun"' + (dun ? "" : ' class="on"') + '>Bugün</button><button type="button" data-s="dun"' + (dun ? ' class="on"' : "") + '>Dün</button></div></div>';
    if (!O.top) return '<div class="bn-kart">' + ust + '<div class="bn-yuk">' + (dun ? "Dün için henüz oy yok." : "Bugün henüz oy yok.") + '</div></div>';
    var ben = "";
    if (o && !dun) {
      var bb = O.B[o.b], h = HI[o.h];
      if (bb.n >= MIN && bb.bas) {
        var hb = HI[bb.bas], p = Math.round(bb.say[bb.bas] / bb.n * 100);
        ben = '<div class="bn-ben">Bugün <b>' + BLAR[o.b] + ' ' + yuzdeEk(p) + ' ' + hb.k + '</b> hissediyor. ' + (bb.bas === o.h ? "Sen de onlardansın " + h.s : "Sen ise bugün <b>" + h.k + "</b> " + h.s + " hissediyorsun; bugün burcundan farklı bir yerdesin.") + '</div>';
      } else ben = '<div class="bn-ben">Oyun kaydedildi ' + h.s + ' Bugün ' + BN[o.b] + ' burcundan oy veren henüz az; yüzde için en az ' + MIN + ' oy gerekiyor. Gün içinde tekrar bak.</div>';
    }
    var bar = '<div class="bn-bar" role="img" aria-label="Genel ruh hâli dağılımı">' + HAL.filter(function (h) { return O.genel[h.id]; }).map(function (h) {
      return '<i style="width:' + (O.genel[h.id] / O.top * 100).toFixed(2) + '%;background:' + h.r + '" title="' + h.ad + ": " + Math.round(O.genel[h.id] / O.top * 100) + '%"></i>'; }).join("") + '</div>' +
      '<div class="bn-lej">' + HAL.filter(function (h) { return O.genel[h.id]; }).map(function (h) { return '<span><i style="background:' + h.r + '"></i>' + h.ad + " %" + Math.round(O.genel[h.id] / O.top * 100) + '</span>'; }).join("") + '</div>';
    var iz = '<div class="bn-izgara">' + O.B.map(function (b) {
      var benim = o && o.b === b.i;
      if (b.n < MIN || !b.bas) return '<div class="bn-k az' + (benim ? " ben" : "") + '"><div class="g">' + GL[b.i] + VS + '</div><div class="a">' + BN[b.i] + '</div><div class="h">' + (b.n ? b.n + " oy" : "oy yok") + '<small>' + (b.n ? "yüzde için az" : "ilk oyu ver") + '</small></div></div>';
      var h = HI[b.bas], p = Math.round(b.oran * 100);
      return '<div class="bn-k' + (benim ? " ben" : "") + '" title="' + BN[b.i] + ": " + b.n + ' oy"><div class="g">' + GL[b.i] + VS + '</div><div class="a">' + BN[b.i] + '</div><div class="h">' + h.s + " " + h.ad + '<small>%' + p + " · " + b.n + ' oy</small></div><span class="z" style="width:' + p + '%;background:' + h.r + '"></span></div>';
    }).join("") + '</div>';
    var E = enler(O, 2), enMetin = E.length ? '<p class="bn-not" style="font-size:13.5px;color:#e2d9ee">' + (dun ? "Dün " : "Şu an ") + E.map(function (x) { return x.h.en + " burç <b style=\"color:var(--bn-gs)\">" + BN[x.b.i] + "</b>"; }).join(", ") + ".</p>" : "";
    return '<div class="bn-kart">' + ust + ben + bar + iz + enMetin +
      '<div class="bn-alt"><button class="bn-btn" type="button" id="bnPaylas">📤 Hikâye kartı oluştur</button><button class="bn-btn gh" type="button" id="bnDegis">Oyumu değiştir</button></div>' +
      '<p class="bn-not">Sonuçlar ziyaretçilerimizin gerçek oylarıdır; her cihaz günde bir oy verir. Yüzdeler, en az ' + MIN + ' oy alan burçlarda gösterilir. Gün, Türkiye saatiyle gece yarısı yenilenir.</p></div>';
  }

  var degistir = false;
  function ciz() {
    if (!K) return;
    K.innerHTML = (!oyum() || degistir) ? oyEkrani() : sonucEkrani();
    bagla();
  }

  function bagla() {
    var bB = $("bnBurc"), bH = $("bnHal");
    if (bB) bB.onclick = function (ev) {
      var b = ev.target.closest("button[data-b]"); if (!b) return; secBurc = +b.getAttribute("data-b"); lsKoy("ay_burc", String(secBurc));
      bB.querySelectorAll("button").forEach(function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
      bH.removeAttribute("aria-disabled"); $("bnDurum").textContent = "";
    };
    if (bH) bH.onclick = function (ev) {
      var b = ev.target.closest("button[data-h]"); if (!b || secBurc == null) return;
      var h = b.getAttribute("data-h"); bH.setAttribute("aria-disabled", "true"); $("bnDurum").textContent = "Oyun gönderiliyor…";
      rpc("nabiz_oy", { p_cihaz: cihaz(), p_burc: secBurc, p_hal: h }).then(function (j) {
        VERI = j; lsKoy("ay_nabiz", JSON.stringify({ g: istGun(), b: secBurc, h: h })); degistir = false; SEKME = "bugun";
        if (window.gtag) gtag("event", "burc_nabzi_oy", { burc: BN[secBurc], hal: h });
        ciz();
      }).catch(function () { bH.removeAttribute("aria-disabled"); $("bnDurum").textContent = "Oyun gönderilemedi. İnternet bağlantını kontrol edip tekrar dener misin?"; });
    };
    K.querySelectorAll(".bn-sek button").forEach(function (b) { b.onclick = function () { SEKME = b.getAttribute("data-s"); ciz(); }; });
    if ($("bnDegis")) $("bnDegis").onclick = function () { degistir = true; ciz(); };
    if ($("bnPaylas")) $("bnPaylas").onclick = kartOlustur;
  }

  /* ---------- paylaşılabilir hikâye kartı (1080×1920, cihazda çizilir) ---------- */
  function kartOlustur() {
    var dun = SEKME === "dun", O = ozet(VERI && (dun ? VERI.d : VERI.b)), o = oyum();
    var W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d");
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#241c3d"); g.addColorStop(.55, "#14101f"); g.addColorStop(1, "#0c0914"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (var i = 0; i < 140; i++) { var sx = (i * 397) % W, sy = (i * 733) % H, r = (i % 7 === 0) ? 2.4 : 1.2; x.globalAlpha = .25 + (i % 5) * .1; x.fillStyle = "#f0e6d2"; x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill(); }
    x.globalAlpha = 1; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = "#d9b96a"; x.font = "600 30px 'Segoe UI',sans-serif"; x.fillText("✦  ASTRO YUVAM  ✦", W / 2, 150);
    x.fillStyle = "#f0e6d2"; x.font = "600 92px Georgia,serif"; x.fillText("Burçların Nabzı", W / 2, 270);
    var tarih = new Date(); if (dun) tarih.setDate(tarih.getDate() - 1);
    var AYL = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    x.fillStyle = "#9a8fb8"; x.font = "36px 'Segoe UI',sans-serif"; x.fillText((dun ? "Dün · " : "Bugün · ") + tarih.getDate() + " " + AYL[tarih.getMonth()] + " · " + O.top + " kişi oy verdi", W / 2, 350);
    var tw = 300, th = 250, gx = (W - tw * 3 - 30 * 2) / 2, gy = 430;
    O.B.forEach(function (b, k) {
      var cx = gx + (k % 3) * (tw + 30), cy = gy + Math.floor(k / 3) * (th + 26), az = b.n < MIN || !b.bas, h = az ? null : HI[b.bas], ben = o && o.b === b.i && !dun;
      x.fillStyle = "rgba(28,23,51,.85)"; yuvarlak(x, cx, cy, tw, th, 26); x.fill();
      x.lineWidth = ben ? 5 : 2; x.strokeStyle = ben ? "#d9b96a" : "#3a2f5c"; yuvarlak(x, cx, cy, tw, th, 26); x.stroke();
      x.fillStyle = "#e7cf95"; x.font = "56px 'Segoe UI Symbol','Noto Sans Symbols 2','DejaVu Sans',sans-serif"; x.fillText(GL[b.i] + VS, cx + tw / 2, cy + 62);
      x.fillStyle = "#f0e6d2"; x.font = "600 34px 'Segoe UI',sans-serif"; x.fillText(BN[b.i], cx + tw / 2, cy + 120);
      if (az) { x.fillStyle = "#9a8fb8"; x.font = "28px 'Segoe UI',sans-serif"; x.fillText(b.n ? "az oy" : "oy yok", cx + tw / 2, cy + 178); }
      else {
        x.fillStyle = h.r; x.beginPath(); x.arc(cx + 48, cy + 178, 13, 0, 7); x.fill();
        x.fillStyle = "#f0e6d2"; x.font = "600 30px 'Segoe UI',sans-serif"; x.textAlign = "left"; x.fillText(h.ad, cx + 72, cy + 178); x.textAlign = "center";
        x.fillStyle = "#9a8fb8"; x.font = "26px 'Segoe UI',sans-serif"; x.fillText("%" + Math.round(b.oran * 100), cx + tw / 2, cy + 222);
      }
    });
    var E = enler(O, 2);
    x.fillStyle = "#e7cf95"; x.font = "italic 40px Georgia,serif";
    if (E.length) E.forEach(function (e, j) { x.fillText((j ? "" : (dun ? "Dün " : "Bugün ")) + e.h.en + " burç: " + BN[e.b.i], W / 2, 1600 + j * 60); });
    x.fillStyle = "#d9b96a"; x.font = "600 40px 'Segoe UI',sans-serif"; x.fillText("Sen de oy ver → astroyuvam.com", W / 2, 1790);
    c.toBlob(function (blob) {
      if (!blob) return; var f = null; try { f = new File([blob], "burclarin-nabzi.png", { type: "image/png" }); } catch (e) {}
      if (f && navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: "Burçların Nabzı", text: "Bugün burçlar nasıl hissediyor? astroyuvam.com" }).catch(function () {}); }
      else { var a = document.createElement("a"); a.href = URL_.createObjectURL(blob); a.download = "burclarin-nabzi.png"; document.body.appendChild(a); a.click(); setTimeout(function () { URL_.revokeObjectURL(a.href); a.remove(); }, 1500); }
      if (window.gtag) gtag("event", "burc_nabzi_kart");
    }, "image/png");
  }
  var URL_ = window.URL || window.webkitURL;
  function yuvarlak(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }

  function baslat() {
    K = $("burcNabzi"); if (!K || K.getAttribute("data-hazir")) return; K.setAttribute("data-hazir", "1");
    stil(); K.innerHTML = '<div class="bn-kart"><div class="bn-yuk">Burçların nabzı ölçülüyor…</div></div>';
    rpc("nabiz_sonuc").then(function (j) { VERI = j; ciz(); })
      .catch(function () { var s = K.closest("section"); if (s) s.style.display = "none"; else K.innerHTML = ""; });
  }
  /* Ay Defteri'nden (üye) gelen oy: aynı cihaz kimliğiyle, sessizce */
  window.AYNabiz = {
    oyVer: function (burc, hal) { return rpc("nabiz_oy", { p_cihaz: cihaz(), p_burc: burc, p_hal: hal }).then(function (j) { VERI = j; lsKoy("ay_nabiz", JSON.stringify({ g: istGun(), b: burc, h: hal })); lsKoy("ay_burc", String(burc)); if (K) ciz(); return j; }); },
    _ic: { yuzdeEk: yuzdeEk, ozet: ozet, enler: enler }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", baslat); else baslat();
})();
