import type { ResourceSummary } from "../types/resource-extended.ts";
import type { RatingSummary } from "../types/social.ts";
import type { Collection } from "../types/collection-extended.ts";
import type {
  DashboardSummary,
  PublicUserProfile,
} from "../types/user-extended.ts";

// ---------------------------------------------------------------------------
// 12 sample resources
// ---------------------------------------------------------------------------

export const MOCK_RESOURCES: ResourceSummary[] = [
  {
    id: "res-01",
    slug: "sistemas-ia-etica-aplicaciones-aula",
    title: "Sistemas de Inteligencia Artificial: Etica y Aplicaciones en el Aula",
    description: "Secuencia didactica que explora los fundamentos eticos de la inteligencia artificial y sus aplicaciones practicas en contextos educativos de bachillerato.",
    resourceType: "secuencia-didactica",
    language: "es",
    license: "cc-by-nc-sa",
    author: "Dra. Elena Martinez O.",
    thumbnailUrl: null,
    rating: { average: 4.7, count: 5 },
    favoriteCount: 8,
    editorialStatus: "published",
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "res-03",
    slug: "como-funciona-bot-taller-robotica",
    title: "¿Como funciona un Bot? Taller Practico de Robotica",
    description: "Actividad interactiva donde el alumnado de secundaria construye y programa un bot sencillo.",
    resourceType: "actividad-interactiva",
    language: "es",
    license: "cc-by",
    author: "INTEF Oficial",
    thumbnailUrl: null,
    rating: { average: 4.3, count: 4 },
    favoriteCount: 3,
    editorialStatus: "published",
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "res-07",
    slug: "matematicas-divertidas-algoritmos-visuales",
    title: "Matematicas Divertidas con Algoritmos Visuales",
    description: "Actividades interactivas con representaciones visuales de algoritmos para primaria.",
    resourceType: "actividad-interactiva",
    language: "es",
    license: "cc-by-nc-sa",
    author: "Marta Segovia",
    thumbnailUrl: null,
    rating: { average: 4.5, count: 4 },
    favoriteCount: 5,
    editorialStatus: "published",
    createdAt: "2025-09-20T10:00:00Z",
  },
  {
    id: "res-17",
    slug: "aprendizaje-basado-proyectos-guia",
    title: "Aprendizaje Basado en Proyectos: Guia Completa",
    description: "Guia docente exhaustiva sobre la metodologia ABP.",
    resourceType: "guia-docente",
    language: "es",
    license: "cc-by",
    author: "INTEF Oficial",
    thumbnailUrl: null,
    rating: { average: 4.7, count: 4 },
    favoriteCount: 4,
    editorialStatus: "published",
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "res-02",
    slug: "introduccion-ia-aula-etica-herramientas",
    title: "Introduccion a la IA en el Aula: Etica y Herramientas",
    description: "Guia practica para docentes que desean integrar herramientas de inteligencia artificial en su practica pedagogica.",
    resourceType: "secuencia-didactica",
    language: "es",
    license: "cc-by-sa",
    author: "Carlos M. Ruiz",
    thumbnailUrl: null,
    rating: { average: 4.5, count: 3 },
    favoriteCount: 1,
    editorialStatus: "published",
    createdAt: "2026-03-20T10:00:00Z",
  },
  {
    id: "res-06",
    slug: "primeros-pasos-robots-amigos",
    title: "Mis Primeros Pasos con los Robots Amigos",
    description: "Actividad interactiva para educacion infantil sobre robotica.",
    resourceType: "actividad-interactiva",
    language: "es",
    license: "cc-by",
    author: "Sofia Garcia",
    thumbnailUrl: null,
    rating: { average: 5.0, count: 3 },
    favoriteCount: 3,
    editorialStatus: "published",
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "res-08",
    slug: "fracciones-proporciones-cocina-matematica",
    title: "Fracciones y Proporciones: Cocina Matematica",
    description: "Secuencia didactica que conecta fracciones con recetas de cocina.",
    resourceType: "secuencia-didactica",
    language: "es",
    license: "cc-by-sa",
    author: "Marta Segovia",
    thumbnailUrl: null,
    rating: { average: 4.0, count: 3 },
    favoriteCount: 0,
    editorialStatus: "published",
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "res-09",
    slug: "cambio-climatico-explicado-datos",
    title: "El Cambio Climatico Explicado con Datos",
    description: "Infografia interactiva con datos reales sobre el cambio climatico.",
    resourceType: "infografia",
    language: "es",
    license: "cc-by",
    author: "Lucia Vega",
    thumbnailUrl: null,
    rating: { average: 4.3, count: 3 },
    favoriteCount: 3,
    editorialStatus: "published",
    createdAt: "2025-12-05T10:00:00Z",
  },
  {
    id: "res-13",
    slug: "seguridad-internet-identidad-digital",
    title: "Seguridad en Internet: Protege tu Identidad Digital",
    description: "Secuencia didactica sobre navegacion segura y ciberacoso.",
    resourceType: "secuencia-didactica",
    language: "es",
    license: "cc-by",
    author: "INTEF Oficial",
    thumbnailUrl: null,
    rating: { average: 4.0, count: 3 },
    favoriteCount: 1,
    editorialStatus: "published",
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "res-19",
    slug: "introduccion-programacion-scratch",
    title: "Introduccion a la Programacion con Scratch",
    description: "Actividad interactiva de programacion con Scratch 3.0.",
    resourceType: "actividad-interactiva",
    language: "es",
    license: "cc-by-sa",
    author: "Carlos M. Ruiz",
    thumbnailUrl: null,
    rating: { average: 4.3, count: 3 },
    favoriteCount: 4,
    editorialStatus: "published",
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "res-15",
    slug: "creacion-podcast-educativo",
    title: "Creacion de Podcast Educativo Paso a Paso",
    description: "Proyecto practico de creacion de podcast para FP.",
    resourceType: "proyecto",
    language: "es",
    license: "cc-by-sa",
    author: "Pedro Navarro",
    thumbnailUrl: null,
    rating: { average: 4.0, count: 3 },
    favoriteCount: 0,
    editorialStatus: "published",
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "res-20",
    slug: "diseno-web-responsive-principiantes",
    title: "Diseno Web Responsive para Principiantes",
    description: "Ejercicio practico de diseno web responsive para FP.",
    resourceType: "ejercicio",
    language: "es",
    license: "cc-by",
    author: "Pedro Navarro",
    thumbnailUrl: null,
    rating: { average: 0, count: 0 },
    favoriteCount: 1,
    editorialStatus: "published",
    createdAt: "2026-03-20T10:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// 6 sample collections
// ---------------------------------------------------------------------------

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col-01",
    slug: "inteligencia-artificial-educacion",
    title: "Inteligencia Artificial en Educacion",
    description: "Seleccion de recursos para integrar la inteligencia artificial en la practica docente, desde infantil hasta universidad.",
    resourceCount: 5,
    thumbnailUrl: null,
    curator: { id: "user-elena", name: "Dra. Elena Martinez O." },
    editorialStatus: "published",
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "col-02",
    slug: "matematicas-creativas",
    title: "Matematicas Creativas",
    description: "Recursos innovadores para ensenar matematicas de forma visual, manipulativa y conectada con la vida real.",
    resourceCount: 4,
    thumbnailUrl: null,
    curator: { id: "user-marta", name: "Marta Segovia" },
    editorialStatus: "published",
    createdAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "col-03",
    slug: "competencia-digital-docente",
    title: "Competencia Digital Docente",
    description: "Coleccion para desarrollar la competencia digital del profesorado en seguridad, evaluacion y metodologias activas.",
    resourceCount: 4,
    thumbnailUrl: null,
    curator: { id: "demo-admin", name: "INTEF Oficial" },
    editorialStatus: "published",
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "col-04",
    slug: "primeros-pasos-programacion",
    title: "Primeros Pasos en Programacion",
    description: "Itinerario de recursos para iniciarse en el pensamiento computacional y la programacion, desde infantil hasta FP.",
    resourceCount: 4,
    thumbnailUrl: null,
    curator: { id: "user-carlos", name: "Carlos M. Ruiz" },
    editorialStatus: "published",
    createdAt: "2026-01-15T10:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Rating summary for the first resource
// ---------------------------------------------------------------------------

export const MOCK_RATING: RatingSummary = {
  resourceId: "res-001",
  averageScore: 4.8,
  totalRatings: 127,
  distribution: { 1: 2, 2: 3, 3: 8, 4: 24, 5: 90 },
};

// ---------------------------------------------------------------------------
// Public user profiles
// ---------------------------------------------------------------------------

export const MOCK_USER_PROFILE: PublicUserProfile = {
  id: "user-elena",
  name: "Dra. Elena Martinez O.",
  avatarUrl: null,
  bio: "Profesora universitaria especializada en IA aplicada a la educacion",
  role: "curator",
  resourceCount: 3,
  favoriteCount: 5,
  joinedAt: "2025-11-15T10:00:00Z",
};

// ---------------------------------------------------------------------------
// User dashboard
// ---------------------------------------------------------------------------

export const MOCK_DASHBOARD: DashboardSummary = {
  user: MOCK_USER_PROFILE,
  recentResources: MOCK_RESOURCES.slice(0, 4),
  draftCount: 3,
  publishedCount: 12,
  favoriteCount: 47,
  recentActivity: [
    {
      id: "act-001",
      type: "resource_published",
      resourceId: "res-001",
      resourceTitle:
        "Sistemas de IA: Etica y Aplicaciones en el Aula",
      resourceSlug: "sistemas-ia-etica-aula",
      description: "Publicaste un nuevo recurso",
      createdAt: "2024-03-20T10:00:00Z",
    },
    {
      id: "act-002",
      type: "favorite_added",
      resourceId: "res-003",
      resourceTitle: "Cambio Climatico: Comprender, Analizar y Actuar",
      resourceSlug: "cambio-climatico-secundaria",
      description: "Anadiste un recurso a favoritos",
      createdAt: "2024-03-18T16:20:00Z",
    },
    {
      id: "act-004",
      type: "rating_given",
      resourceId: "res-004",
      resourceTitle:
        "Introduccion a la Robotica Educativa con Materiales Reciclados",
      resourceSlug: "robotica-educativa-primaria",
      description: "Valoraste un recurso con 5 estrellas",
      createdAt: "2024-03-12T09:30:00Z",
    },
    {
      id: "act-005",
      type: "resource_drafted",
      resourceId: "res-draft-001",
      resourceTitle: "Evaluacion Formativa con Herramientas Digitales",
      resourceSlug: "evaluacion-formativa-digital",
      description: "Guardaste un borrador",
      createdAt: "2024-03-10T14:00:00Z",
    },
  ],
};

// ---------------------------------------------------------------------------
// Platform stats for the landing page
// ---------------------------------------------------------------------------

export const MOCK_STATS = {
  totalResources: 79_420,
  totalMultimedia: 103_850,
  totalUsers: 112_300,
  totalCollections: 1_240,
};

// ---------------------------------------------------------------------------
// Topic chips for the hero section
// ---------------------------------------------------------------------------

export const MOCK_TOPICS = [
  { label: "Infantil", value: "infantil" },
  { label: "Primaria", value: "primaria" },
  { label: "Secundaria", value: "secundaria" },
  { label: "Bachillerato", value: "bachillerato" },
  { label: "FP", value: "fp" },
  { label: "STEAM", value: "steam" },
  { label: "Competencia Digital", value: "competencia-digital" },
  { label: "Inclusion", value: "inclusion" },
];
