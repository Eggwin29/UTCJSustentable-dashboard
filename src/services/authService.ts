import {
  supabase,
} from "@/lib/supabase";

import {
  invalidateReportesCache,
} from "@/services/reportsService";

export const authService = {
  async signIn(
    email: string,
    password: string
  ) {
    const { data, error } =
      await supabase.auth
        .signInWithPassword({
          email,
          password,
        });

    if (error) {
      throw error;
    }

    invalidateReportesCache();

    return data;
  },

  async signOut() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    invalidateReportesCache();
  },

  async getUser() {
    const {
      data: { user },
      error,
    } =
      await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return user;
  },

  async requestPasswordReset(
    email: string
  ) {
    const redirectTo = new URL(
      "/restablecer-contrasena",
      window.location.origin
    ).toString();

    const { error } =
      await supabase.auth
        .resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo,
          }
        );

    if (error) {
      throw error;
    }
  },

  async updateRecoveredPassword(
    newPassword: string
  ) {
    const { error } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    if (error) {
      throw error;
    }
  },

  async changePassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ) {
    const {
      error: verificationError,
    } =
      await supabase.auth
        .signInWithPassword({
          email,
          password: currentPassword,
        });

    if (verificationError) {
      throw new Error(
        "La contraseña actual no es correcta."
      );
    }

    const { error } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    if (error) {
      throw error;
    }
  },
};