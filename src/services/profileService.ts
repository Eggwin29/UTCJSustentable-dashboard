import { supabase } from "@/lib/supabase";
import type {
  Profile,
  UpdateOwnProfileInput,
} from "@/types/profile";

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

  async updateOwn(
  userId: string,
  input: UpdateOwnProfileInput
): Promise<Profile> {
  const firstName =
    input.firstName.trim();

  const lastName =
    input.lastName.trim();

  if (!firstName || !lastName) {
    throw new Error(
      "El nombre y los apellidos son obligatorios."
    );
  }

  const { data, error } =
    await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq("id", userId)
      .select(`
        id,
        first_name,
        last_name,
        role,
        active,
        created_at
      `)
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "No se pudo actualizar el perfil o no tienes permiso para hacerlo."
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