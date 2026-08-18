import "./Sidebar.css";
import {
  LayoutDashboard,
  UserRoundPen,
  Summary,
  UsersRound,
  LogOut,

} from 'lucide-react';


function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="dashboard-sidebar">

      {/* Brand */}
      <div className="sidebar-brand">

        <div className="sidebar-logo">
          A
        </div>

        <div>
          <h2>AURA</h2>
          <span>VALET PARKING</span>
        </div>

      </div>


      {/* Navigation */}
      <nav className="sidebar-nav">

        <p className="nav-label">
          MAIN MENU
        </p>


        {/* Dashboard */}
        <button
          className={`nav-item ${activePage === "dashboard" ? "active" : ""
            }`}
          onClick={() => setActivePage("dashboard")}
        >
          <span className="nav-icon">
            <LayoutDashboard />
          </span>
          <span>Dashboard</span>
        </button>


        {/* Staff */}
        <button
          className={`nav-item ${activePage === "staff" ? "active" : ""
            }`}
          onClick={() => setActivePage("staff")}
        >
          <span className="nav-icon">
            <UserRoundPen />
          </span>
          <span>Staff Management</span>
        </button>


        {/* Reports */}
        <button
          className={`nav-item ${activePage === "reports" ? "active" : ""
            }`}
          onClick={() => setActivePage("reports")}
        >
          <span className="nav-icon">
            <Summary />
          </span>
          <span>Reports & Overview</span>
        </button>


        <p className="nav-label nav-label-space">
          ACCOUNT
        </p>


        {/* Profile */}
        <button
          className={`nav-item ${activePage === "profile" ? "active" : ""
            }`}
          onClick={() => setActivePage("profile")}
        >
          <span className="nav-icon">
            <UsersRound />
          </span>
          <span>Profile</span>
        </button>

      </nav>


      {/* Bottom */}
      <div className="sidebar-bottom">

        <button className="nav-item logout">
          <span className="nav-icon">
            <LogOut/>
          </span>
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;