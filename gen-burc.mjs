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
const MODEL   = process.env.AI_MODEL || "claude-sonnet-5"; // kaliteli Türkçe için Sonnet (Haiku imlada zayıftı)
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

/* ---------- Solar ev (yaşam alanı) katmanı ----------
   Her burç kendi güneş burcunu 1. ev kabul eder; gökteki bir cismin (Ay/Güneş)
   o burca göre kaçıncı solar evde olduğunu ve o evin hayat temasını verir.
   Günlük: Ay'ın evi (günün odağı). Haftalık: Güneş'in evi (haftanın/mevsimin odağı). */
const EV_TEMA = [
  "kimliğin, kendine bakışın ve yeni başlangıçlar",        // 1
  "paran, gelirin, öz-değerin ve sahip oldukların",        // 2
  "iletişim, öğrenme, kardeşler ve günlük konuşmalar",     // 3
  "ev, aile, kökler ve iç huzurun",                        // 4
  "aşk, flört, yaratıcılık ve kendini ifade etme",         // 5
  "iş rutini, sağlık, düzen ve günlük görevler",           // 6
  "ilişkiler, ortaklıklar ve karşındaki kişi",             // 7
  "derin bağlar, ortak kaynaklar ve dönüşüm",              // 8
  "seyahat, eğitim, inançlar ve ufkunu genişletmek",       // 9
  "kariyer, hedefler, itibar ve toplum önündeki yerin",    // 10
  "arkadaşlar, topluluk, umutlar ve gelecek planların",    // 11
  "dinlenme, içe dönüş, sezgi ve geçmişi geride bırakmak", // 12
];
function evTema(burcIdx, cisimBurcIdx){
  const ev = ((cisimBurcIdx - burcIdx) % 12 + 12) % 12; // 0..11
  return { no: ev+1, tema: EV_TEMA[ev] };
}

/* ---------- Numeroloji: Evrensel Gün / Ay Sayısı ----------
   Sayılar TARİHTEN gelir, burçtan değil → herkes için aynıdır (o günün/ayın titreşimi).
   Usta sayılar (11, 22, 33) korunur; tek haneye indirilmez.
   Günlük: Evrensel Gün Sayısı. Haftalık: Evrensel Ay Sayısı. */
const SAYI_TEMA = {
  1:"yeni başlangıçlar, cesaret ve bağımsızlık",
  2:"uyum, işbirliği, sabır ve ilişkiler",
  3:"yaratıcılık, kendini ifade ve neşe",
  4:"düzen, disiplin ve sağlam temeller",
  5:"değişim, özgürlük, hareket ve esneklik",
  6:"sevgi, sorumluluk, aile ve şefkat",
  7:"içe dönüş, sezgi, bilgelik ve dinginlik",
  8:"güç, bereket, başarı ve maddi denge",
  9:"tamamlanma, olgunluk ve cömertçe bırakma",
  11:"yüksek sezgi, ilham ve ruhsal farkındalık (usta sayı)",
  22:"büyük hedefler, yapıcı vizyon ve ustalık (usta sayı)",
  33:"koşulsuz sevgi ve şefkatli rehberlik (usta sayı)",
};
function sayiIndir(n){
  while(n>9 && n!==11 && n!==22 && n!==33){ n = String(n).split("").reduce((a,d)=>a+(+d),0); }
  return n;
}
function rakamTopla(s){ return String(s).split("").reduce((a,d)=>a+(+d||0),0); }
function evrenselGunSayisi(d){ return sayiIndir(rakamTopla(`${d.getFullYear()}${d.getMonth()+1}${d.getDate()}`)); }
function evrenselAySayisi(d){ return sayiIndir(rakamTopla(`${d.getFullYear()}${d.getMonth()+1}`)); }

/* ---------- Tarih / gökyüzü yardımcıları ---------- */
/* ---------- Etkileşimli görsel bileşenler (sunucu tarafı SVG/HTML) ---------- */
const GLIF = BURCLAR.map(b=>b.glif);
function hash(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }

// Günün kartı (22 Majör Arkana — site sıralaması)
const ARKANA = [
  {n:1,ad:"Büyücü",slug:"buyucu",tema:"irade ve yaratma gücü"},{n:2,ad:"Baş Rahibe",slug:"bas-rahibe",tema:"sezgi ve içsel bilgelik"},
  {n:3,ad:"İmparatoriçe",slug:"imparatorice",tema:"bereket ve şefkat"},{n:4,ad:"İmparator",slug:"imparator",tema:"düzen ve istikrar"},
  {n:5,ad:"Aziz",slug:"aziz",tema:"gelenek ve rehberlik"},{n:6,ad:"Aşıklar",slug:"asiklar",tema:"seçim ve uyum"},
  {n:7,ad:"Savaş Arabası",slug:"savas-arabasi",tema:"kararlılık ve zafer"},{n:8,ad:"Adalet",slug:"adalet",tema:"denge ve dürüstlük"},
  {n:9,ad:"Ermiş",slug:"ermis",tema:"içe dönüş ve arayış"},{n:10,ad:"Kader Çarkı",slug:"kader-carki",tema:"döngü ve şans"},
  {n:11,ad:"Güç",slug:"guc",tema:"cesaret ve sabır"},{n:12,ad:"Asılan Adam",slug:"asilan-adam",tema:"farklı bakış ve teslimiyet"},
  {n:13,ad:"Ölüm",slug:"olum",tema:"dönüşüm ve yeniden doğuş"},{n:14,ad:"Denge",slug:"denge",tema:"ölçü ve uyum"},
  {n:15,ad:"Şeytan",slug:"seytan",tema:"bağlar ve özgürleşme"},{n:16,ad:"Kule",slug:"kule",tema:"ani değişim ve arınma"},
  {n:17,ad:"Yıldız",slug:"yildiz",tema:"umut ve ilham"},{n:18,ad:"Ay",slug:"ay",tema:"sezgi ve bilinçdışı"},
  {n:19,ad:"Güneş",slug:"gunes",tema:"neşe ve başarı"},{n:20,ad:"Mahkeme",slug:"mahkeme",tema:"uyanış ve yeni sayfa"},
  {n:21,ad:"Dünya",slug:"dunya",tema:"tamamlanma ve bütünlük"},{n:22,ad:"Aptal",slug:"aptal",tema:"yeni başlangıç ve özgürlük"},
];
function gununKarti(now){ const y0=new Date(now.getFullYear(),0,0); const gun=Math.floor((now-y0)/86400000); return ARKANA[gun%22]; }

// Günün rengi (evrensel gün sayısına göre)
const RENK = {1:{ad:"Kızıl",hex:"#e0794f",his:"cesaret"},2:{ad:"Turkuaz",hex:"#5fb3a3",his:"uyum"},3:{ad:"Altın Sarısı",hex:"#e7cf95",his:"neşe"},
  4:{ad:"Yeşil",hex:"#8fb98a",his:"istikrar"},5:{ad:"Gök Mavisi",hex:"#6aa9d6",his:"özgürlük"},6:{ad:"Gül Pembesi",hex:"#e0a0b4",his:"sevgi"},
  7:{ad:"Mor",hex:"#8f7fe0",his:"sezgi"},8:{ad:"Altın",hex:"#d9b96a",his:"güç"},9:{ad:"İnci Beyazı",hex:"#f0e6d2",his:"tamamlanma"},
  11:{ad:"Gümüş",hex:"#cdd6ff",his:"ilham"},22:{ad:"Lacivert",hex:"#7c6cf0",his:"usta kuruculuk"},33:{ad:"Zümrüt",hex:"#3fae86",his:"şefkatli rehberlik"}};
function gununRengi(sayi){ return RENK[sayi] || RENK[9]; }

// Sembolik günlük enerji (tarihe+burca göre kararlı; gökyüzüyle hafif nüanslı)
function enerjiHesap(i, ayIdx, seed){
  const d=((ayIdx-i)%12+12)%12, g=Math.min(d,12-d);
  const bonus={0:5,1:2,2:7,3:-5,4:10,5:0,6:3}[g] ?? 0;
  const v=(key)=>{ const h=hash(seed+"|"+i+"|"+key); return Math.max(45,Math.min(96, 50+bonus+(h%26))); };
  return { ask:v("ask"), is:v("is"), ruh:v("ruh") };
}
function haftaVals(iso){ const o=[]; for(let i=0;i<7;i++){ const h=hash(iso+"|g"+i); o.push(Math.max(45,Math.min(92, 52+(h%34)+Math.round(7*Math.sin(i/6*Math.PI))))); } return o; }

function moonSVG(angleDeg){
  const R=44,c=50,a=((angleDeg%360)+360)%360,rad=a*Math.PI/180,semi=Math.cos(rad)*R,rx=Math.abs(semi).toFixed(2),rightLit=a<180;
  let d; if(rightLit){const s=semi>0?0:1; d=`M${c},${c-R} A${R},${R} 0 0 1 ${c},${c+R} A${rx},${R} 0 0 ${s} ${c},${c-R} Z`;}
  else{const s=semi>0?1:0; d=`M${c},${c-R} A${R},${R} 0 0 0 ${c},${c+R} A${rx},${R} 0 0 ${s} ${c},${c-R} Z`;}
  return `<svg viewBox="0 0 100 100" class="ay-svg" role="img" aria-label="Ay evresi"><defs><radialGradient id="ayp" cx="42%" cy="38%" r="65%"><stop offset="0" stop-color="#fbf3d8"/><stop offset="1" stop-color="#e7cf95"/></radialGradient></defs><circle cx="${c}" cy="${c}" r="${R}" fill="#171327" stroke="#2c2545"/><path d="${d}" fill="url(#ayp)"/><circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="#3a3358"/></svg>`;
}
function skyWheelSVG(ayIdx,gunIdx){
  const c=110,R=88,rg=64,pos=(i,r)=>{const a=(-90+i*30)*Math.PI/180;return[c+r*Math.cos(a),c+r*Math.sin(a)];};
  let s=`<svg viewBox="0 0 220 220" class="sky-svg" role="img" aria-label="Bugünün gökyüzü çarkı"><circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="#2c2545"/><circle cx="${c}" cy="${c}" r="${rg}" fill="none" stroke="#241d38"/>`;
  for(let i=0;i<12;i++){const p=pos(i,R-14),on=(i===ayIdx||i===gunIdx);s+=`<text x="${p[0].toFixed(1)}" y="${(p[1]+5).toFixed(1)}" text-anchor="middle" font-size="15" fill="${on?'#e7cf95':'#6f6690'}" font-family="Segoe UI Symbol,serif">${GLIF[i]}&#xFE0E;</text>`;}
  const pa=pos(ayIdx,rg-14),pg=pos(gunIdx,rg-14);
  s+=`<text x="${pg[0].toFixed(1)}" y="${(pg[1]+6).toFixed(1)}" text-anchor="middle" font-size="18" fill="#e0a84e">☉&#xFE0E;</text>`;
  s+=`<text x="${pa[0].toFixed(1)}" y="${(pa[1]+6).toFixed(1)}" text-anchor="middle" font-size="18" fill="#cdd6ff">☽&#xFE0E;</text>`;
  s+=`<text x="${c}" y="${c-3}" text-anchor="middle" font-size="10" fill="#9a8fb8" font-family="Segoe UI,sans-serif">bugünün</text><text x="${c}" y="${c+10}" text-anchor="middle" font-size="10" fill="#9a8fb8" font-family="Segoe UI,sans-serif">gökyüzü</text></svg>`;
  return s;
}
function enerjiBarlar(e){
  const bar=(lbl,v,cl)=>`<div class="eb-satir"><span class="eb-l">${lbl}</span><span class="eb-track"><i style="width:${v}%;background:${cl}"></i></span><span class="eb-v">${v}</span></div>`;
  return `<div class="eb">${bar("Aşk",e.ask,"linear-gradient(90deg,#e0794f,#e7cf95)")}${bar("İş",e.is,"linear-gradient(90deg,#6aa9d6,#e7cf95)")}${bar("Ruh",e.ruh,"linear-gradient(90deg,#8f7fe0,#e7cf95)")}</div>`;
}
function haftaDalga(vals,labels){
  const W=560,H=130,pad=24,n=vals.length,mx=95,mn=40,x=i=>pad+i*((W-2*pad)/(n-1)),y=v=>H-24-((v-mn)/(mx-mn))*(H-48);
  let path=""; vals.forEach((v,i)=>{path+=(i?"L":"M")+x(i).toFixed(1)+","+y(v).toFixed(1);});
  const area=`M${x(0).toFixed(1)},${(H-24).toFixed(1)} `+vals.map((v,i)=>`L${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")+` L${x(n-1).toFixed(1)},${(H-24).toFixed(1)} Z`;
  const peak=vals.indexOf(Math.max(...vals)),low=vals.indexOf(Math.min(...vals));let dots="",labs="";
  vals.forEach((v,i)=>{const px=x(i).toFixed(1),py=y(v).toFixed(1),hl=(i===peak||i===low);dots+=`<circle cx="${px}" cy="${py}" r="${hl?4.5:3}" fill="${i===peak?'#e7cf95':i===low?'#b98a8a':'#d9b96a'}"/>`;labs+=`<text x="${px}" y="${H-6}" text-anchor="middle" font-size="11" fill="#9a8fb8" font-family="Segoe UI,sans-serif">${labels[i]}</text>`;});
  return `<svg viewBox="0 0 ${W} ${H}" class="dalga-svg" role="img" aria-label="Haftalık enerji dalgası"><defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(217,185,106,.28)"/><stop offset="1" stop-color="rgba(217,185,106,0)"/></linearGradient></defs><path d="${area}" fill="url(#dg)"/><path d="${path}" fill="none" stroke="#d9b96a" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>${dots}${labs}</svg>`;
}
// "|" ile ayrılmış alanı temiz parçalara böl
function parcala(s){ return String(s||"").split("|").map(x=>x.trim()).filter(Boolean); }
// Burca özel haftalık 7 günlük enerji değerleri (tarihe+burca göre kararlı)
function haftaValsSign(iso,i){ const o=[]; for(let d=0;d<7;d++){ const h=hash(iso+"|s"+i+"|g"+d); o.push(Math.max(48,Math.min(94, 55+(h%30)+Math.round(6*Math.sin((d+i)/6*Math.PI))))); } return o; }
// Beden-Zihin-Ruh ikonları (ince altın çizgi)
const ICON_BZR = [
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e7cf95" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5C6.5 16.5 4 13.4 4 10.2 4 7.9 5.9 6 8.2 6c1.6 0 3 .9 3.8 2.2C12.8 6.9 14.2 6 15.8 6 18.1 6 20 7.9 20 10.2c0 3.2-2.5 6.3-8 10.3z"/></svg>`,   // Beden: kalp
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e7cf95" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 18h5M10 21h4"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.5.4.8 1 .8 1.6v.3h6v-.3c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z"/></svg>`, // Zihin: ampul
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e7cf95" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.5 4.5 5.5 7.6 5.5 10.5a5.5 5.5 0 0 1-11 0C6.5 10.6 8.5 7.5 12 3z"/></svg>`, // Ruh: damla
];
// Haftanın günlük ritmi: 7 günlük mini bar şeridi + gün gün liste (haftalık sayfaya özel)
function haftaSeridi(vals, notlar){
  const kisa=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"], tam=["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];
  const n=7, W=560, H=120, pad=18, bw=46, gap=(W-2*pad-bw*n)/(n-1);
  const peak=vals.indexOf(Math.max(...vals)), low=vals.indexOf(Math.min(...vals));
  let bars="";
  for(let i=0;i<n;i++){
    const x=pad+i*(bw+gap), hh=Math.max(12,Math.round(((vals[i]-42)/(96-42))*(H-52))), yy=H-26-hh;
    const cl = i===peak ? "#e7cf95" : i===low ? "#7c6f9c" : "#d9b96a";
    bars+=`<rect x="${x.toFixed(1)}" y="${yy}" width="${bw}" height="${hh}" rx="8" fill="${cl}" opacity="${i===peak?1:.82}"/>`;
    bars+=`<text x="${(x+bw/2).toFixed(1)}" y="${(yy-6)}" text-anchor="middle" font-size="11" fill="#e7cf95" font-family="Segoe UI,sans-serif">${vals[i]}</text>`;
    bars+=`<text x="${(x+bw/2).toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="12" fill="#9a8fb8" font-family="Segoe UI,sans-serif">${kisa[i]}</text>`;
  }
  const svg=`<svg viewBox="0 0 ${W} ${H}" class="serit-svg" role="img" aria-label="Haftanın günlük ritmi">${bars}</svg>`;
  let liste="";
  for(let i=0;i<n && i<notlar.length;i++){
    liste+=`<div class="serit-satir${i===peak?' vurgu':''}"><span class="serit-gun">${tam[i]}</span><span class="serit-not">${esc(notlar[i])}</span></div>`;
  }
  return `<div class="serit">${svg}<div class="serit-liste">${liste}</div></div>`;
}
// Beden–Zihin–Ruh üçlü blok (günlük: bugün için · haftalık: bu hafta)
function denemelerBlok(tur, arr){
  const et=["Beden","Zihin","Ruh"];
  let k="";
  for(let i=0;i<3;i++){ k+=`<div class="trio-kart"><div class="trio-ikon">${ICON_BZR[i]}</div><div class="trio-et">${et[i]}</div><div class="trio-mtn">${esc(arr[i]||"")}</div></div>`; }
  const bas = tur==="gunluk" ? "Bugün İçin: Beden · Zihin · Ruh" : "Bu Hafta Deneyebileceğin 3 Şey";
  return `<section class="trio"><div class="trio-b">✦ ${bas}</div><div class="trio-grid">${k}</div></section>`;
}
// Kişiye özel bölüm (statik kabuk; mantık /kisisel-gunluk.js içinde)
function kisiselBolum(tur){
  const turAd = tur==="gunluk" ? "günlük" : "haftalık";
  return `<section class="kisisel" id="kisisel-yorum" data-tur="${tur}">
    <div class="kisisel-bant">
      <div class="kisisel-bas">✦ Sana Özel ${tur==="gunluk"?"Günlük":"Haftalık"} Yorum</div>
      <p class="kisisel-alt">Doğum tarihini gir, ${turAd} enerjiyi <b>genel burç yorumuna değil, senin haritana</b> göre oku. Üyelere özel — giriş yaptığında bilgilerin hazır gelir.</p>
      <form class="kisisel-form" id="ky-form">
        <label class="ky-alan">Doğum tarihi<input type="date" id="ky-date" required></label>
        <label class="ky-alan">Doğum saati <span>(isteğe bağlı)</span><input type="time" id="ky-time"></label>
        <button type="submit" class="ky-btn" id="ky-btn">Giriş yap ✦</button>
      </form>
      <div class="kisisel-not" id="ky-not"></div>
      <div class="kisisel-sonuc" id="ky-sonuc" hidden></div>
    </div>
  </section>
  <script src="/kisisel-gunluk.js" defer></script>`;
}
// Bugünün Kozmik Panosu (ay evresi + gökyüzü çarkı + günün kartı + renk)
function kozmikPano(ctx){
  const k=ctx.kart, r=ctx.renk;
  return `<section class="pano">
    <div class="pano-b">✦ Bugünün Kozmik Panosu</div>
    <div class="pano-grid">
      <div class="pano-kut"><div class="pano-gorsel">${moonSVG(ctx.ayAci)}</div><div class="pano-ad">Ay Evresi</div><div class="pano-deger">${esc(ctx.evre)}</div></div>
      <div class="pano-kut"><div class="pano-gorsel">${skyWheelSVG(ctx.ayIdx,ctx.gunIdx)}</div><div class="pano-ad">Gökyüzü</div><div class="pano-deger">Ay ${esc(BURC_ADLARI[ctx.ayIdx])} · Güneş ${esc(BURC_ADLARI[ctx.gunIdx])}</div></div>
      <div class="pano-kut"><a class="pano-kart" href="/arkana-${k.n}-${k.slug}.html"><div class="pano-kart-n">${k.n}</div><div class="pano-kart-ad">${esc(k.ad)}</div></a><div class="pano-ad">Günün Kartı</div><div class="pano-deger">${esc(k.tema)}</div></div>
      <div class="pano-kut"><div class="pano-renk" style="background:${r.hex}"></div><div class="pano-ad">Günün Rengi</div><div class="pano-deger">${esc(r.ad)} — ${esc(r.his)}</div></div>
    </div>
    <p class="pano-not">Bu pano herkes için ortaktır; günün genel atmosferini yansıtır. Her sabah tazelenir — yarın yeniden bak. ✦</p>
  </section>`;
}

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
// Mevsim + o mevsime uygun beden-zihin-ruh atmosferi (kuzey yarımküre / Türkiye)
function mevsimBilgisi(d){
  const y=(d.getMonth()+1)*100+d.getDate();
  if(y>=321 && y<=620) return { ad:"ilkbahar", not:"Havalar ısınıyor, doğa canlanıyor; tazelenme, dışarı çıkma, yeni başlangıçlar ve hafif hareket zamanı." };
  if(y>=621 && y<=922) return { ad:"yaz", not:"Uzun ve sıcak günler; sosyallik, tatil, su kenarı, açık hava ve bol ışık; serinlemeye ve dinlenmeye dikkat." };
  if(y>=923 && y<=1220) return { ad:"sonbahar", not:"Havalar serinliyor, günler kısalıyor; yaz sonrası rutine ve düzene dönüş, içe dönme, toparlanma, sıcak içecek ve serin havada yürüyüş zamanı." };
  return { ad:"kış", not:"Soğuk ve kısa günler; içeride dinlenme, sıcak tutunma, bağışıklığı koruma, uyku düzeni, sakinlik ve içsel yenilenme zamanı." };
}

/* ---------- HTML kaçış ---------- */
function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

/* ---------- Anthropic çağrısı ---------- */
async function apiCagri(sys, user){
  const gsignal = (typeof AbortSignal!=="undefined" && AbortSignal.timeout) ? AbortSignal.timeout(240000) : undefined; // 4 dk güvenlik ağı
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{ "content-type":"application/json", "x-api-key":API_KEY, "anthropic-version":"2023-06-01" },
    body: JSON.stringify({ model:MODEL, max_tokens:16000, system:sys, messages:[{role:"user",content:user}] }),
    signal: gsignal
  });
  if(!res.ok){ throw new Error(`API ${res.status}: ${(await res.text()).slice(0,300)}`); }
  const data = await res.json();
  if(data.stop_reason==="max_tokens") throw new Error("Yanıt max_tokens'e takıldı (çıktı çok uzun)");
  const metin = (data.content||[]).map(x=>x.type==="text"?x.text:"").join("");
  const bas=metin.indexOf("["), son=metin.lastIndexOf("]");
  if(bas<0||son<0) throw new Error("JSON dizisi bulunamadı: "+metin.slice(0,200));
  // JSON'u bozabilecek görünmez kontrol karakterlerini temizle (satır sonu/tab hariç)
  const ham = metin.slice(bas, son+1).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"");
  return JSON.parse(ham);
}
// Her grup için otomatik tekrar: tek bir aksama tüm işi çökertmesin, kendi kendini onarsın
async function apiCagriTekrarli(sys, user, deneme=3){
  let sonHata;
  for(let i=0;i<deneme;i++){
    try { return await apiCagri(sys, user); }
    catch(e){ sonHata=e; console.error(`  grup denemesi ${i+1}/${deneme} başarısız: ${e.message}`); await new Promise(r=>setTimeout(r,2500)); }
  }
  throw sonHata;
}
async function yorumUret(tur, sky){
  const gunluk = tur==="gunluk";
  const kapsam = gunluk ? "BUGÜN" : "BU HAFTA";
  const zaman  = gunluk ? "bugünün" : "bu haftanın";
  const sayi   = gunluk ? sky.gunSayi : sky.aySayi; // günlük: evrensel gün sayısı · haftalık: evrensel ay sayısı
  // günlük: Ay'ın evi (günün hızlı odağı) · haftalık: Güneş'in evi (haftanın sürekli odağı)
  const cisimIdx = gunluk ? sky.ayIdx : sky.gunIdx;
  const BATCH = 2; // 2'şerli küçük gruplar → çıktı sınırına takılma yok, bozuk JSON riski çok düşük, aksarsa grup tekrar edilir

  const sys = `Sen Astro Yuvam için Türkçe burç yorumu yazan; sıcak, olumlu ve güçlendirici bir editörsün.

DİL KURALLARI (kusursuz olmalı):
- Kusursuz Türkçe imla ve dil bilgisi kullan. Metni yazdıktan sonra zihinsel olarak gözden geçir; tek bir yazım ya da anlam hatası bile bırakma.
- ASLA yabancı kelime kullanma (İngilizce, Almanca vb.). Her kavramın Türkçe karşılığını yaz (örneğin "struktur" değil "yapı"; "focus" değil "odak").
- Kesme işaretini yalnızca özel isimlerin çekim eklerinde kullan; sıradan kelimelerde kullanma (doğru: "fırsatını"; yanlış: "fırsat'sını").
- Cümleler akıcı, tam ve anlamlı olsun; yarım ya da anlamı bozuk cümle kurma.

TON: Umut veren, yapıcı, cesaret verici. Bir zorluğu ya da riski anarken bile mutlaka bir çıkış yolu, somut bir öneri ve olumlu bir bakış sun. ASLA kesin kehanet ya da kader hükmü verme ("olacak" değil; "eğilim, enerji, fırsat" dili). Klişeden uzak, samimi ve okuyucuyu iyi hissettiren ol.

SOMUTLUK (ÇOK ÖNEMLİ — yorumun ruhu budur): Yorumlar asla havada ve genel geçer kalmasın; okuyan 'bu tam da benim hayatım' desin. Her bölümde günlük hayattan SOMUT, tanıdık, sahneler halinde örnekler ver — çoğu insanın gerçekten başına gelen, gelmesini umduğu ya da 'acaba olacak mı' diye merak ettiği durumlar. Örnek alanlar: yanıtlamayı ertelediğin bir mesaj ya da beklediğin bir cevap; bir arkadaşınla tazelenen ya da gerginleşen bir konu; aileden gelen bir haber ya da ziyaret; iş yerinde fark edilmek, yeni bir görev, bir zam ya da mülakat beklentisi; bütçeni gözden geçirmek, beklenmedik bir masraf ya da küçük bir kısmet; eski bir tanıdıkla karşılaşmak; ertelediğin bir işe nihayet başlamak; uyku, spor, küçük bir sağlık dokunuşu. Bu örnekleri 'belki', 'olabilir', 'bugünlerde', 'içinden gelebilir' gibi nazik ve olasılıklı bir dille, akıcı cümleler içine doğal biçimde yedir; madde madde SAYMA. Kesin iddia gibi durmasın; 'herkeste birebir aynı olmayabilir ama bu enerjiyi şöyle hissedebilirsin' esnekliğini koru. Klişe ('bugün kendine güven') değil, resmedilebilir sahneler kur.

GERÇEK GÖKYÜZÜ: ${sky.gokKisa} Bu enerjiyi yorumlara doğal biçimde yansıt. Her burç için ayrıca "öne çıkan yaşam alanı (solar ev)" bilgisini vereceğim; o alanı yorumun merkezine al ve somut örnekleri oradan türet. Her burcu kendi doğasına göre belirgin biçimde farklılaştır; hiçbiri bir diğerine benzemesin.

NUMEROLOJİ: ${gunluk?"Bugünün evrensel gün sayısı":"Bu ayın evrensel sayısı"} ${sayi} — teması: ${SAYI_TEMA[sayi]}. Bu sayısal ton HERKES için aynıdır (kişiye ya da burca özel değildir), o yüzden onu bütün burçların yorumuna genel bir atmosfer olarak HAFİFÇE yansıt. Metinde "numeroloji" ya da rakamı teknik biçimde anmana gerek yok; sadece o enerjiyi (örneğin ${sayi} sayısında ${SAYI_TEMA[sayi].split(",")[0]}) sezdir.

GÜNCEL TARİH VE MEVSİM: Bugün ${sky.tarihUzun}; mevsim ${sky.mevsim.ad}. ${sky.mevsim.not} Yorumlardaki somut sahneleri ve önerileri bu mevsime ve içinde bulunduğumuz döneme uydur — mevsimle çelişen bir örnek verme (örneğin yaz ortasında kışlık, kışın yazlık öneri kurma). Mevsimin havasını doğal biçimde sezdir.

BEDEN–ZİHİN–RUH (önemli): Yorumların içine, mevsime ve güne uygun, günlük hayattan somut dokunuşları doğal biçimde yedir — BEDEN (hareket, yürüyüş, esneme, nefes, uyku düzeni, öz bakım), ZİHİN (okuma, planlama, öğrenme, ertelenen bir işe bölerek başlama, bir şeyi netleştirme) ve RUH/PSİKOLOJİ (günlük tutma, sınır koyma, minnet, içe dönme, kendine şefkat). Bunları özellikle 'genel' ve 'saglik' bölümlerinde sahne halinde hissettir; ayrıca aşağıda ayrı bir 'denemeler' alanında bu üçünü net, kısa ve uygulanabilir biçimde ver.

ÇIKTI BİÇİMİ (çok önemli): Yanıtın SADECE geçerli bir JSON dizisi olacak; başında ya da sonunda hiçbir açıklama, başlık ya da markdown olmayacak. Metin değerlerinin İÇİNDE çift tırnak (") KULLANMA — vurgu gerekiyorsa tek tırnak (') kullan. JSON'u bozacak hiçbir karakter kullanma. Değerlerde satır başı (yeni satır) koyma; her alan tek paragraf olsun.`;

  const ortak = `- teaser: en fazla 12 kelime; olumlu ve merak uyandıran.
- denemeler: TAM 3 bölüm, aralarında yalnızca | (dikey çizgi) ile ayrılmış. Sırayla: 1) BEDEN için, 2) ZİHİN için, 3) RUH/psikoloji için birer öneri. Her biri mevsime ve ${gunluk?"bugüne":"bu haftaya"} uygun, somut, tek kısa ve uygulanabilir cümle (en fazla 14 kelime). Başına 'Beden:', 'Zihin:', 'Ruh:' gibi etiket YAZMA; sadece öneri cümlesini yaz. Metnin başka hiçbir yerinde | işareti kullanma.
- tavsiye: tek, net, uygulanabilir ve olumlu bir cümle.`;
  const uzunluk = gunluk
    ? `- genel: 7-8 cümle; dolgun, akıcı ve sıcak; günlük hayattan resmedilebilir 2 somut sahne içersin; öne çıkan yaşam alanını doğal biçimde işle ve okuyanı 'bu tam da bugünüm' hissine getir.
- ask: 7-8 cümle; HEM ilişkisi olan HEM de bekar/yalnız okuyucuya AYRI AYRI, doğal bir akış içinde seslen (örneğin "İlişkin varsa..."; "Henüz yalnızsan ya da yeni birine açıksan...") ve her birine somut bir sahne ver — zorlama, akıcı olsun.
- is: 6-7 cümle; hem çalışanlara hem de yeni iş ya da fırsat arayanlara ayrı ayrı değin; para/bütçe tarafına da bir dokunuş kat; somut bir örnek içersin.
- saglik: 4-5 cümle; bedensel ve duygusal enerji, uyku, hareket, öz bakım ve dengeye dair somut, uygulanabilir bir-iki öneri.
${ortak}`
    : `- genel: 9-10 cümle; günlük yorumdan belirgin biçimde farklı olsun. Bir GÜNÜ değil, tüm HAFTAYI bir hikâye yayı gibi anlat: hafta başı nasıl açılıyor, ortasına doğru ne öne çıkıyor, sonuna doğru nereye evriliyor — bu akışı hissettir. Resmedilebilir somut sahneler içersin; öne çıkan yaşam alanını merkeze al ve mevsimin havasını sezdir.
- ask: 8-9 cümle; HEM ilişkisi olan HEM de bekar/yalnız okuyucuya AYRI AYRI, haftalık perspektifle ve doğal akışta seslen; her birine somut bir sahne ver.
- is: 7-8 cümle; hem çalışanlara hem de yeni iş ya da fırsat arayanlara ayrı ayrı değin; para/bütçe tarafına da değin; somut örnekler içersin.
- saglik: 5-6 cümle; hafta boyunca beden (hareket, uyku, öz bakım), zihin ve ruh dengesi; mevsime uygun, uygulanabilir öneriler.
- oneCikan: 4-5 cümle; haftanın hangi bölümlerinin (örneğin hafta başı, hafta ortası, hafta sonu) hangi konular için daha uygun olabileceğini nazikçe belirt. Kesin tarih verme; "hafta ortasına doğru", "hafta sonu" gibi genel ifadeler kullan.
- ritim: TAM 7 bölüm, aralarında yalnızca | (dikey çizgi) ile ayrılmış; sırayla Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar günlerine karşılık gelir. Her bölüm o güne özel, kısa (en fazla 12-14 kelime), tek bir odak ya da öneri cümlesidir. Gün adını YAZMA; sadece o günün önerisini yaz. Yedi gün birbirinden farklı olsun ve hafta bir akış gibi ilerlesin (beden-zihin-ruh dokunuşlarını günlere dağıt). Bölümler dışında | işareti kullanma.
${ortak}`;

  const alanlar = gunluk
    ? `{"teaser":"...","genel":"...","ask":"...","is":"...","saglik":"...","denemeler":"beden | zihin | ruh","tavsiye":"..."}`
    : `{"teaser":"...","genel":"...","ask":"...","is":"...","saglik":"...","oneCikan":"...","ritim":"pzt | sal | çar | per | cum | cmt | paz","denemeler":"beden | zihin | ruh","tavsiye":"..."}`;

  const alanListe = gunluk ? ["teaser","genel","ask","is","saglik","denemeler","tavsiye"] : ["teaser","genel","ask","is","saglik","oneCikan","ritim","denemeler","tavsiye"];
  const sonuc = new Array(BURCLAR.length);
  for(let start=0; start<BURCLAR.length; start+=BATCH){
    const dilim = BURCLAR.slice(start, start+BATCH);
    const siraliBurclar = dilim.map((b,j)=>{
      const i = start+j, f = evTema(i, cisimIdx);
      return `${i}: ${b.ad} (${b.doga}) — ${gunluk?"bugün":"bu hafta"} öne çıkan yaşam alanı: ${f.no}. ev, yani ${f.tema}`;
    }).join("\n");
    const user = `${kapsam} için aşağıdaki ${dilim.length} burcun her birine ${zaman} yorumunu yaz. SADECE geçerli bir JSON dizisi döndür; başka hiçbir metin, markdown ya da açıklama ekleme.
Sıra ve indeksler tam olarak şöyle olmalı; her burcun öne çıkan yaşam alanı belirtilmiştir:
${siraliBurclar}

Her öğe şu alanlara sahip olmalı: ${alanlar}
Uzunluk ve içerik:
${uzunluk}
Türkçe yaz, olumlu ve güçlendirici ol, kusursuz imlaya dikkat et. Tam ${dilim.length} öğe döndür (yukarıdaki sırayla).`;

    const arr = await apiCagriTekrarli(sys, user);
    if(!Array.isArray(arr)||arr.length!==dilim.length) throw new Error(`${dilim.length} öğe bekleniyordu, gelen: `+(Array.isArray(arr)?arr.length:typeof arr));
    for(let j=0;j<dilim.length;j++){
      const it = arr[j];
      for(const k of alanListe){ if(!it||typeof it[k]!=="string"||!it[k].trim()) throw new Error("Eksik alan: "+k); }
      if(it.denemeler.split("|").map(x=>x.trim()).filter(Boolean).length<3) throw new Error("denemeler 3 bölüm olmalı");
      if(!gunluk && it.ritim.split("|").map(x=>x.trim()).filter(Boolean).length<6) throw new Error("ritim en az 6 bölüm olmalı");
      sonuc[start+j] = it;
    }
  }
  return sonuc;
}
async function yorumUretRetry(tur, sky){
  try { return await yorumUret(tur, sky); }
  catch(e){ console.error(`${tur} 1. deneme hata: ${e.message} — tekrar deneniyor...`); await new Promise(r=>setTimeout(r,3000)); return await yorumUret(tur, sky); }
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
  .ozet{background:rgba(217,185,106,.06);border:1px solid var(--line);border-radius:14px;padding:16px 18px;max-width:580px;margin:18px auto 0;font-family:'Segoe UI',system-ui,sans-serif}
  .ozet-b{font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);opacity:.9;text-align:center;margin-bottom:10px}
  .ozet-satir{font-size:13.5px;color:var(--cream);line-height:1.75;text-align:center}
  .ozet-satir b{color:var(--gold-soft)}
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
  .geri{display:block;text-align:center;margin-top:22px;font-family:'Segoe UI',system-ui,sans-serif;font-size:14px}
  /* Kişiye özel bölüm */
  .kisisel{margin:20px auto 0;max-width:620px}
  .kisisel-bant{background:linear-gradient(160deg,#241c3d,#171227);border:1px solid var(--gold);border-radius:18px;padding:20px 22px;box-shadow:0 12px 40px rgba(0,0,0,.4)}
  .kisisel-bas{font-family:Georgia,serif;font-size:20px;color:var(--gold-soft);font-weight:600;text-align:center}
  .kisisel-alt{font-family:'Segoe UI',system-ui,sans-serif;font-size:13.5px;color:var(--muted);text-align:center;margin:6px 0 16px;line-height:1.6}
  .kisisel-alt b{color:var(--cream)}
  .kisisel-form{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;justify-content:center}
  .ky-alan{display:flex;flex-direction:column;gap:5px;font-family:'Segoe UI',system-ui,sans-serif;font-size:12.5px;color:var(--muted);flex:1 1 150px}
  .ky-alan span{color:#6f6690;font-size:11.5px}
  .ky-alan input{background:#0f0b1a;border:1px solid var(--line);border-radius:10px;color:var(--cream);font-family:inherit;font-size:15px;padding:11px 12px}
  .ky-alan input:focus{outline:none;border-color:var(--gold)}
  .ky-btn{flex:1 1 100%;background:linear-gradient(180deg,var(--gold-soft),var(--gold));color:#2a1e08;font-family:'Segoe UI',system-ui,sans-serif;font-weight:bold;font-size:15px;border:none;border-radius:12px;padding:13px;cursor:pointer;transition:transform .15s,box-shadow .15s;margin-top:4px}
  .ky-btn:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(217,185,106,.3)}
  .ky-btn:disabled{opacity:.6;cursor:default}
  .kisisel-not{font-family:'Segoe UI',system-ui,sans-serif;font-size:12px;color:#9a8fb8;text-align:center;margin-top:10px}
  .kisisel-sonuc{margin-top:16px;border-top:1px solid var(--line);padding-top:14px}
  .kisisel-sonuc .ky-baslik{font-family:Georgia,serif;font-size:16px;color:var(--gold-soft);margin-bottom:8px;text-align:center}
  .kisisel-sonuc .ky-metin p{font-family:'Segoe UI',system-ui,sans-serif;font-size:15px;line-height:1.75;color:#efe7f6;margin:0 0 12px}
  .kisisel-sonuc .ky-yukleniyor,.kisisel-sonuc .ky-hata{font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;color:var(--muted);text-align:center;padding:10px}
  /* Kozmik pano */
  .pano{margin:22px auto 0;max-width:720px;background:rgba(217,185,106,.05);border:1px solid var(--line);border-radius:16px;padding:18px}
  .pano-b{font-family:'Segoe UI',system-ui,sans-serif;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:14px}
  .pano-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  @media(max-width:640px){.pano-grid{grid-template-columns:repeat(2,1fr)}}
  .pano-kut{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:14px 10px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}
  .pano-gorsel{width:74px;height:74px;display:flex;align-items:center;justify-content:center}
  .ay-svg{width:70px;height:70px}.sky-svg{width:88px;height:88px;margin:-8px 0}
  .pano-ad{font-family:'Segoe UI',system-ui,sans-serif;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-top:4px}
  .pano-deger{font-family:'Segoe UI',system-ui,sans-serif;font-size:12.5px;color:var(--cream);line-height:1.4}
  .pano-kart{display:flex;flex-direction:column;align-items:center;justify-content:center;width:64px;height:74px;background:linear-gradient(160deg,#2a2145,#171227);border:1px solid var(--gold);border-radius:9px;color:var(--gold-soft);text-decoration:none}
  .pano-kart-n{font-family:Georgia,serif;font-size:20px;font-weight:bold}.pano-kart-ad{font-size:10px;color:var(--muted);padding:0 2px;line-height:1.1}
  .pano-renk{width:56px;height:56px;border-radius:50%;box-shadow:0 0 18px rgba(0,0,0,.4) inset,0 4px 14px rgba(0,0,0,.3)}
  .pano-not{font-family:'Segoe UI',system-ui,sans-serif;font-size:12px;color:#9a8fb8;text-align:center;margin:14px 0 0;line-height:1.5}
  /* Enerji barları */
  .eb{display:flex;flex-direction:column;gap:7px;margin:12px 0 0}
  .eb-satir{display:flex;align-items:center;gap:9px}
  .eb-l{width:32px;font-family:'Segoe UI',system-ui,sans-serif;font-size:12.5px;color:var(--muted)}
  .eb-track{flex:1;height:8px;background:#15111f;border-radius:6px;overflow:hidden}
  .eb-track i{display:block;height:100%;border-radius:6px}
  .eb-v{width:24px;text-align:right;font-family:'Segoe UI',system-ui,sans-serif;font-size:12px;color:var(--gold-soft);font-weight:600}
  .burc .eb{border-top:1px solid var(--line);padding-top:10px;margin-top:12px}
  /* Haftalık dalga */
  .dalga{margin:22px auto 0;max-width:620px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px 18px}
  .dalga-b{font-family:'Segoe UI',system-ui,sans-serif;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:6px}
  .dalga-svg{width:100%;height:auto}
  .dalga-not{font-family:'Segoe UI',system-ui,sans-serif;font-size:12px;color:#9a8fb8;text-align:center;margin-top:8px}
  /* Günün kartı satırı (tekil sayfa) */
  .gunkart{display:flex;align-items:center;gap:14px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:18px 0}
  .gunkart .ikon{flex:none;width:52px;height:62px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(160deg,#2a2145,#171227);border:1px solid var(--gold);border-radius:8px;color:var(--gold-soft);text-decoration:none}
  .gunkart .ikon b{font-family:Georgia,serif;font-size:18px}.gunkart .ikon small{font-size:9px;color:var(--muted)}
  .gunkart .mtn{font-family:'Segoe UI',system-ui,sans-serif;font-size:13.5px;color:#efe7f6;line-height:1.55}
  .gunkart .mtn b{color:var(--gold-soft)}
  /* Beden–Zihin–Ruh üçlüsü */
  .trio{margin:22px auto 0;max-width:640px;background:rgba(217,185,106,.05);border:1px solid var(--line);border-radius:16px;padding:16px 18px}
  .trio-b{font-family:'Segoe UI',system-ui,sans-serif;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:14px}
  .trio-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  @media(max-width:560px){.trio-grid{grid-template-columns:1fr}}
  .trio-kart{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:15px 12px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:7px}
  .trio-ikon{width:42px;height:42px;border-radius:50%;background:rgba(217,185,106,.08);display:flex;align-items:center;justify-content:center}
  .trio-et{font-family:'Segoe UI',system-ui,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-soft)}
  .trio-mtn{font-family:'Segoe UI',system-ui,sans-serif;font-size:13.5px;color:#efe7f6;line-height:1.55}
  /* Haftanın ritmi şeridi (haftalık sayfaya özel) */
  .serit{margin:8px 0 0}
  .serit-svg{width:100%;height:auto;display:block}
  .serit-liste{display:flex;flex-direction:column;gap:7px;margin-top:14px}
  .serit-satir{display:flex;gap:12px;align-items:baseline;background:var(--panel);border:1px solid var(--line);border-radius:11px;padding:9px 14px}
  .serit-satir.vurgu{border-color:var(--gold);background:rgba(217,185,106,.08)}
  .serit-gun{flex:none;width:88px;font-family:'Segoe UI',system-ui,sans-serif;font-size:13px;font-weight:600;color:var(--gold-soft)}
  .serit-not{font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;color:#efe7f6;line-height:1.5}
  @media(max-width:480px){.serit-satir{flex-direction:column;gap:2px}.serit-gun{width:auto}}`;

function head(title, desc, canonical, jsonld){
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Google Analytics 4 (görünmez ölçüm) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-QQ0SREFL4L"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-QQ0SREFL4L');</script>
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
  const odak = evTema(BURCLAR.indexOf(b), gunluk ? ctx.ayIdx : ctx.gunIdx);
  const sayi = gunluk ? ctx.gunSayi : ctx.aySayi;
  const trioHTML = denemelerBlok(tur, parcala(y.denemeler));
  const seritHTML = gunluk ? "" : haftaSeridi(haftaValsSign(ctx.iso, BURCLAR.indexOf(b)), parcala(y.ritim));

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
  <div class="ozet">
    <div class="ozet-b">${gunluk?"Bugünün":"Bu Haftanın"} Kozmik Özeti</div>
    <div class="ozet-satir">🌙 ${esc(ctx.gokKisa)}</div>
    <div class="ozet-satir">🎯 <b>Öne çıkan alanın:</b> ${odak.no}. ev — ${esc(odak.tema)}</div>
    <div class="ozet-satir">🔢 <b>${gunluk?"Günün":"Ayın"} sayısı ${sayi}:</b> ${esc(SAYI_TEMA[sayi])}</div>
  </div>
  <div style="max-width:440px;margin:18px auto 0">
    <div class="dalga-b" style="text-align:center">✦ ${b.ad} İçin ${gunluk?"Bugünün":"Bu Haftanın"} Enerjisi</div>
    ${enerjiBarlar(enerjiHesap(BURCLAR.indexOf(b), ctx.ayIdx, ctx.iso))}
  </div>
  <div class="gunkart">
    <a class="ikon" href="/arkana-${ctx.kart.n}-${ctx.kart.slug}.html"><b>${ctx.kart.n}</b><small>kart</small></a>
    <div class="mtn"><b>${gunluk?"Günün":"Haftanın"} kartı: ${esc(ctx.kart.ad)}</b> — ${esc(ctx.kart.tema)}. Günün rengi <b style="color:${ctx.renk.hex}">${esc(ctx.renk.ad)}</b> (${esc(ctx.renk.his)}). Bu ton herkes için ortaktır; ${b.ad} yorumuna hafif bir atmosfer katar.</div>
  </div>
  <hr class="ayrac">
  <h2>Genel</h2>
  <p>${esc(y.genel)}</p>${gunluk?"":`
  <h2>Haftanın Ritmi — Gün Gün</h2>
  ${seritHTML}`}
  <h2>Aşk & İlişkiler</h2>
  <p>${esc(y.ask)}</p>
  <h2>İş & Para</h2>
  <p>${esc(y.is)}</p>
  <h2>Sağlık & Enerji</h2>
  <p>${esc(y.saglik)}</p>${gunluk?"":`
  <h2>Öne Çıkan Günler</h2>
  <p>${esc(y.oneCikan)}</p>`}
  ${trioHTML}
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
    const eb = enerjiBarlar(enerjiHesap(i, ctx.ayIdx, ctx.iso));
    return `    <a class="burc" href="/${yol}/${b.slug}.html"><div class="glif">${b.glif}&#xFE0E;</div><div class="ad">${b.ad}</div><div class="aralik">${b.aralik}</div><p class="teaser">${esc(t)}</p>${eb}</a>`;
  }).join("\n");
  const dalgaBolum = gunluk ? "" : `
  <section class="dalga">
    <div class="dalga-b">✦ Bu Haftanın Enerji Dalgası</div>
    ${haftaDalga(ctx.haftaVals, ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"])}
    <p class="dalga-not">Haftanın genel enerji akışı — altın nokta en canlı, soluk nokta en sakin gün. Sembolik bir pusuladır.</p>
  </section>`;
  return `${head(title, desc, canonical, null)}
<div class="wrap genis">
  <header class="hero">
    <div class="star">✦</div>
    <h1>${ustBaslik}</h1>
    <div class="tarih">${esc(ustTarih)}</div>
    <p class="sub">12 burç için ${gunluk?"bugünün":"bu haftanın"} enerjisi — aşk, iş ve genel ruh hâli. Gerçek gökyüzüne dayalı, dürüst yorumlar.</p>
    <div class="gokyuzu">🌙 ${esc(ctx.gokKisa)} &nbsp;·&nbsp; 🔢 ${gunluk?"Günün":"Ayın"} sayısı ${gunluk?ctx.gunSayi:ctx.aySayi}: ${esc(SAYI_TEMA[gunluk?ctx.gunSayi:ctx.aySayi])}</div>
  </header>
  ${kisiselBolum(gunluk?"gunluk":"haftalik")}
  ${kozmikPano(ctx)}${dalgaBolum}
  <h2 style="text-align:center;margin-top:30px">12 Burç İçin ${gunluk?"Bugün":"Bu Hafta"}</h2>
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

/* ---------- sitemap.xml lastmod tazeleme ----------
   Üretilen günlük/haftalık sayfaların <lastmod> tarihini bugüne çeker; böylece
   Google bu sayfaların gerçekten güncellendiğini görür. Sitemap yoksa sessizce atlar. */
function sitemapLastmodGuncelle(urlYollari, iso){
  const yol = "sitemap.xml";
  if(!existsSync(yol)){ console.log("sitemap.xml bulunamadı, lastmod güncellemesi atlandı."); return; }
  let xml = readFileSync(yol, "utf-8"), sayac = 0;
  for(const u of urlYollari){
    const loc = `https://astroyuvam.com/${u}`;
    const kacis = loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(<loc>${kacis}</loc>\\s*<lastmod>)[^<]*(</lastmod>)`);
    if(re.test(xml)){ xml = xml.replace(re, `$1${iso}$2`); sayac++; }
  }
  if(sayac){ writeFileSync(yol, xml, "utf-8"); }
  console.log(`sitemap.xml: ${sayac} sayfanın lastmod tarihi ${iso} olarak güncellendi.`);
}

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
  ctx.evre = evre;
  ctx.ayAci = A.MoonPhase(now); // 0=Yeni,90=İlk Dördün,180=Dolunay,270=Son Dördün
  ctx.ayIdx = BURC_ADLARI.indexOf(ayB);
  ctx.gunIdx = BURC_ADLARI.indexOf(gunB);
  ctx.gunSayi = evrenselGunSayisi(now);
  ctx.aySayi = evrenselAySayisi(now);
  ctx.kart = gununKarti(now);
  ctx.renk = gununRengi(ctx.gunSayi);
  ctx.haftaVals = haftaVals(iso);
  ctx.mevsim = mevsimBilgisi(now);
  const sky = { ayB, gunB, evre, ayIdx: ctx.ayIdx, gunIdx: ctx.gunIdx, gokKisa: ctx.gokKisa, gunSayi: ctx.gunSayi, aySayi: ctx.aySayi, mevsim: ctx.mevsim, tarihUzun: ctx.tarihTR };

  mkdirSync("gunluk-burc-yorumlari", {recursive:true});
  mkdirSync("haftalik-burc-yorumlari", {recursive:true});

  // --- GÜNLÜK: her gün üret ---
  console.log("Günlük yorumlar üretiliyor... ("+ctx.gokKisa+")");
  const gunlukY = await yorumUretRetry("gunluk", sky);
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
    const haftalikY = await yorumUretRetry("haftalik", sky);
    BURCLAR.forEach((b,i)=> haftalikDosyalar.push([`haftalik-burc-yorumlari/${b.slug}.html`, renderSign("haftalik", b, haftalikY[i], ctx)]));
    haftalikDosyalar.push(["haftalik-burc-yorumlari.html", renderHub("haftalik", haftalikY, ctx)]);
    haftalikDosyalar.push([markerYol, hafta+"\n"]);
  } else {
    console.log("Haftalık güncel (hafta "+hafta+"), atlanıyor.");
  }

  // --- Hepsi hazır: şimdi yaz (kısmi hata riski geçti) ---
  for(const [yol,icerik] of [...gunlukDosyalar, ...haftalikDosyalar]) yaz(yol, icerik);
  console.log(`Tamam. ${gunlukDosyalar.length} günlük + ${haftalikDosyalar.length} haftalık dosya yazıldı.`);

  // --- sitemap.xml lastmod tarihlerini üretilen sayfalar için bugüne çek ---
  try {
    const smYollari = ["gunluk-burc-yorumlari.html", ...BURCLAR.map(b=>`gunluk-burc-yorumlari/${b.slug}.html`)];
    if(haftalikDosyalar.length){ smYollari.push("haftalik-burc-yorumlari.html", ...BURCLAR.map(b=>`haftalik-burc-yorumlari/${b.slug}.html`)); }
    sitemapLastmodGuncelle(smYollari, iso);
  } catch(e){ console.error("sitemap güncellemesi atlandı:", e.message); }
})().catch(e=>{ console.error("ÜRETİM HATASI:", e.message); process.exit(1); });
