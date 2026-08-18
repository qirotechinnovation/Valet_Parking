import { useState } from "react";
import "./Reports.css";

function Reports() {
  const [range, setRange] = useState("7");

  const revenueData = [
    { day: "Mon", value: 4200 },
    { day: "Tue", value: 5800 },
    { day: "Wed", value: 4900 },
    { day: "Thu", value: 7200 },
    { day: "Fri", value: 6800 },
    { day: "Sat", value: 8400 },
    { day: "Sun", value: 7600 },
  ];

  return (
    <div className="reports-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="reports-header">

        <div>
          <p className="reports-eyebrow">
            ANALYTICS
          </p>

          <h2>
            System Overview
          </h2>

          <p className="reports-description">
            Monitor parking activity, revenue and overall
            system performance.
          </p>
        </div>


        <div className="reports-controls">

          <div className="date-range">

            <span className="range-icon">
              ◷
            </span>

            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="7">
                Last 7 days
              </option>

              <option value="30">
                Last 30 days
              </option>

              <option value="90">
                Last 90 days
              </option>
            </select>

          </div>

        </div>

      </section>


      {/* =========================
          KPI CARDS
      ========================= */}

      <section className="report-kpi-grid">

        <div className="report-kpi-card">

          <div className="report-kpi-top">

            <div className="report-kpi-icon revenue">
              ₹
            </div>

            <span className="kpi-trend positive">
              ↑ 12.5%
            </span>

          </div>

          <p>
            Total Revenue
          </p>

          <h3>
            ₹ 44,900
          </h3>

          <span>
            Compared with previous period
          </span>

        </div>


        <div className="report-kpi-card">

          <div className="report-kpi-top">

            <div className="report-kpi-icon parking">
              P
            </div>

            <span className="kpi-trend positive">
              ↑ 8.2%
            </span>

          </div>

          <p>
            Parking Sessions
          </p>

          <h3>
            286
          </h3>

          <span>
            Completed and active sessions
          </span>

        </div>


        <div className="report-kpi-card">

          <div className="report-kpi-top">

            <div className="report-kpi-icon customers">
              C
            </div>

            <span className="kpi-trend positive">
              ↑ 5.4%
            </span>

          </div>

          <p>
            Customers
          </p>

          <h3>
            192
          </h3>

          <span>
            Registered customers
          </span>

        </div>


        <div className="report-kpi-card">

          <div className="report-kpi-top">

            <div className="report-kpi-icon incidents">
              !
            </div>

            <span className="kpi-trend neutral">
              0.0%
            </span>

          </div>

          <p>
            Open Incidents
          </p>

          <h3>
            03
          </h3>

          <span>
            Currently requiring attention
          </span>

        </div>

      </section>


      {/* =========================
          MAIN ANALYTICS
      ========================= */}

      <section className="reports-main-grid">

        {/* Revenue */}

        <div className="report-panel revenue-panel">

          <div className="report-panel-header">

            <div>
              <h3>
                Revenue Overview
              </h3>

              <p>
                Revenue generated over the selected period
              </p>
            </div>

            <button className="panel-menu">
              ⋮
            </button>

          </div>


          <div className="revenue-summary">

            <strong>
              ₹ 44,900
            </strong>

            <span>
              Total revenue
            </span>

          </div>


          {/* Chart */}

          <div className="revenue-chart">

            <div className="chart-y-axis">

              <span>₹10k</span>
              <span>₹7.5k</span>
              <span>₹5k</span>
              <span>₹2.5k</span>
              <span>₹0</span>

            </div>


            <div className="chart-area">

              <div className="chart-grid-lines">

                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>

              </div>


              <svg
                className="revenue-line"
                viewBox="0 0 700 240"
                preserveAspectRatio="none"
              >

                <polyline
                  points="
                    0,145
                    116,110
                    233,130
                    350,72
                    466,92
                    583,40
                    700,60
                  "
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>


              <div className="chart-points">

                {revenueData.map((item, index) => (
                  <div
                    className="chart-point"
                    key={item.day}
                    style={{
                      left: `${index * 16.66}%`,
                    }}
                  >
                    <span></span>

                    <label>
                      {item.day}
                    </label>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>


        {/* Parking Activity */}

        <div className="report-panel parking-activity-panel">

          <div className="report-panel-header">

            <div>
              <h3>
                Parking Activity
              </h3>

              <p>
                Session distribution
              </p>
            </div>

            <button className="panel-menu">
              ⋮
            </button>

          </div>


          <div className="parking-circle">

            <div className="circle-inner">

              <strong>
                286
              </strong>

              <span>
                Sessions
              </span>

            </div>

          </div>


          <div className="parking-legend">

            <div>
              <span className="legend-dot completed"></span>
              Completed
              <strong>214</strong>
            </div>

            <div>
              <span className="legend-dot active"></span>
              Active
              <strong>48</strong>
            </div>

            <div>
              <span className="legend-dot cancelled"></span>
              Cancelled
              <strong>24</strong>
            </div>

          </div>

        </div>

      </section>


      {/* =========================
          LOWER SECTION
      ========================= */}

      <section className="reports-bottom-grid">

        {/* Staff Activity */}

        <div className="report-panel">

          <div className="report-panel-header">

            <div>
              <h3>
                Staff Activity
              </h3>

              <p>
                Current workforce status
              </p>
            </div>

          </div>


          <div className="staff-activity">

            <div className="activity-stat">

              <span>
                Total Staff
              </span>

              <strong>
                24
              </strong>

            </div>

            <div className="activity-stat">

              <span>
                Active
              </span>

              <strong className="green-text">
                19
              </strong>

            </div>

            <div className="activity-stat">

              <span>
                Inactive
              </span>

              <strong>
                05
              </strong>

            </div>

          </div>

        </div>


        {/* Incidents */}

        <div className="report-panel">

          <div className="report-panel-header">

            <div>
              <h3>
                Incident Summary
              </h3>

              <p>
                Current system incidents
              </p>
            </div>

            <span className="incident-count">
              03 Open
            </span>

          </div>


          <div className="incident-list">

            <div className="incident-item">

              <span className="incident-dot high"></span>

              <div>
                <strong>
                  Vehicle delay
                </strong>

                <span>
                  Parking Zone A
                </span>
              </div>

              <small>
                High
              </small>

            </div>


            <div className="incident-item">

              <span className="incident-dot medium"></span>

              <div>
                <strong>
                  Slot unavailable
                </strong>

                <span>
                  Parking Zone B
                </span>
              </div>

              <small>
                Medium
              </small>

            </div>


            <div className="incident-item">

              <span className="incident-dot low"></span>

              <div>
                <strong>
                  Customer request
                </strong>

                <span>
                  Reception
                </span>
              </div>

              <small>
                Low
              </small>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Reports;