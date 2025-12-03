from app import db, Passenger, PassengerAffiliation, Infant, app

with app.app_context():
    # Tablo yoksa oluştur (varsa dokunmaz, ama istersen önce drop_all da ekleyebilirsin)
    db.create_all()

    p1 = Passenger(
        pax_id="P001",
        flight_id="TK1938",
        full_name="Ayse Korkmaz",
        age=32,
        type="adult",
        seat="12A"
    )

    p2 = Passenger(
        pax_id="P002",
        flight_id="TK1938",
        full_name="Mehmet Korkmaz",
        age=2,
        type="infant",
        seat=None
    )

    a1 = PassengerAffiliation(pax_id="P001", affiliate_id="P002")
    a2 = PassengerAffiliation(pax_id="P002", affiliate_id="P001")

    i1 = Infant(pax_id="P002", requires_seat=False)

    db.session.add_all([p1, p2, a1, a2, i1])
    db.session.commit()

    print("Passengers seeded successfully ✅")
