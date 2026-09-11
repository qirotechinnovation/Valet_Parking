const express = require("express");

const {
  getAllKeys,
  getKeyById,
  createKey,
  updateKey,
  assignKey,
  returnKey,
  markKeyLost,
  getKeyHistory,
  getKeyBySession
} = require("../controllers/keyController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

const KEY_MANAGEMENT_ROLES = [
  "parking_admin",
  "super_admin"
];

const KEY_OPERATION_ROLES = [
  "cashier",
  "reception_security",
  "parking_admin",
  "super_admin",
  "valet"
];

/*
|--------------------------------------------------------------------------
| Get all keys
|--------------------------------------------------------------------------
*/
router.get(
  "/",
  authenticate,
  authorizeRoles(...KEY_MANAGEMENT_ROLES),
  getAllKeys
);

/*
|--------------------------------------------------------------------------
| Get key by ID
|--------------------------------------------------------------------------
*/
router.get(
  "/:id",
  authenticate,
  authorizeRoles(...KEY_MANAGEMENT_ROLES),
  getKeyById
);

/*
|--------------------------------------------------------------------------
| Get key by parking session
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Keep this route before "/:id" so that:
|
| /session/:session_id
|
| is not interpreted as:
|
| /:id
|
|--------------------------------------------------------------------------
*/
router.get(
  "/session/:session_id",
  authenticate,
  authorizeRoles(...KEY_OPERATION_ROLES),
  getKeyBySession
);

/*
|--------------------------------------------------------------------------
| Create key
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  authenticate,
  authorizeRoles(...KEY_MANAGEMENT_ROLES),
  createKey
);

/*
|--------------------------------------------------------------------------
| Update key
|--------------------------------------------------------------------------
*/
router.put(
  "/:id",
  authenticate,
  authorizeRoles(...KEY_MANAGEMENT_ROLES),
  updateKey
);

/*
|--------------------------------------------------------------------------
| Assign key
|--------------------------------------------------------------------------
*/
router.patch(
  "/:id/assign",
  authenticate,
  authorizeRoles(
    "cashier",
    "reception_security",
    "parking_admin",
    "super_admin",
    "valet"
  ),
  assignKey
);

/*
|--------------------------------------------------------------------------
| Return key
|--------------------------------------------------------------------------
*/
router.patch(
  "/:id/return",
  authenticate,
  authorizeRoles(
    "cashier",
    "reception_security",
    "parking_admin",
    "super_admin",
    "valet"
  ),
  returnKey
);

/*
|--------------------------------------------------------------------------
| Mark key as lost
|--------------------------------------------------------------------------
*/
router.patch(
  "/:id/lost",
  authenticate,
  authorizeRoles(...KEY_MANAGEMENT_ROLES),
  markKeyLost
);

/*
|--------------------------------------------------------------------------
| Key history
|--------------------------------------------------------------------------
*/
router.get(
  "/:id/history",
  authenticate,
  authorizeRoles(...KEY_MANAGEMENT_ROLES),
  getKeyHistory
);

module.exports = router;