import React, { useState } from "react";
import {
  Building2,
  Phone,
  ShieldCheck,
  LockKeyhole,
  Smartphone,
  Monitor,
  Clock3,
  KeyRound,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import "./css/ParkingAdminProfile.css";

const ParkingAdminProfile = () => {
  const [profile] = useState({
    name: "ParkAdmin",
    email: "admin@valetparking.com",
    phone: "+91 98765 43210",
    role: "Parking Admin",
    facility: "Central Valora Hub",
    accountStatus: "Active",
  });

  return (
    <div className="profile-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="profile-page-header">

        <div>
          <span className="profile-eyebrow">
            ACCOUNT & FACILITY
          </span>

          <h2>My Profile</h2>

          <p>
            Manage your account information, facility details,
            security and access settings.
          </p>
        </div>

      </div>


      {/* ======================================================
          PROFILE OVERVIEW
      ====================================================== */}

      <section className="profile-overview">

        <div className="profile-main">

          <div className="profile-large-avatar">
            PA
          </div>

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

          <small>
            Assigned by Super Admin
          </small>

        </div>

      </section>


      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="profile-grid">

        {/* ====================================================
            ORGANIZATION & FACILITY
        ==================================================== */}

        <section className="profile-panel">

          <div className="profile-panel-header">

            <div>

              <h3>
                Organization & Facility
              </h3>

              <p>
                Details about your assigned parking facility.
              </p>

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
                <Phone size={15} />
              </div>

              <div>
                <span>PHONE NUMBER</span>
                <strong>{profile.phone}</strong>
              </div>

            </div>


            <div className="profile-field">

              <div className="field-icon success">
                <CheckCircle2 size={15} />
              </div>

              <div>
                <span>ACCOUNT STATUS</span>

                <strong className="text-green">
                  {profile.accountStatus}
                </strong>
              </div>

            </div>


            <div className="profile-field">

              <div className="field-icon">
                <ShieldCheck size={15} />
              </div>

              <div>
                <span>ACCESS LEVEL</span>

                <strong>
                  Parking Admin Access
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            SECURITY & ACCESS
        ==================================================== */}

        <section className="profile-panel profile-security">

          <div className="profile-panel-header">

            <div>

              <h3>
                Security & Access
              </h3>

              <p>
                Manage your account security and access.
              </p>

            </div>

            <div className="profile-panel-icon">
              <ShieldCheck size={17} />
            </div>

          </div>


          <div className="security-options">

            {/* PASSWORD */}

            <div className="security-option">

              <div className="security-option-icon">
                <LockKeyhole size={17} />
              </div>

              <div className="security-option-content">

                <strong>
                  Password
                </strong>

                <span>
                  Last changed 14 days ago
                </span>

              </div>

              <button
                type="button"
                className="security-btn"
              >
                Change
                <ChevronRight size={14} />
              </button>

            </div>


            {/* TWO FACTOR AUTHENTICATION */}

            <div className="security-option">

              <div className="security-option-icon">
                <Smartphone size={17} />
              </div>

              <div className="security-option-content">

                <strong>
                  Two-Factor Authentication
                </strong>

                <span>
                  Add an extra layer of account protection
                </span>

              </div>

              <button
                type="button"
                className="security-btn security-btn-primary"
              >
                Enable
                <ChevronRight size={14} />
              </button>

            </div>


            {/* ACTIVE SESSIONS */}

            <div className="security-option">

              <div className="security-option-icon">
                <Monitor size={17} />
              </div>

              <div className="security-option-content">

                <strong>
                  Active Sessions
                </strong>

                <span>
                  1 active session on this device
                </span>

              </div>

              <button
                type="button"
                className="security-btn"
              >
                View
                <ChevronRight size={14} />
              </button>

            </div>


            {/* LOGIN ACTIVITY */}

            <div className="security-option">

              <div className="security-option-icon">
                <Clock3 size={17} />
              </div>

              <div className="security-option-content">

                <strong>
                  Login Activity
                </strong>

                <span>
                  Review recent account access
                </span>

              </div>

              <button
                type="button"
                className="security-btn"
              >
                View
                <ChevronRight size={14} />
              </button>

            </div>

          </div>

        </section>

      </div>


      {/* ======================================================
          ACCESS INFORMATION
      ====================================================== */}

      <section className="profile-access-card">

        <div className="access-card-icon">
          <KeyRound size={18} />
        </div>

        <div className="access-card-content">

          <h3>
            Access & Permissions
          </h3>

          <p>
            Your access level and facility assignment are managed
            by the Super Admin. Contact your administrator if you
            need changes to your permissions.
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