/* asterna-widget.js — Astro Yuvam sağ-alt köşe yardımcı balonu "Asterna"
 * Herkese açık: site rehberi + astroloji/numeroloji sohbeti (hazır cevaplar + AI).
 * Üyeye özel: giriş yapan üye "Raporlarım"dan kendi saklı raporunu seçip birlikte analiz eder (yapıştırma YOK).
 * Backend: POST https://astro-rapor.onrender.com/api/asterna  { mesajlar, raporId, token }  +  GET /api/raporlarim
 * Tek dosya, kendine yeter; menu.js üzerinden tüm sayfalara tek satırla yüklenir.
 * Görselsiz v1 — Asterna'nın yüzü/animasyonu sonraki aşamada eklenecek.
 */
(function () {
  if (window.__asternaYuklendi) return;
  window.__asternaYuklendi = true;

  var API = "https://astro-rapor.onrender.com/api/asterna";
  var API_LISTE = "https://astro-rapor.onrender.com/api/raporlarim";
  var SUPABASE_URL = "https://htyywgmgbmzhrqtgihqd.supabase.co";
  var SUPABASE_KEY = "sb_publishable_S1Bm79ihKGNyjY7R7yIwfQ_U4K6JJYM";

  var mesajlar = [];      // {rol:"user"|"asistan", metin}
  var raporId = "";       // seçili saklı raporun id'si (analiz modunda dolu)
  var raporBaslik = "";   // seçili raporun başlığı (şeritte gösterilir)
  var raporToken = "";    // üyenin Supabase erişim jetonu (sunucu doğrulaması için)
  var bekliyor = false;   // yanıt beklenirken çift gönderimi engelle
  var acildiMi = false;
  var ilkYanitYapildi = false; // "sunucu uyanıyor" notu YALNIZCA oturumun ilk yanıtında gösterilsin

  // ---------- Sohbet hafızası: sayfa değişse de konuşma sürer ----------
  // Tarayıcıda saklanır (sunucuya gitmez). 6 saat hiç yazışılmazsa kendiliğinden temizlenir.
  var HAFIZA = "asterna_sohbet_v2", OMUR = 6 * 3600 * 1000;
  function hafizaOku() {
    try {
      var h = JSON.parse(localStorage.getItem(HAFIZA) || "null");
      if (!h || !h.t || Date.now() - h.t > OMUR) { localStorage.removeItem(HAFIZA); return null; }
      return h;
    } catch (e) { return null; }
  }
  function hafizaYaz() {
    try {
      localStorage.setItem(HAFIZA, JSON.stringify({ t: Date.now(), mesajlar: mesajlar.slice(-60), acik: panel.classList.contains("acik"),
        raporId: raporId, raporBaslik: raporBaslik, ilk: ilkYanitYapildi }));
    } catch (e) {}
  }
  function hafizaSil() { try { localStorage.removeItem(HAFIZA); } catch (e) {} }

  // ---------- Stil ----------
  var css = ''
    + '#asterna-fab{position:fixed;right:20px;bottom:20px;z-index:99998;width:62px;height:62px;border-radius:50%;'
    + 'border:none;cursor:pointer;background:radial-gradient(circle at 35% 30%,#e7cf95,#d9b96a 55%,#c9a34e);'
    + 'box-shadow:0 8px 26px rgba(0,0,0,.45),0 0 0 1px rgba(217,185,106,.35);color:#241a06;font-size:26px;'
    + 'display:flex;align-items:center;justify-content:center;transition:transform .15s;font-family:Georgia,serif}'
    + '#asterna-fab:hover{transform:scale(1.07)}'
    + '#asterna-fab .pip{position:absolute;top:-3px;right:-3px;width:16px;height:16px;border-radius:50%;background:#7c6cf0;'
    + 'border:2px solid #04060d;animation:asternaPip 1.8s ease-in-out infinite}'
    + '@keyframes asternaPip{0%,100%{opacity:.5;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}'
    + '#asterna-panel{position:fixed;right:20px;bottom:92px;z-index:99999;width:370px;max-width:calc(100vw - 32px);'
    + 'height:560px;max-height:calc(100vh - 120px);background:#04060d;border:1px solid #d9b96a;border-radius:18px;'
    + 'box-shadow:0 24px 70px rgba(0,0,0,.6);display:none;flex-direction:column;overflow:hidden;'
    + 'font-family:"Segoe UI",system-ui,sans-serif;color:#f0e6d2}'
    + '#asterna-panel.acik{display:flex}'
    + '.ast-head{padding:14px 16px;background:linear-gradient(180deg,#0e1630,#0b1020);border-bottom:1px solid #1f2942;'
    + 'display:flex;align-items:center;gap:10px}'
    + '.ast-head .ay{width:34px;height:34px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e7cf95,#d9b96a);'
    + 'display:flex;align-items:center;justify-content:center;color:#241a06;font-size:18px;flex:none}'
    + '.ast-head .ad{font-family:Georgia,serif;font-size:16px;color:#f0e6d2;line-height:1.1}'
    + '.ast-head .alt{font-size:11px;color:#a39db6}'
    + '.ast-head .yeni{margin-left:auto;background:none;border:1px solid #1f2942;border-radius:8px;color:#a39db6;font-size:15px;cursor:pointer;line-height:1;padding:5px 8px}'
    + '.ast-head .yeni:hover{color:#f0e6d2;border-color:#d9b96a}'
    + '.ast-head .kapat{margin-left:4px;background:none;border:none;color:#a39db6;font-size:22px;cursor:pointer;line-height:1;padding:4px}'
    + '.ast-head .kapat:hover{color:#f0e6d2}'
    + '.ast-akis{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:'
    + 'radial-gradient(ellipse at 50% -10%,#0c1326 0%,#04060d 60%)}'
    + '.ast-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}'
    + '.ast-msg.bot{align-self:flex-start;background:#0b1020;border:1px solid #1f2942;color:#efe7f6;border-bottom-left-radius:4px}'
    + '.ast-msg.bot strong{color:#f0e6d2;font-weight:700}'
    + '.ast-msg.bot a{color:#e7cf95;text-decoration:underline;word-break:break-word}'
    + '.ast-msg.bot a:hover{color:#f0e6d2}'
    + '.ast-msg.ben{align-self:flex-end;background:linear-gradient(180deg,#7c6cf0,#6c5ce7);color:#fff;border-bottom-right-radius:4px}'
    + '.ast-yaz{align-self:flex-start;color:#a39db6;font-size:13px;font-style:italic;padding:4px 2px}'
    + '.ast-rapor-liste{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin:4px 0 8px}'
    + '.ast-rapor-oge{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#0b1020;border:1px solid #1f2942;border-radius:10px;padding:11px 13px;cursor:pointer;color:#f0e6d2;font-family:inherit;text-align:left}'
    + '.ast-rapor-oge:hover{border-color:#d9b96a;background:rgba(217,185,106,.08)}'
    + '.ro-ad{font-size:14px}'
    + '.ro-tar{font-size:11.5px;color:#a39db6;flex:none}'
    + '.ast-rapor-serit{padding:7px 12px;font-size:12px;background:#122016;border-top:1px solid #2e5b3a;color:#a9e0b5;display:none;align-items:center;gap:8px}'
    + '.ast-rapor-serit.acik{display:flex}'
    + '.ast-rapor-serit button{margin-left:auto;background:none;border:none;color:#a39db6;cursor:pointer;font-size:12px;text-decoration:underline}'
    + '.ast-alt{border-top:1px solid #1f2942;background:#070a15;padding:8px}'
    + '.ast-cips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}'
    + '.ast-cip{background:#0b1020;border:1px solid #1f2942;border-radius:14px;padding:5px 10px;font-size:11.5px;color:#cdbff0;cursor:pointer}'
    + '.ast-cip:hover{border-color:#d9b96a;color:#f0e6d2}'
    + '.ast-giris{display:flex;gap:8px;align-items:flex-end}'
    + '.ast-giris textarea{flex:1;resize:none;max-height:96px;min-height:40px;background:#03050b;border:1px solid #1f2942;'
    + 'border-radius:10px;color:#f0e6d2;font-family:inherit;font-size:14px;padding:10px 12px;line-height:1.4}'
    + '.ast-giris textarea:focus{outline:none;border-color:#d9b96a}'
    + '.ast-gonder{flex:none;width:42px;height:42px;border-radius:10px;border:none;cursor:pointer;'
    + 'background:linear-gradient(180deg,#e7cf95,#d9b96a);color:#241a06;font-size:18px;font-weight:bold}'
    + '.ast-gonder:disabled{opacity:.5;cursor:default}'
    + '.ast-feragat{text-align:center;font-size:10.5px;color:#807b94;margin-top:7px;line-height:1.4}'
    + '.ast-feragat a{color:#a39db6}'
    + '.ast-modal{position:absolute;inset:0;background:rgba(3,5,8,.92);z-index:5;display:none;flex-direction:column;padding:18px}'
    + '.ast-modal.acik{display:flex}'
    + '.ast-modal h4{margin:0 0 6px;font-family:Georgia,serif;color:#e7cf95;font-size:16px}'
    + '.ast-modal p{margin:0 0 10px;font-size:12.5px;color:#a39db6;line-height:1.5}'
    + '.ast-modal textarea{flex:1;background:#03050b;border:1px solid #1f2942;border-radius:10px;color:#f0e6d2;'
    + 'font-family:inherit;font-size:13px;padding:10px;line-height:1.5;resize:none}'
    + '.ast-modal textarea:focus{outline:none;border-color:#d9b96a}'
    + '.ast-modal .btnsatir{display:flex;gap:8px;margin-top:10px}'
    + '.ast-modal .btnsatir button{flex:1;padding:11px;border-radius:9px;border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:bold}'
    + '.ast-modal .kaydet{background:linear-gradient(180deg,#e7cf95,#d9b96a);color:#241a06}'
    + '.ast-modal .vazgec{background:#0b1020;color:#cdbff0;border:1px solid #1f2942}'
    + '.ast-modal .giris-uyari{background:#241014;border:1px solid #6b2a35;color:#f0a9b5;border-radius:9px;padding:12px;font-size:13px;line-height:1.5}'
    + '.ast-modal .giris-uyari a{color:#e7cf95;font-weight:bold}'
    + '@media(max-width:480px){#asterna-panel{right:8px;left:8px;width:auto;bottom:84px}}body #asterna-fab{width:58px;height:58px;background:radial-gradient(circle at 50% 35%,#141a33,#070a14 70%);box-shadow:0 14px 40px rgba(0,0,0,.6),inset 0 0 0 1px rgba(217,185,106,.6),inset 0 0 18px rgba(217,185,106,.12);color:#e7cf95;font-size:22px;transition:transform .25s ease,box-shadow .25s}body #asterna-fab:hover{transform:translateY(-3px);box-shadow:0 18px 46px rgba(0,0,0,.65),inset 0 0 0 1px #e7cf95,inset 0 0 22px rgba(217,185,106,.22)}body #asterna-fab .pip{top:3px;right:3px;width:10px;height:10px;background:#e7cf95;border:2px solid #070a14}@media(min-width:900px){body #asterna-fab{width:auto;height:54px;border-radius:999px;padding:0 22px 0 18px;gap:10px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}body #asterna-fab::after{content:"Asterna\'ya sor";font-size:14.5px;font-weight:600;letter-spacing:.02em;color:#f0e6d2}body #asterna-fab .pip{top:-2px;right:10px}}body #asterna-panel{width:392px;height:600px;background:#070a14;border:1px solid rgba(217,185,106,.3);border-radius:22px;box-shadow:0 40px 110px rgba(0,0,0,.75);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#f0e6d2}body #asterna-panel .ast-head{padding:18px 18px 16px;background:none;border-bottom:1px solid rgba(240,230,210,.1);gap:12px}body #asterna-panel .ast-head .ay{width:40px;height:40px;background:radial-gradient(circle at 50% 35%,#141a33,#070a14 70%);box-shadow:inset 0 0 0 1px rgba(217,185,106,.6);color:#e7cf95;font-size:17px}body #asterna-panel .ast-head .ad{font-size:18px;letter-spacing:.01em}body #asterna-panel .ast-head .alt{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#aaa5ba;margin-top:4px}body #asterna-panel .ast-head .yeni{border:1px solid rgba(240,230,210,.1);border-radius:50%;width:36px;height:36px;padding:0;color:#aaa5ba}body #asterna-panel .ast-head .kapat{width:36px;height:36px;padding:0;color:#aaa5ba}body #asterna-panel .ast-akis{padding:18px;gap:14px;background:radial-gradient(90% 50% at 50% 0,rgba(22,44,88,.32),transparent 70%)}body #asterna-panel .ast-msg{font-size:14.5px;line-height:1.6;padding:12px 15px;border-radius:18px}body #asterna-panel .ast-msg.bot{background:rgba(240,230,210,.055);border:1px solid rgba(240,230,210,.1);color:#e9e2d6;border-bottom-left-radius:6px}body #asterna-panel .ast-msg.ben{background:linear-gradient(180deg,#ecd6a0,#d9b96a);color:#17120a;border-bottom-right-radius:6px}body #asterna-panel .ast-yaz{color:#aaa5ba}body #asterna-panel .ast-alt{border-top:1px solid rgba(240,230,210,.1);background:#05070f;padding:12px 12px 10px}body #asterna-panel .ast-cips{gap:7px;margin-bottom:10px}body #asterna-panel .ast-cip{background:none;border:1px solid rgba(240,230,210,.1);border-radius:999px;padding:7px 12px;font-size:12.5px;color:#d5cfde}body #asterna-panel .ast-cip:hover{border-color:#d9b96a;color:#e7cf95}body #asterna-panel .ast-giris textarea{background:#03050b;border:1px solid rgba(240,230,210,.1);border-radius:16px;padding:12px 14px;min-height:46px;font-size:15px}body #asterna-panel .ast-giris textarea:focus{border-color:#d9b96a}body #asterna-panel .ast-gonder{width:46px;height:46px;border-radius:50%;background:linear-gradient(180deg,#ecd6a0,#d4b262);font-size:16px}body #asterna-panel .ast-feragat{color:#8b8698;font-size:11px;margin-top:9px}body #asterna-panel .ast-rapor-oge{background:rgba(240,230,210,.04);border:1px solid rgba(240,230,210,.1);border-radius:14px}@media(max-width:480px){body #asterna-panel{left:8px;right:8px;width:auto;bottom:8px;height:min(82vh,640px);max-height:none;border-radius:22px}}/*ay-asterna-2*/';

  var stil = document.createElement("style");
  stil.textContent = css;
  document.head.appendChild(stil);

  // ---------- HTML ----------
  var fab = document.createElement("button");
  fab.id = "asterna-fab";
  fab.setAttribute("aria-label", "Asterna yardımcısını aç");
  fab.innerHTML = '<span>✦</span><span class="pip"></span>';
  document.body.appendChild(fab);

  var panel = document.createElement("div");
  panel.id = "asterna-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Asterna sohbet");
  panel.innerHTML = ''
    + '<div class="ast-head">'
    +   '<div class="ay">✦</div>'
    +   '<div><div class="ad">Asterna</div><div class="alt">Astroloji &amp; numeroloji uzmanın</div></div>'
    +   '<button class="yeni" aria-label="Yeni sohbet başlat" title="Yeni sohbet">↺</button>'
    +   '<button class="kapat" aria-label="Kapat">×</button>'
    + '</div>'
    + '<div class="ast-akis" id="ast-akis"></div>'
    + '<div class="ast-rapor-serit" id="ast-rapor-serit">📄 Rapor analiz modu açık <button id="ast-rapor-kaldir">kaldır</button></div>'
    + '<div class="ast-alt">'
    +   '<div class="ast-cips" id="ast-cips"></div>'
    +   '<div class="ast-giris">'
    +     '<textarea id="ast-metin" rows="1" placeholder="Bir şey sor…" aria-label="Mesajın"></textarea>'
    +     '<button class="ast-gonder" id="ast-gonder" aria-label="Gönder">➤</button>'
    +   '</div>'
    +   '<div class="ast-feragat">Asterna sembolik rehberlik sunar; kesin kehanet değildir. Karar her zaman senindir.</div>'
    + '</div>'
    + '<div class="ast-modal" id="ast-modal"></div>';
  document.body.appendChild(panel);

  var akis = panel.querySelector("#ast-akis");
  var metin = panel.querySelector("#ast-metin");
  var gonderBtn = panel.querySelector("#ast-gonder");
  var cipsKutu = panel.querySelector("#ast-cips");
  var raporSerit = panel.querySelector("#ast-rapor-serit");
  var modal = panel.querySelector("#ast-modal");

  var CIPLER = ["Hangi rapor bana uygun?", "📄 Raporlarım", "Ücretsiz araçlar neler?", "Yükselen burcum ne demek?"];

  // ---------- Yardımcılar ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  // Bot mesajını güvenli göster: önce kaçışla, sonra **kalın** ve https linklerini biçimle.
  function hedef(href) { return /^https?:\/\/(www\.)?astroyuvam\.com(\/|$)/i.test(href) ? "" : ' target="_blank" rel="noopener"'; }
  function linkify(s) {
    var e = escapeHtml(s);
    // 1) Markdown bağlantı [metin](adres) — metin **kalın** içerebilir; kalın adın kendisi tıklanabilir olur.
    e = e.replace(/\[([^\]]+)\]\(\s*((?:https?:\/\/|www\.|astroyuvam\.com)[^\s)]+)\s*\)/gi, function (m, txt, url) {
      var href = /^https?:\/\//i.test(url) ? url : "https://" + url;
      var inner = txt.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      return '<a href="' + href + '"' + hedef(href) + '>' + inner + "</a>";
    });
    // 2) Kalan **kalın** → <strong>
    e = e.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // 3) Çıplak adresler — https://, www. ve ŞEMASIZ astroyuvam.com/... dahil. Mevcut <a> bloklarına dokunma.
    var parts = e.split(/(<a\b[^>]*>[\s\S]*?<\/a>)/gi);
    var re = /((?:https?:\/\/|www\.)[^\s<]+|astroyuvam\.com(?:\/[^\s<]*)?)/gi;
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 1) continue; // <a>...</a> bloğu → atla
      parts[i] = parts[i].replace(re, function (u) {
        var tail = "", m2 = u.match(/[.,;:!?)\]]+$/);
        if (m2) { tail = m2[0]; u = u.slice(0, -tail.length); }
        var href = /^https?:\/\//i.test(u) ? u : "https://" + u;
        return '<a href="' + href + '"' + hedef(href) + '>' + u + "</a>" + tail;
      });
    }
    return parts.join("");
  }
  function ekle(rol, txt) {
    var d = document.createElement("div");
    d.className = "ast-msg " + (rol === "user" ? "ben" : "bot");
    if (rol === "user") { d.textContent = txt; } else { d.innerHTML = linkify(txt); }
    akis.appendChild(d);
    akis.scrollTop = akis.scrollHeight;
    return d;
  }
  // Aşamalı, çeşitli "düşünme" yazıları — her ~2.4 sn'de biri değişir; tek tip/statik değil.
  var DUSUNME_SOZLERI = [
    "Asterna düşünüyor…",
    "Analiz ediyor…",
    "Cevabını hazırlıyor…",
    "Düşüncelerini topluyor…",
    "Yıldız haritasını tarıyor…"
  ];
  function yaziyorGoster() {
    var d = document.createElement("div");
    d.className = "ast-yaz";
    d.id = "ast-yaziyor";
    d.textContent = DUSUNME_SOZLERI[0];
    akis.appendChild(d);
    akis.scrollTop = akis.scrollHeight;
    // Yazıları aşamalı döndür (2-3 sn'de bir yeni ibare) — daha canlı, daha gerçekçi.
    var i = 0;
    d.__rot = setInterval(function () {
      if (!d.isConnected) return;
      i = (i + 1) % DUSUNME_SOZLERI.length;
      d.textContent = DUSUNME_SOZLERI[i];
    }, 2400);
    return d;
  }
  function yaziyorGizle() {
    var d = panel.querySelector("#ast-yaziyor");
    if (d) { if (d.__t) clearTimeout(d.__t); if (d.__rot) clearInterval(d.__rot); d.remove(); }
  }
  function ciplerCiz() {
    cipsKutu.innerHTML = "";
    CIPLER.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "ast-cip";
      b.textContent = c;
      b.onclick = function () {
        if (c === "📄 Raporlarım") { raporModalAc(); return; }
        metin.value = c; gonder();
      };
      cipsKutu.appendChild(b);
    });
  }

  // Sunucuya giden geçmiş: karşılama mesajı hariç son 20 mesaj; ilk mesaj her zaman kullanıcıdan olmalı.
  function gidecek() {
    var l = mesajlar.filter(function (m) { return !m.karsilama; }).slice(-20).map(function (m) { return { rol: m.rol, metin: m.metin }; });
    while (l.length && l[0].rol !== "user") l.shift();
    return l;
  }
  // ---------- Gönderme ----------
  function gonder() {
    var txt = (metin.value || "").trim();
    if (!txt || bekliyor) return;
    ekle("user", txt);
    mesajlar.push({ rol: "user", metin: txt }); hafizaYaz();
    metin.value = ""; metin.style.height = "auto";
    bekliyor = true; gonderBtn.disabled = true;
    var y = yaziyorGoster();

    // Genel sohbette de giriş yapmış üyenin jetonu gönderilir; sunucu yalnızca doğrulayıp kurucu hesabını tanır.
    // Giriş izi yoksa (çoğu ziyaretçi) hiçbir kütüphane yüklenmez, ek istek atılmaz.
    var genelToken = "";
    (raporId && !raporToken ? oturumAl().then(function (o) { if (o) raporToken = o.token; })
      : (!raporId && girisIziVar() ? oturumAl().then(function (o) { if (o) genelToken = o.token; }) : Promise.resolve()))
    .then(function () { return fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(raporId ? { mesajlar: gidecek(), raporId: raporId, token: raporToken }
        : (genelToken ? { mesajlar: gidecek(), token: genelToken } : { mesajlar: gidecek() }))
    }); })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (data) {
        yaziyorGizle();
        var cevap = (data && (data.cevap || data.mesaj)) || "Şu an yanıt veremedim, birazdan tekrar dener misin? ✦";
        ekle("asistan", cevap);
        mesajlar.push({ rol: "asistan", metin: cevap });
        ilkYanitYapildi = true; hafizaYaz();
      })
      .catch(function () {
        yaziyorGizle();
        ekle("asistan", "Bağlantıda bir sorun oldu, birazdan tekrar dener misin? ✦");
      })
      .finally(function () { ilkYanitYapildi = true; bekliyor = false; gonderBtn.disabled = false; metin.focus(); });
  }

  gonderBtn.onclick = gonder;
  metin.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); gonder(); }
  });
  metin.addEventListener("input", function () {
    metin.style.height = "auto";
    metin.style.height = Math.min(metin.scrollHeight, 96) + "px";
  });

  // ---------- Raporlarım (üyeye özel, GÜVENLİ) — kendi saklı raporunu seç, birlikte analiz et ----------
  // GÜVENLİK: Yapıştırma YOK. Üye giriş yapar → sunucu jetonu doğrular → yalnızca KENDİ raporları listelenir
  // ve seçilen rapor sunucuda sahiplik kontrolünden geçirilip analiz edilir. Başkasının/dışarıdan metin giremez.
  var supabaseHazir = null;
  function supabaseYukle() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
    if (supabaseHazir) return supabaseHazir;
    supabaseHazir = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = function () { resolve(window.supabase); };
      s.onerror = function () { reject(new Error("supabase yüklenemedi")); };
      document.head.appendChild(s);
    });
    return supabaseHazir;
  }
  // Tarayıcıda Supabase oturum izi var mı? (kütüphane yüklemeden, yalnızca localStorage'a bakar)
  function girisIziVar() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && /^sb-.*-auth-token$/.test(k)) return true;
      }
    } catch (e) {}
    return false;
  }
  function oturumAl() {
    return supabaseYukle().then(function (sup) {
      var sb = window.__asternaSb || sup.createClient(SUPABASE_URL, SUPABASE_KEY);
      window.__asternaSb = sb;
      return sb.auth.getSession().then(function (res) {
        var sess = res && res.data && res.data.session;
        return sess ? { user: sess.user, token: sess.access_token || "" } : null;
      });
    }).catch(function () { return null; });
  }
  function raporModalKapat() { modal.classList.remove("acik"); modal.innerHTML = ""; }
  function raporKaldir() {
    raporId = ""; raporBaslik = ""; raporSerit.classList.remove("acik"); raporSerit.innerHTML = ""; hafizaYaz();
    ekle("asistan", "Rapor analiz modundan çıktık. Dilersen başka bir rapor seçebilir ya da genel sorularını sorabilirsin. ✦");
  }
  function raporSec(id, ad) {
    raporId = id; raporBaslik = ad;
    raporSerit.innerHTML = '📄 ' + escapeHtml(ad) + ' — analiz modu <button id="ast-rapor-kaldir">kaldır</button>';
    raporSerit.classList.add("acik");
    raporSerit.querySelector("#ast-rapor-kaldir").onclick = raporKaldir;
    raporModalKapat();
    ekle("asistan", ad + " raporunu birlikte inceleyebiliriz ✦ Merak ettiğin bölümü sorabilir ya da 'genel bir değerlendirme yapar mısın?' diyebilirsin.");
    mesajlar.push({ rol: "asistan", metin: ad + " raporu analiz moduna alındı." }); hafizaYaz();
  }
  function raporModalAc() {
    modal.innerHTML = '<p style="color:#a39db6;font-size:13px">Kontrol ediliyor…</p>';
    modal.classList.add("acik");
    oturumAl().then(function (o) {
      if (!o) {
        modal.innerHTML = ''
          + '<h4>Raporlarım — üyelere özel</h4>'
          + '<div class="giris-uyari">Raporlarını görmek ve birlikte analiz etmek için giriş yapman gerekiyor. '
          + 'Güvenlik için yalnızca bizden aldığın, hesabına tanımlı raporları inceleyebilirsin.</div>'
          + '<div class="btnsatir">'
          +   '<button class="kaydet" onclick="location.href=\'/giris.html\'">Giriş yap / Üye ol</button>'
          +   '<button class="vazgec" id="ast-modal-kapat">Vazgeç</button>'
          + '</div>';
        modal.querySelector("#ast-modal-kapat").onclick = raporModalKapat;
        return;
      }
      raporToken = o.token;
      modal.innerHTML = '<p style="color:#a39db6;font-size:13px">Raporların getiriliyor…</p>';
      fetch(API_LISTE, { headers: { Authorization: "Bearer " + o.token } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (data) {
          var liste = (data && data.raporlar) || [];
          if (!liste.length) {
            modal.innerHTML = ''
              + '<h4>Henüz raporun yok</h4>'
              + '<p>Bu hesaba tanımlı bir rapor bulamadım. Bizden rapor aldıysan, siparişte kullandığın e-posta ile giriş yaptığından emin ol. Yeni bir rapor için sana en uygununu bulmakta yardımcı olabilirim.</p>'
              + '<div class="btnsatir">'
              +   '<button class="kaydet" onclick="location.href=\'/#cards\'">Raporlara göz at</button>'
              +   '<button class="vazgec" id="ast-modal-kapat">Kapat</button>'
              + '</div>';
            modal.querySelector("#ast-modal-kapat").onclick = raporModalKapat;
            return;
          }
          var satirlar = liste.map(function (rp) {
            var tarih = ""; try { tarih = new Date(rp.created_at).toLocaleDateString("tr-TR"); } catch (e) {}
            var ad = rp.baslik || rp.tip || "Rapor";
            return '<button class="ast-rapor-oge" data-id="' + escapeHtml(rp.id) + '" data-ad="' + escapeHtml(ad) + '">'
                 + '<span class="ro-ad">' + escapeHtml(ad) + '</span><span class="ro-tar">' + escapeHtml(tarih) + '</span></button>';
          }).join("");
          modal.innerHTML = ''
            + '<h4>Raporlarım</h4>'
            + '<p>Birlikte incelemek istediğin raporu seç:</p>'
            + '<div class="ast-rapor-liste">' + satirlar + '</div>'
            + '<div class="btnsatir"><button class="vazgec" id="ast-modal-kapat">Vazgeç</button></div>';
          modal.querySelector("#ast-modal-kapat").onclick = raporModalKapat;
          Array.prototype.forEach.call(modal.querySelectorAll(".ast-rapor-oge"), function (b) {
            b.onclick = function () { raporSec(b.getAttribute("data-id"), b.getAttribute("data-ad")); };
          });
        })
        .catch(function () {
          modal.innerHTML = '<h4>Bir sorun oldu</h4><p>Raporların şu an getirilemedi, birazdan tekrar dene.</p>'
            + '<div class="btnsatir"><button class="vazgec" id="ast-modal-kapat">Kapat</button></div>';
          modal.querySelector("#ast-modal-kapat").onclick = raporModalKapat;
        });
    });
  }

  // ---------- Aç/Kapat ----------
  function ilkKarsilama() {
    if (mesajlar.length) return;
    var k = "Merhaba, ben Asterna ✦ Astroloji ve numerolojinin her dalında uzmanınım — Astro Yuvam'ın raporları ve araçlarıyla beslendim. Merak ettiğin bir kavramı açıklayabilir, sana en uygun okumayı birlikte bulabilir ya da ücretsiz araçlarda yol gösterebilirim. Üyeysen kendi raporunu satır satır inceleyebiliriz. Aklında ne var?\n\n✦ Beni neden kullanmalısın, neler yapabilirim? İstersen önce kısaca tanışalım: https://astroyuvam.com/asterna.html";
    ekle("asistan", k); mesajlar.push({ rol: "asistan", metin: k, karsilama: true }); hafizaYaz();
  }
  function ac() {
    panel.classList.add("acik"); acildiMi = true;
    ciplerCiz(); ilkKarsilama();
    setTimeout(function () { metin.focus(); }, 100);
  }
  function kapat() { panel.classList.remove("acik"); hafizaYaz(); }
  fab.onclick = function () { panel.classList.contains("acik") ? kapat() : ac(); };
  panel.querySelector(".kapat").onclick = kapat;
  panel.querySelector(".yeni").onclick = function () {
    mesajlar = []; raporId = ""; raporBaslik = ""; raporToken = "";
    raporSerit.classList.remove("acik"); raporSerit.innerHTML = ""; akis.innerHTML = "";
    hafizaSil(); ilkKarsilama(); hafizaYaz(); metin.focus();
  };
  // Önceki sayfadaki sohbeti geri getir
  (function geriYukle() {
    var h = hafizaOku(); if (!h || !h.mesajlar || !h.mesajlar.length) return;
    mesajlar = h.mesajlar; ilkYanitYapildi = !!h.ilk;
    mesajlar.forEach(function (m) { ekle(m.rol === "user" ? "user" : "asistan", m.metin); });
    if (h.raporId) {
      raporId = h.raporId; raporBaslik = h.raporBaslik || "Rapor";
      raporSerit.innerHTML = '📄 ' + escapeHtml(raporBaslik) + ' — analiz modu <button id="ast-rapor-kaldir">kaldır</button>';
      raporSerit.classList.add("acik"); raporSerit.querySelector("#ast-rapor-kaldir").onclick = raporKaldir;
    }
    if (h.acik) { panel.classList.add("acik"); acildiMi = true; ciplerCiz(); setTimeout(function () { akis.scrollTop = akis.scrollHeight; }, 50); }
  })();
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("acik")) kapat(); });
})();
