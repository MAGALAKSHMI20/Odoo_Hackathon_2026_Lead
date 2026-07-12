-- TransitOps Database Schema - PostgreSQL

-- Drop tables if they exist
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS maintenance_logs;
DROP TABLE IF EXISTS dispatches;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS vehicles;

-- 1. VEHICLES TABLE
CREATE TABLE vehicles (
    id VARCHAR(50) PRIMARY KEY,
    plate VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Truck', 'Van', 'Car')),
    status VARCHAR(50) NOT NULL DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'in service')),
    fuel_level INT NOT NULL DEFAULT 100 CHECK (fuel_level >= 0 AND fuel_level <= 100),
    mileage INT NOT NULL DEFAULT 0 CHECK (mileage >= 0),
    health VARCHAR(50) NOT NULL DEFAULT 'Excellent' CHECK (health IN ('Excellent', 'Needs Service', 'Critical')),
    next_service DATE NOT NULL
);

-- 2. DRIVERS TABLE
CREATE TABLE drivers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license VARCHAR(50) UNIQUE NOT NULL,
    license_class VARCHAR(50) NOT NULL CHECK (license_class IN ('Class A CDL', 'Class B CDL', 'Class C CDL')),
    license_expiry DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'off duty' CHECK (status IN ('on duty', 'off duty', 'break')),
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
    fuel_economy NUMERIC(4,2) NOT NULL DEFAULT 7.00 CHECK (fuel_economy >= 0),
    phone VARCHAR(30) NOT NULL,
    avatar TEXT
);

-- 3. DISPATCHES TABLE (Trips)
CREATE TABLE dispatches (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id VARCHAR(50) REFERENCES drivers(id) ON DELETE SET NULL,
    route TEXT NOT NULL,
    cargo TEXT NOT NULL,
    eta TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in transit', 'completed', 'cancelled')),
    progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    stops TEXT[] -- Array of stop names
);

-- 4. MAINTENANCE LOGS TABLE
CREATE TABLE maintenance_logs (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in progress', 'completed')),
    notes TEXT
);

-- 5. EXPENSES TABLE
CREATE TABLE expenses (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Fuel', 'Maintenance', 'Tolls', 'Driver Payout', 'Insurance', 'Other')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id VARCHAR(50) REFERENCES drivers(id) ON DELETE SET NULL,
    notes TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- =========================================================================
-- SEED DATA (Identical to Frontend Mock Data)
-- =========================================================================

-- Seed Vehicles
INSERT INTO vehicles (id, plate, model, type, status, fuel_level, mileage, health, next_service) VALUES
('V-101', 'CA-993-XP', 'Freightliner Cascadia (Heavy Truck)', 'Truck', 'active', 78, 142500, 'Excellent', '2026-08-15'),
('V-102', 'TX-440-QW', 'Ford Transit Cargo Van', 'Van', 'idle', 12, 68120, 'Excellent', '2026-07-28'),
('V-103', 'NY-801-PL', 'Volvo FH16 Semi-Truck', 'Truck', 'in service', 45, 210800, 'Needs Service', '2026-07-10'),
('V-104', 'NV-552-MK', 'Peterbilt 579 Heavy Duty', 'Truck', 'active', 90, 89400, 'Critical', '2026-07-02'),
('V-105', 'FL-119-ZZ', 'Mercedes-Benz Sprinter', 'Van', 'idle', 65, 43200, 'Excellent', '2026-09-05');

-- Seed Drivers
INSERT INTO drivers (id, name, license, license_class, license_expiry, status, rating, fuel_economy, phone, avatar) VALUES
('D-201', 'Marcus Vance', 'DL-CA92019-A', 'Class A CDL', '2028-11-22', 'on duty', 4.85, 7.2, '+1 (555) 019-2831', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'),
('D-202', 'Elena Rostova', 'DL-TX88102-A', 'Class A CDL', '2026-06-15', 'off duty', 4.92, 7.8, '+1 (555) 014-9982', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100'),
('D-203', 'Sarah Jenkins', 'DL-NY44192-B', 'Class B CDL', '2026-08-01', 'off duty', 4.76, 6.9, '+1 (555) 017-8821', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100'),
('D-204', 'Derrick Cooper', 'DL-NV33091-A', 'Class A CDL', '2027-04-10', 'on duty', 4.58, 6.2, '+1 (555) 015-3921', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100'),
('D-205', 'Carlos Mendez', 'DL-FL77209-C', 'Class C CDL', '2029-01-30', 'break', 4.65, 8.4, '+1 (555) 012-7744', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100');

-- Seed Dispatches
INSERT INTO dispatches (id, vehicle_id, driver_id, route, cargo, eta, started_at, completed_at, status, progress, stops) VALUES
('DISP-501', 'V-101', 'D-201', 'Los Angeles Hub ➔ San Francisco Depot', 'Medical Supplies & General Goods', '2026-07-12 16:30:00', '2026-07-12 07:15:00', NULL, 'in transit', 65, ARRAY['Bakersfield Stopover', 'Fresno Logistics Hub']),
('DISP-502', 'V-104', 'D-204', 'Las Vegas Hub ➔ Phoenix Depot', 'Refrigerated Electronics', '2026-07-12 13:45:00', '2026-07-12 09:30:00', NULL, 'in transit', 35, ARRAY['Kingman Service Area']),
('DISP-503', 'V-105', 'D-205', 'Miami Cargo Center ➔ Orlando Hub', 'E-commerce Express Parcels', '2026-07-12 12:00:00', '2026-07-12 12:00:00', NULL, 'pending', 0, ARRAY['West Palm Beach Sort Center']);

-- Seed Maintenance Logs
INSERT INTO maintenance_logs (id, vehicle_id, service_type, cost, date, status, notes) VALUES
('MNT-901', 'V-103', 'Engine Diagnostics & Filter Change', 1450.00, '2026-07-08', 'in progress', 'Reported loss of engine power under heavy load.'),
('MNT-902', 'V-101', 'Front Brake Pad Replacement', 680.00, '2026-06-20', 'completed', 'Brakes inspected and pads replaced during safety audit.'),
('MNT-903', 'V-102', 'Tire Rotation & Alignment', 320.00, '2026-07-14', 'scheduled', 'Standard 60k mile tread wear inspection.');

-- Seed Expenses
INSERT INTO expenses (id, date, category, amount, vehicle_id, driver_id, notes, status) VALUES
('EXP-301', '2026-07-11', 'Fuel', 540.00, 'V-101', 'D-201', 'Shell Truck Stop #88 - 120 Gallons Diesel', 'approved'),
('EXP-302', '2026-07-10', 'Maintenance', 1450.00, 'V-103', 'D-203', 'Engine Diagnostic service down-payment', 'pending'),
('EXP-303', '2026-07-09', 'Tolls', 85.00, 'V-104', 'D-204', 'I-15 Express Lanes & Bridge Tolls', 'approved'),
('EXP-304', '2026-07-08', 'Fuel', 610.00, 'V-104', 'D-204', 'Pilot Travel Center - Fuel Refill', 'approved'),
('EXP-305', '2026-07-07', 'Driver Payout', 1200.00, 'V-105', 'D-205', 'Weekly driver milestone completion bonus', 'approved');
