const express = require("express")
const  {middleware, allowRoles, Auth} = require("../Middleware/Auth")

const {sendotp , Verifyotp, login } = require("../controller/Auth")

const router = express.Router();

router.post("/send-otp", sendotp)

router.post("/Verify-otp", Verifyotp)

router.post("/login" ,login)

router.get(
    "/admin-test",
    Auth,
    allowRoles("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Admin access granted",
        });
    }
);

router.get(
    "/employee-test",
    Auth,
    allowRoles("employee"),
    (req, res) => {
        res.json({
            success: true,
            message: "Employee access granted",
        });
    }
);




module.exports = router;