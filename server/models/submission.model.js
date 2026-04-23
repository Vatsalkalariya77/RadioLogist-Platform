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
    answers: {
      type: [
        {
          questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
          },
          answer: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 5000,
          },
        },
      ],
      required: true,
      validate: {
        validator: (answers) => Array.isArray(answers) && answers.length > 0,
        message: "answers must contain at least one answer",
      },
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

submissionSchema.path("answers").validate(function validateUniqueQuestionIds(
  answers,
) {
  if (!Array.isArray(answers)) {
    return false;
  }

  const questionIds = answers.map((answer) => answer.questionId?.toString());

  return questionIds.length === new Set(questionIds).size;
}, "Duplicate questionId values are not allowed");

module.exports = mongoose.model("Submission", submissionSchema);
