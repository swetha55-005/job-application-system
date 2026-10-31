
const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const Image = require("../models/image");
const cloudinary = require("../config/cloudinary");
// Upload image
router.post("/uploads", upload.single("images"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }
    const newImage = new Image({
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
    await newImage.save();
    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: newImage,
    });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
});
// Get all images
router.get("/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Fetch images error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch images",
    });
  }
});
// Delete image
router.delete("/images/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    // Delete from Cloudinary first
    if (image.publicId) {
      const result = await cloudinary.uploader.destroy(image.publicId);
      if (result.result !== "ok" && result.result !== "not found") {
        return res.status(500).json({
          success: false,
          message: "Failed to delete image from Cloudinary",
        });
      }
    }
    // Delete from MongoDB
    await Image.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Image deletion failed",
    });
  }
});
router.put("/images/:id", upload.single("images"), async (req, res) => {
  let newPublicId;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a new image",
      });
    }
    newPublicId = req.file.filename;
    const image = await Image.findById(req.params.id);
    if (!image) {
      await cloudinary.uploader.destroy(newPublicId);

      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    const oldPublicId = image.publicId;
    image.imageUrl = req.file.path;
    image.publicId = newPublicId;
    await image.save();
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (deleteError) {
        console.error("Old image deletion error:", deleteError);
      }
    }
    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: image,
    });
  } catch (error) {
    console.error("Update image error:", error);
    if (newPublicId) {
      try {
        await cloudinary.uploader.destroy(newPublicId);
      } catch (cleanupError) {
        console.error("New image cleanup error:", cleanupError);
      }
    }
    res.status(500).json({
      success: false,
      message: "Image update failed",
    });
  }
});
module.exports = router;
