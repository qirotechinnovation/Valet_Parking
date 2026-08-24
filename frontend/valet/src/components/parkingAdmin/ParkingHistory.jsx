import { useMemo, useState } from "react";
import "./css/ParkingHistory.css";

const mockHistory = [
  {
    id: 1,
    vehicleNumber: "MH12AB1234",
    customer: "Rahul Sharma",
    slot: "A-12",
    checkIn: "20 Aug 2026, 09:15 AM",
    checkOut: "20 Aug 2026, 12:45 PM",
    duration: "3h 30m",
    status: "Completed",
  },
  {
    id: 2,
    vehicleNumber: "MH14CD5678",
    customer: "Priya Patil",
    slot: "B-08",
    checkIn: "20 Aug 2026, 10:20 AM",
    checkOut: "20 Aug 2026, 01:10 PM",
    duration: "2h 50m",
    status: "Completed",
  },
  {
    id: 3,
    vehicleNumber: "MH12EF9012",
    customer: "Amit Kulkarni",
    slot: "A-05",
    checkIn: "20 Aug 2026, 11:05 AM",
    checkOut: "20 Aug 2026, 03:30 PM",
    duration: "4h 25m",
    status: "Completed",
  },
  {
    id: 4,
    vehicleNumber: "MH16GH3456",
    customer: "Sneha Joshi",
    slot: "C-14",
    checkIn: "19 Aug 2026, 02:15 PM",
    checkOut: "19 Aug 2026, 06:40 PM",
    duration: "4h 25m",
    status: "Completed",
  },
  {
    id: 5,
    vehicleNumber: "MH12JK7890",
    customer: "Rohan Deshmukh",
    slot: "B-03",
    checkIn: "19 Aug 2026, 04:30 PM",
    checkOut: "19 Aug 2026, 08:15 PM",
    duration: "3h 45m",
    status: "Completed",
  },
  {
    id: 6,
    vehicleNumber: "MH14LM2468",
    customer: "Neha More",
    slot: "A-19",
    checkIn: "18 Aug 2026, 09:40 AM",
    checkOut: "18 Aug 2026, 02:05 PM",
    duration: "4h 25m",
    status: "Completed",
  },
];

function ParkingHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredHistory = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return mockHistory.filter((session) => {
      const matchesSearch =
        !search ||
        session.vehicleNumber.toLowerCase().includes(search) ||
        session.customer.toLowerCase().includes(search) ||
        session.slot.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        session.status.toLowerCase() === statusFilter;

      /*
       * Date filtering is currently UI-ready.
       * It can be connected to actual session dates
       * once the backend API is available.
       */
      const matchesDate = dateFilter === "all";

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateFilter]);

  return (
    <div className="parking-history-page">

      {/* HEADER */}

      <div className="parking-history-header">
        <div>
          <p className="parking-history-eyebrow">
            OPERATIONS
          </p>

          <h1>Parking History</h1>

          <p>
            View completed and previous parking sessions.
          </p>
        </div>

        <div className="history-summary">
          <span>Total Sessions</span>
          <strong>{mockHistory.length}</strong>
        </div>
      </div>


      {/* SUMMARY CARDS */}

      <div className="history-summary-grid">

        <div className="history-summary-card">
          <span className="history-summary-icon">↗</span>

          <div>
            <span>Today's Check-ins</span>
            <strong>24</strong>
          </div>
        </div>

        <div className="history-summary-card">
          <span className="history-summary-icon">↙</span>

          <div>
            <span>Today's Check-outs</span>
            <strong>19</strong>
          </div>
        </div>

        <div className="history-summary-card">
          <span className="history-summary-icon">◷</span>

          <div>
            <span>Average Duration</span>
            <strong>3h 42m</strong>
          </div>
        </div>

        <div className="history-summary-card">
          <span className="history-summary-icon">✓</span>

          <div>
            <span>Completed Sessions</span>
            <strong>156</strong>
          </div>
        </div>

      </div>


      {/* TABLE CARD */}

      <section className="parking-history-card">

        {/* TOOLBAR */}

        <div className="parking-history-toolbar">

          <div className="parking-history-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search vehicle, customer or slot..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>


          <div className="parking-history-filters">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="completed">
                Completed
              </option>
            </select>


            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
              }
            >
              <option value="all">
                All Dates
              </option>

              <option value="today">
                Today
              </option>

              <option value="yesterday">
                Yesterday
              </option>

              <option value="last7days">
                Last 7 Days
              </option>

              <option value="last30days">
                Last 30 Days
              </option>
            </select>

          </div>

        </div>


        {/* TABLE */}

        <div className="parking-history-table-wrapper">

          <table className="parking-history-table">

            <thead>
              <tr>
                <th>VEHICLE</th>
                <th>CUSTOMER</th>
                <th>SLOT</th>
                <th>CHECK-IN</th>
                <th>CHECK-OUT</th>
                <th>DURATION</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>

              {filteredHistory.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="history-empty"
                  >
                    <div>
                      <span>◷</span>

                      <strong>
                        No parking history found
                      </strong>

                      <p>
                        Try changing your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>

              ) : (

                filteredHistory.map((session) => (

                  <tr key={session.id}>

                    {/* VEHICLE */}

                    <td>
                      <div className="history-vehicle">

                        <div className="history-vehicle-icon">
                          🚗
                        </div>

                        <strong>
                          {session.vehicleNumber}
                        </strong>

                      </div>
                    </td>


                    {/* CUSTOMER */}

                    <td>
                      <span className="history-customer">
                        {session.customer}
                      </span>
                    </td>


                    {/* SLOT */}

                    <td>
                      <span className="history-slot">
                        {session.slot}
                      </span>
                    </td>


                    {/* CHECK-IN */}

                    <td>
                      <span className="history-time">
                        {session.checkIn}
                      </span>
                    </td>


                    {/* CHECK-OUT */}

                    <td>
                      <span className="history-time">
                        {session.checkOut}
                      </span>
                    </td>


                    {/* DURATION */}

                    <td>
                      <span className="history-duration">
                        {session.duration}
                      </span>
                    </td>


                    {/* STATUS */}

                    <td>
                      <span className="history-status">
                        <span className="history-status-dot"></span>

                        {session.status}
                      </span>
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div className="parking-history-footer">

          <span>
            Showing{" "}
            <strong>
              {filteredHistory.length}
            </strong>{" "}
            of{" "}
            <strong>
              {mockHistory.length}
            </strong>{" "}
            parking sessions
          </span>


          <div className="history-pagination">

            <button disabled>
              ‹
            </button>

            <span>1</span>

            <button disabled>
              ›
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}

export default ParkingHistory;