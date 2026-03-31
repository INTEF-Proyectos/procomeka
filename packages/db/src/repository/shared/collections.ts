import { sql } from "drizzle-orm";
import { collectionResources, collections } from "../../schema/collections.ts";
import { resources } from "../../schema/resources.ts";

export function collectionResourceCountSql(resourceStatus?: string) {
	return sql<number>`(
		select count(*)
		from ${collectionResources}
		inner join ${resources}
			on ${collectionResources.resourceId} = ${resources.id}
		where ${collectionResources.collectionId} = ${collections.id}
			and ${resources.deletedAt} is null
			${resourceStatus ? sql`and ${resources.editorialStatus} = ${resourceStatus}` : sql``}
	)`;
}
