const express = require("express")
const middleware = require("../Middleware/Auth")

const {sendotp , Verifyotp, login } = require("../controller/Auth")

const router = express.Router();

router.post("/send-otp", sendotp)

router.post("/Verify-otp", Verifyotp)

router.post("/login" ,login)




module.exports = router;