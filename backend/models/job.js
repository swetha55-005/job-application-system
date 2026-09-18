const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
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
      enum: ["employee", "admin"],
    },

    assignedEmployees: {
      type: [String],
      validate: {
        validator: function (employees) {
          return employees.length <= 3;
        },
        message: "Maximum 3 employees can be assigned to a job",
      },
    },

    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", JobSchema);