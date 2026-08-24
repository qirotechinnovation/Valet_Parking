const express = require("express");

const {
  createVehicle,
  getVehicles,
  getVehicleById
} = require("../controllers/vehicleController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// ============================================================
// VEHICLES
// ============================================================

// POST /api/vehicles
router.post(
  "/",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  createVehicle
);


// GET /api/vehicles
router.get(
  "/",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  getVehicles
);


// GET /api/vehicles/:id
router.get(
  "/:id",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  getVehicleById
);


module.exports = router;