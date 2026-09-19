const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    jobType: {
      type: String,
      required: true,
      enum: ["Full Time", "Part Time", "Contract", "Internship"],
    },

    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: String,
      required: true,
      trim: true,
    },

    createdByRole: {
      type: String,
      required: true,
      enum: ["admin", "employee"],
    },

    startDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    tasks: [
      {
        taskName: {
          type: String,
          required: true,
          trim: true,
        },

        hours: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    totalHours: {
      type: Number,
      default: 0,
    },

    assignedEmployees: [
      {
        type: String,
        trim: true,
      },
    ],

    approvalStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);