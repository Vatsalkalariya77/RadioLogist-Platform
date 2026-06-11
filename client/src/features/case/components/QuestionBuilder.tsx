import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { questionSchema, type QuestionFormValues, type CreateQuestionPayload } from "../services/question.schema";
import { useCreateQuestion, useGetQuestions, useDeleteQuestion, useUpdateQuestion } from "../hooks/useCreateQuestion";
import CustomSelect from "../../../components/common/CustomSelect";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

interface QuestionBuilderProps {
  caseId: string;
}

export default function QuestionBuilder({ caseId }: QuestionBuilderProps) {
  const { data: questionsResponse, isLoading: isLoadingQuestions } = useGetQuestions(caseId);
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion(caseId);
  const deleteQuestionMutation = useDeleteQuestion(caseId);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin" || isSuperAdmin;

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      type: "mcq",
      questionText: "",
      options: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
      correctAnswer: "",
      expectedAnswer: "",
      marks: 5,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "options",
  });

  const questionType = watch("type");
  const optionsValues = watch("options") || [];

  const handleStartEdit = (question: any) => {
    try {
      const qId = question.id || question._id;
      setEditingQuestionId(qId);
      reset({
        type: question.type,
        questionText: question.questionText || "",
        options: question.type === "mcq" && question.options
          ? question.options.map((opt: string) => ({ value: opt }))
          : [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
        correctAnswer: (question.type === "mcq" ? question.correctAnswer : "") || "",
        expectedAnswer: (question.type === "text" ? question.expectedAnswer : "") || "",
        marks: question.marks || 5,
      });
      clearErrors();
    } catch (err) {
      triggerToast("error", "Failed to load question details into form.");
      console.error("Error loading question details:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    reset({
      type: "mcq",
      questionText: "",
      options: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
      correctAnswer: "",
      expectedAnswer: "",
      marks: 5,
    });
    clearErrors();
  };

  const onSubmit = async (data: QuestionFormValues) => {
    const payload: CreateQuestionPayload = {
      caseId,
      questionText: data.questionText,
      type: data.type,
      marks: data.marks,
    };

    if (data.type === "mcq" && data.options) {
      payload.options = data.options.map((opt) => opt.value);
      payload.correctAnswer = data.correctAnswer;
    } else {
      payload.expectedAnswer = data.expectedAnswer;
    }

    try {
      if (editingQuestionId) {
        await updateQuestionMutation.mutateAsync({ id: editingQuestionId, payload });
        triggerToast("success", "Question updated successfully!");
        setEditingQuestionId(null);
      } else {
        await createQuestionMutation.mutateAsync(payload);
        triggerToast("success", "Question added successfully!");
      }
      
      // Reset form preserving type
      reset({
        type: data.type,
        questionText: "",
        options: data.type === "mcq" ? [{ value: "" }, { value: "" }, { value: "" }, { value: "" }] : undefined,
        correctAnswer: "",
        expectedAnswer: "",
        marks: 5,
      });
      clearErrors();
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : editingQuestionId ? "Failed to update question" : "Failed to create question";
      triggerToast("error", errorMessage);
    }
  };

  const [questionToDelete, setQuestionToDelete] = useState<{ id: string; text: string } | null>(null);

  const handleDelete = (questionId: string, questionText: string) => {
    if (!isSuperAdmin) {
      triggerToast("error", "Unauthorized: Only superadmins can delete questions.");
      return;
    }
    setQuestionToDelete({ id: questionId, text: questionText });
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    try {
      await deleteQuestionMutation.mutateAsync(questionToDelete.id);
      triggerToast("success", "Question deleted successfully!");
      setQuestionToDelete(null);
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : "Failed to delete question";
      triggerToast("error", errorMessage);
    }
  };

   const questions = questionsResponse?.data || [];
  const isPending =
    createQuestionMutation.isPending ||
    updateQuestionMutation.isPending ||
    deleteQuestionMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-base font-bold text-slate-800">
          {editingQuestionId ? "Edit Assessment Question" : "Step 2: Case Question Builder"}
        </h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          {editingQuestionId
            ? "Update the details of the selected assessment question."
            : "Add diagnostics assessment questions to verify students' findings."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Creator Form */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          >
            {/* Question Type Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Question Type</label>
              <div className="flex gap-2">
                {(["mcq", "text"] as const).map((type) => (
                  <button
                    type="button"
                    key={type}
                    disabled={isPending}
                    onClick={() => {
                      setValue("type", type);
                      if (type === "text") {
                        setValue("options", undefined);
                        setValue("correctAnswer", undefined);
                      } else if (type === "mcq") {
                        setValue("options", [{ value: "" }, { value: "" }, { value: "" }, { value: "" }]);
                        setValue("expectedAnswer", undefined);
                      }
                    }}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      questionType === type
                        ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/10"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-355"
                    }`}
                  >
                    {type === "mcq" ? "Multiple Choice" : "Open Text"}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                <span>Question Text *</span>
                {errors.questionText && (
                  <span className="text-xs font-medium text-rose-500">
                    {errors.questionText.message}
                  </span>
                )}
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Which anatomical structure shows high signal intensity?"
                {...register("questionText")}
                disabled={isPending}
                className={`textarea-standard ${
                  errors.questionText
                    ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/10"
                    : ""
                }`}
              />
            </div>

            {/* Marks */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                <span>Marks (1 - 20) *</span>
                {errors.marks && (
                  <span className="text-xs font-medium text-rose-500">
                    {errors.marks.message}
                  </span>
                )}
              </label>
              <input
                type="number"
                placeholder="5"
                {...register("marks", { valueAsNumber: true })}
                disabled={isPending}
                className={`input-standard ${
                  errors.marks
                    ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/10"
                    : ""
                }`}
              />
            </div>

            {/* MCQ Fields */}
            <div className={questionType === "mcq" ? "space-y-4 pt-2 border-t border-slate-100" : "hidden"}>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                MCQ Options & Solution
              </h4>
              
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const letter = String.fromCharCode(65 + index);
                  return (
                    <div key={field.id} className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                        <span>Option {letter} *</span>
                        {errors.options?.[index]?.value && (
                          <span className="text-rose-500 font-normal text-[10px]">
                            {errors.options[index]?.value?.message}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter option ${letter}`}
                        {...register(`options.${index}.value`)}
                        disabled={isPending}
                        className="input-standard py-2"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Correct Answer Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>Correct Answer *</span>
                  {errors.correctAnswer && (
                    <span className="text-xs font-medium text-rose-500">
                      {errors.correctAnswer.message}
                    </span>
                  )}
                </label>
                <CustomSelect
                  value={watch("correctAnswer")}
                  onChange={(val) => setValue("correctAnswer", val, { shouldValidate: true })}
                  options={optionsValues.map((opt, idx) => {
                    const val = opt?.value || "";
                    const letter = String.fromCharCode(65 + idx);
                    return {
                      value: val,
                      label: val ? `${letter}: ${val}` : `Option ${letter} (Empty)`,
                      disabled: !val,
                    };
                  })}
                  placeholder="Select correct option"
                  disabled={isPending}
                  error={errors.correctAnswer?.message}
                />
              </div>
            </div>

            {/* Text Fields */}
            <div className={questionType === "text" ? "space-y-4 pt-2 border-t border-slate-100" : "hidden"}>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Assessment Solution
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>Expected Answer *</span>
                  {errors.expectedAnswer && (
                    <span className="text-xs font-medium text-rose-500">
                      {errors.expectedAnswer.message}
                    </span>
                  )}
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the expected criteria or diagnostic answer..."
                  {...register("expectedAnswer")}
                  disabled={isPending}
                  className={`textarea-standard ${
                    errors.expectedAnswer
                      ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/10"
                      : ""
                  }`}
                />
              </div>
            </div>

            {/* Action */}
            <div className="pt-2 flex gap-3">
              {editingQuestionId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isPending}
                  className="btn-outline flex-1 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary flex-1 py-2.5 text-xs font-semibold cursor-pointer"
              >
                {isPending && (
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <span>{editingQuestionId ? "Save Changes" : "Add Question"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">
              Questions Added ({questions.length})
            </h3>
            {isLoadingQuestions && (
              <span className="text-xs text-slate-400 flex items-center gap-1.5 animate-pulse">
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing list...
              </span>
            )}
          </div>

          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
              <div className="rounded-full bg-slate-50 p-3 mb-3 text-slate-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">No Questions Yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Assessment questions help evaluate medical students. Create MCQ or open-ended questions using the form on the left.
              </p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
              {questions.map((question: any, idx: number) => (
                <div
                  key={question.id || question._id}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  {/* Delete Button */}
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(question.id || question._id, question.questionText)}
                      disabled={isPending}
                      className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      title="Delete Question"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}

                  {/* Edit Button */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(question)}
                      disabled={isPending}
                      className={`absolute top-4 ${isSuperAdmin ? "right-12" : "right-4"} rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer`}
                      title="Edit Question"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}

                  <div className="flex flex-wrap gap-2 items-center mb-3">
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

                  <p className="text-sm font-semibold text-slate-800 pr-8">{question.questionText}</p>

                  {/* MCQ Answers Preview */}
                  {question.type === "mcq" && question.options && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {question.options.map((opt: string, optIdx: number) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isCorrect = opt === question.correctAnswer;
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-xs transition-colors ${
                              isCorrect
                                ? "border-emerald-250 bg-emerald-50/50 text-emerald-800 font-semibold shadow-sm"
                                : "border-slate-100 bg-slate-50/50 text-slate-600"
                            }`}
                          >
                            <span
                              className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                                isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="break-all">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Answers Preview */}
                  {question.type === "text" && question.expectedAnswer && (
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs">
                      <span className="font-bold text-slate-400 block mb-1">Expected Answer:</span>
                      <p className="text-slate-700 italic leading-relaxed break-words">{question.expectedAnswer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-800"
              : "border-rose-100 bg-rose-50 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <svg
              className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 shrink-0 text-rose-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <div>
            <p className="text-sm font-semibold">{toast.type === "success" ? "Success" : "Error"}</p>
            <p className="mt-0.5 text-xs font-medium opacity-90">{toast.message}</p>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!questionToDelete}
        title="Delete Assessment Question"
        description={`Are you sure you want to permanently delete this question: "${questionToDelete?.text || ""}"? This action cannot be undone.`}
        confirmText="Delete Question"
        cancelText="Cancel"
        variant="danger"
        loading={deleteQuestionMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setQuestionToDelete(null)}
      />
    </div>
  );
}
