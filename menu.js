/* menu.js — Astro Yuvam ortak üst menüsü.
   Tek kaynak: yeni bir ücretsiz araç eklemek için yalnızca aşağıdaki GRUPLAR
   dizisinde ilgili grubun items dizisine tek satır ekle; menü tüm sayfalarda
   otomatik güncellenir.
   Her sayfada iki şey bulunur: bir "astro-menu" kimlikli boş div, ve /menu.js
   dosyasını defer ile yükleyen bir script etiketi.

   KEŞFET MENÜSÜ = AKORDİYON: menü açıldığında yalnızca kategori başlıkları
   görünür; bir başlığa tıklayınca o kategorinin araçları açılır, tekrar
   tıklayınca kapanır. Menü kapanınca kategoriler sıfırlanır.

   BURÇ YORUMLARI MENÜSÜ = BASİT AÇILIR: tıklayınca doğrudan iki seçenek
   görünür — Günlük ve Haftalık. Kategori/akordiyon yoktur. */
(function(){
  // ——— Uygulama olarak ekleme (PWA): Android'in kurulum sinyalini erkenden yakala; davet pwa.js'te ———
  window.addEventListener("beforeinstallprompt", function(e){ e.preventDefault(); window.__ayKurulum = e; try{ document.dispatchEvent(new Event("ay-kurulum")); }catch(x){} });

  // ——— Google Analytics 4 — tüm ziyaretçilerde çalışır (bilgilendirme modu) ———
  function gaBaslat(){
    var GA_ID = "G-QQ0SREFL4L";
    if(window.__gaYuklendi) return;   // aynı sayfada iki kez yüklenmesin
    window.__gaYuklendi = true;
    // Sayfa GA'yı kendi <head>'inde zaten yüklüyorsa ikinci kez yükleme (aksi hâlde görüntüleme çift sayılır)
    if(typeof window.gtag === "function" || document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
    // Olaylar hemen sıraya alınır (hiçbir ziyaret kaybolmaz); 170 KB'lık GA dosyası ise
    // sayfa tamamen çizildikten sonra ya da ilk dokunuşta iner — sayfa hızını etkilemez.
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID);
    sonraYukle(function(){
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
      document.head.appendChild(s);
    }, 1200, true);
  }

  // Sayfa yüklendikten (load) belirli süre sonra — ya da ilk kullanıcı etkileşiminde — bir kez çalıştırır.
  function sonraYukle(fn, gecikme, etkilesimle){
    var oldu = false, olaylar = ["pointerdown","keydown","touchstart","scroll"];
    function calis(){
      if(oldu) return; oldu = true;
      if(etkilesimle) olaylar.forEach(function(o){ window.removeEventListener(o, calis, true); });
      try{ fn(); }catch(e){}
    }
    if(etkilesimle) olaylar.forEach(function(o){ window.addEventListener(o, calis, {capture:true, passive:true}); });
    function zamanla(){ setTimeout(calis, gecikme); }
    if(document.readyState === "complete") zamanla(); else window.addEventListener("load", zamanla);
  }

  // ——— Çerez bilgilendirme bandı: bir kez gösterilir, "Tamam"a basınca hatırlanır ———
  var CEREZ_KEY = "ay_cerez_bilgi_v1";
  function cerezGorulduMu(){ try{ return localStorage.getItem(CEREZ_KEY) === "1"; }catch(e){ return false; } }
  function cerezKapat(){ try{ localStorage.setItem(CEREZ_KEY, "1"); }catch(e){} }

  function cerezBandiGoster(){
    var hazir = document.getElementById("ay-cerez");
    if(cerezGorulduMu()){ if(hazir && hazir.parentNode) hazir.parentNode.removeChild(hazir); return; }
    if(hazir){ // sayfa bandı ilk görüntüyle birlikte hazır getirdi (ana sayfa) — yalnızca düğmeyi bağla
      if(hazir.getAttribute("data-bagli")) return;
      hazir.setAttribute("data-bagli","1");
      var hb = hazir.querySelector(".ay-cerez-kabul");
      if(hb) hb.addEventListener("click", function(){
        cerezKapat();
        hazir.classList.remove("ac-in");
        setTimeout(function(){ if(hazir.parentNode) hazir.parentNode.removeChild(hazir); }, 320);
      });
      return;
    }
    var bar = document.createElement("div");
    bar.id = "ay-cerez";
    bar.setAttribute("role","note");
    bar.setAttribute("aria-label","Çerez bilgilendirmesi");
    bar.innerHTML =
        '<div class="ay-cerez-in">'
      +   '<p class="ay-cerez-tx">Deneyimini iyileştirmek ve ziyaret istatistikleri için çerezler kullanıyoruz. Ayrıntılar için <a href="/gizlilik-kvkk.html">Gizlilik &amp; KVKK</a> metnimize göz atabilirsin.</p>'
      +   '<div class="ay-cerez-bt">'
      +     '<button type="button" class="ay-cerez-kabul">Tamam</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function(){ bar.classList.add("ac-in"); });
    bar.querySelector(".ay-cerez-kabul").addEventListener("click", function(){
      cerezKapat();
      bar.classList.remove("ac-in");
      setTimeout(function(){ if(bar.parentNode) bar.parentNode.removeChild(bar); }, 320);
    });
  }

  // GA herkese açık yüklenir; bant yalnızca bilgi amaçlı gösterilir.
  function cerezBaslat(){
    gaBaslat();
    cerezBandiGoster();
  }

  // ——— Giriş durumu: Supabase oturumu localStorage'da var mı? (kütüphane yüklemeden, hafif) ———
  function oturumAcikMi(){
    try{
      for(var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i);
        if(k && /^sb-.*-auth-token$/.test(k)){
          var v = localStorage.getItem(k);
          if(!v) continue;
          var o = JSON.parse(v);
          var token = o && (o.access_token || (o.currentSession && o.currentSession.access_token));
          var exp   = o && (o.expires_at   || (o.currentSession && o.currentSession.expires_at));
          if(token){ return exp ? (exp * 1000 > Date.now()) : true; }
        }
      }
    }catch(e){}
    return false;
  }

  // ——— YENİ ARAÇ EKLEMEK İÇİN TEK YER ———
  // Kategorili menü: her yeni araç ilgili grubun items dizisine tek satır.
  var GRUPLAR = [
    { baslik:"Gökyüzü & Ay", items:[
      { href:"/dogum-haritasi-hesaplama.html", ad:"✦ Doğum Haritası", alt:"Haritanı ücretsiz çıkar" },
      { href:"/gokyuzu.html",        ad:"✦ Gökyüzü",                alt:"Şu an gökyüzü & günün fısıltısı" },
      { href:"/bugun-gokyuzu.html",  ad:"✦ Bugün Gökyüzü",          alt:"Gezegen dereceleri, retrolar, dolunay takvimi" },
      { href:"/ay-takvimi.html",     ad:"✦ Ay Takvimi",             alt:"Bugünün ay evresi ve ritüeli" },
      { href:"/zaman-makinesi.html", ad:"✦ Gökyüzü Zaman Makinesi", alt:"O gün gökyüzü nasıldı?" },
      { href:"/dugun-tarihi-hesaplama.html", ad:"✦ Düğün Tarihi Hesaplama", alt:"Nikah, nişan ve düğün için en uygun gün" },
      { href:"/haritada-evlilik-gostergeleri.html", ad:"✦ Evlilik Göstergelerim", alt:"7. ev, Juno ve Vertex hesaplama" },
      { href:"/lilith-burcu-hesaplama.html", ad:"✦ Lilith Burcu Hesaplama", alt:"Kara Ay Lilith hangi burçta, hangi evde?" },
      { href:"/yaz-saati-dogum-saati.html", ad:"✦ Doğduğum Gün Yaz Saati", alt:"Doğum saatinin UTC karşılığı"  }
    ]},
    { baslik:"Sor & Yorumla", items:[
      { href:"/asterna.html",        ad:"✦ Asterna",        alt:"Yapay zekâ rehberin — her şeyi sor" },
      { href:"/ruya-sembolu.html",   ad:"✦ Rüya Sembolü",   alt:"Rüyandaki motif ne anlatıyor?" },
      { href:"/gunun-kartin.html",   ad:"✦ Günün Kartın",   alt:"Bugüne özel arkana kartın" },
       { href:"/kozmik-nabiz.html",   ad:"✦ Kozmik Nabzın",      alt:"Bugüne özel kelimen, rengin ve yansıman" }
    ]},
    { baslik:"Testler & Sayılar", items:[
      { href:"/hangi-burcsun.html",  ad:"✦ Hangi Burçsun?",    alt:"10 soruluk eğlenceli test" },
      { href:"/uyum-testi.html",     ad:"✦ Uyum Testi",        alt:"Sen & O ne kadar uyumlusunuz?" },
      { href:"/hayatina-kim-giriyor.html", ad:"✦ Hayatına Kim Giriyor?", alt:"Onun gezegenleri senin hangi evine düşüyor?" },
      { href:"/evlenecegin-kisiyle-nerede-tanisirsin.html", ad:"✦ Nerede Tanışacaksın?", alt:"Evleneceğin kişiyle tanışma sahnen" },
      { href:"/eski-sevgili-geri-doner-mi.html", ad:"✦ Eski Sevgili Geri Döner mi?", alt:"Dönüşün şekli ve eski sevgili dönemi" },
      { href:"/yasam-yolu.html",     ad:"✦ Yaşam Yolu Sayın",  alt:"Doğum tarihinden anında" },
      { href:"/isim-titresimi.html", ad:"✦ İsminin Titreşimi", alt:"Bir ismin sayısal titreşimi" },
      { href:"/astro-ikizin.html",   ad:"✦ Astro İkizin",      alt:"Doğduğun günün mitolojik ikizi" }
    ]},
    { baslik:"Rehberler", items:[
      { href:"/burclar.html",   ad:"✦ Burç Profilleri",   alt:"12 burcun karakteri ve özellikleri" },
      { href:"/arkanalar.html", ad:"✦ Arkana Profilleri", alt:"22 Majör Arkana ve anlamları" }
    ]},
    { baslik:"Hakkında", items:[
      { href:"/hakkimizda.html", ad:"✦ Astro Yuvam Nedir?", alt:"Nasıl hesaplıyoruz, nasıl yazıyoruz" },
      { href:"/fiyatlar.html", ad:"✦ Rapor Fiyatları", alt:"18 rapor, fiyat ve sayfa sayısı" },
      { href:"/ucretsiz-astroloji-araclari.html", ad:"✦ Tüm Ücretsiz Araçlar", alt:"30 araç, üyelik gerekmez" },
      { href:"/#nasil-calisir", ad:"✦ Nasıl Çalışır?", alt:"4 adımda kişisel raporun" },
      { href:"/#sss",           ad:"✦ Sıkça Sorulanlar", alt:"Merak edilenlerin cevabı" }
    ]}
  ];

  // ——— BURÇ YORUMLARI açılır menüsü (basit — doğrudan seçenekler; günlük yorumlar Ekim 2026'da kaldırıldı) ———
  var BURC = [
    { href:"/haftalik-burc-yorumlari.html", ad:"✦ Haftalık Burç Yorumları", alt:"Bu haftanın genel gidişatı" },
    { href:"/2027-burc-yorumlari.html",     ad:"✦ 2027 Burç Yorumları",     alt:"12 burç için yıl boyu rehber" }
  ];

  var LINKLER = [
    { href:"/yildiz-gunlugu.html", ad:"Yıldız Günlüğü" }
  ];

  var CSS = ''
  + '.am-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:820px;margin:0 auto;padding:18px 20px;font-family:"Segoe UI",system-ui,sans-serif}'
  + '.am-brand{font-family:Georgia,"Times New Roman",serif;font-size:18px;letter-spacing:2px;color:#d9b96a;font-weight:bold;white-space:nowrap;text-decoration:none}'
  + '.am-links{display:flex;gap:18px;font-size:14px;align-items:center;white-space:nowrap}'
  + '.am-links>a{color:#f0e6d2;opacity:.82;text-decoration:none;transition:color .2s,opacity .2s}'
  + '.am-links>a:hover{opacity:1;color:#e7cf95}'
  + '.am-dropdown{position:relative;display:inline-block}'
  + '.am-drop-btn{background:none;border:none;color:#f0e6d2;opacity:.82;font:inherit;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:0;transition:color .2s,opacity .2s}'
  + '.am-drop-btn:hover,.am-drop-btn[aria-expanded="true"]{opacity:1;color:#e7cf95}'
  + '.am-caret{font-size:11px;transition:transform .2s}'
  + '.am-drop-btn[aria-expanded="true"] .am-caret{transform:rotate(180deg)}'
  + '.am-drop-menu{position:absolute;top:calc(100% + 12px);right:0;min-width:262px;background:#241c3d;border:1px solid #332a4d;border-radius:12px;padding:8px;box-shadow:0 16px 40px rgba(0,0,0,.5);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .18s,transform .18s,visibility .18s;z-index:60;text-align:left}'
  + '.am-dropdown.open .am-drop-menu{opacity:1;visibility:visible;transform:translateY(0)}'
  // ——— AKORDİYON KATEGORİ ———
  + '.am-cat + .am-cat{border-top:1px solid #2c2545;margin-top:2px}'
  + '.am-cat-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;background:none;border:none;cursor:pointer;font:inherit;color:#d9b96a;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;opacity:.9;padding:12px 12px;text-align:left;border-radius:8px;transition:background .15s,color .15s,opacity .15s}'
  + '.am-cat-btn:hover{opacity:1;color:#e7cf95;background:rgba(217,185,106,.06)}'
  + '.am-cat-caret{font-size:10px;opacity:.75;transition:transform .22s}'
  + '.am-cat.open>.am-cat-btn{color:#e7cf95;opacity:1}'
  + '.am-cat.open>.am-cat-btn .am-cat-caret{transform:rotate(180deg)}'
  + '.am-cat-items{display:grid;grid-template-rows:0fr;transition:grid-template-rows .22s ease}'
  + '.am-cat.open>.am-cat-items{grid-template-rows:1fr}'
  + '.am-cat-inner{overflow:hidden;min-height:0}'
  // ——— ARAÇ LİNKLERİ ———
  + '.am-drop-menu a{display:block;padding:10px 12px;border-radius:8px;color:#f0e6d2;font-size:14.5px;text-decoration:none;transition:background .15s}'
  + '.am-drop-menu a:hover{background:rgba(217,185,106,.10);color:#e7cf95}'
  + '.am-drop-menu a[aria-current="page"]{color:#e7cf95;background:rgba(217,185,106,.08)}'
  + '.am-sub{display:block;font-size:12px;color:#9a8fb8;margin-top:2px}'
  + '.am-cta{color:#d9b96a !important;opacity:1 !important;font-weight:bold;border:1px solid #332a4d;padding:7px 16px;border-radius:20px;transition:background .2s,border-color .2s}'
  + '.am-cta:hover{background:rgba(217,185,106,.12);border-color:#d9b96a}'
  + '@media (max-width:600px){.am-nav{flex-wrap:wrap;justify-content:center}.am-links{flex-wrap:wrap;justify-content:center;position:relative}'
  // Mobilde menü sayfanın ÜSTÜNE yüzer (düzeni itmez) ve menü çubuğunun altında TAM ORTADA açılır.
  // .am-dropdown static → menü .am-links'e göre konumlanır (ekran ortası), kenara taşmaz.
  + '.am-dropdown{position:static}'
  + '.am-drop-menu{left:50%;right:auto;transform:translate(-50%,-6px);width:min(88vw,320px);min-width:0}'
  + '.am-dropdown.open .am-drop-menu{transform:translate(-50%,0)}}'
  + '#ay-cerez{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#1b1530;border-top:1px solid #332a4d;box-shadow:0 -12px 34px rgba(0,0,0,.45);transform:translateY(100%);transition:transform .32s ease;font-family:"Segoe UI",system-ui,sans-serif}'
  + '#ay-cerez.ac-in{transform:translateY(0)}'
  + '.ay-cerez-in{max-width:980px;margin:0 auto;padding:14px 22px;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}'
  + '.ay-cerez-tx{margin:0;color:#f0e6d2;opacity:.9;font-size:13.5px;line-height:1.55;flex:1;min-width:230px}'
  + '.ay-cerez-tx a{color:#e7cf95;text-decoration:underline}'
  + '.ay-cerez-bt{display:flex;gap:10px;flex-shrink:0}'
  + '.ay-cerez-kabul{background:linear-gradient(180deg,#e7cf95,#d9b96a);border:none;color:#1a1428;font:inherit;font-weight:bold;font-size:13.5px;padding:9px 26px;border-radius:20px;cursor:pointer;transition:filter .2s}'
  + '.ay-cerez-kabul:hover{filter:brightness(1.06)}'
  + '@media (max-width:600px){.ay-cerez-in{padding:12px 16px}.ay-cerez-bt{width:100%}.ay-cerez-kabul{flex:1}}'
  + '@media (prefers-reduced-motion:reduce){#ay-cerez{transition:none}}'
  + '@media (prefers-reduced-motion:reduce){.am-drop-menu,.am-caret,.am-cat-caret,.am-cat-items,.am-links>a,.am-cta{transition:none !important}}';

  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  // Düz bir link listesini (BURÇ gibi) menü <a> etiketlerine çevirir
  function linkItemsHTML(list, simdi){
    return list.map(function(t){
      var dosya = t.href.split("/").pop().toLowerCase();
      var current = (dosya === simdi) ? ' aria-current="page"' : '';
      var altHTML = t.alt ? '<span class="am-sub">'+esc(t.alt)+'</span>' : '';
      return '<a href="'+t.href+'" role="menuitem"'+current+'>'+esc(t.ad)+altHTML+'</a>';
    }).join("");
  }

  function init(){
    // Stil (sayfa menü stilini hazır getirdiyse tekrar eklenmez)
    if(!document.getElementById("am-kritik")){
      var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    } else if(!document.getElementById("ay-cerez-kritik")){
      // Hazır stil yalnızca menüyü içeriyorsa çerez bandı stilini ekle
      var st2 = document.createElement("style"); st2.textContent = CSS.slice(CSS.indexOf("#ay-cerez")); document.head.appendChild(st2);
    }

    // Çerez onayı bandı + onaya bağlı GA
    cerezBaslat();

    // Asterna sağ-alt yardımcı balonu — tüm sayfalara buradan tek satırla yüklenir.
    // Sayfa çizildikten hemen sonra yüklenir (ilk görüntüyü geciktirmesin).
    sonraYukle(function(){
      if(document.getElementById("asterna-widget-js")) return;
      var aw = document.createElement("script");
      aw.id = "asterna-widget-js"; aw.src = "/asterna-widget.js"; aw.async = true;
      document.body.appendChild(aw);
    }, 0, true);

    // Uygulama (PWA) desteği: sayfa tamamen yüklendikten 3 sn sonra — ilk görüntüyü ve hız puanını etkilemez.
    sonraYukle(function(){
      if(document.getElementById("ay-pwa-js")) return;
      var pw = document.createElement("script");
      pw.id = "ay-pwa-js"; pw.src = "/pwa.js"; pw.async = true;
      document.body.appendChild(pw);
    }, 3000, false);

    // Şu anki sayfa (aria-current için)
    var simdi = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    // Keşfet: her kategori = tıklanınca açılıp kapanan bir blok
    var araclarHTML = GRUPLAR.map(function(g){
      var linkler = g.items.map(function(t){
        var dosya = t.href.split("/").pop().toLowerCase();
        var current = (dosya === simdi) ? ' aria-current="page"' : '';
        return '<a href="'+t.href+'" role="menuitem"'+current+'>'+esc(t.ad)+'<span class="am-sub">'+esc(t.alt)+'</span></a>';
      }).join("");
      return '<div class="am-cat">'
           +   '<button type="button" class="am-cat-btn" aria-expanded="false">'+esc(g.baslik)+'<span class="am-cat-caret">▾</span></button>'
           +   '<div class="am-cat-items"><div class="am-cat-inner">'+linkler+'</div></div>'
           + '</div>';
    }).join("");

    // Burç Yorumları: iki doğrudan seçenek
    var burcHTML = linkItemsHTML(BURC, simdi);

    var linklerHTML = LINKLER.map(function(l){ return '<a href="'+l.href+'">'+esc(l.ad)+'</a>'; }).join("");

    // Giriş yapılmışsa "Günlük Yorumum" + "Profilim", yapılmamışsa "Giriş"
    var HESAP = [
      { href:"/panelim.html",        ad:"✦ Kozmik Panelim",  alt:"Bugün gökyüzü senin için" },
      { href:"/gunluk-yorumum.html", ad:"✦ Günlük Yorumum",  alt:"Sana özel günlük yorum" },
      { href:"/profil.html",         ad:"✦ Profilim",        alt:"Bilgilerim ve kayıtlı kişilerim" }
    ];
    var hesapHTML = oturumAcikMi()
      ? '<div class="am-dropdown">'
        + '<button type="button" class="am-drop-btn" aria-haspopup="true" aria-expanded="false">Hesabım <span class="am-caret">▾</span></button>'
        + '<div class="am-drop-menu" role="menu">'+linkItemsHTML(HESAP, simdi)+'</div>'
        + '</div>'
      : '<a href="/giris.html">Giriş</a>';

    var html = ''
    + '<nav class="am-nav">'
    +   '<a class="am-brand" href="/">✦ ASTRO YUVAM</a>'
    +   '<div class="am-links">'
    +     '<div class="am-dropdown">'
    +       '<button type="button" class="am-drop-btn" aria-haspopup="true" aria-expanded="false">Keşfet <span class="am-caret">▾</span></button>'
    +       '<div class="am-drop-menu" role="menu">'+araclarHTML+'</div>'
    +     '</div>'
    +     '<div class="am-dropdown">'
    +       '<button type="button" class="am-drop-btn" aria-haspopup="true" aria-expanded="false">Burç Yorumları <span class="am-caret">▾</span></button>'
    +       '<div class="am-drop-menu" role="menu">'+burcHTML+'</div>'
    +     '</div>'
    +     linklerHTML
    +     hesapHTML
    +     '<a href="/#cards" class="am-cta">Raporlar</a>'
    +   '</div>'
    + '</nav>';

    var mount = document.getElementById("astro-menu");
    // Sayfa menüyü hazır getirdiyse (ör. ana sayfa) ve içerik aynıysa yeniden kurma — ilk çizimi hızlandırır.
    if(mount){ if(mount.innerHTML !== html) mount.innerHTML = html; }
    else { document.body.insertAdjacentHTML("afterbegin", '<div id="astro-menu">'+html+'</div>'); mount = document.getElementById("astro-menu"); }

    // Sayfada birden fazla açılır menü olabilir (Keşfet + Burç Yorumları)
    var dropdowns = mount.querySelectorAll(".am-dropdown");
    if(!dropdowns.length) return;

    // Bir menünün içindeki akordiyon kategorileri kapat (varsa — Keşfet'te var)
    function kategorileriKapat(dd){
      var acik = dd.querySelectorAll(".am-cat.open");
      Array.prototype.forEach.call(acik, function(c){
        c.classList.remove("open");
        var cb = c.querySelector(".am-cat-btn"); if(cb) cb.setAttribute("aria-expanded","false");
      });
    }
    function dropKapat(dd){
      dd.classList.remove("open");
      var b = dd.querySelector(".am-drop-btn"); if(b) b.setAttribute("aria-expanded","false");
      kategorileriKapat(dd);
    }
    function hepsiniKapat(haric){
      Array.prototype.forEach.call(dropdowns, function(dd){ if(dd !== haric) dropKapat(dd); });
    }

    Array.prototype.forEach.call(dropdowns, function(dd){
      var btn = dd.querySelector(".am-drop-btn");
      if(!btn) return;

      // Menü başlığı aç/kapa — açarken diğer menüleri kapat
      btn.addEventListener("click", function(e){
        e.stopPropagation();
        if(dd.classList.contains("open")){
          dropKapat(dd);
        } else {
          hepsiniKapat(dd);
          dd.classList.add("open");
          btn.setAttribute("aria-expanded","true");
        }
      });

      // Akordiyon kategori başlıkları (yalnızca Keşfet'te var; Burç Yorumları'nda yok)
      var catBtns = dd.querySelectorAll(".am-cat-btn");
      Array.prototype.forEach.call(catBtns, function(cb){
        cb.addEventListener("click", function(e){
          e.stopPropagation();
          var cat = cb.parentNode;
          var acildi = cat.classList.toggle("open");
          cb.setAttribute("aria-expanded", acildi ? "true" : "false");
        });
      });
    });

    // Dışarı tıkla → açık olan menüleri kapat
    document.addEventListener("click", function(e){
      Array.prototype.forEach.call(dropdowns, function(dd){
        if(dd.classList.contains("open") && !dd.contains(e.target)) dropKapat(dd);
      });
    });
    // Esc → hepsini kapat
    document.addEventListener("keydown", function(e){ if(e.key === "Escape") hepsiniKapat(null); });
  }

  // Menü sayfaya hazır gömülüyse (ana sayfa) kurulum ilk çizimden sonraya bırakılır; değilse hemen kurulur.
  function basla(){
    var m = document.getElementById("astro-menu");
    if(m && m.querySelector(".am-nav")){ requestAnimationFrame(function(){ setTimeout(init, 0); }); }
    else init();
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla);
  else basla();
})();
