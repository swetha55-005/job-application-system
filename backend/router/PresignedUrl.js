
const express = require("express");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3");

const router = express.Router();

router.get("/image-url/:key", async (req, res) => {
  try {
    const key = req.params.key;

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `images/${key}`,
    });

    const url = await getSignedUrl(s3, command, {
      expiresIn: 300,
    });

    res.json({
      message: "Presigned URL generated successfully",
      url,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Presigned URL error:", error.message);
    res.status(500).json({
      message: "Could not generate image URL",
    });
  }
});

module.exports = router;
