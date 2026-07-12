import React, { useState } from "react";
import { Plus, Search, Trash2, Edit2, ShieldAlert, Award, Star, Phone } from "lucide-react";

export default function Drivers({ drivers, dispatches, onAddDriver, onUpdateDriver, onDeleteDriver, addToast }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLicenseStatus, setFilterLicenseStatus] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    license: "",
    licenseClass: "Class A CDL",
    licenseExpiry: "",
    status: "off duty",
    rating: 5.0,
    fuelEconomy: 7.0,
    phone: "",
    avatar: ""
  });

  const CURRENT_DATE_STRING = "2026-07-12"; // Set by system context

  const getLicenseStatus = (expiryDate) => {
    const today = new Date(CURRENT_DATE_STRING);
    const expiry = new Date(expiryDate);
    
    if (expiry < today) {
      return "Expired";
    }
    
    // Check if expiring within 30 days
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) {
      return "Expiring Soon";
    }
    
    return "Valid";
  };

  const openAddModal = () => {
    setEditingDriver(null);
    setFormData({
      id: "D-" + (200 + drivers.length + 1),
      name: "",
      license: "",
      licenseClass: "Class A CDL",
      licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "off duty",
      rating: 5.0,
      fuelEconomy: 7.0,
      phone: "",
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*1000000)}?auto=format&fit=crop&q=80&w=100`
    });
    setIsModalOpen(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setFormData({ ...driver });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast("Driver name is required", "error");
      return;
    }
    if (!formData.license.trim()) {
      addToast("License number is required", "error");
      return;
    }
    if (!formData.phone.trim()) {
      addToast("Contact phone number is required", "error");
      return;
    }

    if (editingDriver) {
      onUpdateDriver(formData);
      addToast(`Driver ${formData.name} updated successfully`, "success");
    } else {
      if (drivers.some(d => d.id === formData.id)) {
        addToast(`Driver ID ${formData.id} already exists`, "error");
        return;
      }
      onAddDriver(formData);
      addToast(`Driver ${formData.name} onboarded successfully`, "success");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    // Check active dispatches
    const activeDispatch = dispatches.find(d => d.driverId === id && (d.status === "in transit" || d.status === "pending"));
    if (activeDispatch) {
      addToast(`Cannot offboard driver ${name} - currently assigned to active trip ${activeDispatch.id}`, "error");
      return;
    }

    if (confirm(`Are you sure you want to offboard driver ${name}?`)) {
      onDeleteDriver(id);
      addToast(`Driver ${name} has been removed from active staff`, "success");
    }
  };

  // Filters logic
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.license.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    
    const licStatus = getLicenseStatus(d.licenseExpiry);
    const matchesLicense = filterLicenseStatus === "all" || 
                          (filterLicenseStatus === "Expired" && licStatus === "Expired") ||
                          (filterLicenseStatus === "Expiring Soon" && licStatus === "Expiring Soon") ||
                          (filterLicenseStatus === "Valid" && licStatus === "Valid");

    return matchesSearch && matchesStatus && matchesLicense;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "on duty": return <span className="badge badge-success">On Duty</span>;
      case "off duty": return <span className="badge badge-info">Off Duty</span>;
      case "break": return <span className="badge badge-warning">On Break</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="page-title">Driver Registry</h1>
          <p className="page-subtitle">Manage driver shift duty, efficiency parameters, and CDL license compliance audits.</p>
        </div>
        <button id="btn-add-driver" className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Onboard Driver
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="glass-card filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Name, CDL, ID..." 
            className="form-control search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <select 
            className="form-control" 
            style={{ width: "150px" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Duty States</option>
            <option value="on duty">On Duty</option>
            <option value="off duty">Off Duty</option>
            <option value="break">On Break</option>
          </select>

          <select 
            className="form-control" 
            style={{ width: "180px" }}
            value={filterLicenseStatus}
            onChange={(e) => setFilterLicenseStatus(e.target.value)}
          >
            <option value="all">All License States</option>
            <option value="Valid">Valid License</option>
            <option value="Expiring Soon">Expiring Soon (&lt;30 days)</option>
            <option value="Expired">Expired CDL</option>
          </select>
        </div>
      </div>

      {/* Drivers Catalog Grid */}
      <div className="card-grid">
        {filteredDrivers.map(d => {
          const licStatus = getLicenseStatus(d.licenseExpiry);
          return (
            <div key={d.id} className="glass-card">
              <div style={{ display: "flex", justify: "between", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img 
                    src={d.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} 
                    alt={d.name} 
                    style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-light)" }} 
                  />
                  <div>
                    <h3 style={{ fontSize: "16px" }}>{d.name}</h3>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>ID: {d.id}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="btn-icon" onClick={() => openEditModal(d)} title="Edit Driver Details">
                    <Edit2 size={14} />
                  </button>
                  <button className="btn-icon" style={{ color: "var(--status-critical)" }} onClick={() => handleDelete(d.id, d.name)} title="Remove Driver">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="divider"></div>

              <div className="info-row">
                <span className="info-label">Duty Status:</span>
                <span className="info-value">{getStatusBadge(d.status)}</span>
              </div>

              <div className="info-row">
                <span className="info-label">CDL License:</span>
                <span className="info-value">{d.license} ({d.licenseClass})</span>
              </div>

              <div className="info-row">
                <span className="info-label">License Expiry:</span>
                <span className="info-value" style={{ 
                  color: licStatus === "Expired" ? "var(--status-critical)" : licStatus === "Expiring Soon" ? "var(--status-warn)" : "inherit",
                  fontWeight: licStatus !== "Valid" ? "600" : "500"
                }}>
                  {d.licenseExpiry}
                </span>
              </div>

              {/* License Warning Notification */}
              {licStatus === "Expired" && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--status-critical)", background: "rgba(239,68,68,0.1)", padding: "6px 10px", borderRadius: "4px", fontSize: "11px", marginBottom: "8px" }}>
                  <ShieldAlert size={12} /> LICENSE EXPIRED - Block dispatching
                </div>
              )}
              {licStatus === "Expiring Soon" && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--status-warn)", background: "rgba(245,158,11,0.1)", padding: "6px 10px", borderRadius: "4px", fontSize: "11px", marginBottom: "8px" }}>
                  <ShieldAlert size={12} /> CDL renewal due within 30 days
                </div>
              )}

              <div className="divider"></div>

              {/* Driver metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "rgba(0,0,0,0.15)", padding: "10px", borderRadius: "6px" }}>
                <div>
                  <span style={{ display: "block", color: "var(--text-secondary)", fontSize: "10px", textTransform: "uppercase" }}>Safety Rating</span>
                  <span style={{ fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", color: "var(--status-warn)", marginTop: "2px" }}>
                    <Star size={14} fill="var(--status-warn)" /> {d.rating.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span style={{ display: "block", color: "var(--text-secondary)", fontSize: "10px", textTransform: "uppercase" }}>Fuel Efficiency</span>
                  <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--brand-cyan)", marginTop: "2px", display: "block" }}>
                    {d.fuelEconomy.toFixed(1)} MPG
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "14px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <Phone size={12} /> {d.phone}
              </div>
            </div>
          );
        })}
        {filteredDrivers.length === 0 && (
          <div className="glass-card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No drivers match the selected filters or search queries.
          </div>
        )}
      </div>

      {/* Onboard/Edit Driver Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>{editingDriver ? `Edit Driver (${formData.id})` : "Onboard Fleet Driver"}</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Driver ID</label>
                    <input type="text" className="form-control" value={formData.id} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Elena Rostova"
                      className="form-control" 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">License Number (CDL)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. DL-TX88102-A"
                      className="form-control" 
                      value={formData.license} 
                      onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License Class</label>
                    <select 
                      className="form-control" 
                      value={formData.licenseClass} 
                      onChange={(e) => setFormData({ ...formData, licenseClass: e.target.value })}
                    >
                      <option value="Class A CDL">Class A CDL (Heavy Combinations)</option>
                      <option value="Class B CDL">Class B CDL (Single / Heavy Truck)</option>
                      <option value="Class C CDL">Class C CDL (Standard Commercial)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">License Expiry Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={formData.licenseExpiry} 
                      onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duty Status</label>
                    <select 
                      className="form-control" 
                      value={formData.status} 
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="off duty">Off Duty</option>
                      <option value="on duty">On Duty</option>
                      <option value="break">On Break</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +1 (555) 014-9982"
                      className="form-control" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Safety Rating (1.0 - 5.0)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="1.0"
                      max="5.0"
                      className="form-control" 
                      value={formData.rating} 
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingDriver ? "Save Changes" : "Onboard Driver"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
