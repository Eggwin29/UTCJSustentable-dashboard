// src/pages/Dashboard/Dashboard.tsx

import ComponentSection from "@/components/ComponentSection/ComponentSection";

import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Badge from "@/components/ui/Badge/Badge";
import Spinner from "@/components/ui/spinner/Spinner";
import Input from "@/components/ui/input/Input";
import Dropdown from "@/components/ui/select/Dropdown";
import { useToast } from "@/components/ui/toast/toast";
import { useConfirmModal } from "@/components/ui/confirm-modal";
import Switch from "@/components/ui/switch/Switch"

import {
  FiMail,
  FiSearch,
  FiUser,
  FiDollarSign,
  FiGlobe,
  FiMapPin,
  FiFilter,
} from "react-icons/fi";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import HelpTooltip from "@/components/ui/tooltip/Tooltip";
import Textarea from "@/components/ui/textArea";
import Checkbox from "@/components/ui/checkbox/Checkbox";
import RadioGroup from "@/components/ui/radio/RadioGroup";
import { Table } from "@/components/ui/table";



const countryOptions = [
  { value: "mx", label: "México" },
  { value: "us", label: "Estados Unidos" },
  { value: "ca", label: "Canadá" },
  { value: "es", label: "España" },
];

const categoryOptions = [
  { value: "tech", label: "Tecnología" },
  { value: "design", label: "Diseño" },
  { value: "marketing", label: "Marketing" },
];

export default function DesignSystem() {
    const { toast } = useToast();
    const confirm = useConfirmModal();
  return (

    <div className="space-y-10">
      {/* =====================================
      HEADER
      ===================================== */}
      <section>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          UTCJ Sustentable Design System
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Catálogo visual de componentes utilizados en la aplicación.
        </p>
      </section>

      {/* =====================================
      BUTTON
      ===================================== */}
      <ComponentSection
        title="Button"
        description="Variantes disponibles del componente botón."
      >
        <div className="flex flex-wrap gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button>Guardar información</Button>
        </div>
      </ComponentSection>

      {/* =====================================
      BADGE
      ===================================== */}
      <ComponentSection
        title="Badge"
        description="Indicadores visuales de estados."
      >
        <div className="flex flex-wrap gap-4">
          <Badge variant="success">Activo</Badge>
          <Badge variant="danger" dot>
            Urgente
          </Badge>
          <Badge variant="warning" dot>
            Pendiente
          </Badge>
          <Badge variant="outline">Borrador</Badge>
          <Badge variant="success" size="sm">
            Pequeño
          </Badge>
        </div>
      </ComponentSection>

      {/* =====================================
      CARD
      ===================================== */}
      <ComponentSection
        title="Card"
        description="Contenedores principales de información."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Elevated */}
          <Card variant="elevated">
            <Card.Header>
              <Card.Title>Ventas mensuales</Card.Title>
              <Card.Description>Actualizado hoy</Card.Description>
            </Card.Header>
            <Card.Body>
              <p className="text-2xl font-bold">$45,200</p>
            </Card.Body>
          </Card>

          {/* Outlined */}
          <Card variant="outlined">
            <Card.Header>
              <Card.Title>Pedido #1024</Card.Title>
              <div className="mt-2">
                <Badge variant="warning" dot>
                  Pendiente
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-sm text-slate-600">Información del pedido.</p>
            </Card.Body>
          </Card>

          {/* Highlight */}
          <Card variant="highlight">
            <Card.Header>
              <Card.Title>Alerta importante</Card.Title>
              <Card.Description>Requiere atención.</Card.Description>
            </Card.Header>
          </Card>
        </div>
      </ComponentSection>

      {/* =====================================
      CARD WITH IMAGE
      ===================================== */}
      <ComponentSection
        title="Card con imagen"
        description="Ejemplo de tarjeta multimedia."
      >
        <div className="max-w-sm">
          <Card variant="outlined">
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title>Elemento destacado</Card.Title>
                <Badge variant="success">Nuevo</Badge>
              </div>
            </Card.Header>

            <Card.Image
              src="https://hips.hearstapps.com/hmg-prod/images/bunny-mellon-virginia-home-side-gardens-657382bf3fcae.jpg?crop=0.673xw:1.00xh;0.165xw,0&resize=1200:*"
              alt="Imagen ejemplo"
            />

            <Card.Body>
              <Card.Description>
                Card con imagen, contenido y footer.
              </Card.Description>
              <p className="mt-2 text-sm text-slate-600">
                Ejemplo de composición del componente.
              </p>
            </Card.Body>

            <Card.Footer>
              <Button>Ver detalles</Button>
            </Card.Footer>
          </Card>
        </div>
      </ComponentSection>

      {/* =====================================
      INPUT
      ===================================== */}
      <ComponentSection
        title="Input"
        description="Campos de formulario disponibles."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Input label="Outline" variant="outline" />
          <Input label="Filled" variant="filled" />
          <Input label="Underline" variant="underline" />
          <Input label="Correo electrónico" leftIcon={<FiMail />} type="email" />
          <Input label="Buscar" leftIcon={<FiSearch />} />
          <Input label="Usuario" leftIcon={<FiUser />} />
          <Input label="Monto" leftIcon={<FiDollarSign />} type="number" />
        </div>
      </ComponentSection>

      <ComponentSection
        title="Input - Estados y funcionalidades"
        description="Estados especiales y características adicionales."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Campo normal"
            helperText="Texto de ayuda para el usuario."
          />
          <Input
            label="Campo con error"
            error="Este campo es obligatorio"
            defaultValue="Valor inválido"
          />
          <Input
            label="Campo deshabilitado"
            disabled
            defaultValue="No editable"
          />
          <Input
            label="Nombre completo"
            clearable
            defaultValue="Edwin Martínez"
          />
          <Input
            label="Buscar usuario"
            leftIcon={<FiSearch />}
            clearable
            placeholder="Escribe para buscar"
          />
          <Input
            label="Contraseña"
            type="password"
            showPasswordToggle
            helperText="Mínimo 8 caracteres"
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            showPasswordToggle
            variant="filled"
          />
        </div>
      </ComponentSection>

      {/* =====================================
      SELECT / DROPDOWN
      ===================================== */}
      <ComponentSection
        title="Select"
        description="Campos de selección desplegables con soporte para variantes, iconos y label flotante."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Dropdown
            label="País (Outline)"
            variant="outline"
            options={countryOptions}
            placeholder="Selecciona un país"
          />

          <Dropdown
            label="País (Filled)"
            variant="filled"
            options={countryOptions}
            placeholder="Selecciona un país"
          />

          <Dropdown
            label="País (Underline)"
            variant="underline"
            options={countryOptions}
            placeholder="Selecciona un país"
          />

          <Dropdown
            label="Categoría"
            leftIcon={<FiFilter />}
            options={categoryOptions}
            placeholder="Filtrar por categoría"
          />

          <Dropdown
            label="Ubicación"
            leftIcon={<FiGlobe />}
            options={countryOptions}
            defaultValue="mx"
            helperText="Selecciona el país para calcular envíos."
          />

          <Dropdown
            label="Sede requerida"
            leftIcon={<FiMapPin />}
            options={countryOptions}
            error="Debes seleccionar una sede válida"
          />

          <Dropdown
            label="Región deshabilitada"
            options={countryOptions}
            disabled
            defaultValue="mx"
            helperText="Este campo no se puede editar."
          />
        </div>
      </ComponentSection>

      {/* =====================================
      LOGIN FORM EXAMPLE
      ===================================== */}
      <ComponentSection
        title="Formulario de ejemplo"
        description="Ejemplo de combinación de componentes."
      >
        <div className="max-w-md space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Iniciar sesión
          </h3>

          <Input
            label="Correo electrónico"
            type="email"
            leftIcon={<FiMail />}
            clearable
          />

          <Dropdown
            label="País de residencia"
            leftIcon={<FiGlobe />}
            options={countryOptions}
            placeholder="Selecciona tu país"
          />

          <Input label="Contraseña" type="password" showPasswordToggle />

          <Button className="w-full">Ingresar</Button>
        </div>
      </ComponentSection>

      {/* =====================================
      SPINNER
      ===================================== */}
      <ComponentSection
        title="Spinner"
        description="Indicadores de carga."
      >
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Small</p>
            <Spinner size="sm" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-500">Default</p>
            <Spinner />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-500">Large</p>
            <Spinner size="lg" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-500">Current</p>
            <Spinner color="current" />
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <p className="mb-2 text-sm text-white">White</p>
            <Spinner color="white" />
          </div>
        </div>
      </ComponentSection>

      {/* =====================================
      COMPOSITION EXAMPLES
      ===================================== */}
      <ComponentSection
        title="Component Composition"
        description="Ejemplos de componentes trabajando juntos."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* USER CARD */}
          <Card variant="outlined">
            <Card.Header>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                  EM
                </div>
                <div>
                  <Card.Title>Edwin Martínez</Card.Title>
                  <Card.Description>Administrador</Card.Description>
                </div>
              </div>
            </Card.Header>

            <Card.Body>
              <div className="flex gap-2">
                <Badge variant="success">Activo</Badge>
                <Badge variant="outline">Admin</Badge>
              </div>
            </Card.Body>

            <Card.Footer>
              <div className="flex gap-3">
                <Button>Editar</Button>
                <Button variant="danger">Eliminar</Button>
              </div>
            </Card.Footer>
          </Card>

          {/* STAT CARD */}
          <Card variant="highlight">
            <Card.Header>
              <Card.Title>Resumen</Card.Title>
            </Card.Header>

            <Card.Body>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Material reciclado</p>
                  <p className="text-3xl font-bold">2,450 kg</p>
                </div>
                <Badge variant="success">+12% este mes</Badge>
              </div>
            </Card.Body>
          </Card>
        </div>
      </ComponentSection>


      {/* =====================================
TOAST
===================================== */}
<ComponentSection
  title="Toast"
  description="Notificaciones flotantes por tipo de mensaje. Success se cierra solo a los 10s, el resto requiere cerrarse manualmente."
>
  <div className="flex flex-wrap gap-4">
    <Button
      onClick={() =>
        toast.success({
          title: "Success",
          description: "This is a success toast and will be dismissed after 10 seconds.",
        })
      }
    >
      Mostrar Success
    </Button>

    <Button
      variant="danger"
      onClick={() =>
        toast.error({
          title: "Error",
          description: "This is an error toast and must be dismissed by the user.",
        })
      }
    >
      Mostrar Error
    </Button>

    <Button
      variant="secondary"
      onClick={() =>
        toast.warning({
          title: "Warning",
          description: "This is a warning toast and must be dismissed by the user.",
        })
      }
    >
      Mostrar Warning
    </Button>

    <Button
      variant="secondary"
      onClick={() =>
        toast.info({
          title: "Informational",
          description: "This is an info toast and must be dismissed by the user.",
        })
      }
    >
      Mostrar Info
    </Button>
  </div>
</ComponentSection>

{/* =====================================
CONFIRM MODAL
===================================== */}
<ComponentSection
  title="Confirm Modal"
  description="Modal de confirmación reutilizable para operaciones que requieren aprobación del usuario."
>
  <div className="flex flex-wrap gap-4">
    <Button
      onClick={async () => {
        const confirmed = await confirm({
          title: "¿Seguro que quieres continuar?",
          description: "Esta acción actualizará la información del registro.",
        });

        if (confirmed) {
          toast.success({ title: "Confirmado", description: "La operación se realizó correctamente." });
        } else {
          toast.info({ title: "Cancelado", description: "No se realizó ningún cambio." });
        }
      }}
    >
      Confirmación estándar
    </Button>

    <Button
      variant="danger"
      onClick={async () => {
        const confirmed = await confirm({
          title: "¿Eliminar este registro?",
          description: "Esta acción no se puede deshacer.",
          confirmText: "Eliminar",
          variant: "danger",
        });

        if (confirmed) {
          toast.success({ title: "Eliminado", description: "El registro se eliminó correctamente." });
        } else {
          toast.info({ title: "Cancelado", description: "El registro no fue eliminado." });
        }
      }}
    >
      Confirmación destructiva
    </Button>
  </div>
</ComponentSection>

{/* =====================================
FORM CONTROLS
===================================== */}
<ComponentSection title="Checkbox, Radio & Switch" description="Controles de selección para formularios.">
  <div className="grid gap-6 md:grid-cols-3">
    <Checkbox label="Acepto los términos y condiciones" />
    <RadioGroup
      name="plan"
      label="Plan"
      options={[
        { value: "free", label: "Gratis" },
        { value: "pro", label: "Pro" },
      ]}
      defaultValue="free"
    />
    <Switch label="Notificaciones activas" defaultChecked />
  </div>
</ComponentSection>

<ComponentSection title="Textarea" description="Campo de texto multilínea.">
  <div className="max-w-md">
    <Textarea label="Comentarios" placeholder="Escribe aquí..." helperText="Máximo 500 caracteres." />
  </div>
</ComponentSection>

<ComponentSection title="Skeleton" description="Placeholder de carga.">
  <div className="flex items-center gap-4">
    <Skeleton variant="circle" className="h-12 w-12" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" className="w-1/3" />
      <Skeleton variant="text" className="w-2/3" />
    </div>
  </div>
</ComponentSection>

<ComponentSection title="Help Tooltip" description="Ícono de ayuda con explicación contextual al pasar el mouse.">
  <div className="flex items-center gap-1.5">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Material reciclado</span>
    <HelpTooltip content="Cantidad total de material procesado y reciclado este mes, medido en kilogramos." />
  </div>
</ComponentSection>

{/* =====================================
TABLE
===================================== */}
<ComponentSection title="Table" description="Estructura base para mostrar datos tabulares.">
  <Table>
    <Table.Head>
      <tr>
        <Table.HeaderCell>Material</Table.HeaderCell>
        <Table.HeaderCell>Categoría</Table.HeaderCell>
        <Table.HeaderCell align="right">Peso (kg)</Table.HeaderCell>
        <Table.HeaderCell align="center">Estado</Table.HeaderCell>
      </tr>
    </Table.Head>
    <Table.Body>
      <Table.Row clickable>
        <Table.Cell className="font-medium text-slate-800 dark:text-white">PET transparente</Table.Cell>
        <Table.Cell>Plástico</Table.Cell>
        <Table.Cell align="right">245.5</Table.Cell>
        <Table.Cell align="center">
          <Badge variant="success">Procesado</Badge>
        </Table.Cell>
      </Table.Row>
      <Table.Row clickable>
        <Table.Cell className="font-medium text-slate-800 dark:text-white">Cartón corrugado</Table.Cell>
        <Table.Cell>Papel</Table.Cell>
        <Table.Cell align="right">180.2</Table.Cell>
        <Table.Cell align="center">
          <Badge variant="warning" dot>Pendiente</Badge>
        </Table.Cell>
      </Table.Row>
      <Table.Row clickable>
        <Table.Cell className="font-medium text-slate-800 dark:text-white">Aluminio</Table.Cell>
        <Table.Cell>Metal</Table.Cell>
        <Table.Cell align="right">92.8</Table.Cell>
        <Table.Cell align="center">
          <Badge variant="outline">En tránsito</Badge>
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
</ComponentSection>

<ComponentSection title="Table - Estado vacío" description="Qué se muestra cuando no hay datos.">
  <Table>
    <Table.Head>
      <tr>
        <Table.HeaderCell>Material</Table.HeaderCell>
        <Table.HeaderCell>Categoría</Table.HeaderCell>
        <Table.HeaderCell align="right">Peso (kg)</Table.HeaderCell>
      </tr>
    </Table.Head>
    <Table.Body>
      <Table.Empty
        colSpan={3}
        title="Aún no hay registros"
        description="Los materiales que agregues aparecerán aquí."
      />
    </Table.Body>
  </Table>
</ComponentSection>



    </div>
  );
}