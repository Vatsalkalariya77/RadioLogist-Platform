import { useEffect, useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";
import CustomSelect from "../../../components/common/CustomSelect";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useGetUsers, useUpdateUserRole } from "../hooks/useGetUsers";
import { getInitials } from "../../../utils/name";
import type { User } from "../services/user.service";

export default function AdminManageAdmins() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Retrieve current logged in user details to prevent self-role edits
  const currentUserString = localStorage.getItem("user");
  const currentUser = currentUserString ? JSON.parse(currentUserString) : null;

  // Debounce search string changes to avoid hammering the database
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch users with current query configuration
  const {
    data: usersResponse,
    isLoading,
    error,
  } = useGetUsers({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
  });

  const { updateUserRole, isPending: isUpdating } = useUpdateUserRole();

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    user: User | null;
    targetRole: "student" | "admin" | "";
    title: string;
    description: string;
  }>({
    open: false,
    user: null,
    targetRole: "",
    title: "",
    description: "",
  });

  const handlePromoteClick = (user: User) => {
    setDialogState({
      open: true,
      user,
      targetRole: "admin",
      title: "Promote to Admin",
      description: `Are you sure you want to promote ${user.name} (${user.email}) to an Administrator? They will gain full access to creating cases and evaluating student submissions.`,
    });
  };

  const handleDemoteClick = (user: User) => {
    setDialogState({
      open: true,
      user,
      targetRole: "student",
      title: "Demote to Student",
      description: `Are you sure you want to demote ${user.name} (${user.email}) to a Student? They will lose access to the admin dashboard panels.`,
    });
  };

  const handleConfirmRoleChange = async () => {
    if (!dialogState.user || !dialogState.targetRole) return;
    try {
      await updateUserRole({
        id: dialogState.user.id,
        role: dialogState.targetRole,
      });
    } catch (err) {
      console.error("Failed to update user role:", err);
    } finally {
      setDialogState((prev) => ({
        ...prev,
        open: false,
        user: null,
        targetRole: "",
      }));
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setPage(1);
  };

  const usersList = usersResponse?.data?.users || [];
  const pagination = usersResponse?.data?.pagination;

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "student", label: "Students" },
    { value: "admin", label: "Admins" },
    { value: "superadmin", label: "Super Admins" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Manage Admins"
        description="Search for accounts, view registration dates, and manage system permissions."
      />

      {/* Filter and Search Bar Card */}
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
            Filter Accounts
          </span>
          {(search || roleFilter !== "all") && (
            <button
              onClick={handleClearFilters}
              className="ml-auto text-[10px] font-bold text-teal-600 hover:text-teal-700 cursor-pointer transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Search Accounts
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-standard"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Role Filter
            </label>
            <CustomSelect
              value={roleFilter}
              onChange={(value) => {
                setRoleFilter(value);
                setPage(1);
              }}
              options={roleOptions}
              placeholder="All Roles"
            />
          </div>
        </div>
      </div>

      {/* Users Data List Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-64 w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-6 w-6 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-xs font-semibold text-slate-400">
                Loading accounts...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm font-semibold text-rose-800 bg-rose-50 border-t border-rose-100">
            Failed to load users: {error instanceof Error ? error.message : "Unexpected error"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="table-header-standard">
                <tr>
                  <th className="px-5 py-3 font-semibold">User Details</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role Badges</th>
                  <th className="px-5 py-3 font-semibold">Created Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {usersList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center font-medium text-slate-400"
                    >
                      No user accounts found.
                    </td>
                  </tr>
                ) : (
                  usersList.map((user) => {
                    const isSelf = user.id === currentUser?.id;
                    const isSuperAdmin = user.role === "superadmin";
                    const formattedDate = user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—";

                    // Determine Role Badge tone
                    let badgeTone: "neutral" | "success" | "warning" | "danger" | "info" = "neutral";
                    if (user.role === "superadmin") badgeTone = "danger";
                    else if (user.role === "admin") badgeTone = "success";
                    else if (user.role === "student") badgeTone = "info";

                    return (
                      <tr key={user.id} className="table-row-standard">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 font-extrabold text-xs border border-teal-500/20 shadow-sm">
                              {getInitials(user.name)}
                            </div>
                            <div className="font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-xs">
                              {user.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-500 font-medium">
                          {user.email}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge tone={badgeTone}>{user.role}</StatusBadge>
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {formattedDate}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end items-center">
                            {isSelf ? (
                              <span className="text-xs font-semibold text-slate-400 italic bg-slate-100 px-2.5 py-1 rounded-lg">
                                Self (Active)
                              </span>
                            ) : isSuperAdmin ? (
                              <span className="text-xs font-semibold text-slate-400 italic">
                                System Protected
                              </span>
                            ) : user.role === "student" ? (
                              <button
                                onClick={() => handlePromoteClick(user)}
                                className="btn-primary py-1.5 px-3.5 inline-flex"
                              >
                                Promote to Admin
                              </button>
                            ) : user.role === "admin" ? (
                              <button
                                onClick={() => handleDemoteClick(user)}
                                className="btn-outline py-1.5 px-3.5 inline-flex"
                              >
                                Demote to Student
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
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

      {/* Role Change Confirmation Dialog */}
      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        description={dialogState.description}
        confirmText="Confirm"
        cancelText="Cancel"
        variant={dialogState.targetRole === "admin" ? "success" : "warning"}
        loading={isUpdating}
        onConfirm={handleConfirmRoleChange}
        onCancel={() =>
          setDialogState({
            open: false,
            user: null,
            targetRole: "",
            title: "",
            description: "",
          })
        }
      />
    </div>
  );
}
