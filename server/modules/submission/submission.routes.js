const express = require("express");

const {
  createSubmission,
  getAllSubmissions,
  getMySubmissions,
  getSubmissionById,
  reviewSubmission,
} = require("./submission.controller");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/", restrictTo("student"), createSubmission);
router.get("/me", restrictTo("student"), getMySubmissions);
router.get("/", restrictTo("admin", "superadmin"), getAllSubmissions);
router.get("/:id", getSubmissionById);
router.patch("/:id", restrictTo("admin", "superadmin"), reviewSubmission);

module.exports = router;
