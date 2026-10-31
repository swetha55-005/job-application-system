
const mongoose = require("mongoose");

const s3ImageSchema = new mongoose.Schema(
  {
    imageName: {
      type: String,
      required: true,
    },
    imageKey: {
      type: String,
      required: true,
      unique: true,
    },
    bucket: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("S3Image", s3ImageSchema);
