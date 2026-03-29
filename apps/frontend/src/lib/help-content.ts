export const HELP_PAGE_PATH = "ayuda";

export type HelpSectionId =
	| "primeros-pasos"
	| "explorar-recursos"
	| "publicar-recurso"
	| "colecciones"
	| "faq"
	| "roles-permisos"
	| "contacto"
	| "mapa-web";

export interface HelpSection {
	id: HelpSectionId;
	title: string;
	eyebrow: string;
	description: string;
	icon: string;
	items: string[];
}

export interface HelpFooterLink {
	label: string;
	sectionId: Extract<HelpSectionId, "contacto" | "mapa-web" | "faq">;
}

export const HELP_SECTIONS: HelpSection[] = [
	{
		id: "primeros-pasos",
		eyebrow: "Empezar",
		title: "Primeros pasos",
		description:
			"Procomún reúne recursos educativos abiertos para localizarlos, reutilizarlos y publicarlos con contexto pedagógico.",
		icon: "rocket_launch",
		items: [
			"Accede sin registro para explorar el catálogo y entrar en las fichas públicas de los recursos.",
			"Regístrate o inicia sesión si necesitas publicar, guardar favoritos o gestionar colecciones.",
			"Usa la navegación superior para volver al inicio, explorar el catálogo y acceder a esta ayuda desde cualquier pantalla.",
		],
	},
	{
		id: "explorar-recursos",
		eyebrow: "Descubrir",
		title: "Explorar recursos",
		description:
			"El catálogo está pensado para que el profesorado encuentre materiales útiles por temática, nivel y formato.",
		icon: "travel_explore",
		items: [
			"Escribe palabras clave en el buscador para combinar búsqueda libre con filtros facetados.",
			"Refina los resultados por tipo de recurso, idioma, licencia y otras taxonomías editoriales visibles en el lateral.",
			"Abre la ficha pública para revisar descripción, metadatos, archivos asociados y opciones de reutilización.",
		],
	},
	{
		id: "publicar-recurso",
		eyebrow: "Crear",
		title: "Publicar un recurso",
		description:
			"Las personas con rol autor o superior pueden crear borradores, completarlos y enviarlos a revisión editorial.",
		icon: "upload_file",
		items: [
			"Entra en \"Publicar\" para abrir el formulario de alta y completa al menos título, descripción, tipo, licencia e idioma.",
			"Añade ficheros o enlaces y revisa la calidad de los metadatos para facilitar el descubrimiento posterior.",
			"Cuando el borrador esté listo, envíalo a revisión para que curación o administración lo validen antes de publicarlo.",
		],
	},
	{
		id: "colecciones",
		eyebrow: "Organizar",
		title: "Colecciones",
		description:
			"Las colecciones permiten agrupar recursos relacionados para compartir secuencias, itinerarios o repositorios temáticos.",
		icon: "collections_bookmark",
		items: [
			"Crea colecciones desde el backoffice para reunir materiales que responden a una misma propuesta didáctica.",
			"Usa títulos y descripciones claras para que otras personas comprendan el propósito de la colección antes de abrirla.",
			"Revisa periódicamente los recursos incluidos para evitar enlaces rotos o materiales fuera de contexto.",
		],
	},
	{
		id: "faq",
		eyebrow: "Resolver dudas",
		title: "Preguntas frecuentes",
		description:
			"Estas respuestas cubren los bloqueos más habituales durante la exploración y la publicación.",
		icon: "quiz",
		items: [
			"¿Necesito cuenta para descargar materiales? No. La consulta pública del catálogo está abierta; la cuenta se pide para publicar y gestionar espacios personales.",
			"¿Qué hago si no encuentro resultados? Prueba con menos filtros, términos más generales o cambia la licencia y el idioma para ampliar el rango.",
			"¿Quién publica definitivamente un recurso? Un perfil curador o administrador debe validarlo cuando sale de revisión.",
		],
	},
	{
		id: "roles-permisos",
		eyebrow: "Gobierno editorial",
		title: "Roles y permisos",
		description:
			"Los permisos se organizan para separar lectura pública, autoría, curación y administración.",
		icon: "admin_panel_settings",
		items: [
			"Lector: navega por el catálogo y consulta recursos publicados.",
			"Autor: crea borradores, edita sus recursos y accede al flujo de publicación.",
			"Curador: revisa, devuelve o publica recursos y gestiona taxonomías editoriales.",
			"Administrador: mantiene usuarios y supervisa toda la operación del backoffice.",
		],
	},
	{
		id: "contacto",
		eyebrow: "Soporte",
		title: "Contacto y soporte",
		description:
			"El canal de ayuda debe servir tanto para incidencias técnicas como para dudas de uso editorial.",
		icon: "support_agent",
		items: [
			"Si una acción falla, recopila la pantalla, la URL y el momento del error antes de reportarlo.",
			"Dirige la incidencia al canal institucional o al equipo responsable del despliegue de Procomún en tu entorno.",
			"Cuando el problema afecte a un recurso concreto, incluye su título o identificador para acelerar la revisión.",
		],
	},
	{
		id: "mapa-web",
		eyebrow: "Orientación",
		title: "Mapa web",
		description:
			"Esta vista rápida ayuda a identificar dónde vive cada flujo principal dentro de la plataforma.",
		icon: "map",
		items: [
			"Inicio: acceso a destacados, colecciones temáticas y búsquedas rápidas.",
			"Explorar: catálogo público con filtros, ordenación y navegación por resultados.",
			"Perfil: espacio personal para favoritos y recursos propios cuando existe sesión iniciada.",
			"Administración: backoffice editorial con recursos, colecciones, categorías, usuarios y esta ayuda contextual.",
		],
	},
];

export const HELP_FOOTER_LINKS: HelpFooterLink[] = [
	{ label: "Contacto", sectionId: "contacto" },
	{ label: "Mapa Web", sectionId: "mapa-web" },
	{ label: "Preguntas Frecuentes", sectionId: "faq" },
];

export function buildHelpHref(sectionId?: HelpSectionId): string {
	return sectionId ? `${HELP_PAGE_PATH}#${sectionId}` : HELP_PAGE_PATH;
}
