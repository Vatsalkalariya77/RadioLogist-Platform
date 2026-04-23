const mongoose = require("mongoose");

const Submission = require("../../models/submission.model");
const Case = require("../../models/case.model");
const Question = require("../../models/question.model");
const AppError = require("../../utils/appError");
const { assertPayloadObject } = require("../../utils/auth");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const normalizeString = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

const validateObjectId = (id, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
};

const parsePositiveInteger = (value, fallback, fieldName) => {
  if (value === undefined) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new AppError(`${fieldName} must be a positive integer`, 400);
  }

  return parsedValue;
};

const buildCreatePayload = (payload = {}, userId) => {
  assertPayloadObject(payload);

  const allowedKeys = ["caseId", "answers"];
  const payloadKeys = Object.keys(payload);
  const invalidKeys = payloadKeys.filter((key) => !allowedKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new AppError(
      `Invalid fields: ${invalidKeys.join(", ")}. Allowed fields are: ${allowedKeys.join(", ")}`,
      400,
    );
  }

  const caseId = payload.caseId;

  if (!caseId) {
    throw new AppError("caseId is required", 400);
  }

  validateObjectId(caseId, "caseId");

  if (!Array.isArray(payload.answers) || payload.answers.length === 0) {
    throw new AppError("answers must be a non-empty array", 400);
  }

  const seenQuestionIds = new Set();
  const answers = payload.answers.map((answerItem, index) => {
    if (!answerItem || typeof answerItem !== "object" || Array.isArray(answerItem)) {
      throw new AppError(`answers[${index}] must be an object`, 400);
    }

    const answerAllowedKeys = ["questionId", "answer"];
    const answerKeys = Object.keys(answerItem);
    const invalidAnswerKeys = answerKeys.filter(
      (key) => !answerAllowedKeys.includes(key),
    );

    if (invalidAnswerKeys.length > 0) {
      throw new AppError(
        `Invalid fields in answers[${index}]: ${invalidAnswerKeys.join(", ")}. Allowed fields are: ${answerAllowedKeys.join(", ")}`,
        400,
      );
    }

    const questionId = answerItem.questionId;
    const answer = normalizeString(answerItem.answer);

    if (!questionId || !answer) {
      throw new AppError(
        `answers[${index}] must include questionId and answer`,
        400,
      );
    }

    validateObjectId(questionId, `answers[${index}].questionId`);

    if (seenQuestionIds.has(questionId.toString())) {
      throw new AppError("Duplicate questionId values are not allowed", 400);
    }

    if (answer.length > 5000) {
      throw new AppError("answer must be at most 5000 characters long", 400);
    }

    seenQuestionIds.add(questionId.toString());

    return {
      questionId,
      answer,
    };
  });

  return {
    caseId,
    userId,
    answers,
  };
};

const buildReviewPayload = (payload = {}) => {
  assertPayloadObject(payload);

  const allowedKeys = ["score", "feedback"];
  const payloadKeys = Object.keys(payload);

  if (payloadKeys.length === 0) {
    throw new AppError("At least one field is required to review a submission", 400);
  }

  const invalidKeys = payloadKeys.filter((key) => !allowedKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new AppError(
      `Invalid fields: ${invalidKeys.join(", ")}. Allowed fields are: ${allowedKeys.join(", ")}`,
      400,
    );
  }

  const updates = {};

  if (payload.score === undefined) {
    throw new AppError("score is required to review a submission", 400);
  }

  if (typeof payload.score !== "number" || Number.isNaN(payload.score)) {
    throw new AppError("score must be a number", 400);
  }

  if (payload.score < 0 || payload.score > 100) {
    throw new AppError("score must be between 0 and 100", 400);
  }

  updates.score = payload.score;

  if (payload.feedback !== undefined) {
    const feedback = normalizeString(payload.feedback);
    updates.feedback = feedback;
  }

  updates.status = "reviewed";

  return updates;
};

const serializeAnswer = (answerItem) => ({
  questionId: answerItem.questionId?._id
    ? {
        id: answerItem.questionId._id.toString(),
        questionText: answerItem.questionId.questionText,
        type: answerItem.questionId.type,
        marks: answerItem.questionId.marks,
      }
    : answerItem.questionId.toString(),
  answer: answerItem.answer,
});

const serializeSubmission = (submissionDoc) => ({
  id: submissionDoc._id.toString(),
  caseId: submissionDoc.caseId?._id
    ? {
        id: submissionDoc.caseId._id.toString(),
        title: submissionDoc.caseId.title,
      }
    : submissionDoc.caseId.toString(),
  userId: submissionDoc.userId?._id
    ? {
        id: submissionDoc.userId._id.toString(),
        name: submissionDoc.userId.name,
        email: submissionDoc.userId.email,
      }
    : submissionDoc.userId.toString(),
  answers: submissionDoc.answers.map(serializeAnswer),
  status: submissionDoc.status,
  feedback: submissionDoc.feedback,
  score: submissionDoc.score,
  createdAt: submissionDoc.createdAt,
  updatedAt: submissionDoc.updatedAt,
});

const populateSubmissionQuery = (query) =>
  query
    .populate("caseId", "title")
    .populate("userId", "name email")
    .populate("answers.questionId", "questionText type marks");

const getSubmissionByIdOrThrow = async (submissionId) => {
  validateObjectId(submissionId, "submission ID");

  const submission = await populateSubmissionQuery(
    Submission.findById(submissionId),
  );

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  return submission;
};

exports.createSubmission = async (payload = {}, currentUser) => {
  if (!currentUser || currentUser.role !== "student") {
    throw new AppError("Only students can create submissions", 403);
  }

  const submissionPayload = buildCreatePayload(payload, currentUser._id);
  const caseExists = await Case.exists({ _id: submissionPayload.caseId });

  if (!caseExists) {
    throw new AppError("Case not found", 404);
  }

  const questionIds = submissionPayload.answers.map((answer) => answer.questionId);
const questions = await Question.find({
  _id: { $in: questionIds },
  caseId: submissionPayload.caseId,
}).select("_id");

if (questions.length !== questionIds.length) {
  throw new AppError(
    "All questionIds must belong to the provided case",
    400
  );
}

  const existingSubmission = await Submission.exists({
    caseId: submissionPayload.caseId,
    userId: currentUser._id,
  });

  if (existingSubmission) {
    throw new AppError("You have already submitted answers for this case", 409);
  }

  let submission;

  try {
    submission = await Submission.create(submissionPayload);
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError("You have already submitted answers for this case", 409);
    }

    throw error;
  }

  return serializeSubmission(
    await populateSubmissionQuery(
      Submission.findById(submission._id),
    ),
  );
};

exports.getAllSubmissions = async (query = {}) => {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE, "page");
  const requestedLimit = parsePositiveInteger(query.limit, DEFAULT_LIMIT, "limit");
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;
  const filter = {};

  if (query.caseId !== undefined) {
    validateObjectId(query.caseId, "caseId");
    filter.caseId = query.caseId;
  }

  if (query.userId !== undefined) {
    validateObjectId(query.userId, "userId");
    filter.userId = query.userId;
  }

  const [submissions, total] = await Promise.all([
    populateSubmissionQuery(
      Submission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ),
    Submission.countDocuments(filter),
  ]);

  return {
    submissions: submissions.map(serializeSubmission),
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

exports.getMySubmissions = async (currentUser) => {
  const submissions = await populateSubmissionQuery(
    Submission.find({ userId: currentUser._id }).sort({ createdAt: -1 }),
  );

  return submissions.map(serializeSubmission);
};

exports.getSubmissionById = async (submissionId, currentUser) => {
  const submission = await getSubmissionByIdOrThrow(submissionId);

  if (
    currentUser.role === "student" &&
    submission.userId._id.toString() !== currentUser._id.toString()
  ) {
    throw new AppError("You do not have permission to view this submission", 403);
  }

  return serializeSubmission(submission);
};

exports.reviewSubmission = async (submissionId, payload = {}, currentUser) => {
 
  if (!["admin", "superadmin"].includes(currentUser.role)) {
    throw new AppError("You do not have permission", 403);
  }

  validateObjectId(submissionId, "submission ID");

  const updates = buildReviewPayload(payload);

  const submission = await populateSubmissionQuery(
    Submission.findByIdAndUpdate(submissionId, updates, {
      new: true,
      runValidators: true,
    })
  );

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  return serializeSubmission(submission);
};
