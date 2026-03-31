import { buildCrudRoutes } from "../crud-builder.ts";
import { validateTaxonomy } from "@procomeka/db/validation";
import { logActivity } from "../../activity/log.ts";
import * as repo from "@procomeka/db/repository";

const taxonomyRoutes = buildCrudRoutes({
	baseRole: "curator",
	list: (db, opts) => repo.listTaxonomies(db, opts as Parameters<typeof repo.listTaxonomies>[1]),
	getById: repo.getTaxonomyById,
	create: (db, data) => repo.createTaxonomy(db, data as Parameters<typeof repo.createTaxonomy>[1]),
	update: (db, id, data) => repo.updateTaxonomy(db, id, data as Parameters<typeof repo.updateTaxonomy>[2]),
	remove: repo.deleteTaxonomy,
	validateCreate: validateTaxonomy,
	validateUpdate: validateTaxonomy,
	mergeOnUpdate: true,
	listFilters: (_user, params) => ({ type: params.type }),
	afterCreate: async (user, result, data) => {
		const t = result as { id: string; name: string };
		await logActivity({
			userId: user.id,
			type: "taxonomy_created",
			description: `Creaste la taxonomía «${data.name}»`,
			metadata: { taxonomyId: t.id },
		});
	},
	afterUpdate: async (user, id, entity, data) => {
		const t = entity as { name: string };
		await logActivity({
			userId: user.id,
			type: "taxonomy_updated",
			description: `Actualizaste la taxonomía «${t.name}»`,
			metadata: { taxonomyId: id, updates: data },
		});
	},
	afterDelete: async (user, id, entity) => {
		const t = entity as { name: string };
		await logActivity({
			userId: user.id,
			type: "taxonomy_deleted",
			description: `Eliminaste la taxonomía «${t.name}»`,
			metadata: { taxonomyId: id },
		});
	},
	roles: { create: "admin", update: "admin", remove: "admin" },
	notFoundMessage: "Categoría no encontrada",
});

export { taxonomyRoutes };
