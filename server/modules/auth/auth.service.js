const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../../utils/appError");
const {
  validateRegisterPayload,
  validateLoginPayload,
  getJwtConfig,
  serializeUser,
} = require("../../utils/auth");

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

  const { secret, options } = getJwtConfig();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    secret,
    {
      ...options,
      subject: user._id.toString(),
    }
  );

  return {
    token,
    user: serializeUser(user),
  };
};
