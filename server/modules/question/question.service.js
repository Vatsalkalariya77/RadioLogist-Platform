const mongoose = require("mongoose");

const Question = require("../../models/question.model");
const Case = require("../../models/case.model");
const AppError = require("../../utils/appError");
const { assertPayloadObject } = require("../../utils/auth");

const QUESTION_TYPES = ["mcq", "text"];

const normalizeString = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

const normalizeType = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const validateObjectId = (id, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
};

const validateQuestionText = (questionText) => {
  if (!questionText) {
    throw new AppError("questionText is required", 400);
  }

  if (questionText.length < 5 || questionText.length > 500) {
    throw new AppError("questionText must be between 5 and 500 characters", 400);
  }
};

const validateType = (type) => {
  if (!QUESTION_TYPES.includes(type)) {
    throw new AppError(
      `Invalid type. Allowed values are: ${QUESTION_TYPES.join(", ")}`,
      400,
    );
  }
};

const normalizeOptions = (options) => {
  if (!Array.isArray(options)) {
    throw new AppError("options must be an array of exactly 4 strings", 400);
  }

  if (options.length !== 4) {
    throw new AppError("options must contain exactly 4 items", 400);
  }

  const normalizedOptions = options.map((option) => normalizeString(option));

  if (normalizedOptions.some((option) => !option)) {
    throw new AppError("options must contain only non-empty strings", 400);
  }

  return normalizedOptions;
};

const validateMarks = (marks) => {
  if (typeof marks !== "number" || Number.isNaN(marks)) {
    throw new AppError("marks must be a number", 400);
  }

  if (marks < 1 || marks > 20) {
    throw new AppError("marks must be between 1 and 20", 400);
  }
};

const serializeQuestion = (questionDoc, hideAnswer = false) => ({
  id: questionDoc._id.toString(),
  caseId: questionDoc.caseId?._id
    ? {
        id: questionDoc.caseId._id.toString(),
        title: questionDoc.caseId.title,
      }
    : questionDoc.caseId.toString(),
  questionText: questionDoc.questionText,
  type: questionDoc.type,
  options: questionDoc.options,
  correctAnswer: hideAnswer ? undefined : questionDoc.correctAnswer,
  marks: questionDoc.marks,
  createdAt: questionDoc.createdAt,
  updatedAt: questionDoc.updatedAt,
});

const populateQuestionQuery = (query) => query.populate("caseId", "title");

const buildCreatePayload = (payload = {}) => {
  assertPayloadObject(payload);

  const allowedKeys = [
    "caseId",
    "questionText",
    "type",
    "options",
    "correctAnswer",
    "marks",
  ];
  const payloadKeys = Object.keys(payload);
  const invalidKeys = payloadKeys.filter((key) => !allowedKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new AppError(
      `Invalid fields: ${invalidKeys.join(", ")}. Allowed fields are: ${allowedKeys.join(", ")}`,
      400,
    );
  }

  const caseId = payload.caseId;
  const questionText = normalizeString(payload.questionText);
  const type = normalizeType(payload.type);

  if (!caseId || !questionText || !type) {
    throw new AppError("caseId, questionText, and type are required", 400);
  }

  validateObjectId(caseId, "caseId");
  validateQuestionText(questionText);
  validateType(type);

  const questionPayload = {
    caseId,
    questionText,
    type,
  };

  if (payload.marks !== undefined) {
    validateMarks(payload.marks);
    questionPayload.marks = payload.marks;
  }

  if (type === "mcq") {
    const options = normalizeOptions(payload.options);
    const correctAnswer = normalizeString(payload.correctAnswer);

    if (!correctAnswer) {
      throw new AppError("correctAnswer is required for MCQ questions", 400);
    }

    if (!options.includes(correctAnswer)) {
      throw new AppError("correctAnswer must be one of the provided options", 400);
    }

    questionPayload.options = options;
    questionPayload.correctAnswer = correctAnswer;
  }

  return questionPayload;
};

const buildUpdatePayload = (existingQuestion, payload = {}) => {
  assertPayloadObject(payload);

  const allowedKeys = ["questionText", "type", "options", "correctAnswer", "marks"];
  const payloadKeys = Object.keys(payload);

  if (payloadKeys.length === 0) {
    throw new AppError("At least one field is required to update", 400);
  }

  const invalidKeys = payloadKeys.filter((key) => !allowedKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new AppError(
      `Invalid fields: ${invalidKeys.join(", ")}. Allowed fields are: ${allowedKeys.join(", ")}`,
      400,
    );
  }

  const nextType =
    payload.type !== undefined ? normalizeType(payload.type) : existingQuestion.type;

  validateType(nextType);

  const updates = { type: nextType };

  if (payload.questionText !== undefined) {
    const questionText = normalizeString(payload.questionText);
    validateQuestionText(questionText);
    updates.questionText = questionText;
  }

  if (payload.marks !== undefined) {
    validateMarks(payload.marks);
    updates.marks = payload.marks;
  }

  if (nextType === "mcq") {
    const options =
      payload.options !== undefined
        ? normalizeOptions(payload.options)
        : existingQuestion.options;
    const correctAnswer =
      payload.correctAnswer !== undefined
        ? normalizeString(payload.correctAnswer)
        : existingQuestion.correctAnswer;

    if (!Array.isArray(options) || options.length !== 4) {
      throw new AppError("options must contain exactly 4 items", 400);
    }

    if (!correctAnswer) {
      throw new AppError("correctAnswer is required for MCQ questions", 400);
    }

    if (!options.includes(correctAnswer)) {
      throw new AppError("correctAnswer must be one of the provided options", 400);
    }

    updates.options = options;
    updates.correctAnswer = correctAnswer;
  } else {
    updates.options = undefined;
    updates.correctAnswer = undefined;
  }

  return updates;
};

exports.createQuestion = async (payload = {}) => {
  const questionPayload = buildCreatePayload(payload);
  const caseExists = await Case.exists({ _id: questionPayload.caseId });

  if (!caseExists) {
    throw new AppError("Case not found", 404);
  }

  const question = await Question.create(questionPayload);

  return serializeQuestion(
    await populateQuestionQuery(Question.findById(question._id)),
  );
};

exports.getQuestionsByCase = async (caseId, currentUser) => {
  validateObjectId(caseId, "caseId");

  const caseExists = await Case.exists({ _id: caseId });

  if (!caseExists) {
    throw new AppError("Case not found", 404);
  }

  const questions = await populateQuestionQuery(
    Question.find({ caseId }).sort({ createdAt: 1 }),
  );

  return questions.map((q) =>
  serializeQuestion(q, currentUser.role === "student")
);
};

exports.updateQuestion = async (questionId, payload = {}) => {
  validateObjectId(questionId, "question ID");

  const question = await Question.findById(questionId);

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  const updates = buildUpdatePayload(question, payload);

  question.set(updates);
  await question.save();
  await question.populate("caseId", "title");

  return serializeQuestion(question);
};

exports.deleteQuestion = async (questionId) => {
  validateObjectId(questionId, "question ID");

  const question = await Question.findByIdAndDelete(questionId);

  if (!question) {
    throw new AppError("Question not found", 404);
  }
};
