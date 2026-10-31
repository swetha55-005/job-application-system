const mongoose = require("mongoose");


const multerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    age: {
        type: Number,
        required: true,
    },

    image: {
        filename: {
            type: String,
            required: true,
        },

        filepath: {
            type: String,
            required: true,
        },
    },
});

const multermodel = mongoose.model("Multer", multerSchema);

module.exports = multermodel;