import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Truck, 
  Users, 
  Compass, 
  Wrench, 
  CreditCard,
  Bell,
  Sun,
  Moon,
  Info
} from "lucide-react";

// Components
import Dashboard from "./components/Dashboard";
import Vehicles from "./components/Vehicles";
import Drivers from "./components/Drivers";
import Dispatch from "./components/Dispatch";
import Maintenance from "./components/Maintenance";
import Expenses from "./components/Expenses";

// Seed Data
import {
  initialVehicles,
  initialDrivers,
  initialDispatches,
  initialMaintenanceLogs,
  initialExpenses
} from "./utils/mockData";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // App Global State
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [dispatches, setDispatches] = useState(initialDispatches);
  const [maintenance, setMaintenance] = useState(initialMaintenanceLogs);
  const [expenses, setExpenses] = useState(initialExpenses);
  
  // Toasts Alert State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // --- WORKFLOW MUTATIONS ---

  // 1. VEHICLE MUTATIONS
  const handleAddVehicle = (newVehicle) => {
    setVehicles(prev => [...prev, newVehicle]);
  };

  const handleUpdateVehicle = (updatedVehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  const handleDeleteVehicle = (id) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // 2. DRIVER MUTATIONS
  const handleAddDriver = (newDriver) => {
    setDrivers(prev => [...prev, newDriver]);
  };

  const handleUpdateDriver = (updatedDriver) => {
    setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
  };

  const handleDeleteDriver = (id) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  // 3. DISPATCH MUTATIONS
  const handleAddDispatch = (newDisp) => {
    setDispatches(prev => [...prev, newDisp]);
    
    // Automatically set driver status to "on duty" and vehicle to "active"
    // when a dispatch is initialized
    setDrivers(prev => prev.map(d => d.id === newDisp.driverId ? { ...d, status: "on duty" } : d));
    setVehicles(prev => prev.map(v => v.id === newDisp.vehicleId ? { ...v, status: "active" } : v));
  };

  const handleUpdateDispatchStatus = (id, newStatus) => {
    setDispatches(prev => prev.map(disp => {
      if (disp.id !== id) return disp;
      
      const updatedDisp = { ...disp, status: newStatus };
      
      if (newStatus === "in transit") {
        updatedDisp.startedAt = new Date().toISOString();
        updatedDisp.progress = 5;
      }
      
      if (newStatus === "completed") {
        updatedDisp.completedAt = new Date().toISOString();
        updatedDisp.progress = 100;
        
        // Return Driver and Vehicle to idle/off-duty statuses
        setDrivers(drvPrev => drvPrev.map(d => d.id === disp.driverId ? { ...d, status: "off duty" } : d));
        setVehicles(vhPrev => vhPrev.map(v => {
          if (v.id === disp.vehicleId) {
            // Simulate wear & tear: drop fuel by 20%, add mileage
            const nextFuel = Math.max(v.fuelLevel - 20, 5);
            const nextMileage = v.mileage + 320;
            // Overdue maintenance auto-check
            const nextHealth = nextFuel < 15 ? "Needs Service" : v.health;
            
            return {
              ...v,
              status: "idle",
              fuelLevel: nextFuel,
              mileage: nextMileage,
              health: nextHealth
            };
          }
          return v;
        }));
        
        addToast(`Driver and Vehicle released back to operational pool.`, "success");
      }
      
      return updatedDisp;
    }));
  };

  // 4. MAINTENANCE MUTATIONS
  const handleAddMaintenanceTicket = (newTicket) => {
    setMaintenance(prev => [...prev, newTicket]);
  };

  const handleUpdateMaintenanceStatus = (ticketId, nextStatus, actualCost = 0) => {
    setMaintenance(prev => prev.map(ticket => {
      if (ticket.id !== ticketId) return ticket;
      
      // Update vehicle status based on maintenance flow
      if (nextStatus === "in progress") {
        setVehicles(vhPrev => vhPrev.map(v => v.id === ticket.vehicleId ? { ...v, status: "in service" } : v));
      }
      
      if (nextStatus === "completed") {
        setVehicles(vhPrev => vhPrev.map(v => {
          if (v.id === ticket.vehicleId) {
            // Restore health back to Excellent, set status to idle
            const nextServiceDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            return {
              ...v,
              status: "idle",
              health: "Excellent",
              fuelLevel: 100, // Top up fuel at service
              nextService: nextServiceDate
            };
          }
          return v;
        }));

        // Automatically log this completed maintenance ticket under Expenses
        const autoExpense = {
          id: "EXP-" + (300 + expenses.length + Math.floor(Math.random() * 1000) + 1),
          date: new Date().toISOString().split("T")[0],
          category: "Maintenance",
          amount: actualCost || ticket.cost,
          vehicleId: ticket.vehicleId,
          driverId: "D-203", // Logged to chief mechanic driver
          notes: `Completed Service Ticket ${ticketId}: ${ticket.serviceType}`,
          status: "approved" // Pre-approved mechanical invoice
        };
        setExpenses(expPrev => [...expPrev, autoExpense]);
      }
      
      return { 
        ...ticket, 
        status: nextStatus,
        cost: nextStatus === "completed" ? actualCost : ticket.cost
      };
    }));
  };

  // 5. EXPENSE MUTATIONS
  const handleAddExpense = (newExpense) => {
    setExpenses(prev => [...prev, newExpense]);
  };

  const handleApproveExpense = (id) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: "approved" } : e));
    addToast(`Expense ${id} has been approved. Charts updated.`, "success");
  };

  const handleRejectExpense = (id) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: "rejected" } : e));
    addToast(`Expense ${id} has been rejected.`, "info");
  };

  // Navigation Renderer
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard 
          vehicles={vehicles} 
          drivers={drivers} 
          dispatches={dispatches} 
          maintenance={maintenance} 
          expenses={expenses} 
        />;
      case "fleet":
        return <Vehicles 
          vehicles={vehicles} 
          dispatches={dispatches}
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          addToast={addToast}
        />;
      case "drivers":
        return <Drivers 
          drivers={drivers} 
          dispatches={dispatches}
          onAddDriver={handleAddDriver}
          onUpdateDriver={handleUpdateDriver}
          onDeleteDriver={handleDeleteDriver}
          addToast={addToast}
        />;
      case "dispatch":
        return <Dispatch 
          dispatches={dispatches} 
          vehicles={vehicles} 
          drivers={drivers} 
          onAddDispatch={handleAddDispatch}
          onUpdateDispatchStatus={handleUpdateDispatchStatus}
          addToast={addToast}
        />;
      case "maintenance":
        return <Maintenance 
          maintenance={maintenance} 
          vehicles={vehicles} 
          onAddMaintenanceTicket={handleAddMaintenanceTicket}
          onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
          addToast={addToast}
        />;
      case "expenses":
        return <Expenses 
          expenses={expenses} 
          vehicles={vehicles} 
          drivers={drivers} 
          onAddExpense={handleAddExpense}
          onApproveExpense={handleApproveExpense}
          onRejectExpense={handleRejectExpense}
          addToast={addToast}
        />;
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Toast Overlay notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <Info size={18} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: "13px" }}>{toast.message}</div>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Truck size={24} style={{ color: "var(--brand-cyan)", filter: "drop-shadow(0 0 8px var(--brand-cyan))" }} />
          <span className="sidebar-logo-text">TransitOps</span>
        </div>
        
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <button 
              id="nav-dashboard"
              className={`sidebar-link ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart3 size={18} />
              Insights Dashboard
            </button>
          </li>
          <li className="sidebar-item">
            <button 
              id="nav-fleet"
              className={`sidebar-link ${activeTab === "fleet" ? "active" : ""}`}
              onClick={() => setActiveTab("fleet")}
            >
              <Truck size={18} />
              Fleet Vehicles
            </button>
          </li>
          <li className="sidebar-item">
            <button 
              id="nav-drivers"
              className={`sidebar-link ${activeTab === "drivers" ? "active" : ""}`}
              onClick={() => setActiveTab("drivers")}
            >
              <Users size={18} />
              Driver Registry
            </button>
          </li>
          <li className="sidebar-item">
            <button 
              id="nav-dispatch"
              className={`sidebar-link ${activeTab === "dispatch" ? "active" : ""}`}
              onClick={() => setActiveTab("dispatch")}
            >
              <Compass size={18} />
              Dispatch Center
            </button>
          </li>
          <li className="sidebar-item">
            <button 
              id="nav-maintenance"
              className={`sidebar-link ${activeTab === "maintenance" ? "active" : ""}`}
              onClick={() => setActiveTab("maintenance")}
            >
              <Wrench size={18} />
              Repair Workshop
            </button>
          </li>
          <li className="sidebar-item">
            <button 
              id="nav-expenses"
              className={`sidebar-link ${activeTab === "expenses" ? "active" : ""}`}
              onClick={() => setActiveTab("expenses")}
            >
              <CreditCard size={18} />
              Expense Audits
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--status-ok)", display: "inline-block" }}></span>
            <span style={{ color: "var(--text-primary)" }}>Compliance Core v2.0</span>
          </div>
          <span>System Date: 2026-07-12</span>
        </div>
      </aside>

      {/* Main Panel Content Router */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
