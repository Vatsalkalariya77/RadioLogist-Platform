import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
  const token = localStorage.getItem("token");

  // ✅ Safe user parsing
  let user = null;

  try {
    const userString = localStorage.getItem("user");
    user = userString ? JSON.parse(userString) : null;
  } catch {
    user = null;
  }

  // ✅ Redirect if already logged in
  if (token && user) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === "student") {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user.role === "superadmin") {
      return <Navigate to="/superadmin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
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