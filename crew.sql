CREATE DATABASE flight_database; 
USE flight_database;            

CREATE TABLE Crew_Role (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    main_role VARCHAR(20) NOT NULL,
    sub_role VARCHAR(30) NOT NULL,
    UNIQUE(main_role, sub_role),
    CHECK (main_role IN ('pilot', 'cabin')),
    CHECK (sub_role IN ('senior', 'junior', 'trainee', 'chief', 'junior_attendant', 'chef'))
);


CREATE TABLE Crew (
    crew_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INT NOT NULL,
    
 
    vehicle_type VARCHAR(20),      
    max_distance_km INT,           
    

    languages TEXT,                
    recipes TEXT,                  

    email VARCHAR(100),
    phone VARCHAR(20),

    FOREIGN KEY (role_id) REFERENCES Crew_Role(role_id)
);

CREATE TABLE Crew_Assignment (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    crew_id INT NOT NULL,
    flight_id VARCHAR(50) NOT NULL,
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crew_id) REFERENCES Crew(crew_id)
);

INSERT INTO Crew_Role (main_role, sub_role) VALUES
('pilot', 'senior'),            
('pilot', 'junior'),           
('pilot', 'trainee'),           
('cabin', 'chief'),             
('cabin', 'junior_attendant'), 
('cabin', 'chef');              

INSERT INTO Crew (first_name, last_name, role_id, vehicle_type, max_distance_km, email)
VALUES ('Ahmet', 'Demir', 1, 'A320', 3000, 'ahmet@air.com');

INSERT INTO Crew (first_name, last_name, role_id, languages, recipes, email)
VALUES ('Selin', 'Kaya', 6, '["EN","TR"]', '["Vegan Menu","Dessert"]', 'selin@air.com');

INSERT INTO Crew (first_name, last_name, role_id, vehicle_type, max_distance_km, email)
VALUES ('Murat', 'Yılmaz', 1, 'Boeing 777', 12000, 'murat@air.com');

INSERT INTO Crew (first_name, last_name, role_id, languages, email)
VALUES ('Ayşe', 'Can', 5, '["TR", "EN", "DE"]', 'ayse@air.com');

INSERT INTO Crew_Assignment (crew_id, flight_id) VALUES (1, 'TK1923');

INSERT INTO Crew_Assignment (crew_id, flight_id) VALUES (2, 'TK1923');

INSERT INTO Crew_Assignment (crew_id, flight_id) VALUES (3, 'TK2024');

SELECT 
    c.first_name AS Isim, 
    c.last_name AS Soyisim, 
    r.sub_role AS Gorev, 
    a.flight_id AS Ucus_No
FROM Crew c
JOIN Crew_Role r ON c.role_id = r.role_id
JOIN Crew_Assignment a ON c.crew_id = a.crew_id;