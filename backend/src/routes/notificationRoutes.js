const express = require("express");

const {
  createNotification,
  getNotifications,
  updateNotificationStatus
} = require("../controllers/notificationController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin"),
  createNotification
);

router.get(
  "/",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin", "valet"),
  getNotifications
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin"),
  updateNotificationStatus
);

module.exports = router;