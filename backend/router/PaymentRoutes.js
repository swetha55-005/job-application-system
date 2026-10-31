
const express = require("express");
const router = express.Router();

const { createOrder, verifyPayment } = require("../controller/paymentController");
const { Auth } = require("../middleware/Auth");

console.log("Auth type:", typeof Auth);
console.log("createOrder type:", typeof createOrder);

router.post("/create-order", Auth, createOrder);
router.post("/verify-payment", Auth, verifyPayment);

module.exports = router;