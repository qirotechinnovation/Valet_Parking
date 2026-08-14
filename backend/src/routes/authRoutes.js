const express = require("express");
const { login } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);

router.get("/me", authenticate, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated user",
    user: req.authUser
  });
});

module.exports = router;