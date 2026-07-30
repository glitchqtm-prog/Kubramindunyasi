// lib/geo.js
// Open-Meteo Geocoding API: ücretsiz, API anahtarı gerektirmez.
// "İstanbul, Türkiye" gibi bir metni { lat, lon, timezone } bilgisine çevirir.

const FALLBACK = { lat: 39.92, lon: 32.85, timezone: "Europe/Istanbul", name: "Ankara (varsayılan)" };

export async function geocode(placeText) {
  try {
    const city = String(placeText || "").split(",")[0].trim();
    if (!city) return FALLBACK;
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    const r = data?.results?.[0];
    if (!r) return FALLBACK;
    return { lat: r.latitude, lon: r.longitude, timezone: r.timezone || "Europe/Istanbul", name: `${r.name}, ${r.country || ""}` };
  } catch {
    return FALLBACK;
  }
}
