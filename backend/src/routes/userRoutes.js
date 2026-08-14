const express = require("express");
const {
  createStaff,
  getAllStaff
} = require("../controllers/userController");

const router = express.Router();

router.post("/", createStaff);

router.get("/", getAllStaff);

module.exports = router;