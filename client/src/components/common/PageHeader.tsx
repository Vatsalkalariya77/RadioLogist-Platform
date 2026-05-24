import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

const PageHeader = ({ title, description, children }: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

export default PageHeader;
