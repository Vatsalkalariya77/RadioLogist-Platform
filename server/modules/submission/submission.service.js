const mongoose = require("mongoose");

const Submission = require("../../models/submission.model");
const Case = require("../../models/case.model");
const AppError = require("../../utils/appError");
const { assertPayloadObject } = require("../../utils/auth");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const REVIEW_STATUSES = ["submitted", "reviewed"];

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

const validateReviewStatus = (status) => {
  if (!REVIEW_STATUSES.includes(status)) {
    throw new AppError(
      `Invalid status. Allowed values are: ${REVIEW_STATUSES.join(", ")}`,
      400,
    );
  }
};

const buildCreatePayload = (payload = {}, userId) => {
  assertPayloadObject(payload);

  const allowedKeys = ["caseId", "answer"];
  const payloadKeys = Object.keys(payload);
  const invalidKeys = payloadKeys.filter((key) => !allowedKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new AppError(
      `Invalid fields: ${invalidKeys.join(", ")}. Allowed fields are: ${allowedKeys.join(", ")}`,
      400,
    );
  }

  const caseId = payload.caseId;
  const answer = normalizeString(payload.answer);

  if (!caseId || !answer) {
    throw new AppError("caseId and answer are required", 400);
  }

  validateObjectId(caseId, "caseId");

  if (answer.length < 5) {
    throw new AppError("answer must be at least 5 characters long", 400);
  }

  return {
    caseId,
    userId,
    answer,
  };
};

const buildReviewPayload = (payload = {}) => {
  assertPayloadObject(payload);

  const allowedKeys = ["score", "feedback", "status"];
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

  if (payload.score !== undefined) {
    if (typeof payload.score !== "number" || Number.isNaN(payload.score)) {
      throw new AppError("score must be a number", 400);
    }

    if (payload.score < 0 || payload.score > 100) {
      throw new AppError("score must be between 0 and 100", 400);
    }

    updates.score = payload.score;
  }

  if (payload.feedback !== undefined) {
    const feedback = normalizeString(payload.feedback);
    updates.feedback = feedback;
  }

  if (payload.status !== undefined) {
    const status = normalizeString(payload.status).toLowerCase();

    if (!status) {
      throw new AppError("status is required", 400);
    }

    validateReviewStatus(status);
    updates.status = status;
  }

  return updates;
};

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
  answer: submissionDoc.answer,
  status: submissionDoc.status,
  feedback: submissionDoc.feedback,
  score: submissionDoc.score,
  createdAt: submissionDoc.createdAt,
  updatedAt: submissionDoc.updatedAt,
});

const populateSubmissionQuery = (query) =>
  query
    .populate("caseId", "title")
    .populate("userId", "name email");

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

  const existingSubmission = await Submission.exists({
    caseId: submissionPayload.caseId,
    userId: currentUser._id,
  });

  if (existingSubmission) {
    throw new AppError("You have already submitted an answer for this case", 409);
  }

  let submission;

  try {
    submission = await Submission.create(submissionPayload);
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError("You have already submitted an answer for this case", 409);
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
