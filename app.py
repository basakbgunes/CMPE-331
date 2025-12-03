from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

from database import db
from models import Passenger, PassengerAffiliation, Infant

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///passenger_api.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

@app.route("/api/passengers")
def get_passengers():
    flight_id = request.args.get("flightId")
    
    if not flight_id:
        return jsonify({"error": "flightId is required"}), 400

    pax_list = Passenger.query.filter_by(flight_id=flight_id).all()

    if not pax_list:
        return jsonify({"error": "No passengers found"}), 404

    response = {
        "flightId": flight_id,
        "passengerCount": len(pax_list),
        "passengers": []
    }

    for pax in pax_list:
        affiliates = PassengerAffiliation.query.filter_by(pax_id=pax.pax_id).all()
        affiliate_ids = [a.affiliate_id for a in affiliates]

        infant = Infant.query.filter_by(pax_id=pax.pax_id).first()
        special_needs = []
        if infant:
            special_needs.append("infant")

        response["passengers"].append({
            "paxId": pax.pax_id,
            "fullName": pax.full_name,
            "age": pax.age,
            "type": pax.type,
            "seat": pax.seat,
            "affiliateGroup": affiliate_ids,
            "specialNeeds": special_needs
        })

    return jsonify(response)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(port=5004, debug=True)
