import { supabase } from "@/lib/supabase";
import {
  invalidateReportesCache,
} from "@/services/reportsService";

import type {
  CreateMaterialInput,
  Material,
  UpdateMaterialInput,
} from "@/types/material";

const MATERIAL_SELECT = `
  id,
  name,
  co2_factor,
  active,
  created_at
` as const;

function mapMaterial(data: {
  id: string;
  name: string;
  co2_factor: number;
  active: boolean;
  created_at: string;
}): Material {
  return {
    id: data.id,
    name: data.name,
    co2Factor: Number(data.co2_factor),
    active: data.active,
    createdAt: data.created_at,
  };
}

function normalizeInput(
  input:
    | CreateMaterialInput
    | UpdateMaterialInput
) {
  const name = input.name.trim();
  const co2Factor = Number(input.co2Factor);

  if (name.length < 2) {
    throw new Error(
      "El nombre del material debe contener al menos 2 caracteres."
    );
  }

  if (
    !Number.isFinite(co2Factor) ||
    co2Factor < 0
  ) {
    throw new Error(
      "El factor de CO₂ debe ser un número mayor o igual a cero."
    );
  }

  if (co2Factor > 999999.9999) {
    throw new Error(
      "El factor de CO₂ supera el valor permitido."
    );
  }

  return {
    name,
    co2Factor,
  };
}

export const materialsService = {
  async getAll(): Promise<Material[]> {
    const { data, error } = await supabase
      .from("materials")
      .select(MATERIAL_SELECT)
      .order("name", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return data.map(mapMaterial);
  },

  async getActive(): Promise<Material[]> {
    const { data, error } = await supabase
      .from("materials")
      .select(MATERIAL_SELECT)
      .eq("active", true)
      .order("name", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return data.map(mapMaterial);
  },

  async create(
    input: CreateMaterialInput
  ): Promise<Material> {
    const normalized =
      normalizeInput(input);

    const { data, error } = await supabase
      .from("materials")
      .insert({
        name: normalized.name,
        co2_factor:
          normalized.co2Factor,
        active: true,
      })
      .select(MATERIAL_SELECT)
      .single();

    if (error) {
      throw error;
    }

    invalidateReportesCache();

    return mapMaterial(data);
  },

  async update(
    materialId: string,
    input: UpdateMaterialInput
  ): Promise<Material> {
    const normalized =
      normalizeInput(input);

    const { data, error } = await supabase
      .from("materials")
      .update({
        name: normalized.name,
        co2_factor:
          normalized.co2Factor,
      })
      .eq("id", materialId)
      .select(MATERIAL_SELECT)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "El material no existe o no tienes permiso para editarlo."
      );
    }

    invalidateReportesCache();

    return mapMaterial(data);
  },

  async setActive(
    materialId: string,
    active: boolean
  ): Promise<Material> {
    const { data, error } = await supabase
      .from("materials")
      .update({ active })
      .eq("id", materialId)
      .select(MATERIAL_SELECT)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "El material no existe o no tienes permiso para modificarlo."
      );
    }

    invalidateReportesCache();

    return mapMaterial(data);
  },
};