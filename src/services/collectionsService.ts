import { supabase } from "@/lib/supabase";

import {
  formatAcademicTerm,
} from "@/services/academicTermsService";

import {
  invalidateReportesCache,
} from "@/services/reportsService";

import type {
  CollectionListItem,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/types/collection";

const COLLECTION_SELECT = `
  id,
  collection_date,
  academic_term_id,
  material_id,
  kilograms,
  location,
  notes,
  created_by,
  created_at,
  updated_at,
  academic_terms (
    year,
    term
  ),
  materials (
    id,
    name
  )
` as const;

function getCollectionYear(
  date: string
): number {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    throw new Error(
      "La fecha de la recolección no tiene un formato válido."
    );
  }

  return Number(date.slice(0, 4));
}

function getAcademicTermId(
  academicTermId: string
): string {
  const normalizedAcademicTermId =
    academicTermId.trim();

  if (!normalizedAcademicTermId) {
    throw new Error(
      "Selecciona el cuatrimestre de la recolección."
    );
  }

  return normalizedAcademicTermId;
}

export const collectionsService = {
  async getAll():
    Promise<CollectionListItem[]> {
    const { data, error } =
      await supabase
        .from("waste_collections")
        .select(COLLECTION_SELECT)
        .eq(
          "record_type",
          "collection"
        )
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
        date:
          collection.collection_date,

        academicTermId:
          collection.academic_term_id,

        materialId:
          collection.material_id,

        kilograms:
          collection.kilograms,

        location:
          collection.location,

        notes:
          collection.notes,

        createdBy:
          collection.created_by,

        createdAt:
          collection.created_at,

        updatedAt:
          collection.updated_at,

        academicTermLabel:
          collection.academic_terms
            ? formatAcademicTerm(
                collection
                  .academic_terms.term,

                collection
                  .academic_terms.year
              )
            : "Sin cuatrimestre",

        materialName:
          collection.materials?.name ??
          "Sin material",
      };
    });
  },

  async create(
    input: CreateCollectionInput
  ): Promise<CollectionListItem> {
    const year =
      getCollectionYear(input.date);

    const academicTermId =
      getAcademicTermId(
        input.academicTermId
      );

    const { data, error } =
      await supabase
        .from("waste_collections")
        .insert({
          year,
          record_type: "collection",

          collection_date:
            input.date,

          academic_term_id:
            academicTermId,

          material_id:
            input.materialId,

          kilograms:
            input.kilograms,

          location:
            input.location?.trim() ||
            null,

          notes:
            input.notes?.trim() ||
            null,

          created_by:
            input.createdBy,
        })
        .select(COLLECTION_SELECT)
        .single();

    if (error) {
      throw error;
    }

    invalidateReportesCache();

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

      academicTermId:
        data.academic_term_id,

      materialId:
        data.material_id,

      kilograms:
        data.kilograms,

      location:
        data.location,

      notes:
        data.notes,

      createdBy:
        data.created_by,

      createdAt:
        data.created_at,

      updatedAt:
        data.updated_at,

      academicTermLabel:
        data.academic_terms
          ? formatAcademicTerm(
              data.academic_terms.term,
              data.academic_terms.year
            )
          : "Sin cuatrimestre",

      materialName:
        data.materials?.name ??
        "Sin material",
    };
  },

  async update(
    id: string,
    input: UpdateCollectionInput
  ): Promise<CollectionListItem> {
    const year =
      getCollectionYear(input.date);

    const academicTermId =
      getAcademicTermId(
        input.academicTermId
      );

    const { data, error } =
      await supabase
        .from("waste_collections")
        .update({
          year,

          collection_date:
            input.date,

          academic_term_id:
            academicTermId,

          material_id:
            input.materialId,

          kilograms:
            input.kilograms,

          location:
            input.location?.trim() ||
            null,

          notes:
            input.notes?.trim() ||
            null,
        })
        .eq("id", id)
        .eq(
          "record_type",
          "collection"
        )
        .select(COLLECTION_SELECT)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "La recolección no existe o no tienes permiso para editarla."
      );
    }

    invalidateReportesCache();

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

      academicTermId:
        data.academic_term_id,

      materialId:
        data.material_id,

      kilograms:
        data.kilograms,

      location:
        data.location,

      notes:
        data.notes,

      createdBy:
        data.created_by,

      createdAt:
        data.created_at,

      updatedAt:
        data.updated_at,

      academicTermLabel:
        data.academic_terms
          ? formatAcademicTerm(
              data.academic_terms.term,
              data.academic_terms.year
            )
          : "Sin cuatrimestre",

      materialName:
        data.materials?.name ??
        "Sin material",
    };
  },

  async remove(
    id: string
  ): Promise<void> {
    const { data, error } =
      await supabase
        .from("waste_collections")
        .delete()
        .eq("id", id)
        .eq(
          "record_type",
          "collection"
        )
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

    invalidateReportesCache();
  },
};