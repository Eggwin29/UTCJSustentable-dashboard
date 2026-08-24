import type {
  IconType,
} from "react-icons";

import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiDatabase,
  FiInbox,
  FiPackage,
  FiPlus,
  FiSettings,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import {
  useNavigate,
} from "react-router-dom";

import Logo from "@/components/charts/logo";
import StatCard from "@/components/charts/StatCard";

import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import { Table } from "@/components/ui/table";

import {
  useAuth,
} from "@/context/auth/useAuth";

import {
  useAsyncData,
} from "@/hooks/useAsyncData";

import {
  dashboardService,
} from "@/services/dashboardService";

export default function Dashboard() {
  const navigate =
    useNavigate();

  const { profile } =
    useAuth();

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

  const topMaterials =
    data?.topMaterials ?? [];

  const totalParticipants =
    (
      data
        ?.humanCapitalParticipants ??
      0
    ) +
    (
      data
        ?.internshipParticipants ??
      0
    );

  const isAdmin =
    profile?.role === "admin";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-800 via-emerald-700 to-teal-600 px-6 py-7 text-white shadow-lg sm:px-8 sm:py-9">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white/10"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-32 right-36 h-64 w-64 rounded-full border-40 border-white/5"
        />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4 sm:items-center">
            <div className="hidden shrink-0 rounded-2xl bg-white/12 p-2 ring-1 ring-white/20 sm:block">
              <Logo
                width={76}
                height={76}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white"
                >
                  <FiActivity
                    aria-hidden="true"
                  />

                  Sistema activo
                </Badge>

                {data
                  ?.currentAcademicTerm && (
                  <Badge
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white"
                  >
                    <FiCalendar
                      aria-hidden="true"
                    />

                    {
                      data
                        .currentAcademicTerm
                        .label
                    }
                  </Badge>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {firstName
                  ? `Hola, ${firstName}`
                  : "UTCJ Sustentable"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
                Consulta el impacto
                acumulado del programa,
                la actividad del
                cuatrimestre y los
                registros más recientes
                desde un solo lugar.
              </p>

              {data
                ?.lastUpdatedAt && (
                <p className="mt-3 flex items-center gap-2 text-xs text-emerald-100">
                  <FiClock
                    aria-hidden="true"
                  />

                  Última actividad
                  registrada:{" "}
                  {formatDateTime(
                    data.lastUpdatedAt
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Button
              variant="secondary"
              leftIcon={
                <FiPlus
                  aria-hidden="true"
                />
              }
              onClick={() =>
                navigate(
                  "/collections"
                )
              }
            >
              Nueva recolección
            </Button>

            <button
              type="button"
              onClick={() =>
                navigate("/reports")
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              Ver reportes

              <FiArrowRight
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </section>

      {error && (
        <Card
          variant="outlined"
          className="border-red-200 dark:border-red-900"
        >
          <Card.Body className="flex gap-3 p-5">
            <span className="mt-0.5 text-red-600 dark:text-red-400">
              <FiActivity
                size={20}
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                No se pudo cargar el
                resumen del Dashboard.
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Verifica la conexión
                con Supabase e intenta
                recargar la página.
              </p>
            </div>
          </Card.Body>
        </Card>
      )}

      <section
        aria-labelledby="dashboard-summary-title"
      >
        <SectionHeading
          id="dashboard-summary-title"
          title="Impacto general"
          description="Indicadores históricos consolidados del programa."
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total recolectado"
            value={
              data
                ?.totalKilograms ??
              0
            }
            unit="kg"
            isLoading={isLoading}
            accent="emerald"
            decimals={2}
            icon={
              <FiPackage
                aria-hidden="true"
              />
            }
            helper={`${data?.activeMaterialsCount ?? 0} materiales activos disponibles`}
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
            icon={
              <FiTrendingUp
                aria-hidden="true"
              />
            }
            helper="Impacto ambiental estimado con los factores históricos"
          />

          <StatCard
            label="Recolecciones registradas"
            value={
              data
                ?.collectionsCount ??
              0
            }
            isLoading={isLoading}
            accent="amber"
            decimals={0}
            icon={
              <FiDatabase
                aria-hidden="true"
              />
            }
            helper="Registros operativos, sin contar la carga histórica"
          />

          <StatCard
            label="Participación histórica"
            value={
              totalParticipants
            }
            isLoading={isLoading}
            accent="violet"
            decimals={0}
            icon={
              <FiUsers
                aria-hidden="true"
              />
            }
            helper={`${formatInteger(
              data
                ?.humanCapitalParticipants ??
                0
            )} capital humano · ${formatInteger(
              data
                ?.internshipParticipants ??
                0
            )} estadías`}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <CurrentTermCard
          isLoading={isLoading}
          data={data}
          isAdmin={isAdmin}
          onConfigure={() =>
            navigate(
              "/settings#configuracion-cuatrimestres"
            )
          }
        />

        <Card variant="outlined">
          <Card.Header className="flex-row items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-700">
            <div>
              <Card.Title>
                Materiales destacados
              </Card.Title>

              <Card.Description className="mt-1">
                Mayor aportación al
                total histórico
                recolectado.
              </Card.Description>
            </div>

            <Badge variant="secondary">
              {data
                ?.activeMaterialsCount ??
                0}{" "}
              activos
            </Badge>
          </Card.Header>

          <Card.Body className="p-5">
            {isLoading ? (
              <div className="space-y-5">
                {Array.from({
                  length: 4,
                }).map(
                  (_, index) => (
                    <div key={index}>
                      <Skeleton className="h-4 w-32" />

                      <Skeleton className="mt-2 h-2 w-full" />
                    </div>
                  )
                )}
              </div>
            ) : topMaterials.length ===
              0 ? (
              <EmptyDashboardState
                icon={FiPackage}
                title="Sin materiales registrados"
                description="Los materiales aparecerán aquí cuando existan datos de recolección."
              />
            ) : (
              <div className="space-y-5">
                {topMaterials.map(
                  (
                    material,
                    index
                  ) => (
                    <div
                      key={
                        material.id
                      }
                    >
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            {index +
                              1}
                          </span>

                          <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                            {
                              material.name
                            }
                          </span>
                        </div>

                        <span className="shrink-0 font-semibold text-slate-900 dark:text-white">
                          {formatKilograms(
                            material.kilograms
                          )}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400"
                          style={{
                            width: `${Math.max(
                              material.percentage,
                              2
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-right text-xs text-slate-400">
                        {material.percentage.toLocaleString(
                          "es-MX",
                          {
                            maximumFractionDigits: 1,
                          }
                        )}
                        % del total
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </Card.Body>

          <Card.Footer className="justify-end border-t border-slate-100 p-4 dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              rightIcon={
                <FiArrowRight
                  aria-hidden="true"
                />
              }
              onClick={() =>
                navigate(
                  "/reports#materiales-reciclados"
                )
              }
            >
              Analizar materiales
            </Button>
          </Card.Footer>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.75fr)]">
        <Card variant="outlined">
          <Card.Header className="flex-row items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-700">
            <div>
              <Card.Title>
                Recolecciones recientes
              </Card.Title>

              <Card.Description className="mt-1">
                Últimos registros
                capturados en el
                sistema.
              </Card.Description>
            </div>

            <Button
              variant="ghost"
              size="sm"
              rightIcon={
                <FiArrowRight
                  aria-hidden="true"
                />
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

          <Card.Body className="p-5">
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.HeaderCell>
                    Fecha
                  </Table.HeaderCell>

                  <Table.HeaderCell>
                    Material
                  </Table.HeaderCell>

                  <Table.HeaderCell>
                    Cuatrimestre
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
                    length: 4,
                  }).map(
                    (
                      _,
                      index
                    ) => (
                      <Table.Row
                        key={index}
                      >
                        {Array.from(
                          {
                            length: 5,
                          }
                        ).map(
                          (
                            __,
                            cellIndex
                          ) => (
                            <Table.Cell
                              key={
                                cellIndex
                              }
                            >
                              <Skeleton
                                variant="text"
                                className="w-20"
                              />
                            </Table.Cell>
                          )
                        )}
                      </Table.Row>
                    )
                  )
                ) : recentCollections.length ===
                  0 ? (
                  <Table.Empty
                    colSpan={5}
                    icon={
                      <FiInbox
                        size={
                          28
                        }
                      />
                    }
                    title="No hay recolecciones recientes"
                    description="Registra una nueva recolección para comenzar."
                  />
                ) : (
                  recentCollections.map(
                    (
                      collection
                    ) => (
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

                        <Table.Cell>
                          <Badge variant="secondary">
                            {
                              collection.academicTermLabel
                            }
                          </Badge>
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

        <Card variant="outlined">
          <Card.Header className="border-b border-slate-100 p-5 dark:border-slate-700">
            <Card.Title>
              Acciones rápidas
            </Card.Title>

            <Card.Description className="mt-1">
              Continúa con las tareas
              más frecuentes.
            </Card.Description>
          </Card.Header>

          <Card.Body className="space-y-3 p-5">
            <QuickAction
              icon={FiPlus}
              title="Registrar recolección"
              description="Captura material y kilogramos."
              accent="emerald"
              onClick={() =>
                navigate(
                  "/collections"
                )
              }
            />

            <QuickAction
              icon={FiUsers}
              title="Gestionar participación"
              description="Capital humano y estadías."
              accent="violet"
              onClick={() =>
                navigate(
                  "/participation"
                )
              }
            />

            <QuickAction
              icon={FiBarChart2}
              title="Consultar reportes"
              description="Analiza tendencias y resultados."
              accent="sky"
              onClick={() =>
                navigate(
                  "/reports"
                )
              }
            />

            <QuickAction
              icon={
                isAdmin
                  ? FiSettings
                  : FiUser
              }
              title={
                isAdmin
                  ? "Configuración"
                  : "Mi perfil"
              }
              description={
                isAdmin
                  ? "Administra catálogos y periodos."
                  : "Consulta y actualiza tu cuenta."
              }
              accent="amber"
              onClick={() =>
                navigate(
                  isAdmin
                    ? "/settings"
                    : "/perfil"
                )
              }
            />
          </Card.Body>
        </Card>
      </section>
    </div>
  );
}

interface SectionHeadingProps {
  id: string;
  title: string;
  description: string;
}

function SectionHeading({
  id,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-4">
      <h2
        id={id}
        className="text-lg font-semibold text-slate-800 dark:text-white"
      >
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

interface CurrentTermCardProps {
  isLoading: boolean;

  data:
    | Awaited<
        ReturnType<
          typeof dashboardService.getSummary
        >
      >
    | null;

  isAdmin: boolean;
  onConfigure: () => void;
}

function CurrentTermCard({
  isLoading,
  data,
  isAdmin,
  onConfigure,
}: CurrentTermCardProps) {
  const currentTerm =
    data?.currentAcademicTerm;

  if (isLoading) {
    return (
      <Card variant="outlined">
        <Card.Body className="space-y-5 p-6">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-3 w-full" />

          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-24 w-full"
              />
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!currentTerm) {
    return (
      <Card variant="outlined">
        <Card.Body className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <FiCalendar
              size={26}
              aria-hidden="true"
            />
          </div>

          <h2 className="mt-4 font-semibold text-slate-900 dark:text-white">
            No hay un cuatrimestre
            actual
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Selecciona un periodo
            vigente para mostrar aquí
            su actividad,
            participación y avance
            temporal.
          </p>

          {isAdmin && (
            <Button
              className="mt-5"
              variant="secondary"
              leftIcon={
                <FiSettings
                  aria-hidden="true"
                />
              }
              onClick={
                onConfigure
              }
            >
              Configurar
              cuatrimestre
            </Button>
          )}
        </Card.Body>
      </Card>
    );
  }

  const progress =
    getTermProgress(
      currentTerm.startDate,
      currentTerm.endDate
    );

  return (
    <Card variant="outlined">
      <Card.Header className="border-b border-slate-100 p-5 dark:border-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Card.Title>
                Actividad del
                cuatrimestre
              </Card.Title>

              <Badge
                variant="success"
                dot
              >
                Actual
              </Badge>
            </div>

            <Card.Description className="mt-1">
              {currentTerm.label} ·{" "}
              {formatDate(
                currentTerm.startDate
              )}{" "}
              al{" "}
              {formatDate(
                currentTerm.endDate
              )}
            </Card.Description>
          </div>

          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {progress}%
            transcurrido
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </Card.Header>

      <Card.Body className="grid gap-4 p-5 sm:grid-cols-3">
        <TermMetric
          icon={FiPackage}
          label="Recolectado"
          value={formatKilograms(
            data
              ?.currentTermKilograms ??
              0
          )}
          accent="emerald"
        />

        <TermMetric
          icon={FiDatabase}
          label="Recolecciones"
          value={formatInteger(
            data
              ?.currentTermCollectionsCount ??
              0
          )}
          accent="sky"
        />

        <TermMetric
          icon={FiBriefcase}
          label="Participantes"
          value={formatInteger(
            data
              ?.currentTermParticipants ??
              0
          )}
          accent="violet"
        />
      </Card.Body>
    </Card>
  );
}

type AccentName =
  | "emerald"
  | "sky"
  | "violet"
  | "amber";

const accentClasses: Record<
  AccentName,
  string
> = {
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",

  sky:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",

  violet:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",

  amber:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

interface TermMetricProps {
  icon: IconType;
  label: string;
  value: string;
  accent: AccentName;
}

function TermMetric({
  icon: Icon,
  label,
  value,
  accent,
}: TermMetricProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentClasses[accent]}`}
      >
        <Icon aria-hidden="true" />
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

interface QuickActionProps {
  icon: IconType;
  title: string;
  description: string;
  accent: AccentName;
  onClick: () => void;
}

function QuickAction({
  icon: Icon,
  title,
  description,
  accent,
  onClick,
}: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-slate-700 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent]}`}
      >
        <Icon aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </span>

        <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </span>

      <FiArrowRight
        className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600"
        aria-hidden="true"
      />
    </button>
  );
}

interface EmptyDashboardStateProps {
  icon: IconType;
  title: string;
  description: string;
}

function EmptyDashboardState({
  icon: Icon,
  title,
  description,
}: EmptyDashboardStateProps) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center text-center">
      <div className="rounded-xl bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon
          size={22}
          aria-hidden="true"
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-white">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function formatDate(
  date: string
) {
  const [
    year,
    month,
    day,
  ] = date.split("-");

  return `${day}/${month}/${year}`;
}

function formatDateTime(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "No disponible";
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function formatKilograms(
  kilograms: number
) {
  return `${kilograms.toLocaleString(
    "es-MX",
    {
      maximumFractionDigits: 2,
    }
  )} kg`;
}

function formatInteger(
  value: number
) {
  return value.toLocaleString(
    "es-MX",
    {
      maximumFractionDigits: 0,
    }
  );
}

function getTermProgress(
  startDate: string,
  endDate: string
) {
  const start = new Date(
    `${startDate}T00:00:00`
  ).getTime();

  const end = new Date(
    `${endDate}T23:59:59`
  ).getTime();

  const now = Date.now();

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    end <= start
  ) {
    return 0;
  }

  const progress =
    ((now - start) /
      (end - start)) *
    100;

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(progress)
    )
  );
}