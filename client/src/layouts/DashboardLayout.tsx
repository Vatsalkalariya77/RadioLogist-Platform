import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import Sidebar from "../components/navigation/Sidebar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  let user = null;

  try {
    const userString = localStorage.getItem("user");
    user = userString ? JSON.parse(userString) : null;
  } catch {
    user = null;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-8 w-8 animate-spin text-teal-600"
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

          <span className="text-sm font-bold text-slate-500">
            Initializing session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-600 antialiased">
      <Sidebar
        userRole={user.role}
        userName={user.name}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex min-h-screen flex-col lg:pl-72">
        <Navbar
          userRole={user.role}
          userName={user.name}
          userEmail={user.email}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
