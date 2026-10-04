# Astro Yuvam — English pages kit (read fully before writing any English page)

Repo root: /home/user/kubramindunyasi (static site on GitHub Pages, served at https://astroyuvam.com).
English pages live in `/en/`. Turkish pages stay at the root and must NOT be modified by page agents
(only the dedicated `dogum-giris.js` agent touches that shared file).

## Hard rules
1. **Never mention "astro.com", "Astrodienst" or any competitor brand anywhere** (text, comments, code, alt text, meta).
2. **Native English, not a translation.** Write the page as a skilled native English astrology writer would — adapt idioms,
   examples and structure for a global (US/UK/Canada/Australia) audience. **US spelling** ("color", "center").
   Dates in text like "March 14, 1992" (month name — avoids DD/MM vs MM/DD confusion). Warm, clear, honest, second person "you".
   Avoid AI clichés: tapestry, delve, journey (as metaphor), embrace, unlock, realm, celestial dance, navigate life,
   "in today's world", "it's important to note", "dive into", "cosmic blueprint" overuse. No exclamation-mark spam.
3. **No paid-report selling.** Personalized PDF reports exist only in Turkish today. Remove every `<!--AYBAG:oneri-->` aside,
   every link to `/#cards`, `order.html`, `fiyatlar.html`, `*-analizi.html`, prices (₺/TL/TRY), "Raporlar" CTAs, Asterna chat,
   login/account (`giris.html`, `panelim.html`, `profil.html`, "Hesabım"), Yıldız Günlüğü blog links and `gunluk-yorumum`.
   Where a TR page pushed a report, replace with links to other free English tools.
4. **Internal links only to English pages**: `/en/`, `/en/birth-chart-calculator.html`, `/en/black-moon-lilith-calculator.html`,
   `/en/moon-calendar.html`, `/en/life-path-number-calculator.html`, `/en/zodiac-compatibility-test.html`, `/en/privacy.html`.
   (Turkish pages are reachable only via the language switcher, which the kit already provides.)
5. **Not Turkey-centric.** Replace Turkish cities/examples (İzmir, Ankara…) with global ones (London, New York, Sydney, Toronto),
   remove e-Devlet/nüfus/Turkish-DST content, Turkish culture references, Turkish time zone assumptions.
6. **Zero visible Turkish.** No Turkish words or letters (ç ğ ı ö ş ü İ) in anything a visitor can see — static HTML, JS-generated
   output, alerts, placeholders, `title`/`aria-label`/`alt` attributes, canvas/share texts, SVG `<text>`. The only allowed Turkish
   is the word "Türkçe" inside the language switcher. Internal JS identifiers/keys/comments may stay Turkish (do NOT rename keys
   that logic depends on, e.g. element codes `ates/toprak/hava/su`, `oncu/sabit/degisken`, API field names, `data-*` keys).
7. **Keep it fast.** Same inline-CSS approach as the TR page. No new external resources, fonts, frameworks or images.
   Keep scripts `defer`/inline as the TR page does. Don't add layout shifts above the fold. Page weight should be ≤ the TR page.
8. **Keep the tool working.** Behavior and calculations must match the TR page exactly. Test in a real browser (see Testing).
9. **Honesty.** Astrology is presented as a symbolic tradition for self-reflection/entertainment — never as scientific prediction.
   Keep the calculation facts true (tropical zodiac, Placidus default, Swiss Ephemeris-verified ephemeris) — do not invent features.

## Required page skeleton (exact shared pieces are in `.i18n/en_parcalar.json`)
- `<!DOCTYPE html><html lang="en">` — `lang="en"` is required (menu.js and dogum-giris.js read it).
- `<head>`: charset, viewport, English `<title>` (≤ 65 chars incl. " | Astro Yuvam"), English meta description (140–160 chars),
  `<link rel="canonical" href="{en_url}">`, the page's `hreflang_links` (from the JSON), favicon links (`ortak.favicon_links`),
  `<meta name="theme-color" content="#14101f">`, Open Graph tags in English (og:title, og:description, og:url, og:type, og:locale=en_US,
  og:site_name=Astro Yuvam), JSON-LD translated to English with `"inLanguage":"en"` and English names; drop Offer/price/TRY parts.
  **Do NOT** include `<link rel="manifest">` (the PWA is Turkish) and **do NOT** include the Supabase login "swap" script.
  Include `ortak.am_kritik_style`, `ortak.cerez_kritik_style` and `ortak.menu_yukle_script` exactly as given (same as TR pages).
- Right after `<body>`: the page's `static_nav` string exactly as given (from the JSON).
- Page content (the TR page's own styles/markup adapted).
- Footer (English): social link as on TR, then
  `© 2026 Astro Yuvam — All rights reserved.<br><a href="/en/">Home</a> · <a href="/en/birth-chart-calculator.html">Birth Chart Calculator</a> · <a href="/en/moon-calendar.html">Moon Calendar</a><br><a href="/en/privacy.html">Privacy &amp; Cookies</a> · Contact: <a href="mailto:astroyuvam@gmail.com">astroyuvam@gmail.com</a>`
  (adapt to the page's existing footer style; if the TR page has no footer, add this one in a matching style).
- At the very end of `<body>`: `ortak.cerez_banner_end_of_body` exactly as given (English cookie banner with Accept/Decline;
  menu.js wires the buttons and Google Consent Mode).

## Glossary (use consistently)
Koç Aries · Boğa Taurus · İkizler Gemini · Yengeç Cancer · Aslan Leo · Başak Virgo · Terazi Libra · Akrep Scorpio · Yay Sagittarius ·
Oğlak Capricorn · Kova Aquarius · Balık Pisces | Güneş Sun · Ay Moon · Merkür Mercury · Venüs Venus · Mars Mars · Jüpiter Jupiter ·
Satürn Saturn · Uranüs Uranus · Neptün Neptune · Plüton Pluto · Kiron Chiron · Kuzey Ay Düğümü North Node · Güney Ay Düğümü South Node ·
Lilith (Kara Ay) Black Moon Lilith · Ortalama/Gerçek Lilith Mean/True Lilith · Şans Noktası Part of Fortune · Vertex Vertex · Juno Juno |
Yükselen Ascendant (rising sign) · Alçalan Descendant · MC / Tepe Noktası Midheaven (MC) · IC Imum Coeli (IC) · ev house ·
ev sistemi house system · Eşit Ev Equal House · Tam Burç Whole Sign · retro / retrograd retrograde (℞) · derece degree |
Kavuşum Conjunction · Karşıt Opposition · Üçgen Trine · Kare Square · Sekstil Sextile · Quincunx Quincunx · orb orb |
Ateş Fire · Toprak Earth · Hava Air · Su Water · Öncü Cardinal · Sabit Fixed · Değişken Mutable |
Yeni Ay New Moon · Hilal Waxing Crescent · İlk Dördün First Quarter · Şişkin Ay (büyüyen) Waxing Gibbous · Dolunay Full Moon ·
Şişkin Ay (küçülen) Waning Gibbous · Son Dördün Last Quarter · Balsamik/Küçülen Hilal Waning Crescent · tutulma eclipse ·
yarı gölge Ay tutulması penumbral lunar eclipse · halkalı Güneş tutulması annular solar eclipse |
Yaşam Yolu Sayısı Life Path Number · usta sayı master number · Kader Matrisi Destiny Matrix | Asterna — do not mention.

## Testing (mandatory for any page with JS)
- Serve the repo: `cd /home/user/kubramindunyasi && python3 -m http.server <PORT>` — pick a unique port 8800–8899 (use the one given in
  your task) and kill it when done (`kill <pid>`; never `pkill -f http.server` — other agents are using other ports).
- Playwright: `require('/opt/node-tools/node_modules/playwright')`, `chromium.launch()`. The sandbox has NO internet: abort/mock
  every non-localhost request with `page.route`. Backend `https://astro-rapor.onrender.com/api/*` → forward to a local backend copy:
  copy `/tmp/claude-0/-home-user/80213a73-68e5-5390-82b4-102f3c804210/scratchpad/be` to your own scratch dir, start it with
  `PORT=<your backend port> ANTHROPIC_API_KEY=x node server.js` (deps already installed). Its geocoding has no internet so every place
  resolves to "Ankara (varsayılan)" — for testing you may patch YOUR COPY's `lib/geo.js` to return e.g. London
  (lat 51.5074, lon -0.1278, tz "Europe/London"). Never modify `/home/user/astro-rapor-backend`. Rate limit: 60 charts/IP/day per
  process — restart your copy if you get 429.
  Open-Meteo geocoding (`https://geocoding-api.open-meteo.com/v1/search?...`) → fulfil with a mock JSON
  `{"results":[{"name":"London","latitude":51.5074,"longitude":-0.1278,"country":"United Kingdom","admin1":"England","timezone":"Europe/London"}]}`.
- Check: no `pageerror`/console errors; the tool produces a result for a sample input; no Turkish visible (run the check below on
  `document.body.innerText` after interacting, and on attribute values); 390px-wide viewport has no horizontal overflow;
  the language switcher's "Türkçe" link points to the TR counterpart.
- Turkish-leak check: regex `/[çğıöşüÇĞİÖŞÜ]/` on visible text (ignore the single word "Türkçe"), plus a word list:
  `\b(ve|bir|için|ile|burç|burcu|gezegen|doğum|harita|sayın|uyum|yorum|hesapla|tarih|saat|yer|şehir|Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\b`.
