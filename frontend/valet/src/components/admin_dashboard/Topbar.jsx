import { Bell,
  ChevronDown,
  Settings,
  Search,
  LogOut,
} from 'lucide-react';

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";

function Topbar({ setActivePage }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  let user = { name: "Super Admin", email: "admin@valetparking.com" };
  try {
    const stored = localStorage.getItem("user");
    if (stored) user = JSON.parse(stored);
  } catch (e) {
    // fallback
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SA";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <header className="dashboard-topbar">

      {/* =========================
          LEFT
      ========================= */}

      <div className="topbar-left">

        <div className="topbar-breadcrumb">
          <span>Admin</span>
          <span className="breadcrumb-separator">/</span>
          <strong>Dashboard</strong>
        </div>

      </div>


      {/* =========================
          RIGHT
      ========================= */}

      <div className="topbar-right">

        {/* Search */}

        <div className="topbar-search">

          <span className="search-icon">
            <Search/>
          </span>

          <input
            type="text"
            placeholder="Search..."
          />

        </div>


        {/* Notifications */}

        <div className="topbar-notification">

          <button
            className="notification-button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
          >

            <span className="notification-icon">
             <Bell />
            </span>

            <span className="notification-dot"></span>

          </button>


          {showNotifications && (

            <div className="notification-dropdown">

              <div className="dropdown-header">

                <div>
                  <strong>Notifications</strong>

                  <span>
                    Recent system activity
                  </span>
                </div>

                <span className="notification-count">
                  3
                </span>

              </div>


              <div className="notification-item">

                <div className="notification-item-icon warning">
                  !
                </div>

                <div>
                  <strong>
                    Open incident
                  </strong>

                  <span>
                    Vehicle delay requires attention.
                  </span>

                  <small>
                    10 minutes ago
                  </small>
                </div>

              </div>


              <div className="notification-item">

                <div className="notification-item-icon staff">
                  +
                </div>

                <div>
                  <strong>
                    New staff member
                  </strong>

                  <span>
                    A new staff account was created.
                  </span>

                  <small>
                    32 minutes ago
                  </small>
                </div>

              </div>


              <div className="notification-item">

                <div className="notification-item-icon system">
                  ✓
                </div>

                <div>
                  <strong>
                    System operational
                  </strong>

                  <span>
                    All core services are running normally.
                  </span>

                  <small>
                    1 hour ago
                  </small>
                </div>

              </div>


              <button className="view-notifications">
                View all notifications
              </button>

            </div>

          )}

        </div>


        {/* Divider */}

        <div className="topbar-divider"></div>


        {/* Profile */}

        <div className="topbar-profile">

          <button
            className="profile-button"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
          >

            <div className="profile-avatar">
              {initials}
            </div>

            <div className="profile-info">

              <strong>
                {user.name || "Super Admin"}
              </strong>

              <span>
                Administrator
              </span>
             
            </div>
             <ChevronDown />
            <span
              className={`profile-chevron ${
                showProfile ? "open" : ""
              }`}
            >
              <></>
            </span>

          </button>


          {showProfile && (

            <div className="profile-dropdown">

              <div className="profile-dropdown-header">

                <div className="profile-avatar large">
                  {initials}
                </div>

                <div>

                  <strong>
                    {user.name || "Super Admin"}
                  </strong>

                  <span>
                    {user.email || "admin@valetparking.com"}
                  </span>

                  
                </div>

              </div>


              <div className="profile-menu-divider"></div>


              <button
                className="profile-menu-item"
                onClick={() => {
                  setShowProfile(false);
                  if (setActivePage) setActivePage("profile");
                }}
              >

                <span className="menu-item-icon">
                  ◉
                </span>

                <div>
                  <strong>My Profile</strong>
                  <span>View your account</span>
                </div>

              </button>


              <div className="profile-menu-divider"></div>


              <button
                className="profile-menu-item logout-menu"
                onClick={handleLogout}
              >

                <span className="menu-item-icon">
                  <LogOut />
                </span>

                <div>
                  <strong>Logout</strong>
                  <span>Sign out of your account</span>
                </div>

              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default Topbar;