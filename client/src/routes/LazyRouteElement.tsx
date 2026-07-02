import { lazy, Suspense } from "react";

const pages = {
  login: lazy(() => import("../features/auth/pages/LoginPage")),
  register: lazy(() => import("../features/auth/pages/RegisterPage")),
  studentDashboard: lazy(
    () => import("../features/dashboard/pages/student/StudentDashboard")
  ),
  studentCases: lazy(() => import("../features/case/pages/StudentCases")),
  studentCaseDetails: lazy(() => import("../features/case/pages/StudentCaseDetails")),
  studentProgress: lazy(() => import("../features/progress/pages/StudentProgress")),
  adminDashboard: lazy(
    () => import("../features/dashboard/pages/admin/AdminDashboard")
  ),
  adminCreateCase: lazy(() => import("../features/case/pages/AdminCreateCase")),
  adminManageCases: lazy(() => import("../features/case/pages/AdminManageCases")),
  adminSubmissionsList: lazy(() => import("../features/submission/pages/AdminSubmissionsList")),
  adminSubmissionDetails: lazy(() => import("../features/submission/pages/AdminSubmissionDetails")),
  adminManageAdmins: lazy(() => import("../features/user/pages/AdminManageAdmins")),
  generalDashboard: lazy(
    () => import("../features/dashboard/pages/GeneralDashboard")
  ),
  forgotPassword: lazy(() => import("../features/auth/pages/ForgotPasswordPage")),
  resetPassword: lazy(() => import("../features/auth/pages/ResetPasswordPage")),
  changePassword: lazy(() => import("../features/auth/pages/ChangePasswordPage")),
};

type PageKey = keyof typeof pages;

interface LazyRouteElementProps {
  page: PageKey;
}

const routeFallback = (
  <div className="flex min-h-screen items-center justify-center">
    Loading...
  </div>
);

export default function LazyRouteElement({ page }: LazyRouteElementProps) {
  const Page = pages[page];

  return (
    <Suspense fallback={routeFallback}>
      <Page />
    </Suspense>
  );
}
