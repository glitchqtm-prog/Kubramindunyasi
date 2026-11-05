/* uye-kilit.js — Herkese açık burç yorumu sayfalarında "görünür kilit": üye olmayanlara, Kozmik Panel'deki
 * kişisel haftanın bulanık bir önizlemesini ve ücretsiz üyelik çağrısını gösterir; üyelere doğrudan panel bağlantısı verir.
 * Sayfada <div id="uyeKilit"></div> olması yeterli. Önizlemedeki günler gerçek tarihlerdir; içerik bilerek bulanıktır. */
(function () {
  "use strict";
  var K = document.getElementById("uyeKilit"); if (!K) return;
  var uye = false;
  try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && /^sb-.*-auth-token$/.test(k)) { var o = JSON.parse(localStorage.getItem(k) || "{}"), s = o.currentSession || o; uye = !!(s.access_token && (!s.expires_at || s.expires_at * 1000 > Date.now())); break; } } } catch (e) {}
  var st = document.createElement("style");
  st.textContent =
    "#uyeKilit{margin:28px 0;font-family:'Segoe UI',system-ui,sans-serif;color:#f0e6d2}" +
    ".uk-kutu{display:grid;border:1px solid #3a2f5c;border-radius:20px;overflow:hidden;background:linear-gradient(180deg,#221a3a,#160f28)}" +
    ".uk-on{grid-area:1/1;align-self:stretch;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;padding:18px;filter:blur(5px);opacity:.8;pointer-events:none;user-select:none}" +
    "@media(max-width:640px){.uk-on{grid-template-columns:repeat(4,minmax(0,1fr))}.uk-on div:nth-child(n+5){display:none}}" +
    ".uk-on div{background:#1c1631;border:1px solid #3a2f5c;border-radius:14px;padding:10px}" +
    ".uk-on b{display:block;font-size:11px;letter-spacing:1.5px;color:#d9b96a}.uk-on i{display:block;font-style:normal;font-family:Georgia,serif;font-size:18px;margin:4px 0}.uk-on span{font-size:12px;color:#b69ae0}" +
    ".uk-ust{grid-area:1/1;position:relative;display:flex;align-items:center;justify-content:center;padding:26px 16px;background:radial-gradient(ellipse at center,rgba(20,16,31,.4),rgba(20,16,31,.72))}" +
    ".uk-kart{max-width:460px;text-align:center}" +
    ".uk-kart .k{font-size:11.5px;letter-spacing:3px;text-transform:uppercase;color:#d9b96a}" +
    ".uk-kart h3{font-family:Georgia,serif;font-weight:600;font-size:22px;margin:6px 0;color:#f0e6d2;line-height:1.3}" +
    ".uk-kart p{font-size:14px;color:#d9d0e8;margin:0 0 14px;line-height:1.55}" +
    ".uk-btn{display:inline-block;background:linear-gradient(180deg,#e7cf95,#d9b96a);color:#2a1e08;font-weight:700;font-size:14.5px;text-decoration:none;padding:11px 20px;border-radius:24px}" +
    ".uk-link{display:block;margin-top:10px;font-size:13px;color:#b69ae0;text-decoration:none}" +
    ".uk-uye{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border:1px solid rgba(217,185,106,.35);background:rgba(217,185,106,.07);border-radius:16px;padding:14px 18px}" +
    ".uk-uye b{color:#e7cf95}.uk-uye span{font-size:14px;color:#e2d9ee}";
  document.head.appendChild(st);
  var geri = encodeURIComponent("/panelim.html");
  if (uye) {
    K.innerHTML = '<div class="uk-uye"><span><b>✦ Bu yorum Güneş burcuna göre genel.</b> Senin haritana göre bu hafta gün gün Kozmik Panelinde hazır.</span><a class="uk-btn" href="/panelim.html">Panelime git →</a></div>';
    return;
  }
  var GUN = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"], ET = ["aşk ve keyif", "dinlenme", "hedefler", "arkadaşlar", "ev ve aile", "para", "derin sohbet"], h = "";
  for (var j = 0; j < 7; j++) { var d = new Date(); d.setDate(d.getDate() + j); h += '<div><b>' + (j ? GUN[d.getDay()] : "BUGÜN") + ' · ' + d.getDate() + '</b><i>' + ET[(d.getDate() + j) % 7] + '</i><span>Ay ' + ((d.getDate() % 12) + 1) + '. evinde</span></div>'; }
  K.innerHTML = '<div class="uk-kutu"><div class="uk-on" aria-hidden="true">' + h + '</div><div class="uk-ust"><div class="uk-kart">' +
    '<div class="k">Üyelere özel · Ücretsiz</div><h3>Peki senin haritana göre bu hafta?</h3>' +
    '<p>Bu yorum Güneş burcuna göre genel. Kozmik Panelinde Ay\'ın her gün senin hangi evinde olduğu, hangi gün aşk, hangi gün dinlenme için daha uygun olduğu ve haritana dokunan açılar seni bekliyor.</p>' +
    '<a class="uk-btn" href="/giris.html?geri=' + geri + '">Ücretsiz üye ol, haftamı gör →</a><a class="uk-link" href="/giris.html?geri=' + geri + '">Zaten üyeyim, giriş yap</a></div></div></div>';
  if (window.gtag) gtag("event", "uye_kilit_goruntulendi");
})();
