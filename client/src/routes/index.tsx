import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import LazyRouteElement from "./LazyRouteElement";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LazyRouteElement page="login" />,
      },
      {
        path: "/register",
        element: <LazyRouteElement page="register" />,
      },
      {
        path: "/forgot-password",
        element: <LazyRouteElement page="forgotPassword" />,
      },
      {
        path: "/reset-password",
        element: <LazyRouteElement page="resetPassword" />,
      },
    ],
  },
  {
    path: "/student",
    element: <ProtectedRoute allowedRoles={["student"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "dashboard",
            element: <LazyRouteElement page="studentDashboard" />,
          },
          {
            path: "cases",
            element: <LazyRouteElement page="studentCases" />,
          },
          {
            path: "cases/:caseId",
            element: <LazyRouteElement page="studentCaseDetails" />,
          },
          {
            path: "progress",
            element: <LazyRouteElement page="studentProgress" />,
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["admin", "superadmin"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "dashboard",
            element: <LazyRouteElement page="adminDashboard" />,
          },
          {
            path: "create-case",
            element: <LazyRouteElement page="adminCreateCase" />,
          },
          {
            path: "cases/:caseId/edit",
            element: <LazyRouteElement page="adminCreateCase" />,
          },
          {
            path: "manage-cases",
            element: <LazyRouteElement page="adminManageCases" />,
          },
          {
            path: "submissions",
            element: <LazyRouteElement page="adminSubmissionsList" />,
          },
          {
            path: "submissions/:submissionId",
            element: <LazyRouteElement page="adminSubmissionDetails" />,
          },
          {
            element: <ProtectedRoute allowedRoles={["superadmin"]} />,
            children: [
              {
                path: "manage-admins",
                element: <LazyRouteElement page="adminManageAdmins" />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <LazyRouteElement page="generalDashboard" />,
          },
          {
            path: "change-password",
            element: <LazyRouteElement page="changePassword" />,
          },
        ],
      },
    ],
  },
]);
