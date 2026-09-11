const express = require("express");
const router = express.Router();

const {
  createPayment,
  downloadInvoice
} = require("../controllers/paymentController");

const authenticate = require("../middleware/authMiddleware");

router.post(
  "/",
  authenticate,
  createPayment
);

router.get(
  "/:id/invoice",
  authenticate,
  downloadInvoice
);

module.exports = router;