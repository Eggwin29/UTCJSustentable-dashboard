import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import App from "./App.tsx";

import {
  AppErrorBoundary,
} from "@/components/common/ApplicationError";

import {
  ThemeProvider,
} from "@/context/theme/ThemeProvider";

import "./index.css";
import "@/lib/drs";

createRoot(
  document.getElementById(
    "root"
  )!
).render(
  <StrictMode>
    <AppErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AppErrorBoundary>
  </StrictMode>
);