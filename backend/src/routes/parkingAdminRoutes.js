const express = require("express");

const {
  getParkingAdminDashboard,
  getParkingStaff,
  getParkingReports,
  getParkingAdminProfile
} = require("../controllers/parkingAdminController");

const {
  getParkingSessions,
  getRetrievalRequests,
  getParkingHistory,
  createParkingSession,
  completeSelfParking,
  assignParkingSlot,
  assignValet,
  requestRetrieval,
  startRetrieval,
  markReadyForPickup,
  completeReturn
} = require("../controllers/parkingSessionController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("parking_admin"),
  getParkingAdminDashboard
);

router.get(
  "/sessions",
  authenticate,
  authorizeRoles("parking_admin"),
  getParkingSessions
);

router.post(
  "/sessions",
  authenticate,
  authorizeRoles("parking_admin"),
  createParkingSession
);

router.patch(
  "/sessions/:id/slot",
  authenticate,
  authorizeRoles("parking_admin"),
  assignParkingSlot
);

router.patch(
  "/sessions/:id/valet",
  authenticate,
  authorizeRoles("parking_admin"),
  assignValet
);


router.patch(
  "/sessions/:id/request-retrieval",
  authenticate,
  authorizeRoles("parking_admin"),
  requestRetrieval
);


router.patch(
  "/sessions/:id/start-retrieval",
  authenticate,
  authorizeRoles("parking_admin"),
  startRetrieval
);


router.patch(
  "/sessions/:id/ready",
  authenticate,
  authorizeRoles("parking_admin"),
  markReadyForPickup
);


router.patch(
  "/sessions/:id/complete",
  authenticate,
  authorizeRoles("parking_admin"),
  completeReturn
);
router.get(
  "/retrieval-requests",
  authenticate,
  authorizeRoles("parking_admin"),
  getRetrievalRequests
);
router.get(
  "/history",
  authenticate,
  authorizeRoles("parking_admin"),
  getParkingHistory
);

router.get(
  "/staff",
  authenticate,
  authorizeRoles("parking_admin"),
  getParkingStaff
);

router.get(
  "/reports",
  authenticate,
  authorizeRoles("parking_admin"),
  getParkingReports
);
router.get(
  "/profile",
  authenticate,
  authorizeRoles("parking_admin"),
  getParkingAdminProfile
);

router.patch(
  "/sessions/:id/self-checkout",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin"),
  completeSelfParking
);
module.exports = router;