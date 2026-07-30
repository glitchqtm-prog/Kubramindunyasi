// lib/ai.js — v2: uzun raporlar (10+ sayfa) için yüksek token limiti
import Anthropic from "@anthropic-ai/sdk";
import { PROMPTS } from "./prompts.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateReport(type, person, chartData){
  const p = PROMPTS[type];
  if(!p) throw new Error(`Bilinmeyen rapor tipi: ${type}`);

  const userMsg = `Rapor sahibi bilgileri:
${JSON.stringify(person, null, 2)}

GERÇEK HESAPLANMIŞ VERİLER (Placidus ev sistemi; bu verilere sadık kal, konum/açı/orb uydurma):
${JSON.stringify(chartData, null, 2)}

Lütfen "${p.title}" başlıklı raporu, sistem talimatındaki bölüm yapısına birebir uyarak, sadece HTML fragment olarak ve en az ${p.minWords} kelime uzunluğunda üret.`;

  const stream = client.messages.stream({
    model: process.env.AI_MODEL || "claude-sonnet-4-6",
    max_tokens: Number(process.env.AI_MAX_TOKENS) || 48000,
    system: p.system,
    messages: [{ role:"user", content: userMsg }]
  });
  const final = await stream.finalMessage();
  let html = final.content.filter(b=>b.type==="text").map(b=>b.text).join("\n");
  html = html.replace(/```html|```/g, "").trim();
  return { title: p.title, html };
}
