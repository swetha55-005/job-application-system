const express = require("express");

const multermodel = require("../models/multerschema");
const upload = require("../until/uploadMiddleware")

const MulterRouter = express.Router();




MulterRouter.post(
    "/create-images",
    upload.single("image"),
    async (req, res) => {
        try {
            const { name, age } = req.body;

            if (!name || !age || !req.file) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required",
                });
            }

            const newData = new multermodel({
                name: name,
                age: age,
                image: {
                    filename: req.file.filename,
                    filepath: req.file.path,
                },
            });

            const savedData = await newData.save();

            return res.status(201).json({
                success: true,
                message: "Image uploaded successfully",
                data: savedData,
            });

        } catch (error) {
            console.error("Image upload error:", error);

            return res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    }
);

module.exports = MulterRouter;