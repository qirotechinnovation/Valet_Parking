import React from "react";
import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  UserRoundPen,
  LogOut,
} from "lucide-react";
import "./css/ReceptionSidebar.css";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "sessions", label: "Active Sessions", icon: ClipboardList },
  { id: "customers", label: "Customers", icon: Users },
  { id: "vehicles", label: "Vehicles", icon: Car },
];

const ReceptionSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <aside className="aura-sidebar">
      {/* BRAND */}
      <div className="aura-brand">
        <div className="brand-badge">A</div>
        <div className="brand-title">
          <h2>AURA</h2>
          <span>RECEPTION DESK</span>
        </div>
      </div>

      {/* MAIN MENU */}
      <div className="sidebar-section">
        <span className="section-label">OPERATIONS</span>
        <nav className="menu-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`menu-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="item-icon">
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.9} />
                </span>
                <span className="item-text">{item.label}</span>
              </button>
            );
          })}
        </nav>


        {/* ACCOUNT */}
        <div className="sidebar-section account-section">
          <span className="section-label">ACCOUNT</span>
          <button
            type="button"
            className={`menu-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="item-icon">
              <UserRoundPen size={18} strokeWidth={activeTab === "profile" ? 2.2 : 1.9} />
            </span>
            <span className="item-text">Profile</span>
          </button>
        </div>
      </div>



      {/* LOGOUT */}
      <div className="sidebar-footer">
        <button type="button" className="logout-btn" onClick={onLogout}>
          <span className="item-icon"><LogOut /></span>
          <span className="item-text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default ReceptionSidebar;
