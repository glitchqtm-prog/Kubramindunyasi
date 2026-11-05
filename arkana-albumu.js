/* arkana-albumu.js — Kozmik Panel: "Arkana Albümü" (yalnızca üyeler).
 * Üye Günün Kartın sayfasında her gün kart çektiğinde (gunun-kartin.html) kart "arkana_albumu" tablosuna yazılır.
 * Burada 22 Majör Arkana'dan hangilerinin toplandığı, kaç kez çekildiği ve en son ne zaman geldiği görünür.
 * panelim.html, panel açılınca window.AYAlbum.baslat(ctx) çağırır. */
(function () {
  "use strict";
  var K = [["0","Deli","arkana-22-aptal"],["I","Büyücü","arkana-1-buyucu"],["II","Yüksek Rahibe","arkana-2-bas-rahibe"],["III","İmparatoriçe","arkana-3-imparatorice"],
    ["IV","İmparator","arkana-4-imparator"],["V","Aziz","arkana-5-aziz"],["VI","Aşıklar","arkana-6-asiklar"],["VII","Savaş Arabası","arkana-7-savas-arabasi"],
    ["VIII","Güç","arkana-11-guc"],["IX","Ermiş","arkana-9-ermis"],["X","Kader Çarkı","arkana-10-kader-carki"],["XI","Adalet","arkana-8-adalet"],
    ["XII","Asılan Adam","arkana-12-asilan-adam"],["XIII","Ölüm","arkana-13-olum"],["XIV","Denge","arkana-14-denge"],["XV","Şeytan","arkana-15-seytan"],
    ["XVI","Kule","arkana-16-kule"],["XVII","Yıldız","arkana-17-yildiz"],["XVIII","Ay","arkana-18-ay"],["XIX","Güneş","arkana-19-gunes"],
    ["XX","Mahkeme","arkana-20-mahkeme"],["XXI","Dünya","arkana-21-dunya"]];
  var AYL = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
  var C = null;
  function $(id) { return document.getElementById(id); }
  function stil() {
    if ($("aa-stil")) return;
    var s = document.createElement("style"); s.id = "aa-stil";
    s.textContent =
      ".aa-ust{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:12px}" +
      ".aa-sayac{font-family:Georgia,serif;font-size:30px;color:var(--gold-soft);line-height:1}.aa-sayac small{font-size:15px;color:var(--muted)}" +
      ".aa-bar{flex:1;min-width:160px;height:8px;border-radius:6px;background:#2a2342;overflow:hidden}.aa-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--mor),var(--gold))}" +
      ".aa-g{display:grid;grid-template-columns:repeat(11,minmax(0,1fr));gap:8px}" +
      "@media(max-width:900px){.aa-g{grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}.aa-k{font-size:9.5px}.aa-k b{font-size:13px}}" +
      ".aa-k{position:relative;aspect-ratio:2/3.1;border-radius:10px;border:1px dashed rgba(154,143,184,.35);background:rgba(20,16,31,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4px;color:var(--muted);font-size:10.5px;line-height:1.2;text-decoration:none}" +
      ".aa-k b{font-family:Georgia,serif;font-size:15px;font-weight:600;margin-bottom:3px}" +
      ".aa-k.var{border:1px solid rgba(217,185,106,.7);background:linear-gradient(170deg,#3a2c5e,#1d1633 70%);color:var(--cream);box-shadow:0 0 14px rgba(217,185,106,.18)}" +
      ".aa-k.var b{color:var(--gold-soft)}" +
      ".aa-k .x{position:absolute;top:3px;right:5px;font-size:10px;color:var(--gold-soft)}" +
      ".aa-k.son{outline:2px solid var(--gold);outline-offset:2px}";
    document.head.appendChild(s);
  }
  function ciz(L) {
    var k = $("aaBolum"); if (!k) return;
    var say = {}, son = {}, enSon = null;
    L.forEach(function (x) { say[x.kart] = (say[x.kart] || 0) + 1; son[x.kart] = x.gun; if (!enSon || x.gun > enSon.gun) enSon = x; });
    var n = Object.keys(say).length, tam = n >= 22;
    var izgara = K.map(function (c, i) {
      var v = say[i]; if (!v) return '<div class="aa-k" title="Henüz çekilmedi"><b>' + c[0] + '</b>?</div>';
      var g = son[i].split("-");
      return '<a class="aa-k var' + (enSon && enSon.kart === i ? " son" : "") + '" href="/' + c[2] + '.html" title="' + c[1] + ' · ' + v + ' kez · son ' + (+g[2]) + " " + AYL[+g[1] - 1] + '">' + (v > 1 ? '<span class="x">×' + v + '</span>' : "") + '<b>' + c[0] + '</b>' + c[1] + '</a>';
    }).join("");
    var ust = '<div class="aa-ust"><div class="aa-sayac">' + n + '<small> / 22</small></div><div class="aa-bar"><i style="width:' + Math.round(n / 22 * 100) + '%"></i></div>' +
      '<a class="btn ghost" href="/gunun-kartin.html">Bugünün kartını çek →</a></div>' +
      '<p class="not" style="margin:0 0 12px">' + (tam ? "Tebrikler, 22 Majör Arkana'nın hepsini topladın ✦ Kartlara dokunup her birinin anlamını oku." : !L.length ? "Günün Kartın sayfasında her gün çektiğin kart buraya eklenir. Kaç günde 22 kartın hepsini toplayabileceksin?" : "En sık gelen kart, bu dönem hayatında en çok konuşan enerji olabilir. Kartlara dokunup anlamlarını oku.") + '</p>';
    k.innerHTML = '<div class="bolum-b"><h2>Arkana Albümüm</h2><span>Günün Kartın\'da çektiğin kartlar burada birikir</span></div>' + ust + '<div class="aa-g">' + izgara + '</div>';
    k.classList.remove("gizli");
    if (location.hash === "#aaBolum") setTimeout(function () { k.scrollIntoView({ behavior: "smooth", block: "start" }); }, 300);
  }
  window.AYAlbum = { baslat: function (ctx) {
    C = ctx; if (!C || !C.sb || !C.kullanici) return; stil();
    C.sb.from("arkana_albumu").select("gun,kart").order("gun", { ascending: true }).limit(2000).then(function (r) {
      if (r.error) { if (window.console) console.warn("arkana-albumu", r.error.message); return; } ciz(r.data || []);
    });
  }, _ic: { ciz: ciz } };
})();
