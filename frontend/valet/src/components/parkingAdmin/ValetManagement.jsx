import { useMemo, useState } from "react";
import "./css/ValetManagement.css";

const mockStaff = [
  {
    id: 1,
    name: "Aarav Patil",
    role: "Valet",
    phone: "+91 98765 43210",
    availability: "Available",
    assignment: "No assignment",
    status: "Active",
  },
  {
    id: 2,
    name: "Rohan Kulkarni",
    role: "Valet",
    phone: "+91 98234 56789",
    availability: "Busy",
    assignment: "MH12AB1234",
    status: "Active",
  },
  {
    id: 3,
    name: "Vivek Sharma",
    role: "Valet",
    phone: "+91 97654 32109",
    availability: "Available",
    assignment: "No assignment",
    status: "Active",
  },
  {
    id: 4,
    name: "Neeraj More",
    role: "Security / Reception",
    phone: "+91 96543 21098",
    availability: "Available",
    assignment: "Entrance",
    status: "Active",
  },
  {
    id: 5,
    name: "Kunal Deshmukh",
    role: "Valet",
    phone: "+91 95432 10987",
    availability: "Offline",
    assignment: "No assignment",
    status: "Inactive",
  },
  {
    id: 6,
    name: "Aditya Joshi",
    role: "Valet",
    phone: "+91 94321 09876",
    availability: "Busy",
    assignment: "MH14CD5678",
    status: "Active",
  },
];

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

function ParkingStaff() {
  const [staff] = useState(mockStaff);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [selectedStaff, setSelectedStaff] = useState(null);

  const filteredStaff = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return staff.filter((member) => {
      const matchesSearch =
        !search ||
        member.name.toLowerCase().includes(search) ||
        member.phone.toLowerCase().includes(search) ||
        member.assignment.toLowerCase().includes(search);

      const matchesRole =
        roleFilter === "all" ||
        member.role === roleFilter;

      const matchesAvailability =
        availabilityFilter === "all" ||
        member.availability.toLowerCase() ===
          availabilityFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesAvailability
      );
    });
  }, [
    staff,
    searchTerm,
    roleFilter,
    availabilityFilter,
  ]);

  const totalStaff = staff.length;

  const activeStaff = staff.filter(
    (member) => member.status === "Active"
  ).length;

  const availableStaff = staff.filter(
    (member) => member.availability === "Available"
  ).length;

  const busyStaff = staff.filter(
    (member) => member.availability === "Busy"
  ).length;

  return (
    <div className="parking-staff-page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="parking-staff-header">

        <div>
          <p className="parking-staff-eyebrow">
            OPERATIONS
          </p>

          <h1>
            Staff / Valets
          </h1>

          <p>
            Monitor operational staff availability and assignments.
          </p>
        </div>

      </div>


      {/* ====================================================
          SUMMARY
      ==================================================== */}

      <div className="parking-staff-summary">

        <div className="parking-staff-summary-card">

          <div className="staff-summary-icon">
            👥
          </div>

          <div>
            <span>Total Staff</span>
            <strong>{totalStaff}</strong>
          </div>

        </div>


        <div className="parking-staff-summary-card">

          <div className="staff-summary-icon">
            ✓
          </div>

          <div>
            <span>Active Staff</span>
            <strong>{activeStaff}</strong>
          </div>

        </div>


        <div className="parking-staff-summary-card">

          <div className="staff-summary-icon">
            ◉
          </div>

          <div>
            <span>Available</span>
            <strong>{availableStaff}</strong>
          </div>

        </div>


        <div className="parking-staff-summary-card">

          <div className="staff-summary-icon">
            ◷
          </div>

          <div>
            <span>Currently Busy</span>
            <strong>{busyStaff}</strong>
          </div>

        </div>

      </div>


      {/* ====================================================
          TABLE CARD
      ==================================================== */}

      <section className="parking-staff-card">

        {/* TOOLBAR */}

        <div className="parking-staff-toolbar">

          <div className="parking-staff-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search staff by name, phone or vehicle..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>


          <div className="parking-staff-filters">

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value)
              }
            >

              <option value="all">
                All Roles
              </option>

              <option value="Valet">
                Valet
              </option>

              <option value="Security / Reception">
                Security / Reception
              </option>

            </select>


            <select
              value={availabilityFilter}
              onChange={(e) =>
                setAvailabilityFilter(e.target.value)
              }
            >

              <option value="all">
                All Availability
              </option>

              <option value="available">
                Available
              </option>

              <option value="busy">
                Busy
              </option>

              <option value="offline">
                Offline
              </option>

            </select>

          </div>

        </div>


        {/* TABLE */}

        <div className="parking-staff-table-wrapper">

          <table className="parking-staff-table">

            <thead>

              <tr>

                <th>
                  STAFF MEMBER
                </th>

                <th>
                  ROLE
                </th>

                <th>
                  CONTACT
                </th>

                <th>
                  AVAILABILITY
                </th>

                <th>
                  CURRENT ASSIGNMENT
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  ACTION
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredStaff.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="parking-staff-empty"
                  >

                    <div>

                      <span>👥</span>

                      <strong>
                        No staff members found
                      </strong>

                      <p>
                        Try changing your search or filters.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredStaff.map((member) => (

                  <tr key={member.id}>

                    {/* STAFF */}

                    <td>

                      <div className="parking-staff-member">

                        <div className="parking-staff-avatar">
                          {getInitials(member.name)}
                        </div>

                        <div>

                          <strong>
                            {member.name}
                          </strong>

                          <span>
                            Staff ID #{String(member.id).padStart(4, "0")}
                          </span>

                        </div>

                      </div>

                    </td>


                    {/* ROLE */}

                    <td>

                      <span className="parking-staff-role">
                        {member.role}
                      </span>

                    </td>


                    {/* CONTACT */}

                    <td>

                      <span className="parking-staff-phone">
                        {member.phone}
                      </span>

                    </td>


                    {/* AVAILABILITY */}

                    <td>

                      <span
                        className={`availability-badge availability-${member.availability.toLowerCase()}`}
                      >

                        <span className="availability-dot"></span>

                        {member.availability}

                      </span>

                    </td>


                    {/* ASSIGNMENT */}

                    <td>

                      <span
                        className={
                          member.assignment === "No assignment"
                            ? "no-assignment"
                            : "staff-assignment"
                        }
                      >
                        {member.assignment}
                      </span>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`staff-status-badge ${
                          member.status === "Active"
                            ? "staff-status-active"
                            : "staff-status-inactive"
                        }`}
                      >

                        {member.status}

                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      <button
                        className="view-staff-btn"
                        onClick={() =>
                          setSelectedStaff(member)
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div className="parking-staff-footer">

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

          <div className="staff-pagination">

            <button disabled>
              ‹
            </button>

            <span>
              1
            </span>

            <button disabled>
              ›
            </button>

          </div>

        </div>

      </section>


      {/* ====================================================
          STAFF DETAILS MODAL
      ==================================================== */}

      {selectedStaff && (

        <div
          className="parking-staff-modal-overlay"
          onClick={() =>
            setSelectedStaff(null)
          }
        >

          <div
            className="parking-staff-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="parking-staff-modal-header">

              <div>

                <p>
                  STAFF PROFILE
                </p>

                <h2>
                  Staff Details
                </h2>

                <span>
                  Operational staff information.
                </span>

              </div>

              <button
                onClick={() =>
                  setSelectedStaff(null)
                }
              >
                ×
              </button>

            </div>


            {/* PROFILE */}

            <div className="parking-staff-profile">

              <div className="parking-staff-large-avatar">
                {getInitials(selectedStaff.name)}
              </div>

              <div>

                <h3>
                  {selectedStaff.name}
                </h3>

                <p>
                  {selectedStaff.role}
                </p>

                <span
                  className={`availability-badge availability-${selectedStaff.availability.toLowerCase()}`}
                >

                  <span className="availability-dot"></span>

                  {selectedStaff.availability}

                </span>

              </div>

            </div>


            {/* DETAILS */}

            <div className="parking-staff-details-grid">

              <div>
                <span>
                  Contact
                </span>

                <strong>
                  {selectedStaff.phone}
                </strong>
              </div>


              <div>
                <span>
                  Current Assignment
                </span>

                <strong>
                  {selectedStaff.assignment}
                </strong>
              </div>


              <div>
                <span>
                  Account Status
                </span>

                <strong>
                  {selectedStaff.status}
                </strong>
              </div>


              <div>
                <span>
                  Staff ID
                </span>

                <strong>
                  #{String(selectedStaff.id).padStart(4, "0")}
                </strong>
              </div>

            </div>


            {/* FOOTER */}

            <div className="parking-staff-modal-footer">

              <button
                onClick={() =>
                  setSelectedStaff(null)
                }
              >
                Close
              </button>

              {selectedStaff.role === "Valet" &&
                selectedStaff.availability === "Available" && (

                <button
                  className="assign-valet-btn"
                  onClick={() => {
                    alert(
                      "Valet assignment will be connected to the Retrieval API."
                    );
                  }}
                >
                  Assign Valet
                </button>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ParkingStaff;