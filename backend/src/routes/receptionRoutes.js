const express = require("express");

const {
  getParkingSessions,
  createParkingSession,
  requestRetrieval,
} = require("../controllers/parkingSessionController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

const RECEPTION_ROLES = ["cashier", "reception_security", "parking_admin", "super_admin"];

// GET /api/reception/sessions
router.get(
  "/sessions",
  authenticate,
  authorizeRoles(...RECEPTION_ROLES),
  getParkingSessions
);

// POST /api/reception/sessions
router.post(
  "/sessions",
  authenticate,
  authorizeRoles(...RECEPTION_ROLES),
  createParkingSession
);

// PATCH /api/reception/sessions/:id/request-retrieval
router.patch(
  "/sessions/:id/request-retrieval",
  authenticate,
  authorizeRoles(...RECEPTION_ROLES),
  requestRetrieval
);

module.exports = router;