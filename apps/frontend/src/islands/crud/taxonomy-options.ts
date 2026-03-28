export const TAXONOMY_TYPE_OPTIONS = [
	{ value: "category", label: "Categoria" },
	{ value: "tag", label: "Etiqueta" },
	{ value: "subject", label: "Materia" },
	{ value: "level", label: "Nivel educativo" },
	{ value: "resource-type", label: "Tipo de recurso" },
	{ value: "language", label: "Idioma" },
	{ value: "license", label: "Licencia" },
] as const;

export type TaxonomyType = (typeof TAXONOMY_TYPE_OPTIONS)[number]["value"];
