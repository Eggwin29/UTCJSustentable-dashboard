import type {
  UserRole,
} from "@/types/profile";

export type GlobalSearchCategory =
  | "Navegación"
  | "Reportes"
  | "Participación"
  | "Administración";

export interface GlobalSearchItem {
  id: string;
  title: string;
  description: string;
  path: string;
  hash?: string;
  category: GlobalSearchCategory;
  keywords: string[];
  roles?: UserRole[];
}

export const GLOBAL_SEARCH_ITEMS:
  GlobalSearchItem[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      description:
        "Resumen general de UTCJ Sustentable.",
      path: "/",
      category: "Navegación",
      keywords: [
        "inicio",
        "resumen",
        "indicadores",
        "panel",
      ],
    },
    {
      id: "collections",
      title: "Colecciones",
      description:
        "Registro e historial de residuos recolectados.",
      path: "/collections",
      category: "Navegación",
      keywords: [
        "recolecciones",
        "residuos",
        "kilogramos",
        "materiales",
      ],
    },
    {
      id: "participation-human-capital",
      title: "Capital humano",
      description:
        "Registro de participación por turno y cuatrimestre.",
      path: "/participation",
      hash: "capital-humano",
      category: "Participación",
      keywords: [
        "personal",
        "tm martes",
        "tv jueves",
        "asistencia",
      ],
    },
    {
      id: "participation-internships",
      title: "Capital estadías",
      description:
        "Participación de estadías por carrera y nivel.",
      path: "/participation",
      hash: "capital-estadias",
      category: "Participación",
      keywords: [
        "estadias",
        "estadías",
        "practicas",
        "carreras",
        "participantes",
      ],
    },
    {
      id: "reports",
      title: "Reportes",
      description:
        "Indicadores, gráficas y resultados históricos.",
      path: "/reports",
      category: "Navegación",
      keywords: [
        "graficas",
        "gráficas",
        "estadisticas",
        "estadísticas",
        "resultados",
      ],
    },
    {
      id: "report-filters",
      title: "Filtros del reporte",
      description:
        "Selecciona periodos, años y cuatrimestres.",
      path: "/reports",
      hash: "filtros-reportes",
      category: "Reportes",
      keywords: [
        "filtrar",
        "periodos",
        "años",
        "cuatrimestres",
        "incluir",
        "excluir",
      ],
    },
    {
      id: "report-materials-recycled",
      title: "Materiales reciclados",
      description:
        "Total histórico recolectado por tipo de material.",
      path: "/reports",
      hash: "materiales-reciclados",
      category: "Reportes",
      keywords: [
        "carton",
        "cartón",
        "plastico",
        "plástico",
        "papel",
        "aluminio",
        "residuos",
      ],
    },
    {
      id: "report-year-distribution",
      title:
        "Distribución de recolección por año",
      description:
        "Porcentaje de material recolectado en cada año.",
      path: "/reports",
      hash:
        "distribucion-recoleccion-anual",
      category: "Reportes",
      keywords: [
        "distribucion",
        "distribución",
        "porcentaje",
        "años",
        "recoleccion",
      ],
    },
    {
      id:
        "report-waste-by-year-material",
      title:
        "Recolección por año y material",
      description:
        "Desglose anual de cada material reciclado.",
      path: "/reports",
      hash:
        "recoleccion-anual-material",
      category: "Reportes",
      keywords: [
        "residuos por año",
        "material por año",
        "historico",
        "histórico",
      ],
    },
    {
      id: "report-co2-year",
      title: "CO₂ evitado por año",
      description:
        "Impacto ambiental acumulado por año.",
      path: "/reports",
      hash: "co2-evitado-anual",
      category: "Reportes",
      keywords: [
        "co2",
        "co₂",
        "emisiones",
        "ambiental",
        "carbono",
      ],
    },
    {
      id:
        "report-environmental-impact",
      title:
        "Impacto ambiental por material",
      description:
        "Kilogramos recolectados y CO₂ evitado por material.",
      path: "/reports",
      hash:
        "impacto-ambiental-material",
      category: "Reportes",
      keywords: [
        "impacto ambiental",
        "co2 por material",
        "co₂",
        "emisiones evitadas",
        "reciclaje",
      ],
    },
    {
      id: "report-human-capital",
      title:
        "Reporte de Capital humano",
      description:
        "Gráficas de asistencia por turno y periodo.",
      path: "/reports",
      hash:
        "reporte-capital-humano",
      category: "Reportes",
      keywords: [
        "personal",
        "asistencia",
        "turnos",
        "tm",
        "tv",
      ],
    },
    {
      id:
        "report-personal-shift-term",
      title:
        "Personal por turno y cuatrimestre",
      description:
        "Comparación de TM y TV por periodo académico.",
      path: "/reports",
      hash:
        "personal-turno-cuatrimestre",
      category: "Reportes",
      keywords: [
        "capital humano",
        "tm martes",
        "tv jueves",
        "personal",
      ],
    },
    {
      id:
        "report-personal-total-shift",
      title:
        "Personal total por turno",
      description:
        "Distribución acumulada entre TM y TV.",
      path: "/reports",
      hash:
        "personal-total-turno",
      category: "Reportes",
      keywords: [
        "capital humano",
        "turno matutino",
        "turno vespertino",
      ],
    },
    {
      id:
        "report-personal-total-term",
      title:
        "Personal total por cuatrimestre",
      description:
        "Participación acumulada por periodo académico.",
      path: "/reports",
      hash:
        "personal-total-cuatrimestre",
      category: "Reportes",
      keywords: [
        "capital humano",
        "periodos",
        "cuatrimestres",
      ],
    },
    {
      id: "report-internships",
      title:
        "Reporte de Capital estadías",
      description:
        "Indicadores y gráficas de participación en estadías.",
      path: "/reports",
      hash:
        "reporte-capital-estadias",
      category: "Reportes",
      keywords: [
        "estadias",
        "estadías",
        "carreras",
        "nivel academico",
        "participacion",
      ],
    },
    {
      id:
        "report-internships-career",
      title:
        "Participación por carrera",
      description:
        "Participantes de estadías agrupados por carrera.",
      path: "/reports",
      hash: "estadias-por-carrera",
      category: "Reportes",
      keywords: [
        "estadias",
        "carreras",
        "programas academicos",
      ],
    },
    {
      id:
        "report-internships-level",
      title:
        "Participación por nivel",
      description:
        "Distribución de estadías entre TSU y Licenciatura.",
      path: "/reports",
      hash: "estadias-por-nivel",
      category: "Reportes",
      keywords: [
        "tsu",
        "licenciatura",
        "nivel academico",
        "estadias",
      ],
    },
    {
      id:
        "report-internships-term",
      title:
        "Participación por cuatrimestre",
      description:
        "Evolución de la participación registrada en estadías.",
      path: "/reports",
      hash:
        "estadias-por-cuatrimestre",
      category: "Reportes",
      keywords: [
        "estadias",
        "periodos",
        "evolucion",
        "evolución",
      ],
    },
    {
      id:
        "report-material-summary",
      title:
        "Resumen de materiales",
      description:
        "Tabla detallada de materiales incluidos en el reporte.",
      path: "/reports",
      hash: "resumen-materiales",
      category: "Reportes",
      keywords: [
        "tabla",
        "detalle",
        "kilogramos",
        "co2",
        "residuos",
      ],
    },
    {
      id: "users",
      title:
        "Administrar usuarios",
      description:
        "Consulta usuarios, roles y estados de acceso.",
      path: "/users",
      category: "Administración",
      keywords: [
        "usuarios",
        "roles",
        "permisos",
        "accesos",
        "cuentas",
      ],
      roles: ["admin"],
    },
    {
      id: "settings-materials",
      title:
        "Gestionar materiales",
      description:
        "Administra materiales, factores de CO₂ y disponibilidad.",
      path: "/settings",
      hash:
        "configuracion-materiales",
      category: "Administración",
      keywords: [
        "materiales",
        "factores",
        "co2",
        "activar",
        "desactivar",
      ],
      roles: ["admin"],
    },
    {
      id: "settings-programs",
      title:
        "Gestionar carreras",
      description:
        "Administra los programas académicos disponibles.",
      path: "/settings",
      hash:
        "configuracion-carreras",
      category: "Administración",
      keywords: [
        "carreras",
        "programas academicos",
        "estadias",
      ],
      roles: ["admin"],
    },
    {
      id: "settings-terms",
      title:
        "Gestionar cuatrimestres",
      description:
        "Administra periodos académicos y el cuatrimestre actual.",
      path: "/settings",
      hash:
        "configuracion-cuatrimestres",
      category: "Administración",
      keywords: [
        "cuatrimestres",
        "periodos",
        "fechas",
        "actual",
      ],
      roles: ["admin"],
    },
  ];