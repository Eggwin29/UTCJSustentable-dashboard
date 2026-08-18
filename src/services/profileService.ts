import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/profile";

export const profileService = {
  async getByUserId(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
          id,
          first_name,
          last_name,
          role,
          active,
          created_at
        `
      )
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      active: data.active,
      createdAt: data.created_at,
    };
  },
};