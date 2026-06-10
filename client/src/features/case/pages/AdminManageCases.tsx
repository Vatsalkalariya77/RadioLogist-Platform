import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useGetCases, useDeleteCase, useUpdateCase } from "../hooks/useCreateCase";

const getModality = (caseItem: { modality?: string }): string => {
  if (caseItem.modality) {
    const norm = caseItem.modality.trim().toLowerCase();
    if (norm === "mri") return "MRI";
    if (norm === "ct") return "CT";
    if (norm === "x-ray" || norm === "xray") return "X-ray";
    if (norm === "ultrasound") return "Ultrasound";
    return caseItem.modality;
  }
  return "Not Specified";
};

const AdminManageCases = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const isSuperAdmin = user?.role === "superadmin";

  const { data: casesResponse, isLoading, error } = useGetCases();
  const { deleteCase: submitDeleteCase } = useDeleteCase();
  const { updateCase: submitUpdateCase } = useUpdateCase();

  const cases = casesResponse?.data?.cases || [];

  const [caseToDelete, setCaseToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (id: string, title: string) => {
    if (!isSuperAdmin) {
      alert("Unauthorized: Only superadmins can delete cases.");
      return;
    }
    setCaseToDelete({ id, title });
  };

  const confirmDelete = async () => {
    if (!caseToDelete) return;
    setIsDeleting(true);
    try {
      await submitDeleteCase(caseToDelete.id);
      setCaseToDelete(null);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to delete case.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await submitUpdateCase({ id, payload: { isPublished: !currentStatus } });
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to update case status.");
    }
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-800">
        Failed to load cases: {error instanceof Error ? error.message : "Unexpected error"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Manage Cases"
          description="Review published learning cases and update availability."
        />
        <button
          onClick={() => navigate("/admin/create-case")}
          className="btn-primary py-2 px-4 text-xs font-bold inline-flex"
        >
          Create New Case
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="table-header-standard">
              <tr>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Modality</th>
                <th className="px-5 py-3 font-semibold">Tags</th>
                <th className="px-5 py-3 font-semibold">Difficulty</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created Date</th>
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
                cases.map((caseItem: any) => (
                  <tr key={caseItem.id} className="table-row-standard">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{caseItem.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{caseItem.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge tone="info">{getModality(caseItem)}</StatusBadge>
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
                        {caseItem.difficulty}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleTogglePublish(caseItem.id, caseItem.isPublished)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                          caseItem.isPublished
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${caseItem.isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {caseItem.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(caseItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/cases/${caseItem.id}/edit`)}
                          className="btn-outline py-1.5 px-3 inline-flex"
                        >
                          Edit
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(caseItem.id, caseItem.title)}
                            className="btn-destructive py-1.5 px-3 inline-flex"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!caseToDelete}
        title="Delete Diagnostic Case"
        description={`Are you sure you want to permanently delete case "${caseToDelete?.title || ""}"? This action cannot be undone.`}
        confirmText="Delete Case"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setCaseToDelete(null)}
      />
    </div>
  );
};

export default AdminManageCases;
