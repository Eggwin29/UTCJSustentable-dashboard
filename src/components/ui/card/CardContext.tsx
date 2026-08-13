import { createContext, useContext } from "react";
import type { CardVariant } from "./cardVariants";

const CardContext = createContext<CardVariant>("elevated");

export const useCardVariant = () => useContext(CardContext);
export const CardVariantProvider = CardContext.Provider;