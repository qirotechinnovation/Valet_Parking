import { useEffect, useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import StatCard from "./StatCard";
import StaffManagement from "./StaffManagement";
import Reports from "./Reports";
import Profile from "./Profile";

import { getDashboardStats } from "../../api/adminApi";

import "./Dashboard.css";


const date_obj = new Date();

const date = date_obj.toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});


function Dashboard() {

  // ============================================================
  // ACTIVE PAGE
  // ============================================================

  const [activePage, setActivePage] = useState("dashboard");


  // ============================================================
  // DASHBOARD STATISTICS
  // ============================================================

  const [dashboardStats, setDashboardStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    totalCustomers: 0,
    activeParkingSessions: 0,
    openIncidents: 0,
    todayRevenue: 0,
  });


  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [dashboardError, setDashboardError] = useState("");


  // ============================================================
  // LOAD DASHBOARD STATISTICS
  // ============================================================

  const loadDashboardStats = async () => {

    try {

      setDashboardLoading(true);

      setDashboardError("");


      const response = await getDashboardStats();


      console.log(
        "Dashboard stats response:",
        response
      );


      if (!response?.success) {

        throw new Error(
          response?.message ||
          "Failed to load dashboard statistics."
        );

      }


      setDashboardStats({

        totalStaff:
          response?.stats?.totalStaff ?? 0,

        activeStaff:
          response?.stats?.activeStaff ?? 0,

        totalCustomers:
          response?.stats?.totalCustomers ?? 0,

        activeParkingSessions:
          response?.stats?.activeParkingSessions ?? 0,

        openIncidents:
          response?.stats?.openIncidents ?? 0,

        todayRevenue:
          response?.stats?.todayRevenue ?? 0,

      });

    } catch (error) {

      console.error(
        "Dashboard stats error:",
        error
      );


      setDashboardError(
        error?.message ||
        "Failed to load dashboard statistics."
      );

    } finally {

      setDashboardLoading(false);

    }

  };


  // ============================================================
  // LOAD DATA WHEN DASHBOARD IS ACTIVE
  // ============================================================

  useEffect(() => {

    if (activePage === "dashboard") {

      loadDashboardStats();

    }

  }, [activePage]);


  // ============================================================
  // FORMAT REVENUE
  // ============================================================

  const formattedRevenue =
    Number(
      dashboardStats.todayRevenue || 0
    ).toLocaleString("en-IN");


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="dashboard">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />


      {/* ======================================================
          MAIN DASHBOARD AREA
      ====================================================== */}

      <div className="dashboard-main">


        {/* ====================================================
            TOPBAR
        ==================================================== */}

        <Topbar />


        {/* ====================================================
            CONTENT
        ==================================================== */}

        <main className="dashboard-content">


          {/* ==================================================
              MAIN DASHBOARD
          ================================================== */}

          {activePage === "dashboard" && (

            <>


              {/* =================================================
                  DASHBOARD HEADER
              ================================================= */}

              <section className="dashboard-header">


                <div>

                  <p className="dashboard-eyebrow">
                    OVERVIEW
                  </p>


                  <h2>

                    Good morning, Super Admin

                    <span className="wave">
                      👋
                    </span>

                  </h2>


                  <p className="dashboard-description">

                    Here's what's happening with your
                    parking system today.

                  </p>

                </div>


                <div className="dashboard-date">

                  <span>
                    Today
                  </span>

                  <strong>
                    {date}
                  </strong>

                </div>


              </section>


              {/* =================================================
                  ERROR MESSAGE
              ================================================= */}

              {dashboardError && (

                <div className="dashboard-error">

                  <span className="dashboard-error-icon">
                    !
                  </span>

                  <span>
                    {dashboardError}
                  </span>


                  <button
                    type="button"
                    onClick={loadDashboardStats}
                    disabled={dashboardLoading}
                  >
                    Retry
                  </button>

                </div>

              )}


              {/* =================================================
                  STATISTICS
              ================================================= */}

              <section className="stats-grid">


                {/* TOTAL STAFF */}

                <StatCard

                  icon="staff"

                  title="Total Staff"

                  value={
                    dashboardLoading
                      ? "--"
                      : dashboardStats.totalStaff
                  }

                  description="Registered staff members"

                />


                {/* ACTIVE STAFF */}

                <StatCard

                  icon="active"

                  title="Active Staff"

                  value={
                    dashboardLoading
                      ? "--"
                      : dashboardStats.activeStaff
                  }

                  description="Currently active"

                />


                {/* TOTAL CUSTOMERS */}

                <StatCard

                  icon="customers"

                  title="Total Customers"

                  value={
                    dashboardLoading
                      ? "--"
                      : dashboardStats.totalCustomers
                  }

                  description="Registered customers"

                />


                {/* ACTIVE PARKING SESSIONS */}

                <StatCard

                  icon="parking"

                  title="Active Sessions"

                  value={
                    dashboardLoading
                      ? "--"
                      : dashboardStats.activeParkingSessions
                  }

                  description="Vehicles currently parked"

                />


                {/* OPEN INCIDENTS */}

                <StatCard

                  icon="incident"

                  title="Open Incidents"

                  value={
                    dashboardLoading
                      ? "--"
                      : dashboardStats.openIncidents
                  }

                  description="Requires attention"

                  warning

                />


                {/* TODAY'S REVENUE */}

                <StatCard

                  icon="revenue"

                  title="Today's Revenue"

                  value={
                    dashboardLoading
                      ? "₹ --"
                      : `₹ ${formattedRevenue}`
                  }

                  description="Revenue generated today"

                  revenue

                />


              </section>


              {/* =================================================
                  LOWER DASHBOARD
              ================================================= */}

              <section className="dashboard-grid">


                {/* =================================================
                    SYSTEM OVERVIEW
                ================================================= */}

                <div className="dashboard-panel system-panel">


                  <div className="panel-header">


                    <div>

                      <h3>
                        System Overview
                      </h3>


                      <p>
                        Current parking system performance
                      </p>

                    </div>


                    <button
                      className="panel-action"
                      type="button"
                      onClick={() =>
                        setActivePage("reports")
                      }
                    >
                      View details
                    </button>


                  </div>


                  <div className="system-content">


                    {/* SYSTEM STATUS */}

                    <div className="system-status">


                      <div className="status-indicator"></div>


                      <div>

                        <strong>
                          System Operational
                        </strong>


                        <span>
                          All core services are running normally
                        </span>

                      </div>


                    </div>


                    {/* SYSTEM METRICS */}

                    <div className="system-metrics">


                      {/* PARKING CAPACITY */}

                      <div className="system-metric">

                        <span>
                          Parking Capacity
                        </span>


                        <strong>
                          --
                        </strong>

                      </div>


                      {/* ACTIVE SESSIONS */}

                      <div className="system-metric">

                        <span>
                          Active Sessions
                        </span>


                        <strong>

                          {dashboardLoading
                            ? "--"
                            : dashboardStats.activeParkingSessions}

                        </strong>

                      </div>


                      {/* OPEN INCIDENTS */}

                      <div className="system-metric">

                        <span>
                          Open Incidents
                        </span>


                        <strong>

                          {dashboardLoading
                            ? "--"
                            : dashboardStats.openIncidents}

                        </strong>

                      </div>


                    </div>

                  </div>

                </div>


                {/* =================================================
                    RECENT ACTIVITY
                ================================================= */}

                <div className="dashboard-panel activity-panel">


                  <div className="panel-header">


                    <div>

                      <h3>
                        Recent Activity
                      </h3>


                      <p>
                        Latest system activity
                      </p>

                    </div>


                    <button
                      className="panel-action"
                      type="button"
                    >
                      View all
                    </button>


                  </div>


                  <div className="activity-list">


                    <div className="empty-activity">


                      <div className="empty-icon">
                        ◷
                      </div>


                      <strong>
                        No recent activity
                      </strong>


                      <span>
                        Administrative activity will appear here.
                      </span>


                    </div>


                  </div>


                </div>


              </section>


            </>

          )}


          {/* ======================================================
              STAFF MANAGEMENT
          ====================================================== */}

          {activePage === "staff" && (

            <StaffManagement />

          )}


          {/* ======================================================
              REPORTS
          ====================================================== */}

          {activePage === "reports" && (

            <Reports />

          )}


          {/* ======================================================
              PROFILE
          ====================================================== */}

          {activePage === "profile" && (

            <Profile />

          )}


        </main>


      </div>


    </div>

  );

}


export default Dashboard;