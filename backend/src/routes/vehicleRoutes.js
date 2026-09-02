const express = require("express");

const {
  createVehicle,
  getVehicles,
  getVehicleById
} = require("../controllers/vehicleController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  createVehicle
);

router.get(
  "/",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  getVehicles
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("parking_admin", "super_admin"),
  getVehicleById
);

module.exports = router;