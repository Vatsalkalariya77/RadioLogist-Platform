import { useState, useEffect } from "react";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import PageHeader from "../../../components/common/PageHeader";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import StatusBadge from "../../../components/common/StatusBadge";
import { useGetCase } from "../hooks/useCreateCase";
import { useGetQuestions } from "../hooks/useCreateQuestion";
import { useGetMySubmissions, useCreateSubmission } from "../../submission/hooks/useGetSubmissions";

export default function StudentCaseDetails() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const { data: caseResponse, isLoading: isLoadingCase, error: caseError } = useGetCase(caseId || "");
  const { data: questionsResponse, isLoading: isLoadingQuestions, error: questionsError } = useGetQuestions(caseId || "");
  const { data: submissionsResponse, isLoading: isLoadingSubmissions, error: submissionsError } = useGetMySubmissions();
  const { submitDiagnosis, isPending: isSubmitting } = useCreateSubmission();

  const caseData = caseResponse?.data;
  const questions = questionsResponse?.data || [];
  const submissions = submissionsResponse?.data || [];

  // Match existing student submission for this case
  const studentSubmission = submissions.find((sub: any) => {
    const subCaseId = sub.caseId?.id || sub.caseId;
    return subCaseId === caseId;
  });
  const isSubmitted = !!studentSubmission;

  const isLoading = isLoadingCase || isLoadingQuestions || isLoadingSubmissions;
  const isError = caseError || questionsError || submissionsError;

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    reset: resetForm,
  } = useForm<Record<string, string>>({
    defaultValues: {},
  });

  const watchAnswers = watch();

  // Reset form values when questions change or when submission completes
  useEffect(() => {
    if (questions.length > 0 && !isSubmitted) {
      const defaultVals: Record<string, string> = {};
      questions.forEach((q: any) => {
        defaultVals[q.id || q._id] = "";
      });
      resetForm(defaultVals);
    }
  }, [questions, isSubmitted, resetForm]);

  // Determine if the student has started filling out answers
  const isFormDirty = Object.values(watchAnswers).some(
    (val) => typeof val === "string" && val.trim().length > 0
  );

  // Warning when leaving or reloading the tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty && !isSubmitted) {
        e.preventDefault();
        e.returnValue = "You have unsaved diagnostic answers. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFormDirty, isSubmitted]);

  // Block route changes in single page application navigation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isFormDirty && !isSubmitted && currentLocation.pathname !== nextLocation.pathname
  );

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

  const handleGoBack = () => {
    navigate("/student/cases");
  };

  const onSubmit = async () => {
    const isValid = await trigger();
    if (isValid) {
      setShowConfirmSubmit(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmSubmit(false);
    if (!caseId) return;

    // Map form records into required backend format
    const answers = Object.entries(watchAnswers).map(([questionId, answer]) => ({
      questionId,
      answer: answer || "",
    }));

    try {
      await submitDiagnosis({ caseId, answers });
      triggerToast("success", "Diagnosis submitted successfully!");
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : "Failed to submit diagnosis.";
      triggerToast("error", errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold text-slate-400">Loading case details...</span>
        </div>
      </div>
    );
  }

  if (isError || !caseData) {
    const errorMsg = (caseError || questionsError || submissionsError) instanceof Error
      ? (caseError || questionsError || submissionsError)?.message
      : "Case details could not be retrieved.";

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <PageHeader title="Case Details Error" description="An error occurred while loading this case." />
          <button onClick={handleGoBack} className="btn-outline px-4 py-2 text-xs font-bold">
            Back to Cases List
          </button>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-800">
          Failed to load case: {errorMsg}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <PageHeader
          title={caseData.title}
          description={isSubmitted ? "Reviewing submitted diagnostic evaluation." : "Diagnose learning case and answer questions."}
        />
        <button
          onClick={handleGoBack}
          className="btn-outline px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 self-start md:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Cases List
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Side: Case Description and Metadata */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metadata Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">
              Case Profile
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 sm:grid-cols-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Modality</span>
                <div className="mt-1">
                  <StatusBadge tone="info">{getModality(caseData.modality)}</StatusBadge>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Difficulty</span>
                <div className="mt-1">
                  <StatusBadge
                    tone={
                      caseData.difficulty === "hard"
                        ? "danger"
                        : caseData.difficulty === "medium"
                        ? "warning"
                        : "success"
                    }
                  >
                    {caseData.difficulty || "medium"}
                  </StatusBadge>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Published On</span>
                <span className="mt-1.5 block text-xs font-bold text-slate-700">
                  {caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>

            {caseData.tags && caseData.tags.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-2">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {caseData.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-block bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg border border-slate-200/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">
              Clinical History & Description
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {caseData.description}
            </p>
          </div>
        </div>

        {/* Right Side: Questions Form or Read-Only Submitted Status */}
        <div className="lg:col-span-5 space-y-6">
          {isSubmitted ? (
            /* Condition B: Case has been diagnosed and submitted */
            <div className="space-y-6">
              {/* Submission Evaluation Banners */}
              {studentSubmission.status === "reviewed" ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-emerald-100/50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-955 uppercase tracking-wider">Evaluation Reviewed</h4>
                        <p className="text-[11px] text-emerald-600 mt-0.5">Your evaluation has been evaluated by an instructor.</p>
                      </div>
                    </div>
                    <StatusBadge tone="success">Reviewed</StatusBadge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-sm col-span-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Score Received</span>
                      <div className="mt-1 flex items-baseline gap-0.5">
                        <span className="text-2xl font-black text-emerald-600">{studentSubmission.score}</span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <div className="bg-white border border-emerald-100 rounded-xl p-3.5 shadow-sm col-span-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Instructor Feedback</span>
                      <p className="mt-2 text-xs text-slate-700 italic leading-relaxed whitespace-pre-wrap">
                        {studentSubmission.feedback || "No feedback comments left."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 flex items-center justify-between shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Evaluation Pending</h4>
                      <p className="text-[11px] text-amber-600 mt-0.5">Diagnoses submitted. Awaiting instructor review.</p>
                    </div>
                  </div>
                  <StatusBadge tone="warning">Submitted</StatusBadge>
                </div>
              )}

              {/* Read-Only Questions List with Submitted Answers */}
              <div className="space-y-4">
                {questions.map((question: any, idx: number) => {
                  const qId = question.id || question._id;
                  const answerObj = studentSubmission.answers?.find(
                    (ans: any) => (ans.questionId?.id || ans.questionId) === qId
                  );
                  const studentAnswer = answerObj?.answer;

                  return (
                    <div
                      key={qId}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                    >
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-slate-400 text-xs font-bold">Q{idx + 1}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${
                            question.type === "mcq"
                              ? "bg-teal-50 text-teal-700 border border-teal-100"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          }`}
                        >
                          {question.type === "mcq" ? "MCQ" : "Text"}
                        </span>
                        <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                          {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-800">{question.questionText}</p>

                      {/* Submitted MCQ Answers */}
                      {question.type === "mcq" && question.options && (
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {question.options.map((opt: string, optIdx: number) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const isSelected = opt === studentAnswer;
                            return (
                              <div
                                key={optIdx}
                                className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
                                  isSelected
                                    ? "border-teal-500 bg-teal-50/20 text-teal-900 font-semibold shadow-sm"
                                    : "border-slate-100 bg-slate-50/30 text-slate-400"
                                }`}
                              >
                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold ${
                                    isSelected ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-400"
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span className="break-all">{opt}</span>
                                {isSelected && (
                                  <span className="ml-auto text-[9px] font-extrabold bg-teal-100/60 border border-teal-200 text-teal-850 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    Your Diagnosis
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Submitted Open Text Answer */}
                      {question.type === "text" && (
                        <div className="pt-1">
                          <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5">Submitted Diagnosis</span>
                          <div className="pt-3 px-3.5 pb-3 bg-slate-50/80 border border-slate-100 rounded-xl text-xs text-slate-700 italic whitespace-pre-wrap leading-relaxed">
                            {studentAnswer || <span className="text-slate-350 italic">No answer submitted.</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Condition A: Case has NOT been submitted yet (Interactive Form Mode) */
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-sm font-bold text-slate-800">Submit Assessment Diagnosis</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Fill out the following questions based on your clinical scanner evaluation.
                </p>
              </div>

              {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                  <div className="rounded-full bg-slate-50 p-3 mb-3 text-slate-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-slate-700">No Assessment Questions</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    No questions have been attached to this learning case.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    {questions.map((question: any, idx: number) => {
                      const qId = question.id || question._id;
                      const selectedValue = watchAnswers[qId];

                      return (
                        <div
                          key={qId}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                        >
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-slate-400 text-xs font-bold">Q{idx + 1}</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${
                                question.type === "mcq"
                                  ? "bg-teal-50 text-teal-700 border border-teal-100"
                                  : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              }`}
                            >
                              {question.type === "mcq" ? "MCQ" : "Text"}
                            </span>
                            <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                              {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
                            </span>
                            {errors[qId] && (
                              <span className="text-[10px] font-bold text-rose-500 ml-auto animate-pulse">
                                Required
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-semibold text-slate-800">{question.questionText}</p>

                          {/* Interactive MCQ Radios */}
                          {question.type === "mcq" && question.options && (
                            <div className="grid grid-cols-1 gap-2 pt-1">
                              {question.options.map((opt: string, optIdx: number) => {
                                const letter = String.fromCharCode(65 + optIdx);
                                const isSelected = opt === selectedValue;
                                return (
                                  <label
                                    key={optIdx}
                                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs transition-all duration-150 cursor-pointer active:scale-[0.99] ${
                                      isSelected
                                        ? "border-teal-500 bg-teal-50/20 text-teal-900 font-semibold shadow-sm"
                                        : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      value={opt}
                                      {...register(qId, { required: "Answer required" })}
                                      className="sr-only"
                                    />
                                    <span
                                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold transition-all ${
                                        isSelected
                                          ? "bg-teal-600 text-white"
                                          : "bg-slate-200 text-slate-500"
                                      }`}
                                    >
                                      {letter}
                                    </span>
                                    <span className="break-all">{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {/* Interactive text response textarea */}
                          {question.type === "text" && (
                            <div className="pt-1">
                              <textarea
                                rows={4}
                                maxLength={5000}
                                placeholder="Type your clinical findings and evaluation..."
                                {...register(qId, {
                                  required: "Response required",
                                  maxLength: { value: 5000, message: "Maximum 5000 characters allowed" }
                                })}
                                className={`textarea-standard text-xs w-full ${
                                  errors[qId]
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                                    : ""
                                }`}
                              />
                              {errors[qId] && (
                                <span className="text-[10px] font-semibold text-rose-500 mt-1 block">
                                  {errors[qId]?.message as string}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-3 px-4 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    {isSubmitting && (
                      <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    <span>{isSubmitting ? "Submitting diagnosis..." : "Submit Diagnosis"}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog before submitting */}
      <ConfirmDialog
        open={showConfirmSubmit}
        title="Submit Diagnostic Evaluation"
        description="After submission you will not be able to modify your answers. Do you want to submit your diagnosis now?"
        confirmText="Yes, Submit"
        cancelText="Cancel"
        variant="success"
        loading={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
      />

      {/* Warning Dialog when navigation route change blocker fires */}
      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="Discard Unsaved Changes?"
        description="You have started answering the questions. If you navigate away now, your answers will be lost permanently."
        confirmText="Leave Page"
        cancelText="Stay"
        variant="warning"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
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
