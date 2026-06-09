import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import PageHeader from "../../../components/common/PageHeader";
import { createCaseSchema, type CreateCaseFormValues, type CreateCasePayload } from "../services/case.schema";
import { useCreateCase } from "../hooks/useCreateCase";
import QuestionBuilder from "../components/QuestionBuilder";
import CustomSelect from "../../../components/common/CustomSelect";

const AdminCreateCase = () => {
  const { createCase: submitCase, isPending } = useCreateCase();
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Track step navigation for questions builder
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [createdCaseTitle, setCreatedCaseTitle] = useState<string>("");

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateCaseFormValues>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      title: "",
      description: "",
      modality: "MRI",
      difficulty: "medium",
      tags: "",
    },
  });

  const onSubmit = async (data: CreateCaseFormValues) => {
    const tagsArray = data.tags
      ? data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    const payload: CreateCasePayload = {
      title: data.title,
      description: data.description,
      modality: data.modality,
      difficulty: data.difficulty,
      tags: tagsArray,
    };

    try {
      const res = await submitCase(payload);
      const caseId = res.data?.id || res.data?._id;
      
      if (caseId) {
        setCreatedCaseId(caseId);
        setCreatedCaseTitle(payload.title);
        triggerToast("success", "Case created successfully! Now add assessment questions.");
      } else {
        triggerToast("success", "Case created successfully!");
        reset();
      }
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : "An unexpected error occurred.";
      triggerToast("error", errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Case"
        description={
          createdCaseId
            ? `Adding questions for active case: ${createdCaseTitle}`
            : "Add a diagnostic case that can be published to students."
        }
      />

      {createdCaseId ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Active Case Banner */}
          <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Active Context
              </p>
              <h3 className="text-base font-bold text-slate-800 mt-1">{createdCaseTitle}</h3>
            </div>
            <button
              onClick={() => {
                setCreatedCaseId(null);
                setCreatedCaseTitle("");
                reset();
              }}
              className="btn-outline px-4 py-2 text-xs font-bold"
            >
              Create Another Case
            </button>
          </div>

          <QuestionBuilder caseId={createdCaseId} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form Container */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
            >
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>Title *</span>
                  {errors.title && (
                    <span className="text-xs font-medium text-rose-500">
                      {errors.title.message}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acute Subdural Hematoma"
                  {...register("title")}
                  disabled={isPending}
                  className={`input-standard ${
                    errors.title
                      ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/10"
                      : ""
                  }`}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>Clinical Description *</span>
                  {errors.description && (
                    <span className="text-xs font-medium text-rose-500">
                      {errors.description.message}
                    </span>
                  )}
                </label>
                <textarea
                  rows={6}
                  placeholder="Provide clinical history, physical exam findings, and other relevant case details..."
                  {...register("description")}
                  disabled={isPending}
                  className={`textarea-standard ${
                    errors.description
                      ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/10"
                      : ""
                  }`}
                />
              </div>

              {/* Modality & Difficulty Grid */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Modality */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                    <span>Modality *</span>
                    {errors.modality && (
                      <span className="text-xs font-medium text-rose-500">
                        {errors.modality.message}
                      </span>
                    )}
                  </label>
                  <CustomSelect
                    value={watch("modality")}
                    onChange={(val) => setValue("modality", val as "MRI" | "CT" | "X-Ray" | "Ultrasound", { shouldValidate: true })}
                    options={[
                      { value: "MRI", label: "MRI (Magnetic Resonance Imaging)" },
                      { value: "CT", label: "CT (Computed Tomography)" },
                      { value: "X-Ray", label: "X-Ray (Radiography)" },
                      { value: "Ultrasound", label: "Ultrasound (Ultrasonography)" },
                    ]}
                    disabled={isPending}
                    error={errors.modality?.message}
                  />
                </div>

                {/* Difficulty (Segmented Control) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                    <span>Difficulty Level *</span>
                    {errors.difficulty && (
                      <span className="text-xs font-medium text-rose-500">
                        {errors.difficulty.message}
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    {(["Easy", "Medium", "Hard"] as const).map((difficulty) => (
                      <button
                        type="button"
                        key={difficulty}
                        disabled={isPending}
                        onClick={() => setValue("difficulty", difficulty.toLowerCase() as "easy" | "medium" | "hard", { shouldValidate: true })}
                        className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          watch("difficulty") === difficulty.toLowerCase()
                            ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/10"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        } disabled:opacity-50 disabled:pointer-events-none`}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>Tags (comma-separated)</span>
                  {errors.tags && (
                    <span className="text-xs font-medium text-rose-500">
                      {errors.tags.message}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="e.g. brain, trauma, emergency"
                  {...register("tags")}
                  disabled={isPending}
                  className={`input-standard ${
                    errors.tags
                      ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/10"
                      : ""
                  }`}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => reset()}
                  disabled={isPending}
                  className="btn-outline px-5 py-2.5 text-xs"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary px-5 py-2.5 text-xs"
                >
                  {isPending && (
                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  <span>{isPending ? "Creating..." : "Publish Case"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="hidden space-y-6 lg:block">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                Creation Guidelines
              </h3>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-start gap-2.5">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-teal-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <strong>Title:</strong> Keep it concise and descriptive. Format like:{" "}
                    <code>Acute Subdural Hematoma</code>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-teal-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <strong>Clinical Description:</strong> Provide detailed patient history, presenting
                    symptoms, and relevant exam details in the description.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-teal-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <strong>Tags:</strong> Use comma-separated tags like <code>neurology, tumor, trauma</code>{" "}
                    for easier searchability and filtering.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default AdminCreateCase;
