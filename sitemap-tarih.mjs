/* sitemap-tarih.mjs — sitemap.xml'deki <lastmod> tarihlerini her sayfanın GERÇEK son değişiklik
   tarihine (git geçmişindeki son commit, İstanbul günü) eşitler.
   Elle tarih yazmaya gerek kalmaz; Google'a yanlış "güncellendi" sinyali gitmez.
   Çalıştırma: node sitemap-tarih.mjs   (tam git geçmişi gerekir: actions/checkout fetch-depth: 0) */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const YOL = "sitemap.xml";
const xml = readFileSync(YOL, "utf-8");

function dosyaYolu(loc){
  const p = loc.replace(/^https:\/\/astroyuvam\.com\//, "");
  if (p === "") return "index.html";
  if (p.endsWith("/")) return p + "index.html";
  return p;
}
function sonDegisiklik(dosya){
  if (!existsSync(dosya)) return null;
  const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", dosya], { encoding: "utf-8" }).trim();
  if (!out) return null;
  // İstanbul günü (UTC+3)
  const d = new Date(new Date(out).getTime() + 3 * 3600000);
  return d.toISOString().slice(0, 10);
}

let degisen = 0, atlanan = [];
const yeni = xml.replace(/(<url>\s*<loc>)([^<]+)(<\/loc>\s*<lastmod>)([^<]*)(<\/lastmod>)/g, (tum, a, loc, b, eski, c) => {
  const t = sonDegisiklik(dosyaYolu(loc));
  if (!t) { atlanan.push(loc); return tum; }
  if (t !== eski) degisen++;
  return a + loc + b + t + c;
});

if (atlanan.length) console.log("Dosyası bulunamayan adresler (dokunulmadı):", atlanan.join(", "));
if (yeni !== xml) { writeFileSync(YOL, yeni, "utf-8"); }
console.log(`sitemap.xml: ${degisen} tarih düzeltildi.`);
