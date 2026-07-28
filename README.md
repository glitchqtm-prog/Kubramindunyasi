# Astro Rapor — Demo Uygulama

Doğum haritası, Solar Return, Lunar Return ve Sinastri raporları satan; **gerçek
gezegen konumu hesaplayan** (Swiss Ephemeris), **yapay zekâ ile yorum üreten**
(Claude API) ve raporu hazır olunca **otomatik e-posta ile gönderen** bir demo web
uygulaması.

## Mimari

```
astro-app/
├── backend/
│   ├── app.py                # Flask API + sipariş akışı
│   ├── chart_calculator.py   # Swiss Ephemeris ile GERÇEK gezegen hesaplama
│   ├── report_generator.py   # Claude API ile Türkçe rapor metni üretimi
│   ├── pdf_generator.py      # Metni PDF'e çevirir (reportlab)
│   ├── email_sender.py       # Gmail SMTP ile otomatik gönderim
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── index.html            # Rapor seçim ekranı (4 kart)
    ├── order.html            # Bilgi formu + demo ödeme + üretim durumu
    ├── reports-data.js       # Rapor kataloğu (fiyat, açıklama)
    └── style.css
```

## Akış

1. Kullanıcı `index.html`'de bir rapor kartı seçer → `order.html`'e gider.
2. Ad, e-posta, doğum tarihi/saati/yeri (Sinastri için ikinci kişi bilgileri de)
   girilir → `POST /api/order` ile sipariş oluşturulur (henüz ödeme alınmamıştır).
3. **Demo ödeme ekranı** gösterilir → `POST /api/pay/<order_id>` çağrılır.
   Bu adım şu an **sahte**dir: kart bilgilerinin sadece dolu olduğu kontrol edilir,
   gerçek bir ödeme sağlayıcısına bağlanmaz.
4. Ödeme "başarılı" sayılınca arka planda (ayrı thread):
   - `chart_calculator.py` → gerçek gezegen/ev/yükselen konumlarını hesaplar
     (Solar/Lunar Return için ilgili dönüş anını, Sinastri için iki haritayı ve
     aralarındaki açıları bulur).
   - `report_generator.py` → bu gerçek verileri Claude API'ye gönderip
     kişiye özel, çok sayfalı Türkçe rapor metni üretir.
   - `pdf_generator.py` → metni şık bir PDF'e dönüştürür.
   - `email_sender.py` → PDF'i alıcının Gmail adresine otomatik gönderir.
5. Frontend, `GET /api/order/<id>/status` ile durumu 3 saniyede bir sorgular;
   hazır olunca indirme linki gösterilir.

## Kurulum

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# .env dosyasını doldurun (aşağıya bakın)
python app.py
```

Tarayıcıda `http://localhost:5000` adresini açın.

## .env Yapılandırması

### 1) Claude API anahtarı (rapor metinleri için, zorunlu)
`ANTHROPIC_API_KEY` — https://console.anthropic.com adresinden alınır.
Bu olmadan rapor metni üretilemez (hesaplama kısmı yine çalışır).

### 2) Gmail ile otomatik gönderim
Sorunuza cevaben en basit ve hızlı kurulan yöntemi seçtim: **Gmail SMTP + Uygulama
Şifresi** (Gmail API/OAuth yerine). Gerekçesi:
- Gmail API + OAuth, Google Cloud Console'da proje açma, OAuth consent screen
  onayı, refresh token yönetimi gerektirir — tek bir gönderici hesabından
  otomatik mail atan bir sistem için gereksiz karmaşık.
- SMTP + Uygulama Şifresi 5 dakikada kurulur, kod tarafında zaten hazır
  (`email_sender.py`).
- İleride günde binlerce mail atacaksanız (yüksek hacim / teslim edilebilirlik
  önemliyse) Gmail API'ye veya SendGrid/Postmark gibi transaksiyonel bir servise
  geçmenizi öneririm — `email_sender.py` içindeki `send_report_email` fonksiyonunu
  değiştirmeniz yeterli, geri kalan sistem etkilenmez.

Kurulum:
1. Gmail hesabınızda **2 Adımlı Doğrulama**'yı açın.
2. https://myaccount.google.com/apppasswords adresinden 16 haneli bir uygulama
   şifresi oluşturun.
3. `.env` dosyasında:
   ```
   GMAIL_ADDRESS=siteniz@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_DEMO_MODE=False
   ```
4. `EMAIL_DEMO_MODE=True` bırakırsanız gerçek mail gönderilmez, sadece terminale
   log yazılır — geliştirme/test için önerilir.

## Şu An Demo Olan Kısımlar (Prod'a Geçerken Değiştirin)

- **Ödeme**: `app.py` içindeki `mock_pay` fonksiyonu kart bilgisi doğrulaması
  yapmaz, gerçek tahsilat almaz. Türkiye'de **iyzico** veya **PayTR**, uluslararası
  için **Stripe** entegre edip, yalnızca sağlayıcıdan "ödeme başarılı" bildirimi
  geldiğinde `_process_order` çağrılmalı.
- **Sipariş kayıtları**: `ORDERS` bir Python sözlüğünde (bellekte) tutuluyor;
  sunucu yeniden başlarsa kaybolur. Gerçek kullanımda PostgreSQL/SQLite gibi bir
  veritabanına taşıyın.
- **Efemeris**: `pyswisseph` yerleşik (moshier) hesaplama motorunu kullanıyor,
  ekstra veri dosyası gerekmez; çok yüksek hassasiyet gerekiyorsa resmi Swiss
  Ephemeris veri dosyalarını (`swe.set_ephe_path(...)`) ekleyebilirsiniz.
- **Geocoding**: `geopy` + Nominatim (OpenStreetMap) ücretsiz servisini kullanır;
  yüksek trafik için kendi rate-limitinize dikkat edin veya ücretli bir geocoding
  servisine geçin.

## Notlar

- Bu ortamda internet erişimi kapalı olduğu için (sanal alan kısıtlaması) kod
  burada gerçek bir API çağrısıyla test edilemedi; ancak tüm dosyalar sözdizimi
  olarak doğrulandı. Kendi ortamınızda `pip install -r requirements.txt` sonrası
  çalıştırıp test etmenizi öneririm.
- Rapor metinlerinin telif/hassasiyet açısından uygun olması için `report_generator.py`
  içindeki `system_prompt`'u istediğiniz üsluba göre özelleştirebilirsiniz.
