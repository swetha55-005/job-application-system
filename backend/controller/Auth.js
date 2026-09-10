const Otp = require("../models/Otp");
const Usermodel = require("../models/User");
const EmailNotification = require("../until/EmailNotification");


// ===============================
// SEND OTP
// ===============================
const sendotp = async (req, res) => {
    try {
        const { email } = req.body;

        console.log("email:", email);

        // Check email
        if (!email) {
            return res.json({
                success: false,
                message: "Email is required. Please provide an email!"
            });
        }

        // Convert email to lowercase
        const UserEmail = email.trim().toLowerCase();

        // Check existing user
        const existingUser = await Usermodel.findOne({
            email: UserEmail
        });

        if (existingUser) {
            return res.json({
                success: false,
                message: "Account already exists"
            });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        );

        // OTP expires in 5 minutes
        const expiry = new Date(
            Date.now() + 5 * 60 * 1000
        );


        // Save OTP
        const updateotp = await Otp.updateOne(
            {
                email: UserEmail
            },
            {
                $set: {
                    otp: otp,
                    expiresAt: expiry
                }
            },
            {
                upsert: true
            }
        );


        // Check OTP saved
        if (
            updateotp.modifiedCount === 0 &&
            updateotp.upsertedCount === 0
        ) {
            return res.json({
                success: false,
                message: "Failed to save OTP. Please try again."
            });
        }


        // ===============================
        // OTP EMAIL HTML
        // ===============================

        const html = `
<div style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 15px;">
        <tr>
            <td align="center">

                <table width="100%" cellpadding="0" cellspacing="0"
                    style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                        <td align="center"
                            style="background:linear-gradient(135deg,#0f172a,#1e3a8a);padding:35px 20px;">

                            <h1 style="margin:0;color:#ffffff;font-size:28px;">
                                Shankaeshwari Techonation
                            </h1>

                            <p style="margin-top:8px;color:#dbeafe;font-size:14px;">
                                Learning Management System
                            </p>

                        </td>
                    </tr>


                    <!-- Body -->
                    <tr>
                        <td style="padding:40px 30px;text-align:center;">

                            <h2 style="margin:0;color:#111827;font-size:24px;">
                                OTP Verification
                            </h2>

                            <p style="margin-top:15px;color:#4b5563;font-size:15px;line-height:26px;">
                                Use the verification code below to continue your process.
                            </p>


                            <!-- OTP Box -->
                            <div
                                style="margin:35px auto;background:#eff6ff;border:2px dashed #2563eb;border-radius:14px;padding:20px;max-width:280px;">

                                <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#1d4ed8;">
                                    ${otp}
                                </div>

                            </div>


                            <p style="margin-top:20px;color:#ef4444;font-size:14px;font-weight:600;">
                                This OTP will expire in 5 minutes.
                            </p>


                            <p style="margin-top:25px;color:#6b7280;font-size:14px;line-height:24px;">
                                If you didn't request this OTP, you can safely ignore this email.
                            </p>

                        </td>
                    </tr>


                    <!-- Footer -->
                    <tr>
                        <td
                            style="background:#f9fafb;padding:22px;text-align:center;border-top:1px solid #e5e7eb;">

                            <p style="margin:0;color:#6b7280;font-size:13px;">
                                © 2026 SAN Technovation Pvt. Ltd.
                            </p>

                            <p style="margin-top:8px;color:#9ca3af;font-size:12px;">
                                This is an automated email. Please do not reply.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</div>
`;


        // ===============================
        // SEND EMAIL
        // ===============================

        const isMailSent = await EmailNotification({
            receiverEmail: UserEmail,
            subject: "OTP Verification",
            dynamicHtml: html
        });


        // Check email sent
        if (!isMailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP to Mail! Please contact support Team."
            });
        }


        // Success
        return res.status(201).json({
            success: true,
            message: "OTP sent successfully"
        });


    } catch (err) {

        console.log("Error in send OTP:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// ===============================
// VERIFY OTP + CREATE USER
// ===============================

const Verifyotp = async (req, res) => {

    try {

        const {
            fullName,
            employeeId,
            personalEmail,
            workEmail,
            phoneNumber,
            password,
            enterOtp,
            role
        } = req.body;


        // Check all fields
        if (
            !fullName ||
            !employeeId ||
            !personalEmail ||
            !workEmail ||
            !phoneNumber ||
            !password ||
            !enterOtp ||
            !role
        ) {

            return res.json({
                success: false,
                message: "All fields are required!"
            });
        }


        // Personal email
        const UserEmail = personalEmail.trim().toLowerCase();


        // Role
        const UserRole = role.trim().toLowerCase();


        // Find OTP
        const otpData = await Otp.findOne({
            email: UserEmail
        });


        // OTP not found
        if (!otpData) {

            return res.json({
                success: false,
                message: "OTP not found!"
            });
        }


        // Check OTP expiry
        if (new Date() > otpData.expiresAt) {

            return res.json({
                success: false,
                message: "OTP expired!"
            });
        }


        // Check OTP
        if (Number(otpData.otp) !== Number(enterOtp)) {

            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }


        // Check existing user
        const existingUser = await Usermodel.findOne({
            email: UserEmail
        });


        if (existingUser) {

            return res.json({
                success: false,
                message: "Email already registered"
            });
        }


        // ===============================
        // CREATE USER
        // ===============================

        const saveUser = await Usermodel.create({

            fullName,

            employeeId,

            personalEmail: UserEmail,

            workEmail: workEmail.trim().toLowerCase(),

            phoneNumber,

            password,

            role: UserRole
        });


        // Delete OTP after successful verification
        await Otp.deleteOne({
            email: UserEmail
        });


        // Success
        return res.status(201).json({

            success: true,

            message: "OTP verified successfully",

            saveUser
        });


    } catch (err) {

        console.log("Verify OTP error:", err);

        return res.status(500).json({

            success: false,

            message: "Server error"
        });
    }
};



// ===============================
// EXPORT
// ===============================

module.exports = {
    sendotp,
    Verifyotp
};