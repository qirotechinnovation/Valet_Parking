import React, { useCallback, useEffect, useState } from "react";
import { X, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import { createReceptionSession, getVehicles } from "../../api/receptionApi";
import "./css/ReceptionDashboard.css";

const generateTicketCode = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${num}`;
};

const CheckInVehicleModal = ({ onClose, onSuccess, preselectedVehicle = null }) => {
  const [vehicleSearch, setVehicleSearch] = useState(
    preselectedVehicle?.license_plate || ""
  );
  const [vehicleId, setVehicleId] = useState(preselectedVehicle?.id || "");
  const [selectedVehicle, setSelectedVehicle] = useState(preselectedVehicle || null);
  const [vehicles, setVehicles] = useState(preselectedVehicle ? [preselectedVehicle] : []);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const [parkingType, setParkingType] = useState("valet");
  const [ticketCode, setTicketCode] = useState(generateTicketCode());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  const searchVehicles = useCallback(async (q) => {
    try {
      setLoadingVehicles(true);
      const res = await getVehicles(q);
      if (res && res.success) {
        setVehicles(res.vehicles || []);
        setVehicleDropdownOpen(true);
      }
    } catch (err) {
      console.warn("Search vehicles error:", err);
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    if (!preselectedVehicle) {
      searchVehicles("");
    }
  }, [preselectedVehicle, searchVehicles]);

  const handleVehicleSearch = (e) => {
    const q = e.target.value;
    setVehicleSearch(q);
    setVehicleId("");
    setSelectedVehicle(null);
    searchVehicles(q);
  };

  const selectVehicle = (v) => {
    setVehicleId(v.id);
    setSelectedVehicle(v);
    setVehicleSearch(v.license_plate);
    setVehicleDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleId) { setError("Please select a vehicle to check in."); return; }
    if (!ticketCode.trim()) { setError("Ticket code is required."); return; }

    try {
      setLoading(true);
      const res = await createReceptionSession({
        vehicle_id: vehicleId,
        parking_type: parkingType,
        ticket_code: ticketCode.trim().toUpperCase(),
      });
      if (res && res.success) {
        setCreated(res.session);
        if (onSuccess) onSuccess(res.session);
      } else {
        throw new Error(res?.message || "Failed to check in vehicle.");
      }
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reception-modal-overlay" onClick={onClose}>
      <div className="reception-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="reception-modal-header">
          <div>
            <p className="modal-eyebrow">VEHICLE CHECK-IN</p>
            <h3>Check-In Vehicle</h3>
            <span>Create a new parking session</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Success State */}
        {created ? (
          <div className="modal-success-body">
            <div className="modal-success-icon">
              <CheckCircle2 size={40} />
            </div>
            <h4>Vehicle Checked In!</h4>
            <p>A parking session has been created successfully.</p>

            <div className="modal-id-badge">
              <span>TICKET CODE</span>
              <strong>{created.ticket_code}</strong>
            </div>

            <div className="modal-success-info">
              <div><span>Vehicle</span><strong>{selectedVehicle?.license_plate || "—"}</strong></div>
              <div><span>Parking Type</span><strong style={{ textTransform: "capitalize" }}>{created.parking_type}</strong></div>
              <div><span>Status</span><strong style={{ color: "#047857" }}>Checked In</strong></div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn-secondary" onClick={onClose}>Done</button>
              <button
                className="modal-btn-primary"
                onClick={() => {
                  setCreated(null);
                  setVehicleSearch("");
                  setVehicleId("");
                  setSelectedVehicle(null);
                  setTicketCode(generateTicketCode());
                  setError("");
                }}
              >
                Check-In Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form-body">
            {error && <div className="modal-error">{error}</div>}

            {/* Vehicle Search */}
            <div className="modal-field">
              <label>Vehicle <span className="required">*</span></label>
              <div style={{ position: "relative" }}>
                <div className="modal-input-wrap">
                  <Search size={15} />
                  <input
                    value={vehicleSearch}
                    onChange={handleVehicleSearch}
                    onFocus={() => setVehicleDropdownOpen(true)}
                    placeholder="Search by license plate, make, or model..."
                  />
                </div>
                {vehicleDropdownOpen && vehicles.length > 0 && (
                  <div className="modal-dropdown">
                    {vehicles.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className="modal-dropdown-item"
                        onClick={() => selectVehicle(v)}
                      >
                        <strong>{v.license_plate}</strong>
                        <span>{v.make} {v.model} • {v.customer?.name || "—"}</span>
                      </button>
                    ))}
                  </div>
                )}
                {vehicleDropdownOpen && !loadingVehicles && vehicles.length === 0 && (
                  <div className="modal-dropdown">
                    <div className="modal-dropdown-empty">No vehicles found. Register a vehicle first.</div>
                  </div>
                )}
              </div>
              {selectedVehicle && (
                <div className="modal-selected-vehicle">
                  <strong>{selectedVehicle.license_plate}</strong> — {selectedVehicle.make} {selectedVehicle.model}
                  {selectedVehicle.color && ` (${selectedVehicle.color})`}
                  {selectedVehicle.customer && ` · ${selectedVehicle.customer.name}`}
                </div>
              )}
            </div>

            {/* Parking Type */}
            <div className="modal-field">
              <label>Parking Type <span className="required">*</span></label>
              <div className="parking-type-toggle">
                <button
                  type="button"
                  className={`type-btn ${parkingType === "valet" ? "active" : ""}`}
                  onClick={() => setParkingType("valet")}
                >
                  🚗 Valet
                </button>
                <button
                  type="button"
                  className={`type-btn ${parkingType === "self" ? "active" : ""}`}
                  onClick={() => setParkingType("self")}
                >
                  🅿 Self Park
                </button>
              </div>
            </div>

            {/* Ticket Code */}
            <div className="modal-field">
              <label>Ticket Code <span className="required">*</span></label>
              <div className="modal-input-wrap">
                <input
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TKT-1234"
                  style={{ textTransform: "uppercase", fontFamily: "monospace", fontWeight: "700" }}
                />
                <button
                  type="button"
                  onClick={() => setTicketCode(generateTicketCode())}
                  title="Generate new ticket code"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#5e3573", padding: "0 4px" }}
                >
                  <RefreshCw size={15} />
                </button>
              </div>
              <small style={{ color: "#7b7389", fontSize: "11px", marginTop: "4px", display: "block" }}>
                Auto-generated. You can edit manually if needed.
              </small>
            </div>

            <div className="modal-footer">
              <button type="button" className="modal-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="modal-btn-primary" disabled={loading}>
                {loading ? "Checking In..." : "Confirm Check-In"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckInVehicleModal;
