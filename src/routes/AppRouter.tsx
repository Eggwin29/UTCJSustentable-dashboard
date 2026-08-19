import { createBrowserRouter } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";

import Dashboard from "@/pages/Dashboard/Dashboard";
import DesignSystem from "@/pages/DesignSystem/DesignSystem";
import Collections from "@/pages/Collections/Collections";
import Reports from "@/pages/Reports/Reports";
import Users from "@/pages/Users/Users";
import Settings from "@/pages/Settings/Settings";
import Login from "@/pages/Login/Login";
import NotFound from "@/pages/NotFound/NotFound";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },

  {
    element: <ProtectedRoute />,

    children: [
      {
        path: "/",
        element: <MainLayout />,

        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "collections",
            element: <Collections />,
          },
          {
            path: "reports",
            element: <Reports />,
          },
          {
            path: "design-system",
            element: <DesignSystem />,
          },

          {
            element: <AdminRoute />,

            children: [
              {
                path: "users",
                element: <Users />,
              },
              {
                path: "settings",
                element: <Settings />,
              },
            ],
          },

          {
            path: "*",
            element: <NotFound />,
          },
        ],
      },
    ],
  },
]);