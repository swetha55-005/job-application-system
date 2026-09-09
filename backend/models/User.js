const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique
    },

    password: {
        type: String,
        required: true
    },

    contact: {
        type: String,
        required: true
    },

    age: {
        type: Number
    },

    gender: {
        type:String
    },

    address: {
        type:String
    },

    city: {
        type:String
    },

    state: {
        type:String
    },

    createAt: {
        type: Date,
        default: Date.now
    },

    role: {
        type: String,
        enum: ["staff","student","admin"],
        required:true
    }

});

const user = mongoose.model("user",userSchema);

module.exports = user;