import { Bell,
  ChevronDown,
} from 'lucide-react';

import { useState } from "react";
import "./Topbar.css";

function Topbar() {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search..."
          />

          <span className="search-shortcut">
            ⌘ K
          </span>

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
              ♧
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
              SA
            </div>

            <div className="profile-info">

              <strong>
                Super Admin
              </strong>

              <span>
                Administrator
              </span>

            </div>

            <span
              className={`profile-chevron ${
                showProfile ? "open" : ""
              }`}
            >
              ▾
            </span>

          </button>


          {showProfile && (

            <div className="profile-dropdown">

              <div className="profile-dropdown-header">

                <div className="profile-avatar large">
                  SA
                </div>

                <div>

                  <strong>
                    Super Admin
                  </strong>

                  <span>
                    admin@valetparking.com
                  </span>

                </div>

              </div>


              <div className="profile-menu-divider"></div>


              <button className="profile-menu-item">

                <span className="menu-item-icon">
                  ◉
                </span>

                <div>
                  <strong>My Profile</strong>
                  <span>View your account</span>
                </div>

              </button>


              <button className="profile-menu-item">

                <span className="menu-item-icon">
                  ⚙
                </span>

                <div>
                  <strong>Settings</strong>
                  <span>Manage preferences</span>
                </div>

              </button>


              <div className="profile-menu-divider"></div>


              <button className="profile-menu-item logout-menu">

                <span className="menu-item-icon">
                  ↪
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