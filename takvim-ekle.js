/* takvim-ekle.js — Astro Yuvam "Takvimime ekle" penceresi.
 * iPhone/iPad/Mac: sunucudan gerçek takvim dosyası açılır, Apple Takvim "ekle" ekranını gösterir.
 * Google Takvim: tek tarih için doğrudan etkinlik ekleme; çok tarih için tek tek ekleme ya da abonelik.
 * Diğer: .ics dosyası indirilir (Outlook, Samsung Takvim, bilgisayar).
 * Kullanım: AYTakvim.ac({ ad:"Takvim adı", olaylar:[["2027-05-15","Başlık","Açıklama"], ...], dosya:"ad.ics", url:"https://..." }) */
(function () {
  "use strict";
  if (window.AYTakvim) return;
  var API = "https://astro-rapor.onrender.com/api/takvim.ics";
  var ua = navigator.userAgent || "", IOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document), ANDROID = /Android/i.test(ua), MAC = /Macintosh/.test(ua) && !IOS;
  var css = '#ayt-ort{position:fixed;inset:0;z-index:100000;background:rgba(8,6,14,.72);display:flex;align-items:flex-end;justify-content:center;font-family:"Segoe UI",system-ui,sans-serif;animation:aytF .2s ease}'
    + '@media(min-width:640px){#ayt-ort{align-items:center}}'
    + '@keyframes aytF{from{opacity:0}}'
    + '.ayt-k{width:100%;max-width:440px;max-height:88vh;overflow:auto;background:#1b1530;border:1px solid rgba(217,185,106,.45);border-radius:20px 20px 0 0;padding:20px 18px 18px;color:#f0e6d2;box-shadow:0 -20px 60px rgba(0,0,0,.6)}'
    + '@media(min-width:640px){.ayt-k{border-radius:20px}}'
    + '.ayt-k h3{font-family:Georgia,serif;font-weight:600;font-size:21px;margin:0 0 4px;color:#e7cf95}'
    + '.ayt-k p{margin:0 0 14px;font-size:13px;color:#9a8fb8;line-height:1.5}'
    + '.ayt-b{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#241c3d;border:1px solid #332a4d;border-radius:14px;padding:13px 14px;margin-bottom:9px;color:#f0e6d2;font:inherit;font-size:15px;cursor:pointer;text-decoration:none}'
    + '.ayt-b:hover{border-color:#d9b96a}'
    + '.ayt-b.ana{background:linear-gradient(180deg,#e7cf95,#d9b96a);color:#241a06;border-color:#d9b96a;font-weight:600}'
    + '.ayt-b svg{flex:none;width:24px;height:24px}'
    + '.ayt-b small{display:block;font-size:12px;opacity:.75;font-weight:400;margin-top:1px}'
    + '.ayt-k details{margin:2px 0 10px;border:1px solid #332a4d;border-radius:12px;padding:8px 12px}'
    + '.ayt-k summary{cursor:pointer;font-size:13.5px;color:#e7cf95}'
    + '.ayt-l{list-style:none;margin:8px 0 2px;padding:0}'
    + '.ayt-l li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid rgba(51,42,77,.6);font-size:13px}'
    + '.ayt-l a{flex:none;color:#241a06;background:#e7cf95;border-radius:10px;padding:3px 10px;font-size:12px;text-decoration:none;font-weight:600}'
    + '.ayt-kapat{display:block;width:100%;background:none;border:0;color:#9a8fb8;font:inherit;font-size:14px;padding:10px;cursor:pointer}'
    + '.ayt-not{font-size:12px;color:#9a8fb8;line-height:1.5;margin:4px 2px 10px}';
  var ikonApple = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.9-1.1-2.9-4.2zM13.9 5.2c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.4-.6 3.1-1.5z"/></svg>';
  var ikonGoogle = '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="3" fill="#fff"/><rect x="3" y="4" width="18" height="5" rx="2" fill="#4285F4"/><text x="12" y="18.5" font-size="9" text-anchor="middle" fill="#1a73e8" font-family="Arial" font-weight="700">31</text></svg>';
  var ikonDosya = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M12 11v6M9 14l3 3 3-3"/></svg>';
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function gun(iso) { return iso.replace(/-/g, ""); }
  function ertesi(iso) { var p = iso.split("-"), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + 1)); return d.toISOString().slice(0, 10).replace(/-/g, ""); }
  function googleTek(o, u) { return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent("✦ " + o[1]) + "&dates=" + gun(o[0]) + "/" + ertesi(o[0]) + "&details=" + encodeURIComponent((o[2] || "") + (u ? "\n\n" + u : "")); }
  function b64url(bytes) { var s = ""; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function veriAdresi(v) {
    var ham = new TextEncoder().encode(JSON.stringify(v));
    if (window.CompressionStream) {
      try { var cs = new CompressionStream("deflate-raw"), w = cs.writable.getWriter(); w.write(ham); w.close();
        return new Response(cs.readable).arrayBuffer().then(function (b) { return API + "?z=1&d=" + b64url(new Uint8Array(b)); }); } catch (e) {}
    }
    return Promise.resolve(API + "?d=" + b64url(ham));
  }
  function icsMetni(v) {
    function e(t) { return String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
    function fold(line) { var enc = new TextEncoder(), out = [], cur = "", n = 0; for (var ch of line) { var b = enc.encode(ch).length; if (n + b > (out.length ? 74 : 75)) { if (cur.slice(-1) === "\\") { out.push(cur.slice(0, -1)); cur = "\\"; n = 1; } else { out.push(cur); cur = ""; n = 0; } } cur += ch; n += b; } out.push(cur); return out.join("\r\n "); }
    var damga = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z", L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Astro Yuvam//Takvim//TR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:" + e(v.a)];
    v.o.forEach(function (o, i) { L.push("BEGIN:VEVENT", "UID:ay-" + gun(o[0]) + "-" + i + "@astroyuvam.com", "DTSTAMP:" + damga, "DTSTART;VALUE=DATE:" + gun(o[0]), "DTEND;VALUE=DATE:" + ertesi(o[0]), "SUMMARY:" + e("✦ " + o[1]), "DESCRIPTION:" + e((o[2] || "") + (v.u ? "\n\n" + v.u : "")), "TRANSP:TRANSPARENT", "BEGIN:VALARM", "TRIGGER:-PT15H", "ACTION:DISPLAY", "DESCRIPTION:" + e("Yarın: " + o[1]), "END:VALARM", "END:VEVENT"); });
    L.push("END:VCALENDAR"); return L.map(fold).join("\r\n") + "\r\n";
  }
  function ac(opt) {
    var v = { a: opt.ad || "Astro Yuvam", u: opt.url || location.href.split("#")[0], o: (opt.olaylar || []).map(function (o) { return [o[0], String(o[1]).slice(0, 140), String(o[2] || "").slice(0, 300)]; }) };
    if (!v.o.length) return;
    try { fetch("https://astro-rapor.onrender.com/api/health", { mode: "no-cors" }).catch(function () {}); } catch (e) {}   // sunucuyu uyandır
    if (!document.getElementById("ayt-css")) { var st = document.createElement("style"); st.id = "ayt-css"; st.textContent = css; document.head.appendChild(st); }
    var tek = v.o.length === 1, ort = document.createElement("div"); ort.id = "ayt-ort"; ort.setAttribute("role", "dialog"); ort.setAttribute("aria-label", "Takvimine ekle");
    var apple = '<a class="ayt-b' + (IOS || MAC ? " ana" : "") + '" data-yol="apple" href="#">' + ikonApple + '<span>Apple Takvim<small>iPhone, iPad ve Mac · tek dokunuşla ' + (tek ? "ekle" : "tümünü ekle") + '</small></span></a>';
    var google = tek
      ? '<a class="ayt-b' + (!IOS && !MAC ? " ana" : "") + '" target="_blank" rel="noopener" href="' + esc(googleTek(v.o[0], v.u)) + '">' + ikonGoogle + '<span>Google Takvim<small>Android ve bilgisayar</small></span></a>'
      : '<a class="ayt-b' + (!IOS && !MAC ? " ana" : "") + '" data-yol="gabone" href="#">' + ikonGoogle + '<span>Google Takvim\'e tümünü ekle<small>“Astro Yuvam” adlı ayrı bir takvim olarak eklenir</small></span></a>'
        + '<details' + (ANDROID ? " open" : "") + '><summary>Google Takvim\'e tek tek ekle (' + v.o.length + ' tarih)</summary><ul class="ayt-l">' + v.o.map(function (o) { var p = o[0].split("-"); return "<li><span>" + (+p[2]) + "." + p[1] + " · " + esc(o[1]) + '</span><a target="_blank" rel="noopener" href="' + esc(googleTek(o, v.u)) + '">+ Ekle</a></li>'; }).join("") + "</ul></details>";
    var dosya = '<a class="ayt-b" data-yol="dosya" href="#">' + ikonDosya + '<span>Takvim dosyasını indir<small>Outlook, Samsung Takvim ve diğer uygulamalar</small></span></a>';
    ort.innerHTML = '<div class="ayt-k"><h3>Takvimine ekle</h3><p>' + (tek ? "Bu tarihi" : v.o.length + " tarihi") + ' telefonunun takvimine ekle; her biri için bir gün önceden hatırlatma kurulur.</p>'
      + (IOS || MAC ? apple + google : google + apple) + dosya
      + '<div class="ayt-not">' + (tek ? "" : "Google'da “tümünü ekle” bilgisayarda tek tıkla çalışır; telefonda tek tek eklemek daha kolaydır. ") + 'İlk açılış birkaç saniye sürebilir.</div>'
      + '<button type="button" class="ayt-kapat">Kapat</button></div>';
    document.body.appendChild(ort);
    function kapat() { ort.remove(); document.removeEventListener("keydown", tus); }
    function tus(e) { if (e.key === "Escape") kapat(); }
    document.addEventListener("keydown", tus);
    ort.addEventListener("click", function (e) { if (e.target === ort) kapat(); });
    ort.querySelector(".ayt-kapat").onclick = kapat;
    ort.querySelectorAll("[data-yol]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault(); var yol = a.dataset.yol;
        if (window.gtag) gtag("event", "takvim_ekle", { yol: yol, adet: v.o.length });
        if (yol === "dosya") {
          var u = URL.createObjectURL(new Blob([icsMetni(v)], { type: "text/calendar;charset=utf-8" })), d = document.createElement("a");
          d.href = u; d.download = opt.dosya || "astroyuvam-takvim.ics"; document.body.appendChild(d); d.click(); setTimeout(function () { URL.revokeObjectURL(u); d.remove(); }, 4000); return;
        }
        var pencere = yol === "gabone" ? window.open("about:blank", "_blank") : null;   // açılır pencere engeline takılmamak için hemen aç
        a.style.opacity = ".6";
        veriAdresi(v).then(function (adres) {
          a.style.opacity = "";
          if (yol === "apple") { location.href = adres; return; }
          var g = "https://calendar.google.com/calendar/render?cid=" + encodeURIComponent(adres.replace(/^https:/, "webcal:"));
          if (pencere) pencere.location.href = g; else location.href = g;
        });
      });
    });
  }
  window.AYTakvim = { ac: ac };
})();
