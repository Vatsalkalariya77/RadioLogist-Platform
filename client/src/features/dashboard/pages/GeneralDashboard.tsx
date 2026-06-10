import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GeneralDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      if (user) {
        if (user.role === "admin" || user.role === "superadmin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (user.role === "student") {
          navigate("/student/dashboard", { replace: true });
        } else {
          navigate("/student/dashboard", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs font-semibold text-slate-400">Directing to workspace...</span>
      </div>
    </div>
  );
};

export default GeneralDashboard;
