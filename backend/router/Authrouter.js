const express = require("express")

const {sendotp , Verifyotp} = require("../controller/Auth")

const router = express.Router();

router.post("/send-otp", sendotp)

router.post("/Verify-otp", Verifyotp)



module.exports = router;