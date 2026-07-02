const {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_TTL_SECONDS,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");

const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
});

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    getRefreshTokenCookieOptions(),
  );
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

// REGISTER
exports.register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
});

// LOGIN
exports.login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  setRefreshTokenCookie(res, result.refreshToken);
  console.log("TRACE 4: Login API JSON response user name:", result.user ? result.user.name : "null");

  res.json({
    status: "success",
    token: result.accessToken,
    accessToken: result.accessToken,
    user: result.user,
  });
});

exports.refresh = asyncHandler(async (req, res) => {
  const result = await refreshAccessToken(req.cookies?.[REFRESH_TOKEN_COOKIE_NAME]);
  setRefreshTokenCookie(res, result.refreshToken);

  res.json({
    accessToken: result.accessToken,
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await logoutUser(req.cookies?.[REFRESH_TOKEN_COOKIE_NAME]);
  clearRefreshTokenCookie(res);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

// FORGOT PASSWORD
exports.forgotPassword = asyncHandler(async (req, res) => {
  const result = await forgotPassword(req.body.email);
  res.json({
    status: "success",
    message: result.message,
  });
});

// RESET PASSWORD
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await resetPassword(token, password);
  clearRefreshTokenCookie(res);

  res.json({
    status: "success",
    message: result.message,
  });
});

// CHANGE PASSWORD
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await changePassword(req.user._id, currentPassword, newPassword);
  clearRefreshTokenCookie(res);

  res.json({
    status: "success",
    message: result.message,
  });
});
