import { createContext } from "react";
import type { ConfirmOptions } from "./types";

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmModalContext = createContext<ConfirmFn | undefined>(undefined);