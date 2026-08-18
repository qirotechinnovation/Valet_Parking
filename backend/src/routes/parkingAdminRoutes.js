const express = require("express");

const {
  getParkingAdminDashboard
} = require("../controllers/parkingAdminController");

const {
  getParkingSessions,
    createParkingSession,
      assignParkingSlot,
       assignValet
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

module.exports = router;