/* pwa.js — Astro Yuvam'ı telefona uygulama gibi ekleme.
   menu.js tarafından sayfa tamamen yüklendikten birkaç saniye sonra yüklenir (ilk görüntüyü ve hız puanını etkilemez).
   - Service worker'ı kaydeder (/sw.js)
   - İkinci ziyaretten itibaren, telefonda, kibar bir "Ana ekrana ekle" daveti gösterir (30 gün içinde bir kez)
   - Menüdeki Keşfet listesine "Uygulama olarak ekle" bağlantısı ekler */
(function () {
  "use strict";
  if (window.__ayPwa) return; window.__ayPwa = true;
  var LS = window.localStorage, SS = window.sessionStorage;
  function al(k) { try { return LS.getItem(k); } catch (e) { return null; } }
  function koy(k, v) { try { LS.setItem(k, v); } catch (e) {} }
  function olay(ad, p) { if (window.gtag) try { gtag("event", ad, p || {}); } catch (e) {} }

  // 1) Service worker
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function () {});
  }

  var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  if (standalone) { koy("ay_pwa_kurulu", "1"); if (!SS.getItem("ay_pwa_acilis")) { SS.setItem("ay_pwa_acilis", "1"); olay("pwa_acildi"); } return; }

  var ua = navigator.userAgent || "";
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var mobil = (window.matchMedia && matchMedia("(pointer: coarse)").matches) || /Android|Mobi/i.test(ua);

  // Oturum sayacı (aynı oturumda bir kez artar)
  var oturum = +(al("ay_oturum") || 0);
  try { if (!SS.getItem("ay_oturum_sayildi")) { SS.setItem("ay_oturum_sayildi", "1"); oturum++; koy("ay_oturum", String(oturum)); } } catch (e) {}

  function kurulabilir() { return !!window.__ayKurulum || ios; }

  // 2) Stil (yalnızca davet açılınca eklenir)
  var stilEklendi = false;
  function stil() {
    if (stilEklendi) return; stilEklendi = true;
    var s = document.createElement("style");
    s.textContent = ''
      + '#ay-pwa{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483600;max-width:460px;margin:0 auto;background:#1b1530;border:1px solid rgba(217,185,106,.45);border-radius:18px;box-shadow:0 18px 44px rgba(0,0,0,.55);padding:14px 14px 12px;font-family:"Segoe UI",system-ui,sans-serif;color:#f0e6d2;transform:translateY(140%);transition:transform .35s ease}'
      + '#ay-pwa.ac{transform:translateY(0)}'
      + '#ay-pwa .ust{display:flex;gap:12px;align-items:center}'
      + '#ay-pwa img{width:46px;height:46px;border-radius:12px;flex:none;border:1px solid #332a4d}'
      + '#ay-pwa b{display:block;font-size:15px;margin-bottom:2px}'
      + '#ay-pwa p{margin:0;font-size:13px;line-height:1.5;color:#cfc4e6}'
      + '#ay-pwa .bt{display:flex;gap:8px;margin-top:12px}'
      + '#ay-pwa button{flex:1;appearance:none;border:none;cursor:pointer;border-radius:20px;padding:10px 12px;font:600 14px "Segoe UI",system-ui,sans-serif}'
      + '#ay-pwa .evet{background:linear-gradient(180deg,#e7cf95,#d9b96a);color:#1a1428}'
      + '#ay-pwa .hayir{background:transparent;color:#cfc4e6;border:1px solid #332a4d}'
      + '#ay-pwa-ios{position:fixed;inset:0;z-index:2147483601;background:rgba(8,6,16,.72);display:flex;align-items:flex-end;justify-content:center;padding:12px;font-family:"Segoe UI",system-ui,sans-serif}'
      + '#ay-pwa-ios .k{background:#1b1530;border:1px solid rgba(217,185,106,.45);border-radius:20px;max-width:420px;width:100%;padding:18px 18px 14px;color:#f0e6d2}'
      + '#ay-pwa-ios h3{margin:0 0 10px;font:600 18px Georgia,serif}'
      + '#ay-pwa-ios ol{margin:0 0 14px;padding-left:20px;font-size:14.5px;line-height:1.7;color:#e9e1f2}'
      + '#ay-pwa-ios svg{vertical-align:-4px}'
      + '#ay-pwa-ios button{width:100%;appearance:none;border:none;cursor:pointer;border-radius:20px;padding:11px;font:600 14px "Segoe UI",system-ui,sans-serif;background:linear-gradient(180deg,#e7cf95,#d9b96a);color:#1a1428}'
      + '@media (prefers-reduced-motion:reduce){#ay-pwa{transition:none}}';
    document.head.appendChild(s);
  }

  var PAYLAS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9fd0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  function iosRehber() {
    stil();
    var m = document.createElement("div"); m.id = "ay-pwa-ios"; m.setAttribute("role", "dialog"); m.setAttribute("aria-label", "Ana ekrana ekleme");
    m.innerHTML = '<div class="k"><h3>Astro Yuvam\'ı ana ekranına ekle</h3><ol>'
      + '<li>Alttaki (ya da üstteki) <b>Paylaş</b> ' + PAYLAS + ' simgesine dokun.</li>'
      + '<li>Listede aşağı kaydırıp <b>“Ana Ekrana Ekle”</b> seçeneğine dokun.</li>'
      + '<li>Sağ üstteki <b>Ekle</b>\'ye bas. Astro Yuvam ikonu ana ekranında!</li></ol>'
      + '<button type="button">Tamam</button></div>';
    document.body.appendChild(m);
    function kapat() { if (m.parentNode) m.parentNode.removeChild(m); }
    m.querySelector("button").onclick = kapat;
    m.addEventListener("click", function (e) { if (e.target === m) kapat(); });
    olay("pwa_ios_rehber");
  }
  function kur(kaynak) {
    var d = window.__ayKurulum;
    if (d) {
      d.prompt();
      (d.userChoice || Promise.resolve({})).then(function (c) { olay("pwa_kur_secim", { secim: c && c.outcome, kaynak: kaynak }); if (c && c.outcome === "accepted") koy("ay_pwa_kurulu", "1"); });
      window.__ayKurulum = null;
    } else if (ios) iosRehber();
  }

  // 3) Menüye bağlantı (Keşfet listesinin sonu; menü kapalıyken görünmez, kayma yaratmaz)
  function menuBaglanti() {
    if (!kurulabilir() || document.getElementById("ay-pwa-menu")) return;
    var liste = document.querySelector("#astro-menu .am-dropdown .am-drop-menu"); if (!liste || !liste.children.length) return;
    var a = document.createElement("a"); a.href = "#"; a.id = "ay-pwa-menu"; a.setAttribute("role", "menuitem");
    a.innerHTML = '✦ Uygulama olarak ekle<span class="am-sub">Astro Yuvam telefonunun ana ekranında</span>';
    a.style.borderTop = "1px solid #2c2545"; a.style.marginTop = "4px";
    a.addEventListener("click", function (e) { e.preventDefault(); kur("menu"); });
    liste.appendChild(a);
  }

  // 4) Kibar davet
  var gosterildi = false;
  function davetUygun() {
    if (gosterildi || !mobil || !kurulabilir() || oturum < 2 || al("ay_pwa_kurulu")) return false;
    var red = +(al("ay_pwa_red") || 0); if (red && Date.now() - red < 30 * 864e5) return false;
    try { if (SS.getItem("ay_pwa_gosterildi")) return false; } catch (e) {}
    if (document.getElementById("ay-cerez") || document.getElementById("asterna-panel") && document.getElementById("asterna-panel").classList.contains("acik")) return false;
    return true;
  }
  function davet() {
    if (!davetUygun()) return;
    gosterildi = true; try { SS.setItem("ay_pwa_gosterildi", "1"); } catch (e) {}
    stil();
    var d = document.createElement("div"); d.id = "ay-pwa"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Uygulama olarak ekle");
    d.innerHTML = '<div class="ust"><img src="/icon-192.png" alt="" width="46" height="46"><div><b>Astro Yuvam\'ı ana ekranına ekle</b><p>Günlük yorumun, Kozmik Panelin ve raporların tek dokunuşla, uygulama gibi açılsın. Ücretsiz, yer kaplamaz.</p></div></div>'
      + '<div class="bt"><button type="button" class="hayir">Şimdi değil</button><button type="button" class="evet">✦ Ekle</button></div>';
    document.body.appendChild(d);
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add("ac"); }); });
    function kapat() { d.classList.remove("ac"); setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 380); }
    d.querySelector(".hayir").onclick = function () { koy("ay_pwa_red", String(Date.now())); kapat(); olay("pwa_davet_red"); };
    d.querySelector(".evet").onclick = function () { kapat(); kur("davet"); };
    olay("pwa_davet_goster", { platform: ios ? "ios" : "android" });
  }
  function davetZamanla() {
    var bitti = false;
    function dene() { if (bitti) return; if (davetUygun()) { bitti = true; window.removeEventListener("scroll", kaydir); davet(); } }
    function kaydir() { var h = document.documentElement; if ((h.scrollTop + innerHeight) / h.scrollHeight > 0.5) dene(); }
    setTimeout(dene, 15000);
    window.addEventListener("scroll", kaydir, { passive: true });
  }

  window.addEventListener("appinstalled", function () { koy("ay_pwa_kurulu", "1"); var d = document.getElementById("ay-pwa"); if (d) d.remove(); var m = document.getElementById("ay-pwa-menu"); if (m) m.remove(); olay("pwa_kuruldu"); });
  document.addEventListener("ay-kurulum", function () { menuBaglanti(); });
  menuBaglanti(); davetZamanla();
  window.AYUygulama = { ekle: function () { kur("sayfa"); }, kurulabilir: kurulabilir };
})();
