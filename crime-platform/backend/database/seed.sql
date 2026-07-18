-- KrimeAI Platform - Seed Data
-- Basic seed data to initialize the system for testing

-- 1. Police Stations
INSERT INTO police_stations (id, code, name, district, latitude, longitude) VALUES
('11111111-1111-1111-1111-111111111111', 'KSP001', 'Central Hub Station', 'Bengaluru Urban', 12.9716, 77.5946),
('22222222-2222-2222-2222-222222222222', 'KSP002', 'Indiranagar Station', 'Bengaluru East', 12.9784, 77.6408);

-- 2. Officers
INSERT INTO officers (id, badge_id, name, rank, station_id) VALUES
('33333333-3333-3333-3333-333333333333', 'BLR-1001', 'Siddharth Rao', 'Inspector', '11111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444444', 'BLR-1002', 'Priya Desai', 'Sub-Inspector', '22222222-2222-2222-2222-222222222222');

-- 3. Roles and Users
INSERT INTO roles (id, name) VALUES
('55555555-5555-5555-5555-555555555555', 'ADMIN'),
('66666666-6666-6666-6666-666666666666', 'INVESTIGATOR');

INSERT INTO users (id, officer_id, email, password_hash, role_id) VALUES
('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'admin@gmail.com', 'admin', '55555555-5555-5555-5555-555555555555'),
('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'priya@ksp.gov.in', 'hashed_password_placeholder', '66666666-6666-6666-6666-666666666666');

-- 4. Crime Categories & Acts
INSERT INTO crime_categories (id, name) VALUES
('99999999-9999-9999-9999-999999999999', 'Theft'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cybercrime'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Assault');

INSERT INTO acts (id, name) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Indian Penal Code, 1860'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Information Technology Act, 2000');

INSERT INTO sections (id, act_id, section_code, description) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '378', 'Theft'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '66', 'Computer related offences');
