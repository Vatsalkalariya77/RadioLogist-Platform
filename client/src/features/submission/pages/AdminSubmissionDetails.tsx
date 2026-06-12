import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useGetSubmissionById, useReviewSubmission } from "../hooks/useGetSubmissions";
import { useGetQuestions } from "../../case/hooks/useCreateQuestion";
import { useGetCase } from "../../case/hooks/useCreateCase";

interface QuestionDetail {
  id: string;
  questionText: string;
  type: "mcq" | "text";
  options?: string[];
  correctAnswer?: string;
  expectedAnswer?: string;
  marks: number;
}

interface ReviewFormValues {
  score: number;
  feedback: string;
}

export default function AdminSubmissionDetails() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    data: submissionResponse,
    isLoading: isLoadingSub,
    error: subError,
  } = useGetSubmissionById(submissionId || "");
  const submission = submissionResponse?.data;

  const caseId = submission?.caseId?.id || submission?.caseId;
  const { data: caseResponse } = useGetCase(typeof caseId === "string" ? caseId : "");
  const caseData = caseResponse?.data;

  const { data: questionsResponse, isLoading: isLoadingQuestions } = useGetQuestions(
    typeof caseId === "string" ? caseId : ""
  );
  const questions = (questionsResponse?.data as QuestionDetail[]) || [];

  const { submitReview, isPending: isSubmitting } = useReviewSubmission();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    defaultValues: {
      score: 0,
      feedback: "",
    },
  });

  const watchValues = watch();

  // Pre-fill score and feedback when submission details are loaded
  useEffect(() => {
    if (submission) {
      setValue("score", submission.score !== undefined && submission.score !== null ? submission.score : 0);
      setValue("feedback", submission.feedback || "");
    }
  }, [submission, setValue]);

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleGoBack = () => {
    navigate("/admin/submissions");
  };

  const onSubmitForm = () => {
    setShowConfirm(true);
  };

  const handleConfirmReview = async () => {
    setShowConfirm(false);
    if (!submissionId) return;

    try {
      await submitReview({
        id: submissionId,
        payload: {
          score: Number(watchValues.score),
          feedback: watchValues.feedback || "",
        },
      });
      triggerToast("success", "Evaluation submitted successfully!");
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : "Failed to submit review.";
      triggerToast("error", errorMessage);
    }
  };

  const getModality = (modality?: string): string => {
    if (modality) {
      const norm = modality.trim().toLowerCase();
      if (norm === "mri") return "MRI";
      if (norm === "ct") return "CT";
      if (norm === "x-ray" || norm === "xray") return "X-ray";
      if (norm === "ultrasound") return "Ultrasound";
      return modality;
    }
    return "Not Specified";
  };

  if (isLoadingSub || isLoadingQuestions) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold text-slate-400">Loading submission details...</span>
        </div>
      </div>
    );
  }

  if (subError || !submission) {
    const errorMsg = subError instanceof Error ? subError.message : "Submission could not be retrieved.";
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <PageHeader title="Error Loading Submission" description="Check the details below." />
          <button onClick={handleGoBack} className="btn-outline px-4 py-2 text-xs font-bold">
            Back to Submissions List
          </button>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-800">
          Failed to load submission: {errorMsg}
        </div>
      </div>
    );
  }

  // Calculate review metrics
  const totalQuestions = submission.answers?.length || 0;
  const totalPossibleMarks =
    questions.length > 0
      ? questions.reduce((sum, q) => sum + (q.marks || 0), 0)
      : submission.answers?.reduce((sum, ans) => {
          const marks = typeof ans.questionId === "string" ? 0 : ans.questionId?.marks || 0;
          return sum + (marks || 0);
        }, 0) || 0;

  const currentReviewScore =
    submission.score !== undefined && submission.score !== null ? `${submission.score}%` : "Pending Evaluation";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <PageHeader
          title={`Evaluate: ${submission.userId?.name || "Student"}`}
          description={`Review answers and assign diagnostic score for Case: ${
            submission.caseId?.title || "Unknown"
          }`}
        />
        <button
          onClick={handleGoBack}
          className="btn-outline px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 self-start md:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Submissions
        </button>
      </div>

      {/* Metrics Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Questions</span>
          <span className="text-xl font-extrabold text-slate-800 block mt-1">{totalQuestions}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Possible Marks</span>
          <span className="text-xl font-extrabold text-slate-800 block mt-1">{totalPossibleMarks} Marks</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Current Review Score</span>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`text-xl font-extrabold ${
                submission.status === "reviewed" ? "text-teal-600" : "text-amber-600"
              }`}
            >
              {currentReviewScore}
            </span>
            <StatusBadge tone={submission.status === "reviewed" ? "success" : "warning"}>
              {submission.status}
            </StatusBadge>
          </div>
        </div>
      </div>

      {/* Detail Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Student answers */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">
              Student Information & Submission Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Student Name</span>
                <span>{submission.userId?.name}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Email Address</span>
                <span>{submission.userId?.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Case Modality</span>
                <div className="mt-0.5">
                  {caseData?.modality ? (
                    <StatusBadge tone="info">{getModality(caseData.modality)}</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">N/A</StatusBadge>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Submitted On</span>
                <span>{new Date(submission.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Student Responses Comparison
            </h3>

            {submission.answers?.map((ans, idx) => {
              const qId = typeof ans.questionId === "string" ? ans.questionId : ans.questionId?.id || "";
              const qText = typeof ans.questionId === "string" ? "Question" : ans.questionId?.questionText || "Deleted Question";
              const qType = typeof ans.questionId === "string" ? "text" : ans.questionId?.type || "text";
              const qMarks = typeof ans.questionId === "string" ? 5 : ans.questionId?.marks || 0;

              // Find detailed question from server list to fetch correct / expected answers
              const detailedQ = questions.find((q) => q.id === qId);
              const correctAnswer = detailedQ?.correctAnswer;
              const expectedAnswer = detailedQ?.expectedAnswer;
              const options = detailedQ?.options || [];

              return (
                <div key={qId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-slate-400 text-xs font-bold">Q{idx + 1}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${
                        qType === "mcq"
                          ? "bg-teal-50 text-teal-700 border border-teal-100"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      }`}
                    >
                      {qType === "mcq" ? "MCQ" : "Open Text"}
                    </span>
                    <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                      {qMarks} {qMarks === 1 ? "Mark" : "Marks"}
                    </span>
                    {qType === "mcq" && correctAnswer && (
                      <span
                        className={`text-[10px] font-bold ml-auto uppercase tracking-wide px-2 py-0.5 rounded ${
                          ans.answer === correctAnswer
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        {ans.answer === correctAnswer ? "Correct Answer Matches" : "Answer Mismatch"}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-800">{qText}</p>

                  {/* MCQ Answers Display */}
                  {qType === "mcq" && options.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {options.map((opt: string, optIdx: number) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isStudentSel = opt === ans.answer;
                        const isCorrect = opt === correctAnswer;

                        let cardStyle = "border-slate-100 bg-slate-50/30 text-slate-400";
                        let circleStyle = "bg-slate-200 text-slate-400";

                        if (isStudentSel && isCorrect) {
                          cardStyle = "border-emerald-500 bg-emerald-50/20 text-emerald-900 font-semibold shadow-sm";
                          circleStyle = "bg-emerald-600 text-white";
                        } else if (isStudentSel && !isCorrect) {
                          cardStyle = "border-rose-450 bg-rose-50/20 text-rose-900 font-semibold shadow-sm";
                          circleStyle = "bg-rose-600 text-white";
                        } else if (isCorrect) {
                          cardStyle = "border-emerald-300 bg-emerald-50/10 text-emerald-800 font-medium";
                          circleStyle = "bg-emerald-500 text-white";
                        }

                        return (
                          <div key={optIdx} className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${cardStyle}`}>
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold ${circleStyle}`}
                            >
                              {letter}
                            </span>
                            <span className="break-all">{opt}</span>

                            <div className="ml-auto flex gap-1">
                              {isStudentSel && (
                                <span className="text-[9px] font-extrabold bg-slate-200/80 border border-slate-300 text-slate-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  Student Choice
                                </span>
                              )}
                              {isCorrect && (
                                <span className="text-[9px] font-extrabold bg-emerald-100 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Answer Display */}
                  {qType === "text" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5">
                          Student Diagnosis
                        </span>
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 italic leading-relaxed whitespace-pre-wrap">
                          {ans.answer || <span className="text-slate-350 italic">No answer submitted.</span>}
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] font-extrabold text-teal-600 block uppercase mb-1.5">
                          Expected Diagnostic Answer
                        </span>
                        <div className="p-3.5 bg-teal-55/20 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed whitespace-pre-wrap font-medium">
                          {expectedAnswer || <span className="text-teal-400 italic">No expected answer defined.</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Score Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 sticky top-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Assign Score & Feedback</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Assign a percentage grade (0-100) and provide clinical feedback to guide the student.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 pt-1">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  Evaluation Score (0 - 100)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 85"
                  {...register("score", {
                    required: "Score is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Minimum score is 0" },
                    max: { value: 100, message: "Maximum score is 100" },
                  })}
                  className={`input-standard text-sm font-semibold text-slate-700 ${
                    errors.score ? "border-rose-350 focus:border-rose-500 focus:ring-rose-500/10" : ""
                  }`}
                />
                {errors.score && (
                  <span className="text-[10px] font-semibold text-rose-500 mt-1 block">
                    {errors.score.message}
                  </span>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  Clinical Evaluation Comments / Feedback
                </label>
                <textarea
                  rows={8}
                  placeholder="Provide recommendations, correct observations, or highlight missing elements..."
                  {...register("feedback", {
                    maxLength: { value: 5000, message: "Feedback cannot exceed 5000 characters" },
                  })}
                  className={`textarea-standard text-xs font-medium text-slate-700 leading-relaxed ${
                    errors.feedback ? "border-rose-350 focus:border-rose-500 focus:ring-rose-500/10" : ""
                  }`}
                />
                {errors.feedback && (
                  <span className="text-[10px] font-semibold text-rose-500 mt-1 block">
                    {errors.feedback.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting && (
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                <span>{submission.status === "reviewed" ? "Update Evaluation Review" : "Submit Evaluation Review"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirm}
        title="Submit Submission Review"
        description="Are you sure you want to save this diagnostic review? This will immediately notify the student and update their dashboard."
        confirmText="Confirm Review"
        cancelText="Cancel"
        variant="success"
        loading={isSubmitting}
        onConfirm={handleConfirmReview}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Local Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-800"
              : "border-rose-100 bg-rose-50 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <svg className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <div>
            <p className="text-sm font-semibold">{toast.type === "success" ? "Success" : "Error"}</p>
            <p className="mt-0.5 text-xs font-medium opacity-90">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
