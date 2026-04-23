const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => Array.isArray(tags),
        message: "tags must be an array of strings",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dicomFiles: {
      type: [String],
      default: [],
    },

    modality: {
      type: String,
      enum: ["CT", "MRI", "X-ray", "Ultrasound"],
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Case", caseSchema);
