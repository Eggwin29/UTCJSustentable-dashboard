import {
  FiArrowRight,
  FiBarChart2,
  FiInbox,
  FiPlus,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import StatCard from "@/components/charts/StatCard";

import { useAsyncData } from "@/hooks/useAsyncData";
import { useAuth } from "@/context/auth/useAuth";

import { dashboardService } from "@/services/dashboardService";

export default function Dashboard() {
  const navigate = useNavigate();

  const { profile } = useAuth();

  const {
    data,
    isLoading,
    error,
  } = useAsyncData(
    dashboardService.getSummary
  );

  const firstName =
    profile?.firstName?.trim();

  const recentCollections =
    data?.recentCollections ?? [];

  return (
    <div className="space-y-8">
      {/* ENCABEZADO */}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {firstName
              ? `Hola, ${firstName}. Consulta el resumen general de UTCJ Sustentable.`
              : "Consulta el resumen general de UTCJ Sustentable."}
          </p>
        </div>

        <Button
          leftIcon={<FiPlus />}
          onClick={() =>
            navigate("/collections")
          }
        >
          Nueva recolección
        </Button>
      </section>

      {/* ERROR */}

      {error && (
        <Card variant="outlined">
          <Card.Body>
            <p className="text-sm font-medium text-red-600">
              No se pudo cargar el resumen del Dashboard.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Verifica la conexión con Supabase e intenta recargar la página.
            </p>
          </Card.Body>
        </Card>
      )}

      {/* INDICADORES */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            Resumen general
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Indicadores históricos y registros del sistema.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total recolectado"
            value={
              data?.totalKilograms ?? 0
            }
            unit="kg"
            isLoading={isLoading}
            accent="emerald"
            decimals={2}
          />

          <StatCard
            label="CO₂ evitado"
            value={
              data?.totalCo2 ?? 0
            }
            unit="kg"
            isLoading={isLoading}
            accent="sky"
            decimals={2}
          />

          <StatCard
            label="Recolecciones registradas"
            value={
              data?.collectionsCount ?? 0
            }
            isLoading={isLoading}
            accent="emerald"
            decimals={0}
          />

          <StatCard
            label="Materiales activos"
            value={
              data?.activeMaterialsCount ??
              0
            }
            isLoading={isLoading}
            accent="sky"
            decimals={0}
          />
        </div>
      </section>

      {/* CONTENIDO INFERIOR */}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        {/* RECOLECCIONES RECIENTES */}

        <Card variant="outlined">
          <Card.Header className="flex-row items-start justify-between gap-4">
            <div>
              <Card.Title>
                Recolecciones recientes
              </Card.Title>

              <Card.Description>
                Últimos registros capturados en el sistema.
              </Card.Description>
            </div>

            <Button
              variant="ghost"
              size="sm"
              rightIcon={
                <FiArrowRight />
              }
              onClick={() =>
                navigate(
                  "/collections"
                )
              }
            >
              Ver todas
            </Button>
          </Card.Header>

          <Card.Body>
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.HeaderCell>
                    Fecha
                  </Table.HeaderCell>

                  <Table.HeaderCell>
                    Material
                  </Table.HeaderCell>

                  <Table.HeaderCell align="right">
                    Peso
                  </Table.HeaderCell>

                  <Table.HeaderCell>
                    Ubicación
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Head>

              <Table.Body>
                {isLoading ? (
                  Array.from({
                    length: 3,
                  }).map((_, index) => (
                    <Table.Row
                      key={index}
                    >
                      <Table.Cell>
                        <Skeleton
                          variant="text"
                          className="w-20"
                        />
                      </Table.Cell>

                      <Table.Cell>
                        <Skeleton
                          variant="text"
                          className="w-24"
                        />
                      </Table.Cell>

                      <Table.Cell align="right">
                        <Skeleton
                          variant="text"
                          className="ml-auto w-16"
                        />
                      </Table.Cell>

                      <Table.Cell>
                        <Skeleton
                          variant="text"
                          className="w-24"
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : recentCollections.length ===
                  0 ? (
                  <Table.Empty
                    colSpan={4}
                    icon={
                      <FiInbox
                        size={28}
                      />
                    }
                    title="No hay recolecciones recientes"
                    description="Registra una nueva recolección para comenzar."
                  />
                ) : (
                  recentCollections.map(
                    (collection) => (
                      <Table.Row
                        key={
                          collection.id
                        }
                      >
                        <Table.Cell>
                          {formatDate(
                            collection.date
                          )}
                        </Table.Cell>

                        <Table.Cell>
                          <span className="font-medium text-slate-800 dark:text-white">
                            {
                              collection.materialName
                            }
                          </span>
                        </Table.Cell>

                        <Table.Cell align="right">
                          {formatKilograms(
                            collection.kilograms
                          )}
                        </Table.Cell>

                        <Table.Cell>
                          {collection.location ||
                            "—"}
                        </Table.Cell>
                      </Table.Row>
                    )
                  )
                )}
              </Table.Body>
            </Table>
          </Card.Body>
        </Card>

        {/* ACCIONES RÁPIDAS */}

        <Card variant="outlined">
          <Card.Header>
            <Card.Title>
              Acciones rápidas
            </Card.Title>

            <Card.Description>
              Accede a las funciones principales.
            </Card.Description>
          </Card.Header>

          <Card.Body className="space-y-3">
            <Button
              className="w-full"
              leftIcon={<FiPlus />}
              onClick={() =>
                navigate(
                  "/collections"
                )
              }
            >
              Registrar recolección
            </Button>

            <Button
              className="w-full"
              variant="secondary"
              leftIcon={
                <FiBarChart2 />
              }
              onClick={() =>
                navigate("/reports")
              }
            >
              Consultar reportes
            </Button>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Información actualizada
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Los indicadores incluyen los datos históricos y las nuevas recolecciones registradas.
              </p>
            </div>
          </Card.Body>
        </Card>
      </section>
    </div>
  );
}

function formatDate(date: string) {
  const [year, month, day] =
    date.split("-");

  return `${day}/${month}/${year}`;
}

function formatKilograms(
  kilograms: number
) {
  return (
    new Intl.NumberFormat("es-MX", {
      maximumFractionDigits: 3,
    }).format(kilograms) + " kg"
  );
}