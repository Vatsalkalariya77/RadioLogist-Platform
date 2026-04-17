const { registerUser, loginUser } = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");

// REGISTER
exports.register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
});

// LOGIN
exports.login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  res.json(result);
});
