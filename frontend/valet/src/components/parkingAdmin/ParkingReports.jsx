import React from "react";
import "./css/ParkingReports.css";

const ParkingReports = () => {
  return (
    <div className="reports-container">
      <div className="reports-header">
        <span className="reports-eyebrow">ANALYTICS & METRICS</span>
        <h2>Operational Reports</h2>
        <p>Summary of daily check-ins, occupancy metrics, and retrieval performance.</p>
      </div>

      <div className="report-cards-grid">
        <div className="report-stat-card">
          <span>DAILY CHECK-INS</span>
          <h3>145</h3>
          <small className="trend-positive">+12.5% from yesterday</small>
        </div>
        <div className="report-stat-card">
          <span>DAILY CHECK-OUTS</span>
          <h3>112</h3>
          <small className="trend-positive">+8.2% from yesterday</small>
        </div>
        <div className="report-stat-card">
          <span>PEAK OCCUPANCY RATE</span>
          <h3>88%</h3>
          <small className="trend-neutral">Peak at 2:30 PM</small>
        </div>
        <div className="report-stat-card">
          <span>AVG RETRIEVAL TIME</span>
          <h3>4.2 Mins</h3>
          <small className="trend-positive">Under target limit (&lt; 5 mins)</small>
        </div>
      </div>

      <div className="reports-tables-section">
        <div className="report-panel">
          <h3>Occupancy Breakdown</h3>
          <div className="occupancy-bar-container">
            <div className="bar-item">
              <span>Ground Floor (Slots A)</span>
              <div className="progress-bg"><div className="progress-fill" style={{ width: "90%" }}></div></div>
              <strong>90%</strong>
            </div>
            <div className="bar-item">
              <span>First Floor (Slots B)</span>
              <div className="progress-bg"><div className="progress-fill" style={{ width: "65%" }}></div></div>
              <strong>65%</strong>
            </div>
            <div className="bar-item">
              <span>Basement EV (Slots C)</span>
              <div className="progress-bg"><div className="progress-fill" style={{ width: "40%" }}></div></div>
              <strong>40%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingReports;
