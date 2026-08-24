import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiActivity,
  FiFilter,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUsers,
  FiUserX,
  FiX,
} from "react-icons/fi";

import StatCard from "@/components/charts/StatCard";
import Avatar from "@/components/ui/avatar/Avatar";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConfirmModal } from "@/components/ui/confirm-modal";
import Input from "@/components/ui/input/Input";
import Pagination from "@/components/ui/pagination";
import Dropdown from "@/components/ui/select";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import Switch from "@/components/ui/switch/Switch";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast/toast";

import { useAuth } from "@/context/auth/useAuth";
import { usePagination } from "@/hooks/usePagination";

import { usersService } from "@/services/usersService";

import type {
  Profile,
  UserRole,
} from "@/types/profile";

type RoleFilter = "all" | UserRole;

type StatusFilter =
  | "all"
  | "active"
  | "inactive";

const roleOptions = [
  {
    value: "admin",
    label: "Administrador",
  },
  {
    value: "user",
    label: "Usuario",
  },
];

const roleFilterOptions = [
  {
    value: "all",
    label: "Todos los roles",
  },
  ...roleOptions,
];

const statusFilterOptions = [
  {
    value: "all",
    label: "Todos los estados",
  },
  {
    value: "active",
    label: "Activos",
  },
  {
    value: "inactive",
    label: "Inactivos",
  },
];

export default function Users() {
  const { user: currentUser } =
    useAuth();

  const confirm = useConfirmModal();
  const { toast } = useToast();

  const [users, setUsers] =
    useState<Profile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    updatingUserId,
    setUpdatingUserId,
  ] = useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState<RoleFilter>("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>("all");

  const loadUsers =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await usersService.getAll();

        setUsers(data);
      } catch (error) {
        console.error(
          "Error al cargar usuarios:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar los usuarios."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    let cancelled = false;

    usersService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setUsers(data);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Error al cargar usuarios:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar los usuarios."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      normalizeSearch(search);

    return users.filter((profile) => {
      const searchableName =
        normalizeSearch(
          getProfileName(profile)
        );

      const matchesSearch =
        !normalizedSearch ||
        searchableName.includes(
          normalizedSearch
        ) ||
        profile.id
          .toLocaleLowerCase("es")
          .includes(normalizedSearch);

      const matchesRole =
        roleFilter === "all" ||
        profile.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active"
          ? profile.active
          : !profile.active);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const summary = useMemo(
    () => ({
      total: users.length,

      active: users.filter(
        (profile) => profile.active
      ).length,

      inactive: users.filter(
        (profile) => !profile.active
      ).length,

      administrators: users.filter(
        (profile) =>
          profile.role === "admin" &&
          profile.active
      ).length,
    }),
    [users]
  );

  const {
    currentPage,
    pageSize,
    totalItems,
    paginatedItems: paginatedUsers,
    setCurrentPage,
    setPageSize,
    resetPage,
  } = usePagination(filteredUsers);

  const filtersAreActive =
    Boolean(search.trim()) ||
    roleFilter !== "all" ||
    statusFilter !== "all";

  const updateSearch = (
    value: string
  ) => {
    setSearch(value);
    resetPage();
  };

  const updateRoleFilter = (
    value: RoleFilter
  ) => {
    setRoleFilter(value);
    resetPage();
  };

  const updateStatusFilter = (
    value: StatusFilter
  ) => {
    setStatusFilter(value);
    resetPage();
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    resetPage();
  };

  const replaceUser = (
    updatedUser: Profile
  ) => {
    setUsers((current) =>
      current.map((profile) =>
        profile.id === updatedUser.id
          ? updatedUser
          : profile
      )
    );
  };

  const handleRoleChange = async (
    profile: Profile,
    nextRole: UserRole
  ) => {
    if (
      updatingUserId !== null ||
      profile.id === currentUser?.id ||
      profile.role === nextRole
    ) {
      return;
    }

    const confirmed = await confirm({
      title: "Cambiar rol del usuario",

      description:
        `¿Deseas cambiar a ${getProfileName(
          profile
        )} al rol ${getRoleLabel(
          nextRole
        )}?`,

      confirmText: "Cambiar rol",
      cancelText: "Cancelar",
    });

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(profile.id);

      const updatedUser =
        await usersService.updateAccess(
          profile.id,
          {
            role: nextRole,
            active: profile.active,
          }
        );

      replaceUser(updatedUser);

      toast.success({
        title: "Rol actualizado",

        description:
          `${getProfileName(
            profile
          )} ahora es ${getRoleLabel(
            nextRole
          )}.`,
      });
    } catch (error) {
      console.error(
        "Error al actualizar el rol:",
        error
      );

      toast.error({
        title:
          "No se pudo actualizar el rol",

        description:
          getUpdateErrorMessage(error),
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusChange = async (
    profile: Profile,
    nextActive: boolean
  ) => {
    if (
      updatingUserId !== null ||
      profile.id === currentUser?.id ||
      profile.active === nextActive
    ) {
      return;
    }

    const confirmed = await confirm({
      title: nextActive
        ? "Activar usuario"
        : "Desactivar usuario",

      description: nextActive
        ? `${getProfileName(
            profile
          )} recuperará el acceso al sistema.`
        : `${getProfileName(
            profile
          )} dejará de tener acceso al sistema.`,

      confirmText: nextActive
        ? "Activar"
        : "Desactivar",

      cancelText: "Cancelar",

      variant: nextActive
        ? "default"
        : "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(profile.id);

      const updatedUser =
        await usersService.updateAccess(
          profile.id,
          {
            role: profile.role,
            active: nextActive,
          }
        );

      replaceUser(updatedUser);

      toast.success({
        title: nextActive
          ? "Usuario activado"
          : "Usuario desactivado",

        description:
          `${getProfileName(
            profile
          )} fue actualizado correctamente.`,
      });
    } catch (error) {
      console.error(
        "Error al actualizar el estado:",
        error
      );

      toast.error({
        title:
          "No se pudo actualizar el estado",

        description:
          getUpdateErrorMessage(error),
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-7">
      <section
        className="
          relative overflow-hidden
          rounded-2xl border
          border-slate-200
          bg-linear-to-r
          from-white via-white
          to-violet-50/70
          p-6 shadow-sm
          dark:border-slate-700
          dark:from-slate-900
          dark:via-slate-900
          dark:to-violet-950/25
          sm:p-7
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute -right-14 -top-20
            h-48 w-48 rounded-full
            border-28
            border-violet-500/5
          "
        />

        <div
          className="
            relative flex flex-col gap-5
            sm:flex-row sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex h-13 w-13 shrink-0
                items-center justify-center
                rounded-2xl
                bg-violet-100
                text-2xl text-violet-700
                dark:bg-violet-900/40
                dark:text-violet-300
              "
            >
              <FiUsers aria-hidden="true" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="
                    text-2xl font-bold
                    text-slate-900
                    dark:text-white
                    sm:text-3xl
                  "
                >
                  Usuarios
                </h1>

                <Badge variant="warning">
                  <FiShield
                    aria-hidden="true"
                  />

                  Solo administradores
                </Badge>
              </div>

              <p
                className="
                  mt-2 max-w-2xl
                  text-sm leading-6
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Administra los roles y el
                acceso de las personas
                registradas en UTCJ
                Sustentable.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            leftIcon={
              <FiRefreshCw
                aria-hidden="true"
              />
            }
            onClick={() =>
              void loadUsers()
            }
            loading={loading}
            className="shrink-0"
          >
            Actualizar
          </Button>
        </div>
      </section>

      <section
        className="
          grid gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          label="Usuarios registrados"
          value={summary.total}
          isLoading={loading}
          accent="emerald"
          decimals={0}
          icon={
            <FiUsers aria-hidden="true" />
          }
          helper="Perfiles disponibles en el sistema"
        />

        <StatCard
          label="Usuarios activos"
          value={summary.active}
          isLoading={loading}
          accent="sky"
          decimals={0}
          icon={
            <FiUserCheck
              aria-hidden="true"
            />
          }
          helper="Cuentas con acceso habilitado"
        />

        <StatCard
          label="Usuarios inactivos"
          value={summary.inactive}
          isLoading={loading}
          accent="amber"
          decimals={0}
          icon={
            <FiUserX aria-hidden="true" />
          }
          helper="Cuentas que no pueden iniciar sesión"
        />

        <StatCard
          label="Administradores activos"
          value={summary.administrators}
          isLoading={loading}
          accent="violet"
          decimals={0}
          icon={
            <FiShield aria-hidden="true" />
          }
          helper="Personas con permisos de gestión"
        />
      </section>

      <Card variant="outlined">
        <Card.Header
          className="
            flex-row items-start
            justify-between gap-4
            border-b border-slate-100
            p-5
            dark:border-slate-800
          "
        >
          <div className="flex items-start gap-3">
            <span
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                bg-emerald-100
                text-emerald-700
                dark:bg-emerald-900/40
                dark:text-emerald-300
              "
            >
              <FiFilter aria-hidden="true" />
            </span>

            <div>
              <Card.Title>
                Buscar y filtrar
              </Card.Title>

              <Card.Description className="mt-1">
                Encuentra cuentas por nombre,
                identificador, rol o estado.
              </Card.Description>
            </div>
          </div>

          {filtersAreActive && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              leftIcon={
                <FiX aria-hidden="true" />
              }
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </Card.Header>

        <Card.Body
          className="
            grid gap-4 p-5
            md:grid-cols-[minmax(0,1fr)_220px_220px]
          "
        >
          <Input
            id="users-search"
            name="usersSearch"
            aria-label="Buscar usuarios"
            placeholder="Buscar por nombre o identificador..."
            leftIcon={
              <FiSearch
                aria-hidden="true"
              />
            }
            clearable
            value={search}
            onChange={(event) =>
              updateSearch(
                event.target.value
              )
            }
          />

          <Dropdown
            id="users-role-filter"
            options={roleFilterOptions}
            value={roleFilter}
            onChange={(value) =>
              updateRoleFilter(
                value as RoleFilter
              )
            }
          />

          <Dropdown
            id="users-status-filter"
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(value) =>
              updateStatusFilter(
                value as StatusFilter
              )
            }
          />
        </Card.Body>
      </Card>

      {errorMessage && (
        <Card
          variant="outlined"
          className="
            border-red-200
            dark:border-red-900
          "
        >
          <Card.Body
            className="
              flex flex-col gap-3 p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="flex gap-3">
              <FiActivity
                className="
                  mt-0.5 shrink-0
                  text-red-600
                  dark:text-red-400
                "
                aria-hidden="true"
              />

              <div>
                <p
                  className="
                    text-sm font-semibold
                    text-red-700
                    dark:text-red-400
                  "
                >
                  {errorMessage}
                </p>

                <p
                  className="
                    mt-1 text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Verifica la conexión con
                  Supabase e inténtalo de
                  nuevo.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void loadUsers()
              }
            >
              Reintentar
            </Button>
          </Card.Body>
        </Card>
      )}

      <Card variant="outlined">
        <Card.Header
          className="
            flex-row items-start
            justify-between gap-4
            border-b border-slate-100
            p-5
            dark:border-slate-800
          "
        >
          <div>
            <Card.Title>
              Directorio de usuarios
            </Card.Title>

            <Card.Description className="mt-1">
              Cambia el rol o estado de una
              cuenta desde su fila.
            </Card.Description>
          </div>

          <Badge variant="secondary">
            {filteredUsers.length.toLocaleString(
              "es-MX"
            )}

            {filteredUsers.length === 1
              ? " resultado"
              : " resultados"}
          </Badge>
        </Card.Header>

        <Table
          className="
            rounded-none
            border-x-0 border-b-0
            border-t-0
          "
        >
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>
                Usuario
              </Table.HeaderCell>

              <Table.HeaderCell>
                Rol
              </Table.HeaderCell>

              <Table.HeaderCell>
                Estado
              </Table.HeaderCell>

              <Table.HeaderCell>
                Registro
              </Table.HeaderCell>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {loading &&
              Array.from({
                length: 5,
              }).map((_, index) => (
                <Table.Row key={index}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Skeleton
                        variant="circle"
                        className="h-10 w-10"
                      />

                      <Skeleton
                        variant="text"
                        className="w-36"
                      />
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <Skeleton
                      variant="text"
                      className="w-32"
                    />
                  </Table.Cell>

                  <Table.Cell>
                    <Skeleton
                      variant="text"
                      className="w-24"
                    />
                  </Table.Cell>

                  <Table.Cell>
                    <Skeleton
                      variant="text"
                      className="w-28"
                    />
                  </Table.Cell>
                </Table.Row>
              ))}

            {!loading &&
              !errorMessage &&
              filteredUsers.length === 0 && (
                <Table.Empty
                  colSpan={4}
                  icon={
                    <FiUsers size={30} />
                  }
                  title="No se encontraron usuarios"
                  description="Prueba cambiando la búsqueda o los filtros seleccionados."
                />
              )}

            {!loading &&
              !errorMessage &&
              paginatedUsers.map(
                (profile) => {
                  const isCurrentUser =
                    profile.id ===
                    currentUser?.id;

                  const updatesLocked =
                    updatingUserId !== null;

                  return (
                    <Table.Row
                      key={profile.id}
                      clickable
                    >
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={getProfileName(
                              profile
                            )}
                            size="md"
                          />

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p
                                className="
                                  truncate font-medium
                                  text-slate-800
                                  dark:text-white
                                "
                              >
                                {getProfileName(
                                  profile
                                )}
                              </p>

                              {isCurrentUser && (
                                <Badge variant="outline">
                                  Tú
                                </Badge>
                              )}
                            </div>

                            <p
                              className="
                                mt-0.5 font-mono
                                text-xs text-slate-400
                                dark:text-slate-500
                              "
                            >
                              {profile.id.slice(
                                0,
                                8
                              )}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="min-w-44">
                        <Dropdown
                          id={`user-role-${profile.id}`}
                          size="sm"
                          options={roleOptions}
                          value={profile.role}
                          disabled={
                            isCurrentUser ||
                            updatesLocked
                          }
                          onChange={(value) => {
                            if (
                              value === "admin" ||
                              value === "user"
                            ) {
                              void handleRoleChange(
                                profile,
                                value
                              );
                            }
                          }}
                        />
                      </Table.Cell>

                      <Table.Cell className="min-w-44">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={
                              profile.active
                            }
                            disabled={
                              isCurrentUser ||
                              updatesLocked
                            }
                            onChange={(checked) =>
                              void handleStatusChange(
                                profile,
                                checked
                              )
                            }
                          />

                          <Badge
                            variant={
                              profile.active
                                ? "success"
                                : "danger"
                            }
                            dot
                          >
                            {profile.active
                              ? "Activo"
                              : "Inactivo"}
                          </Badge>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap">
                        {formatDate(
                          profile.createdAt
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                }
              )}
          </Table.Body>
        </Table>

        {!loading &&
          !errorMessage && (
            <Card.Body
              className="
                border-t
                border-slate-100
                p-4
                dark:border-slate-800
              "
            >
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
                className="
                  mt-0 border-0
                  bg-slate-50
                  shadow-none
                  dark:bg-slate-950/40
                "
              />
            </Card.Body>
          )}
      </Card>

      <div
        className="
          flex gap-3 rounded-xl
          border border-slate-200
          bg-slate-50 p-4
          text-slate-600
          dark:border-slate-700
          dark:bg-slate-900
          dark:text-slate-300
        "
      >
        <FiInfo
          className="
            mt-0.5 shrink-0
            text-slate-500
            dark:text-slate-400
          "
          aria-hidden="true"
        />

        <p className="text-xs leading-5">
          Por seguridad, no puedes modificar
          tu propio rol ni desactivar tu
          cuenta desde este módulo. Los
          usuarios aparecen aquí después de
          completar su registro en el
          sistema.
        </p>
      </div>
    </div>
  );
}

function getProfileName(
  profile: Profile
): string {
  const name =
    `${profile.firstName} ${profile.lastName}`.trim();

  return name || "Usuario sin nombre";
}

function getRoleLabel(
  role: UserRole
): string {
  return role === "admin"
    ? "Administrador"
    : "Usuario";
}

function normalizeSearch(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(
  date: string
): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(date));
}

function getUpdateErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Inténtalo nuevamente.";
}