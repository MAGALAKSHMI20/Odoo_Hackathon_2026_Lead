import React, { useState } from "react";
import { Plus, Wrench, Clock, CheckCircle2, DollarSign, PenSquare } from "lucide-react";

export default function Maintenance({ 
  maintenance, 
  vehicles, 
  onAddMaintenanceTicket, 
  onUpdateMaintenanceStatus, 
  addToast 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({
    vehicleId: "",
    serviceType: "",
    notes: "",
    cost: 0,
    date: new Date().toISOString().split("T")[0]
  });

  const [actualCost, setActualCost] = useState(0);

  const handleOpenModal = () => {
    // Show all vehicles that aren't already critical or currently in service
    setFormData({
      vehicleId: vehicles[0]?.id || "",
      serviceType: "",
      notes: "",
      cost: 150,
      date: new Date().toISOString().split("T")[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();

    const { vehicleId, serviceType, notes, cost, date } = formData;

    if (!vehicleId) {
      addToast("Please select a vehicle to service", "error");
      return;
    }
    if (!serviceType.trim()) {
      addToast("Service type description is required", "error");
      return;
    }
    if (cost < 0) {
      addToast("Est. cost cannot be negative", "error");
      return;
    }

    const newTicket = {
      id: "MNT-" + (900 + maintenance.length + 1),
      vehicleId,
      serviceType,
      cost: parseFloat(cost) || 0,
      date,
      status: "scheduled",
      notes
    };

    onAddMaintenanceTicket(newTicket);
    addToast(`Service ticket ${newTicket.id} scheduled for ${vehicleId}`, "success");
    setIsModalOpen(false);
  };

  const handleStartService = (ticketId, vehicleId) => {
    onUpdateMaintenanceStatus(ticketId, "in progress");
    addToast(`Vehicle ${vehicleId} checked into workshop. Operations status updated to: 'In Service' (blocked from dispatch).`, "info");
  };

  const handleOpenCompleteModal = (ticketId) => {
    const ticket = maintenance.find(t => t.id === ticketId);
    setSelectedTicketId(ticketId);
    setActualCost(ticket?.cost || 0);
    setIsCostModalOpen(true);
  };

  const handleCompleteService = (e) => {
    e.preventDefault();
    if (actualCost < 0) {
      addToast("Final cost cannot be negative", "error");
      return;
    }

    onUpdateMaintenanceStatus(selectedTicketId, "completed", parseFloat(actualCost));
    const ticket = maintenance.find(t => t.id === selectedTicketId);
    addToast(`Maintenance ticket ${selectedTicketId} marked completed. Vehicle ${ticket?.vehicleId} health restored to Excellent.`, "success");
    setIsCostModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled": return <span className="badge badge-info">Scheduled</span>;
      case "in progress": return <span className="badge badge-warning">In Workshop</span>;
      case "completed": return <span className="badge badge-success">Completed</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="page-title">Maintenance Workshop</h1>
          <p className="page-subtitle">Schedule repairs, track mechanical diagnostics, and document service logs.</p>
        </div>
        <button id="btn-add-maintenance" className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} />
          Schedule Service
        </button>
      </div>

      {/* Workshop Queue List */}
      <div className="glass-card">
        <div className="chart-title">
          <Wrench size={18} className="text-cyan" />
          Active Repair Queue & Audit Log
        </div>
        
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Cost</th>
                <th>Date Scheduled</th>
                <th>Notes</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map(ticket => (
                <tr key={ticket.id}>
                  <td style={{ fontWeight: "bold", color: "var(--brand-cyan)" }}>{ticket.id}</td>
                  <td>{ticket.vehicleId}</td>
                  <td style={{ fontWeight: "500" }}>{ticket.serviceType}</td>
                  <td>${ticket.cost.toLocaleString()}</td>
                  <td>{ticket.date}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "12px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ticket.notes}
                  </td>
                  <td>{getStatusBadge(ticket.status)}</td>
                  <td style={{ textAlign: "right" }}>
                    {ticket.status === "scheduled" && (
                      <button 
                        id={`btn-start-service-${ticket.id}`}
                        className="btn btn-primary" 
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => handleStartService(ticket.id, ticket.vehicleId)}
                      >
                        Start Service
                      </button>
                    )}
                    {ticket.status === "in progress" && (
                      <button 
                        id={`btn-complete-service-${ticket.id}`}
                        className="btn btn-secondary" 
                        style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid rgba(16, 185, 129, 0.4)", color: "var(--status-ok)" }}
                        onClick={() => handleOpenCompleteModal(ticket.id)}
                      >
                        Log Completed
                      </button>
                    )}
                    {ticket.status === "completed" && (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Archived Log
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {maintenance.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                    No service tickets scheduled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Service Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Schedule Maintenance Service</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitTicket}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Target Vehicle</label>
                  <select 
                    className="form-control"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.id} - {v.model} (Status: {v.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Type & Checklist</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Brake Replacement, 60k Mile Tune-up"
                    className="form-control"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Estimated Cost ($)</label>
                    <input 
                      type="number" 
                      min="0"
                      className="form-control"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Date</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Technician Notes & Diagnostics</label>
                  <textarea 
                    rows="3" 
                    placeholder="Describe vehicle issues, driver reports, or scheduled checklist items..."
                    className="form-control"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Service Cost Modal */}
      {isCostModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h3>Log Complete & Invoice</h3>
              <button className="btn-icon" onClick={() => setIsCostModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCompleteService}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Enter Actual Invoiced Cost ($)</label>
                  <div style={{ position: "relative" }}>
                    <DollarSign size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input 
                      type="number" 
                      min="0"
                      className="form-control" 
                      style={{ paddingLeft: "28px" }}
                      value={actualCost}
                      onChange={(e) => setActualCost(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
                    This invoice will automatically post to the Expense Management logs.
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCostModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Restore Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
