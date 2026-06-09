import MetricCard from "../../../components/common/MetricCard";
import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";

const recentSubmissions = [
  { id: "SUB-1042", caseId: "CASE-MR-709", modality: "MRI", score: "92%", status: "Reviewed", date: "2026-05-22" },
  { id: "SUB-1041", caseId: "CASE-CT-104", modality: "CT", score: "88%", status: "Reviewed", date: "2026-05-21" },
  { id: "SUB-1038", caseId: "CASE-XR-422", modality: "X-Ray", score: "-", status: "Pending", date: "2026-05-20" },
];

const StudentProgress = () => {
  const reviewedCount = recentSubmissions.filter((submission) => submission.status === "Reviewed").length;
  const pendingCount = recentSubmissions.filter((submission) => submission.status === "Pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress"
        description="Review your recent submissions and completion status."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard title="Submissions" value={String(recentSubmissions.length)} description="Recent records" />
        <MetricCard title="Reviewed" value={String(reviewedCount)} description="Feedback available" />
        <MetricCard title="Pending" value={String(pendingCount)} description="Awaiting review" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent Submissions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="table-header-standard">
              <tr>
                <th className="px-5 py-3 font-semibold">Submission</th>
                <th className="px-5 py-3 font-semibold">Case</th>
                <th className="px-5 py-3 font-semibold">Modality</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentSubmissions.map((submission) => (
                <tr key={submission.id} className="table-row-standard">
                  <td className="px-5 py-4 font-semibold text-slate-900">{submission.id}</td>
                  <td className="px-5 py-4 text-slate-700">{submission.caseId}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone="info">{submission.modality}</StatusBadge>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-700">{submission.score}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={submission.status === "Reviewed" ? "success" : "warning"}>
                      {submission.status}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-4 text-slate-400">{submission.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
