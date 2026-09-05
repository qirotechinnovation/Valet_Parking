const express = require("express");

const {
  getAllKeys,
  getKeyById,
  createKey,
  updateKey,
  assignKey,
  returnKey,
  markKeyLost,
  getKeyHistory
} = require("../controllers/keyController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRoles("super_admin", "parking_admin", "valet"),
  getAllKeys
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("super_admin", "parking_admin", "valet"),
  getKeyById
);

router.post(
  "/",
  authenticate,
  authorizeRoles("super_admin", "parking_admin"),
  createKey
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("super_admin", "parking_admin"),
  updateKey
);

router.patch(
  "/:id/assign",
  authenticate,
  authorizeRoles("super_admin", "parking_admin"),
  assignKey
);

router.patch(
  "/:id/return",
  authenticate,
  authorizeRoles("super_admin", "parking_admin", "valet"),
  returnKey
);

router.patch(
  "/:id/lost",
  authenticate,
  authorizeRoles("super_admin", "parking_admin"),
  markKeyLost
);

router.get(
  "/:id/history",
  authenticate,
  authorizeRoles("super_admin", "parking_admin", "valet"),
  getKeyHistory
);

module.exports = router;