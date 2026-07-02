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
  assertStrongPassword,
} = require("../../utils/auth");
const sendEmail = require("../../utils/email.service");

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

exports.forgotPassword = async (email) => {
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });

  // SECURITY: Under user requirement, do NOT return 404/reveal email existence.
  // We return a generic message: "If an account exists, password reset instructions have been sent."
  if (!user) {
    return {
      message: "If an account exists, password reset instructions have been sent.",
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

  const message = `Hello,\n\nWe received a request to reset your password for your RadioLogist account. You can reset your password by opening the following link in your browser:\n\n${resetUrl}\n\nThis link is valid for 15 minutes. If you did not request this reset, you can safely ignore this email.\n\nBest regards,\nRadioLogist Team`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.035); border: 1px solid #e2e8f0;" cellpadding="0" cellspacing="0" border="0">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 30px 40px; text-align: center;">
              <h1 style="color: #38bdf8; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: 0.05em; font-family: sans-serif;">RadioLogist</h1>
              <p style="color: #94a3b8; font-size: 10px; font-weight: 700; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.15em; font-family: sans-serif;">Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px; color: #334155; font-size: 15px; line-height: 1.6;">
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 20px; font-family: sans-serif;">Reset Your Password</h2>
              <p style="margin: 0 0 24px 0; font-family: sans-serif;">We received a request to reset your password.</p>
              
              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="background-color: #41b3b4; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 30px; border-radius: 12px; display: inline-block; font-family: sans-serif;">Reset Password</a>
                  </td>
                </tr>
              </table>

              <!-- Warning Expiry -->
              <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #78350f; font-weight: 600; font-family: sans-serif;">
                  Please note that this link is only valid for 15 minutes.
                </p>
              </div>

              <!-- Ignore Request Warning -->
              <p style="margin: 0; font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 20px; font-family: sans-serif;">
                If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; font-family: sans-serif;">
              &copy; 2026 RadioLogist Platform. HIPAA Compliant System.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request - RadioLogist",
      message,
      html,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    throw new AppError("There was an error sending the email. Try again later.", 500);
  }

  return {
    message: "If an account exists, password reset instructions have been sent.",
  };
};

exports.resetPassword = async (token, password) => {
  if (!token || !password) {
    throw new AppError("Token and password are required", 400);
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    throw new AppError("Token is invalid or has expired", 400);
  }

  assertStrongPassword(password);

  const hashedPassword = await bcrypt.hash(password, getBcryptSaltRounds());
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Invalidate refresh token for this user
  try {
    await deleteRefreshToken(user._id.toString());
  } catch (err) {
    // Suppress if redis is down/disabled to avoid failing the password reset itself
    console.error("Failed to delete refresh token on password reset:", err.message);
  }

  return {
    message: "Password reset successful",
  };
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new AppError("Current password and new password are required", 400);
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError("Incorrect current password", 401);
  }

  assertStrongPassword(newPassword);

  const hashedPassword = await bcrypt.hash(newPassword, getBcryptSaltRounds());
  user.password = hashedPassword;
  await user.save();

  // Revoke active sessions / refresh token in Redis
  try {
    await deleteRefreshToken(user._id.toString());
  } catch (err) {
    console.error("Failed to delete refresh token on change password:", err.message);
  }

  return {
    message: "Password changed successfully",
  };
};

exports.REFRESH_TOKEN_COOKIE_NAME = REFRESH_TOKEN_COOKIE_NAME;
exports.REFRESH_TOKEN_TTL_SECONDS = REFRESH_TOKEN_TTL_SECONDS;
