import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./css/ParkingSlots.css";
import apiClient from "../../api/apiClient";

/* ============================================================
   VEHICLE ICON
   ============================================================ */

const CarSVG = ({ color = "#111C3D" }) => (
  <svg
    width="22"
    height="32"
    viewBox="0 0 24 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="2"
      y="2"
      width="20"
      height="30"
      rx="5"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
    />

    <path
      d="M5 9C5 7.5 7 6 12 6C17 6 19 7.5 19 9V11H5V9Z"
      fill={color}
    />

    <path
      d="M6 24C6 22.5 8 22 12 22C16 22 18 22.5 18 24V25H6V24Z"
      fill={color}
    />

    <rect x="0" y="8" width="2" height="4" rx="1" fill={color} />
    <rect x="22" y="8" width="2" height="4" rx="1" fill={color} />
  </svg>
);

/* ============================================================
   PARKING SLOT
   ============================================================ */

const ParkingBay = ({ slot, onClick }) => {
  const status = slot.status || "available";

  const isOccupied = status === "occupied";
  const isMaintenance = status === "maintenance";

  const statusText = {
    available: "AVAIL",
    occupied: "OCC",
    maintenance: "MAINT",
  };

  return (
    <button
      type="button"
      className={`target-parking-slot ${status}`}
      onClick={() => onClick(slot)}
      aria-label={`Parking slot ${slot.slot_number}, ${status}`}
    >
      {/* Slot Number */}
      <div className="slot-badge">
        {slot.slot_number}
      </div>

      {/* Slot Icon */}
      <div className="slot-space">
        {isOccupied ? (
          <CarSVG color="#a86f00" />
        ) : isMaintenance ? (
          <span
            className="slot-maintenance-icon"
            aria-hidden="true"
          >
            ⚙
          </span>
        ) : (
          <span
            className="slot-available-icon"
            aria-hidden="true"
          >
            +
          </span>
        )}
      </div>

      {/* Status */}
      <div className="slot-status-text">
        {statusText[status] || status.toUpperCase()}
      </div>

      {/* Vehicle information only for occupied slots */}
      {isOccupied && slot.assigned_vehicle && (
        <div className="slot-vehicle-number">
          {slot.assigned_vehicle}
        </div>
      )}
    </button>
  );
};

/* ============================================================
   PARKING SLOTS PAGE
   ============================================================ */

const ParkingSlots = () => {
  /* ==========================================================
     STATE
     ========================================================== */

  const [slots, setSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("car");

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState("");

  /* ==========================================================
     FETCH PARKING SLOTS
     ========================================================== */

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient("/api/parking-slots");

      if (!response || response.success !== true) {
        throw new Error(
          response?.message || "Failed to fetch parking slots."
        );
      }

      setSlots(
        Array.isArray(response.slots)
          ? response.slots
          : []
      );
    } catch (err) {
      console.error("Fetch parking slots error:", err);

      setError(
        err?.message || "Failed to fetch parking slots."
      );

      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  /* ==========================================================
     SLOT CLICK
     ========================================================== */

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setSelectedStatus(slot.status || "available");
    setStatusUpdateError("");
  };

  /* ==========================================================
     UPDATE SLOT STATUS
     ========================================================== */

  const handleStatusUpdate = async () => {
    if (!selectedSlot || !selectedStatus) {
      return;
    }

    /*
      Nothing changed.
      Simply close the modal.
    */
    if (selectedStatus === selectedSlot.status) {
      setSelectedSlot(null);
      return;
    }

    try {
      setUpdatingStatus(true);
      setStatusUpdateError("");

      const response = await apiClient(
        `/api/parking-slots/${selectedSlot.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: selectedStatus,
          }),
        }
      );

      if (!response || response.success !== true) {
        throw new Error(
          response?.message ||
            "Failed to update parking slot status."
        );
      }

      /*
        Update only the affected slot in local state.

        This means the entire page does NOT need to reload.
      */
      setSlots((currentSlots) =>
        currentSlots.map((slot) =>
          slot.id === selectedSlot.id
            ? {
                ...slot,
                status: selectedStatus,
              }
            : slot
        )
      );

      setSelectedSlot(null);
    } catch (err) {
      console.error("Update slot status error:", err);

      setStatusUpdateError(
        err?.message ||
          "Failed to update parking slot status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* ==========================================================
     FILTER SLOTS
     ========================================================== */

  const filteredSlots = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return slots.filter((slot) => {
      const slotNumber = String(
        slot.slot_number || ""
      ).toLowerCase();

      const vehicle = String(
        slot.assigned_vehicle || ""
      ).toLowerCase();

      const customer = String(
        slot.customer_name || ""
      ).toLowerCase();

      const parkingType = String(
        slot.parking_type || "car"
      ).toLowerCase();

      const matchesSearch =
        !searchTerm ||
        slotNumber.includes(searchTerm) ||
        vehicle.includes(searchTerm) ||
        customer.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        slot.status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        parkingType === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    slots,
    search,
    statusFilter,
    typeFilter,
  ]);

  /* ==========================================================
     CREATE PARKING ROWS DYNAMICALLY
     
     Example:
     
     A01 A02 A03 A04 A05
     B01 B02 B03 B04 B05
     C01 C02
     
     The row letter is obtained from the actual slot number.
     ========================================================== */

  const parkingRows = useMemo(() => {
    const groupedRows = {};

    filteredSlots.forEach((slot) => {
      const slotNumber = String(
        slot.slot_number || ""
      ).trim();

      if (!slotNumber) {
        return;
      }

      /*
        Extract row prefix.

        Examples:
        A01 -> A
        B05 -> B
        C12 -> C
      */
      const rowMatch = slotNumber.match(/^[A-Za-z]+/);

      const row =
        rowMatch?.[0]?.toUpperCase() || "OTHER";

      if (!groupedRows[row]) {
        groupedRows[row] = [];
      }

      groupedRows[row].push(slot);
    });

    /*
      Sort rows alphabetically.
    */
    return Object.entries(groupedRows)
      .sort(([rowA], [rowB]) =>
        rowA.localeCompare(rowB)
      )
      .map(([row, rowSlots]) => {
        /*
          Sort slots numerically.

          A02 comes before A10.
        */
        const sortedSlots = [...rowSlots].sort(
          (a, b) => {
            const numberA =
              parseInt(
                String(a.slot_number).replace(
                  /\D/g,
                  ""
                ),
                10
              ) || 0;

            const numberB =
              parseInt(
                String(b.slot_number).replace(
                  /\D/g,
                  ""
                ),
                10
              ) || 0;

            return numberA - numberB;
          }
        );

        /*
          Break each row into groups of 5.

          Example:

          A01 A02 A03 A04 A05
          A06 A07 A08 A09 A10
        */
        const groups = [];

        for (
          let i = 0;
          i < sortedSlots.length;
          i += 5
        ) {
          groups.push(
            sortedSlots.slice(i, i + 5)
          );
        }

        return {
          row,
          groups,
        };
      });
  }, [filteredSlots]);

  /* ==========================================================
     SLOT COUNTS
     ========================================================== */

  const slotCounts = useMemo(() => {
    return {
      total: filteredSlots.length,

      available: filteredSlots.filter(
        (slot) => slot.status === "available"
      ).length,

      occupied: filteredSlots.filter(
        (slot) => slot.status === "occupied"
      ).length,

      maintenance: filteredSlots.filter(
        (slot) => slot.status === "maintenance"
      ).length,
    };
  }, [filteredSlots]);

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="parking-slots-page">

      {/* ======================================================
          VEHICLE TYPE TABS
          ====================================================== */}

      <div className="vehicle-type-tabs">

        <button
          type="button"
          className={`tab-btn ${
            typeFilter === "car"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setTypeFilter("car")
          }
        >
          🚗 CAR
        </button>

        <button
          type="button"
          className={`tab-btn ${
            typeFilter === "bike"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setTypeFilter("bike")
          }
        >
          🏍 BIKE
        </button>

        <button
          type="button"
          className={`tab-btn ${
            typeFilter === "truck"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setTypeFilter("truck")
          }
        >
          🚚 TRUCK
        </button>

      </div>

      {/* ======================================================
          CONTROLS
          ====================================================== */}

      <div className="parking-slots-controls">

        <div className="parking-slots-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search slot, vehicle or customer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="parking-slots-filters">

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="available">
              Available
            </option>

            <option value="occupied">
              Occupied
            </option>

            <option value="maintenance">
              Maintenance
            </option>
          </select>

          <button
            type="button"
            className="parking-slots-refresh"
            onClick={fetchSlots}
            disabled={loading}
          >
            ↻{" "}
            <span>
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>

        </div>

      </div>

      {/* ======================================================
          LEGEND
          ====================================================== */}

      <div className="parking-map-legend">

        <span className="legend-label">
          STATUS
        </span>

        <span className="legend-item">
          <span className="legend-dot available"></span>
          Available
        </span>

        <span className="legend-item">
          <span className="legend-dot occupied"></span>
          Occupied
        </span>

        <span className="legend-item">
          <span className="legend-dot maintenance"></span>
          Maintenance
        </span>

      </div>

      {/* ======================================================
          PARKING LAYOUT CARD
          ====================================================== */}

      <div className="parking-layout-card">

        <div className="parking-card-header">

          <div>
            <h2>
              Parking Layout
            </h2>

            <p>
              {slotCounts.total} parking slot
              {slotCounts.total !== 1
                ? "s"
                : ""}{" "}
              displayed
            </p>
          </div>

          <div className="parking-summary">

            <span className="parking-summary-item available">
              <strong>
                {slotCounts.available}
              </strong>
              Available
            </span>

            <span className="parking-summary-item occupied">
              <strong>
                {slotCounts.occupied}
              </strong>
              Occupied
            </span>

            <span className="parking-summary-item maintenance">
              <strong>
                {slotCounts.maintenance}
              </strong>
              Maintenance
            </span>

          </div>

        </div>

        {/* ====================================================
            LOADING
            ==================================================== */}

        {loading && (
          <div className="parking-slots-loading">

            <div className="parking-loading-spinner"></div>

            <span>
              Loading parking layout...
            </span>

          </div>
        )}

        {/* ====================================================
            ERROR
            ==================================================== */}

        {!loading && error && (
          <div className="parking-slots-error">

            <strong>
              Unable to load parking slots
            </strong>

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={fetchSlots}
            >
              Try Again
            </button>

          </div>
        )}

        {/* ====================================================
            EMPTY
            ==================================================== */}

        {!loading &&
          !error &&
          filteredSlots.length === 0 && (
            <div className="parking-slots-empty">

              <strong>
                No parking slots found
              </strong>

              <span>
                Try changing your search or
                filter criteria.
              </span>

            </div>
          )}

        {/* ====================================================
            ACTUAL PARKING MAP
            ==================================================== */}

        {!loading &&
          !error &&
          filteredSlots.length > 0 && (
            <div className="parking-map">

              {/* ENTRANCE */}

              <div className="parking-entrance">

                <span className="parking-direction-arrow">
                  ↓
                </span>

                <span>
                  ENTRANCE
                </span>

              </div>

              {/* PARKING ROWS */}

              <div className="parking-rows">

                {parkingRows.map(
                  ({ row, groups }) => (
                    <React.Fragment
                      key={row}
                    >

                      {groups.map(
                        (rowSlots, groupIndex) => (
                          <React.Fragment
                            key={`${row}-${groupIndex}`}
                          >

                            {/* ROW LABEL */}

                            <div className="parking-row-label">
                              <span>
                                {row}
                              </span>
                            </div>

                            {/* SLOTS */}

                            <div className="parking-row-grid">

                              {rowSlots.map(
                                (slot) => (
                                  <ParkingBay
                                    key={slot.id}
                                    slot={slot}
                                    onClick={
                                      handleSlotClick
                                    }
                                  />
                                )
                              )}

                            </div>

                            {/* DRIVEWAY BETWEEN GROUPS */}

                            {groupIndex <
                              groups.length -
                                1 && (
                              <div className="parking-central-driveway">
                                <span>
                                  DRIVEWAY
                                </span>
                              </div>
                            )}

                          </React.Fragment>
                        )
                      )}

                      {/* DRIVEWAY BETWEEN ROWS */}

                      <div className="parking-central-driveway">
                        <span>
                          DRIVEWAY
                        </span>
                      </div>

                    </React.Fragment>
                  )
                )}

              </div>

              {/* EXIT */}

              <div className="parking-map-exit">

                <span>
                  EXIT
                </span>

                <span className="parking-direction-arrow">
                  ↓
                </span>

              </div>

            </div>
          )}

      </div>

      {/* ======================================================
          SLOT MANAGEMENT MODAL
          ====================================================== */}

      {selectedSlot && (
        <div
          className="parking-slot-modal-overlay"
          onClick={() =>
            !updatingStatus &&
            setSelectedSlot(null)
          }
        >

          <div
            className="parking-slot-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="parking-slot-modal-header">

              <div>

                <p>
                  SLOT MANAGEMENT
                </p>

                <h2>
                  {selectedSlot.slot_number}
                </h2>

              </div>

              <button
                type="button"
                className="parking-slot-modal-close"
                onClick={() =>
                  setSelectedSlot(null)
                }
                disabled={updatingStatus}
              >
                ×
              </button>

            </div>

            {/* SLOT INFORMATION */}

            <div className="parking-slot-details">

              <div className="slot-detail-item">

                <span>
                  Parking Type
                </span>

                <strong>
                  {selectedSlot.parking_type
                    ? selectedSlot.parking_type
                        .charAt(0)
                        .toUpperCase() +
                      selectedSlot.parking_type.slice(
                        1
                      )
                    : "Car"}
                </strong>

              </div>

              {selectedSlot.assigned_vehicle && (
                <div className="slot-detail-item">

                  <span>
                    Vehicle
                  </span>

                  <strong>
                    {
                      selectedSlot.assigned_vehicle
                    }
                  </strong>

                </div>
              )}

              {selectedSlot.customer_name && (
                <div className="slot-detail-item">

                  <span>
                    Customer
                  </span>

                  <strong>
                    {
                      selectedSlot.customer_name
                    }
                  </strong>

                </div>
              )}

            </div>

            {/* STATUS */}

            <div className="parking-status-section">

              <div className="parking-current-status-badge">

                Current status:{" "}

                <strong>
                  {selectedSlot.status
                    ? selectedSlot.status
                        .charAt(0)
                        .toUpperCase() +
                      selectedSlot.status.slice(
                        1
                      )
                    : "Unknown"}
                </strong>

              </div>

              {/* STATUS OPTIONS */}

              <div className="parking-status-options">

                <button
                  type="button"
                  className={`parking-status-option available ${
                    selectedStatus ===
                    "available"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedStatus(
                      "available"
                    )
                  }
                  disabled={updatingStatus}
                >
                  <span className="status-option-icon">
                    +
                  </span>

                  <span>
                    Available
                  </span>
                </button>

                <button
                  type="button"
                  className={`parking-status-option occupied ${
                    selectedStatus ===
                    "occupied"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedStatus(
                      "occupied"
                    )
                  }
                  disabled={updatingStatus}
                >
                  <span className="status-option-icon">
                    🚗
                  </span>

                  <span>
                    Occupied
                  </span>
                </button>

                <button
                  type="button"
                  className={`parking-status-option maintenance ${
                    selectedStatus ===
                    "maintenance"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedStatus(
                      "maintenance"
                    )
                  }
                  disabled={updatingStatus}
                >
                  <span className="status-option-icon">
                    ⚙
                  </span>

                  <span>
                    Maintenance
                  </span>
                </button>

              </div>

              {/* UPDATE ERROR */}

              {statusUpdateError && (
                <div className="parking-status-update-error">

                  <p>
                    {statusUpdateError}
                  </p>

                </div>
              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="parking-slot-modal-footer">

              <button
                type="button"
                className="parking-modal-cancel"
                onClick={() =>
                  setSelectedSlot(null)
                }
                disabled={updatingStatus}
              >
                Cancel
              </button>

              <button
                type="button"
                className="parking-modal-save"
                onClick={
                  handleStatusUpdate
                }
                disabled={updatingStatus}
              >
                {updatingStatus
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default ParkingSlots;