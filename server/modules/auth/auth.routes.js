const express = require("express");
const router = express.Router();

const { register, login } = require("./auth.controller");
const createAuthRateLimit = require("../../middlewares/authRateLimit.middleware");

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

module.exports = router;
