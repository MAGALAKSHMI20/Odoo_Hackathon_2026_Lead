import React, { useState } from "react";
import { Plus, Search, Trash2, Edit2, AlertCircle, Wrench, ShieldAlert } from "lucide-react";

export default function Vehicles({ vehicles, dispatches, onAddVehicle, onUpdateVehicle, onDeleteVehicle, addToast }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterHealth, setFilterHealth] = useState("all");
  
  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    plate: "",
    model: "",
    type: "Truck",
    status: "idle",
    fuelLevel: 100,
    mileage: 0,
    health: "Excellent",
    nextService: ""
  });

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      id: "V-" + (100 + vehicles.length + 1),
      plate: "",
      model: "",
      type: "Truck",
      status: "idle",
      fuelLevel: 100,
      mileage: 0,
      health: "Excellent",
      nextService: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({ ...vehicle });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.plate.trim()) {
      addToast("License plate is required", "error");
      return;
    }
    if (!formData.model.trim()) {
      addToast("Vehicle model details are required", "error");
      return;
    }
    if (formData.mileage < 0) {
      addToast("Mileage cannot be negative", "error");
      return;
    }
    if (formData.fuelLevel < 0 || formData.fuelLevel > 100) {
      addToast("Fuel level must be between 0% and 100%", "error");
      return;
    }

    // Check plate uniqueness (except for current editing one)
    const plateExists = vehicles.some(v => v.plate.toLowerCase() === formData.plate.toLowerCase() && v.id !== formData.id);
    if (plateExists) {
      addToast(`License plate ${formData.plate} is already registered to another vehicle`, "error");
      return;
    }

    if (editingVehicle) {
      onUpdateVehicle(formData);
      addToast(`Vehicle ${formData.id} successfully updated`, "success");
    } else {
      // Check ID uniqueness
      if (vehicles.some(v => v.id === formData.id)) {
        addToast(`Vehicle ID ${formData.id} already exists`, "error");
        return;
      }
      onAddVehicle(formData);
      addToast(`Vehicle ${formData.id} registered into active fleet`, "success");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    // Check if vehicle has any active dispatches
    const activeDispatch = dispatches.find(d => d.vehicleId === id && (d.status === "in transit" || d.status === "pending"));
    if (activeDispatch) {
      addToast(`Cannot remove vehicle ${id} - it is currently assigned to active dispatch ${activeDispatch.id}`, "error");
      return;
    }

    if (confirm(`Are you sure you want to retire vehicle ${id}?`)) {
      onDeleteVehicle(id);
      addToast(`Vehicle ${id} removed from fleet`, "success");
    }
  };

  // Filter logic
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || v.type === filterType;
    const matchesHealth = filterHealth === "all" || v.health === filterHealth;
    
    return matchesSearch && matchesType && matchesHealth;
  });

  const getHealthBadge = (health) => {
    switch (health) {
      case "Excellent": return <span className="badge badge-success">Excellent</span>;
      case "Needs Service": return <span className="badge badge-warning">Needs Service</span>;
      case "Critical": return <span className="badge badge-critical">Critical</span>;
      default: return <span className="badge badge-info">{health}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active": return <span className="badge badge-info">Active (On Duty)</span>;
      case "idle": return <span className="badge badge-success">Idle (Available)</span>;
      case "in service": return <span className="badge badge-warning">In Service</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="page-title">Fleet Management</h1>
          <p className="page-subtitle">Inspect fleet health, dispatch readiness, and register new vehicles.</p>
        </div>
        <button id="btn-add-vehicle" className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Register Vehicle
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="glass-card filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by ID, Model, Plate..." 
            className="form-control search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <select 
            className="form-control" 
            style={{ width: "150px" }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Truck">Trucks</option>
            <option value="Van">Vans</option>
            <option value="Car">Cars</option>
          </select>

          <select 
            className="form-control" 
            style={{ width: "150px" }}
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value)}
          >
            <option value="all">All Health states</option>
            <option value="Excellent">Excellent</option>
            <option value="Needs Service">Needs Service</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Vehicles Grid list */}
      <div className="card-grid">
        {filteredVehicles.map(v => (
          <div key={v.id} className="glass-card">
            <div style={{ display: "flex", justifyContent: "between", alignItems: "flex-start", width: "100%", justifyContent: "space-between" }}>
              <div>
                <span className="badge badge-info" style={{ fontSize: "10px", padding: "2px 6px" }}>{v.type}</span>
                <h3 style={{ marginTop: "4px", fontSize: "18px" }}>{v.id}</h3>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button className="btn-icon" onClick={() => openEditModal(v)} title="Edit Vehicle">
                  <Edit2 size={14} />
                </button>
                <button className="btn-icon" style={{ color: "var(--status-critical)" }} onClick={() => handleDelete(v.id)} title="Delete Vehicle">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px", minHeight: "36px" }}>{v.model}</p>
            
            <div className="divider"></div>

            <div className="info-row">
              <span className="info-label">License Plate:</span>
              <span className="info-value">{v.plate}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="info-value">{getStatusBadge(v.status)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Health:</span>
              <span className="info-value">{getHealthBadge(v.health)}</span>
            </div>
            
            <div className="divider"></div>

            <div className="info-row">
              <span className="info-label">Fuel Level:</span>
              <span className="info-value" style={{ color: v.fuelLevel < 20 ? "var(--status-critical)" : "inherit" }}>
                {v.fuelLevel}%
              </span>
            </div>
            {v.fuelLevel < 20 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--status-warn)", fontSize: "11px", marginBottom: "8px" }}>
                <AlertCircle size={12} /> Refuel immediately (under 20%)
              </div>
            )}
            
            <div className="info-row">
              <span className="info-label">Mileage:</span>
              <span className="info-value">{v.mileage.toLocaleString()} mi</span>
            </div>
            <div className="info-row">
              <span className="info-label">Next Service:</span>
              <span className="info-value">{v.nextService}</span>
            </div>
          </div>
        ))}
        {filteredVehicles.length === 0 && (
          <div className="glass-card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No vehicles match the selected filters or search query.
          </div>
        )}
      </div>

      {/* Register/Edit Drawer Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>{editingVehicle ? `Edit Vehicle details (${formData.id})` : "Register New Fleet Vehicle"}</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Vehicle ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.id} 
                      disabled={true} // Auto-incremented ID
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License Plate</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CA-992-XP"
                      className="form-control" 
                      value={formData.plate} 
                      onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Model Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Volvo FH16 Semi-Truck"
                    className="form-control" 
                    value={formData.model} 
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Vehicle Type</label>
                    <select 
                      className="form-control" 
                      value={formData.type} 
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                      <option value="Car">Car</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Operational Status</label>
                    <select 
                      className="form-control" 
                      value={formData.status} 
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="idle">Idle (Available)</option>
                      <option value="active">Active (On Duty)</option>
                      <option value="in service">In Service (Maintenance)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fuel Level (%)</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      className="form-control" 
                      value={formData.fuelLevel} 
                      onChange={(e) => setFormData({ ...formData, fuelLevel: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mileage (miles)</label>
                    <input 
                      type="number" 
                      min="0"
                      className="form-control" 
                      value={formData.mileage} 
                      onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Health Assessment</label>
                    <select 
                      className="form-control" 
                      value={formData.health} 
                      onChange={(e) => setFormData({ ...formData, health: e.target.value })}
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Needs Service">Needs Service</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Next Service Audit</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={formData.nextService} 
                      onChange={(e) => setFormData({ ...formData, nextService: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingVehicle ? "Save Details" : "Register Fleet"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
