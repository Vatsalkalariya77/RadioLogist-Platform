import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  action?: ReactNode;
}

const MetricCard = ({ title, value, description, action }: MetricCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {description && (
            <p className="text-xs font-medium text-slate-400">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
};

export default MetricCard;
