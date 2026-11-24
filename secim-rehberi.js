/* Astro Yuvam — seçim rehberi (ihtiyaç seçici + site karnesi) ve uygulama kurulum kutusu.
   Hiçbir bilgi sunucuya gönderilmez. */
(function () {
  "use strict";
  function olay(ad, p) { if (window.gtag) try { gtag("event", ad, p || {}); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ——— 1) Ne arıyorsun? ——— */
  var IHT = {
    harita: {
      t: "Doğum haritası hesaplayan bir araç",
      d: "Burada asıl mesele hesabın doğruluğu. Güzel çark çizen ama yükseleni yanlış hesaplayan bir araç, sonraki her yorumu da yanlış temele oturtur.",
      o: [1, 2, 3, 4],
      l: [["/dogum-haritasi-hesaplama.html", "Ücretsiz doğum haritası hesapla"], ["/yaz-saati-dogum-saati.html", "Doğduğun gün yaz saati var mıydı?"]]
    },
    yorum: {
      t: "Kişiye özel yorum veren bir site, rapor ya da astrolog",
      d: "Hesap kadar önemli olan, yorumun haritanın bütününe bakıp bakmadığı ve kimin ya da neyin yazdığının açık olması. Parayı ödemeden önce örnek görmek de hakkın.",
      o: [1, 5, 6, 7, 8],
      l: [["/dogum-haritasi-analizi.html", "Doğum haritası raporu ve 3 sayfalık örneği"], ["/fiyatlar.html", "Tüm rapor fiyatları"]]
    },
    iliski: {
      t: "İki haritayı karşılaştıran bir uyum aracı",
      d: "Gerçek ilişki uyumu iki kişinin Güneş burcuna değil, iki doğum haritasının birbirine yaptığı açılara bakar. Burç eşleştirme testleri eğlencelidir ama sinastri değildir.",
      o: [1, 3, 5, 9],
      l: [["/uyum-testi.html", "Ücretsiz uyum testi"], ["/sinastri-uyum-analizi.html", "Sinastri (ilişki uyumu) raporu"]]
    },
    burc: {
      t: "Düzenli burç yorumu yayımlayan bir kaynak",
      d: "İyi bir burç yorumu o dönemin gerçek gökyüzüne dayanır ve ne yapabileceğini söyler; herkese her hafta aynı kalıp cümleleri dağıtmaz. Korku diline özellikle dikkat et.",
      o: [6, 7],
      l: [["/haftalik-burc-yorumlari.html", "Haftalık burç yorumları"], ["/2027-burc-yorumlari.html", "2027 burç yorumları"]]
    },
    ogren: {
      t: "Kavramları sade anlatan bir rehber ve deneme araçları",
      d: "Astroloji öğrenirken en hızlı ilerleme, okuduğunu kendi haritanda görerek olur. Ayarları değiştirip sonucu karşılaştırabildiğin bir araç işini çok kolaylaştırır.",
      o: [1, 4],
      l: [["/astroloji-nedir.html", "Astroloji nedir?"], ["/astrolojide-evler.html", "Astrolojide evler"], ["/yildiz-gunlugu.html", "Yıldız Günlüğü: tüm yazılar"]]
    },
    telefon: {
      t: "Telefonda kolay açılan bir uygulama",
      d: "Mağaza uygulaması mı, ana ekrana eklenen web uygulaması mı? İkisinde de abonelik koşullarına ve istenen izinlere bak.",
      o: [7, 9],
      l: [["/astroloji-uygulamasi.html", "Astro Yuvam'ı telefonuna ekle"], ["/ucretsiz-astroloji-araclari.html", "34 ücretsiz araç"]]
    }
  };
  var OLCUT = ["", "Hesap kaynağı", "Türkiye'nin saat geçmişi", "Saat bilinmeyince uyarı", "Ayarların görünmesi", "Yorumu kimin yazdığı", "Korku ve kesinlik dili", "Fiyat ve abonelik", "Satın almadan örnek", "Doğum bilgisinin korunması"];

  var sec = document.querySelector("[data-secici]");
  if (sec) {
    var kutu = sec.querySelector(".sc-s");
    sec.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest(".sc-b");
      if (!b) return;
      var k = b.getAttribute("data-k"), v = IHT[k];
      if (!v) return;
      Array.prototype.forEach.call(sec.querySelectorAll(".sc-b"), function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var h = '<div class="sc-t">' + esc(v.t) + '</div><p class="sc-d">' + esc(v.d) + '</p>';
      h += '<div class="sc-o-b">Özellikle bak:</div><div class="cipler">';
      v.o.forEach(function (n) { h += '<span class="cip"><i>' + n + '.</i> ' + esc(OLCUT[n]) + '</span>'; });
      h += '</div><div class="sc-l">';
      v.l.forEach(function (l) { h += '<a href="' + l[0] + '">' + esc(l[1]) + ' →</a>'; });
      h += '</div>';
      kutu.innerHTML = h;
      olay("secim_rehberi_ihtiyac", { secim: k });
    });
  }

  /* ——— 2) Karne ——— */
  var karne = document.querySelector("[data-karne]");
  if (karne) {
    var cev = [], liste = karne.querySelectorAll(".kr-l li"), sonuc = karne.querySelector(".kr-s");
    var SEC = [["2", "Evet"], ["1", "Emin değilim"], ["0", "Hayır"]];
    Array.prototype.forEach.call(liste, function (li) {
      var i = +li.getAttribute("data-i"), g = document.createElement("div");
      g.className = "kr-g"; g.setAttribute("role", "radiogroup"); g.setAttribute("aria-label", li.textContent);
      SEC.forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "kr-b k" + s[0]; b.textContent = s[1]; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", "false");
        b.addEventListener("click", function () {
          cev[i] = +s[0];
          Array.prototype.forEach.call(g.children, function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b ? "true" : "false"); });
          hesapla();
        });
        g.appendChild(b);
      });
      li.appendChild(g);
    });
    var gonderildi = false;
    function hesapla() {
      var n = 0, p = 0, zayif = [], belirsiz = [];
      for (var i = 0; i < 9; i++) {
        if (cev[i] == null) continue;
        n++; p += cev[i];
        if (cev[i] === 0) zayif.push(i + 1); else if (cev[i] === 1) belirsiz.push(i + 1);
      }
      if (!n) { sonuc.innerHTML = ""; return; }
      var tam = n === 9, oran = p / (n * 2), sinif, baslik, not;
      if (oran >= 0.85) { sinif = "iyi"; baslik = "Güvenilir görünüyor"; not = "Bu araç ölçütlerin neredeyse hepsini karşılıyor. Yine de doğum bilgini girmeden önce gizlilik metnine bir göz at."; }
      else if (oran >= 0.6) { sinif = "orta"; baslik = "İşini görebilir, ama dikkatli kullan"; not = "Bazı önemli konularda bilgi vermiyor. Hesabı bir başka araçla karşılaştırmadan önemli bir karara dayanak yapma."; }
      else { sinif = "zayif"; baslik = "Temkinli ol"; not = "Ölçütlerin çoğunda eksik var. Para ödemeden ve doğum bilgini bırakmadan önce başka seçeneklere de bak."; }
      var h = '<div class="kr-kart ' + sinif + '"><div class="kr-puan">' + p + '<small> / ' + (n * 2) + '</small></div><div><div class="kr-bas">' + baslik + (tam ? "" : " <small>(" + n + "/9 soru)</small>") + '</div><p>' + not + '</p></div></div>';
      if (zayif.length) h += '<p class="kr-n"><b>Eksik olanlar:</b> ' + zayif.map(function (x) { return '<a href="#olcutler">' + x + '. ' + esc(OLCUT[x]) + '</a>'; }).join(", ") + '</p>';
      if (belirsiz.length) h += '<p class="kr-n"><b>Kontrol etmen gerekenler:</b> ' + belirsiz.map(function (x) { return esc(OLCUT[x]); }).join(", ") + '. Yukarıdaki ölçütte "Nasıl kontrol edersin" kısmına bak.</p>';
      if (tam) h += '<p class="kr-n">Hesabın doğruluğunu hızlıca denemek için aşağıdaki <a href="#test">3 dakikalık testi</a> yapabilirsin.</p>';
      sonuc.innerHTML = h;
      if (tam && !gonderildi) { gonderildi = true; olay("secim_rehberi_karne", { puan: p }); }
    }
  }

  /* ——— 3) Uygulama kurulum kutusu ——— */
  var kur = document.querySelector("[data-kurulum]");
  if (kur) {
    var durum = kur.querySelector(".ap-durum");
    var ua = navigator.userAgent || "";
    var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var android = /Android/i.test(ua);
    var kurulu = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
    function ciz() {
      var h;
      if (kurulu) h = '<p class="ap-ok">✓ Astro Yuvam şu an uygulama olarak açık. Ana ekranındaki simgeden her zaman ulaşabilirsin.</p>';
      else if (window.__ayKurulum) h = '<button type="button" class="ev-btn ap-yukle">Astro Yuvam\'ı yükle</button><p class="y-kucuk">Ücretsiz. Hesap açman gerekmez; simge ana ekranına eklenir.</p>';
      else if (ios) h = '<p class="ap-adim">Safari\'de alttaki <b>Paylaş</b> düğmesine (yukarı ok çıkan kare) dokun, sonra <b>"Ana Ekrana Ekle"</b>yi seç ve <b>"Ekle"</b>ye dokun.</p><p class="y-kucuk">Başka bir tarayıcıdaysan bu sayfayı Safari\'de aç.</p>';
      else if (android) h = '<p class="ap-adim">Chrome\'da sağ üstteki <b>üç nokta</b> menüsünden <b>"Uygulamayı yükle"</b> ya da <b>"Ana ekrana ekle"</b>yi seç.</p>';
      else h = '<p class="ap-adim">Bilgisayardasın. Chrome ya da Edge\'de adres çubuğunun sağındaki <b>yükle</b> simgesiyle Astro Yuvam\'ı bilgisayarına da ekleyebilirsin. Telefon için aşağıdaki adımları izle.</p>';
      durum.innerHTML = h;
      var b = durum.querySelector(".ap-yukle");
      if (b) b.addEventListener("click", function () {
        var e = window.__ayKurulum; if (!e) return;
        olay("pwa_kurulum_tikla", { yer: "uygulama_sayfasi" });
        e.prompt();
        if (e.userChoice) e.userChoice.then(function (r) {
          olay("pwa_kurulum_sonuc", { sonuc: r && r.outcome });
          if (r && r.outcome === "accepted") { window.__ayKurulum = null; kurulu = true; ciz(); }
        });
      });
    }
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); window.__ayKurulum = e; ciz(); });
    ciz();
    document.addEventListener("ay-kurulum", ciz);
    window.addEventListener("appinstalled", function () { kurulu = true; ciz(); olay("pwa_kuruldu", { yer: "uygulama_sayfasi" }); });
  }
})();
