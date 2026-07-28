"""
email_sender.py
----------------
Hazırlanan PDF raporunu, satın alan kişinin e-posta adresine otomatik gönderir.

Kullanılan yöntem: Gmail SMTP + "Uygulama Şifresi" (App Password).
Neden bu yöntem: Gmail API + OAuth kurulumu (Google Cloud Console'da proje
açma, consent screen onayı vb.) production'a taşırken daha güçlü bir seçenek
ama demo/tekil gönderici senaryosu için gereksiz karmaşık. SMTP + App Password
birkaç dakikada kurulur ve otomatik gönderim için yeterlidir. İleride yüksek
hacimli gönderim gerekirse Gmail API'ye veya SendGrid/Postmark gibi
transaksiyonel bir e-posta servisine geçilebilir.
"""

import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

logger = logging.getLogger("email_sender")


def send_report_email(to_email: str, person_name: str, report_title: str, pdf_path: str):
    demo_mode = os.environ.get("EMAIL_DEMO_MODE", "True").lower() == "true"
    gmail_address = os.environ.get("GMAIL_ADDRESS")
    gmail_app_password = os.environ.get("GMAIL_APP_PASSWORD")

    subject = f"{report_title} Hazır! ✨"
    body = (
        f"Merhaba {person_name},\n\n"
        f"{report_title} raporunuz hazırlandı, ektedir.\n\n"
        "Bizi tercih ettiğiniz için teşekkür ederiz.\n\n"
        "İyi okumalar dileriz."
    )

    if demo_mode or not gmail_address or not gmail_app_password:
        logger.info(
            "[DEMO MODE] Gerçek mail gönderilmedi. Alıcı: %s | Konu: %s | Ek: %s",
            to_email, subject, pdf_path,
        )
        return {"sent": False, "demo": True, "detail": "EMAIL_DEMO_MODE aktif, gerçek gönderim yapılmadı."}

    msg = MIMEMultipart()
    msg["From"] = gmail_address
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    with open(pdf_path, "rb") as f:
        part = MIMEApplication(f.read(), _subtype="pdf")
        part.add_header("Content-Disposition", "attachment", filename=os.path.basename(pdf_path))
        msg.attach(part)

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(gmail_address, gmail_app_password)
        server.sendmail(gmail_address, to_email, msg.as_string())

    return {"sent": True, "demo": False}
