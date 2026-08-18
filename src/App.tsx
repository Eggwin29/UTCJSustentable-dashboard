import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/AppRouter";
import { ToastProvider } from "@/components/ui/toast/toast";
import { ConfirmModalProvider } from "@/components/ui/confirm-modal";
import { AuthProvider } from "@/context/auth/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmModalProvider>
          <RouterProvider router={router} />
        </ConfirmModalProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;