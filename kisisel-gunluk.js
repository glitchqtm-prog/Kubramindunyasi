/* kisisel-gunluk.js — Günlük/Haftalık burç yorumu sayfalarındaki "Sana Özel" bölümü.
 * Üye girişi (Supabase) varsa profil bilgisiyle /api/kisisel-yorum'dan kişisel yorum getirir;
 * yoksa buton "Giriş yap" olur. Bölüm data-tur="gunluk|haftalik" ile çalışır. Kendine yeter. */
(function () {
  var sec = document.getElementById("kisisel-yorum");
  if (!sec) return;
  var tur = sec.getAttribute("data-tur") === "haftalik" ? "weekly" : "daily";
  var turAd = tur === "weekly" ? "haftalık" : "günlük";
  var turBtn = tur === "weekly" ? "Haftalık" : "Günlük";
  var BACKEND = "https://astro-rapor.onrender.com";
  var SUPABASE_URL = "https://htyywgmgbmzhrqtgihqd.supabase.co";
  var SUPABASE_KEY = "sb_publishable_S1Bm79ihKGNyjY7R7yIwfQ_U4K6JJYM";

  var form = sec.querySelector("#ky-form"),
      dEl = sec.querySelector("#ky-date"),
      tEl = sec.querySelector("#ky-time"),
      btn = sec.querySelector("#ky-btn"),
      sonuc = sec.querySelector("#ky-sonuc"),
      notEl = sec.querySelector("#ky-not");
  if (!form || !btn) return;
  var profil = null, sb = null, mod = "giris";

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function parasHTML(t){
    var p = String(t||"").split(/\n\s*\n/).map(function(x){ return x.trim(); }).filter(Boolean);
    if(!p.length) p=[String(t||"").trim()];
    return p.map(function(x){ return "<p>"+esc(x).replace(/\n/g,"<br>")+"</p>"; }).join("");
  }
  function setGiris(){ mod="giris"; btn.textContent="Giriş yap ✦"; }
  function setUret(){ mod="uret"; btn.textContent=turBtn+" yorumumu oluştur ✦"; }

  function supaYukle(cb){
    if(window.supabase && window.supabase.createClient) return cb();
    var s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.onload=cb; s.onerror=function(){ cb(); };
    document.head.appendChild(s);
  }

  supaYukle(function(){
    try{ if(window.supabase && window.supabase.createClient){ sb=window.__ksSb||window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY); window.__ksSb=sb; } }catch(e){}
    if(!sb){ setGiris(); return; }
    sb.auth.getSession().then(function(res){
      var sess=res&&res.data&&res.data.session;
      if(!sess){ setGiris(); return; }
      var m=sess.user.user_metadata||{};
      profil={ name:m.full_name||"", birthDate:m.birth_date||"", birthTime:m.birth_time||"", birthPlace:m.birth_place||"" };
      setUret();
      if(profil.birthDate && dEl) dEl.value=profil.birthDate;
      if(profil.birthTime && tEl) tEl.value=profil.birthTime;
      if(!profil.birthPlace && notEl) notEl.textContent="İpucu: Daha isabetli bir okuma için profiline doğum yerini ekleyebilirsin.";
    }).catch(function(){ setGiris(); });
  });

  form.addEventListener("submit", function(e){
    e.preventDefault();
    if(mod==="giris"){ location.href="/giris.html"; return; }
    var bd=dEl?dEl.value:"";
    if(!/^\d{4}-\d{2}-\d{2}$/.test(bd)){ if(notEl) notEl.textContent="Lütfen önce doğum tarihini gir."; return; }
    var yer=(profil&&profil.birthPlace)?profil.birthPlace:"Türkiye";
    var eski=btn.textContent; btn.disabled=true; btn.textContent="Yıldızlar okunuyor…";
    if(sonuc){ sonuc.hidden=false; sonuc.innerHTML='<div class="ky-yukleniyor">Gökyüzü hesaplanıyor, birkaç saniye sürebilir… ✦</div>'; }
    fetch(BACKEND+"/api/kisisel-yorum",{
      method:"POST", headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ type:tur, name:(profil&&profil.name)||"", birthDate:bd, birthTime:(tEl?tEl.value:"")||"", birthPlace:yer })
    })
    .then(function(r){ return r.json().catch(function(){ return {}; }); })
    .then(function(d){
      btn.disabled=false; btn.textContent=eski;
      if(!d||!d.ok){ if(sonuc) sonuc.innerHTML='<div class="ky-hata">'+esc((d&&d.mesaj)||"Şu an oluşturulamadı, birazdan tekrar dener misin?")+'</div>'; return; }
      if(sonuc){
        sonuc.innerHTML='<div class="ky-baslik">✦ Sana özel '+turAd+' yorumun</div><div class="ky-metin">'+parasHTML(d.content)+'</div>';
        try{ sonuc.scrollIntoView({ behavior:"smooth", block:"nearest" }); }catch(e){}
      }
    })
    .catch(function(){ btn.disabled=false; btn.textContent=eski; if(sonuc) sonuc.innerHTML='<div class="ky-hata">Bağlantı kurulamadı, tekrar dener misin?</div>'; });
  });
})();
