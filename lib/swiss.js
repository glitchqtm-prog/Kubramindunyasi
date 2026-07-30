// lib/swiss.js — Swiss Ephemeris entegrasyonu (güvenli sarmalayıcı)
// Paket derlenemezse sistem çökmez; astrology.js otomatik olarak yaklaşık hesaba düşer.
import { createRequire } from "module";

let swe = null;
try {
  const require = createRequire(import.meta.url);
  swe = require("swisseph");
  const path = require("path");
  const ephePath = path.join(path.dirname(require.resolve("swisseph")), "ephe");
  swe.swe_set_ephe_path(ephePath);
  console.log("✦ Swiss Ephemeris aktif (ephe:", ephePath + ")");
} catch (e) {
  console.log("⚠ Swiss Ephemeris yüklenemedi, yaklaşık hesap kullanılacak:", e.message);
}

export const SE = { SUN:0, MOON:1, TRUE_NODE:11, CHIRON:15 };
export function swissAvailable(){ return !!swe; }

/** Ekliptik boylam + retro bilgisi döner; hata olursa null (çağıran yedeğe düşer). */
export function swissLongitude(date, ipl){
  if(!swe) return null;
  try{
    const jd = date.getTime()/86400e3 + 2440587.5;
    let r = swe.swe_calc_ut(jd, ipl, swe.SEFLG_SWIEPH | swe.SEFLG_SPEED);
    if(!r || r.error || typeof r.longitude !== "number")
      r = swe.swe_calc_ut(jd, ipl, swe.SEFLG_MOSEPH | swe.SEFLG_SPEED);
    if(!r || typeof r.longitude !== "number") return null;
    return { lon: ((r.longitude % 360) + 360) % 360, retro: (r.longitudeSpeed ?? 0) < 0 };
  }catch{ return null; }
}
