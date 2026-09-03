const express = require("express");

const {
  createVehicleInspection,
  getInspectionBySession
} = require("../controllers/vehicleInspectionController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin"),
  createVehicleInspection
);

router.get(
  "/session/:session_id",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin"),
  getInspectionBySession
);

module.exports = router;