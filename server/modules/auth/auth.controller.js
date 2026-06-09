const {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_TTL_SECONDS,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
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
