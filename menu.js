/* menu.js — Astro Yuvam ortak üst menüsü.
   Tek kaynak: yeni bir ücretsiz araç eklemek için yalnızca aşağıdaki ARACLAR dizisine
   tek satır ekle; menü tüm sayfalarda otomatik güncellenir.
   Her sayfada iki şey bulunur: bir "astro-menu" kimlikli boş div, ve /menu.js dosyasını
   defer ile yükleyen bir script etiketi. */
(function(){
  // ——— YENİ ARAÇ EKLEMEK İÇİN TEK YER ———
  // Kategorili menü: her yeni araç ilgili grubun items dizisine tek satır.
  var GRUPLAR = [
    { baslik:"Gökyüzü & Ay", items:[
      { href:"/gokyuzu.html",    ad:"✦ Gökyüzü",     alt:"Şu an gökyüzü & günün fısıltısı" },
      { href:"/ay-takvimi.html", ad:"✦ Ay Takvimi",  alt:"Bugünün ay evresi ve ritüeli" }
    ]},
    { baslik:"Sor & Yorumla", items:[
      { href:"/yildizlara-sor.html", ad:"✦ Yıldızlara Sor", alt:"Kavramları sor, öğren" },
      { href:"/ruya-sembolu.html",   ad:"✦ Rüya Sembolü",   alt:"Rüyandaki motif ne anlatıyor?" }
    ]},
    { baslik:"Testler & Sayılar", items:[
      { href:"/hangi-burcsun.html",  ad:"✦ Hangi Burçsun?",    alt:"10 soruluk eğlenceli test" },
      { href:"/yasam-yolu.html",     ad:"✦ Yaşam Yolu Sayın",  alt:"Doğum tarihinden anında" },
      { href:"/isim-titresimi.html", ad:"✦ İsminin Titreşimi", alt:"Bir ismin sayısal titreşimi" }
    ]},
    { baslik:"Rehberler", items:[
      { href:"/burclar.html",   ad:"✦ Burç Profilleri",   alt:"12 burcun karakteri ve özellikleri" },
      { href:"/arkanalar.html", ad:"✦ Arkana Profilleri", alt:"22 Majör Arkana ve anlamları" }
    ]}
  ];
  var LINKLER = [
    { href:"/yildiz-gunlugu.html", ad:"Yıldız Günlüğü" },
    { href:"/#nasil-calisir", ad:"Nasıl Çalışır?" },
    { href:"/#sss",           ad:"S.S.S." }
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
  + '.am-drop-menu{position:absolute;top:calc(100% + 12px);right:0;min-width:252px;background:#241c3d;border:1px solid #332a4d;border-radius:12px;padding:8px;box-shadow:0 16px 40px rgba(0,0,0,.5);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .18s,transform .18s,visibility .18s;z-index:60;text-align:left}'
  + '.am-dropdown.open .am-drop-menu{opacity:1;visibility:visible;transform:translateY(0)}'
  + '.am-drop-head{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#d9b96a;opacity:.85;padding:8px 12px 6px}'
  + '.am-drop-menu a + .am-drop-head{margin-top:6px;border-top:1px solid #2c2545;padding-top:12px}'
  + '.am-drop-menu a{display:block;padding:10px 12px;border-radius:8px;color:#f0e6d2;font-size:14.5px;text-decoration:none;transition:background .15s}'
  + '.am-drop-menu a:hover{background:rgba(217,185,106,.10);color:#e7cf95}'
  + '.am-drop-menu a[aria-current="page"]{color:#e7cf95;background:rgba(217,185,106,.08)}'
  + '.am-sub{display:block;font-size:12px;color:#9a8fb8;margin-top:2px}'
  + '.am-cta{color:#d9b96a !important;opacity:1 !important;font-weight:bold;border:1px solid #332a4d;padding:7px 16px;border-radius:20px;transition:background .2s,border-color .2s}'
  + '.am-cta:hover{background:rgba(217,185,106,.12);border-color:#d9b96a}'
  + '@media (max-width:600px){.am-nav{flex-wrap:wrap;justify-content:center}.am-links{flex-wrap:wrap;justify-content:center}'
  + '.am-dropdown{position:static}.am-drop-menu{position:static;opacity:1;visibility:visible;transform:none;box-shadow:none;margin:6px auto 0;display:none;min-width:220px}'
  + '.am-dropdown.open .am-drop-menu{display:block}}'
  + '@media (prefers-reduced-motion:reduce){.am-drop-menu,.am-caret,.am-links>a,.am-cta{transition:none !important}}';

  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  function init(){
    // Stil
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

    // Şu anki sayfa (aria-current için)
    var simdi = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    var araclarHTML = GRUPLAR.map(function(g){
      var linkler = g.items.map(function(t){
        var dosya = t.href.split("/").pop().toLowerCase();
        var current = (dosya === simdi) ? ' aria-current="page"' : '';
        return '<a href="'+t.href+'" role="menuitem"'+current+'>'+esc(t.ad)+'<span class="am-sub">'+esc(t.alt)+'</span></a>';
      }).join("");
      return '<div class="am-drop-head">'+esc(g.baslik)+'</div>'+linkler;
    }).join("");

    var linklerHTML = LINKLER.map(function(l){ return '<a href="'+l.href+'">'+esc(l.ad)+'</a>'; }).join("");

    var html = ''
    + '<nav class="am-nav">'
    +   '<a class="am-brand" href="/">✦ ASTRO YUVAM</a>'
    +   '<div class="am-links">'
    +     '<div class="am-dropdown">'
    +       '<button type="button" class="am-drop-btn" aria-haspopup="true" aria-expanded="false">Keşfet <span class="am-caret">▾</span></button>'
    +       '<div class="am-drop-menu" role="menu">'+araclarHTML+'</div>'
    +     '</div>'
    +     linklerHTML
    +     '<a href="/#cards" class="am-cta">Raporlar</a>'
    +   '</div>'
    + '</nav>';

    var mount = document.getElementById("astro-menu");
    if(mount){ mount.innerHTML = html; }
    else { document.body.insertAdjacentHTML("afterbegin", '<div id="astro-menu">'+html+'</div>'); }

    // Açılır menü davranışı
    var dd = document.querySelector(".am-dropdown");
    if(dd){
      var btn = dd.querySelector(".am-drop-btn");
      btn.addEventListener("click", function(e){ e.stopPropagation(); var o = dd.classList.toggle("open"); btn.setAttribute("aria-expanded", o ? "true":"false"); });
      document.addEventListener("click", function(e){ if(dd.classList.contains("open") && !dd.contains(e.target)){ dd.classList.remove("open"); btn.setAttribute("aria-expanded","false"); } });
      document.addEventListener("keydown", function(e){ if(e.key === "Escape" && dd.classList.contains("open")){ dd.classList.remove("open"); btn.setAttribute("aria-expanded","false"); } });
    }
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
