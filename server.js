// server.js — Astro Rapor backend v2
import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import {
  computeChart, solarReturn, lunarReturn, davisonChart, compositeChart,
  transits, upcomingTransits, aspectsBetween, localToUTC
} from "./lib/astrology.js";
import { personalMatrix, compatibilityMatrix, yearEnergy } from "./lib/matrix.js";
import { geocode } from "./lib/geo.js";
import { generateReport } from "./lib/ai.js";
import { renderPDF, aspectTableHTML, positionsTableHTML, cuspsTableHTML } from "./lib/pdf.js";
import { chartWheelSVG } from "./lib/wheel.js";
import { sendReportEmail, verifyMailer } from "./lib/mailer.js";
import { swissAvailable } from "./lib/swiss.js";

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json());
app.use(express.static("public"));

const orders = new Map();
const PRICES = { natal:500, solar_return:250, lunar_return:150, sinastri:500, matrix:400, matrix_uyum:500, transit:300 };

app.get("/api/health", async (_req,res)=>{
  let mail=false; try{ mail = await verifyMailer(); }catch{}
  res.json({ ok:true, mail, ai: !!process.env.ANTHROPIC_API_KEY, swiss: swissAvailable(), surum:"v4-fullpage" });
});

app.get("/api/order/:id",(req,res)=>{
  const o = orders.get(req.params.id);
  if(!o) return res.status(404).json({error:"Sipariş bulunamadı"});
  res.json({ id:o.id, status:o.status, type:o.type, error:o.error||null });
});

app.post("/api/order", async (req,res)=>{
  const b = req.body || {};
  const errors=[];
  if(!PRICES[b.type]) errors.push("Geçersiz rapor tipi.");
  if(!b.name?.trim()) errors.push("Ad Soyad zorunlu.");
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email||"")) errors.push("Geçerli bir e-posta girin.");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(b.birthDate||"")) errors.push("Doğum tarihi YYYY-AA-GG formatında olmalı.");
  if(!b.birthPlace?.trim()) errors.push("Doğum yeri zorunlu.");
  const needsPartner = ["sinastri","matrix_uyum"].includes(b.type);
  if(needsPartner && (!b.partner?.name || !b.partner?.birthDate)) errors.push("Bu rapor için partner bilgileri zorunlu.");
  if(errors.length) return res.status(400).json({errors});

  // --- ÖDEME NOKTASI ---
  // Gerçek ödeme entegrasyonunda (Shopier/iyzico/PayTR) processOrder çağrısını
  // ödeme onay webhook'una taşıyın. Demo modda doğrudan işlenir.

  const id = crypto.randomUUID();
  const order = { id, status:"processing", type:b.type, data:b, createdAt:new Date() };
  orders.set(id, order);
  res.json({ id, status:"processing", message:"Siparişin alındı! Raporun hazırlanıyor, birkaç dakika içinde e-postana gelecek. ✦" });

  processOrder(order).catch(err=>{
    order.status="failed"; order.error=err.message;
    console.error(`[SİPARİŞ ${id}] HATA:`, err);
  });
});

async function processOrder(order){
  const b = order.data;
  const geo = await geocode(b.birthPlace);
  const birthUTC = localToUTC(b.birthDate, b.birthTime||"12:00", geo.timezone);
  const natal = computeChart(birthUTC, geo.lat, geo.lon);
  const [Y,M,D] = b.birthDate.split("-").map(Number);
  const now = new Date();

  const person = {
    isim:b.name, dogumTarihi:b.birthDate, dogumSaati:b.birthTime||"12:00 (bilinmiyor)",
    dogumYeri:geo.name, cinsiyet:b.gender||"belirtilmedi", raporTarihi: now.toISOString().slice(0,10)
  };

  let chartData, tablesHTML = "", wheelHtml = "";
  const wheel = (svg) => `<div class="wheel-page">${svg}</div>`;

  switch(order.type){
    case "natal": {
      chartData = {
        natalHarita: natal,
        ongoruTakvimi: upcomingTransits(natal, now, 12)
      };
      tablesHTML = positionsTableHTML(natal, "Gezegen Konumları (Placidus)") +
                   cuspsTableHTML(natal, "Ev Çizgileri (Cusps) ve Kutupsal Noktalar") +
                   aspectTableHTML(natal.planets, natal.aspects, "Natal Açı Tablosu");
      wheelHtml = wheel(chartWheelSVG(natal, { title: `${b.name} — Doğum Haritası` }));
      break;
    }
    case "solar_return": {
      const yr = now.getUTCFullYear();
      let sr = solarReturn(natal, yr, geo.lat, geo.lon);
      if(new Date(sr.returnMoment) > now) sr = solarReturn(natal, yr-1, geo.lat, geo.lon);
      const srNatal = aspectsBetween(sr.chart, natal, ["SR","Natal"]).filter(a=>a.orb<=3);
      // SR Yükseleninin natal evi
      const srAscNatalHouse = natal.houseCusps ? houseOfLon(sr.chart.ascendant.longitude, natal) : null;
      chartData = { natalHarita:natal, solarReturn:sr, srNatalTemaslari:srNatal, srYukselenNatalEvi:srAscNatalHouse };
      tablesHTML = positionsTableHTML(sr.chart, "Solar Return Konumları (Placidus)") +
                   cuspsTableHTML(sr.chart, "SR Ev Çizgileri (Cusps)") +
                   aspectTableHTML(sr.chart.planets, sr.chart.aspects, "Solar Return Açı Tablosu");
      wheelHtml = wheel(chartWheelSVG(sr.chart, { title: `${b.name} — Solar Return ${new Date(sr.returnMoment).getFullYear()}` })) +
                  wheel(chartWheelSVG(natal, { title: `${b.name} — Natal Harita (referans)` }));
      break;
    }
    case "lunar_return": {
      const lr = lunarReturn(natal, now, geo.lat, geo.lon);
      chartData = { natalHarita:natal, lunarReturn:lr,
                    lrNatalTemaslari: aspectsBetween(lr.chart, natal, ["LR","Natal"]).filter(a=>a.orb<=3) };
      tablesHTML = positionsTableHTML(lr.chart, "Lunar Return Konumları (Placidus)") + cuspsTableHTML(lr.chart, "LR Ev Çizgileri (Cusps)");
      wheelHtml = wheel(chartWheelSVG(lr.chart, { title: `${b.name} — Lunar Return` }));
      break;
    }
    case "transit": {
      chartData = { natalHarita:natal, transitler: transits(natal, now, geo.lat, geo.lon),
                    ongoruTakvimi: upcomingTransits(natal, now, 12) };
      tablesHTML = positionsTableHTML(natal, "Natal Konumlar (Placidus)") + cuspsTableHTML(natal, "Ev Çizgileri (Cusps) ve Kutupsal Noktalar");
      wheelHtml = wheel(chartWheelSVG(natal, { title: `${b.name} — Natal + Transit Gökyüzü`, outerChart: chartData.transitler ? { planets: chartData.transitler.skyNow } : null, outerLabel: "Bugünün gökyüzü", innerLabel: "Natal", aspects: natal.aspects }));
      break;
    }
    case "matrix": {
      chartData = { kaderMatrisi: personalMatrix(D,M,Y),
                    yillikEnerji: { yil: now.getFullYear(), enerji: yearEnergy(D,M,now.getFullYear()) } };
      break;
    }
    case "sinastri": {
      const pGeo = await geocode(b.partner.birthPlace);
      const pUTC = localToUTC(b.partner.birthDate, b.partner.birthTime||"12:00", pGeo.timezone);
      const pNatal = computeChart(pUTC, pGeo.lat, pGeo.lon);
      const inter = aspectsBetween(natal, pNatal, ["A","B"]);
      const dav = davisonChart(birthUTC, pUTC, geo.lat, geo.lon, pGeo.lat, pGeo.lon);
      const comp = compositeChart(natal, pNatal);
      chartData = {
        partnerA: { isim:b.name, harita:natal },
        partnerB: { isim:b.partner.name, harita:pNatal },
        sinastriAcilari: inter,
        davisonHaritasi: dav,
        kompozitHarita: comp,
        ongoruTakvimi: {
          [b.name]: upcomingTransits(natal, now, 12),
          [b.partner.name]: upcomingTransits(pNatal, now, 12)
        }
      };
      person.partner = { isim:b.partner.name, dogumTarihi:b.partner.birthDate, dogumYeri:pGeo.name };
      tablesHTML = positionsTableHTML(natal, `${b.name} — Konumlar (Placidus)`) +
                   cuspsTableHTML(natal, `${b.name} — Ev Çizgileri (Cusps)`) +
                   positionsTableHTML(pNatal, `${b.partner.name} — Konumlar (Placidus)`) +
                   cuspsTableHTML(pNatal, `${b.partner.name} — Ev Çizgileri (Cusps)`) +
                   aspectTableHTML(natal.planets, inter, "Sinastri Açı Tablosu (satır: "+b.name+" / sütun: "+b.partner.name+")");
      wheelHtml = wheel(chartWheelSVG(natal, { title: `Sinastri Çarkı — ${b.name} (iç) & ${b.partner.name} (dış)`, outerChart: pNatal, outerLabel: b.partner.name, innerLabel: b.name, aspects: inter })) +
                  wheel(chartWheelSVG(dav, { title: "Davison Haritası — İlişkinin Ruhu" }));
      break;
    }
    case "matrix_uyum": {
      const [pY,pM,pD] = b.partner.birthDate.split("-").map(Number);
      const m1 = personalMatrix(D,M,Y), m2 = personalMatrix(pD,pM,pY);
      chartData = { kisiA:{isim:b.name, matris:m1}, kisiB:{isim:b.partner.name, matris:m2},
                    uyumMatrisi: compatibilityMatrix(m1,m2) };
      person.partner = { isim:b.partner.name, dogumTarihi:b.partner.birthDate };
      break;
    }
  }

  console.log(`[SİPARİŞ ${order.id}] Harita hesaplandı (Placidus), AI yorumu üretiliyor…`);
  const { title, html } = await generateReport(order.type, person, chartData);

  console.log(`[SİPARİŞ ${order.id}] PDF oluşturuluyor…`);
  const pdf = await renderPDF({
    title, name:b.name, wheelHtml,
    reportHtml: html + (tablesHTML ? `<h2>Teknik Ek: Konumlar ve Açı Tabloları</h2>${tablesHTML}` : ""),
    meta: [
      `Doğum: ${b.birthDate} • ${b.birthTime||"12:00"} • ${geo.name}`,
      b.partner ? `Partner: ${b.partner.name} • ${b.partner.birthDate}` : "",
      `Ev sistemi: Placidus • Hazırlanma: ${now.toLocaleDateString("tr-TR")}`
    ].filter(Boolean)
  });

  console.log(`[SİPARİŞ ${order.id}] E-posta gönderiliyor: ${b.email}`);
  await sendReportEmail({ to:b.email, name:b.name, reportTitle:title, pdfBuffer:pdf });

  order.status="done";
  console.log(`[SİPARİŞ ${order.id}] ✦ Tamamlandı.`);
}

// Bir boylamın natal haritadaki evini bulur (SR Yükseleni için)
function houseOfLon(lon, natal){
  const cusps = natal.houseCusps.map(c=>c.longitude);
  for(let h=0; h<12; h++){
    const a = cusps[h], b = cusps[(h+1)%12];
    const span = ((b-a)%360+360)%360, pos = ((lon-a)%360+360)%360;
    if(pos < span) return h+1;
  }
  return 12;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`✦ Astro Rapor backend v4 (Placidus + Swiss + tam sayfa) hazır: http://localhost:${PORT}`));
