const express = require("express");
const {
  createCustomer,
  getCustomers,
  getCustomerById,
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

module.exports = router;