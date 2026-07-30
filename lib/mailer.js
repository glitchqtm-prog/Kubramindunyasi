// lib/mailer.js — Brevo HTTP API sürümü (Render free SMTP engelini aşar)

export async function sendReportEmail({ to, name, reportTitle, pdfBuffer }) {
  const filename = `${reportTitle.replace(/\s+/g, "_")}_${name.replace(/\s+/g, "_")}.pdf`;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "Astro Rapor ✦", email: process.env.GMAIL_USER },
      to: [{ email: to, name }],
      subject: `✦ ${reportTitle} hazır, ${name}!`,
      htmlContent: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:auto;background:#14101f;color:#f0e6d2;padding:36px;border-radius:12px">
          <div style="text-align:center;color:#d9b96a;font-size:28px">✦</div>
          <h2 style="text-align:center;color:#f0e6d2">Merhaba ${name},</h2>
          <p style="line-height:1.8;color:#cfc6de">Kişisel <strong style="color:#d9b96a">${reportTitle}</strong>'n yüksek hassasiyetli gezegen konumlarına (Placidus ev sistemi) göre hesaplandı ve senin için özenle yorumlandı. Raporun ekte PDF olarak yer alıyor.</p>
          <p style="line-height:1.8;color:#cfc6de">Raporu sakin bir anında, bir fincan çay eşliğinde okumanı öneririz. 🌙</p>
          <p style="text-align:center;color:#8f83a6;font-size:12px;margin-top:28px">© ${new Date().getFullYear()} Astro Rapor</p>
        </div>`,
      attachment: [{ name: filename, content: pdfBuffer.toString("base64") }]
    })
  });
  if (!res.ok) throw new Error(`Brevo mail hatası: ${res.status} ${await res.text()}`);
}

export async function verifyMailer() { return !!process.env.BREVO_API_KEY; }
