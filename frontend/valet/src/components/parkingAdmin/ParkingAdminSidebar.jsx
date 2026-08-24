import React from "react";
import "./css/ParkingAdminSidebar.css";

import {
  LayoutDashboard,
  ParkingSquare,
  CarFront,
  Users,
  ShieldCheck,
  BarChart3,
  UserRoundPen,
  LogOut,
  ClipboardList
} from "lucide-react";

const ParkingAdminSidebar = ({
  activeTab,
  setActiveTab,
  onLogout,
}) => {

  const mainMenu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "parking-slots",
      label: "Parking Slots",
      icon: ParkingSquare,
    },
    {
      id: "parking-operations",
      label: "Parking Operations",
      icon: CarFront,
    },
    {
      id: "valet-management",
      label: "Valet Management",
      icon: Users,
    },
    {
    id: "parking-sessions",
    label: "Parking Sessions",
    icon: ClipboardList,
  },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
    },
  ];


  return (
    <aside className="aura-sidebar">

      {/* ======================================================
          BRAND
      ====================================================== */}

      <div className="aura-brand">

        <div className="brand-badge">
          A
        </div>

        <div className="brand-title">

          <h2>AURA</h2>

          <span>
            VALET PARKING
          </span>

        </div>

      </div>


      {/* ======================================================
          MAIN MENU
      ====================================================== */}

      <div className="sidebar-section">

        <span className="section-label">
          MAIN MENU
        </span>

        <nav className="menu-list">

          {mainMenu.map((item) => {

            const Icon = item.icon;

            const isActive =
              activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`menu-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() =>
                  setActiveTab(item.id)
                }
                aria-current={
                  isActive ? "page" : undefined
                }
              >

                <span className="item-icon">

                  <Icon
                    size={18}
                    strokeWidth={
                      isActive ? 2.2 : 1.9
                    }
                  />

                </span>

                <span className="item-text">
                  {item.label}
                </span>

              </button>
            );

          })}

        </nav>

      </div>


      {/* ======================================================
          ACCOUNT
      ====================================================== */}

      <div className="sidebar-section account-section">

        <span className="section-label">
          ACCOUNT
        </span>

        <button
          type="button"
          className={`menu-item ${
            activeTab === "profile"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("profile")
          }
        >

          <span className="item-icon">

            <UserRoundPen
              size={18}
              strokeWidth={
                activeTab === "profile"
                  ? 2.2
                  : 1.9
              }
            />

          </span>

          <span className="item-text">
            Profile
          </span>

        </button>

      </div>


      {/* ======================================================
          LOGOUT
      ====================================================== */}

      <div className="sidebar-footer">

        <button
          type="button"
          className="logout-btn"
          onClick={onLogout}
        >

          <span className="item-icon">
            <span><LogOut/></span>
          </span>

          <span className="item-text">
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
};

export default ParkingAdminSidebar;