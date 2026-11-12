/* Astro Yuvam — Pusula Serisi satış ayarı (sipariş formu ve tanıtım sayfası buradan okur).
 * liste   : normal fiyat (₺)      tanitim : tanıtım dönemi fiyatı (₺) — Shopier'deki ürün fiyatıyla AYNI olmalı
 * bitis   : tanıtım fiyatının SON günü (YYYY-AA-GG). Bu tarihten sonra sayfalar kendiliğinden liste fiyatını gösterir;
 *           aynı gün Shopier'deki fiyatlar da liste fiyatına çekilmelidir.
 * urun    : rapora özel fiyat (yoksa genel liste/tanitim geçerli). */
window.AY_PUSULA = { liste: 3000, tanitim: 1500, bitis: "2026-12-12", urun: { butun: { liste: 10000, tanitim: 5000 } } };
(function (a) {
  var bin = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  a.bul = function (k) { var u = (k && a.urun[k]) || a; return { liste: u.liste, tanitim: u.tanitim }; };
  a.tanitimda = function () { return !!a.tanitim && (!a.bitis || new Date() <= new Date(a.bitis + "T23:59:59+03:00")); };
  a.fiyat = function (k) { var u = a.bul(k); return a.tanitimda() ? u.tanitim : u.liste; };
  a.bitisYazi = function () {
    if (!a.bitis) return "";
    var p = a.bitis.split("-"), AY = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    return (+p[2]) + " " + AY[(+p[1]) - 1];
  };
  a.bin = bin;
  /* Sayfadaki [data-pusula-fiyat] alanlarını doldurur (değer: "" ya da "butun"). */
  a.yaz = function () {
    var t = a.tanitimda(), el = document.querySelectorAll("[data-pusula-fiyat]");
    for (var i = 0; i < el.length; i++) {
      var u = a.bul(el[i].getAttribute("data-pusula-fiyat"));
      el[i].innerHTML = t
        ? "<b>&#8378;" + bin(u.tanitim) + "</b> <s style='opacity:.6;font-weight:400'>&#8378;" + bin(u.liste) + "</s> · tanıtım fiyatı" + (a.bitis ? " · " + a.bitisYazi() + "'a kadar" : " · ilk ay")
        : "<b>&#8378;" + bin(u.liste) + "</b> · tek seferlik ödeme";
    }
  };
  if (document.readyState !== "loading") a.yaz(); else document.addEventListener("DOMContentLoaded", a.yaz);
})(window.AY_PUSULA);
