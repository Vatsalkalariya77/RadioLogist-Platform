import { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";

const initialFormData = {
  caseId: "",
  modality: "MRI",
  organ: "",
  code: "",
  difficulty: "Medium",
  description: "",
};

const AdminCreateCase = () => {
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.caseId || !formData.organ || !formData.code) {
      alert("Please fill in all required case fields.");
      return;
    }

    alert(`Case ${formData.caseId} is ready to publish.`);
    setFormData(initialFormData);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Case"
        description="Add a diagnostic case that can be published to students."
      />

      <form onSubmit={handleSubmit} className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Case ID *</label>
            <input
              type="text"
              placeholder="CASE-MR-902"
              value={formData.caseId}
              onChange={(event) => setFormData((prev) => ({ ...prev, caseId: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Modality *</label>
            <select
              value={formData.modality}
              onChange={(event) => setFormData((prev) => ({ ...prev, modality: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            >
              <option value="MRI">MRI</option>
              <option value="CT">CT</option>
              <option value="X-Ray">X-Ray</option>
              <option value="Ultrasound">Ultrasound</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Organ *</label>
            <input
              type="text"
              placeholder="Brain"
              value={formData.organ}
              onChange={(event) => setFormData((prev) => ({ ...prev, organ: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Scan Type *</label>
            <input
              type="text"
              placeholder="T2-FLAIR"
              value={formData.code}
              onChange={(event) => setFormData((prev) => ({ ...prev, code: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {["Easy", "Medium", "Hard"].map((difficulty) => (
                <button
                  type="button"
                  key={difficulty}
                  onClick={() => setFormData((prev) => ({ ...prev, difficulty }))}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                    formData.difficulty === difficulty
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              rows={4}
              placeholder="Brief clinical context for the case."
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => setFormData(initialFormData)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Publish Case
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateCase;
