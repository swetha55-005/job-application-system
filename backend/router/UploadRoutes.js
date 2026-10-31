
const express = require("express");
const multer = require("multer");
const {
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const s3 = require("../config/s3");
const S3Image = require("../models/S3Images");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      ["image/jpeg", "image/png", "image/webp"].includes(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(new Error("JPG, PNG, WEBP images only"));
    }
  },
});

const createKey = (filename) => {
  const safeName = filename.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );
  return `images/${randomUUID()}-${safeName}`;
};

const getImageUrl = (image) => {
  const region = process.env.AWS_REGION || "us-east-1";
  return `https://${image.bucket}.s3.${region}.amazonaws.com/${image.imageKey}`;
};

const formatImage = (image) => ({
  _id: image._id,
  imageName: image.imageName,
  imageKey: image.imageKey,
  bucket: image.bucket,
  imageUrl: getImageUrl(image),
  createdAt: image.createdAt,
  updatedAt: image.updatedAt,
});

// POST - Upload image to S3 and MongoDB
router.post("/image", upload.single("image"), async (req, res) => {
  let key;
  let uploadedToS3 = false;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    key = createKey(req.file.originalname);

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    uploadedToS3 = true;

    const savedImage = await S3Image.create({
      imageName: req.file.originalname,
      imageKey: key,
      bucket: process.env.S3_BUCKET_NAME,
    });

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: formatImage(savedImage),
    });
  } catch (error) {
    console.error("Upload error:", error);

    if (uploadedToS3 && key) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
          })
        );
      } catch (cleanupError) {
        console.error("S3 cleanup failed:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
});

// GET - List all uploaded images
router.get("/images", async (req, res) => {
  try {
    const images = await S3Image.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: images.map(formatImage),
    });
  } catch (error) {
    console.error("Fetch images error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch images",
    });
  }
});

// PUT - Replace image in S3 and update MongoDB
router.put(
  "/image/:id",
  upload.single("image"),
  async (req, res) => {
    let newKey;
    let newUploaded = false;

    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid image ID",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "New image is required",
        });
      }

      const image = await S3Image.findById(req.params.id);

      if (!image) {
        return res.status(404).json({
          message: "Image not found",
        });
      }

      const oldKey = image.imageKey;
      const oldBucket = image.bucket;
      newKey = createKey(req.file.originalname);

      // Upload replacement first
      await s3.send(
        new PutObjectCommand({
          Bucket: oldBucket,
          Key: newKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );

      newUploaded = true;

      // Update MongoDB
      image.imageName = req.file.originalname;
      image.imageKey = newKey;
      await image.save();

      // Remove old S3 image
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: oldBucket,
            Key: oldKey,
          })
        );
      } catch (cleanupError) {
        console.error(
          "Old S3 image cleanup failed:",
          cleanupError
        );
      }

      res.json({
        success: true,
        message: "Image updated successfully",
        data: formatImage(image),
      });
    } catch (error) {
      console.error("Update error:", error);

      // If MongoDB update failed, remove new S3 upload
      if (newUploaded && newKey) {
        try {
          const current = await S3Image.findById(
            req.params.id
          );

          if (!current || current.imageKey !== newKey) {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: newKey,
              })
            );
          }
        } catch (cleanupError) {
          console.error("Cleanup failed:", cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        message: "Image update failed",
      });
    }
  }
);

// DELETE - Remove image from S3 and MongoDB
router.delete("/image/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid image ID",
      });
    }

    const image = await S3Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    // Delete from S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: image.bucket,
        Key: image.imageKey,
      })
    );

    // Delete from MongoDB
    await S3Image.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);

    res.status(500).json({
      success: false,
      message: "Image deletion failed",
    });
  }
});

module.exports = router;
