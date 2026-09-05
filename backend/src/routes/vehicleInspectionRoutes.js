const express = require("express");

const {
  createVehicleInspection,
  getInspectionBySession,
  uploadInspectionPhoto,
  getInspectionPhotos,
  deleteInspectionPhoto,
  getVehicleInspectionHistory
} = require("../controllers/vehicleInspectionController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const uploadInspectionPhotoMiddleware = require("../middleware/uploadMiddleware");

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

router.post(
  "/:inspection_id/photos",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin"),
  uploadInspectionPhotoMiddleware.single("photo"),
  uploadInspectionPhoto
);
router.get(
  "/:inspection_id/photos",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin"),
  getInspectionPhotos
);
router.delete(
  "/photos/:photo_id",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin"),
  deleteInspectionPhoto
);
router.get(
  "/vehicle/:vehicle_id/history",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin"),
  getVehicleInspectionHistory
);
module.exports = router;