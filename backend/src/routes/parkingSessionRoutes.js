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
  getValetDashboard
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
// Supports both /assign-slot and /slot
// ============================================================

// Valets can assign a parking slot only to their own assigned vehicle.
// Ownership validation is handled inside assignParkingSlot.

router.patch(
  "/:id/assign-slot",
  authenticate,
  authorizeRoles("parking_admin", "super_admin", "valet"),
  assignParkingSlot
);

router.patch(
  "/:id/slot",
  authenticate,
  authorizeRoles("parking_admin", "super_admin", "valet"),
  assignParkingSlot
);


// ============================================================
// VALET ASSIGNMENT
// Supports both /assign-valet and /valet
// ============================================================

// Only Parking Admin / Super Admin can assign a valet.
// A valet cannot assign vehicles to themselves or other valets.

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

// Customer/reception-side retrieval request.
// Valets should NOT create retrieval requests.

router.patch(
  "/:id/request-retrieval",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  requestRetrieval
);


// ------------------------------------------------------------
// START RETRIEVAL
// ------------------------------------------------------------

// Valet can start retrieval for their assigned vehicle.
// Parking Admin / Super Admin can also perform this action.

router.patch(
  "/:id/start-retrieval",
  authenticate,
  authorizeRoles("parking_admin", "super_admin", "valet"),
  startRetrieval
);


// ------------------------------------------------------------
// MARK READY FOR PICKUP
// Supports both /ready and /ready-for-pickup
// ------------------------------------------------------------

router.patch(
  "/:id/ready",
  authenticate,
  authorizeRoles("parking_admin", "super_admin", "valet"),
  markReadyForPickup
);

router.patch(
  "/:id/ready-for-pickup",
  authenticate,
  authorizeRoles("parking_admin", "super_admin", "valet"),
  markReadyForPickup
);


// ------------------------------------------------------------
// COMPLETE RETURN
// Supports both /complete and /complete-return
// ------------------------------------------------------------

router.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles("parking_admin", "super_admin", "valet"),
  completeReturn
);

router.patch(
  "/:id/complete-return",
  authenticate,
  authorizeRoles("parking_admin", "super_admin", "valet"),
  completeReturn
);


// ============================================================
// RETRIEVAL REQUESTS
// Supports /retrievals & /retrieval-requests
// ============================================================

// Keep this restricted to Parking Admin / Super Admin.
// The Valet Dashboard receives its own retrieval requests
// through /valet-dashboard.

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


// ============================================================
// VALET DASHBOARD
// ============================================================

router.get(
  "/valet-dashboard",
  authenticate,
  authorizeRoles("valet"),
  getValetDashboard
);


module.exports = router;