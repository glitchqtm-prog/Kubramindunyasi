/* Astro Yuvam — Pusula Serisi satış ayarı (sipariş formu ve tanıtım sayfası buradan okur).
 * liste   : normal fiyat (₺)
 * tanitim : tanıtım dönemi fiyatı (₺) — Shopier'deki ürün fiyatıyla AYNI olmalı
 * bitis   : tanıtım fiyatının SON günü (YYYY-AA-GG). Bu tarihten sonra sayfalar kendiliğinden liste fiyatını gösterir;
 *           aynı gün Shopier'deki fiyat da liste fiyatına çekilmelidir. Boşsa "ilk ay" ifadesi gösterilir. */
window.AY_PUSULA = { liste: 3000, tanitim: 1500, bitis: "" };
window.AY_PUSULA.tanitimda = function () {
  var a = window.AY_PUSULA;
  if (!a.tanitim) return false;
  return !a.bitis || new Date() <= new Date(a.bitis + "T23:59:59+03:00");
};
window.AY_PUSULA.fiyat = function () { var a = window.AY_PUSULA; return a.tanitimda() ? a.tanitim : a.liste; };
window.AY_PUSULA.bitisYazi = function () {
  var a = window.AY_PUSULA; if (!a.bitis) return "";
  var p = a.bitis.split("-"), AY = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  return (+p[2]) + " " + AY[(+p[1]) - 1] + " " + p[0];
};
/* Sayfadaki [data-pusula-fiyat] alanlarını doldurur. */
window.AY_PUSULA.yaz = function () {
  var a = window.AY_PUSULA, t = a.tanitimda(), el = document.querySelectorAll("[data-pusula-fiyat]");
  for (var i = 0; i < el.length; i++) {
    el[i].innerHTML = t
      ? "<b>&#8378;" + a.tanitim + "</b> <s style='opacity:.6;font-weight:400'>&#8378;" + a.liste + "</s> · tanıtım fiyatı" + (a.bitis ? " · " + a.bitisYazi() + "'e kadar" : " · ilk ay") + ", sonrasında &#8378;" + a.liste
      : "<b>&#8378;" + a.liste + "</b> · tek seferlik ödeme";
  }
};
if (document.readyState !== "loading") window.AY_PUSULA.yaz(); else document.addEventListener("DOMContentLoaded", window.AY_PUSULA.yaz);
