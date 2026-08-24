const express = require("express");

const {
  getParkingSessions,
  createParkingSession,
  assignParkingSlot,
  assignValet,
  requestRetrieval,
  startRetrieval,
  markReadyForPickup,
  completeReturn,
  getRetrievalRequests,
  getParkingHistory,
} = require("../controllers/parkingSessionController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ============================================================
// PARKING SESSIONS
// ============================================================

// GET /api/parking-admin/sessions
router.get(
  "/",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  getParkingSessions
);

// POST /api/parking-admin/sessions
router.post(
  "/",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  createParkingSession
);

// ============================================================
// SLOT ASSIGNMENT
// ============================================================

// PATCH /api/parking-admin/sessions/:id/assign-slot
router.patch(
  "/:id/assign-slot",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  assignParkingSlot
);

// ============================================================
// VALET ASSIGNMENT
// ============================================================

// PATCH /api/parking-admin/sessions/:id/assign-valet
router.patch(
  "/:id/assign-valet",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  assignValet
);

// ============================================================
// RETRIEVAL WORKFLOW
// ============================================================

// PATCH /api/parking-admin/sessions/:id/request-retrieval
router.patch(
  "/:id/request-retrieval",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  requestRetrieval
);

// PATCH /api/parking-admin/sessions/:id/start-retrieval
router.patch(
  "/:id/start-retrieval",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  startRetrieval
);

// PATCH /api/parking-admin/sessions/:id/ready
router.patch(
  "/:id/ready",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  markReadyForPickup
);

// PATCH /api/parking-admin/sessions/:id/complete
router.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  completeReturn
);

// ============================================================
// RETRIEVAL REQUESTS
// ============================================================

// GET /api/parking-admin/sessions/retrievals
router.get(
  "/retrievals",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  getRetrievalRequests
);

// ============================================================
// PARKING HISTORY
// ============================================================

// GET /api/parking-admin/sessions/history
router.get(
  "/history",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  getParkingHistory
);

module.exports = router;