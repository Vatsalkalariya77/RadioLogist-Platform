import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";
import { useGetAllSubmissions } from "../hooks/useGetSubmissions";
import { useGetCases } from "../../case/hooks/useCreateCase";
import CustomSelect from "../../../components/common/CustomSelect";

interface CaseItem {
  id: string;
  title: string;
}

export default function AdminSubmissionsList() {
  const navigate = useNavigate();
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Fetch all cases for the filter dropdown
  const { data: casesResponse } = useGetCases({ limit: 100 });
  const casesList: CaseItem[] = (casesResponse?.data?.cases as CaseItem[]) || [];

  const caseOptions = [
    { value: "", label: "All Cases" },
    ...casesList.map((caseItem) => ({
      value: caseItem.id,
      label: caseItem.title,
    })),
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "submitted", label: "Submitted (Pending Review)" },
    { value: "reviewed", label: "Reviewed" },
  ];

  // Fetch submissions with current page and case filter
  const {
    data: submissionsResponse,
    isLoading,
    error,
  } = useGetAllSubmissions({
    page,
    limit,
    caseId: selectedCaseId || undefined,
  });

  const rawSubmissions = submissionsResponse?.data?.submissions || [];
  const pagination = submissionsResponse?.data?.pagination;

  // Filter submissions by status client-side
  const filteredSubmissions = rawSubmissions.filter((sub) => {
    if (statusFilter === "all") return true;
    return sub.status === statusFilter;
  });

  const handleCaseChange = (caseId: string) => {
    setSelectedCaseId(caseId);
    setPage(1); // Reset page to 1 on filter change
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    // Note: status filtering is client-side on the current page's results
  };

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold text-slate-400">Loading submissions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-800">
        Failed to load submissions: {error instanceof Error ? error.message : "Unexpected error"}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Student Submissions"
        description="Review diagnostic submissions from students and evaluate their findings."
      />

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
            />
          </svg>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Filter Submissions
          </span>
          {(selectedCaseId || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSelectedCaseId("");
                setStatusFilter("all");
                setPage(1);
              }}
              className="ml-auto text-[10px] font-bold text-teal-600 hover:text-teal-700 cursor-pointer transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Filter by Case
            </label>
            <CustomSelect
              value={selectedCaseId}
              onChange={handleCaseChange}
              options={caseOptions}
              placeholder="All Cases"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Filter by Status (Client-Side)
            </label>
            <CustomSelect
              value={statusFilter}
              onChange={handleStatusChange}
              options={statusOptions}
              placeholder="All Statuses"
            />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="table-header-standard">
              <tr>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Case Title</th>
                <th className="px-5 py-3 font-semibold">Submitted Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center font-medium text-slate-400">
                    No submissions match your filters.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => {
                  const student = submission.userId;
                  const caseObj = submission.caseId;
                  const submissionDate = new Date(submission.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr key={submission.id} className="table-row-standard">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{student?.name || "Unknown"}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{student?.email || "N/A"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-700">{caseObj?.title || "Unknown Case"}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {submissionDate}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge tone={submission.status === "reviewed" ? "success" : "warning"}>
                          {submission.status}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {submission.status === "reviewed" ? (
                          <span className="text-teal-600 font-bold">{submission.score}%</span>
                        ) : (
                          <span className="text-slate-350 italic text-xs">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => navigate(`/admin/submissions/${submission.id}`)}
                            className={
                              submission.status === "reviewed"
                                ? "btn-outline py-1.5 px-3.5 inline-flex"
                                : "btn-primary py-1.5 px-3.5 inline-flex bg-teal-500"
                            }
                          >
                            {submission.status === "reviewed" ? "View / Update" : "Evaluate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200/50 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-outline px-3.5 py-2 inline-flex"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-500">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
            disabled={page === pagination.totalPages}
            className="btn-outline px-3.5 py-2 inline-flex"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
