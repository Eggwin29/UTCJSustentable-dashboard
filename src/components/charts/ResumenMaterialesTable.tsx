// components/charts/ResumenMaterialesTable.tsx
import React from "react";
import { Table } from "@/components/ui/table";
import Badge from "@/components/ui/Badge/Badge";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getMaterialTotals, getTotalHistorico } from "@/services/residuosService";

const ResumenMaterialesTable: React.FC = () => {
  const { data: materiales, isLoading } = useAsyncData(getMaterialTotals);
  const { data: total } = useAsyncData(getTotalHistorico);

  return (
    <Table>
      <Table.Head>
        <tr>
          <Table.HeaderCell>Material</Table.HeaderCell>
          <Table.HeaderCell align="right">Total (kg)</Table.HeaderCell>
          <Table.HeaderCell align="right">% del total</Table.HeaderCell>
          <Table.HeaderCell align="right">CO₂ evitado (kg)</Table.HeaderCell>
        </tr>
      </Table.Head>
      <Table.Body>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Table.Row key={i}>
              <Table.Cell><Skeleton variant="text" className="w-28" /></Table.Cell>
              <Table.Cell align="right"><Skeleton variant="text" className="w-16 ml-auto" /></Table.Cell>
              <Table.Cell align="right"><Skeleton variant="text" className="w-12 ml-auto" /></Table.Cell>
              <Table.Cell align="right"><Skeleton variant="text" className="w-16 ml-auto" /></Table.Cell>
            </Table.Row>
          ))}

        {!isLoading && (materiales?.length ?? 0) === 0 && (
          <Table.Empty colSpan={4} title="Sin datos" description="Aún no hay materiales registrados." />
        )}

        {!isLoading &&
          materiales?.map((m) => (
            <Table.Row key={m.tipoResiduo}>
              <Table.Cell className="font-medium text-slate-800 dark:text-white">{m.tipoResiduo}</Table.Cell>
              <Table.Cell align="right">{m.totalKg.toLocaleString("es-MX")}</Table.Cell>
              <Table.Cell align="right">
                <Badge variant="outline">{total ? `${((m.totalKg / total) * 100).toFixed(1)}%` : "—"}</Badge>
              </Table.Cell>
              <Table.Cell align="right">{m.co2Evitado.toLocaleString("es-MX", { maximumFractionDigits: 1 })}</Table.Cell>
            </Table.Row>
          ))}
      </Table.Body>
    </Table>
  );
};

export default ResumenMaterialesTable;