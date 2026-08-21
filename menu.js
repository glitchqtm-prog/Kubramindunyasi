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
  // ——— Google Analytics 4 — GÖRÜNMEZ ölçüm (ziyaretçiye hiçbir şey göstermez;
  //     veriyi yalnızca site sahibi kendi GA panelinden görür). Tüm sayfalarda çalışır. ———
  (function loadGA(){
    var GA_ID = "G-QQ0SREFL4L";
    if(window.__gaYuklendi) return;   // aynı sayfada iki kez yüklenmesin
    window.__gaYuklendi = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID);
  })();

  // ——— YENİ ARAÇ EKLEMEK İÇİN TEK YER ———
  // Kategorili menü: her yeni araç ilgili grubun items dizisine tek satır.
  var GRUPLAR = [
    { baslik:"Gökyüzü & Ay", items:[
      { href:"/gokyuzu.html",        ad:"✦ Gökyüzü",                alt:"Şu an gökyüzü & günün fısıltısı" },
      { href:"/ay-takvimi.html",     ad:"✦ Ay Takvimi",             alt:"Bugünün ay evresi ve ritüeli" },
      { href:"/zaman-makinesi.html", ad:"✦ Gökyüzü Zaman Makinesi", alt:"O gün gökyüzü nasıldı?" }
    ]},
    { baslik:"Sor & Yorumla", items:[
      { href:"/yildizlara-sor.html", ad:"✦ Yıldızlara Sor", alt:"Kavramları sor, öğren" },
      { href:"/ruya-sembolu.html",   ad:"✦ Rüya Sembolü",   alt:"Rüyandaki motif ne anlatıyor?" },
      { href:"/gunun-kartin.html",   ad:"✦ Günün Kartın",   alt:"Bugüne özel arkana kartın" },
       { href:"/kozmik-nabiz.html",   ad:"✦ Kozmik Nabzın",      alt:"Bugüne özel kelimen, rengin ve yansıman" }
    ]},
    { baslik:"Testler & Sayılar", items:[
      { href:"/hangi-burcsun.html",  ad:"✦ Hangi Burçsun?",    alt:"10 soruluk eğlenceli test" },
      { href:"/uyum-testi.html",     ad:"✦ Uyum Testi",        alt:"Sen & O ne kadar uyumlusunuz?" },
      { href:"/yasam-yolu.html",     ad:"✦ Yaşam Yolu Sayın",  alt:"Doğum tarihinden anında" },
      { href:"/isim-titresimi.html", ad:"✦ İsminin Titreşimi", alt:"Bir ismin sayısal titreşimi" },
      { href:"/astro-ikizin.html",   ad:"✦ Astro İkizin",      alt:"Doğduğun günün mitolojik ikizi" }
    ]},
    { baslik:"Rehberler", items:[
      { href:"/burclar.html",   ad:"✦ Burç Profilleri",   alt:"12 burcun karakteri ve özellikleri" },
      { href:"/arkanalar.html", ad:"✦ Arkana Profilleri", alt:"22 Majör Arkana ve anlamları" }
    ]},
    { baslik:"Hakkında", items:[
      { href:"/#nasil-calisir", ad:"✦ Nasıl Çalışır?", alt:"4 adımda kişisel raporun" },
      { href:"/#sss",           ad:"✦ Sıkça Sorulanlar", alt:"Merak edilenlerin cevabı" }
    ]}
  ];

  // ——— BURÇ YORUMLARI açılır menüsü (basit — iki doğrudan seçenek) ———
  var BURC = [
    { href:"/gunluk-burc-yorumlari.html",   ad:"✦ Günlük Burç Yorumları",   alt:"12 burç için bugünün enerjisi" },
    { href:"/haftalik-burc-yorumlari.html", ad:"✦ Haftalık Burç Yorumları", alt:"Bu haftanın genel gidişatı" }
  ];

  var LINKLER = [
    { href:"/yildiz-gunlugu.html", ad:"Yıldız Günlüğü" }
  ];

  var CSS = ''
  + '.am-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:760px;margin:0 auto;padding:18px 20px;font-family:"Segoe UI",system-ui,sans-serif}'
  + '.am-brand{font-family:Georgia,"Times New Roman",serif;font-size:18px;letter-spacing:2px;color:#d9b96a;font-weight:bold;white-space:nowrap;text-decoration:none}'
  + '.am-links{display:flex;gap:18px;font-size:14px;align-items:center}'
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
  + '@media (max-width:600px){.am-nav{flex-wrap:wrap;justify-content:center}.am-links{flex-wrap:wrap;justify-content:center}'
  + '.am-dropdown{position:static}.am-drop-menu{position:static;opacity:1;visibility:visible;transform:none;box-shadow:none;margin:6px auto 0;display:none;min-width:240px}'
  + '.am-dropdown.open .am-drop-menu{display:block}}'
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
    // Stil
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

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
    +     '<a href="/#cards" class="am-cta">Raporlar</a>'
    +   '</div>'
    + '</nav>';

    var mount = document.getElementById("astro-menu");
    if(mount){ mount.innerHTML = html; }
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

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
