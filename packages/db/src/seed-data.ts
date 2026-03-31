/**
 * Datos de demostración completos para la plataforma.
 * Usados por: CLI seed, preview browser, seed.json.
 *
 * IDs deterministas para idempotencia:
 *   usuarios: demo-admin, demo-curator, demo-author, demo-reader, user-*
 *   recursos: res-01 .. res-22
 *   colecciones: col-01 .. col-04
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface SeedUser {
	id: string;
	email: string;
	name: string;
	role: string;
	password: string;
	bio: string;
}

export interface SeedResource {
	id: string;
	slug: string;
	title: string;
	description: string;
	language: string;
	license: string;
	resourceType: string;
	keywords: string;
	author: string;
	publisher: string | null;
	createdBy: string; // FK → user.id
	editorialStatus: string;
	subjects: string[];
	levels: string[];
	featuredAt: string | null; // ISO string o null
	createdAt: string; // ISO string
}

export interface SeedCollection {
	id: string;
	slug: string;
	title: string;
	description: string;
	curatorId: string;
	resourceIds: string[];
}

export interface SeedRating {
	resourceId: string;
	userId: string;
	score: number;
}

export interface SeedFavorite {
	resourceId: string;
	userId: string;
}

// ---------------------------------------------------------------------------
// Usuarios (11)
// ---------------------------------------------------------------------------

export const DEMO_USERS: SeedUser[] = [
	// — Usuarios base —
	{
		id: "demo-admin",
		email: "admin@example.com",
		name: "INTEF Oficial",
		role: "admin",
		password: "password",
		bio: "Instituto Nacional de Tecnologías Educativas y de Formación del Profesorado",
	},
	{
		id: "demo-curator",
		email: "curator@example.com",
		name: "Ivonne Montesdeoca",
		role: "curator",
		password: "password",
		bio: "Coordinadora TIC y evaluadora de contenidos digitales educativos",
	},
	{
		id: "demo-editor",
		email: "editor@example.com",
		name: "Leo Reina",
		role: "editor",
		password: "password",
		bio: "Docente de confianza con publicación directa de contenidos educativos",
	},
	{
		id: "demo-author",
		email: "author@example.com",
		name: "Yanira Mateos",
		role: "author",
		password: "password",
		bio: "Profesora de secundaria, apasionada por la innovación pedagógica",
	},
	{
		id: "demo-reader",
		email: "reader@example.com",
		name: "Elisa Morales",
		role: "reader",
		password: "password",
		bio: "Docente en formación permanente",
	},
	// — Usuarios adicionales —
	{
		id: "user-humberto",
		email: "humberto.pinero@edu.es",
		name: "Humberto Piñero",
		role: "curator",
		password: "demo1234",
		bio: "Profesor universitario especializado en IA aplicada a la educación",
	},
	{
		id: "user-carlos",
		email: "carlos.exposito@edu.es",
		name: "Carlos Expósito",
		role: "author",
		password: "demo1234",
		bio: "Profesor de tecnología en secundaria, creador de contenidos STEM",
	},
	{
		id: "user-fran",
		email: "fran.rodriguez@edu.es",
		name: "Fran Rodríguez Castellano",
		role: "author",
		password: "demo1234",
		bio: "Maestro de primaria especializado en matemáticas manipulativas",
	},
	{
		id: "user-yanira",
		email: "yanira.exposito@edu.es",
		name: "Yanira Expósito",
		role: "author",
		password: "demo1234",
		bio: "Educadora infantil y divulgadora de robótica educativa",
	},
	{
		id: "user-catedra",
		email: "catedra.tech@edu.es",
		name: "Cátedra Tecnología",
		role: "author",
		password: "demo1234",
		bio: "Departamento de Tecnología Educativa — Universidad Complutense de Madrid",
	},
	{
		id: "user-humberto2",
		email: "humberto.morales@edu.es",
		name: "Humberto Morales",
		role: "author",
		password: "demo1234",
		bio: "Profesor de FP en informática y comunicaciones",
	},
	{
		id: "user-carlos2",
		email: "carlos.reina@edu.es",
		name: "Carlos Reina",
		role: "author",
		password: "demo1234",
		bio: "Profesora de ciencias en bachillerato, divulgadora medioambiental",
	},
];

// IDs de todos los usuarios para referencia rápida en social data
const U = {
	admin: "demo-admin",
	curator: "demo-curator",
	editor: "demo-editor",
	author: "demo-author",
	reader: "demo-reader",
	humberto: "user-humberto",
	carlos: "user-carlos",
	fran: "user-fran",
	yanira: "user-yanira",
	catedra: "user-catedra",
	humberto2: "user-humberto2",
	carlos2: "user-carlos2",
} as const;

// ---------------------------------------------------------------------------
// Fechas auxiliares
// ---------------------------------------------------------------------------

const NOW = "2026-03-29T10:00:00Z";
const FEATURED = "2026-03-15T10:00:00Z"; // fecha de destacado
const RECENT = "2026-03-20T10:00:00Z"; // fecha reciente para "novedades"
const OLDER_1 = "2026-01-10T10:00:00Z";
const OLDER_2 = "2025-11-15T10:00:00Z";
const OLDER_3 = "2025-09-20T10:00:00Z";
const OLDER_4 = "2025-12-05T10:00:00Z";

// ---------------------------------------------------------------------------
// Recursos (22)
// ---------------------------------------------------------------------------

export const DEMO_RESOURCES: SeedResource[] = [
	// ── Bloque 1: IA y Tecnología ──────────────────────────────────────────
	{
		id: "res-01",
		slug: "sistemas-ia-etica-aplicaciones-aula",
		title: "Sistemas de Inteligencia Artificial: Ética y Aplicaciones en el Aula",
		description: "Secuencia didáctica que explora los fundamentos éticos de la inteligencia artificial y sus aplicaciones prácticas en contextos educativos de bachillerato. Incluye debates, casos de estudio y actividades de evaluación crítica.",
		language: "es",
		license: "cc-by-nc-sa",
		resourceType: "secuencia-didactica",
		keywords: "inteligencia artificial,ética,educación,tecnología,bachillerato",
		author: "Dra. Elena Martínez O.",
		publisher: null,
		createdBy: U.humberto,
		editorialStatus: "published",
		subjects: ["informatica", "filosofia"],
		levels: ["bachillerato"],
		featuredAt: FEATURED,
		createdAt: OLDER_2,
	},
	{
		id: "res-02",
		slug: "introduccion-ia-aula-etica-herramientas",
		title: "Introducción a la IA en el Aula: Ética y Herramientas",
		description: "Guía práctica para docentes que desean integrar herramientas de inteligencia artificial en su práctica pedagógica, con énfasis en el uso ético y responsable de estas tecnologías.",
		language: "es",
		license: "cc-by-sa",
		resourceType: "secuencia-didactica",
		keywords: "IA,herramientas digitales,ética digital,docentes",
		author: "Carlos M. Ruiz",
		publisher: null,
		createdBy: U.carlos,
		editorialStatus: "published",
		subjects: ["informatica"],
		levels: ["bachillerato"],
		featuredAt: null,
		createdAt: RECENT,
	},
	{
		id: "res-03",
		slug: "como-funciona-bot-taller-robotica",
		title: "¿Cómo funciona un Bot? Taller Práctico de Robótica",
		description: "Actividad interactiva donde el alumnado de secundaria construye y programa un bot sencillo, comprendiendo los principios básicos de la robótica y la automatización.",
		language: "es",
		license: "cc-by",
		resourceType: "actividad-interactiva",
		keywords: "robótica,bot,programación,taller,secundaria",
		author: "INTEF Oficial",
		publisher: "INTEF",
		createdBy: U.admin,
		editorialStatus: "published",
		subjects: ["informatica"],
		levels: ["educacion-secundaria-obligatoria"],
		featuredAt: FEATURED,
		createdAt: OLDER_1,
	},
	{
		id: "res-04",
		slug: "ia-investigacion-academica",
		title: "La IA en la Investigación Académica",
		description: "Guía docente sobre el uso de herramientas de IA en la investigación universitaria: búsqueda bibliográfica automatizada, análisis de datos, generación de hipótesis y consideraciones éticas.",
		language: "es",
		license: "cc-by-nc",
		resourceType: "guia-docente",
		keywords: "IA,investigación,universidad,bibliografía,datos",
		author: "Dra. Elena Martínez O.",
		publisher: null,
		createdBy: U.humberto,
		editorialStatus: "published",
		subjects: ["informatica"],
		levels: ["universidad"],
		featuredAt: null,
		createdAt: RECENT,
	},
	{
		id: "res-05",
		slug: "desarrollo-agil-asistentes-codigo",
		title: "Desarrollo Ágil con Asistentes de Código",
		description: "Proyecto de formación profesional que enseña metodologías ágiles combinadas con el uso de asistentes de código basados en IA para el desarrollo de software.",
		language: "es",
		license: "cc-by-sa",
		resourceType: "proyecto",
		keywords: "desarrollo ágil,asistentes de código,IA,FP,software",
		author: "Cátedra Tecnología",
		publisher: "Universidad Complutense de Madrid",
		createdBy: U.catedra,
		editorialStatus: "published",
		subjects: ["informatica"],
		levels: ["formacion-profesional"],
		featuredAt: null,
		createdAt: OLDER_4,
	},
	{
		id: "res-06",
		slug: "primeros-pasos-robots-amigos",
		title: "Mis Primeros Pasos con los Robots Amigos",
		description: "Actividad interactiva para educación infantil donde los más pequeños descubren qué es un robot, cómo se mueve y cómo podemos darle instrucciones sencillas a través del juego.",
		language: "es",
		license: "cc-by",
		resourceType: "actividad-interactiva",
		keywords: "robótica,infantil,juego,instrucciones,robots",
		author: "Sofía García",
		publisher: null,
		createdBy: U.yanira,
		editorialStatus: "published",
		subjects: ["informatica"],
		levels: ["educacion-infantil"],
		featuredAt: null,
		createdAt: OLDER_1,
	},

	// ── Bloque 2: Matemáticas y Ciencias ──────────────────────────────────
	{
		id: "res-07",
		slug: "matematicas-divertidas-algoritmos-visuales",
		title: "Matemáticas Divertidas con Algoritmos Visuales",
		description: "Colección de actividades interactivas que utilizan representaciones visuales de algoritmos para enseñar conceptos matemáticos fundamentales en educación primaria de forma lúdica.",
		language: "es",
		license: "cc-by-nc-sa",
		resourceType: "actividad-interactiva",
		keywords: "matemáticas,algoritmos,visual,primaria,juegos",
		author: "Marta Segovia",
		publisher: null,
		createdBy: U.fran,
		editorialStatus: "published",
		subjects: ["matematicas", "informatica"],
		levels: ["educacion-primaria"],
		featuredAt: FEATURED,
		createdAt: OLDER_3,
	},
	{
		id: "res-08",
		slug: "fracciones-proporciones-cocina-matematica",
		title: "Fracciones y Proporciones: Cocina Matemática",
		description: "Secuencia didáctica que conecta las fracciones y proporciones con recetas de cocina reales, permitiendo al alumnado de primaria manipular cantidades y comprender conceptos abstractos.",
		language: "es",
		license: "cc-by-sa",
		resourceType: "secuencia-didactica",
		keywords: "fracciones,proporciones,cocina,primaria,manipulativo",
		author: "Marta Segovia",
		publisher: null,
		createdBy: U.fran,
		editorialStatus: "published",
		subjects: ["matematicas"],
		levels: ["educacion-primaria"],
		featuredAt: null,
		createdAt: OLDER_2,
	},
	{
		id: "res-09",
		slug: "cambio-climatico-explicado-datos",
		title: "El Cambio Climático Explicado con Datos",
		description: "Infografía interactiva que presenta datos reales sobre el cambio climático, sus causas y consecuencias, con gráficos dinámicos y actividades de análisis para bachillerato.",
		language: "es",
		license: "cc-by",
		resourceType: "infografia",
		keywords: "cambio climático,datos,gráficos,bachillerato,medio ambiente",
		author: "Lucía Vega",
		publisher: null,
		createdBy: U.carlos2,
		editorialStatus: "published",
		subjects: ["ciencias-naturales", "geografia"],
		levels: ["bachillerato"],
		featuredAt: null,
		createdAt: OLDER_4,
	},
	{
		id: "res-10",
		slug: "laboratorio-virtual-fisica-movimiento",
		title: "Laboratorio Virtual de Física: Movimiento",
		description: "Actividad interactiva que simula un laboratorio de física donde el alumnado experimenta con velocidad, aceleración y fuerzas mediante simulaciones dinámicas.",
		language: "es",
		license: "cc-by-nc",
		resourceType: "actividad-interactiva",
		keywords: "física,movimiento,simulación,laboratorio,secundaria",
		author: "Lucía Vega",
		publisher: null,
		createdBy: U.carlos2,
		editorialStatus: "published",
		subjects: ["ciencias-naturales"],
		levels: ["educacion-secundaria-obligatoria"],
		featuredAt: null,
		createdAt: OLDER_1,
	},
	{
		id: "res-11",
		slug: "geometria-arquitectura-ciudad",
		title: "Geometría en la Arquitectura de tu Ciudad",
		description: "Proyecto interdisciplinar donde el alumnado de secundaria identifica y analiza figuras geométricas en edificios de su entorno, combinando matemáticas, arte y tecnología.",
		language: "es",
		license: "cc-by-sa",
		resourceType: "proyecto",
		keywords: "geometría,arquitectura,ciudad,secundaria,interdisciplinar",
		author: "Carlos M. Ruiz",
		publisher: null,
		createdBy: U.carlos,
		editorialStatus: "published",
		subjects: ["matematicas", "educacion-artistica"],
		levels: ["educacion-secundaria-obligatoria"],
		featuredAt: null,
		createdAt: RECENT,
	},
	{
		id: "res-12",
		slug: "estadistica-ciudadanos-criticos",
		title: "Estadística para Ciudadanos Críticos",
		description: "Guía docente que enseña estadística aplicada a la vida real: encuestas, sesgos, visualización de datos y pensamiento crítico para alumnado de formación profesional.",
		language: "es",
		license: "cc-by-nc-sa",
		resourceType: "guia-docente",
		keywords: "estadística,pensamiento crítico,datos,FP,ciudadanía",
		author: "Cátedra Tecnología",
		publisher: "Universidad Complutense de Madrid",
		createdBy: U.catedra,
		editorialStatus: "published",
		subjects: ["matematicas"],
		levels: ["formacion-profesional"],
		featuredAt: null,
		createdAt: OLDER_3,
	},

	// ── Bloque 3: Competencia Digital y Transversales ─────────────────────
	{
		id: "res-13",
		slug: "seguridad-internet-identidad-digital",
		title: "Seguridad en Internet: Protege tu Identidad Digital",
		description: "Secuencia didáctica sobre navegación segura, protección de datos personales, contraseñas robustas y prevención del ciberacoso dirigida a alumnado de secundaria.",
		language: "es",
		license: "cc-by",
		resourceType: "secuencia-didactica",
		keywords: "seguridad,internet,identidad digital,ciberacoso,secundaria",
		author: "INTEF Oficial",
		publisher: "INTEF",
		createdBy: U.admin,
		editorialStatus: "published",
		subjects: ["informatica"],
		levels: ["educacion-secundaria-obligatoria"],
		featuredAt: null,
		createdAt: OLDER_2,
	},
	{
		id: "res-14",
		slug: "pensamiento-computacional-sin-ordenador",
		title: "Pensamiento Computacional sin Ordenador",
		description: "Actividad interactiva de educación infantil que desarrolla el pensamiento computacional mediante juegos de secuenciación, patrones y resolución de problemas sin necesidad de dispositivos.",
		language: "es",
		license: "cc-by-nc",
		resourceType: "actividad-interactiva",
		keywords: "pensamiento computacional,unplugged,infantil,patrones,secuencias",
		author: "Sofía García",
		publisher: null,
		createdBy: U.yanira,
		editorialStatus: "published",
		subjects: ["informatica", "matematicas"],
		levels: ["educacion-infantil"],
		featuredAt: null,
		createdAt: OLDER_4,
	},
	{
		id: "res-15",
		slug: "creacion-podcast-educativo",
		title: "Creación de Podcast Educativo Paso a Paso",
		description: "Proyecto práctico de formación profesional que guía al alumnado en la planificación, grabación, edición y publicación de un podcast educativo.",
		language: "es",
		license: "cc-by-sa",
		resourceType: "proyecto",
		keywords: "podcast,audio,producción,FP,comunicación",
		author: "Pedro Navarro",
		publisher: null,
		createdBy: U.humberto2,
		editorialStatus: "published",
		subjects: ["informatica"],
		levels: ["formacion-profesional"],
		featuredAt: null,
		createdAt: OLDER_1,
	},
	{
		id: "res-16",
		slug: "evaluacion-rubricas-digitales",
		title: "Evaluación con Rúbricas Digitales",
		description: "Guía docente universitaria sobre diseño, implementación y uso de rúbricas digitales para la evaluación formativa y sumativa en educación superior.",
		language: "es",
		license: "cc-by-nc-sa",
		resourceType: "guia-docente",
		keywords: "rúbricas,evaluación,digital,universidad,formativa",
		author: "Dra. Elena Martínez O.",
		publisher: null,
		createdBy: U.humberto,
		editorialStatus: "published",
		subjects: ["informatica"],
		levels: ["universidad"],
		featuredAt: null,
		createdAt: OLDER_3,
	},
	{
		id: "res-17",
		slug: "aprendizaje-basado-proyectos-guia",
		title: "Aprendizaje Basado en Proyectos: Guía Completa",
		description: "Guía docente exhaustiva sobre la metodología ABP: planificación, implementación, evaluación y ejemplos prácticos para todas las etapas educativas.",
		language: "es",
		license: "cc-by",
		resourceType: "guia-docente",
		keywords: "ABP,proyectos,metodología,guía,docentes",
		author: "INTEF Oficial",
		publisher: "INTEF",
		createdBy: U.admin,
		editorialStatus: "published",
		subjects: ["informatica"],
		levels: ["educacion-secundaria-obligatoria"],
		featuredAt: FEATURED,
		createdAt: OLDER_2,
	},
	{
		id: "res-18",
		slug: "storytelling-digital-aula",
		title: "Storytelling Digital en el Aula",
		description: "Secuencia didáctica que enseña a crear historias digitales combinando texto, imagen y audio, fomentando la creatividad y la competencia lingüística en primaria.",
		language: "es",
		license: "cc-by-nc",
		resourceType: "secuencia-didactica",
		keywords: "storytelling,narrativa digital,creatividad,primaria,lengua",
		author: "Marta Segovia",
		publisher: null,
		createdBy: U.fran,
		editorialStatus: "published",
		subjects: ["lengua-castellana", "educacion-artistica"],
		levels: ["educacion-primaria"],
		featuredAt: null,
		createdAt: OLDER_4,
	},
	{
		id: "res-19",
		slug: "introduccion-programacion-scratch",
		title: "Introducción a la Programación con Scratch",
		description: "Actividad interactiva que introduce los conceptos básicos de programación con Scratch 3.0: secuencias, bucles, condicionales y variables para alumnado de primaria.",
		language: "es",
		license: "cc-by-sa",
		resourceType: "actividad-interactiva",
		keywords: "Scratch,programación,primaria,bloques,pensamiento computacional",
		author: "Carlos M. Ruiz",
		publisher: null,
		createdBy: U.carlos,
		editorialStatus: "published",
		subjects: ["informatica", "matematicas"],
		levels: ["educacion-primaria"],
		featuredAt: null,
		createdAt: OLDER_1,
	},
	{
		id: "res-20",
		slug: "diseno-web-responsive-principiantes",
		title: "Diseño Web Responsive para Principiantes",
		description: "Ejercicio práctico de formación profesional que enseña los fundamentos del diseño web responsive: HTML, CSS, media queries y buenas prácticas de accesibilidad.",
		language: "es",
		license: "cc-by",
		resourceType: "ejercicio",
		keywords: "diseño web,responsive,HTML,CSS,FP,accesibilidad",
		author: "Pedro Navarro",
		publisher: null,
		createdBy: U.humberto2,
		editorialStatus: "published",
		subjects: ["informatica"],
		levels: ["formacion-profesional"],
		featuredAt: null,
		createdAt: RECENT,
	},

	// ── Extras: borrador y en revisión ────────────────────────────────────
	{
		id: "res-21",
		slug: "machine-learning-profes-borrador",
		title: "Machine Learning para Profes (borrador)",
		description: "Material en desarrollo sobre conceptos de aprendizaje automático orientados a docentes sin formación técnica previa.",
		language: "es",
		license: "cc-by-nc-sa",
		resourceType: "guia-docente",
		keywords: "machine learning,docentes,IA,formación",
		author: "Cátedra Tecnología",
		publisher: null,
		createdBy: U.catedra,
		editorialStatus: "draft",
		subjects: ["informatica"],
		levels: ["universidad"],
		featuredAt: null,
		createdAt: NOW,
	},
	{
		id: "res-22",
		slug: "huerto-escolar-conectado",
		title: "Huerto Escolar Conectado (en revisión)",
		description: "Proyecto que combina ciencias naturales y tecnología: sensores IoT para monitorizar un huerto escolar, con actividades de recogida y análisis de datos.",
		language: "es",
		license: "cc-by-sa",
		resourceType: "proyecto",
		keywords: "huerto,IoT,sensores,ciencias,tecnología",
		author: "Lucía Vega",
		publisher: null,
		createdBy: U.carlos2,
		editorialStatus: "review",
		subjects: ["ciencias-naturales", "informatica"],
		levels: ["educacion-secundaria-obligatoria"],
		featuredAt: null,
		createdAt: NOW,
	},
];

// ---------------------------------------------------------------------------
// Colecciones (8)
// ---------------------------------------------------------------------------

export const DEMO_COLLECTIONS: SeedCollection[] = [
	{
		id: "col-01",
		slug: "inteligencia-artificial-educacion",
		title: "Inteligencia Artificial en Educación",
		description: "Selección de recursos para integrar la inteligencia artificial en la práctica docente, desde infantil hasta universidad.",
		curatorId: U.humberto,
		resourceIds: ["res-01", "res-02", "res-03", "res-04", "res-05"],
	},
	{
		id: "col-02",
		slug: "matematicas-creativas",
		title: "Matemáticas Creativas",
		description: "Recursos innovadores para enseñar matemáticas de forma visual, manipulativa y conectada con la vida real.",
		curatorId: U.fran,
		resourceIds: ["res-07", "res-08", "res-11", "res-12"],
	},
	{
		id: "col-03",
		slug: "competencia-digital-docente",
		title: "Competencia Digital Docente",
		description: "Colección de recursos para desarrollar la competencia digital del profesorado en seguridad, evaluación y metodologías activas.",
		curatorId: U.admin,
		resourceIds: ["res-13", "res-15", "res-16", "res-17"],
	},
	{
		id: "col-04",
		slug: "primeros-pasos-programacion",
		title: "Primeros Pasos en Programación",
		description: "Itinerario de recursos para iniciarse en el pensamiento computacional y la programación, desde infantil hasta FP.",
		curatorId: U.carlos,
		resourceIds: ["res-06", "res-14", "res-19", "res-20"],
	},
	{
		id: "col-05",
		slug: "steam-para-primaria",
		title: "STEAM para Primaria",
		description: "Propuestas interdisciplinares que integran ciencia, tecnología, ingeniería, arte y matemáticas para la etapa de primaria.",
		curatorId: U.yanira,
		resourceIds: ["res-06", "res-07", "res-08", "res-14"],
	},
	{
		id: "col-06",
		slug: "ciencias-medio-ambiente",
		title: "Ciencias y Medio Ambiente",
		description: "Recursos para enseñar ciencias naturales y conciencia medioambiental con datos reales y experimentos.",
		curatorId: U.carlos2,
		resourceIds: ["res-09", "res-10", "res-22"],
	},
	{
		id: "col-07",
		slug: "formacion-profesional-digital",
		title: "Formación Profesional Digital",
		description: "Materiales orientados a ciclos formativos de informática, comunicaciones y desarrollo de software.",
		curatorId: U.humberto2,
		resourceIds: ["res-05", "res-12", "res-15", "res-20"],
	},
	{
		id: "col-08",
		slug: "innovacion-metodologica",
		title: "Innovación Metodológica",
		description: "Guías y herramientas para implementar metodologías activas: ABP, rúbricas digitales y storytelling.",
		curatorId: U.humberto,
		resourceIds: ["res-16", "res-17", "res-18"],
	},
];

// ---------------------------------------------------------------------------
// Valoraciones (~35 ratings, 8+ recursos con 3+ ratings, medias 3.5-5)
// ---------------------------------------------------------------------------

export const DEMO_RATINGS: SeedRating[] = [
	// res-01: IA Ética (media ~4.7)
	{ resourceId: "res-01", userId: U.carlos, score: 5 },
	{ resourceId: "res-01", userId: U.fran, score: 5 },
	{ resourceId: "res-01", userId: U.humberto2, score: 4 },
	{ resourceId: "res-01", userId: U.reader, score: 5 },
	{ resourceId: "res-01", userId: U.curator, score: 4 },
	// res-03: Bot Robótica (media ~4.3)
	{ resourceId: "res-03", userId: U.humberto, score: 5 },
	{ resourceId: "res-03", userId: U.carlos, score: 4 },
	{ resourceId: "res-03", userId: U.yanira, score: 4 },
	{ resourceId: "res-03", userId: U.reader, score: 4 },
	// res-07: Matemáticas Algoritmos (media ~4.5)
	{ resourceId: "res-07", userId: U.humberto, score: 5 },
	{ resourceId: "res-07", userId: U.carlos, score: 4 },
	{ resourceId: "res-07", userId: U.carlos2, score: 5 },
	{ resourceId: "res-07", userId: U.reader, score: 4 },
	// res-08: Cocina Matemática (media ~4.0)
	{ resourceId: "res-08", userId: U.yanira, score: 4 },
	{ resourceId: "res-08", userId: U.carlos, score: 4 },
	{ resourceId: "res-08", userId: U.carlos2, score: 4 },
	// res-09: Cambio Climático (media ~4.3)
	{ resourceId: "res-09", userId: U.humberto, score: 5 },
	{ resourceId: "res-09", userId: U.fran, score: 4 },
	{ resourceId: "res-09", userId: U.humberto2, score: 4 },
	// res-13: Seguridad Internet (media ~4.0)
	{ resourceId: "res-13", userId: U.carlos, score: 4 },
	{ resourceId: "res-13", userId: U.fran, score: 4 },
	{ resourceId: "res-13", userId: U.yanira, score: 4 },
	// res-17: ABP Guía (media ~4.7)
	{ resourceId: "res-17", userId: U.humberto, score: 5 },
	{ resourceId: "res-17", userId: U.fran, score: 5 },
	{ resourceId: "res-17", userId: U.carlos, score: 4 },
	{ resourceId: "res-17", userId: U.carlos2, score: 5 },
	// res-19: Scratch (media ~4.3)
	{ resourceId: "res-19", userId: U.fran, score: 5 },
	{ resourceId: "res-19", userId: U.yanira, score: 4 },
	{ resourceId: "res-19", userId: U.reader, score: 4 },
	// res-02: IA Herramientas (media ~4.5)
	{ resourceId: "res-02", userId: U.humberto, score: 5 },
	{ resourceId: "res-02", userId: U.humberto2, score: 4 },
	{ resourceId: "res-02", userId: U.carlos2, score: 5 },
	// res-06: Robots Amigos (media ~5.0)
	{ resourceId: "res-06", userId: U.fran, score: 5 },
	{ resourceId: "res-06", userId: U.humberto, score: 5 },
	{ resourceId: "res-06", userId: U.reader, score: 5 },
	// res-15: Podcast (media ~4.0)
	{ resourceId: "res-15", userId: U.carlos, score: 4 },
	{ resourceId: "res-15", userId: U.catedra, score: 4 },
	{ resourceId: "res-15", userId: U.carlos2, score: 4 },
	// admin (INTEF) — valoraciones
	{ resourceId: "res-01", userId: U.admin, score: 5 },
	{ resourceId: "res-07", userId: U.admin, score: 4 },
	{ resourceId: "res-09", userId: U.admin, score: 5 },
	{ resourceId: "res-19", userId: U.admin, score: 4 },
	// curator (Ana Belén) — valoraciones
	{ resourceId: "res-06", userId: U.curator, score: 5 },
	{ resourceId: "res-09", userId: U.curator, score: 4 },
	{ resourceId: "res-19", userId: U.curator, score: 4 },
	// author (Javier) — valoraciones
	{ resourceId: "res-01", userId: U.author, score: 4 },
	{ resourceId: "res-07", userId: U.author, score: 5 },
	{ resourceId: "res-17", userId: U.author, score: 4 },
	// cátedra — valoraciones extra
	{ resourceId: "res-01", userId: U.catedra, score: 5 },
	{ resourceId: "res-07", userId: U.catedra, score: 4 },
];

// ---------------------------------------------------------------------------
// Favoritos (2-5 por usuario)
// ---------------------------------------------------------------------------

export const DEMO_FAVORITES: SeedFavorite[] = [
	// Elena (5)
	{ resourceId: "res-03", userId: U.humberto },
	{ resourceId: "res-07", userId: U.humberto },
	{ resourceId: "res-17", userId: U.humberto },
	{ resourceId: "res-19", userId: U.humberto },
	{ resourceId: "res-09", userId: U.humberto },
	// Carlos (4)
	{ resourceId: "res-01", userId: U.carlos },
	{ resourceId: "res-07", userId: U.carlos },
	{ resourceId: "res-17", userId: U.carlos },
	{ resourceId: "res-06", userId: U.carlos },
	// Marta (3)
	{ resourceId: "res-01", userId: U.fran },
	{ resourceId: "res-06", userId: U.fran },
	{ resourceId: "res-19", userId: U.fran },
	// Sofía (3)
	{ resourceId: "res-07", userId: U.yanira },
	{ resourceId: "res-14", userId: U.yanira },
	{ resourceId: "res-01", userId: U.yanira },
	// Pedro (2)
	{ resourceId: "res-05", userId: U.humberto2 },
	{ resourceId: "res-20", userId: U.humberto2 },
	// Lucía (3)
	{ resourceId: "res-01", userId: U.carlos2 },
	{ resourceId: "res-09", userId: U.carlos2 },
	{ resourceId: "res-17", userId: U.carlos2 },
	// Cátedra (2)
	{ resourceId: "res-01", userId: U.catedra },
	{ resourceId: "res-04", userId: U.catedra },
	// Admin / INTEF (3)
	{ resourceId: "res-01", userId: U.admin },
	{ resourceId: "res-07", userId: U.admin },
	{ resourceId: "res-19", userId: U.admin },
	// Curator / Ana Belén (3)
	{ resourceId: "res-01", userId: U.curator },
	{ resourceId: "res-03", userId: U.curator },
	{ resourceId: "res-17", userId: U.curator },
	// Author / Javier (3)
	{ resourceId: "res-03", userId: U.author },
	{ resourceId: "res-09", userId: U.author },
	{ resourceId: "res-15", userId: U.author },
	// Reader / María (3)
	{ resourceId: "res-07", userId: U.reader },
	{ resourceId: "res-01", userId: U.reader },
	{ resourceId: "res-19", userId: U.reader },
];

// ---------------------------------------------------------------------------
// Descargas simuladas (resource → count)
// ---------------------------------------------------------------------------

export const DEMO_DOWNLOAD_COUNTS: Record<string, number> = {
	"res-01": 487,
	"res-02": 132,
	"res-03": 356,
	"res-04": 89,
	"res-05": 67,
	"res-06": 214,
	"res-07": 423,
	"res-08": 178,
	"res-09": 291,
	"res-10": 156,
	"res-11": 98,
	"res-12": 74,
	"res-13": 312,
	"res-14": 187,
	"res-15": 145,
	"res-16": 63,
	"res-17": 398,
	"res-18": 112,
	"res-19": 267,
	"res-20": 54,
};

// Lista de todos los IDs de usuarios seed para limpieza idempotente
export const ALL_SEED_USER_IDS = DEMO_USERS.map((u) => u.id);
export const ALL_SEED_RESOURCE_IDS = DEMO_RESOURCES.map((r) => r.id);
export const ALL_SEED_COLLECTION_IDS = DEMO_COLLECTIONS.map((c) => c.id);
