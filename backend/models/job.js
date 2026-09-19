const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // ==========================================
    // PROJECT ID
    // ==========================================
    projectId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ==========================================
    // JOB TITLE
    // ==========================================
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // JOB TYPE
    // ==========================================
    jobType: {
      type: String,
      required: true,
      enum: [
        "Full Time",
        "Part Time",
        "Contract",
        "Internship",
      ],
    },

    // ==========================================
    // JOB DESCRIPTION
    // ==========================================
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // CREATED BY USER ID
    // ==========================================
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // CREATED BY ROLE
    // ==========================================
    createdByRole: {
      type: String,
      required: true,
      enum: ["admin", "employee"],
    },

    // ==========================================
    // START DATE
    // ==========================================
    startDate: {
      type: Date,
      required: true,
    },

    // ==========================================
    // DUE DATE
    // ==========================================
    dueDate: {
      type: Date,
      required: true,
    },

    // ==========================================
    // TASKS
    // ==========================================
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

    // ==========================================
    // TOTAL HOURS
    // ==========================================
    totalHours: {
      type: Number,
      default: 0,
    },

    // ==========================================
    // ASSIGNED EMPLOYEES
    // ==========================================
    assignedEmployees: [
      {
        type: String,
        trim: true,
      },
    ],

    // ==========================================
    // APPROVAL STATUS
    // ==========================================
    // IMPORTANT:
    // pending → waiting for admin
    // approved → admin approved
    // rejected → admin rejected
    // ==========================================
    approvalStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    // ==========================================
    // REJECTION REASON
    // ==========================================
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

module.exports = mongoose.model(
  "Job",
  jobSchema
);