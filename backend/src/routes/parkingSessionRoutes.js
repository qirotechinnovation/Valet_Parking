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
// SLOT ASSIGNMENT (supports both /assign-slot and /slot)
// ============================================================

router.patch(
  "/:id/assign-slot",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  assignParkingSlot
);

router.patch(
  "/:id/slot",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  assignParkingSlot
);

// ============================================================
// VALET ASSIGNMENT (supports both /assign-valet and /valet)
// ============================================================

router.patch(
  "/:id/assign-valet",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  assignValet
);

router.patch(
  "/:id/valet",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  assignValet
);

// ============================================================
// RETRIEVAL WORKFLOW
// ============================================================

router.patch(
  "/:id/request-retrieval",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  requestRetrieval
);

router.patch(
  "/:id/start-retrieval",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  startRetrieval
);

// Supports both /ready and /ready-for-pickup
router.patch(
  "/:id/ready",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  markReadyForPickup
);

router.patch(
  "/:id/ready-for-pickup",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  markReadyForPickup
);

// Supports both /complete and /complete-return
router.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  completeReturn
);

router.patch(
  "/:id/complete-return",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  completeReturn
);

// ============================================================
// RETRIEVAL REQUESTS (supports /retrievals & /retrieval-requests)
// ============================================================

router.get(
  "/retrievals",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  getRetrievalRequests
);

router.get(
  "/retrieval-requests",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  getRetrievalRequests
);

// ============================================================
// PARKING HISTORY
// ============================================================

router.get(
  "/history",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  getParkingHistory
);

module.exports = router;