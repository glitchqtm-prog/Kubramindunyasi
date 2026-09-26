/* gokyuzu-arka.js — Astro Yuvam anasayfa arka planı:
 * ŞU AN İstanbul üzerindeki GERÇEK gökyüzü (yıldızlar, takımyıldız çizgileri, Samanyolu).
 * Yerel yıldız zamanına göre hesaplanır, dakikada bir gerçek dönüşle güncellenir.
 * Veri: d3-celestial açık kataloğu (gokyuzu-arka-veri.js, sayfa açıldıktan sonra yüklenir). */
(function(){
  if (window.__AY_ARKA) return; window.__AY_ARKA = 1;
  var LAT = 41.01, LON = 28.98;                       // İstanbul
  var ZODYAK = {Ari:1,Tau:1,Gem:1,Cnc:1,Leo:1,Vir:1,Lib:1,Sco:1,Sgr:1,Cap:1,Aqr:1,Psc:1};
  var red = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var me = document.currentScript, base = me && me.src ? me.src.replace(/[^\/]*$/, "") : "/";

  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;opacity:0;transition:opacity 2.4s ease";
  var ctx = cv.getContext("2d"), off = document.createElement("canvas"), octx = off.getContext("2d");
  var W, H, dpr, CX, CY, R, D, parlak = [];

  var rad = Math.PI / 180;
  function lst(){ // yerel yıldız zamanı (derece)
    var jd = (window.AY_SKY_TIME || Date.now()) / 86400000 + 2440587.5, d = jd - 2451545.0;
    var g = 280.46061837 + 360.98564736629 * d;
    return ((g + LON) % 360 + 360) % 360;
  }
  var sL = Math.sin(LAT * rad), cL = Math.cos(LAT * rad), T;
  function proj(ra, de){ // ra,dec (derece) → ekran; ufuk altı için null
    var H_ = (T - ra) * rad, dd = de * rad;
    var sa = Math.sin(dd) * sL + Math.cos(dd) * cL * Math.cos(H_);
    var alt = Math.asin(Math.max(-1, Math.min(1, sa)));
    var az = Math.atan2(-Math.sin(H_) * Math.cos(dd), Math.sin(dd) * cL - Math.cos(dd) * sL * Math.cos(H_));
    var z = Math.PI / 2 - alt, r = R * Math.tan(Math.min(z, 2.6) / 2);
    return [CX - r * Math.sin(az), CY - r * Math.cos(az), alt / rad];
  }

  function boyut(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.width = off.width = Math.round(innerWidth * dpr);
    H = cv.height = off.height = Math.round(innerHeight * dpr);
    CX = W / 2; CY = H * 0.34; R = 0.56 * Math.hypot(W, H); D = dpr;
  }

  function ciz(){ // statik katman: Samanyolu + çizgiler + yıldızlar (dakikada bir)
    var S = window.AY_SKY; if (!S) return;
    T = lst(); octx.clearRect(0, 0, W, H);
    // Samanyolu — gerçek şekli, çok hafif ve bulanık
    octx.save(); octx.filter = "blur(" + Math.round(18 * D) + "px)";
    ["ol1","ol2","ol3","ol4","ol5"].forEach(function(k, i){
      octx.fillStyle = "rgba(196,188,228," + [0.020,0.022,0.026,0.030,0.034][i] + ")";
      (S.m[k] || []).forEach(function(ring){
        octx.beginPath(); var ok = 0;
        for (var j = 0; j < ring.length; j++){ var p = proj(ring[j][0], ring[j][1]); if (p[2] > -40) ok++; j ? octx.lineTo(p[0], p[1]) : octx.moveTo(p[0], p[1]); }
        if (ok) { octx.closePath(); octx.fill(); }
      });
    });
    octx.restore();
    // takımyıldız çizgileri — 12 burç altın, diğerleri gümüş, ikisi de çok silik
    octx.lineWidth = 0.8 * D; octx.lineCap = "round";
    Object.keys(S.l).forEach(function(id){
      var dar = W / D < 760; octx.strokeStyle = ZODYAK[id] ? (dar ? "rgba(217,185,106,0.09)" : "rgba(217,185,106,0.14)") : (dar ? "rgba(205,205,235,0.022)" : "rgba(205,205,235,0.034)");
      S.l[id].forEach(function(seg){
        octx.beginPath(); var prev = null;
        for (var j = 0; j < seg.length; j++){
          var p = proj(seg[j][0], seg[j][1]);
          if (p[2] < 0){ prev = null; continue; }
          prev ? octx.lineTo(p[0], p[1]) : octx.moveTo(p[0], p[1]); prev = p;
        }
        octx.stroke();
      });
    });
    // yıldızlar — parlaklığa (kadir) göre boyut
    parlak = [];
    S.s.forEach(function(s){
      var p = proj(s[0], s[1]); if (p[2] < 0 || p[0] < -20 || p[0] > W + 20 || p[1] < -20 || p[1] > H + 20) return;
      var m = s[2], r = Math.max(0.55, (5.0 - m) * 0.5) * D, a = Math.max(0.42, Math.min(0.95, 1.1 - m * 0.14));
      if (p[2] < 12) a *= p[2] / 12;                   // ufka yakın yıldızlar söner
      if (m < 2.0){ parlak.push([p[0], p[1], r, a]); return; }
      octx.fillStyle = "rgba(238,232,220," + a.toFixed(3) + ")";
      octx.beginPath(); octx.arc(p[0], p[1], r, 0, 6.2832); octx.fill();
    });
  }

  var t0 = performance.now();
  function kare(t){
    ctx.clearRect(0, 0, W, H); ctx.drawImage(off, 0, 0);
    for (var i = 0; i < parlak.length; i++){ // en parlak birkaç yıldız: yumuşak hale + çok hafif nefes
      var b = parlak[i], n = red ? 1 : 0.85 + 0.15 * Math.sin((t - t0) / 1700 + i * 1.9);
      var g = ctx.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2] * 6);
      g.addColorStop(0, "rgba(255,244,222," + (b[3] * 0.45 * n).toFixed(3) + ")"); g.addColorStop(1, "rgba(255,244,222,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b[0], b[1], b[2] * 6, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "rgba(255,248,232," + (b[3] * n).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(b[0], b[1], b[2], 0, 6.2832); ctx.fill();
    }
    if (!red && !document.hidden) setTimeout(function(){ requestAnimationFrame(kare); }, 66); // ~15 fps yeter
    else if (!red) document.addEventListener("visibilitychange", function once(){ if (!document.hidden){ document.removeEventListener("visibilitychange", once); requestAnimationFrame(kare); } });
  }

  function not(){ // küçük, silinip giden açıklama → canlı Gökyüzü sayfasına bağ
    var a = document.createElement("a");
    a.href = "/gokyuzu.html";
    a.textContent = "✦ Arkandaki gökyüzü, şu an İstanbul üzerindeki gerçek gökyüzü";
    a.style.cssText = "position:fixed;left:16px;bottom:14px;z-index:5;font:12px/1.4 'Inter','Segoe UI',sans-serif;color:rgba(231,207,149,.72);text-decoration:none;background:rgba(12,10,22,.55);border:1px solid rgba(217,185,106,.18);border-radius:20px;padding:6px 12px;opacity:0;transition:opacity 1.6s ease;max-width:calc(100vw - 110px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis";
    document.body.appendChild(a);
    setTimeout(function(){ a.style.opacity = "1"; }, 2600);
    setTimeout(function(){ a.style.opacity = "0"; setTimeout(function(){ a.remove(); }, 1800); }, 14000);
  }

  function basla(){
    document.body.insertBefore(cv, document.body.firstChild);
    boyut(); ciz(); requestAnimationFrame(kare);
    requestAnimationFrame(function(){ cv.style.opacity = "1"; });
    setInterval(ciz, 60000);                            // gerçek dönüş: dakikada bir yeniden hesapla
    var zt; addEventListener("resize", function(){ clearTimeout(zt); zt = setTimeout(function(){ boyut(); ciz(); }, 200); });
    if (innerWidth >= 900) not();
  }
  function yukle(){
    if (window.AY_SKY) return basla();
    var s = document.createElement("script"); s.src = base + "gokyuzu-arka-veri.js"; s.async = true; s.onload = basla;
    document.head.appendChild(s);
  }
  if (document.readyState === "complete") yukle(); else addEventListener("load", yukle);
})();
