const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection pool setup (with fallback to memory storage if DB is not configured)
let dbPool = null;
let useDatabaseFallback = true;

if (process.env.DB_USER && process.env.DB_HOST && process.env.DB_NAME) {
  try {
    dbPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
    });
    useDatabaseFallback = false;
    console.log("Database parameters defined. Connected to PostgreSQL pool.");
  } catch (err) {
    console.warn("Postgres connection failed, falling back to in-memory caching:", err.message);
  }
} else {
  console.log("No PostgreSQL variables detected in .env. Booting in-memory server mode.");
}

// =========================================================================
// IN-MEMORY FALLBACK DATABASE
// =========================================================================
let vehicles = [
  { id: "V-101", plate: "CA-993-XP", model: "Freightliner Cascadia (Heavy Truck)", type: "Truck", status: "active", fuelLevel: 78, mileage: 142500, health: "Excellent", nextService: "2026-08-15" },
  { id: "V-102", plate: "TX-440-QW", model: "Ford Transit Cargo Van", type: "Van", status: "idle", fuelLevel: 12, mileage: 68120, health: "Excellent", nextService: "2026-07-28" },
  { id: "V-103", plate: "NY-801-PL", model: "Volvo FH16 Semi-Truck", type: "Truck", status: "in service", fuelLevel: 45, mileage: 210800, health: "Needs Service", nextService: "2026-07-10" },
  { id: "V-104", plate: "NV-552-MK", model: "Peterbilt 579 Heavy Duty", type: "Truck", status: "active", fuelLevel: 90, mileage: 89400, health: "Critical", nextService: "2026-07-02" },
  { id: "V-105", plate: "FL-119-ZZ", model: "Mercedes-Benz Sprinter", type: "Van", status: "idle", fuelLevel: 65, mileage: 43200, health: "Excellent", nextService: "2026-09-05" }
];

let drivers = [
  { id: "D-201", name: "Marcus Vance", license: "DL-CA92019-A", licenseClass: "Class A CDL", licenseExpiry: "2028-11-22", status: "on duty", rating: 4.85, fuelEconomy: 7.2, phone: "+1 (555) 019-2831", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" },
  { id: "D-202", name: "Elena Rostova", license: "DL-TX88102-A", licenseClass: "Class A CDL", licenseExpiry: "2026-06-15", status: "off duty", rating: 4.92, fuelEconomy: 7.8, phone: "+1 (555) 014-9982", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" },
  { id: "D-203", name: "Sarah Jenkins", license: "DL-NY44192-B", licenseClass: "Class B CDL", licenseExpiry: "2026-08-01", status: "off duty", rating: 4.76, fuelEconomy: 6.9, phone: "+1 (555) 017-8821", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" },
  { id: "D-204", name: "Derrick Cooper", license: "DL-NV33091-A", licenseClass: "Class A CDL", licenseExpiry: "2027-04-10", status: "on duty", rating: 4.58, fuelEconomy: 6.2, phone: "+1 (555) 015-3921", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" },
  { id: "D-205", name: "Carlos Mendez", license: "DL-FL77209-C", licenseClass: "Class C CDL", licenseExpiry: "2029-01-30", status: "break", rating: 4.65, fuelEconomy: 8.4, phone: "+1 (555) 012-7744", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" }
];

let dispatches = [
  { id: "DISP-501", vehicleId: "V-101", driverId: "D-201", route: "Los Angeles Hub ➔ San Francisco Depot", status: "in transit", cargo: "Medical Supplies & General Goods", eta: "2026-07-12T16:30:00", startedAt: "2026-07-12T07:15:00", completedAt: null, progress: 65, stops: ["Bakersfield Stopover", "Fresno Logistics Hub"] },
  { id: "DISP-502", vehicleId: "V-104", driverId: "D-204", route: "Las Vegas Hub ➔ Phoenix Depot", status: "in transit", cargo: "Refrigerated Electronics", eta: "2026-07-12T13:45:00", startedAt: "2026-07-12T09:30:00", completedAt: null, progress: 35, stops: ["Kingman Service Area"] },
  { id: "DISP-503", vehicleId: "V-105", driverId: "D-205", route: "Miami Cargo Center ➔ Orlando Hub", status: "pending", cargo: "E-commerce Express Parcels", eta: "2026-07-12T18:00:00", startedAt: "2026-07-12T12:00:00", completedAt: null, progress: 0, stops: ["West Palm Beach Sort Center"] }
];

let maintenance = [
  { id: "MNT-901", vehicleId: "V-103", serviceType: "Engine Diagnostics & Filter Change", cost: 1450, date: "2026-07-08", status: "in progress", notes: "Reported loss of engine power under heavy load." },
  { id: "MNT-902", vehicleId: "V-101", serviceType: "Front Brake Pad Replacement", cost: 680, date: "2026-06-20", status: "completed", notes: "Brakes inspected and pads replaced during safety audit." },
  { id: "MNT-903", vehicleId: "V-102", serviceType: "Tire Rotation & Alignment", cost: 320, date: "2026-07-14", status: "scheduled", notes: "Standard 60k mile tread wear inspection." }
];

let expenses = [
  { id: "EXP-301", date: "2026-07-11", category: "Fuel", amount: 540, vehicleId: "V-101", driverId: "D-201", notes: "Shell Truck Stop #88 - 120 Gallons Diesel", status: "approved" },
  { id: "EXP-302", date: "2026-07-10", category: "Maintenance", amount: 1450, vehicleId: "V-103", driverId: "D-203", notes: "Engine Diagnostic service down-payment", status: "pending" },
  { id: "EXP-303", date: "2026-07-09", category: "Tolls", amount: 85, vehicleId: "V-104", driverId: "D-204", notes: "I-15 Express Lanes & Bridge Tolls", status: "approved" },
  { id: "EXP-304", date: "2026-07-08", category: "Fuel", amount: 610, vehicleId: "V-104", driverId: "D-204", notes: "Pilot Travel Center - Fuel Refill", status: "approved" },
  { id: "EXP-305", date: "2026-07-07", category: "Driver Payout", amount: 1200, vehicleId: "V-105", driverId: "D-205", notes: "Weekly driver milestone completion bonus", status: "approved" }
];

// Helper to validate driver CDL dates
const getLicenseStatus = (expiryDate) => {
  const today = new Date("2026-07-12");
  const expiry = new Date(expiryDate);
  return expiry < today ? "Expired" : "Valid";
};

// =========================================================================
// API ENDPOINTS
// =========================================================================

// 1. VEHICLE API
app.get('/api/vehicles', async (req, res) => {
  if (!useDatabaseFallback) {
    try {
      const result = await dbPool.query('SELECT * FROM vehicles ORDER BY id ASC');
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(vehicles);
});

app.post('/api/vehicles', async (req, res) => {
  const { id, plate, model, type, status, fuelLevel, mileage, health, nextService } = req.body;

  if (!plate || !model) {
    return res.status(400).json({ error: "License plate and model description are required" });
  }

  if (!useDatabaseFallback) {
    try {
      // Check Plate uniqueness
      const checkPlate = await dbPool.query('SELECT id FROM vehicles WHERE LOWER(plate) = LOWER($1)', [plate]);
      if (checkPlate.rows.length > 0) {
        return res.status(400).json({ error: `Plate number ${plate} is already registered.` });
      }

      const result = await dbPool.query(
        'INSERT INTO vehicles (id, plate, model, type, status, fuel_level, mileage, health, next_service) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [id, plate, model, type, status || 'idle', fuelLevel || 100, mileage || 0, health || 'Excellent', nextService]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (vehicles.some(v => v.plate.toLowerCase() === plate.toLowerCase())) {
    return res.status(400).json({ error: "Plate number already registered" });
  }

  const newVehicle = { id, plate, model, type, status: status || 'idle', fuelLevel: fuelLevel || 100, mileage: mileage || 0, health: health || 'Excellent', nextService };
  vehicles.push(newVehicle);
  res.status(201).json(newVehicle);
});

app.put('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { plate, model, type, status, fuelLevel, mileage, health, nextService } = req.body;

  if (!useDatabaseFallback) {
    try {
      const result = await dbPool.query(
        'UPDATE vehicles SET plate = $1, model = $2, type = $3, status = $4, fuel_level = $5, mileage = $6, health = $7, next_service = $8 WHERE id = $9 RETURNING *',
        [plate, model, type, status, fuelLevel, mileage, health, nextService, id]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const idx = vehicles.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ error: "Vehicle not found" });

  vehicles[idx] = { id, plate, model, type, status, fuelLevel, mileage, health, nextService };
  res.json(vehicles[idx]);
});

app.delete('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;

  if (!useDatabaseFallback) {
    try {
      // Check active dispatches
      const dispatchCheck = await dbPool.query("SELECT id FROM dispatches WHERE vehicle_id = $1 AND status IN ('pending', 'in transit')", [id]);
      if (dispatchCheck.rows.length > 0) {
        return res.status(400).json({ error: `Cannot remove vehicle. Assigned to active dispatch: ${dispatchCheck.rows[0].id}` });
      }
      await dbPool.query('DELETE FROM vehicles WHERE id = $1', [id]);
      return res.json({ message: `Vehicle ${id} retired successfully` });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const hasActiveDispatch = dispatches.some(d => d.vehicleId === id && (d.status === "in transit" || d.status === "pending"));
  if (hasActiveDispatch) {
    return res.status(400).json({ error: "Cannot delete vehicle with active dispatches" });
  }

  vehicles = vehicles.filter(v => v.id !== id);
  res.json({ message: "Vehicle deleted" });
});

// 2. DRIVER API
app.get('/api/drivers', async (req, res) => {
  if (!useDatabaseFallback) {
    try {
      const result = await dbPool.query('SELECT * FROM drivers ORDER BY id ASC');
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(drivers);
});

app.post('/api/drivers', async (req, res) => {
  const { id, name, license, licenseClass, licenseExpiry, status, rating, fuelEconomy, phone, avatar } = req.body;

  if (!useDatabaseFallback) {
    try {
      const result = await dbPool.query(
        'INSERT INTO drivers (id, name, license, license_class, license_expiry, status, rating, fuel_economy, phone, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [id, name, license, licenseClass, licenseExpiry, status || 'off duty', rating || 5.0, fuelEconomy || 7.0, phone, avatar]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const newDriver = { id, name, license, licenseClass, licenseExpiry, status: status || 'off duty', rating: rating || 5.0, fuelEconomy: fuelEconomy || 7.0, phone, avatar };
  drivers.push(newDriver);
  res.status(201).json(newDriver);
});

app.put('/api/drivers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, license, licenseClass, licenseExpiry, status, rating, fuelEconomy, phone, avatar } = req.body;

  if (!useDatabaseFallback) {
    try {
      const result = await dbPool.query(
        'UPDATE drivers SET name = $1, license = $2, license_class = $3, license_expiry = $4, status = $5, rating = $6, fuel_economy = $7, phone = $8, avatar = $9 WHERE id = $10 RETURNING *',
        [name, license, licenseClass, licenseExpiry, status, rating, fuelEconomy, phone, avatar, id]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const idx = drivers.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: "Driver not found" });

  drivers[idx] = { id, name, license, licenseClass, licenseExpiry, status, rating, fuelEconomy, phone, avatar };
  res.json(drivers[idx]);
});

app.delete('/api/drivers/:id', async (req, res) => {
  const { id } = req.params;

  if (!useDatabaseFallback) {
    try {
      const dispatchCheck = await dbPool.query("SELECT id FROM dispatches WHERE driver_id = $1 AND status IN ('pending', 'in transit')", [id]);
      if (dispatchCheck.rows.length > 0) {
        return res.status(400).json({ error: `Cannot remove driver. Assigned to active dispatch: ${dispatchCheck.rows[0].id}` });
      }
      await dbPool.query('DELETE FROM drivers WHERE id = $1', [id]);
      return res.json({ message: `Driver ${id} deleted successfully` });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const hasActiveDispatch = dispatches.some(d => d.driverId === id && (d.status === "in transit" || d.status === "pending"));
  if (hasActiveDispatch) {
    return res.status(400).json({ error: "Cannot delete driver with active dispatches" });
  }

  drivers = drivers.filter(d => d.id !== id);
  res.json({ message: "Driver deleted" });
});

// 3. DISPATCH API (Compliance Orchestrator)
app.get('/api/dispatches', async (req, res) => {
  if (!useDatabaseFallback) {
    try {
      const result = await dbPool.query('SELECT * FROM dispatches ORDER BY id ASC');
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(dispatches);
});

app.post('/api/dispatches', async (req, res) => {
  const { id, vehicleId, driverId, route, cargo, eta, stops } = req.body;

  let targetVehicle = null;
  let targetDriver = null;

  if (!useDatabaseFallback) {
    try {
      const vResult = await dbPool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
      const dResult = await dbPool.query('SELECT * FROM drivers WHERE id = $1', [driverId]);
      targetVehicle = vResult.rows[0];
      targetDriver = dResult.rows[0];
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    targetVehicle = vehicles.find(v => v.id === vehicleId);
    targetDriver = drivers.find(d => d.id === driverId);
  }

  if (!targetVehicle || !targetDriver) {
    return res.status(400).json({ error: "Invalid vehicle or driver credentials selection." });
  }

  // --- BUSINESS RULES COMPLIANCE ENGINE ---
  if (getLicenseStatus(targetDriver.licenseExpiry) === "Expired") {
    return res.status(400).json({ error: `Compliance Blocked: Driver license is EXPIRED (${targetDriver.licenseExpiry}).` });
  }
  if (targetDriver.status === "on duty") {
    return res.status(400).json({ error: "Compliance Blocked: Driver is currently assigned on active duty." });
  }
  if (targetVehicle.status === "in service") {
    return res.status(400).json({ error: "Compliance Blocked: Vehicle is checked inside workshop." });
  }
  if (targetVehicle.health === "Critical") {
    return res.status(400).json({ error: "Compliance Blocked: Vehicle health dashboard flag is Critical." });
  }

  const newDispatch = {
    id,
    vehicleId,
    driverId,
    route,
    cargo,
    eta,
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'pending',
    progress: 0,
    stops: stops || []
  };

  if (!useDatabaseFallback) {
    try {
      await dbPool.query('BEGIN');
      // Create dispatch
      await dbPool.query(
        'INSERT INTO dispatches (id, vehicle_id, driver_id, route, cargo, eta, started_at, status, progress, stops) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [id, vehicleId, driverId, route, cargo, eta, newDispatch.startedAt, 'pending', 0, stops]
      );
      // Lock vehicle and driver statuses
      await dbPool.query("UPDATE vehicles SET status = 'active' WHERE id = $1", [vehicleId]);
      await dbPool.query("UPDATE drivers SET status = 'on duty' WHERE id = $1", [driverId]);
      await dbPool.query('COMMIT');
      
      return res.status(201).json(newDispatch);
    } catch (err) {
      await dbPool.query('ROLLBACK');
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback memory state sync
  targetVehicle.status = "active";
  targetDriver.status = "on duty";
  dispatches.push(newDispatch);
  res.status(201).json(newDispatch);
});

app.patch('/api/dispatches/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // in transit, completed, cancelled

  let dispatch = null;
  if (!useDatabaseFallback) {
    try {
      const dispResult = await dbPool.query('SELECT * FROM dispatches WHERE id = $1', [id]);
      dispatch = dispResult.rows[0];
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    dispatch = dispatches.find(d => d.id === id);
  }

  if (!dispatch) return res.status(404).json({ error: "Dispatch record not found" });

  const vehicleId = dispatch.vehicle_id || dispatch.vehicleId;
  const driverId = dispatch.driver_id || dispatch.driverId;

  if (!useDatabaseFallback) {
    try {
      await dbPool.query('BEGIN');
      
      if (status === 'in transit') {
        await dbPool.query("UPDATE dispatches SET status = 'in transit', progress = 5 WHERE id = $1", [id]);
      }
      
      if (status === 'completed') {
        const completedTime = new Date().toISOString();
        await dbPool.query("UPDATE dispatches SET status = 'completed', progress = 100, completed_at = $1 WHERE id = $2", [completedTime, id]);
        
        // Release Driver and Vehicle
        await dbPool.query("UPDATE drivers SET status = 'off duty' WHERE id = $1", [driverId]);
        
        // Fetch current vehicle variables to apply wear & tear formulas
        const vQuery = await dbPool.query('SELECT fuel_level, mileage, health FROM vehicles WHERE id = $1', [vehicleId]);
        const vehicleObj = vQuery.rows[0];
        const nextFuel = Math.max(vehicleObj.fuel_level - 20, 5);
        const nextMileage = vehicleObj.mileage + 320;
        const nextHealth = nextFuel < 15 ? 'Needs Service' : vehicleObj.health;

        await dbPool.query(
          "UPDATE vehicles SET status = 'idle', fuel_level = $1, mileage = $2, health = $3 WHERE id = $4",
          [nextFuel, nextMileage, nextHealth, vehicleId]
        );
      }
      
      await dbPool.query('COMMIT');
      return res.json({ message: "Dispatch status updated successfully" });
    } catch (err) {
      await dbPool.query('ROLLBACK');
      return res.status(500).json({ error: err.message });
    }
  }

  // Memory fallbacks
  const targetDisp = dispatches.find(d => d.id === id);
  if (status === "in transit") {
    targetDisp.status = "in transit";
    targetDisp.progress = 5;
  }
  
  if (status === "completed") {
    targetDisp.status = "completed";
    targetDisp.progress = 100;
    targetDisp.completedAt = new Date().toISOString();

    const dObj = drivers.find(d => d.id === driverId);
    if (dObj) dObj.status = "off duty";

    const vObj = vehicles.find(v => v.id === vehicleId);
    if (vObj) {
      vObj.status = "idle";
      vObj.fuelLevel = Math.max(vObj.fuelLevel - 20, 5);
      vObj.mileage += 320;
      if (vObj.fuelLevel < 15) vObj.health = "Needs Service";
    }
  }

  res.json({ message: "Status updated in local cache." });
});

// 4. MAINTENANCE LOG API
app.get('/api/maintenance', async (req, res) => {
  if (!useDatabaseFallback) {
    try {
      const result = await dbPool.query('SELECT * FROM maintenance_logs ORDER BY id ASC');
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(maintenance);
});

app.post('/api/maintenance', async (req, res) => {
  const { id, vehicleId, serviceType, cost, date, notes } = req.body;

  if (!useDatabaseFallback) {
    try {
      const result = await dbPool.query(
        'INSERT INTO maintenance_logs (id, vehicle_id, service_type, cost, date, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [id, vehicleId, serviceType, cost, date, 'scheduled', notes]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const newTicket = { id, vehicleId, serviceType, cost: parseFloat(cost) || 0, date, status: 'scheduled', notes };
  maintenance.push(newTicket);
  res.status(201).json(newTicket);
});

app.patch('/api/maintenance/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, actualCost } = req.body; // in progress, completed

  let ticket = null;
  if (!useDatabaseFallback) {
    try {
      const tResult = await dbPool.query('SELECT * FROM maintenance_logs WHERE id = $1', [id]);
      ticket = tResult.rows[0];
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    ticket = maintenance.find(m => m.id === id);
  }

  if (!ticket) return res.status(404).json({ error: "Service ticket not found" });

  const vehicleId = ticket.vehicle_id || ticket.vehicleId;

  if (!useDatabaseFallback) {
    try {
      await dbPool.query('BEGIN');
      
      if (status === 'in progress') {
        await dbPool.query("UPDATE maintenance_logs SET status = 'in progress' WHERE id = $1", [id]);
        await dbPool.query("UPDATE vehicles SET status = 'in service' WHERE id = $1", [vehicleId]);
      }
      
      if (status === 'completed') {
        const finalCost = actualCost || ticket.cost;
        await dbPool.query("UPDATE maintenance_logs SET status = 'completed', cost = $1 WHERE id = $2", [finalCost, id]);
        
        // Restore Vehicle Health
        const nextService = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await dbPool.query(
          "UPDATE vehicles SET status = 'idle', health = 'Excellent', fuel_level = 100, next_service = $1 WHERE id = $2",
          [nextService, vehicleId]
        );

        // Auto-post completed repair to Expenses
        const expenseId = "EXP-" + Math.floor(Math.random() * 100000);
        const expDate = new Date().toISOString().split('T')[0];
        await dbPool.query(
          "INSERT INTO expenses (id, date, category, amount, vehicle_id, driver_id, notes, status) VALUES ($1, $2, 'Maintenance', $3, $4, 'D-203', $5, 'approved')",
          [expenseId, expDate, finalCost, vehicleId, `Auto-invoice Service Ticket ${id}: ${ticket.service_type}`]
        );
      }
      
      await dbPool.query('COMMIT');
      return res.json({ message: "Maintenance cycle updated successfully" });
    } catch (err) {
      await dbPool.query('ROLLBACK');
      return res.status(500).json({ error: err.message });
    }
  }

  // Memory fallbacks
  const tObj = maintenance.find(m => m.id === id);
  if (status === "in progress") {
    tObj.status = "in progress";
    const vObj = vehicles.find(v => v.id === vehicleId);
    if (vObj) vObj.status = "in service";
  }
  
  if (status === "completed") {
    tObj.status = "completed";
    tObj.cost = actualCost || tObj.cost;

    const vObj = vehicles.find(v => v.id === vehicleId);
    if (vObj) {
      vObj.status = "idle";
      vObj.health = "Excellent";
      vObj.fuelLevel = 100;
      vObj.nextService = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    // Auto post expense
    const autoExpense = {
      id: "EXP-" + (300 + expenses.length + 1),
      date: new Date().toISOString().split("T")[0],
      category: "Maintenance",
      amount: tObj.cost,
      vehicleId,
      driverId: "D-203",
      notes: `Auto-invoice Service Ticket ${id}: ${tObj.serviceType}`,
      status: "approved"
    };
    expenses.push(autoExpense);
  }

  res.json({ message: "Maintenance details synced." });
});

// 5. EXPENSE LEDGER API
app.get('/api/expenses', async (req, res) => {
  if (!useDatabaseFallback) {
    try {
      const result = await dbPool.query('SELECT * FROM expenses ORDER BY date DESC');
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(expenses);
});

app.post('/api/expenses', async (req, res) => {
  const { id, date, category, amount, vehicleId, driverId, notes } = req.body;

  if (!useDatabaseFallback) {
    try {
      const result = await dbPool.query(
        'INSERT INTO expenses (id, date, category, amount, vehicle_id, driver_id, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [id, date, category, amount, vehicleId, driverId, notes, 'pending']
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const newExpense = { id, date, category, amount, vehicleId, driverId, notes, status: 'pending' };
  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.patch('/api/expenses/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // approved, rejected

  if (!useDatabaseFallback) {
    try {
      const result = await dbPool.query('UPDATE expenses SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Expense not found" });
      return res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const exp = expenses.find(e => e.id === id);
  if (!exp) return res.status(404).json({ error: "Expense not found" });
  exp.status = status;
  res.json(exp);
});

// Start Server listening
app.listen(PORT, () => {
  console.log(`TransitOps compliance server actively running on port ${PORT}`);
});
