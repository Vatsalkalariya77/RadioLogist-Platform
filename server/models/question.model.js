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
          if (this.type === "text") {
            return options === undefined;
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
          if (this.type === "text") {
            return !correctAnswer;
          }

          return Array.isArray(this.options) && this.options.includes(correctAnswer);
        },
        message: "correctAnswer must be one of the provided options",
      },
    },
    expectedAnswer: {
      type: String,
      trim: true,
      required() {
        return this.type === "text";
      },
      validate: {
        validator(expectedAnswer) {
          if (this.type === "mcq") {
            return !expectedAnswer;
          }

          return typeof expectedAnswer === "string" && expectedAnswer.trim();
        },
        message: "expectedAnswer is required for text questions",
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
