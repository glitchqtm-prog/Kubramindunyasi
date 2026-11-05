/* zaman-kapsulu.js — Kozmik Panel: "Kozmik Zaman Kapsülü" (yalnızca üyeler).
 * Ay büyürken (Yeni Ay → Dolunay) üye bu döngü için bir niyet yazar ve mühürler; kapsül Dolunay günü açılır.
 * İstenirse Dolunay sabahı e-postayla hatırlatılır (sunucu: lib/ozel-epostalar.js). Açılınca üye niyetini işaretler.
 * Tarihler Türkiye saatiyle; Ay evreleri cihazda gerçek gökyüzünden (astronomy-engine) hesaplanır.
 * panelim.html, panel açılınca window.AYKapsul.baslat(ctx) çağırır. */
(function () {
  "use strict";
  var AYL = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  var BN = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
  var DURUM = { gerceklesti: ["🌕", "Gerçekleşti"], yolda: ["🌓", "Yolda"], vazgectim: ["🍃", "Artık istemiyorum"] };
  var C = null, L = [];
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ist(d) { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(d); } catch (e) { return new Date(d.getTime() + 3 * 3600e3).toISOString().slice(0, 10); } }
  function tr(k) { var p = k.split("-"); return +p[2] + " " + AYL[+p[1] - 1]; }
  function gunFark(a, b) { return Math.round((new Date(b + "T12:00:00Z") - new Date(a + "T12:00:00Z")) / 864e5); }

  /* Bu döngü: son Yeni Ay ve ondan sonraki Dolunay; bir sonraki Yeni Ay */
  function dongu() {
    var A = C.A, simdi = new Date();
    var yeni = A.SearchMoonPhase(0, new Date(simdi.getTime() - 31 * 864e5), 31), son = yeni;
    while (yeni && yeni.date <= simdi) { son = yeni; yeni = A.SearchMoonPhase(0, new Date(yeni.date.getTime() + 864e5), 31); }
    var dolu = A.SearchMoonPhase(180, son.date, 20);
    var ml = C.lon("Moon", son.date), ev = C.evBul(C.N, ml);
    return { yeniay: ist(son.date), dolunay: ist(dolu.date), sonraki: ist(yeni.date), bugun: ist(simdi), burc: BN[Math.floor(((ml % 360) + 360) % 360 / 30)], ev: ev };
  }

  function stil() {
    if ($("zk-stil")) return;
    var s = document.createElement("style"); s.id = "zk-stil";
    s.textContent =
      ".zk{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:14px}@media(max-width:820px){.zk{grid-template-columns:1fr}}" +
      ".zk-kart{background:radial-gradient(ellipse at 0% 100%,rgba(217,185,106,.12),transparent 55%),linear-gradient(180deg,rgba(36,28,61,.8),rgba(28,23,51,.8));border:1px solid var(--line);border-radius:20px;padding:18px}" +
      ".zk-kart h3{font-family:Georgia,serif;font-weight:600;font-size:21px;margin:0 0 4px;color:var(--cream)}" +
      ".zk-alt{font-size:13px;color:var(--muted);margin:0 0 12px}" +
      ".zk textarea{width:100%;min-height:96px;resize:vertical;background:#120e1e;color:var(--cream);border:1px solid rgba(217,185,106,.4);border-radius:12px;padding:11px 12px;font:15px/1.5 'Segoe UI',system-ui,sans-serif;box-sizing:border-box}" +
      ".zk-sat{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:10px}" +
      ".zk-sat label{font-size:13px;color:var(--muted);display:flex;align-items:center;gap:6px}" +
      ".zk-durum{font-size:13px;color:var(--gold-soft);margin-top:8px}.zk-durum:empty{display:none}" +
      ".zk-muhur{display:flex;gap:16px;align-items:center}" +
      ".zk-muhur svg{width:92px;height:92px;flex:none}" +
      ".zk-gizli{margin-top:12px;background:rgba(20,16,31,.6);border:1px dashed rgba(217,185,106,.35);border-radius:12px;padding:12px;color:var(--muted);font-size:14px;filter:blur(.2px);letter-spacing:2px}" +
      ".zk-not{font-family:Georgia,serif;font-style:italic;font-size:18px;line-height:1.5;color:var(--cream);background:rgba(217,185,106,.08);border:1px solid rgba(217,185,106,.3);border-radius:14px;padding:14px 16px;margin:10px 0}" +
      ".zk-sec{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}" +
      ".zk-sec button{appearance:none;cursor:pointer;background:rgba(20,16,31,.6);border:1px solid var(--line);color:var(--cream);border-radius:14px;padding:8px 12px;font:13.5px 'Segoe UI',system-ui,sans-serif}" +
      ".zk-sec button.on{border-color:var(--gold);background:linear-gradient(180deg,rgba(217,185,106,.22),rgba(28,23,51,.9))}" +
      ".zk-gecmis{list-style:none;margin:0;padding:0}" +
      ".zk-gecmis li{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--line);font-size:13.5px}" +
      ".zk-gecmis li:last-child{border-bottom:none}" +
      ".zk-gecmis time{flex:none;width:58px;color:var(--gold-soft);font-size:12.5px}" +
      ".zk-gecmis em{font-style:normal;color:#e2d9ee}.zk-gecmis small{display:block;color:var(--muted);font-size:12px;margin-top:2px}" +
      ".zk-geri{font-family:Georgia,serif;font-size:40px;line-height:1;color:var(--gold-soft)}";
    document.head.appendChild(s);
  }

  function muhurSVG(acik) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="zkG" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#f3dc9c"/><stop offset="60%" stop-color="#c99a3f"/><stop offset="100%" stop-color="#7b5a1e"/></radialGradient></defs>' +
      '<circle cx="50" cy="50" r="40" fill="url(#zkG)"/><circle cx="50" cy="50" r="31" fill="none" stroke="#7b5a1e" stroke-width="1.5" stroke-dasharray="2 3"/>' +
      (acik ? '<circle cx="50" cy="50" r="15" fill="#fff7dc"/>' : '<path d="M56 34a17 17 0 1 0 0 32a13 13 0 1 1 0-32z" fill="#5b4214"/>') + '</svg>';
  }

  function yukle() {
    return C.sb.from("zaman_kapsulu").select("id,yeniay,ac_tarih,niyet,bildirim,durum").order("yeniay", { ascending: false }).limit(24).then(function (r) {
      if (r.error) throw r.error; L = r.data || [];
    });
  }

  function ciz() {
    var k = $("zkBolum"); if (!k) return;
    var D = dongu(), bu = L.filter(function (x) { return x.yeniay === D.yeniay; })[0] || null, buyuyor = D.bugun < D.dolunay;
    var sol;
    if (bu && D.bugun < bu.ac_tarih) {
      var kalan = gunFark(D.bugun, bu.ac_tarih);
      sol = '<div class="zk-kart"><div class="zk-muhur">' + muhurSVG(false) + '<div><h3>Kapsülün mühürlendi</h3><p class="zk-alt" style="margin:0">' + tr(bu.ac_tarih) + ' Dolunay\'ında açılacak.</p><div class="zk-geri">' + kalan + '<span style="font-size:15px;color:var(--muted)"> gün kaldı</span></div></div></div>' +
        '<div class="zk-gizli" aria-label="Mühürlü not">✦ ✦ ✦  mühürlü  ✦ ✦ ✦</div>' +
        '<p class="zk-alt" style="margin:10px 0 0">' + (bu.bildirim ? "Dolunay sabahı sana e-postayla hatırlatacağız." : "Dolunay günü paneline uğradığında açılmış olacak.") + '</p></div>';
    } else if (bu) {
      sol = '<div class="zk-kart"><div class="zk-muhur">' + muhurSVG(true) + '<div><h3>Kapsülün açıldı 🌕</h3><p class="zk-alt" style="margin:0">' + tr(bu.yeniay) + ' Yeni Ay\'ında kendine şunu yazmıştın:</p></div></div>' +
        '<div class="zk-not">“' + esc(bu.niyet) + '”</div><p class="zk-alt" style="margin:0">Peki ne oldu?</p>' +
        '<div class="zk-sec" id="zkSec">' + Object.keys(DURUM).map(function (d) { return '<button type="button" data-d="' + d + '"' + (bu.durum === d ? ' class="on"' : "") + '>' + DURUM[d][0] + " " + DURUM[d][1] + '</button>'; }).join("") + '</div>' +
        '<div class="zk-durum" id="zkDurum"></div>' +
        '<p class="zk-alt" style="margin:12px 0 0">Bir sonraki Yeni Ay ' + tr(D.sonraki) + '; o gün yeni bir kapsül mühürleyebilirsin.</p></div>';
    } else if (buyuyor) {
      sol = '<div class="zk-kart"><h3>Bu Yeni Ay\'ın niyeti</h3><p class="zk-alt">Ay ' + tr(D.yeniay) + '\'de ' + D.burc + ' burcunda, senin ' + D.ev + '. evinde yenilendi. Bu döngü için kendine bir not bırak; ' + tr(D.dolunay) + ' Dolunay\'ında kapsülün açılsın.</p>' +
        '<textarea id="zkNiyet" maxlength="280" placeholder="Örn. Bu ay her sabah 10 dakika yürüyeceğim. / Ona içimdekini söyleyeceğim." aria-label="Niyetin"></textarea>' +
        '<div class="zk-sat"><label><input type="checkbox" id="zkBil" checked> Dolunay sabahı e-postayla hatırlat</label><button class="btn" type="button" id="zkMuhurle">🌑 Kapsülü mühürle</button></div>' +
        '<div class="zk-durum" id="zkDurum"></div></div>';
    } else {
      sol = '<div class="zk-kart"><h3>Bir sonraki kapsül ' + tr(D.sonraki) + '</h3><p class="zk-alt">Ay şu an küçülüyor; bu dönem bırakma ve toparlanma zamanı. ' + tr(D.sonraki) + ' Yeni Ay\'ında yeni bir niyet yazıp kapsülünü mühürleyebilirsin.</p><div class="zk-geri">' + gunFark(D.bugun, D.sonraki) + '<span style="font-size:15px;color:var(--muted)"> gün sonra</span></div></div>';
    }
    var gecmis = L.filter(function (x) { return x.yeniay !== D.yeniay && x.ac_tarih <= D.bugun; }).slice(0, 6);
    var sag = '<div class="zk-kart"><h3 style="font-size:18px">Geçmiş kapsüllerin</h3>' + (gecmis.length ? '<ul class="zk-gecmis">' + gecmis.map(function (x) {
      return '<li><time>' + tr(x.yeniay) + '</time><div><em>“' + esc(x.niyet) + '”</em><small>' + (x.durum ? DURUM[x.durum][0] + " " + DURUM[x.durum][1] : "işaretlenmedi") + '</small></div></li>'; }).join("") + '</ul>'
      : '<p class="zk-alt" style="margin:0">Her Yeni Ay bir kapsül. Zamanla burada kendi niyetlerinin ve neyin gerçekleştiğinin bir arşivi oluşacak.</p>') + '</div>';
    k.innerHTML = '<div class="bolum-b"><h2>Kozmik Zaman Kapsülü</h2><span>Yeni Ay\'da niyetini mühürle, Dolunay\'da açılsın</span></div><div class="zk">' + sol + sag + '</div>';
    k.classList.remove("gizli");
    bagla(D, bu);
    if (/^#(zkBolum|kapsul)$/.test(location.hash) && !ciz.kaydi) { ciz.kaydi = 1; setTimeout(function () { k.scrollIntoView({ behavior: "smooth", block: "start" }); }, 300); }
  }

  function bagla(D, bu) {
    if ($("zkMuhurle")) $("zkMuhurle").onclick = function () {
      var n = $("zkNiyet").value.trim(), b = this;
      if (n.length < 3) { $("zkDurum").textContent = "Önce kısa bir niyet yaz."; return; }
      b.disabled = true; $("zkDurum").textContent = "Mühürleniyor…";
      C.sb.from("zaman_kapsulu").insert({ user_id: C.kullanici.id, yeniay: D.yeniay, ac_tarih: D.dolunay, niyet: n.slice(0, 280), bildirim: $("zkBil").checked }).then(function (r) {
        if (r.error) { b.disabled = false; $("zkDurum").textContent = "Mühürlenemedi, tekrar dener misin?"; return; }
        if (window.gtag) gtag("event", "zaman_kapsulu_muhur");
        return yukle().then(ciz);
      });
    };
    if ($("zkSec")) $("zkSec").onclick = function (ev) {
      var b = ev.target.closest("button[data-d]"); if (!b || !bu) return; var d = b.getAttribute("data-d");
      $("zkDurum").textContent = "Kaydediliyor…";
      C.sb.from("zaman_kapsulu").update({ durum: d }).eq("id", bu.id).then(function (r) {
        if (r.error) { $("zkDurum").textContent = "Kaydedilemedi, tekrar dener misin?"; return; }
        bu.durum = d; ciz(); $("zkDurum").textContent = d === "gerceklesti" ? "Ne güzel! Bunu kutla ✦" : d === "yolda" ? "Yolda olmak da bir adım. Bir sonraki Yeni Ay'da devam edebilirsin." : "Bırakmak da bir karar. Yerine ne gelsin, bir sonraki Yeni Ay'da yaz.";
      });
    };
  }

  window.AYKapsul = { baslat: function (ctx) {
    C = ctx; if (!C || !C.sb || !C.kullanici || !C.A) return;
    stil(); yukle().then(ciz).catch(function (e) { if (window.console) console.warn("zaman-kapsulu", e && e.message); });
  }, _ic: { dongu: dongu, ctx: function (c) { C = c; }, liste: function (x) { L = x; }, ciz: ciz } };
})();
