import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import StatCard from "./StatCard";
import StaffManagement from "./StaffManagement";
import Reports from "./Reports";
import Profile from "./Profile"



import "./Dashboard.css";
const date_obj = new Date();
const date = date_obj.toLocaleDateString();

function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  return (
    <div className="dashboard">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="dashboard-main">

        <Topbar />

        <main className="dashboard-content">

          {activePage === "dashboard" && (
            <>
              <section className="dashboard-header">

                <div>
                  <p className="dashboard-eyebrow">
                    OVERVIEW
                  </p>

                  <h2>
                    Good morning, Super Admin
                    <span className="wave">👋</span>
                  </h2>

                  <p className="dashboard-description">
                    Here's what's happening with your parking system today.
                  </p>
                </div>

                <div className="dashboard-date">
                  <span>Today</span>
                  <strong>{date}</strong>
                </div>

              </section>


              {/* =========================
              STATISTICS
          ========================= */}

              <section className="stats-grid">

                <StatCard
                  icon="staff"
                  title="Total Staff"
                  value="--"
                  description="Registered staff members"
                />

                <StatCard
                  icon="active"
                  title="Active Staff"
                  value="--"
                  description="Currently active"
                />

                <StatCard
                  icon="customers"
                  title="Total Customers"
                  value="--"
                  description="Registered customers"
                />

                <StatCard
                  icon="parking"
                  title="Active Sessions"
                  value="--"
                  description="Vehicles currently parked"
                />

                <StatCard
                  icon="incident"
                  title="Open Incidents"
                  value="--"
                  description="Requires attention"
                  warning
                />

                <StatCard
                  icon="revenue"
                  title="Today's Revenue"
                  value="₹ --"
                  description="Revenue generated today"
                  revenue
                />

              </section>


              {/* =========================
              LOWER DASHBOARD
          ========================= */}

              <section className="dashboard-grid">

                {/* System Overview */}

                <div className="dashboard-panel system-panel">

                  <div className="panel-header">

                    <div>
                      <h3>System Overview</h3>

                      <p>
                        Current parking system performance
                      </p>
                    </div>

                    <button className="panel-action">
                      View details
                    </button>

                  </div>


                  <div className="system-content">

                    <div className="system-status">

                      <div className="status-indicator"></div>

                      <div>
                        <strong>System Operational</strong>

                        <span>
                          All core services are running normally
                        </span>
                      </div>

                    </div>


                    <div className="system-metrics">

                      <div className="system-metric">
                        <span>Parking Capacity</span>

                        <strong>--</strong>
                      </div>

                      <div className="system-metric">
                        <span>Active Sessions</span>

                        <strong>--</strong>
                      </div>

                      <div className="system-metric">
                        <span>Open Incidents</span>

                        <strong>--</strong>
                      </div>

                    </div>

                  </div>

                </div>


                {/* Recent Activity */}

                <div className="dashboard-panel activity-panel">

                  <div className="panel-header">

                    <div>
                      <h3>Recent Activity</h3>

                      <p>
                        Latest system activity
                      </p>
                    </div>

                    <button className="panel-action">
                      View all
                    </button>

                  </div>


                  <div className="activity-list">

                    <div className="empty-activity">

                      <div className="empty-icon">
                        ◷
                      </div>

                      <strong>No recent activity</strong>

                      <span>
                        Administrative activity will appear here.
                      </span>

                    </div>

                  </div>

                </div>

              </section>
            </>
          )}

          {activePage === "staff" && (
            <StaffManagement />
          )}

          {activePage === "reports" && (
            <Reports />)}

          {activePage === "profile" && (
            <Profile />
          )}


        </main>

      </div>

    </div>
  );
}

export default Dashboard;