const mongoose = require("mongoose");

const { Schema , model } = mongoose;

const OtpSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    
    otp: {
        type: Number,
        required: true
    },

    expiresAt: {
        type:  Data,
        required: true
    }
});

module.exports = mogoose.models.otps || model("opts", OtpSchema);