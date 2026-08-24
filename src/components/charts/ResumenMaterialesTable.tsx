import type {
  FC,
} from "react";

import Badge from "@/components/ui/Badge/Badge";
import Pagination from "@/components/ui/pagination";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import { Table } from "@/components/ui/table";

import {
  usePagination,
} from "@/hooks/usePagination";

import type {
  MaterialTotal,
} from "@/types/reportes";

export interface ResumenMaterialesTableProps {
  materials: MaterialTotal[];
  total: number;
  isLoading?: boolean;
}

const ResumenMaterialesTable: FC<
  ResumenMaterialesTableProps
> = ({
  materials,
  total,
  isLoading = false,
}) => {
  const {
    currentPage,
    pageSize,
    totalItems,
    paginatedItems:
      paginatedMaterials,
    setCurrentPage,
    setPageSize,
  } = usePagination(materials);

  return (
    <>
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>
              Material
            </Table.HeaderCell>

            <Table.HeaderCell align="right">
              Total (kg)
            </Table.HeaderCell>

            <Table.HeaderCell align="right">
              % del total
            </Table.HeaderCell>

            <Table.HeaderCell align="right">
              CO₂ evitado (kg)
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>

        <Table.Body>
          {isLoading &&
            Array.from({
              length: 5,
            }).map((_, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <Skeleton
                    variant="text"
                    className="w-28"
                  />
                </Table.Cell>

                <Table.Cell align="right">
                  <Skeleton
                    variant="text"
                    className="ml-auto w-16"
                  />
                </Table.Cell>

                <Table.Cell align="right">
                  <Skeleton
                    variant="text"
                    className="ml-auto w-12"
                  />
                </Table.Cell>

                <Table.Cell align="right">
                  <Skeleton
                    variant="text"
                    className="ml-auto w-16"
                  />
                </Table.Cell>
              </Table.Row>
            ))}

          {!isLoading &&
            materials.length === 0 && (
              <Table.Empty
                colSpan={4}
                title="Sin resultados"
                description="No hay materiales que coincidan con los filtros seleccionados."
              />
            )}

          {!isLoading &&
            paginatedMaterials.map(
              (material) => (
                <Table.Row
                  key={
                    material.tipoResiduo
                  }
                >
                  <Table.Cell className="font-medium text-slate-800 dark:text-white">
                    {
                      material.tipoResiduo
                    }
                  </Table.Cell>

                  <Table.Cell align="right">
                    {material.totalKg.toLocaleString(
                      "es-MX"
                    )}
                  </Table.Cell>

                  <Table.Cell align="right">
                    <Badge variant="outline">
                      {total > 0
                        ? `${(
                            (material.totalKg /
                              total) *
                            100
                          ).toFixed(1)}%`
                        : "—"}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell align="right">
                    {material.co2Evitado.toLocaleString(
                      "es-MX",
                      {
                        maximumFractionDigits: 1,
                      }
                    )}
                  </Table.Cell>
                </Table.Row>
              )
            )}
        </Table.Body>
      </Table>

      {!isLoading && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={
            setCurrentPage
          }
          onPageSizeChange={
            setPageSize
          }
        />
      )}
    </>
  );
};

export default ResumenMaterialesTable;