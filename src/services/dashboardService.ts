import { supabase } from "@/lib/supabase";

import type {
  CollectionListItem,
} from "@/types/collection";

export interface DashboardSummary {
  totalKilograms: number;
  totalCo2: number;
  collectionsCount: number;
  activeMaterialsCount: number;
  recentCollections:
    CollectionListItem[];
}

export const dashboardService = {
  async getSummary():
    Promise<DashboardSummary> {
    const [
      collectionsResult,
      activeMaterialsResult,
    ] = await Promise.all([
      supabase
        .from("waste_collections")
        .select(`
          id,
          year,
          record_type,
          collection_date,
          material_id,
          kilograms,
          co2_factor_applied,
          location,
          notes,
          created_by,
          created_at,
          updated_at,
          materials (
            id,
            name
          )
        `)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("materials")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("active", true),
    ]);

    if (collectionsResult.error) {
      throw collectionsResult.error;
    }

    if (activeMaterialsResult.error) {
      throw activeMaterialsResult.error;
    }

    let totalKilograms = 0;
    let totalCo2 = 0;
    let collectionsCount = 0;

    const recentCollections:
      CollectionListItem[] = [];

    for (
      const record
      of collectionsResult.data
    ) {
      const kilograms =
        Number(record.kilograms);

      const co2Factor =
        Number(
          record.co2_factor_applied
        );

      totalKilograms += kilograms;

      totalCo2 +=
        kilograms * co2Factor;

      if (
        record.record_type !==
        "collection"
      ) {
        continue;
      }

      collectionsCount += 1;

      if (
        recentCollections.length >= 5
      ) {
        continue;
      }

      if (
        !record.collection_date ||
        !record.created_by
      ) {
        throw new Error(
          `La recolección ${record.id} no tiene fecha o creador.`
        );
      }

      recentCollections.push({
        id: record.id,
        date:
          record.collection_date,
        materialId:
          record.material_id,
        kilograms,
        location: record.location,
        notes: record.notes,
        createdBy:
          record.created_by,
        createdAt:
          record.created_at,
        updatedAt:
          record.updated_at,
        materialName:
          record.materials?.name ??
          "Sin material",
      });
    }

    return {
      totalKilograms,
      totalCo2,
      collectionsCount,

      activeMaterialsCount:
        activeMaterialsResult.count ??
        0,

      recentCollections,
    };
  },
};