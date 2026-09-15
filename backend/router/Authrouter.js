const express = require("express")

const {sendotp , Verifyotp, login, approveEmployee } = require("../controller/Auth")

const router = express.Router();

router.post("/send-otp", sendotp)

router.post("/Verify-otp", Verifyotp)

router.post("/login" ,login)

router.put("/approve/:employeeId", approveEmployee)



module.exports = router;