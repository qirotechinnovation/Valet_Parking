const express = require("express");
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  getCustomerDashboard,
  getCustomerParkingHistory,
  requestCustomerRetrieval,
  getCustomerVehicles,
  cancelCustomerRetrieval,
  getCustomerProfile
} = require("../controllers/customerController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("cashier", "reception_security", "parking_admin", "super_admin"),
  createCustomer
);

router.get(
  "/",
  authenticate,
  authorizeRoles("cashier", "reception_security", "parking_admin", "super_admin"),
  getCustomers
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("cashier", "reception_security", "parking_admin", "super_admin"),
  getCustomerById
);

router.get(
  "/portal/dashboard",
  authenticate,
  authorizeRoles("customer"),
  getCustomerDashboard
);

router.get(
  "/portal/history",
  authenticate,
  authorizeRoles("customer"),
  getCustomerParkingHistory
);

router.patch(
  "/portal/retrieval/:id",
  authenticate,
  authorizeRoles("customer"),
  requestCustomerRetrieval
);
router.get(
  "/portal/vehicles",
  authenticate,
  authorizeRoles("customer"),
  getCustomerVehicles
);
router.patch(
  "/portal/retrieval/:id/cancel",
  authenticate,
  authorizeRoles("customer"),
  cancelCustomerRetrieval
);

router.get(
  "/portal/profile",
  authenticate,
  authorizeRoles("customer"),
  getCustomerProfile
);
module.exports = router;