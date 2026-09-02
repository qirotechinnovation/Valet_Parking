import React, { useEffect, useState } from "react";
import {
  Building2,
  Mail,
  ShieldCheck,
  LockKeyhole,
  Smartphone,
  Monitor,
  Clock3,
  KeyRound,
  CheckCircle2,
  LogOut,
  User,
} from "lucide-react";
import { getParkingAdminProfile } from "../../api/parkingApi";
import "./css/ParkingAdminProfile.css";

const ParkingAdminProfile = ({ onLogout }) => {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        return {
          name: u.name || "Parking Admin",
          email: u.email || "admin@valetparking.com",
          role: "Parking Admin",
          facility: "Aura Central Valet Facility",
          accountStatus: "Active",
          created_at: u.created_at,
        };
      }
    } catch (e) {
      // fallback
    }
    return {
      name: "Parking Admin",
      email: "admin@valetparking.com",
      role: "Parking Admin",
      facility: "Aura Central Valet Facility",
      accountStatus: "Active",
      created_at: null,
    };
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getParkingAdminProfile();
        if (response && response.success && response.user) {
          const u = response.user;
          setProfile({
            name: u.name || "Parking Admin",
            email: u.email || "admin@valetparking.com",
            role: "Parking Admin",
            facility: "Aura Central Valet Facility",
            accountStatus: u.is_active !== false ? "Active" : "Inactive",
            created_at: u.created_at,
          });
        }
      } catch (err) {
        console.warn("Could not fetch remote profile, using local:", err);
      }
    };

    fetchProfile();
  }, []);

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PA";

  const formattedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Active Member";

  return (
    <div className="profile-page">
      {/* PAGE HEADER */}
      <div className="profile-page-header">
        <div>
          <span className="profile-eyebrow">ACCOUNT & FACILITY</span>
          <h2>My Profile</h2>
          <p>
            Manage your account details, facility operations, security and access privileges.
          </p>
        </div>
      </div>

      {/* PROFILE OVERVIEW */}
      <section className="profile-overview">
        <div className="profile-main">
          <div className="profile-large-avatar">{initials}</div>

          <div className="profile-main-info">
            <h3>{profile.name}</h3>
            <p>{profile.email}</p>

            <div className="profile-status">
              <span className="profile-status-dot"></span>
              {profile.accountStatus} Account
            </div>
          </div>
        </div>

        <div className="profile-role">
          <span>APPLICATION ROLE</span>
          <strong>{profile.role}</strong>
          <small>Assigned by Super Admin</small>
        </div>
      </section>

      {/* MAIN GRID */}
      <div className="profile-grid">
        {/* ORGANIZATION & FACILITY */}
        <section className="profile-panel">
          <div className="profile-panel-header">
            <div>
              <h3>Organization & Facility</h3>
              <p>Details about your assigned parking facility.</p>
            </div>
            <div className="profile-panel-icon">
              <Building2 size={17} />
            </div>
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <div className="field-icon">
                <Building2 size={15} />
              </div>
              <div>
                <span>FACILITY NAME</span>
                <strong>{profile.facility}</strong>
              </div>
            </div>

            <div className="profile-field">
              <div className="field-icon">
                <Mail size={15} />
              </div>
              <div>
                <span>ACCOUNT EMAIL</span>
                <strong>{profile.email}</strong>
              </div>
            </div>

            <div className="profile-field">
              <div className="field-icon success">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <span>ACCOUNT STATUS</span>
                <strong className="text-green">{profile.accountStatus}</strong>
              </div>
            </div>

            <div className="profile-field">
              <div className="field-icon">
                <ShieldCheck size={15} />
              </div>
              <div>
                <span>ACCESS LEVEL</span>
                <strong>Parking Operations & Dispatch</strong>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY & ACCESS */}
        <section className="profile-panel profile-security">
          <div className="profile-panel-header">
            <div>
              <h3>Security & Session</h3>
              <p>Your current session and access details.</p>
            </div>
            <div className="profile-panel-icon">
              <ShieldCheck size={17} />
            </div>
          </div>

          <div className="security-options">
            <div className="security-option">
              <div className="security-option-icon">
                <Monitor size={17} />
              </div>
              <div className="security-option-content">
                <strong>Active Web Session</strong>
                <span>Authenticated via Supabase JWT Token</span>
              </div>
              <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "700" }}>
                Active
              </span>
            </div>

            <div className="security-option">
              <div className="security-option-icon">
                <Clock3 size={17} />
              </div>
              <div className="security-option-content">
                <strong>Member Since</strong>
                <span>{formattedDate}</span>
              </div>
            </div>

            {onLogout && (
              <div className="security-option" style={{ marginTop: "12px", borderTop: "1px solid #f1edfa", paddingTop: "14px" }}>
                <div className="security-option-icon" style={{ background: "#fef2f2", color: "#b91c1c" }}>
                  <LogOut size={17} />
                </div>
                <div className="security-option-content">
                  <strong>Sign Out</strong>
                  <span>Terminate your current session on this device</span>
                </div>
                <button
                  type="button"
                  className="security-btn"
                  style={{ background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" }}
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ACCESS INFORMATION */}
      <section className="profile-access-card">
        <div className="access-card-icon">
          <KeyRound size={18} />
        </div>
        <div className="access-card-content">
          <h3>Access & Permissions</h3>
          <p>
            Your access level and parking facility privileges are configured in the system.
            You have permissions to check in vehicles, assign slots and valets, and manage retrieval queues.
          </p>
        </div>
        <div className="access-card-role">
          <span>ROLE</span>
          <strong>{profile.role}</strong>
        </div>
      </section>
    </div>
  );
};

export default ParkingAdminProfile;