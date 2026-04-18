const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/appError");
const { getUsers, updateUserRole } = require("./user.service");

exports.getAllUsers = asyncHandler(async (req, res) => {
  const data = await getUsers(req.query);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  //  Prevent self role change
  if (req.params.id === req.user.id) {
    throw new AppError("You cannot change your own role", 400);
  }

  const user = await updateUserRole(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data: user,
  });
});