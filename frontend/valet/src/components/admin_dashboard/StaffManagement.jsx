import { useEffect, useMemo, useState } from "react";
import {
  createStaff,
  getAllStaff,
  updateStaff,
  updateStaffStatus,
} from "../../api/staffApi";

import "./StaffManagement.css";


// ============================================================
// ROLE HELPERS
// ============================================================

const ROLE_LABELS = {
  parking_admin: "Parking Admin",
  reception_security: "Security / Reception",
  valet: "Valet",
  cashier: "Cashier",
  super_admin: "Super Admin",
};

const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || role || "Unknown";
};

const getRoleClass = (role) => {
  return `role-${String(role || "")
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("/", "-")}`;
};

const getInitials = (name) => {
  if (!name) return "NA";

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const formatDate = (date) => {
  if (!date) return "--";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "--";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


// ============================================================
// COMPONENT
// ============================================================

function StaffManagement() {

  // ----------------------------------------------------------
  // MODALS
  // ----------------------------------------------------------

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [openAction, setOpenAction] = useState(null);

  const [selectedStaff, setSelectedStaff] = useState(null);

  const [editingStaff, setEditingStaff] = useState(null);

  const [statusStaff, setStatusStaff] = useState(null);


  // ----------------------------------------------------------
  // STAFF DATA
  // ----------------------------------------------------------

  const [staff, setStaff] = useState([]);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [statusUpdating, setStatusUpdating] = useState(false);

  const [editSubmitting, setEditSubmitting] = useState(false);


  // ----------------------------------------------------------
  // SEARCH / FILTER
  // ----------------------------------------------------------

  const [searchTerm, setSearchTerm] = useState("");

  const [roleFilter, setRoleFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");


  // ----------------------------------------------------------
  // MESSAGES
  // ----------------------------------------------------------

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");


  // ----------------------------------------------------------
  // ADD STAFF FORM
  // ----------------------------------------------------------

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });


  // ----------------------------------------------------------
  // EDIT STAFF FORM
  // ----------------------------------------------------------

  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "",
  });


  // ==========================================================
  // LOAD STAFF
  // ==========================================================

  useEffect(() => {
    loadStaff();
  }, []);


  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllStaff();

      setStaff(response?.users || []);

    } catch (error) {

      console.error("Failed to load staff:", error);

      setError(
        error?.message || "Failed to load staff members."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // AUTO HIDE SUCCESS MESSAGE
  // ==========================================================

  useEffect(() => {

    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timer);

  }, [successMessage]);


  // ==========================================================
  // FORM INPUT
  // ==========================================================

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================================
  // EDIT FORM INPUT
  // ==========================================================

  const handleEditInputChange = (e) => {

    const { name, value } = e.target;

    setEditFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================================
  // OPEN ADD STAFF MODAL
  // ==========================================================

  const openAddStaffModal = () => {

    setError("");

    setSuccessMessage("");

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
    });

    setShowPassword(false);

    setShowAddStaff(true);
  };


  // ==========================================================
  // CLOSE ADD STAFF MODAL
  // ==========================================================

  const closeAddStaffModal = () => {

    if (submitting) return;

    setShowAddStaff(false);

    setShowPassword(false);

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
    });
  };


  // ==========================================================
  // CREATE STAFF
  // ==========================================================

  const handleCreateStaff = async (e) => {
  e.preventDefault();

  console.log("CREATE STAFF BUTTON CLICKED");

  setError("");
  setSuccessMessage("");

  console.log("FORM DATA:", formData);

  // Validation
  if (
    !formData.name ||
    !formData.email ||
    !formData.password ||
    !formData.role
  ) {
    console.log("VALIDATION FAILED");
    console.log({
      name: formData.name,
      email: formData.email,
      password: formData.password ? "PASSWORD ENTERED" : "PASSWORD EMPTY",
      role: formData.role,
    });

    setError("Please fill in all required fields.");
    return;
  }

  console.log("VALIDATION PASSED");

  if (formData.password.length < 8) {
    console.log("PASSWORD VALIDATION FAILED");

    setError("Password must be at least 8 characters.");
    return;
  }

  console.log("PASSWORD VALIDATION PASSED");

  try {
    setSubmitting(true);

    console.log("CALLING createStaff()");

    const response = await createStaff(formData);

    console.log("CREATE STAFF RESPONSE:", response);

    if (!response?.success) {
      throw new Error(
        response?.message || "Failed to create staff."
      );
    }

    console.log("STAFF CREATED SUCCESSFULLY");

    setSuccessMessage(
      response.message || "Staff member created successfully."
    );

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
    });

    setShowAddStaff(false);

    await loadStaff();

  } catch (error) {
    console.error("CREATE STAFF API ERROR:", error);

    setError(
      error.message || "Failed to create staff member."
    );
  } finally {
    setSubmitting(false);
  }
};


  // ==========================================================
  // FILTERED STAFF
  // ==========================================================

  const filteredStaff = useMemo(() => {

    return staff.filter((staffMember) => {

      const search = searchTerm
        .toLowerCase()
        .trim();


      const matchesSearch =
        !search ||
        staffMember.name
          ?.toLowerCase()
          .includes(search) ||
        staffMember.email
          ?.toLowerCase()
          .includes(search);


      const matchesRole =
        roleFilter === "all" ||
        staffMember.role === roleFilter;


      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          staffMember.is_active === true) ||
        (statusFilter === "inactive" &&
          staffMember.is_active === false);


      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });

  }, [
    staff,
    searchTerm,
    roleFilter,
    statusFilter,
  ]);


  // ==========================================================
  // SUMMARY COUNTS
  // ==========================================================

  const totalStaff = staff.length;

  const activeStaff = staff.filter(
    (member) => member.is_active === true
  ).length;

  const inactiveStaff = staff.filter(
    (member) => member.is_active === false
  ).length;


  // ==========================================================
  // OPEN VIEW MODAL
  // ==========================================================

  const handleViewStaff = (staffMember) => {

    setSelectedStaff(staffMember);

    setOpenAction(null);

    setError("");
  };


  // ==========================================================
  // OPEN EDIT MODAL
  // ==========================================================

  const handleOpenEdit = (staffMember) => {

    setEditingStaff(staffMember);

    setEditFormData({
      name: staffMember.name || "",
      role: staffMember.role || "",
    });

    setSelectedStaff(null);

    setOpenAction(null);

    setError("");
  };


  // ==========================================================
  // UPDATE STAFF
  // ==========================================================

  const handleUpdateStaff = async (e) => {

    e.preventDefault();

    if (!editingStaff) return;


    setError("");

    setSuccessMessage("");


    if (!editFormData.name.trim()) {

      setError("Staff name is required.");

      return;
    }


    if (!editFormData.role) {

      setError("Please select a staff role.");

      return;
    }


    try {

      setEditSubmitting(true);


      const response = await updateStaff(
        editingStaff.id,
        {
          name: editFormData.name.trim(),
          role: editFormData.role,
        }
      );


      setSuccessMessage(
        response?.message ||
        "Staff updated successfully."
      );


      setEditingStaff(null);


      await loadStaff();

    } catch (error) {

      console.error(
        "Update staff error:",
        error
      );

      setError(
        error?.message ||
        "Failed to update staff."
      );

    } finally {

      setEditSubmitting(false);
    }
  };


  // ==========================================================
  // OPEN STATUS CONFIRMATION
  // ==========================================================

  const handleOpenStatusModal = (staffMember) => {

    setStatusStaff(staffMember);

    setOpenAction(null);

    setError("");
  };


  // ==========================================================
  // ACTIVATE / DEACTIVATE STAFF
  // ==========================================================

  const handleConfirmStatusChange = async () => {

    if (!statusStaff) return;


    try {

      setStatusUpdating(true);

      setError("");


      const newStatus =
        !statusStaff.is_active;


      const response =
        await updateStaffStatus(
          statusStaff.id,
          newStatus
        );


      setSuccessMessage(
        response?.message ||
        `Staff ${
          newStatus
            ? "activated"
            : "deactivated"
        } successfully.`
      );


      setStatusStaff(null);


      await loadStaff();

    } catch (error) {

      console.error(
        "Update staff status error:",
        error
      );

      setError(
        error?.message ||
        "Failed to update staff status."
      );

    } finally {

      setStatusUpdating(false);
    }
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="staff-page">


      {/* ======================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {successMessage && (

        <div className="staff-success-message">

          <span>✓</span>

          <span>
            {successMessage}
          </span>

          <button
            onClick={() =>
              setSuccessMessage("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (

        <div className="staff-error-message">

          <span>!</span>

          <span>
            {error}
          </span>

          <button
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="staff-page-header">

        <div>

          <p className="staff-eyebrow">
            MANAGEMENT
          </p>

          <h1>
            Staff Management
          </h1>

          <p>
            Manage system staff, roles and account access.
          </p>

        </div>


        <button
          className="add-staff-btn"
          onClick={openAddStaffModal}
        >

          <span>+</span>

          Add Staff

        </button>

      </div>


      {/* ======================================================
          STAFF SUMMARY
      ====================================================== */}

      <div className="staff-summary">

        <div className="staff-summary-item">

          <span>
            Total Staff
          </span>

          <strong>
            {loading ? "--" : totalStaff}
          </strong>

        </div>


        <div className="staff-summary-item">

          <span>
            Active
          </span>

          <strong className="active-count">
            {loading ? "--" : activeStaff}
          </strong>

        </div>


        <div className="staff-summary-item">

          <span>
            Inactive
          </span>

          <strong className="inactive-count">
            {loading ? "--" : inactiveStaff}
          </strong>

        </div>

      </div>


      {/* ======================================================
          TABLE CARD
      ====================================================== */}

      <section className="staff-table-card">


        {/* ====================================================
            TOOLBAR
        ==================================================== */}

        <div className="staff-toolbar">


          <div className="staff-search">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>


          <div className="staff-filters">


            {/* ROLE FILTER */}

            <select
              className="filter-button"
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value)
              }
            >

              <option value="all">
                All Roles
              </option>

              <option value="parking_admin">
                Parking Admin
              </option>

              <option value="reception_security">
                Security / Reception
              </option>

              <option value="valet">
                Valet
              </option>

              <option value="cashier">
                Cashier
              </option>

            </select>


            {/* STATUS FILTER */}

            <select
              className="filter-button"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >

              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>


        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="staff-table-wrapper">

          <table className="staff-table">

            <thead>

              <tr>

                <th>
                  STAFF MEMBER
                </th>

                <th>
                  ROLE
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  CREATED
                </th>

                <th className="actions-column">
                  ACTIONS
                </th>

              </tr>

            </thead>


            <tbody>


              {/* LOADING */}

              {loading && (

                <tr>

                  <td
                    colSpan="5"
                    className="table-loading"
                  >

                    <div className="loading-spinner"></div>

                    <span>
                      Loading staff...
                    </span>

                  </td>

                </tr>

              )}


              {/* EMPTY */}

              {!loading &&
                filteredStaff.length === 0 && (

                  <tr>

                    <td
                      colSpan="5"
                      className="table-empty"
                    >

                      <div className="empty-staff-state">

                        <div className="empty-staff-icon">
                          👥
                        </div>

                        <strong>
                          No staff members found
                        </strong>

                        <span>
                          {searchTerm ||
                          roleFilter !== "all" ||
                          statusFilter !== "all"
                            ? "Try changing your search or filters."
                            : "Add your first staff member to get started."}
                        </span>

                      </div>

                    </td>

                  </tr>

                )}


              {/* STAFF ROWS */}

              {!loading &&
                filteredStaff.map(
                  (staffMember) => (

                    <tr
                      key={staffMember.id}
                    >


                      {/* STAFF */}

                      <td>

                        <div className="staff-member">

                          <div className="staff-avatar">

                            {getInitials(
                              staffMember.name
                            )}

                          </div>


                          <div className="staff-member-info">

                            <strong>
                              {staffMember.name}
                            </strong>

                            <span>
                              {staffMember.email}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* ROLE */}

                      <td>

                        <span
                          className={`role-badge ${getRoleClass(
                            staffMember.role
                          )}`}
                        >
                          {getRoleLabel(
                            staffMember.role
                          )}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`status-badge ${
                            staffMember.is_active
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >

                          <span className="status-dot"></span>

                          {staffMember.is_active
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>


                      {/* CREATED */}

                      <td>

                        <span className="created-date">

                          {formatDate(
                            staffMember.created_at
                          )}

                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="staff-actions">


                          <button
                            className="table-action view"
                            onClick={() =>
                              handleViewStaff(
                                staffMember
                              )
                            }
                          >
                            View
                          </button>


                          <button
                            className="table-action edit"
                            onClick={() =>
                              handleOpenEdit(
                                staffMember
                              )
                            }
                          >
                            Edit
                          </button>


                          <button
                            className="more-action"
                            onClick={() =>
                              setOpenAction(
                                openAction ===
                                  staffMember.id
                                  ? null
                                  : staffMember.id
                              )
                            }
                          >
                            ⋮
                          </button>


                          {openAction ===
                            staffMember.id && (

                            <div className="action-menu">


                              <button
                                onClick={() =>
                                  handleViewStaff(
                                    staffMember
                                  )
                                }
                              >
                                View Details
                              </button>


                              <button
                                onClick={() =>
                                  handleOpenEdit(
                                    staffMember
                                  )
                                }
                              >
                                Edit Staff
                              </button>


                              <div className="action-divider"></div>


                              <button
                                className={
                                  staffMember.is_active
                                    ? "danger-action"
                                    : "activate-action"
                                }
                                onClick={() =>
                                  handleOpenStatusModal(
                                    staffMember
                                  )
                                }
                              >

                                {staffMember.is_active
                                  ? "Deactivate"
                                  : "Activate"}

                              </button>

                            </div>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )}

            </tbody>

          </table>

        </div>


        {/* ====================================================
            TABLE FOOTER
        ==================================================== */}

        <div className="staff-table-footer">

          <span>

            Showing{" "}

            <strong>
              {filteredStaff.length}
            </strong>{" "}

            of{" "}

            <strong>
              {staff.length}
            </strong>{" "}

            staff members

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


      {/* ======================================================
          ADD STAFF MODAL
      ====================================================== */}

      {showAddStaff && (

        <div
          className="modal-overlay"
          onClick={closeAddStaffModal}
        >

          <div
            className="add-staff-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* HEADER */}

            <div className="modal-header">

              <div>

                <p className="modal-eyebrow">
                  STAFF MANAGEMENT
                </p>

                <h2>
                  Add New Staff
                </h2>

                <p>
                  Create an account and assign a system role.
                </p>

              </div>


              <button
                className="modal-close"
                onClick={closeAddStaffModal}
                disabled={submitting}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="staff-form"
              onSubmit={handleCreateStaff}
            >


              {/* NAME */}

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter staff name"
                  disabled={submitting}
                />

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="staff@example.com"
                  disabled={submitting}
                />

              </div>


              {/* PASSWORD */}

              <div className="form-group">

                <label>
                  Password
                </label>


                <div className="password-input">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a secure password"
                    disabled={submitting}
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={submitting}
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>


                <span className="field-hint">
                  Use at least 8 characters.
                </span>

              </div>


              {/* ROLE */}

              <div className="form-group">

                <label>
                  Staff Role
                </label>


                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={submitting}
                >

                  <option
                    value=""
                    disabled
                  >
                    Select a role
                  </option>


                  <option value="parking_admin">
                    Parking Admin
                  </option>


                  <option value="reception_security">
                    Security / Reception
                  </option>


                  <option value="valet">
                    Valet
                  </option>


                  <option value="cashier">
                    Cashier
                  </option>

                </select>

              </div>


              {/* INFO */}

              <div className="role-info">

                <div className="role-info-icon">
                  i
                </div>


                <p>
                  Parking Admin accounts will have
                  access to the separate Parking Admin
                  Dashboard.
                </p>

              </div>


              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeAddStaffModal}
                  disabled={submitting}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="create-staff-btn"
                  disabled={submitting}
                >

                  {submitting
                    ? "Creating..."
                    : "Create Staff"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          VIEW STAFF DETAILS MODAL
      ====================================================== */}

      {selectedStaff && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedStaff(null)
          }
        >

          <div
            className="staff-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* HEADER */}

            <div className="details-header">

              <div>

                <p className="modal-eyebrow">
                  STAFF PROFILE
                </p>

                <h2>
                  Staff Details
                </h2>

                <p>
                  View account and role information.
                </p>

              </div>


              <button
                className="modal-close"
                onClick={() =>
                  setSelectedStaff(null)
                }
              >
                ×
              </button>

            </div>


            {/* PROFILE */}

            <div className="staff-profile">

              <div className="large-staff-avatar">
                {getInitials(
                  selectedStaff.name
                )}
              </div>


              <div className="staff-profile-info">

                <h3>
                  {selectedStaff.name}
                </h3>

                <p>
                  {selectedStaff.email}
                </p>


                <span
                  className={`status-badge ${
                    selectedStaff.is_active
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >

                  <span className="status-dot"></span>

                  {selectedStaff.is_active
                    ? "Active"
                    : "Inactive"}

                </span>

              </div>

            </div>


            {/* ACCOUNT INFORMATION */}

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
                    className={`role-badge ${getRoleClass(
                      selectedStaff.role
                    )}`}
                  >
                    {getRoleLabel(
                      selectedStaff.role
                    )}
                  </span>

                </div>


                <div className="detail-item">

                  <span className="detail-label">
                    Account Status
                  </span>


                  <span
                    className={`status-badge ${
                      selectedStaff.is_active
                        ? "status-active"
                        : "status-inactive"
                    }`}
                  >

                    <span className="status-dot"></span>

                    {selectedStaff.is_active
                      ? "Active"
                      : "Inactive"}

                  </span>

                </div>


                <div className="detail-item">

                  <span className="detail-label">
                    Created Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedStaff.created_at
                    )}
                  </strong>

                </div>


                <div className="detail-item">

                  <span className="detail-label">
                    Staff ID
                  </span>

                  <strong className="staff-id">
                    #{String(
                      selectedStaff.id
                    ).padStart(5, "0")}
                  </strong>

                </div>

              </div>

            </div>


            {/* ROLE DESCRIPTION */}

            <div className="role-description">

              <div className="role-description-icon">
                ✓
              </div>


              <div>

                <strong>
                  {getRoleLabel(
                    selectedStaff.role
                  )}
                </strong>


                <p>
                  This account is assigned the{" "}
                  <b>
                    {getRoleLabel(
                      selectedStaff.role
                    )}
                  </b>{" "}
                  role within the Valet Parking
                  Management System.
                </p>

              </div>

            </div>


            {/* FOOTER */}

            <div className="details-footer">

              <button
                className="details-secondary-btn"
                onClick={() =>
                  setSelectedStaff(null)
                }
              >
                Close
              </button>


              <button
                className="details-edit-btn"
                onClick={() =>
                  handleOpenEdit(
                    selectedStaff
                  )
                }
              >
                Edit Staff
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ======================================================
          EDIT STAFF MODAL
      ====================================================== */}

      {editingStaff && (

        <div
          className="modal-overlay"
          onClick={() =>
            !editSubmitting &&
            setEditingStaff(null)
          }
        >

          <div
            className="edit-staff-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* HEADER */}

            <div className="modal-header">

              <div>

                <p className="modal-eyebrow">
                  STAFF MANAGEMENT
                </p>

                <h2>
                  Edit Staff
                </h2>

                <p>
                  Update staff name and role information.
                </p>

              </div>


              <button
                className="modal-close"
                onClick={() =>
                  setEditingStaff(null)
                }
                disabled={editSubmitting}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="staff-form"
              onSubmit={handleUpdateStaff}
            >


              {/* NAME */}

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={
                    handleEditInputChange
                  }
                  placeholder="Enter staff name"
                  disabled={editSubmitting}
                />

              </div>


              {/* EMAIL - READ ONLY */}

              <div className="form-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={
                    editingStaff.email || ""
                  }
                  readOnly
                  disabled
                />

                <span className="field-hint">
                  Email cannot be changed using the current
                  staff update API.
                </span>

              </div>


              {/* ROLE */}

              <div className="form-group">

                <label>
                  Staff Role
                </label>


                <select
                  name="role"
                  value={editFormData.role}
                  onChange={
                    handleEditInputChange
                  }
                  disabled={editSubmitting}
                >

                  <option value="parking_admin">
                    Parking Admin
                  </option>


                  <option value="reception_security">
                    Security / Reception
                  </option>


                  <option value="valet">
                    Valet
                  </option>


                  <option value="cashier">
                    Cashier
                  </option>

                </select>

              </div>


              {/* STATUS - READ ONLY */}

              <div className="form-group">

                <label>
                  Account Status
                </label>


                <input
                  type="text"
                  value={
                    editingStaff.is_active
                      ? "Active"
                      : "Inactive"
                  }
                  readOnly
                  disabled
                />


                <span className="field-hint">
                  Use the Activate / Deactivate action
                  to change account status.
                </span>

              </div>


              {/* INFO */}

              <div className="edit-role-warning">

                <div className="role-info-icon">
                  !
                </div>


                <p>
                  Changing the staff role may change
                  the dashboards and permissions
                  available to this account.
                </p>

              </div>


              {/* FOOTER */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setEditingStaff(null)
                  }
                  disabled={editSubmitting}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="create-staff-btn"
                  disabled={editSubmitting}
                >

                  {editSubmitting
                    ? "Saving..."
                    : "Save Changes"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          ACTIVATE / DEACTIVATE CONFIRMATION
      ====================================================== */}

      {statusStaff && (

        <div
          className="modal-overlay"
          onClick={() =>
            !statusUpdating &&
            setStatusStaff(null)
          }
        >

          <div
            className="status-confirm-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* ICON */}

            <div
              className={`status-confirm-icon ${
                statusStaff.is_active
                  ? "deactivate-icon"
                  : "activate-icon"
              }`}
            >

              {statusStaff.is_active
                ? "!"
                : "✓"}

            </div>


            {/* CONTENT */}

            <div className="status-confirm-content">

              <h2>

                {statusStaff.is_active
                  ? "Deactivate Staff?"
                  : "Activate Staff?"}

              </h2>


              <p>

                {statusStaff.is_active

                  ? `Are you sure you want to deactivate ${statusStaff.name}? They will no longer be able to access their account until it is activated again.`

                  : `Are you sure you want to activate ${statusStaff.name}? They will regain access to their account.`}

              </p>

            </div>


            {/* STAFF PREVIEW */}

            <div className="status-staff-preview">

              <div className="status-preview-avatar">

                {getInitials(
                  statusStaff.name
                )}

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


            {/* ACTIONS */}

            <div className="status-confirm-actions">

              <button
                className="status-cancel-btn"
                onClick={() =>
                  setStatusStaff(null)
                }
                disabled={statusUpdating}
              >
                Cancel
              </button>


              <button
                className={
                  statusStaff.is_active
                    ? "status-deactivate-btn"
                    : "status-activate-btn"
                }
                onClick={
                  handleConfirmStatusChange
                }
                disabled={statusUpdating}
              >

                {statusUpdating

                  ? "Updating..."

                  : statusStaff.is_active
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