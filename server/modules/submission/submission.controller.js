const asyncHandler = require("../../utils/asyncHandler");
const {
  createSubmission,
  getAllSubmissions,
  getMySubmissions,
  getSubmissionById,
  reviewSubmission,
} = require("./submission.service");

exports.createSubmission = asyncHandler(async (req, res) => {
  const data = await createSubmission(req.body, req.user);

  res.status(201).json({
    status: "success",
    message: "Submission created successfully",
    data,
  });
});

exports.getAllSubmissions = asyncHandler(async (req, res) => {
  const data = await getAllSubmissions(req.query);

  res.status(200).json({
    status: "success",
    message: "Submissions fetched successfully",
    data,
  });
});

exports.getMySubmissions = asyncHandler(async (req, res) => {
  const data = await getMySubmissions(req.user);

  res.status(200).json({
    status: "success",
    message: "Your submissions fetched successfully",
    data,
  });
});

exports.getSubmissionById = asyncHandler(async (req, res) => {
  const data = await getSubmissionById(req.params.id, req.user);

  res.status(200).json({
    status: "success",
    message: "Submission fetched successfully",
    data,
  });
});
exports.reviewSubmission = asyncHandler(async (req, res) => {
  const data = await reviewSubmission(req.params.id, req.body, req.user);

  res.status(200).json({
    status: "success",
    message: "Submission reviewed successfully",
    data,
  });
});
