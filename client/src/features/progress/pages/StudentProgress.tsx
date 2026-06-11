import { useNavigate } from "react-router-dom";
import MetricCard from "../../../components/common/MetricCard";
import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";
import { useGetMySubmissions } from "../../submission/hooks/useGetSubmissions";

const StudentProgress = () => {
  const navigate = useNavigate();
  const { data: submissionsResponse, isLoading, error } = useGetMySubmissions();

  const submissions = submissionsResponse?.data || [];
  const reviewedCount = submissions.filter((sub: any) => sub.status === "reviewed").length;
  const pendingCount = submissions.filter((sub: any) => sub.status === "submitted").length;

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold text-slate-400">Loading progress data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-800">
        Failed to load progress data: {error instanceof Error ? error.message : "Unexpected error"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress"
        description="Review your recent submissions and completion status."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard title="Total Submissions" value={String(submissions.length)} description="Submitted diagnostic cases" />
        <MetricCard title="Reviewed" value={String(reviewedCount)} description="Evaluated by instructor" />
        <MetricCard title="Awaiting Review" value={String(pendingCount)} description="Pending review feedback" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Submissions History</h2>
        </div>

        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="rounded-full bg-slate-50 p-3 mb-3 text-slate-400 border border-slate-100 shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-700">No Submissions Yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
              You have not submitted any case diagnostics yet. Open a learning case to begin your evaluation!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="table-header-standard">
                <tr>
                  <th className="px-5 py-3 font-semibold">Submission ID</th>
                  <th className="px-5 py-3 font-semibold">Case</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {submissions.map((submission: any) => {
                  const caseId = submission.caseId?.id || submission.caseId;
                  const caseTitle = submission.caseId?.title || "Unknown Case";
                  return (
                    <tr key={submission.id} className="table-row-standard">
                      <td className="px-5 py-4 font-mono text-xs text-slate-500 font-semibold">{submission.id}</td>
                      <td className="px-5 py-4 text-slate-900 font-semibold">{caseTitle}</td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {submission.status === "reviewed" && submission.score !== undefined ? `${submission.score}%` : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge tone={submission.status === "reviewed" ? "success" : "warning"}>
                          {submission.status === "reviewed" ? "Reviewed" : "Awaiting Review"}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`/student/cases/${caseId}`)}
                          className="btn-outline py-1.5 px-3.5 inline-flex text-xs font-semibold"
                        >
                          View Submission
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;
