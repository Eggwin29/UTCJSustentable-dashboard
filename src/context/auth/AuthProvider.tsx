import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile";

import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/profileService";

import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // =====================================================
  // SESIÓN
  // =====================================================

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // PERFIL
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const userId = session?.user.id;

    async function loadProfile() {
      if (!userId) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);

      try {
        const userProfile =
          await profileService.getByUserId(userId);

        if (!cancelled) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error(
          "Error al obtener el perfil del usuario:",
          error
        );

        if (!cancelled) {
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        profileLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}