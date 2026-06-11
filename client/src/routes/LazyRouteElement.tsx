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
  generalDashboard: lazy(
    () => import("../features/dashboard/pages/GeneralDashboard")
  ),
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
