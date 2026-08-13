import React, { useCallback, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { ConfirmModalContext } from "./confirmModalContext";
import type { ConfirmOptions, ConfirmRequest } from "./types";

export const ConfirmModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setRequest({
        title: options.title,
        description: options.description,
        confirmText: options.confirmText ?? "Confirmar",
        cancelText: options.cancelText ?? "Cancelar",
        variant: options.variant ?? "default",
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(
    (confirmed: boolean) => {
      request?.resolve(confirmed);
      setRequest(null);
    },
    [request]
  );

  return (
    <ConfirmModalContext.Provider value={confirm}>
      {children}
      <ConfirmModal request={request} onClose={handleClose} />
    </ConfirmModalContext.Provider>
  );
};