const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AppError = require("../../utils/appError");
const { ensureRedisReady } = require("../../config/redis");
const {
  validateRegisterPayload,
  validateLoginPayload,
  getAccessJwtConfig,
  getRefreshJwtConfig,
  serializeUser,
} = require("../../utils/auth");

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

const getRefreshTokenKey = (userId) => `refresh:${userId}`;

const signAccessToken = (user) => {
  const { secret, options } = getAccessJwtConfig();

  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    secret,
    options,
  );
};

const signRefreshToken = (user) => {
  const { secret, options } = getRefreshJwtConfig();

  return jwt.sign(
    { sub: user._id.toString(), role: user.role, jti: crypto.randomUUID() },
    secret,
    options,
  );
};

const verifyRefreshToken = (refreshToken) => {
  try {
    const { secret, options } = getRefreshJwtConfig();

    return jwt.verify(refreshToken, secret, {
      issuer: options.issuer,
      audience: options.audience,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Refresh token expired", 401);
    }

    throw new AppError("Invalid refresh token", 401);
  }
};

const storeRefreshToken = async (userId, refreshToken) => {
  const redisClient = ensureRedisReady();

  await redisClient.setEx(
    getRefreshTokenKey(userId),
    REFRESH_TOKEN_TTL_SECONDS,
    refreshToken,
  );
};

const deleteRefreshToken = async (userId) => {
  const redisClient = ensureRedisReady();

  await redisClient.del(getRefreshTokenKey(userId));
};

const getBcryptSaltRounds = () => {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

  if (!Number.isInteger(saltRounds) || saltRounds < 10) {
    throw new AppError("BCRYPT_SALT_ROUNDS must be at least 10", 500);
  }

  return saltRounds;
};

const isDuplicateEmailError = (error) =>
  error?.code === 11000 &&
  Object.prototype.hasOwnProperty.call(error.keyPattern || {}, "email");

// REGISTER SERVICE
exports.registerUser = async (payload = {}) => {
  const { name, email, password } = validateRegisterPayload(payload);
  const existingUser = await User.exists({ email });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, getBcryptSaltRounds());

  let user;

  try {
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      throw new AppError("An account with this email already exists", 409);
    }

    throw error;
  }

  return {
    message: "User registered successfully",
    user: serializeUser(user),
  };
};

// LOGIN SERVICE
exports.loginUser = async (payload = {}) => {
  const { email, password } = validateLoginPayload(payload);
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await storeRefreshToken(user._id.toString(), refreshToken);

  return {
    accessToken,
    refreshToken,
    user: serializeUser(user),
  };
};

exports.refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const decoded = verifyRefreshToken(refreshToken);
  const userId = decoded.sub;
  const redisClient = ensureRedisReady();
  const storedRefreshToken = await redisClient.get(getRefreshTokenKey(userId));

  if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
    throw new AppError("Refresh token has been invalidated", 401);
  }

  const user = await User.findById(userId);

  if (!user) {
    await deleteRefreshToken(userId);
    throw new AppError("User not found", 404);
  }

  const accessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  await storeRefreshToken(userId, newRefreshToken);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

exports.logoutUser = async (refreshToken) => {
  if (refreshToken) {
    let decoded;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return {
        message: "Logged out successfully",
      };
    }

    const redisClient = ensureRedisReady();
    const storedRefreshToken = await redisClient.get(
      getRefreshTokenKey(decoded.sub),
    );

    if (storedRefreshToken === refreshToken) {
      await deleteRefreshToken(decoded.sub);
    }
  }

  return {
    message: "Logged out successfully",
  };
};

exports.REFRESH_TOKEN_COOKIE_NAME = REFRESH_TOKEN_COOKIE_NAME;
exports.REFRESH_TOKEN_TTL_SECONDS = REFRESH_TOKEN_TTL_SECONDS;
