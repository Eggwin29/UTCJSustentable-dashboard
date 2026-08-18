import { supabase } from "@/lib/supabase";

import type {
  CollectionListItem,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/types/collection";

function getCollectionYear(date: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(
      "La fecha de la recolección no tiene un formato válido."
    );
  }

  return Number(date.slice(0, 4));
}

export const collectionsService = {
  // =====================================================
  // OBTENER RECOLECCIONES
  // =====================================================

  async getAll(): Promise<CollectionListItem[]> {
    const { data, error } = await supabase
      .from("waste_collections")
      .select(
        `
          id,
          collection_date,
          material_id,
          kilograms,
          location,
          notes,
          created_by,
          created_at,
          updated_at,
          materials (
            id,
            name
          )
        `
      )
      .eq("record_type", "collection")
      .order("collection_date", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return data.map((collection) => {
      if (
        !collection.collection_date ||
        !collection.created_by
      ) {
        throw new Error(
          `La recolección ${collection.id} no tiene fecha o creador.`
        );
      }

      return {
        id: collection.id,
        date: collection.collection_date,
        materialId: collection.material_id,
        kilograms: collection.kilograms,
        location: collection.location,
        notes: collection.notes,
        createdBy: collection.created_by,
        createdAt: collection.created_at,
        updatedAt: collection.updated_at,
        materialName:
          collection.materials?.name ??
          "Sin material",
      };
    });
  },

  // =====================================================
  // CREAR RECOLECCIÓN
  // =====================================================

  async create(
    input: CreateCollectionInput
  ): Promise<CollectionListItem> {
    const year = getCollectionYear(input.date);

    const { data, error } = await supabase
      .from("waste_collections")
      .insert({
        year,
        record_type: "collection",
        collection_date: input.date,
        material_id: input.materialId,
        kilograms: input.kilograms,
        location:
          input.location?.trim() || null,
        notes:
          input.notes?.trim() || null,
        created_by: input.createdBy,
      })
      .select(
        `
          id,
          collection_date,
          material_id,
          kilograms,
          location,
          notes,
          created_by,
          created_at,
          updated_at,
          materials (
            id,
            name
          )
        `
      )
      .single();

    if (error) {
      throw error;
    }

    if (
      !data.collection_date ||
      !data.created_by
    ) {
      throw new Error(
        "La recolección creada no tiene fecha o creador."
      );
    }

    return {
      id: data.id,
      date: data.collection_date,
      materialId: data.material_id,
      kilograms: data.kilograms,
      location: data.location,
      notes: data.notes,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      materialName:
        data.materials?.name ??
        "Sin material",
    };
  },

  // =====================================================
  // ACTUALIZAR RECOLECCIÓN
  // =====================================================

  async update(
    id: string,
    input: UpdateCollectionInput
  ): Promise<CollectionListItem> {
    const year = getCollectionYear(input.date);

    const { data, error } = await supabase
      .from("waste_collections")
      .update({
        year,
        collection_date: input.date,
        material_id: input.materialId,
        kilograms: input.kilograms,
        location:
          input.location?.trim() || null,
        notes:
          input.notes?.trim() || null,
      })
      .eq("id", id)
      .eq("record_type", "collection")
      .select(
        `
          id,
          collection_date,
          material_id,
          kilograms,
          location,
          notes,
          created_by,
          created_at,
          updated_at,
          materials (
            id,
            name
          )
        `
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "La recolección no existe o no tienes permiso para editarla."
      );
    }

    if (
      !data.collection_date ||
      !data.created_by
    ) {
      throw new Error(
        "La recolección actualizada no tiene fecha o creador."
      );
    }

    return {
      id: data.id,
      date: data.collection_date,
      materialId: data.material_id,
      kilograms: data.kilograms,
      location: data.location,
      notes: data.notes,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      materialName:
        data.materials?.name ??
        "Sin material",
    };
  },

  // =====================================================
  // ELIMINAR RECOLECCIÓN
  // =====================================================

  async remove(id: string): Promise<void> {
    const { data, error } = await supabase
      .from("waste_collections")
      .delete()
      .eq("id", id)
      .eq("record_type", "collection")
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "La recolección no existe o no tienes permiso para eliminarla."
      );
    }
  },
};