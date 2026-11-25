# Ana sayfanın kaynak dosyaları

`index.html` bu klasördeki dosyalardan üretilir; elle düzenlemek yerine burayı değiştirip yeniden üretmek daha güvenlidir.

- `body.html`: sayfa gövdesi (bölümler, metinler)
- `style.css`: görünüm
- `app.js`: kaydırma filmi, rapor kartları, gökyüzü çarkı, mini araç
- `eski-index.html`: önceki ana sayfa; başlık bilgileri (title, meta açıklama, JSON-LD), menü, SSS, haftalık video bloğu buradan birebir alınır
- `build.py`: hepsini birleştirip `index.html` yazar

Üretmek için depo kökünde:

    python3 .github/araclar/anasayfa/build.py . .github/araclar/anasayfa/eski-index.html .github/araclar/anasayfa

Not: haftalık video bloğu (`#yeniVideo`) `index.html` içinde elle güncelleniyorsa, yeniden üretmeden önce aynı değişiklik `eski-index.html` içindeki bloğa da işlenmelidir.

`../ton.py`: site geneli renk tonu, üst menü, Asterna penceresi ve çerez bandı stilini tüm sayfalara uygular (tekrar çalıştırılabilir).
