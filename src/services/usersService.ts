import { supabase } from "@/lib/supabase";

import type {
  Profile,
  UpdateProfileAccessInput,
} from "@/types/profile";

const PROFILE_SELECT = `
  id,
  first_name,
  last_name,
  role,
  active,
  created_at
` as const;

export const usersService = {
  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .order("first_name", { ascending: true })
      .order("last_name", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map((profile) => ({
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
      active: profile.active,
      createdAt: profile.created_at,
    }));
  },

  async updateAccess(
    userId: string,
    input: UpdateProfileAccessInput
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        role: input.role,
        active: input.active,
      })
      .eq("id", userId)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "El usuario no existe o no tienes permiso para modificarlo."
      );
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