const mongoose = require("mongoose");

const Case = require("../../models/case.model");
const AppError = require("../../utils/appError");
const { assertPayloadObject } = require("../../utils/auth");

const ALLOWED_DIFFICULTIES = ["easy", "medium", "hard"];

const normalizeString = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

const normalizeDifficulty = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizeTags = (tags) => {
  if (tags === undefined) {
    return [];
  }

  if (!Array.isArray(tags)) {
    throw new AppError("tags must be an array of strings", 400);
  }

  const normalizedTags = tags.map((tag) => normalizeString(tag));

  if (normalizedTags.some((tag) => !tag)) {
    throw new AppError("tags must contain only non-empty strings", 400);
  }

  return [...new Set(normalizedTags)];
};

const validateObjectId = (id, fieldName = "Case ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
};

const validateDifficulty = (difficulty) => {
  if (!ALLOWED_DIFFICULTIES.includes(difficulty)) {
    throw new AppError(
      `Invalid difficulty. Allowed values are: ${ALLOWED_DIFFICULTIES.join(", ")}`,
      400,
    );
  }
};

const serializeCase = (caseDoc) => ({
  id: caseDoc._id.toString(),
  title: caseDoc.title,
  description: caseDoc.description,
  difficulty: caseDoc.difficulty,
  tags: caseDoc.tags,

  dicomFiles: caseDoc.dicomFiles,
  modality: caseDoc.modality,
  isPublished: caseDoc.isPublished,

  createdBy: caseDoc.createdBy?._id
    ? {
        id: caseDoc.createdBy._id.toString(),
        name: caseDoc.createdBy.name,
        email: caseDoc.createdBy.email,
        role: caseDoc.createdBy.role,
      }
    : caseDoc.createdBy.toString(),

  createdAt: caseDoc.createdAt,
  updatedAt: caseDoc.updatedAt,
});

const buildCreatePayload = (payload = {}, userId) => {
  assertPayloadObject(payload);

  const allowedKeys = [
    "title",
    "description",
    "difficulty",
    "tags",
    "modality",
    "dicomFiles",
    "isPublished",
  ];
  const payloadKeys = Object.keys(payload);
  const invalidKeys = payloadKeys.filter((key) => !allowedKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new AppError(
      `Invalid fields: ${invalidKeys.join(", ")}. Allowed fields are: ${allowedKeys.join(", ")}`,
      400,
    );
  }

  const title = normalizeString(payload.title);
  const description = normalizeString(payload.description);
  const difficulty = normalizeDifficulty(payload.difficulty);
  const tags = normalizeTags(payload.tags);

  if (!title || !description || !difficulty) {
    throw new AppError("title, description, and difficulty are required", 400);
  }

  validateDifficulty(difficulty);

  return {
    title,
    description,
    difficulty,
    tags,
    modality: payload.modality,
    dicomFiles: payload.dicomFiles || [],
    isPublished: payload.isPublished ?? false,
    createdBy: userId,
  };
};

const buildUpdatePayload = (payload = {}) => {
  assertPayloadObject(payload);

  const allowedKeys = [
    "title",
    "description",
    "difficulty",
    "tags",
    "modality",
    "dicomFiles",
    "isPublished",
  ];
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

  const updates = {};

  if (payload.title !== undefined) {
    const title = normalizeString(payload.title);

    if (!title) {
      throw new AppError("title cannot be empty", 400);
    }

    updates.title = title;
  }

  if (payload.description !== undefined) {
    const description = normalizeString(payload.description);

    if (!description) {
      throw new AppError("description cannot be empty", 400);
    }

    updates.description = description;
  }

  if (payload.difficulty !== undefined) {
    const difficulty = normalizeDifficulty(payload.difficulty);

    if (!difficulty) {
      throw new AppError("difficulty is required", 400);
    }

    validateDifficulty(difficulty);
    updates.difficulty = difficulty;
  }

  if (payload.tags !== undefined) {
    updates.tags = normalizeTags(payload.tags);
  }

  if (payload.modality !== undefined) {
    updates.modality = payload.modality;
  }

  if (payload.dicomFiles !== undefined) {
    updates.dicomFiles = payload.dicomFiles;
  }

  if (payload.isPublished !== undefined) {
    updates.isPublished = payload.isPublished;
  }

  return updates;
};

const findCaseById = async (caseId) => {
  validateObjectId(caseId);

  const caseDoc = await Case.findById(caseId).populate(
    "createdBy",
    "name email role",
  );

  if (!caseDoc) {
    throw new AppError("Case not found", 404);
  }

  return caseDoc;
};

exports.createCase = async (payload = {}, userId) => {
  const casePayload = buildCreatePayload(payload, userId);
  const caseDoc = await Case.create(casePayload);

  return serializeCase(await caseDoc.populate("createdBy", "name email role"));
};

exports.getCases = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const cases = await Case.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name email role");

  const total = await Case.countDocuments();

  return {
    cases: cases.map(serializeCase),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.getCaseById = async (caseId) => {
  const caseDoc = await findCaseById(caseId);
  return serializeCase(caseDoc);
};

exports.updateCase = async (caseId, payload = {}) => {
  validateObjectId(caseId);

  const updates = buildUpdatePayload(payload);
  const caseDoc = await Case.findByIdAndUpdate(caseId, updates, {
    new: true,
    runValidators: true,
  }).populate("createdBy", "name email role");

  if (!caseDoc) {
    throw new AppError("Case not found", 404);
  }

  return serializeCase(caseDoc);
};

exports.deleteCase = async (caseId) => {
  validateObjectId(caseId);

  const caseDoc = await Case.findByIdAndDelete(caseId);

  if (!caseDoc) {
    throw new AppError("Case not found", 404);
  }
};
