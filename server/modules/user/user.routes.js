const express = require("express");

const { getAllUsers, updateUserRole } = require("./user.controller");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", restrictTo("admin", "superadmin"), getAllUsers);
router.patch("/:id", restrictTo("superadmin"), updateUserRole);

module.exports = router;
