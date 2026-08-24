import {
  useEffect,
  useRef,
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

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [profileError, setProfileError] =
    useState<Error | null>(null);

  const currentUserIdRef =
    useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    function applySession(
      nextSession: Session | null
    ) {
      if (!mounted) {
        return;
      }

      const nextUserId =
        nextSession?.user.id ?? null;

      const userChanged =
        currentUserIdRef.current !== nextUserId;

      currentUserIdRef.current = nextUserId;

      setSession(nextSession);
      setLoading(false);

      if (userChanged) {
        setProfile(null);
        setProfileError(null);
        setProfileLoading(Boolean(nextUserId));
      }
    }

    async function loadSession() {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      applySession(initialSession);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        applySession(nextSession);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const userId = session?.user.id;

    async function loadProfile() {
      if (!userId) {
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
        return;
      }

      setProfile(null);
      setProfileError(null);
      setProfileLoading(true);

      try {
        const userProfile =
          await profileService.getByUserId(
            userId
          );

        if (!cancelled) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error(
          "Error al obtener el perfil del usuario:",
          error
        );

        if (!cancelled) {
          setProfileError(
            error instanceof Error
              ? error
              : new Error(
                  "No se pudo obtener el perfil."
                )
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    void loadProfile();

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
        profileError,
        replaceProfile: (
          nextProfile
        ) => {
          setProfile(nextProfile);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}