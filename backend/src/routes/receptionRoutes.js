const express = require("express");

const {
  getParkingSessions,
  createParkingSession,
  requestRetrieval
} = require("../controllers/parkingSessionController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/sessions",
  authenticate,
  authorizeRoles("cashier"),
  getParkingSessions
);

router.post(
  "/sessions",
  authenticate,
  authorizeRoles("cashier"),
  createParkingSession
);

router.patch(
  "/sessions/:id/request-retrieval",
  authenticate,
  authorizeRoles("cashier"),
  requestRetrieval
);

module.exports = router;