import React, { useState } from "react";
import { Plus, Clock, Play, CheckCircle, AlertTriangle, AlertCircle, Calendar } from "lucide-react";

export default function Dispatch({ 
  dispatches, 
  vehicles, 
  drivers, 
  onAddDispatch, 
  onUpdateDispatchStatus, 
  addToast 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    route: "",
    cargo: "",
    eta: "",
    stops: ""
  });

  const CURRENT_DATE_STRING = "2026-07-12";

  // Check driver license status
  const getLicenseStatus = (expiryDate) => {
    const today = new Date(CURRENT_DATE_STRING);
    const expiry = new Date(expiryDate);
    return expiry < today ? "Expired" : "Valid";
  };

  const handleOpenModal = () => {
    // Filter out active options to set defaults
    const availableVehicles = vehicles.filter(v => v.status === "idle");
    const availableDrivers = drivers.filter(d => d.status === "off duty" || d.status === "break");
    
    setFormData({
      vehicleId: availableVehicles[0]?.id || "",
      driverId: availableDrivers[0]?.id || "",
      route: "",
      cargo: "",
      eta: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16), // 8 hours in future
      stops: ""
    });
    setIsModalOpen(true);
  };

  const handleDispatchSubmit = (e) => {
    e.preventDefault();

    const { vehicleId, driverId, route, cargo, eta, stops } = formData;

    if (!vehicleId) {
      addToast("Please select a vehicle", "error");
      return;
    }
    if (!driverId) {
      addToast("Please select a driver", "error");
      return;
    }
    if (!route.trim()) {
      addToast("Please input a dispatch route", "error");
      return;
    }
    if (!cargo.trim()) {
      addToast("Cargo description is required", "error");
      return;
    }

    // Load actual instances to enforce business rules
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const driver = drivers.find(d => d.id === driverId);

    if (!vehicle || !driver) {
      addToast("Invalid Vehicle or Driver selection", "error");
      return;
    }

    // BUSINESS RULE 1: Driver License check
    if (getLicenseStatus(driver.licenseExpiry) === "Expired") {
      addToast(`Dispatch Blocked: Driver ${driver.name}'s license is EXPIRED (${driver.licenseExpiry}).`, "error");
      return;
    }

    // BUSINESS RULE 2: Driver status check
    if (driver.status === "on duty") {
      addToast(`Dispatch Blocked: Driver ${driver.name} is already assigned on active duty.`, "error");
      return;
    }

    // BUSINESS RULE 3: Vehicle status check
    if (vehicle.status === "in service") {
      addToast(`Dispatch Blocked: Vehicle ${vehicle.id} is in maintenance status.`, "error");
      return;
    }

    // BUSINESS RULE 4: Vehicle Health check
    if (vehicle.health === "Critical") {
      addToast(`Dispatch Blocked: Vehicle ${vehicle.id} has CRITICAL health alerts.`, "error");
      return;
    }

    // BUSINESS RULE 5: Vehicle Fuel warning
    if (vehicle.fuelLevel < 15) {
      addToast(`Warning: Vehicle ${vehicle.id} has low fuel (${vehicle.fuelLevel}%). Plan refuel route.`, "warning");
    }

    // Setup new dispatch object
    const newDispatch = {
      id: "DISP-" + (500 + dispatches.length + 1),
      vehicleId,
      driverId,
      route,
      cargo,
      eta,
      startedAt: new Date().toISOString(),
      completedAt: null,
      status: "pending",
      progress: 0,
      stops: stops ? stops.split(",").map(s => s.trim()) : []
    };

    onAddDispatch(newDispatch);
    addToast(`Dispatch ${newDispatch.id} successfully generated and queued`, "success");
    setIsModalOpen(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="text-info" size={16} />;
      case "in transit": return <Play className="text-warning" size={16} />;
      case "completed": return <CheckCircle className="text-success" size={16} />;
      default: return null;
    }
  };

  // Group dispatches for Kanban Columns
  const pendingDispatches = dispatches.filter(d => d.status === "pending");
  const activeDispatches = dispatches.filter(d => d.status === "in transit");
  const completedDispatches = dispatches.filter(d => d.status === "completed" || d.status === "delayed");

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="page-title">Dispatch Center</h1>
          <p className="page-subtitle">Schedule, assign, and track transit routes while enforcing compliance checks.</p>
        </div>
        <button id="btn-add-dispatch" className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} />
          Create Dispatch
        </button>
      </div>

      {/* Compliance / Rules Overview Indicator banner */}
      <div className="glass-card" style={{ display: "flex", gap: "16px", padding: "16px", marginBottom: "24px", background: "rgba(99, 102, 241, 0.05)", borderColor: "rgba(99, 102, 241, 0.2)" }}>
        <AlertCircle className="text-info" size={24} style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ color: "#fff", fontSize: "14px", fontWeight: "600" }}>Platform Compliance Engine Enforced</h4>
          <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "4px" }}>
            The engine prevents scheduling dispatches using: Expired CDL licenses, Vehicles with critical health alerts, or vehicles currently checked into maintenance. Warns if fuel levels are under 15%.
          </p>
        </div>
      </div>

      {/* Kanban Dispatch Board */}
      <div className="dispatch-board">
        {/* Pending / Scheduled Column */}
        <div className="dispatch-col">
          <div className="col-header pending">
            <span>Pending / Scheduled ({pendingDispatches.length})</span>
            <Clock size={16} />
          </div>
          {pendingDispatches.map(disp => {
            const d = drivers.find(drv => drv.id === disp.driverId);
            const v = vehicles.find(vh => vh.id === disp.vehicleId);
            return (
              <div key={disp.id} className="dispatch-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--brand-cyan)" }}>{disp.id}</span>
                  <span className="badge badge-info">Pending</span>
                </div>
                
                <h4 style={{ fontSize: "14px", margin: "10px 0 6px" }}>{disp.route}</h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>Cargo: {disp.cargo}</p>
                
                <div className="divider" style={{ margin: "10px 0" }}></div>

                <div className="info-row" style={{ fontSize: "12px", marginBottom: "6px" }}>
                  <span className="info-label">Driver:</span>
                  <span className="info-value">{d?.name || disp.driverId}</span>
                </div>
                <div className="info-row" style={{ fontSize: "12px", marginBottom: "6px" }}>
                  <span className="info-label">Vehicle:</span>
                  <span className="info-value">{v?.model.split(" ")[0] || disp.vehicleId}</span>
                </div>
                <div className="info-row" style={{ fontSize: "12px", marginBottom: "12px" }}>
                  <span className="info-label">ETA:</span>
                  <span className="info-value">{disp.eta.replace("T", " ")}</span>
                </div>

                <button 
                  id={`btn-start-${disp.id}`}
                  className="btn btn-primary" 
                  style={{ width: "100%", padding: "8px", fontSize: "12px", justifyContent: "center" }}
                  onClick={() => onUpdateDispatchStatus(disp.id, "in transit")}
                >
                  <Play size={12} /> Start Route
                </button>
              </div>
            );
          })}
          {pendingDispatches.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", border: "1px dashed var(--border-light)", borderRadius: "8px", fontSize: "12px" }}>
              No pending departures.
            </div>
          )}
        </div>

        {/* In Transit Column */}
        <div className="dispatch-col">
          <div className="col-header transit">
            <span>In Transit ({activeDispatches.length})</span>
            <Play size={16} />
          </div>
          {activeDispatches.map(disp => {
            const d = drivers.find(drv => drv.id === disp.driverId);
            const v = vehicles.find(vh => vh.id === disp.vehicleId);
            return (
              <div key={disp.id} className="dispatch-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--brand-blue)" }}>{disp.id}</span>
                  <span className="badge badge-warning">Active</span>
                </div>
                
                <h4 style={{ fontSize: "14px", margin: "10px 0 6px" }}>{disp.route}</h4>
                
                {/* Progress bar */}
                <div className="dispatch-progress">
                  <div className="dispatch-progress-bar" style={{ width: `${disp.progress}%` }}></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                  <span>Progress: {disp.progress}%</span>
                  <span>Speed: Simulated</span>
                </div>

                <div className="divider" style={{ margin: "10px 0" }}></div>

                <div className="info-row" style={{ fontSize: "12px", marginBottom: "6px" }}>
                  <span className="info-label">Driver:</span>
                  <span className="info-value">{d?.name || disp.driverId}</span>
                </div>
                <div className="info-row" style={{ fontSize: "12px", marginBottom: "6px" }}>
                  <span className="info-label">Vehicle:</span>
                  <span className="info-value">{v?.id} ({v?.plate})</span>
                </div>
                
                {disp.stops.length > 0 && (
                  <div style={{ marginTop: "8px", padding: "6px", background: "rgba(0,0,0,0.15)", borderRadius: "4px" }}>
                    <span style={{ fontSize: "9px", display: "block", textTransform: "uppercase", color: "var(--text-muted)" }}>Stops</span>
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{disp.stops.join(" ➔ ")}</span>
                  </div>
                )}

                <button 
                  id={`btn-complete-${disp.id}`}
                  className="btn btn-secondary" 
                  style={{ width: "100%", padding: "8px", fontSize: "12px", justifyContent: "center", border: "1px solid rgba(16, 185, 129, 0.3)", color: "var(--status-ok)", marginTop: "12px" }}
                  onClick={() => onUpdateDispatchStatus(disp.id, "completed")}
                >
                  <CheckCircle size={12} /> Log Delivery Complete
                </button>
              </div>
            );
          })}
          {activeDispatches.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", border: "1px dashed var(--border-light)", borderRadius: "8px", fontSize: "12px" }}>
              No vehicles currently in transit.
            </div>
          )}
        </div>

        {/* Completed / History Column */}
        <div className="dispatch-col">
          <div className="col-header completed">
            <span>Completed Delivery ({completedDispatches.length})</span>
            <CheckCircle size={16} />
          </div>
          {completedDispatches.map(disp => {
            const d = drivers.find(drv => drv.id === disp.driverId);
            const v = vehicles.find(vh => vh.id === disp.vehicleId);
            return (
              <div key={disp.id} className="dispatch-card" style={{ opacity: 0.8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)" }}>{disp.id}</span>
                  <span className="badge badge-success">Completed</span>
                </div>
                
                <h4 style={{ fontSize: "14px", margin: "10px 0 6px", textDecoration: "none" }}>{disp.route}</h4>
                
                <div className="divider" style={{ margin: "10px 0" }}></div>

                <div className="info-row" style={{ fontSize: "12px", marginBottom: "6px" }}>
                  <span className="info-label">Driver:</span>
                  <span className="info-value">{d?.name || disp.driverId}</span>
                </div>
                <div className="info-row" style={{ fontSize: "12px", marginBottom: "6px" }}>
                  <span className="info-label">Vehicle:</span>
                  <span className="info-value">{disp.vehicleId}</span>
                </div>
                <div className="info-row" style={{ fontSize: "12px" }}>
                  <span className="info-label">Completed:</span>
                  <span className="info-value">{disp.completedAt ? disp.completedAt.replace("T", " ").slice(0, 16) : "12:00"}</span>
                </div>
              </div>
            );
          })}
          {completedDispatches.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", border: "1px dashed var(--border-light)", borderRadius: "8px", fontSize: "12px" }}>
              No completed logs for current schedule.
            </div>
          )}
        </div>
      </div>

      {/* New Dispatch Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Create Fleet Dispatch</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleDispatchSubmit}>
              <div className="modal-body">
                
                <div className="form-group">
                  <label className="form-label">Select Available Vehicle</label>
                  <select 
                    className="form-control"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.id} - {v.model} ({v.status}) [Fuel: {v.fuelLevel}%] {v.health !== "Excellent" ? `[Health: ${v.health}]` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Available Driver</label>
                  <select 
                    className="form-control"
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  >
                    <option value="">-- Choose Driver --</option>
                    {drivers.map(d => {
                      const expired = getLicenseStatus(d.licenseExpiry) === "Expired";
                      return (
                        <option key={d.id} value={d.id} disabled={expired}>
                          {d.name} ({d.status}) {expired ? "[EXPIRED CDL]" : `[Exp: ${d.licenseExpiry}]`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Route Path</label>
                  <input 
                    type="text" 
                    placeholder="e.g. San Francisco Depot ➔ Los Angeles Hub"
                    className="form-control"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Intermediate Stops (comma-separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Fresno Center, Bakersfield Rest Area"
                    className="form-control"
                    value={formData.stops}
                    onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Cargo Details</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Industrial Electronics"
                      className="form-control"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Delivery Time (ETA)</label>
                    <input 
                      type="datetime-local" 
                      className="form-control"
                      value={formData.eta}
                      onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                    />
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
