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

  // ---------- Stil ----------
  var css = ''
    + '#asterna-fab{position:fixed;right:20px;bottom:20px;z-index:99998;width:62px;height:62px;border-radius:50%;'
    + 'border:none;cursor:pointer;background:radial-gradient(circle at 35% 30%,#e7cf95,#d9b96a 55%,#c9a34e);'
    + 'box-shadow:0 8px 26px rgba(0,0,0,.45),0 0 0 1px rgba(217,185,106,.35);color:#241a06;font-size:26px;'
    + 'display:flex;align-items:center;justify-content:center;transition:transform .15s;font-family:Georgia,serif}'
    + '#asterna-fab:hover{transform:scale(1.07)}'
    + '#asterna-fab .pip{position:absolute;top:-3px;right:-3px;width:16px;height:16px;border-radius:50%;background:#7c6cf0;'
    + 'border:2px solid #14101f;animation:asternaPip 1.8s ease-in-out infinite}'
    + '@keyframes asternaPip{0%,100%{opacity:.5;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}'
    + '#asterna-panel{position:fixed;right:20px;bottom:92px;z-index:99999;width:370px;max-width:calc(100vw - 32px);'
    + 'height:560px;max-height:calc(100vh - 120px);background:#14101f;border:1px solid #d9b96a;border-radius:18px;'
    + 'box-shadow:0 24px 70px rgba(0,0,0,.6);display:none;flex-direction:column;overflow:hidden;'
    + 'font-family:"Segoe UI",system-ui,sans-serif;color:#f0e6d2}'
    + '#asterna-panel.acik{display:flex}'
    + '.ast-head{padding:14px 16px;background:linear-gradient(180deg,#241c3d,#1c1733);border-bottom:1px solid #332a4d;'
    + 'display:flex;align-items:center;gap:10px}'
    + '.ast-head .ay{width:34px;height:34px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e7cf95,#d9b96a);'
    + 'display:flex;align-items:center;justify-content:center;color:#241a06;font-size:18px;flex:none}'
    + '.ast-head .ad{font-family:Georgia,serif;font-size:16px;color:#f0e6d2;line-height:1.1}'
    + '.ast-head .alt{font-size:11px;color:#9a8fb8}'
    + '.ast-head .kapat{margin-left:auto;background:none;border:none;color:#9a8fb8;font-size:22px;cursor:pointer;line-height:1;padding:4px}'
    + '.ast-head .kapat:hover{color:#f0e6d2}'
    + '.ast-akis{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:'
    + 'radial-gradient(ellipse at 50% -10%,#1d1533 0%,#14101f 60%)}'
    + '.ast-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}'
    + '.ast-msg.bot{align-self:flex-start;background:#1c1733;border:1px solid #332a4d;color:#efe7f6;border-bottom-left-radius:4px}'
    + '.ast-msg.bot strong{color:#f0e6d2;font-weight:700}'
    + '.ast-msg.bot a{color:#e7cf95;text-decoration:underline;word-break:break-word}'
    + '.ast-msg.bot a:hover{color:#f0e6d2}'
    + '.ast-msg.ben{align-self:flex-end;background:linear-gradient(180deg,#7c6cf0,#6c5ce7);color:#fff;border-bottom-right-radius:4px}'
    + '.ast-yaz{align-self:flex-start;color:#9a8fb8;font-size:13px;font-style:italic;padding:4px 2px}'
    + '.ast-rapor-liste{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin:4px 0 8px}'
    + '.ast-rapor-oge{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#1c1733;border:1px solid #332a4d;border-radius:10px;padding:11px 13px;cursor:pointer;color:#f0e6d2;font-family:inherit;text-align:left}'
    + '.ast-rapor-oge:hover{border-color:#d9b96a;background:rgba(217,185,106,.08)}'
    + '.ro-ad{font-size:14px}'
    + '.ro-tar{font-size:11.5px;color:#9a8fb8;flex:none}'
    + '.ast-rapor-serit{padding:7px 12px;font-size:12px;background:#122016;border-top:1px solid #2e5b3a;color:#a9e0b5;display:none;align-items:center;gap:8px}'
    + '.ast-rapor-serit.acik{display:flex}'
    + '.ast-rapor-serit button{margin-left:auto;background:none;border:none;color:#9a8fb8;cursor:pointer;font-size:12px;text-decoration:underline}'
    + '.ast-alt{border-top:1px solid #332a4d;background:#161022;padding:8px}'
    + '.ast-cips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}'
    + '.ast-cip{background:#1c1733;border:1px solid #332a4d;border-radius:14px;padding:5px 10px;font-size:11.5px;color:#cdbff0;cursor:pointer}'
    + '.ast-cip:hover{border-color:#d9b96a;color:#f0e6d2}'
    + '.ast-giris{display:flex;gap:8px;align-items:flex-end}'
    + '.ast-giris textarea{flex:1;resize:none;max-height:96px;min-height:40px;background:#0f0b1a;border:1px solid #332a4d;'
    + 'border-radius:10px;color:#f0e6d2;font-family:inherit;font-size:14px;padding:10px 12px;line-height:1.4}'
    + '.ast-giris textarea:focus{outline:none;border-color:#d9b96a}'
    + '.ast-gonder{flex:none;width:42px;height:42px;border-radius:10px;border:none;cursor:pointer;'
    + 'background:linear-gradient(180deg,#e7cf95,#d9b96a);color:#241a06;font-size:18px;font-weight:bold}'
    + '.ast-gonder:disabled{opacity:.5;cursor:default}'
    + '.ast-feragat{text-align:center;font-size:10.5px;color:#6f6690;margin-top:7px;line-height:1.4}'
    + '.ast-feragat a{color:#9a8fb8}'
    + '.ast-modal{position:absolute;inset:0;background:rgba(10,7,18,.92);z-index:5;display:none;flex-direction:column;padding:18px}'
    + '.ast-modal.acik{display:flex}'
    + '.ast-modal h4{margin:0 0 6px;font-family:Georgia,serif;color:#e7cf95;font-size:16px}'
    + '.ast-modal p{margin:0 0 10px;font-size:12.5px;color:#9a8fb8;line-height:1.5}'
    + '.ast-modal textarea{flex:1;background:#0f0b1a;border:1px solid #332a4d;border-radius:10px;color:#f0e6d2;'
    + 'font-family:inherit;font-size:13px;padding:10px;line-height:1.5;resize:none}'
    + '.ast-modal textarea:focus{outline:none;border-color:#d9b96a}'
    + '.ast-modal .btnsatir{display:flex;gap:8px;margin-top:10px}'
    + '.ast-modal .btnsatir button{flex:1;padding:11px;border-radius:9px;border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:bold}'
    + '.ast-modal .kaydet{background:linear-gradient(180deg,#e7cf95,#d9b96a);color:#241a06}'
    + '.ast-modal .vazgec{background:#1c1733;color:#cdbff0;border:1px solid #332a4d}'
    + '.ast-modal .giris-uyari{background:#241014;border:1px solid #6b2a35;color:#f0a9b5;border-radius:9px;padding:12px;font-size:13px;line-height:1.5}'
    + '.ast-modal .giris-uyari a{color:#e7cf95;font-weight:bold}'
    + '@media(max-width:480px){#asterna-panel{right:8px;left:8px;width:auto;bottom:84px}}';

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

  var CIPLER = ["Hangi rapor bana uygun?", "📄 Raporlarım", "Ücretsiz araçlar neler?", "Astroloji gerçek mi?"];

  // ---------- Yardımcılar ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  // Bot mesajını güvenli göster: önce kaçışla, sonra **kalın** ve https linklerini biçimle.
  function linkify(s) {
    var e = escapeHtml(s);
    e = e.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");   // **kalın** → kalın
    e = e.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    return e;
  }
  function ekle(rol, txt) {
    var d = document.createElement("div");
    d.className = "ast-msg " + (rol === "user" ? "ben" : "bot");
    if (rol === "user") { d.textContent = txt; } else { d.innerHTML = linkify(txt); }
    akis.appendChild(d);
    akis.scrollTop = akis.scrollHeight;
    return d;
  }
  function yaziyorGoster() {
    var d = document.createElement("div");
    d.className = "ast-yaz";
    d.id = "ast-yaziyor";
    d.textContent = "Asterna düşünüyor…";
    akis.appendChild(d);
    akis.scrollTop = akis.scrollHeight;
    // Render uykudaysa ilk yanıt gecikebilir → kullanıcıyı rahatlat
    d.__t = setTimeout(function () { if (d.isConnected) d.textContent = "Asterna düşünüyor… (ilk yanıt biraz sürebilir)"; }, 6000);
    return d;
  }
  function yaziyorGizle() {
    var d = panel.querySelector("#ast-yaziyor");
    if (d) { if (d.__t) clearTimeout(d.__t); d.remove(); }
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

  // ---------- Gönderme ----------
  function gonder() {
    var txt = (metin.value || "").trim();
    if (!txt || bekliyor) return;
    ekle("user", txt);
    mesajlar.push({ rol: "user", metin: txt });
    metin.value = ""; metin.style.height = "auto";
    bekliyor = true; gonderBtn.disabled = true;
    var y = yaziyorGoster();

    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(raporId ? { mesajlar: mesajlar.slice(-8), raporId: raporId, token: raporToken } : { mesajlar: mesajlar.slice(-8) })
    })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (data) {
        yaziyorGizle();
        var cevap = (data && (data.cevap || data.mesaj)) || "Şu an yanıt veremedim, birazdan tekrar dener misin? ✦";
        ekle("asistan", cevap);
        mesajlar.push({ rol: "asistan", metin: cevap });
      })
      .catch(function () {
        yaziyorGizle();
        ekle("asistan", "Bağlantıda bir sorun oldu, birazdan tekrar dener misin? ✦");
      })
      .finally(function () { bekliyor = false; gonderBtn.disabled = false; metin.focus(); });
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
    raporId = ""; raporBaslik = ""; raporSerit.classList.remove("acik"); raporSerit.innerHTML = "";
    ekle("asistan", "Rapor analiz modundan çıktık. Dilersen başka bir rapor seçebilir ya da genel sorularını sorabilirsin. ✦");
  }
  function raporSec(id, ad) {
    raporId = id; raporBaslik = ad;
    raporSerit.innerHTML = '📄 ' + escapeHtml(ad) + ' — analiz modu <button id="ast-rapor-kaldir">kaldır</button>';
    raporSerit.classList.add("acik");
    raporSerit.querySelector("#ast-rapor-kaldir").onclick = raporKaldir;
    raporModalKapat();
    ekle("asistan", ad + " raporunu birlikte inceleyebiliriz ✦ Merak ettiğin bölümü sorabilir ya da 'genel bir değerlendirme yapar mısın?' diyebilirsin.");
    mesajlar.push({ rol: "asistan", metin: ad + " raporu analiz moduna alındı." });
  }
  function raporModalAc() {
    modal.innerHTML = '<p style="color:#9a8fb8;font-size:13px">Kontrol ediliyor…</p>';
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
      modal.innerHTML = '<p style="color:#9a8fb8;font-size:13px">Raporların getiriliyor…</p>';
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
    ekle("asistan", "Merhaba, ben Asterna ✦ Astroloji ve numerolojinin her dalında uzmanınım — Astro Yuvam'ın raporları ve araçlarıyla beslendim. Merak ettiğin bir kavramı açıklayabilir, sana en uygun okumayı birlikte bulabilir ya da ücretsiz araçlarda yol gösterebilirim. Üyeysen kendi raporunu satır satır inceleyebiliriz. Aklında ne var?\n\n✦ Beni neden kullanmalısın, neler yapabilirim? İstersen önce kısaca tanışalım: https://astroyuvam.com/asterna.html");
  }
  function ac() {
    panel.classList.add("acik"); acildiMi = true;
    ciplerCiz(); ilkKarsilama();
    setTimeout(function () { metin.focus(); }, 100);
  }
  function kapat() { panel.classList.remove("acik"); }
  fab.onclick = function () { panel.classList.contains("acik") ? kapat() : ac(); };
  panel.querySelector(".kapat").onclick = kapat;
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("acik")) kapat(); });
})();
