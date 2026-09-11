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

/*
|--------------------------------------------------------------------------
| CUSTOMER PORTAL
|--------------------------------------------------------------------------
|
| IMPORTANT:
| These routes must remain AFTER the portal definitions only if
| parameterized routes could interfere. Express matches in order,
| so portal routes should come before /:id.
|
|--------------------------------------------------------------------------
*/

/*
| Dashboard
*/
router.get(
  "/portal/dashboard",
  authenticate,
  authorizeRoles("customer"),
  getCustomerDashboard
);

/*
| Vehicles
*/
router.get(
  "/portal/vehicles",
  authenticate,
  authorizeRoles("customer"),
  getCustomerVehicles
);

/*
| Parking History
*/
router.get(
  "/portal/history",
  authenticate,
  authorizeRoles("customer"),
  getCustomerParkingHistory
);

/*
| Profile
*/
router.get(
  "/portal/profile",
  authenticate,
  authorizeRoles("customer"),
  getCustomerProfile
);

/*
| Request Vehicle Retrieval
*/
router.patch(
  "/portal/retrieval/:id",
  authenticate,
  authorizeRoles("customer"),
  requestCustomerRetrieval
);

/*
| Cancel Vehicle Retrieval
*/
router.patch(
  "/portal/retrieval/:id/cancel",
  authenticate,
  authorizeRoles("customer"),
  cancelCustomerRetrieval
);

module.exports = router;