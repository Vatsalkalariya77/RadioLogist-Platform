import { Navigate, Outlet } from "react-router-dom";

const AuthLayout = () => {
  const token = localStorage.getItem("token");
  let user = null;

  try {
    const userString = localStorage.getItem("user");
    user = userString ? JSON.parse(userString) : null;
  } catch {
    user = null;
  }

  if (token && user) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }

    if (user.role === "superadmin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
