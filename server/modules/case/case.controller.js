const asyncHandler = require("../../utils/asyncHandler");
const {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
  addDicomFiles,
} = require("./case.service");
const AppError = require("../../utils/appError");

exports.createCase = asyncHandler(async (req, res) => {
  const data = await createCase(req.body, req.user._id);

  res.status(201).json({
    status: "success",
    data,
  });
});

exports.getCases = asyncHandler(async (req, res) => {
 const data = await getCases(req.query);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getCaseById = asyncHandler(async (req, res) => {
  const data = await getCaseById(req.params.id);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.updateCase = asyncHandler(async (req, res) => {
  const data = await updateCase(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    message: "Case updated successfully",
    data,
  });
});

exports.deleteCase = asyncHandler(async (req, res) => {
  await deleteCase(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Case deleted successfully",
  });
});

exports.uploadDicomFiles = asyncHandler(async (req, res) => {
  const caseId = req.params.id;
  const files = req.files || [];

  if (files.length === 0) {
    throw new AppError("At least one DICOM file is required", 400);
  }

  const filePaths = files.map((file) => file.path.replace(/\\/g, "/"));
  const data = await addDicomFiles(caseId, filePaths);

  res.status(200).json({
    status: "success",
    message: "DICOM files uploaded successfully",
    data,
  });
});
