import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/AppRouter";
import { ToastProvider } from "@/components/ui/toast/toast";
import { ConfirmModalProvider } from "@/components/ui/confirm-modal";

function App() {
  return (
    <ToastProvider>
      <ConfirmModalProvider>
        <RouterProvider router={router} />
      </ConfirmModalProvider>
    </ToastProvider>
  );
}

export default App;