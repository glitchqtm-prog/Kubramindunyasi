/* Astro Yuvam — kolay doğum bilgisi girişi (ortak, hafif bileşen)
   • input[type=date][data-dg]  → "GG.AA.YYYY" yazılan tek alan (rakam klavyesi, noktalar kendiliğinden)
   • input[type=time][data-dg]  → "SS:DD" yazılan tek alan
   • input[data-yer]            → dünya genelinde şehir önerisi ("Şehir, İl, Ülke")
   Asıl alan gizli olarak yerinde kalır ve her zaman ISO değeri taşır (YYYY-AA-GG / SS:DD);
   sayfaların mevcut kodu hiçbir değişiklik olmadan çalışmaya devam eder. */
(function () {
  "use strict";
  if (window.AYDG) return;
  var D = document, LANG = (D.documentElement.lang || "tr").slice(0, 2);
  var AY = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var GUN = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  var P = HTMLInputElement.prototype;
  var dV = Object.getOwnPropertyDescriptor(P, "value"), dD = Object.getOwnPropertyDescriptor(P, "disabled");
  var sayac = 0;

  function css() {
    if (D.getElementById("dg-css")) return;
    var s = D.createElement("style"); s.id = "dg-css";
    s.textContent =
      ".dg-k{position:relative;display:block}" +
      ".dg-k>input{width:100%;font-variant-numeric:tabular-nums;letter-spacing:.04em}" +
      ".dg-s{display:block;min-height:1.35em;margin-top:5px;font-size:12.5px;line-height:1.35;color:#b9aecb;font-family:'Segoe UI',system-ui,sans-serif;letter-spacing:0;text-transform:none;font-weight:400}" +
      ".dg-s.ok{color:#d9b96a}.dg-s.hata{color:#ff9a8a}" +
      ".dg-k.pasif{opacity:.5}" +
      ".dg-l{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:60;margin:0;padding:5px;list-style:none;background:#1b1530;border:1px solid #4a3d73;border-radius:12px;box-shadow:0 14px 34px rgba(0,0,0,.5);max-height:300px;overflow-y:auto;text-align:left}" +
      ".dg-l[hidden]{display:none}" +
      ".dg-l li{display:block;padding:9px 11px;border-radius:8px;cursor:pointer;color:#f0e6d2;font:15px/1.3 'Segoe UI',system-ui,sans-serif}" +
      ".dg-l li small{display:block;margin-top:1px;font-size:12.5px;color:#b9aecb}" +
      ".dg-l li.sec,.dg-l li:hover{background:rgba(217,185,106,.13)}" +
      ".dg-l li.bos{cursor:default;color:#b9aecb;font-size:13.5px}.dg-l li.bos:hover{background:none}";
    (D.head || D.documentElement).appendChild(s);
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function yaz(el, v) { dV.set.call(el, v); }
  function oku(el) { return dV.get.call(el); }
  function tetikle(el) {
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  // Biçimlendirirken imleci aynı rakamın arkasında tut (ortadan düzeltme yapılabilsin).
  function bicimle(vis, yeni) {
    var pos = vis.selectionStart == null ? vis.value.length : vis.selectionStart;
    var once = vis.value.slice(0, pos).replace(/\D/g, "").length, sonda = pos >= vis.value.length;
    vis.value = yeni;
    if (sonda || D.activeElement !== vis) return;
    var i = 0, say = 0; while (i < yeni.length && say < once) { if (/\d/.test(yeni[i])) say++; i++; }
    try { vis.setSelectionRange(i, i); } catch (e) {}
  }
  function durum(s, metin, tur) { s.textContent = metin || ""; s.className = "dg-s" + (tur ? " " + tur : ""); }

  // Asıl alanı gizle, yerine yazılabilir alan koy; value/disabled atamalarını yeni alana yansıt.
  function sar(el, vis, sOlustur) {
    var id = el.id || ("dg" + (++sayac));
    var k = D.createElement("span"); k.className = "dg-k";
    el.parentNode.insertBefore(k, el);
    k.appendChild(vis);
    var s = null;
    if (sOlustur) { s = D.createElement("span"); s.className = "dg-s"; s.setAttribute("aria-live", "polite"); k.appendChild(s); }
    k.appendChild(el);
    vis.id = id + "_g";
    if (el.id) { var lb = D.querySelector('label[for="' + el.id + '"]'); if (lb) lb.htmlFor = vis.id; }
    var al = el.getAttribute("aria-label"); if (al) vis.setAttribute("aria-label", al);
    if (el.required) vis.required = true;
    vis.disabled = el.disabled;
    return { k: k, s: s };
  }
  function kanca(el, vis, k, goster, normal) {
    Object.defineProperty(el, "value", { configurable: true,
      get: function () { return oku(el); },
      set: function (v) { yaz(el, normal(v)); goster(); } });
    Object.defineProperty(el, "disabled", { configurable: true,
      get: function () { return dD.get.call(el); },
      set: function (v) { dD.set.call(el, v); vis.disabled = !!v; k.classList.toggle("pasif", !!v); } });
  }
  // Doluyken odaklanınca hepsini seç: yazılan yeni değer eskisinin yerine geçsin (ör. hazır "12:00").
  function tumSec(vis) {
    var tik = false;
    vis.addEventListener("focus", function () { if (vis.value) { vis.select(); tik = true; } });
    vis.addEventListener("mouseup", function (e) { if (tik) { e.preventDefault(); tik = false; } });
    vis.addEventListener("keydown", function () { tik = false; });
  }
  function sonraki(vis) {
    var hep = D.querySelectorAll("input.dg-in"), i = Array.prototype.indexOf.call(hep, vis), n = hep[i + 1];
    if (n && n.getAttribute("data-dg-tur") === "saat" && !n.disabled && n.offsetParent !== null && vis.form === n.form) n.focus();
  }

  /* ---------- TARİH ---------- */
  function tarihIso(v) {
    v = String(v || "").trim();
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
    return m ? m[1] + "-" + m[2] + "-" + m[3] : "";
  }
  function tarihMaske(r) { // yalnızca rakamlar → GG.AA.YYYY
    r = r.replace(/\D/g, "").slice(0, 8);
    if (r.length > 4) return r.slice(0, 2) + "." + r.slice(2, 4) + "." + r.slice(4);
    if (r.length > 2) return r.slice(0, 2) + "." + r.slice(2);
    return r;
  }
  function tarihCoz(metin) { // serbest yazım/yapıştırma: 14.03.1992, 14/3/1992, 1992-03-14, 14 3 1992
    var t = String(metin || "").trim(), m;
    if ((m = /^(\d{4})\D(\d{1,2})\D(\d{1,2})$/.exec(t))) return [+m[3], +m[2], +m[1]];
    if ((m = /^(\d{1,2})\D+(\d{1,2})\D+(\d{4})$/.exec(t))) return [+m[1], +m[2], +m[3]];
    if ((m = /^(\d{2})(\d{2})(\d{4})$/.exec(t.replace(/\D/g, ""))) && t.replace(/\D/g, "").length === 8) return [+m[1], +m[2], +m[3]];
    return null;
  }
  function tarihKur(el) {
    var vis = D.createElement("input");
    vis.type = "text"; vis.inputMode = "numeric"; vis.autocomplete = "off"; vis.className = "dg-in";
    vis.setAttribute("data-dg-tur", "tarih"); vis.placeholder = "GG.AA.YYYY"; vis.maxLength = 10;
    vis.setAttribute("enterkeyhint", "next");
    var min = el.min || "1900-01-01", max = el.max || "2100-12-31";
    var ilk = oku(el);
    el.type = "hidden";
    var z = sar(el, vis, true), s = z.s;
    function goster() {
      var iso = oku(el);
      if (iso) { var p = iso.split("-"); vis.value = p[2] + "." + p[1] + "." + p[0]; bilgi(+p[0], +p[1], +p[2]); }
      else { if (!vis.matches(":focus")) vis.value = ""; durum(s, ""); }
    }
    function bilgi(y, a, g) {
      var gn = new Date(Date.UTC(y, a - 1, g)).getUTCDay();
      durum(s, "✓ " + g + " " + AY[a - 1] + " " + y + ", " + GUN[gn], "ok");
    }
    function degerlendir(bitti) {
      var once = oku(el), sonra = "", c = tarihCoz(vis.value);
      if (c) {
        var g = c[0], a = c[1], y = c[2], d = new Date(Date.UTC(y, a - 1, g));
        var gecerli = a >= 1 && a <= 12 && g >= 1 && d.getUTCMonth() === a - 1 && d.getUTCDate() === g;
        var iso = y + "-" + pad(a) + "-" + pad(g);
        if (!gecerli) durum(s, "Bu tarih takvimde yok; günü ve ayı kontrol eder misin?", "hata");
        else if (iso < min || iso > max) durum(s, "Lütfen " + min.slice(0, 4) + " ile " + max.slice(0, 4) + " arasında bir tarih yaz.", "hata");
        else { sonra = iso; bilgi(y, a, g); }
      } else if (vis.value.replace(/\D/g, "").length === 0) durum(s, "");
      else if (bitti) durum(s, "Tarihi gün.ay.yıl şeklinde yaz (örn. 14.03.1992).", "hata");
      else durum(s, "");
      if (sonra !== once) { yaz(el, sonra); tetikle(el); }
      return !!sonra;
    }
    vis.addEventListener("input", function (e) {
      var ham = vis.value;
      if (/^\d{4}-/.test(ham) || /[\/\s-]/.test(ham) && tarihCoz(ham)) { // yapıştırılan farklı biçim
        var c = tarihCoz(ham); if (c) vis.value = pad(c[0]) + "." + pad(c[1]) + "." + c[2];
      } else if (!(e.inputType || "").startsWith("delete")) {
        var r = ham.replace(/\D/g, "");
        // 4 → 04 : ilk hane 4-9 ise gün tek hanelidir; ay için 2-9 aynı şekilde
        if (/^[4-9]$/.test(r)) r = "0" + r;
        if (r.length === 3 && /[2-9]/.test(r[2])) r = r.slice(0, 2) + "0" + r[2];
        bicimle(vis, tarihMaske(r));
      }
      var tamam = degerlendir(false);
      if (tamam && vis.value.length === 10 && !(e.inputType || "").startsWith("delete")) sonraki(vis);
    });
    vis.addEventListener("blur", function () { degerlendir(true); });
    tumSec(vis);
    kanca(el, vis, z.k, goster, tarihIso);
    if (ilk) { yaz(el, tarihIso(ilk)); goster(); }
  }

  /* ---------- SAAT ---------- */
  function saatNorm(v) {
    var m = /^(\d{1,2}):(\d{2})/.exec(String(v || "").trim());
    if (!m || +m[1] > 23 || +m[2] > 59) return "";
    return pad(+m[1]) + ":" + m[2];
  }
  function saatKur(el) {
    var vis = D.createElement("input");
    vis.type = "text"; vis.inputMode = "numeric"; vis.autocomplete = "off"; vis.className = "dg-in";
    vis.setAttribute("data-dg-tur", "saat"); vis.placeholder = "SS:DD"; vis.maxLength = 5;
    vis.setAttribute("enterkeyhint", "next");
    var ilk = oku(el);
    el.type = "hidden";
    var z = sar(el, vis, true), s = z.s;
    function bilgi(h, m) {
      var dilim = h < 5 ? "gece" : h < 12 ? "sabah" : h < 17 ? "öğleden sonra" : h < 21 ? "akşam" : "gece";
      durum(s, "✓ " + dilim + " " + pad(h) + ":" + pad(m), "ok");
    }
    function goster() {
      var v = oku(el);
      if (v) { vis.value = v; bilgi(+v.slice(0, 2), +v.slice(3, 5)); }
      else { if (!vis.matches(":focus")) vis.value = ""; durum(s, ""); }
    }
    function degerlendir(bitti) {
      var once = oku(el), sonra = "", r = vis.value.replace(/\D/g, "");
      if (r.length === 4) {
        var h = +r.slice(0, 2), m = +r.slice(2);
        if (h > 23 || m > 59) durum(s, "Saat 00:00 ile 23:59 arasında olmalı.", "hata");
        else { sonra = pad(h) + ":" + pad(m); bilgi(h, m); }
      } else if (!r.length) durum(s, "");
      else if (bitti) durum(s, "Saati saat:dakika şeklinde yaz (örn. 14:30).", "hata");
      else durum(s, "");
      if (sonra !== once) { yaz(el, sonra); tetikle(el); }
    }
    vis.addEventListener("input", function (e) {
      if (!(e.inputType || "").startsWith("delete")) {
        var r = vis.value.replace(/\D/g, "").slice(0, 4);
        if (/^[3-9]$/.test(r)) r = "0" + r; // 7 → 07
        bicimle(vis, r.length > 2 ? r.slice(0, 2) + ":" + r.slice(2) : r);
      }
      degerlendir(false);
    });
    tumSec(vis);
    vis.addEventListener("blur", function () {
      var r = vis.value.replace(/\D/g, "");
      if (r.length === 1 || r.length === 2) { vis.value = pad(+r) + ":00"; } // "9" → 09:00
      else if (r.length === 3) { vis.value = "0" + r[0] + ":" + r.slice(1); }  // "930" → 09:30
      degerlendir(true);
    });
    kanca(el, vis, z.k, goster, saatNorm);
    if (ilk) { yaz(el, saatNorm(ilk)); goster(); }
  }

  /* ---------- ŞEHİR + ÜLKE ÖNERİSİ ---------- */
  var onbellek = {};
  function temizUlke(u) { return String(u || "").replace("Türkiye Cumhuriyeti", "Türkiye"); }
  function etiket(r) {
    var p = [r.name];
    if (r.admin1 && r.admin1 !== r.name) p.push(r.admin1);
    if (r.country) p.push(temizUlke(r.country));
    return p.join(", ");
  }
  function ara(q) {
    var key = LANG + "|" + q.toLocaleLowerCase("tr");
    if (onbellek[key]) return onbellek[key];
    var u = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) + "&count=7&language=" + LANG + "&format=json";
    onbellek[key] = fetch(u).then(function (r) { return r.json(); }).then(function (j) {
      return (j && j.results || []).filter(function (r) { return r.feature_code !== "PCLI" && r.latitude != null; });
    }).catch(function () { delete onbellek[key]; return null; });
    return onbellek[key];
  }
  function yerKur(el) {
    el.setAttribute("autocomplete", "off");
    el.setAttribute("role", "combobox"); el.setAttribute("aria-autocomplete", "list"); el.setAttribute("aria-expanded", "false");
    if (!el.placeholder || /^Örn/.test(el.placeholder)) el.placeholder = "Şehir, Ülke — örn. İzmir, Türkiye";
    var k = D.createElement("span"); k.className = "dg-k";
    el.parentNode.insertBefore(k, el); k.appendChild(el);
    var lid = "dgl" + (++sayac);
    var ul = D.createElement("ul"); ul.className = "dg-l"; ul.id = lid; ul.setAttribute("role", "listbox"); ul.hidden = true;
    el.setAttribute("aria-controls", lid);
    var s = D.createElement("span"); s.className = "dg-s"; s.setAttribute("aria-live", "polite");
    k.appendChild(ul); k.appendChild(s);
    var sonuc = [], sec = -1, zam = 0, secilen = "", sonSorgu = "";
    function kapat() { ul.hidden = true; el.setAttribute("aria-expanded", "false"); sec = -1; }
    function isaretle(i) {
      sec = i;
      Array.prototype.forEach.call(ul.children, function (li, j) { li.classList.toggle("sec", j === i); if (j === i) { li.scrollIntoView({ block: "nearest" }); el.setAttribute("aria-activedescendant", li.id); } });
    }
    function ciz(liste, q) {
      ul.innerHTML = "";
      if (!liste || !liste.length) {
        var b = D.createElement("li"); b.className = "bos";
        b.textContent = liste ? "“" + q + "” için sonuç yok. Yazımı kontrol et ya da en yakın büyük şehri yaz." : "Öneriler şu an yüklenemedi; şehri ve ülkeyi yazman yeterli.";
        ul.appendChild(b);
      } else liste.forEach(function (r, i) {
        var li = D.createElement("li"); li.id = lid + "-" + i; li.setAttribute("role", "option");
        var ust = [r.admin1 !== r.name ? r.admin1 : "", r.admin2 && r.admin2 !== r.name && r.admin2 !== r.admin1 ? r.admin2 : "", temizUlke(r.country)].filter(Boolean).join(" · ");
        li.appendChild(D.createTextNode(r.name));
        var sm = D.createElement("small"); sm.textContent = ust; li.appendChild(sm);
        li.addEventListener("mousedown", function (e) { e.preventDefault(); sec_(i); });
        ul.appendChild(li);
      });
      sonuc = liste || []; sec = -1;
      ul.style.top = (el.offsetTop + el.offsetHeight + 4) + "px";
      ul.hidden = false; el.setAttribute("aria-expanded", "true");
    }
    function sec_(i) {
      var r = sonuc[i]; if (!r) return;
      var t = etiket(r);
      el.value = t; secilen = t;
      durum(s, "✓ Konum: " + t, "ok");
      kapat(); tetikle(el);
    }
    el.addEventListener("input", function () {
      var q = el.value.split(",")[0].trim();
      clearTimeout(zam);
      if (el.value !== secilen) durum(s, "");
      if (q.length < 2) { kapat(); return; }
      zam = setTimeout(function () {
        sonSorgu = q;
        ara(q).then(function (l) { if (sonSorgu === q && D.activeElement === el) ciz(l, q); });
      }, 250);
    });
    el.addEventListener("keydown", function (e) {
      if (ul.hidden || !sonuc.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); isaretle(Math.min(sec + 1, sonuc.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); isaretle(Math.max(sec - 1, 0)); }
      else if (e.key === "Enter" && sec >= 0) { e.preventDefault(); sec_(sec); }
      else if (e.key === "Escape") kapat();
    });
    el.addEventListener("blur", function () {
      setTimeout(kapat, 120);
      var v = el.value.trim();
      if (!v || v === secilen) return;
      // Listeden seçilmediyse: haritanın hangi konuma göre çıkacağını önceden göster.
      var parca = v.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      ara(parca[0]).then(function (l) {
        if (el.value.trim() !== v || l === null) return;
        if (!l.length) { durum(s, "Bu yeri bulamadık; yazımı kontrol et ya da listeden seç.", "hata"); return; }
        var ek = parca.slice(1).map(function (x) { return x.toLocaleLowerCase("tr"); }), r = l[0];
        if (ek.length) for (var i = 0; i < l.length; i++) {
          var c = [l[i].country, l[i].admin1, l[i].country_code].map(function (x) { return String(x || "").toLocaleLowerCase("tr"); });
          if (ek.some(function (e) { return c.indexOf(e) >= 0; })) { r = l[i]; break; }
        }
        durum(s, "Bulunan konum: " + etiket(r) + (l.length > 1 ? " — farklıysa listeden seç." : ""), "ok");
      });
    });
    if (el.value) secilen = el.value;
  }

  function bagla(kok) {
    kok = kok || D;
    var hepsi = kok.querySelectorAll ? kok.querySelectorAll("input[data-dg],input[data-yer]") : [];
    if (!hepsi.length) return;
    css();
    Array.prototype.forEach.call(hepsi, function (el) {
      if (el.__dg) return; el.__dg = 1;
      try {
        if (el.hasAttribute("data-yer")) yerKur(el);
        else if (el.type === "date") tarihKur(el);
        else if (el.type === "time") saatKur(el);
      } catch (e) { /* bileşen çalışmazsa tarayıcının kendi alanı kalır */ }
    });
  }
  window.AYDG = { bagla: bagla };
  bagla(D);
  if (window.MutationObserver) new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) {
      var n = ms[i].addedNodes[j]; if (n.nodeType === 1 && !n.classList.contains("dg-k")) bagla(n.parentNode || n);
    }
  }).observe(D.documentElement, { childList: true, subtree: true });
})();
