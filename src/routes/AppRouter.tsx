import {
  createBrowserRouter,
} from "react-router-dom";

import {
  RouteErrorPage,
} from "@/components/common/ApplicationError";

import MainLayout from "@/layouts/MainLayout";

import AdminRoute from "@/routes/AdminRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";

import Collections from "@/pages/Collections/Collections";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Login from "@/pages/Login/Login";
import NotFound from "@/pages/NotFound/NotFound";
import Participation from "@/pages/Participation/Participation";
import Profile from "@/pages/Profile/Profile";
import Reports from "@/pages/Reports/Reports";
import Settings from "@/pages/Settings/Settings";
import Users from "@/pages/Users/Users";
import ForgotPassword from "@/pages/ForgotPassword/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword/ResetPassword";

export const router =
  createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
      errorElement:
        <RouteErrorPage />,
    },
    
    {
      path: "/recuperar-contrasena",
      element: <ForgotPassword />,
      errorElement: <RouteErrorPage />,
    },
    {
      path: "/restablecer-contrasena",
      element: <ResetPassword />,
      errorElement: <RouteErrorPage />,
    },

    {
      element:
        <ProtectedRoute />,

      errorElement:
        <RouteErrorPage />,

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
              path: "collections",
              element:
                <Collections />,
            },

            {
              path: "participation",
              element:
                <Participation />,
            },

            {
              path: "reports",
              element:
                <Reports />,
            },

            {
              path: "perfil",
              element:
                <Profile />,
            },

            {
              element:
                <AdminRoute />,

              children: [
                {
                  path: "users",
                  element:
                    <Users />,
                },

                {
                  path: "settings",
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