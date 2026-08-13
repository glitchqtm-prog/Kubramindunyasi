#!/usr/bin/env node
/* Astro Yuvam — Günlük & Haftalık Burç Yorumu Üreticisi
   GitHub Actions içinde her sabah çalışır:
   1) Gerçek gökyüzünü hesaplar (Ay burcu, Güneş mevsimi, Ay evresi) — astronomy-engine.
   2) Anthropic API'ye 12 burç için TR yorum ürettirir (günlük her gün; haftalık haftada bir).
   3) Sonuçları statik HTML sayfalara döker (gunluk-/haftalik-burc-yorumlari klasörleri + hub'lar).
   Tasarım: sitenin lacivert-altın şablonuyla birebir. Üretim başarısız olursa HİÇBİR dosya
   yazılmaz (mevcut iyi sayfalar korunur) ve süreç hata koduyla biter.

   Gerekli ortam değişkenleri:
     ANTHROPIC_API_KEY  (zorunlu)
     AI_MODEL           (opsiyonel; verilmezse aşağıdaki varsayılan)
*/
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import * as A from "astronomy-engine";

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL   = process.env.AI_MODEL || "claude-haiku-4-5-20251001";
if (!API_KEY) { console.error("HATA: ANTHROPIC_API_KEY tanımlı değil."); process.exit(1); }

/* ---------- Burç verisi (sıra sabit: prompt ve render aynı sırayı kullanır) ---------- */
const BURCLAR = [
  { slug:"koc",     ad:"Koç",     glif:"♈", aralik:"21 Mart – 19 Nisan",   doga:"ateş, öncü, atılgan" },
  { slug:"boga",    ad:"Boğa",    glif:"♉", aralik:"20 Nisan – 20 Mayıs",   doga:"toprak, sabit, istikrarlı" },
  { slug:"ikizler", ad:"İkizler", glif:"♊", aralik:"21 Mayıs – 20 Haziran", doga:"hava, değişken, meraklı" },
  { slug:"yengec",  ad:"Yengeç",  glif:"♋", aralik:"21 Haziran – 22 Temmuz",doga:"su, öncü, duygusal" },
  { slug:"aslan",   ad:"Aslan",   glif:"♌", aralik:"23 Temmuz – 22 Ağustos",doga:"ateş, sabit, cömert" },
  { slug:"basak",   ad:"Başak",   glif:"♍", aralik:"23 Ağustos – 22 Eylül", doga:"toprak, değişken, titiz" },
  { slug:"terazi",  ad:"Terazi",  glif:"♎", aralik:"23 Eylül – 22 Ekim",    doga:"hava, öncü, dengeci" },
  { slug:"akrep",   ad:"Akrep",   glif:"♏", aralik:"23 Ekim – 21 Kasım",    doga:"su, sabit, tutkulu" },
  { slug:"yay",     ad:"Yay",     glif:"♐", aralik:"22 Kasım – 21 Aralık",  doga:"ateş, değişken, özgür" },
  { slug:"oglak",   ad:"Oğlak",   glif:"♑", aralik:"22 Aralık – 19 Ocak",   doga:"toprak, öncü, disiplinli" },
  { slug:"kova",    ad:"Kova",    glif:"♒", aralik:"20 Ocak – 18 Şubat",    doga:"hava, sabit, özgün" },
  { slug:"balik",   ad:"Balık",   glif:"♓", aralik:"19 Şubat – 20 Mart",    doga:"su, değişken, hayalperest" },
];
const BURC_ADLARI = BURCLAR.map(b=>b.ad); // gökyüzü burç adı için

/* ---------- Tarih / gökyüzü yardımcıları ---------- */
const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const GUNLER = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

// İstanbul (UTC+3, DST yok) yerel zamanı
function istanbulNow(){ const n=new Date(); return new Date(n.getTime()+n.getTimezoneOffset()*60000+3*3600000); }
function tarihTR(d){ return `${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()}, ${GUNLER[d.getDay()]}`; }
function tarihKisa(d){ return `${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`; }
function isoTarih(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

function burcOfLon(lon){ return BURC_ADLARI[Math.floor(((lon%360)+360)%360/30)]; }
function ayBurcu(d){ return burcOfLon(A.EclipticGeoMoon(d).lon); }
function gunesBurcu(d){ return burcOfLon(A.SunPosition(d).elon); }
function ayEvresi(d){
  const a=A.MoonPhase(d); // 0=Yeni,90=İlk Dördün,180=Dolunay,270=Son Dördün
  if(a<22.5||a>=337.5) return "Yeni Ay";
  if(a<67.5) return "büyüyen hilal";
  if(a<112.5) return "İlk Dördün";
  if(a<157.5) return "büyüyen dolunaya yakın";
  if(a<202.5) return "Dolunay";
  if(a<247.5) return "küçülen ay";
  if(a<292.5) return "Son Dördün";
  return "küçülen hilal (Yeni Ay'a doğru)";
}
// ISO hafta kimliği (haftalık yenileme işareti)
function isoHafta(d){
  const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  const gun=(t.getUTCDay()+6)%7; t.setUTCDate(t.getUTCDate()-gun+3);
  const ilk=new Date(Date.UTC(t.getUTCFullYear(),0,4));
  const hafta=1+Math.round(((t-ilk)/86400000-3+((ilk.getUTCDay()+6)%7))/7);
  return `${t.getUTCFullYear()}-W${String(hafta).padStart(2,"0")}`;
}
// Haftanın Pazartesi–Pazar aralığı (İstanbul günbased)
function haftaAraligi(d){
  const gun=(d.getDay()+6)%7; // Pzt=0
  const pzt=new Date(d); pzt.setDate(d.getDate()-gun);
  const paz=new Date(pzt); paz.setDate(pzt.getDate()+6);
  return `${tarihKisa(pzt)} – ${tarihKisa(paz)}`;
}

/* ---------- HTML kaçış ---------- */
function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

/* ---------- Anthropic çağrısı ---------- */
async function yorumUret(tur, gokMetni){
  const kapsam = tur==="gunluk" ? "BUGÜN" : "BU HAFTA";
  const sys = `Sen Astro Yuvam için Türkçe burç yorumu yazan sıcak, olumlu ve güçlendirici bir editörsün. Ton: umut veren, yapıcı ve cesaret verici — bir zorluğu ya da riski dile getirirken bile MUTLAKA bir çıkış yolu, somut bir öneri ve olumlu bir bakış sun. ASLA kesin kehanet ya da kader hükmü değil ("olacak" değil, "eğilim/enerji/fırsat" dili). Klişeden uzak, akıcı, samimi ve okuyucuyu iyi hissettiren bir dil kullan. Bugünün gerçek gökyüzü: ${gokMetni}. Bu enerjiyi yorumlara doğal biçimde yansıt; her burcu kendi doğasına göre belirgin şekilde farklılaştır (hepsi aynı gibi olmasın).`;
  const siraliBurclar = BURCLAR.map((b,i)=>`${i}: ${b.ad} (${b.doga})`).join("\n");
  const zaman = tur==="gunluk" ? "bugünün" : "bu haftanın";
  const uzunluk = `genel, ask ve is bölümlerinin HER BİRİ 4-5 cümle olsun (dolgun ve doyurucu, tek-iki cümlelik kısa yorumlardan KAÇIN) ve şu akışı izlesin: (1) ${zaman} enerjisini/atmosferini tanı, (2) olası bir zorluğu ya da fırsatı nazikçe göster, (3) SOMUT ve uygulanabilir bir öneri ver, (4) cesaret veren, olumlu bir cümleyle kapat. tavsiye: tek, net, uygulanabilir ve olumlu bir cümle. teaser: en fazla 12 kelime, olumlu ve merak uyandıran`;
  const user = `${kapsam} için aşağıdaki 12 burcun her birine yorum yaz. Sadece GEÇERLİ JSON dizisi döndür; başka hiçbir metin, markdown ya da açıklama ekleme.
Sıra tam olarak şu olmalı (0..11):
${siraliBurclar}

Her öğe şu alanlara sahip olmalı: {"teaser": "...","genel":"...","ask":"...","is":"...","tavsiye":"..."}
Uzunluk ve akış: ${uzunluk}. Türkçe yaz, olumlu ve güçlendirici ol. 12 öğe döndür.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{ "content-type":"application/json", "x-api-key":API_KEY, "anthropic-version":"2023-06-01" },
    body: JSON.stringify({ model:MODEL, max_tokens:8192, system:sys, messages:[{role:"user",content:user}] })
  });
  if(!res.ok){ throw new Error(`API ${res.status}: ${(await res.text()).slice(0,300)}`); }
  const data = await res.json();
  const metin = (data.content||[]).map(x=>x.type==="text"?x.text:"").join("");
  const bas=metin.indexOf("["), son=metin.lastIndexOf("]");
  if(bas<0||son<0) throw new Error("JSON dizisi bulunamadı: "+metin.slice(0,200));
  const arr = JSON.parse(metin.slice(bas, son+1));
  if(!Array.isArray(arr)||arr.length!==12) throw new Error("12 öğe bekleniyordu, gelen: "+(Array.isArray(arr)?arr.length:typeof arr));
  for(const it of arr){ for(const k of ["teaser","genel","ask","is","tavsiye"]){ if(!it||typeof it[k]!=="string"||!it[k].trim()) throw new Error("Eksik alan: "+k); } }
  return arr;
}
async function yorumUretRetry(tur, gokMetni){
  try { return await yorumUret(tur, gokMetni); }
  catch(e){ console.error(`${tur} 1. deneme hata: ${e.message} — tekrar deneniyor...`); await new Promise(r=>setTimeout(r,3000)); return await yorumUret(tur, gokMetni); }
}

/* ---------- Ortak CSS (sitedeki şablonla birebir) ---------- */
const CSS = `
  :root{--bg-1:#0c0914;--bg-2:#14101f;--panel:#1c1733;--panel-2:#241c3d;--gold:#d9b96a;--gold-soft:#e7cf95;--cream:#f0e6d2;--muted:#9a8fb8;--line:#332a4d}
  *{box-sizing:border-box}html,body{margin:0}
  body{background:radial-gradient(ellipse at 50% -10%, #241c3d 0%, var(--bg-2) 55%, var(--bg-1) 100%) fixed;color:var(--cream);font-family:Georgia,'Times New Roman',serif;min-height:100vh;-webkit-font-smoothing:antialiased;line-height:1.8}
  a{color:var(--gold);text-decoration:none}
  .wrap{max-width:720px;margin:0 auto;padding:0 20px 60px}
  .wrap.genis{max-width:820px}
  .ust{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:24px}
  .ust .glif{font-family:'Segoe UI Symbol','Segoe UI',serif;font-size:52px;color:var(--gold);line-height:1}
  .ust .bilgi{text-align:left}
  .kicker{font-family:'Segoe UI',system-ui,sans-serif;font-size:11.5px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);opacity:.85;margin:0}
  h1{font-size:30px;line-height:1.2;margin:2px 0 2px;font-weight:600}
  header.hero{text-align:center;padding:26px 0 6px}
  header.hero .star{font-size:28px;color:var(--gold)}
  header.hero h1{font-size:32px;margin:8px 0 4px}
  .tarih{font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;color:var(--gold-soft);letter-spacing:.5px;margin-top:2px}
  .yazi-meta{font-family:'Segoe UI',system-ui,sans-serif;font-size:13px;color:var(--muted)}
  header.hero p.sub{color:var(--muted);font-size:15px;font-style:italic;max-width:520px;margin:8px auto 0;line-height:1.6}
  .gokyuzu{font-family:'Segoe UI',system-ui,sans-serif;font-size:13.5px;color:var(--cream);background:rgba(217,185,106,.06);border:1px solid var(--line);border-radius:12px;padding:12px 16px;max-width:560px;margin:18px auto 0;text-align:center}
  .gokyuzu b{color:var(--gold-soft)}
  hr.ayrac{border:none;border-top:1px solid var(--line);max-width:80px;margin:24px auto}
  h2{font-size:19px;color:var(--gold-soft);margin:26px 0 6px;font-weight:600;font-family:'Segoe UI',system-ui,sans-serif;letter-spacing:.3px}
  p{font-size:16.5px;color:#efe7f6}
  .tavsiye{font-size:16.5px;color:#efe7f6;background:rgba(217,185,106,.05);border-left:3px solid var(--gold);padding:14px 18px;border-radius:0 10px 10px 0;margin:24px 0}
  .tavsiye b{color:var(--gold-soft)}
  .komsu{display:flex;justify-content:space-between;gap:10px;margin-top:26px;font-family:'Segoe UI',system-ui,sans-serif;font-size:14px}
  .komsu a{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:11px 16px;color:var(--cream);flex:1;text-align:center;transition:background .15s,border-color .15s}
  .komsu a:hover{background:rgba(217,185,106,.10);border-color:var(--gold)}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:24px}
  @media (max-width:640px){.grid{grid-template-columns:repeat(2,1fr)}}
  @media (max-width:400px){.grid{grid-template-columns:1fr}}
  .burc{display:block;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px 16px;transition:background .15s,border-color .15s,transform .15s}
  .burc:hover{background:rgba(217,185,106,.06);border-color:var(--gold);transform:translateY(-2px)}
  .burc .glif{font-family:'Segoe UI Symbol','Segoe UI',serif;font-size:30px;color:var(--gold);line-height:1}
  .burc .ad{font-size:19px;color:var(--cream);margin:6px 0 2px;font-weight:600}
  .burc:hover .ad{color:var(--gold-soft)}
  .burc .aralik{font-family:'Segoe UI',system-ui,sans-serif;font-size:12px;color:var(--muted);margin-bottom:8px}
  .burc .teaser{font-family:'Segoe UI',system-ui,sans-serif;font-size:13.5px;color:var(--muted);line-height:1.55;margin:0}
  .cta-kutu{text-align:center;margin:30px 0 0;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line);border-radius:16px;padding:24px 22px}
  .cta-kutu h3{margin:0 0 12px;font-size:18px}
  .cta{display:inline-block;background:linear-gradient(180deg,var(--gold-soft),var(--gold));color:#2a1e08;font-weight:bold;padding:12px 24px;border-radius:30px;font-size:15px;font-family:'Segoe UI',system-ui,sans-serif}
  .alt-link{text-align:center;margin-top:18px;font-family:'Segoe UI',system-ui,sans-serif;font-size:14px}
  .ilgili{margin-top:26px}
  .ilgili .b{font-family:'Segoe UI',system-ui,sans-serif;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);opacity:.85;margin-bottom:10px;text-align:center}
  .ilgili .satir{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
  .ilgili a{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:11px 16px;color:var(--cream);font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;transition:background .15s,border-color .15s}
  .ilgili a:hover{background:rgba(217,185,106,.10);border-color:var(--gold)}
  .disclaimer{font-family:'Segoe UI',system-ui,sans-serif;font-size:12.5px;color:var(--muted);max-width:600px;margin:26px auto 0;line-height:1.6;text-align:center}
  .geri{display:block;text-align:center;margin-top:22px;font-family:'Segoe UI',system-ui,sans-serif;font-size:14px}`;

function head(title, desc, canonical, jsonld){
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="${jsonld?"article":"website"}">
<meta property="og:title" content="${esc(title.replace(" | Astro Yuvam",""))}">
<meta property="og:description" content="${esc(desc)}">
<link rel="icon" href="/favicon-32x32.png" sizes="32x32">
<link rel="icon" href="/favicon-16x16.png" sizes="16x16">${jsonld?`
<script type="application/ld+json">${jsonld}</script>`:""}
<style>${CSS}</style>
</head>
<body>
<div id="astro-menu"></div>
<script src="/menu.js" defer></script>`;
}

/* ---------- Render: tekil burç sayfası (günlük/haftalık ortak) ---------- */
function renderSign(tur, b, y, ctx){
  const gunluk = tur==="gunluk";
  const yol = gunluk ? "gunluk-burc-yorumlari" : "haftalik-burc-yorumlari";
  const kicker = gunluk ? "Günlük Burç Yorumu" : "Haftalık Burç Yorumu";
  const baslikH1 = gunluk ? `${b.ad} Burcu — Bugün` : `${b.ad} Burcu — Bu Hafta`;
  const title = gunluk
    ? `${b.ad} Burcu Günlük Yorum — ${ctx.tarihKisa} | Astro Yuvam`
    : `${b.ad} Burcu Haftalık Yorum — ${ctx.haftaAralik} | Astro Yuvam`;
  const desc = gunluk
    ? `${b.ad} burcu ${ctx.tarihKisa} günlük yorumu: bugünün aşk, iş ve genel enerjisi. Dürüst ve öz-farkındalık odaklı ${b.ad} burcu yorumu.`
    : `${b.ad} burcu haftalık yorumu (${ctx.haftaAralik}): bu haftanın aşk, iş ve genel enerjisi. Dürüst ve öz-farkındalık odaklı ${b.ad} burcu haftalık yorumu.`;
  const canonical = `https://astroyuvam.com/${yol}/${b.slug}.html`;
  const jsonld = JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":title.replace(" | Astro Yuvam",""),"description":desc,"datePublished":ctx.iso,"dateModified":ctx.iso,"author":{"@type":"Organization","name":"Astro Yuvam"},"publisher":{"@type":"Organization","name":"Astro Yuvam"},"mainEntityOfPage":canonical});
  const metaSat = gunluk ? `${ctx.tarihTR} · ${b.aralik}` : `${ctx.haftaAralik} · ${b.aralik}`;
  const oncekiIdx = (BURCLAR.indexOf(b)+11)%12, sonrakiIdx=(BURCLAR.indexOf(b)+1)%12;
  const onceki=BURCLAR[oncekiIdx], sonraki=BURCLAR[sonrakiIdx];
  const digerTur = gunluk ? "haftalik-burc-yorumlari" : "gunluk-burc-yorumlari";
  const digerAd  = gunluk ? `${b.ad} haftalık yorum` : `${b.ad} günlük yorum`;
  const tavsiyeEt = gunluk ? "Günün tavsiyesi" : "Haftanın tavsiyesi";

  return `${head(title, desc, canonical, jsonld)}
<article class="wrap">
  <div class="ust">
    <div class="glif">${b.glif}&#xFE0E;</div>
    <div class="bilgi">
      <p class="kicker">${kicker}</p>
      <h1>${baslikH1}</h1>
      <div class="yazi-meta">${esc(metaSat)}</div>
    </div>
  </div>
  <div class="gokyuzu">🌙 ${esc(ctx.gokKisa)}</div>
  <hr class="ayrac">
  <h2>Genel</h2>
  <p>${esc(y.genel)}</p>
  <h2>Aşk & İlişkiler</h2>
  <p>${esc(y.ask)}</p>
  <h2>İş & Para</h2>
  <p>${esc(y.is)}</p>
  <div class="tavsiye"><b>${tavsiyeEt}:</b> ${esc(y.tavsiye)}</div>
  <div class="komsu">
    <a href="/${yol}/${onceki.slug}.html">← ${onceki.ad}</a>
    <a href="/${yol}.html">Tüm burçlar</a>
    <a href="/${yol}/${sonraki.slug}.html">${sonraki.ad} →</a>
  </div>
  <div class="cta-kutu">
    <h3>Genel yorumun ötesi: kendi haritan ne diyor?</h3>
    <a class="cta" href="/#cards">Kişiye özel doğum haritası raporunu keşfet →</a>
  </div>
  <div class="ilgili">
    <div class="b">İlgili İçerikler</div>
    <div class="satir"><a href="/${b.slug}-burcu.html">${b.ad} burcu özellikleri</a><a href="/${digerTur}/${b.slug}.html">${digerAd}</a><a href="/yukselen-burc-nedir.html">Yükselen burç nedir?</a></div>
  </div>
  <p class="disclaimer">${gunluk?"Günlük":"Haftalık"} burç yorumları güneş burcuna dayalı genel yorumlardır; eğlence ve öz-farkındalık amaçlıdır, kesin kehanet değildir. Kişiye özel bir bakış için doğum haritan gerekir. Kararlar her zaman senindir.</p>
  <a class="geri" href="/${yol}.html">← Tüm ${gunluk?"günlük":"haftalık"} burç yorumları</a>
</article>
</body>
</html>`;
}

/* ---------- Render: hub ---------- */
function renderHub(tur, yorumlar, ctx){
  const gunluk = tur==="gunluk";
  const yol = gunluk ? "gunluk-burc-yorumlari" : "haftalik-burc-yorumlari";
  const digerYol = gunluk ? "haftalik-burc-yorumlari" : "gunluk-burc-yorumlari";
  const ustBaslik = gunluk ? "Günlük Burç Yorumları" : "Haftalık Burç Yorumları";
  const ustTarih = gunluk ? ctx.tarihTR : ctx.haftaAralik;
  const title = gunluk
    ? `Günlük Burç Yorumları — ${ctx.tarihKisa} | Astro Yuvam`
    : `Haftalık Burç Yorumları — ${ctx.haftaAralik} | Astro Yuvam`;
  const desc = gunluk
    ? `${ctx.tarihKisa} günlük burç yorumları: 12 burç için bugünün aşk, iş ve genel enerjisi. Gerçek gökyüzüne dayalı, dürüst yorumlar.`
    : `Haftalık burç yorumları (${ctx.haftaAralik}): 12 burç için bu haftanın aşk, iş ve genel enerjisi. Dürüst, öz-farkındalık odaklı yorumlar.`;
  const canonical = `https://astroyuvam.com/${yol}.html`;
  const kartlar = BURCLAR.map((b,i)=>{
    const t = yorumlar[i].teaser;
    return `    <a class="burc" href="/${yol}/${b.slug}.html"><div class="glif">${b.glif}&#xFE0E;</div><div class="ad">${b.ad}</div><div class="aralik">${b.aralik}</div><p class="teaser">${esc(t)}</p></a>`;
  }).join("\n");
  return `${head(title, desc, canonical, null)}
<div class="wrap genis">
  <header class="hero">
    <div class="star">✦</div>
    <h1>${ustBaslik}</h1>
    <div class="tarih">${esc(ustTarih)}</div>
    <p class="sub">12 burç için ${gunluk?"bugünün":"bu haftanın"} enerjisi — aşk, iş ve genel ruh hâli. Gerçek gökyüzüne dayalı, dürüst yorumlar.</p>
    <div class="gokyuzu">🌙 ${esc(ctx.gokKisa)}</div>
  </header>
  <div class="grid">
${kartlar}
  </div>
  <div class="alt-link"><a href="/${digerYol}.html">→ ${gunluk?"Haftalık":"Günlük"} burç yorumlarına da göz at</a></div>
  <div class="cta-kutu">
    <h3>Genel yorumun ötesine geç — kendi haritan ne diyor?</h3>
    <a class="cta" href="/#cards">Kişiye özel doğum haritası raporunu keşfet →</a>
  </div>
  <p class="disclaimer">${gunluk?"Günlük":"Haftalık"} burç yorumları güneş burcuna dayalı genel yorumlardır; eğlence ve öz-farkındalık amaçlıdır, kesin kehanet değildir. Kişiye özel bir bakış için doğum haritan gerekir. Kararlar her zaman senindir.</p>
</div>
</body>
</html>`;
}

/* ---------- Yazma ---------- */
function yaz(yol, icerik){ writeFileSync(yol, icerik, "utf-8"); }

/* ---------- Ana akış ---------- */
(async ()=>{
  const now = istanbulNow();
  const iso = isoTarih(now);
  const ctx = {
    iso,
    tarihTR: tarihTR(now),
    tarihKisa: tarihKisa(now),
    haftaAralik: haftaAraligi(now),
  };
  const ayB = ayBurcu(now), gunB = gunesBurcu(now), evre = ayEvresi(now);
  ctx.gokKisa = `Bugün Ay ${ayB} burcunda (${evre}); Güneş ${gunB} mevsiminde.`;
  const gokMetni = `Ay burcu: ${ayB}, ay evresi: ${evre}, Güneş burcu (mevsim): ${gunB}.`;

  mkdirSync("gunluk-burc-yorumlari", {recursive:true});
  mkdirSync("haftalik-burc-yorumlari", {recursive:true});

  // --- GÜNLÜK: her gün üret ---
  console.log("Günlük yorumlar üretiliyor... ("+gokMetni+")");
  const gunlukY = await yorumUretRetry("gunluk", gokMetni);
  // önce hepsini render et (bellekte), sonra yaz
  const gunlukDosyalar = [];
  BURCLAR.forEach((b,i)=> gunlukDosyalar.push([`gunluk-burc-yorumlari/${b.slug}.html`, renderSign("gunluk", b, gunlukY[i], ctx)]));
  gunlukDosyalar.push(["gunluk-burc-yorumlari.html", renderHub("gunluk", gunlukY, ctx)]);

  // --- HAFTALIK: haftada bir (ISO hafta değişince) ya da eksikse ---
  const hafta = isoHafta(now);
  const markerYol = "haftalik-burc-yorumlari/.hafta";
  const oncekiHafta = existsSync(markerYol) ? readFileSync(markerYol,"utf-8").trim() : "";
  const haftalikGerek = (hafta!==oncekiHafta) || !existsSync("haftalik-burc-yorumlari.html") || process.env.FORCE_WEEKLY==="true";
  let haftalikDosyalar = [];
  if(haftalikGerek){
    console.log("Haftalık yorumlar üretiliyor... (hafta "+hafta+")");
    const haftalikY = await yorumUretRetry("haftalik", gokMetni);
    BURCLAR.forEach((b,i)=> haftalikDosyalar.push([`haftalik-burc-yorumlari/${b.slug}.html`, renderSign("haftalik", b, haftalikY[i], ctx)]));
    haftalikDosyalar.push(["haftalik-burc-yorumlari.html", renderHub("haftalik", haftalikY, ctx)]);
    haftalikDosyalar.push([markerYol, hafta+"\n"]);
  } else {
    console.log("Haftalık güncel (hafta "+hafta+"), atlanıyor.");
  }

  // --- Hepsi hazır: şimdi yaz (kısmi hata riski geçti) ---
  for(const [yol,icerik] of [...gunlukDosyalar, ...haftalikDosyalar]) yaz(yol, icerik);
  console.log(`Tamam. ${gunlukDosyalar.length} günlük + ${haftalikDosyalar.length} haftalık dosya yazıldı.`);
})().catch(e=>{ console.error("ÜRETİM HATASI:", e.message); process.exit(1); });
