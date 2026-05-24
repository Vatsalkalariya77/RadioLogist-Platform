import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  action?: ReactNode;
}

const MetricCard = ({ title, value, description, action }: MetricCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {description && (
            <p className="mt-1 text-xs font-medium text-slate-500">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
};

export default MetricCard;
