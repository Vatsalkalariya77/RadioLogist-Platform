import type { ReactNode } from "react";

interface StatusBadgeProps {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}

const toneClasses = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
};

const StatusBadge = ({ children, tone = "neutral" }: StatusBadgeProps) => {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
};

export default StatusBadge;
