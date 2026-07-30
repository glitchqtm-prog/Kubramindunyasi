// lib/astrology.js — v2
// Yüksek hassasiyetli motor: astronomy-engine (JPL tabanlı) + Placidus ev sistemi
// Yeni: MC, Placidus ev uçları, Ay Düğümleri, Chiron (yaklaşık), element/nitelik dengesi,
//       kompozit harita, SR-natal temasları, 12 aylık transit takvimi
import * as Astronomy from "astronomy-engine";
import { DateTime } from "luxon";
import { swissAvailable, swissLongitude, SE } from "./swiss.js";

export const SIGNS = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
const ELEMENTS = ["Ateş","Toprak","Hava","Su"]; // signIndex % 4
const QUALITIES = ["Öncü","Sabit","Değişken"];  // signIndex % 3

const D2R = Math.PI/180, R2D = 180/Math.PI;
const norm360 = d => ((d % 360) + 360) % 360;
const sind = d => Math.sin(d*D2R), cosd = d => Math.cos(d*D2R), tand = d => Math.tan(d*D2R);
const asind = x => Math.asin(Math.max(-1,Math.min(1,x)))*R2D;
const acosd = x => Math.acos(Math.max(-1,Math.min(1,x)))*R2D;
const atan2d = (y,x) => norm360(Math.atan2(y,x)*R2D);

export function signOf(lon){
  const i = Math.floor(norm360(lon)/30);
  return { sign: SIGNS[i], signIndex: i, degree: +(norm360(lon)-i*30).toFixed(2),
           element: ELEMENTS[i%4], quality: QUALITIES[i%3] };
}

const PLANETS = [
  ["Güneş",Astronomy.Body.Sun],["Ay",Astronomy.Body.Moon],["Merkür",Astronomy.Body.Mercury],
  ["Venüs",Astronomy.Body.Venus],["Mars",Astronomy.Body.Mars],["Jüpiter",Astronomy.Body.Jupiter],
  ["Satürn",Astronomy.Body.Saturn],["Uranüs",Astronomy.Body.Uranus],["Neptün",Astronomy.Body.Neptune],
  ["Plüton",Astronomy.Body.Pluto]
];

const SWE_ID = { "Güneş":0,"Ay":1,"Merkür":2,"Venüs":3,"Mars":4,"Jüpiter":5,"Satürn":6,"Uranüs":7,"Neptün":8,"Plüton":9 };

function eclLon(body, date){
  if (body === Astronomy.Body.Sun) return norm360(Astronomy.SunPosition(date).elon);
  if (body === Astronomy.Body.Moon) return norm360(Astronomy.EclipticGeoMoon(date).lon);
  return norm360(Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon);
}

// Swiss varsa onu, yoksa astronomy-engine'i kullanır
function planetLon(name, body, date){
  const s = swissLongitude(date, SWE_ID[name]);
  if (s) return { lon: s.lon, retro: s.retro };
  return { lon: eclLon(body, date), retro: isRetro(body, date) };
}

// Retro kontrolü: 1 gün sonraki boylamla karşılaştır (Güneş/Ay hariç)
function isRetro(body, date){
  if (body===Astronomy.Body.Sun || body===Astronomy.Body.Moon) return false;
  const a = eclLon(body,date), b = eclLon(body,new Date(date.getTime()+86400e3));
  let d = b-a; if(d>180)d-=360; if(d<-180)d+=360;
  return d < 0;
}

// ---- Ay Düğümleri: Swiss varsa GERÇEK düğüm, yoksa ortalama düğüm ----
export function lunarNodes(date){
  const s = swissLongitude(date, SE.TRUE_NODE);
  if (s) return { north: s.lon, south: norm360(s.lon+180), tip: "Gerçek Düğüm (Swiss)" };
  const jd = date.getTime()/86400e3 + 2440587.5;
  const d = jd - 2451545.0;
  const north = norm360(125.0445479 - 0.0529539222*d);
  return { north, south: norm360(north+180), tip: "Ortalama Düğüm" };
}

// ---- Chiron (Kepler yörünge elemanlarıyla YAKLAŞIK; doğruluk ~±1-2°) ----
// Üretim kalitesi hassasiyet istenirse Swiss Ephemeris'e geçilebilir (README notu).
const CHIRON = { a:13.6981, e:0.38156, i:6.9290, Om:209.380, w:339.470, Tperi:2450143.5, P:18540 };
export function chironLon(date){
  const jd = date.getTime()/86400e3 + 2440587.5;
  let M = norm360(360/CHIRON.P * (jd - CHIRON.Tperi)) * D2R;
  let E = M;
  for(let k=0;k<40;k++) E = M + CHIRON.e*Math.sin(E);
  const nu = 2*Math.atan2(Math.sqrt(1+CHIRON.e)*Math.sin(E/2), Math.sqrt(1-CHIRON.e)*Math.cos(E/2));
  const r = CHIRON.a*(1-CHIRON.e*Math.cos(E));
  const u = nu + CHIRON.w*D2R;
  const Om = CHIRON.Om*D2R, inc = CHIRON.i*D2R;
  // Heliosentrik ekliptik (J2000)
  const xh = r*(Math.cos(Om)*Math.cos(u) - Math.sin(Om)*Math.sin(u)*Math.cos(inc));
  const yh = r*(Math.sin(Om)*Math.cos(u) + Math.cos(Om)*Math.sin(u)*Math.cos(inc));
  const zh = r*(Math.sin(u)*Math.sin(inc));
  // Ekliptik -> Ekvatoral J2000
  const eps = 23.43928*D2R;
  const xq = xh, yq = yh*Math.cos(eps) - zh*Math.sin(eps), zq = yh*Math.sin(eps) + zh*Math.cos(eps);
  const earth = Astronomy.HelioVector(Astronomy.Body.Earth, date);
  const vec = new Astronomy.Vector(xq-earth.x, yq-earth.y, zq-earth.z, Astronomy.MakeTime(date));
  return norm360(Astronomy.Ecliptic(vec).elon);
}

// ---- Yükselen & MC ----
function ramcOf(date, longitude){
  return norm360(Astronomy.SiderealTime(date)*15 + longitude);
}
export function ascMc(date, lat, lon){
  const ramc = ramcOf(date, lon);
  const eps = 23.4367;
  const mc = atan2d(sind(ramc), cosd(ramc)*cosd(eps));
  let asc = atan2d(-cosd(ramc), sind(ramc)*cosd(eps) + tand(lat)*sind(eps));
  // ASC her zaman MC'den ~90° sonra (doğu ufku) olmalı
  if (norm360(asc - mc) > 180) asc = norm360(asc + 180);
  return { asc, mc, ramc, eps };
}

// ---- Placidus ev uçları ----
// |enlem| > 66° için Placidus tanımsızlaşır -> Porphyry'ye düşülür.
export function placidusCusps(date, lat, lon){
  const { asc, mc, ramc, eps } = ascMc(date, lat, lon);
  const cusps = new Array(13).fill(0);
  cusps[1]=asc; cusps[10]=mc; cusps[4]=norm360(mc+180); cusps[7]=norm360(asc+180);
  if (Math.abs(lat) > 66) { // Porphyry fallback (yüksek enlem)
    const a1 = norm360(cusps[4]-cusps[1])/3, a2 = norm360(cusps[7]-cusps[4])/3;
    cusps[2]=norm360(cusps[1]+a1); cusps[3]=norm360(cusps[1]+2*a1);
    cusps[5]=norm360(cusps[4]+a2); cusps[6]=norm360(cusps[4]+2*a2);
  } else {
    const raToLon = ra => atan2d(sind(ra), cosd(ra)*cosd(eps));
    const iter = (offset, f, above) => {
      let ra = norm360(ramc + offset);
      for(let k=0;k<30;k++){
        ra = above
          ? norm360(ramc + f*acosd(-sind(ra)*tand(eps)*tand(lat)))
          : norm360(ramc + 180 - f*acosd(sind(ra)*tand(eps)*tand(lat)));
      }
      return raToLon(ra);
    };
    cusps[11] = iter(30, 1/3, true);
    cusps[12] = iter(60, 2/3, true);
    cusps[2]  = iter(120, 2/3, false);
    cusps[3]  = iter(150, 1/3, false);
    cusps[5]=norm360(cusps[11]+180); cusps[6]=norm360(cusps[12]+180);
    cusps[8]=norm360(cusps[2]+180);  cusps[9]=norm360(cusps[3]+180);
  }
  return { cusps, asc, mc };
}

function houseOf(lonP, cusps){
  for(let h=1; h<=12; h++){
    const a = cusps[h], b = cusps[h===12?1:h+1];
    const span = norm360(b-a), pos = norm360(lonP-a);
    if (pos < span) return h;
  }
  return 12;
}

// ---- Doğum haritası ----
export function computeChart(utcDate, lat, lon){
  const { cusps, asc, mc } = placidusCusps(utcDate, lat, lon);
  const planets = PLANETS.map(([name, body]) => {
    const { lon: l, retro } = planetLon(name, body, utcDate);
    return { name, longitude:+l.toFixed(2), ...signOf(l), house: houseOf(l, cusps), retro };
  });
  // Swiss Ephemeris varsa: Gerçek Düğüm + gerçek Chiron; yoksa yaklaşık yedekler
  const swNode = swissLongitude(utcDate, SE.TRUE_NODE);
  const swChi  = swissLongitude(utcDate, SE.CHIRON);
  const nodes = lunarNodes(utcDate);
  const northLon = swNode ? swNode.lon : nodes.north;
  const southLon = norm360(northLon + 180);
  const chi = swChi ? swChi.lon : chironLon(utcDate);
  const chiName = swChi ? "Chiron" : "Chiron (yaklaşık)";
  const chiRetro = swChi ? swChi.retro : isRetroChiron(utcDate);
  const points = [
    { name:"Kuzey Ay Düğümü", longitude:+northLon.toFixed(2), ...signOf(northLon), house:houseOf(northLon,cusps), retro:true },
    { name:"Güney Ay Düğümü", longitude:+southLon.toFixed(2), ...signOf(southLon), house:houseOf(southLon,cusps), retro:true },
    { name:chiName, longitude:+chi.toFixed(2), ...signOf(chi), house:houseOf(chi,cusps), retro:chiRetro }
  ];
  const all = [...planets, ...points];
  return {
    utc: utcDate.toISOString(), latitude:lat, longitude:lon,
    evSistemi: Math.abs(lat)>66 ? "Porphyry (yüksek enlem)" : "Placidus",
    efemeris: swissAvailable() ? "Swiss Ephemeris" : "astronomy-engine + yaklaşık Chiron",
    ascendant: { longitude:+asc.toFixed(2), ...signOf(asc) },
    mc: { longitude:+mc.toFixed(2), ...signOf(mc) },
    houseCusps: cusps.slice(1).map((c,i)=>({ ev:i+1, longitude:+c.toFixed(2), ...signOf(c) })),
    planets: all,
    aspects: aspectsWithin(all),
    elementBalance: balance(all, asc)
  };
}
function isRetroChiron(date){
  const a = chironLon(date), b = chironLon(new Date(date.getTime()+86400e3));
  let d=b-a; if(d>180)d-=360; if(d<-180)d+=360; return d<0;
}

function balance(all, asc){
  const el = {Ateş:0,Toprak:0,Hava:0,Su:0}, qu = {Öncü:0,Sabit:0,Değişken:0};
  const core = all.filter(p=>!p.name.includes("Düğüm")); // 10 gezegen + Chiron
  for(const p of core){ el[p.element]++; qu[p.quality]++; }
  const a = signOf(asc); el[a.element]++; qu[a.quality]++;
  return { elementler: el, nitelikler: qu, not: "10 gezegen + Chiron + Yükselen sayıldı" };
}

// ---- Açılar ----
const ASPECTS = [["Kavuşum",0,8],["Sekstil",60,4],["Kare",90,7],["Üçgen",120,7],["Karşıt",180,8],["Quincunx",150,3]];
const angleDiff = (a,b) => { let d = Math.abs(norm360(a)-norm360(b)); return d>180?360-d:d; };

export function aspectsWithin(list){
  const out=[];
  for(let i=0;i<list.length;i++) for(let j=i+1;j<list.length;j++){
    const d = angleDiff(list[i].longitude, list[j].longitude);
    for(const [name,ang,orb] of ASPECTS)
      if(Math.abs(d-ang)<=orb) out.push({a:list[i].name,b:list[j].name,aspect:name,orb:+Math.abs(d-ang).toFixed(2)});
  }
  return out;
}
export function aspectsBetween(chA, chB, tag=["A","B"]){
  const out=[];
  for(const p of chA.planets) for(const q of chB.planets){
    const d = angleDiff(p.longitude, q.longitude);
    for(const [name,ang,orb] of ASPECTS)
      if(Math.abs(d-ang)<=orb) out.push({a:`${tag[0]}-${p.name}`,b:`${tag[1]}-${q.name}`,aspect:name,orb:+Math.abs(d-ang).toFixed(2)});
  }
  return out;
}

// ---- Return haritaları ----
function findReturn(body, targetLon, t0, spanDays){
  const f = t => { let d = norm360(eclLon(body,t)-targetLon); return d>180?d-360:d; };
  let lo = new Date(t0.getTime()-spanDays*86400e3), hi = new Date(t0.getTime()+spanDays*86400e3);
  let prevT = lo, prevV = f(lo);
  for(let t=new Date(lo.getTime()+6*3600e3); t<=hi; t=new Date(t.getTime()+6*3600e3)){
    const v=f(t);
    if(prevV<=0 && v>=0 && Math.abs(v-prevV)<180){ lo=prevT; hi=t; break; }
    prevT=t; prevV=v;
  }
  for(let k=0;k<60;k++){ const m=new Date((lo.getTime()+hi.getTime())/2); if(f(m)<0)lo=m; else hi=m; }
  return new Date((lo.getTime()+hi.getTime())/2);
}
export function solarReturn(natal, year, lat, lon){
  const sun = natal.planets.find(p=>p.name==="Güneş").longitude;
  const b = new Date(natal.utc);
  const t = findReturn(Astronomy.Body.Sun, sun, new Date(Date.UTC(year,b.getUTCMonth(),b.getUTCDate(),b.getUTCHours())), 4);
  return { returnMoment:t.toISOString(), chart: computeChart(t, lat, lon) };
}
export function lunarReturn(natal, around, lat, lon){
  const moon = natal.planets.find(p=>p.name==="Ay").longitude;
  const t = findReturn(Astronomy.Body.Moon, moon, around, 15);
  return { returnMoment:t.toISOString(), chart: computeChart(t, lat, lon) };
}

// ---- Davison & Kompozit ----
export function davisonChart(utcA, utcB, latA, lonA, latB, lonB){
  const midT = new Date((utcA.getTime()+utcB.getTime())/2);
  const midLat = (latA+latB)/2;
  let dLon = lonB-lonA; if(dLon>180)dLon-=360; if(dLon<-180)dLon+=360;
  return computeChart(midT, midLat, norm360(lonA+dLon/2+180)-180);
}
export function compositeChart(chA, chB){
  const mid = (a,b) => { let d=norm360(b-a); if(d>180){ [a,b]=[b,a]; d=360-d; } return norm360(a+d/2); };
  const planets = chA.planets.map(p=>{
    const q = chB.planets.find(x=>x.name===p.name);
    if(!q) return null;
    const l = mid(p.longitude, q.longitude);
    return { name:p.name, longitude:+l.toFixed(2), ...signOf(l) };
  }).filter(Boolean);
  return { tip:"Kompozit (orta nokta) harita — ev konumları yerine burç/açı odaklı yorumlanır",
           planets, aspects: aspectsWithin(planets) };
}

// ---- Transitler ----
export function transits(natal, date, lat, lon){
  const now = computeChart(date, lat, lon);
  const hits=[];
  for(const t of now.planets) for(const n of natal.planets){
    const d = angleDiff(t.longitude, n.longitude);
    for(const [name,ang,orb] of ASPECTS)
      if(Math.abs(d-ang)<=Math.min(orb,3))
        hits.push({transit:`Transit ${t.name}`, natal:`Natal ${n.name}`, aspect:name, orb:+Math.abs(d-ang).toFixed(2)});
  }
  return { date:date.toISOString(), skyNow:now.planets, aspectsToNatal:hits };
}

// 12 aylık öngörü takvimi: yavaş gezegenlerin natal kişisel noktalara temasları (tarih aralıklarıyla)
const SLOW = [["Jüpiter",Astronomy.Body.Jupiter],["Satürn",Astronomy.Body.Saturn],
              ["Uranüs",Astronomy.Body.Uranus],["Neptün",Astronomy.Body.Neptune],["Plüton",Astronomy.Body.Pluto],
              ["Mars",Astronomy.Body.Mars]];
export function upcomingTransits(natal, fromDate, months=12){
  const targets = natal.planets
    .filter(p=>["Güneş","Ay","Merkür","Venüs","Mars"].includes(p.name))
    .concat([{name:"Yükselen", longitude: natal.ascendant.longitude},
             {name:"MC", longitude: natal.mc.longitude}]);
  const MAJOR = [["Kavuşum",0],["Kare",90],["Üçgen",120],["Karşıt",180]];
  const events = {};
  const stepDays = 5, orb = 1.5;
  const end = new Date(fromDate.getTime() + months*30.44*86400e3);
  for(let t=new Date(fromDate); t<=end; t=new Date(t.getTime()+stepDays*86400e3)){
    for(const [tName,body] of SLOW){
      const lonT = eclLon(body,t);
      for(const n of targets){
        const d = angleDiff(lonT, n.longitude);
        for(const [aName,ang] of MAJOR){
          if(Math.abs(d-ang)<=orb){
            const key = `${tName}|${aName}|${n.name}`;
            if(!events[key]) events[key]={transit:tName, aspect:aName, natal:n.name, baslangic:t.toISOString().slice(0,10), bitis:t.toISOString().slice(0,10)};
            else events[key].bitis = t.toISOString().slice(0,10);
          }
        }
      }
    }
  }
  return Object.values(events).sort((a,b)=>a.baslangic.localeCompare(b.baslangic));
}

export function localToUTC(dateStr, timeStr, timezone){
  return DateTime.fromISO(`${dateStr}T${timeStr||"12:00"}`, { zone: timezone||"Europe/Istanbul" }).toUTC().toJSDate();
}
