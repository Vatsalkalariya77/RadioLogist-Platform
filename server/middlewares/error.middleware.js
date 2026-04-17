const AppError = require("../utils/appError");

const handleCastError = (error) =>
  new AppError(`Invalid ${error.path}: ${error.value}`, 400);

const handleDuplicateFieldsError = () =>
  new AppError("A record with that value already exists", 409);

const handleValidationError = (error) => {
  const message = Object.values(error.errors)
    .map((item) => item.message)
    .join(", ");

  return new AppError(message || "Validation failed", 400);
};

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (error, req, res, next) => {
  let currentError = error;

  if (!(currentError instanceof AppError)) {
    if (currentError.name === "CastError") {
      currentError = handleCastError(currentError);
    } else if (currentError.type === "entity.parse.failed") {
      currentError = new AppError("Invalid JSON payload", 400);
    } else if (currentError.message === "CORS policy does not allow this origin") {
      currentError = new AppError(currentError.message, 403);
    } else if (currentError.code === 11000) {
      currentError = handleDuplicateFieldsError(currentError);
    } else if (currentError.name === "ValidationError") {
      currentError = handleValidationError(currentError);
    } else {
      currentError = new AppError(
        currentError.message || "Internal server error",
        500
      );
    }
  }

  const statusCode = currentError.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  const message =
    isProduction && statusCode >= 500
      ? "Internal server error"
      : currentError.message || "Internal server error";
  const response = {
    status: currentError.status || "error",
    message,
  };

  if (!isProduction) {
    response.stack = currentError.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler,
};
