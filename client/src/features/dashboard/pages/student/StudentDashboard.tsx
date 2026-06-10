import { useState } from "react";
import MetricCard from "../../../../components/common/MetricCard";
import PageHeader from "../../../../components/common/PageHeader";
import StatusBadge from "../../../../components/common/StatusBadge";

const assignedCases = [
  { id: "CASE-MR-709", modality: "MRI", organ: "Brain", code: "T2-FLAIR", difficulty: "Hard", status: "Approved", date: "2026-05-20" },
  { id: "CASE-CT-104", modality: "CT", organ: "Chest", code: "High-Res-Chest", difficulty: "Medium", status: "Approved", date: "2026-05-18" },
  { id: "CASE-XR-422", modality: "X-ray", organ: "Knee", code: "AP/Lateral", difficulty: "Easy", status: "Pending", date: "2026-05-15" },
  { id: "CASE-MR-112", modality: "MRI", organ: "Spine", code: "Lumbar-Sagittal", difficulty: "Hard", status: "Approved", date: "2026-05-12" },
  { id: "CASE-US-305", modality: "Ultrasound", organ: "Abdomen", code: "RUQ-Complete", difficulty: "Medium", status: "Pending", date: "2026-05-10" },
];

const StudentDashboard = () => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userName = user ? user.name : "Clinician";
  const [selectedModality, setSelectedModality] = useState("All");

  const filteredCases = selectedModality === "All"
    ? assignedCases
    : assignedCases.filter((caseItem) => caseItem.modality === selectedModality);
  const readyCases = assignedCases.filter((caseItem) => caseItem.status === "Approved").length;
  const pendingCases = assignedCases.filter((caseItem) => caseItem.status === "Pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, Dr. ${userName}`}
        description="Continue with your assigned diagnostic cases."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard title="Assigned Cases" value={String(assignedCases.length)} description="Available for review" />
        <MetricCard title="Ready" value={String(readyCases)} description="Open for diagnosis" />
        <MetricCard title="Pending" value={String(pendingCases)} description="Awaiting access" />
      </div>

      <section className="space-y-4">
        <PageHeader title="Assigned Cases">
          <div className="flex flex-wrap gap-2">
            {["All", "MRI", "CT", "X-ray", "Ultrasound"].map((modality) => (
              <button
                key={modality}
                onClick={() => setSelectedModality(modality)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  selectedModality === modality
                    ? "border-teal-600 bg-teal-600 text-white shadow-sm shadow-teal-600/10"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {modality}
              </button>
            ))}
          </div>
        </PageHeader>

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
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="table-row-standard">
                    <td className="px-5 py-4 font-semibold text-slate-900">{caseItem.id}</td>
                    <td className="px-5 py-4">
                      <StatusBadge tone="info">{caseItem.modality}</StatusBadge>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{caseItem.organ}</td>
                    <td className="px-5 py-4 text-slate-500">{caseItem.code}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
