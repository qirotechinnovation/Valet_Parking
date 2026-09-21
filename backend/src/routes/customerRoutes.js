const express = require("express");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  deleteCustomer,
  getCustomerDashboard,
  getCustomerParkingHistory,
  requestCustomerRetrieval,
  getCustomerVehicles,
  cancelCustomerRetrieval,
  getCustomerProfile
} = require("../controllers/customerController");

const {
  getCustomerPayments,
  downloadCustomerInvoice
} = require("../controllers/paymentController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| STAFF CUSTOMER MANAGEMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  authorizeRoles(
    "cashier",
    "reception_security",
    "parking_admin",
    "super_admin"
  ),
  createCustomer
);

router.get(
  "/",
  authenticate,
  authorizeRoles(
    "cashier",
    "reception_security",
    "parking_admin",
    "super_admin"
  ),
  getCustomers
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "cashier",
    "reception_security",
    "parking_admin",
    "super_admin"
  ),
  getCustomerById
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(
    "cashier",
    "reception_security",
    "parking_admin",
    "super_admin"
  ),
  deleteCustomer
);

/*
|--------------------------------------------------------------------------
| CUSTOMER PORTAL
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/portal/dashboard",
  authenticate,
  authorizeRoles("customer"),
  getCustomerDashboard
);

/*
|--------------------------------------------------------------------------
| Vehicles
|--------------------------------------------------------------------------
*/

router.get(
  "/portal/vehicles",
  authenticate,
  authorizeRoles("customer"),
  getCustomerVehicles
);

/*
|--------------------------------------------------------------------------
| Parking History
|--------------------------------------------------------------------------
*/

router.get(
  "/portal/history",
  authenticate,
  authorizeRoles("customer"),
  getCustomerParkingHistory
);

/*
|--------------------------------------------------------------------------
| Payments
|--------------------------------------------------------------------------
*/

router.get(
  "/portal/payments",
  authenticate,
  authorizeRoles("customer"),
  getCustomerPayments
);

router.get(
  "/portal/payments/:id/invoice",
  authenticate,
  authorizeRoles("customer"),
  downloadCustomerInvoice
);

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

router.get(
  "/portal/profile",
  authenticate,
  authorizeRoles("customer"),
  getCustomerProfile
);

/*
|--------------------------------------------------------------------------
| Request Vehicle Retrieval
|--------------------------------------------------------------------------
*/

router.patch(
  "/portal/retrieval/:id",
  authenticate,
  authorizeRoles("customer"),
  requestCustomerRetrieval
);

/*
|--------------------------------------------------------------------------
| Cancel Vehicle Retrieval
|--------------------------------------------------------------------------
*/

router.patch(
  "/portal/retrieval/:id/cancel",
  authenticate,
  authorizeRoles("customer"),
  cancelCustomerRetrieval
);

module.exports = router;