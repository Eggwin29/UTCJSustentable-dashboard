import { createBrowserRouter } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import Dashboard from "@/pages/Dashboard/Dashboard";
import Collections from "@/pages/Collections/Collections";
import Reports from "@/pages/Reports/Reports";
import Users from "@/pages/Users/Users";
import Settings from "@/pages/Settings/Settings";
import Login from "@/pages/Login/Login";
import NotFound from "@/pages/NotFound/NotFound";

export const router = createBrowserRouter([
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
        path: "users",
        element: <Users />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "/loschones",
        element: <NotFound />,
      }
    ],
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);