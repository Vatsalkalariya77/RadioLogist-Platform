const asyncHandler = require("../../utils/asyncHandler");
const {
  createQuestion,
  getQuestionsByCase,
  updateQuestion,
  deleteQuestion,
} = require("./question.service");

exports.createQuestion = asyncHandler(async (req, res) => {
  const data = await createQuestion(req.body);

  res.status(201).json({
    status: "success",
    data,
  });
});

exports.getQuestionsByCase = asyncHandler(async (req, res) => {
  const data = await getQuestionsByCase(req.params.caseId, req.user);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.updateQuestion = asyncHandler(async (req, res) => {
  const data = await updateQuestion(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.deleteQuestion = asyncHandler(async (req, res) => {
  await deleteQuestion(req.params.id);

res.status(200).json({
  status: "success",
  message: "Question deleted successfully",
});
});
