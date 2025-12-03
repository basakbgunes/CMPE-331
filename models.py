from database import db

class Passenger(db.Model):
    pax_id = db.Column(db.String, primary_key=True)
    flight_id = db.Column(db.String, nullable=False)
    full_name = db.Column(db.String, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String, nullable=False)
    seat = db.Column(db.String)
    special_needs = db.Column(db.String)

class PassengerAffiliation(db.Model):
    pax_id = db.Column(db.String, primary_key=True)
    affiliate_id = db.Column(db.String, primary_key=True)

class Infant(db.Model):
    pax_id = db.Column(db.String, primary_key=True)
    requires_seat = db.Column(db.Boolean, default=False)
