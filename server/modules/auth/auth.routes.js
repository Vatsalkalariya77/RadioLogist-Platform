const express = require("express");
const router = express.Router();

const { register, login, refresh, logout } = require("./auth.controller");
const createAuthRateLimit = require("../../middlewares/authRateLimit.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { serializeUser } = require("../../utils/auth");

const registerRateLimit = createAuthRateLimit({
  action: "registration attempts",
  failOnStatusCodes: [400, 409],
});

const loginRateLimit = createAuthRateLimit({
  action: "login attempts",
  failOnStatusCodes: [401],
});

router.post("/register", registerRateLimit, register);
router.post("/login", loginRateLimit, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", protect, (req, res) => {
  res.json({
    status: "success",
    user: serializeUser(req.user),
  });
});

module.exports = router;
