const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/appError");
const userService = require("./user.service");

exports.getAllUsers = asyncHandler(async (req, res) => {
  const data = await userService.getUsers(req.query);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  // Prevent self role change
  if (req.params.id === req.user.id) {
    throw new AppError("You cannot change your own role", 400);
  }

  const user = await userService.updateUserRole(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);

  res.status(201).json({
    status: "success",
    data: user,
  });
});

exports.updateUserStatus = asyncHandler(async (req, res) => {
  // Prevent self status change
  if (req.params.id === req.user.id) {
    throw new AppError("You cannot change your own status", 400);
  }

  const user = await userService.updateUserStatus(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  // Prevent self deletion
  if (req.params.id === req.user.id) {
    throw new AppError("You cannot delete your own account", 400);
  }

  const result = await userService.deleteUser(req.params.id);

  res.status(200).json({
    status: "success",
    data: result,
  });
});