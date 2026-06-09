import { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";

const cases = [
  { id: "CASE-MR-709", modality: "MRI", organ: "Brain", code: "T2-FLAIR", difficulty: "Hard", status: "Approved" },
  { id: "CASE-CT-104", modality: "CT", organ: "Chest", code: "High-Res-Chest", difficulty: "Medium", status: "Approved" },
  { id: "CASE-XR-422", modality: "X-Ray", organ: "Knee", code: "AP/Lateral", difficulty: "Easy", status: "Pending" },
  { id: "CASE-MR-112", modality: "MRI", organ: "Spine", code: "Lumbar-Sagittal", difficulty: "Hard", status: "Approved" },
  { id: "CASE-US-305", modality: "Ultrasound", organ: "Abdomen", code: "RUQ-Complete", difficulty: "Medium", status: "Pending" },
  { id: "CASE-CT-912", modality: "CT", organ: "Abdomen", code: "Contrast-Enhanced", difficulty: "Hard", status: "Approved" },
];

const StudentCases = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredCases = cases.filter((caseItem) => {
    const matchesFilter = filter === "All" || caseItem.modality === filter;
    const searchValue = search.toLowerCase();
    const matchesSearch =
      caseItem.id.toLowerCase().includes(searchValue) ||
      caseItem.organ.toLowerCase().includes(searchValue) ||
      caseItem.code.toLowerCase().includes(searchValue);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases"
        description="Search and open assigned diagnostic cases."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search cases"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input-standard sm:max-w-sm"
        />

        <div className="flex flex-wrap gap-2">
          {["All", "MRI", "CT", "X-Ray", "Ultrasound"].map((modality) => (
            <button
              key={modality}
              onClick={() => setFilter(modality)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                filter === modality
                  ? "border-teal-600 bg-teal-600 text-white shadow-sm shadow-teal-600/10"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {modality}
            </button>
          ))}
        </div>
      </div>

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
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center font-medium text-slate-400">
                    No cases match the current filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="table-row-standard">
                    <td className="px-5 py-4 font-semibold text-slate-900">{caseItem.id}</td>
                    <td className="px-5 py-4">
                      <StatusBadge tone="info">{caseItem.modality}</StatusBadge>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{caseItem.organ}</td>
                    <td className="px-5 py-4 text-slate-550">{caseItem.code}</td>
                    <td className="px-5 py-4">
                      <StatusBadge tone={caseItem.difficulty === "Hard" ? "danger" : caseItem.difficulty === "Medium" ? "warning" : "success"}>
                        {caseItem.difficulty}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge tone={caseItem.status === "Approved" ? "success" : "warning"}>
                        {caseItem.status}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => alert(`Launching case ${caseItem.id} in viewer...`)}
                        className="btn-primary py-1.5 px-3.5 inline-flex"
                      >
                        Diagnose
                      </button>
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

export default StudentCases;
