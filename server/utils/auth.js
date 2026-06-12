const AppError = require("./appError");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;
const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const PASSWORD_ERROR_MESSAGE =
  "Password must be 8-64 characters and include uppercase, lowercase, number, and special character";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const normalizeName = (name) =>
  typeof name === "string" ? name.trim().replace(/\s+/g, " ") : "";

const assertPayloadObject = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new AppError("Request body must be a JSON object", 400);
  }
};

const assertValidEmail = (email) => {
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }
};

const assertValidName = (name) => {
  if (name.length < 2 || name.length > 50) {
    throw new AppError("Name must be between 2 and 50 characters", 400);
  }

  if (!NAME_REGEX.test(name)) {
    throw new AppError(
      "Name may only contain letters, spaces, apostrophes, and hyphens",
      400
    );
  }
};

const assertStrongPassword = (password) => {
  if (typeof password !== "string") {
    throw new AppError(PASSWORD_ERROR_MESSAGE, 400);
  }

  if (!PASSWORD_REGEX.test(password)) {
    throw new AppError(PASSWORD_ERROR_MESSAGE, 400);
  }
};

const validateRegisterPayload = (payload = {}) => {
  assertPayloadObject(payload);

  const { name, email, password } = payload;
  const normalizedName = normalizeName(name);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedName || !normalizedEmail || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }

  assertValidName(normalizedName);
  assertValidEmail(normalizedEmail);
  assertStrongPassword(password);

  return {
    name: normalizedName,
    email: normalizedEmail,
    password,
  };
};

const validateLoginPayload = (payload = {}) => {
  assertPayloadObject(payload);

  const { email, password } = payload;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    throw new AppError("Email and password are required", 400);
  }

  assertValidEmail(normalizedEmail);

  if (typeof password !== "string" || password.length === 0) {
    throw new AppError("Email and password are required", 400);
  }

  return {
    email: normalizedEmail,
    password,
  };
};

const getAccessJwtConfig = () => {
  const {
    JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRES_IN,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    JWT_ISSUER,
    JWT_AUDIENCE,
  } = process.env;
  const secret = JWT_ACCESS_SECRET || JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new AppError(
      "JWT_ACCESS_SECRET must be configured and at least 32 characters long",
      500
    );
  }

  return {
    secret,
    options: {
      algorithm: "HS256",
      expiresIn: JWT_ACCESS_EXPIRES_IN || JWT_EXPIRES_IN || "15m",
      issuer: JWT_ISSUER || "radiologist-platform",
      audience: JWT_AUDIENCE || "radiologist-platform-users",
    },
  };
};

const getRefreshJwtConfig = () => {
  const {
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN,
    JWT_ISSUER,
    JWT_AUDIENCE,
  } = process.env;

  if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
    throw new AppError(
      "JWT_REFRESH_SECRET must be configured and at least 32 characters long",
      500
    );
  }

  return {
    secret: JWT_REFRESH_SECRET,
    options: {
      algorithm: "HS256",
      expiresIn: JWT_REFRESH_EXPIRES_IN || "7d",
      issuer: JWT_ISSUER || "radiologist-platform",
      audience: JWT_AUDIENCE || "radiologist-platform-users",
    },
  };
};

const getJwtConfig = getAccessJwtConfig;

const serializeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

module.exports = {
  normalizeEmail,
  normalizeName,
  assertPayloadObject,
  assertValidEmail,
  assertValidName,
  assertStrongPassword,
  validateRegisterPayload,
  validateLoginPayload,
  getAccessJwtConfig,
  getRefreshJwtConfig,
  getJwtConfig,
  serializeUser,
};
