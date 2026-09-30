/* ek-secim.js — Ücretsiz doğum haritası: isteğe bağlı ek noktalar (asteroitler, hesaplanan noktalar, sabit yıldızlar) seçimi.
 * Liste: /ek-katalog.js (sunucudaki katalogdan üretilir). Seçim tarayıcıda hatırlanır (yalnızca bu cihazda).
 * Sayfa betiği window.AYEK.secili() / .yildiz() ile okur; harita varken "Haritayı güncelle" window.AYEK.yenile'yi çağırır. */
(function () {
  "use strict";
  var K = window.AY_EK_KATALOG, kutu = document.getElementById("eksecim");
  if (!K || !kutu) return;
  var ANAH = "ay_ek_secim_v1", sec = [], yildiz = false, ara = "";
  var BY = {}; K.noktalar.forEach(function (n) { BY[n.id] = n; });
  try { var o = JSON.parse(localStorage.getItem(ANAH) || "{}"); sec = (o.s || []).filter(function (id) { return BY[id]; }).slice(0, K.maks); yildiz = !!o.y; } catch (e) {}
  function kaydet() { try { localStorage.setItem(ANAH, JSON.stringify({ s: sec, y: yildiz })); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function sade(s) { return String(s || "").toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  var css = document.createElement("style");
  css.textContent =
    ".ek-kutu{margin-top:16px;border:1px solid var(--line,#3a2f5c);border-radius:14px;background:rgba(106,63,160,.08)}" +
    ".ek-kutu>summary{cursor:pointer;list-style:none;padding:13px 16px;font-weight:600;color:var(--gold-soft,#e7cf95);display:flex;justify-content:space-between;gap:10px;align-items:center}" +
    ".ek-kutu>summary::-webkit-details-marker{display:none}.ek-kutu>summary:after{content:'▾';opacity:.7}.ek-kutu[open]>summary:after{content:'▴'}" +
    ".ek-say{font-weight:400;font-size:.8rem;color:#cfc5e0;margin-left:auto;white-space:nowrap}" +
    ".ek-ic{padding:0 16px 14px}.ek-ac{font-size:.86rem;line-height:1.5;color:#cfc5e0;margin:0 0 10px}" +
    ".ek-hz{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 10px}.ek-hz button,.ek-alt button{background:var(--bg2,#1c1733);border:1px solid var(--line,#3a2f5c);color:var(--cream,#f0e6d2);border-radius:20px;padding:7px 13px;font:inherit;font-size:.84rem;cursor:pointer}" +
    ".ek-hz button:hover,.ek-alt button:hover{border-color:var(--gold,#d9b96a)}" +
    ".ek-ara{width:100%;box-sizing:border-box;margin:0 0 8px}" +
    ".ek-gr{margin:12px 0 4px;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:var(--gold,#d9b96a)}" +
    ".ek-i{display:flex;gap:10px;align-items:flex-start;padding:8px 6px;border-radius:9px;cursor:pointer;margin:0;font-weight:400;text-transform:none;letter-spacing:0}" +
    ".ek-i:hover{background:rgba(255,255,255,.04)}.ek-i input{width:18px;height:18px;margin:2px 0 0;flex:none;accent-color:#8a5cc8}" +
    ".ek-i b{display:block;font-size:.92rem;color:var(--cream,#f0e6d2)}.ek-i b em{font-style:normal;font-size:.72rem;color:#b69ae0;margin-left:6px;border:1px solid #6a3fa0;border-radius:6px;padding:0 5px}" +
    ".ek-i span{display:block;font-size:.8rem;line-height:1.4;color:#b9aecb}.ek-i .ek-st{display:inline;color:#e0b25a}" +
    ".ek-i.kapali{opacity:.45;cursor:not-allowed}" +
    ".ek-yz{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line,#3a2f5c)}" +
    ".ek-alt{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}.ek-alt .ek-dur{font-size:.84rem;color:#cfc5e0;margin-right:auto}" +
    ".ek-alt .ek-gun{background:rgba(217,185,106,.16);border-color:var(--gold,#d9b96a);color:var(--gold-soft,#e7cf95)}" +
    ".ek-uyari{font-size:.82rem;color:#e0b25a;margin:6px 0 0}" +
    ".ek-liste{max-height:420px;overflow-y:auto;padding-right:4px}";
  document.head.appendChild(css);

  var haritaVar = false;
  function ciz() {
    var h = '<summary>✦ Ek noktalar ve sabit yıldızlar <span class="ek-say" id="ek-say"></span></summary><div class="ek-ic">';
    h += '<p class="ek-ac">Eros, Psyche, Hekate, Karma gibi asteroitleri; Vertex ve Şans Noktası gibi hesaplanan noktaları haritana ekle. Seçtiklerin çarka, yerleşim tablosuna ve yorumlara eklenir. Aynı anda en fazla <b>' + K.maks + '</b> nokta seçebilirsin.</p>';
    h += '<div class="ek-hz">' + K.hazir.map(function (p) { return '<button type="button" data-hz="' + p[0] + '">' + esc(p[1]) + '</button>'; }).join("") + '</div>';
    h += '<input type="search" class="ek-ara" id="ek-ara" placeholder="Ara: Eros, Hekate, Vertex, Sedna…" autocomplete="off" aria-label="Ek nokta ara">';
    h += '<div class="ek-liste" id="ek-liste"></div>';
    h += '<div class="ek-yz"><label class="ek-i"><input type="checkbox" id="ek-yildiz"' + (yildiz ? " checked" : "") + '><span><b>★ Sabit yıldız kavuşumlarım</b><span>Regulus, Spica, Algol, Sirius, Antares dahil ' + K.yildizlar.length + ' parlak yıldızdan hangileri gezegenlerinle ya da köşelerinle 1° içinde kavuşuyor? Sayıya dahil değildir.</span></span></label></div>';
    h += '<div class="ek-alt"><span class="ek-dur" id="ek-dur"></span><button type="button" id="ek-temiz">Temizle</button><button type="button" class="ek-gun" id="ek-gun" hidden>Haritayı bu noktalarla güncelle</button></div>';
    h += '<p class="ek-uyari" id="ek-uyari" hidden></p></div>';
    kutu.innerHTML = h;
    liste();
    kutu.querySelector(".ek-hz").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var p = K.hazir.filter(function (x) { return x[0] === b.getAttribute("data-hz"); })[0]; if (!p) return;
      p[2].forEach(function (id) { if (BY[id] && sec.indexOf(id) < 0 && sec.length < K.maks) sec.push(id); });
      kaydet(); liste();
    });
    document.getElementById("ek-ara").addEventListener("input", function () { ara = sade(this.value.trim()); liste(); });
    document.getElementById("ek-yildiz").addEventListener("change", function () { yildiz = this.checked; kaydet(); durum(); });
    document.getElementById("ek-temiz").addEventListener("click", function () { sec = []; yildiz = false; document.getElementById("ek-yildiz").checked = false; kaydet(); liste(); });
    document.getElementById("ek-gun").addEventListener("click", function () { if (window.AYEK.yenile) window.AYEK.yenile(); });
    if (sec.length || yildiz) kutu.open = false;
  }
  function liste() {
    var L = document.getElementById("ek-liste"), h = "", dolu = sec.length >= K.maks;
    K.gruplar.forEach(function (g) {
      var ns = K.noktalar.filter(function (n) { return n.grup === g[0] && (!ara || sade(n.ad + " " + n.anlam + " " + n.aciklama).indexOf(ara) >= 0); });
      if (!ns.length) return;
      h += '<div class="ek-gr">' + esc(g[1]) + '</div>';
      ns.forEach(function (n) {
        var on = sec.indexOf(n.id) >= 0, kapali = dolu && !on;
        h += '<label class="ek-i' + (kapali ? " kapali" : "") + '"><input type="checkbox" value="' + n.id + '"' + (on ? " checked" : "") + (kapali ? " disabled" : "") + '><span><b>' + esc(n.ad) + '<em>' + esc(n.kod) + '</em></b><span>' + esc(n.anlam.charAt(0).toLocaleUpperCase("tr") + n.anlam.slice(1)) + '. ' + esc(n.aciklama) + (n.saat ? ' <span class="ek-st">Doğum saati gerekir.</span>' : '') + '</span></span></label>';
      });
    });
    L.innerHTML = h || '<p class="ek-ac">Bu aramayla eşleşen nokta yok.</p>';
    durum();
  }
  kutu.addEventListener("change", function (e) {
    var c = e.target; if (!c || c.type !== "checkbox" || c.id === "ek-yildiz") return;
    var i = sec.indexOf(c.value);
    if (c.checked && i < 0) { if (sec.length >= K.maks) { c.checked = false; return; } sec.push(c.value); }
    if (!c.checked && i >= 0) sec.splice(i, 1);
    kaydet(); liste();
  });
  function durum() {
    var s = document.getElementById("ek-say"), d = document.getElementById("ek-dur"), u = document.getElementById("ek-uyari"), g = document.getElementById("ek-gun");
    var metin = sec.length ? sec.length + " / " + K.maks + " nokta" : "seçim yok";
    if (yildiz) metin += " · ★ yıldızlar";
    s.textContent = metin; d.textContent = sec.length ? sec.map(function (id) { return BY[id].ad; }).join(", ") : "Henüz bir nokta seçmedin.";
    u.hidden = sec.length < K.maks; u.textContent = "En fazla " + K.maks + " noktaya ulaştın. Başka bir nokta eklemek için birini çıkar; çark bu sınırla okunaklı kalıyor.";
    g.hidden = !haritaVar;
  }
  window.AYEK = {
    secili: function () { return sec.slice(); },
    yildiz: function () { return yildiz; },
    haritaHazir: function (v) { haritaVar = !!v; durum(); },
    ac: function () { kutu.open = true; if (kutu.scrollIntoView) kutu.scrollIntoView({ behavior: "smooth", block: "start" }); },
    yenile: null
  };
  ciz();
})();
