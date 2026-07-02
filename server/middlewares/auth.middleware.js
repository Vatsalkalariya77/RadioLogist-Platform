const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../models/user.model");
const { getAccessJwtConfig } = require("../utils/auth");

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized", 401));
  }

  let decoded;

  try {
    const { secret, options } = getAccessJwtConfig();
    decoded = jwt.verify(token, secret, {
      issuer: options.issuer,
      audience: options.audience,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Access token expired", 401));
    }

    return next(new AppError("Invalid access token", 401));
  }

  const user = await User.findById(decoded.sub);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.status === "blocked" || user.status === "deleted") {
    return next(new AppError("Your account has been blocked. Please contact support.", 403));
  }

  req.user = user;
  next();
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission to perform this action", 403));
  }

  next();
};
