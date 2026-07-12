import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Truck, 
  Users, 
  Wrench, 
  DollarSign, 
  MapPin, 
  AlertTriangle,
  Play,
  RotateCcw
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function Dashboard({ vehicles, drivers, dispatches, maintenance, expenses }) {
  const [mapDispatches, setMapDispatches] = useState(dispatches);
  const [isSimulating, setIsSimulating] = useState(true);

  // Real-time map movement simulation
  useEffect(() => {
    let interval = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setMapDispatches(prev => 
          prev.map(disp => {
            if (disp.status === "in transit") {
              const step = Math.floor(Math.random() * 4) + 1;
              const nextProgress = disp.progress >= 100 ? 0 : disp.progress + step;
              return { ...disp, progress: Math.min(nextProgress, 100) };
            }
            return disp;
          })
        );
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Aggregate Data
  const activeTripsCount = dispatches.filter(d => d.status === "in transit").length;
  const onDutyDriversCount = drivers.filter(d => d.status === "on duty").length;
  const activeVehiclesCount = vehicles.filter(v => v.status === "active").length;
  const criticalServiceCount = vehicles.filter(v => v.health === "Critical").length;

  const totalExpenseSum = expenses
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);

  // Group Expenses by Category
  const expenseSummary = expenses.reduce((acc, curr) => {
    if (curr.status === "approved") {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    }
    return acc;
  }, {});

  const pieData = Object.keys(expenseSummary).map(category => ({
    name: category,
    value: expenseSummary[category]
  }));

  const COLORS = ["#06b6d4", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280"];

  // Mock Expense Trend (Daily for the last week)
  const expenseTrendData = [
    { name: "Mon", Fuel: 1200, Maintenance: 450, Tolls: 110 },
    { name: "Tue", Fuel: 980, Maintenance: 320, Tolls: 90 },
    { name: "Wed", Fuel: 1400, Maintenance: 900, Tolls: 140 },
    { name: "Thu", Fuel: 1150, Maintenance: 610, Tolls: 95 },
    { name: "Fri", Fuel: 1600, Maintenance: 240, Tolls: 180 },
    { name: "Sat", Fuel: 750, Maintenance: 150, Tolls: 60 },
    { name: "Sun", Fuel: 500, Maintenance: 0, Tolls: 30 }
  ];

  // Fuel Level Analysis
  const fuelLevelsData = vehicles.map(v => ({
    name: v.id,
    "Fuel Level": v.fuelLevel
  }));

  // Route paths in SVG Grid
  // LA to SF: (50, 200) to (80, 50)
  // Vegas to Phoenix: (120, 180) to (180, 240)
  // Miami to Orlando: (380, 260) to (350, 190)
  const getCoordinatesForProgress = (routeId, progress) => {
    const fraction = progress / 100;
    if (routeId === "DISP-501") {
      // LA to SF
      const x = 80 + (180 - 80) * fraction;
      const y = 200 - (200 - 80) * fraction;
      return { x, y };
    } else if (routeId === "DISP-502") {
      // Vegas to Phoenix
      const x = 200 + (280 - 200) * fraction;
      const y = 100 + (170 - 100) * fraction;
      return { x, y };
    } else {
      // Miami to Orlando
      const x = 380 + (430 - 380) * fraction;
      const y = 210 - (210 - 150) * fraction;
      return { x, y };
    }
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="page-title">Operational Insights</h1>
          <p className="page-subtitle">Real-time status updates and fleet-wide cost analyses.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            id="btn-simulate-toggle"
            className={`btn ${isSimulating ? "btn-secondary" : "btn-primary"}`}
            onClick={() => setIsSimulating(!isSimulating)}
          >
            {isSimulating ? "Pause Simulation" : "Start Live Track"}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Trips</span>
            <div className="stat-value">{activeTripsCount}</div>
          </div>
          <div className="stat-icon cyan">
            <Truck size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <span className="stat-label">Drivers On Duty</span>
            <div className="stat-value">{onDutyDriversCount}</div>
          </div>
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Vehicles</span>
            <div className="stat-value">{activeVehiclesCount}</div>
          </div>
          <div className="stat-icon green">
            <Truck size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <span className="stat-label">Critical Alerts</span>
            <div className="stat-value" style={{ color: criticalServiceCount > 0 ? "var(--status-critical)" : "inherit" }}>
              {criticalServiceCount}
            </div>
          </div>
          <div className="stat-icon red">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Expense</span>
            <div className="stat-value">${totalExpenseSum.toLocaleString()}</div>
          </div>
          <div className="stat-icon cyan" style={{ color: "var(--status-ok)" }}>
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Interactive Map Visual */}
      <div className="glass-card" style={{ marginBottom: "30px" }}>
        <div className="chart-title">
          <MapPin size={18} className="text-cyan" />
          Live Operations Network
        </div>
        <div className="map-container">
          <div className="live-badge">
            <span className="live-dot"></span>
            LIVE NETWORK SIMULATION
          </div>
          
          <svg viewBox="0 0 500 280" style={{ width: "100%", height: "100%", background: "#090d16" }}>
            {/* Grid background lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Network Connections / Routes */}
            {/* Route 1: LA to SF */}
            <line x1="80" y1="200" x2="180" y2="80" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="4" strokeDasharray="5,5" />
            
            {/* Route 2: Vegas to Phoenix */}
            <line x1="200" y1="100" x2="280" y2="170" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="4" strokeDasharray="5,5" />
            
            {/* Route 3: Miami to Orlando */}
            <line x1="380" y1="210" x2="430" y2="150" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="4" strokeDasharray="5,5" />

            {/* Depots / Nodes */}
            <circle cx="80" cy="200" r="8" fill="var(--brand-cyan)" />
            <text x="60" y="220" fill="var(--text-secondary)" fontSize="10" fontWeight="bold">San Francisco</text>

            <circle cx="180" cy="80" r="8" fill="var(--brand-cyan)" />
            <text x="165" y="70" fill="var(--text-secondary)" fontSize="10" fontWeight="bold">Los Angeles Hub</text>

            <circle cx="200" cy="100" r="8" fill="var(--brand-blue)" />
            <text x="180" y="120" fill="var(--text-secondary)" fontSize="10" fontWeight="bold">Las Vegas</text>

            <circle cx="280" cy="170" r="8" fill="var(--brand-blue)" />
            <text x="270" y="190" fill="var(--text-secondary)" fontSize="10" fontWeight="bold">Phoenix Hub</text>

            <circle cx="380" cy="210" r="8" fill="var(--status-ok)" />
            <text x="360" y="230" fill="var(--text-secondary)" fontSize="10" fontWeight="bold">Miami Port</text>

            <circle cx="430" cy="150" r="8" fill="var(--status-ok)" />
            <text x="415" y="140" fill="var(--text-secondary)" fontSize="10" fontWeight="bold">Orlando Hub</text>

            {/* Vehicles on routes */}
            {mapDispatches.map(disp => {
              if (disp.status !== "in transit") return null;
              const coords = getCoordinatesForProgress(disp.id, disp.progress);
              return (
                <g key={disp.id}>
                  {/* Glowing marker indicator */}
                  <circle cx={coords.x} cy={coords.y} r="14" fill="rgba(6, 182, 212, 0.2)" />
                  <circle cx={coords.x} cy={coords.y} r="6" fill="var(--brand-cyan)" stroke="#fff" strokeWidth="2" />
                  {/* Vehicle tag */}
                  <rect x={coords.x - 30} y={coords.y - 28} width="60" height="15" rx="3" fill="var(--bg-base)" stroke="var(--border-light)" strokeWidth="1" />
                  <text x={coords.x} y={coords.y - 18} fill="#fff" fontSize="8" fontWeight="600" textAnchor="middle">
                    {disp.vehicleId} ({disp.progress}%)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Recharts Graphical Dashboards */}
      <div className="charts-grid">
        <div className="glass-card chart-card">
          <div className="chart-title">
            <TrendingUp size={18} className="text-cyan" />
            Weekly Fleet Expenses (by Category)
          </div>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expenseTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-cyan)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand-cyan)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMnt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-blue)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-light)" }}
                  labelStyle={{ color: "var(--text-primary)" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
                <Area type="monotone" dataKey="Fuel" stroke="var(--brand-cyan)" fillOpacity={1} fill="url(#colorFuel)" strokeWidth={2} />
                <Area type="monotone" dataKey="Maintenance" stroke="var(--brand-blue)" fillOpacity={1} fill="url(#colorMnt)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card chart-card">
          <div className="chart-title">
            <DollarSign size={18} className="text-cyan" />
            Approved Expenses Shares
          </div>
          <div style={{ width: "100%", height: "240px", display: "flex", justifyContent: "center" }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-light)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: "14px" }}>
                No Approved Expenses Found
              </div>
            )}
          </div>
          {/* Legend for Pie Chart */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginTop: "10px" }}>
            {pieData.map((data, index) => (
              <div key={data.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span>{data.name}: ${data.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fuel Level Monitor */}
      <div className="glass-card">
        <div className="chart-title">
          <Truck size={18} className="text-cyan" />
          Active Fleet Fuel Levels
        </div>
        <div style={{ width: "100%", height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fuelLevelsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-light)" }}
                labelStyle={{ color: "var(--text-primary)" }}
              />
              <Bar dataKey="Fuel Level" radius={[4, 4, 0, 0]}>
                {fuelLevelsData.map((entry, index) => {
                  const val = entry["Fuel Level"];
                  const color = val < 20 ? "var(--status-critical)" : val < 40 ? "var(--status-warn)" : "var(--brand-cyan)";
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
