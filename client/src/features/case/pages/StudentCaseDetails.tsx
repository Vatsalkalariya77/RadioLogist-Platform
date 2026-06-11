import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import { useGetCase } from "../hooks/useCreateCase";
import { useGetQuestions } from "../hooks/useCreateQuestion";
import StatusBadge from "../../../components/common/StatusBadge";

export default function StudentCaseDetails() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const { data: caseResponse, isLoading: isLoadingCase, error: caseError } = useGetCase(caseId || "");
  const { data: questionsResponse, isLoading: isLoadingQuestions, error: questionsError } = useGetQuestions(caseId || "");

  const caseData = caseResponse?.data;
  const questions = questionsResponse?.data || [];

  const isLoading = isLoadingCase || isLoadingQuestions;
  const isError = caseError || questionsError;

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
    // Navigate back to the student cases list page
    navigate("/student/cases");
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
    const errorMsg = (caseError || questionsError) instanceof Error
      ? (caseError || questionsError)?.message
      : "Case data could not be retrieved.";

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
          description="Read-only learning case details and assessment questions."
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

        {/* Right Side: Questions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-bold text-slate-800">Assessment Questions</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Verify your diagnostic assessment findings by reviewing the case questions.
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
            <div className="space-y-4">
              {questions.map((question: any, idx: number) => (
                <div
                  key={question.id || question._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
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

                  {/* Render Options for MCQ */}
                  {question.type === "mcq" && question.options && (
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {question.options.map((opt: string, optIdx: number) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        return (
                          <div
                            key={optIdx}
                            className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-50"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-[9px] font-extrabold">
                              {letter}
                            </span>
                            <span className="break-all">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Render Textarea for Text Questions */}
                  {question.type === "text" && (
                    <div className="pt-1">
                      <textarea
                        rows={3}
                        disabled
                        placeholder="Clinical findings response field (Read-Only)..."
                        className="textarea-standard bg-slate-50/50 border-slate-100 text-slate-400 cursor-not-allowed text-xs resize-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
