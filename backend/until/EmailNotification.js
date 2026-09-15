const nodemailer = require("nodemailer");

const EmailNotification = async ({
    receiverEmail,
    subject,
    dynamicHtml
}) => {
    try {

        console.log("========== EMAIL FUNCTION START ==========");
        console.log("Receiver Email:", receiverEmail);

        const transporter = nodemailer.createTransport({
            service: "gmail",

            auth: {
                user:process.env.email_user,
                pass:process.env.email_pass
            }
        });

        console.log("Transporter created");

        const mailOptions = {
            from: `"TechNova Private Limited" <abivengadajalam7708@gmail.com>`,

            to: receiverEmail,

            subject: subject,

            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    ${dynamicHtml}
                </div>
            `
        };

        console.log("Sending email...");

        const response = await transporter.sendMail(mailOptions);

        console.log(
            "Email Sent Successfully:",
            response.messageId
        );

        return true;

    } catch (err) {

        console.log("========== EMAIL ERROR ==========");

        console.log("Code:", err.code);
        console.log("Message:", err.message);
        console.log("Response:", err.response);

        console.log("================================");

        return false;
    }
};

module.exports = EmailNotification;