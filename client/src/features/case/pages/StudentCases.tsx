import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";
import { useGetCases } from "../hooks/useCreateCase";
import { useGetMySubmissions } from "../../submission/hooks/useGetSubmissions";

const StudentCases = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const { data: casesResponse, isLoading: isLoadingCases, error: casesError } = useGetCases({ limit: 100 });
  const { data: submissionsResponse, isLoading: isLoadingSubmissions, error: submissionsError } = useGetMySubmissions();

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

  if (isLoadingCases || isLoadingSubmissions) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold text-slate-400">Loading cases...</span>
        </div>
      </div>
    );
  }

  if (casesError || submissionsError) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-800">
        Failed to load cases: {((casesError || submissionsError) as Error)?.message || "Unexpected error"}
      </div>
    );
  }

  const cases = casesResponse?.data?.cases || [];
  const submissions = submissionsResponse?.data || [];

  // Filter only published cases for students
  const publishedCases = cases.filter((caseItem: any) => caseItem.isPublished === true);

  // Map case completed status
  const isCaseCompleted = (caseId: string) => {
    return submissions.some((sub: any) => {
      const subCaseId = sub.caseId?.id || sub.caseId;
      return subCaseId === caseId;
    });
  };

  const filteredCases = publishedCases.filter((caseItem: any) => {
    const matchesFilter = filter === "All" || getModality(caseItem.modality) === filter;
    const searchValue = search.toLowerCase();
    
    // Match by ID, Title, or Tag
    const matchesSearch =
      caseItem.id.toLowerCase().includes(searchValue) ||
      caseItem.title.toLowerCase().includes(searchValue) ||
      (caseItem.tags && caseItem.tags.some((tag: string) => tag.toLowerCase().includes(searchValue)));

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
          placeholder="Search cases by title or tag..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input-standard sm:max-w-sm"
        />

        <div className="flex flex-wrap gap-2">
          {["All", "MRI", "CT", "X-ray", "Ultrasound"].map((modality) => (
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
                <th className="px-5 py-3 font-semibold">Case</th>
                <th className="px-5 py-3 font-semibold">Modality</th>
                <th className="px-5 py-3 font-semibold">Tags</th>
                <th className="px-5 py-3 font-semibold">Difficulty</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center font-medium text-slate-400">
                    No cases match the current filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((caseItem: any) => {
                  const completed = isCaseCompleted(caseItem.id);
                  return (
                    <tr key={caseItem.id} className="table-row-standard">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{caseItem.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{caseItem.id}</div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge tone="info">{getModality(caseItem.modality)}</StatusBadge>
                      </td>
                      <td className="px-5 py-4">
                        {caseItem.tags && caseItem.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {caseItem.tags.map((tag: string) => (
                              <span key={tag} className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic text-xs">No tags</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-700 capitalize">
                        <StatusBadge tone={caseItem.difficulty === "hard" ? "danger" : caseItem.difficulty === "medium" ? "warning" : "success"}>
                          {caseItem.difficulty || "medium"}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge tone={completed ? "success" : "warning"}>
                          {completed ? "Completed" : "Ready"}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`/student/cases/${caseItem.id}`)}
                          className="btn-primary py-1.5 px-3.5 inline-flex"
                        >
                          Diagnose
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentCases;
