import { supabase } from "@/lib/supabase";
import { invalidateReportesCache } from "@/services/reportsService";

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
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
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    invalidateReportesCache();
  },

  async getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return user;
  },
};