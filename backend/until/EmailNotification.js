const nodemailer = require("nodemailer");


// =====================================================
// COMMON EMAIL FUNCTION
// OTP + JOB APPROVE + JOB REJECT
// =====================================================

const EmailNotification = async ({
    receiverEmail,
    subject,
    dynamicHtml,
}) => {
    try {

        console.log("======================================");
        console.log("EMAIL FUNCTION START");
        console.log("Receiver Email:", receiverEmail);
        console.log("Subject:", subject);
        console.log("======================================");


        // =================================================
        // CREATE TRANSPORTER
        // =================================================

        const transporter = nodemailer.createTransport({

            service: "gmail",

            auth: {
                user: process.env.email_user,
                pass: process.env.email_pass,
            },

        });


        console.log("Transporter created");


        // =================================================
        // MAIL OPTIONS
        // =================================================

        const mailOptions = {

            from:
                `"TechNova Private Limited" <${process.env.email_user}>`,

            to:
                receiverEmail,

            subject:
                subject,

            html: `
                <!DOCTYPE html>

                <html>

                <head>

                    <meta charset="UTF-8">

                    <title>${subject}</title>

                </head>

                <body>

                    <div style="
                        font-family: Arial, Helvetica, sans-serif;
                        background-color: #f4f6f8;
                        padding: 30px;
                    ">

                        <div style="
                            max-width: 600px;
                            margin: auto;
                            background-color: white;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                        ">

                            <div style="
                                text-align: center;
                                margin-bottom: 25px;
                            ">

                                <h2 style="
                                    margin: 0;
                                    color: #1f2937;
                                ">
                                    TechNova Private Limited
                                </h2>

                            </div>


                            ${dynamicHtml}


                            <hr style="
                                margin-top: 30px;
                                border: none;
                                border-top: 1px solid #ddd;
                            ">


                            <p style="
                                font-size: 12px;
                                color: #777;
                                text-align: center;
                            ">
                                This is an automated email.
                                Please do not reply to this email.
                            </p>

                        </div>

                    </div>

                </body>

                </html>
            `,
        };


        // =================================================
        // SEND EMAIL
        // =================================================

        console.log("Sending email...");


        const response =
            await transporter.sendMail(
                mailOptions
            );


        console.log(
            "Email Sent Successfully:",
            response.messageId
        );


        console.log("======================================");


        return true;


    } catch (error) {

        console.log("======================================");
        console.log("EMAIL ERROR");
        console.log("Code:", error.code);
        console.log("Message:", error.message);
        console.log("Response:", error.response);
        console.log("======================================");


        return false;
    }
};


module.exports = EmailNotification;