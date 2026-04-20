const express = require("express");

const {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
} = require("./case.controller");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(restrictTo("admin", "superadmin"), createCase)
  .get(getCases);

router
  .route("/:id")
  .get(getCaseById)
  .patch(restrictTo("admin", "superadmin"), updateCase)
  .delete(restrictTo("superadmin"), deleteCase);

module.exports = router;
