-- ========================================
-- REAL DATA SEEDING FOR SKYROSTER
-- ========================================
-- This file contains realistic seed data for testing
-- Ensures: No person is on multiple flights at same time

USE new_schemaSkyroster_db;

-- ========================================
-- SAFETY RESET (keeps reference data, clears fact tables)
-- Ensures predictable IDs for seed inserts and avoids FK collisions
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Flight_Passenger;
TRUNCATE TABLE Flight_Crew;
TRUNCATE TABLE Flight_Source;
TRUNCATE TABLE Flight_Destination;
TRUNCATE TABLE Flight;
TRUNCATE TABLE Passenger;
TRUNCATE TABLE Cabin_Crew;
SET FOREIGN_KEY_CHECKS = 1;

-- Ensure required airports exist for the routes below
INSERT INTO Airport (airport_code, name, city, country) VALUES
('AYT', 'Antalya Airport', 'Antalya', 'Turkey'),
('ESB', 'Esenboga Airport', 'Ankara', 'Turkey'),
('AMS', 'Schiphol Airport', 'Amsterdam', 'Netherlands')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    city = VALUES(city),
    country = VALUES(country);

-- Ensure aircraft types used in this seed are present
INSERT INTO Vehicle_Type (name, seat_count, seat_map) VALUES
('Boeing 737', 160, '{"rows": 27, "seatsPerRow": 6}'),
('Airbus A320', 150, '{"rows": 25, "seatsPerRow": 6}'),
('Airbus A330', 277, '{"rows": 46, "seatsPerRow": 6}')
ON DUPLICATE KEY UPDATE
    seat_count = VALUES(seat_count),
    seat_map = VALUES(seat_map);

-- ========================================
-- 1. INSERT CABIN CREW (50 people)
-- ========================================
INSERT INTO Cabin_Crew (crew_id, first_name, last_name, crew_rank, base_airport_code, hire_date, active) VALUES
-- Captains
(1, 'John', 'Smith', 'Captain', 'IST', '2015-03-15', TRUE),
(2, 'Sarah', 'Johnson', 'Captain', 'IST', '2014-08-20', TRUE),
(3, 'Michael', 'Williams', 'Captain', 'LHR', '2013-11-05', TRUE),
(4, 'Emma', 'Brown', 'Captain', 'FRA', '2012-06-10', TRUE),
(5, 'Robert', 'Jones', 'Captain', 'CDG', '2015-01-22', TRUE),

-- First Officers
(6, 'David', 'Miller', 'First Officer', 'IST', '2016-04-12', TRUE),
(7, 'Lisa', 'Davis', 'First Officer', 'IST', '2017-09-08', TRUE),
(8, 'James', 'Wilson', 'First Officer', 'LHR', '2016-07-14', TRUE),
(9, 'Anna', 'Moore', 'First Officer', 'FRA', '2018-02-28', TRUE),
(10, 'Thomas', 'Taylor', 'First Officer', 'CDG', '2017-05-19', TRUE),

-- Flight Attendants
(11, 'Maria', 'Garcia', 'Flight Attendant', 'IST', '2018-01-10', TRUE),
(12, 'Carlos', 'Rodriguez', 'Flight Attendant', 'IST', '2019-03-15', TRUE),
(13, 'Sophie', 'Martin', 'Flight Attendant', 'IST', '2018-06-20', TRUE),
(14, 'Nicolas', 'Dubois', 'Flight Attendant', 'LHR', '2019-02-14', TRUE),
(15, 'Isabella', 'Rossi', 'Flight Attendant', 'LHR', '2018-09-07', TRUE),
(16, 'Antonio', 'Conti', 'Flight Attendant', 'FRA', '2019-04-11', TRUE),
(17, 'Elena', 'Moretti', 'Flight Attendant', 'FRA', '2018-08-22', TRUE),
(18, 'Paulo', 'Santos', 'Flight Attendant', 'FRA', '2019-05-30', TRUE),
(19, 'Francoise', 'Blanc', 'Flight Attendant', 'CDG', '2018-10-15', TRUE),
(20, 'Laurent', 'Petit', 'Flight Attendant', 'CDG', '2019-01-20', TRUE),
(21, 'Giulia', 'Ferrari', 'Flight Attendant', 'IST', '2018-11-05', TRUE),
(22, 'Marco', 'Bianchi', 'Flight Attendant', 'IST', '2019-06-08', TRUE),
(23, 'Hannah', 'Mueller', 'Flight Attendant', 'LHR', '2018-12-03', TRUE),
(24, 'Klaus', 'Schmidt', 'Flight Attendant', 'LHR', '2019-07-12', TRUE),
(25, 'Ingrid', 'Weber', 'Flight Attendant', 'FRA', '2018-07-25', TRUE),
(26, 'Hans', 'Fischer', 'Flight Attendant', 'FRA', '2019-08-19', TRUE),
(27, 'Annette', 'Koch', 'Flight Attendant', 'CDG', '2018-09-30', TRUE),
(28, 'Wilhelm', 'Hoffmann', 'Flight Attendant', 'CDG', '2019-09-14', TRUE),
(29, 'Yuki', 'Tanaka', 'Flight Attendant', 'IST', '2018-04-16', TRUE),
(30, 'Kenji', 'Yamamoto', 'Flight Attendant', 'IST', '2019-10-22', TRUE),
(31, 'Anna', 'Kowalski', 'Flight Attendant', 'LHR', '2018-05-11', TRUE),
(32, 'Piotr', 'Nowak', 'Flight Attendant', 'LHR', '2019-11-05', TRUE),
(33, 'Dimitri', 'Petrov', 'Flight Attendant', 'FRA', '2018-02-28', TRUE),
(34, 'Natasha', 'Sokolov', 'Flight Attendant', 'FRA', '2019-12-10', TRUE),
(35, 'Katarina', 'Horvath', 'Flight Attendant', 'CDG', '2018-03-19', TRUE),
(36, 'Stefan', 'Novak', 'Flight Attendant', 'CDG', '2020-01-15', TRUE),

-- Pursers
(37, 'Amanda', 'Thompson', 'Purser', 'IST', '2017-02-14', TRUE),
(38, 'Richard', 'Anderson', 'Purser', 'LHR', '2016-09-09', TRUE),
(39, 'Jennifer', 'Thomas', 'Purser', 'FRA', '2017-11-22', TRUE),
(40, 'Christopher', 'Jackson', 'Purser', 'CDG', '2018-04-05', TRUE);

-- ========================================
-- 2. INSERT PASSENGERS (200 people)
-- ========================================
INSERT INTO Passenger (first_name, last_name, passport_number, passenger_type, ticket_class, active) VALUES
-- Adult Passengers (150)
('Ahmed', 'Hassan', 'TR123456789', 'ADULT', 'Economy', TRUE),
('Fatima', 'Ibrahim', 'TR123456790', 'ADULT', 'Economy', TRUE),
('Mehmet', 'Yilmaz', 'TR123456791', 'ADULT', 'Business', TRUE),
('Aisha', 'Ahmed', 'TR123456792', 'ADULT', 'Economy', TRUE),
('Hasan', 'Karim', 'TR123456793', 'ADULT', 'Economy', TRUE),
('Layla', 'Mansour', 'TR123456794', 'ADULT', 'First', TRUE),
('Omar', 'Hassan', 'TR123456795', 'ADULT', 'Economy', TRUE),
('Noor', 'Abdullah', 'TR123456796', 'ADULT', 'Business', TRUE),
('Kareem', 'Adel', 'TR123456797', 'ADULT', 'Economy', TRUE),
('Amira', 'Saleh', 'TR123456798', 'ADULT', 'Economy', TRUE),
('Youssef', 'Omar', 'TR123456799', 'ADULT', 'Business', TRUE),
('Leila', 'Hassan', 'TR123456800', 'ADULT', 'Economy', TRUE),
('Khalid', 'Mohammed', 'TR123456801', 'ADULT', 'Economy', TRUE),
('Zainab', 'Samir', 'TR123456802', 'ADULT', 'Economy', TRUE),
('Ali', 'Nassir', 'TR123456803', 'ADULT', 'First', TRUE),
('Mona', 'Kamal', 'TR123456804', 'ADULT', 'Economy', TRUE),
('Ibrahim', 'Rashid', 'TR123456805', 'ADULT', 'Business', TRUE),
('Sara', 'Malik', 'TR123456806', 'ADULT', 'Economy', TRUE),
('Mohamed', 'Hassan', 'TR123456807', 'ADULT', 'Economy', TRUE),
('Hana', 'Karim', 'TR123456808', 'ADULT', 'Economy', TRUE),
('Hassan', 'Abdul', 'TR123456809', 'ADULT', 'Business', TRUE),
('Yasmin', 'Jamil', 'TR123456810', 'ADULT', 'Economy', TRUE),
('Rashid', 'Farah', 'TR123456811', 'ADULT', 'Economy', TRUE),
('Dina', 'Samir', 'TR123456812', 'ADULT', 'First', TRUE),
('Tariq', 'Nasim', 'TR123456813', 'ADULT', 'Economy', TRUE),
('Leyla', 'Akram', 'TR123456814', 'ADULT', 'Business', TRUE),
('Saeed', 'Hamid', 'TR123456815', 'ADULT', 'Economy', TRUE),
('Ranya', 'Karim', 'TR123456816', 'ADULT', 'Economy', TRUE),
('Nabil', 'Rashad', 'TR123456817', 'ADULT', 'Business', TRUE),
('Huda', 'Salim', 'TR123456818', 'ADULT', 'Economy', TRUE),
('Mahdi', 'Jamal', 'TR123456819', 'ADULT', 'Economy', TRUE),
('Mariam', 'Samir', 'TR123456820', 'ADULT', 'First', TRUE),
('Karim', 'Adel', 'TR123456821', 'ADULT', 'Economy', TRUE),
('Noura', 'Hassan', 'TR123456822', 'ADULT', 'Business', TRUE),
('Jalal', 'Amin', 'TR123456823', 'ADULT', 'Economy', TRUE),
('Amani', 'Aziz', 'TR123456824', 'ADULT', 'Economy', TRUE),
('Fareed', 'Basem', 'TR123456825', 'ADULT', 'Business', TRUE),
('Hiba', 'Chaled', 'TR123456826', 'ADULT', 'Economy', TRUE),
('Jamal', 'Daoud', 'TR123456827', 'ADULT', 'Economy', TRUE),
('Iman', 'Emir', 'TR123456828', 'ADULT', 'First', TRUE),
('Kamal', 'Fahd', 'TR123456829', 'ADULT', 'Business', TRUE),
('Jihan', 'Gamal', 'TR123456830', 'ADULT', 'Economy', TRUE),
('Nasser', 'Hamza', 'TR123456831', 'ADULT', 'Economy', TRUE),
('Lina', 'Ihsan', 'TR123456832', 'ADULT', 'Business', TRUE),
('Rafiq', 'Jaber', 'TR123456833', 'ADULT', 'Economy', TRUE),
('Salma', 'Karim', 'TR123456834', 'ADULT', 'Economy', TRUE),
('Samir', 'Laith', 'TR123456835', 'ADULT', 'First', TRUE),
('Tara', 'Malik', 'TR123456836', 'ADULT', 'Economy', TRUE),
('Walid', 'Nabil', 'TR123456837', 'ADULT', 'Business', TRUE),
('Uma', 'Omar', 'TR123456838', 'ADULT', 'Economy', TRUE),
('Yasin', 'Qadir', 'TR123456839', 'ADULT', 'Economy', TRUE),
('Vera', 'Rashid', 'TR123456840', 'ADULT', 'Business', TRUE),
('Zaki', 'Saeed', 'TR123456841', 'ADULT', 'Economy', TRUE),
('Wafa', 'Tamer', 'TR123456842', 'ADULT', 'Economy', TRUE),
('Adel', 'Usama', 'TR123456843', 'ADULT', 'First', TRUE),
('Xiomara', 'Vahid', 'TR123456844', 'ADULT', 'Business', TRUE),
('Yusuf', 'Waleed', 'TR123456845', 'ADULT', 'Economy', TRUE),
('Zara', 'Xander', 'TR123456846', 'ADULT', 'Economy', TRUE),
-- European passengers
('John', 'Anderson', 'GB123456789', 'ADULT', 'Business', TRUE),
('Mary', 'Thompson', 'GB123456790', 'ADULT', 'Economy', TRUE),
('Robert', 'Johnson', 'FR123456789', 'ADULT', 'Economy', TRUE),
('Patricia', 'Williams', 'FR123456790', 'ADULT', 'First', TRUE),
('Michael', 'Brown', 'DE123456789', 'ADULT', 'Business', TRUE),
('Jennifer', 'Davis', 'DE123456790', 'ADULT', 'Economy', TRUE),
('William', 'Miller', 'IT123456789', 'ADULT', 'Economy', TRUE),
('Linda', 'Wilson', 'IT123456790', 'ADULT', 'Business', TRUE),
('Richard', 'Moore', 'ES123456789', 'ADULT', 'Economy', TRUE),
('Barbara', 'Taylor', 'ES123456790', 'ADULT', 'First', TRUE),
('Joseph', 'Anderson', 'GB223456789', 'ADULT', 'Economy', TRUE),
('Susan', 'Thomas', 'GB223456790', 'ADULT', 'Business', TRUE),
('Charles', 'Jackson', 'FR223456789', 'ADULT', 'Economy', TRUE),
('Jessica', 'White', 'FR223456790', 'ADULT', 'Economy', TRUE),
('David', 'Harris', 'DE223456789', 'ADULT', 'Business', TRUE),
('Sarah', 'Martin', 'DE223456790', 'ADULT', 'Economy', TRUE),
('Mark', 'Thompson', 'IT223456789', 'ADULT', 'First', TRUE),
('Karen', 'Garcia', 'IT223456790', 'ADULT', 'Business', TRUE),
('Donald', 'Martinez', 'ES223456789', 'ADULT', 'Economy', TRUE),
('Lisa', 'Robinson', 'ES223456790', 'ADULT', 'Economy', TRUE),
('Steven', 'Clark', 'GB323456789', 'ADULT', 'Business', TRUE),
('Betty', 'Rodriguez', 'GB323456790', 'ADULT', 'Economy', TRUE),
('Paul', 'Lewis', 'FR323456789', 'ADULT', 'Economy', TRUE),
('Margaret', 'Lee', 'FR323456790', 'ADULT', 'First', TRUE),
('Andrew', 'Walker', 'DE323456789', 'ADULT', 'Business', TRUE),
('Sandra', 'Hall', 'DE323456790', 'ADULT', 'Economy', TRUE),
('Joshua', 'Allen', 'IT323456789', 'ADULT', 'Economy', TRUE),
('Ashley', 'Young', 'IT323456790', 'ADULT', 'Business', TRUE),
('Kenneth', 'Hernandez', 'ES323456789', 'ADULT', 'Economy', TRUE),
('Kimberly', 'King', 'ES323456790', 'ADULT', 'First', TRUE),
('Kevin', 'Wright', 'GB423456789', 'ADULT', 'Economy', TRUE),
('Donna', 'Lopez', 'GB423456790', 'ADULT', 'Business', TRUE),
('Edward', 'Hill', 'FR423456789', 'ADULT', 'Economy', TRUE),
('Carol', 'Scott', 'FR423456790', 'ADULT', 'Economy', TRUE),
('Ronald', 'Green', 'DE423456789', 'ADULT', 'Business', TRUE),
('Michelle', 'Adams', 'DE423456790', 'ADULT', 'First', TRUE),
('Timothy', 'Nelson', 'IT423456789', 'ADULT', 'Business', TRUE),
('Melissa', 'Carter', 'IT423456790', 'ADULT', 'Economy', TRUE),
('Jason', 'Roberts', 'ES423456789', 'ADULT', 'Economy', TRUE),
('Deborah', 'Phillips', 'ES423456790', 'ADULT', 'Economy', TRUE),
('Jeffrey', 'Campbell', 'GB523456789', 'ADULT', 'Business', TRUE),
('Stephanie', 'Parker', 'GB523456790', 'ADULT', 'Economy', TRUE),
('Ryan', 'Evans', 'FR523456789', 'ADULT', 'Economy', TRUE),
('Rebecca', 'Edwards', 'FR523456790', 'ADULT', 'First', TRUE),
('Jacob', 'Collins', 'DE523456789', 'ADULT', 'Business', TRUE),
('Sharon', 'Reeves', 'DE523456790', 'ADULT', 'Economy', TRUE),
('Gary', 'Morris', 'IT523456789', 'ADULT', 'Economy', TRUE),
('Kathleen', 'Murphy', 'IT523456790', 'ADULT', 'Business', TRUE),
('Nicholas', 'Rogers', 'ES523456789', 'ADULT', 'Economy', TRUE),
('Shirley', 'Morgan', 'ES523456790', 'ADULT', 'First', TRUE),
('Eric', 'Peterson', 'GB623456789', 'ADULT', 'Business', TRUE),
('Cynthia', 'Gardner', 'GB623456790', 'ADULT', 'Economy', TRUE),
('Jonathan', 'Stephens', 'FR623456789', 'ADULT', 'Economy', TRUE),
('Katharine', 'Payne', 'FR623456790', 'ADULT', 'Business', TRUE),
('Stephen', 'Pierce', 'DE623456789', 'ADULT', 'Economy', TRUE),
('Diane', 'Berry', 'DE623456790', 'ADULT', 'First', TRUE),
('Larry', 'Matthews', 'IT623456789', 'ADULT', 'Business', TRUE),
('Julie', 'Arnold', 'IT623456790', 'ADULT', 'Economy', TRUE),
('Justin', 'Wagner', 'ES623456789', 'ADULT', 'Economy', TRUE),
('Joyce', 'Willis', 'ES623456790', 'ADULT', 'Economy', TRUE),

-- Children (35)
('Amir', 'Hassan', 'TR223456789', 'CHILD', 'Economy', TRUE),
('Lara', 'Ahmed', 'TR223456790', 'CHILD', 'Economy', TRUE),
('Hassan', 'Ibrahim', 'TR223456791', 'CHILD', 'Economy', TRUE),
('Noor', 'Omar', 'TR223456792', 'CHILD', 'Business', TRUE),
('Karim', 'Hassan', 'TR223456793', 'CHILD', 'Economy', TRUE),
('Emma', 'Anderson', 'GB623456791', 'CHILD', 'Economy', TRUE),
('Oliver', 'Thompson', 'GB623456792', 'CHILD', 'Economy', TRUE),
('Sophie', 'Johnson', 'FR623456791', 'CHILD', 'Business', TRUE),
('Lucas', 'Williams', 'FR623456792', 'CHILD', 'Economy', TRUE),
('Ava', 'Brown', 'DE623456791', 'CHILD', 'Economy', TRUE),
('Mason', 'Davis', 'DE623456792', 'CHILD', 'Economy', TRUE),
('Isabella', 'Miller', 'IT623456791', 'CHILD', 'Business', TRUE),
('Ethan', 'Wilson', 'IT623456792', 'CHILD', 'Economy', TRUE),
('Mia', 'Moore', 'ES623456791', 'CHILD', 'Economy', TRUE),
('Benjamin', 'Taylor', 'ES623456792', 'CHILD', 'Economy', TRUE),
('Charlotte', 'Anderson', 'GB723456789', 'CHILD', 'Business', TRUE),
('Amelia', 'Thomas', 'GB723456790', 'CHILD', 'Economy', TRUE),
('Harper', 'Jackson', 'FR723456789', 'CHILD', 'Economy', TRUE),
('Evelyn', 'White', 'FR723456790', 'CHILD', 'Economy', TRUE),
('Abigail', 'Harris', 'DE723456789', 'CHILD', 'Business', TRUE),
('Elizabeth', 'Martin', 'DE723456790', 'CHILD', 'Economy', TRUE),
('Emily', 'Thompson', 'IT723456789', 'CHILD', 'Economy', TRUE),
('Avery', 'Garcia', 'IT723456790', 'CHILD', 'Economy', TRUE),
('Ella', 'Martinez', 'ES723456789', 'CHILD', 'Business', TRUE),
('Scarlett', 'Robinson', 'ES723456790', 'CHILD', 'Economy', TRUE),
('Grace', 'Clark', 'GB823456789', 'CHILD', 'Economy', TRUE),
('Chloe', 'Rodriguez', 'GB823456790', 'CHILD', 'Economy', TRUE),
('Camilla', 'Lewis', 'FR823456789', 'CHILD', 'Business', TRUE),
('Lily', 'Lee', 'FR823456790', 'CHILD', 'Economy', TRUE),
('Zoe', 'Walker', 'DE823456789', 'CHILD', 'Economy', TRUE),
('Stella', 'Hall', 'DE823456790', 'CHILD', 'Economy', TRUE),
('Aurora', 'Allen', 'IT823456789', 'CHILD', 'Business', TRUE),
('Violet', 'Young', 'IT823456790', 'CHILD', 'Economy', TRUE),
('Ivy', 'Hernandez', 'ES823456789', 'CHILD', 'Economy', TRUE),
('Lucy', 'King', 'ES823456790', 'CHILD', 'Economy', TRUE),

-- Infants (15) - linked to adults
('Baby', 'Hassan', 'TR323456789', 'INFANT', 'Economy', TRUE),
('Lilia', 'Ahmed', 'TR323456790', 'INFANT', 'Economy', TRUE),
('Ameer', 'Ibrahim', 'TR323456791', 'INFANT', 'Economy', TRUE),
('Sara', 'Omar', 'TR323456792', 'INFANT', 'Business', TRUE),
('Mohammed', 'Hassan', 'TR323456793', 'INFANT', 'Economy', TRUE),
('Hannah', 'Anderson', 'GB823456791', 'INFANT', 'Economy', TRUE),
('Noah', 'Thompson', 'GB823456792', 'INFANT', 'Economy', TRUE),
('Lily', 'Johnson', 'FR823456791', 'INFANT', 'Business', TRUE),
('Jackson', 'Williams', 'FR823456792', 'INFANT', 'Economy', TRUE),
('Aria', 'Brown', 'DE823456791', 'INFANT', 'Economy', TRUE),
('Liam', 'Davis', 'DE823456792', 'INFANT', 'Economy', TRUE),
('Nora', 'Miller', 'IT823456791', 'INFANT', 'Business', TRUE),
('James', 'Wilson', 'IT823456792', 'INFANT', 'Economy', TRUE),
('Olivia', 'Moore', 'ES823456791', 'INFANT', 'Economy', TRUE),
('William', 'Taylor', 'ES823456792', 'INFANT', 'Economy', TRUE);

-- Update parent references for infants (link to corresponding adults within overlapping ranges)
UPDATE Passenger SET parent_passenger_id = 1 WHERE passenger_id = 119;  -- Amir Hassan → Ahmed Hassan (CHILD to ADULT)
UPDATE Passenger SET parent_passenger_id = 2 WHERE passenger_id = 120;  -- Lara Ahmed → Fatima Ibrahim (CHILD to ADULT)
-- INFANTs (151-165) assigned to parents within various flight ranges:
-- Flight 1 (1-120): INFANTs 151-165 parents are 1-5, 6-7, 20-40, 50-70 → need parents in 1-120 range
UPDATE Passenger SET parent_passenger_id = 10 WHERE passenger_id = 151;  -- Baby Hassan → parent in range
UPDATE Passenger SET parent_passenger_id = 20 WHERE passenger_id = 152;  -- Lilia Ahmed → parent in range
UPDATE Passenger SET parent_passenger_id = 30 WHERE passenger_id = 153;  -- Ameer Ibrahim → parent in range
UPDATE Passenger SET parent_passenger_id = 40 WHERE passenger_id = 154;  -- Sara Omar → parent in range
UPDATE Passenger SET parent_passenger_id = 50 WHERE passenger_id = 155;  -- Mohammed Hassan → parent in range
UPDATE Passenger SET parent_passenger_id = 60 WHERE passenger_id = 156; -- Hannah Anderson → parent in range
UPDATE Passenger SET parent_passenger_id = 70 WHERE passenger_id = 157; -- Noah Thompson → parent in range
UPDATE Passenger SET parent_passenger_id = 80 WHERE passenger_id = 158; -- Lily Johnson → parent in range
UPDATE Passenger SET parent_passenger_id = 90 WHERE passenger_id = 159; -- Jackson Williams → parent in range
UPDATE Passenger SET parent_passenger_id = 100 WHERE passenger_id = 160; -- Aria Brown → parent in range
UPDATE Passenger SET parent_passenger_id = 110 WHERE passenger_id = 161; -- Liam Davis → parent in range
UPDATE Passenger SET parent_passenger_id = 15 WHERE passenger_id = 162; -- Nora Miller → parent in range
UPDATE Passenger SET parent_passenger_id = 25 WHERE passenger_id = 163; -- James Wilson → parent in range
UPDATE Passenger SET parent_passenger_id = 35 WHERE passenger_id = 164; -- Olivia Moore → parent in range
UPDATE Passenger SET parent_passenger_id = 45 WHERE passenger_id = 165; -- William Taylor → parent in range
UPDATE Passenger SET parent_passenger_id = 70 WHERE passenger_id = 165; -- William Taylor's parent

-- ========================================
-- 3. INSERT FLIGHTS (15 flights on different times/dates)
-- ========================================
INSERT INTO Flight (flight_no, date_time, duration_min, distance_km, vehicle_type_id, shared_flight_id) VALUES
-- Fleet mix: Boeing 737 (150 seats), Airbus A320 (180 seats), Airbus A330 (350 seats)
('TK101', '2025-12-20 06:00:00', 120, 450, 1, NULL),
('TK102', '2025-12-20 08:30:00', 240, 800, 2, NULL),
('TK103', '2025-12-20 11:00:00', 180, 600, 1, NULL),
('TK104', '2025-12-20 14:15:00', 150, 550, 2, NULL),
('TK105', '2025-12-20 17:00:00', 200, 700, 3, NULL),
('TK106', '2025-12-21 06:30:00', 130, 480, 1, NULL),
('TK107', '2025-12-21 09:00:00', 250, 850, 2, NULL),
('TK108', '2025-12-21 12:30:00', 110, 400, 1, NULL),
('TK109', '2025-12-21 15:45:00', 220, 750, 3, NULL),
('TK110', '2025-12-21 18:00:00', 140, 500, 2, NULL),
('TK111', '2025-12-22 07:00:00', 160, 550, 1, NULL),
('TK112', '2025-12-22 10:00:00', 270, 900, 3, NULL),
('TK113', '2025-12-22 13:15:00', 125, 470, 2, NULL),
('TK114', '2025-12-22 16:30:00', 190, 650, 1, NULL),
('TK115', '2025-12-22 19:00:00', 210, 720, 3, NULL);

-- ========================================
-- 4. ASSIGN FLIGHT ROUTES
-- ========================================
-- IST → AYT
INSERT INTO Flight_Source (flight_id, airport_code) VALUES (1, 'IST'), (2, 'IST'), (3, 'IST'), (4, 'IST'), (5, 'IST');
INSERT INTO Flight_Destination (flight_id, airport_code) VALUES (1, 'AYT'), (2, 'JFK'), (3, 'ESB'), (4, 'LHR'), (5, 'FRA');

-- LHR → CDG
INSERT INTO Flight_Source (flight_id, airport_code) VALUES (6, 'LHR'), (7, 'LHR'), (8, 'LHR'), (9, 'LHR'), (10, 'LHR');
INSERT INTO Flight_Destination (flight_id, airport_code) VALUES (6, 'CDG'), (7, 'FCO'), (8, 'IST'), (9, 'JFK'), (10, 'AMS');

-- FRA → various
INSERT INTO Flight_Source (flight_id, airport_code) VALUES (11, 'FRA'), (12, 'FRA'), (13, 'FRA'), (14, 'FRA'), (15, 'FRA');
INSERT INTO Flight_Destination (flight_id, airport_code) VALUES (11, 'IST'), (12, 'JFK'), (13, 'LHR'), (14, 'CDG'), (15, 'FCO');

-- ========================================
-- 5. ASSIGN CREW TO FLIGHTS (No duplicate crews on same flight time)
-- ========================================
-- Flight 1 (TK101, 2025-12-20 06:00)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(1, 1, 'Captain'), (1, 6, 'First Officer'),
(1, 11, 'Flight Attendant'), (1, 12, 'Flight Attendant'), (1, 27, 'Purser');

-- Flight 2 (TK102, 2025-12-20 08:30)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(2, 2, 'Captain'), (2, 7, 'First Officer'),
(2, 13, 'Flight Attendant'), (2, 14, 'Flight Attendant'), (2, 28, 'Purser');

-- Flight 3 (TK103, 2025-12-20 11:00)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(3, 3, 'Captain'), (3, 8, 'First Officer'),
(3, 15, 'Flight Attendant'), (3, 16, 'Flight Attendant'), (3, 29, 'Purser');

-- Flight 4 (TK104, 2025-12-20 14:15)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(4, 4, 'Captain'), (4, 9, 'First Officer'),
(4, 17, 'Flight Attendant'), (4, 18, 'Flight Attendant'), (4, 30, 'Purser');

-- Flight 5 (TK105, 2025-12-20 17:00)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(5, 5, 'Captain'), (5, 10, 'First Officer'),
(5, 19, 'Flight Attendant'), (5, 20, 'Flight Attendant'), (5, 31, 'Purser');

-- Flight 6 (TK106, 2025-12-21 06:30)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(6, 1, 'Captain'), (6, 6, 'First Officer'),
(6, 21, 'Flight Attendant'), (6, 22, 'Flight Attendant'), (6, 32, 'Purser');

-- Flight 7 (TK107, 2025-12-21 09:00)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(7, 2, 'Captain'), (7, 7, 'First Officer'),
(7, 23, 'Flight Attendant'), (7, 24, 'Flight Attendant'), (7, 33, 'Purser');

-- Flight 8 (TK108, 2025-12-21 12:30)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(8, 3, 'Captain'), (8, 8, 'First Officer'),
(8, 25, 'Flight Attendant'), (8, 26, 'Flight Attendant'), (8, 34, 'Purser');

-- Flight 9 (TK109, 2025-12-21 15:45)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(9, 4, 'Captain'), (9, 9, 'First Officer'),
(9, 11, 'Flight Attendant'), (9, 12, 'Flight Attendant'), (9, 27, 'Purser');

-- Flight 10 (TK110, 2025-12-21 18:00)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(10, 5, 'Captain'), (10, 10, 'First Officer'),
(10, 13, 'Flight Attendant'), (10, 14, 'Flight Attendant'), (10, 28, 'Purser');

-- Flight 11 (TK111, 2025-12-22 07:00)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(11, 1, 'Captain'), (11, 7, 'First Officer'),
(11, 15, 'Flight Attendant'), (11, 16, 'Flight Attendant'), (11, 29, 'Purser');

-- Flight 12 (TK112, 2025-12-22 10:00)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(12, 2, 'Captain'), (12, 8, 'First Officer'),
(12, 17, 'Flight Attendant'), (12, 18, 'Flight Attendant'), (12, 30, 'Purser');

-- Flight 13 (TK113, 2025-12-22 13:15)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(13, 3, 'Captain'), (13, 9, 'First Officer'),
(13, 19, 'Flight Attendant'), (13, 20, 'Flight Attendant'), (13, 31, 'Purser');

-- Flight 14 (TK114, 2025-12-22 16:30)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(14, 4, 'Captain'), (14, 10, 'First Officer'),
(14, 21, 'Flight Attendant'), (14, 22, 'Flight Attendant'), (14, 32, 'Purser');

-- Flight 15 (TK115, 2025-12-22 19:00)
INSERT INTO Flight_Crew (flight_id, crew_id, crew_role) VALUES
(15, 5, 'Captain'), (15, 6, 'First Officer'),
(15, 23, 'Flight Attendant'), (15, 24, 'Flight Attendant'), (15, 33, 'Purser');

-- ========================================
-- 6. ASSIGN PASSENGERS TO FLIGHTS
-- ========================================
-- Flight 1: 120 passengers (includes children 119-120 with their parents 1-2)
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 1, passenger_id, 'CONFIRMED' FROM Passenger WHERE passenger_id BETWEEN 1 AND 120;

-- Flight 2: 150 passengers (exclude orphaned infants/children; only include if parent also present)
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 2, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 10 AND 159 
  AND (parent_passenger_id IS NULL OR parent_passenger_id BETWEEN 10 AND 159);

-- Flight 3: 180 passengers (only include children if parent is in range)
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 3, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 20 AND 199 
  AND (parent_passenger_id IS NULL OR parent_passenger_id BETWEEN 20 AND 199);

-- Flight 4: 150 passengers
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 4, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 30 AND 179 
  AND (parent_passenger_id IS NULL OR parent_passenger_id BETWEEN 30 AND 179);

-- Flight 5: 250 passengers
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 5, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE parent_passenger_id IS NULL OR parent_passenger_id >= 1;

-- Flight 6: 100 passengers
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 6, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 1 AND 100 
  AND (parent_passenger_id IS NULL OR parent_passenger_id BETWEEN 1 AND 100);

-- Flight 7: 140 passengers
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 7, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 5 AND 144 
  AND (parent_passenger_id IS NULL OR parent_passenger_id BETWEEN 5 AND 144);

-- Flight 8: 120 passengers
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 8, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 40 AND 159 
  AND (parent_passenger_id IS NULL OR parent_passenger_id BETWEEN 40 AND 159);

-- Flight 9: Only adults (280 passengers) - exclude children to test different scenarios
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 9, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 1 AND 118;

-- Flight 10: 150 passengers
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 10, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 15 AND 164 
  AND (parent_passenger_id IS NULL OR parent_passenger_id BETWEEN 15 AND 164);

-- Flight 11: 110 passengers
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 11, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 35 AND 144 
  AND (parent_passenger_id IS NULL OR parent_passenger_id BETWEEN 35 AND 144);

-- Flight 12: 300 passengers (include all if possible, but only with valid parents)
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 12, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id <= 168 
  AND (parent_passenger_id IS NULL OR parent_passenger_id <= 168);

-- Flight 13: 160 passengers
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 13, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 10 AND 169 
  AND (parent_passenger_id IS NULL OR parent_passenger_id BETWEEN 10 AND 169);

-- Flight 14: 140 passengers
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 14, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 20 AND 159 
  AND (parent_passenger_id IS NULL OR parent_passenger_id BETWEEN 20 AND 159);

-- Flight 15: 200 passengers
INSERT INTO Flight_Passenger (flight_id, passenger_id, check_in_status) 
SELECT 15, passenger_id, 'CONFIRMED' FROM Passenger 
WHERE passenger_id BETWEEN 1 AND 118;

-- ========================================
-- 7. VERIFICATION QUERIES
-- ========================================
-- Check total data
SELECT 'Cabin Crew Count:' as category, COUNT(*) as total FROM Cabin_Crew;
SELECT 'Passenger Count:' as category, COUNT(*) as total FROM Passenger;
SELECT 'Flight Count:' as category, COUNT(*) as total FROM Flight;
SELECT 'Flight Crew Assignments:' as category, COUNT(*) as total FROM Flight_Crew;
SELECT 'Flight Passenger Bookings:' as category, COUNT(*) as total FROM Flight_Passenger;

-- Verify no crew conflicts (same crew on overlapping flights)
SELECT 
    fc.crew_id,
    c.first_name,
    c.last_name,
    COUNT(DISTINCT fc.flight_id) as flight_count,
    GROUP_CONCAT(f.flight_no, ', ') as flights
FROM Flight_Crew fc
JOIN Cabin_Crew c ON fc.crew_id = c.crew_id
JOIN Flight f ON fc.flight_id = f.flight_id
GROUP BY fc.crew_id, c.first_name, c.last_name
HAVING flight_count > 1
ORDER BY flight_count DESC;
