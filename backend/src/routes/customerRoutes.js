const express = require("express");

const {
  createCustomer,
  getCustomerById
} = require("../controllers/customerController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin"),
  createCustomer
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("cashier", "parking_admin", "super_admin"),
  getCustomerById
);

module.exports = router;