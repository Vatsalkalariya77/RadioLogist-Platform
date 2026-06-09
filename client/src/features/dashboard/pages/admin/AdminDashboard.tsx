import { useState } from "react";
import MetricCard from "../../../../components/common/MetricCard";
import PageHeader from "../../../../components/common/PageHeader";
import StatusBadge from "../../../../components/common/StatusBadge";

const AdminDashboard = () => {
  const [approvals, setApprovals] = useState([
    { id: "APP-024", name: "Dr. Andrew Miller", email: "andrew.miller@hospital.org", role: "Student", license: "MD-90802", date: "2026-05-22", status: "Pending" },
    { id: "APP-025", name: "Dr. Sarah Jenkins", email: "jenkins@radiologymc.org", role: "Student", license: "DO-45129", date: "2026-05-21", status: "Pending" },
    { id: "APP-026", name: "Dr. Rajesh Koothrapali", email: "raj@caltech.edu", role: "Student", license: "PHD-88219", date: "2026-05-20", status: "Pending" },
  ]);

  const pendingApprovals = approvals.filter((approval) => approval.status === "Pending").length;
  const approvedApprovals = approvals.filter((approval) => approval.status === "Approved").length;

  const handleApprove = (id: string, name: string) => {
    setApprovals((prev) =>
      prev.map((approval) => approval.id === id ? { ...approval, status: "Approved" } : approval)
    );
    alert(`Account approved for ${name}.`);
  };

  const handleReject = (id: string, name: string) => {
    setApprovals((prev) => prev.filter((approval) => approval.id !== id));
    alert(`Registration for ${name} rejected.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Review platform health and approve clinician access."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard title="Requests" value={String(approvals.length)} description="Credential submissions" />
        <MetricCard title="Pending Reviews" value={String(pendingApprovals)} description="Credential requests" />
        <MetricCard title="Approved" value={String(approvedApprovals)} description="Completed reviews" />
      </div>

      <section className="space-y-4">
        <PageHeader
          title="Credential Reviews"
          description="Verify submitted license information before enabling access."
        />

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="table-header-standard">
                <tr>
                  <th className="px-5 py-3 font-semibold">Clinician</th>
                  <th className="px-5 py-3 font-semibold">License</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {approvals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center font-medium text-slate-400">
                      No credential reviews are pending.
                    </td>
                  </tr>
                ) : (
                  approvals.map((approval) => (
                    <tr key={approval.id} className="table-row-standard">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{approval.name}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{approval.email}</p>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">{approval.license}</td>
                      <td className="px-5 py-4 text-slate-600">{approval.role}</td>
                      <td className="px-5 py-4 text-slate-400">{approval.date}</td>
                      <td className="px-5 py-4">
                        <StatusBadge tone={approval.status === "Approved" ? "success" : "warning"}>
                          {approval.status}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-4">
                        {approval.status === "Pending" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleApprove(approval.id, approval.name)}
                              className="btn-primary py-1.5 px-3.5 inline-flex"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(approval.id, approval.name)}
                              className="btn-outline py-1.5 px-3.5 inline-flex"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <p className="text-right text-xs font-semibold text-slate-400">Completed</p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
