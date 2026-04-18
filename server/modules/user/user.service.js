const User = require("../../models/user.model");
const AppError = require("../../utils/appError");
const { assertPayloadObject, serializeUser } = require("../../utils/auth");
const mongoose = require("mongoose");

const ALLOWED_ROLES = ["student", "admin", "superadmin"];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

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

const validateRole = (role) => {
  if (!ALLOWED_ROLES.includes(role)) {
    throw new AppError(
      `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(", ")}`,
      400,
    );
  }
};

exports.getUsers = async (query = {}) => {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE, "page");
  const requestedLimit = parsePositiveInteger(
    query.limit,
    DEFAULT_LIMIT,
    "limit",
  );
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const filter = {};

  if (query.role !== undefined) {
    const normalizedRole = query.role.trim().toLowerCase();
    validateRole(normalizedRole);
    filter.role = normalizedRole;
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map(serializeUser),
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

exports.updateUserRole = async (userId, payload = {}) => {
  assertPayloadObject(payload);

  const payloadKeys = Object.keys(payload);

  if (payloadKeys.length === 0) {
    throw new AppError("role is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  if (payloadKeys.length !== 1 || !payloadKeys.includes("role")) {
    throw new AppError("Only role can be updated", 400);
  }

  const { role } = payload;

  if (typeof role !== "string" || role.trim().length === 0) {
    throw new AppError("role is required", 400);
  }

  const normalizedRole = String(role).trim().toLowerCase();
  validateRole(normalizedRole);

  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  if (existingUser.role === normalizedRole) {
    return serializeUser(existingUser);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role: normalizedRole },
    { new: true, runValidators: true },
  );

  return serializeUser(user);
};
