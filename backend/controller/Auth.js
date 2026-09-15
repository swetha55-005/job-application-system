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
            Date.now() + 6 * 60 * 1000
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





const Verifyotp = async (req, res) => {

    try {

        const {
            fullName,
            Id,
            personalEmail,
            workEmail,
            phoneNumber,
            password,
            enterOtp
        } = req.body;


        // ===============================
        // CHECK ALL FIELDS
        // ===============================

        if (
            !fullName ||
            !Id ||
            !personalEmail ||
            !workEmail ||
            !phoneNumber ||
            !password ||
            !enterOtp
        ) {

            return res.json({
                success: false,
                message: "All fields are required!"
            });
        }


        // ===============================
        // PERSONAL EMAIL
        // ===============================

        const UserEmail = personalEmail.trim().toLowerCase();


        // ===============================
        // ID + ROLE
        // ===============================

        const UserId = Id.trim().toUpperCase();

        let UserRole;

        if (UserId.startsWith("ADM")) {

            UserRole = "admin";

        } else if (UserId.startsWith("EMP")) {

            UserRole = "employee";

        } else {

            return res.json({
                success: false,
                message: "Invalid ID. Use EMP001 or ADM001"
            });
        }


        // ===============================
        // FIND OTP
        // ===============================

        const otpData = await Otp.findOne({
            email: UserEmail
        });


        // ===============================
        // OTP NOT FOUND
        // ===============================

        if (!otpData) {

            return res.json({
                success: false,
                message: "OTP not found!"
            });
        }


        // ===============================
        // CHECK OTP EXPIRY
        // ===============================

        if (new Date() > otpData.expiresAt) {

            return res.json({
                success: false,
                message: "OTP expired!"
            });
        }


        // ===============================
        // CHECK OTP
        // ===============================

        if (Number(otpData.otp) !== Number(enterOtp)) {

            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }


        // ===============================
        // CHECK EXISTING PERSONAL EMAIL
        // ===============================

        const existingUser = await Usermodel.findOne({
            personalEmail: UserEmail
        });


        if (existingUser) {

            return res.json({
                success: false,
                message: "Email already registered"
            });
        }


        // ===============================
        // CHECK EXISTING ID
        // ===============================

        const existingEmployee = await Usermodel.findOne({
            employeeId: UserId
        });


        if (existingEmployee) {

            return res.json({
                success: false,
                message: "ID already registered"
            });
        }


        // ===============================
        // CREATE USER
        // ===============================

        const saveUser = await Usermodel.create({

            fullName,

            employeeId: UserId,

            personalEmail: UserEmail,

            workEmail: workEmail.trim().toLowerCase(),

            phoneNumber,

            password,

            role: UserRole
        });


        // ===============================
        // DELETE OTP
        // ===============================

        await Otp.deleteOne({
            email: UserEmail
        });


        // ===============================
        // SUCCESS
        // ===============================

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
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({
                success: false,
                message: "Email and password are required"
            });
        }

        const UserEmail = email.trim().toLowerCase();

        const user = await Usermodel.findOne({
            $or: [
                { personalEmail: UserEmail },
                { workEmail: UserEmail }
            ]
        });

        if (!user) {
            return res.json({
                success: false,
                message: "User does not exist"
            });
        }

        if (user.password !== password) {
            return res.json({
                success: false,
                message: "Invalid password"
            });
        }

        if (!user.isActive) {
            return res.json({
                success: false,
                message: "Account is inactive"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                employeeId: user.employeeId,
                role: user.role,
                personalEmail: user.personalEmail,
                workEmail: user.workEmail
            }
        });

    } catch (err) {
        console.log("Login error:", err);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};




// ========================================
// APPROVE EMPLOYEE
// ========================================

const approveEmployee = async (req, res) => {

    try {

        const { employeeId } = req.params;

        console.log("Employee ID:", employeeId);


        // Find employee
        const employee = await Usermodel.findOne({
            employeeId: employeeId
        });


        // Employee not found
        if (!employee) {

            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });

        }


        console.log("Employee Found:", employee.fullName);
        console.log("Employee Email:", employee.personalEmail);


        // ========================================
        // APPROVAL EMAIL HTML
        // ========================================

        const html = `

            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                background-color: #ffffff;
            ">

                <h2 style="
                    color: #16a34a;
                    margin-bottom: 20px;
                ">
                    Application Approved
                </h2>


                <p>
                    Dear
                    <strong>${employee.fullName}</strong>,
                </p>


                <p>
                    Your application has been
                    <strong style="color: green;">
                        approved
                    </strong>
                    by the Admin.
                </p>


                <p>
                    <strong>Employee ID:</strong>
                    ${employee.employeeId}
                </p>


                <p>
                    <strong>Status:</strong>
                    <span style="color: green;">
                        Approved
                    </span>
                </p>


                <p>
                    You can now continue with your assigned work.
                </p>


                <br>


                <p>
                    Regards,
                    <br>
                    <strong>
                        TechNova Private Limited
                    </strong>
                </p>

            </div>

        `;


        // ========================================
        // SEND APPROVAL EMAIL
        // ========================================

        const isMailSent = await EmailNotification({

            receiverEmail: employee.personalEmail,

            subject:
                "Application Approved - TechNova Solutions",

            dynamicHtml: html

        });


        // Email failed
        if (!isMailSent) {

            return res.status(500).json({

                success: false,

                message:
                    "Employee approved but email sending failed"

            });

        }


        // ========================================
        // SUCCESS
        // ========================================

        return res.status(200).json({

            success: true,

            message:
                "Employee approved and email sent successfully"

        });


    } catch (error) {

        console.log(
            "Approve Employee Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};










module.exports = {
    sendotp,
    Verifyotp,
    login,
    approveEmployee
};