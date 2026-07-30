// lib/wheel.js — Dairesel harita çarkı (SVG)
// Tek harita: zodyak halkası + Placidus ev dilimleri + gezegenler + merkezde açı çizgileri
// Çift halka (bi-wheel): sinastri (A içte, B dışta) ve transit (natal içte, gökyüzü dışta)

const D2R = Math.PI/180;
const norm = d => ((d % 360) + 360) % 360;

const SIGN_GLYPH = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const SIGN_COLOR = ["#c0392b","#7d6608","#2471a3","#1e8449"]; // Ateş Toprak Hava Su
const PLANET_GLYPH = {
  "Güneş":"☉","Ay":"☽","Merkür":"☿","Venüs":"♀","Mars":"♂","Jüpiter":"♃","Satürn":"♄",
  "Uranüs":"♅","Neptün":"♆","Plüton":"♇","Kuzey Ay Düğümü":"☊","Güney Ay Düğümü":"☋",
  "Chiron":"⚷","Chiron (yaklaşık)":"⚷"
};
const ASPECT_STYLE = {
  "Kavuşum":  { color:"#d68910", width:1.6, dash:"" },
  "Sekstil":  { color:"#1e8449", width:1.1, dash:"" },
  "Kare":     { color:"#c0392b", width:1.4, dash:"" },
  "Üçgen":    { color:"#2471a3", width:1.4, dash:"" },
  "Karşıt":   { color:"#922b21", width:1.6, dash:"" },
  "Quincunx": { color:"#909497", width:0.9, dash:"4 3" }
};

/**
 * @param {object} chart   - computeChart çıktısı (houseCusps + ascendant zorunlu)
 * @param {object} opts    - { title, outerChart, outerLabel, innerLabel, aspects }
 *   outerChart verilirse bi-wheel çizilir; aspects verilirse o liste (örn. sinastri açıları) kullanılır.
 */
export function chartWheelSVG(chart, opts = {}){
  const S = 780, C = S/2;
  const ascLon = chart.ascendant.longitude;
  const biWheel = !!opts.outerChart;

  // Yarıçaplar
  const Rz1 = 372, Rz2 = 332;                 // zodyak halkası
  const RpOut = biWheel ? 310 : 0;            // dış kişi gezegen halkası (bi-wheel)
  const RpIn  = biWheel ? 250 : 292;          // iç kişi / tek harita gezegen halkası
  const Rhouse = 330;                          // ev çizgilerinin dış ucu
  const Rhub  = 148;                           // açı çemberi
  const pt = (lon, r) => {
    const a = (180 + (lon - ascLon)) * D2R;   // ASC solda, boylamlar saat yönünün tersine
    return [C + r*Math.cos(a), C - r*Math.sin(a)];
  };
  const line = (lon, r1, r2, style) => {
    const [x1,y1] = pt(lon,r1), [x2,y2] = pt(lon,r2);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" ${style}/>`;
  };

  let svg = `<svg viewBox="0 0 ${S} ${S+40}" xmlns="http://www.w3.org/2000/svg" font-family="DejaVu Sans, Segoe UI Symbol, sans-serif">
  <rect width="${S}" height="${S+40}" fill="#ffffff"/>
  <text x="${C}" y="26" text-anchor="middle" font-size="19" fill="#2a2470" font-weight="bold">${esc(opts.title||"")}</text>
  <g transform="translate(0,34)">
  <circle cx="${C}" cy="${C}" r="${Rz1}" fill="none" stroke="#2a2470" stroke-width="2"/>
  <circle cx="${C}" cy="${C}" r="${Rz2}" fill="none" stroke="#2a2470" stroke-width="1.4"/>
  <circle cx="${C}" cy="${C}" r="${Rhub}" fill="none" stroke="#2a2470" stroke-width="1"/>`;

  // Zodyak: 30°'lik dilim çizgileri + burç sembolleri + 10°'lik tikler
  for(let s=0; s<12; s++){
    svg += line(s*30, Rz2, Rz1, `stroke="#2a2470" stroke-width="1"`);
    const [gx,gy] = pt(s*30+15, (Rz1+Rz2)/2);
    svg += `<text x="${gx.toFixed(1)}" y="${(gy+8).toFixed(1)}" text-anchor="middle" font-size="22" fill="${SIGN_COLOR[s%4]}">${SIGN_GLYPH[s]}</text>`;
    for(let t=10; t<30; t+=10) svg += line(s*30+t, Rz2, Rz2+8, `stroke="#8a86b8" stroke-width="0.7"`);
  }

  // Placidus ev çizgileri + ev numaraları (+ ASC/MC etiketleri)
  const cusps = chart.houseCusps.map(c=>c.longitude);
  for(let h=0; h<12; h++){
    const heavy = (h===0 || h===9); // ASC ve MC
    svg += line(cusps[h], Rhub, Rhouse, `stroke="#2a2470" stroke-width="${heavy?2.4:0.9}" ${heavy?"":'stroke-dasharray="0"'} opacity="${heavy?1:0.55}"`);
    const nextC = cusps[(h+1)%12];
    const mid = norm(cusps[h] + norm(nextC - cusps[h])/2);
    const [nx,ny] = pt(mid, Rhub+16);
    svg += `<text x="${nx.toFixed(1)}" y="${(ny+4).toFixed(1)}" text-anchor="middle" font-size="12" fill="#8a86b8">${h+1}</text>`;
  }
  const [ax,ay] = pt(cusps[0], Rz1+0); // AC etiketi
  svg += `<text x="${(ax<C?ax-4:ax+4).toFixed(1)}" y="${(ay-6).toFixed(1)}" text-anchor="${ax<C?"end":"start"}" font-size="14" fill="#2a2470" font-weight="bold">AC</text>`;
  const [mx,my] = pt(cusps[9], Rz1);
  svg += `<text x="${mx.toFixed(1)}" y="${(my<C?my-8:my+16).toFixed(1)}" text-anchor="middle" font-size="14" fill="#2a2470" font-weight="bold">MC</text>`;

  // Gezegen yerleşimi (çakışma önleme: görünür açıyı 7.5°'lik minimum aralıkla kaydır)
  const layout = (planets) => {
    const items = planets.map(p=>({ ...p, disp: p.longitude }))
      .sort((a,b)=>norm(a.longitude-ascLon)-norm(b.longitude-ascLon));
    for(let i=1;i<items.length;i++){
      const prev = norm(items[i-1].disp-ascLon), cur = norm(items[i].disp-ascLon);
      if(norm(cur-prev) < 7.5 && norm(cur-prev) >= 0) items[i].disp = norm(ascLon + prev + 7.5);
    }
    return items;
  };
  const drawPlanets = (planets, rGlyph, color) => {
    let out = "";
    for(const p of layout(planets)){
      const g = PLANET_GLYPH[p.name] || p.name.slice(0,2);
      out += line(p.longitude, Rz2, Rz2-7, `stroke="${color}" stroke-width="1.6"`);           // gerçek derece işareti
      const [px,py] = pt(p.disp, rGlyph);
      const [lx,ly] = pt(p.disp, rGlyph-22);
      out += `<text x="${px.toFixed(1)}" y="${(py+7).toFixed(1)}" text-anchor="middle" font-size="21" fill="${color}">${g}</text>`;
      out += `<text x="${lx.toFixed(1)}" y="${(ly+4).toFixed(1)}" text-anchor="middle" font-size="9.5" fill="${color}">${Math.floor(p.degree)}°${p.retro?" R":""}</text>`;
    }
    return out;
  };
  const innerPlanets = chart.planets;
  svg += drawPlanets(innerPlanets, RpIn, "#1c1b33");
  if(biWheel) svg += drawPlanets(opts.outerChart.planets, RpOut, "#b03a2e");

  // Açı çizgileri (merkez çember üzerinde)
  const aspects = opts.aspects || chart.aspects || [];
  const findLon = (name) => {
    const clean = name.replace(/^(A|B|SR|LR|T|Natal|Transit)[- ]/,"");
    const inP = innerPlanets.find(p=>p.name===clean || p.name===name);
    if(inP) return { lon: inP.longitude, ring:"in" };
    if(biWheel){ const oP = opts.outerChart.planets.find(p=>p.name===clean || p.name===name); if(oP) return { lon:oP.longitude, ring:"out" }; }
    return null;
  };
  for(const a of aspects){
    const st = ASPECT_STYLE[a.aspect]; if(!st) continue;
    if(a.orb > 6) continue; // çarkı sade tutmak için dar orblar
    const A = findLon(a.a), B = findLon(a.b); if(!A||!B) continue;
    const [x1,y1] = pt(A.lon, Rhub), [x2,y2] = pt(B.lon, Rhub);
    svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${st.color}" stroke-width="${st.width}" ${st.dash?`stroke-dasharray="${st.dash}"`:""} opacity="0.85"/>`;
  }

  svg += `</g>`;
  // Alt açıklama + bi-wheel lejantı
  let legend = `☌ Kavuşum · ✶ Sekstil · □ Kare · △ Üçgen · ☍ Karşıt`;
  if(biWheel) legend = `${esc(opts.innerLabel||"İç halka")} (koyu) · ${esc(opts.outerLabel||"Dış halka")} (kırmızı) — ${legend}`;
  svg += `<text x="${C}" y="${S+32}" text-anchor="middle" font-size="11" fill="#8a86b8">${legend}</text></svg>`;
  return svg;
}

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
