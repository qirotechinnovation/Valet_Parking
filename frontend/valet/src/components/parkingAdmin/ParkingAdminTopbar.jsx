import React from "react";
import "./css/ParkingAdminTopbar.css";
import{
  Bell,
  Search,
  ChevronDown
} from "lucide-react";

const ParkingAdminTopbar = ({ activeTab }) => {
  return (
    <header className="aura-topbar">
      <div className="breadcrumb">
        <span>Admin</span> / <strong className="capitalize">{activeTab}</strong>
      </div>

      <div className="topbar-right">
        <div className="search-bar">
          <span className="search-icon"><Search/></span>
          <input type="text" placeholder="Search..." />
        </div>

        <button className="notification-bell">
          <Bell />
           <span className="bell-badge"></span>
        </button>

        <div className="profile-chip">
          <div className="profile-avatar">PA</div>
          <div className="profile-meta">
            <strong>Parking Admin</strong>
            <span>Administrator</span>
          </div>
          <span className="dropdown-arrow"><ChevronDown/></span>
        </div>
      </div>
    </header>
  );
};

export default ParkingAdminTopbar;