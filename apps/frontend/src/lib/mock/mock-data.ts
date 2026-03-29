import type { ResourceSummary } from "../types/resource-extended.ts";
import type { CommentThread, RatingSummary } from "../types/social.ts";
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
    id: "res-001",
    slug: "sistemas-ia-etica-aula",
    title:
      "Sistemas de Inteligencia Artificial: Etica y Aplicaciones en el Aula",
    description:
      "Recurso interactivo que explora los fundamentos eticos de la IA y sus aplicaciones practicas en contextos educativos de secundaria y bachillerato.",
    resourceType: "Secuencia Didactica",
    language: "es",
    license: "cc-by-nc-sa",
    author: "Dra. Elena Martinez V.",
    thumbnailUrl: null,
    rating: { average: 4.8, count: 127 },
    favoriteCount: 342,
    editorialStatus: "published",
    createdAt: "2023-10-14T10:00:00Z",
  },
  {
    id: "res-002",
    slug: "fracciones-juego-interactivo",
    title: "Fracciones en Movimiento: Juego Interactivo para Primaria",
    description:
      "Conjunto de actividades gamificadas para trabajar las fracciones de forma visual y manipulativa, dirigido a alumnado de 4o a 6o de Educacion Primaria.",
    resourceType: "Ejercicio Interactivo",
    language: "es",
    license: "cc-by-sa",
    author: "Prof. Carlos Ruiz Delgado",
    thumbnailUrl: null,
    rating: { average: 4.5, count: 89 },
    favoriteCount: 215,
    editorialStatus: "published",
    createdAt: "2023-11-22T08:30:00Z",
  },
  {
    id: "res-003",
    slug: "cambio-climatico-secundaria",
    title: "Cambio Climatico: Comprender, Analizar y Actuar",
    description:
      "Video educativo con guia didactica sobre las causas y consecuencias del cambio climatico, orientado a 3o y 4o de ESO con propuestas de accion local.",
    resourceType: "Video Educativo",
    language: "es",
    license: "cc-by-nc",
    author: "Fundacion Sostenibilidad Educativa",
    thumbnailUrl: null,
    rating: { average: 4.6, count: 203 },
    favoriteCount: 518,
    editorialStatus: "published",
    createdAt: "2023-09-05T12:00:00Z",
  },
  {
    id: "res-004",
    slug: "robotica-educativa-primaria",
    title: "Introduccion a la Robotica Educativa con Materiales Reciclados",
    description:
      "Proyecto de innovacion que guia paso a paso la construccion de robots sencillos con materiales reciclados, integrando ciencias, tecnologia y arte para Primaria.",
    resourceType: "Proyecto de Innovacion",
    language: "es",
    license: "cc-by",
    author: "Colectivo MakerEdu",
    thumbnailUrl: null,
    rating: { average: 4.9, count: 74 },
    favoriteCount: 189,
    editorialStatus: "published",
    createdAt: "2024-01-10T09:00:00Z",
  },
  {
    id: "res-005",
    slug: "comprension-lectora-estrategias",
    title: "Estrategias de Comprension Lectora: De la Teoria a la Practica",
    description:
      "Guia didactica con actividades graduadas para desarrollar la comprension lectora en todos los niveles de Secundaria, incluyendo textos multimodales.",
    resourceType: "Guia Didactica",
    language: "es",
    license: "cc-by-nc-sa",
    author: "Maria del Carmen Navarro",
    thumbnailUrl: null,
    rating: { average: 4.3, count: 156 },
    favoriteCount: 287,
    editorialStatus: "published",
    createdAt: "2023-08-18T14:00:00Z",
  },
  {
    id: "res-006",
    slug: "historia-roma-presentacion",
    title: "El Legado de Roma: Presentacion Interactiva",
    description:
      "Presentacion multimedia sobre la civilizacion romana, su organizacion politica, cultura y legado, con actividades integradas para 1o de ESO.",
    resourceType: "Presentacion",
    language: "es",
    license: "cc-by-sa",
    author: "Dr. Javier Hernandez Campos",
    thumbnailUrl: null,
    rating: { average: 4.1, count: 62 },
    favoriteCount: 134,
    editorialStatus: "published",
    createdAt: "2023-12-01T11:00:00Z",
  },
  {
    id: "res-007",
    slug: "musica-y-emociones-infantil",
    title: "Musica y Emociones: Paisajes Sonoros para Educacion Infantil",
    description:
      "Secuencia de actividades musicales para identificar y expresar emociones a traves de la escucha activa, la percusion corporal y la creacion de paisajes sonoros.",
    resourceType: "Secuencia Didactica",
    language: "es",
    license: "cc-by-nc",
    author: "Laura Sanchez Prieto",
    thumbnailUrl: null,
    rating: { average: 4.7, count: 98 },
    favoriteCount: 263,
    editorialStatus: "published",
    createdAt: "2024-02-14T10:30:00Z",
  },
  {
    id: "res-008",
    slug: "pensamiento-computacional-scratch",
    title: "Pensamiento Computacional con Scratch: Nivel Inicial",
    description:
      "Objeto de aprendizaje autocontenido para iniciar al alumnado de 5o y 6o de Primaria en el pensamiento computacional utilizando Scratch 3.0.",
    resourceType: "Objeto de Aprendizaje",
    language: "es",
    license: "cc-by-sa",
    author: "Red de Centros Digitales",
    thumbnailUrl: null,
    rating: { average: 4.4, count: 112 },
    favoriteCount: 301,
    editorialStatus: "published",
    createdAt: "2023-07-20T08:00:00Z",
  },
  {
    id: "res-009",
    slug: "bilingual-science-experiments",
    title: "Science Experiments for Primary: Hands-On Bilingual Activities",
    description:
      "A collection of simple science experiments with bilingual instructions (English/Spanish) designed for CLIL classrooms in primary education.",
    resourceType: "Guia Didactica",
    language: "en",
    license: "cc-by",
    author: "British Council Spain",
    thumbnailUrl: null,
    rating: { average: 4.2, count: 45 },
    favoriteCount: 97,
    editorialStatus: "published",
    createdAt: "2024-01-28T15:00:00Z",
  },
  {
    id: "res-010",
    slug: "educacion-fisica-inclusiva",
    title: "Educacion Fisica Inclusiva: Juegos Adaptados para Todos",
    description:
      "Recopilacion de 30 juegos motrices adaptados para grupos heterogeneos, con variantes para distintas capacidades funcionales, desde Infantil hasta Bachillerato.",
    resourceType: "Guia Didactica",
    language: "es",
    license: "cc-by-nc-sa",
    author: "Asociacion Deporte Inclusivo",
    thumbnailUrl: null,
    rating: { average: 4.6, count: 81 },
    favoriteCount: 176,
    editorialStatus: "published",
    createdAt: "2023-11-10T09:45:00Z",
  },
  {
    id: "res-011",
    slug: "fp-ciberseguridad-basica",
    title: "Ciberseguridad Basica para Ciclos Formativos",
    description:
      "Modulo de aprendizaje sobre principios de ciberseguridad, amenazas comunes y buenas practicas, orientado a ciclos formativos de grado medio de Informatica.",
    resourceType: "Objeto de Aprendizaje",
    language: "es",
    license: "cc-by-nc",
    author: "Instituto Nacional de Ciberseguridad",
    thumbnailUrl: null,
    rating: { average: 4.0, count: 53 },
    favoriteCount: 88,
    editorialStatus: "published",
    createdAt: "2024-03-01T10:00:00Z",
  },
  {
    id: "res-012",
    slug: "ods-agenda-2030-bachillerato",
    title:
      "Los ODS y la Agenda 2030: Proyecto Interdisciplinar para Bachillerato",
    description:
      "Proyecto interdisciplinar que conecta los 17 Objetivos de Desarrollo Sostenible con las materias de Bachillerato, incluyendo retos, investigacion y accion comunitaria.",
    resourceType: "Proyecto de Innovacion",
    language: "es",
    license: "cc-by-sa",
    author: "Red Espanola para el Desarrollo Sostenible",
    thumbnailUrl: null,
    rating: { average: 4.7, count: 139 },
    favoriteCount: 402,
    editorialStatus: "published",
    createdAt: "2023-06-15T07:30:00Z",
  },
];

// ---------------------------------------------------------------------------
// 6 sample collections
// ---------------------------------------------------------------------------

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col-001",
    slug: "ia-en-el-aula",
    title: "IA en el Aula",
    description:
      "Recursos para integrar la inteligencia artificial en la practica docente de todos los niveles educativos.",
    resourceCount: 42,
    thumbnailUrl: null,
    curator: { id: "user-001", name: "Elena Martinez" },
    editorialStatus: "published",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "col-002",
    slug: "ods-y-sostenibilidad",
    title: "ODS y Sostenibilidad",
    description:
      "Coleccion de recursos alineados con los Objetivos de Desarrollo Sostenible para trabajar la educacion ambiental en el aula.",
    resourceCount: 67,
    thumbnailUrl: null,
    curator: { id: "user-005", name: "Pablo Fernandez" },
    editorialStatus: "published",
    createdAt: "2023-12-10T08:00:00Z",
  },
  {
    id: "col-003",
    slug: "pensamiento-computacional",
    title: "Pensamiento Computacional",
    description:
      "Actividades, proyectos y herramientas para desarrollar el pensamiento computacional desde Infantil hasta Bachillerato.",
    resourceCount: 38,
    thumbnailUrl: null,
    curator: { id: "user-004", name: "Marta Diaz" },
    editorialStatus: "published",
    createdAt: "2024-02-01T12:00:00Z",
  },
  {
    id: "col-004",
    slug: "educacion-inclusiva",
    title: "Educacion Inclusiva",
    description:
      "Recursos adaptados y estrategias pedagogicas para garantizar la inclusion de todo el alumnado en el proceso educativo.",
    resourceCount: 55,
    thumbnailUrl: null,
    curator: { id: "user-006", name: "Teresa Morales" },
    editorialStatus: "published",
    createdAt: "2023-10-20T14:00:00Z",
  },
  {
    id: "col-005",
    slug: "steam-para-primaria",
    title: "STEAM para Primaria",
    description:
      "Propuestas interdisciplinares que integran ciencia, tecnologia, ingenieria, arte y matematicas para la etapa de Primaria.",
    resourceCount: 31,
    thumbnailUrl: null,
    curator: { id: "user-002", name: "Ricardo Gomez" },
    editorialStatus: "published",
    createdAt: "2024-01-05T09:30:00Z",
  },
  {
    id: "col-006",
    slug: "recursos-bilingues",
    title: "Recursos Bilingues",
    description:
      "Materiales en ingles y espanol para programas AICLE/CLIL, con fichas de trabajo, audios y actividades interactivas.",
    resourceCount: 24,
    thumbnailUrl: null,
    curator: { id: "user-003", name: "Ana Lopez" },
    editorialStatus: "published",
    createdAt: "2024-02-18T11:00:00Z",
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
// 5 comment threads with replies
// ---------------------------------------------------------------------------

export const MOCK_COMMENTS: CommentThread[] = [
  {
    comment: {
      id: "com-001",
      resourceId: "res-001",
      userId: "user-002",
      body: "Excelente recurso. Lo he utilizado con mis alumnos de 4o de ESO y el nivel de participacion fue muy superior al habitual. Las actividades sobre sesgos en IA generaron debates muy interesantes.",
      status: "visible",
      author: { id: "user-002", name: "Ricardo Gomez", avatarUrl: undefined },
      usefulCount: 12,
      userVotedUseful: false,
      createdAt: "2024-03-25T14:30:00Z",
      updatedAt: "2024-03-25T14:30:00Z",
    },
    replies: [
      {
        id: "com-002",
        resourceId: "res-001",
        userId: "user-003",
        parentId: "com-001",
        body: "Coincido totalmente. Lo adapte para 3o de ESO reduciendo la complejidad tecnica y tambien funciono muy bien.",
        status: "visible",
        author: { id: "user-003", name: "Ana Lopez", avatarUrl: undefined },
        usefulCount: 5,
        userVotedUseful: false,
        createdAt: "2024-03-26T09:15:00Z",
        updatedAt: "2024-03-26T09:15:00Z",
      },
    ],
  },
  {
    comment: {
      id: "com-003",
      resourceId: "res-001",
      userId: "user-004",
      body: "Muy completo el apartado sobre etica. Echo en falta una seccion sobre privacidad de datos adaptada a menores. Quiza se podria anadir como actividad complementaria.",
      status: "visible",
      author: { id: "user-004", name: "Marta Diaz", avatarUrl: undefined },
      usefulCount: 8,
      userVotedUseful: false,
      createdAt: "2024-03-28T16:45:00Z",
      updatedAt: "2024-03-28T16:45:00Z",
    },
    replies: [
      {
        id: "com-004",
        resourceId: "res-001",
        userId: "user-001",
        parentId: "com-003",
        body: "Gracias por la sugerencia, Marta. Estoy trabajando en una ampliacion sobre privacidad y proteccion de datos que publicare como recurso complementario.",
        status: "visible",
        author: {
          id: "user-001",
          name: "Elena Martinez",
          avatarUrl: undefined,
        },
        usefulCount: 15,
        userVotedUseful: false,
        createdAt: "2024-03-29T10:00:00Z",
        updatedAt: "2024-03-29T10:00:00Z",
      },
    ],
  },
  {
    comment: {
      id: "com-005",
      resourceId: "res-001",
      userId: "user-005",
      body: "He adaptado las actividades para un taller con familias y el resultado fue extraordinario. Los padres y madres salieron mucho mas conscientes de como sus hijos interactuan con sistemas de IA a diario.",
      status: "visible",
      author: {
        id: "user-005",
        name: "Pablo Fernandez",
        avatarUrl: undefined,
      },
      usefulCount: 20,
      userVotedUseful: false,
      createdAt: "2024-04-02T11:20:00Z",
      updatedAt: "2024-04-02T11:20:00Z",
    },
    replies: [
      {
        id: "com-006",
        resourceId: "res-001",
        userId: "user-002",
        parentId: "com-005",
        body: "Que buena idea lo del taller con familias. Podrias compartir como lo adaptaste? Me gustaria replicarlo en mi centro.",
        status: "visible",
        author: {
          id: "user-002",
          name: "Ricardo Gomez",
          avatarUrl: undefined,
        },
        usefulCount: 3,
        userVotedUseful: false,
        createdAt: "2024-04-02T18:30:00Z",
        updatedAt: "2024-04-02T18:30:00Z",
      },
      {
        id: "com-007",
        resourceId: "res-001",
        userId: "user-005",
        parentId: "com-005",
        body: "Claro, Ricardo. Basicamente simplifique el vocabulario tecnico, acorte las sesiones a 45 minutos y anadi ejemplos cotidianos como asistentes de voz y recomendaciones de redes sociales. Te lo envio por mensaje.",
        status: "visible",
        author: {
          id: "user-005",
          name: "Pablo Fernandez",
          avatarUrl: undefined,
        },
        usefulCount: 7,
        userVotedUseful: false,
        createdAt: "2024-04-03T08:00:00Z",
        updatedAt: "2024-04-03T08:00:00Z",
      },
    ],
  },
  {
    comment: {
      id: "com-008",
      resourceId: "res-001",
      userId: "user-006",
      body: "Desde el punto de vista de accesibilidad, seria util incluir descripciones alternativas en las infografias y transcripciones en los videos. El contenido es excelente pero algunos estudiantes con discapacidad visual no pueden aprovecharlo al maximo.",
      status: "visible",
      author: {
        id: "user-006",
        name: "Teresa Morales",
        avatarUrl: undefined,
      },
      usefulCount: 25,
      userVotedUseful: false,
      createdAt: "2024-04-05T13:10:00Z",
      updatedAt: "2024-04-05T13:10:00Z",
    },
    replies: [
      {
        id: "com-009",
        resourceId: "res-001",
        userId: "user-001",
        parentId: "com-008",
        body: "Tienes toda la razon, Teresa. He actualizado el recurso con textos alternativos en todas las imagenes y estoy preparando las transcripciones. Muchas gracias por el feedback.",
        status: "visible",
        author: {
          id: "user-001",
          name: "Elena Martinez",
          avatarUrl: undefined,
        },
        usefulCount: 18,
        userVotedUseful: false,
        createdAt: "2024-04-06T09:00:00Z",
        updatedAt: "2024-04-06T09:00:00Z",
      },
    ],
  },
  {
    comment: {
      id: "com-010",
      resourceId: "res-001",
      userId: "user-007",
      body: "Lo estoy usando en Bachillerato de Ciencias y funciona de maravilla como proyecto transversal entre Tecnologia y Filosofia. Los alumnos estan preparando un debate sobre regulacion de la IA como tarea final.",
      status: "visible",
      author: {
        id: "user-007",
        name: "Luis Garcia Ramos",
        avatarUrl: undefined,
      },
      usefulCount: 9,
      userVotedUseful: false,
      createdAt: "2024-04-10T15:45:00Z",
      updatedAt: "2024-04-10T15:45:00Z",
    },
    replies: [
      {
        id: "com-011",
        resourceId: "res-001",
        userId: "user-004",
        parentId: "com-010",
        body: "Esa combinacion de Tecnologia y Filosofia es fantastica. En mi centro hicimos algo similar con Bioetica y los resultados fueron muy buenos. Si necesitas material complementario sobre regulacion, te paso unos enlaces.",
        status: "visible",
        author: { id: "user-004", name: "Marta Diaz", avatarUrl: undefined },
        usefulCount: 4,
        userVotedUseful: false,
        createdAt: "2024-04-11T08:30:00Z",
        updatedAt: "2024-04-11T08:30:00Z",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Public user profiles
// ---------------------------------------------------------------------------

export const MOCK_USER_PROFILE: PublicUserProfile = {
  id: "user-001",
  name: "Elena Martinez",
  avatarUrl: null,
  bio: "Catedratica en Innovacion Educativa. Apasionada por las TIC y la pedagogia activa.",
  role: "author",
  resourceCount: 15,
  favoriteCount: 47,
  joinedAt: "2022-06-01T00:00:00Z",
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
      id: "act-003",
      type: "comment_posted",
      resourceId: "res-008",
      resourceTitle: "Pensamiento Computacional con Scratch: Nivel Inicial",
      resourceSlug: "pensamiento-computacional-scratch",
      description: "Comentaste en un recurso",
      createdAt: "2024-03-15T11:45:00Z",
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
