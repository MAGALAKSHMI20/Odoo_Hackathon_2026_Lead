import React, { useState } from "react";
import { Plus, DollarSign, Search, Check, X, FileText, Camera } from "lucide-react";

export default function Expenses({ 
  expenses, 
  vehicles, 
  drivers, 
  onAddExpense, 
  onApproveExpense, 
  onRejectExpense, 
  addToast 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    category: "Fuel",
    amount: 0,
    notes: "",
    date: new Date().toISOString().split("T")[0]
  });

  const handleOpenModal = () => {
    setFormData({
      vehicleId: vehicles[0]?.id || "",
      driverId: drivers[0]?.id || "",
      category: "Fuel",
      amount: 150,
      notes: "",
      date: new Date().toISOString().split("T")[0]
    });
    setIsModalOpen(true);
  };

  const handleScanSimulation = () => {
    setIsScanning(true);
    addToast("Initializing digital scanner...", "info");
    
    // Simulate reading details from an invoice / receipt after 2.5 seconds
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        amount: Math.floor(Math.random() * 400) + 120,
        notes: "Auto-Scanned: Pilot Refuel Receipt #8892"
      }));
      setIsScanning(false);
      addToast("Receipt data scanned successfully!", "success");
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { vehicleId, driverId, category, amount, notes, date } = formData;

    if (amount <= 0) {
      addToast("Expense amount must be greater than zero", "error");
      return;
    }
    if (!notes.trim()) {
      addToast("Please add descriptive notes", "error");
      return;
    }

    const newExpense = {
      id: "EXP-" + (300 + expenses.length + 1),
      date,
      category,
      amount: parseFloat(amount),
      vehicleId,
      driverId,
      notes,
      status: "pending"
    };

    onAddExpense(newExpense);
    addToast(`Expense ${newExpense.id} logged. Awaiting manager approval.`, "success");
    setIsModalOpen(false);
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.notes.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.vehicleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || e.category === filterCategory;
    const matchesStatus = filterStatus === "all" || e.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved": return <span className="badge badge-success">Approved</span>;
      case "pending": return <span className="badge badge-warning">Awaiting Approval</span>;
      case "rejected": return <span className="badge badge-critical">Rejected</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="page-title">Expense Management</h1>
          <p className="page-subtitle">File expense claims, upload receipts, and audit logistics spending.</p>
        </div>
        <button id="btn-add-expense" className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} />
          Log Expense
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="glass-card filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by ID, Vehicle, Description..." 
            className="form-control search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <select 
            className="form-control" 
            style={{ width: "150px" }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Fuel">Fuel</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Tolls">Tolls</option>
            <option value="Driver Payout">Driver Payout</option>
            <option value="Other">Other</option>
          </select>

          <select 
            className="form-control" 
            style={{ width: "160px" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Awaiting Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Expense ledger list table */}
      <div className="glass-card">
        <div className="chart-title">
          <FileText size={18} className="text-cyan" />
          Fleet Expense Ledger
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Expense ID</th>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Description / Notes</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(exp => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: "bold", color: "var(--brand-cyan)" }}>{exp.id}</td>
                  <td>{exp.date}</td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: "11px", fontWeight: "600" }}>{exp.category}</span>
                  </td>
                  <td style={{ fontWeight: "600" }}>${exp.amount.toLocaleString()}</td>
                  <td>{exp.vehicleId}</td>
                  <td>{drivers.find(d => d.id === exp.driverId)?.name || exp.driverId}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{exp.notes}</td>
                  <td>{getStatusBadge(exp.status)}</td>
                  <td style={{ textAlign: "right" }}>
                    {exp.status === "pending" ? (
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button 
                          id={`btn-approve-${exp.id}`}
                          className="btn-icon" 
                          style={{ color: "var(--status-ok)", borderColor: "rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.05)" }}
                          title="Approve Expense"
                          onClick={() => onApproveExpense(exp.id)}
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          id={`btn-reject-${exp.id}`}
                          className="btn-icon" 
                          style={{ color: "var(--status-critical)", borderColor: "rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)" }}
                          title="Reject Expense"
                          onClick={() => onRejectExpense(exp.id)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Reviewed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                    No expense claims recorded under these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Expense Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Log Transit Expense</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Simulated scanner action */}
                <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ width: "100%", border: "1px dashed var(--brand-cyan)", color: "var(--brand-cyan)", padding: "12px", justifyContent: "center" }}
                    onClick={handleScanSimulation}
                    disabled={isScanning}
                  >
                    <Camera size={16} />
                    {isScanning ? "Processing Receipt..." : "Auto-scan Receipt / Invoice Image"}
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expense Category</label>
                    <select 
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Fuel">Fuel</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Tolls">Tolls</option>
                      <option value="Driver Payout">Driver Payout</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Amount ($)</label>
                    <div style={{ position: "relative" }}>
                      <DollarSign size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input 
                        type="number" 
                        min="0.01"
                        step="0.01"
                        className="form-control"
                        style={{ paddingLeft: "28px" }}
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Charged to Vehicle</label>
                    <select 
                      className="form-control"
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    >
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.id} - {v.model.split(" ")[0]} ({v.plate})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Charged to Driver</label>
                    <select 
                      className="form-control"
                      value={formData.driverId}
                      onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    >
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date Incurred</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Details / Notes</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Fuel Refill 120 Gallons Diesel, Toll fees Las Vegas route"
                    className="form-control"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">File Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
