const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../models/user.model");
const { getJwtConfig } = require("../utils/auth");

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized", 401));
  }

  const { secret } = getJwtConfig();
  const decoded = jwt.verify(token, secret);

  const user = await User.findById(decoded.sub);

  if (!user) {
    return next(new AppError("User not found", 404));
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
