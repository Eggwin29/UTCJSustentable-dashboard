import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FiRefreshCw,
  FiSearch,
  FiUsers,
} from "react-icons/fi";

import Avatar from "@/components/ui/avatar/Avatar";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input/Input";
import Dropdown from "@/components/ui/select";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import Switch from "@/components/ui/switch/Switch";
import { Table } from "@/components/ui/table";

import { useConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast/toast";
import { useAuth } from "@/context/auth/useAuth";
import { usersService } from "@/services/usersService";

import type {
  Profile,
  UserRole,
} from "@/types/profile";

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | "active" | "inactive";

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "user", label: "Usuario" },
];

const roleFilterOptions = [
  { value: "all", label: "Todos los roles" },
  ...roleOptions,
];

const statusFilterOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

export default function Users() {
  const { user: currentUser } = useAuth();
  const confirm = useConfirmModal();
  const { toast } = useToast();

  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [updatingUserId, setUpdatingUserId] = useState<
    string | null
  >(null);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("all");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const loadUsers = useCallback(async () => {
  try {
    setLoading(true);
    setErrorMessage("");

    const data = await usersService.getAll();

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
      if (cancelled) {
        return;
      }

      setUsers(data);
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
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase("es");

    return users.filter((profile) => {
      const fullName = getProfileName(profile)
        .toLocaleLowerCase("es");

      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch);

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

  const activeUsers = users.filter(
    (profile) => profile.active
  ).length;

  const adminUsers = users.filter(
    (profile) =>
      profile.role === "admin" &&
      profile.active
  ).length;

  const replaceUser = (updatedUser: Profile) => {
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
      description: `¿Deseas cambiar a ${getProfileName(
        profile
      )} al rol ${getRoleLabel(nextRole)}?`,
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
        description: `${getProfileName(
          profile
        )} ahora es ${getRoleLabel(nextRole)}.`,
      });
    } catch (error) {
      console.error(
        "Error al actualizar el rol:",
        error
      );

      toast.error({
        title: "No se pudo actualizar el rol",
        description: getUpdateErrorMessage(error),
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

        description: `${getProfileName(
          profile
        )} fue actualizado correctamente.`,
      });
    } catch (error) {
      console.error(
        "Error al actualizar el estado:",
        error
      );

      toast.error({
        title: "No se pudo actualizar el estado",
        description: getUpdateErrorMessage(error),
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Usuarios
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administra los roles y el acceso de los usuarios.
          </p>
        </div>

        <Button
          variant="outline"
          leftIcon={<FiRefreshCw />}
          onClick={() => void loadUsers()}
          loading={loading}
        >
          Actualizar
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Usuarios registrados"
          value={users.length}
        />

        <SummaryCard
          label="Usuarios activos"
          value={activeUsers}
        />

        <SummaryCard
          label="Administradores activos"
          value={adminUsers}
        />
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-[minmax(0,1fr)_220px_220px]">
        <Input
          aria-label="Buscar usuarios"
          placeholder="Buscar por nombre..."
          leftIcon={<FiSearch />}
          clearable
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <Dropdown
          options={roleFilterOptions}
          value={roleFilter}
          onChange={(value) =>
            setRoleFilter(value as RoleFilter)
          }
        />

        <Dropdown
          options={statusFilterOptions}
          value={statusFilter}
          onChange={(value) =>
            setStatusFilter(value as StatusFilter)
          }
        />
      </section>

      {errorMessage && (
        <section className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/60 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">
            {errorMessage}
          </p>

          <Button
            size="sm"
            variant="outline"
            onClick={() => void loadUsers()}
          >
            Reintentar
          </Button>
        </section>
      )}

      <Table>
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
            Array.from({ length: 5 }).map(
              (_, index) => (
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
              )
            )}

          {!loading &&
            !errorMessage &&
            filteredUsers.length === 0 && (
              <Table.Empty
                colSpan={4}
                icon={<FiUsers size={30} />}
                title="No se encontraron usuarios"
                description="Prueba cambiando la búsqueda o los filtros seleccionados."
              />
            )}

          {!loading &&
            !errorMessage &&
            filteredUsers.map((profile) => {
              const isCurrentUser =
                profile.id === currentUser?.id;

              const updatesLocked =
                updatingUserId !== null;

              return (
                <Table.Row key={profile.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={getProfileName(profile)}
                        size="md"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium text-slate-800 dark:text-white">
                            {getProfileName(profile)}
                          </p>

                          {isCurrentUser && (
                            <Badge variant="outline">
                              Tú
                            </Badge>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {profile.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </Table.Cell>

                  <Table.Cell className="min-w-44">
                    <Dropdown
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
                        checked={profile.active}
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
                    {formatDate(profile.createdAt)}
                  </Table.Cell>
                </Table.Row>
              );
            })}
        </Table.Body>
      </Table>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Por seguridad, no puedes modificar tu propio rol ni
        desactivar tu cuenta desde este módulo.
      </p>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
}

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function getProfileName(profile: Profile): string {
  const name =
    `${profile.firstName} ${profile.lastName}`.trim();

  return name || "Usuario sin nombre";
}

function getRoleLabel(role: UserRole): string {
  return role === "admin"
    ? "Administrador"
    : "Usuario";
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
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