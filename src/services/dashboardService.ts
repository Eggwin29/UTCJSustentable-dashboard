import {
  supabase,
} from "@/lib/supabase";

import {
  academicTermsService,
  formatAcademicTerm,
} from "@/services/academicTermsService";

import type {
  CollectionListItem,
} from "@/types/collection";

export interface DashboardMaterialSummary {
  id: string;
  name: string;
  kilograms: number;
  percentage: number;
}

export interface DashboardSummary {
  totalKilograms: number;
  totalCo2: number;
  collectionsCount: number;
  activeMaterialsCount: number;

  humanCapitalParticipants: number;
  internshipParticipants: number;

  currentAcademicTerm: {
    id: string;
    label: string;
    startDate: string;
    endDate: string;
  } | null;

  currentTermKilograms: number;

  currentTermCollectionsCount:
    number;

  currentTermParticipants: number;

  topMaterials:
    DashboardMaterialSummary[];

  recentCollections:
    CollectionListItem[];

  lastUpdatedAt: string | null;
}

interface MaterialAccumulator {
  id: string;
  name: string;
  kilograms: number;
}

export const dashboardService = {
  async getSummary():
    Promise<DashboardSummary> {
    const [
      collectionsResult,
      activeMaterialsResult,
      humanCapitalResult,
      internshipResult,
      currentAcademicTerm,
    ] = await Promise.all([
      supabase
        .from(
          "waste_collections"
        )
        .select(`
          id,
          year,
          record_type,
          collection_date,
          academic_term_id,
          material_id,
          kilograms,
          co2_factor_applied,
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

      supabase
        .from("human_capital")
        .select(
          "academic_term_id, tm_tuesday, tv_thursday"
        ),

      supabase
        .from(
          "internship_participation"
        )
        .select(
          "academic_term_id, participant_count"
        ),

      academicTermsService.getCurrent(),
    ]);

    if (
      collectionsResult.error
    ) {
      throw collectionsResult.error;
    }

    if (
      activeMaterialsResult.error
    ) {
      throw activeMaterialsResult.error;
    }

    if (
      humanCapitalResult.error
    ) {
      throw humanCapitalResult.error;
    }

    if (internshipResult.error) {
      throw internshipResult.error;
    }

    let totalKilograms = 0;
    let totalCo2 = 0;
    let collectionsCount = 0;

    let currentTermKilograms = 0;

    let currentTermCollectionsCount =
      0;

    const recentCollections:
      CollectionListItem[] = [];

    const materialTotals =
      new Map<
        string,
        MaterialAccumulator
      >();

    const humanCapitalParticipants =
      humanCapitalResult.data.reduce(
        (total, record) =>
          total +
          Number(
            record.tm_tuesday
          ) +
          Number(
            record.tv_thursday
          ),
        0
      );

    const internshipParticipants =
      internshipResult.data.reduce(
        (total, record) =>
          total +
          Number(
            record.participant_count
          ),
        0
      );

    const currentHumanCapitalParticipants =
      currentAcademicTerm
        ? humanCapitalResult.data.reduce(
            (
              total,
              record
            ) => {
              if (
                record.academic_term_id !==
                currentAcademicTerm.id
              ) {
                return total;
              }

              return (
                total +
                Number(
                  record.tm_tuesday
                ) +
                Number(
                  record.tv_thursday
                )
              );
            },
            0
          )
        : 0;

    const currentInternshipParticipants =
      currentAcademicTerm
        ? internshipResult.data.reduce(
            (
              total,
              record
            ) =>
              record.academic_term_id ===
              currentAcademicTerm.id
                ? total +
                  Number(
                    record.participant_count
                  )
                : total,
            0
          )
        : 0;

    for (
      const record of
      collectionsResult.data
    ) {
      const kilograms =
        Number(record.kilograms);

      const co2Factor =
        Number(
          record.co2_factor_applied
        );

      totalKilograms +=
        kilograms;

      totalCo2 +=
        kilograms * co2Factor;

      const materialId =
        record.material_id;

      const materialName =
        record.materials?.name ??
        "Sin material";

      const accumulatedMaterial =
        materialTotals.get(
          materialId
        );

      if (
        accumulatedMaterial
      ) {
        accumulatedMaterial.kilograms +=
          kilograms;
      } else {
        materialTotals.set(
          materialId,
          {
            id: materialId,
            name: materialName,
            kilograms,
          }
        );
      }

      if (
        record.record_type !==
        "collection"
      ) {
        continue;
      }

      collectionsCount += 1;

      if (
        currentAcademicTerm &&
        record.academic_term_id ===
          currentAcademicTerm.id
      ) {
        currentTermKilograms +=
          kilograms;

        currentTermCollectionsCount +=
          1;
      }

      if (
        recentCollections.length >=
        5
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

        academicTermId:
          record.academic_term_id,

        materialId:
          record.material_id,

        kilograms,

        location:
          record.location,

        notes: record.notes,

        createdBy:
          record.created_by,

        createdAt:
          record.created_at,

        updatedAt:
          record.updated_at,

        academicTermLabel:
          record.academic_terms
            ? formatAcademicTerm(
                record
                  .academic_terms
                  .term,

                record
                  .academic_terms
                  .year
              )
            : "Sin cuatrimestre",

        materialName,
      });
    }

    const topMaterials =
      Array.from(
        materialTotals.values()
      )
        .sort(
          (
            first,
            second
          ) =>
            second.kilograms -
            first.kilograms
        )
        .slice(0, 5)
        .map((material) => ({
          ...material,

          percentage:
            totalKilograms > 0
              ? (material.kilograms /
                  totalKilograms) *
                100
              : 0,
        }));

    return {
      totalKilograms,
      totalCo2,
      collectionsCount,

      activeMaterialsCount:
        activeMaterialsResult.count ??
        0,

      humanCapitalParticipants,
      internshipParticipants,

      currentAcademicTerm:
        currentAcademicTerm
          ? {
              id:
                currentAcademicTerm.id,

              label:
                currentAcademicTerm.label,

              startDate:
                currentAcademicTerm.startDate,

              endDate:
                currentAcademicTerm.endDate,
            }
          : null,

      currentTermKilograms,

      currentTermCollectionsCount,

      currentTermParticipants:
        currentHumanCapitalParticipants +
        currentInternshipParticipants,

      topMaterials,
      recentCollections,

      lastUpdatedAt:
        collectionsResult.data[0]
          ?.updated_at ?? null,
    };
  },
};