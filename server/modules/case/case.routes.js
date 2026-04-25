const express = require("express");

const {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
  uploadDicomFiles,
} = require("./case.controller");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");
const {
  uploadDicomFiles: uploadDicomMiddleware,
} = require("../../middlewares/upload.middleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(restrictTo("admin", "superadmin"), createCase)
  .get(getCases);

router.post(
  "/:id/upload-dicom",
  restrictTo("admin", "superadmin"),
  uploadDicomMiddleware,
  uploadDicomFiles,
);

router
  .route("/:id")
  .get(getCaseById)
  .patch(restrictTo("admin", "superadmin"), updateCase)
  .delete(restrictTo("superadmin"), deleteCase);

module.exports = router;
