import { useState } from "react";
import "./StaffManagement.css";

const previewStaff = [
  {
    id: 1,
    name: "Aarav Mehta",
    email: "aarav@example.com",
    role: "Parking Admin",
    status: "Active",
    created: "17 Aug 2026",
  },
];

function StaffManagement() {
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openAction, setOpenAction] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [statusStaff, setStatusStaff] = useState(null);



  return (
    <div className="staff-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="staff-page-header">

        <div>
          <p className="staff-eyebrow">
            MANAGEMENT
          </p>

          <h1>Staff Management</h1>

          <p>
            Manage system staff, roles and account access.
          </p>
        </div>

        <button className="add-staff-btn" onClick={() => setShowAddStaff(true)}>

          <span>+</span>
          Add Staff
        </button>

      </div>


      {/* =========================
          STAFF SUMMARY
      ========================= */}

      <div className="staff-summary">

        <div className="staff-summary-item">
          <span>Total Staff</span>
          <strong>--</strong>
        </div>

        <div className="staff-summary-item">
          <span>Active</span>
          <strong className="active-count">--</strong>
        </div>

        <div className="staff-summary-item">
          <span>Inactive</span>
          <strong className="inactive-count">--</strong>
        </div>

      </div>


      {/* =========================
          STAFF TABLE CARD
      ========================= */}

      <section className="staff-table-card">

        {/* Toolbar */}

        <div className="staff-toolbar">

          <div className="staff-search">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search staff by name or email..."
            />

          </div>


          <div className="staff-filters">

            <button className="filter-button">
              All Roles
              <span>⌄</span>
            </button>

            <button className="filter-button">
              All Status
              <span>⌄</span>
            </button>

          </div>

        </div>


        {/* Table */}

        <div className="staff-table-wrapper">

          <table className="staff-table">

            <thead>
              <tr>
                <th>STAFF MEMBER</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>CREATED</th>
                <th className="actions-column">ACTIONS</th>
              </tr>
            </thead>

            {/* <tbody> */}

            {/* Empty state for now

              <tr className="staff-empty-row">

                <td colSpan="5">

                  <div className="staff-empty">

                    <div className="staff-empty-icon">
                      ♙
                    </div>

                    <h3>No staff members yet</h3>

                    <p>
                      Staff accounts created by the Super Admin
                      will appear here.
                    </p>

                    <button className="empty-add-btn" onClick={() => setShowAddStaff(true)}>
                      + Add Staff
                    </button>

                  </div>

                </td>

              </tr> */}

            <tbody>

              {previewStaff.map((staff) => (

                <tr key={staff.id}>

                  {/* STAFF */}

                  <td>

                    <div className="staff-member">

                      <div className="staff-avatar">
                        {staff.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="staff-member-info">

                        <strong>
                          {staff.name}
                        </strong>

                        <span>
                          {staff.email}
                        </span>

                      </div>

                    </div>

                  </td>


                  {/* ROLE */}

                  <td>

                    <span
                      className={`role-badge role-${staff.role
                        .toLowerCase()
                        .replaceAll(" ", "-")
                        .replace("/", "-")}`}
                    >
                      {staff.role}
                    </span>

                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      className={`status-badge ${staff.status === "Active"
                        ? "status-active"
                        : "status-inactive"
                        }`}
                    >

                      <span className="status-dot"></span>

                      {staff.status}

                    </span>

                  </td>


                  {/* CREATED */}

                  <td>
                    <span className="created-date">
                      {staff.created}
                    </span>
                  </td>


                  {/* ACTIONS */}

                  <td>

                    <div className="staff-actions">

                      <button
                        className="table-action view"
                        onClick={() => {
                          setSelectedStaff(staff);
                          setOpenAction(null);
                        }}
                      >
                        View
                      </button>

                      <button
                        className="table-action edit"
                        onClick={() => {
                          setEditingStaff(staff);
                          setSelectedStaff(null);
                          setOpenAction(null);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="more-action"
                        onClick={() =>
                          setOpenAction(
                            openAction === staff.id
                              ? null
                              : staff.id
                          )
                        }
                      >
                        ⋮
                      </button>


                      {openAction === staff.id && (

                        <div className="action-menu">

                          <button
                            onClick={() => {
                              setSelectedStaff(staff);
                              setOpenAction(null);
                            }}
                          >
                            View Details
                          </button>

                          <button
                            onClick={() => {
                              setEditingStaff(staff);
                              setOpenAction(null);
                            }}
                          >
                            Edit Staff
                          </button>

                          <div className="action-divider"></div>

                          <button
                            className={
                              staff.status === "Active"
                                ? "danger-action"
                                : "activate-action"
                            }
                            onClick={() => {
                              setStatusStaff(staff);
                              setOpenAction(null);
                            }}
                          >
                            {staff.status === "Active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                        </div>

                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

            {/* </tbody> */}

          </table>

        </div>


        {/* Table Footer */}

        <div className="staff-table-footer">

          <span>
            Showing <strong>0</strong> staff members
          </span>

          <div className="pagination">

            <button disabled>
              ‹
            </button>

            <span className="current-page">
              1
            </span>

            <button disabled>
              ›
            </button>

          </div>

        </div>

      </section>

      {showAddStaff && (
        <div className="modal-overlay">

          <div className="add-staff-modal">

            <div className="modal-header">

              <div>
                <p className="modal-eyebrow">
                  STAFF MANAGEMENT
                </p>

                <h2>Add New Staff</h2>

                <p>
                  Create an account and assign a system role.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowAddStaff(false)}
              >
                ×
              </button>

            </div>


            <form className="staff-form">

              {/* Name */}

              <div className="form-group">
                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter staff name"
                />
              </div>


              {/* Email */}

              <div className="form-group">
                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="staff@example.com"
                />
              </div>


              {/* Password */}

              <div className="form-group">

                <label>
                  Password
                </label>

                <div className="password-input">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                <span className="field-hint">
                  Use at least 8 characters.
                </span>

              </div>


              {/* Role */}

              <div className="form-group">

                <label>
                  Staff Role
                </label>

                <select defaultValue="">
                  <option value="" disabled>
                    Select a role
                  </option>

                  <option value="super_admin">
                    Super Admin
                  </option>

                  <option value="parking_admin">
                    Parking Admin
                  </option>

                  <option value="valet">
                    Valet
                  </option>

                  <option value="security_reception">
                    Security / Reception
                  </option>

                  <option value="cashier">
                    Cashier
                  </option>

                </select>

              </div>


              {/* Info */}

              <div className="role-info">

                <div className="role-info-icon">
                  i
                </div>

                <p>
                  Parking Admin accounts will have access to
                  the separate Parking Admin Dashboard.
                </p>

              </div>


              {/* Actions */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddStaff(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-staff-btn"
                >
                  Create Staff
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {selectedStaff && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedStaff(null)}
        >

          <div
            className="staff-details-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* =========================
          HEADER
      ========================= */}

            <div className="details-header">

              <div>
                <p className="modal-eyebrow">
                  STAFF PROFILE
                </p>

                <h2>Staff Details</h2>

                <p>
                  View account and role information.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedStaff(null)}
              >
                ×
              </button>

            </div>


            {/* =========================
          PROFILE
      ========================= */}

            <div className="staff-profile">

              <div className="large-staff-avatar">
                {selectedStaff.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="staff-profile-info">

                <h3>
                  {selectedStaff.name}
                </h3>

                <p>
                  {selectedStaff.email}
                </p>

                <span
                  className={`status-badge ${selectedStaff.status === "Active"
                    ? "status-active"
                    : "status-inactive"
                    }`}
                >
                  <span className="status-dot"></span>

                  {selectedStaff.status}
                </span>

              </div>

            </div>


            {/* =========================
          INFORMATION
      ========================= */}

            <div className="details-section">

              <div className="details-section-title">
                Account Information
              </div>


              <div className="details-grid">

                <div className="detail-item">

                  <span className="detail-label">
                    Full Name
                  </span>

                  <strong>
                    {selectedStaff.name}
                  </strong>

                </div>


                <div className="detail-item">

                  <span className="detail-label">
                    Email Address
                  </span>

                  <strong>
                    {selectedStaff.email}
                  </strong>

                </div>


                <div className="detail-item">

                  <span className="detail-label">
                    Assigned Role
                  </span>

                  <span
                    className={`role-badge role-${selectedStaff.role
                      .toLowerCase()
                      .replaceAll(" ", "-")
                      .replace("/", "-")}`}
                  >
                    {selectedStaff.role}
                  </span>

                </div>


                <div className="detail-item">

                  <span className="detail-label">
                    Account Status
                  </span>

                  <span
                    className={`status-badge ${selectedStaff.status === "Active"
                      ? "status-active"
                      : "status-inactive"
                      }`}
                  >
                    <span className="status-dot"></span>

                    {selectedStaff.status}
                  </span>

                </div>


                <div className="detail-item">

                  <span className="detail-label">
                    Created Date
                  </span>

                  <strong>
                    {selectedStaff.created}
                  </strong>

                </div>


                <div className="detail-item">

                  <span className="detail-label">
                    Staff ID
                  </span>

                  <strong className="staff-id">
                    #{String(selectedStaff.id).padStart(5, "0")}
                  </strong>

                </div>

              </div>

            </div>


            {/* =========================
          ROLE DESCRIPTION
      ========================= */}

            <div className="role-description">

              <div className="role-description-icon">
                ✓
              </div>

              <div>

                <strong>
                  {selectedStaff.role}
                </strong>

                <p>
                  This account is assigned the{" "}
                  <b>{selectedStaff.role}</b> role
                  within the Valet Parking Management
                  System.
                </p>

              </div>

            </div>


            {/* =========================
          FOOTER
      ========================= */}

            <div className="details-footer">

              <button
                className="details-secondary-btn"
                onClick={() => setSelectedStaff(null)}
              >
                Close
              </button>

              <button
                className="details-edit-btn"
                onClick={() => {
                  setEditingStaff(selectedStaff);
                  setSelectedStaff(null);
                }}
              >
                Edit Staff
              </button>
            </div>

          </div>

        </div>
      )}

      {editingStaff && (
        <div
          className="modal-overlay"
          onClick={() => setEditingStaff(null)}
        >

          <div
            className="edit-staff-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}

            <div className="modal-header">

              <div>
                <p className="modal-eyebrow">
                  STAFF MANAGEMENT
                </p>

                <h2>Edit Staff</h2>

                <p>
                  Update staff account and role information.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setEditingStaff(null)}
              >
                ×
              </button>

            </div>


            {/* Form */}

            <form className="staff-form">

              {/* Name */}

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  defaultValue={editingStaff.name}
                  placeholder="Enter staff name"
                />

              </div>


              {/* Email */}

              <div className="form-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  defaultValue={editingStaff.email}
                  placeholder="staff@example.com"
                />

              </div>


              {/* Role */}

              <div className="form-group">

                <label>
                  Staff Role
                </label>

                <select
                  defaultValue={editingStaff.role}
                >

                  <option value="Super Admin">
                    Super Admin
                  </option>

                  <option value="Parking Admin">
                    Parking Admin
                  </option>

                  <option value="Valet">
                    Valet
                  </option>

                  <option value="Security / Reception">
                    Security / Reception
                  </option>

                  <option value="Cashier">
                    Cashier
                  </option>

                </select>

              </div>


              {/* Status */}

              <div className="form-group">

                <label>
                  Account Status
                </label>

                <select
                  defaultValue={editingStaff.status}
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                </select>

              </div>


              {/* Password */}

              <div className="form-group">

                <label>
                  New Password
                  <span className="optional-label">
                    Optional
                  </span>
                </label>

                <div className="password-input">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave blank to keep current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                <span className="field-hint">
                  Only enter a password if you want to change it.
                </span>

              </div>


              {/* Warning */}

              <div className="edit-role-warning">

                <div className="role-info-icon">
                  !
                </div>

                <p>
                  Changing the staff role may change the
                  dashboards and permissions available to this
                  account.
                </p>

              </div>


              {/* Footer */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingStaff(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-staff-btn"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {statusStaff && (
        <div
          className="modal-overlay"
          onClick={() => setStatusStaff(null)}
        >

          <div
            className="status-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Icon */}

            <div
              className={`status-confirm-icon ${statusStaff.status === "Active"
                  ? "deactivate-icon"
                  : "activate-icon"
                }`}
            >
              {statusStaff.status === "Active" ? "!" : "✓"}
            </div>


            {/* Content */}

            <div className="status-confirm-content">

              <h2>
                {statusStaff.status === "Active"
                  ? "Deactivate Staff?"
                  : "Activate Staff?"}
              </h2>

              <p>
                {statusStaff.status === "Active"
                  ? `Are you sure you want to deactivate ${statusStaff.name}? They will no longer be able to access their account until it is activated again.`
                  : `Are you sure you want to activate ${statusStaff.name}? They will regain access to their account.`}
              </p>

            </div>


            {/* Staff Preview */}

            <div className="status-staff-preview">

              <div className="status-preview-avatar">

                {statusStaff.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}

              </div>

              <div>

                <strong>
                  {statusStaff.name}
                </strong>

                <span>
                  {statusStaff.email}
                </span>

              </div>

            </div>


            {/* Actions */}

            <div className="status-confirm-actions">

              <button
                className="status-cancel-btn"
                onClick={() => setStatusStaff(null)}
              >
                Cancel
              </button>

              <button
                className={
                  statusStaff.status === "Active"
                    ? "status-deactivate-btn"
                    : "status-activate-btn"
                }
                onClick={() => {
                  // Backend PATCH will be connected later
                  setStatusStaff(null);
                }}
              >
                {statusStaff.status === "Active"
                  ? "Deactivate Staff"
                  : "Activate Staff"}
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default StaffManagement;