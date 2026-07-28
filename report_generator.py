"""
report_generator.py
--------------------
chart_calculator.py'den gelen GERÇEK gezegen verilerini alır, Claude'a
(Anthropic API) gönderip Türkçe, kişiye özel yorum metni üretir.
"""

import os
import json
from anthropic import Anthropic

MODEL = "claude-sonnet-5"

REPORT_CONFIG = {
    "dogum_haritasi": {
        "title": "Haritanı Tanı Raporu",
        "min_pages": 18,
        "sections": [
            "Genel Kişilik Özeti (Güneş, Ay, Yükselen sentezi)",
            "İç Dünya ve Duygular",
            "İlişkiler (aşk dili, ideal partner, ilişkilerde dikkat edilecekler, uyum)",
            "Kariyer Rehberi (yetenekler, potansiyel zorluklar, uygun meslekler)",
            "Yetenekler ve Güçlü Yönler",
            "Zorlayıcı Açılar ve Büyüme Alanları",
            "Yaşam Yolculuğu ve Kilit Noktalar",
        ],
    },
    "solar_return": {
        "title": "Solar Return Raporu",
        "min_pages": 14,
        "sections": [
            "Yılın Genel Teması",
            "Yükselen ve Ev Vurguları",
            "Fırsat Alanları",
            "Dikkat Edilmesi Gereken Konular",
            "Ay Ay Öne Çıkan Dönemler",
        ],
    },
    "lunar_return": {
        "title": "Lunar Return Raporu",
        "min_pages": 8,
        "sections": [
            "Bu Ayki Duygusal Tema",
            "İçgüdüsel Yönelimler",
            "Dikkat Edilmesi Gerekenler",
            "Bu Döngüyü En İyi Şekilde Değerlendirmek İçin Öneriler",
        ],
    },
    "sinastri": {
        "title": "Sinastri Raporu",
        "min_pages": 18,
        "sections": [
            "İlişkinin Genel Enerjisi",
            "Güçlü Yönler ve Uyum Alanları",
            "Potansiyel Çatışma Noktaları",
            "Duygusal Dinamikler",
            "İletişim Tarzı Karşılaştırması",
            "İlişkinin Uzun Vadeli Evrimi",
        ],
    },
}


def _client() -> Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY tanımlı değil (.env dosyasına ekleyin).")
    return Anthropic(api_key=api_key)


def _chart_summary_text(chart: dict) -> str:
    lines = []
    for planet, data in chart["planets"].items():
        retro = " (Retro)" if data.get("retrograde") else ""
        lines.append(f"- {planet}: {data['sign']} burcu, {data['degree_in_sign']}°{retro}")
    lines.append(f"- Yükselen: {chart['ascendant']['sign']} ({chart['ascendant']['degree_in_sign']}°)")
    lines.append(f"- Tepe Noktası (MC): {chart['midheaven']['sign']} ({chart['midheaven']['degree_in_sign']}°)")
    return "\n".join(lines)


def generate_report_text(report_type: str, person_name: str, chart: dict,
                          chart_b: dict = None, synastry_aspects: list = None,
                          person_b_name: str = None) -> str:
    config = REPORT_CONFIG[report_type]
    chart_text = _chart_summary_text(chart)

    if report_type == "sinastri":
        chart_b_text = _chart_summary_text(chart_b)
        aspects_text = "\n".join(
            f"- {a['kişi_a_gezegen']} ile {a['kişi_b_gezegen']} arasında {a['açı']} "
            f"(orb: {a['fark_derece']}°)" for a in synastry_aspects
        ) or "Belirgin majör açı bulunamadı."
        data_block = (
            f"{person_name} doğum haritası:\n{chart_text}\n\n"
            f"{person_b_name} doğum haritası:\n{chart_b_text}\n\n"
            f"Aralarındaki açılar:\n{aspects_text}"
        )
    else:
        data_block = f"{person_name} için hesaplanan gerçek gezegen konumları:\n{chart_text}"

    sections_list = "\n".join(f"{i+1}. {s}" for i, s in enumerate(config["sections"]))

    system_prompt = (
        "Sen deneyimli, sıcak ve içgörülü bir astrologsun. Sana verilen GERÇEK "
        "(Swiss Ephemeris ile hesaplanmış) gezegen konumlarını temel alarak, "
        "kişiye özel, akıcı ve profesyonel bir Türkçe astroloji raporu yazıyorsun. "
        "Asla genel/şablon burç yorumu yazma; her cümle sana verilen spesifik "
        "gezegen-burç kombinasyonlarına dayanmalı. Rapor ortalama "
        f"{config['min_pages']}+ sayfa uzunluğunda olacak kadar kapsamlı olmalı; "
        "her bölüm birkaç paragraf içermeli. Başlıkları Markdown '## ' ile işaretle."
    )

    user_prompt = (
        f"Rapor türü: {config['title']}\n\n"
        f"{data_block}\n\n"
        f"Rapor şu bölümlerden oluşmalı, bu sırayla:\n{sections_list}\n\n"
        "Her bölümü '## Bölüm Başlığı' formatında başlat ve altına detaylı, "
        "kişiye özel yorum yaz. Genel giriş cümlesiyle başla, sıcak ve samimi bir "
        "üslup kullan ama profesyonelliği koru."
    )

    client = _client()
    response = client.messages.create(
        model=MODEL,
        max_tokens=8000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return "".join(block.text for block in response.content if block.type == "text")
