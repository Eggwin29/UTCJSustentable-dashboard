import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import App from "./App.tsx";

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
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);