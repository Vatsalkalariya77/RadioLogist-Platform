import type { ReactNode } from "react";

interface StatusBadgeProps {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}

const toneClasses = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  success: "border-emerald-200/80 bg-emerald-50/60 text-emerald-700",
  warning: "border-amber-200/80 bg-amber-50/60 text-amber-700",
  danger: "border-rose-200/80 bg-rose-50/60 text-rose-700",
  info: "border-sky-200/80 bg-sky-50/60 text-sky-700",
};

const StatusBadge = ({ children, tone = "neutral" }: StatusBadgeProps) => {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${toneClasses[tone]}`}>
      {children}
    </span>
  );
};

export default StatusBadge;
