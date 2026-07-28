import os
import uuid
import logging
import threading
from datetime import datetime

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

from chart_calculator import (
    calculate_natal_chart, calculate_solar_return, calculate_lunar_return,
    calculate_synastry,
)
from report_generator import generate_report_text, REPORT_CONFIG
from pdf_generator import generate_pdf
from email_sender import send_report_email

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "generated_reports")
os.makedirs(OUTPUT_DIR, exist_ok=True)

FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)

# Demo amaçlı bellek-içi sipariş kayıtları. Gerçek üründe bir veritabanı kullanın.
ORDERS = {}

PRICES = {"dogum_haritasi": 500, "solar_return": 250, "lunar_return": 150, "sinastri": 500}


# ---------------------------------------------------------------- frontend --

@app.route("/")
def serve_index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/order.html")
def serve_order():
    return send_from_directory(FRONTEND_DIR, "order.html")


# ------------------------------------------------------------------ order --

@app.route("/api/order", methods=["POST"])
def create_order():
    """
    Sipariş formu gönderildiğinde çağrılır. Sahte ödeme adımından hemen sonra
    arka planda raporu üretip mail atacak bir iş kuyruğa alınır; kullanıcıya
    hemen bir order_id döndürülür, frontend bu id ile durumu sorgular.
    """
    data = request.get_json(force=True)

    report_type = data.get("report_type")
    if report_type not in REPORT_CONFIG:
        return jsonify({"error": "Geçersiz rapor türü"}), 400

    required = ["name", "email", "birth_date", "birth_time", "birth_place"]
    if report_type == "sinastri":
        required += ["person_b_name", "birth_date_b", "birth_time_b", "birth_place_b"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Eksik alanlar: {', '.join(missing)}"}), 400

    order_id = str(uuid.uuid4())
    ORDERS[order_id] = {
        "status": "payment_pending",
        "created_at": datetime.utcnow().isoformat(),
        "data": data,
        "price": PRICES[report_type],
        "error": None,
        "pdf_path": None,
    }
    return jsonify({"order_id": order_id, "price": PRICES[report_type]})


@app.route("/api/pay/<order_id>", methods=["POST"])
def mock_pay(order_id):
    """
    DEMO ödeme adımı: gerçek bir ödeme sağlayıcısına (iyzico, Stripe, PayTR vb.)
    bağlanmaz, kart bilgilerini SADECE biçim olarak doğrular ve başarı simüle eder.
    Üretime geçerken bu fonksiyonun içini gerçek ödeme sağlayıcısı SDK'sıyla
    değiştirin ve yalnızca sağlayıcıdan "başarılı" webhook/response'u geldiğinde
    process_order tetiklenmeli.
    """
    if order_id not in ORDERS:
        return jsonify({"error": "Sipariş bulunamadı"}), 404

    card = request.get_json(force=True) or {}
    if not card.get("card_number") or not card.get("expiry") or not card.get("cvv"):
        return jsonify({"error": "Kart bilgileri eksik"}), 400

    ORDERS[order_id]["status"] = "processing"
    thread = threading.Thread(target=_process_order, args=(order_id,), daemon=True)
    thread.start()
    return jsonify({"status": "processing"})


@app.route("/api/order/<order_id>/status")
def order_status(order_id):
    order = ORDERS.get(order_id)
    if not order:
        return jsonify({"error": "Sipariş bulunamadı"}), 404
    return jsonify({
        "status": order["status"],
        "error": order["error"],
        "pdf_ready": order["pdf_path"] is not None,
    })


@app.route("/api/order/<order_id>/download")
def order_download(order_id):
    order = ORDERS.get(order_id)
    if not order or not order["pdf_path"]:
        return jsonify({"error": "Rapor henüz hazır değil"}), 404
    directory, filename = os.path.split(order["pdf_path"])
    return send_from_directory(directory, filename, as_attachment=True)


# ------------------------------------------------------------- iş mantığı --

def _process_order(order_id: str):
    order = ORDERS[order_id]
    data = order["data"]
    report_type = data["report_type"]
    config = REPORT_CONFIG[report_type]

    try:
        natal = calculate_natal_chart(data["birth_date"], data["birth_time"], data["birth_place"])

        chart_b = None
        synastry_aspects = None
        target_chart = natal

        if report_type == "solar_return":
            target_year = datetime.utcnow().year
            target_chart = calculate_solar_return(natal, target_year)
        elif report_type == "lunar_return":
            target_chart = calculate_lunar_return(natal)
        elif report_type == "sinastri":
            chart_b = calculate_natal_chart(data["birth_date_b"], data["birth_time_b"], data["birth_place_b"])
            synastry_aspects = calculate_synastry(natal, chart_b)

        report_text = generate_report_text(
            report_type=report_type,
            person_name=data["name"],
            chart=target_chart if report_type != "sinastri" else natal,
            chart_b=chart_b,
            synastry_aspects=synastry_aspects,
            person_b_name=data.get("person_b_name"),
        )

        pdf_filename = f"{order_id}.pdf"
        pdf_path = os.path.join(OUTPUT_DIR, pdf_filename)
        generate_pdf(
            output_path=pdf_path,
            title=config["title"],
            person_name=data["name"],
            report_text=report_text,
            chart=target_chart if report_type != "sinastri" else natal,
            chart_b=chart_b,
            person_b_name=data.get("person_b_name"),
        )

        send_report_email(
            to_email=data["email"],
            person_name=data["name"],
            report_title=config["title"],
            pdf_path=pdf_path,
        )

        order["pdf_path"] = pdf_path
        order["status"] = "done"
        logger.info("Sipariş tamamlandı: %s", order_id)

    except Exception as exc:  # noqa: BLE001
        logger.exception("Sipariş işlenemedi: %s", order_id)
        order["status"] = "error"
        order["error"] = str(exc)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
