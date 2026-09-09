const express = require("express")

const sendotp = require("../controller/sendotp")

const router = express.Router();

router.post("/send-otp", sendotp)



module.exports = router;