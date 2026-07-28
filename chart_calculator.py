"""
chart_calculator.py
--------------------
Swiss Ephemeris (pyswisseph) kullanarak GERÇEK gezegen konumlarını hesaplar.
- Natal harita (doğum haritası)
- Solar Return (Güneş Dönüşü)
- Lunar Return (Ay Dönüşü)
- Sinastri (iki kişi arası açılar)

Kurulum notu: pip install pyswisseph geopy timezonefinder pytz
"""

import swisseph as swe
from datetime import datetime, timedelta
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import pytz

PLANETS = {
    "Güneş": swe.SUN,
    "Ay": swe.MOON,
    "Merkür": swe.MERCURY,
    "Venüs": swe.VENUS,
    "Mars": swe.MARS,
    "Jüpiter": swe.JUPITER,
    "Satürn": swe.SATURN,
    "Uranüs": swe.URANUS,
    "Neptün": swe.NEPTUNE,
    "Plüton": swe.PLUTO,
}

ZODIAC_SIGNS = [
    "Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak",
    "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık",
]

ASPECTS = {
    "Kavuşum": (0, 8),
    "Altmışlık": (60, 6),
    "Kare": (90, 8),
    "Üçgen": (120, 8),
    "Karşıt": (180, 8),
}


def geocode_place(place_name: str):
    """Şehir/ülke ismini enlem/boylama çevirir."""
    geolocator = Nominatim(user_agent="astro_report_app")
    location = geolocator.geocode(place_name, timeout=10)
    if not location:
        raise ValueError(f"Doğum yeri bulunamadı: {place_name}")
    return location.latitude, location.longitude


def get_utc_datetime(local_dt: datetime, lat: float, lon: float) -> datetime:
    """Yerel doğum tarihi/saatini, doğum yerinin zaman dilimine göre UTC'ye çevirir."""
    tf = TimezoneFinder()
    tz_name = tf.timezone_at(lat=lat, lng=lon)
    if not tz_name:
        tz_name = "UTC"
    tz = pytz.timezone(tz_name)
    localized = tz.localize(local_dt)
    return localized.astimezone(pytz.utc), tz_name


def sign_from_longitude(lon: float) -> tuple:
    sign_index = int(lon // 30)
    degree_in_sign = lon % 30
    return ZODIAC_SIGNS[sign_index], round(degree_in_sign, 2)


def _julday(dt_utc: datetime) -> float:
    return swe.julday(
        dt_utc.year, dt_utc.month, dt_utc.day,
        dt_utc.hour + dt_utc.minute / 60 + dt_utc.second / 3600,
    )


def calculate_positions(dt_utc: datetime, lat: float, lon: float) -> dict:
    """Verilen UTC an için gezegen konumları + yükselen burç + ev başlangıçları."""
    jd = _julday(dt_utc)
    swe.set_ephe_path(None)  # yerleşik (moshier) efemeris, ek dosya gerektirmez

    positions = {}
    for name, code in PLANETS.items():
        lon_deg, lat_deg, dist, speed_lon, *_ = swe.calc_ut(jd, code)[0]
        sign, deg = sign_from_longitude(lon_deg)
        positions[name] = {
            "longitude": round(lon_deg, 2),
            "sign": sign,
            "degree_in_sign": deg,
            "retrograde": speed_lon < 0,
        }

    houses, ascmc = swe.houses(jd, lat, lon, b"P")  # Placidus ev sistemi
    asc_sign, asc_deg = sign_from_longitude(ascmc[0])
    mc_sign, mc_deg = sign_from_longitude(ascmc[1])

    return {
        "julian_day": jd,
        "planets": positions,
        "ascendant": {"longitude": round(ascmc[0], 2), "sign": asc_sign, "degree_in_sign": asc_deg},
        "midheaven": {"longitude": round(ascmc[1], 2), "sign": mc_sign, "degree_in_sign": mc_deg},
        "houses": [round(h, 2) for h in houses],
    }


def calculate_natal_chart(birth_date: str, birth_time: str, birth_place: str) -> dict:
    """birth_date: 'YYYY-MM-DD', birth_time: 'HH:MM'"""
    lat, lon = geocode_place(birth_place)
    local_dt = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M")
    dt_utc, tz_name = get_utc_datetime(local_dt, lat, lon)
    chart = calculate_positions(dt_utc, lat, lon)
    chart.update({
        "input": {
            "birth_date": birth_date,
            "birth_time": birth_time,
            "birth_place": birth_place,
            "latitude": lat,
            "longitude": lon,
            "timezone": tz_name,
        }
    })
    return chart


def _find_return_date(natal_target_lon: float, planet_code: int, start_year: int,
                       lat: float, lon: float, step_hours: int, window_days: int) -> datetime:
    """Bir gezegenin, natal boylamına yeniden ulaştığı tarihi arar (Solar/Lunar Return)."""
    swe.set_ephe_path(None)
    start = datetime(start_year, 1, 1)
    end = start + timedelta(days=window_days)
    cur = start
    prev_diff = None
    while cur < end:
        jd = _julday(cur)
        lon_deg = swe.calc_ut(jd, planet_code)[0][0]
        diff = (lon_deg - natal_target_lon + 180) % 360 - 180  # -180..180
        if prev_diff is not None and (prev_diff <= 0 <= diff or prev_diff >= 0 >= diff) and prev_diff != diff:
            # işaret değişimi -> ikili arama ile hassaslaştır
            lo, hi = cur - timedelta(hours=step_hours), cur
            for _ in range(40):
                mid = lo + (hi - lo) / 2
                jd_mid = _julday(mid)
                d = (swe.calc_ut(jd_mid, planet_code)[0][0] - natal_target_lon + 180) % 360 - 180
                if (d > 0) == (prev_diff > 0):
                    lo = mid
                else:
                    hi = mid
            return lo + (hi - lo) / 2
        prev_diff = diff
        cur += timedelta(hours=step_hours)
    raise ValueError("Dönüş tarihi bulunamadı (arama penceresini genişletin).")


def calculate_solar_return(natal_chart: dict, target_year: int) -> dict:
    lat, lon = natal_chart["input"]["latitude"], natal_chart["input"]["longitude"]
    natal_sun_lon = natal_chart["planets"]["Güneş"]["longitude"]
    return_dt_utc = _find_return_date(natal_sun_lon, swe.SUN, target_year, lat, lon,
                                       step_hours=6, window_days=370)
    chart = calculate_positions(return_dt_utc, lat, lon)
    chart["return_datetime_utc"] = return_dt_utc.isoformat()
    return chart


def calculate_lunar_return(natal_chart: dict, from_date: datetime = None) -> dict:
    lat, lon = natal_chart["input"]["latitude"], natal_chart["input"]["longitude"]
    natal_moon_lon = natal_chart["planets"]["Ay"]["longitude"]
    start_year = (from_date or datetime.utcnow()).year
    return_dt_utc = _find_return_date(natal_moon_lon, swe.MOON, start_year, lat, lon,
                                       step_hours=1, window_days=32)
    chart = calculate_positions(return_dt_utc, lat, lon)
    chart["return_datetime_utc"] = return_dt_utc.isoformat()
    return chart


def calculate_synastry(chart_a: dict, chart_b: dict) -> list:
    """İki natal harita arasındaki temel açıları listeler."""
    aspects_found = []
    for name_a, data_a in chart_a["planets"].items():
        for name_b, data_b in chart_b["planets"].items():
            diff = abs(data_a["longitude"] - data_b["longitude"]) % 360
            diff = min(diff, 360 - diff)
            for aspect_name, (angle, orb) in ASPECTS.items():
                if abs(diff - angle) <= orb:
                    aspects_found.append({
                        "kişi_a_gezegen": name_a,
                        "kişi_b_gezegen": name_b,
                        "açı": aspect_name,
                        "fark_derece": round(diff, 2),
                    })
    return aspects_found
