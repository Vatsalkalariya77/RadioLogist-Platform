const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 10000,
    },
    status: {
      type: String,
      enum: ["submitted", "reviewed"],
      default: "submitted",
    },
    feedback: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
);

submissionSchema.index({ caseId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
