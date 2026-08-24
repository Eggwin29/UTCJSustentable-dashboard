import {
  createBrowserRouter,
} from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import AdminRoute from "@/routes/AdminRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";

import Collections from "@/pages/Collections/Collections";
import Dashboard from "@/pages/Dashboard/Dashboard";
import DesignSystem from "@/pages/DesignSystem/DesignSystem";
import Login from "@/pages/Login/Login";
import NotFound from "@/pages/NotFound/NotFound";
import Participation from "@/pages/Participation/Participation";
import Reports from "@/pages/Reports/Reports";
import Settings from "@/pages/Settings/Settings";
import Users from "@/pages/Users/Users";
import Profile from "@/pages/Profile/Profile";

export const router =
  createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },

    {
      element:
        <ProtectedRoute />,

      children: [
        {
          path: "/",
          element:
            <MainLayout />,
            

          children: [
            {
              index: true,
              element:
                <Dashboard />,
            },
            {
              path:
                "collections",

              element:
                <Collections />,
            },
            {
              path:
                "participation",

              element:
                <Participation />,
            },
            {
              path:
                "reports",

              element:
                <Reports />,
            },
            {
              path: "perfil",
              element: <Profile />,
            },
            {
              path:
                "design-system",

              element:
                <DesignSystem />,
            },
            

            {
              element:
                <AdminRoute />,

              children: [
                {
                  path:
                    "users",

                  element:
                    <Users />,
                },
                {
                  path:
                    "settings",

                  element:
                    <Settings />,
                },
              ],
            },

            {
              path: "*",
              element:
                <NotFound />,
            },
          ],
        },
      ],
    },
  ]);