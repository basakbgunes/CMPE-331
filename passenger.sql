CREATE DATABASE IF NOT EXISTS HavayoluDB;
USE HavayoluDB;
CREATE TABLE Passenger (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20)
);

CREATE TABLE Flight (
    flight_id VARCHAR(50) PRIMARY KEY,
    departure_airport VARCHAR(50),
    arrival_airport VARCHAR(50),
    departure_time DATETIME,
    arrival_time DATETIME
);

CREATE TABLE Flight_Passenger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    passenger_id INT NOT NULL,
    flight_id VARCHAR(50) NOT NULL,
    seat_no VARCHAR(10),
    FOREIGN KEY (passenger_id) REFERENCES Passenger(passenger_id)
        ON DELETE CASCADE, 
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id)
        ON DELETE CASCADE  
);
INSERT INTO Passenger (first_name, last_name, email, phone) VALUES 
('Ali', 'Yılmaz', 'ali@example.com', '5551112233'),
('Ayşe', 'Demir', 'ayse@example.com', '5552223344'),
('Mehmet', 'Kaya', 'mehmet@example.com', '5553334455'),
('Zeynep', 'Çelik', 'zeynep@example.com', '5554445566');


INSERT INTO Flight (flight_id, departure_airport, arrival_airport, departure_time, arrival_time) VALUES
('TK101', 'IST', 'NYC', '2025-12-01 10:00:00', '2025-12-01 16:00:00'),
('TK102', 'IST', 'LON', '2025-12-01 12:00:00', '2025-12-01 14:00:00'),
('TK205', 'ANK', 'IZM', '2025-12-02 09:00:00', '2025-12-02 10:00:00'),
('TK300', 'ANT', 'MOS', '2025-12-03 14:00:00', '2025-12-03 18:00:00');


INSERT INTO Flight_Passenger (passenger_id, flight_id, seat_no) VALUES
(1, 'TK101', '12A'),
(2, 'TK101', '12B'),
(2, 'TK102', '15C'),
(3, 'TK205', '01A'),
(4, 'TK101', '14D'),
(1, 'TK300', '22F');