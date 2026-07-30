// lib/pdf.js — v2: gauge skorları, açı tabloları, ev uçları tablosu
import puppeteer from "puppeteer";

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// Açı matrisini HTML tabloya çevirir (örnek rapordaki grid görünümü)
const SYM = { "Kavuşum":"☌", "Sekstil":"✶", "Kare":"□", "Üçgen":"△", "Karşıt":"☍", "Quincunx":"⚻" };
export function aspectTableHTML(planets, aspects, title){
  const names = planets.map(p=>p.name.replace(" (yaklaşık)","")).filter(n=>!n.includes("Düğüm"));
  const short = n => ({"Güneş":"☉","Ay":"☽","Merkür":"☿","Venüs":"♀","Mars":"♂","Jüpiter":"♃","Satürn":"♄","Uranüs":"♅","Neptün":"♆","Plüton":"♇","Chiron":"⚷"}[n]||n.slice(0,3));
  const cell = (a,b) => {
    const hit = aspects.find(x =>
      (x.a.replace(/^(A|B|SR|T)-/,"").replace(" (yaklaşık)","")===a && x.b.replace(/^(A|B|SR|T)-/,"").replace(" (yaklaşık)","")===b) ||
      (x.a.replace(/^(A|B|SR|T)-/,"").replace(" (yaklaşık)","")===b && x.b.replace(/^(A|B|SR|T)-/,"").replace(" (yaklaşık)","")===a));
    return hit ? `<td class="asp">${SYM[hit.aspect]||""}<i>${hit.orb}°</i></td>` : "<td></td>";
  };
  let rows = "";
  for(let i=1;i<names.length;i++){
    rows += `<tr><th>${short(names[i])} ${esc(names[i])}</th>`;
    for(let j=0;j<i;j++) rows += cell(names[i], names[j]);
    rows += "</tr>";
  }
  const head = names.slice(0,-1).map(n=>`<th>${short(n)}</th>`).join("");
  return `<div class="asp-wrap"><h3>${esc(title)}</h3>
  <table class="asp-table"><tr><th></th>${head}</tr>${rows}</table>
  <p class="asp-legend">☌ Kavuşum · ✶ Sekstil · □ Kare · △ Üçgen · ☍ Karşıt · ⚻ Quincunx — hücrelerdeki değer orb'dur</p></div>`;
}

// Ev çizgileri (cusps) tablosu — kutupsal noktalar dahil
export function cuspsTableHTML(chart, title){
  const rows = chart.houseCusps.map(c =>
    `<tr><td>${c.ev}. Ev</td><td>${esc(c.sign)}</td><td>${c.degree}°</td></tr>`).join("");
  const asc = chart.ascendant ? `<tr class="hl"><td>Yükselen (ASC / 1. Ev)</td><td>${esc(chart.ascendant.sign)}</td><td>${chart.ascendant.degree}°</td></tr>` : "";
  const mc  = chart.mc ? `<tr class="hl"><td>Tepe Noktası (MC / 10. Ev)</td><td>${esc(chart.mc.sign)}</td><td>${chart.mc.degree}°</td></tr>` : "";
  return `<div class="asp-wrap"><h3>${esc(title)}</h3>
  <table class="pos-table"><tr><th>Ev / Nokta</th><th>Burç</th><th>Derece</th></tr>${asc}${mc}${rows}</table></div>`;
}

// Konum tablosu (gezegen / burç / derece / ev / retro)
export function positionsTableHTML(chart, title){
  const rows = chart.planets.map(p =>
    `<tr><td>${esc(p.name)}</td><td>${esc(p.sign)}</td><td>${p.degree}°</td><td>${p.house ?? "-"}</td><td>${p.retro?"R":""}</td></tr>`).join("");
  const asc = chart.ascendant ? `<tr><td>Yükselen (ASC)</td><td>${esc(chart.ascendant.sign)}</td><td>${chart.ascendant.degree}°</td><td>1</td><td></td></tr>` : "";
  const mc  = chart.mc ? `<tr><td>Tepe Noktası (MC)</td><td>${esc(chart.mc.sign)}</td><td>${chart.mc.degree}°</td><td>10</td><td></td></tr>` : "";
  return `<div class="asp-wrap"><h3>${esc(title)}</h3>
  <table class="pos-table"><tr><th>Nokta</th><th>Burç</th><th>Derece</th><th>Ev</th><th></th></tr>${rows}${asc}${mc}</table></div>`;
}

function wrapHTML({ title, name, reportHtml, meta, wheelHtml }){
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><style>
  @page{margin:0} *{box-sizing:border-box}
  body{margin:0;font-family:'Georgia','DejaVu Serif',serif;color:#2a2438;background:#fff}
  .cover{height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;
    background:radial-gradient(ellipse at 50% 30%,#241c3d 0%,#14101f 65%,#0c0914 100%);color:#f0e6d2;text-align:center;page-break-after:always}
  .cover .star{font-size:34px;color:#d9b96a;letter-spacing:8px}
  .cover h1{font-size:38px;margin:18px 40px 6px;font-weight:600}
  .cover .name{font-size:23px;color:#d9b96a;font-style:italic;margin-bottom:26px}
  .cover .meta{font-size:13px;color:#b9aecb;line-height:1.9}
  .cover .brand{position:absolute;bottom:36px;font-size:12px;letter-spacing:3px;color:#8f83a6;text-transform:uppercase}
  .content{padding:18mm 16mm}
  .content h1{font-size:27px;color:#3b2f63;border-bottom:2px solid #d9b96a;padding-bottom:10px}
  .content h2{font-size:22px;color:#3b2f63;margin-top:44px;margin-bottom:16px;border-bottom:1px solid #e8ddc4;padding-bottom:8px;page-break-after:avoid;line-height:1.4}
  .content h2::before{content:"✦ ";color:#c9a34e}
  .content h3{font-size:16.5px;color:#6b5a9e;margin-top:28px;margin-bottom:10px;page-break-after:avoid;line-height:1.4}
  .content p,.content li{font-size:14px;line-height:2.05;text-align:justify;margin:0 0 15px}
  .content ul{margin:0 0 15px;padding-left:22px}
  .content li{margin-bottom:9px}
  .content blockquote{border-left:3px solid #d9b96a;background:#faf6ec;margin:22px 0;padding:16px 22px;font-style:italic;font-size:15.5px;line-height:1.9}
  .content strong{color:#3b2f63}
  /* Skor göstergesi */
  .gauge{width:150px;height:150px;border-radius:50%;margin:22px auto 6px;display:flex;align-items:center;justify-content:center;position:relative;
    background:conic-gradient(#d9b96a calc(var(--v)*1%), #ece7f2 0);page-break-inside:avoid}
  .gauge::before{content:"";position:absolute;inset:14px;border-radius:50%;background:#fff}
  .gauge span{position:relative;font-size:26px;font-weight:bold;color:#3b2f63}
  .gauge em{position:absolute;top:158px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:12px;color:#6b5a9e;font-style:normal;font-weight:bold}
  .gauge+*{margin-top:34px}
  /* Tablolar */
  .asp-wrap{page-break-inside:avoid;margin:18px 0}
  .asp-table,.pos-table{border-collapse:collapse;margin:8px auto;font-size:10.5px}
  .asp-table th,.asp-table td{border:1px solid #d8d0e6;width:34px;height:26px;text-align:center;padding:1px}
  .asp-table th{background:#f3eefb;color:#3b2f63;font-size:9.5px;width:auto;padding:2px 6px;text-align:left}
  .asp-table tr:first-child th{text-align:center;width:34px}
  .asp-table td.asp{color:#3b2f63;font-size:12px}
  .asp-table td.asp i{display:block;font-size:7.5px;color:#9a90ad;font-style:normal}
  .pos-table th,.pos-table td{border:1px solid #d8d0e6;padding:3px 10px;font-size:10.5px}
  .pos-table tr.hl td{background:#faf3e0;font-weight:bold;color:#3b2f63}
  .pos-table th{background:#f3eefb;color:#3b2f63}
  .asp-legend{text-align:center;font-size:9.5px;color:#9a90ad}
  .wheel-page{page-break-after:always;text-align:center;padding-top:6mm}
  .wheel-page svg{width:172mm;height:auto}
  .footer{text-align:center;font-size:10px;color:#9a90ad;margin-top:40px;border-top:1px solid #e5e0ef;padding-top:12px}
  </style></head><body>
  <div class="cover"><div class="star">✦</div><h1>${esc(title)}</h1><div class="name">${esc(name)}</div>
  <div class="meta">${meta.map(esc).join("<br>")}</div><div class="brand">Astro Rapor</div></div>
  <div class="content">${wheelHtml||""}${reportHtml}
  <div class="footer">Bu rapor, yüksek hassasiyetli astronomik hesaplamalar (Placidus ev sistemi) ve yapay zekâ destekli yorumlama ile ${esc(name)} için kişisel olarak hazırlanmıştır.<br>© ${new Date().getFullYear()} Astro Rapor — Bu içerik ruhsal rehberlik amaçlıdır; tıbbi, hukuki veya finansal tavsiye yerine geçmez.</div>
  </div></body></html>`;
}

export async function renderPDF({ title, name, reportHtml, meta = [], wheelHtml = "" }){
  const browser = await puppeteer.launch({ headless:true, args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"] });
  try{
    const page = await browser.newPage();
    await page.setContent(wrapHTML({title,name,reportHtml,meta,wheelHtml}), { waitUntil:"networkidle0" });
    const pdf = await page.pdf({ format:"A4", printBackground:true, margin:{top:0,bottom:0,left:0,right:0} });
    return Buffer.from(pdf);
  } finally { await browser.close(); }
}
