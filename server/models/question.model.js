const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["mcq", "text"],
      required: true,
    },
    options: {
      type: [String],
      default: undefined,
      validate: {
        validator(options) {
          if (this.type !== "mcq") {
            return true;
          }

          return (
            Array.isArray(options) &&
            options.length === 4 &&
            options.every((option) => typeof option === "string" && option.trim())
          );
        },
        message: "MCQ questions must have exactly 4 non-empty options",
      },
    },
    correctAnswer: {
      type: String,
      trim: true,
      required() {
        return this.type === "mcq";
      },
      validate: {
        validator(correctAnswer) {
          if (this.type !== "mcq") {
            return true;
          }

          return Array.isArray(this.options) && this.options.includes(correctAnswer);
        },
        message: "correctAnswer must be one of the provided options",
      },
    },
    marks: {
      type: Number,
      default: 5,
      min: 1,
      max: 20,
    },
  },
  {
    timestamps: true,
  },
);

questionSchema.index({ caseId: 1, createdAt: -1 });

module.exports = mongoose.model("Question", questionSchema);
