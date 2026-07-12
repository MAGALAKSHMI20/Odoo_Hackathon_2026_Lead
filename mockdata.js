// TransitOps Seed Mock Data

export const initialVehicles = [
  {
    id: "V-101",
    plate: "CA-993-XP",
    model: "Freightliner Cascadia (Heavy Truck)",
    type: "Truck",
    status: "active", // active, in service (maintenance), idle
    fuelLevel: 78, // in %
    mileage: 142500,
    health: "Excellent", // Excellent, Needs Service, Critical
    nextService: "2026-08-15"
  },
  {
    id: "V-102",
    plate: "TX-440-QW",
    model: "Ford Transit Cargo Van",
    type: "Van",
    status: "idle",
    fuelLevel: 12, // LOW FUEL WARNING TESTER
    mileage: 68120,
    health: "Excellent",
    nextService: "2026-07-28"
  },
  {
    id: "V-103",
    plate: "NY-801-PL",
    model: "Volvo FH16 Semi-Truck",
    type: "Truck",
    status: "in service", // MAINTENANCE TESTER
    fuelLevel: 45,
    mileage: 210800,
    health: "Needs Service",
    nextService: "2026-07-10" // OVERDUE MAINTENANCE TESTER
  },
  {
    id: "V-104",
    plate: "NV-552-MK",
    model: "Peterbilt 579 Heavy Duty",
    type: "Truck",
    status: "active",
    fuelLevel: 90,
    mileage: 89400,
    health: "Critical", // CRITICAL STATUS WARNING TESTER
    nextService: "2026-07-02"
  },
  {
    id: "V-105",
    plate: "FL-119-ZZ",
    model: "Mercedes-Benz Sprinter",
    type: "Van",
    status: "idle",
    fuelLevel: 65,
    mileage: 43200,
    health: "Excellent",
    nextService: "2026-09-05"
  }
];

export const initialDrivers = [
  {
    id: "D-201",
    name: "Marcus Vance",
    license: "DL-CA92019-A",
    licenseClass: "Class A CDL",
    licenseExpiry: "2028-11-22",
    status: "on duty", // on duty, off duty, break
    rating: 4.85,
    fuelEconomy: 7.2, // MPG
    phone: "+1 (555) 019-2831",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: "D-202",
    name: "Elena Rostova",
    license: "DL-TX88102-A",
    licenseClass: "Class A CDL",
    licenseExpiry: "2026-06-15", // EXPIRED LICENSE TESTER
    status: "off duty",
    rating: 4.92,
    fuelEconomy: 7.8,
    phone: "+1 (555) 014-9982",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: "D-203",
    name: "Sarah Jenkins",
    license: "DL-NY44192-B",
    licenseClass: "Class B CDL",
    licenseExpiry: "2026-08-01", // EXPIRING SOON TESTER
    status: "off duty",
    rating: 4.76,
    fuelEconomy: 6.9,
    phone: "+1 (555) 017-8821",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: "D-204",
    name: "Derrick Cooper",
    license: "DL-NV33091-A",
    licenseClass: "Class A CDL",
    licenseExpiry: "2027-04-10",
    status: "on duty",
    rating: 4.58,
    fuelEconomy: 6.2,
    phone: "+1 (555) 015-3921",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: "D-205",
    name: "Carlos Mendez",
    license: "DL-FL77209-C",
    licenseClass: "Class C CDL",
    licenseExpiry: "2029-01-30",
    status: "break",
    rating: 4.65,
    fuelEconomy: 8.4,
    phone: "+1 (555) 012-7744",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
  }
];

export const initialDispatches = [
  {
    id: "DISP-501",
    vehicleId: "V-101",
    driverId: "D-201",
    route: "Los Angeles Hub ➔ San Francisco Depot",
    status: "in transit", // pending, in transit, completed, delayed
    cargo: "Medical Supplies & General Goods",
    eta: "2026-07-12T16:30:00",
    startedAt: "2026-07-12T07:15:00",
    completedAt: null,
    progress: 65,
    stops: ["Bakersfield Stopover", "Fresno Logistics Hub"]
  },
  {
    id: "DISP-502",
    vehicleId: "V-104",
    driverId: "D-204",
    route: "Las Vegas Hub ➔ Phoenix Depot",
    status: "in transit",
    cargo: "Refrigerated Electronics",
    eta: "2026-07-12T13:45:00",
    startedAt: "2026-07-12T09:30:00",
    completedAt: null,
    progress: 35,
    stops: ["Kingman Service Area"]
  },
  {
    id: "DISP-503",
    vehicleId: "V-105",
    driverId: "D-205",
    route: "Miami Cargo Center ➔ Orlando Hub",
    status: "pending",
    cargo: "E-commerce Express Parcels",
    eta: "2026-07-12T18:00:00",
    startedAt: "2026-07-12T12:00:00",
    completedAt: null,
    progress: 0,
    stops: ["West Palm Beach Sort Center"]
  }
];

export const initialMaintenanceLogs = [
  {
    id: "MNT-901",
    vehicleId: "V-103",
    serviceType: "Engine Diagnostics & Filter Change",
    cost: 1450,
    date: "2026-07-08",
    status: "in progress", // scheduled, in progress, completed
    notes: "Reported loss of engine power under heavy load."
  },
  {
    id: "MNT-902",
    vehicleId: "V-101",
    serviceType: "Front Brake Pad Replacement",
    cost: 680,
    date: "2026-06-20",
    status: "completed",
    notes: "Brakes inspected and pads replaced during safety audit."
  },
  {
    id: "MNT-903",
    vehicleId: "V-102",
    serviceType: "Tire Rotation & Alignment",
    cost: 320,
    date: "2026-07-14",
    status: "scheduled",
    notes: "Standard 60k mile tread wear inspection."
  }
];

export const initialExpenses = [
  {
    id: "EXP-301",
    date: "2026-07-11",
    category: "Fuel", // Fuel, Maintenance, Tolls, Driver Payout, Insurance, Other
    amount: 540,
    vehicleId: "V-101",
    driverId: "D-201",
    notes: "Shell Truck Stop #88 - 120 Gallons Diesel",
    status: "approved" // pending, approved, rejected
  },
  {
    id: "EXP-302",
    date: "2026-07-10",
    category: "Maintenance",
    amount: 1450,
    vehicleId: "V-103",
    driverId: "D-203",
    notes: "Engine Diagnostic service down-payment",
    status: "pending"
  },
  {
    id: "EXP-303",
    date: "2026-07-09",
    category: "Tolls",
    amount: 85,
    vehicleId: "V-104",
    driverId: "D-204",
    notes: "I-15 Express Lanes & Bridge Tolls",
    status: "approved"
  },
  {
    id: "EXP-304",
    date: "2026-07-08",
    category: "Fuel",
    amount: 610,
    vehicleId: "V-104",
    driverId: "D-204",
    notes: "Pilot Travel Center - Fuel Refill",
    status: "approved"
  },
  {
    id: "EXP-305",
    date: "2026-07-07",
    category: "Driver Payout",
    amount: 1200,
    vehicleId: "V-105",
    driverId: "D-205",
    notes: "Weekly driver milestone completion bonus",
    status: "approved"
  }
];
