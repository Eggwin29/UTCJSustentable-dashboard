import { supabase } from "@/lib/supabase";
import type { Material } from "@/types/material";

export const materialsService = {
  async getActive(): Promise<Material[]> {
    const { data, error } = await supabase
      .from("materials")
      .select(
        `
          id,
          name,
          co2_factor,
          active,
          created_at
        `
      )
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map((material) => ({
      id: material.id,
      name: material.name,
      co2Factor: material.co2_factor,
      active: material.active,
      createdAt: material.created_at,
    }));
  },
};