import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import type {
  User,
} from "@supabase/supabase-js";

import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiKey,
  FiLock,
  FiMail,
  FiSave,
  FiShield,
  FiUser,
} from "react-icons/fi";

import Avatar from "@/components/ui/avatar/Avatar";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Input from "@/components/ui/input/Input";

import {
  useToast,
} from "@/components/ui/toast/toast";

import {
  useAuth,
} from "@/context/auth/useAuth";

import {
  authService,
} from "@/services/authService";

import {
  profileService,
} from "@/services/profileService";

import type {
  Profile as ProfileData,
} from "@/types/profile";

interface ProfileContentProps {
  user: User;
  profile: ProfileData;
  replaceProfile: (
    profile: ProfileData
  ) => void;
}

export default function Profile() {
  const {
    user,
    profile,
    profileLoading,
    profileError,
    replaceProfile,
  } = useAuth();

  if (profileLoading) {
    return <ProfileSkeleton />;
  }

  if (
    !user ||
    !profile ||
    profileError
  ) {
    return (
      <div className="space-y-6">
        <PageHeader />

        <Card variant="outlined">
          <Card.Body className="flex min-h-52 flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-red-50 p-3 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <FiUser
                size={24}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                No se pudo cargar tu perfil
              </h2>

              <p className="mt-1 max-w-lg text-sm text-slate-500 dark:text-slate-400">
                {profileError?.message ??
                  "La información de la cuenta no está disponible en este momento."}
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                window.location.reload()
              }
            >
              Volver a intentar
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <ProfileContent
      key={`${profile.id}-${profile.firstName}-${profile.lastName}`}
      user={user}
      profile={profile}
      replaceProfile={
        replaceProfile
      }
    />
  );
}

function ProfileContent({
  user,
  profile,
  replaceProfile,
}: ProfileContentProps) {
  const { toast } = useToast();

  const [
    firstName,
    setFirstName,
  ] = useState(
    profile.firstName
  );

  const [
    lastName,
    setLastName,
  ] = useState(
    profile.lastName
  );

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const fullName =
    `${profile.firstName} ${profile.lastName}`.trim() ||
    user.email ||
    "Usuario";

  const normalizedFirstName =
    firstName.trim();

  const normalizedLastName =
    lastName.trim();

  const profileChanged =
    normalizedFirstName !==
      profile.firstName ||
    normalizedLastName !==
      profile.lastName;

  const handleProfileSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        !normalizedFirstName ||
        !normalizedLastName
      ) {
        toast.error({
          title:
            "Datos incompletos",
          description:
            "El nombre y los apellidos son obligatorios.",
        });

        return;
      }

      if (!profileChanged) {
        return;
      }

      try {
        setSavingProfile(true);

        const updatedProfile =
          await profileService.updateOwn(
            profile.id,
            {
              firstName:
                normalizedFirstName,
              lastName:
                normalizedLastName,
            }
          );

        replaceProfile(
          updatedProfile
        );

        toast.success({
          title:
            "Perfil actualizado",
          description:
            "Tus datos personales se guardaron correctamente.",
        });
      } catch (error) {
        console.error(
          "Error al actualizar el perfil:",
          error
        );

        toast.error({
          title:
            "No se pudo actualizar el perfil",
          description:
            getErrorMessage(
              error,
              "Revisa los datos e inténtalo nuevamente."
            ),
        });
      } finally {
        setSavingProfile(false);
      }
    };

  const handlePasswordSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (!user.email) {
        toast.error({
          title:
            "Correo no disponible",
          description:
            "No fue posible identificar el correo de tu cuenta.",
        });

        return;
      }

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        toast.error({
          title:
            "Datos incompletos",
          description:
            "Completa los tres campos de contraseña.",
        });

        return;
      }

      if (
        newPassword.length < 8
      ) {
        toast.error({
          title:
            "Contraseña demasiado corta",
          description:
            "La nueva contraseña debe tener al menos 8 caracteres.",
        });

        return;
      }

      if (
        newPassword ===
        currentPassword
      ) {
        toast.error({
          title:
            "Usa una contraseña diferente",
          description:
            "La nueva contraseña no puede ser igual a la actual.",
        });

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        toast.error({
          title:
            "Las contraseñas no coinciden",
          description:
            "Confirma nuevamente la nueva contraseña.",
        });

        return;
      }

      try {
        setChangingPassword(true);

        await authService.changePassword(
          user.email,
          currentPassword,
          newPassword
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        toast.success({
          title:
            "Contraseña actualizada",
          description:
            "Tu nueva contraseña ya está activa.",
        });
      } catch (error) {
        console.error(
          "Error al cambiar la contraseña:",
          error
        );

        toast.error({
          title:
            "No se pudo cambiar la contraseña",
          description:
            getErrorMessage(
              error,
              "Verifica tu contraseña actual e inténtalo nuevamente."
            ),
        });
      } finally {
        setChangingPassword(
          false
        );
      }
    };

  return (
    <div className="space-y-6">
      <PageHeader />

      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-sm dark:border-emerald-800">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar
              name={fullName}
              size="xl"
              className="ring-4 ring-white/25 shadow-lg"
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-bold">
                  {fullName}
                </h2>

                <Badge
                  variant="outline"
                  className="border-white/40 bg-white/15 text-white"
                >
                  {getRoleLabel(
                    profile.role
                  )}
                </Badge>
              </div>

              <p className="mt-1 flex items-center gap-2 text-sm text-emerald-50">
                <FiMail aria-hidden="true" />

                <span className="truncate">
                  {user.email ??
                    "Sin correo registrado"}
                </span>
              </p>
            </div>
          </div>

          <Badge
            variant={
              profile.active
                ? "success"
                : "danger"
            }
            size="md"
            dot
            className="shrink-0"
          >
            {profile.active
              ? "Cuenta activa"
              : "Cuenta inactiva"}
          </Badge>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-6">
          <Card variant="outlined">
            <Card.Header className="border-b border-slate-100 p-5 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <FiUser
                    size={20}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Información personal
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Estos datos identifican
                    tu cuenta dentro del
                    sistema.
                  </p>
                </div>
              </div>
            </Card.Header>

            <form
              onSubmit={
                handleProfileSubmit
              }
            >
              <Card.Body className="grid gap-5 p-5 md:grid-cols-2">
                <Input
                  id="profile-first-name"
                  name="firstName"
                  label="Nombre"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(
                      event.target.value
                    )
                  }
                  autoComplete="given-name"
                  maxLength={80}
                  leftIcon={
                    <FiUser aria-hidden="true" />
                  }
                  disabled={
                    savingProfile
                  }
                />

                <Input
                  id="profile-last-name"
                  name="lastName"
                  label="Apellidos"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(
                      event.target.value
                    )
                  }
                  autoComplete="family-name"
                  maxLength={120}
                  leftIcon={
                    <FiUser aria-hidden="true" />
                  }
                  disabled={
                    savingProfile
                  }
                />

                <div className="md:col-span-2">
                  <Input
                    id="profile-email"
                    name="email"
                    type="email"
                    label="Correo electrónico"
                    value={
                      user.email ?? ""
                    }
                    helperText="El correo es la identidad de acceso y no puede modificarse desde esta pantalla."
                    leftIcon={
                      <FiMail aria-hidden="true" />
                    }
                    autoComplete="email"
                    disabled
                  />
                </div>
              </Card.Body>

              <Card.Footer className="justify-end border-t border-slate-100 p-5 dark:border-slate-700">
                <Button
                  type="submit"
                  leftIcon={
                    <FiSave aria-hidden="true" />
                  }
                  loading={
                    savingProfile
                  }
                  disabled={
                    !profileChanged ||
                    !normalizedFirstName ||
                    !normalizedLastName
                  }
                >
                  Guardar cambios
                </Button>
              </Card.Footer>
            </form>
          </Card>

          <Card variant="outlined">
            <Card.Header className="border-b border-slate-100 p-5 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-sky-100 p-2.5 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                  <FiKey
                    size={20}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Seguridad
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Confirma tu contraseña
                    actual antes de
                    establecer una nueva.
                  </p>
                </div>
              </div>
            </Card.Header>

            <form
              onSubmit={
                handlePasswordSubmit
              }
            >
              <Card.Body className="space-y-5 p-5">
                <Input
                  id="profile-current-password"
                  name="currentPassword"
                  type="password"
                  label="Contraseña actual"
                  value={
                    currentPassword
                  }
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  leftIcon={
                    <FiLock aria-hidden="true" />
                  }
                  showPasswordToggle
                  disabled={
                    changingPassword
                  }
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    id="profile-new-password"
                    name="newPassword"
                    type="password"
                    label="Nueva contraseña"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    helperText="Utiliza al menos 8 caracteres."
                    leftIcon={
                      <FiKey aria-hidden="true" />
                    }
                    showPasswordToggle
                    minLength={8}
                    disabled={
                      changingPassword
                    }
                  />

                  <Input
                    id="profile-confirm-password"
                    name="confirmPassword"
                    type="password"
                    label="Confirmar contraseña"
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    leftIcon={
                      <FiCheckCircle aria-hidden="true" />
                    }
                    showPasswordToggle
                    minLength={8}
                    disabled={
                      changingPassword
                    }
                  />
                </div>
              </Card.Body>

              <Card.Footer className="justify-end border-t border-slate-100 p-5 dark:border-slate-700">
                <Button
                  type="submit"
                  leftIcon={
                    <FiKey aria-hidden="true" />
                  }
                  loading={
                    changingPassword
                  }
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  Cambiar contraseña
                </Button>
              </Card.Footer>
            </form>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card variant="outlined">
            <Card.Header className="border-b border-slate-100 p-5 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  <FiShield
                    size={20}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Información de la cuenta
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Datos administrativos
                    y actividad de acceso.
                  </p>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="divide-y divide-slate-100 p-5 dark:divide-slate-700">
              <AccountInformationRow
                icon={
                  <FiShield aria-hidden="true" />
                }
                label="Rol"
                value={getRoleLabel(
                  profile.role
                )}
                helper="Solo un administrador puede modificarlo."
              />

              <AccountInformationRow
                icon={
                  <FiCheckCircle aria-hidden="true" />
                }
                label="Estado"
                value={
                  profile.active
                    ? "Activo"
                    : "Inactivo"
                }
                helper="Controlado por la administración."
              />

              <AccountInformationRow
                icon={
                  <FiCalendar aria-hidden="true" />
                }
                label="Miembro desde"
                value={formatDate(
                  profile.createdAt
                )}
              />

              <AccountInformationRow
                icon={
                  <FiClock aria-hidden="true" />
                }
                label="Último acceso"
                value={formatDateTime(
                  user.last_sign_in_at
                )}
              />

              <AccountInformationRow
                icon={
                  <FiMail aria-hidden="true" />
                }
                label="Correo verificado"
                value={
                  user.email_confirmed_at
                    ? "Sí"
                    : "Pendiente"
                }
              />
            </Card.Body>
          </Card>

          <Card
            variant="flat"
            className="border border-dashed border-slate-200 dark:border-slate-700"
          >
            <Card.Body className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Identificador de la cuenta
              </p>

              <p className="mt-2 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                {profile.id}
              </p>

              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Este identificador es
                interno y no se puede
                modificar.
              </p>
            </Card.Body>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <header>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        Mi perfil
      </h1>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Consulta y administra la
        información personal y la
        seguridad de tu cuenta.
      </p>
    </header>
  );
}

function ProfileSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Cargando perfil"
    >
      <PageHeader />

      <div className="h-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

interface AccountInformationRowProps {
  icon: ReactNode;
  label: string;
  value: string;
  helper?: string;
}

function AccountInformationRow({
  icon,
  label,
  value,
  helper,
}: AccountInformationRowProps) {
  return (
    <div className="flex gap-3 py-4 first:pt-0 last:pb-0">
      <span className="mt-0.5 text-slate-400 dark:text-slate-500">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
          {value}
        </p>

        {helper && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
}

function getRoleLabel(
  role: ProfileData["role"]
) {
  return role === "admin"
    ? "Administrador"
    : "Usuario";
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "No disponible";
  }

  const date = new Date(value);

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
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function formatDateTime(
  value?: string | null
) {
  if (!value) {
    return "No disponible";
  }

  const date = new Date(value);

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

function getErrorMessage(
  error: unknown,
  fallback: string
) {
  return error instanceof Error &&
    error.message
    ? error.message
    : fallback;
}