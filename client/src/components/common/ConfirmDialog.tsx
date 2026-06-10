import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Focus management: default focus to Cancel button on open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Keyboard accessibility: ESC to close, Enter to confirm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || loading) return;
      
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Enter") {
        // If Enter is pressed, check if the cancel button has focus.
        // If the cancel button is active, let the browser handle standard click behavior.
        if (document.activeElement === cancelBtnRef.current) {
          return;
        }
        e.preventDefault();
        onConfirm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onConfirm, onCancel]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !loading) {
      onCancel();
    }
  };

  const variantIcons = {
    danger: (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    ),
    warning: (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    ),
    info: (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 border border-sky-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    success: (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
  };

  const confirmBtnClasses = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10 focus:ring-rose-500/20",
    warning: "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/10 focus:ring-amber-500/20",
    info: "bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/10 focus:ring-sky-500/20",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 focus:ring-emerald-500/20",
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in scale-in duration-200 p-6 space-y-6">
        <div className="flex items-start gap-4">
          {variantIcons[variant]}
          <div className="space-y-1.5 min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-800 truncate">{title}</h3>
            <p className="text-sm text-slate-500 leading-normal break-words">{description}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            disabled={loading}
            className="btn-outline px-5 py-2.5 text-xs font-bold disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`${confirmBtnClasses[variant]} px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2`}
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <span>{loading ? `${confirmText}...` : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
