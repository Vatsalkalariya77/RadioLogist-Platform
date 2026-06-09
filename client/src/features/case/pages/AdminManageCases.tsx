import { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";

const initialCases = [
  { id: "CASE-MR-709", modality: "MRI", organ: "Brain", code: "T2-FLAIR", difficulty: "Hard", date: "2026-05-20" },
  { id: "CASE-CT-104", modality: "CT", organ: "Chest", code: "High-Res-Chest", difficulty: "Medium", date: "2026-05-18" },
  { id: "CASE-XR-422", modality: "X-Ray", organ: "Knee", code: "AP/Lateral", difficulty: "Easy", date: "2026-05-15" },
  { id: "CASE-MR-112", modality: "MRI", organ: "Spine", code: "Lumbar-Sagittal", difficulty: "Hard", date: "2026-05-12" },
  { id: "CASE-US-305", modality: "Ultrasound", organ: "Abdomen", code: "RUQ-Complete", difficulty: "Medium", date: "2026-05-10" },
];

const AdminManageCases = () => {
  const [cases, setCases] = useState(initialCases);

  const handleDelete = (id: string) => {
    if (confirm(`Delete case ${id}?`)) {
      setCases((prev) => prev.filter((caseItem) => caseItem.id !== id));
      alert(`Case ${id} removed.`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Cases"
        description="Review published learning cases and update availability."
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="table-header-standard">
              <tr>
                <th className="px-5 py-3 font-semibold">Case ID</th>
                <th className="px-5 py-3 font-semibold">Modality</th>
                <th className="px-5 py-3 font-semibold">Organ</th>
                <th className="px-5 py-3 font-semibold">Scan Type</th>
                <th className="px-5 py-3 font-semibold">Difficulty</th>
                <th className="px-5 py-3 font-semibold">Published</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center font-medium text-slate-400">
                    No cases are currently published.
                  </td>
                </tr>
              ) : (
                cases.map((caseItem) => (
                  <tr key={caseItem.id} className="table-row-standard">
                    <td className="px-5 py-4 font-semibold text-slate-900">{caseItem.id}</td>
                    <td className="px-5 py-4">
                      <StatusBadge tone="info">{caseItem.modality}</StatusBadge>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{caseItem.organ}</td>
                    <td className="px-5 py-4 text-slate-400">{caseItem.code}</td>
                    <td className="px-5 py-4">
                      <StatusBadge tone={caseItem.difficulty === "Hard" ? "danger" : caseItem.difficulty === "Medium" ? "warning" : "success"}>
                        {caseItem.difficulty}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{caseItem.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => alert(`Opening editor for ${caseItem.id}...`)}
                          className="btn-outline py-1.5 px-3 inline-flex"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(caseItem.id)}
                          className="btn-destructive py-1.5 px-3 inline-flex"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManageCases;
