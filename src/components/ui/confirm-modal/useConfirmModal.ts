import { useContext } from "react";
import { ConfirmModalContext } from "./confirmModalContext";

export function useConfirmModal() {
  const ctx = useContext(ConfirmModalContext);
  if (!ctx) throw new Error("useConfirmModal debe usarse dentro de un <ConfirmModalProvider>");
  return ctx;
}