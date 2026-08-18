import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile";

export interface AuthContextValue {
  session: Session | null;
  user: User | null;

  profile: Profile | null;

  loading: boolean;
  profileLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);