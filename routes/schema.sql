-- =========================================
-- PAWMELLE DATABASE SCHEMA
-- PostgreSQL
-- =========================================


-- =========================================
-- USERS TABLE
-- =========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    phone VARCHAR(20),

    role VARCHAR(20) NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin'))
);


-- =========================================
-- SERVICES TABLE
-- =========================================

CREATE TABLE services (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    description TEXT NOT NULL,

    price INTEGER NOT NULL
        CHECK (price >= 0),

    duration INTEGER NOT NULL
        CHECK (duration > 0)
);


-- =========================================
-- PETS TABLE
-- =========================================

CREATE TABLE pets (
    id SERIAL PRIMARY KEY,

    -- Name can initially be empty because signup
    -- only asks for pet type and age
    name VARCHAR(100),

    species VARCHAR(100) NOT NULL,

    breed VARCHAR(100),

    age NUMERIC(4,1) NOT NULL
        CHECK (age >= 0),

    user_id INTEGER NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================
-- APPOINTMENTS TABLE
-- =========================================

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,

    appointment_date DATE NOT NULL,

    appointment_time TIME WITHOUT TIME ZONE NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'accepted',
                'rejected',
                'cancelled'
            )
        ),

    user_id INTEGER NOT NULL,

    pet_id INTEGER NOT NULL,

    service_id INTEGER NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- to insert the services data into the services table
INSERT INTO services (name, description, price, duration)
VALUES
(
    'General Checkup',
    'Your pet will receive a complete general health examination, including a physical check, weight assessment, basic vital signs review, and guidance about any health concerns noticed during the visit.',
    15,
    30
),
(
    'Vaccination',
    'This service includes reviewing your pet''s vaccination needs, administering the appropriate vaccine, and giving you basic aftercare instructions and information about when the next dose may be needed.',
    20,
    30
),
(
    'Grooming',
    'Your pet will receive a grooming session that includes coat brushing, cleaning, nail trimming, and basic hygiene care to help keep them comfortable, clean, and well maintained.',
    18,
    60
),
(
    'Dental Cleaning',
    'This service includes a basic dental examination and teeth cleaning to help remove buildup, check the condition of the gums and teeth, and identify any visible oral health concerns.',
    25,
    60
),
(
    'Emergency Consultation',
    'Your pet will receive an urgent assessment by the veterinary team to evaluate their condition, identify immediate concerns, and determine the next steps or treatment they may require.',
    30,
    45
),
(
    'Skin & Allergy Consultation',
    'Your pet will receive an examination focused on skin, coat, itching, redness, or allergy-related concerns. The vet will assess possible causes and recommend suitable care or further testing if needed.',
    22,
    45
),
(
    'Nutrition Consultation',
    'This service includes a review of your pet''s current diet, weight, age, and health needs. You will receive practical feeding recommendations and guidance for maintaining a healthy and balanced diet.',
    18,
    30
),
(
    'Post-Treatment Follow-Up',
    'A follow-up visit to check your pet''s recovery after a previous treatment or procedure. The vet will review progress, examine any remaining symptoms, and advise whether further treatment is needed.',
    12,
    30
);


-- create admin account
INSERT INTO users (name, email, password, role)
VALUES (
    'Pawmelle Admin',
    'admin@pawmelle.com',
    '$2b$10$b0kdCvpyFfWKuzwbYz7YYeHYs7m33U.90GYvgPSDCsDDJbTa5jt1W',
    'admin'
);

