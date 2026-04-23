const express = require("express");

const {
  createQuestion,
  getQuestionsByCase,
  updateQuestion,
  deleteQuestion,
} = require("./question.controller");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/", restrictTo("admin", "superadmin"), createQuestion);
router.get("/case/:caseId", getQuestionsByCase);
router
  .route("/:id")
  .patch(restrictTo("admin", "superadmin"), updateQuestion)
  .delete(restrictTo("superadmin"), deleteQuestion);

module.exports = router;
