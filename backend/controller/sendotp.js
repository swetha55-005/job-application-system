const Otp = require("../models/Otp");
const Usermodel = require("../models/User");


const sendotp = async (req,res) => {

    try{
        const {email} = req.body; 

        console.log("email", email)
     
        if(!email) {
            return res.json({ success : false, message : "email is required .please provide an email!"})
        }

        const userEmail = email.toLowerCase();

        const existingUser = await Usermodel.findOne({email: userEmail});

        if(existingUser){
            return res.json({success : false , message : " account existing "})
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        );

        const expiry = new Date(
            Date.now() + 5 * 60 * 1000
        );

        
        const updateotp = await Otp.updateOne(
            {
                email: userEmail
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
            if (!updateotp) {
            return res.json({ success: false, message: "Failed to save OTP. Please try again." });
        }
        return res.json({success : true, message : "otp send sucessfully"})
        
    }catch (err) {
        console.log("Error in send OTP:", err);
        return res.status(500).json({success: false,message: "Internal server error"});
    }
}

module.exports = sendotp;  