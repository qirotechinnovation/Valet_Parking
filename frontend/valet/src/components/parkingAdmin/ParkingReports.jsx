import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, TrendingUp, Car, LogIn, CheckCircle2, Clock } from "lucide-react";
import { getParkingReports, getParkingSlots } from "../../api/parkingApi";
import "./css/ParkingReports.css";

const ParkingReports = () => {
  const [reports, setReports] = useState({
    dailyCheckIns: 0,
    dailyCheckOuts: 0,
    totalSlots: 0,
    occupiedSlots: 0,
    occupancyRate: 0,
    retrievalRequests: 0,
    activeRetrievals: 0,
  });

  const [rowBreakdown, setRowBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [repRes, slotsRes] = await Promise.all([
        getParkingReports(),
        getParkingSlots(),
      ]);

      if (repRes && repRes.success) {
        setReports(repRes.reports || {});
      } else {
        throw new Error(repRes?.message || "Failed to load operational reports.");
      }

      if (slotsRes && slotsRes.success) {
        const slots = slotsRes.slots || [];
        // Group by row letter (e.g. Row A, Row B, Row C)
        const groups = {};
        slots.forEach((s) => {
          const slotNum = String(s.slot_number || "").trim();
          const match = slotNum.match(/^[A-Za-z]+/);
          const rowKey = match ? `Zone / Row ${match[0].toUpperCase()}` : "Zone General";
          if (!groups[rowKey]) {
            groups[rowKey] = { total: 0, occupied: 0 };
          }
          groups[rowKey].total += 1;
          if (s.status === "occupied") {
            groups[rowKey].occupied += 1;
          }
        });

        const breakdown = Object.entries(groups).map(([name, data]) => {
          const rate = data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0;
          return { name, total: data.total, occupied: data.occupied, rate };
        });

        setRowBreakdown(breakdown);
      }
    } catch (err) {
      console.error("Load reports error:", err);
      setError(err.message || "Failed to fetch reporting analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="reports-container">
      <div className="reports-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span className="reports-eyebrow">ANALYTICS & METRICS</span>
          <h2>Operational Reports</h2>
          <p>Real-time summary of daily check-ins, facility occupancy, and vehicle operations.</p>
        </div>

        <button
          className="act-btn primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 16px" }}
          onClick={loadReports}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "refresh-spinning" : ""} />
          <span>{loading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontWeight: "600", fontSize: "13px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="report-cards-grid">
        <div className="report-stat-card">
          <span>DAILY CHECK-INS</span>
          <h3>{loading ? "--" : reports.dailyCheckIns}</h3>
          <small className="trend-positive">Vehicles admitted today</small>
        </div>

        <div className="report-stat-card">
          <span>DAILY RETURNS</span>
          <h3>{loading ? "--" : reports.dailyCheckOuts}</h3>
          <small className="trend-positive">Vehicles returned today</small>
        </div>

        <div className="report-stat-card">
          <span>FACILITY OCCUPANCY</span>
          <h3>{loading ? "--" : `${reports.occupancyRate}%`}</h3>
          <small className="trend-neutral">
            {reports.occupiedSlots} of {reports.totalSlots} slots occupied
          </small>
        </div>

        <div className="report-stat-card">
          <span>ACTIVE RETRIEVALS</span>
          <h3>{loading ? "--" : reports.activeRetrievals + reports.retrievalRequests}</h3>
          <small className="trend-positive">
            {reports.retrievalRequests} awaiting, {reports.activeRetrievals} in progress
          </small>
        </div>
      </div>

      {/* OCCUPANCY BREAKDOWN */}
      <div className="reports-tables-section">
        <div className="report-panel">
          <h3>Zone & Row Occupancy Breakdown</h3>
          {rowBreakdown.length === 0 ? (
            <p style={{ color: "#7b7389", fontSize: "13px" }}>
              {loading ? "Calculating zone distribution..." : "No parking zones found. Add parking slots to view breakdown."}
            </p>
          ) : (
            <div className="occupancy-bar-container">
              {rowBreakdown.map((item) => (
                <div className="bar-item" key={item.name}>
                  <span>{item.name} ({item.occupied}/{item.total})</span>
                  <div className="progress-bg">
                    <div
                      className="progress-fill"
                      style={{ width: `${item.rate}%` }}
                    ></div>
                  </div>
                  <strong>{item.rate}%</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingReports;
