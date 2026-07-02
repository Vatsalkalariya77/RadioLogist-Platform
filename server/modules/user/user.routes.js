const express = require("express");
const {
  getAllUsers,
  updateUserRole,
  createUser,
  updateUserStatus,
  deleteUser,
} = require("./user.controller");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", restrictTo("admin", "superadmin"), getAllUsers);
router.post("/", restrictTo("superadmin"), createUser);
router.patch("/:id", restrictTo("superadmin"), updateUserRole);
router.patch("/:id/status", restrictTo("superadmin"), updateUserStatus);
router.delete("/:id", restrictTo("superadmin"), deleteUser);

module.exports = router;
