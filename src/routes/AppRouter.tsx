import {
  createBrowserRouter,
} from "react-router-dom";

import {
  RouteErrorPage,
} from "@/components/common/ApplicationError";

import MainLayout from "@/layouts/MainLayout";

import AdminRoute from "@/routes/AdminRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";

export const router =
  createBrowserRouter([
    {
      path: "/login",

      lazy: async () => {
        const { default: Component } =
          await import(
            "@/pages/Login/Login"
          );

        return {
          Component,
        };
      },

      errorElement:
        <RouteErrorPage />,
    },

    {
      path: "/recuperar-contrasena",

      lazy: async () => {
        const { default: Component } =
          await import(
            "@/pages/ForgotPassword/ForgotPassword"
          );

        return {
          Component,
        };
      },

      errorElement:
        <RouteErrorPage />,
    },

    {
      path: "/restablecer-contrasena",

      lazy: async () => {
        const { default: Component } =
          await import(
            "@/pages/ResetPassword/ResetPassword"
          );

        return {
          Component,
        };
      },

      errorElement:
        <RouteErrorPage />,
    },

    {
      element: <ProtectedRoute />,

      errorElement:
        <RouteErrorPage />,

      children: [
        {
          path: "/",
          element: <MainLayout />,

          children: [
            {
              index: true,

              lazy: async () => {
                const {
                  default: Component,
                } = await import(
                  "@/pages/Dashboard/Dashboard"
                );

                return {
                  Component,
                };
              },
            },

            {
              path: "collections",

              lazy: async () => {
                const {
                  default: Component,
                } = await import(
                  "@/pages/Collections/Collections"
                );

                return {
                  Component,
                };
              },
            },

            {
              path: "participation",

              lazy: async () => {
                const {
                  default: Component,
                } = await import(
                  "@/pages/Participation/Participation"
                );

                return {
                  Component,
                };
              },
            },

            {
              path: "reports",

              lazy: async () => {
                const {
                  default: Component,
                } = await import(
                  "@/pages/Reports/Reports"
                );

                return {
                  Component,
                };
              },
            },

            {
              path: "perfil",

              lazy: async () => {
                const {
                  default: Component,
                } = await import(
                  "@/pages/Profile/Profile"
                );

                return {
                  Component,
                };
              },
            },

            {
              element: <AdminRoute />,

              children: [
                {
                  path: "users",

                  lazy: async () => {
                    const {
                      default: Component,
                    } = await import(
                      "@/pages/Users/Users"
                    );

                    return {
                      Component,
                    };
                  },
                },

                {
                  path: "settings",

                  lazy: async () => {
                    const {
                      default: Component,
                    } = await import(
                      "@/pages/Settings/Settings"
                    );

                    return {
                      Component,
                    };
                  },
                },
              ],
            },

            {
              path: "*",

              lazy: async () => {
                const {
                  default: Component,
                } = await import(
                  "@/pages/NotFound/NotFound"
                );

                return {
                  Component,
                };
              },
            },
          ],
        },
      ],
    },
  ]);